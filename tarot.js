(() => {
 'use strict';
 const deck=window.Elev8TarotDeck,draw=document.getElementById('drawBtn'),choices=document.getElementById('deckChoices');
 if(!deck||!draw||!choices)return;
 const spread=document.getElementById('spread'),hint=document.getElementById('pickHint'),meanings=document.getElementById('meanings'),synthesis=document.getElementById('synthesis'),copy=document.getElementById('copyReading');
 const controls=[...document.querySelectorAll('#spreadRow button')];
 let count=1,picks=[],positions=[],question='',remaining=[];
 function random(n){if(window.crypto?.getRandomValues){const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%n;}return Math.floor(Math.random()*n);}
 function shuffle(){const cards=deck.slice();for(let i=cards.length-1;i>0;i--){const j=random(i+1);[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;}
 function artwork(card,rev){const art=document.createElement('div');art.className='tarot-art'+(rev?' is-reversed':'');art.style.backgroundPosition=`${card.index%13/12*100}% ${Math.floor(card.index/13)/5*100}%`;art.setAttribute('role','img');art.setAttribute('aria-label',card.name+(rev?', reversed':', upright'));return art;}
 function write(){
   meanings.replaceChildren();picks.forEach((pick,i)=>{const article=document.createElement('article');article.className='meaning';const h=document.createElement('h3');h.textContent=`${positions[i]} · ${pick.card.name} · ${pick.rev?'Reversed':'Upright'}`;const p=document.createElement('p');p.textContent=pick.rev?pick.card.reversed:pick.card.upright;article.append(h,p);meanings.append(article);});
   synthesis.textContent=(question?`Reflecting on “${question}”. `:'')+'Consider how these themes relate to your situation; the cards offer reflection, not a guaranteed outcome.';
   window._reading={picks,positions,q:question};copy.hidden=false;window.dispatchEvent(new CustomEvent("elev8mi:reading-complete",{detail:window._reading}));
 }
 function choose(button,index){
   if(button.disabled||picks.length>=count)return;
   button.disabled=true;button.classList.add('is-chosen');
   const pick={card:remaining[index],rev:random(100)<28};picks.push(pick);
   button.setAttribute('aria-label',`${pick.card.name}, selected`);
   const slot=document.createElement('div');slot.className='slot';const pos=document.createElement('div');pos.className='pos';pos.textContent=positions[picks.length-1];
   const face=document.createElement('div');face.className='illustrated-card';face.append(artwork(pick.card,pick.rev));
   const name=document.createElement('p');name.className='tarot-name';name.textContent=pick.card.name;
   const orient=document.createElement('p');orient.className='tarot-orientation';orient.textContent=pick.rev?'Reversed':'Upright';slot.append(pos,face,name,orient);spread.append(slot);
   if(picks.length===count){[...choices.children].forEach(b=>b.disabled=true);write();draw.disabled=false;draw.textContent='Shuffle for a new reading';controls.forEach(b=>b.disabled=false);hint.textContent='Your spread is complete. Read the meanings below, or shuffle for a new reading.';}
   else hint.textContent=`Choose ${count-picks.length} more ${count-picks.length===1?'card':'cards'}. Your next position is ${positions[picks.length]}.`;
 }
 function start(){
   count=controls.find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.spread==='three'?3:1;
   positions=count===3?['Past','Present','What may unfold']:['Your focus'];picks=[];remaining=shuffle().slice(0,9);question=document.getElementById('question').value.trim();
   spread.replaceChildren();meanings.replaceChildren();synthesis.textContent='';copy.hidden=true;window._reading=null;window.dispatchEvent(new Event("elev8mi:reading-reset"));choices.replaceChildren();
   remaining.forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.className='deck-choice';b.setAttribute('aria-label',`Choose face-down card ${i+1}`);b.innerHTML='<span class="deck-back" aria-hidden="true"><span>✦</span></span>';b.addEventListener('click',()=>choose(b,i));choices.append(b);});
   hint.textContent=`The deck is shuffled. Choose ${count===1?'one card':'three cards'} below.`;draw.disabled=true;controls.forEach(b=>b.disabled=true);
 }
 controls.forEach(b=>b.addEventListener('click',()=>{count=b.dataset.spread==='three'?3:1;controls.forEach(c=>{c.classList.toggle('on',c===b);c.setAttribute('aria-pressed',String(c===b));});hint.textContent=count===1?'One card gives a focus. Press Shuffle & choose, then select a card.':'Three cards explore past, present, and what may unfold. Shuffle, then choose three cards.';}));
 draw.addEventListener('click',start);
 copy.addEventListener('click',async()=>{const text=[question,...picks.map((p,i)=>`${positions[i]}: ${p.card.name} (${p.rev?'Reversed':'Upright'})\n${p.rev?p.card.reversed:p.card.upright}`)].join('\n\n');try{await navigator.clipboard.writeText(text);copy.textContent='Copied';}catch(_){hint.textContent='Copy is unavailable here. Select the reading text to copy it.';}setTimeout(()=>copy.textContent='Copy this reading',1500);});
})();
