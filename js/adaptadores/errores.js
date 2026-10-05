// ═══════════════════════════════════════════════════════════
// REGISTRO DE ERRORES: ningún error se pierde en silencio.
// Se escriben en la consola con el lugar donde pasaron y se guardan los últimos 50
// (en la consola del navegador: officeTrackerErrores()).
// ═══════════════════════════════════════════════════════════
const recientes=[];

export function reportar(donde,e,nivel='error'){
  recientes.push({ts:Date.now(),donde,mensaje:e?.message||String(e),nivel});
  if(recientes.length>50) recientes.shift();
  try{ console[nivel](`[office-tracker] ${donde}:`,e); }catch(_){ /* sin consola: no hay dónde más avisar */ }
}
export const erroresRecientes=()=>recientes.slice();

// Ejecuta fn y, si falla, lo reporta sin tumbar lo demás (por ejemplo, una tarjeta que no se pudo dibujar)
export function seguro(donde,fn){
  try{ return fn(); }catch(e){ reportar(donde,e); }
}
// Errores que nadie atrapó: en un evento, un temporizador o una promesa
export function instalarCapturaGlobal(){
  addEventListener('error',ev=>reportar('Error no controlado',ev.error||ev.message));
  addEventListener('unhandledrejection',ev=>reportar('Promesa rechazada sin manejar',ev.reason));
  window.officeTrackerErrores=erroresRecientes;
}
