// ═══════════════════════════════════════════════════════════
// TARJETA DE GOOGLE, CHIP DEL ENCABEZADO Y BARRA DE SINCRONIZACIÓN
// ═══════════════════════════════════════════════════════════
import { S } from '../../estado/estado.js';
import { hasToken, pendingCount } from '../../estado/almacenamiento.js';
import { fmtClock } from '../../nucleo/fechas.js';
import { sheetUrl } from '../../adaptadores/google-sheets.js';
import { fbListo, usuario } from '../../adaptadores/firestore.js';
import { IC } from '../../ui/iconos.js';
import { isBusy, syncAll } from '../sincronizacion/sincronizar.js';
import { showModal, connect, disconnect, cleanupLegacy, fbSignIn, fbSignOut } from './sesion.js';

export function renderConexion(){
  const gb=document.getElementById('gcal-bar'), chip=document.getElementById('sync-chip');
  const pc=pendingCount(), lc=Object.keys(S.legacy).length;
  const err=S.lastError?`<span class="gcal-err">${S.lastError}</span>`:'';
  const busy=isBusy(), fbUser=usuario();
  document.getElementById('topbar').classList.toggle('on',busy);
  const rt=!fbListo()?'':fbUser
    ?`<br><span class="rt-on">${IC.bolt}Tiempo real · ${fbUser.email||''}</span> · <button class="gcal-link" id="btn-fb-out">Salir</button>`
    :`<br><button class="gcal-link" id="btn-fb-in">${IC.bolt}Activar tiempo real</button>`;
  if(hasToken()){
    gb.innerHTML=`<div class="gcal-ic">${IC.cal}</div>
    <div class="gcal-status"><strong>${busy?'<i class="dot sync pulse"></i>':S.lastError?'<i class="dot warn"></i>':pc?'<i class="dot sync"></i>':'<i class="dot ok"></i>'}Google Calendar</strong>
      ${busy?(S.step||'Sincronizando…'):S.lastError?'No se pudo sincronizar':pc?`${pc} cambio${pc>1?'s':''} por subir`:`Al día${S.lastSync?` · ${fmtClock(S.lastSync)}`:''}`}${err}
      ${lc?`<button class="gcal-link" id="btn-legacy">Borrar ${lc} evento${lc>1?'s':''} viejo${lc>1?'s':''} del calendario principal</button><br>`:''}
      ${S.sheetId?`<a class="gcal-link" href="${sheetUrl()}" target="_blank" rel="noopener">Ver log en Google Sheets</a> · `:''}<button class="gcal-link" id="btn-disconnect">Desconectar</button>${rt}</div>
    <button class="gcal-btn press ${busy?'syncing':''}" id="btn-sync" aria-label="Sincronizar" ${busy?'disabled':''}>${IC.sync}${busy?'':'Sync'}</button>`;
    chip.innerHTML=`<span class="chip">${busy?`<span class="spin">${IC.sync}</span>Sincronizando`:S.lastError?'<i class="dot warn"></i>Error':pc?`<i class="dot sync"></i>${pc} por subir`:fbUser?`<i class="dot ok"></i>${IC.bolt}En vivo`:'<i class="dot ok"></i>Al día'}</span>`;
  } else if(S.cid){
    gb.innerHTML=`<div class="gcal-ic">${IC.cal}</div>
    <div class="gcal-status"><strong><i class="dot warn"></i>Sesión vencida</strong>
      ${pc?`${pc} cambio${pc>1?'s':''} esperando para subir`:'Reconecta para seguir sincronizando'}${err}
      <br><button class="gcal-link" id="btn-cid">Cambiar Client ID</button> · <button class="gcal-link" id="btn-disconnect">Desconectar</button>${rt}</div>
    <button class="gcal-btn primary press" id="btn-reconnect">Reconectar</button>`;
    chip.innerHTML=`<span class="chip"><i class="dot warn"></i>${pc?`${pc} sin subir`:'Sin sesión'}</span>`;
  } else {
    gb.innerHTML=`<div class="gcal-ic">${IC.cal}</div>
    <div class="gcal-status"><strong><i class="dot"></i>Google Calendar</strong>Sincroniza tus días y recibe avisos a las 10:00 y 4:30${rt}</div>
    <button class="gcal-btn primary press" id="btn-connect">${IC.link}Conectar</button>`;
    chip.innerHTML=`<span class="chip"><i class="dot"></i>Solo local</span>`;
  }
  document.getElementById('btn-connect')?.addEventListener('click',showModal);
  document.getElementById('btn-cid')?.addEventListener('click',showModal);
  document.getElementById('btn-reconnect')?.addEventListener('click',connect);
  document.getElementById('btn-sync')?.addEventListener('click',syncAll);
  document.getElementById('btn-legacy')?.addEventListener('click',cleanupLegacy);
  document.getElementById('btn-disconnect')?.addEventListener('click',disconnect);
  document.getElementById('btn-fb-in')?.addEventListener('click',fbSignIn);
  document.getElementById('btn-fb-out')?.addEventListener('click',fbSignOut);
}
