// ═══════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════
function save(){
  try{ localStorage.setItem(LS_DATA,JSON.stringify({v:3,data:S.data,evIds:S.evIds,pending:S.pending,log:S.log,
    rem:S.rem,nonces:S.nonces,skip:S.skip,legacy:S.legacy,logOut:S.logOut,sheetId:S.sheetId,account:S.account,hidden:S.hidden,hideOut:S.hideOut})); }catch(_){}
}
function load(){
  try{
    const p=JSON.parse(localStorage.getItem(LS_DATA)||'null');
    if(p){
      S.data=p.data||{};
      if(p.v===3){
        Object.assign(S,{evIds:p.evIds||{},pending:p.pending||{},log:p.log||[],rem:p.rem||{},
          nonces:p.nonces||{},skip:p.skip||{},legacy:p.legacy||{},logOut:p.logOut||[],sheetId:p.sheetId||null,account:p.account||null,hidden:p.hidden||{},hideOut:p.hideOut||[]});
      }else{
        // Migración desde v1/v2: los eventos viejos están en el calendario principal.
        // Se guardan aparte para poder borrarlos, y todo lo local se sube al calendario nuevo.
        S.legacy=p.evIds||{}; S.evIds={};
        Object.keys(S.data).forEach(k=>{ S.pending[k]=true; });
      }
    }
  }catch(_){}
  S.cid=localStorage.getItem(LS_CID)||null;
  S.calId=localStorage.getItem(LS_CAL)||null;
  S.dev=localStorage.getItem(LS_DEV);
  if(!S.dev){ S.dev=rid(2); localStorage.setItem(LS_DEV,S.dev); }
  try{
    const t=JSON.parse(localStorage.getItem(LS_TOK)||'null');
    if(t&&t.exp>Date.now()&&t.scope===SCOPE){ S.token=t.token; S.tokenExp=t.exp; }
  }catch(_){}
}
function setToken(tok,expiresIn){
  S.token=tok; S.tokenExp=Date.now()+(Math.max(120,expiresIn)-60)*1000;
  try{ localStorage.setItem(LS_TOK,JSON.stringify({token:tok,exp:S.tokenExp,scope:SCOPE})); }catch(_){}
}
function clearToken(){ S.token=null; S.tokenExp=0; try{ localStorage.removeItem(LS_TOK); }catch(_){} }
function hasToken(){
  if(S.token&&Date.now()<S.tokenExp) return true;
  if(S.token) clearToken();
  return false;
}
const pendingCount=()=>Object.keys(S.pending).length;
const online=()=>hasToken()&&!!S.calId;

