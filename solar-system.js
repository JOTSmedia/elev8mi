(() => {
  'use strict';
  const root = document.getElementById('solarSystem');
  const host = document.getElementById('solarBodies');
  const canvas = document.getElementById('orbitPaths');
  const detail = document.getElementById('planetDetail');
  if (!root || !host || !canvas || !window.Elev8Motion) return;
  const ctx = canvas.getContext('2d');
  // NASA/NSSDCA Planetary Fact Sheet: km, days, eccentricity, inclination.
  // Initial orbital phases come from Astronomy Engine. Distances and time
  // are compressed for display; this is an illustrative solar-system view.
  const planets = [
    ['Mercury',4879,88,.206,7,.30, .3],
    ['Venus',12104,224.7,.007,3.4,.37, 2.2],
    ['Earth',12756,365.2,.017,0,.44, 4.8],
    ['Mars',6792,687,.094,1.8,.52, 3.4],
    ['Jupiter',142984,4331,.049,1.3,.65, .8],
    ['Saturn',120536,10747,.052,2.5,.77, 3.8],
    ['Uranus',51118,30589,.047,.8,.89, 5.7],
    ['Neptune',49528,59800,.010,1.8,1, 2.5]
  ];
  const TAU = Math.PI * 2;
  const earthYearSeconds = 7;
  const moonOrbitSeconds = 24; // Gentle display orbit, independent of planet acceleration.
  let width = 0, height = 0, radius = 0, diameterScale = 0;
  let visible = true, inspecting = false, localTime = 0;
  let earthPoint = {x:0,y:0,depth:0};
  let viewRotation=0,projection=.48,sunY=0,rootDocumentTop=0,lastTracks=-1,tracksDirty=true,lastMoonVisibility=null;
  const photo=document.querySelector(".journey-plate img");
  const apsides=[77.46,131.60,102.94,336.06,14.75,92.43,170.96,44.97];
  const distances=[.387,.723,1,1.524,5.203,9.537,19.191,30.069];
  planets.forEach((p,i)=>{
    p[5]=.48+.52*Math.log(1+distances[i])/Math.log(1+30.069);
    if(window.Astronomy){
      const longitude=window.Astronomy.Ecliptic(window.Astronomy.HelioVector(p[0],new Date())).elon*Math.PI/180;
      const trueAnomaly=longitude-apsides[i]*Math.PI/180;
      const E=2*Math.atan2(Math.sqrt(1-p[3])*Math.sin(trueAnomaly/2),Math.sqrt(1+p[3])*Math.cos(trueAnomaly/2));
      p[6]=E-p[3]*Math.sin(E);
    }
  });
  const bodies = planets.map((planet, i) => {
    const [name,diameter,period] = planet;
    const button = document.createElement('button');
    button.dataset.planet=name;button.className = 'solar-body'; button.type = 'button';
    button.setAttribute('aria-label', `${name}: diameter ${diameter.toLocaleString()} kilometers, orbital period ${period.toLocaleString()} days`);
    const img = new Image(); img.src = `assets/${name.toLowerCase()}.webp`;
    img.className = name === 'Saturn' ? 'planet-ringed' : 'planet-disc';
    img.alt = ''; img.draggable = false; img.decoding = 'async';
    button.append(img); host.append(button);
    if(name === "Earth"){img.hidden=true;button.classList.add("earth-location");button.textContent="Earth · you are here";}
    const show = () => {
      inspecting = true;
      detail.replaceChildren();
      const portrait = img.cloneNode(); portrait.className += ' planet-portrait'; portrait.hidden=false; portrait.style.width='54px';
      const copy = document.createElement('span');
      copy.textContent = `${name} · ${diameter.toLocaleString()} km · ${period.toLocaleString()} days${name === 'Earth' ? ' · Moon in orbit' : ''}`;
      detail.append(portrait, copy); detail.classList.add('is-visible');
    };
    const hide = () => { inspecting = false; detail.classList.remove('is-visible'); };
    button.addEventListener('pointerenter', show);
    button.addEventListener('pointerleave', () => { if(document.activeElement !== button) hide(); });
    button.addEventListener('focus', show); button.addEventListener('blur', hide);
    button.addEventListener('click', show);
    return {planet, button, img, perihelion:apsides[i]*Math.PI/180};
  });
  const moon = document.createElement('button'); moon.type = 'button'; moon.className = 'solar-body solar-moon';
  moon.setAttribute('aria-label','Moon: diameter 3,475 kilometers; orbits Earth every 27.3 days');
  const moonImage=document.createElement('canvas');moonImage.className='orbit-moon-disc';moon.append(moonImage);host.append(moon);
  const paintMoon=()=>window.Elev8Moon?.render(moonImage,42);
  window.addEventListener('elev8mi:moon',paintMoon);paintMoon();
  function showMoon() {
    inspecting=true;detail.replaceChildren();
    const portrait=document.createElement('canvas');portrait.className='planet-portrait';window.Elev8Moon?.render(portrait,54);
    const text=document.createElement('span');text.textContent=`Moon · ${window.Elev8Moon?.state?.name || 'Live lunar phase'} · ${Math.round((window.Elev8Moon?.state?.illuminated || 0)*100)}% illuminated`;
    detail.append(portrait,text);detail.classList.add('is-visible');
  }
  moon.addEventListener('pointerenter',showMoon);moon.addEventListener('pointerleave',()=>{if(document.activeElement!==moon){inspecting=false;detail.classList.remove('is-visible');}});moon.addEventListener('focus',showMoon);moon.addEventListener('click',showMoon);
  moon.addEventListener('blur',()=>{inspecting=false;detail.classList.remove('is-visible');});

  function position(body, eccentricAnomaly) {
    const p=body.planet, a=radius*p[5], e=p[3], angle=body.perihelion+viewRotation;
    const x=a*(Math.cos(eccentricAnomaly)-e);
    const z=a*Math.sqrt(1-e*e)*Math.sin(eccentricAnomaly);
    const rx=x*Math.cos(angle)-z*Math.sin(angle);
    const rz=x*Math.sin(angle)+z*Math.cos(angle);
    return {x:width/2+rx, y:sunY+rz*projection+rx*Math.sin(p[4]*Math.PI/180)*.12, depth:rz};
  }
  function anomaly(mean,e) {
    let value=mean;
    for(let i=0;i<6;i++) value-=(value-e*Math.sin(value)-mean)/(1-e*Math.cos(value));
    return value;
  }
  function drawTracks(){
    if(!ctx)return;
    ctx.clearRect(0,0,width,height);
    bodies.forEach(body=>{
      const p=body.planet,a=radius*p[5],angle=body.perihelion+viewRotation;
      const c=Math.cos(angle),sn=Math.sin(angle),inclination=Math.sin(p[4]*Math.PI/180)*.12;
      ctx.save();ctx.translate(width/2,sunY);
      ctx.transform(c,sn*projection+c*inclination,-sn,c*projection-sn*inclination,0,0);
      ctx.beginPath();ctx.ellipse(-a*p[3],0,a,a*Math.sqrt(1-p[3]**2),0,0,TAU);ctx.restore();
      ctx.strokeStyle=p[0]==='Earth'?'rgba(151,214,255,.55)':'rgba(188,175,234,.20)';ctx.lineWidth=p[0]==='Earth'?1:.6;ctx.stroke();
    });
    tracksDirty=false;lastTracks=localTime;
  }
  function draw() {
    if(!width||!height)return;
    // Rotate the viewing frame with Earth, keeping the photographed foreground
    // Earth anchored. Other planets move relative to Earth in this view.
    const earth=bodies[2],pEarth=earth.planet;
    const earthMean=pEarth[6]+localTime*TAU/earthYearSeconds;
    const E=anomaly(earthMean,pEarth[3]);
    const trueAngle=Math.atan2(Math.sqrt(1-pEarth[3]**2)*Math.sin(E),Math.cos(E)-pEarth[3]);
    viewRotation=Math.PI/2-earth.perihelion-trueAngle;
    const rootTop=rootDocumentTop-window.scrollY;
    const state=window.elev8miJourney;
    let horizon=innerHeight*.56;
    if(state&&photo?.naturalWidth){
      const scale=Math.max(innerWidth/photo.naturalWidth,state.plateHeight/photo.naturalHeight);
      const dh=photo.naturalHeight*scale;
      horizon=(state.plateHeight-dh)/2+dh*.52-state.camera;
    }
    earthPoint={x:width/2,y:horizon-rootTop,depth:1};
    sunY=height*.27;
    const earthRadius=radius*pEarth[5]*(1-pEarth[3]*Math.cos(E));
    projection=Math.max(.35,(earthPoint.y-sunY)/Math.max(1,earthRadius));
    if(tracksDirty||localTime-lastTracks>=1/15)drawTracks();
    bodies.forEach(body=>{
      const p=body.planet;
      const mean=p[6]+localTime*TAU/(earthYearSeconds*(p[2]/365.2));
      const point=p[0]==='Earth'?earthPoint:position(body,anomaly(mean,p[3]));
      body.button.style.transform=`translate3d(${point.x-22}px,${point.y-22}px,0)`;
      body.button.style.zIndex=point.depth>0?'10':'2';
    });
    // The large Earth is a foreground enlargement. The visible Moon passes
    // across an ellipse centered below its horizon, rather than a tiny replica.
    const phaseAngle=(window.Elev8Moon?.state?.angle || 0)*Math.PI/180;
    const angle=phaseAngle-Math.PI/2+localTime*TAU/moonOrbitSeconds;
    const rx=width*.36,ry=Math.min(90,height*.16),cy=earthPoint.y-26;
    const mx=earthPoint.x+Math.cos(angle)*rx,my=cy+Math.sin(angle)*ry;
    moon.style.transform=`translate3d(${mx-22}px,${my-22}px,0)`;
    // On the far half of the orbit, Earth's photographed limb clips the Moon.
    // The curved limb rises at the center and falls toward the photograph edges.
    const limb=earthPoint.y+height*.055*((mx-width/2)/(width/2))**2;
    const rear=Math.sin(angle)>0;
    const visibleHeight=rear?Math.max(0,Math.min(44,limb-(my-22))):44;
    moon.style.clipPath=visibleHeight<44?`inset(0 0 ${44-visibleHeight}px 0)`:'none';
    const moonVisible=visibleHeight>0;
    if(moonVisible!==lastMoonVisibility){moon.style.opacity=moonVisible?'1':'0';moon.style.pointerEvents=moonVisible?'auto':'none';moon.tabIndex=moonVisible?0:-1;moon.setAttribute('aria-hidden',moonVisible?'false':'true');lastMoonVisibility=moonVisible;}
    moon.style.zIndex='11';
    window.elev8miCelestial={moonBehindEarth:rear,moonVisible:visibleHeight>0,time:localTime};
  }
  function resize() {
    rootDocumentTop=root.getBoundingClientRect().top+window.scrollY;tracksDirty=true;
    width=root.clientWidth;height=root.clientHeight;radius=width*(width<600?.40:.435);
    diameterScale=(width<600?36:60)/142984;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    if(ctx){
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    }
    bodies.forEach(body=>{
      const distanceScale=1/(1+.42*Math.log1p(distances[bodies.indexOf(body)]));
      const size=body.planet[1]*diameterScale*distanceScale;
      // Saturn's full sprite includes rings; its globe is 42% of sprite width.
      body.img.style.width=`${size*(body.planet[0]==='Saturn'?2.38:1)}px`;
    });
    paintMoon();draw();
  }
  window.addEventListener('scroll',()=>{tracksDirty=true;},{passive:true});
  document.fonts?.ready.then(resize);
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(root);else window.addEventListener('resize',resize);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(root);
  window.Elev8Motion.add((time,dt)=>{if(!visible)return;if(!inspecting)localTime+=dt;draw();});
  resize();
})();
