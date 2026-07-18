// ===== SPLASH =====
function startApp(){
  document.getElementById('splash').classList.add('hide');
  document.getElementById('app').classList.add('show');
  if(!userName) document.getElementById('name-overlay').classList.remove('hide');
}

// ===== NAV =====
function navTo(tab){
  document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
  document.getElementById('hdr-profile-btn').classList.remove('active');
  var navEl=document.getElementById('nav-'+tab);
  if(navEl) navEl.classList.add('active');
  if(tab==='home') showScreen('sc-home');
  if(tab==='history'){showScreen('sc-history');renderHistory();}
  if(tab==='biz') showScreen('sc-biz');
  if(tab==='profile'){showScreen('sc-profile');loadMedicalProfile();document.getElementById('hdr-profile-btn').classList.add('active');}
  if(tab==='sos'){showScreen('sc-sos');renderCircle();}
  if(tab==='resources'){showScreen('sc-resources');loadResources();}
  if(tab==='backmi'){showScreen('sc-backmi');checkBackmiInterest();}
}
function showScreen(id){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');s.style.display='';});
  var el=document.getElementById(id);
  el.classList.add('active');
  el.style.display='';
}
function goHome(){
  document.getElementById('q-input').value='';
  document.getElementById('btn-analyse').disabled=true;
  navTo('home');
}
