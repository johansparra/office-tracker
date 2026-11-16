// SEGURIDAD: una prueba por hallazgo de la auditoría run-1 (security-audit). Cada una describe el comportamiento
// seguro; antes de la v20 fallaban (eso confirmó el hallazgo) y ahora evitan que vuelva a aparecer.

import './entorno/zona.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { cargarApp } from './entorno/cargar.mjs';
import { eventoDia, CID, SCOPE } from './escenarios.mjs';

const R=await import('../js/nucleo/registro.js');
const ms=s=>new Date(s).getTime();
const plano=x=>JSON.parse(JSON.stringify(x));   // objetos del navegador simulado → objetos normales
const tok=(inicio='2026-10-07T09:00:00')=>({token:'tok-pre',exp:ms(inicio)+50*60*1000,scope:SCOPE});
const app=(op={})=>cargarApp({impl:'nueva',...op});
const XSS='<img id="xss" src="x">';
async function conSesion(op={},prep){
  return app({...op,ls:{'ot-gcal-cid':CID,'ot-gcal-token':tok(),...(op.ls||{})},antes:x=>{ x.google.tokens.add('tok-pre'); prep?.(x); }});
}
// Hoja «Office Tracker · Historial» con filas (columna W = JSON) y una pestaña «Ocultos»
function hoja(google,filasW,ocultos=[]){
  const c=google.crearCalendario('Office Tracker');
  google.archivos.set('f070',{id:'f070',name:'Office Tracker · Historial',mimeType:'application/vnd.google-apps.spreadsheet',modifiedTime:'2026-10-01T00:00:00.000Z',trashed:false});
  const fila=o=>[...Array(22).fill(''),typeof o==='string'?o:JSON.stringify(o)];
  google.hojas.set('f070',{tabs:[{sheetId:1,title:'Historial',filas:[['t'],...filasW.map(fila)]},{sheetId:2,title:'Ocultos',filas:[['t'],...ocultos.map(i=>[i])]}]});
  return c;
}

// ── Enlace fabricado (enlace.js) ──
test('seguridad: un enlace con respuesta pero sin código verificado no cambia el día; muestra las opciones',async()=>{
  for(const q of ['d=2026-10-09&a=vacation','d=2026-10-09&r=r10&n=deadbeef&a=office']){
    const a=await app({url:`http://localhost:8765/?${q}`});
    try{
      const S=a.getS();
      assert.equal(S.data['2026-10-09'],undefined,q); assert.equal(S.log.length,0,q);
      assert.ok(a.$('[data-pick="office"]'),'se piden las opciones');
    }finally{ a.cerrar(); }
  }
});

