# Graph Report - office-tracker  (2026-10-04)

## Corpus Check
- 52 files · ~29,249 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 444 nodes · 1449 edges · 19 communities
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.86)
- Token cost: 107,629 input · 0 output

## Community Hubs (Navigation)
- Constantes, fechas y formato
- Cola de sync e historial
- Sesión, guardado y errores
- Documentación y arquitectura
- Calendar y conflictos
- Tiempo real Firestore
- Google falso (pruebas)
- Manifiesto PWA e ícono
- Pruebas de reglas y robustez
- Cargador del navegador simulado
- Escenarios de equivalencia
- Dependencias de pruebas
- Pruebas de arquitectura
- Comparador entre versiones
- Firebase falso (pruebas)
- Pruebas de paridad
- Marcar y deshacer (docs)
- Publicar versiones
- Ícono 192px

## God Nodes (most connected - your core abstractions)
1. `render()` - 36 edges
2. `save()` - 30 edges
3. `reportar()` - 26 edges
4. `fromKey()` - 24 edges
5. `gcal()` - 23 edges
6. `S` - 21 edges
7. `syncAll()` - 20 edges
8. `hasToken()` - 19 edges
9. `toKey()` - 19 edges
10. `renderConexion()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Regla: subir VERSION (sw.js) y APP_VER juntos` --semantically_similar_to--> `Publicar actualizaciones (VERSION, APP_VER, lista JS de sw.js)`  [INFERRED] [semantically similar]
  CLAUDE.md → README.md
- `Fase C: webhook de Google Calendar al instante` --semantically_similar_to--> `Detección de cambios checkChanges() (10 s / 60 s)`  [INFERRED] [semantically similar]
  docs/FIREBASE.md → CLAUDE.md
- `Entrada js/app.js (módulo ES)` --implements--> `Arquitectura hexagonal ligera por funcionalidades`  [INFERRED]
  index.html → README.md
- `Modal Conectar Google Calendar (#modal)` --conceptually_related_to--> `Google Calendar (calendario Office Tracker)`  [INFERRED]
  index.html → README.md
- `Fase A: Firestore tiempo real (implementada)` --references--> `Scripts Firebase compat 10.14.1 + GIS`  [INFERRED]
  docs/FIREBASE.md → index.html

## Import Cycles
- 3-file cycle: `js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js`
- 3-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 3-file cycle: `js/funcionalidades/conexion/sesion.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/conexion/sesion.js`
- 3-file cycle: `js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js`
- 4-file cycle: `js/funcionalidades/conexion/sesion.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/conexion/sesion.js`
- 4-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 4-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 4-file cycle: `js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/historial/registro.js`
- 4-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 4-file cycle: `js/funcionalidades/conexion/sesion.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/conexion/sesion.js`
- 5-file cycle: `js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js`
- 5-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 5-file cycle: `js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/historial/registro.js`
- 5-file cycle: `js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/sincronizacion/tiempo-real.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js`
- 5-file cycle: `js/funcionalidades/historial/historial-dia.js -> js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/historial/historial-dia.js`
- 5-file cycle: `js/funcionalidades/historial/registro.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/historial/registro.js`
- 5-file cycle: `js/funcionalidades/conexion/tarjeta.js -> js/funcionalidades/sincronizacion/sincronizar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/conexion/tarjeta.js`
- 5-file cycle: `js/funcionalidades/historial/registro.js -> js/ui/render.js -> js/funcionalidades/mes/vista.js -> js/funcionalidades/marcar-dia/marcar.js -> js/funcionalidades/sincronizacion/reconciliar.js -> js/funcionalidades/historial/registro.js`

## Hyperedges (group relationships)
- **Capas de la arquitectura hexagonal ligera** — readme_capa_nucleo, readme_capa_estado, readme_capa_adaptadores, readme_capa_funcionalidades, readme_capa_ui [EXTRACTED 1.00]
- **Fases de adopción de Firebase (A, B, C)** — docs_firebase_fase_a, docs_firebase_fase_b, docs_firebase_fase_c [EXTRACTED 1.00]
- **Destinos de sincronización (Calendar, Sheets, Firestore)** — readme_google_calendar, readme_hoja_historial, readme_firestore_modelo_datos, readme_sync_completa [INFERRED 0.85]

## Communities (19 total, 0 thin omitted)

### Community 0 - "Constantes, fechas y formato"
Cohesion: 0.09
Nodes (64): devInfo(), DRIVE, LOG_COLS, LOG_LAST, logRow(), SHEETS, sheetUrl(), UI_TYPE (+56 more)

### Community 1 - "Cola de sync e historial"
Cohesion: 0.11
Nodes (54): agregarHistorial(), agregarOcultos(), ensureSheet(), fechaModificacion(), hojaPerdida(), leerNuevas(), parseRow(), setupSheet() (+46 more)

### Community 2 - "Sesión, guardado y errores"
Cohesion: 0.11
Nodes (45): instalarCapturaGlobal(), recientes, reportar(), seguro(), entrarConGoogle(), fbListo(), salir(), usuario() (+37 more)

