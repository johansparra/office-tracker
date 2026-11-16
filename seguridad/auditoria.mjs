// ═══════════════════════════════════════════════════════════
// AUDITORÍA DE SEGURIDAD OBLIGATORIA ANTES DE CADA COMMIT DE LA APP
// La auditoría la hace la skill security-audit (.claude/skills/security-audit) en Claude Code.
// Este script no audita: valida el resultado, guarda la huella del código auditado y,
// desde el hook pre-commit (.githooks/pre-commit), bloquea el commit si el código de la app
// que se va a commitear no es exactamente el auditado o si quedan hallazgos confirmados.
//   node seguridad/auditoria.mjs validar <carpeta-del-run>    valida findings.json y coverage-ledger.json
//   node seguridad/auditoria.mjs registrar <carpeta-del-run>  valida y escribe seguridad/ultima-auditoria.json
//   node seguridad/auditoria.mjs verificar                    lo llama el hook pre-commit
//   node seguridad/auditoria.mjs huella                       huella del código de la app en disco
// Los informes se quedan FUERA del repo (~/security-audit-skill/office-tracker/run-N):
// GitHub Pages publica todo el repositorio y no deben quedar vulnerabilidades a la vista.
// ═══════════════════════════════════════════════════════════
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const RAIZ=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const SKILL=join(RAIZ,'.claude/skills/security-audit');
const MARCA='seguridad/ultima-auditoria.json';
const APP=['index.html','sw.js','manifest.json','css','js'];   // lo que corre en el navegador
const MAX_BYTES=8*1024*1024;

const git=(args,input)=>execFileSync('git',['-c','core.quotePath=false',...args],{cwd:RAIZ,encoding:'utf8',input,maxBuffer:64*1024*1024,stdio:['pipe','pipe','pipe']});
const sha=t=>createHash('sha256').update(t).digest('hex');
const lineas=t=>t.split('\n').filter(Boolean);

// ═══ Huella: sha256 de «blob ruta» de cada archivo de la app, ordenado ═══
// Con core.autocrlf, git hash-object aplica el mismo filtro que git add, así que la huella
// del disco coincide con la del índice cuando el archivo se agrega sin cambios.
function huellaDisco(){
  const rutas=lineas(git(['ls-files','-co','--exclude-standard','--',...APP])).filter(r=>existsSync(join(RAIZ,r))).sort();
  const blobs=lineas(git(['hash-object','--stdin-paths'],rutas.join('\n')+'\n'));
  return sha(rutas.map((r,i)=>`${blobs[i]} ${r}`).join('\n'));
}
function huellaIndice(){
  const filas=lineas(git(['ls-files','-s','--',...APP])).map(l=>{ const [meta,r]=l.split('\t'); return `${meta.split(' ')[1]} ${r}`; });
  return sha(filas.sort((a,b)=>a.split(' ')[1]<b.split(' ')[1]?-1:1).join('\n'));
}

// ═══ Lectura segura: archivo regular, sin enlaces, con tamaño máximo ═══
// Los validadores de la skill exigen O_NOFOLLOW/O_NONBLOCK, que Windows no tiene; por eso se
// usan sus funciones validateDocument() con esta lectura equivalente (lstat antes de leer).
function leerJson(ruta){
  if(!existsSync(ruta)) throw new Error(`no existe ${ruta}`);
  const st=lstatSync(ruta);
  if(!st.isFile()||st.isSymbolicLink()||st.nlink!==1) throw new Error(`${ruta} no es un archivo regular`);
  if(st.size>MAX_BYTES) throw new Error(`${ruta} pasa de ${MAX_BYTES} bytes`);
  return JSON.parse(readFileSync(ruta,'utf8'));
}

function validar(run){
  const req=createRequire(join(SKILL,'x.cjs'));
  const hallazgos=req('./validate-findings.cjs'), cobertura=req('./validate-coverage-ledger.cjs');
  const findings=leerJson(join(run,'findings.json')), ledger=leerJson(join(run,'coverage-ledger.json'));
  const meta=leerJson(join(run,'run-metadata.json'));
  const errores=[
    ...hallazgos.validateDocument(findings,req('./report-schema.json')).map(e=>'findings.json: '+e),
    ...cobertura.validateDocument(ledger).map(e=>'coverage-ledger.json: '+e),
  ];
  return { findings, ledger, meta, errores };
}

const sev=f=>f.severity?.overall?.score??f.severity?.overall??'?';

// ═══ Comandos ═══
const [cmd,arg]=process.argv.slice(2);
const salir=(cod,...msg)=>{ for(const m of msg) (cod?console.error:console.log)(m); process.exit(cod); };

