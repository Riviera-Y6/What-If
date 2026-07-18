// ===== STATS =====

function updateStats(){
  document.getElementById('st-q').textContent=qCount;
  document.getElementById('st-d').textContent=decisions.length;
  if(decisions.length){
    var avg=Math.round(decisions.reduce(function(a,d){return a+(d.conf||70);},0)/decisions.length);
    document.getElementById('st-c').textContent=avg+'%';
  }
}


// INPUT
document.getElementById('q-input').addEventListener('input',function(){
  document.getElementById('btn-analyse').disabled=this.value.trim().length<6;
});

// THINKING ANIMATION
var thinkTimer=null;
function startThinking(){
  showScreen('sc-thinking');
  document.getElementById('sc-thinking').style.display='flex';
  document.querySelectorAll('.t-step').forEach(function(s){s.classList.remove('lit');});
  var i=0;
  thinkTimer=setInterval(function(){
    var steps=document.querySelectorAll('.t-step');
    if(i<steps.length){steps[i].classList.add('lit');i++;}
  },800);
}
function stopThinking(){if(thinkTimer) clearInterval(thinkTimer);}

// INHOUDFILTER
function checkPolicy(q){
  var lower=q.toLowerCase();
  // Bou/skep/programmeer versoeke
  var build=['build','create','make me','design','code','program','develop','write me',
    'bou','skep','maak vir','ontwerp','programmeer','ontwikkel','skryf vir my'];
  for(var i=0;i<build.length;i++){
    if(lower.indexOf(build[i])>-1) return 'build';
  }
  // Prent/foto versoeke
  var image=['image','photo','picture','foto','prent','skermkiekie','screenshot',
    'video','gif','diagram','chart','graph','kaart'];
  for(var i=0;i<image.length;i++){
    if(lower.indexOf(image[i])>-1) return 'image';
  }
  return null;
}

function policyBlock(type){
  var af=lang==='af';
  if(type==='build'){
    return {
      direct: af?'What-If is uitsluitlik n besluitnemingsvennoot. Ek kan ongelukkig nie iets bou, skep, ontwerp of programmeer nie.':'What-If is exclusively a decision partner. Unfortunately I cannot build, create, design or programme anything.',
      risks:[af?'Hierdie versoek val buite What-If se beleid':'This request falls outside What-If policy'],
      opps:[af?'Vra gerus enige besluitvraag':'Feel free to ask any decision question'],
      challenge:af?'Is daar n besluit waarmee ek jou kan help?':'Is there a decision I can help you with?',
      best:af?'Vra n besluitvraag':'Ask a decision question',
      likely:af?'Ek help graag met besluite en keuses':'I am happy to help with decisions and choices',
      worst:af?'Geen risiko nie':'No risk',
      conf:100,
      rec:af?'Stel gerus n vraag oor n besluit of keuse in jou lewe.':'Please ask a question about a decision or choice in your life.',
      next:af?'Vra jou besluitvraag hier.':'Ask your decision question here.'
    };
  }
  if(type==='image'){
    return {
      direct: af?'Ongelukkig is versoeke wat prente of fotos insluit nie in ooreenstemming met What-If se beleid nie. Ek beantwoord uitsluitlik vrae oor besluite en keuses.':'Unfortunately requests involving images or photos are not in line with What-If policy. I exclusively answer questions about decisions and choices.',
      risks:[af?'Hierdie versoek val buite ons beleid':'This request falls outside our policy'],
      opps:[af?'Ek is gereed om jou te help met enige besluit':'I am ready to help you with any decision'],
      challenge:af?'Het jy n besluit wat jy moet neem?':'Do you have a decision you need to make?',
      best:af?'Vra gerus':'Ask freely',
      likely:af?'Ek help graag':'Happy to help',
      worst:af?'Geen risiko nie':'No risk',
      conf:100,
      rec:af?'Vra gerus enige vraag oor n besluit of keuse in jou lewe.':'Feel free to ask any question about a decision or choice in your life.',
      next:af?'Stel jou besluitvraag hier.':'Ask your decision question here.'
    };
  }
}

