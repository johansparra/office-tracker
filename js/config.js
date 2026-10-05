// ═══════════════════════════════════════════════════════════
// CONSTANTS & STATE
// ═══════════════════════════════════════════════════════════
const BASE=8, UNDO_MS=5000, HORIZON=21;            // HORIZON: días hacia adelante con avisos programados
const LS_DATA='ot-data-v2', LS_CID='ot-gcal-cid', LS_TOK='ot-gcal-token', LS_CAL='ot-cal-id', LS_DEV='ot-dev';
const APP_ID='scotiatech-office-tracker', CAL_NAME='Office Tracker', TZ='America/Bogota';
// app.created: solo calendarios que crea esta app. calendarlist.readonly: ver la lista de calendarios
// (solo nombres) para encontrar el «Office Tracker» que otro dispositivo ya creó y no duplicarlo.
// drive.file: solo archivos que crea esta app (la hoja «Office Tracker · Historial»), no el resto de tu Drive.
const SCOPES=['https://www.googleapis.com/auth/calendar.app.created','https://www.googleapis.com/auth/calendar.calendarlist.readonly',
  'https://www.googleapis.com/auth/drive.file'];
const APP_VER='v15';   // igual que VERSION en sw.js: súbelos juntos al publicar
const HIDE_TAB='Ocultos';   // ids de registros borrados en la app (para que se oculten en todos los dispositivos)
const SHEET_NAME='Office Tracker · Historial', SHEET_TAB='Historial', FOLDER_NAME='office-tracker';   // Mi unidad/office-tracker/
const SCOPE=SCOPES.join(' ');
const LEGACY_SCOPE='https://www.googleapis.com/auth/calendar.events';   // solo para limpiar eventos de la v2
const SLOTS=[
  {id:'r10',h:10,m:0, label:'10:00 a. m.',title:'¿Vas a la oficina hoy?'},
  {id:'r16',h:16,m:30,label:'4:30 p. m.', title:'¿Fuiste a la oficina hoy?'}
];
const APP_URL=location.origin+location.pathname;
const MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const DOW=['dom','lun','mar','mié','jue','vie','sáb'];
const DOW_L=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const FLAG='<i class="co" aria-label="Festivo Colombia"></i>';
const TYPE_LBL={office:'🏢 Oficina',vacation:'🏖️ Día libre',null:'Vacío'};
const TYPE_IC={office:'🏢',vacation:'🏖️',null:'∅'};
// Íconos de la interfaz (los emojis de TYPE_LBL se quedan: classify() los usa en Calendar)
const svg=d=>`<svg class="ic" viewBox="0 0 16 16" aria-hidden="true">${d}</svg>`;
const IC={
  office:svg('<path d="M3.5 14V3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v11M10.5 6.5h1.5a1 1 0 0 1 1 1V14M2 14h12M6 5h2M6 7.5h2M6 10h2"/>'),
  vacation:svg('<circle cx="8" cy="8" r="2.7"/><path d="M8 1.6v1.5M8 12.9v1.5M1.6 8h1.5M12.9 8h1.5M3.5 3.5l1 1M11.5 11.5l1 1M3.5 12.5l1-1M11.5 4.5l1-1"/>'),
  null:svg('<circle cx="8" cy="8" r="5.5"/><path d="M4.2 11.8l7.6-7.6"/>'),
  check:svg('<path d="M3.5 8.5 6.5 11.5 12.5 4.5"/>'),
  ok:svg('<circle cx="8" cy="8" r="6.2"/><path d="M5.3 8.2 7.2 10l3.5-3.8"/>'),
  warn:svg('<path d="M8 2.2 14.2 13H1.8z"/><path d="M8 6.5v3M8 11.2v.1"/>'),
  clock:svg('<circle cx="8" cy="8" r="6.2"/><path d="M8 4.8V8l2.2 1.4"/>'),
  cal:svg('<rect x="2" y="3" width="12" height="11" rx="2.2"/><path d="M2 6.5h12M5.5 1.8v2.4M10.5 1.8v2.4"/>'),
  sync:svg('<path d="M13.2 6.2A5.4 5.4 0 0 0 3.4 4.8M2.8 9.8a5.4 5.4 0 0 0 9.8 1.4"/><path d="M13.4 2.8v3.6H9.8M2.6 13.2V9.6h3.6"/>'),
  link:svg('<path d="M6.8 9.2a2.8 2.8 0 0 0 4 0l2-2a2.8 2.8 0 0 0-4-4l-.9.9M9.2 6.8a2.8 2.8 0 0 0-4 0l-2 2a2.8 2.8 0 0 0 4 4l.9-.9"/>'),
  x:svg('<path d="M4 4l8 8M12 4l-8 8"/>'),
  trash:svg('<path d="M2.8 4.3h10.4M6.3 4.3V2.8h3.4v1.5M4.2 4.3l.6 8.9h6.4l.6-8.9M6.8 6.8v4M9.2 6.8v4"/>'),
  bolt:svg('<path d="M9 1.8 3.6 9h4l-.8 5.2L12.4 7H8.4z"/>'),
  sheet:svg('<rect x="2.5" y="2" width="11" height="12" rx="1.8"/><path d="M2.5 6h11M2.5 10h11M6.5 6v8"/>'),
};
const TYPE_UI={office:'Oficina',vacation:'Día libre',null:'Vacío'};
const tchip=t=>`<span class="tchip t-${t||'null'}">${IC[t||'null']}${TYPE_UI[t||'null']}</span>`;
const tico=t=>`<span class="t-${t||'null'}">${IC[t||'null']}</span>`;

function today(){ const d=new Date(); d.setHours(0,0,0,0); return d; }
let now=today();
const S={ year:now.getFullYear(), month:now.getMonth(),
  data:{}, evIds:{}, pending:{}, log:[], logOut:[], sheetId:null, account:null, hidden:{}, hideOut:[], fs:{}, rem:{}, nonces:{}, skip:{}, legacy:{},
  token:null, tokenExp:0, cid:null, calId:null, calChecked:false, dev:null,
  syncing:0, busy:0, step:'', lastSync:0, lastError:null, showAllLog:false };

