# 🏢 ScotiaTech Office Tracker — PWA

Tracker de visitas a oficina con festivos colombianos automáticos y sincronización con Google Calendar.

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

## 🔗 Sincronización con Google Calendar (opcional)

### Crear Client ID en Google Cloud

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. **Crear proyecto** → ponle un nombre → Crear
3. Menú → **"APIs y servicios" → "Biblioteca"**
4. Busca **"Google Calendar API"** → Habilitar
5. Ve a **"APIs y servicios" → "Credenciales"**
6. **"+ Crear credenciales" → "ID de cliente OAuth 2.0"**
   - Tipo: **Aplicación web**
   - Nombre: `Office Tracker`
   - En **"Orígenes de JavaScript autorizados"** agrega:  
     `https://TU-USUARIO.github.io`
7. Clic en **Crear** → Copia el **Client ID**

> Si tu proyecto de Google Cloud está en modo **Prueba**, agrégate como usuario de prueba en **Pantalla de consentimiento de OAuth**.

### Conectar en la app

1. Abre la PWA en tu Android
2. En la barra azul inferior → toca **"Conectar →"**
3. Pega el Client ID
4. Toca **"Guardar y conectar"**
5. Autoriza con tu cuenta Google
6. ¡Listo! Cada día que marques se crea automáticamente en tu Google Calendar

### Calendario propio "Office Tracker"

Al conectar, la app crea en tu Google Calendar un calendario secundario llamado **Office Tracker**. Ahí guarda los días marcados y los avisos diarios; tu calendario principal no se toca. El permiso que pide (`calendar.app.created`) solo da acceso a calendarios creados por esta app, no a tus otros eventos.

- Lo ves en Google Calendar con su propio color; puedes ocultarlo sin afectar la app.
- **Sincronización en ambos sentidos:** puedes crear, mover, renombrar o borrar días desde la app de Calendar. Un evento de día completo con 🏢 u "oficina" en el título cuenta como oficina; con 🏖️, "libre" o "vacaciones" cuenta como día libre. Se refleja al abrir o volver al tracker.
- Si cambias algo en el celular y aún no se ha subido (punto azul), gana el celular. Si no, gana Calendar.
- La sesión de Google dura ~1 hora y se conserva aunque cierres la app. Cuando vence, toca **Reconectar**; lo marcado mientras tanto se sube solo.

**Si venías de la versión anterior:** tus días se suben al calendario nuevo automáticamente. En la barra azul aparece **"Borrar N eventos viejos del calendario principal"**; tócalo una vez y Google te pedirá un permiso adicional solo para esa limpieza.

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
- El historial de cada día también queda escrito en la descripción del evento en Google Calendar, así que se puede revisar desde cualquier dispositivo.

---

## 🔄 Publicar actualizaciones

Cada vez que subas cambios a GitHub Pages, abre `sw.js` y sube la versión (`const VERSION = 'v4'`, `'v5'`…). La app carga el HTML desde la red primero, así que basta con cerrarla y abrirla para ver la versión nueva.

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

---

*Datos guardados en el dispositivo (localStorage). Con Google Calendar activado, también se sincronizan en tu calendario.*
