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
  // Move photographic cloud detail independently of the camera and terrain.
  plates.slice(0,2).forEach((plate,i)=>{
    const shell=document.createElement('div');shell.className=`cloud-scan cloud-${i?'surface':'orbit'}`;
    const copy=plate.cloneNode(true);copy.className='';copy.removeAttribute('id');
    shell.append(copy);world.append(shell);
  });
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
  let w=0,h=0,lastFog=-1,lastDay=-1;
  const stars=Array.from({length:50},(_,i)=>({x:((i*73.37)%100)/100,y:((i*31.71)%100)/100,r:.35+(i%4)*.18,phase:i*1.7}));
  const dust=Array.from({length:27},(_,i)=>({x:((i*61.13)%100)/100,y:((i*43.79)%100)/100,s:.3+(i%6)*.15}));
  function resize(){
    w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
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
    // Earth rotation drives this accelerated atmospheric cycle independently
    // of the lunar orbit; the real-time lunar phase remains unchanged.
    const daylight=(1-Math.cos(time*Math.PI*2/90))*.5;
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
    if(window.Elev8Motion.paused)return;
    if(space>.001){
      stars.forEach((st,i)=>{
        const x=st.x*w,y=st.y*h-s.camera*.035;
        const pulse=Math.pow((1+Math.sin(time*(.65+i%5*.12)+st.phase))*.5,8);
        const alpha=space*(.2+.75*pulse);
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
    if(!window.Elev8PhotoMotion?.active){
      landscape(time,s);if(underground>.05)water(time,s);
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
