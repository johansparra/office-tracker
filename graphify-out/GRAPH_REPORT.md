# Graph Report - office-tracker  (2026-11-15)

## Corpus Check
- 23 files · ~107,694 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 522 nodes · 1518 edges · 27 communities (26 shown, 1 thin omitted)
- Extraction: 95% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 67 edges (avg confidence: 0.85)
- Token cost: 346,792 input · 0 output

## Community Hubs (Navigation)
- Flujo de cambio y errores
- Constantes, fechas e historial
- Calendar y conflictos
- Avisos y meta del mes
- Tiempo real Firestore
- Íconos PWA y manifiesto
- Google falso (pruebas)
- Reloj y escenarios de prueba
- Cargador y regla v15
- Estado y capas
- Dependencias de pruebas
- Comparador de equivalencia
- Sincronización e indicadores
- Pruebas de paridad
- Logo original
- OAuth y permisos de Google
- Historial y auditoría
- Firebase falso (pruebas)
- Pruebas de arquitectura
- Service worker y versiones
- Fases B y C de Firebase
- Logo nuevo (SVG)
- Pruebas de robustez
- Documentación del proyecto
- Fase A de Firebase
- Entrada HTML y scripts
- Lista de assets del SW

## God Nodes (most connected - your core abstractions)
1. `render()` - 32 edges
2. `save()` - 25 edges
3. `reportar()` - 25 edges
4. `gcal()` - 24 edges
5. `syncAll()` - 21 edges
6. `S` - 21 edges
7. `fromKey()` - 19 edges
8. `hasToken()` - 18 edges
9. `renderConexion()` - 17 edges
10. `openDaySheet()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Ciclo de toques por tipo de día (RN-11)` --references--> `siguienteEstado()`  [EXTRACTED]
  README.md → js/nucleo/marcado.js
- `Fase C: webhook de Google Calendar al instante` --semantically_similar_to--> `Detección de cambios (checkChanges cada 10 s / 60 s)`  [INFERRED] [semantically similar]
  docs/FIREBASE.md → CLAUDE.md
- `Hoja inferior genérica #sheet (aviso / historial del día)` --conceptually_related_to--> `openNotifSheet()`  [INFERRED]
  index.html → js/funcionalidades/avisos/enlace.js
- `Límite de 1000 registros y 10 por día en Calendar (RN-30)` --references--> `dayBody()`  [EXTRACTED]
  README.md → js/funcionalidades/sincronizacion/reconciliar.js
- `Festivos de Colombia automáticos (RN-14)` --references--> `holidays()`  [EXTRACTED]
  README.md → js/nucleo/festivos.js

## Import Cycles
- 3-file cycle: `js/funcionalidades/conexion/sesion.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/conexion/sesion.js`
- 3-file cycle: `js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js`
- 3-file cycle: `js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js`
- 3-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 4-file cycle: `js/funcionalidades/conexion/sesion.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/conexion/sesion.js`
- 4-file cycle: `js/funcionalidades/conexion/sesion.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/conexion/sesion.js`
- 4-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 4-file cycle: `js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/historial/registro.js`
- 4-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 4-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 5-file cycle: `js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js`
- 5-file cycle: `js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js`
- 5-file cycle: `js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js`
- 5-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 5-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 5-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 5-file cycle: `js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/historial/registro.js`
- 5-file cycle: `js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/historial/registro.js`

## Hyperedges (group relationships)
- **Fases de adopción de Firebase (A, B, C)** — docs_firebase_fase_a, docs_firebase_fase_b, docs_firebase_fase_c [EXTRACTED 1.00]
- **Capas de la arquitectura hexagonal ligera** — readme_layer_nucleo, readme_layer_estado, readme_layer_adaptadores, readme_layer_funcionalidades, readme_layer_ui, readme_hexagonal_architecture [EXTRACTED 1.00]
- **Reglas de quién gana entre dispositivo, Calendar y Firestore** — readme_conflict_without_firebase, readme_conflict_with_firebase, readme_join_existing_calendar, readme_duplicate_day_events, readme_no_double_logging, readme_event_classification [EXTRACTED 1.00]
- **Red de seguridad contra regresiones respecto a v15** — readme_equivalence_tests, readme_parity_tests, readme_referencia_v15, readme_como_v15, readme_test_environment [INFERRED 0.85]
- **Logo composition: calendar + sync circuits + verified-visit shield** — img_nuevo_glass_calendar, img_nuevo_circuit_traces, img_nuevo_crystal_sphere, img_nuevo_shield_check [INFERRED 0.85]

## Communities (27 total, 1 thin omitted)

### Community 0 - "Flujo de cambio y errores"
Cohesion: 0.06
Nodes (94): Flujo de cambio de día (toggle → applyChange → schedulePush), Enlaces profundos de avisos (?d&r&n&a), Política de errores: nunca tragar (reportar/seguro), Hoja inferior genérica #sheet (aviso / historial del día), Toast Deshacer #toast, instalarCapturaGlobal(), recientes, reportar() (+86 more)

