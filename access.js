// ===== TOEGANG =====
// Hierdie is 'n eenvoudige plaaslike toegangskode (PIN) - dit is NIE 'n geheim
// wat regte API-toegang verleen nie. Die werklike Anthropic-sleutel leef
// uitsluitlik bediener-kant in die Cloudflare Worker (sien js/api.js).
var ACCESS_PIN = 'whatif2026';

function checkAccessSetup(){
  if(!localStorage.getItem('wi_unlocked')){
    document.getElementById('access-overlay').classList.remove('hide');
  }
}

document.getElementById('access-input').addEventListener('input',function(){
  document.getElementById('btn-access').disabled = this.value.trim().length < 5;
  document.getElementById('access-err').style.display = 'none';
});
document.getElementById('access-input').addEventListener('keydown',function(e){
  if(e.key==='Enter' && this.value.trim().length>=5) checkAccess();
});

function checkAccess(){
  var val = document.getElementById('access-input').value.trim();
  if(val === ACCESS_PIN){
    localStorage.setItem('wi_unlocked', '1');
    document.getElementById('access-overlay').classList.add('hide');
  } else {
    document.getElementById('access-err').style.display = 'block';
  }
}
