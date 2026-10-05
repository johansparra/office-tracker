// ═══════════════════════════════════════════════════════════
// COLOMBIAN HOLIDAYS
// ═══════════════════════════════════════════════════════════
const _HC={};
function easter(y){
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4;
  const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30;
  const i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  return new Date(y,Math.floor((h+l-7*m+114)/31)-1,((h+l-7*m+114)%31)+1);
}
function holidays(y){
  if(_HC[y]) return _HC[y];
  const M={};
  const a=(d,n)=>{ M[toKey(d)]=n; };
  const e=(mo,da,n)=>a(nextMon(new Date(y,mo,da)),n);
  a(new Date(y,0,1),'Año Nuevo');   a(new Date(y,4,1),'Día del Trabajo');
  a(new Date(y,6,20),'Independencia'); a(new Date(y,7,7),'Batalla de Boyacá');
  a(new Date(y,11,8),'Inmaculada Concepción'); a(new Date(y,11,25),'Navidad');
  e(0,6,'Reyes Magos'); e(2,19,'San José');
  e(5,29,'San Pedro y San Pablo'); e(7,15,'Asunción de la Virgen');
  e(9,12,'Día de la Raza'); e(10,1,'Todos los Santos'); e(10,11,'Indep. Cartagena');
  const ea=easter(y);
  a(addD(ea,-3),'Jueves Santo'); a(addD(ea,-2),'Viernes Santo');
  a(nextMon(addD(ea,39)),'Ascensión'); a(nextMon(addD(ea,60)),'Corpus Christi');
  a(nextMon(addD(ea,68)),'Sagrado Corazón');
  _HC[y]=M; return M;
}
function getHol(d){ return holidays(d.getFullYear())[toKey(d)]||null; }

