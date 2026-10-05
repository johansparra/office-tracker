// ═══════════════════════════════════════════════════════════
// NAVEGACIÓN: cambiar de mes (botones y deslizar), cerrar hojas con Escape o tocando afuera
// ═══════════════════════════════════════════════════════════
import { S } from '../../estado/estado.js';
import { hasToken } from '../../estado/almacenamiento.js';
import { slideMonth, closeSheet } from '../../ui/movimiento.js';
import { render } from '../../ui/render.js';
import { hideModal } from '../conexion/sesion.js';
import { syncAll } from '../sincronizacion/sincronizar.js';

export function goMonth(delta){
  S.month+=delta;
  if(S.month<0){S.month=11;S.year--;} else if(S.month>11){S.month=0;S.year++;}
  S.showAllLog=false; render(); slideMonth(delta);
  if(hasToken()) syncAll();
}
export function iniciarNavegacion(){
  // Deslizar el calendario a los lados cambia de mes
  const w=document.getElementById('weeks'); let x0=null,y0=0;
  w.addEventListener('touchstart',e=>{ if(e.touches.length!==1){ x0=null; return; } x0=e.touches[0].clientX; y0=e.touches[0].clientY; },{passive:true});
  w.addEventListener('touchend',e=>{
    if(x0===null) return; const t=e.changedTouches[0], dx=t.clientX-x0, dy=t.clientY-y0; x0=null;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5) goMonth(dx<0?1:-1);
  },{passive:true});
  document.getElementById('btn-prev').addEventListener('click',()=>goMonth(-1));
  document.getElementById('btn-next').addEventListener('click',()=>goMonth(1));
  document.getElementById('sheet').addEventListener('click',e=>{ if(e.target===e.currentTarget) closeSheet(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeSheet(); hideModal(); } });
}
