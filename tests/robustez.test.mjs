// CONTROL DE ERRORES (mejoras de la v16): datos dañados, entradas inválidas y fallas no tumban la app,
// y todo error queda reportado (consola + officeTrackerErrores()). En los casos normales el comportamiento
// es idéntico a la v15 (ver equivalencia.test.mjs).

import './entorno/zona.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { cargarApp } from './entorno/cargar.mjs';
import { CID, SCOPE } from './escenarios.mjs';

const app=(op={})=>cargarApp({impl:'nueva',...op});
const plano=x=>JSON.parse(JSON.stringify(x));
const reportados=a=>a.consola.filter(([,m])=>m.startsWith('[office-tracker]')).map(([n,m])=>`${n}: ${m}`);
const tok={token:'tok-pre',exp:new Date('2026-10-07T09:00:00').getTime()+50*60*1000,scope:SCOPE};

test('datos guardados ilegibles: la app arranca vacía, guarda una copia y lo reporta',async()=>{
  const a=await app({ls:{'ot-data-v2':'{esto no es JSON'}});
  try{
    assert.deepEqual(a.errores(),[]);
    assert.equal(a.w.localStorage.getItem('ot-data-v2-danado'),'{esto no es JSON','copia de lo que no se pudo leer');
    assert.equal(a.w.document.querySelectorAll('.day-cell[data-ts]').length,31);
    assert.ok(reportados(a).some(m=>/dañados/.test(m)));
    await a.tocarDia('2026-10-08');
    assert.equal(a.getS().data['2026-10-08'],'office');
  }finally{ a.cerrar(); }
});

test('datos guardados con días y registros inválidos: se descartan solo esos',async()=>{
  const a=await app({ls:{'ot-data-v2':{v:3,
    data:{'2026-10-01':'office','2026-02-30':'office','basura':'office','2026-10-02':'fiesta','2026-10-05':'vacation'},
    log:[{id:'ok1',ts:1,d:'2026-10-01',to:'office',src:'manual'},{id:'',ts:1,d:'2026-10-01'},{ts:1,d:'2026-10-01'},{id:'x',d:'2026-10-01'},null,'texto',{id:'y',ts:1,d:'nunca'}],
    pending:['no','es','objeto'],hideOut:[{id:'h1',ts:1},{nada:1},null]}}});
  try{
    assert.deepEqual(a.errores(),[]);
    const S=a.getS();
    assert.deepEqual(plano(S.data),{'2026-10-01':'office','2026-10-05':'vacation'});
    assert.deepEqual(plano(S.log.map(e=>e.id)),['ok1']);
    assert.deepEqual(plano(S.pending),{});
    assert.deepEqual(plano(S.hideOut.map(h=>h.id)),['h1']);
    assert.ok(reportados(a).filter(m=>/descartado/.test(m)).length>=8);
  }finally{ a.cerrar(); }
});

test('enlace de aviso con un día que no existe: no se abre nada y la URL queda limpia',async()=>{
  for(const d of ['2026-02-30','2026-13-45','0000-00-00']){
    const a=await app({url:`http://localhost:8765/?d=${d}&r=r10&n=abcdef12`});
    try{
      assert.equal(a.$('#sheet').style.display,'none',d);
      assert.equal(a.w.location.search,'');
      assert.deepEqual(plano(a.getS().log),[]);
    }finally{ a.cerrar(); }
  }
});

test('un cambio con día o estado inválido se rechaza y se reporta',async()=>{
  const a=await app();
  try{
    const {applyChange}=a.mod('funcionalidades/marcar-dia/marcar.js');
    applyChange('2026-02-30','office','manual');
    applyChange('2026-10-08','fiesta','manual');
    assert.deepEqual(plano(a.getS().data),{});
    assert.deepEqual(plano(a.getS().log),[]);
    assert.equal(reportados(a).filter(m=>/Cambio inválido/.test(m)).length,2);
  }finally{ a.cerrar(); }
});

