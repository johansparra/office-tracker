# 🔥 Office Tracker con Firebase: sincronización en tiempo real

Esta guía explica, paso a paso, qué hay que hacer para pasar de la sincronización actual (casi en tiempo real **con la app abierta**) a una sincronización **instantánea**, con **avisos aunque la app esté cerrada**.

> **Estado:** la **fase A está implementada** (desde v13; optimizada en v14) en el proyecto `office-tracker-510522`. Las fases B y C son la guía para cuando decidas hacerlas. Cada fase dice qué haces tú (consolas de Google y Firebase) y qué cambia en el código.

---

## Índice

1. [Cómo funciona hoy y qué cambiaría](#1-cómo-funciona-hoy-y-qué-cambiaría)
2. [Las tres fases](#2-las-tres-fases)
3. [Antes de empezar](#3-antes-de-empezar)
4. [Fase A: Firestore, sincronización instantánea con la app abierta](#4-fase-a--firestore-sincronización-instantánea-con-la-app-abierta)
5. [Fase B: notificaciones push con la app cerrada](#5-fase-b--notificaciones-push-con-la-app-cerrada)
6. [Fase C: cambios hechos directamente en Google Calendar, al instante](#6-fase-c--cambios-hechos-directamente-en-google-calendar-al-instante)
7. [Costos y límites](#7-costos-y-límites)
8. [Seguridad](#8-seguridad)
9. [Cómo probar cada fase](#9-cómo-probar-cada-fase)
10. [Cómo volver atrás](#10-cómo-volver-atrás)

---

## 1. Cómo funciona hoy y qué cambiaría

### Sin Firebase (modo anterior, sigue disponible)

```
 Celular ──┐                         ┌── PC
           │  cada 10 s: "¿cambió    │
           ├─► algo?" (Calendar +   ◄┤
           │   Drive)                │
           ▼                         ▼
     Google Calendar «Office Tracker»  +  Hoja «Office Tracker · Historial»
```

- Cada dispositivo **pregunta** cada 10 segundos si hubo cambios. Si los hay, sincroniza.
- Funciona solo **con la app abierta**.
- La sesión de Google dura 1 hora y hay que tocar **Reconectar**.

### Con Firebase

```
 Celular ◄──── aviso instantáneo ────► PC
    │                                    │
    └──────► Firestore (base de datos) ◄─┘
                   │
                   ├─► Cloud Functions ──► notificación push (app cerrada)
                   └─► Google Calendar y hoja del log (copias para ver y auditar)
```

- **Firestore** es una base de datos de Google que **avisa sola** a todos los dispositivos conectados cuando algo cambia. Nadie tiene que preguntar.
- La sesión de Firebase **no vence cada hora**: entras una vez y queda abierta.
- Google Calendar y la hoja siguen existiendo como copias: ahí ves los avisos y el log de auditoría.

---

## 2. Las tres fases

Cada fase funciona por sí sola. Puedes quedarte en la A.

| Fase | Qué logras | Plan de Firebase | Esfuerzo |
|---|---|---|---|
| **A** | Cambios instantáneos entre dispositivos **con la app abierta**; sesión que no vence cada hora | **Spark** (gratis, sin tarjeta) | Medio |
| **B** | **Notificación push** en el celular cuando cambias algo en otro dispositivo, y alerta diaria "sí o sí", **con la app cerrada** | **Blaze** (pago por uso, con tarjeta; en este volumen queda en $0) | Medio |
| **C** | Si editas **directamente en Google Calendar**, se refleja al instante y llega push, con la app cerrada | **Blaze** | Alto |

**Recomendación:** hacer la A, usarla unas semanas y decidir después si la B vale la pena. La C solo si editas seguido desde Google Calendar y no desde la app.

---

## 3. Antes de empezar

Necesitas:

- La **misma cuenta de Google** que usas con la app.
- El **proyecto de Google Cloud** que ya creaste para el Client ID. Firebase se agrega a ese mismo proyecto, así comparten APIs y permisos.
- Para las fases B y C: una **tarjeta** para activar el plan Blaze, y **Node.js 20 o superior** en tu PC ([nodejs.org](https://nodejs.org), versión LTS).

Datos que vas a ir anotando (guárdalos en un lugar seguro, **no** en el repositorio salvo donde se indique):

| Dato | Dónde se obtiene | ¿Va en el código? |
|---|---|---|
| `firebaseConfig` (apiKey, authDomain, projectId, …) | Paso A2 | Sí: no es secreto |
| Clave pública VAPID | Paso B2 | Sí: es pública |
| Client secret de OAuth | Paso C2 | **No**: va en Secret Manager |

---

## 4. Fase A: Firestore, sincronización instantánea con la app abierta

### A1. Agregar Firebase a tu proyecto de Google Cloud

1. Entra a [console.firebase.google.com](https://console.firebase.google.com) con tu cuenta.
2. Toca **Crear un proyecto** (o **Agregar proyecto**).
3. En el campo del nombre, despliega la lista y elige **tu proyecto de Google Cloud existente** (el del Client ID). Si no aparece, busca la opción *Agregar Firebase a un proyecto de Google Cloud*.
4. Acepta las condiciones → **Continuar**.
5. **Google Analytics:** desactívalo (no hace falta) → **Agregar Firebase**.
6. Espera a que termine → **Continuar**. Quedas en la consola de tu proyecto.

### A2. Registrar la app web

1. En la página principal del proyecto, toca el ícono **`</>`** (Web).
2. **Sobrenombre de la app:** `Office Tracker web`.
3. **No** marques *Configurar Firebase Hosting* (la app sigue en GitHub Pages).
4. Toca **Registrar app**.
5. Google muestra un bloque de código con `const firebaseConfig = { … }`. **Cópialo completo** y guárdalo:
   ```js
   const firebaseConfig = {
     apiKey: "AIza…",
     authDomain: "TU-PROYECTO.firebaseapp.com",
     projectId: "TU-PROYECTO",
     storageBucket: "TU-PROYECTO.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
6. Toca **Ir a la consola**.

> El `apiKey` de Firebase **no es secreto**: identifica el proyecto, no da acceso. Quien protege los datos son las reglas de seguridad (paso A5). Igual lo vamos a restringir en el paso A6.

### A3. Activar el inicio de sesión con Google

1. Menú izquierdo → **Compilación** (*Build*) → **Authentication** → **Comenzar**.
2. Pestaña **Método de acceso** (*Sign-in method*) → **Google** → activa **Habilitar**.
3. **Correo electrónico de asistencia del proyecto:** elige tu correo → **Guardar**.
4. Pestaña **Configuración** (*Settings*) → **Dominios autorizados** → **Agregar dominio** → escribe `johansparra.github.io` → **Agregar**.
   - `localhost` ya viene en la lista; sirve para pruebas locales.

### A4. Crear la base de datos Firestore

1. Menú izquierdo → **Compilación** → **Firestore Database** → **Crear base de datos**.
2. **Edición:** *Standard*.
3. **ID de la base de datos:** deja `(default)`.
4. **Ubicación:** elige una y **no se puede cambiar después**. Opciones razonables desde Colombia:
   - `nam5 (United States)`: multirregión, la más común.
   - `southamerica-east1 (São Paulo)`: la región más cercana en Sudamérica.
5. **Reglas:** elige **Comenzar en modo de producción** (todo cerrado; lo abrimos bien en el paso siguiente).
6. **Crear**.

### A5. Reglas de seguridad (solo tú puedes leer y escribir tus datos)

1. **Firestore Database** → pestaña **Reglas**.
2. Reemplaza todo el contenido por:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Cada usuario solo puede leer y escribir dentro de users/{su uid}
       match /users/{uid}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
3. **Publicar**.

### A6. Restringir la API key (recomendado)

1. [console.cloud.google.com](https://console.cloud.google.com) → tu proyecto → **APIs y servicios → Credenciales**.
2. En **Claves de API** abre la que dice *Browser key (auto created by Firebase)*.
3. **Restricciones de aplicaciones** → **Sitios web** → **Agregar** →
   - `https://johansparra.github.io/*`
   - `https://TU-PROYECTO.firebaseapp.com/*`: **obligatorio**, porque la ventana de inicio de sesión de Firebase se abre desde ese dominio; sin él, el login falla. Es el valor de `authDomain` de tu `firebaseConfig` (en este proyecto: `https://office-tracker-510522.firebaseapp.com/*`). **No** es la URL de la consola (`console.firebase.google.com/project/…`)
   - `http://localhost/*` (solo si vas a probar en local)
4. **Restricciones de API:** deja **No restringir la clave**. Si la restringes, incluye al menos **Identity Toolkit API**, **Token Service API** y **Cloud Firestore API**.
5. **Guardar**. Los cambios pueden tardar unos minutos en aplicarse.

### A7. Cómo se guardarían los datos

```
users/{tu uid}/
├── days/{AAAA-MM-DD}      { type: "office" | "vacation", dev, updatedAt }
├── log/{id del evento}    { ts, d, from, to, src, dev, slot, ok, ref, note }
├── hidden/{id del evento} { ts, dev }              ← registros borrados en la app
└── meta/settings          { calId, sheetId }
```

### A8. Qué cambió en el código (implementado en v13)

**Para activarlo:** en la tarjeta de Google toca **⚡ Activar tiempo real** → elige tu cuenta → listo. Hazlo en cada dispositivo **con la misma cuenta**. El chip de arriba pasa a decir **⚡ En vivo** y la tarjeta muestra *Tiempo real · tu correo*. Para apagarlo en un dispositivo: **Salir**.

Lo implementado:

1. **Cargar el SDK de Firebase** desde `https://www.gstatic.com/firebasejs/…` y pegar tu `firebaseConfig` en `js/adaptadores/firestore.js` (`FB_CONFIG`).
2. **Inicio de sesión:** botón *Entrar con Google* (Firebase Auth). La sesión queda guardada y **no vence cada hora**.
3. **Escuchas en tiempo real** (`onSnapshot`) sobre `days`, `log` y `hidden`: cuando otro dispositivo cambia algo, la pantalla se actualiza **al instante**.
4. **Modo sin conexión:** Firestore guarda una copia local; lo que marques sin internet se sube solo al volver.
5. **Migración automática:** la primera vez sube a Firestore lo que tengas en el dispositivo (días e historial), sin duplicar.
6. **Google Calendar y la hoja** pasan a ser **copias**: el dispositivo que hace un cambio lo escribe también ahí, para los avisos y el log de auditoría. Para esto sigue haciendo falta el permiso de Calendar y Drive (el botón **Reconectar** de hoy), pero **solo para escribir copias**: si la sesión de Calendar vence, la sincronización entre dispositivos **sigue funcionando** por Firestore.
7. **Menos consultas (v14):** con el tiempo real activo, la detección revisa solo Google Calendar y cada **60 s**, para cambios hechos **directamente allí**. Ya no consulta Drive ni lee la hoja, porque los cambios entre dispositivos y el historial llegan al instante por Firestore. La hoja **se sigue escribiendo** igual.
8. **Quién gana si hay diferencias:** cada día en Firestore guarda la hora del último cambio (`ts`) y gana el más reciente. Si un evento se editó en Google Calendar **después** del último cambio en Firestore, se importa como cambio de origen *Calendar*. Si no, Firestore manda y se corrige la copia en Calendar.
9. **Migración segura:** un dispositivo nuevo espera la primera respuesta real del servidor antes de subir lo que tiene guardado, y solo sube los días que Firestore no tiene (no pisa datos más nuevos).

---

## 5. Fase B: notificaciones push con la app cerrada

### B1. Activar el plan Blaze

Cloud Functions (el código que corre en el servidor) exige el plan Blaze.

1. Consola de Firebase → abajo a la izquierda **Spark** → **Actualizar** (*Upgrade*) → **Blaze**.
2. Elige o crea una **cuenta de facturación** y registra la tarjeta.
3. **Crea una alerta de presupuesto:** [console.cloud.google.com](https://console.cloud.google.com) → **Facturación → Presupuestos y alertas → Crear presupuesto** → monto `USD 1` → alertas al 50 %, 90 % y 100 % → **Finalizar**.
   - En este volumen (1 usuario, decenas de eventos al día) el uso queda dentro de la capa gratuita: **$0**.

### B2. Generar la clave para notificaciones web (VAPID)

1. Consola de Firebase → ⚙️ **Configuración del proyecto** → pestaña **Cloud Messaging**.
2. Sección **Configuración web** → **Certificados push web** → **Generar par de claves**.
3. Copia la **clave pública** (empieza parecido a `BPx…`). Es pública: va en el código.

### B3. Instalar las herramientas en tu PC

En una terminal (PowerShell):

```powershell
node --version          # debe ser 20 o superior
npm install -g firebase-tools
firebase login          # abre el navegador: entra con tu cuenta
firebase projects:list  # debe aparecer tu proyecto
```

### B4. Inicializar Functions en el repositorio

Dentro de la carpeta `office-tracker`:

```powershell
firebase init functions
```

Responde:

| Pregunta | Respuesta |
|---|---|
| *Please select an option* | **Use an existing project** → tu proyecto |
| *Language* | **JavaScript** |
| *Use ESLint?* | **No** |
| *Install dependencies with npm now?* | **Yes** |

Esto crea la carpeta `functions/` y los archivos `firebase.json` y `.firebaserc`. Se suben al repositorio; **no** contienen secretos.

### B5. Qué cambia en el código (de mi lado)

1. **Permiso de notificaciones:** la app pide permiso una vez, obtiene un *token* del dispositivo y lo guarda en `users/{uid}/devices/{token}`.
2. **Service worker:** se agrega la recepción de push al `sw.js` actual (un solo service worker para no chocar con el de la app).
3. **Funciones en el servidor** (`functions/index.js`):
   - **Al cambiar un día** (`days/{día}`): manda push a **tus otros dispositivos**: *"🏢 Marcaste oficina el miércoles 7 desde el PC"*.
   - **Alerta diaria a las 9:00 a. m. (Bogotá)**: si ese día es obligatorio para llegar a la meta, manda *"⚠️ Hoy tienes que ir a la oficina"*. Si ese día ya está marcado, no avisa.
4. Región de las funciones: la misma de la base de datos (paso A4), o `us-central1`.

### B6. Publicar las funciones

```powershell
firebase deploy --only functions
```

La primera vez puede pedir activar APIs (Cloud Functions, Cloud Build, Artifact Registry, Eventarc, Cloud Scheduler): responde **Y**.

### B7. Activar las notificaciones en cada dispositivo

- **Android:** abre la app instalada → cuando pregunte, **Permitir notificaciones**. Si no pregunta: Ajustes de Android → Apps → OfficeTracker → **Notificaciones → activar**.
- **PC (Chrome/Edge/Brave):** al permitir en el sitio, las notificaciones llegan aunque la pestaña esté cerrada, mientras el navegador esté abierto o en segundo plano.
- **iPhone:** solo funciona con la app **instalada en la pantalla de inicio** (iOS 16.4 o superior).

---

## 6. Fase C: cambios hechos directamente en Google Calendar, al instante

Hasta la fase B, si editas un día **dentro de Google Calendar** (no en la app), se detecta cuando abres la app. La fase C hace que Google **avise al servidor** en el momento.

### C1. Por qué es más complejo

- Google Calendar avisa con *push notifications* a una **URL HTTPS de un servidor** (un *webhook*), no a la app.
- El servidor necesita **leer tu calendario cuando tú no estás**. Eso exige un **refresh token** de Google (acceso *offline*), y para obtenerlo hace falta el **client secret** del Client ID.
- Los canales de aviso **vencen** (tienen fecha de expiración) y hay que renovarlos con una función programada.

### C2. Guardar el client secret de forma segura

1. [console.cloud.google.com](https://console.cloud.google.com) → **Google Auth Platform → Clientes** → tu Client ID → copia el **Secreto del cliente** (o crea uno nuevo).
2. Guárdalo en **Secret Manager** desde la terminal (no en el código ni en el repo):
   ```powershell
   firebase functions:secrets:set GOOGLE_CLIENT_SECRET
   ```
   Pega el valor cuando lo pida.
3. El archivo `client_secret_….json` que descargaste antes: **bórralo de Descargas** cuando termines; nunca lo subas al repositorio.

### C3. Autorizar la URL de retorno

1. Cuando publique la función de autorización, te paso su URL (por ejemplo `https://us-central1-TU-PROYECTO.cloudfunctions.net/oauthCallback`).
2. **Google Auth Platform → Clientes** → tu Client ID → **URIs de redireccionamiento autorizados** → **+ Agregar URI** → pega esa URL → **Guardar**.

### C4. Qué cambia en el código (de mi lado)

1. **Botón "Activar sincronización en el servidor"**: abre el consentimiento de Google pidiendo acceso *offline*. La función `oauthCallback` cambia el código por un **refresh token** y lo guarda cifrado, solo accesible desde el servidor.
2. **Función `calendarWebhook`**: recibe el aviso de Google, lee **solo lo que cambió** (con `syncToken`) y lo escribe en Firestore. De ahí la fase A lo muestra al instante y la fase B manda el push.
3. **Función `renewWatch`** (programada cada día): renueva el canal de avisos antes de que venza.
4. Opcional: el servidor también escribe la **hoja del log**, así el log queda completo aunque ningún dispositivo esté abierto.

### C5. Verificación de dominio

Google exige que el webhook use **HTTPS válido**; las URLs de Cloud Functions ya lo cumplen. Si al registrar el canal Google responde que el dominio no está verificado, se agrega la verificación en [Google Search Console](https://search.google.com/search-console). Te guío en ese momento si hace falta.

---

## 7. Costos y límites

| Servicio | Capa gratuita (aprox.) | Uso estimado de esta app |
|---|---|---|
| Firestore lecturas | 50 000 / día | Cientos / día |
| Firestore escrituras | 20 000 / día | Decenas / día |
| Firestore almacenamiento | 1 GiB | Menos de 1 MB |
| Cloud Functions | 2 millones de invocaciones / mes | Cientos / mes |
| Cloud Messaging (push) | Gratis | — |
| Cloud Scheduler | 3 tareas / mes gratis | 2 |

Los valores exactos están en [firebase.google.com/pricing](https://firebase.google.com/pricing). Con la alerta de presupuesto del paso B1 te enteras si algo se sale de lo esperado.

---

## 8. Seguridad

- **Reglas de Firestore** (A5): solo tu usuario lee y escribe sus datos. **Nunca** publiques reglas con `allow read, write: if true`.
- **API key** restringida a tu dominio (A6).
- **Client secret y refresh tokens**: solo en Secret Manager y en el servidor. Nunca en el código de la app (`index.html`, `js/`), nunca en GitHub.
- **Permisos de Google:** siguen siendo los mínimos (`calendar.app.created`, `calendar.calendarlist.readonly`, `drive.file`). La fase C agrega acceso *offline*, pero no permisos nuevos.
- Para revocar todo en cualquier momento: [myaccount.google.com/permissions](https://myaccount.google.com/permissions) → *Office Tracker* → **Quitar acceso**.

---

## 9. Cómo probar cada fase

**Fase A**
1. Abre la app en el PC y en el celular, con la misma cuenta.
2. Marca un día en el celular → en el PC debe cambiar en **menos de 1 segundo**.
3. Pon el celular en modo avión, marca un día, quita el modo avión → se sube solo.
4. Espera más de 1 hora → la sincronización entre dispositivos **sigue funcionando** sin tocar *Reconectar*.

**Fase B**
1. Cierra la app en el celular (deslízala fuera de recientes).
2. Marca un día en el PC → en el celular llega la notificación.
3. Un día obligatorio, a las 9:00 a. m. → llega *"⚠️ Hoy tienes que ir a la oficina"*.

**Fase C**
1. Con la app cerrada en todos lados, crea en Google Calendar un evento de día completo "🏢 Oficina" en el calendario Office Tracker.
2. Llega la notificación, y al abrir la app el día ya está marcado.

---

## 10. Cómo volver atrás

- La versión sin Firebase (v12) queda en el historial de git. Volver es revertir los commits de Firebase y publicar.
- Tus datos siguen en **Google Calendar** y en la **hoja del log** en todo momento, así que no se pierde nada.
- Para apagar Firebase: consola de Firebase → ⚙️ **Configuración del proyecto** → **General** → al final, **Eliminar proyecto**. Si Firebase se agregó a tu proyecto de Google Cloud existente, revisa antes que esa opción no borre también el Client ID; en ese caso basta con desactivar Authentication y borrar la base de datos de Firestore.
- Para dejar de pagar Blaze: vuelve al plan Spark desde **Uso y facturación**. Las funciones dejan de correr.