### Community 3 - "Documentación y arquitectura"
Cohesion: 0.06
Nodes (49): Detección de cambios checkChanges() (10 s / 60 s), CLAUDE.md (guía para Claude Code), Estado global S, Sección MOVIMIENTO (anim, prefers-reduced-motion), Render completo vía innerHTML (sin framework), Cola de sincronización enqueue() + gcal(), Invariante: no cambiar TYPE_LBL (classify lo parsea), Cloud Functions (calendarWebhook, renewWatch, oauthCallback) (+41 more)

### Community 4 - "Calendar y conflictos"
Cohesion: 0.14
Nodes (37): rid(), AuthError, gcal(), actualizarEvento(), borrarCalendario(), buscarPorNonce(), calPath(), cambiosDesde() (+29 more)

### Community 5 - "Tiempo real Firestore"
Cohesion: 0.17
Nodes (29): base(), clean(), escribir(), escucharDias(), escucharLog(), escucharOcultos(), FB_CONFIG, fbOn() (+21 more)

### Community 6 - "Google falso (pruebas)"
Cohesion: 0.17
Nodes (10): clon(), crearGoogle(), g, hojaDe(), listar(), manejar(), rango(), rangoEvento() (+2 more)

### Community 7 - "Manifiesto PWA e ícono"
Cohesion: 0.12
Nodes (15): PWA App Icon 512x512, Brand Palette (Crimson, Gold, Dark Navy), Office Building Symbol, background_color, description, display, icons, id (+7 more)

### Community 8 - "Pruebas de reglas y robustez"
Cohesion: 0.17
Nodes (8): CID, SCOPE, app(), conSesion(), ms(), tok(), app(), tok

### Community 9 - "Cargador del navegador simulado"
Cohesion: 0.27
Nodes (9): AQUI, cargarApp(), crearGIS(), esperar(), IDS, REF, sinScripts(), tickReal() (+1 more)

### Community 10 - "Escenarios de equivalencia"
Cohesion: 0.27
Nodes (9): prng(), conSesion(), escenarioAleatorio(), eventoDia(), INICIO, ms(), reg(), sig() (+1 more)

### Community 11 - "Dependencias de pruebas"
Cohesion: 0.20
Nodes (9): jsdom, description, devDependencies, jsdom, name, private, scripts, test (+1 more)

### Community 12 - "Pruebas de arquitectura"
Cohesion: 0.25
Nodes (5): RAIZ, fuente(), importsDe(), JS, todos

### Community 13 - "Comparador entre versiones"
Cohesion: 0.33
Nodes (7): correr(), corto(), normalizar(), OPCIONES, primeraDiferencia(), ALEATORIOS, ESCENARIOS

### Community 14 - "Firebase falso (pruebas)"
Cohesion: 0.39
Nodes (6): clon(), crearFirebase(), coleccion(), consulta(), doc(), escribir()

### Community 15 - "Pruebas de paridad"
Cohesion: 0.32
Nodes (4): igual(), plano(), r, tipoAzar()

### Community 16 - "Marcar y deshacer (docs)"
Cohesion: 0.67
Nodes (4): Flujo de cambio toggle → applyChange → schedulePush, Toast Deshacer (#toast), Ciclo de marcado de días (RN-11), Ventana de deshacer de 5 s (RN-12)

### Community 17 - "Publicar versiones"
Cohesion: 0.67
Nodes (3): Regla: subir VERSION (sw.js) y APP_VER juntos, GitHub Pages (hosting estático HTTPS), Publicar actualizaciones (VERSION, APP_VER, lista JS de sw.js)

### Community 18 - "Ícono 192px"
Cohesion: 1.00
Nodes (3): icon-192.png (PWA App Icon 192px), Office Building Glyph (crimson building, gold windows, dark navy background), PWA App Icon

## Knowledge Gaps
- **56 isolated node(s):** `background_color`, `description`, `display`, `icons`, `id` (+51 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 81 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cargarApp()` connect `Cargador del navegador simulado` to `Google falso (pruebas)`, `Pruebas de reglas y robustez`, `Escenarios de equivalencia`, `Comparador entre versiones`, `Firebase falso (pruebas)`, `Pruebas de paridad`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `crearGoogle()` connect `Google falso (pruebas)` to `Cargador del navegador simulado`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `render()` (e.g. with `openNotifSheet()` and `deleteLog()`) actually correct?**
  _`render()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `background_color`, `description`, `display` to the rest of the system?**
  _56 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Constantes, fechas y formato` be split into smaller, more focused modules?**
  _Cohesion score 0.08851674641148326 - nodes in this community are weakly interconnected._
- **Should `Cola de sync e historial` be split into smaller, more focused modules?**
  _Cohesion score 0.10576414595452142 - nodes in this community are weakly interconnected._
- **Should `Sesión, guardado y errores` be split into smaller, more focused modules?**
  _Cohesion score 0.10558069381598793 - nodes in this community are weakly interconnected._