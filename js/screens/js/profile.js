// ===== MEDIESE PROFIEL =====
function saveMedicalProfile(){
  var profile={
    blood:document.getElementById('mp-blood').value,
    allergy:document.getElementById('mp-allergy').value,
    meds:document.getElementById('mp-meds').value,
    contact:document.getElementById('mp-contact').value
  };
  localStorage.setItem('wi_medical',JSON.stringify(profile));
  var note=document.getElementById('mp-saved-note');
  note.style.display='block';
  setTimeout(function(){note.style.display='none';},2200);
}
function loadMedicalProfile(){
  var raw=localStorage.getItem('wi_medical');
  if(!raw) return;
  var profile=JSON.parse(raw);
  document.getElementById('mp-blood').value=profile.blood||'';
  document.getElementById('mp-allergy').value=profile.allergy||'';
  document.getElementById('mp-meds').value=profile.meds||'';
  document.getElementById('mp-contact').value=profile.contact||'';
}
