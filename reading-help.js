(() => {
 const dialog=document.getElementById('readingGuide'),help=document.getElementById('readingHelp');
 if(!dialog||!help)return;
 help.addEventListener('click',()=>dialog.showModal());
 document.getElementById('closeReadingGuide').addEventListener('click',()=>dialog.close());
 document.getElementById('beginReading').addEventListener('click',()=>{dialog.close();document.getElementById('question').focus();});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
})();
