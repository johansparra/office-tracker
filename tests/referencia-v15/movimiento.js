// ═══════════════════════════════════════════════════════════
// MOVIMIENTO (solo transform/opacity; menos movimiento si el sistema lo pide)
// ═══════════════════════════════════════════════════════════
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const EASE_OUT='cubic-bezier(.23,1,.32,1)', EASE_DRAWER='cubic-bezier(.32,.72,0,1)';
const anim=(el,kf,o)=>el&&!RM.matches?el.animate(kf,o):null;
let lastHero=null;   // {m:'AAAA-MM', v:visitas, done}
function afterRender(s){
  const m=`${S.year}-${S.month}`, prev=lastHero&&lastHero.m===m?lastHero:null;
  document.getElementById('hero').classList.toggle('is-done',s.done);
  const segs=[...document.querySelectorAll('.seg.on b')];
  const from=prev?Math.min(prev.v,s.visited):0;              // al abrir o cambiar de mes se llenan todos, en cascada
  segs.slice(from).forEach((b,i)=>anim(b,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:380,delay:(prev?0:220)+i*60,easing:EASE_OUT,fill:'backwards'}));
  if(prev&&prev.v!==s.visited){
    const up=s.visited>prev.v;
    anim(document.querySelector('.hc-num'),[{transform:`translateY(${up?40:-40}%)`,opacity:0},{transform:'none',opacity:1}],{duration:260,easing:EASE_OUT});
  }
  if(prev&&s.done&&!prev.done){                              // meta recién cumplida: un pequeño festejo
    anim(document.querySelector('.pill'),[{transform:'scale(.8)',opacity:0},{transform:'scale(1.06)',opacity:1,offset:.6},{transform:'scale(1)'}],{duration:420,easing:EASE_OUT});
    anim(document.querySelector('.hc'),[{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:420,easing:EASE_OUT});
  }
  lastHero={m,v:s.visited,done:s.done};
}
// El día que cambió "salta" para confirmar el toque
function popDay(key){
  anim(document.querySelector(`.day-cell[data-ts="${fromKey(key).getTime()}"]`),
    [{transform:'scale(.86)'},{transform:'scale(1.05)',offset:.55},{transform:'scale(1)'}],{duration:300,easing:EASE_OUT});
}
// Cambio de mes: el contenido entra desde el lado hacia el que vas
function slideMonth(dir){
  ['nav-title','stats','weeks'].forEach((id,i)=>anim(document.getElementById(id),
    [{transform:`translateX(${dir*18}px)`,opacity:0},{transform:'none',opacity:1}],{duration:260,delay:i*25,easing:EASE_OUT,fill:'backwards'}));
}
// Hojas: entran con CSS y salen hacia abajo, más rápido de lo que entran
function showOv(id){
  const ov=document.getElementById(id);
  ov.getAnimations({subtree:true}).forEach(a=>a.cancel());
  delete ov.dataset.closing; ov.style.display='flex';
}
function hideOv(id){
  const ov=document.getElementById(id);
  if(ov.style.display==='none'||ov.dataset.closing) return;
  if(RM.matches){ ov.style.display='none'; return; }
  ov.dataset.closing='1';
  const wide=matchMedia('(min-width:560px)').matches;
  ov.querySelector('.modal').animate([{transform:'none'},{transform:wide?'scale(.96)':'translateY(100%)',opacity:wide?0:1}],{duration:220,easing:EASE_DRAWER,fill:'forwards'});
  ov.animate([{opacity:1},{opacity:0}],{duration:220,easing:'ease-out',fill:'forwards'}).finished.then(()=>{
    if(!ov.dataset.closing) return;
    ov.style.display='none'; delete ov.dataset.closing; ov.getAnimations({subtree:true}).forEach(a=>a.cancel());
  }).catch(()=>{});
}
