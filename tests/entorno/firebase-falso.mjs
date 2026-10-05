// Firebase falso (API "compat" que usa la app): Auth con Google y Firestore con escuchas en tiempo real.
// Registra cada escritura para comparar que las dos versiones escriban lo mismo, en el mismo orden.

const clon=o=>JSON.parse(JSON.stringify(o));

export function crearFirebase({uid='u1',email='yo@gmail.com'}={}){
  const st={docs:new Map(),escrituras:[],escuchas:[],usuario:null,authCb:null,popup:'ok',config:null,cacheVacia:true,fallarEscrituras:null};
  const tarea=fn=>Promise.resolve().then(fn);

  // ── Auth ──
  const auth={
    onAuthStateChanged(cb){ st.authCb=cb; tarea(()=>cb(st.usuario)); return ()=>{ st.authCb=null; }; },
    signInWithPopup(){
      if(st.popup!=='ok') return Promise.reject(Object.assign(new Error(st.popup),{code:st.popup}));
      st.usuario={uid,email}; tarea(()=>st.authCb?.(st.usuario)); return Promise.resolve({user:st.usuario});
    },
    signOut(){ st.usuario=null; tarea(()=>st.authCb?.(null)); return Promise.resolve(); },
  };
  class GoogleAuthProvider{ setCustomParameters(p){ this.p=p; } }

  // ── Firestore ──
  const hijos=col=>[...st.docs.entries()].filter(([p])=>p.startsWith(col+'/')&&!p.slice(col.length+1).includes('/'));
  const cambio=(p,tipo)=>({type:tipo,doc:{id:p.split('/').pop(),data:()=>clon(st.docs.get(p))}});
  function entregar(col,cambios){
    for(const l of st.escuchas) if(l.col===col&&l.activa) tarea(()=>l.activa&&l.next({metadata:{fromCache:false},docChanges:()=>cambios}));
  }
  function escribir(p,data,origen){
    const nuevo=!st.docs.has(p); st.docs.set(p,clon(data));
    return [p.split('/').slice(0,-1).join('/'),cambio(p,nuevo?'added':'modified')];
  }
  function doc(p){
    return {
      id:p.split('/').pop(), path:p,
      collection:n=>coleccion(`${p}/${n}`),
      set(data){ if(st.fallarEscrituras) return Promise.reject(Object.assign(new Error(st.fallarEscrituras),{code:st.fallarEscrituras}));
        st.escrituras.push(['set',p,clon(data)]); const [col,c]=escribir(p,data); entregar(col,[c]); return Promise.resolve(); },
    };
  }
  function consulta(col,orden){
    return {
      orderBy:(campo,dir)=>consulta(col,{...orden,campo,dir}),
      limit:n=>consulta(col,{...orden,limite:n}),
      onSnapshot(opts,next,err){
        const l={col,next,err,activa:true,orden};
        st.escuchas.push(l);
        // Primero la caché local (vacía en un dispositivo nuevo) y después la respuesta del servidor
        tarea(()=>{ if(!l.activa) return; next({metadata:{fromCache:true},docChanges:()=>[]}); })
          .then(()=>{ if(!l.activa) return;
            let ds=hijos(col);
            if(orden?.campo) ds.sort((a,b)=>orden.dir==='desc'?b[1][orden.campo]-a[1][orden.campo]:a[1][orden.campo]-b[1][orden.campo]);
            if(orden?.limite) ds=ds.slice(0,orden.limite);
            next({metadata:{fromCache:false},docChanges:()=>ds.map(([p])=>cambio(p,'added'))}); });
        return ()=>{ l.activa=false; };
      },
    };
  }
  function coleccion(p){ return {...consulta(p,null), path:p, doc:id=>doc(`${p}/${id}`)}; }
  const db={
    enablePersistence:()=>Promise.resolve(),
    collection:coleccion,
    batch(){
      const ops=[];
      return { set(ref,data){ ops.push([ref.path,clon(data)]); },
        commit(){ st.escrituras.push(['batch',ops.map(([p,d])=>[p,d])]);
          const porCol=new Map(); for(const [p,d] of ops){ const [col,c]=escribir(p,d); (porCol.get(col)||porCol.set(col,[]).get(col)).push(c); }
          for(const [col,cs] of porCol) entregar(col,cs);
          return Promise.resolve(); } };
    },
  };

  const api={
    initializeApp(cfg){ st.config=cfg; },
    auth:Object.assign(()=>auth,{GoogleAuthProvider}),
    firestore:()=>db,
  };
  return {
    api, st,
    // Otro dispositivo cambia un documento en el servidor
    remoto(p,data){ const [col,c]=escribir(p,data); entregar(col,[c]); },
    sembrar(p,data){ st.docs.set(p,clon(data)); },
    iniciarSesion(){ st.usuario={uid,email}; },
  };
}
