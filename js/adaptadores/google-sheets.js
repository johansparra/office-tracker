// ═══════════════════════════════════════════════════════════
// GOOGLE SHEETS Y DRIVE: la hoja «Office Tracker · Historial» (RN-27)
// Se busca por nombre en Drive (drive.file solo ve archivos de esta app), así todos los dispositivos usan la misma.
// ═══════════════════════════════════════════════════════════
import { S } from '../estado/estado.js';
import { save } from '../estado/almacenamiento.js';
import { TZ, SHEET_NAME, SHEET_TAB, HIDE_TAB, FOLDER_NAME, SLOTS, slotOf, TYPE_UI, DOW_L, APP_VER } from '../nucleo/constantes.js';
import { fromKey, isoTs, fmtFull, isoWeek } from '../nucleo/fechas.js';
import { getHol } from '../nucleo/festivos.js';
import { srcBadge, srcText } from '../nucleo/registro.js';
import { gcal } from './google-api.js';

const enc=encodeURIComponent;
export const SHEETS='https://sheets.googleapis.com/v4/spreadsheets', DRIVE='https://www.googleapis.com/drive/v3/files';
export const sheetUrl=()=>`https://docs.google.com/spreadsheets/d/${S.sheetId}/edit`;

let sheetReady=false;   // la hoja ya se revisó en esta sesión
let sheetRead=0;        // filas del Historial ya leídas en esta sesión (después se lee solo lo nuevo)
export function olvidarHoja(){ sheetReady=false; sheetRead=0; }
export function hojaPerdida(){ sheetReady=false; }

export async function ensureFolder(){
  const q=`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const r=await gcal('GET',`${DRIVE}?q=${enc(q)}&orderBy=createdTime&fields=files(id)`);
  if(r?.files?.[0]) return r.files[0].id;
  return (await gcal('POST',`${DRIVE}?fields=id`,{name:FOLDER_NAME,mimeType:'application/vnd.google-apps.folder',parents:['root']})).id;
}
export async function ensureSheet(){
  if(S.sheetId&&sheetReady) return;
  if(!S.sheetId){
    const q=`name='${SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
    const r=await gcal('GET',`${DRIVE}?q=${enc(q)}&orderBy=createdTime&fields=files(id)`);
    S.sheetId=r?.files?.[0]?.id||null;
    // Se crea dentro de la carpeta «office-tracker» en la raíz de Mi unidad
    if(!S.sheetId) S.sheetId=(await gcal('POST',`${DRIVE}?fields=id`,
      {name:SHEET_NAME,mimeType:'application/vnd.google-apps.spreadsheet',parents:[await ensureFolder()]})).id;
    save();
  }
  await setupSheet();
  sheetReady=true;
}
// Deja la hoja lista: pestaña «Historial», títulos, fila fija, filtro y zona horaria.
// Se revisa una vez por sesión, así una configuración a medias (o una pestaña renombrada) se repara sola.
async function setupSheet(){
  const m=await gcal('GET',`${SHEETS}/${enc(S.sheetId)}?fields=sheets.properties(sheetId,title)`);
  if(m?.notFound){ S.sheetId=null; save(); return ensureSheet(); }   // la borraste → se crea otra
  const tabs=(m?.sheets||[]).map(s=>s.properties);
  const reqs=[{updateSpreadsheetProperties:{properties:{timeZone:TZ},fields:'timeZone'}}];
  sheetRead=0;
  let tabId=tabs.find(t=>t.title===SHEET_TAB)?.sheetId;
  if(tabId===undefined&&tabs.length===1&&tabs[0].title!==HIDE_TAB) tabId=tabs[0].sheetId;   // la pestaña por defecto («Hoja 1») se renombra
  if(!tabs.some(t=>t.title===HIDE_TAB)) reqs.push({addSheet:{properties:{title:HIDE_TAB,gridProperties:{frozenRowCount:1}}}});
  if(tabId===undefined){ tabId=Math.floor(Math.random()*1e9); reqs.push({addSheet:{properties:{sheetId:tabId,title:SHEET_TAB}}}); }
  reqs.push(
    {updateSheetProperties:{properties:{sheetId:tabId,title:SHEET_TAB,gridProperties:{frozenRowCount:1}},fields:'title,gridProperties.frozenRowCount'}},
    {repeatCell:{range:{sheetId:tabId,startRowIndex:0,endRowIndex:1},
      cell:{userEnteredFormat:{textFormat:{bold:true},backgroundColor:{red:.91,green:.93,blue:.97}}},fields:'userEnteredFormat(textFormat,backgroundColor)'}},
    {setBasicFilter:{filter:{range:{sheetId:tabId}}}});
  await gcal('POST',`${SHEETS}/${enc(S.sheetId)}:batchUpdate`,{requests:reqs});
  await gcal('PUT',`${SHEETS}/${enc(S.sheetId)}/values/${enc(`'${SHEET_TAB}'!A1:${LOG_LAST}1`)}?valueInputOption=RAW`,{values:[LOG_COLS]});   // A1:W1
  await gcal('PUT',`${SHEETS}/${enc(S.sheetId)}/values/${enc(`'${HIDE_TAB}'!A1:C1`)}?valueInputOption=RAW`,{values:[['ID evento','Ocultado (ISO 8601)','ID dispositivo']]});
}

