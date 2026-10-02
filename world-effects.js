(() => {
  'use strict';
  const canvas=document.getElementById('worldEffects');
  const world=document.getElementById('journeyWorld');
  const journey=document.getElementById('journey');
  if(!canvas||!world||!journey||!window.Elev8Motion)return;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const plates=[...world.querySelectorAll('.journey-plate')];
  const cave=plates[2]?.querySelector('img');
  // Move photographic cloud detail independently of the camera and terrain.
  plates.slice(0,2).forEach((plate,i)=>{
    const shell=document.createElement('div');shell.className=`cloud-scan cloud-${i?'surface':'orbit'}`;
    const copy=plate.cloneNode(true);copy.className='';copy.removeAttribute('id');
    shell.append(copy);world.append(shell);
  });
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
  let w=0,h=0,lastFog=-1;
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
      const offset=(Math.sin(y*.063-time*1.7)+Math.sin(y*.027+time*.9))*1.6*edge;
      ctx.drawImage(cave,0,sy,cave.naturalWidth,4/scale,dx+offset,y,dw,4);
    }
    for(let i=0;i<3;i++){
      const phase=(time*.18+i*.34)%1;
      ctx.beginPath();ctx.ellipse(dx+dw*(.40+i*.105),top+(bottom-top)*(.36+i*.12),7+phase*43,1+phase*7,0,0,Math.PI*2);
      ctx.strokeStyle=`rgba(169,219,239,${(1-phase)*.08})`;ctx.lineWidth=.6;ctx.stroke();
    }
    ctx.restore();
  }
  function render(time){
    ctx.clearRect(0,0,w,h);
    const s=window.elev8miJourney;if(!s)return;
    const depth=s.center/s.plateHeight;
    const space=1-smooth(.4,.78,depth);
    const air=smooth(.65,.95,depth)*(1-smooth(1.30,1.62,depth));
    const forest=smooth(1.28,1.63,depth)*(1-smooth(2.05,2.30,depth));
    const underground=smooth(2.03,2.44,depth);
    const fog=air*.85+forest*.65+underground*.22;
    if(Math.abs(fog-lastFog)>.015){journey.style.setProperty('--fog-opacity',fog.toFixed(3));lastFog=fog;}
    if(window.Elev8Motion.paused)return;
    if(space>.001){
      stars.forEach(st=>{ctx.beginPath();ctx.arc(st.x*w,st.y*h-s.camera*.035,st.r,0,Math.PI*2);ctx.fillStyle=`rgba(208,220,255,${space*(.10+.26*Math.pow(Math.sin(time*.6+st.phase),2))})`;ctx.fill();});
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
    if(underground>.05)water(time,s);
  }
  window.addEventListener('resize',resize,{passive:true});
  resize();window.Elev8Motion.add(render);
})();
