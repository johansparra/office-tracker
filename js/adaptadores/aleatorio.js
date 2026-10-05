// ═══════════════════════════════════════════════════════════
// IDS ALEATORIOS (registros, códigos de aviso, dispositivo)
// ═══════════════════════════════════════════════════════════
export function rid(bytes){ const a=new Uint8Array(bytes); crypto.getRandomValues(a); return [...a].map(b=>b.toString(16).padStart(2,'0')).join(''); }