if(cmd==='huella') salir(0,huellaDisco());

if(cmd==='validar'||cmd==='registrar'){
  if(!arg) salir(1,`Uso: node seguridad/auditoria.mjs ${cmd} <carpeta-del-run>`);
  const run=resolve(arg);
  let r; try{ r=validar(run); }catch(e){ salir(1,`No se pudo validar ${run}: ${e.message}`); }
  if(r.errores.length) salir(1,...r.errores.map(e=>'ERROR: '+e),`FALLA: ${r.errores.length} error(es) de validación`);
  const n=v=>r.findings.filter(f=>f.verdict===v);
  console.log(`OK: ${r.findings.length} registros y ${r.ledger.length} unidades de cobertura válidos`);
  if(cmd==='validar') process.exit(0);
  if(r.meta.run_status!=='complete') salir(1,`El run no está completo (run_status: ${r.meta.run_status}${r.meta.incomplete_reason?', '+r.meta.incomplete_reason:''}). Termínalo antes de registrarlo.`);
  const previa=existsSync(join(RAIZ,MARCA))?leerJson(join(RAIZ,MARCA)):{};
  const aceptados=previa.riesgos_aceptados||[];   // [{fingerprint, motivo, fecha}] editados a mano
  const abiertos=n('confirmed').filter(f=>!aceptados.some(a=>a.fingerprint===f.fingerprint));
  const casa=relative(homedir(),run);
  const marca={
    huella:huellaDisco(),
    fecha:new Date().toISOString(),
    version:(readFileSync(join(RAIZ,'js/nucleo/constantes.js'),'utf8').match(/APP_VER\s*=\s*'([^']+)'/)||[])[1]||'?',
    commit_base:git(['rev-parse','--short','HEAD']).trim(),
    run:casa.startsWith('..')?run:'~/'+casa.replace(/\\/g,'/'),
    perfil:r.meta.profile||'?',
    confirmados:n('confirmed').length, por_validar:n('needs_validation').length, descartados:n('rejected').length,
    // solo huella y severidad: los títulos y detalles no se publican
    confirmados_abiertos:abiertos.map(f=>({fingerprint:f.fingerprint,severidad:sev(f)})),
    riesgos_aceptados:aceptados,
  };
  writeFileSync(join(RAIZ,MARCA),JSON.stringify(marca,null,2)+'\n');
  salir(0,`Registrada la auditoría de ${marca.version} en ${MARCA} (${marca.confirmados} confirmados, ${abiertos.length} abiertos, ${marca.por_validar} por validar).`,
    abiertos.length?'Hay hallazgos confirmados abiertos: corrígelos, vuelve a auditar y registra otra vez. El commit seguirá bloqueado.':`Agrégalo al commit: git add ${MARCA}`);
}

if(cmd==='verificar'){
  const cambios=lineas(git(['diff','--cached','--name-only','--',...APP]));
  if(!cambios.length) process.exit(0);   // el commit no toca la app: no hace falta auditoría
  const ayuda=['','Antes de commitear cambios de la app hay que correr la auditoría de seguridad:',
    '  1. En Claude Code: /security-audit (auditoría completa del código actual)',
    '  2. Corregir los hallazgos confirmados y volver a auditar lo corregido',
    `  3. node seguridad/auditoria.mjs registrar <carpeta-del-run> && git add ${MARCA}`];
  let marca; try{ marca=JSON.parse(git(['show',':'+MARCA])); }catch{ salir(1,`✖ Commit bloqueado: ${MARCA} no está en el commit.`,...ayuda); }
  if(marca.huella!==huellaIndice()) salir(1,`✖ Commit bloqueado: el código de la app que vas a commitear no es el que se auditó (${marca.version}, ${marca.fecha.slice(0,10)}).`,
    `  Archivos de la app en este commit: ${cambios.join(', ')}`,...ayuda);
  if(marca.confirmados_abiertos?.length) salir(1,`✖ Commit bloqueado: ${marca.confirmados_abiertos.length} hallazgo(s) confirmado(s) sin corregir:`,
    ...marca.confirmados_abiertos.map(f=>`  - ${f.fingerprint} (${f.severidad})`),`  Detalle en ${marca.run}/REPORT.md`,...ayuda);
  salir(0,`✔ Auditoría de seguridad al día (${marca.version}, ${marca.fecha.slice(0,10)}, ${marca.confirmados} confirmados corregidos o aceptados).`);
}

salir(1,'Uso: node seguridad/auditoria.mjs validar|registrar <carpeta-del-run> | verificar | huella');
