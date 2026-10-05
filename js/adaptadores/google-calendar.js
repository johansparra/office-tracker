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

export const listarCalendarios=()=>gcal('GET','/users/me/calendarList?minAccessRole=owner&maxResults=250');
export const crearCalendario=()=>gcal('POST','/calendars',{summary:CAL_NAME,timeZone:TZ,
  description:'Visitas a oficina y recordatorios diarios de Office Tracker (ScotiaTech).'});
export const borrarCalendario=()=>gcal('DELETE',calPath());

// Copia los días (no los avisos) de un calendario duplicado al principal y borra el duplicado.
export async function mergeCalendar(from,to){
  let pageToken='';
  do{
    const r=await gcal('GET',`/calendars/${enc(from)}/events?maxResults=250${pageToken?`&pageToken=${enc(pageToken)}`:''}`);
    for(const ev of r?.items||[]){
      if(ev.status==='cancelled'||esAviso(ev)) continue;
      const {summary,description,start,end,recurrence,transparency,extendedProperties}=ev;
      await gcal('POST',`/calendars/${enc(to)}/events`,{summary,description,start,end,recurrence,transparency,extendedProperties});
    }
    pageToken=r?.nextPageToken||'';
  }while(pageToken);
  await gcal('DELETE',`/calendars/${enc(from)}`);
}
// Borra un evento del calendario principal con otro token (limpieza única de la v2)
export const borrarDelPrincipal=(id,token)=>fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${enc(id)}`,
  {method:'DELETE',headers:{Authorization:`Bearer ${token}`}});
