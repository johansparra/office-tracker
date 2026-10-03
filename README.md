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

### Conectar en la app

1. Abre la PWA en tu Android
2. En la barra azul inferior → toca **"Conectar →"**
3. Pega el Client ID
4. Toca **"Guardar y conectar"**
5. Autoriza con tu cuenta Google
6. ¡Listo! Cada día que marques se crea automáticamente en tu Google Calendar

### Cómo funciona la sincronización

- Cambiar un día de 🏢 a 🏖️ **actualiza** el mismo evento (ya no crea duplicados).
- La sesión de Google dura ~1 hora y se conserva aunque cierres la app. Cuando vence, la barra muestra **"Sesión vencida · N cambios por subir"** y el botón **Reconectar**. Puedes seguir marcando días sin conexión; al reconectar se suben solos.
- Al sincronizar un mes: lo que cambiaste en el teléfono y no se ha subido gana; lo demás lo manda Calendar (si borras un evento en Calendar, desaparece de la app). Si hay eventos duplicados de un mismo día, se deja uno.
- El permiso solicitado es solo para **eventos** del calendario (`calendar.events`), no para administrar tus calendarios.

---

## 🔄 Publicar actualizaciones

Cada vez que subas cambios a GitHub Pages, abre `sw.js` y sube la versión (`const VERSION = 'v3'`, `'v4'`…). La app carga el HTML desde la red primero, así que basta con cerrarla y abrirla para ver la versión nueva.

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
| 1 clic (festivo 🇨🇴 entre semana) | 🏢 Fui a la oficina |
| 2 clics (festivo 🇨🇴 entre semana) | Quitar |
| 1 clic (fin de semana) | 🏖️ Marcar festivo |
| 2 clics (fin de semana) | Quitar |

Los días 🇨🇴 son festivos automáticos — no necesitas marcarlos.

Un punto azul en la esquina de un día indica que ese cambio aún no se ha subido a Google Calendar.

---

*Datos guardados en el dispositivo (localStorage). Con Google Calendar activado, también se sincronizan en tu calendario.*
