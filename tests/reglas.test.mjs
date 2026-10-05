// REGLAS DE NEGOCIO RN-01..RN-30 (README §1): cada regla con valores esperados escritos a mano.
// Las reglas puras se prueban directo contra js/nucleo; las que dependen de Google o de la pantalla,
// con la app completa en el navegador simulado.

import './entorno/zona.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { cargarApp } from './entorno/cargar.mjs';
import { eventoDia, CID, SCOPE } from './escenarios.mjs';

const C=await import('../js/nucleo/constantes.js');
const F=await import('../js/nucleo/fechas.js');
const { holidays, getHol, easter }=await import('../js/nucleo/festivos.js');
const { calcularMes, estadoMes, weeks }=await import('../js/nucleo/meta.js');
const { siguienteEstado, tipoValido }=await import('../js/nucleo/marcado.js');
const { avisosDeseados, tituloAviso, cuerpoAviso }=await import('../js/nucleo/avisos.js');
const K=await import('../js/nucleo/conflictos.js');
const R=await import('../js/nucleo/registro.js');

const d=(y,m,dd,h=0,mi=0)=>new Date(y,m-1,dd,h,mi);
const OCT=(data={},hoy=d(2026,10,7))=>calcularMes(data,2026,9,hoy);
const ms=s=>new Date(s).getTime();
const plano=x=>JSON.parse(JSON.stringify(x));   // objetos del navegador simulado → objetos normales para comparar
const tok=(inicio='2026-10-07T09:00:00')=>({token:'tok-pre',exp:ms(inicio)+50*60*1000,scope:SCOPE});
const app=(op={})=>cargarApp({impl:'nueva',...op});
async function conSesion(op={},eventos=[],{conocido=true}={}){
  return app({...op,ls:{'ot-gcal-cid':CID,'ot-gcal-token':tok(op.inicio),...(op.ls||{})},antes:x=>{
    x.google.tokens.add('tok-pre');
    if(eventos!==null){ const c=x.google.crearCalendario('Office Tracker'); for(const ev of eventos) x.google.crearEvento(c,ev); if(conocido) x.w.localStorage.setItem('ot-cal-id',c); }
    op.antes?.(x);
  }});
}

