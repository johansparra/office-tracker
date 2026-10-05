// PARIDAD DE FUNCIONES: cada regla extraída al núcleo da exactamente el mismo resultado que la función
// original de la v15, sobre miles de entradas (rangos completos y datos aleatorios con semilla).

import './entorno/zona.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { cargarApp } from './entorno/cargar.mjs';
import { prng } from './entorno/reloj.mjs';
import { APP_VER } from './entorno/correr.mjs';

const F=await import('../js/nucleo/fechas.js');
const { holidays }=await import('../js/nucleo/festivos.js');
const { calcularMes }=await import('../js/nucleo/meta.js');
const { siguienteEstado }=await import('../js/nucleo/marcado.js');
const { avisosDeseados, tituloAviso, cuerpoAviso }=await import('../js/nucleo/avisos.js');
const K=await import('../js/nucleo/conflictos.js');
const R=await import('../js/nucleo/registro.js');

const ref=await cargarApp({impl:'referencia',conGoogle:false,conGIS:false});
const nueva=await cargarApp({impl:'nueva',conGoogle:false,conGIS:false});
test.after(()=>{ ref.cerrar(); nueva.cerrar(); });
const v15=code=>ref.evalRef(code);
const plano=x=>JSON.parse(JSON.stringify(x??null));
const igual=(a,b,msg)=>assert.deepEqual(plano(a),plano(b),msg);
const r=prng(2026);
const dias=(desde,hasta)=>{ const out=[]; for(let d=F.fromKey(desde);F.toKey(d)<=hasta;d=F.addD(d,1)) out.push(F.toKey(d)); return out; };
const tipoAzar=()=>{ const x=r(); return x<0.45?'office':x<0.7?'vacation':null; };

test('festivos: idénticos para todos los años 1900–2200',()=>{
  const h=v15('holidays');
  for(let y=1900;y<=2200;y++) igual(holidays(y),h(y),`año ${y}`);
});

test('meta del mes: idéntica para cada mes 2024–2028 con 30 combinaciones aleatorias de días y fechas de hoy',()=>{
  const stats=v15('(d,y,m,n)=>{ S.data=d; now=n; return stats(y,m); }');
  let casos=0;
  for(let y=2024;y<=2028;y++) for(let m=0;m<12;m++) for(let i=0;i<30;i++){
    const data={};
    for(const k of dias(F.toKey(new Date(y,m,-6)),F.toKey(new Date(y,m+1,6)))) if(r()<0.35){ const t=tipoAzar(); if(t) data[k]=t; }
    const hoy=new Date(y,m,Math.floor(r()*45)-7); hoy.setHours(0,0,0,0);
    igual(calcularMes(data,y,m,hoy),stats({...data},y,m,new ref.w.Date(hoy.getTime())),`${y}-${m+1} caso ${i}`);
    casos++;
  }
  v15('S.data={}; now=today();');
  assert.equal(casos,1800);
});

test('ciclo de toques: idéntico a toggle() de la v15 para cada día de 2026 y cada estado',()=>{
  const toggleV15=v15('(k,cur)=>{ S.data={}; if(cur) S.data[k]=cur; toggle(fromKey(k)); return S.data[k]||null; }');
  for(const k of dias('2026-01-01','2026-12-31')) for(const cur of [null,'office','vacation'])
    assert.equal(siguienteEstado(F.fromKey(k),cur),toggleV15(k,cur),`${k} desde ${cur}`);
  v15('S.data={}; S.log=[]; S.pending={};');
});

test('fechas y formatos: idénticos para cada día 2020–2030 y 2000 horas al azar',()=>{
  const f=v15('({toKey,fromKey,addD,monday,nextMon,isWeekend,fmtDay,fmtDayLong,isoWeek,isoTs,fmtTs,fmtFull,fmtClock})');
  for(const k of dias('2020-01-01','2030-12-31')){
    const d=F.fromKey(k), dr=f.fromKey(k);
    assert.equal(F.toKey(d),f.toKey(dr));
    assert.equal(F.fmtDay(k),f.fmtDay(k)); assert.equal(F.fmtDayLong(k),f.fmtDayLong(k)); assert.equal(F.isoWeek(k),f.isoWeek(k),k);
    assert.equal(F.toKey(F.monday(d)),f.toKey(f.monday(dr))); assert.equal(F.toKey(F.nextMon(d)),f.toKey(f.nextMon(dr)));
    assert.equal(F.isWeekend(d),f.isWeekend(dr));
  }
  for(let i=0;i<2000;i++){
    const ts=Math.floor(new Date(2020,0,1).getTime()+r()*11*365*864e5);
    assert.equal(F.isoTs(ts),f.isoTs(ts)); assert.equal(F.fmtTs(ts),f.fmtTs(ts)); assert.equal(F.fmtFull(ts),f.fmtFull(ts)); assert.equal(F.fmtClock(ts),f.fmtClock(ts));
  }
});