// ── XSS desde la hoja (parseRow → historial) ──
test('seguridad: filas de la hoja con HTML no se pintan como HTML ni entran al historial',async()=>{
  const base={ts:ms('2026-10-06T08:00:00'),d:'2026-10-09',from:null,to:'office',dev:'aa11'};
  const a=await conSesion({},({google})=>hoja(google,[
    {...base,id:'x1',src:XSS},
    {...base,id:'x2',src:'manual',from:`x"><img id="xss2" src="x">`},
    {...base,id:'x3',src:'manual',dev:`<b id="xss3">d</b>`},
    {...base,id:'ok1',src:'manual'},
  ]));
  try{
    await a.mantenerDia('2026-10-09');
    assert.equal(a.w.document.querySelectorAll('#xss,#xss2,#xss3').length,0,'no hay elementos inyectados');
    assert.deepEqual(plano(a.getS().log.map(e=>e.id)),['ok1'],'solo entra el registro válido');
  }finally{ a.cerrar(); }
});
test('seguridad: registros de Firestore con campos fuera de lo permitido se descartan',async()=>{
  const a=await app({conFirebase:true});
  try{
    await a.clic('#btn-fb-in'); await a.esperar();
    a.fb.remoto('users/u1/log/z1',{id:'z1',ts:ms('2026-10-06T08:00:00'),d:'2026-10-09',from:null,to:'office',src:XSS,dev:'aa11'});
    a.fb.remoto('users/u1/log/z2',{id:'z2',ts:ms('2026-10-06T08:00:00'),d:'2026-10-09',from:null,to:'office',src:'manual',dev:'aa11'});
    await a.esperar();
    assert.deepEqual(plano(a.getS().log.map(e=>e.id)),['z2']);
    await a.mantenerDia('2026-10-09');
    assert.equal(a.$('#xss'),null);
  }finally{ a.cerrar(); }
});
test('seguridad: entradaValida exige valores conocidos y textos cortos',()=>{
  const ok={id:'ab12cd34',ts:1,d:'2026-10-09',from:null,to:'office',src:'manual',dev:'aa11'};
  assert.equal(R.entradaValida(ok),true);
  assert.equal(R.entradaValida({...ok,src:'otro'}),false);
  assert.equal(R.entradaValida({...ok,from:'x'}),false);
  assert.equal(R.entradaValida({...ok,dev:{o:1}}),false);
  assert.equal(R.entradaValida({...ok,id:'a/b'}),false);
  assert.equal(R.entradaValida({...ok,ref:'<b>'}),false);
  assert.equal(R.entradaValida({...ok,src:'notif',ok:'ok',slot:'r10',ref:'abcdef12',note:'Hoy no fui'}),true);
  assert.equal(R.entradaValida({...ok,ts:ms('2027-01-01T00:00:00')},ms('2026-10-07T00:00:00')),false,'fecha futura (más de un día)');
  assert.equal(R.entradaValida({...ok,ts:ms('2026-10-07T20:00:00')},ms('2026-10-07T00:00:00')),true,'reloj algo adelantado');
});

// ── Error de Google/Firebase en la tarjeta de conexión ──
test('seguridad: el texto de un error se muestra como texto, no como HTML',async()=>{
  const a=await conSesion({},({google})=>{ google.crearCalendario('Office Tracker'); google.fallar(r=>r.url.includes('calendarList'),500,{reason:'backendError',message:XSS}); });
  try{
    assert.ok(a.getS().lastError,'hay error');
    assert.equal(a.$('#gcal-bar #xss'),null);
    assert.match(a.$('#gcal-bar').innerHTML,/&lt;img/);
  }finally{ a.cerrar(); }
});

// ── Calendario de otra cuenta con el mismo nombre (ensureCalendar / mergeCalendar) ──
test('seguridad: un calendario «Office Tracker» compartido por otra cuenta no se adopta ni se borra',async()=>{
  let mio, ajeno;
  const a=await conSesion({},({google})=>{
    mio=google.crearCalendario('Office Tracker','zz9@group.calendar.google.com');
    ajeno=google.crearCalendario('Office Tracker','aa1@group.calendar.google.com');
    google.calendarios.get(ajeno).dataOwner='otra@gmail.com';
    google.crearEvento(mio,eventoDia('2026-10-02','office'));
  });
  try{
    assert.ok(a.google.calendarios.has(mio),'mi calendario sigue');
    assert.ok(a.google.calendarios.has(ajeno),'el ajeno no se borra');
    assert.equal(a.getS().calId,mio);
    assert.equal(a.google.log.filter(l=>l.u.includes(encodeURIComponent(ajeno))).length,0,'no se toca el ajeno');
  }finally{ a.cerrar(); }
});
test('seguridad: si copiar un duplicado falla, el duplicado no se borra',async()=>{
  let c1, c2;
  const a=await conSesion({},({google})=>{
    c1=google.crearCalendario('Office Tracker'); c2=google.crearCalendario('Office Tracker');
    google.crearEvento(c2,eventoDia('2026-10-02','vacation'));
    google.fallar(r=>r.metodo==='POST'&&r.url.includes(`/calendars/${encodeURIComponent(c1)}/events`),404,{reason:'notFound',message:'Not Found'},1);
  });
  try{ assert.ok(a.google.calendarios.has(c2),'el duplicado sigue'); }finally{ a.cerrar(); }
});

