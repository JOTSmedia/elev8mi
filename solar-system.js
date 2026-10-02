(() => {
  'use strict';
  const root = document.getElementById('solarSystem');
  const host = document.getElementById('solarBodies');
  const canvas = document.getElementById('orbitPaths');
  const detail = document.getElementById('planetDetail');
  if (!root || !host || !canvas || !window.Elev8Motion) return;
  const ctx = canvas.getContext('2d');
  // NASA/NSSDCA Planetary Fact Sheet: km, days, eccentricity, inclination.
  // All planet body diameters use ONE linear scale. Orbital distances are
  // deliberately compressed; initial phases are composed, not an ephemeris.
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
  const earthYearSeconds = 24;
  let width = 0, height = 0, radius = 0, diameterScale = 0;
  let visible = true, inspecting = false, localTime = 0;
  let earthPoint = {x:0,y:0,depth:0};
  const bodies = planets.map((planet, i) => {
    const [name,diameter,period] = planet;
    const button = document.createElement('button');
    button.className = 'solar-body'; button.type = 'button';
    button.setAttribute('aria-label', `${name}: diameter ${diameter.toLocaleString()} kilometers, orbital period ${period.toLocaleString()} days`);
    const img = new Image(); img.src = `assets/${name.toLowerCase()}.webp`;
    img.className = name === 'Saturn' ? 'planet-ringed' : 'planet-disc';
    img.alt = ''; img.draggable = false; img.decoding = 'async';
    button.append(img); host.append(button);
    const show = () => {
      inspecting = true;
      detail.replaceChildren();
      const portrait = img.cloneNode(); portrait.className += ' planet-portrait'; portrait.style.width='54px';
      const copy = document.createElement('span');
      copy.textContent = `${name} · ${diameter.toLocaleString()} km · ${period.toLocaleString()} days${name === 'Earth' ? ' · Moon in orbit' : ''}`;
      detail.append(portrait, copy); detail.classList.add('is-visible');
    };
    const hide = () => { inspecting = false; detail.classList.remove('is-visible'); };
    button.addEventListener('pointerenter', show);
    button.addEventListener('pointerleave', () => { if(document.activeElement !== button) hide(); });
    button.addEventListener('focus', show); button.addEventListener('blur', hide);
    button.addEventListener('click', show);
    return {planet, button, img, perihelion:i*.39};
  });
  const moon = document.createElement('button'); moon.type = 'button'; moon.className = 'solar-body solar-moon';
  moon.setAttribute('aria-label','Moon: diameter 3,475 kilometers; orbits Earth every 27.3 days');
  const moonImage = new Image(); moonImage.src='assets/moon.webp'; moonImage.alt=''; moon.append(moonImage);host.append(moon);
  function showMoon() {
    inspecting=true;detail.replaceChildren();
    const portrait=moonImage.cloneNode();portrait.className='planet-disc planet-portrait';portrait.style.width='54px';
    const text=document.createElement('span');text.textContent='Moon · 3,475 km · 27.3 days around Earth';
    detail.append(portrait,text);detail.classList.add('is-visible');
  }
  moon.addEventListener('focus',showMoon);moon.addEventListener('click',showMoon);
  moon.addEventListener('blur',()=>{inspecting=false;detail.classList.remove('is-visible');});

  function position(body, eccentricAnomaly) {
    const p=body.planet, a=radius*p[5], e=p[3], angle=body.perihelion;
    const x=a*(Math.cos(eccentricAnomaly)-e);
    const z=a*Math.sqrt(1-e*e)*Math.sin(eccentricAnomaly);
    const rx=x*Math.cos(angle)-z*Math.sin(angle);
    const rz=x*Math.sin(angle)+z*Math.cos(angle);
    return {x:width/2+rx, y:height/2+rz*.48+rx*Math.sin(p[4]*Math.PI/180)*.35, depth:rz};
  }
  function anomaly(mean,e) {
    let value=mean;
    for(let i=0;i<6;i++) value-=(value-e*Math.sin(value)-mean)/(1-e*Math.cos(value));
    return value;
  }
  function draw() {
    bodies.forEach(body=>{
      const p=body.planet;
      const mean=(p[6]+localTime*TAU/(earthYearSeconds*p[2]/365.2))%TAU;
      const point=position(body,anomaly(mean,p[3]));
      body.button.style.transform=`translate3d(${point.x-22}px,${point.y-22}px,0)`;
      body.button.style.zIndex=point.depth>0 ? '10' : '2';
      if(p[0]==='Earth') earthPoint=point;
    });
    const angle=localTime*TAU/(earthYearSeconds*27.3/365.2);
    const distance=Math.max(11,12756*diameterScale*1.4);
    moon.style.transform=`translate3d(${earthPoint.x+Math.cos(angle)*distance-7}px,${earthPoint.y+Math.sin(angle)*distance*.65-7}px,0)`;
    moon.style.zIndex=earthPoint.depth>0?'11':'3';
  }
  function resize() {
    width=root.clientWidth;height=root.clientHeight;radius=width*(width<600?.40:.435);
    diameterScale=(width<600?48:84)/142984;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    if(ctx){
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      bodies.forEach(body=>{
        ctx.beginPath();
        for(let i=0;i<=180;i++) {const point=position(body,TAU*i/180);if(i)ctx.lineTo(point.x,point.y);else ctx.moveTo(point.x,point.y);}
        ctx.strokeStyle='rgba(188,175,234,.21)';ctx.lineWidth=.65;ctx.stroke();
      });
    }
    bodies.forEach(body=>{
      const size=body.planet[1]*diameterScale;
      // Saturn's full sprite includes rings; its globe is 42% of sprite width.
      body.img.style.width=`${size*(body.planet[0]==='Saturn'?2.38:1)}px`;
    });
    moonImage.style.width=`${3475*diameterScale}px`;draw();
  }
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(root);else window.addEventListener('resize',resize);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(root);
  window.Elev8Motion.add((time,dt)=>{if(!visible)return;if(!inspecting)localTime+=dt;draw();});
  resize();
})();
