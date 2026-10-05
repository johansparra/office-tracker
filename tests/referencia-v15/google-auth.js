// ═══════════════════════════════════════════════════════════
// GOOGLE AUTH (GIS token client)
// ═══════════════════════════════════════════════════════════
let tokenClient=null, tokenClientCid=null, legacyClient=null;

function gisReady(){ return !!window.google?.accounts?.oauth2; }
function whenGIS(){
  if(gisReady()) return Promise.resolve(true);
  return new Promise(res=>{ let n=0; const t=setInterval(()=>{ if(gisReady()||++n>50){ clearInterval(t); res(gisReady()); } },100); });
}
function initGIS(){
  if(!S.cid||!gisReady()) return false;
  if(tokenClient&&tokenClientCid===S.cid) return true;
  tokenClient=google.accounts.oauth2.initTokenClient({
    client_id:S.cid, scope:SCOPE, include_granted_scopes:false,
    callback:r=>{
      if(r.error){ S.lastError='Google no autorizó la conexión'; render(); return; }
      // En la pantalla de Google cada permiso es una casilla: sin los dos no se puede sincronizar
      if(!google.accounts.oauth2.hasGrantedAllScopes(r,...SCOPES)){
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
async function connect(){
  if(!S.cid){ showModal(); return; }
  if(!await whenGIS()){ alert('No se pudo cargar el inicio de sesión de Google. Revisa la conexión e inténtalo de nuevo.'); return; }
  initGIS();
  tokenClient.requestAccessToken({prompt:S.lastError?.startsWith('Faltan permisos')?'consent':''});
}
// Olvida la conexión actual (Client ID, sesión y calendario). Lo marcado sigue en este dispositivo
// y se vuelve a subir completo al conectar de nuevo.
function resetConnection(){
  clearToken(); tokenClient=null; tokenClientCid=null; legacyClient=null;
  S.cid=null; S.calId=null; S.calChecked=false; S.evIds={}; S.rem={}; S.lastError=null; S.sheetId=null; S.account=null; sheetReady=false; sheetRead=0;
  Object.keys(S.data).forEach(k=>{ S.pending[k]=true; });
  try{ localStorage.removeItem(LS_CID); localStorage.removeItem(LS_CAL); }catch(_){}
  save();
}
async function disconnect(){
  if(!confirm('¿Desconectar Google Calendar?\n\nSe olvida el Client ID y la sesión en este dispositivo. Tus días marcados se quedan aquí.')) return;
  if(hasToken()&&S.calId&&confirm(`¿También borrar el calendario «${CAL_NAME}» de Google?\n\nSe borran sus avisos y días marcados en Google. Si otro dispositivo lo usa, volverá a crearlo al sincronizar.`)){
    try{ await gcal('DELETE',calPath()); }catch(_){}
  }
  const tok=S.token;
  if(tok&&gisReady()) try{ google.accounts.oauth2.revoke(tok,()=>{}); }catch(_){}
  resetConnection(); render();
}