// ── Campos del log hacia Calendar (dayBody) ──
test('seguridad: dayBody solo manda textos acotados y valores conocidos a Calendar',async()=>{
  const a=await app();
  try{
    const S=a.getS();
    S.log.push({id:'q1',ts:1,d:'2026-10-09',from:null,to:'office',src:'<a href="x">y</a>',dev:{o:1},ref:'r'.repeat(500),ok:'ok'});
    const b=a.mod('funcionalidades/sincronizacion/reconciliar.js').dayBody('2026-10-09','office');
    for(const [k,v] of Object.entries(b.extendedProperties.private)){ assert.equal(typeof v,'string',k); assert.ok(v.length<=64,k); }
    assert.equal(b.extendedProperties.private.src,'');
    assert.doesNotMatch(b.description,/<a href/);
  }finally{ a.cerrar(); }
});

// ── Registro con fecha futura (bucle de reescrituras en Firestore) ──
test('seguridad: un registro con fecha futura no entra (ni de la hoja, ni de Firestore, ni guardado)',async()=>{
  const fut={id:'f1',ts:ms('2030-01-01'),d:'2026-10-09',from:null,to:'office',src:'manual',dev:'aa11'};
  let a=await app({ls:{'ot-data-v2':{v:3,data:{},log:[fut]}}});
  try{ assert.equal(a.getS().log.length,0,'al leer el dispositivo'); }finally{ a.cerrar(); }
  a=await conSesion({},({google})=>hoja(google,[fut]));
  try{ assert.equal(a.getS().log.length,0,'desde la hoja'); }finally{ a.cerrar(); }
  a=await app({conFirebase:true});
  try{
    await a.clic('#btn-fb-in'); await a.esperar();
    a.fb.remoto('users/u1/log/f1',fut); await a.esperar();
    assert.equal(a.getS().log.length,0,'desde Firestore');
  }finally{ a.cerrar(); }
});

// ── Claves extra en un registro de la hoja (llenaban el almacenamiento y bloqueaban la migración a Firestore) ──
test('seguridad: un registro con claves extra se guarda solo con los campos de la app',async()=>{
  const e={id:'p1',ts:ms('2026-10-06T08:00:00'),d:'2026-10-09',from:null,to:'office',src:'manual',dev:'aa11',pad:'x'.repeat(50000)};
  const a=await conSesion({},({google})=>hoja(google,[e]));
  try{
    const l=a.getS().log; assert.equal(l.length,1); assert.equal('pad' in l[0],false);
    assert.ok(a.w.localStorage.getItem('ot-data-v2').length<5000,'lo guardado es pequeño');
  }finally{ a.cerrar(); }
});

// ── Ids de «Ocultos» enormes o con HTML (localStorage, ids de Firestore) ──
test('seguridad: ids ocultos inválidos o enormes desde la hoja se ignoran',async()=>{
  const a=await conSesion({},({google})=>hoja(google,[],['ab12cd34',XSS,'x'.repeat(5000),'__x__']));
  try{ assert.deepEqual(plano(Object.keys(a.getS().hidden)),['ab12cd34']); }finally{ a.cerrar(); }
});

// ── La app dentro de un iframe de otro sitio (clickjacking) ──
test('seguridad: dentro de un iframe la app no muestra acciones ni sincroniza',async()=>{
  const a=await conSesion({},({w,google})=>{ google.crearCalendario('Office Tracker'); Object.defineProperty(w,'self',{configurable:true,get:()=>({})}); });
  try{
    assert.equal(a.w.document.querySelectorAll('.day-cell').length,0,'sin calendario para tocar');
    assert.equal(a.google.log.length,0,'sin llamadas a Google');
    assert.match(a.w.document.body.textContent,/Abre Office Tracker directamente/);
  }finally{ a.cerrar(); }
});
