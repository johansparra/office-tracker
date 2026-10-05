// ═══════════════════════════════════════════════════════════
// CONEXIÓN: Google (Client ID, permisos, sesión de ~1 hora), tiempo real (Firebase) y limpieza de la v2
// ═══════════════════════════════════════════════════════════
import { S } from '../../estado/estado.js';
import { save, setToken, clearToken, hasToken, LS_CID, LS_CAL } from '../../estado/almacenamiento.js';
import { SCOPE, SCOPES, LEGACY_SCOPE, CAL_NAME } from '../../nucleo/constantes.js';
import { reportar } from '../../adaptadores/errores.js';
import { gisReady, whenGIS, crearClienteToken, permisosCompletos, revocar } from '../../adaptadores/google-auth.js';
import { borrarCalendario, borrarDelPrincipal } from '../../adaptadores/google-calendar.js';
import { olvidarHoja } from '../../adaptadores/google-sheets.js';
import { fbListo, entrarConGoogle, salir } from '../../adaptadores/firestore.js';
import { showOv, hideOv } from '../../ui/movimiento.js';
import { render } from '../../ui/render.js';
import { syncAll } from '../sincronizacion/sincronizar.js';
import { fbErr } from '../sincronizacion/tiempo-real.js';

let tokenClient=null, tokenClientCid=null, legacyClient=null;

export function initGIS(){
  if(!S.cid||!gisReady()) return false;
  if(tokenClient&&tokenClientCid===S.cid) return true;
  tokenClient=crearClienteToken({
    client_id:S.cid, scope:SCOPE, include_granted_scopes:false,
    callback:r=>{
      if(r.error){ S.lastError='Google no autorizó la conexión'; render(); return; }
      // En la pantalla de Google cada permiso es una casilla: sin todos no se puede sincronizar
      if(!permisosCompletos(r,SCOPES)){
        S.lastError='Faltan permisos: toca Reconectar y marca todas las casillas de Google Calendar';
        clearToken(); render(); return;
      }
      setToken(r.access_token,+r.expires_in||3600); S.lastError=null;
      syncAll();
    },
    error_callback:e=>{ S.lastError=e?.type==='popup_closed'?null:'No se pudo abrir el inicio de sesión de Google'; render(); }
  });
  tokenClientCid=S.cid; legacyClient=null;
  return true;
}
export async function connect(){
  if(!S.cid){ showModal(); return; }
  if(!await whenGIS()){ alert('No se pudo cargar el inicio de sesión de Google. Revisa la conexión e inténtalo de nuevo.'); return; }
  initGIS();
  tokenClient.requestAccessToken({prompt:S.lastError?.startsWith('Faltan permisos')?'consent':''});
}
// Olvida la conexión actual (Client ID, sesión y calendario). Lo marcado sigue en este dispositivo
// y se vuelve a subir completo al conectar de nuevo.
function resetConnection(){
  clearToken(); tokenClient=null; tokenClientCid=null; legacyClient=null;
  S.cid=null; S.calId=null; S.calChecked=false; S.evIds={}; S.rem={}; S.lastError=null; S.sheetId=null; S.account=null; olvidarHoja();
  Object.keys(S.data).forEach(k=>{ S.pending[k]=true; });
  try{ localStorage.removeItem(LS_CID); localStorage.removeItem(LS_CAL); }catch(e){ reportar('No se pudo olvidar el Client ID guardado',e,'warn'); }
  save();
}
export async function disconnect(){
  if(!confirm('¿Desconectar Google Calendar?\n\nSe olvida el Client ID y la sesión en este dispositivo. Tus días marcados se quedan aquí.')) return;
  if(hasToken()&&S.calId&&confirm(`¿También borrar el calendario «${CAL_NAME}» de Google?\n\nSe borran sus avisos y días marcados en Google. Si otro dispositivo lo usa, volverá a crearlo al sincronizar.`)){
    try{ await borrarCalendario(); }catch(e){ reportar('No se pudo borrar el calendario de Google',e,'warn'); }
  }
  revocar(S.token);
  resetConnection(); render();
}
// Limpieza única de los eventos que la v2 dejó en el calendario principal
export async function cleanupLegacy(){
  if(!await whenGIS()) return;
  if(!legacyClient) legacyClient=crearClienteToken({
    client_id:S.cid, scope:LEGACY_SCOPE, include_granted_scopes:false,
    callback:async r=>{
      if(r.error) return;
      S.syncing++; render();
      for(const [k,id] of Object.entries(S.legacy)){
        try{
          const res=await borrarDelPrincipal(id,r.access_token);
          if(res.ok||res.status===404||res.status===410) delete S.legacy[k];
        }catch(e){ reportar('No se pudo borrar un evento viejo (se reintenta la próxima vez)',e,'warn'); }
      }
      save(); S.syncing--; render();
    }
  });
  legacyClient.requestAccessToken({prompt:''});
}

// ── Tiempo real (Firebase) ──
export function fbSignIn(){
  if(!fbListo()){ alert('No se pudo cargar Firebase. Revisa la conexión y vuelve a abrir la app.'); return; }
  entrarConGoogle().catch(e=>{ if(e?.code!=='auth/popup-closed-by-user'&&e?.code!=='auth/cancelled-popup-request') fbErr(e); });
}
export function fbSignOut(){
  if(!confirm('¿Desactivar el tiempo real en este dispositivo?\n\nTus días se quedan aquí y en Google Calendar.')) return;
  salir();
}

// ── Ventana «Conectar Google Calendar» (Client ID) ──
export function showModal(){ document.getElementById('cid-input').value=S.cid||''; showOv('modal'); }
export function hideModal(){ hideOv('modal'); }
export function iniciarConexion(){
  document.getElementById('modal-cancel').addEventListener('click',hideModal);
  document.getElementById('modal').addEventListener('click',e=>{ if(e.target===e.currentTarget) hideModal(); });
  document.getElementById('modal-save').addEventListener('click',()=>{
    const cid=document.getElementById('cid-input').value.trim(); if(!cid) return;
    if(cid!==S.cid) resetConnection();   // otro proyecto de Google = otro calendario; se sube todo de nuevo
    S.cid=cid; localStorage.setItem(LS_CID,cid); hideModal();
    connect();
  });
}
