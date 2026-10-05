// ═══════════════════════════════════════════════════════════
// RENDER: dibuja toda la pantalla desde S. Cada parte se dibuja por separado:
// si una falla, se reporta y las demás siguen funcionando.
// ═══════════════════════════════════════════════════════════
import { S, now } from '../estado/estado.js';
import { calcularMes } from '../nucleo/meta.js';
import { seguro } from '../adaptadores/errores.js';
import { renderMes } from '../funcionalidades/mes/vista.js';
import { renderHistorial } from '../funcionalidades/historial/tarjeta.js';
import { renderConexion } from '../funcionalidades/conexion/tarjeta.js';
import { afterRender } from './movimiento.js';

export function render(){
  const s=calcularMes(S.data,S.year,S.month,now);
  seguro('Dibujar el resumen y el calendario',()=>renderMes(s));
  seguro('Dibujar el historial',renderHistorial);
  seguro('Dibujar la tarjeta de Google',renderConexion);
  seguro('Animar el resumen',()=>afterRender(s));
}
