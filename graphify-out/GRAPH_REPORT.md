# Graph Report - office-tracker  (2026-11-15)

## Corpus Check
- 57 files · ~71,722 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 515 nodes · 1509 edges · 26 communities (25 shown, 1 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 65 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Flujo de cambio y errores
- Hoja de historial (Sheets)
- Vista del mes y fechas
- Calendar y conflictos
- Tiempo real Firestore
- Avisos y enlaces profundos
- Íconos PWA y manifiesto
- Google falso (pruebas)
- Marcar y deshacer
- Pruebas de reglas y robustez
- Reloj y escenarios de prueba
- Cargador y regla v15
- Documentación y entrada
- Fases de Firebase
- Estado y capas
- Dependencias de pruebas
- Comparador de equivalencia
- Pruebas de arquitectura
- Logo original
- OAuth y permisos de Google
- Firebase falso (pruebas)
- Sincronización e indicadores
- Service worker y versiones
- Historial y auditoría
- Red de seguridad v15
- Lista de assets del SW

## God Nodes (most connected - your core abstractions)
1. `render()` - 32 edges
2. `reportar()` - 25 edges
3. `save()` - 25 edges
4. `gcal()` - 24 edges
5. `syncAll()` - 21 edges
6. `S` - 21 edges
7. `fromKey()` - 19 edges
8. `hasToken()` - 18 edges
9. `renderConexion()` - 17 edges
10. `openDaySheet()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Hoja inferior genérica #sheet (aviso / historial del día)` --conceptually_related_to--> `openNotifSheet()`  [INFERRED]
  index.html → js/funcionalidades/avisos/enlace.js
- `Título de aviso cambia con días obligatorios (S.rem[k].t + PATCH)` --references--> `tituloAviso()`  [EXTRACTED]
  CLAUDE.md → js/nucleo/avisos.js
- `Política de errores: nunca tragar (reportar/seguro)` --references--> `reportar()`  [EXTRACTED]
  CLAUDE.md → js/adaptadores/errores.js
- `Cola de sincronización enqueue() + gcal()` --references--> `enqueue()`  [EXTRACTED]
  CLAUDE.md → js/funcionalidades/sincronizacion/sincronizar.js
- `Sincronización completa syncAll() (§2.4)` --references--> `syncAll()`  [EXTRACTED]
  README.md → js/funcionalidades/sincronizacion/sincronizar.js

## Import Cycles
- 3-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 3-file cycle: `js/funcionalidades/conexion/sesion.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/conexion/sesion.js`
- 3-file cycle: `js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js`
- 3-file cycle: `js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js`
- 4-file cycle: `js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/historial/registro.js`
- 4-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 4-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 4-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 4-file cycle: `js/funcionalidades/conexion/sesion.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/conexion/sesion.js`
- 4-file cycle: `js/funcionalidades/conexion/sesion.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/conexion/sesion.js`
- 5-file cycle: `js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/historial/registro.js`
- 5-file cycle: `js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/historial/registro.js`
- 5-file cycle: `js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js`
- 5-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 5-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 5-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 5-file cycle: `js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js`
- 5-file cycle: `js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js`

## Hyperedges (group relationships)
- **Reglas de quién gana entre dispositivo, Calendar y Firestore** — readme_conflict_without_firebase, readme_conflict_with_firebase, readme_join_existing_calendar, readme_duplicate_day_events, readme_no_double_logging, readme_event_classification [EXTRACTED 1.00]
- **Fases de adopción de Firebase (A, B, C)** — docs_firebase_fase_a, docs_firebase_fase_b, docs_firebase_fase_c [EXTRACTED 1.00]
- **Capas de la arquitectura hexagonal ligera** — readme_layer_nucleo, readme_layer_estado, readme_layer_adaptadores, readme_layer_funcionalidades, readme_layer_ui, readme_hexagonal_architecture [EXTRACTED 1.00]
- **Red de seguridad contra regresiones respecto a v15** — readme_equivalence_tests, readme_parity_tests, readme_referencia_v15, readme_como_v15, readme_test_environment [INFERRED 0.85]

## Communities (26 total, 1 thin omitted)

### Community 0 - "Flujo de cambio y errores"
Cohesion: 0.07
Nodes (74): Política de errores: nunca tragar (reportar/seguro), instalarCapturaGlobal(), recientes, reportar(), seguro(), entrarConGoogle(), fbListo(), salir() (+66 more)

### Community 1 - "Hoja de historial (Sheets)"
Cohesion: 0.08
Nodes (58): agregarHistorial(), agregarOcultos(), devInfo(), DRIVE, ensureFolder(), ensureSheet(), hojaPerdida(), leerNuevas() (+50 more)

### Community 2 - "Vista del mes y fechas"
Cohesion: 0.09
Nodes (38): Título de aviso cambia con días obligatorios (S.rem[k].t + PATCH), Calendario #weeks con leyenda (Oficina, Día libre, Festivo, Hoy, Obligatorio), Pie: fórmula de meta (8, 12 desde nov. 2026), Tarjeta del mes #hero (navegación + #stats), toggle(), dayList(), hab(), renderMes() (+30 more)

### Community 3 - "Calendar y conflictos"
Cohesion: 0.13
Nodes (38): gcal(), actualizarEvento(), borrarCalendario(), buscarPorNonce(), calPath(), cambiosDesde(), crearCalendario(), crearEvento() (+30 more)

### Community 4 - "Tiempo real Firestore"
Cohesion: 0.17
Nodes (29): base(), clean(), escribir(), escucharDias(), escucharLog(), escucharOcultos(), FB_CONFIG, fbOn() (+21 more)

### Community 5 - "Avisos y enlaces profundos"
Cohesion: 0.18
Nodes (21): Enlaces profundos de avisos (?d&r&n&a), Hoja inferior genérica #sheet (aviso / historial del día), Tarjetas #festivos, #breakdown, #history, rid(), openNotifSheet(), verifyNonce(), noFui(), reconcileReminders() (+13 more)

### Community 6 - "Íconos PWA y manifiesto"
Cohesion: 0.10
Nodes (22): Office Tracker App Icon 192px, Glowing Circuit Core, Glass Calendar Motif, Dark Graphite Background, Red Brand Accent Palette, Shield Checkmark Badge, Office Tracker App Icon 512px, Brand Red on Graphite Palette (+14 more)

### Community 7 - "Google falso (pruebas)"
Cohesion: 0.17
Nodes (10): clon(), crearGoogle(), g, hojaDe(), listar(), manejar(), rango(), rangoEvento() (+2 more)

### Community 8 - "Marcar y deshacer"
Cohesion: 0.22
Nodes (16): Flujo de cambio de día (toggle → applyChange → schedulePush), Toast Deshacer #toast, registrar(), applyChange(), doUndo(), flushPushes(), hideUndo(), iniciarMarcado() (+8 more)

### Community 9 - "Pruebas de reglas y robustez"
Cohesion: 0.17
Nodes (8): CID, SCOPE, app(), conSesion(), ms(), tok(), app(), tok

### Community 10 - "Reloj y escenarios de prueba"
Cohesion: 0.21
Nodes (10): crearReloj(), prng(), conSesion(), escenarioAleatorio(), eventoDia(), INICIO, ms(), reg() (+2 more)

### Community 11 - "Cargador y regla v15"
Cohesion: 0.25
Nodes (12): AQUI, cargarApp(), crearGIS(), esperar(), IDS, REF, sinScripts(), tickReal() (+4 more)

### Community 12 - "Documentación y entrada"
Cohesion: 0.18
Nodes (13): CLAUDE.md (guía para Claude Code), graphify-out (grafo de conocimiento), index.html (estructura de la pantalla), Entrada de módulo js/app.js, Firebase compat SDK 10.14.1 (app, auth, firestore), README.md (especificación en español), Reglas de negocio RN-01…RN-30, docs/FIREBASE.md fases A (tiempo real), B (push FCM), C (webhook Calendar) (+5 more)

### Community 13 - "Fases de Firebase"
Cohesion: 0.18
Nodes (13): Detección de cambios (checkChanges cada 10 s / 60 s), Cloud Functions (calendarWebhook, renewWatch, oauthCallback), Costos y límites (Spark vs Blaze), docs/FIREBASE.md (guía de Firebase), Fase A: Firestore tiempo real (implementada), Fase B: notificaciones push con la app cerrada, Fase C: webhook de Google Calendar al instante, Migración segura (espera respuesta del servidor) (+5 more)

### Community 14 - "Estado y capas"
Cohesion: 0.27
Nodes (10): Estado global S, localStorage ot-data-v2 (esquema v:3), Política de movimiento (anim(), transform/opacity, reduced-motion), Render completo con template strings en innerHTML, Capa adaptadores/ (Google, Firebase, errores), Capa estado/ (S y guardado), Capa funcionalidades/ (mes, marcar-dia, avisos, historial, conexion, sincronizacion), Capa nucleo/ (reglas puras) (+2 more)

### Community 15 - "Dependencias de pruebas"
Cohesion: 0.20
Nodes (9): jsdom, description, devDependencies, jsdom, name, private, scripts, test (+1 more)

### Community 16 - "Comparador de equivalencia"
Cohesion: 0.29
Nodes (8): APP_VER, correr(), corto(), normalizar(), OPCIONES, primeraDiferencia(), ALEATORIOS, ESCENARIOS

### Community 17 - "Pruebas de arquitectura"
Cohesion: 0.25
Nodes (5): RAIZ, fuente(), importsDe(), JS, todos

### Community 18 - "Logo original"
Cohesion: 0.36
Nodes (8): Office Tracker Original Logo (glass calendar with circuits and shield), Circuit Lines Connecting Marked Days, Frosted Glass Day Grid with Highlighted Red Days, Glowing Red Geodesic Sphere (sync hub), PWA Icons Derived from Logo, Red Brand Palette (Scotia red), Red Shield with Checkmark Badge, Spiral-Bound Calendar with Dark Red Header

### Community 19 - "OAuth y permisos de Google"
Cohesion: 0.25
Nodes (8): Modal Conectar Google Calendar #modal (Client ID), Script Google Identity Services (gsi/client), FB_CONFIG público en el repo (no es secreto), Reglas de Firestore: cada usuario solo en users/{su uid}, Client ID de OAuth (Google Cloud), Google Identity Services (token client), Permisos mínimos (calendar.app.created, calendarlist.readonly, drive.file, calendar.events), Limpieza de eventos de la versión 2

### Community 20 - "Firebase falso (pruebas)"
Cohesion: 0.39
Nodes (6): clon(), crearFirebase(), coleccion(), consulta(), doc(), escribir()

### Community 21 - "Sincronización e indicadores"
Cohesion: 0.29
Nodes (7): Cola de sincronización enqueue() + gcal(), Tarjeta Google #gcal-bar, Chip de encabezado #sync-chip, Barra de progreso #topbar, Sincronización completa syncAll() (§2.4), Sesión de Google de ~1 hora (Sesión vencida → Reconectar), Indicadores de sincronización (barra, chip, Al día · HH:MM, ⚡ En vivo)

### Community 22 - "Service worker y versiones"
Cohesion: 0.40
Nodes (6): Estrategia de caché del SW (network-first HTML/JS/CSS, cache-first íconos), Subir VERSION (sw.js) y APP_VER juntos al publicar, Versión #app-ver / #app-ver2, GitHub Pages (hosting estático HTTPS), Service worker sw.js (offline e instalable), estructura.test.mjs (arquitectura, sw.js, versión)

### Community 23 - "Historial y auditoría"
Cohesion: 0.40
Nodes (5): Hoja «Office Tracker · Historial» solo de agregar (RN-27), Modelo Firestore users/{uid}/days|log|hidden, Google Drive (carpeta office-tracker), Google Sheets (hoja de historial), Borrar registro = ocultarlo en todos los dispositivos (RN-28)

### Community 24 - "Red de seguridad v15"
Cohesion: 0.50
Nodes (5): tests/entorno/como-v15.mjs (cambios intencionales revertidos), Pruebas de equivalencia contra v15, paridad.test.mjs (núcleo vs v15), Copia congelada tests/referencia-v15, Entorno de pruebas jsdom con reloj y servicios falsos

## Ambiguous Edges - Review These
- `Frosted Glass Day Grid with Highlighted Red Days` → `Red Shield with Checkmark Badge`  [AMBIGUOUS]
  img/logo-original.png · relation: conceptually_related_to

## Knowledge Gaps
- **79 isolated node(s):** `recientes`, `link`, `LS_DANADO`, `LS_DATA`, `LS_DEV` (+74 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 109 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Frosted Glass Day Grid with Highlighted Red Days` and `Red Shield with Checkmark Badge`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `crearGoogle()` connect `Google falso (pruebas)` to `Cargador y regla v15`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `Entrada de módulo js/app.js` connect `Documentación y entrada` to `Flujo de cambio y errores`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `index.html (estructura de la pantalla)` connect `Documentación y entrada` to `OAuth y permisos de Google`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `render()` (e.g. with `deleteLog()` and `renderConexion()`) actually correct?**
  _`render()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `recientes`, `link`, `LS_DANADO` to the rest of the system?**
  _79 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Flujo de cambio y errores` be split into smaller, more focused modules?**
  _Cohesion score 0.07297514033680834 - nodes in this community are weakly interconnected._