# Graph Report - office-tracker  (2026-10-04)

## Corpus Check
- Corpus is ~16,937 words - fits in a single context window. You may not need a graph.

## Summary
- 247 nodes · 356 edges · 19 communities (17 shown, 1 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.88)
- Token cost: 106,480 input · 0 output

## Community Hubs (Navigation)
- Firebase y documentación de sync
- Conexión Google y avisos UI
- Arquitectura y pantalla
- Firestore tiempo real
- Hoja de historial (Sheets)
- Configuración y estado S
- Manifiesto PWA e ícono
- Google Calendar API
- Cambios, deshacer y navegación
- Utilidades de fechas
- Servicios Google y avisos
- Almacenamiento local
- Animaciones y hojas
- Auditoría append-only
- Festivos de Colombia
- Historial de un día
- Ícono 192px
- Cálculo de la meta

## God Nodes (most connected - your core abstractions)
1. `render()` - 11 edges
2. `syncRemindersForDate()` - 9 edges
3. `gcal()` - 8 edges
4. `Fase A: Firestore tiempo real con la app abierta (implementada)` - 8 edges
5. `fbErr()` - 7 edges
6. `fbStart()` - 7 edges
7. `delEvent()` - 7 edges
8. `pushDay()` - 7 edges
9. `fbBase()` - 6 edges
10. `fsDay()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Convenciones para agregar lógica` --semantically_similar_to--> `Orden de carga de scripts clásicos con globals compartidos`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Subir VERSION (sw.js) y APP_VER (config.js) juntos` --semantically_similar_to--> `Publicar actualizaciones`  [INFERRED] [semantically similar]
  CLAUDE.md → README.md
- `Lógica de meta mensual (8 − semanas ajustadas)` --semantically_similar_to--> `RN-01..RN-06 Meta mensual`  [INFERRED] [semantically similar]
  CLAUDE.md → README.md
- `Flujo de cambio toggle → applyChange → schedulePush` --semantically_similar_to--> `RN-11..RN-13 Marcar días (ciclo de toques, deshacer 5 s, solo local)`  [INFERRED] [semantically similar]
  CLAUDE.md → README.md
- `Sincronización con Google Calendar (OAuth GIS, calendario único)` --semantically_similar_to--> `Permisos mínimos (calendar.app.created, calendarlist.readonly, drive.file)`  [INFERRED] [semantically similar]
  CLAUDE.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Sincronización completa (calendario, historial, avisos, Firestore)** — claude_sync_queue, claude_calendar_sync, claude_history_spreadsheet, claude_reminders, claude_firebase_realtime, claude_change_detection [EXTRACTED 1.00]
- **Reglas de negocio RN-01..RN-30** — readme_rn_monthly_quota, readme_rn_slack_must, readme_rn_marking, readme_rn_holidays, readme_rn_reminders, readme_rn_sync_conflicts, readme_rn_audit [EXTRACTED 1.00]
- **Fases de Firebase A, B y C** — docs_firebase_phase_a, docs_firebase_phase_b, docs_firebase_phase_c, docs_firebase_cloud_functions [EXTRACTED 1.00]

## Communities (19 total, 1 thin omitted)

### Community 0 - "Firebase y documentación de sync"
Cohesion: 0.09
Nodes (29): Detección de cambios (checkChanges 10 s / 60 s), Firebase tiempo real (Firestore fuente de verdad), Lógica de meta mensual (8 − semanas ajustadas), Subir VERSION (sw.js) y APP_VER (config.js) juntos, Restricción de la API key (dominios + authDomain), Cloud Functions (oauthCallback, calendarWebhook, renewWatch), Costos y límites (Spark/Blaze), Menos consultas con tiempo real (v14) (+21 more)

### Community 1 - "Conexión Google y avisos UI"
Cohesion: 0.14
Nodes (17): openNotifSheet(), verifyNonce(), fbSignOut(), connect(), disconnect(), gisReady(), initGIS(), resetConnection() (+9 more)

### Community 2 - "Arquitectura y pantalla"
Cohesion: 0.10
Nodes (22): Flujo de cambio toggle → applyChange → schedulePush, CLAUDE.md (guía para Claude Code), Estado global S, Renderizado completo desde S con innerHTML, Orden de carga de scripts clásicos con globals compartidos, Cola de sincronización enqueue() y gcal(), Invariante: no cambiar TYPE_LBL, Calendario (#day-hdrs, #weeks, leyenda) (+14 more)

### Community 3 - "Firestore tiempo real"
Cohesion: 0.23
Nodes (20): clean(), FB_CONFIG, fbBase(), fbErr(), fbFirst, fbInit(), fbOn(), fbSignIn() (+12 more)

### Community 4 - "Hoja de historial (Sheets)"
Cohesion: 0.17
Nodes (16): deleteLog(), devInfo(), ensureFolder(), ensureSheet(), fmtFull(), isoTs(), isoWeek(), LOG_COLS (+8 more)

### Community 5 - "Configuración y estado S"
Cohesion: 0.11
Nodes (13): DAYS, DOW, DOW_L, IC, MONTHS, now, S, SCOPE (+5 more)

### Community 6 - "Manifiesto PWA e ícono"
Cohesion: 0.12
Nodes (15): PWA App Icon 512x512, Brand Palette (Crimson, Gold, Dark Navy), Office Building Symbol, background_color, description, display, icons, id (+7 more)

### Community 7 - "Google Calendar API"
Cohesion: 0.33
Nodes (16): AuthError, calPath(), classify(), dayBody(), delEvent(), desiredSlots(), ensureCalendar(), gcal() (+8 more)

### Community 8 - "Cambios, deshacer y navegación"
Cohesion: 0.22
Nodes (10): _link, showModal(), applyChange(), doUndo(), flushPushes(), hideUndo(), schedulePush(), showUndo() (+2 more)

### Community 9 - "Utilidades de fechas"
Cohesion: 0.20
Nodes (8): addD(), fmtDay(), fmtDayLong(), fmtTs(), fromKey(), nextMon(), p2(), toKey()

### Community 10 - "Servicios Google y avisos"
Cohesion: 0.18
Nodes (11): Sincronización con Google Calendar (OAuth GIS, calendario único), Deep links ?d=&r=&n= con nonce, Avisos en Calendar (10:00 y 16:30, HORIZON 21 días), #modal Conectar Google Calendar (Client ID), Google Identity Services client script, #sheet hoja genérica (aviso / historial del día), Google Calendar «Office Tracker», Google Cloud Console (Client ID OAuth, APIs) (+3 more)

### Community 11 - "Almacenamiento local"
Cohesion: 0.32
Nodes (3): clearToken(), hasToken(), online()

### Community 12 - "Animaciones y hojas"
Cohesion: 0.36
Nodes (5): afterRender(), anim(), popDay(), RM, slideMonth()

### Community 13 - "Auditoría append-only"
Cohesion: 0.40
Nodes (6): Hoja de historial append-only, Cómo volver atrás (v12 sin Firebase), Carpeta Drive office-tracker, Hoja «Office Tracker · Historial», RN-26..RN-30 Historial y auditoría, Columnas del log (LOG_COLS, JSON en última columna)

### Community 14 - "Festivos de Colombia"
Cohesion: 0.60
Nodes (4): easter(), getHol(), _HC, holidays()

### Community 16 - "Historial de un día"
Cohesion: 0.83
Nodes (3): closeSheet(), openDaySheet(), openSheet()

### Community 17 - "Ícono 192px"
Cohesion: 1.00
Nodes (3): icon-192.png (PWA App Icon 192px), Office Building Glyph (crimson building, gold windows, dark navy background), PWA App Icon

## Knowledge Gaps
- **60 isolated node(s):** `_link`, `timers`, `SCOPES`, `SCOPE`, `SLOTS` (+55 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 87 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `render()` connect `Conexión Google y avisos UI` to `Cambios, deshacer y navegación`, `Firestore tiempo real`, `Hoja de historial (Sheets)`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `deleteLog()` connect `Hoja de historial (Sheets)` to `Conexión Google y avisos UI`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `Sincronización con Google Calendar (OAuth GIS, calendario único)` connect `Servicios Google y avisos` to `Arquitectura y pantalla`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `render()` (e.g. with `openNotifSheet()` and `schedulePush()`) actually correct?**
  _`render()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `fbErr()` (e.g. with `fbStart()` and `fsDay()`) actually correct?**
  _`fbErr()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `_link`, `timers`, `SCOPES` to the rest of the system?**
  _60 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Firebase y documentación de sync` be split into smaller, more focused modules?**
  _Cohesion score 0.09113300492610837 - nodes in this community are weakly interconnected._