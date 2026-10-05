// ═══════════════════════════════════════════════════════════
// AUDITORÍA: cada cambio queda con origen, hora, dispositivo y referencia
// ═══════════════════════════════════════════════════════════
function logChange(e){
  const entry={id:rid(4),ts:Date.now(),dev:S.dev,from:null,to:null,...e};
  S.log.push(entry);
  fsLog(entry);
  if(S.log.length>1000) S.log.splice(0,S.log.length-1000);
  return entry;
}
function srcBadge(e){
  if(e.src==='manual')   return ['b-manual','Manual'];
  if(e.src==='undo')     return ['b-undo','Deshecho'];
  if(e.src==='calendar') return ['b-calendar','Calendar'];
  if(e.src==='notif')    return e.ok==='ok'?['b-ok','Aviso ✓']:e.ok==='bad'?['b-bad','Aviso ⚠']:['b-unk','Aviso ?'];
  return ['b-manual',e.src];
}
function srcText(e){
  if(e.src==='manual')   return 'Manual (toque en la app)';
  if(e.src==='undo')     return 'Deshecho';
  if(e.src==='calendar') return 'Editado en Google Calendar';
  if(e.src==='notif'){
    const v=e.ok==='ok'?'verificado ✓':e.ok==='bad'?'⚠ el código no coincide con el aviso':'sin verificar';
    return `Aviso de las ${slotOf(e.slot)?.label||'?'} · ${v}${e.ref?` · ref ${e.ref}`:''}${e.note?` · ${e.note}`:''}`;
  }
  return e.src;
}

