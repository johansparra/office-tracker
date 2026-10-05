// Escenarios de uso de la app. Cada uno se ejecuta igual contra la versión de referencia (v15) y la nueva;
// `f()` toma una foto completa del estado (S, localStorage, pantalla, llamadas a Google, escrituras en Firestore).

import { prng } from './entorno/reloj.mjs';

export const INICIO='2026-10-07T09:00:00';   // miércoles 7 de octubre de 2026, 9:00 a. m.
const ms=s=>new Date(s).getTime();
export const SCOPE='https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/calendar.calendarlist.readonly https://www.googleapis.com/auth/drive.file';
export const CID='cid-prueba.apps.googleusercontent.com';
const tokenGuardado=(inicio=INICIO)=>({token:'tok-pre',exp:ms(inicio)+50*60*1000,scope:SCOPE});
const sig=k=>{ const d=new Date(`${k}T00:00:00`); d.setDate(d.getDate()+1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const eventoDia=(k,tipo,extra={})=>({summary:tipo==='office'?'🏢 Oficina':tipo==='vacation'?'🏖️ Día libre':tipo,start:{date:k},end:{date:sig(k)},
  extendedProperties:{private:{appId:'scotiatech-office-tracker',kind:'day',type:tipo}},...extra});
const eventoAviso=(k,slot,nonce)=>({summary:'¿Vas a la oficina hoy?',start:{dateTime:`${k}T${slot==='r10'?'10:00':'16:30'}:00`,timeZone:'America/Bogota'},
  end:{dateTime:`${k}T${slot==='r10'?'10:05':'16:35'}:00`,timeZone:'America/Bogota'},extendedProperties:{private:{appId:'scotiatech-office-tracker',kind:'reminder',date:k,slot,nonce}}});
const reg=(id,d,from,to,src,ts,extra={})=>({id,ts:ms(ts),dev:'beef',from,to,src,d,...extra});

// Sesión de Google vigente y, opcionalmente, un calendario ya creado con eventos
function conSesion({calendario=true,eventos=[],hoja=false,inicio=INICIO,extraLs={}}={}){
  return {
    inicio,
    ls:{'ot-gcal-cid':CID,'ot-gcal-token':tokenGuardado(inicio),...extraLs},
    antes:({w,google})=>{
      google.tokens.add('tok-pre');
      if(calendario){
        const c=google.crearCalendario('Office Tracker');
        for(const ev of eventos) google.crearEvento(c,typeof ev==='function'?ev(c):ev);
        w.localStorage.setItem('ot-cal-id',c);
      }
      if(hoja) hoja(google,w);
    },
  };
}
const unir=(a,b)=>({...a,...b,ls:{...a.ls,...b.ls},antes:x=>{ a.antes?.(x); b.antes?.(x); }});

export const ESCENARIOS=[
  { nombre:'arranque sin datos ni Google', pasos:async(a,f)=>{ f(); await a.avanzar(61000); f(); } },

  { nombre:'RN-11 ciclo de toques: hábil, festivo y fin de semana', pasos:async(a,f)=>{
    for(let i=0;i<3;i++){ await a.tocarDia('2026-10-07'); f(); }
    for(let i=0;i<2;i++){ await a.tocarDia('2026-10-12'); f(); }   // festivo Día de la Raza
    for(let i=0;i<2;i++){ await a.tocarDia('2026-10-10'); f(); }   // sábado
    await a.tocarDia('2026-10-01'); await a.tocarDia('2026-10-31'); f();
    await a.avanzar(6000); f();
  }},

  { nombre:'RN-12 deshacer dentro y fuera de los 5 segundos', pasos:async(a,f)=>{
    await a.tocarDia('2026-10-08'); f();
    await a.avanzar(2000); await a.clic('#toast-undo'); f();
    await a.avanzar(6000); f();
    await a.tocarDia('2026-10-09'); await a.avanzar(6000); await a.clic('#toast-undo'); f();
    await a.tocarDia('2026-10-09'); await a.tocarDia('2026-10-13'); await a.clic('#toast-undo'); f();
  }},

  { nombre:'teclado, mantener presionado y cerrar hojas', pasos:async(a,f)=>{
    await a.tecla(a.celda('2026-10-14'),'Enter'); f();
    await a.tecla(a.celda('2026-10-14'),' '); f();
    await a.tecla(a.celda('2026-10-14'),'a'); f();
    await a.mantenerDia('2026-10-14'); f();
    await a.clic('#sheet-close'); f();
    await a.mantenerDia('2026-10-12'); await a.tecla(a.w.document,'Escape'); f();
    await a.mantenerDia('2026-10-15'); await a.clic('#sheet'); f();
    await a.mantenerDia('2026-10-15'); await a.clic('#sheet-body'); f();
  }},

  { nombre:'navegar meses con botones y deslizando (incluye cambio de año)', pasos:async(a,f)=>{
    for(let i=0;i<3;i++){ await a.clic('#btn-next'); f(); }
    for(let i=0;i<5;i++){ await a.clic('#btn-prev'); f(); }
    await a.deslizar(-100); f(); await a.deslizar(100); f();
    await a.deslizar(30); f(); await a.deslizar(-100,90); f();
    for(let i=0;i<14;i++) await a.clic('#btn-next'); f();
  }},

  { nombre:'historial: ver más, borrar uno, borrar todos (cancelar y aceptar), borrar desde el día', pasos:async(a,f)=>{
    for(const k of ['2026-10-01','2026-10-02','2026-10-05','2026-10-06','2026-10-07','2026-10-08','2026-10-09']){ await a.tocarDia(k); await a.avanzar(6000); }
    await a.tocarDia('2026-10-07'); await a.avanzar(6000); f();
    await a.clic('#btn-log-more'); f(); await a.clic('#btn-log-more'); f();
    await a.clic('#history .log-row'); f(); await a.clic('#sheet-close');
    await a.tecla('#history .log-row','Enter'); f(); await a.tecla(a.w.document,'Escape');
    await a.clic('#history .log-del'); f();
    a.confirmar(false); await a.clic('#btn-log-clear'); f();
    await a.mantenerDia('2026-10-07'); await a.clic('#sheet-body .log-del'); f();
    a.confirmar(true); await a.clic('#btn-log-clear'); f();
  }},

  { nombre:'datos guardados (v3) con historial, pendientes y avisos', op:{ls:{
      'ot-data-v2':{v:3,data:{'2026-10-01':'office','2026-10-02':'office','2026-10-05':'vacation','2026-09-30':'office'},
        evIds:{'2026-10-01':'x1'},pending:{'2026-10-02':true},log:[reg('a1','2026-10-01',null,'office','manual','2026-10-01T08:00:00'),
          reg('a2','2026-10-02',null,'office','notif','2026-10-02T10:01:00',{slot:'r10',ok:'ok',ref:'abc123'}),reg('a3','2026-10-05',null,'vacation','calendar','2026-10-05T07:00:00',{up:true})],
        rem:{},nonces:{abc123:{d:'2026-10-02',slot:'r10'}},skip:{'2026-10-06':true},legacy:{},logOut:[],sheetId:null,account:null,hidden:{},hideOut:[]},
      'ot-dev':'cafe'}},
    pasos:async(a,f)=>{ f(); await a.mantenerDia('2026-10-02'); f(); await a.clic('#btn-prev'); f(); } },

  { nombre:'migración desde la versión 2', op:{ls:{'ot-data-v2':{data:{'2026-10-01':'office','2026-10-02':'vacation'},evIds:{'2026-10-01':'old1','2026-10-02':'old2'}}}},
    pasos:async(a,f)=>{ f(); } },

  { nombre:'RN-18/19 aviso con código verificado → Fui a la oficina', op:{url:'http://localhost:8765/?d=2026-10-07&r=r10&n=abcdef12',
      ls:{'ot-data-v2':{v:3,data:{},nonces:{abcdef12:{d:'2026-10-07',slot:'r10'}}}}},
    pasos:async(a,f)=>{ f(); await a.clic('[data-pick="office"]'); f(); await a.avanzar(6000); f(); } },

  { nombre:'RN-18 aviso con código de otro día → Día libre', op:{url:'http://localhost:8765/?d=2026-10-08&r=r16&n=abcdef12',
      ls:{'ot-data-v2':{v:3,data:{},nonces:{abcdef12:{d:'2026-10-07',slot:'r10'}}}}},
    pasos:async(a,f)=>{ f(); await a.clic('[data-pick="vacation"]'); f(); } },

  { nombre:'RN-19 aviso sin verificar → Hoy no fui', op:{url:'http://localhost:8765/?d=2026-10-09&r=r10&n=0123abcd'},
    pasos:async(a,f)=>{ f(); await a.clic('[data-pick="none"]'); f(); await a.avanzar(6000); f(); } },

  { nombre:'aviso con parámetros raros y cerrar', op:{url:'http://localhost:8765/?d=2026-10-09&r=r99&n=ZZ'},
    pasos:async(a,f)=>{ f(); await a.clic('[data-pick="close"]'); f(); } },

  { nombre:'aviso de un día ya marcado (confirmar)', op:{url:'http://localhost:8765/?d=2026-10-05&r=r16&n=abcdef12',
      ls:{'ot-data-v2':{v:3,data:{'2026-10-05':'office'},nonces:{abcdef12:{d:'2026-10-05',slot:'r16'}}}}},
    pasos:async(a,f)=>{ await a.clic('[data-pick="office"]'); f(); } },

  { nombre:'conectar Google por primera vez (calendario, avisos y hoja nuevos)', pasos:async(a,f)=>{
    await a.tocarDia('2026-10-05'); await a.avanzar(6000);
    await a.clic('#btn-connect'); f();
    a.$('#cid-input').value=`  ${CID}  `; await a.clic('#modal-save'); await a.avanzar(500); f();
    await a.tocarDia('2026-10-08'); f(); await a.avanzar(6000); f();
    await a.tocarDia('2026-10-08'); await a.tocarDia('2026-10-08'); await a.avanzar(6000); f();
  }},

  { nombre:'ventana del Client ID: cancelar, tocar afuera, Escape y vacío', pasos:async(a,f)=>{
    await a.clic('#btn-connect'); await a.clic('#modal-cancel'); await a.avanzar(300); f();
    await a.clic('#btn-connect'); await a.clic('#modal'); await a.avanzar(300); f();
    await a.clic('#btn-connect'); await a.tecla(a.w.document,'Escape'); await a.avanzar(300); f();
    await a.clic('#btn-connect'); a.$('#cid-input').value='   '; await a.clic('#modal-save'); f();
  }},

  { nombre:'RN-21/22/25 sesión con calendario existente: importar, duplicados, títulos libres y pendientes', ...conSesion({eventos:[
      eventoDia('2026-10-01','office'), eventoDia('2026-10-02','vacation'),
      eventoDia('2026-10-05','office'), eventoDia('2026-10-05','office'),
      {summary:'Reunión en el edificio',start:{date:'2026-10-06'},end:{date:'2026-10-07'}},
      {summary:'Vacaciones familia',start:{date:'2026-10-13'},end:{date:'2026-10-14'}},
      {...eventoDia('2026-10-14','office'),status:'cancelled'},
      eventoDia('2026-11-03','office'),
      eventoAviso('2026-10-01','r10','11111111'), eventoAviso('2026-10-08','r10','22222222'), eventoAviso('2026-10-08','r10','33333333'),
    ],extraLs:{'ot-data-v2':{v:3,data:{'2026-10-02':'office','2026-10-09':'office','2026-10-15':'vacation'},evIds:{},pending:{'2026-10-02':true,'2026-10-15':true},log:[],rem:{},nonces:{},skip:{},legacy:{},logOut:[],hidden:{},hideOut:[]}}}),
    pasos:async(a,f)=>{ f(); await a.clic('#btn-next'); f(); await a.clic('#btn-prev'); f(); } },

  { nombre:'RN-20 dos calendarios «Office Tracker» se unen en uno', op:{
      ls:{'ot-gcal-cid':CID,'ot-gcal-token':tokenGuardado()},
      antes:({google})=>{ google.tokens.add('tok-pre');
        const c1=google.crearCalendario('Office Tracker'), c2=google.crearCalendario('Office Tracker'); google.crearCalendario('Otro');
        google.crearEvento(c1,eventoDia('2026-10-01','office')); google.crearEvento(c2,eventoDia('2026-10-02','vacation'));
        google.crearEvento(c2,eventoAviso('2026-10-08','r10','44444444')); google.crearEvento(c2,{...eventoDia('2026-10-03','office'),status:'cancelled'}); }},
    pasos:async(a,f)=>{ f(); } },

  { nombre:'RN-24 el calendario guardado ya no existe en Google: se crea otro y se sube todo', op:{
      ls:{'ot-gcal-cid':CID,'ot-gcal-token':tokenGuardado(),'ot-cal-id':'borrado@group.calendar.google.com',
        'ot-data-v2':{v:3,data:{'2026-10-01':'office','2026-10-02':'vacation'},evIds:{'2026-10-01':'viejo1'},pending:{},log:[],rem:{},nonces:{},skip:{},legacy:{},logOut:[],hidden:{},hideOut:[]}},
      antes:({google})=>google.tokens.add('tok-pre')},
    pasos:async(a,f)=>{ f(); } },

  { nombre:'detección de cambios cada 10 s (Calendar y hoja de otro dispositivo)', ...conSesion({eventos:[eventoDia('2026-10-01','office')]}),
    pasos:async(a,f)=>{
      f();
      const cal=a.getS().calId;
      await a.avanzar(10000); f();
      a.google.crearEvento(cal,eventoDia('2026-10-02','office')); await a.avanzar(10000); f();
      a.google.borrarEvento(cal,a.google.vivos(cal).find(e=>e.start?.date==='2026-10-01').id); await a.avanzar(10000); f();
      const ev=a.google.vivos(cal).find(e=>e.start?.date==='2026-10-02'); a.google.editarEvento(cal,ev.id,{summary:'🏖️ Día libre'}); await a.avanzar(10000); f();
      // otro dispositivo escribe en la hoja
      const hoja=a.getS().sheetId; const t=a.google.hojas.get(hoja).tabs.find(x=>x.title==='Historial');
      t.filas.push(['2026-10-07T09:00:00.000-05:00','','zz11','INFO','MARCAR','Manual','2026-10-16','viernes','2026-W42','—','Vacío','Oficina','—','—','—','Manual (toque en la app)','dd00','—','—','v15','America/Bogota','',JSON.stringify({id:'zz11',ts:ms('2026-10-07T09:00:00'),d:'2026-10-16',from:null,to:'office',src:'manual',dev:'dd00'})]);
      a.google.archivos.get(hoja).modifiedTime=new Date(a.reloj.ahora).toISOString();
      await a.avanzar(10000); f();
      await a.avanzar(5*60*1000); f();
    }},

  { nombre:'errores de Google: API apagada, permisos, red y sesión vencida', ...conSesion({}),
    pasos:async(a,f)=>{
      f();
      a.google.fallar(r=>r.url.includes('calendarList'),403,{reason:'accessNotConfigured',message:'Google Calendar API has not been used in project 1 before or it is disabled.'},1);
      await a.clic('#btn-sync'); f();
      a.google.fallar(r=>r.url.includes('sheets.googleapis'),403,{reason:'insufficientPermissions',message:'Request had insufficient authentication scopes.'},1);
      await a.clic('#btn-sync'); f();
      a.google.fallar(r=>r.url.includes('drive/v3'),500,{reason:'backendError',message:'Backend Error'},1);
      await a.clic('#btn-sync'); f();
      a.google.fallarRed(r=>r.url.includes('/events'),2);
      await a.clic('#btn-sync'); f();
      a.google.fallarRed(r=>r.url.includes('calendarList'),1);
      await a.clic('#btn-sync'); f();
      await a.tocarDia('2026-10-20'); a.google.fallar(r=>r.metodo==='POST',401,{reason:'authError',message:'Invalid Credentials'},1);
      await a.avanzar(6000); f();
    }},

  { nombre:'RN-20 sin red al buscar el calendario la primera vez: no se crea ninguno', op:{
      ls:{'ot-gcal-cid':CID,'ot-gcal-token':tokenGuardado()}, antes:({google})=>{ google.tokens.add('tok-pre'); google.fallarRed(r=>r.url.includes('calendarList'),1); }},
    pasos:async(a,f)=>{ f(); await a.clic('#btn-sync'); f(); } },

  { nombre:'permisos de Google: parciales, rechazados, ventana cerrada y reconectar', op:{ls:{'ot-gcal-cid':CID},
      antes:({gis})=>{ gis.respuestas.push('parcial','ok','error','cerrado','falla'); }},
    pasos:async(a,f)=>{
      f();
      await a.clic('#btn-reconnect'); f();
      await a.clic('#btn-reconnect'); await a.avanzar(500); f();
      a.getS().token=null; a.getS().tokenExp=0; a.w.localStorage.removeItem('ot-gcal-token');
      await a.clic('#btn-sync'); f();
      await a.clic('#btn-reconnect'); f();
      await a.clic('#btn-reconnect'); f();
      await a.clic('#btn-reconnect'); f();
    }},

  { nombre:'desconectar: cancelar, solo olvidar y borrando el calendario', ...conSesion({eventos:[eventoDia('2026-10-01','office')]}),
    pasos:async(a,f)=>{
      a.confirmar(false); await a.clic('#btn-disconnect'); f();
      a.confirmar(true,false); await a.clic('#btn-disconnect'); f();
      await a.clic('#btn-connect'); a.$('#cid-input').value=CID; await a.clic('#modal-save'); await a.avanzar(500); f();
      a.confirmar(true,true); await a.clic('#btn-disconnect'); f();
    }},

  { nombre:'cambiar de Client ID con la sesión vencida', op:{ls:{'ot-gcal-cid':CID,'ot-cal-id':'c001@group.calendar.google.com',
      'ot-data-v2':{v:3,data:{'2026-10-01':'office'},evIds:{'2026-10-01':'e1'},pending:{},log:[],rem:{},nonces:{},skip:{},legacy:{},logOut:[],sheetId:'f009',hidden:{},hideOut:[]}}},
    pasos:async(a,f)=>{
      f(); await a.clic('#btn-cid'); f();
      a.$('#cid-input').value=CID; await a.clic('#modal-save'); await a.avanzar(500); f();
      await a.clic('#btn-disconnect'); a.confirmar(true,false); await a.clic('#btn-disconnect'); f();
      await a.clic('#btn-connect'); a.$('#cid-input').value='otro-cid.apps.googleusercontent.com'; await a.clic('#modal-save'); await a.avanzar(500); f();
    }},

  { nombre:'salir y volver a la app, internet y foco', ...conSesion({}),
    pasos:async(a,f)=>{
      await a.tocarDia('2026-10-21'); await a.tocarDia('2026-10-22'); f();
      await a.ocultar(true); f();
      await a.avanzar(20000); await a.ocultar(false); f();
      await a.evento('online'); f();
      await a.avanzar(11000); await a.evento('focus'); f();
      await a.evento('focus'); f();
    }},

  { nombre:'pasar la medianoche con la app abierta', op:{inicio:'2026-10-07T23:59:30'},
    pasos:async(a,f)=>{ f(); await a.avanzar(90000); f(); await a.avanzar(24*3600*1000); f(); } },

  { nombre:'RN-10 días obligatorios: alerta «sí o sí» y aviso de las 10:00', ...conSesion({inicio:'2026-10-26T08:00:00',
      extraLs:{'ot-data-v2':{v:3,data:{'2026-10-05':'office','2026-10-06':'office'},evIds:{},pending:{},log:[],rem:{},nonces:{},skip:{},legacy:{},logOut:[],hidden:{},hideOut:[]}}}),
    pasos:async(a,f)=>{ f(); await a.tocarDia('2026-10-26'); await a.avanzar(6000); f(); await a.tocarDia('2026-10-26'); await a.tocarDia('2026-10-26'); await a.avanzar(6000); f(); await a.tocarDia('2026-10-27'); await a.tocarDia('2026-10-27'); await a.avanzar(6000); f(); } },

  { nombre:'RN-09 mensajes: vas bien, poco margen, no alcanzas, cumplida y mes cerrado', op:{inicio:'2026-10-19T08:00:00'},
    pasos:async(a,f)=>{
      f();
      for(const k of ['2026-10-01','2026-10-02','2026-10-05']){ await a.tocarDia(k); } f();
      for(const k of ['2026-10-19','2026-10-20','2026-10-21','2026-10-22']){ await a.tocarDia(k); } f();
      for(const k of ['2026-10-19','2026-10-20']){ await a.tocarDia(k); await a.tocarDia(k); } f();
      for(const k of ['2026-10-23','2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-06']){ await a.tocarDia(k); await a.tocarDia(k); } f();
      await a.clic('#btn-prev'); f(); await a.clic('#btn-next'); await a.clic('#btn-next'); f();
    }},

  { nombre:'limpieza única de eventos de la versión 2', op:{
      ls:{'ot-gcal-cid':CID,'ot-gcal-token':tokenGuardado(),'ot-data-v2':{data:{'2026-10-01':'office'},evIds:{'2026-10-01':'p1','2026-10-02':'p2','2026-10-03':'p3'}}},
      antes:({google,gis})=>{ google.tokens.add('tok-pre'); google.crearEvento('primary',{id:'p1',summary:'x'}); google.crearEvento('primary',{id:'p2',summary:'y'});
        gis.respuestas.push('ok'); google.fallarRed(r=>r.url.endsWith('/primary/events/p3'),1); }},
    pasos:async(a,f)=>{ f(); await a.clic('#btn-legacy'); await a.avanzar(200); f(); } },

  { nombre:'historial compartido desde la hoja (filas JSON, filas viejas y ocultos)', ...conSesion({hoja:(google,w)=>{
      google.archivos.set('f050',{id:'f050',name:'Office Tracker · Historial',mimeType:'application/vnd.google-apps.spreadsheet',modifiedTime:'2026-10-01T00:00:00.000Z',trashed:false});
      google.hojas.set('f050',{tabs:[{sheetId:5,title:'Historial',filas:[['titulos'],
        ['2026-10-02T08:00:00.000-05:00','','r001','INFO','MARCAR','Manual','2026-10-02','viernes','2026-W40','—','Vacío','Oficina','—','—','—','x','aa11','—','—','v9','America/Bogota','',JSON.stringify({id:'r001',ts:ms('2026-10-02T08:00:00'),d:'2026-10-02',from:null,to:'office',src:'manual',dev:'aa11'})],
        ['2026-10-03T08:00:00.000-05:00','','r002','WARN','MARCAR','Aviso ⚠','2026-10-05','lunes','2026-W41','—','Vacío','Día libre','4:30 p. m.','No coincide','abcd1234','Aviso · Hoy no fui','aa11'],
        ['2026-10-04T08:00:00.000-05:00','','r003','INFO','DESMARCAR','Deshecho','2026-10-06','martes','2026-W41','—','Oficina','Vacío'],
        ['malo','','','','','','no-fecha'],
        ['2026-10-04T09:00:00.000-05:00','','r004','INFO','MARCAR','Calendar','2026-10-07','mié','','','Vacío','Oficina','','','','','bb22','','','','','','{json roto'],
        ['2026-10-04T10:00:00.000-05:00','','r005','INFO','MARCAR','Manual','2026-10-08','jue','','','Vacío','Oficina']]},
        {sheetId:6,title:'Ocultos',filas:[['ID evento'],['r005','2026-10-05T00:00:00.000-05:00','aa11']]}]});
    }}),
    pasos:async(a,f)=>{ f(); await a.mantenerDia('2026-10-05'); f(); } },

  { nombre:'borrar registros con sesión: se suben a la hoja y a «Ocultos»', ...conSesion({}),
    pasos:async(a,f)=>{
      await a.tocarDia('2026-10-08'); await a.tocarDia('2026-10-09'); f();
      await a.clic('#history .log-del'); f();
      await a.avanzar(6000); f();
      await a.clic('#history .log-del'); f();
    }},

  { nombre:'la hoja guardada ya no existe: se crea otra', ...conSesion({extraLs:{'ot-data-v2':{v:3,data:{},evIds:{},pending:{},log:[],rem:{},nonces:{},skip:{},legacy:{},logOut:[],sheetId:'f404',hidden:{},hideOut:[]}}}),
    pasos:async(a,f)=>{ f(); a.google.archivos.get(a.getS().sheetId).trashed=true; await a.tocarDia('2026-10-08'); await a.avanzar(6000); f(); } },

  { nombre:'hoja encontrada por nombre con pestañas renombradas: se repara', ...conSesion({hoja:google=>{
      google.archivos.set('f060',{id:'f060',name:'Office Tracker · Historial',mimeType:'application/vnd.google-apps.spreadsheet',modifiedTime:'2026-10-01T00:00:00.000Z',trashed:false});
      google.hojas.set('f060',{tabs:[{sheetId:1,title:'Mis notas',filas:[]},{sheetId:2,title:'Otra',filas:[]}]});
    }}),
    pasos:async(a,f)=>{ f(); await a.tocarDia('2026-10-08'); await a.avanzar(6000); f(); } },

  { nombre:'RN-29 cambio de otro dispositivo que llega por Calendar y por la hoja: no se registra dos veces', ...conSesion({
      eventos:[eventoDia('2026-10-09','office'),eventoDia('2026-10-13','vacation'),eventoDia('2026-10-14','office')],
      hoja:google=>{
        google.archivos.set('f070',{id:'f070',name:'Office Tracker · Historial',mimeType:'application/vnd.google-apps.spreadsheet',modifiedTime:'2026-10-01T00:00:00.000Z',trashed:false});
        const fila=(id,d,to,ts)=>['','',id,'INFO','MARCAR','Manual',d,'','','','','','','','','','otro','','','','','',JSON.stringify({id,ts:ms(ts),d,from:null,to,src:'manual',dev:'otro'})];
        google.hojas.set('f070',{tabs:[{sheetId:1,title:'Historial',filas:[['t'],fila('o1','2026-10-09','office','2026-10-06T08:00:00'),fila('o2','2026-10-14','vacation','2026-10-06T09:00:00')]},{sheetId:2,title:'Ocultos',filas:[['t']]}]});
      }}),
    pasos:async(a,f)=>{
      f();
      const cal=a.getS().calId, ev=a.google.vivos(cal).find(e=>e.start?.date==='2026-10-09');
      a.google.borrarEvento(cal,ev.id);
      const t=a.google.hojas.get(a.getS().sheetId).tabs.find(x=>x.title==='Historial');
      t.filas.push(['','','o3','INFO','DESMARCAR','Manual','2026-10-09','','','','','','','','','','otro','','','','','',JSON.stringify({id:'o3',ts:a.reloj.ahora,d:'2026-10-09',from:'office',to:null,src:'manual',dev:'otro'})]);
      a.google.archivos.get(a.getS().sheetId).modifiedTime=new Date(a.reloj.ahora).toISOString();
      await a.avanzar(10000); f();
    }},

  { nombre:'RN-23/29 con Firebase: margen de 5 s, edición posterior en Calendar y cambio ya explicado', conFirebase:true, ...conSesion({
      eventos:[eventoDia('2026-10-14','vacation',{updated:'2026-10-07T13:00:03.000Z'}),eventoDia('2026-10-15','vacation',{updated:'2026-10-07T13:00:08.000Z'}),
        eventoDia('2026-10-16','office',{updated:'2026-10-07T13:00:09.000Z'})],
      extraLs:{'ot-data-v2':{v:3,data:{'2026-10-14':'office','2026-10-15':'office'},evIds:{},pending:{},log:[],rem:{},nonces:{},skip:{},legacy:{},logOut:[],hidden:{},hideOut:[]}}}),
    // tiempo real ya activo desde antes de abrir la app (sesión de Firebase guardada)
    firebase:{}, fbAntes:fb=>{ fb.iniciarSesion();
      fb.sembrar('users/u1/days/2026-10-14',{type:'office',ts:ms('2026-10-07T08:00:00'),dev:'otro'});
      fb.sembrar('users/u1/days/2026-10-15',{type:'office',ts:ms('2026-10-07T08:00:00'),dev:'otro'});
      fb.sembrar('users/u1/log/x16',{id:'x16',ts:ms('2026-10-07T08:00:05'),d:'2026-10-16',from:null,to:'office',src:'manual',dev:'otro'}); },
    pasos:async(a,f)=>{
      await a.avanzar(100); f();
      await a.clic('#btn-sync'); f();
      await a.tocarDia('2026-10-20'); f(); await a.avanzar(6000); f();
    }},

  { nombre:'RN-23 tiempo real: entrar, migrar, cambios remotos, conflictos y salir', conFirebase:true, ...conSesion({eventos:[eventoDia('2026-10-01','office')],
      extraLs:{'ot-data-v2':{v:3,data:{'2026-10-01':'office','2026-10-02':'vacation','2026-10-05':'office'},evIds:{},pending:{},
        log:[reg('l1','2026-10-02',null,'vacation','manual','2026-10-02T08:00:00'),reg('l2','2026-10-05',null,'office','manual','2026-10-05T08:00:00')],
        rem:{},nonces:{},skip:{},legacy:{},logOut:[],hidden:{h0:1},hideOut:[]}}}),
    pasos:async(a,f)=>{
      a.fb.sembrar('users/u1/days/2026-10-05',{type:'vacation',ts:ms('2026-10-06T08:00:00'),dev:'otro'});
      a.fb.sembrar('users/u1/days/2026-10-02',{type:'office',ts:ms('2026-10-01T08:00:00'),dev:'otro'});
      a.fb.sembrar('users/u1/log/r1',{id:'r1',ts:ms('2026-10-06T08:00:00'),d:'2026-10-05',from:'office',to:'vacation',src:'manual',dev:'otro'});
      a.fb.sembrar('users/u1/hidden/h9',{ts:1,dev:'otro'});
      f();
      await a.clic('#btn-fb-in'); await a.avanzar(100); f();
      a.fb.remoto('users/u1/days/2026-10-20',{type:'office',ts:a.reloj.ahora,dev:'otro'}); await a.esperar(); f();
      await a.tocarDia('2026-10-21'); f();
      a.fb.remoto('users/u1/days/2026-10-21',{type:null,ts:a.reloj.ahora-1000,dev:'otro'}); await a.esperar(); f();
      a.fb.remoto('users/u1/log/r2',{id:'r2',ts:a.reloj.ahora,d:'2026-10-20',from:null,to:'office',src:'manual',dev:'otro'}); await a.esperar(); f();
      a.fb.remoto('users/u1/hidden/r2',{ts:a.reloj.ahora,dev:'otro'}); await a.esperar(); f();
      await a.avanzar(6000); f();
      const cal=a.getS().calId;
      a.google.crearEvento(cal,eventoDia('2026-10-22','office')); await a.avanzar(61000); f();
      await a.clic('#history .log-del'); f();
      a.confirmar(false); await a.clic('#btn-fb-out'); f();
      a.confirmar(true); await a.clic('#btn-fb-out'); await a.avanzar(100); f();
    }},

  { nombre:'tiempo real: ventana cerrada por el usuario y sin permiso', conFirebase:true,
    pasos:async(a,f)=>{
      f();
      for(const p of ['auth/popup-closed-by-user','auth/cancelled-popup-request','auth/popup-blocked','auth/unauthorized-domain','permission-denied','auth/otro-error']){
        a.fb.st.popup=p; await a.clic('#btn-fb-in'); f(); }
      a.fb.st.popup='ok'; await a.clic('#btn-fb-in'); await a.avanzar(100); f();
    } },
];

// ── Escenarios aleatorios: secuencias de acciones generadas con semilla, iguales en las dos versiones ──
export function escenarioAleatorio(semilla,{conGoogle=true,pasos=45}={}){
  const base=conGoogle?conSesion({eventos:[eventoDia('2026-10-01','office'),eventoDia('2026-10-16','vacation')]}):{};
  return { nombre:`aleatorio #${semilla}${conGoogle?' con Google':' sin Google'}`, ...base, semilla,
    pasos:async(a,f)=>{
      const r=prng(semilla*7919);
      const elegir=xs=>xs[Math.floor(r()*xs.length)];
      for(let i=0;i<pasos;i++){
        const x=r(), celdas=[...a.w.document.querySelectorAll('.day-cell[data-ts]')];
        if(x<0.45) await a.clic(elegir(celdas));
        else if(x<0.52) await a.clic('#toast-undo');
        else if(x<0.58) await a.clic(elegir(['#btn-next','#btn-prev']));
        else if(x<0.75) await a.avanzar(Math.floor(r()*70000));
        else if(x<0.79){ a.w.document.querySelector('#sheet').style.display==='flex'?await a.clic('#sheet'):await a.mantenerDia(new Date(+elegir(celdas).dataset.ts).toISOString().slice(0,10)); }
        else if(x<0.84&&a.$('#history .log-del')) await a.clic('#history .log-del');
        else if(x<0.88){ await a.ocultar(true); await a.avanzar(3000); await a.ocultar(false); }
        else if(x<0.94&&conGoogle&&a.getS().calId&&a.google.calendarios.has(a.getS().calId)){
          const cal=a.getS().calId, vivos=a.google.vivos(cal).filter(e=>e.start?.date);
          if(vivos.length&&r()<0.5) a.google.borrarEvento(cal,elegir(vivos).id);
          else a.google.crearEvento(cal,eventoDia(`2026-10-${String(1+Math.floor(r()*28)).padStart(2,'0')}`,r()<0.5?'office':'vacation'));
        }
        else if(a.$('#btn-sync')&&!a.$('#btn-sync').disabled) await a.clic('#btn-sync');
        f();
      }
    }};
}
