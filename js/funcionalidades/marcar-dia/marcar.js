// ═══════════════════════════════════════════════════════════
// MARCAR UN DÍA Y DESHACER (RN-11, RN-12)
// Todo cambio de un día pasa por applyChange(): historial, Firestore, cola de subida y pantalla.
// ═══════════════════════════════════════════════════════════
import { S } from '../../estado/estado.js';
import { save, online, hasToken } from '../../estado/almacenamiento.js';
import { UNDO_MS, TYPE_UI } from '../../nucleo/constantes.js';
import { toKey, fmtDay, esClave } from '../../nucleo/fechas.js';
import { siguienteEstado, tipoValido } from '../../nucleo/marcado.js';
import { reportar } from '../../adaptadores/errores.js';
import { tico } from '../../ui/iconos.js';
import { popDay } from '../../ui/movimiento.js';
import { render } from '../../ui/render.js';
import { logChange, syncSheet } from '../historial/registro.js';
import { fsDay } from '../sincronizacion/tiempo-real.js';
import { pushDay } from '../sincronizacion/reconciliar.js';
import { enqueue } from '../sincronizacion/sincronizar.js';

// Días en la ventana de «Deshacer»: todavía no se suben
export const timers={};
function schedulePush(key,delay=UNDO_MS){
  clearTimeout(timers[key]);
  timers[key]=setTimeout(()=>{ delete timers[key]; if(online()) enqueue(async()=>{ await pushDay(key); await syncSheet(); }).then(render); },delay);
}
// Al salir de la app se sube todo de inmediato
export function flushPushes(){
  for(const k of Object.keys(timers)){ clearTimeout(timers[k]); delete timers[k]; if(online()) enqueue(()=>pushDay(k)); }
  if(hasToken()) enqueue(()=>syncSheet());
  hideUndo();
}
export function applyChange(key,next,src,meta={}){
  if(!esClave(key)||!tipoValido(next)){ reportar('Cambio inválido rechazado',new Error(`${key} → ${next} (${src})`)); return; }
  const prev=S.data[key]||null;
  if(prev===next&&src!=='notif') return;
  if(next) S.data[key]=next; else delete S.data[key];
  logChange({d:key,from:prev,to:next,src,...meta});
  fsDay(key);   // al instante en los otros dispositivos
  S.pending[key]=true; save(); render(); popDay(key);
  schedulePush(key);
  showUndo(key,prev,next);
}
export function toggle(date){
  const key=toKey(date);
  applyChange(key,siguienteEstado(date,S.data[key]||null),'manual');
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
export function iniciarMarcado(){
  document.getElementById('toast-undo').addEventListener('click',doUndo);
}
