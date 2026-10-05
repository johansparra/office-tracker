// Google falso: Calendar, Drive y Sheets en memoria, con el comportamiento que la app usa de las APIs reales.
// Registra cada llamada (método, URL, cuerpo) para comparar que las dos versiones hablen con Google igual.

const CAL='https://www.googleapis.com/calendar/v3', DRIVE='https://www.googleapis.com/drive/v3/files', SHEETS='https://sheets.googleapis.com/v4/spreadsheets';
const clon=o=>o===undefined?undefined:JSON.parse(JSON.stringify(o));

export function crearGoogle(reloj,{email='yo@gmail.com'}={}){
  const g={
    email, calendarios:new Map(), primario:new Map(), archivos:new Map(), hojas:new Map(),
    tokens:new Set(), log:[], fallos:[], sigCal:1, sigEv:1, sigArch:1, enVuelo:0,
  };
  const iso=()=>new Date(reloj.ahora).toISOString();

  // ── Preparar datos de un escenario ──
  g.crearCalendario=(summary=' Office Tracker'.trim(),id)=>{
    id=id||`c${String(g.sigCal++).padStart(3,'0')}@group.calendar.google.com`;
    g.calendarios.set(id,{id,summary,eventos:new Map()}); return id;
  };
  g.crearEvento=(calId,ev)=>{
    const id=ev.id||`ev${String(g.sigEv++).padStart(4,'0')}`;
    const e={status:'confirmed',...clon(ev),id,updated:ev.updated||iso()};
    (calId==='primary'?g.primario:g.calendarios.get(calId).eventos).set(id,e); return id;
  };
  g.editarEvento=(calId,id,cambios)=>{ const e=g.calendarios.get(calId).eventos.get(id); Object.assign(e,clon(cambios),{updated:iso()}); };
  g.borrarEvento=(calId,id)=>{ const e=g.calendarios.get(calId).eventos.get(id); e.status='cancelled'; e.updated=iso(); };
  g.eventos=calId=>[...(g.calendarios.get(calId)?.eventos.values()||[])];
  g.vivos=calId=>g.eventos(calId).filter(e=>e.status!=='cancelled');
  g.fallar=(si,status,cuerpo,veces=Infinity)=>g.fallos.push({si,status,cuerpo,veces});
  g.fallarRed=(si,veces=Infinity)=>g.fallos.push({si,red:true,veces});

  const resp=(status,cuerpo)=>({status,ok:status>=200&&status<300,json:async()=>clon(cuerpo)});
  const errorGoogle=(status,reason,message)=>resp(status,{error:{code:status,message,errors:[{reason,message}]}});

  function rangoEvento(e){
    const d=x=>x?.date?new Date(`${x.date}T00:00:00`).getTime():x?.dateTime?new Date(x.dateTime.slice(0,19)).getTime():NaN;
    return [d(e.start),d(e.end)];
  }
  function listar(mapa,p){
    let items=[...mapa.values()];
    const pep=p.get('privateExtendedProperty');
    if(pep){ const [k,v]=pep.split('='); items=items.filter(e=>e.extendedProperties?.private?.[k]===v); }
    if(p.get('showDeleted')!=='true') items=items.filter(e=>e.status!=='cancelled');
    const um=p.get('updatedMin'); if(um) items=items.filter(e=>e.updated>=um);
    const tmin=p.get('timeMin'), tmax=p.get('timeMax');
    if(tmin||tmax) items=items.filter(e=>{ const [a,b]=rangoEvento(e); return (!tmin||b>Date.parse(tmin))&&(!tmax||a<Date.parse(tmax)); });
    const max=+(p.get('maxResults')||250), desde=+(p.get('pageToken')||0);
    const pag=items.slice(desde,desde+max);
    let out=pag.map(clon);
    if(p.get('fields')==='items(updated)') out=out.map(e=>({updated:e.updated}));
    const r={items:out}; if(desde+max<items.length) r.nextPageToken=String(desde+max);
    return resp(200,r);
  }

  function hojaDe(id){ return g.hojas.get(id); }
  function tocar(id){ const a=g.archivos.get(id); if(a) a.modifiedTime=iso(); }
  function rango(r){ const m=/^'([^']+)'!([A-Z]+)(\d+)(?::([A-Z]+)(\d+)?)?$/.exec(r); return m&&{tab:m[1],fila:+m[3]}; }

  async function manejar(metodo,url,cuerpo){
    const u=new URL(url), p=u.searchParams;
    // ── Calendar ──
    if(url.startsWith(CAL)){
      const ruta=u.pathname.replace('/calendar/v3','').split('/').filter(Boolean).map(decodeURIComponent);
      if(ruta[0]==='users'&&ruta[2]==='calendarList'){
        return resp(200,{items:[{id:g.email,summary:g.email,primary:true,accessRole:'owner'},
          ...[...g.calendarios.values()].map(c=>({id:c.id,summary:c.summary,accessRole:'owner'}))]});
      }
      if(ruta[0]==='calendars'&&ruta.length===1&&metodo==='POST'){
        const id=g.crearCalendario(cuerpo.summary); Object.assign(g.calendarios.get(id),{timeZone:cuerpo.timeZone,description:cuerpo.description});
        return resp(200,{id,summary:cuerpo.summary});
      }
      const calId=ruta[1], prim=calId==='primary', cal=prim?null:g.calendarios.get(calId);
      if(!prim&&!cal) return errorGoogle(404,'notFound','Not Found');
      if(ruta.length===2&&metodo==='DELETE'){ g.calendarios.delete(calId); return resp(204); }
      const mapa=prim?g.primario:cal.eventos;
      if(ruta[2]==='events'&&ruta.length===3){
        if(metodo==='GET') return listar(mapa,p);
        if(metodo==='POST'){ const id=`ev${String(g.sigEv++).padStart(4,'0')}`; const e={status:'confirmed',...clon(cuerpo),id,updated:iso()}; mapa.set(id,e); return resp(200,clon(e)); }
      }
      if(ruta[2]==='events'&&ruta.length===4){
        const e=mapa.get(ruta[3]);
        if(metodo==='DELETE'){ if(!e||e.status==='cancelled') return errorGoogle(410,'deleted','Resource has been deleted'); e.status='cancelled'; e.updated=iso(); return resp(204); }
        if(!e) return errorGoogle(404,'notFound','Not Found');
        if(metodo==='PATCH'){ Object.assign(e,clon(cuerpo),{updated:iso()}); return resp(200,clon(e)); }
      }
      return errorGoogle(400,'badRequest',`Ruta no soportada por el falso: ${metodo} ${url}`);
    }
    // ── Drive ──
    if(url.startsWith(DRIVE)){
      const resto=u.pathname.replace('/drive/v3/files','').split('/').filter(Boolean);
      if(!resto.length&&metodo==='GET'){
        const q=p.get('q'), nombre=/name='([^']*)'/.exec(q)?.[1], mime=/mimeType='([^']*)'/.exec(q)?.[1];
        const fs=[...g.archivos.values()].filter(a=>a.name===nombre&&a.mimeType===mime&&!a.trashed).map(a=>({id:a.id}));
        return resp(200,{files:fs});
      }
      if(!resto.length&&metodo==='POST'){
        const id=`f${String(g.sigArch++).padStart(3,'0')}`;
        g.archivos.set(id,{id,...clon(cuerpo),modifiedTime:iso(),trashed:false});
        if(cuerpo.mimeType==='application/vnd.google-apps.spreadsheet') g.hojas.set(id,{tabs:[{sheetId:0,title:'Hoja 1',filas:[]}]});
        return resp(200,{id});
      }
      if(resto.length===1&&metodo==='GET'){ const a=g.archivos.get(resto[0]); if(!a||a.trashed) return errorGoogle(404,'notFound','File not found'); return resp(200,{modifiedTime:a.modifiedTime}); }
      return errorGoogle(400,'badRequest',`Ruta no soportada: ${metodo} ${url}`);
    }
    // ── Sheets ──
    if(url.startsWith(SHEETS)){
      const ruta=decodeURIComponent(u.pathname.replace('/v4/spreadsheets/',''));
      const id=ruta.split(/[/:]/)[0], h=hojaDe(id);
      if(!h||g.archivos.get(id)?.trashed) return errorGoogle(404,'notFound','Requested entity was not found.');
      const tab=t=>h.tabs.find(x=>x.title===t);
      if(ruta===id&&metodo==='GET') return resp(200,{sheets:h.tabs.map(t=>({properties:{sheetId:t.sheetId,title:t.title}}))});
      if(ruta===`${id}:batchUpdate`){
        for(const r of cuerpo.requests){
          if(r.addSheet) h.tabs.push({sheetId:r.addSheet.properties.sheetId??Math.max(0,...h.tabs.map(t=>t.sheetId))+1,title:r.addSheet.properties.title,filas:[]});
          if(r.updateSheetProperties){ const t=h.tabs.find(x=>x.sheetId===r.updateSheetProperties.properties.sheetId); if(t) t.title=r.updateSheetProperties.properties.title; }
        }
        tocar(id); return resp(200,{});
      }
      if(ruta===`${id}/values:batchGet`){
        return resp(200,{valueRanges:p.getAll('ranges').map(r=>{
          const x=rango(r), t=tab(x.tab), filas=(t?.filas||[]).slice(x.fila-1).map(f=>/!A\d+:A$/.test(r)?f.slice(0,1):f);
          return filas.length?{range:r,values:clon(filas)}:{range:r};
        })});
      }
      const mv=/^[^/]+\/values\/(.+?)(:append)?$/.exec(ruta);
      if(mv){
        const x=rango(mv[1]), t=tab(x.tab); if(!t) return errorGoogle(400,'badRequest',`Unable to parse range: ${mv[1]}`);
        if(mv[2]&&metodo==='POST'){ t.filas.push(...clon(cuerpo.values)); tocar(id); return resp(200,{updates:{updatedRows:cuerpo.values.length}}); }
        if(metodo==='PUT'){ cuerpo.values.forEach((f,i)=>{ t.filas[x.fila-1+i]=clon(f); }); tocar(id); return resp(200,{}); }
      }
      return errorGoogle(400,'badRequest',`Ruta no soportada: ${metodo} ${url}`);
    }
    return errorGoogle(400,'badRequest',`URL desconocida: ${url}`);
  }

  // fetch que usa la app
  // Como la red real, la respuesta llega en otra vuelta del ciclo de eventos (no al instante)
  g.fetch=async(url,op={})=>{
    const metodo=op.method||'GET', cuerpo=op.body?JSON.parse(op.body):undefined;
    g.log.push({m:metodo,u:url,b:cuerpo});
    g.enVuelo++;
    try{ await new Promise(r=>setImmediate(r)); return await responder(url,op,metodo,cuerpo); }
    finally{ g.enVuelo--; }
  };
  async function responder(url,op,metodo,cuerpo){
    const req={metodo,url,cuerpo};
    const f=g.fallos.find(x=>x.veces>0&&x.si(req));
    if(f){ f.veces--; if(f.red) throw new TypeError('Failed to fetch'); return errorGoogle(f.status,f.cuerpo?.reason||'error',f.cuerpo?.message||'Error'); }
    const tok=(op.headers?.Authorization||op.headers?.authorization||'').replace('Bearer ','');
    if(!g.tokens.has(tok)) return errorGoogle(401,'authError','Invalid Credentials');
    return manejar(metodo,url,cuerpo);
  }
  return g;
}
