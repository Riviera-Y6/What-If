// ===== STATE =====
var lang=localStorage.getItem('wi_lang')||'af';
var userName=localStorage.getItem('wi_name')||'';
var qCount=parseInt(localStorage.getItem('wi_qc')||'0');
var decisions=JSON.parse(localStorage.getItem('wi_dec')||'[]');
var currentQ='';
var lastResult=null;

function esc(s){if(!s)return '';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ===== GREETING WITH NAME =====
function updateGreeting(){
  var L=t();
  var el=document.getElementById('home-greet');
  el.textContent=userName?L.greet+' '+userName+'!':L.greet+'.';
}

// ===== NAME OVERLAY =====
document.getElementById('name-input').addEventListener('input',function(){
  document.getElementById('btn-name').disabled=this.value.trim().length<2;
});
document.getElementById('name-input').addEventListener('keydown',function(e){
  if(e.key==='Enter'&&this.value.trim().length>=2) saveName();
});
function saveName(){
  var n=document.getElementById('name-input').value.trim();
  if(!n) return;
  userName=n;
  localStorage.setItem('wi_name',n);
  document.getElementById('name-overlay').classList.add('hide');
  updateGreeting();
}

// ===== QUOTA SYSTEM =====
var MONTHLY_LIMIT = 50;

function getQuota(){
  var now = new Date();
  var stored = localStorage.getItem('wi_quota');
  var q;
  if(stored){
    q = JSON.parse(stored);
    // Check if we need to reset (new month)
    var resetDate = new Date(q.resetDate);
    if(now >= resetDate){
      q.used = 0;
      q.resetDate = new Date(now.getFullYear(), now.getMonth()+1, now.getDate()).toISOString();
      localStorage.setItem('wi_quota', JSON.stringify(q));
    }
  } else {
    // First time - set start date and reset date (30 days later)
    var reset = new Date(now);
    reset.setDate(reset.getDate() + 30);
    q = {
      used: 0,
      startDate: now.toISOString(),
      resetDate: reset.toISOString()
    };
    localStorage.setItem('wi_quota', JSON.stringify(q));
  }
  return q;
}

function incrementQuota(){
  var q = getQuota();
  q.used++;
  localStorage.setItem('wi_quota', JSON.stringify(q));
  updateQuotaDisplay();
  return q;
}

function hasQuotaRemaining(){
  var q = getQuota();
  return q.used < MONTHLY_LIMIT;
}

function formatDate(isoStr){
  var d = new Date(isoStr);
  var months_af = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Des'];
  var months_en = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var months = lang==='af' ? months_af : months_en;
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function updateQuotaDisplay(){
  var q = getQuota();
  var remaining = MONTHLY_LIMIT - q.used;
  var pct = (remaining / MONTHLY_LIMIT) * 100;
  var af = lang==='af';

  // Label
  var lbl = document.getElementById('quota-lbl');
  if(lbl) lbl.textContent = af ? 'Maandelikse vrae' : 'Monthly questions';

  // Count
  var countEl = document.getElementById('quota-count');
  if(countEl){
    countEl.textContent = remaining + '/' + MONTHLY_LIMIT;
    countEl.className = 'quota-count ' + (remaining > 15 ? 'ok' : remaining > 5 ? 'warn' : 'full');
  }

  // Bar
  var bar = document.getElementById('quota-bar');
  if(bar){
    bar.style.width = pct + '%';
    bar.className = 'quota-bar-fill ' + (remaining > 15 ? 'quota-fill-ok' : remaining > 5 ? 'quota-fill-warn' : 'quota-fill-full');
  }

  // Dates
  var slbl = document.getElementById('quota-start-lbl');
  var sdate = document.getElementById('quota-start-date');
  var rlbl = document.getElementById('quota-reset-lbl');
  var rdate = document.getElementById('quota-reset-date');
  if(slbl) slbl.textContent = af ? 'Lid sedert:' : 'Member since:';
  if(sdate) sdate.textContent = formatDate(q.startDate);
  if(rlbl) rlbl.textContent = af ? 'Hernu op:' : 'Renews on:';
  if(rdate) rdate.textContent = formatDate(q.resetDate);
}

function showQuotaBlocked(){
  var af = lang==='af';
  var q = getQuota();
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');s.style.display='';});
  var sc = document.getElementById('sc-home');
  sc.classList.add('active');
  var wrap = document.getElementById('quota-wrap');
  if(wrap){
    wrap.innerHTML = '<div class="quota-block-box">'
      + '<div class="qb-icon">&#128683;</div>'
      + '<div class="qb-title">' + (af?'Maandelikse limiet bereik':'Monthly limit reached') + '</div>'
      + '<div class="qb-msg">' + (af
        ? 'Jy het jou 50 vrae vir hierdie maand gebruik. Jou limiet hernu outomaties op:'
        : 'You have used your 50 questions for this month. Your limit renews automatically on:')
      + '</div>'
      + '<div class="qb-reset">&#128197; ' + formatDate(q.resetDate) + '</div>'
      + '</div>';
  }
  navTo('home');
}
