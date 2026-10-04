# 🏢 ScotiaTech Office Tracker — PWA

Tracker de visitas a oficina con festivos colombianos automáticos, sincronización con Google Calendar entre todos tus dispositivos e historial permanente en Google Sheets.

---

## 📱 Instalación en Android (GitHub Pages)

### Paso 1 — Subir a GitHub Pages

1. Ve a **github.com** y crea una cuenta (si no tienes) o inicia sesión
2. Clic en **"New repository"**
   - Nombre: `office-tracker`
   - Visibilidad: **Public**
   - Clic en **"Create repository"**
3. Sube todos estos archivos:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
4. Ve a **Settings → Pages**
5. En "Source" selecciona **"Deploy from branch"** → branch `main` → folder `/` (root)
6. Espera ~2 minutos. Tu URL será:  
   `https://TU-USUARIO.github.io/office-tracker`

### Paso 2 — Instalar en Android

1. Abre la URL en **Chrome para Android**
2. Chrome mostrará un banner **"Agregar a pantalla de inicio"** — toca "Instalar"
3. Si no aparece el banner: menú ⋮ → **"Agregar a pantalla de inicio"**
4. La app aparece en tu home screen como app nativa ✅

---

## 🔗 Sincronización con Google (opcional)

Al conectar tu cuenta de Google, la app:

- Guarda tus días y los avisos diarios en un calendario propio llamado **Office Tracker**.
- Mantiene el **mismo calendario** en todos tus dispositivos (PC, celular…).
- Copia todo el historial de cambios a una hoja de cálculo **Office Tracker · Historial** en tu Google Drive.

Todo corre en tu navegador; no hay servidor de por medio. Solo necesitas un **Client ID** de Google Cloud (se crea una sola vez).

### 1. Crear el proyecto y activar las APIs