test('si una tarjeta falla al dibujarse, las demás siguen funcionando',async()=>{
  const a=await app();
  try{
    a.getS().log.push({id:'roto'});   // registro sin día: rompe la tarjeta de historial
    await a.tocarDia('2026-10-08');
    assert.deepEqual(a.errores(),[],'sin errores sin controlar');
    assert.match(a.celda('2026-10-08').className,/s-office/,'el calendario sí se actualizó');
    assert.match(a.$('#stats').innerHTML,/hc-num">1</,'el resumen sí se actualizó');
    assert.equal(a.$('#toast').className,'toast show','el Deshacer apareció');
    assert.ok(reportados(a).some(m=>/Dibujar el historial/.test(m)));
  }finally{ a.cerrar(); }
});

test('si el dispositivo no deja guardar (almacenamiento lleno), la app sigue y lo reporta',async()=>{
  const a=await app();
  try{
    a.w.Storage.prototype.setItem=()=>{ throw new Error('QuotaExceededError'); };
    await a.tocarDia('2026-10-08');
    assert.equal(a.getS().data['2026-10-08'],'office');
    assert.deepEqual(a.errores(),[]);
    assert.ok(reportados(a).some(m=>/No se pudo guardar en el dispositivo/.test(m)));
  }finally{ a.cerrar(); }
});

test('errores que nadie atrapa quedan registrados en officeTrackerErrores()',async()=>{
  const a=await app();
  try{
    a.w.dispatchEvent(new a.w.ErrorEvent('error',{error:new Error('falla en un evento'),message:'falla en un evento'}));
    const ev=new a.w.Event('unhandledrejection'); Object.defineProperty(ev,'reason',{value:new Error('promesa sin manejar')}); a.w.dispatchEvent(ev);
    const lista=plano(a.w.officeTrackerErrores());
    assert.ok(lista.some(e=>e.donde==='Error no controlado'&&e.mensaje==='falla en un evento'));
    assert.ok(lista.some(e=>e.donde==='Promesa rechazada sin manejar'&&e.mensaje==='promesa sin manejar'));
  }finally{ a.cerrar(); }
});

test('Firestore manda datos inválidos: se ignoran y se aplican los válidos',async()=>{
  const a=await app({conFirebase:true});
  try{
    await a.clic('#btn-fb-in'); await a.avanzar(100);
    a.fb.remoto('users/u1/days/2026-10-20',{type:'office',ts:a.reloj.ahora,dev:'otro'});
    a.fb.remoto('users/u1/days/no-es-dia',{type:'office',ts:1,dev:'otro'});
    a.fb.remoto('users/u1/days/2026-10-21',{type:'fiesta',ts:1,dev:'otro'});
    a.fb.remoto('users/u1/log/sinid',{ts:1,d:'2026-10-20'});
    a.fb.remoto('users/u1/log/r1',{id:'r1',ts:a.reloj.ahora,d:'2026-10-20',from:null,to:'office',src:'manual',dev:'otro'});
    await a.esperar();
    assert.deepEqual(plano(a.getS().data),{'2026-10-20':'office'});
    assert.deepEqual(plano(a.getS().log.map(e=>e.id)),['r1']);
    assert.equal(reportados(a).filter(m=>/inválido recibido de Firestore/.test(m)).length,3);
    assert.deepEqual(a.errores(),[]);
  }finally{ a.cerrar(); }
});

test('Firestore rechaza una escritura: se muestra el motivo en la tarjeta',async()=>{
  const a=await app({conFirebase:true,ls:{'ot-gcal-cid':CID,'ot-gcal-token':tok},antes:x=>x.google.tokens.add('tok-pre')});
  try{
    await a.clic('#btn-fb-in'); await a.avanzar(100);
    a.fb.st.fallarEscrituras='permission-denied';
    await a.tocarDia('2026-10-08');
    assert.match(a.$('#gcal-bar').innerHTML,/Firebase: sin permiso/);
    assert.equal(a.getS().data['2026-10-08'],'office','el cambio queda en el dispositivo');
    assert.deepEqual(a.errores(),[]);
  }finally{ a.cerrar(); }
});

test('Google sin red en medio de una sincronización: se muestra el error y luego se recupera',async()=>{
  const a=await app({ls:{'ot-gcal-cid':CID,'ot-gcal-token':tok},antes:x=>x.google.tokens.add('tok-pre')});
  try{
    a.google.fallarRed(r=>r.url.includes('/events?'),1);   // (si falla la búsqueda del calendario, la v15 ya sigue con el conocido)
    await a.clic('#btn-sync');
    assert.match(a.$('#gcal-bar').innerHTML,/No se pudo sincronizar/);
    assert.match(a.$('#sync-chip').innerHTML,/Error/);
    await a.clic('#btn-sync');
    assert.match(a.$('#gcal-bar').innerHTML,/Al día/);
    assert.deepEqual(a.errores(),[]);
  }finally{ a.cerrar(); }
});
