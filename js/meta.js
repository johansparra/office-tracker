// ═══════════════════════════════════════════════════════════
// STATS  (solo cuentan los días del mes visible)
// ═══════════════════════════════════════════════════════════
function weeks(y,mo){
  const last=new Date(y,mo+1,0),ws=[];
  let m=monday(new Date(y,mo,1));
  while(m<=last){ ws.push({mon:new Date(m),sun:addD(m,6)}); m=addD(m,7); }
  return ws;
}
function stats(year=S.year,month=S.month){
  const data=S.data;
  const ws=weeks(year,month).map(w=>{
    let hasAdj=false,visited=0,openDays=0;
    for(let d=new Date(w.mon);d<=w.sun;d=addD(d,1)){
      if(!inMonth(d,year,month)) continue;
      const st=data[toKey(d)], h=getHol(d);
      if(h||st==='vacation') hasAdj=true;
      if(st==='office') visited++;
      else if(d>=now&&!isWeekend(d)&&!h&&st!=='vacation') openDays++;
    }
    return{...w,hasAdj,quota:hasAdj?1:2,visited,openDays};
  });
  const adjN=ws.filter(w=>w.hasAdj).length;
  const target=Math.max(0,BASE-adjN);
  const visited=ws.reduce((s,w)=>s+w.visited,0);
  const remaining=Math.max(0,target-visited);
  const pct=target>0?Math.min(100,Math.round(visited/target*100)):100;
  const done=visited>=target;
  const active=ws.filter(w=>w.sun>=now);
  const canMax=active.reduce((s,w)=>s+Math.min(Math.max(0,w.quota-w.visited),w.openDays),0);
  const mHols=Object.entries(holidays(year)).filter(([k])=>k.startsWith(`${year}-${p2(month+1)}`)).sort();
  const upHols=mHols.map(([k,n])=>({date:fromKey(k),name:n})).filter(h=>h.date>now);
  // Días hábiles que quedan (lun–vie, sin festivo, sin marcar, desde hoy). Lo ideal son 2 por semana,
  // pero lo que manda es la meta del mes: si los días que faltan ≥ los que quedan, todos son obligatorios.
  const open=[];
  for(let d=new Date(Math.max(now,new Date(year,month,1)));inMonth(d,year,month);d=addD(d,1)){
    const k=toKey(d); if(!isWeekend(d)&&!getHol(d)&&!data[k]) open.push(k);
  }
  const slack=open.length-remaining;                        // días hábiles que aún puedes faltar
  const must=!done&&remaining>0&&slack<=0?open:[];
  return{ws,adjN,target,visited,remaining,pct,done,active,canMax,upHols,mHols,open,slack,must};
}

