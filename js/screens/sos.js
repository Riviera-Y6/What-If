// VERTROUENSKRING
var circle=JSON.parse(localStorage.getItem('wi_circle')||'[]');

function renderCircle(){
  var L=t().sos;
  var list=document.getElementById('circle-list');
  var fullNote=document.getElementById('circle-full-note');
  if(circle.length===0){
    list.innerHTML='<div class="circle-empty">'+L.circleEmpty+'</div>';
  } else {
    list.innerHTML=circle.map(function(c,i){
      return '<div class="circle-item"><div><div class="circle-name">'+escapeHtml(c.name)+'</div>'+
        '<div class="circle-phone">'+escapeHtml(c.phone)+'</div></div>'+
        '<button class="circle-remove" onclick="removeCircleContact('+i+')">&times;</button></div>';
    }).join('');
  }
  fullNote.style.display = circle.length>=5 ? 'block':'none';
  document.getElementById('circle-name').disabled = circle.length>=5;
  document.getElementById('circle-phone').disabled = circle.length>=5;
}

function addCircleContact(){
  if(circle.length>=5) return;
  var name=document.getElementById('circle-name').value.trim();
  var phone=document.getElementById('circle-phone').value.trim();
  if(!name || !phone) return;
  circle.push({name:name,phone:phone});
  localStorage.setItem('wi_circle',JSON.stringify(circle));
  document.getElementById('circle-name').value='';
  document.getElementById('circle-phone').value='';
  renderCircle();
}

function removeCircleContact(i){
  circle.splice(i,1);
  localStorage.setItem('wi_circle',JSON.stringify(circle));
  renderCircle();
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

// NOODKNOPPIE
function triggerEmergency(){
  var L=t().sos;
  var statusEl=document.getElementById('sos-status');
  var sendList=document.getElementById('sos-send-list');
  sendList.innerHTML='';
  if(circle.length===0){
    statusEl.textContent=L.noContacts;
    return;
  }
  statusEl.textContent=L.locating;
  if(!navigator.geolocation){
    buildAndShowSendLinks(null);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function(pos){
      buildAndShowSendLinks({lat:pos.coords.latitude,lng:pos.coords.longitude});
    },
    function(){
      buildAndShowSendLinks(null);
    },
    {enableHighAccuracy:true,timeout:8000,maximumAge:0}
  );
}

function buildEmergencyMessage(coords){
  var L=t().sos;
  var name=userName || (lang==='af'?'Iemand':'Someone');
  var med=JSON.parse(localStorage.getItem('wi_medical')||'{}');
  var parts=[];
  parts.push(L.msgIntro.replace('{name}',name));
  if(coords){
    parts.push('https://maps.google.com/?q='+coords.lat+','+coords.lng);
  } else {
    parts.push(L.noLocation);
  }
  var medBits=[];
  if(med.blood) medBits.push(L.medBlood+': '+med.blood);
  if(med.allergy) medBits.push(L.medAllergy+': '+med.allergy);
  if(med.meds) medBits.push(L.medMeds+': '+med.meds);
  if(medBits.length) parts.push(medBits.join(' | '));
  return parts.join('\n');
}

function waNumber(phone){
  // WhatsApp se wa.me skakel vereis internasionale formaat (geen +, spasies of voorloop-0)
  var digits = String(phone).replace(/[^0-9]/g,'');
  if(digits.charAt(0)==='0' && digits.length===10){
    digits = '27' + digits.substring(1); // SA plaaslike formaat -> internasionaal
  }
  return digits;
}

function buildAndShowSendLinks(coords){
  var L=t().sos;
  var statusEl=document.getElementById('sos-status');
  var sendList=document.getElementById('sos-send-list');
  var message=buildEmergencyMessage(coords);
  statusEl.textContent=coords ? L.ready : L.readyNoLoc;
  sendList.innerHTML=circle.map(function(c){
    var waHref='https://wa.me/'+waNumber(c.phone)+'?text='+encodeURIComponent(message);
    var smsHref='sms:'+encodeURIComponent(c.phone)+'?body='+encodeURIComponent(message);
    return '<div class="sos-send-item"><span class="sos-send-name">'+escapeHtml(c.name)+'</span>'+
      '<span class="sos-send-btns">'+
      '<a class="sos-send-btn wa" href="'+waHref+'" target="_blank" rel="noopener">'+L.sendWaBtn+'</a>'+
      '<a class="sos-send-btn sms" href="'+smsHref+'">'+L.sendBtn+'</a>'+
      '</span></div>';
  }).join('');
  if(navigator.share){
    sendList.innerHTML += '<div class="sos-send-item"><span class="sos-send-name">'+L.shareOther+'</span>'+
      '<button class="sos-send-btn" onclick="shareEmergency()">'+L.shareBtn+'</button></div>';
  }
  window._wiEmergencyMsg=message;
}

function shareEmergency(){
  if(navigator.share && window._wiEmergencyMsg){
    navigator.share({text:window._wiEmergencyMsg}).catch(function(){});
  }
}
