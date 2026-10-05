// Ejecuta un escenario contra una versión y compara fotos entre versiones.
import { cargarApp } from './cargar.mjs';

const OPCIONES=['ls','antes','inicio','url','conFirebase','firebase','semilla','conGoogle','conGIS'];

export async function correr(esc,impl){
  const op={...(esc.op||{})};
  for(const k of OPCIONES) if(esc[k]!==undefined) op[k]=esc[k];
  if(esc.fbAntes){ const prev=op.antes; op.antes=x=>{ prev?.(x); esc.fbAntes(x.fb); }; }   // preparar Firebase antes de abrir la app
  const a=await cargarApp({...op,impl});
  const fotos=[];
  try{ await esc.pasos(a,()=>fotos.push(a.foto())); }
  finally{ a.cerrar(); }
  return {fotos,errores:a.errores(),consola:a.consola};
}

// La versión de la app cambia a propósito (v15 → la actual); todo lo demás debe ser idéntico
import fs from 'node:fs';
import { RAIZ } from './cargar.mjs';
export const APP_VER=fs.readFileSync(`${RAIZ}/js/nucleo/constantes.js`,'utf8').match(/APP_VER='(v\d+)'/)[1];
export const normalizar=x=>JSON.parse(JSON.stringify(x).replaceAll(`"${APP_VER}"`,'"v15"'));

// Primera diferencia entre dos valores, con la ruta, para que el fallo diga exactamente qué cambió
export function primeraDiferencia(a,b,ruta='raíz'){
  if(a===b) return null;
  const ta=Array.isArray(a)?'array':typeof a, tb=Array.isArray(b)?'array':typeof b;
  if(ta!==tb||a===null||b===null||ta!=='object'&&ta!=='array') return `${ruta}: referencia=${corto(a)} · nueva=${corto(b)}`;
  if(ta==='array'){
    for(let i=0;i<Math.max(a.length,b.length);i++){ const d=primeraDiferencia(a[i],b[i],`${ruta}[${i}]`); if(d) return d; }
    return null;
  }
  for(const k of new Set([...Object.keys(a),...Object.keys(b)])){ const d=primeraDiferencia(a[k],b[k],`${ruta}.${k}`); if(d) return d; }
  return null;
}
const corto=v=>{ const s=JSON.stringify(v); return s===undefined?'undefined':s.length>300?s.slice(0,300)+'…':s; };
