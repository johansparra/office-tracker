// EQUIVALENCIA: la versión nueva se comporta exactamente igual que la v15.
// Cada escenario se ejecuta en las dos versiones con el mismo reloj, los mismos datos y el mismo Google/Firebase falsos.
// Después de cada paso se compara una foto completa: estado S, localStorage, el HTML de cada tarjeta,
// cada llamada a Google (método, URL y cuerpo, en orden), cada escritura en Firestore y cada diálogo.

import test from 'node:test';
import assert from 'node:assert/strict';
import { correr, normalizar, primeraDiferencia } from './entorno/correr.mjs';
import { ESCENARIOS, escenarioAleatorio } from './escenarios.mjs';

const ALEATORIOS=[...Array.from({length:12},(_,i)=>escenarioAleatorio(i+1)),...Array.from({length:6},(_,i)=>escenarioAleatorio(100+i,{conGoogle:false}))];

for(const esc of [...ESCENARIOS,...ALEATORIOS]){
  test(`igual que v15 · ${esc.nombre}`,async()=>{
    const ref=await correr(esc,'referencia'), nueva=await correr(esc,'nueva');
    assert.deepEqual(ref.errores,[],'la versión de referencia no debería tener errores sin controlar en este escenario');
    assert.deepEqual(nueva.errores,[],'la versión nueva tuvo errores sin controlar');
    assert.ok(ref.fotos.length>0,'el escenario no tomó fotos');
    assert.equal(nueva.fotos.length,ref.fotos.length);
    for(let i=0;i<ref.fotos.length;i++){
      const d=primeraDiferencia(normalizar(ref.fotos[i]),normalizar(nueva.fotos[i]));
      if(d) assert.fail(`foto ${i+1} de ${ref.fotos.length} distinta → ${d}`);
    }
  });
}
