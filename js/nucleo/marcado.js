// ═══════════════════════════════════════════════════════════
// MARCAR UN DÍA (RN-11): a qué estado pasa un día con cada toque
//   Día hábil:            vacío → 🏢 → 🏖️ → vacío
//   Festivo entre semana: vacío → 🏢 → vacío
//   Fin de semana:        vacío → 🏖️ → vacío
// ═══════════════════════════════════════════════════════════
import { TIPOS } from './constantes.js';
import { isWeekend } from './fechas.js';
import { getHol } from './festivos.js';

export function siguienteEstado(date,cur){
  if(isWeekend(date)) return cur==='vacation'?null:'vacation';
  if(getHol(date)) return cur==='office'?null:'office';
  return !cur?'office':cur==='office'?'vacation':null;
}
// ¿Es un estado válido para un día? (null/undefined = vacío)
export const tipoValido=t=>t==null||TIPOS.includes(t);
