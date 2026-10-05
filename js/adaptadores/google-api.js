// ═══════════════════════════════════════════════════════════
// LLAMADAS A GOOGLE: un solo punto de salida (Calendar, y Sheets/Drive con la URL completa)
// Traduce los errores de Google a mensajes que se entienden.
// ═══════════════════════════════════════════════════════════
import { S } from '../estado/estado.js';
import { hasToken, clearToken } from '../estado/almacenamiento.js';

export class AuthError extends Error{}

export async function gcal(method,path,body){
  if(!hasToken()) throw new AuthError('sin token');
  const url=path.startsWith('https://')?path:`https://www.googleapis.com/calendar/v3${path}`;   // Sheets/Drive pasan la URL completa
  const r=await fetch(url,{
    method,
    headers:{'Authorization':`Bearer ${S.token}`,'Content-Type':'application/json'},
    body:body?JSON.stringify(body):undefined
  });
  if(r.status===401){ clearToken(); throw new AuthError('token vencido'); }
  if(r.status===404||r.status===410) return {notFound:true};
  if(r.status===204) return {};
  if(!r.ok){
    // Se muestra el motivo real que da Google, no solo el código
    let j=null; try{ j=await r.json(); }catch(_){ /* respuesta sin JSON: se usa solo el código */ }
    const reason=j?.error?.errors?.[0]?.reason||j?.error?.details?.find(d=>d.reason)?.reason||'', gm=j?.error?.message||'';
    const api=gm.match(/Google [A-Za-z ]+? API/)?.[0]||'Google Calendar API';
    const msg=reason==='accessNotConfigured'||reason==='SERVICE_DISABLED'||/has not been used|is disabled/i.test(gm)
        ?`La ${api} no está activada en tu proyecto de Google Cloud (APIs y servicios → Biblioteca → ${api} → Habilitar)`
      :reason==='insufficientPermissions'||reason==='ACCESS_TOKEN_SCOPE_INSUFFICIENT'||/insufficient.*scope/i.test(gm)
        ?'Faltan permisos: toca Reconectar y marca todas las casillas de Google Calendar'
      :`Google respondió ${r.status}${gm?`: ${gm}`:''}`;
    console.error('[gcal]',method,path,r.status,j);
    throw Object.assign(new Error(msg),{status:r.status,reason});
  }
  return r.json();
}
