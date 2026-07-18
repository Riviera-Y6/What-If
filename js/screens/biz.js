// ===== BESIGHEIDSMODEL (70% ambassadeur / 30% What-If) =====
function calcWins(){
  var slider=document.getElementById('bm-slider');
  if(!slider) return;
  var n=parseInt(slider.value)||10;
  document.getElementById('bm-sl-val').textContent=n;
  var gross=n*70;
  var platFee=n*8;
  var netto=gross-100;
  document.getElementById('bm-wins-total').textContent='$'+gross.toLocaleString();
  document.getElementById('bm-plat-fee').textContent='$'+platFee+'/mo';
  document.getElementById('bm-netto').textContent='$'+netto.toLocaleString();
}
