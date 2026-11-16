// ═══════════════════════════════════════════════════════════
// NAVEGACIÓN: cambiar de mes (botones, «Volver a hoy» y deslizar), cerrar hojas con Escape o tocando afuera
// ═══════════════════════════════════════════════════════════
import { S, now } from '../../estado/estado.js';
import { hasToken } from '../../estado/almacenamiento.js';
import { slideMonth, closeSheet } from '../../ui/movimiento.js';
import { render } from '../../ui/render.js';
import { hideModal } from '../conexion/sesion.js';
import { syncAll } from '../sincronizacion/sincronizar.js';

export function goMonth(delta){
  const t=S.year*12+S.month+delta; S.year=Math.floor(t/12); S.month=t-S.year*12;
  S.showAllLog=false; render(); slideMonth(Math.sign(delta));
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
  document.getElementById('btn-hoy').addEventListener('click',()=>goMonth((now.getFullYear()-S.year)*12+now.getMonth()-S.month));
  document.getElementById('sheet').addEventListener('click',e=>{ if(e.target===e.currentTarget) closeSheet(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeSheet(); hideModal(); } });
}
