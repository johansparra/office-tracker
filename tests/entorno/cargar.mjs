// Monta Office Tracker en un navegador simulado (jsdom) con reloj, Google, GIS y Firebase falsos.
//   impl: 'referencia' → la versión v15 congelada en tests/referencia-v15 (scripts clásicos)
//         'nueva'      → la versión actual en js/ (módulos ES)
// Las dos reciben exactamente el mismo entorno, así que cualquier diferencia en una foto() es un cambio de comportamiento.

import { JSDOM, VirtualConsole } from 'jsdom';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { crearReloj, prng } from './reloj.mjs';
import { crearGoogle } from './google-falso.mjs';
import { crearFirebase } from './firebase-falso.mjs';

process.env.TZ='America/Bogota';
const AQUI=path.dirname(fileURLToPath(import.meta.url));
export const RAIZ=path.resolve(AQUI,'../..');
const REF=path.join(RAIZ,'tests/referencia-v15');
const sinScripts=html=>html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<link\b[^>]*>/g,'');

export const IDS=['nav-title','stats','day-hdrs','weeks','festivos','breakdown','history','gcal-bar','sync-chip','toast-txt','sheet-body','app-ver','app-ver2'];

const tickReal=()=>new Promise(r=>setImmediate(r));
// Deja correr promesas y respuestas de red pendientes hasta que no quede nada en vuelo
export async function esperar(n=6,google=null){
  for(let i=0;i<n||google?.enVuelo>0;i++){ if(i>200000) throw new Error('esperar(): la app no termina (¿bucle de red?)'); await tickReal(); }
}

function crearGIS(google){
  const gis={log:[],respuestas:[],sig:1};
  gis.api={accounts:{oauth2:{
    initTokenClient(cfg){
      gis.log.push(['init',cfg.client_id,cfg.scope]);
      return {requestAccessToken(o){
        gis.log.push(['pedir',cfg.scope,o?.prompt??null]);
        const r=gis.respuestas.shift()||'ok';
        Promise.resolve().then(()=>{
          if(r==='cerrado') return cfg.error_callback?.({type:'popup_closed'});
          if(r==='falla') return cfg.error_callback?.({type:'popup_failed_to_open'});
          if(r==='error') return cfg.callback({error:'access_denied'});
          const tok=`tok-${gis.sig++}`; google?.tokens.add(tok);
          cfg.callback({access_token:tok,expires_in:'3599',scope:cfg.scope,__todos:r!=='parcial'});
        });
      }};
    },
    hasGrantedAllScopes:r=>!!r.__todos,
    revoke:(tok,cb)=>{ gis.log.push(['revocar',tok]); cb&&cb(); },
  }}};
  return gis;
}

