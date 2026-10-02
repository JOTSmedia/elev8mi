(() => {
'use strict';
if(!window.Elev8Motion)return;
// Representative satellites. Sidereal days: JPL mean satellite elements,
// https://ssd.jpl.nasa.gov/sats/elem/ . Display distances and time compressed.
// Triton's signed period retains its retrograde orbit. Earth uses its live Moon.
const data={Mars:[['Phobos',.31891,1.5,[151,143,132]],['Deimos',1.26244,1.2,[182,166,146]]],Jupiter:[['Io',1.76914,2.1,[235,199,121]],['Europa',3.55118,1.9,[219,212,182]],['Ganymede',7.15455,2.5,[173,166,155]],['Callisto',16.689,2.3,[132,131,127]]],Saturn:[['Titan',15.9454,2.5,[224,177,113]],['Enceladus',1.37022,1.5,[223,236,241]]],Uranus:[['Titania',8.70587,2,[180,189,195]]],Neptune:[['Triton',-5.87685,2.2,[193,209,214]]]};
const systems=[],TAU=Math.PI*2,SIZE=160;let last=-1;
const normals=[];for(let y=0;y<20;y++)for(let x=0;x<20;x++){const nx=(x+.5-10)/10,ny=(y+.5-10)/10,r=nx*nx+ny*ny;if(r<1)normals.push({i:(y*20+x)*4,x:nx,y:ny,z:Math.sqrt(1-r),a:Math.min(1,(1-Math.sqrt(r))*10)});}
for(const [name,moons]of Object.entries(data)){const button=document.querySelector(`[data-planet="${name}"]`);if(!button)continue;const layers=[false,true].map(front=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=SIZE;canvas.className=`satellite-layer satellite-${front?'front':'rear'}`;canvas.setAttribute('aria-hidden','true');button.append(canvas);return canvas.getContext('2d');});const sprites=moons.map((m,i)=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=20;const ctx=canvas.getContext('2d'),frame=ctx.createImageData(20,20);return{m,i,canvas,ctx,frame};});systems.push({name,button,layers,sprites});button.dataset.moons=moons.map(m=>m[0]).join(', ');button.setAttribute('aria-label',button.getAttribute('aria-label')+'. Representative moons: '+button.dataset.moons);const showMoons=()=>{const detail=document.getElementById('planetDetail');if(detail?.classList.contains('is-visible')){const note=document.createElement('small');note.className='satellite-note';note.textContent='Moons: '+button.dataset.moons;detail.append(note);}};button.addEventListener('pointerenter',showMoons);button.addEventListener('focus',showMoons);}
function render(){const state=window.elev8miCelestial;if(!state)return;const time=state.time;if(time===last)return;last=time;const phone=innerWidth<600;
 for(const system of systems){const position=state.planetPositions[system.name];for(const ctx of system.layers)ctx.clearRect(0,0,SIZE,SIZE);if(!position?.visible)continue;
 const img=system.button.querySelector('.planet-model img'),spriteWidth=parseFloat(img?.style.width)||16,globe=spriteWidth*(system.name==='Saturn'?.42:1)/2,scale=Number(system.button.dataset.displayScale)||1;
 for(const sprite of system.sprites){const [name,period,size,color]=sprite.m;if(phone&&sprite.i>=(system.name==='Jupiter'?2:1))continue;
 // A shallow tilted plane with perspective, and a stable varying start phase.
 const seconds=18*Math.pow(Math.abs(period)/1.76914,.48),angle=time*TAU/seconds*Math.sign(period)+sprite.i*2.13+systems.indexOf(system)*.83;
 const orbit=Math.min(58,Math.max(globe+8,globe*(system.name==='Saturn'?3.1:1.65))+sprite.i*(phone?5:7)),depth=Math.sin(angle)*orbit*.88,perspective=1/(1-depth/180),dx=Math.cos(angle)*orbit*perspective,dy=Math.sin(angle)*orbit*.40*perspective+dx*.12,front=depth>=0;
 const sun=state.heroSun,lx=sun.x-position.displayX-dx*scale,ly=sun.y-position.displayY-dy*scale,lz=sun.z-position.z-depth*scale,length=Math.hypot(lx,ly,lz)||1,nx=lx/length,ny=ly/length,nz=lz/length;
 const pixels=sprite.frame.data;for(const n of normals){const diffuse=Math.max(0,n.x*nx+n.y*ny+n.z*nz),grain=.92+.08*Math.sin(n.x*31+n.y*43+sprite.i),shade=(.28+.72*diffuse)*grain;for(let c=0;c<3;c++)pixels[n.i+c]=color[c]*shade;pixels[n.i+3]=n.a*255;}
 sprite.ctx.putImageData(sprite.frame,0,0);const ctx=system.layers[front?1:0],radius=Math.max(phone?1.25:1.5,size)*perspective;
 ctx.globalAlpha=.88;ctx.drawImage(sprite.canvas,SIZE/2+dx-radius,SIZE/2+dy-radius,radius*2,radius*2);ctx.globalAlpha=1;
 }
 // Parent model sits between these layers. Its own Earth-limb clip, visibility,
 // alpha and z-index are inherited by every satellite, including halo edges.
 for(const ctx of system.layers)ctx.canvas.style.transform=`translate(-50%,-50%) scale(${scale})`;
 }
}
window.Elev8Motion.add(render);window.addEventListener('resize',()=>{last=-1;render();},{passive:true});render();
window.Elev8Satellites={systems:systems.map(s=>({planet:s.name,moons:s.sprites.map(p=>({name:p.m[0],periodDays:p.m[1]}))})),refresh:()=>{last=-1;render();}};
})();
