// ═══════════════════════════════════════════════════════════
// HISTORIAL: registrar cada cambio (RN-26), subirlo a la hoja (RN-27), compartirlo entre dispositivos
// y ocultar registros sin borrarlos de la hoja (RN-28)
// ═══════════════════════════════════════════════════════════
import { S } from '../../estado/estado.js';
import { save, hasToken } from '../../estado/almacenamiento.js';
import { isoTs } from '../../nucleo/fechas.js';
import { rid } from '../../adaptadores/aleatorio.js';
import { ensureSheet, hojaPerdida, logRow, parseRow, agregarHistorial, agregarOcultos, leerNuevas } from '../../adaptadores/google-sheets.js';
import { render } from '../../ui/render.js';
import { fsLog, fsHide } from '../sincronizacion/tiempo-real.js';
import { enqueue } from '../sincronizacion/sincronizar.js';

const MAX_LOG=1000;   // RN-30
const recortar=()=>{ if(S.log.length>MAX_LOG) S.log.splice(0,S.log.length-MAX_LOG); };

// Cada cambio queda con origen, hora, dispositivo y un id único
export function logChange(e){
  const entry={id:rid(4),ts:Date.now(),dev:S.dev,from:null,to:null,...e};
  S.log.push(entry);
  fsLog(entry);
  recortar();
  return entry;
}

// RN-27: agrega a la hoja todo registro que aún no llegó (incluidos los ya borrados en la app)
export async function syncSheet(retry=true){
  await ensureSheet();   // aunque no haya nada nuevo: así la hoja queda creada y con títulos desde la primera sincronización
  const rows=[...S.logOut,...S.log.filter(e=>!e.up)].sort((a,b)=>a.ts-b.ts);
  if(!rows.length) return;
  const now=Date.now();
  const r=await agregarHistorial(rows.map(e=>logRow(e,now)));
  if(r?.notFound){ S.sheetId=null; hojaPerdida(); save(); if(retry) await syncSheet(false); return; }   // borraste la hoja → se crea otra
  rows.forEach(e=>{ e.up=true; });
  S.logOut=S.logOut.filter(e=>!rows.includes(e)); save();
}
export async function pushHidden(){
  if(!S.hideOut.length) return;
  const hs=S.hideOut.slice();
  await agregarOcultos(hs.map(h=>[h.id,isoTs(h.ts),S.dev]));
  S.hideOut=S.hideOut.filter(h=>!hs.includes(h)); save();
}
// Historial compartido sin Firebase: se leen de la hoja los registros de todos los dispositivos
export async function pullSheet(){
  await ensureSheet();
  const r=await leerNuevas();
  if(r?.notFound){ S.sheetId=null; hojaPerdida(); save(); return; }
  for(const [id] of r.hid) if(id) S.hidden[id]=1;
  const have=new Set(S.log.map(e=>e.id));
  for(const row of r.rows){
    const e=parseRow(row);
    if(e&&!have.has(e.id)&&!S.hidden[e.id]){ S.log.push(e); have.add(e.id); }
  }
  S.log=S.log.filter(e=>!S.hidden[e.id]).sort((a,b)=>a.ts-b.ts);
  recortar();
  save();
}
// RN-28: borra registros del historial de la app. Los que aún no llegaron a la hoja se guardan aparte
// para subirlos igual: lo borrado en la app sigue registrado en la hoja. Se oculta en todos los dispositivos.
export function deleteLog(ids){
  const del=new Set(ids);
  for(const e of S.log) if(del.has(e.id)&&!e.up) S.logOut.push(e);
  for(const id of del){ S.hidden[id]=1; S.hideOut.push({id,ts:Date.now()}); }
  fsHide([...del]);
  S.log=S.log.filter(e=>!del.has(e.id));
  save(); render();
  if(hasToken()) enqueue(async()=>{ await syncSheet(); await pushHidden(); }).then(render);
}