export async function cargarApp(op={}){
  const { impl='nueva', inicio='2026-10-07T09:00:00', url='http://localhost:8765/', ls={}, semilla=7,
    conGoogle=true, conGIS=true, conFirebase=false, firebase:fbOp={}, antes } = op;
  const reloj=crearReloj(new Date(inicio).getTime());
  const google=conGoogle?crearGoogle(reloj):null;
  const gis=conGIS?crearGIS(google):null;
  const fb=conFirebase?crearFirebase(fbOp):null;

  const consola=[], dialogos=[], respuestasConfirm=[];
  const vc=new VirtualConsole();
  for(const m of ['log','info','warn','error']) vc.on(m,(...a)=>consola.push([m,a.map(x=>x instanceof Error?x.message:String(x)).join(' ')]));
  vc.on('jsdomError',e=>consola.push(['jsdomError',e.message+(e.detail?` · ${e.detail?.message||e.detail}`:'')]));

  const html=fs.readFileSync(impl==='referencia'?path.join(REF,'index.html'):path.join(RAIZ,'index.html'),'utf8');
  const dom=new JSDOM(sinScripts(html),{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  await tickReal();   // deja que jsdom termine sus propios eventos de carga
  const w=dom.window, ctx=dom.getInternalVMContext();

  // ── Entorno falso, idéntico para las dos versiones ──
  Object.assign(w,{Date:reloj.Date,setTimeout:reloj.setTimeout,clearTimeout:reloj.clearTimeout,setInterval:reloj.setInterval,clearInterval:reloj.clearInterval});
  const rnd=prng(semilla);
  Object.defineProperty(w,'crypto',{configurable:true,value:{getRandomValues:a=>{ for(let i=0;i<a.length;i++) a[i]=Math.floor(rnd()*256); return a; }}});
  const rnd2=prng(semilla+1); w.Math.random=()=>rnd2();
  w.matchMedia=q=>({matches:false,media:q,addEventListener(){},removeEventListener(){}});
  w.Element.prototype.animate=function(){ return {finished:Promise.resolve(),cancel(){}}; };
  w.Element.prototype.getAnimations=function(){ return []; };
  w.confirm=m=>{ const r=respuestasConfirm.length?respuestasConfirm.shift():false; dialogos.push(['confirm',m,r]); return r; };
  w.alert=m=>{ dialogos.push(['alert',m]); };
  w.fetch=google?google.fetch:()=>Promise.reject(new TypeError('Failed to fetch'));
  if(gis) w.google=gis.api;
  if(fb) w.firebase=fb.api;
  let oculto=false;
  Object.defineProperty(w.document,'hidden',{configurable:true,get:()=>oculto});
  for(const [k,v] of Object.entries(ls)) w.localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v));
  antes?.({w,reloj,google,gis,fb});

  // ── Cargar el código ──
  const modulos=new Map();
  if(impl==='referencia'){
    for(const f of fs.readFileSync(path.join(REF,'orden.txt'),'utf8').split(/\s+/).filter(Boolean))
      new vm.Script(fs.readFileSync(path.join(REF,f),'utf8'),{filename:`referencia/${f}`}).runInContext(ctx);
  }else{
    const cargar=archivo=>{
      if(modulos.has(archivo)) return modulos.get(archivo);
      const m=new vm.SourceTextModule(fs.readFileSync(archivo,'utf8'),{identifier:pathToFileURL(archivo).href,context:ctx});
      modulos.set(archivo,m); return m;
    };
    const entrada=cargar(path.join(RAIZ,'js/app.js'));
    await entrada.link((spec,ref)=>cargar(path.resolve(path.dirname(fileURLToPath(ref.identifier)),spec)));
    await entrada.evaluate();
  }
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  await esperar(6,google);

  // ── Acceso uniforme a las dos versiones ──
  const mod=rel=>{ const m=modulos.get(path.join(RAIZ,'js',rel)); if(!m) throw new Error(`módulo no cargado: ${rel}`); return m.namespace; };
  const evalRef=code=>vm.runInContext(code,ctx);
  const getS=()=>impl==='referencia'?evalRef('S'):mod('estado/estado.js').S;
  const $=s=>w.document.querySelector(s);
  const celda=k=>{ const [y,m,d]=k.split('-').map(Number); return $(`.day-cell[data-ts="${new Date(y,m-1,d).getTime()}"]`); };
  const disparar=(el,tipo,extra={})=>{
    if(!el) throw new Error(`no existe el elemento para ${tipo}`);
    const E=tipo==='keydown'?w.KeyboardEvent:tipo.startsWith('touch')?w.Event:w.MouseEvent;
    const ev=new E(tipo,{bubbles:true,cancelable:true,...extra});
    for(const [k,v] of Object.entries(extra)) if(!(k in ev)) Object.defineProperty(ev,k,{value:v});
    el.dispatchEvent(ev);
  };

  const app={
    impl,w,reloj,google,gis,fb,consola,dialogos,mod,evalRef,getS,$,celda,
    esperar:(n=6)=>esperar(n,google),
    avanzar:ms=>reloj.avanzar(ms,()=>esperar(6,google)),
    confirmar:(...rs)=>respuestasConfirm.push(...rs),
    async clic(sel){ disparar(typeof sel==='string'?$(sel):sel,'click'); await app.esperar(); },
    async tocarDia(k,veces=1){ for(let i=0;i<veces;i++){ disparar(celda(k),'click'); await app.esperar(); } },
    async mantenerDia(k){ disparar(celda(k),'contextmenu'); await app.esperar(); },
    async tecla(el,key){ disparar(typeof el==='string'?$(el):el,'keydown',{key}); await app.esperar(); },
    async deslizar(dx,dy=0){
      const wk=$('#weeks');
      disparar(wk,'touchstart',{touches:[{clientX:200,clientY:200}]});
      disparar(wk,'touchend',{changedTouches:[{clientX:200+dx,clientY:200+dy}]});
      await app.esperar();
    },
    async ocultar(v){ oculto=v; w.document.dispatchEvent(new w.Event('visibilitychange')); await app.esperar(); },
    async evento(nombre){ w.dispatchEvent(new w.Event(nombre)); await app.esperar(); },
    errores:()=>consola.filter(([t])=>t==='jsdomError'),
    cerrar(){ w.close(); },
    foto(){
      const S=getS(), d=w.document;
      const dom={};
      for(const id of IDS) dom[id]=d.getElementById(id)?.innerHTML??null;
      Object.assign(dom,{
        festivosOculto:d.getElementById('festivos').hidden,
        toast:d.getElementById('toast').className,
        sheet:d.getElementById('sheet').style.display,
        modal:d.getElementById('modal').style.display,
        cid:d.getElementById('cid-input').value,
        topbar:d.getElementById('topbar').className,
        hero:d.getElementById('hero').className,
        url:w.location.href,
      });
      const ls={}; for(let i=0;i<w.localStorage.length;i++){ const k=w.localStorage.key(i); ls[k]=w.localStorage.getItem(k); }
      return JSON.parse(JSON.stringify({S,ls,dom,
        google:google?.log??null,fs:fb?.st.escrituras??null,dialogos,gis:gis?.log??null,
        ahora:reloj.ahora}));
    },
  };
  return app;
}
