// CAMBIOS A PROPÓSITO DESDE LA V15
// La prueba de equivalencia compara la versión actual con la copia congelada de la v15. Algunas reglas cambiaron
// a propósito; para seguir comparando todo lo demás, la versión actual se carga con estas líneas como eran en la v15.
// Cada cambio tiene sus propias pruebas en reglas.test.mjs. Si editas una de estas líneas en js/, actualiza aquí `de`:
// la carga falla si una línea no aparece exactamente una vez.

export const COMO_V15=[
  { regla:'RN-01 meta desde noviembre 2026 (12 al mes, 3 por semana)', archivo:'nucleo/constantes.js',
    de:/export const METAS=\[.*\];/, a:"export const METAS=[{desde:'0000-01',base:8,sem:2}];" },
  { regla:'RN-18 enlaces para responder con un toque', archivo:'nucleo/avisos.js',
    de:"  const resp=Object.entries(RESPUESTAS).map(([a,t])=>`${t}\\n${link}&a=${a}`).join('\\n\\n');\n  return `Responde con un toque:\\n\\n${resp}\\n\\nVer todas las opciones:\\n${link}`;",
    a:"  return `Toca el enlace para registrar el día:\\n${link}`;" },
  { regla:'RN-17/19 qué avisos sobran y «Hoy no fui» de otros dispositivos', archivo:'funcionalidades/avisos/programar.js',
    de:"  const skip=noFui(), sobra=avisoSobra(key,S.data,skip,toKey(now));   // RN-17",
    a:"  const skip=S.skip, sobra=key<toKey(now)||key>toKey(addD(now,HORIZON))?!!(S.data[key]||S.skip[key]):true;" },
  { regla:'RN-17 buscar avisos viejos sin límite de fecha', archivo:'funcionalidades/avisos/programar.js',
    de:"  const items=await listEvents({timeMax:to.toISOString(),privateExtendedProperty:'kind=reminder'});",
    a:"  const items=await listEvents({timeMin:addD(now,-7).toISOString(),timeMax:to.toISOString(),privateExtendedProperty:'kind=reminder'});" },
  { regla:'RN-17 borrar los avisos de días que pasaron o ya respondidos', archivo:'funcionalidades/avisos/programar.js',
    de:"if(fresh[k]||!p.date||avisoSobra(p.date,S.data,skip,hoy)){",
    a:"if(fresh[k]||!p.date||p.date<toKey(addD(now,-1))){" },
  { regla:'RN-18 poner los enlaces nuevos en los avisos que ya existían', archivo:'funcionalidades/avisos/programar.js',
    de:"    if(p.nonce&&!ev.description?.includes('&a=')){ const r=await actualizarEvento(ev.id,{description:textoAviso(`${APP_URL}?d=${p.date}&r=${p.slot}&n=${p.nonce}`)}); if(r?.notFound) delete fresh[k]; }",
    a:"" },
  { regla:'RN-17 olvidar los avisos viejos guardados', archivo:'funcionalidades/avisos/programar.js',
    de:"  for(const k of Object.keys(S.rem)) if(k.split('|')[0]<=b) delete S.rem[k];",
    a:"  for(const k of Object.keys(S.rem)){ const d=k.split('|')[0]; if(d>=toKey(addD(now,-7))&&d<=b) delete S.rem[k]; }" },
];

const contar=(src,de)=>typeof de==='string'?src.split(de).length-1:(src.match(new RegExp(de.source,'g'))||[]).length;

// rel: ruta dentro de js/ con «/» (por ejemplo 'nucleo/avisos.js') · usados: índices de COMO_V15 ya aplicados
export function aplicarComoV15(rel,src,usados){
  COMO_V15.forEach((c,i)=>{
    if(c.archivo!==rel) return;
    const n=contar(src,c.de);
    if(n!==1) throw new Error(`comoV15 «${c.regla}»: se esperaba 1 coincidencia en js/${rel} y hay ${n}. Actualiza tests/entorno/como-v15.mjs`);
    src=src.replace(c.de,()=>c.a); usados.add(i);
  });
  return src;
}
export function verificarComoV15(usados){
  const faltan=COMO_V15.filter((_,i)=>!usados.has(i)).map(c=>`${c.regla} (js/${c.archivo})`);
  if(faltan.length) throw new Error(`comoV15: no se aplicaron: ${faltan.join(' · ')}`);
}
