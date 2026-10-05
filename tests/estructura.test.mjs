// REGLAS DE ARQUITECTURA (README §4): que la estructura no se degrade con el tiempo.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { RAIZ } from './entorno/cargar.mjs';

const JS=path.join(RAIZ,'js');
const archivos=(dir=JS)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?archivos(path.join(dir,e.name)):e.name.endsWith('.js')?[path.join(dir,e.name)]:[]);
const rel=f=>path.relative(JS,f).replaceAll('\\','/');
const todos=archivos().map(rel).sort();
const fuente=r=>fs.readFileSync(path.join(JS,r),'utf8');
const importsDe=r=>[...fuente(r).matchAll(/^import\s[^;]*?from\s+'([^']+)'/gm)].map(m=>path.posix.normalize(path.posix.join(path.posix.dirname(r),m[1])));
const capa=r=>r.split('/')[0].replace('.js','');

test('cada módulo de js/ está en la lista del service worker (para abrir sin internet) y viceversa',()=>{
  const sw=fs.readFileSync(path.join(RAIZ,'sw.js'),'utf8');
  const lista=JSON.parse(sw.match(/const JS = (\[[\s\S]*?\]);/)[1].replaceAll("'",'"').replace(/,\s*\]/,']')).map(x=>`${x}.js`).sort();
  assert.deepEqual(lista,todos);
});

test('la versión de la app es la misma en sw.js y en nucleo/constantes.js',()=>{
  const v1=fs.readFileSync(path.join(RAIZ,'sw.js'),'utf8').match(/const VERSION = '(v\d+)'/)[1];
  const v2=fuente('nucleo/constantes.js').match(/APP_VER='(v\d+)'/)[1];
  assert.equal(v1,v2);
});

test('index.html carga un solo módulo de la app: js/app.js',()=>{
  const html=fs.readFileSync(path.join(RAIZ,'index.html'),'utf8');
  const locales=[...html.matchAll(/<script\b[^>]*\bsrc="(?!https?:)([^"]+)"[^>]*>/g)];
  assert.equal(locales.length,1);
  assert.equal(locales[0][1],'js/app.js');
  assert.match(locales[0][0],/type="module"/);
  assert.ok(!/<script>(?!\s*<\/script>)/.test(html),'sin código en línea');
});

test('todo módulo es alcanzable desde app.js (no hay archivos sueltos) y todo import existe',()=>{
  const vistos=new Set(), pila=['app.js'];
  while(pila.length){ const r=pila.pop(); if(vistos.has(r)) continue; vistos.add(r);
    for(const i of importsDe(r)){ assert.ok(fs.existsSync(path.join(JS,i)),`${r} importa ${i}, que no existe`); pila.push(i); } }
  assert.deepEqual([...vistos].sort(),todos);
});

test('el núcleo es puro: no usa pantalla, red, almacenamiento ni librerías externas',()=>{
  const prohibido=/\b(document|window|localStorage|sessionStorage|fetch|navigator|location|firebase|google|console|setTimeout|setInterval|crypto|matchMedia|history)\b/;
  for(const r of todos.filter(r=>r.startsWith('nucleo/'))){
    const codigo=fuente(r).replace(/\/\/.*$/gm,'').replace(/`[^`]*`|'[^']*'/g,'""');
    const m=codigo.match(prohibido);
    assert.equal(m,null,`${r} usa «${m?.[0]}»`);
    for(const i of importsDe(r)) assert.ok(i.startsWith('nucleo/'),`${r} importa ${i}: el núcleo solo puede importar del núcleo`);
  }
});

test('las capas solo dependen hacia adentro',()=>{
  const permitido={
    nucleo:['nucleo'],
    estado:['nucleo','estado','adaptadores'],
    adaptadores:['nucleo','estado','adaptadores'],
    ui:['nucleo','estado','adaptadores','ui','funcionalidades'],
    funcionalidades:['nucleo','estado','adaptadores','ui','funcionalidades'],
  };
  for(const r of todos.filter(r=>r!=='app.js'))
    for(const i of importsDe(r)) assert.ok(permitido[capa(r)].includes(capa(i)),`${r} (capa ${capa(r)}) no debería importar ${i}`);
  // estado solo usa los adaptadores básicos (errores y aleatorio), no Google ni Firebase
  for(const r of todos.filter(r=>r.startsWith('estado/')))
    for(const i of importsDe(r).filter(i=>i.startsWith('adaptadores/'))) assert.ok(['adaptadores/errores.js','adaptadores/aleatorio.js'].includes(i),`${r} importa ${i}`);
  // de ui, solo render.js reúne las vistas de las funcionalidades
  for(const r of todos.filter(r=>r.startsWith('ui/')&&r!=='ui/render.js'))
    assert.ok(!importsDe(r).some(i=>i.startsWith('funcionalidades/')),`${r} no debería importar funcionalidades`);
});

test('solo app.js ejecuta código al cargar; los demás módulos solo declaran',()=>{
  for(const r of todos.filter(r=>r!=='app.js')){
    const lineas=fuente(r).split('\n').filter(l=>/^[A-Za-z_$]/.test(l)&&!/^(import|export|const|let|class|function|async function)\b/.test(l));
    assert.deepEqual(lineas,[],`${r} tiene código suelto al cargar`);
  }
});

test('TYPE_LBL no cambia: sus emojis son los títulos de los eventos que classify() lee de vuelta',()=>{
  assert.match(fuente('nucleo/constantes.js'),/TYPE_LBL=\{office:'🏢 Oficina',vacation:'🏖️ Día libre',null:'Vacío'\}/);
});

test('ningún error se traga en silencio: todo catch vacío está justificado con un comentario',()=>{
  for(const r of todos){
    const vacios=[...fuente(r).matchAll(/catch\s*(\([^)]*\))?\s*\{\s*\}|\.catch\(\s*\(\)\s*=>\s*\{\s*\}\s*\)/g)];
    assert.equal(vacios.length,0,`${r}: catch vacío sin explicación`);
  }
});
