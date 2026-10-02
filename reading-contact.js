(() => {
 'use strict';
 const dialog=document.getElementById('interpretDialog'),reopen=document.getElementById('interpretReading'),cards=document.getElementById('interpretCards'),message=document.getElementById('interpretMessage'),email=document.getElementById('interpretEmail');
 if(!dialog||!reopen||!cards||!message||!email)return;
 let previousFocus=null;
 function open(){if(!window._reading||dialog.open)return;previousFocus=document.activeElement;if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
 function close(){if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');previousFocus?.focus();}}
 dialog.addEventListener('close',()=>previousFocus?.focus());
 dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}});
 document.getElementById('closeInterpret').addEventListener('click',close);
 document.getElementById('continueReading').addEventListener('click',close);
 reopen.addEventListener('click',open);
 window.addEventListener('elev8mi:reading-reset',()=>{close();reopen.hidden=true;cards.replaceChildren();message.value='';email.removeAttribute('href');});
 window.addEventListener('elev8mi:reading-complete',({detail:reading})=>{
   const selected=reading.picks.map((pick,i)=>`${reading.positions[i]}: ${pick.card.name} (${pick.rev?'Reversed':'Upright'})`);
   cards.replaceChildren(...selected.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
   const body='ALLISON-\n\nI DREW MY CARDS ON YOUR WEBSITE AND WOULD LOVE FOR YOU TO INTERPRET THEM FOR ME.\n\nMY CARDS:\n'+selected.join('\n')+(reading.q?'\n\nMY QUESTION:\n'+reading.q:'');
   message.value=body;
   email.href='mailto:readings@allison.grok.me?subject='+encodeURIComponent('INTERPRET MY CARDS')+'&body='+encodeURIComponent(body);
   reopen.hidden=false;open();
 });
})();