### Community 1 - "Constantes, fechas e historial"
Cohesion: 0.08
Nodes (66): devInfo(), DRIVE, LOG_COLS, LOG_LAST, logRow(), SHEETS, sheetUrl(), UI_TYPE (+58 more)

### Community 2 - "Calendar y conflictos"
Cohesion: 0.08
Nodes (57): rid(), AuthError, gcal(), actualizarEvento(), borrarCalendario(), buscarPorNonce(), calPath(), cambiosDesde() (+49 more)

### Community 3 - "Avisos y meta del mes"
Cohesion: 0.11
Nodes (30): Título de aviso cambia con días obligatorios (S.rem[k].t + PATCH), Calendario #weeks con leyenda (Oficina, Día libre, Festivo, Hoy, Obligatorio), Pie: fórmula de meta (8, 12 desde nov. 2026), Tarjeta del mes #hero (navegación + #stats), noFui(), reconcileReminders(), syncRemindersForDate(), titulo() (+22 more)

### Community 4 - "Tiempo real Firestore"
Cohesion: 0.17
Nodes (29): base(), clean(), escribir(), escucharDias(), escucharLog(), escucharOcultos(), FB_CONFIG, fbOn() (+21 more)

### Community 5 - "Íconos PWA y manifiesto"
Cohesion: 0.10
Nodes (22): Office Tracker App Icon 192px, Glowing Circuit Core, Glass Calendar Motif, Dark Graphite Background, Red Brand Accent Palette, Shield Checkmark Badge, Office Tracker App Icon 512px, Brand Red on Graphite Palette (+14 more)

### Community 6 - "Google falso (pruebas)"
Cohesion: 0.17
Nodes (10): clon(), crearGoogle(), g, hojaDe(), listar(), manejar(), rango(), rangoEvento() (+2 more)

### Community 7 - "Reloj y escenarios de prueba"
Cohesion: 0.21
Nodes (10): crearReloj(), prng(), conSesion(), escenarioAleatorio(), eventoDia(), INICIO, ms(), reg() (+2 more)

### Community 8 - "Cargador y regla v15"
Cohesion: 0.25
Nodes (12): AQUI, cargarApp(), crearGIS(), esperar(), IDS, REF, sinScripts(), tickReal() (+4 more)

### Community 9 - "Estado y capas"
Cohesion: 0.27
Nodes (10): Estado global S, localStorage ot-data-v2 (esquema v:3), Política de movimiento (anim(), transform/opacity, reduced-motion), Render completo con template strings en innerHTML, Capa adaptadores/ (Google, Firebase, errores), Capa estado/ (S y guardado), Capa funcionalidades/ (mes, marcar-dia, avisos, historial, conexion, sincronizacion), Capa nucleo/ (reglas puras) (+2 more)

### Community 10 - "Dependencias de pruebas"
Cohesion: 0.20
Nodes (9): jsdom, description, devDependencies, jsdom, name, private, scripts, test (+1 more)

### Community 11 - "Comparador de equivalencia"
Cohesion: 0.29
Nodes (8): RAIZ, correr(), corto(), normalizar(), OPCIONES, primeraDiferencia(), ALEATORIOS, ESCENARIOS

### Community 12 - "Sincronización e indicadores"
Cohesion: 0.25
Nodes (9): Detección de cambios (checkChanges cada 10 s / 60 s), Cola de sincronización enqueue() + gcal(), Tarjeta Google #gcal-bar, Chip de encabezado #sync-chip, Barra de progreso #topbar, Firebase tiempo real (Auth + Firestore), Sincronización completa syncAll() (§2.4), Sesión de Google de ~1 hora (Sesión vencida → Reconectar) (+1 more)

### Community 13 - "Pruebas de paridad"
Cohesion: 0.28
Nodes (5): APP_VER, igual(), plano(), r, tipoAzar()

### Community 14 - "Logo original"
Cohesion: 0.36
Nodes (8): Office Tracker Original Logo (glass calendar with circuits and shield), Circuit Lines Connecting Marked Days, Frosted Glass Day Grid with Highlighted Red Days, Glowing Red Geodesic Sphere (sync hub), PWA Icons Derived from Logo, Red Brand Palette (Scotia red), Red Shield with Checkmark Badge, Spiral-Bound Calendar with Dark Red Header

### Community 15 - "OAuth y permisos de Google"
Cohesion: 0.25
Nodes (8): Modal Conectar Google Calendar #modal (Client ID), Script Google Identity Services (gsi/client), FB_CONFIG público en el repo (no es secreto), Reglas de Firestore: cada usuario solo en users/{su uid}, Client ID de OAuth (Google Cloud), Google Identity Services (token client), Permisos mínimos (calendar.app.created, calendarlist.readonly, drive.file, calendar.events), Limpieza de eventos de la versión 2

