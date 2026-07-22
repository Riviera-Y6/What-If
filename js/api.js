// ===== AI CALL =====
// SEKURITEIT: geen API-sleutel leef hier nie. Alle versoeke gaan deur die
// Cloudflare Worker (WORKER_URL) wat die regte Anthropic-sleutel bediener-kant
// as 'n geheime omgewingsveranderlike stoor. Sien DEPLOY.md vir opstel-instruksies.
var WORKER_URL = 'https://what-if-worker.bakhuyz.workers.dev';

async function callAI(question){
  var resourceContext = await getResourceContext();
  var resp=await fetch(WORKER_URL,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      model:'claude-sonnet-4-6',
      max_tokens:1000,
      system:t().sysPrompt + resourceContext,
      messages:[{role:'user',content:question}]
    })
  });
  if(!resp.ok){
    var err=await resp.json().catch(function(){return {};});
    throw new Error(err.error&&err.error.message?err.error.message:'API fout: '+resp.status);
  }
  var data=await resp.json();
  var wasCached = !!data._cached; // die Worker merk dit as hierdie vraag al voorheen gevra is
  var raw=data.content[0].text.trim();
  raw=raw.replace(/```json/g,'').replace(/```/g,'').trim();
  var parsed=null;
  try{parsed=JSON.parse(raw);}catch(e1){}
  if(!parsed){
    var m=raw.match(/\{[\s\S]*\}/);
    if(m){try{parsed=JSON.parse(m[0]);}catch(e2){}}
  }
  if(parsed){
    parsed._cached=wasCached;
    return parsed;
  }
  console.error('WHAT-IF raw:',raw.substring(0,400));
  throw new Error(lang==='af'?'Antwoord kon nie verwerk word nie. Probeer weer.':'Response could not be processed. Please try again.');
}
