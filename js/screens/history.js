// ===== SAVE DECISION =====
function saveDecision(){
  if(!lastResult) return;
  decisions.unshift({q:currentQ,conf:parseInt(lastResult.conf)||70,date:new Date().toLocaleDateString(lang==='af'?'af-ZA':'en-ZA'),result:lastResult});
  localStorage.setItem('wi_dec',JSON.stringify(decisions));
  updateStats();
  var btn=document.getElementById('btn-save');
  btn.textContent=t().btnSaved;
  btn.style.background='#00cc55';
  setTimeout(function(){goHome();},1300);
}

// ===== HISTORY =====
function renderHistory(){
  var list=document.getElementById('hist-list');
  var L=t();
  if(!decisions.length){
    list.innerHTML='<div class="empty-state"><div class="ei">&#128194;</div><p>'+L.histEmpty+'</p></div>';
    return;
  }
  list.innerHTML=decisions.map(function(d,i){
    var clickable = d.result ? ' hist-clickable" onclick="openHistoryItem('+i+')"' : '"';
    var hint = d.result ? '<span class="hist-open-hint">&#128065; '+L.histOpen+'</span>' : '<span class="hist-no-hint">'+L.histNoData+'</span>';
    return '<div class="hist-item'+clickable+'><div class="hist-q">'+esc(d.q)+'</div><div class="hist-meta"><span>'+d.date+'</span><span class="hist-conf">'+d.conf+'%</span>'+hint+'</div></div>';
  }).join('');
}

function openHistoryItem(i){
  var d=decisions[i];
  if(!d || !d.result) return;
  currentQ=d.q;
  renderResult(d.result,true);
}
