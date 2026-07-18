// ===== BACKMI (plekhouer totdat wetlike vereistes nagekom is) =====
function registerBackmiInterest(){
  localStorage.setItem('wi_backmi_interest','1');
  var note=document.getElementById('backmi-saved-note');
  note.style.display='block';
  var btn=document.getElementById('backmi-interest-btn');
  btn.disabled=true;
}

function checkBackmiInterest(){
  if(localStorage.getItem('wi_backmi_interest')==='1'){
    var note=document.getElementById('backmi-saved-note');
    if(note) note.style.display='block';
    var btn=document.getElementById('backmi-interest-btn');
    if(btn) btn.disabled=true;
  }
}
