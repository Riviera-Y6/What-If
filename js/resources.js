// ===== HULPBRONNE (Supabase) =====
// Hierdie publieke sleutel is doelbewus veilig om hier te wees: dit kan NET
// lees (RLS-beleid), en net ry'e waar is_active=true. Geen skryf-toegang
// of privaat data is hieraan blootgestel nie.
var SUPABASE_URL = 'https://iwwfvsgnqcytmrbiakjy.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_BVYwWmmdqk9v7m_4XTD5eQ_XdFj2LuZ';

var _resourcesCache = null;

var RES_CATEGORY_ICON = {
  grant: '\u{1F4B0}',
  work_programme: '\u{1F6E0}\u{FE0F}',
  gig_platform: '\u{1F4F1}',
  free_training: '\u{1F393}'
};

async function loadResources(){
  var listEl = document.getElementById('res-list');
  var L = t().res;

  if(_resourcesCache){
    renderResources(_resourcesCache);
    return;
  }

  listEl.innerHTML = '<div class="res-loading">' + L.loading + '</div>';

  try{
    var url = SUPABASE_URL + '/rest/v1/local_resources?select=*&is_active=eq.true&order=display_order.asc';
    var resp = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
      }
    });
    if(!resp.ok) throw new Error('HTTP ' + resp.status);
    var data = await resp.json();
    _resourcesCache = data;
    renderResources(data);
  } catch(e){
    listEl.innerHTML = '<div class="res-error">\u26A0\uFE0F ' + L.error + '</div>';
  }
}

function renderResources(items){
  var listEl = document.getElementById('res-list');
  var L = t().res;
  if(!items || !items.length){
    listEl.innerHTML = '<div class="res-error">' + L.empty + '</div>';
    return;
  }

  var catLabels = L.categories;
  var byCat = {};
  var catOrder = [];
  items.forEach(function(item){
    if(!byCat[item.category]){
      byCat[item.category] = [];
      catOrder.push(item.category);
    }
    byCat[item.category].push(item);
  });

  var html = '';
  catOrder.forEach(function(cat){
    html += '<div class="res-cat-lbl">' + (RES_CATEGORY_ICON[cat] || '') + ' ' + (catLabels[cat] || cat) + '</div>';
    byCat[cat].forEach(function(item){
      var title = lang === 'af' ? item.title_af : item.title_en;
      var summary = lang === 'af' ? item.summary_af : item.summary_en;
      var howTo = lang === 'af' ? item.how_to_apply_af : item.how_to_apply_en;
      var reqs = lang === 'af' ? item.requirements_af : item.requirements_en;
      html += '<div class="res-card">'
        + '<div class="res-card-title">' + esc(title) + '</div>'
        + (item.stipend_amount ? '<div class="res-card-amount">' + esc(item.stipend_amount) + '</div>' : '')
        + '<div class="res-card-summary">' + esc(summary) + '</div>'
        + '<div class="res-card-section"><strong>' + L.howToApply + ':</strong> ' + esc(howTo) + '</div>'
        + (reqs ? '<div class="res-card-section"><strong>' + L.requirements + ':</strong> ' + esc(reqs) + '</div>' : '')
        + (item.official_url ? '<a class="res-card-link" href="' + esc(item.official_url) + '" target="_blank" rel="noopener">' + L.officialSite + ' \u2192</a>' : '')
        + (item.contact_phone ? '<div class="res-card-phone">\u260E ' + esc(item.contact_phone) + '</div>' : '')
        + '<div class="res-card-verified">' + L.verified + ' ' + esc(item.last_verified) + '</div>'
        + '</div>';
    });
  });
  listEl.innerHTML = html;
}

// Bou 'n bondige opsomming van die hulpbronne vir die AI se stelselprompt.
// Laat AI toe om na spesifieke, regte SA-hulpbronne te verwys i.p.v. generiese raad.
async function getResourceContext(){
  if(!_resourcesCache){
    try{
      var url = SUPABASE_URL + '/rest/v1/local_resources?select=*&is_active=eq.true&order=display_order.asc';
      var resp = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        }
      });
      if(resp.ok) _resourcesCache = await resp.json();
    } catch(e){
      return ''; // as dit misluk, gaan voort sonder hulpbron-konteks - moenie 'Vra' blokkeer nie
    }
  }
  if(!_resourcesCache || !_resourcesCache.length) return '';

  var lines = _resourcesCache.map(function(item){
    var title = lang === 'af' ? item.title_af : item.title_en;
    var summary = lang === 'af' ? item.summary_af : item.summary_en;
    return '- ' + title + ': ' + summary + (item.stipend_amount ? ' (' + item.stipend_amount + ')' : '') + (item.official_url ? ' [' + item.official_url + ']' : '');
  });

  return (lang === 'af'
    ? '\n\nPLAASLIKE SUID-AFRIKAANSE HULPBRONNE (verwys spesifiek hierna wanneer die vraag oor geld, werk, inkomste, of oorlewing gaan - gee die amptelike skakel saam):\n'
    : '\n\nLOCAL SOUTH AFRICAN RESOURCES (refer to these specifically when the question is about money, work, income, or survival - include the official link):\n'
  ) + lines.join('\n');
}
