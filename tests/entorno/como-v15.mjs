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
  { regla:"Pantalla v21: «Semanas con festivo o libre»", archivo:'funcionalidades/mes/vista.js',
    de:"<div class=\"kpi-l\">Semanas con festivo o libre</div>",
    a:"<div class=\"kpi-l\">Semanas con festivo</div>" },
  { regla:"Pantalla v21: «Días hábiles que quedan»", archivo:'funcionalidades/mes/vista.js',
    de:"<div class=\"kpi-l\">Días hábiles que quedan</div>",
    a:"<div class=\"kpi-l\">Días hábiles libres</div>" },
  { regla:"Pantalla v21: cuota por semana según sus días hábiles en el mes", archivo:'funcionalidades/mes/vista.js',
    de:"    const q=cuota(w,year,month), wD=w.visited>=q;\n    return `<div class=\"cal-grid\">\n      ${q?`<div class=\"week-ind ${wD?'done':w.hasAdj?'adj':''}\" role=\"img\" title=\"Semana: ${w.visited} de ${q}\" aria-label=\"Semana: ${w.visited} de ${q}\">${wD?IC.check:w.visited}<small>/${q}</small></div>`:'<div class=\"week-ind none\"></div>'}\n",
    a:"    const wD=w.visited>=w.quota;\n    return `<div class=\"cal-grid\">\n      <div class=\"week-ind ${wD?'done':w.hasAdj?'adj':''}\" title=\"Semana: ${w.visited} de ${w.quota}\">${wD?IC.check:w.visited}<small>/${w.quota}</small></div>\n" },
  { regla:"Pantalla v21: festivos como nota bajo el calendario", archivo:'funcionalidades/mes/vista.js',
    de:"  festEl.innerHTML=s.mHols.map(([k,n])=>{const d=fromKey(k),p=d<now;return `<div class=\"fest-row ${p?'past':''}\">${FLAG}<span class=\"fest-d\">${DOW[d.getDay()]} ${d.getDate()}</span><span class=\"fest-name\">${n}</span><span class=\"fest-meta\">${p?'ya pasó':`esa semana: ${sem-1}`}</span></div>`;}).join('');\n\n",
    a:"  festEl.innerHTML=s.mHols.length?`<div class=\"card-hd\"><span class=\"card-ttl\">Festivos de ${mName}</span><span class=\"card-sub\">${FLAG} automáticos</span></div>`+\n    s.mHols.map(([k,n])=>{const d=fromKey(k),p=d<now;return `<div class=\"fest-row ${p?'past':''}\">\n      <div class=\"fest-date\"><b>${d.getDate()}</b><span>${DOW[d.getDay()]}</span></div>\n      <div><div class=\"fest-name\">${n}</div><div class=\"fest-meta\">${p?'Ya pasó':'Esa semana la cuota baja a 1'}</div></div>\n    </div>`;}).join(''):'';\n\n" },
  { regla:"Pantalla v21: semana a semana plegable, con la cuota del mes", archivo:'funcionalidades/mes/vista.js',
    de:"  document.getElementById('bk-sub').textContent=`cuota ${sem} · ${sem-1} con festivo o libre`;\n  document.getElementById('breakdown').innerHTML=s.ws.filter(w=>cuota(w,year,month)).map(w=>{\n      const q=cuota(w,year,month);\n      const sl=`${w.mon.getDate()} ${MONTHS[w.mon.getMonth()].slice(0,3).toLowerCase()}`,el=`${w.sun.getDate()} ${MONTHS[w.sun.getMonth()].slice(0,3).toLowerCase()}`;\n      const wD=w.visited>=q,p=Math.min(1,w.visited/q);\n      return `<div class=\"bk-row ${wD?'done':w.hasAdj?'adj':''}\">\n        <div class=\"bk-lbl\">${sl} – ${el}</div>\n        <div class=\"bk-bar-w\"><div class=\"bk-bar\" style=\"transform:scaleX(${p})\"></div></div>\n        <div class=\"bk-val\">${w.visited}/${q}</div>\n        <div class=\"bk-ico\">${wD?IC.check:w.hasAdj?FLAG:''}</div>\n      </div>`;\n    }).join('');\n\n",
    a:"  document.getElementById('breakdown').innerHTML=`<div class=\"card-hd\"><span class=\"card-ttl\">Semana a semana</span><span class=\"card-sub\">cuota 2 · 1 con festivo</span></div>`+\n    s.ws.map(w=>{\n      const sl=`${w.mon.getDate()} ${MONTHS[w.mon.getMonth()].slice(0,3).toLowerCase()}`,el=`${w.sun.getDate()} ${MONTHS[w.sun.getMonth()].slice(0,3).toLowerCase()}`;\n      const wD=w.visited>=w.quota,p=w.quota>0?Math.min(1,w.visited/w.quota):1;\n      return `<div class=\"bk-row ${wD?'done':w.hasAdj?'adj':''}\">\n        <div class=\"bk-lbl\">${sl} – ${el}</div>\n        <div class=\"bk-bar-w\"><div class=\"bk-bar\" style=\"transform:scaleX(${p})\"></div></div>\n        <div class=\"bk-val\">${w.visited}/${w.quota}</div>\n        <div class=\"bk-ico\">${wD?IC.check:w.hasAdj?FLAG:''}</div>\n      </div>`;\n    }).join('');\n\n" },
  { regla:"Pantalla v21: «otro dispositivo» completo", archivo:'funcionalidades/historial/tarjeta.js',
    de:"otro dispositivo</span>",
    a:"otro disp.</span>" },
  { regla:"Pantalla v21: borrar un registro tiene «Deshacer»", archivo:'funcionalidades/historial/tarjeta.js',
    de:"borrarConDeshacer([el.dataset.del]); }));",
    a:"deleteLog([el.dataset.del]); }));" },
  { regla:"Pantalla v21: borrar un registro del día tiene «Deshacer» (import)", archivo:'funcionalidades/historial/historial-dia.js',
    de:"import { borrando, borrarConDeshacer } from './registro.js';",
    a:"import { borrando, deleteLog } from './registro.js';" },
  { regla:"Pantalla v21: borrar un registro del día tiene «Deshacer»", archivo:'funcionalidades/historial/historial-dia.js',
    de:"el.addEventListener('click',()=>borrarConDeshacer([el.dataset.del],()=>{ render(); if(document.getElementById('sheet').style.display!=='none') openDaySheet(key); })));",
    a:"el.addEventListener('click',()=>{ deleteLog([el.dataset.del]); openDaySheet(key); }));" },
  { regla:"Pantalla v21: la hoja del aviso no muestra el código («ref»)", archivo:'funcionalidades/avisos/enlace.js',
    de:"      <p>Aviso de las ${sl?.label||'—'} · ${okTxt()}</p>",
    a:"      <p>Aviso de las ${sl?.label||'—'} · ${okTxt()}${link.nonce?`<br><span class=\"ref\">ref ${link.nonce}</span>`:''}</p>" },
  { regla:"RN-19 «Hoy no fui» con «Deshacer» (import)", archivo:'funcionalidades/avisos/enlace.js',
    de:"import { applyChange, avisoConDeshacer } from '../marcar-dia/marcar.js';",
    a:"import { applyChange, showInfo } from '../marcar-dia/marcar.js';" },
  { regla:"RN-19 «Hoy no fui» con «Deshacer», también desde la hoja de opciones", archivo:'funcionalidades/avisos/enlace.js',
    de:"    avisoConDeshacer(`${IC.x}${NOTA_NO_FUI} <small>${fmtDay(link.d)}</small>`,()=>{ if(!antes) delete S.skip[link.d]; deleteLog([e.id]); if(online()) enqueue(()=>syncRemindersForDate(link.d)).then(render); });",
    a:"    if(link.a) showInfo(`${IC.x}${NOTA_NO_FUI} <small>${fmtDay(link.d)}</small>`);" },
  { regla:"Pantalla v21: tarjeta de Google en una línea; las acciones se despliegan", archivo:'funcionalidades/conexion/tarjeta.js',
    de:"    // Conectado: una línea de estado; las acciones se despliegan al tocarla (se recuerda si estaba abierta)\n    const abierta=gb.querySelector('details')?.open;\n    gb.innerHTML=`<details class=\"gcal-d\"${abierta?' open':''}><summary class=\"gcal-sum press\"><div class=\"gcal-ic\">${IC.cal}</div>\n    <div class=\"gcal-status\"><strong>${busy?'<i class=\"dot sync pulse\"></i>':S.lastError?'<i class=\"dot warn\"></i>':pc?'<i class=\"dot sync\"></i>':'<i class=\"dot ok\"></i>'}Google Calendar</strong>\n      ${busy?(S.step||'Sincronizando…'):S.lastError?'No se pudo sincronizar':pc?`${pc} cambio${pc>1?'s':''} por subir`:`Al día${S.lastSync?` · ${fmtClock(S.lastSync)}`:''}`}${err}</div>\n    <span class=\"chev\">${IC.chev}</span></summary>\n    <div class=\"gcal-acts\">\n      <button class=\"btn-s press ${busy?'syncing':''}\" id=\"btn-sync\" ${busy?'disabled':''}>${IC.sync}${busy?'Sincronizando…':'Sincronizar ahora'}</button>\n      ${S.sheetId?`<a class=\"btn-s press\" href=\"${sheetUrl()}\" target=\"_blank\" rel=\"noopener\">${IC.sheet}Ver historial en Google Sheets</a>`:''}\n      ${lc?`<button class=\"btn-s press\" id=\"btn-legacy\">${IC.trash}Borrar ${lc} evento${lc>1?'s':''} viejo${lc>1?'s':''} del calendario principal</button>`:''}\n      ${!fbListo()?'':fbUser?`<div class=\"gcal-rt\"><span class=\"rt-on\">${IC.bolt}Tiempo real · ${esc(fbUser.email)}</span><button class=\"gcal-link\" id=\"btn-fb-out\">Salir</button></div>`\n        :`<button class=\"btn-s press\" id=\"btn-fb-in\">${IC.bolt}Activar tiempo real</button>`}\n      <button class=\"btn-s btn-ghost press\" id=\"btn-disconnect\">Desconectar Google Calendar</button>\n    </div></details>`;\n",
    a:"    gb.innerHTML=`<div class=\"gcal-ic\">${IC.cal}</div>\n    <div class=\"gcal-status\"><strong>${busy?'<i class=\"dot sync pulse\"></i>':S.lastError?'<i class=\"dot warn\"></i>':pc?'<i class=\"dot sync\"></i>':'<i class=\"dot ok\"></i>'}Google Calendar</strong>\n      ${busy?(S.step||'Sincronizando…'):S.lastError?'No se pudo sincronizar':pc?`${pc} cambio${pc>1?'s':''} por subir`:`Al día${S.lastSync?` · ${fmtClock(S.lastSync)}`:''}`}${err}\n      ${lc?`<button class=\"gcal-link\" id=\"btn-legacy\">Borrar ${lc} evento${lc>1?'s':''} viejo${lc>1?'s':''} del calendario principal</button><br>`:''}\n      ${S.sheetId?`<a class=\"gcal-link\" href=\"${sheetUrl()}\" target=\"_blank\" rel=\"noopener\">Ver log en Google Sheets</a> · `:''}<button class=\"gcal-link\" id=\"btn-disconnect\">Desconectar</button>${rt}</div>\n    <button class=\"gcal-btn press ${busy?'syncing':''}\" id=\"btn-sync\" aria-label=\"Sincronizar\" ${busy?'disabled':''}>${IC.sync}${busy?'':'Sync'}</button>`;\n" },
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
