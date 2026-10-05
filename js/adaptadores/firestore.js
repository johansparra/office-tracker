// ═══════════════════════════════════════════════════════════
// FIREBASE (Auth + Firestore): solo habla con el SDK. Datos por usuario:
//   users/{uid}/days/{AAAA-MM-DD}  {type: office|vacation|null, ts, dev}   (null = vacío; no se borran: gana el ts mayor)
//   users/{uid}/log/{id}           el registro del historial
//   users/{uid}/hidden/{id}        registros borrados en la app
// La config web de Firebase no es secreta: los datos los protegen las reglas de Firestore.
// ═══════════════════════════════════════════════════════════
import { reportar } from './errores.js';

export const FB_CONFIG={
  apiKey:'AIzaSyBBm17sVG5NgOfmJ50kz3iAc4cAj2TMmLQ',
  authDomain:'office-tracker-510522.firebaseapp.com',
  projectId:'office-tracker-510522',
  storageBucket:'office-tracker-510522.firebasestorage.app',
  messagingSenderId:'394992259372',
  appId:'1:394992259372:web:b72d9a52e30cd9e03b5c89'
};
let fbAuth=null, fbDb=null, fbUser=null;
export const fbListo=()=>!!fbAuth;        // el SDK cargó
export const usuario=()=>fbUser;
export const fbOn=()=>!!fbUser;          // tiempo real activo
export function setUsuario(u){ fbUser=u; }
const base=()=>fbDb.collection('users').doc(fbUser.uid);
export const clean=o=>JSON.parse(JSON.stringify(o));   // Firestore no acepta campos undefined

// Devuelve false si el SDK no cargó (sin conexión al abrir): la app sigue sin tiempo real
export function iniciarFirebase(alCambiarUsuario){
  if(!window.firebase?.firestore) return false;
  firebase.initializeApp(FB_CONFIG);
  fbAuth=firebase.auth(); fbDb=firebase.firestore();
  fbDb.enablePersistence({synchronizeTabs:true}).catch(e=>reportar('Firestore sin copia local (otra pestaña la usa o el navegador no la permite)',e,'warn'));
  fbAuth.onAuthStateChanged(alCambiarUsuario);
  return true;
}
export function entrarConGoogle(){
  const p=new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({prompt:'select_account'});
  return fbAuth.signInWithPopup(p);
}
export const salir=()=>fbAuth?.signOut();

// includeMetadataChanges: avisa también cuando llega la primera respuesta del servidor (aunque no haya datos)
const M={includeMetadataChanges:true};
export const escucharDias=(next,err)=>base().collection('days').onSnapshot(M,next,err);
export const escucharLog=(next,err)=>base().collection('log').orderBy('ts','desc').limit(1000).onSnapshot(M,next,err);
export const escucharOcultos=(next,err)=>base().collection('hidden').onSnapshot(M,next,err);
export const escribir=(col,id,data)=>base().collection(col).doc(id).set(data);
// Varias escrituras juntas: ops = [[colección, id, datos], …]
export function lote(ops){
  const b=fbDb.batch();
  for(const [col,id,data] of ops) b.set(base().collection(col).doc(id),data);
  return b.commit();
}