// ── Formato de log de auditoría (una fila por evento) ──
// Columnas nuevas solo al final: la app lee las filas por posición y la última es el registro en JSON
export const LOG_COLS=['Timestamp (ISO 8601)','Fecha y hora local','ID evento','Nivel','Acción','Origen','Día afectado','Día de la semana',
  'Semana ISO','Festivo','Estado anterior','Estado nuevo','Aviso','Verificación del aviso','Referencia (código)','Detalle',
  'ID dispositivo','Dispositivo','Cuenta Google','Versión app','Zona horaria','Subido a la hoja','Datos (JSON)'];
export const LOG_LAST=String.fromCharCode(64+LOG_COLS.length);   // W
export function devInfo(){
  const ua=navigator.userAgent;
  const os=/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iOS':/Windows/.test(ua)?'Windows':/Mac OS/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'Otro';
  const br=/Edg\//.test(ua)?'Edge':/OPR\//.test(ua)?'Opera':/Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'Otro';
  return `${os} · ${br} · ${matchMedia('(display-mode: standalone)').matches?'app instalada':'navegador'}`;
}
export function logRow(e,upTs){
  const act=e.src==='notif'&&e.from===e.to?'CONFIRMAR':!e.from?'MARCAR':!e.to?'DESMARCAR':'CAMBIAR';
  const ver=e.src!=='notif'?'—':e.ok==='ok'?'Verificado':e.ok==='bad'?'No coincide':'Sin verificar';
  return [isoTs(e.ts),fmtFull(e.ts),e.id,e.ok==='bad'?'WARN':'INFO',act,srcBadge(e)[1],e.d,DOW_L[fromKey(e.d).getDay()],
    isoWeek(e.d),getHol(fromKey(e.d))||'—',TYPE_UI[e.from],TYPE_UI[e.to],e.slot?slotOf(e.slot)?.label||e.slot:'—',ver,
    e.ref||'—',srcText(e),e.dev,e.dev===S.dev?devInfo():'—',S.account||'—',APP_VER,Intl.DateTimeFormat().resolvedOptions().timeZone,isoTs(upTs),
    JSON.stringify({id:e.id,ts:e.ts,d:e.d,from:e.from??null,to:e.to??null,src:e.src,dev:e.dev,slot:e.slot,ok:e.ok,ref:e.ref,note:e.note})];
}
// Fila de la hoja → registro. Filas viejas sin la columna JSON se reconstruyen desde las columnas legibles.
const UI_TYPE={'Oficina':'office','Día libre':'vacation'};
export function parseRow(r){
  try{ if(r[22]) return {...JSON.parse(r[22]),up:true}; }catch(_){ /* JSON dañado: se intenta con las columnas legibles */ }
  const ts=Date.parse(r[0]), id=r[2], d=r[6];
  if(!id||!/^\d{4}-\d{2}-\d{2}$/.test(d||'')||isNaN(ts)) return null;
  const o=r[5]||'', src=o==='Calendar'?'calendar':o==='Deshecho'?'undo':o.startsWith('Aviso')?'notif':'manual';
  const e={id,ts,d,from:UI_TYPE[r[10]]||null,to:UI_TYPE[r[11]]||null,src,dev:r[16]||'?',up:true};
  if(src==='notif'){
    e.ok=r[13]==='Verificado'?'ok':r[13]==='No coincide'?'bad':'unknown';
    e.slot=SLOTS.find(sl=>sl.label===r[12])?.id;
    if(r[14]&&r[14]!=='—') e.ref=r[14];
    if(/Hoy no fui/.test(r[15]||'')) e.note='Hoy no fui';
  }
  return e;
}

export const agregarHistorial=rows=>gcal('POST',`${SHEETS}/${enc(S.sheetId)}/values/${enc(`'${SHEET_TAB}'!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,{values:rows});
export const agregarOcultos=rows=>gcal('POST',`${SHEETS}/${enc(S.sheetId)}/values/${enc(`'${HIDE_TAB}'!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,{values:rows});
// Filas nuevas del Historial (desde la última leída) y los ids ocultos
export async function leerNuevas(){
  const r=await gcal('GET',`${SHEETS}/${enc(S.sheetId)}/values:batchGet?ranges=${enc(`'${SHEET_TAB}'!A${sheetRead+2}:${LOG_LAST}`)}&ranges=${enc(`'${HIDE_TAB}'!A2:A`)}`);
  if(r?.notFound) return r;
  const rows=r?.valueRanges?.[0]?.values||[], hid=r?.valueRanges?.[1]?.values||[];
  sheetRead+=rows.length;
  return {rows,hid};
}
export const fechaModificacion=()=>gcal('GET',`${DRIVE}/${enc(S.sheetId)}?fields=modifiedTime`);
