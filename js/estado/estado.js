// ═══════════════════════════════════════════════════════════
// ESTADO GLOBAL: un solo objeto S con todo lo que la app sabe, y la fecha de hoy
// ═══════════════════════════════════════════════════════════
import { today } from '../nucleo/fechas.js';

export let now=today();   // hoy a las 00:00 (se actualiza al pasar la medianoche)
export function setNow(d){ now=d; }

export const S={ year:now.getFullYear(), month:now.getMonth(),
  data:{}, evIds:{}, pending:{}, log:[], logOut:[], sheetId:null, account:null, hidden:{}, hideOut:[], fs:{}, rem:{}, nonces:{}, skip:{}, legacy:{},
  token:null, tokenExp:0, cid:null, calId:null, calChecked:false, dev:null,
  syncing:0, busy:0, step:'', lastSync:0, lastError:null, showAllLog:false };
