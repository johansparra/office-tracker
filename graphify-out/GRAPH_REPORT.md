# Graph Report - office-tracker  (2026-11-16)

## Corpus Check
- 31 files · ~76,080 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 611 nodes · 1692 edges · 29 communities (26 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Estado y almacenamiento
- Cola de sync y API Google
- Firestore y tiempo real
- Avisos, enlaces y hoja
- Detección de cambios y Fase C
- Manejo de errores
- Marcar día y deshacer
- Ícono de la app
- Especificación README
- Google falso (pruebas)
- Reloj y escenarios
- Guía CLAUDE.md
- Estado global y render
- Auditoría obligatoria
- Cargador de pruebas
- Pruebas de robustez
- Publicación y plugins
- Marcado index.html
- Dependencias de pruebas
- Pruebas de estructura
- Paridad y versión
- Logo original
- Ejecutor de escenarios
- Firebase falso
- Pruebas de reglas
- Equivalencia con v15
- Hook pre-commit
- Service worker
- Arranque desde app.js

## God Nodes (most connected - your core abstractions)
1. `README.md: Office Tracker spec` - 58 edges
2. `render()` - 27 edges
3. `save()` - 27 edges
4. `S` - 21 edges
5. `syncAll()` - 20 edges
6. `reportar()` - 19 edges
7. `hasToken()` - 19 edges
8. `fromKey()` - 15 edges
9. `cargarApp()` - 14 edges
10. `syncSheet()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Change flow toggle -> applyChange -> schedulePush` --semantically_similar_to--> `RN-12 5-second undo window before pushing to Google`  [INFERRED] [semantically similar]
  CLAUDE.md → README.md
- `RN-05 Weeks straddling months count only in-month days` --references--> `calcularMes()`  [EXTRACTED]
  README.md → js/nucleo/meta.js
- `RN-26 Every change is logged with origin and device` --references--> `logChange()`  [EXTRACTED]
  README.md → js/funcionalidades/historial/registro.js
- `Política de errores: nunca tragar (reportar/seguro)` --references--> `reportar()`  [EXTRACTED]
  CLAUDE.md → js/adaptadores/errores.js
- `Never swallow errors (reportar/seguro)` --references--> `reportar()`  [EXTRACTED]
  CLAUDE.md → js/adaptadores/errores.js

## Import Cycles
- 3-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 3-file cycle: `js/funcionalidades/conexion/sesion.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/conexion/sesion.js`
- 3-file cycle: `js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js`
- 3-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 3-file cycle: `js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js`
- 3-file cycle: `js/funcionalidades/historial/registro.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js`
- 4-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 4-file cycle: `js/funcionalidades/conexion/sesion.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/conexion/sesion.js`
- 4-file cycle: `js/funcionalidades/conexion/sesion.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/conexion/sesion.js`
- 4-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 4-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 4-file cycle: `js/funcionalidades/historial/registro.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js`
- 5-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 5-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/funcionalidades/marcar-dia/marcar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 5-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 5-file cycle: `js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js`
- 5-file cycle: `js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js`
- 5-file cycle: `js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js`
- 5-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`

## Hyperedges (group relationships)
- **Sync conflict resolution rules** — readme_rn_20_calendario_unico, readme_rn_22_sin_firebase, readme_rn_23_con_firebase, readme_rn_24_union, readme_rn_25_duplicados, readme_rn_29_explained [EXTRACTED 1.00]
- **Firebase rollout phases A-C** — docs_firebase_fase_a, docs_firebase_fase_b, docs_firebase_fase_c [EXTRACTED 1.00]
- **Capas de la arquitectura hexagonal ligera** — readme_layer_nucleo, readme_layer_estado, readme_layer_adaptadores, readme_layer_funcionalidades, readme_layer_ui, readme_hexagonal_architecture [EXTRACTED 1.00]
- **Monthly quota rules** — readme_rn_01_meta_base, readme_rn_03_semana_ajustada, readme_rn_04_meta_ajustada, readme_rn_05_semanas_cruzadas, readme_rn_07_08_margen, readme_rn_10_dias_obligatorios [EXTRACTED 1.00]
- **Red de seguridad contra regresiones respecto a v15** — readme_equivalence_tests, readme_parity_tests, readme_referencia_v15, readme_como_v15, readme_test_environment [INFERRED 0.85]

## Communities (29 total, 3 thin omitted)

### Community 0 - "Estado y almacenamiento"
Cohesion: 0.08
Nodes (68): sheetUrl(), pendingCount(), now, S, hideModal(), showModal(), renderConexion(), openDaySheet() (+60 more)

### Community 1 - "Cola de sync y API Google"
Cohesion: 0.06
Nodes (70): Cola de sincronización enqueue() + gcal(), fbOn(), AuthError, gcal(), actualizarEvento(), borrarCalendario(), buscarPorNonce(), calPath() (+62 more)

### Community 2 - "Firestore y tiempo real"
Cohesion: 0.07
Nodes (59): rid(), base(), clean(), escribir(), escucharDias(), escucharLog(), escucharOcultos(), iniciarFirebase() (+51 more)

### Community 3 - "Avisos, enlaces y hoja"
Cohesion: 0.09
Nodes (45): Enlaces profundos de avisos (?d&r&n&a), Título de aviso cambia con días obligatorios (S.rem[k].t + PATCH), devInfo(), DRIVE, ensureFolder(), LOG_COLS, LOG_LAST, logRow() (+37 more)

### Community 4 - "Detección de cambios y Fase C"
Cohesion: 0.08
Nodes (34): Detección de cambios (checkChanges cada 10 s / 60 s), calendarWebhook / oauthCallback / renewWatch functions, Cloud Functions (calendarWebhook, renewWatch, oauthCallback), Costos y límites (Spark vs Blaze), docs/FIREBASE.md (guía de Firebase), Fase A: Firestore tiempo real (implementada), Fase B: notificaciones push con la app cerrada, Phase C: Google Calendar webhook (+26 more)

### Community 5 - "Manejo de errores"
Cohesion: 0.13
Nodes (29): Política de errores: nunca tragar (reportar/seguro), instalarCapturaGlobal(), recientes, reportar(), seguro(), entrarConGoogle(), fbListo(), salir() (+21 more)

### Community 6 - "Marcar día y deshacer"
Cohesion: 0.17
Nodes (25): Flujo de cambio de día (toggle → applyChange → schedulePush), online(), registrar(), logChange(), applyChange(), avisoConDeshacer(), confirmarPendiente(), doUndo() (+17 more)

### Community 7 - "Ícono de la app"
Cohesion: 0.10
Nodes (22): Office Tracker App Icon 192px, Glowing Circuit Core, Glass Calendar Motif, Dark Graphite Background, Red Brand Accent Palette, Shield Checkmark Badge, Office Tracker App Icon 512px, Brand Red on Graphite Palette (+14 more)

### Community 8 - "Especificación README"
Cohesion: 0.16
Nodes (21): METAS, README.md: Office Tracker spec, enqueue() single sync queue, Change detection (10s without Firebase, 60s with), Firebase Authentication + Firestore (optional), Firestore data model users/{uid}/days|log|hidden, Drive folder office-tracker, Google Sheet Office Tracker - Historial (+13 more)

### Community 9 - "Google falso (pruebas)"
Cohesion: 0.17
Nodes (10): clon(), crearGoogle(), g, hojaDe(), listar(), manejar(), rango(), rangoEvento() (+2 more)

### Community 10 - "Reloj y escenarios"
Cohesion: 0.19
Nodes (11): crearReloj(), prng(), conSesion(), escenarioAleatorio(), ESCENARIOS, eventoDia(), INICIO, ms() (+3 more)

### Community 11 - "Guía CLAUDE.md"
Cohesion: 0.15
Nodes (15): CLAUDE.md: guidance for Claude Code, Never swallow errors (reportar/seguro), Global state object S, Change flow toggle -> applyChange -> schedulePush, graphify-out (grafo de conocimiento), Do not change TYPE_LBL, Rendering via render() and innerHTML templates, TYPE_LBL (+7 more)

### Community 12 - "Estado global y render"
Cohesion: 0.16
Nodes (15): Estado global S, localStorage ot-data-v2 (esquema v:3), Política de movimiento (anim(), transform/opacity, reduced-motion), Render completo con template strings en innerHTML, Subir VERSION (sw.js) y APP_VER juntos al publicar, Reglas de negocio RN-01…RN-30, Arquitectura hexagonal ligera por funcionalidades, Capa adaptadores/ (Google, Firebase, errores) (+7 more)

### Community 13 - "Auditoría obligatoria"
Cohesion: 0.22
Nodes (11): APP, [cmd,arg], git(), huellaDisco(), huellaIndice(), leerJson(), lineas(), RAIZ (+3 more)

### Community 14 - "Cargador de pruebas"
Cohesion: 0.25
Nodes (12): AQUI, cargarApp(), crearGIS(), esperar(), IDS, REF, sinScripts(), tickReal() (+4 more)

### Community 15 - "Pruebas de robustez"
Cohesion: 0.19
Nodes (8): CID, SCOPE, app(), tok, app(), conSesion(), ms(), tok()

### Community 16 - "Publicación y plugins"
Cohesion: 0.20
Nodes (12): _config.yml: GitHub Pages config, Jekyll exclude pruebas-locales, Project plugins and skills (superpowers, ponytail, impeccable), Estrategia de caché del SW (network-first HTML/JS/CSS, cache-first íconos), Content-Security-Policy meta, Mandatory security audit before app commits, GitHub Pages hosting, .githooks/pre-commit audit gate (+4 more)

### Community 17 - "Marcado index.html"
Cohesion: 0.24
Nodes (10): index.html: app markup, Calendar grid and legend, Firebase compat SDK 10.14.1 scripts, Google Identity Services client script, Connect Google Calendar Client ID modal, Generic bottom sheet, Undo toast, Google Cloud OAuth Client ID (+2 more)

### Community 18 - "Dependencias de pruebas"
Cohesion: 0.20
Nodes (9): jsdom, description, devDependencies, jsdom, name, private, scripts, test (+1 more)

### Community 19 - "Pruebas de estructura"
Cohesion: 0.25
Nodes (5): RAIZ, fuente(), importsDe(), JS, todos

### Community 20 - "Paridad y versión"
Cohesion: 0.28
Nodes (5): APP_VER, igual(), plano(), r, tipoAzar()

### Community 21 - "Logo original"
Cohesion: 0.36
Nodes (8): Office Tracker Original Logo (glass calendar with circuits and shield), Circuit Lines Connecting Marked Days, Frosted Glass Day Grid with Highlighted Red Days, Glowing Red Geodesic Sphere (sync hub), PWA Icons Derived from Logo, Red Brand Palette (Scotia red), Red Shield with Checkmark Badge, Spiral-Bound Calendar with Dark Red Header

### Community 22 - "Ejecutor de escenarios"
Cohesion: 0.39
Nodes (6): correr(), corto(), normalizar(), OPCIONES, primeraDiferencia(), ALEATORIOS

### Community 23 - "Firebase falso"
Cohesion: 0.39
Nodes (6): clon(), crearFirebase(), coleccion(), consulta(), doc(), escribir()

### Community 24 - "Pruebas de reglas"
Cohesion: 0.36
Nodes (4): app(), conSesion(), ms(), tok()

### Community 25 - "Equivalencia con v15"
Cohesion: 0.47
Nodes (6): como-v15.mjs intentional-change reverts, Pruebas de equivalencia contra v15, paridad.test.mjs (núcleo vs v15), Equivalence tests against frozen v15, Copia congelada tests/referencia-v15, Entorno de pruebas jsdom con reloj y servicios falsos

## Ambiguous Edges - Review These
- `Frosted Glass Day Grid with Highlighted Red Days` → `Red Shield with Checkmark Badge`  [AMBIGUOUS]
  img/logo-original.png · relation: conceptually_related_to

## Knowledge Gaps
- **83 isolated node(s):** `recientes`, `chain`, `FULL_MS`, `WATCH_FB_MS`, `WATCH_MS` (+78 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 117 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Frosted Glass Day Grid with Highlighted Red Days` and `Red Shield with Checkmark Badge`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `README.md: Office Tracker spec` connect `Especificación README` to `Estado y almacenamiento`, `Cola de sync y API Google`, `Avisos, enlaces y hoja`, `Detección de cambios y Fase C`, `Marcar día y deshacer`, `Guía CLAUDE.md`, `Estado global y render`, `Publicación y plugins`, `Marcado index.html`, `Equivalencia con v15`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Why does `crearGoogle()` connect `Google falso (pruebas)` to `Cargador de pruebas`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `index.html: app markup` connect `Marcado index.html` to `Publicación y plugins`, `Especificación README`, `Manejo de errores`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `render()` (e.g. with `renderConexion()` and `renderHistorial()`) actually correct?**
  _`render()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `recientes`, `chain`, `FULL_MS` to the rest of the system?**
  _83 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Estado y almacenamiento` be split into smaller, more focused modules?**
  _Cohesion score 0.07798855766335441 - nodes in this community are weakly interconnected._