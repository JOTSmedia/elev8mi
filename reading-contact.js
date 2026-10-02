(() => {
 'use strict';
 const dialog=document.getElementById('interpretDialog'),reopen=document.getElementById('interpretReading'),cards=document.getElementById('interpretCards'),message=document.getElementById('interpretMessage'),email=document.getElementById('interpretEmail');
 if(!dialog||!reopen||!cards||!message||!email)return;
 let previousFocus=null;
 function open(){if(!window._reading||dialog.open)return;previousFocus=document.activeElement;if(typeof dialog.showModal==='function')dialog.showModal();else{dialog.setAttribute('open','');document.getElementById('closeInterpret')?.focus();}}
 function restoreFocus(){const target=previousFocus?.isConnected&&previousFocus!==document.body&&previousFocus!==document.documentElement&&previousFocus.tabIndex>=0&&!previousFocus.disabled&&!previousFocus.closest('[hidden],[inert]')&&getComputedStyle(previousFocus).display!=='none'&&getComputedStyle(previousFocus).visibility!=='hidden'?previousFocus:(!reopen.hidden?reopen:document.getElementById('drawBtn'));target?.focus();}
 function close(){if(!dialog.open)return;if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');restoreFocus();}}
 dialog.addEventListener('close',restoreFocus);
 dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();close();}else if(event.key==='Tab'&&typeof dialog.showModal!=='function'){const items=[...dialog.querySelectorAll('button,a[href],textarea')].filter(el=>!el.disabled&&!el.hidden);const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}});
 document.getElementById('closeInterpret').addEventListener('click',close);
 document.getElementById('continueReading').addEventListener('click',close);
 reopen.addEventListener('click',open);
 window.addEventListener('elev8mi:reading-reset',()=>{close();reopen.hidden=true;cards.replaceChildren();message.value='';email.removeAttribute('href');});
 window.addEventListener('elev8mi:reading-complete',({detail:reading})=>{
   const selected=reading.picks.map((pick,i)=>`${reading.positions[i]}: ${pick.card.name} (${pick.rev?'Reversed':'Upright'})`);
   cards.replaceChildren(...selected.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
   const body='ALLISON-\n\nI DREW MY CARDS ON YOUR WEBSITE AND WOULD LOVE FOR YOU TO INTERPRET THEM FOR ME.\n\nMY CARDS:\n'+selected.join('\n')+(reading.q?'\n\nREADING STYLE:\n'+reading.q:'');
   message.value=body;
   email.href='mailto:readings@allison.grok.me?subject='+encodeURIComponent('INTERPRET MY CARDS')+'&body='+encodeURIComponent(body);
   reopen.hidden=false;open();
 });
})();