1. Entra a [console.cloud.google.com](https://console.cloud.google.com) con la misma cuenta de Google que vas a conectar.
2. Arriba, en el selector de proyectos → **Proyecto nuevo** → nombre (por ejemplo `office-tracker`) → **Crear**. Verifica que quede seleccionado.
3. Menú ☰ → **APIs y servicios → Biblioteca**. Busca y toca **Habilitar** en las tres:
   - **Google Calendar API**: días y avisos
   - **Google Sheets API**: escribir el historial en la hoja
   - **Google Drive API**: crear la carpeta y encontrar la hoja

> Si falta alguna, la app lo dice en la tarjeta de Google: *«La Google … API no está activada en tu proyecto de Google Cloud»*.

### 2. Configurar la pantalla de consentimiento (Google Auth Platform)

Menú ☰ → **APIs y servicios → Pantalla de consentimiento de OAuth**. En la consola nueva se llama **Google Auth Platform**.

1. **Información de la marca** (*Branding*): nombre de la app `Office Tracker`, tu correo de asistencia y tu correo de contacto. Guarda.
2. **Público** (*Audience*):
   - Tipo de usuario: **Externo**.
   - Estado de publicación: **Prueba** (no hace falta publicar ni verificar la app para uso personal).
   - En **Usuarios de prueba** → **+ Agregar usuarios** → escribe tu correo de Gmail → Guardar. **Sin este paso Google bloquea el acceso** (ver *Solución de problemas*).
3. **Acceso a datos** (*Data access*) → **Agregar o quitar permisos**. Marca, o pega en *Agregar permisos manualmente*, estos tres y guarda:

| Permiso | Para qué |
|---|---|
| `https://www.googleapis.com/auth/calendar.app.created` | Crear el calendario Office Tracker y manejar sus eventos. **No** da acceso a tus otros calendarios ni eventos. |
| `https://www.googleapis.com/auth/calendar.calendarlist.readonly` | Ver la lista de tus calendarios, solo los nombres. Así cada dispositivo encuentra el Office Tracker que ya existe en vez de crear otro. |
| `https://www.googleapis.com/auth/drive.file` | Crear la carpeta `office-tracker` y la hoja del historial. **Solo** ve archivos que creó esta app, no el resto de tu Drive. |

### 3. Crear el Client ID

1. **Google Auth Platform → Clientes** (o **APIs y servicios → Credenciales → + Crear credenciales → ID de cliente de OAuth**).
2. Tipo de aplicación: **Aplicación web**. Nombre: `Office Tracker`.
3. **Orígenes de JavaScript autorizados** → **+ Agregar URI** → `https://TU-USUARIO.github.io` (solo el dominio, sin `/office-tracker` ni `/` al final).
4. **URIs de redireccionamiento autorizados**: déjalo vacío.
5. **Crear** → copia el **ID de cliente** (termina en `.apps.googleusercontent.com`).

> La app **solo** usa el Client ID. El *secreto del cliente* y el archivo `client_secret_….json` que Google ofrece descargar **no se usan**: no los pegues en la app ni los subas al repositorio.

### 4. Conectar en la app

1. Abre la app. La tarjeta **Google Calendar** está arriba del todo → **Conectar**.
2. Pega el Client ID → **Guardar y conectar**.
3. Elige tu cuenta. Google mostrará *«Google no verificó esta app»*: es normal en modo Prueba → **Continuar**.
4. **Marca todas las casillas de permisos** (calendario y Drive) → **Continuar**. Si dejas alguna sin marcar, la app muestra *«Faltan permisos»* y al tocar **Reconectar** te las vuelve a pedir.
5. La tarjeta pasa a *«Calendario «Office Tracker» al día»*.

**Varios dispositivos:** conecta primero uno y espera a que diga *al día*; luego conecta los demás con **el mismo Client ID** y la **misma cuenta**. Todos usan el mismo calendario y la misma hoja.

### Calendario propio «Office Tracker»

- La app crea en tu Google Calendar un calendario secundario **Office Tracker**; tu calendario principal no se toca. Lo ves con su propio color y puedes ocultarlo sin afectar la app.
- **Uno solo por cuenta.** En cada sincronización la app busca los calendarios con ese nombre. Si hay más de uno (por ejemplo, dos dispositivos que se conectaron a la vez), todos eligen el mismo, le copian los días de los otros y borran los sobrantes. Nunca crea uno nuevo si no pudo buscar primero.
- **Si borras el calendario en Google**, la app crea uno nuevo y vuelve a subir los días que tiene guardados en el dispositivo.
- **Al unirse a un calendario que ya existe** (un segundo dispositivo, por ejemplo), gana lo que ya está en Google; solo se suben los días que Google no tiene.
- **Sincronización en ambos sentidos:** puedes crear, mover, renombrar o borrar días desde Google Calendar. Un evento de día completo con 🏢 u "oficina" en el título cuenta como oficina; con 🏖️, "libre" o "vacaciones" cuenta como día libre.
- **¿Cuándo sincroniza? Casi en tiempo real mientras la app está abierta.** Cada **10 segundos** hace dos consultas livianas a Google: si cambió algún evento del calendario Office Tracker (en otro dispositivo o directamente en Google Calendar) o si cambió la hoja del log. Solo si detecta un cambio hace la sincronización completa, así que lo que marcas en el celular aparece en el PC en **~10 segundos**, y al revés.
- Además sincroniza al abrir la app, al volver a ella o a su ventana, al recuperar internet y, como respaldo, cada 5 minutos.
- Con la app cerrada no detecta nada: se pone al día apenas la abres. Para avisos con la app cerrada siguen los de Google Calendar. Detectar cambios con la app cerrada requiere un servidor.
- Si cambias algo en un dispositivo y aún no se ha subido (punto azul), gana ese cambio. Si no, gana Google Calendar.
- La sesión de Google dura **~1 hora** (límite de Google para apps sin servidor). Cuando vence, la tarjeta dice **Sesión vencida** → toca **Reconectar**. Lo marcado mientras tanto queda guardado y se sube al reconectar.

### Historial permanente en Google Sheets

- Cada cambio del historial se agrega como fila en la hoja **Office Tracker · Historial**, dentro de la carpeta **office-tracker** en la raíz de **Mi unidad** (`Mi unidad/office-tracker/`). La app crea la carpeta y la hoja la primera vez.
- Funciona como un **log de auditoría**: una fila por evento, en orden cronológico, con filtro y la fila de títulos fija. Columnas:

| Columna | Ejemplo | Qué es |
|---|---|---|
| Timestamp (ISO 8601) | `2026-10-03T21:29:05.123-05:00` | Momento exacto del cambio, con milisegundos y zona |
| Fecha y hora local | `2026-10-03 21:29:05` | Lo mismo, legible |
| ID evento | `e5b07221` | Id único del cambio (el mismo que muestra la app) |
| Nivel | `INFO` / `WARN` | `WARN` si el código del aviso no coincidía |
| Acción | `MARCAR` · `DESMARCAR` · `CAMBIAR` · `CONFIRMAR` | Qué pasó con el día |
| Origen | `Manual` · `Calendar` · `Aviso ✓` · `Deshecho` | De dónde vino el cambio |
| Día afectado · Día de la semana · Semana ISO | `2026-10-07` · `miércoles` · `2026-W41` | El día que cambió |
| Festivo | `Día de la Raza` | Nombre del festivo, si lo es |
| Estado anterior · Estado nuevo | `Vacío` → `Oficina` | Antes y después |
| Aviso · Verificación del aviso · Referencia (código) | `10:00 a. m.` · `Verificado` · `51c46fc5` | Solo para cambios hechos desde un aviso |
| Detalle | `Editado en Google Calendar` | Descripción completa |
| ID dispositivo · Dispositivo | `72bf` · `Windows · Chrome · navegador` | Qué dispositivo lo registró |
| Cuenta Google | `tu@gmail.com` | Cuenta conectada |
| Versión app · Zona horaria | `v9` · `America/Bogota` | Versión y zona del dispositivo |
| Subido a la hoja | `2026-10-03T21:30:00.000-05:00` | Cuándo llegó a la hoja |
| Datos (JSON) | `{"id":"e5b07221",…}` | El registro completo; la app lo usa para leer el historial de vuelta exacto. No lo edites |

- La app revisa la hoja una vez por sesión y la repara sola: si falta la pestaña **Historial**, los títulos o el formato, los vuelve a poner.
- **La hoja nunca se borra desde la app**: es el registro permanente. Si borras un registro en la app antes de que llegue a la hoja, igual se sube.
- Todos tus dispositivos escriben en la misma hoja; la columna *Dispositivo* dice de cuál vino cada fila.
- **El historial de la app es compartido:** en cada sincronización la app lee la hoja y muestra los registros de **todos** tus dispositivos (los de otro dispositivo llevan la etiqueta *otro disp.*). Lo que marcas en el celular aparece en el historial del PC y al revés.
- Cuando un dispositivo recibe por Calendar un cambio que hizo otro, no lo registra dos veces: solo queda el registro original (*Manual*, *Aviso*…). Los cambios hechos directamente en Google Calendar sí quedan como *Calendar*.
- **Borrar en la app oculta en todos los dispositivos:** el id del registro se anota en la pestaña **Ocultos** de la misma hoja. La fila del log **no** se borra.
- En la tarjeta de Google aparece el enlace **Ver historial en Google Sheets**.
- Puedes moverla a otra carpeta o agregarla como fuente en un proyecto de Drive o Gemini. La app la sigue encontrando por nombre. Para que no se rompa:
  - **No le cambies el nombre** ni a la hoja ni a las pestañas **Historial** y **Ocultos**, y no reordenes las filas del Historial (la app lee solo las filas nuevas).
  - Si la mandas a la papelera, la app crea una nueva y sigue escribiendo ahí.
  - Si ya tenías una carpeta `office-tracker` creada a mano, la app no la ve (por el permiso `drive.file`) y crea la suya. Borra la manual para no tener dos.

### Desconectar o cambiar de Client ID

- **Desconectar** (en la tarjeta de Google): cierra la sesión y olvida el Client ID en ese dispositivo. Opcionalmente borra el calendario Office Tracker de Google. Tus días marcados se quedan en el dispositivo y se vuelven a subir al conectar.
- **Cambiar Client ID** (aparece con la sesión vencida): pega el nuevo. Con un Client ID de **otro proyecto**, la app no puede ver el calendario ni la hoja que creó el anterior (los permisos son por proyecto): bórralos a mano en Google Calendar → Configuración → Office Tracker → **Eliminar**, y en Drive.
- Si cambian los permisos que pide la app, verás **Sesión vencida** al abrirla: toca **Reconectar** y acepta los permisos nuevos.

### Solución de problemas

| Lo que ves | Causa y solución |
|---|---|
| **«Acceso bloqueado: … no completó el proceso de verificación de Google» · Error 403: access_denied** | El proyecto está en modo Prueba y tu cuenta no es usuario de prueba. **Google Auth Platform → Público → Usuarios de prueba → + Agregar usuarios** → tu correo. Espera 1–2 minutos y reconecta. |
| **«Google no verificó esta app»** | Normal en modo Prueba → **Continuar**. |
| **«La Google … API no está activada en tu proyecto…»** | Habilita esa API en **APIs y servicios → Biblioteca** (paso 1). |
| **«Faltan permisos…»** | Quedó alguna casilla sin marcar. **Reconectar** y marca todas. Revisa también **Acceso a datos** (paso 2.3). |
| **Sesión vencida** | Pasó ~1 hora. **Reconectar**. |
| **El chip de arriba dice «Error»** | La tarjeta de Google muestra el motivo exacto bajo *No se pudo sincronizar*. |
| **Dos calendarios «Office Tracker»** | Se unen solos en la siguiente sincronización. Si vienen de otro Client ID, bórralos a mano. |
| **Los avisos no suenan en Android** | App Google Calendar → Configuración → tu cuenta → **Office Tracker**: activa *Sincronizar* y las notificaciones. |
| **Error de origen (`origin_mismatch`)** | En el Client ID, *Orígenes de JavaScript autorizados* debe ser exactamente `https://TU-USUARIO.github.io`. |

**Si venías de la versión 2:** tus días se suben al calendario nuevo automáticamente. En la tarjeta de Google aparece **"Borrar N eventos viejos del calendario principal"**; tócalo una vez y Google te pedirá un permiso adicional solo para esa limpieza.

### Avisos de las 10:00 a. m. y 4:30 p. m.

La app programa en el calendario Office Tracker dos avisos de lunes a viernes (**"¿Vas a la oficina hoy?"** y **"¿Fuiste a la oficina hoy?"**), saltándose festivos y fines de semana, con 3 semanas de anticipación. Se renuevan cada vez que abres la app.

- Al marcar un día (🏢 o 🏖️), los avisos pendientes de ese día se borran: si confirmas a las 11, no te suena el de las 4:30.
- Cada aviso trae un enlace con un código único. Al tocarlo se abre el tracker con el día listo para confirmar: **Fui a la oficina**, **Día libre** u **Hoy no fui** (este último cancela el aviso que quede ese día).
- Para recibirlos en Android: en la app Google Calendar → Configuración → tu cuenta → **Office Tracker**, verifica que esté sincronizado y con notificaciones activas.
- Si el enlace abre en una pestaña de Chrome y no en la app: Ajustes de Android → Apps → OfficeTracker → **Abrir de forma predeterminada** → activa los enlaces compatibles.

### Deshacer y auditoría

- Cada toque se aplica en pantalla al instante, pero espera **5 segundos** antes de subirse, con una barra **Deshacer** abajo. Si sales de la app antes, se sube de inmediato.
- Todo cambio queda en el **historial** con su origen: **Manual** (toque en la app), **Aviso ✓** (enlace de notificación con código verificado), **Aviso ⚠** (el código no corresponde a ese día), **Aviso ?** (no se pudo verificar), **Calendar** (editado desde Google Calendar) o **Deshecho**. También guarda la hora exacta, un id del cambio y el código del dispositivo.
- **Mantén presionado un día** (o toca una fila del historial) para ver su detalle completo.
- **Borrar registros:** cada fila del historial (en la tarjeta y en el detalle del día) tiene una papelera 🗑 para borrar ese registro, y la tarjeta tiene **Borrar todos** para los del mes visible. Solo se borran del historial de la app: los días marcados no cambian y los registros siguen en la hoja de Google Sheets.
- El historial de cada día también queda escrito en la descripción del evento en Google Calendar, así que se puede revisar desde cualquier dispositivo.

---

## 🔄 Publicar actualizaciones

Cada vez que subas cambios a GitHub Pages, abre `sw.js` y sube la versión (`const VERSION = 'v12'` → `'v13'`…), y pon el mismo valor en `APP_VER` dentro de `index.html` (sale en la columna *Versión app* del log). La app carga el HTML desde la red primero, así que basta con cerrarla y abrirla para ver la versión nueva.

---

## 🇨🇴 Festivos Colombia incluidos

Los festivos se calculan **automáticamente** para cualquier año:

| Tipo | Festivos |
|------|---------|
| Fijos | Año Nuevo, Día del Trabajo, Independencia, Batalla de Boyacá, Inmaculada Concepción, Navidad |
| Ley Emiliani | Reyes Magos, San José, San Pedro y San Pablo, Asunción, Día de la Raza, Todos los Santos, Indep. Cartagena |
| Semana Santa | Jueves Santo, Viernes Santo, Ascensión, Corpus Christi, Sagrado Corazón |

---

## 📊 Lógica de la meta

- **Base:** 8 visitas por mes
- **Semana con festivo o vacación:** cuota = 1 (en vez de 2)
- **Meta ajustada:** `8 − número de semanas con festivo/vacación`
- Los festivos cuentan **cualquier día de la semana**, incluso sábado o domingo
- **Semanas que cruzan de mes:** la semana se muestra completa, pero solo cuentan los días del mes visible (visitas, festivos y vacaciones). Ningún día suma en dos meses.
- **Lo ideal es 2 por semana, pero lo que manda es la meta del mes.** La app cuenta los **días hábiles libres** que quedan (lunes a viernes, desde hoy, sin festivos y sin días ya marcados) y los compara con las visitas que te faltan:

| Situación | Lo que ves |
|---|---|
| Te sobran más de 2 días hábiles | ✅ *Vas bien* y tu margen |
| Te sobran 1 o 2 | ⚠️ *Poco margen: solo puedes faltar N* |
| Faltan exactamente los días hábiles que quedan | 🚨 **Tienes que ir sí o sí** y la lista de días |
| Faltan más que los días hábiles que quedan | 🚨 **No alcanzas la meta** y la lista de días que aún puedes ir |

- Cuando la alerta es *sí o sí*, esos días se marcan en el calendario con un **borde rojo punteado** (leyenda *Obligatorio*), y el aviso de las 10:00 a. m. de esos días cambia a **"⚠️ Hoy tienes que ir a la oficina"**.
- Ejemplo (octubre 2026, meta 7 por el festivo del 12): el lunes 26 llevas 2 visitas → faltan 5 y quedan 5 días hábiles (26 al 30) → los 5 son obligatorios.

---

## 🔄 Uso del tracker

| Acción | Resultado |
|--------|-----------|
| 1 clic (día hábil) | 🏢 Fui a la oficina |
| 2 clics (día hábil) | 🏖️ Día libre / vacación |
| 3 clics | Quitar estado |
| 1 clic (festivo entre semana) | 🏢 Fui a la oficina |
| 2 clics (festivo entre semana) | Quitar |
| 1 clic (fin de semana) | 🏖️ Marcar festivo |
| 2 clics (fin de semana) | Quitar |
| Mantener presionado | Ver historial del día |

Los festivos de Colombia (franja amarillo-azul-rojo) son automáticos — no necesitas marcarlos.

Un punto azul en la esquina de un día indica que ese cambio aún no se ha subido a Google Calendar.

### Indicadores de sincronización y versión

- Mientras la app habla con Google (subir un día, traer cambios, actualizar avisos, escribir en el log) aparece una **barra azul animada arriba de la pantalla**, el chip del encabezado gira con **Sincronizando** y la tarjeta de Google dice en qué paso va: *Buscando el calendario…*, *Sincronizando días…*, *Actualizando avisos…*, *Escribiendo en el log…*.
- Al terminar, la tarjeta dice **Al día · HH:MM** con la hora de la última sincronización.
- La **versión** de la app (`v11`, …) se ve arriba junto a *ScotiaTech · GBS* y al final de la página. Debe coincidir con la última publicada; si no, cierra y abre la app (en PC, **Ctrl+Shift+R**).
- **Ver log**: en la tarjeta de historial, en el detalle de cada día y en la tarjeta de Google hay un enlace directo a la hoja de Google Sheets.

---

*Datos guardados en el dispositivo (localStorage). Con Google conectado, los días se sincronizan en tu calendario Office Tracker y el historial queda en Google Sheets.*