### Community 16 - "Historial y auditoría"
Cohesion: 0.25
Nodes (8): Tarjetas #festivos, #breakdown, #history, Hoja «Office Tracker · Historial» solo de agregar (RN-27), Registro de auditoría de cada cambio (RN-26), Modelo Firestore users/{uid}/days|log|hidden, Google Drive (carpeta office-tracker), Google Sheets (hoja de historial), Borrar registro = ocultarlo en todos los dispositivos (RN-28), Respuesta «Hoy no fui» compartida (RN-19)

### Community 17 - "Firebase falso (pruebas)"
Cohesion: 0.39
Nodes (6): clon(), crearFirebase(), coleccion(), consulta(), doc(), escribir()

### Community 18 - "Pruebas de arquitectura"
Cohesion: 0.29
Nodes (4): fuente(), importsDe(), JS, todos

### Community 19 - "Service worker y versiones"
Cohesion: 0.33
Nodes (7): Estrategia de caché del SW (network-first HTML/JS/CSS, cache-first íconos), Subir VERSION (sw.js) y APP_VER juntos al publicar, Versión #app-ver / #app-ver2, GitHub Pages (hosting estático HTTPS), Arquitectura hexagonal ligera por funcionalidades, Service worker sw.js (offline e instalable), estructura.test.mjs (arquitectura, sw.js, versión)

### Community 20 - "Fases B y C de Firebase"
Cohesion: 0.33
Nodes (7): Cloud Functions (calendarWebhook, renewWatch, oauthCallback), Costos y límites (Spark vs Blaze), docs/FIREBASE.md (guía de Firebase), Fase B: notificaciones push con la app cerrada, Fase C: webhook de Google Calendar al instante, Client secret en Secret Manager, Google Calendar (calendario «Office Tracker»)

### Community 21 - "Logo nuevo (SVG)"
Cohesion: 0.43
Nodes (7): Circuit traces with red-dot marked day cells, Faceted pink crystal sphere / network hub, Glass spiral-bound calendar body (dark red header, 4 metal rings, translucent grid), Nuevo logo: calendario de vidrio con circuitos y escudo (img/nuevo.svg), Recraft AI generated, auto-vectorized SVG (C2PA manifest, ~700 paths, 73 gradients, 428 KB), Red/pink glass palette on white (#7D0722, #F04C67, #FA618A, #DED8DA), Red shield with white check mark badge

### Community 22 - "Pruebas de robustez"
Cohesion: 0.29
Nodes (4): CID, SCOPE, app(), tok

### Community 23 - "Documentación del proyecto"
Cohesion: 0.40
Nodes (6): CLAUDE.md (guía para Claude Code), graphify-out (grafo de conocimiento), README.md (especificación en español), Reglas de negocio RN-01…RN-30, docs/FIREBASE.md fases A (tiempo real), B (push FCM), C (webhook Calendar), reglas.test.mjs (RN-01…RN-30)

### Community 24 - "Fase A de Firebase"
Cohesion: 0.40
Nodes (5): Fase A: Firestore tiempo real (implementada), Migración segura (espera respuesta del servidor), Reglas de seguridad Firestore (solo users/{uid}), Restricción de la API key por dominio, Gana el ts más reciente (Firestore fuente de verdad)

### Community 25 - "Entrada HTML y scripts"
Cohesion: 0.40
Nodes (5): index.html (estructura de la pantalla), Entrada de módulo js/app.js, Firebase compat SDK 10.14.1 (app, auth, firestore), Solo app.js ejecuta código al cargar (iniciar…()), Manifiesto PWA manifest.json

## Ambiguous Edges - Review These
- `Frosted Glass Day Grid with Highlighted Red Days` → `Red Shield with Checkmark Badge`  [AMBIGUOUS]
  img/logo-original.png · relation: conceptually_related_to
- `Glass spiral-bound calendar body (dark red header, 4 metal rings, translucent grid)` → `Red shield with white check mark badge`  [AMBIGUOUS]
  img/nuevo.svg · relation: conceptually_related_to

## Knowledge Gaps
- **80 isolated node(s):** `DRIVE`, `LOG_COLS`, `LOG_LAST`, `SHEETS`, `UI_TYPE` (+75 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 111 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Frosted Glass Day Grid with Highlighted Red Days` and `Red Shield with Checkmark Badge`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Glass spiral-bound calendar body (dark red header, 4 metal rings, translucent grid)` and `Red shield with white check mark badge`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `crearGoogle()` connect `Google falso (pruebas)` to `Cargador y regla v15`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `Entrada de módulo js/app.js` connect `Entrada HTML y scripts` to `Flujo de cambio y errores`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `index.html (estructura de la pantalla)` connect `Entrada HTML y scripts` to `Documentación del proyecto`, `OAuth y permisos de Google`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `render()` (e.g. with `deleteLog()` and `renderConexion()`) actually correct?**
  _`render()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `DRIVE`, `LOG_COLS`, `LOG_LAST` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._