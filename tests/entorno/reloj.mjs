// Reloj y temporizadores falsos: el tiempo solo avanza cuando la prueba lo pide.
// Así cada escenario es determinista y se puede repetir idéntico contra dos versiones de la app.

export function crearReloj(inicioMs){
  let ahora=inicioMs, seq=0;
  const cola=new Map();   // id → { t, fn, args, iv, orden }
  const RealDate=Date;
  class FakeDate extends RealDate{
    constructor(...a){ if(a.length===0) super(ahora); else super(...a); }
    static now(){ return ahora; }
  }
  const setTimeout=(fn,ms=0,...args)=>{ const id=++seq; cola.set(id,{t:ahora+Math.max(0,+ms||0),fn,args,iv:0,orden:id}); return id; };
  const setInterval=(fn,ms=0,...args)=>{ const id=++seq; const iv=Math.max(1,+ms||0); cola.set(id,{t:ahora+iv,fn,args,iv,orden:id}); return id; };
  const clear=id=>{ cola.delete(id); };

  // Avanza `ms` ejecutando en orden los temporizadores que vencen; después de cada uno deja correr las promesas.
  async function avanzar(ms,esperar){
    const fin=ahora+ms;
    for(;;){
      let sig=null;
      for(const [id,x] of cola) if(x.t<=fin&&(!sig||x.t<sig[1].t||(x.t===sig[1].t&&x.orden<sig[1].orden))) sig=[id,x];
      if(!sig) break;
      const [id,x]=sig;
      ahora=Math.max(ahora,x.t);
      if(x.iv){ x.t+=x.iv; x.orden=++seq; } else cola.delete(id);
      x.fn(...x.args);
      await esperar();
    }
    ahora=fin;
    await esperar();
  }
  return { Date:FakeDate, setTimeout, setInterval, clearTimeout:clear, clearInterval:clear, avanzar,
    get ahora(){ return ahora; }, pendientes:()=>cola.size };
}

// Generador pseudoaleatorio con semilla (mulberry32): mismos "aleatorios" en las dos versiones
export function prng(semilla){
  let a=semilla>>>0;
  return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
}
