// ═══════════════════════════════════════════════════════════
// GOOGLE IDENTITY SERVICES (inicio de sesión OAuth): solo habla con la librería de Google
// ═══════════════════════════════════════════════════════════
import { reportar } from './errores.js';

export function gisReady(){ return !!window.google?.accounts?.oauth2; }
// La librería carga con async: se espera hasta 5 s
export function whenGIS(){
  if(gisReady()) return Promise.resolve(true);
  return new Promise(res=>{ let n=0; const t=setInterval(()=>{ if(gisReady()||++n>50){ clearInterval(t); res(gisReady()); } },100); });
}
export const crearClienteToken=cfg=>google.accounts.oauth2.initTokenClient(cfg);
export const permisosCompletos=(r,scopes)=>google.accounts.oauth2.hasGrantedAllScopes(r,...scopes);
export function revocar(tok){
  if(tok&&gisReady()) try{ google.accounts.oauth2.revoke(tok,()=>{}); }catch(e){ reportar('No se pudo revocar la sesión de Google',e,'warn'); }
}
