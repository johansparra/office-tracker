// ═══════════════════════════════════════════════════════════
// ARRANQUE DE OFFICE TRACKER
// Arquitectura (ver README §4):
//   nucleo/          reglas de negocio puras (sin pantalla, sin red) → se prueban con node
//   estado/          el estado S y su guardado en el dispositivo
//   adaptadores/     hablan con el exterior: Google, Firebase, crypto, consola
//   funcionalidades/ cada función de la app con su lógica y su pantalla
//   ui/              piezas de interfaz compartidas (render, íconos, animaciones)
// ═══════════════════════════════════════════════════════════
import { S } from './estado/estado.js';
import { load, hasToken } from './estado/almacenamiento.js';
import { APP_VER } from './nucleo/constantes.js';
import { instalarCapturaGlobal, reportar } from './adaptadores/errores.js';
import { whenGIS } from './adaptadores/google-auth.js';
import { render } from './ui/render.js';
import { iniciarNavegacion } from './funcionalidades/mes/navegacion.js';
import { iniciarMarcado } from './funcionalidades/marcar-dia/marcar.js';
import { iniciarConexion, initGIS } from './funcionalidades/conexion/sesion.js';
import { iniciarSincronizacion, syncAll } from './funcionalidades/sincronizacion/sincronizar.js';
import { iniciarTiempoReal } from './funcionalidades/sincronizacion/tiempo-real.js';
import { readDeepLink, openNotifSheet } from './funcionalidades/avisos/enlace.js';

instalarCapturaGlobal();
// Seguridad (clickjacking): dentro de un iframe de otro sitio la app no arranca; GitHub Pages no permite
// enviar frame-ancestors, así que se decide aquí antes de pintar o sincronizar nada.
let enMarco; try{ enMarco=window.top!==window.self; }catch(_){ enMarco=true; }
if(enMarco){
  const p=document.createElement('p'), a=document.createElement('a');
  p.style.cssText='padding:24px;font:16px system-ui'; p.textContent='Abre Office Tracker directamente: ';
  a.href=location.origin+location.pathname; a.target='_top'; a.rel='noopener'; a.textContent='abrir la app';
  p.append(a); document.body.replaceChildren(p);
}else{
// Botones y gestos fijos de la pantalla
iniciarNavegacion();
iniciarMarcado();
iniciarConexion();
// Cuándo sincronizar (temporizadores y eventos del navegador)
iniciarSincronizacion();

if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(e=>reportar('No se pudo registrar el service worker (la app no abrirá sin internet)',e,'warn'));
load();
document.getElementById('app-ver').textContent=APP_VER; document.getElementById('app-ver2').textContent=APP_VER;
document.addEventListener('DOMContentLoaded',iniciarTiempoReal);   // los scripts de Firebase (defer) ya cargaron
const link=readDeepLink();
render();
whenGIS().then(()=>{ if(S.cid) initGIS(); });
if(hasToken()) syncAll();
if(link) openNotifSheet(link);
}
