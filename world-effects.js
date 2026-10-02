(() => {
  'use strict';
  const canvas=document.getElementById('worldEffects');
  const world=document.getElementById('journeyWorld');
  const journey=document.getElementById('journey');
  if(!canvas||!world||!journey||!window.Elev8Motion)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const plates=[...world.querySelectorAll('.journey-plate')];
  const cave=plates[2]?.querySelector('img');
  const surface=plates[1]?.querySelector('img');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
  let w=0,h=0,lastFog=-1,lastDay=-1,lastMist=-1,lastRays=-1;
  const stars=Array.from({length:50},(_,i)=>({x:((i*73.37)%100)/100,y:((i*31.71)%100)/100,r:.35+(i%4)*.18,phase:i*1.7}));
  const dust=Array.from({length:27},(_,i)=>({x:((i*61.13)%100)/100,y:((i*43.79)%100)/100,s:.3+(i%6)*.15}));
  function resize(){
    w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  // Cache photographic cloud detail once per source, only when a GPU is not
  // available. Terrain is excluded from these layers: moving a whole picture
  // of Earth also moves its coastlines and makes the planet look rubbery.
  const cloudLayers=plates.slice(0,2).map((plate,index)=>({image:plate.querySelector('img'),index,source:'',tones:[]}));
  const cloudTones=[[131,151,186],[235,246,255],[255,183,126],[240,142,117]];
  function prepareClouds(layer){
    const image=layer.image,source=image?.currentSrc||image?.src;
    if(!image?.naturalWidth||source===layer.source)return;
    layer.source=source;layer.tones=[];
    try{
      const sample=document.createElement('canvas');sample.width=innerWidth<720?384:512;sample.height=Math.round(sample.width*image.naturalHeight/image.naturalWidth);
      const c=sample.getContext('2d',{willReadFrequently:true});if(!c)return;
      c.drawImage(image,0,0,sample.width,sample.height);
      const original=c.getImageData(0,0,sample.width,sample.height);
      cloudTones.forEach(tone=>{
        const result=document.createElement('canvas');result.width=sample.width;result.height=sample.height;
        const painter=result.getContext('2d');if(!painter)return;
        const pixels=painter.createImageData(sample.width,sample.height);
        for(let y=0;y<sample.height;y++)for(let x=0;x<sample.width;x++){
          const k=(y*sample.width+x)*4,v=y/sample.height;
          const brightness=Math.min(original.data[k],original.data[k+1],original.data[k+2])/255;
          const saturation=(Math.max(original.data[k],original.data[k+1],original.data[k+2])/255-brightness);
          const region=layer.index===0?smooth(.545,.59,v):1-smooth(.23,.285,v);
          const mask=smooth(.30,.74,brightness)*(1-smooth(.18,.52,saturation))*region;
          const detail=.40+.60*brightness;
          pixels.data[k]=tone[0]*detail;pixels.data[k+1]=tone[1]*detail;pixels.data[k+2]=tone[2]*detail;pixels.data[k+3]=Math.round(mask*158);
        }
        painter.putImageData(pixels,0,0);layer.tones.push(result);
      });
    }catch(_){layer.tones=[];}
  }
  const mixColor=(a,b,t)=>a.map((channel,i)=>Math.round(channel+(b[i]-channel)*t));
  const rgba=(color,alpha)=>`rgba(${color.join(',')},${clamp(alpha)})`;
  function atmosphere(time,state,clock,depth){
    const day=clamp(clock?.daylight||0),twilight=clamp(clock?.twilight||0),rising=clock?.sunRising!==false;
    const warm=rising?[255,163,96]:[239,105,82];
    const duskTop=rising?[73,63,123]:[54,35,95];
    cloudLayers.forEach(layer=>{
      const g=photoGeometry(layer.image,layer.index,state);if(!g||g.dy>h||g.dy+g.dh<0)return;
      const orbital=layer.index===0;
      // A local surface exposure grade leaves the roots and cave unchanged.
      if(!orbital&&day<.995){
        const top=reducedMotion.matches?0:state.plateHeight-state.seam-state.camera;
        const bottom=reducedMotion.matches?h:top+state.plateHeight;
        const exposure=ctx.createLinearGradient(0,top,0,bottom);
        exposure.addColorStop(0,rgba([7,17,37],0));
        exposure.addColorStop(reducedMotion.matches?0:Math.min(.2,state.seam/state.plateHeight),rgba([7,17,37],(1-day)*.62));
        exposure.addColorStop(.86,rgba([7,17,37],(1-day)*.62));exposure.addColorStop(1,rgba([7,17,37],0));
        ctx.fillStyle=exposure;ctx.fillRect(0,Math.max(0,top),w,Math.min(h,bottom)-Math.max(0,top));
      }
      const skyEnd=orbital?.535:.285,skyBottom=g.dy+g.dh*skyEnd;
      const immersion=orbital?smooth(.32,.78,depth):1;
      const upper=mixColor(mixColor([7,15,38],[27,99,179],day),duskTop,twilight*.86);
      const horizon=mixColor(mixColor([28,49,84],[170,216,245],day),warm,twilight*.94);
      const sky=ctx.createLinearGradient(0,g.dy,0,skyBottom);
      const strength=orbital?(.18+.60*immersion):.62;
      sky.addColorStop(0,rgba(upper,strength*(orbital?immersion:.7)));
      sky.addColorStop(.66,rgba(upper,strength*.82));
      sky.addColorStop(.94,rgba(horizon,strength));sky.addColorStop(1,rgba(horizon,0));
      ctx.fillStyle=sky;ctx.fillRect(0,Math.max(0,g.dy),w,Math.min(h,skyBottom)-Math.max(0,g.dy));
      if(twilight>.01&&skyBottom>0&&g.dy<h){
        const x=w*(clock?.sunAzimuth??.33),y=skyBottom-g.dh*.014;
        const glow=ctx.createRadialGradient(x,y,0,x,y,Math.max(w*.38,g.dh*.08));
        glow.addColorStop(0,rgba(warm,twilight*.13));glow.addColorStop(1,rgba(warm,0));
        ctx.save();ctx.beginPath();ctx.rect(0,Math.max(0,g.dy),w,Math.min(h,skyBottom)-Math.max(0,g.dy));ctx.clip();
        ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);ctx.restore();
      }
      prepareClouds(layer);if(layer.tones.length!==4)return;
      const twilightWeight=twilight*.78;
      const weights=[(1-day)*(1-twilightWeight),day*(1-twilightWeight),rising?twilightWeight:0,rising?0:twilightWeight];
      const drift=Math.sin(time*.072+layer.index*1.6)*g.dw*(orbital?.026:.033);
      const lift=Math.sin(time*.033+layer.index)*g.dh*.0015;
      ctx.save();
      // The slower high cloud layer and the lower drifting cloud detail use
      // the existing image, not synthetic particles or procedural storms.
      weights.forEach((weight,i)=>{if(weight<.015)return;
        ctx.globalAlpha=weight*.35;ctx.drawImage(layer.tones[i],g.dx+drift*.42,g.dy-lift,g.dw,g.dh);
        ctx.globalAlpha=weight*.82;ctx.drawImage(layer.tones[i],g.dx+drift,g.dy+lift,g.dw,g.dh);
      });ctx.restore();
    });
  }
  function water(time,state){
    if(!cave?.complete||!cave.naturalWidth)return;
    const scale=Math.max(w/cave.naturalWidth,state.plateHeight/cave.naturalHeight);
    const dw=cave.naturalWidth*scale,dh=cave.naturalHeight*scale;
    const dx=(w-dw)/2,dy=2*(state.plateHeight-state.seam)-state.camera+(state.plateHeight-dh)/2;
    const top=dy+dh*.813,bottom=dy+dh*.945;
    if(bottom<0||top>h)return;
    const polygon=[[.35,.813],[.77,.813],[.90,.85],[.96,.893],[.80,.945],[.27,.928],[.13,.889],[.28,.851]];
    ctx.save();ctx.beginPath();polygon.forEach(([x,y],i)=>i?ctx.lineTo(dx+x*dw,dy+y*dh):ctx.moveTo(dx+x*dw,dy+y*dh));ctx.closePath();ctx.clip();
    // Refract only the pool, leaving cave walls perfectly still.
    for(let y=Math.max(0,top);y<Math.min(h,bottom);y+=3){
      const sy=(y-dy)/scale;
      const edge=Math.sin(clamp((y-top)/(bottom-top))*Math.PI);
      const offset=(Math.sin(y*.063-time*1.7)+Math.sin(y*.027+time*.9))*4.5*edge;
      ctx.drawImage(cave,0,sy,cave.naturalWidth,4/scale,dx+offset,y,dw,4);
    }
    for(let i=0;i<3;i++){
      const phase=(time*.3+i*.34)%1;
      ctx.beginPath();ctx.ellipse(dx+dw*(.40+i*.105),top+(bottom-top)*(.36+i*.12),7+phase*43,1+phase*7,0,0,Math.PI*2);
      ctx.strokeStyle=`rgba(169,219,239,${(1-phase)*.22})`;ctx.lineWidth=.6;ctx.stroke();
    }
    ctx.restore();
  }
  function photoGeometry(image,index,state) {
    if(!image?.complete||!image.naturalWidth)return null;
    if(reducedMotion.matches){
      if(!plates[index]?.classList.contains('is-active')&&!(index===0&&!plates.some(plate=>plate.classList.contains('is-active'))))return null;
      const scale=Math.max(w/image.naturalWidth,h/image.naturalHeight),dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;
      return {scale,dw,dh,dx:(w-dw)/2,dy:(h-dh)/2};
    }
    const scale=Math.max(w/image.naturalWidth,state.plateHeight/image.naturalHeight);
    const dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;
    return {scale,dw,dh,dx:(w-dw)/2,dy:index*(state.plateHeight-state.seam)-state.camera+(state.plateHeight-dh)/2};
  }
  function clipPhoto(points,g) {
    ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(g.dx+x*g.dw,g.dy+y*g.dh):ctx.moveTo(g.dx+x*g.dw,g.dy+y*g.dh));ctx.closePath();ctx.clip();
  }
  function landscape(time,state) {
    const g=photoGeometry(surface,1,state);if(!g||g.dy>h||g.dy+g.dh<0)return;
    // Trace the existing river rather than moving its banks or the mountains.
    const river=[[.59,.397],[.57,.412],[.54,.421],[.57,.429],[.62,.435],[.65,.445],[.65,.46],[.71,.468],[.75,.478],[.70,.494],[.66,.506],[.65,.522],[.58,.535],[.58,.55],[.70,.568],[.73,.563],[.62,.55],[.63,.54],[.70,.526],[.71,.51],[.77,.496],[.79,.48],[.76,.466],[.69,.455],[.70,.445],[.67,.435],[.61,.427],[.58,.421],[.61,.414],[.62,.403]];
    ctx.save();clipPhoto(river,g);
    const riverTop=g.dy+g.dh*.397,riverBottom=g.dy+g.dh*.57;
    for(let y=Math.max(0,riverTop);y<Math.min(h,riverBottom);y+=3){
      const sy=(y-g.dy)/g.scale;
      const shift=(Math.sin(y*.065-time*3.7)+Math.sin(y*.03+time*1.3)) * 2.2;
      ctx.drawImage(surface,0,sy,surface.naturalWidth,4/g.scale,g.dx+shift,y,g.dw,4);
    }
    // Small moving highlights follow the downstream channel.
    const centers=[[.59,.409],[.60,.428],[.675,.45],[.76,.48],[.69,.51],[.61,.54],[.71,.564]];
    for(let i=0;i<11;i++){
      const travel=(time*.065+i/11)%1,part=travel*(centers.length-1),j=Math.floor(part),t=part-j;
      const a=centers[j],b=centers[Math.min(j+1,centers.length-1)];
      const x=g.dx+(a[0]+(b[0]-a[0])*t)*g.dw,y=g.dy+(a[1]+(b[1]-a[1])*t)*g.dh;
      ctx.strokeStyle=`rgba(218,237,251,${Math.sin(travel*Math.PI)*.38})`;ctx.lineWidth=.7;
      ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+9,y+.6);ctx.stroke();
    }
    ctx.restore();
    // Sway only photographed tree silhouettes. Each has a rooted base and
    // a different wind phase; terrain and camera remain unchanged.
    const trees=[
      {p:[[0,.19],[.065,.35],[.12,.5],[.07,.59],[.17,.7],[.075,.88],[0,.89]],base:.89,phase:0},
      {p:[[.265,.49],[.215,.64],[.145,.78],[.14,.86],[.32,.86],[.33,.77],[.30,.61]],base:.86,phase:1.4},
      {p:[[1,.31],[.94,.43],[.89,.55],[.97,.6],[.86,.77],[.93,.85],[1,.88]],base:.88,phase:2.5},
      {p:[[.74,.60],[.69,.72],[.65,.83],[.81,.85],[.82,.77],[.78,.69]],base:.85,phase:3.6}
    ];
    trees.forEach(tree=>{
      const top=g.dy+g.dh*Math.min(...tree.p.map(p=>p[1])),bottom=g.dy+g.dh*tree.base;
      if(bottom<0||top>h)return;
      ctx.save();clipPhoto(tree.p,g);
      for(let y=Math.max(0,top);y<Math.min(h,bottom);y+=4){
        const sy=(y-g.dy)/g.scale,flex=clamp((bottom-y)/(bottom-top));
        const shift=(Math.sin(time*.65+tree.phase)+.24*Math.sin(time*1.17+tree.phase))*4*flex*flex;
        ctx.drawImage(surface,0,sy,surface.naturalWidth,5/g.scale,g.dx+shift,y,g.dw,5);
      }
      ctx.restore();
    });
    // Distant birds are deliberately small silhouettes within the valley sky.
    const passage=time%38;
    if(passage<19){
      const fade=Math.sin(passage/19*Math.PI)*.5;
      for(let i=0;i<4;i++){
        const x=g.dx+g.dw*(.12+passage*.037-i*.024),y=g.dy+g.dh*(.30+i*.006)+Math.sin(time*.5+i)*3;
        if(y<-10||y>h+10)continue;
        const wing=1.7+Math.sin(time*4.8+i)*1.5;
        ctx.strokeStyle=`rgba(15,27,37,${fade})`;ctx.lineWidth=.9;
        ctx.beginPath();ctx.moveTo(x-4,y-wing);ctx.quadraticCurveTo(x-2,y-1,x,y);ctx.quadraticCurveTo(x+2,y-1,x+4,y-wing);ctx.stroke();
      }
    }
  }
  function render(time){
    ctx.clearRect(0,0,w,h);
    const s=window.elev8miJourney;if(!s)return;
    // Cinematic sunrise is synchronized with Moon occlusion by request.
    // The real lunar phase remains independent of this demonstration.
    const clock=window.elev8miCelestial;
    const daylight=clock?.daylight??0;
    if(Math.abs(daylight-lastDay)>.003){
      document.documentElement.style.setProperty('--daylight',daylight.toFixed(3));
      document.documentElement.style.setProperty('--nightlight',(1-daylight).toFixed(3));lastDay=daylight;
    }
    const depth=s.center/s.plateHeight;
    const space=1-smooth(.4,.78,depth);
    const air=smooth(.65,.95,depth)*(1-smooth(1.30,1.62,depth));
    const forest=smooth(1.28,1.63,depth)*(1-smooth(2.05,2.30,depth));
    const underground=smooth(2.03,2.44,depth);
    const fog=air*.85+forest*.65+underground*.22;
    if(Math.abs(fog-lastFog)>.015){journey.style.setProperty('--fog-opacity',fog.toFixed(3));lastFog=fog;}
    const gpu=window.Elev8PhotoMotion?.active&&!reducedMotion.matches;
    const mist=gpu?forest*.085:air*.15+forest*.12;
    const rays=(air*.30+forest*.12)*(daylight*.25+(clock?.twilight||0)*.8);
    if(Math.abs(mist-lastMist)>.004){journey.style.setProperty('--atmosphere-mist',mist.toFixed(3));lastMist=mist;}
    if(Math.abs(rays-lastRays)>.004){journey.style.setProperty('--atmosphere-rays',rays.toFixed(3));lastRays=rays;}
    // renderAll(0) repaints this layer when motion is paused. Repainting the
    // frozen frame preserves its lighting instead of clearing the atmosphere.
    if(space>.001){
      stars.forEach((st,i)=>{
        const x=st.x*w,y=st.y*h-s.camera*.035;
        const pulse=Math.pow((1+Math.sin(time*(.65+i%5*.12)+st.phase))*.5,8);
        const alpha=space*(1-daylight)*(.2+.75*pulse);
        ctx.beginPath();ctx.arc(x,y,st.r*(1+pulse*.5),0,Math.PI*2);ctx.fillStyle=`rgba(219,233,255,${alpha})`;ctx.fill();
        if(i%7===0&&pulse>.3){const arm=2+4*pulse;ctx.strokeStyle=`rgba(211,229,255,${alpha*.65})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x-arm,y);ctx.lineTo(x+arm,y);ctx.moveTo(x,y-arm);ctx.lineTo(x,y+arm);ctx.stroke();}
      });
      const cycle=time%14;
      if(cycle>10&&cycle<11.15){const t=(cycle-10)/1.15;const x=w*(.78-t*.48),y=h*(.10+t*.28);const fade=Math.sin(t*Math.PI)*space;
        const trail=ctx.createLinearGradient(x,y,x+70,y-38);trail.addColorStop(0,`rgba(218,232,255,${fade*.8})`);trail.addColorStop(1,'rgba(218,232,255,0)');ctx.strokeStyle=trail;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+70,y-38);ctx.stroke();}
    }
    const density=forest*.7+underground*.35;
    if(density>.01)dust.forEach((p,i)=>{
      const x=(p.x*w+Math.sin(time*.11+i)*25+w)%w;
      const y=(p.y*h-time*(1.4+p.s)+h*100)%h;
      const a=density*(.14+.18*Math.sin(time*.8+i)**2);
      ctx.beginPath();ctx.arc(x,y,p.s,0,Math.PI*2);ctx.fillStyle=i%5===0&&forest>.2?`rgba(224,211,148,${a})`:`rgba(201,218,231,${a})`;ctx.fill();
    });
    if(!gpu){
      landscape(time,s);if(underground>.05)water(time,s);
      atmosphere(time,s,clock,depth);
    }
    // Wildlife remains a small independent layer in the GPU path.
    else if(forest>.1){
      const g=photoGeometry(surface,1,s);
      if(g){for(let i=0;i<4;i++){
        const t=(time+i*.3)%38;if(t>19)continue;
        const x=g.dx+g.dw*(.12+t*.037-i*.024),y=g.dy+g.dh*(.30+i*.006)+Math.sin(time*.5+i)*3;
        if(y<0||y>h)continue;const wing=1.7+Math.sin(time*4.8+i)*1.5;
        ctx.strokeStyle=`rgba(15,27,37,${Math.sin(t/19*Math.PI)*.5})`;ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(x-4,y-wing);ctx.quadraticCurveTo(x-2,y-1,x,y);ctx.quadraticCurveTo(x+2,y-1,x+4,y-wing);ctx.stroke();
      }}
    }
  }
  window.addEventListener('resize',resize,{passive:true});
  resize();window.Elev8Motion.add(render,{fps:30});
})();