test('interpretar eventos de Calendar: idéntico para todas las combinaciones de título, estado y tipo',()=>{
  const classify=v15('classify');
  const titulos=['','🏢 Oficina','🏖️ Día libre','Oficina','OFICINA','office','Libre','libre de tarea','Vacaciones','vacación','Reunión','Médico','🏢🏖','Oficina libre',null,undefined];
  for(const summary of titulos) for(const status of ['confirmed','cancelled','tentative',undefined]) for(const type of ['office','vacation','otro',undefined]){
    const ev={summary,status,extendedProperties:type?{private:{type}}:undefined};
    assert.equal(K.classify(ev),classify(ev),JSON.stringify(ev));
  }
});

test('textos del origen de un registro: idénticos',()=>{
  const [b,t]=v15('[srcBadge,srcText]');
  for(const src of ['manual','undo','calendar','notif','otro']) for(const ok of ['ok','bad','unknown',undefined]) for(const slot of ['r10','r16','r99',undefined])
    for(const extra of [{},{ref:'abc12345'},{note:'Hoy no fui'},{ref:'x',note:'y'}]){
      const e={src,ok,slot,...extra};
      igual(R.srcBadge(e),b(e)); assert.equal(R.srcText(e),t(e));
    }
});

test('registro ya explicado y último registro: idénticos con 500 historiales al azar',()=>{
  const ex=v15('(log,ds,to)=>{ S.log=log; return [explained(ds,to), lastLogTs(ds)]; }');
  for(let i=0;i<500;i++){
    const log=Array.from({length:Math.floor(r()*8)},()=>({d:`2026-10-0${1+Math.floor(r()*3)}`,ts:Math.floor(r()*20),to:tipoAzar()}));
    for(const ds of ['2026-10-01','2026-10-02','2026-10-03','2026-10-04']) for(const to of ['office','vacation',null])
      igual([K.explained(log,ds,to),K.ultimoRegistro(log,ds)],ex(plano(log),ds,to),JSON.stringify({log,ds,to}));
  }
  v15('S.log=[]');
});

test('qué avisos debe tener cada día, su título y su evento: idénticos para 92 días × 40 situaciones',()=>{
  const [ds,rt,rb]=v15(`[(k,data,skip)=>{ S.data=data; S.skip=skip; return desiredSlots(k); },
    (k,slot,data)=>{ S.data=data; return reminderTitle(k,slot); },
    (k,slot,nonce,data)=>{ S.data=data; return reminderBody(k,slot,nonce); }]`);
  const ahora=new Date(ref.reloj.ahora), hoy=new Date(ahora); hoy.setHours(0,0,0,0);
  const ks=dias('2026-10-01','2026-12-31');
  for(let i=0;i<40;i++){
    const data={}, skip={};
    for(const k of ks){ if(r()<0.25){ const t=tipoAzar(); if(t) data[k]=t; } if(r()<0.05) skip[k]=true; }
    for(const k of ks){
      igual(avisosDeseados(k,data,skip,ahora),ds(k,{...data},{...skip}),k);
      for(const slot of ['r10','r16']){
        assert.equal(tituloAviso(k,slot,data,hoy),rt(k,slot,{...data}),`${k} ${slot}`);
        if(i<3) igual(cuerpoAviso(k,slot,'abcd1234',tituloAviso(k,slot,data,hoy),'http://localhost:8765/'),rb(k,slot,'abcd1234',{...data}));
      }
    }
  }
  v15('S.data={}; S.skip={};');
});

test('filas de la hoja (escribir y leer): idénticas para 400 registros y filas dañadas',()=>{
  const [lr,pr]=v15('[(e,up)=>{ S.dev="cafe"; S.account="yo@gmail.com"; return logRow(e,up); },parseRow]');
  const sh=nueva.mod('adaptadores/google-sheets.js'); const Sn=nueva.getS(); Sn.dev='cafe'; Sn.account='yo@gmail.com';
  for(let i=0;i<400;i++){
    const src=['manual','undo','calendar','notif'][Math.floor(r()*4)];
    const e={id:F.toKey(new Date(2026,0,1+i)).replaceAll('-',''),ts:Math.floor(1.7e12+r()*1e11),d:F.toKey(new Date(2026,0,1+Math.floor(r()*700))),
      from:tipoAzar(),to:tipoAzar(),src,dev:r()<0.5?'cafe':'beef',
      ...(src==='notif'?{slot:['r10','r16'][Math.floor(r()*2)],ok:['ok','bad','unknown'][Math.floor(r()*3)],ref:r()<0.5?'abcd1234':'',note:r()<0.3?'Hoy no fui':undefined}:{})};
    const fila=sh.logRow(e,1.8e12);
    igual(fila.map(x=>x===APP_VER?'v15':x),lr(e,1.8e12),JSON.stringify(e));   // la versión de la app cambia a propósito
    igual(sh.parseRow(fila),pr(fila));
    const vieja=fila.slice(0,22);   // fila sin la columna JSON
    igual(sh.parseRow(vieja),pr(vieja));
  }
  for(const fila of [[],['x'],['2026-10-01T00:00:00Z','','id1','','','Manual','no-fecha'],['malo','','id2','','','','2026-10-01'],
    ['2026-10-01T00:00:00Z','','id3','','','Aviso ✓','2026-10-01','','','','Oficina','Día libre','10:00 a. m.','Verificado','—','x · Hoy no fui','dd'],
    Array(23).fill('').map((_,i)=>i===22?'{roto':'')]) igual(sh.parseRow(fila),pr(fila),JSON.stringify(fila));
});