// ANALYSE
async function doAnalyse(){
  currentQ=document.getElementById('q-input').value.trim();
  if(!currentQ) return;
  // Check monthly quota first
  if(!hasQuotaRemaining()){
    showQuotaBlocked();
    return;
  }
  // Check policy
  var policyViolation=checkPolicy(currentQ);
  if(policyViolation){
    incrementQuota();
    qCount++;
    localStorage.setItem('wi_qc',qCount);
    updateStats();
    renderResult(policyBlock(policyViolation));
    return;
  }
  incrementQuota();
  qCount++;
  localStorage.setItem('wi_qc',qCount);
  updateStats();
  startThinking();
  try{
    var result=await callAI(currentQ);
    stopThinking();
    renderResult(result);
  }catch(err){
    stopThinking();
    renderError(err.message||'Verbindingsfout. Probeer weer.');
  }
}

// RENDER RESULT
function renderResult(R,fromHistory){
  lastResult=R;
  var L=t();
  document.getElementById('rq-txt').textContent=currentQ;
  var b=document.getElementById('result-body');
  b.innerHTML='';
  if(R._cached && !fromHistory){
    b.innerHTML+='<div class="cached-note">&#128161; '+L.cachedNote+'</div>';
  }
  b.innerHTML+='<div class="res-block direct"><div class="res-block-lbl">'+L.lbl.direct+'</div><div class="res-block-txt">'+esc(R.direct)+'</div></div>';
  var risks=Array.isArray(R.risks)?R.risks.map(function(r){return '<li>'+esc(r)+'</li>';}).join(''):'<li>'+esc(R.risks)+'</li>';
  var opps=Array.isArray(R.opps)?R.opps.map(function(o){return '<li>'+esc(o)+'</li>';}).join(''):'<li>'+esc(R.opps)+'</li>';
  b.innerHTML+='<div class="cards-grid">'
    +'<div class="res-block card risks"><div class="res-block-lbl">&#9888; '+L.lbl.risks+'</div><div class="res-block-txt"><ul>'+risks+'</ul></div></div>'
    +'<div class="res-block card opps"><div class="res-block-lbl">&#127919; '+L.lbl.opps+'</div><div class="res-block-txt"><ul>'+opps+'</ul></div></div>'
    +'</div>';
  b.innerHTML+='<div class="challenge-box"><div class="res-block-lbl" style="color:var(--warn)">&#9889; '+L.lbl.challenge+'</div><div class="challenge-txt">'+esc(R.challenge)+'</div></div>';
  b.innerHTML+='<div class="sc-wrap"><div class="sec-lbl">'+L.lbl.scenarios+'</div>'
    +'<div class="scenario sc-best"><div class="sc-badge">'+L.lbl.best+'</div><div class="sc-txt">'+esc(R.best)+'</div></div>'
    +'<div class="scenario sc-likely"><div class="sc-badge">'+L.lbl.likely+'</div><div class="sc-txt">'+esc(R.likely)+'</div></div>'
    +'<div class="scenario sc-worst"><div class="sc-badge">'+L.lbl.worst+'</div><div class="sc-txt">'+esc(R.worst)+'</div></div>'
    +'</div>';
  var conf=parseInt(R.conf)||70;
  b.innerHTML+='<div class="conf-wrap"><div class="conf-row"><div class="conf-title">'+L.lbl.conf+'</div><div class="conf-pct">'+conf+'%</div></div><div class="conf-bar"><div class="conf-fill" id="cf-bar" style="width:0%"></div></div></div>';
  b.innerHTML+='<div class="rec-wrap"><div class="rec-lbl">&#10022; '+L.lbl.rec+'</div><div class="rec-txt">'+esc(R.rec)+'</div><div class="rec-next"><div class="rec-num">1</div><div class="rec-next-txt">'+esc(R.next)+'</div></div></div>';
  var saveBtn=document.getElementById('btn-save');
  if(fromHistory){
    saveBtn.textContent=L.btnAlreadySaved;
    saveBtn.style.background='var(--bg3)';
    saveBtn.disabled=true;
  } else {
    saveBtn.textContent=L.btnSave;
    saveBtn.style.background='var(--accent)';
    saveBtn.disabled=false;
  }
  showScreen('sc-result');
  setTimeout(function(){var bar=document.getElementById('cf-bar');if(bar)bar.style.width=conf+'%';},300);
  window.scrollTo(0,0);
}

function renderError(msg){
  document.getElementById('result-body').innerHTML='<div class="err-box">&#9888; '+esc(msg)+'</div>';
  document.getElementById('rq-txt').textContent=currentQ;
  document.getElementById('btn-save').style.display='none';
  showScreen('sc-result');
}

