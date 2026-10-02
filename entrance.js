(() => {
 'use strict';
 const loader=document.getElementById('loader'),fly=document.getElementById('flyLogo'),hero=document.getElementById('heroLogo'),header=document.querySelector('header'),fill=document.getElementById('fill'),pct=document.getElementById('pct'),status=document.getElementById('status'),ui=document.getElementById('loadUi'),mark=document.querySelector('.load-mark');
 if(!loader||!fly||!hero||!mark)return;
 let generation=0,animation=null,deadline=0;
 function progress(n,label){const glow=document.getElementById('logoGlow');if(glow)glow.style.opacity=String(n/100);fill.style.width=`${n}%`;pct.textContent=`${n}%`;status.textContent=label;}
 function ready(){document.body.classList.remove('locked');document.body.classList.add('live');header?.classList.add('ready');}
 function settle(token){if(token!==generation)return;clearTimeout(deadline);clearTimeout(window.elev8miLoaderWatchdog);animation?.cancel();animation=null;ready();hero.style.opacity='1';hero.parentElement.classList.add('breathing');fly.style.visibility='hidden';loader.classList.add('done');progress(100,'The table is ready');}
 function timeout(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
 async function run(){
   const started=performance.now();const token=++generation;animation?.cancel();animation=null;clearTimeout(deadline);clearTimeout(window.elev8miLoaderWatchdog);
   mark.append(fly);fly.removeAttribute('style');fly.className='pulse';fly.style.visibility='visible';hero.style.opacity='1';
   document.body.classList.add('locked');document.body.classList.remove('live');header?.classList.remove('ready');loader.className='';ui?.classList.remove('hide');progress(10,'Preparing your table');
   deadline=setTimeout(()=>settle(token),3200);
   const imageReady=fly.complete?Promise.resolve():new Promise(resolve=>{fly.addEventListener('load',resolve,{once:true});fly.addEventListener('error',resolve,{once:true});});
   await Promise.race([imageReady,timeout(1200)]);if(token!==generation)return;progress(70,'Opening the table');
   await Promise.race([document.fonts?.ready??Promise.resolve(),timeout(350)]);if(token!==generation)return;
   const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
   await timeout(Math.max(0,(reduced?350:1400)-(performance.now()-started)));if(token!==generation)return;
   if(reduced){settle(token);return;}
   progress(100,'The table is ready');
   const from=fly.getBoundingClientRect(),to=hero.getBoundingClientRect();
   if(!fly.animate||!from.width||!to.width){settle(token);return;}
   ready();loader.classList.add('revealing');ui?.classList.add('hide');hero.style.opacity='0';document.body.append(fly);
   Object.assign(fly.style,{position:'fixed',left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`,margin:'0',zIndex:'4500',pointerEvents:'none',animation:'none',transformOrigin:'top left'});
   animation=fly.animate([{transform:'translate(0,0) scale(1,1)',opacity:1},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,opacity:1}],{duration:750,easing:'cubic-bezier(.22,.7,.24,1)',fill:'forwards'});
   animation.finished.then(()=>settle(token)).catch(()=>{if(token===generation)settle(token);});
 }
 document.getElementById('replay')?.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'});setTimeout(run,250);});
 run().catch(()=>settle(generation));
})();
