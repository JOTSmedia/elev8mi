(() => {
 'use strict';
 const pictures=document.getElementById('interpretPictures'),email=document.getElementById('downloadCardEmail'),download=document.getElementById('downloadCardPictures'),status=document.getElementById('pictureStatus');
 if(!pictures||!email||!download||!status)return;
 let revision=0,urls=[];
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const wrap=s=>s.match(/.{1,76}/g)?.join('\r\n')||'';
 function reset(){revision++;urls.forEach(url=>URL.revokeObjectURL(url));urls=[];pictures.replaceChildren();email.hidden=download.hidden=true;email.removeAttribute('href');download.removeAttribute('href');status.textContent='';}
 function objectURL(blob){const url=URL.createObjectURL(blob);urls.push(url);return url;}
 function base64(text){const bytes=new TextEncoder().encode(text);let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(binary);}
 async function raster(pick){
  const svg=window.Elev8TarotArt.render(pick.card);svg.setAttribute('xmlns','http://www.w3.org/2000/svg');svg.setAttribute('width','384');svg.setAttribute('height','656');
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml;charset=utf-8'}));
  try{
   const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url;});
   const canvas=document.createElement('canvas');canvas.width=384;canvas.height=656;const ctx=canvas.getContext('2d');
   if(pick.rev){ctx.translate(384,656);ctx.rotate(Math.PI);}ctx.drawImage(image,0,0,384,656);
   return {canvas,png:canvas.toDataURL('image/png'),name:pick.card.name,orientation:pick.rev?'Reversed':'Upright'};
  }finally{URL.revokeObjectURL(url);}
 }
 function makeEmail(cards,body,reading){
  const boundary='elev8mi-related-'+Date.now(),alternative=boundary+'-alternative';
  const html='<html><body style="font-family:Georgia,serif;color:#241b36"><h1>ELEV8MI · My card reading</h1><p style="white-space:pre-wrap">'+escape(body)+'</p>'+cards.map((card,i)=>'<h2>'+escape(reading.positions[i]+' · '+card.name+' · '+card.orientation)+'</h2><p><img src="cid:elev8mi-card-'+i+'" width="288" height="492" alt="'+escape(card.name+' — '+card.orientation)+'"></p>').join('')+'</body></html>';
  const lines=['To: elev8miangel@gmail.com','Subject: INTERPRET MY CARDS','X-Unsent: 1','MIME-Version: 1.0','Content-Type: multipart/related; boundary="'+boundary+'"','','--'+boundary,'Content-Type: multipart/alternative; boundary="'+alternative+'"','','--'+alternative,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',wrap(base64(body)),'--'+alternative,'Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: base64','',wrap(base64(html)),'--'+alternative+'--'];
  cards.forEach((card,i)=>lines.push('--'+boundary,'Content-Type: image/png; name="elev8mi-card-'+(i+1)+'.png"','Content-Transfer-Encoding: base64','Content-ID: <elev8mi-card-'+i+'>','Content-Disposition: inline; filename="elev8mi-card-'+(i+1)+'.png"','',wrap(card.png.split(',')[1])));
  lines.push('--'+boundary+'--','');return new Blob([lines.join('\r\n')],{type:'message/rfc822'});
 }
 window.addEventListener('elev8mi:reading-reset',reset);
 window.addEventListener('elev8mi:reading-complete',async({detail:reading})=>{
  reset();const current=revision;status.textContent='Preparing your card pictures…';
  try{
   const cards=await Promise.all(reading.picks.map(raster));if(current!==revision)return;
   cards.forEach(card=>{const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=card.png;img.alt=card.name+', '+card.orientation;img.width=384;img.height=656;caption.textContent=card.name+' · '+card.orientation;figure.append(img,caption);pictures.append(figure);});
   const body=document.getElementById('interpretMessage').value;
   email.href=objectURL(makeEmail(cards,body,reading));email.download='ELEV8MI-interpret-my-cards.eml';email.hidden=false;
   const canvas=document.createElement('canvas');canvas.width=cards.length*424+40;canvas.height=820;const ctx=canvas.getContext('2d');ctx.fillStyle='#100b22';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#f2eaff';ctx.textAlign='center';ctx.font='24px Georgia';ctx.fillText('ELEV8MI · TAP INTO YOUR ENERGY',canvas.width/2,48);
   cards.forEach((card,i)=>{const x=40+i*424;ctx.drawImage(card.canvas,x,78);ctx.font='19px Georgia';ctx.fillText(card.name,x+192,766);ctx.font='16px Georgia';ctx.fillText(reading.positions[i]+' · '+card.orientation,x+192,795);});
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(current!==revision)return;if(!blob)throw new Error('image export failed');
   download.href=objectURL(blob);download.download='ELEV8MI-my-card-pictures.png';download.hidden=false;status.textContent='Your email draft includes '+cards.length+' card '+(cards.length===1?'picture':'pictures')+'.';
  }catch(_){if(current===revision)status.textContent='Picture download is unavailable in this browser. Your email still includes links to the selected card pictures.';}
 });
})();
