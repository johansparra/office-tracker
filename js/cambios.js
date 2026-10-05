// ═══════════════════════════════════════════════════════════
// CAMBIOS + DESHACER
// ═══════════════════════════════════════════════════════════
const timers={};
function schedulePush(key,delay=UNDO_MS){
  clearTimeout(timers[key]);
  timers[key]=setTimeout(()=>{ delete timers[key]; if(online()) enqueue(async()=>{ await pushDay(key); await syncSheet(); }).then(render); },delay);
}
function flushPushes(){
  for(const k of Object.keys(timers)){ clearTimeout(timers[k]); delete timers[k]; if(online()) enqueue(()=>pushDay(k)); }
  if(hasToken()) enqueue(()=>syncSheet());
  hideUndo();
}
function applyChange(key,next,src,meta={}){
  const prev=S.data[key]||null;
  if(prev===next&&src!=='notif') return;
  if(next) S.data[key]=next; else delete S.data[key];
  logChange({d:key,from:prev,to:next,src,...meta});
  fsDay(key);   // al instante en los otros dispositivos
  S.pending[key]=true; save(); render(); popDay(key);
  schedulePush(key);
  showUndo(key,prev,next);
}
//  Día hábil:            vacío → 🏢 → 🏖️ → vacío
//  Festivo entre semana: vacío → 🏢 → vacío
//  Fin de semana:        vacío → 🏖️ → vacío
function toggle(date){
  const key=toKey(date), cur=S.data[key]||null;
  let next;
  if(isWeekend(date)) next=cur==='vacation'?null:'vacation';
  else if(getHol(date)) next=cur==='office'?null:'office';
  else next=!cur?'office':cur==='office'?'vacation':null;
  applyChange(key,next,'manual');
}

let undoState=null, undoTimer=null;
function showUndo(key,prev,next){
  undoState={key,prev};
  const t=document.getElementById('toast');
  document.getElementById('toast-txt').innerHTML=`${tico(next)}${next?TYPE_UI[next]:'Quitado'} <small>${fmtDay(key)}</small>`;
  const bar=document.getElementById('toast-bar');
  bar.style.animation='none'; void bar.offsetWidth; bar.style.animation=`drain ${UNDO_MS}ms linear forwards`;
  t.classList.add('show');
  clearTimeout(undoTimer); undoTimer=setTimeout(hideUndo,UNDO_MS);
}
function hideUndo(){ undoState=null; document.getElementById('toast').classList.remove('show'); }
function doUndo(){
  if(!undoState) return;
  const {key,prev}=undoState; hideUndo();
  const cur=S.data[key]||null;
  if(prev) S.data[key]=prev; else delete S.data[key];
  logChange({d:key,from:cur,to:prev,src:'undo'});
  fsDay(key);
  S.pending[key]=true; save(); render(); popDay(key);
  schedulePush(key,0);
}

