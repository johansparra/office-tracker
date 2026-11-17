// ═══════════════════════════════════════════════════════════
// GOOGLE CALENDAR: calendarios y eventos (sin reglas de negocio)
// ═══════════════════════════════════════════════════════════
import { S } from '../estado/estado.js';
import { CAL_NAME, TZ } from '../nucleo/constantes.js';
import { esAviso } from '../nucleo/conflictos.js';
import { gcal } from './google-api.js';

const enc=encodeURIComponent;
export const calPath=()=>`/calendars/${enc(S.calId)}`;

export async function listEvents(params){
  const qs=Object.entries({singleEvents:'true',maxResults:'250',...params}).map(([k,v])=>`${k}=${enc(v)}`).join('&');
  const items=[]; let pageToken='';
  do{
    const r=await gcal('GET',`${calPath()}/events?${qs}${pageToken?`&pageToken=${enc(pageToken)}`:''}`);
    items.push(...(r?.items||[])); pageToken=r?.nextPageToken||'';
  }while(pageToken);
  return items;
}
export async function delEvent(id){ await gcal('DELETE',`${calPath()}/events/${enc(id)}`); }
export const crearEvento=body=>gcal('POST',`${calPath()}/events`,body);
export const actualizarEvento=(id,body)=>gcal('PATCH',`${calPath()}/events/${enc(id)}`,body);
export const buscarPorNonce=n=>gcal('GET',`${calPath()}/events?privateExtendedProperty=${enc('nonce='+n)}&showDeleted=true&maxResults=5`);
// Detección liviana: solo la hora de modificación de los eventos cambiados desde `cursor` (incluye borrados)
export const cambiosDesde=cursor=>gcal('GET',`${calPath()}/events?updatedMin=${enc(cursor)}&showDeleted=true&maxResults=50&fields=${enc('items(updated)')}`);

// Todas las páginas: un «Office Tracker» en la página 2 no debe pasar por inexistente (se crearía otro)
export async function listarCalendarios(){
  const items=[]; let pageToken='', n=0;
  do{
    const r=await gcal('GET',`/users/me/calendarList?minAccessRole=owner&maxResults=250${pageToken?`&pageToken=${enc(pageToken)}`:''}`);
    items.push(...(r?.items||[])); pageToken=r?.nextPageToken||'';
  }while(pageToken&&++n<20);   // tope por si una respuesta repite la página
  return {items};
}
export const crearCalendario=()=>gcal('POST','/calendars',{summary:CAL_NAME,timeZone:TZ,
  description:'Visitas a oficina y recordatorios diarios de Office Tracker (ScotiaTech).'});
export const borrarCalendario=()=>gcal('DELETE',calPath());

// Copia los días (no los avisos) de un calendario duplicado al principal y borra el duplicado.
// Si no se pudo leer el duplicado o falló una copia, NO se borra (se reintenta en otra sincronización).
export async function mergeCalendar(from,to){
  let pageToken='';
  do{
    const r=await gcal('GET',`/calendars/${enc(from)}/events?maxResults=250${pageToken?`&pageToken=${enc(pageToken)}`:''}`);
    if(r?.notFound) return false;
    for(const ev of r?.items||[]){
      if(ev.status==='cancelled'||esAviso(ev)) continue;
      const {summary,description,start,end,recurrence,transparency,extendedProperties}=ev;
      const c=await gcal('POST',`/calendars/${enc(to)}/events`,{summary,description,start,end,recurrence,transparency,extendedProperties});
      if(c?.notFound) return false;
    }
    pageToken=r?.nextPageToken||'';
  }while(pageToken);
  await gcal('DELETE',`/calendars/${enc(from)}`);
  return true;
}
// Borra un evento del calendario principal con otro token (limpieza única de la v2)
export const borrarDelPrincipal=(id,token)=>fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${enc(id)}`,
  {method:'DELETE',headers:{Authorization:`Bearer ${token}`}});
