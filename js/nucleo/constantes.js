// ═══════════════════════════════════════════════════════════
// CONSTANTES DE NEGOCIO Y CONFIGURACIÓN (sin dependencias)
// ═══════════════════════════════════════════════════════════
export const UNDO_MS=5000, HORIZON=21;                   // RN-12 deshacer · RN-16 días con avisos
// RN-01: meta según el mes (la fila más reciente cuyo «desde» ya llegó). base = visitas al mes · sem = cuota por semana
// (una semana con festivo o día libre tiene sem−1). Para cambiar la regla, agrega una fila; los meses anteriores no cambian.
export const METAS=[{desde:'0000-01',base:8,sem:2},{desde:'2026-11',base:12,sem:3}];
export const APP_ID='scotiatech-office-tracker', CAL_NAME='Office Tracker', TZ='America/Bogota';
// app.created: solo calendarios que crea esta app. calendarlist.readonly: ver la lista de calendarios
// (solo nombres) para encontrar el «Office Tracker» que otro dispositivo ya creó y no duplicarlo.
// drive.file: solo archivos que crea esta app (la hoja «Office Tracker · Historial»), no el resto de tu Drive.
export const SCOPES=['https://www.googleapis.com/auth/calendar.app.created','https://www.googleapis.com/auth/calendar.calendarlist.readonly',
  'https://www.googleapis.com/auth/drive.file'];
export const SCOPE=SCOPES.join(' ');
export const LEGACY_SCOPE='https://www.googleapis.com/auth/calendar.events';   // solo para limpiar eventos de la v2
export const APP_VER='v20';   // igual que VERSION en sw.js: súbelos juntos al publicar
export const HIDE_TAB='Ocultos';   // ids de registros borrados en la app (para que se oculten en todos los dispositivos)
export const SHEET_NAME='Office Tracker · Historial', SHEET_TAB='Historial', FOLDER_NAME='office-tracker';   // Mi unidad/office-tracker/
// RN-15: avisos de cada día hábil (hora de Bogotá)
export const SLOTS=[
  {id:'r10',h:10,m:0, label:'10:00 a. m.',title:'¿Vas a la oficina hoy?'},
  {id:'r16',h:16,m:30,label:'4:30 p. m.', title:'¿Fuiste a la oficina hoy?'}
];
export const slotOf=id=>SLOTS.find(s=>s.id===id);
// RN-18: respuestas con un toque desde el aviso (…&a=office|none|vacation), en el orden en que aparecen en el evento
export const RESPUESTAS={office:'🏢 Fui a la oficina',none:'❌ Hoy no fui',vacation:'🏖️ Día libre'};
export const NOTA_NO_FUI='Hoy no fui';   // RN-19: nota del registro; con ella los otros dispositivos saben que ese día no hay que avisar
export const MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
export const DAYS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
export const DOW=['dom','lun','mar','mié','jue','vie','sáb'];
export const DOW_L=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
// No cambiar TYPE_LBL: sus emojis son los títulos de los eventos en Calendar y classify() los lee de vuelta
export const TYPE_LBL={office:'🏢 Oficina',vacation:'🏖️ Día libre',null:'Vacío'};
export const TYPE_UI={office:'Oficina',vacation:'Día libre',null:'Vacío'};
export const TIPOS=['office','vacation'];   // estados válidos de un día marcado (vacío = null)