// ── 1.1 Meta mensual ──
test('RN-01 la meta base es 8 visitas al mes',()=>{
  assert.equal(C.BASE,8);
  assert.equal(calcularMes({},2026,1,d(2026,1,1)).target,8);   // febrero 2026: sin festivos
});
test('RN-02 semanas de lunes a domingo; lo ideal son 2 por semana',()=>{
  const ws=weeks(2026,9);
  assert.equal(ws.length,5);
  assert.deepEqual(ws.map(w=>F.toKey(w.mon)),['2026-09-28','2026-10-05','2026-10-12','2026-10-19','2026-10-26']);
  assert.ok(ws.every(w=>w.mon.getDay()===1&&w.sun.getDay()===0));
  assert.deepEqual(OCT().ws.map(w=>w.quota),[2,2,1,2,2]);
});
test('RN-03 una semana con festivo o día libre tiene cuota 1; el festivo cuenta aunque caiga en fin de semana',()=>{
  assert.equal(OCT().ws[2].quota,1);                                      // festivo lunes 12
  assert.equal(OCT({'2026-10-21':'vacation'}).ws[3].quota,1);             // día libre miércoles 21
  assert.equal(OCT({'2026-10-24':'vacation'}).ws[3].quota,1);             // día libre en sábado
  const ago=calcularMes({},2027,7,d(2027,8,1));                           // agosto 2027: Boyacá cae sábado 7
  assert.equal(getHol(d(2027,8,7)),'Batalla de Boyacá');
  assert.equal(ago.ws.find(w=>F.toKey(w.mon)==='2027-08-02').quota,1);
});
test('RN-04 meta ajustada = 8 − semanas con festivo o día libre (nunca negativa)',()=>{
  assert.equal(OCT().target,7);
  assert.equal(OCT({'2026-10-21':'vacation'}).target,6);
  assert.equal(calcularMes({},2027,7,d(2027,8,1)).target,6);              // agosto 2027: Boyacá (sáb 7) y Asunción (lun 16)
  const todo={}; for(let i=1;i<=31;i++) todo[`2026-10-${String(i).padStart(2,'0')}`]='vacation';
  const s=OCT(todo); assert.equal(s.adjN,5); assert.equal(s.target,3); assert.ok(s.target>=0);
});
test('RN-05 en semanas que cruzan de mes solo cuentan los días del mes visible',()=>{
  const data={'2026-09-30':'office','2026-09-29':'vacation'};
  const oct=OCT(data);
  assert.equal(oct.visited,0); assert.equal(oct.ws[0].quota,2); assert.equal(oct.ws[0].hasAdj,false);
  const sep=calcularMes(data,2026,8,d(2026,9,1));
  assert.equal(sep.visited,1); assert.equal(sep.ws.at(-1).hasAdj,true);
});
test('RN-06 una visita es un día 🏢, incluido un festivo entre semana; lo de más es extra',()=>{
  assert.equal(OCT({'2026-10-12':'office'}).visited,1);
  const ocho={}; ['01','02','05','06','07','08','09','13'].forEach(x=>ocho[`2026-10-${x}`]='office');
  const s=OCT(ocho); assert.equal(s.visited,8); assert.equal(s.done,true); assert.equal(s.remaining,0); assert.equal(s.pct,100);
});
// ── 1.2 Alertas ──
test('RN-07 días hábiles libres: lun–vie desde hoy, sin festivo ni marcados',()=>{
  assert.deepEqual(OCT({},d(2026,10,26)).open,['2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30']);
  assert.deepEqual(OCT({'2026-10-27':'office','2026-10-28':'vacation'},d(2026,10,26)).open,['2026-10-26','2026-10-29','2026-10-30']);
  assert.ok(!OCT({},d(2026,10,9)).open.includes('2026-10-12'));            // festivo
  assert.ok(!OCT({},d(2026,10,9)).open.includes('2026-10-10'));            // sábado
  assert.ok(!OCT({},d(2026,10,9)).open.includes('2026-10-08'));            // ya pasó
});
test('RN-08 margen = días hábiles libres − visitas que faltan',()=>{
  const s=OCT({},d(2026,10,19));   // 7 faltan · quedan 19..23 y 26..30 = 10
  assert.equal(s.remaining,7); assert.equal(s.open.length,10); assert.equal(s.slack,3);
});
test('RN-09 mensaje según el margen',()=>{
  const e=(x)=>estadoMes({active:[1],slack:0,done:false,...x}).tipo;
  assert.equal(e({done:true}),'cumplida');
  assert.equal(e({active:[]}),'cerrado');
  assert.equal(e({slack:-1}),'no-alcanza');
  assert.equal(e({slack:0}),'si-o-si');
  assert.equal(e({slack:1}),'poco-margen');
  assert.equal(e({slack:2}),'poco-margen');
  assert.equal(e({slack:3}),'vas-bien');
  assert.equal(estadoMes({active:[1],slack:3,done:false}).tone,'go');
  assert.equal(estadoMes({active:[1],slack:2,done:false}).tone,'warn');
  assert.equal(estadoMes({active:[],slack:9,done:true}).tone,'ok');
});
test('RN-10 ejemplo del README: el 26 de octubre con 2 visitas, los 5 días que quedan son obligatorios',()=>{
  const s=OCT({'2026-10-05':'office','2026-10-06':'office'},d(2026,10,26));
  assert.equal(s.remaining,5); assert.equal(s.slack,0);
  assert.deepEqual(s.must,['2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30']);
  assert.equal(tituloAviso('2026-10-27','r10',{'2026-10-05':'office','2026-10-06':'office'},d(2026,10,26)),'⚠️ Hoy tienes que ir a la oficina');
  assert.equal(tituloAviso('2026-10-27','r16',{'2026-10-05':'office','2026-10-06':'office'},d(2026,10,26)),'¿Fuiste a la oficina hoy?');
  assert.equal(tituloAviso('2026-10-27','r10',{},d(2026,10,7)),'¿Vas a la oficina hoy?');
  assert.deepEqual(OCT({},d(2026,10,7)).must,[]);                          // con margen no hay obligatorios
});
test('RN-10 en pantalla: borde punteado y alerta «sí o sí»',async()=>{
  const a=await app({inicio:'2026-10-26T08:00:00',ls:{'ot-data-v2':{v:3,data:{'2026-10-05':'office','2026-10-06':'office'}}}});
  try{
    assert.match(a.$('#stats').innerHTML,/Tienes que ir sí o sí/);
    assert.equal(a.w.document.querySelectorAll('.day-cell.must').length,5);
  }finally{ a.cerrar(); }
});
// ── 1.3 Marcar días ──
test('RN-11 ciclo de toques según el tipo de día',()=>{
  const ciclo=(fecha)=>{ const r=[]; let c=null; for(let i=0;i<4;i++){ c=siguienteEstado(fecha,c); r.push(c); } return r; };
  assert.deepEqual(ciclo(d(2026,10,7)),['office','vacation',null,'office']);    // hábil
  assert.deepEqual(ciclo(d(2026,10,12)),['office',null,'office',null]);         // festivo entre semana
  assert.deepEqual(ciclo(d(2026,10,10)),['vacation',null,'vacation',null]);     // sábado
  assert.deepEqual(ciclo(d(2026,10,11)),['vacation',null,'vacation',null]);     // domingo
  assert.equal(siguienteEstado(d(2026,10,12),'vacation'),'office');             // festivo con día libre (datos viejos)
});
test('RN-12 el cambio espera 5 s (con Deshacer) antes de subirse a Google',async()=>{
  const a=await conSesion();
  try{
    await a.avanzar(1000);
    const antes=a.google.log.length;
    await a.tocarDia('2026-10-08');
    assert.equal(a.$('#toast').className,'toast show');
    await a.avanzar(4900); assert.equal(a.google.log.filter(x=>x.m==='POST'&&x.b?.extendedProperties?.private?.kind==='day').length,0,'no debe subir antes de 5 s');
    await a.avanzar(200);
    assert.equal(a.google.log.slice(antes).filter(x=>x.m==='POST'&&x.b?.extendedProperties?.private?.kind==='day').length,1);
    assert.equal(a.$('#toast').className,'toast');
  }finally{ a.cerrar(); }
});
test('RN-12 deshacer revierte el día y queda registrado como «Deshecho»',async()=>{
  const a=await app();
  try{
    await a.tocarDia('2026-10-08'); await a.clic('#toast-undo');
    assert.equal(a.getS().data['2026-10-08'],undefined);
    assert.deepEqual(plano(a.getS().log.map(e=>e.src)),['manual','undo']);
  }finally{ a.cerrar(); }
});
test('RN-13 sin Google todo funciona y queda guardado en el dispositivo',async()=>{
  const a=await app({conGoogle:false,conGIS:false});
  let guardado;
  try{
    await a.tocarDia('2026-10-08'); await a.tocarDia('2026-10-09'); await a.tocarDia('2026-10-09');
    guardado=a.w.localStorage.getItem('ot-data-v2');
    assert.match(a.$('#sync-chip').innerHTML,/Solo local/);
  }finally{ a.cerrar(); }
  const b=await app({conGoogle:false,ls:{'ot-data-v2':guardado}});
  try{ assert.deepEqual(plano(b.getS().data),{'2026-10-08':'office','2026-10-09':'vacation'}); }finally{ b.cerrar(); }
});
// ── 1.4 Festivos ──
test('RN-14 festivos oficiales de Colombia 2026',()=>{
  assert.deepEqual(Object.keys(holidays(2026)).sort(),['2026-01-01','2026-01-12','2026-03-23','2026-04-02','2026-04-03','2026-05-01','2026-05-18',
    '2026-06-08','2026-06-15','2026-06-29','2026-07-20','2026-08-07','2026-08-17','2026-10-12','2026-11-02','2026-11-16','2026-12-08','2026-12-25']);
  assert.equal(F.toKey(easter(2026)),'2026-04-05');
  assert.equal(F.toKey(easter(2025)),'2025-04-20');
  assert.equal(F.toKey(easter(2024)),'2024-03-31');
});
test('RN-14 Ley Emiliani: se mueven al lunes; si coinciden dos, queda uno (2025: San Pedro y Sagrado Corazón el 30 de junio)',()=>{
  const h=holidays(2025);
  assert.equal(h['2025-01-06'],'Reyes Magos');        // ya era lunes
  assert.equal(h['2025-03-24'],'San José');           // 19 mié → lun 24
  assert.equal(h['2025-10-13'],'Día de la Raza');     // 12 dom → lun 13
  assert.equal(h['2025-06-30'],'Sagrado Corazón');
  assert.equal(Object.keys(h).length,17);
  assert.equal(h['2025-07-20'],'Independencia');      // fijo aunque sea domingo
});
// ── 1.5 Avisos ──
test('RN-15 dos avisos: 10:00 y 4:30 p. m., hora de Bogotá',()=>{
  assert.deepEqual(C.SLOTS.map(s=>[s.id,s.h,s.m]),[['r10',10,0],['r16',16,30]]);
  const ev=cuerpoAviso('2026-10-08','r16','abcd1234','t','https://x/');
  assert.equal(ev.start.dateTime,'2026-10-08T16:30:00'); assert.equal(ev.start.timeZone,'America/Bogota');
  assert.equal(ev.description,'Toca el enlace para registrar el día:\nhttps://x/?d=2026-10-08&r=r16&n=abcd1234');
});
test('RN-16 solo lun–vie, sin festivo, sin marcar, sin «Hoy no fui» y horas que no pasaron; 21 días',()=>{
  assert.equal(C.HORIZON,21);
  const A=(k,ahora,data={},skip={})=>avisosDeseados(k,data,skip,ahora);
  assert.deepEqual(A('2026-10-08',d(2026,10,7,9)),['r10','r16']);
  assert.deepEqual(A('2026-10-07',d(2026,10,7,9)),['r10','r16']);
  assert.deepEqual(A('2026-10-07',d(2026,10,7,12)),['r16']);
  assert.deepEqual(A('2026-10-07',d(2026,10,7,17)),[]);
  assert.deepEqual(A('2026-10-10',d(2026,10,7,9)),[]);                       // sábado
  assert.deepEqual(A('2026-10-12',d(2026,10,7,9)),[]);                       // festivo
  assert.deepEqual(A('2026-10-08',d(2026,10,7,9),{'2026-10-08':'office'}),[]);
  assert.deepEqual(A('2026-10-08',d(2026,10,7,9),{},{'2026-10-08':true}),[]);
});
test('RN-16/17 en Google: se programan 21 días de avisos y al marcar un día se borran los suyos',async()=>{
  const a=await conSesion();
  try{
    const cal=a.getS().calId;
    const avisos=()=>a.google.vivos(cal).filter(e=>e.extendedProperties?.private?.kind==='reminder');
    const dias=new Set(avisos().map(e=>e.extendedProperties.private.date));
    assert.ok(dias.has('2026-10-07')&&dias.has('2026-10-28')&&!dias.has('2026-10-29'),'hasta hoy + 21 días');
    assert.ok(!dias.has('2026-10-10')&&!dias.has('2026-10-12'),'sin fines de semana ni festivos');
    assert.equal(avisos().filter(e=>e.extendedProperties.private.date==='2026-10-08').length,2);
    await a.tocarDia('2026-10-08'); await a.avanzar(6000);
    assert.equal(avisos().filter(e=>e.extendedProperties.private.date==='2026-10-08').length,0);
  }finally{ a.cerrar(); }
});
test('RN-18 el código del aviso se verifica: ✓ verificado, ⚠ de otro día, ? sin verificar',async()=>{
  const casos=[['abcdef12','2026-10-07',/código verificado ✓/],['abcdef12','2026-10-08',/no coincide/],['99999999','2026-10-07',/sin verificar/]];
  for(const [n,dia,re] of casos){
    const a=await app({url:`http://localhost:8765/?d=${dia}&r=r10&n=${n}`,ls:{'ot-data-v2':{v:3,data:{},nonces:{abcdef12:{d:'2026-10-07',slot:'r10'}}}}});
    try{ assert.match(a.$('#sheet-body').innerHTML,re); assert.equal(a.w.location.search,'','la URL queda limpia'); }finally{ a.cerrar(); }
  }
});
test('RN-19 «Hoy no fui» no cambia el día, cancela los avisos que quedan y queda registrado',async()=>{
  const a=await conSesion({url:'http://localhost:8765/?d=2026-10-08&r=r10&n=0123abcd'});
  try{
    await a.clic('[data-pick="none"]'); await a.avanzar(100);
    const S=a.getS();
    assert.equal(S.data['2026-10-08'],undefined); assert.equal(S.skip['2026-10-08'],true);
    assert.equal(S.log.at(-1).note,'Hoy no fui'); assert.equal(S.log.at(-1).src,'notif');
    assert.equal(a.google.vivos(S.calId).filter(e=>e.extendedProperties?.private?.date==='2026-10-08').length,0);
  }finally{ a.cerrar(); }
});
// ── 1.6 Sincronización y conflictos ──
test('RN-20 un solo calendario por cuenta: se unen los duplicados en el de id menor',async()=>{
  const a=await app({ls:{'ot-gcal-cid':CID,'ot-gcal-token':tok()},antes:({google})=>{ google.tokens.add('tok-pre');
    const c1=google.crearCalendario('Office Tracker'), c2=google.crearCalendario('Office Tracker');
    google.crearEvento(c2,eventoDia('2026-10-02','vacation')); google.crearEvento(c1,eventoDia('2026-10-01','office')); }});
  try{
    const ot=[...a.google.calendarios.values()].filter(c=>c.summary==='Office Tracker');
    assert.equal(ot.length,1); assert.equal(ot[0].id,'c001@group.calendar.google.com');
    assert.deepEqual(plano(a.getS().data),{'2026-10-01':'office','2026-10-02':'vacation'});
  }finally{ a.cerrar(); }
});
test('RN-21 qué representa un evento según su título',()=>{
  const c=(summary,extra={})=>K.classify({summary,...extra});
  assert.equal(c('🏢 Oficina'),'office'); assert.equal(c('Fui a la OFICINA'),'office'); assert.equal(c('office day'),'office');
  assert.equal(c('🏖️ Día libre'),'vacation'); assert.equal(c('Libre'),'vacation'); assert.equal(c('Vacaciones'),'vacation'); assert.equal(c('vacación'),'vacation');
  assert.equal(c('Reunión'),'office');                                        // cualquier otro evento = oficina
  assert.equal(c('',{extendedProperties:{private:{type:'vacation'}}}),'vacation');
  assert.equal(c('🏢 Oficina',{status:'cancelled'}),null);
  assert.equal(c('Oficina libre'),'vacation');                                // libre tiene prioridad
});
test('RN-22 sin Firebase: pendiente en el dispositivo gana; si no, gana Calendar',async()=>{
  assert.equal(K.importarDeCalendar({pendiente:true,local:'office',calendario:'vacation'}),false);
  assert.equal(K.importarDeCalendar({pendiente:false,local:'office',calendario:'vacation'}),true);
  assert.equal(K.importarDeCalendar({pendiente:false,local:'office',calendario:'office'}),false);
  const a=await conSesion({ls:{'ot-data-v2':{v:3,data:{'2026-10-01':'office','2026-10-02':'office'},evIds:{},pending:{'2026-10-01':true}}}},
    [eventoDia('2026-10-01','vacation'),eventoDia('2026-10-02','vacation')]);
  try{
    assert.equal(a.getS().data['2026-10-01'],'office','pendiente: gana el dispositivo');
    assert.equal(a.getS().data['2026-10-02'],'vacation','sin pendiente: gana Calendar');
    assert.equal(a.getS().log.find(e=>e.d==='2026-10-02').src,'calendar');
  }finally{ a.cerrar(); }
});
test('RN-23 con Firebase gana el cambio más reciente',()=>{
  const base={calendario:'office',local:'vacation',pendiente:false,enVentana:false,tsFirestore:1000,tenia:true,ultimaSync:0};
  assert.equal(K.decidirDiaConFirebase({...base,evento:{upd:7000}}),'importar');      // editado en Calendar después
  assert.equal(K.decidirDiaConFirebase({...base,evento:{upd:5000}}),'corregir');      // dentro del margen de 5 s
  assert.equal(K.decidirDiaConFirebase({...base,calendario:'vacation',evento:{upd:9e9}}),'nada');
  assert.equal(K.decidirDiaConFirebase({...base,pendiente:true,evento:{upd:9e9}}),'nada');
  assert.equal(K.decidirDiaConFirebase({...base,enVentana:true,evento:{upd:9e9}}),'nada');
  assert.equal(K.decidirDiaConFirebase({...base,calendario:null,evento:undefined,ultimaSync:2000}),'importar');   // lo borraron en Calendar
  assert.equal(K.decidirDiaConFirebase({...base,calendario:null,evento:undefined,ultimaSync:500}),'corregir');
  assert.equal(K.decidirDiaRemoto({local:'office',remoto:{type:'vacation',ts:100},enVentana:false,ultimoLog:50}),'aplicar');
  assert.equal(K.decidirDiaRemoto({local:'office',remoto:{type:'vacation',ts:100},enVentana:false,ultimoLog:150}),'reescribir');
  assert.equal(K.decidirDiaRemoto({local:'office',remoto:{type:'vacation',ts:100},enVentana:true,ultimoLog:0}),'reescribir');
  assert.equal(K.decidirDiaRemoto({local:'office',remoto:{type:'office',ts:100},enVentana:true,ultimoLog:999}),'aplicar');
});
test('RN-24 al unirse a un calendario existente gana Google; solo se suben los días que no tiene',async()=>{
  assert.deepEqual([...K.diasEnCalendario([{summary:'🏢',start:{date:'2026-10-01'}},{summary:'x',status:'cancelled',start:{date:'2026-10-02'}},
    {start:{dateTime:'2026-10-03T10:00:00'},extendedProperties:{private:{kind:'reminder'}}}])],['2026-10-01']);
  const a=await conSesion({ls:{'ot-data-v2':{v:3,data:{'2026-10-01':'vacation','2026-10-02':'office'},evIds:{},pending:{'2026-10-01':true}}}},[eventoDia('2026-10-01','office')],{conocido:false});
  try{
    assert.equal(a.getS().data['2026-10-01'],'office','Google gana aunque el día estaba pendiente en el dispositivo');
    const dias=a.google.vivos(a.getS().calId).filter(e=>e.start?.date).map(e=>e.start.date).sort();
    assert.deepEqual(dias,['2026-10-01','2026-10-02'],'se subió solo el día que faltaba');
  }finally{ a.cerrar(); }
});
test('RN-25 si un día tiene varios eventos se deja uno (el conocido o el primero)',async()=>{
  assert.equal(K.elegirEvento([{id:'a'},{id:'b'}],'b').id,'b');
  assert.equal(K.elegirEvento([{id:'a'},{id:'b'}],'z').id,'a');
  const a=await conSesion({},[eventoDia('2026-10-05','office'),eventoDia('2026-10-05','office'),eventoDia('2026-10-05','vacation')]);
  try{ assert.equal(a.google.vivos(a.getS().calId).filter(e=>e.start?.date==='2026-10-05').length,1); }finally{ a.cerrar(); }
});
// ── 1.7 Historial y auditoría ──
test('RN-26 cada cambio se registra con id, hora, día, antes/después, origen y dispositivo',async()=>{
  const a=await app();
  try{
    await a.tocarDia('2026-10-08');
    const e=a.getS().log[0];
    assert.match(e.id,/^[0-9a-f]{8}$/); assert.equal(e.ts,a.reloj.ahora); assert.equal(e.d,'2026-10-08');
    assert.equal(e.from,null); assert.equal(e.to,'office'); assert.equal(e.src,'manual'); assert.equal(e.dev,a.getS().dev);
    assert.deepEqual(R.srcBadge({src:'notif',ok:'ok'}),['b-ok','Aviso ✓']);
    assert.deepEqual(R.srcBadge({src:'notif',ok:'bad'}),['b-bad','Aviso ⚠']);
    assert.deepEqual(R.srcBadge({src:'notif'}),['b-unk','Aviso ?']);
    assert.deepEqual(R.srcBadge({src:'calendar'}),['b-calendar','Calendar']);
    assert.deepEqual(R.srcBadge({src:'undo'}),['b-undo','Deshecho']);
  }finally{ a.cerrar(); }
});
test('RN-27 la hoja es solo de agregar: nunca se borran ni cambian filas',async()=>{
  const a=await conSesion();
  try{
    const filas=()=>a.google.hojas.get(a.getS().sheetId).tabs.find(t=>t.title==='Historial').filas.map(f=>JSON.stringify(f));
    await a.tocarDia('2026-10-08'); await a.avanzar(6000);
    const antes=filas();
    await a.tocarDia('2026-10-08'); await a.avanzar(6000);
    await a.clic('#history .log-del'); await a.avanzar(100);
    a.confirmar(true); await a.clic('#btn-log-clear'); await a.avanzar(100);
    const despues=filas();
    assert.deepEqual(despues.slice(0,antes.length),antes,'las filas anteriores siguen iguales');
    assert.equal(despues.length,antes.length+1);
    assert.ok(!a.google.log.some(x=>x.u.includes('sheets')&&(x.m==='DELETE'||/clear|deleteDimension/.test(JSON.stringify(x.b||'')))));
  }finally{ a.cerrar(); }
});
test('RN-28 borrar un registro solo lo oculta (también en «Ocultos») y no cambia los días',async()=>{
  const a=await conSesion();
  try{
    await a.tocarDia('2026-10-08'); const id=a.getS().log[0].id;
    await a.clic('#history .log-del'); await a.avanzar(100);
    const S=a.getS();
    assert.equal(S.data['2026-10-08'],'office'); assert.equal(S.hidden[id],1); assert.equal(S.log.length,0);
    const oc=a.google.hojas.get(S.sheetId).tabs.find(t=>t.title==='Ocultos').filas;
    assert.equal(oc.at(-1)[0],id);
    const hist=a.google.hojas.get(S.sheetId).tabs.find(t=>t.title==='Historial').filas;
    assert.ok(hist.some(f=>f[2]===id),'el registro igual llegó a la hoja');
  }finally{ a.cerrar(); }
});
test('RN-29 un cambio ya explicado por el último registro del día no se registra dos veces',()=>{
  const log=[{d:'2026-10-01',ts:1,to:'office'},{d:'2026-10-01',ts:5,to:'vacation'},{d:'2026-10-02',ts:9,to:null}];
  assert.equal(K.explained(log,'2026-10-01','vacation'),true);
  assert.equal(K.explained(log,'2026-10-01','office'),false);
  assert.equal(K.explained(log,'2026-10-02',null),true);
  assert.equal(K.explained(log,'2026-10-03','office'),false);
  assert.equal(K.ultimoRegistro(log,'2026-10-01'),5);
});
test('RN-29 en la app: lo que otro dispositivo ya registró no se duplica como «Calendar»; lo editado en Calendar sí queda',async()=>{
  const fila=(id,d,to)=>['','',id,'INFO','MARCAR','Manual',d,'','','','','','','','','','otro','','','','','',JSON.stringify({id,ts:ms('2026-10-06T08:00:00'),d,from:null,to,src:'manual',dev:'otro'})];
  const a=await conSesion({antes:({google})=>{
    google.archivos.set('f070',{id:'f070',name:'Office Tracker · Historial',mimeType:'application/vnd.google-apps.spreadsheet',modifiedTime:'2026-10-01T00:00:00.000Z',trashed:false});
    google.hojas.set('f070',{tabs:[{sheetId:1,title:'Historial',filas:[['t'],fila('o1','2026-10-09','office')]},{sheetId:2,title:'Ocultos',filas:[['t']]}]});
  }},[eventoDia('2026-10-09','office'),eventoDia('2026-10-13','vacation')]);
  try{
    const log=plano(a.getS().log);
    assert.deepEqual(log.filter(e=>e.d==='2026-10-09').map(e=>e.src),['manual'],'solo el registro original del otro dispositivo');
    assert.deepEqual(log.filter(e=>e.d==='2026-10-13').map(e=>e.src),['calendar'],'editado directo en Calendar');
    assert.equal(a.getS().data['2026-10-09'],'office');
  }finally{ a.cerrar(); }
});
test('RN-23 en la app: con tiempo real, marcar un día lo escribe al instante en Firestore',async()=>{
  const a=await app({conFirebase:true});
  try{
    await a.clic('#btn-fb-in'); await a.avanzar(100);
    await a.tocarDia('2026-10-08');
    const w=plano(a.fb.st.escrituras).filter(([t,p])=>t==='set'&&p==='users/u1/days/2026-10-08');
    assert.equal(w.length,1); assert.equal(w[0][2].type,'office'); assert.equal(w[0][2].ts,a.reloj.ahora);
  }finally{ a.cerrar(); }
});
test('RN-30 el historial guarda hasta 1000 registros y el evento de Calendar los últimos 10 del día',async()=>{
  const log=Array.from({length:1005},(_,i)=>({id:`id${i}`,ts:1000+i,d:'2026-09-01',from:null,to:'office',src:'manual',dev:'x'}));
  const a=await conSesion({ls:{'ot-data-v2':{v:3,data:{},log}}});
  try{
    await a.tocarDia('2026-10-08');
    assert.equal(a.getS().log.length,1000);
    for(let i=0;i<11;i++) await a.tocarDia('2026-10-09');
    await a.avanzar(6000);
    const ev=a.google.vivos(a.getS().calId).find(e=>e.start?.date==='2026-10-09');
    assert.equal(ev.description.split('\n').filter(l=>/ · disp\. /.test(l)).length,10);
  }finally{ a.cerrar(); }
});
// ── Utilidades de fechas que usan las reglas ──
test('fechas: claves, semana ISO y formato ISO con zona',()=>{
  assert.equal(F.toKey(d(2026,1,5)),'2026-01-05');
  assert.equal(F.toKey(F.fromKey('2028-02-29')),'2028-02-29');
  assert.ok(F.esClave('2026-10-07')); assert.ok(!F.esClave('2026-02-30')); assert.ok(!F.esClave('2026-13-01')); assert.ok(!F.esClave('7/10/2026')); assert.ok(!F.esClave(null));
  assert.equal(F.isoWeek('2026-10-07'),'2026-W41'); assert.equal(F.isoWeek('2021-01-03'),'2020-W53'); assert.equal(F.isoWeek('2024-12-30'),'2025-W01');
  assert.equal(F.isoTs(ms('2026-10-03T21:29:05.123')),'2026-10-03T21:29:05.123-05:00');
  assert.equal(tipoValido('office'),true); assert.equal(tipoValido(null),true); assert.equal(tipoValido('otro'),false);
});
