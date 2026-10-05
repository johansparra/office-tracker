// ═══════════════════════════════════════════════════════════
// GUARDAR Y LEER EN EL DISPOSITIVO (localStorage, esquema v:3) y sesión de Google (RN-13)
// ═══════════════════════════════════════════════════════════
import { S } from './estado.js';
import { SCOPE, TIPOS } from '../nucleo/constantes.js';
import { esClave } from '../nucleo/fechas.js';
import { entradaValida } from '../nucleo/registro.js';
import { rid } from '../adaptadores/aleatorio.js';
import { reportar } from '../adaptadores/errores.js';

export const LS_DATA='ot-data-v2', LS_CID='ot-gcal-cid', LS_TOK='ot-gcal-token', LS_CAL='ot-cal-id', LS_DEV='ot-dev';
export const LS_DANADO='ot-data-v2-danado';   // copia de datos que no se pudieron leer, para no perderlos al guardar encima

export function save(){
  try{ localStorage.setItem(LS_DATA,JSON.stringify({v:3,data:S.data,evIds:S.evIds,pending:S.pending,log:S.log,
    rem:S.rem,nonces:S.nonces,skip:S.skip,legacy:S.legacy,logOut:S.logOut,sheetId:S.sheetId,account:S.account,hidden:S.hidden,hideOut:S.hideOut})); }
  catch(e){ reportar('No se pudo guardar en el dispositivo',e); }
}

// Validación de lo leído: datos dañados o editados a mano no deben romper la app
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
const arr=x=>Array.isArray(x)?x:[];
function limpiarDias(d){
  const r={};
  for(const [k,v] of Object.entries(obj(d))) if(esClave(k)&&TIPOS.includes(v)) r[k]=v; else reportar('Día descartado al leer',new Error(`${k} = ${JSON.stringify(v)}`),'warn');
  return r;
}
const limpiarLog=l=>arr(l).filter(e=>entradaValida(e)||(reportar('Registro descartado al leer',new Error(JSON.stringify(e)),'warn'),false));

export function load(){
  let raw=null;
  try{
    raw=localStorage.getItem(LS_DATA);
    const p=JSON.parse(raw||'null');
    if(p&&typeof p==='object'){
      S.data=limpiarDias(p.data);
      if(p.v===3){
        Object.assign(S,{evIds:obj(p.evIds),pending:obj(p.pending),log:limpiarLog(p.log),rem:obj(p.rem),
          nonces:obj(p.nonces),skip:obj(p.skip),legacy:obj(p.legacy),logOut:limpiarLog(p.logOut),sheetId:p.sheetId||null,account:p.account||null,
          hidden:obj(p.hidden),hideOut:arr(p.hideOut).filter(h=>h&&typeof h.id==='string')});
      }else{
        // Migración desde v1/v2: los eventos viejos están en el calendario principal.
        // Se guardan aparte para poder borrarlos, y todo lo local se sube al calendario nuevo.
        S.legacy=obj(p.evIds); S.evIds={};
        Object.keys(S.data).forEach(k=>{ S.pending[k]=true; });
      }
    }
  }catch(e){
    reportar('Los datos guardados estaban dañados; se guardó una copia y se empieza de cero',e);
    try{ if(raw) localStorage.setItem(LS_DANADO,raw); }catch(e2){ reportar('No se pudo guardar la copia de los datos dañados',e2); }
  }
  S.cid=localStorage.getItem(LS_CID)||null;
  S.calId=localStorage.getItem(LS_CAL)||null;
  S.dev=localStorage.getItem(LS_DEV);
  if(!S.dev){ S.dev=rid(2); localStorage.setItem(LS_DEV,S.dev); }
  try{
    const t=JSON.parse(localStorage.getItem(LS_TOK)||'null');
    if(t&&t.exp>Date.now()&&t.scope===SCOPE){ S.token=t.token; S.tokenExp=t.exp; }
  }catch(e){ reportar('Sesión de Google guardada ilegible (se pedirá reconectar)',e,'warn'); }
}

export function setToken(tok,expiresIn){
  S.token=tok; S.tokenExp=Date.now()+(Math.max(120,expiresIn)-60)*1000;
  try{ localStorage.setItem(LS_TOK,JSON.stringify({token:tok,exp:S.tokenExp,scope:SCOPE})); }catch(e){ reportar('No se pudo guardar la sesión de Google',e,'warn'); }
}
export function clearToken(){ S.token=null; S.tokenExp=0; try{ localStorage.removeItem(LS_TOK); }catch(e){ reportar('No se pudo borrar la sesión de Google',e,'warn'); } }
export function hasToken(){
  if(S.token&&Date.now()<S.tokenExp) return true;
  if(S.token) clearToken();
  return false;
}
export const pendingCount=()=>Object.keys(S.pending).length;
export const online=()=>hasToken()&&!!S.calId;
