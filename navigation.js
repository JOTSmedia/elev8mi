(() => {
  'use strict';
  const bar=document.querySelector('.header-content');
  const nav=document.getElementById('nav');
  const menu=document.getElementById('menuToggle');
  const layer=document.querySelector('.nav-trails');
  const top=document.getElementById('navTrailTop');
  const bottom=document.getElementById('navTrailBottom');
  if(!bar||!nav||!menu||!layer||!top||!bottom)return;
  const links=[...nav.querySelectorAll('a[href^="#"]')];
  const sections=links.map(link=>document.querySelector(link.getAttribute('href')));
  const narrow=matchMedia('(max-width:720px)');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  let active=null, animations=[], serial=0, pendingClose=0, unlock=0, locked=false, raf=0;
  function cancel(){serial++;animations.forEach(a=>a.cancel());animations=[];}
  function place(animate=false){
    cancel();const token=serial;
    const b=bar.getBoundingClientRect();
    if(active&&narrow.matches&&!nav.classList.contains('open')){layer.hidden=true;return;}
    layer.hidden=false;
    const r=active?.getBoundingClientRect();
    const x=r?r.left-b.left+4:0, w=r?Math.max(14,r.width-8):90;
    const ys=r?[r.top-b.top-2,r.bottom-b.top+2]:[b.height/2-16,b.height/2+16];
    layer.style.height=`${Math.max(b.height,r?r.bottom-b.top+10:0)}px`;
    layer.dataset.mode=active?'active':'ambient';
    [top,bottom].forEach((line,i)=>{
      line.style.left=`${x}px`;line.style.top=`${ys[i]}px`;line.style.width=`${w}px`;
      line.style.transform='translateX(0)';line.style.opacity=active?'1':'0';
      if(!line.animate||reduced.matches)return;
      if(active){
        if(!animate)return;
        const from=i===0?b.width-x+100:-x-w-100;
        const a=line.animate([{transform:`translateX(${from}px) scaleX(1.8)`,opacity:0},{opacity:1,offset:.18},{transform:'translateX(0) scaleX(1)',opacity:1}],{duration:narrow.matches?360:720,easing:'cubic-bezier(.18,.78,.18,1)',fill:'both'});
        animations.push(a);a.onfinish=()=>{if(serial===token){line.style.transform='translateX(0)';line.style.opacity='1';a.cancel();}};
      }else if(!window.Elev8Motion?.paused){
        const from=i===0?b.width+110:-110, to=i===0?-110:b.width+110;
        animations.push(line.animate([{transform:`translateX(${from}px)`,opacity:0},{opacity:.95,offset:.12},{transform:`translateX(${to}px)`,opacity:0,offset:.65},{transform:`translateX(${to}px)`,opacity:0}],{duration:5800,iterations:Infinity,easing:'linear',delay:i*120}));
      }
    });
  }
  function select(link,animate=false){
    if(link===active&&!animate)return;
    active=link;
    links.forEach(item=>{if(item===link)item.setAttribute('aria-current','location');else item.removeAttribute('aria-current');});
    place(animate);
  }
  function setMenu(open){
    nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');
    requestAnimationFrame(()=>place(false));
  }
  menu.addEventListener('click',()=>{clearTimeout(pendingClose);setMenu(!nav.classList.contains('open'));});
  links.forEach(link=>link.addEventListener('click',()=>{
    clearTimeout(unlock);clearTimeout(pendingClose);locked=true;select(link,true);
    unlock=setTimeout(()=>{locked=false;},1600);
    if(narrow.matches)pendingClose=setTimeout(()=>setMenu(false),reduced.matches?0:480);
  }));
  document.getElementById('brandSlot')?.addEventListener('click',()=>{locked=true;clearTimeout(unlock);select(null);setMenu(false);unlock=setTimeout(()=>locked=false,1500);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){clearTimeout(pendingClose);setMenu(false);menu.focus();}});
  function spy(){
    raf=0;if(locked)return;
    const threshold=Math.max(140,innerHeight*.25);let chosen=null;
    sections.forEach((section,i)=>{if(section&&section.getBoundingClientRect().top<=threshold)chosen=links[i];});
    select(chosen);
  }
  window.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(spy);},{passive:true});
  window.addEventListener('resize',()=>place(false));
  window.addEventListener('elev8mi:motion',()=>{if(!active)place(false);});
  reduced.addEventListener('change',()=>place(false));
  if('ResizeObserver'in window){const observer=new ResizeObserver(()=>place(false));observer.observe(bar);observer.observe(nav);}
  document.fonts?.ready.then(()=>place(false));
  const initial=links.find(link=>link.hash===location.hash);if(initial)select(initial);else place(false);
})();
