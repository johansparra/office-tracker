// ═══════════════════════════════════════════════════════════
// MODALES Y NAVEGACIÓN
// ═══════════════════════════════════════════════════════════
function showModal(){ document.getElementById('cid-input').value=S.cid||''; showOv('modal'); }
function hideModal(){ hideOv('modal'); }

function goMonth(delta){
  S.month+=delta;
  if(S.month<0){S.month=11;S.year--;} else if(S.month>11){S.month=0;S.year++;}
  S.showAllLog=false; render(); slideMonth(delta);
  if(hasToken()) syncAll();
}
// Deslizar el calendario a los lados cambia de mes
(()=>{
  const w=document.getElementById('weeks'); let x0=null,y0=0;
  w.addEventListener('touchstart',e=>{ if(e.touches.length!==1){ x0=null; return; } x0=e.touches[0].clientX; y0=e.touches[0].clientY; },{passive:true});
  w.addEventListener('touchend',e=>{
    if(x0===null) return; const t=e.changedTouches[0], dx=t.clientX-x0, dy=t.clientY-y0; x0=null;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5) goMonth(dx<0?1:-1);
  },{passive:true});
})();
document.getElementById('btn-prev').addEventListener('click',()=>goMonth(-1));
document.getElementById('btn-next').addEventListener('click',()=>goMonth(1));
document.getElementById('modal-cancel').addEventListener('click',hideModal);
document.getElementById('modal').addEventListener('click',e=>{ if(e.target===e.currentTarget) hideModal(); });
document.getElementById('sheet').addEventListener('click',e=>{ if(e.target===e.currentTarget) closeSheet(); });
document.getElementById('toast-undo').addEventListener('click',doUndo);
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeSheet(); hideModal(); } });
document.getElementById('modal-save').addEventListener('click',()=>{
  const cid=document.getElementById('cid-input').value.trim(); if(!cid) return;
  if(cid!==S.cid) resetConnection();   // otro proyecto de Google = otro calendario; se sube todo de nuevo
  S.cid=cid; localStorage.setItem(LS_CID,cid); hideModal();
  connect();
});

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
load();
document.getElementById('app-ver').textContent=APP_VER; document.getElementById('app-ver2').textContent=APP_VER;
document.addEventListener('DOMContentLoaded',fbInit);   // los scripts de Firebase (defer) ya cargaron
const _link=readDeepLink();
render();
whenGIS().then(()=>{ if(S.cid) initGIS(); });
if(hasToken()) syncAll();
if(_link) openNotifSheet(_link);
