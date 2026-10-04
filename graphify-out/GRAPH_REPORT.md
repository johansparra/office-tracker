# Graph Report - office-tracker  (2026-10-04)

## Corpus Check
- 6 files · ~14,439 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 135 nodes · 192 edges · 16 communities (10 shown, 2 thin omitted)
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.9)
- Token cost: 145,887 input · 0 output

## Community Hubs (Navigation)
- Conceptos de arquitectura
- APIs de Google y hoja del log
- Manifest e ícono PWA
- Estado y Firebase en vivo
- Meta, festivos y avisos
- Reconciliación con Calendar
- Guía del desarrollador
- Cola de sync y Deshacer
- Login Google (GIS)
- Ícono 192
- Animaciones
- Render completo

## God Nodes (most connected - your core abstractions)
1. `gcal()` - 14 edges
2. `syncAll()` - 11 edges
3. `reconcileMonth()` - 10 edges
4. `reconcileMonthFS()` - 10 edges
5. `pushDay()` - 10 edges
6. `save()` - 10 edges
7. `syncSheet()` - 9 edges
8. `applyChange()` - 7 edges
9. `Phase A: Firestore Instant Sync (implemented v13)` - 7 edges
10. `enqueue()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Phase B: Push Notifications with App Closed (FCM + Cloud Functions)` --semantically_similar_to--> `Reminder Events (10:00 and 16:30, 21-day horizon)`  [INFERRED] [semantically similar]
  docs/FIREBASE.md → CLAUDE.md
- `Phase C: Calendar Webhook (calendarWebhook, renewWatch, oauthCallback)` --semantically_similar_to--> `Change Detection Polling (checkChanges every 10s, calCursor)`  [INFERRED] [semantically similar]
  docs/FIREBASE.md → CLAUDE.md
- `README (user-facing spec, Spanish)` --references--> `Bump VERSION (sw.js) and APP_VER (index.html) together`  [INFERRED]
  README.md → CLAUDE.md
- `README (user-facing spec, Spanish)` --references--> `Colombian Holidays Computation (holidays(y), Ley Emiliani, Easter)`  [INFERRED]
  README.md → CLAUDE.md
- `Sync and Version Indicators (topbar, chip, step label)` --conceptually_related_to--> `Google Calendar Two-way Sync (syncAll/reconcileMonth)`  [INFERRED]
  README.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Full sync pipeline (syncAll stages)** — index_syncall, index_ensurecalendar, index_pullsheet, index_reconcilemonth, index_reconcilemonthfs, index_reconcilereminders, index_syncsheet, index_pushhidden [EXTRACTED 1.00]
- **Firestore realtime sync layer** — index_fbinit, index_fbstart, index_onfsdays, index_onfslog, index_onfshidden, index_fsday, index_fslog, index_fshide [EXTRACTED 1.00]
- **Local day change with undo and deferred push** — index_toggle, index_applychange, index_schedulepush, index_showundo, index_doundo, index_pushday [INFERRED 0.85]
- **Multi-layer Sync: Calendar, Sheet, Firestore** — claude_calendar_sync, claude_history_spreadsheet, claude_firebase_realtime, claude_change_detection_polling [INFERRED 0.85]
- **Firebase Rollout Phases A/B/C** — docs_firebase_phase_a_firestore, docs_firebase_phase_b_push, docs_firebase_phase_c_calendar_webhook [EXTRACTED 1.00]
- **Monthly Goal Tracking and Mandatory-day Alerts** — claude_quota_logic, claude_colombian_holidays, claude_must_days, readme_goal_alert_levels, claude_reminders [INFERRED 0.85]

## Communities (16 total, 2 thin omitted)

### Community 0 - "Conceptos de arquitectura"
Cohesion: 0.08
Nodes (31): Audit Log (S.log with source, change id, device id), Google Calendar Two-way Sync (syncAll/reconcileMonth), Change Detection Polling (checkChanges every 10s, calCursor), Change Flow with 5s Undo Window (applyChange/schedulePush), Deep Links with Nonce Verification (verifyNonce), Firebase Real-time Mode (Firestore source of truth), History Spreadsheet 'Office Tracker · Historial' (syncSheet/pullSheet), Mandatory Days (stats open/slack/must) (+23 more)

### Community 1 - "APIs de Google y hoja del log"
Cohesion: 0.20
Nodes (16): AuthError, Lightweight change polling, checkChanges(), deleteLog(), ensureCalendar(), ensureFolder(), ensureSheet(), fsHide() (+8 more)

### Community 2 - "Manifest e ícono PWA"
Cohesion: 0.12
Nodes (15): PWA App Icon 512x512, Brand Palette (Crimson, Gold, Dark Navy), Office Building Symbol, background_color, description, display, icons, id (+7 more)

### Community 3 - "Estado y Firebase en vivo"
Cohesion: 0.20
Nodes (12): App state object S (data, evIds, pending, log, hidden), applyChange(), disconnect(), fbStart(), First-server-snapshot migration, fsDay(), onFsDays(), onFsHidden() (+4 more)

### Community 4 - "Meta, festivos y avisos"
Cohesion: 0.13
Nodes (12): Colombian holiday calendar (Emiliani law, Easter-based), desiredSlots(), getHol(), holidays(), Monthly office attendance goal / mandatory days, Reminder deep link with nonce verification, reminderBody(), reminderTitle() (+4 more)

### Community 5 - "Reconciliación con Calendar"
Cohesion: 0.29
Nodes (11): classify(), delEvent(), explained(), Firestore as source of truth (realtime mode), fsLog(), listEvents(), logChange(), Pending-wins month reconciliation (+3 more)

### Community 6 - "Guía del desarrollador"
Cohesion: 0.33
Nodes (7): CLAUDE.md (developer guide), Colombian Holidays Computation (holidays(y), Ley Emiliani, Easter), Global State Object S, Bump VERSION (sw.js) and APP_VER (index.html) together, GitHub Pages Deployment and Android Install, README (user-facing spec, Spanish), v2 Legacy Event Cleanup

### Community 7 - "Cola de sync y Deshacer"
Cohesion: 0.38
Nodes (6): enqueue(), flushPushes(), pushDay(), schedulePush(), Serial Calendar job queue, Undo window before push

### Community 8 - "Login Google (GIS)"
Cohesion: 0.50
Nodes (3): cleanupLegacy(), connect(), whenGIS()

### Community 9 - "Ícono 192"
Cohesion: 1.00
Nodes (3): icon-192.png (PWA App Icon 192px), Office Building Glyph (crimson building, gold windows, dark navy background), PWA App Icon

## Knowledge Gaps
- **25 isolated node(s):** `Brand Palette (Crimson, Gold, Dark Navy)`, `Office Building Symbol`, `id`, `scope`, `name` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 53 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pushDay()` connect `Cola de sync y Deshacer` to `APIs de Google y hoja del log`, `Estado y Firebase en vivo`, `Meta, festivos y avisos`, `Reconciliación con Calendar`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `save()` connect `Estado y Firebase en vivo` to `Login Google (GIS)`, `APIs de Google y hoja del log`, `Reconciliación con Calendar`, `Cola de sync y Deshacer`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `syncRemindersForDate()` connect `Meta, festivos y avisos` to `Cola de sync y Deshacer`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **What connects `Brand Palette (Crimson, Gold, Dark Navy)`, `Office Building Symbol`, `id` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Conceptos de arquitectura` be split into smaller, more focused modules?**
  _Cohesion score 0.08387096774193549 - nodes in this community are weakly interconnected._
- **Should `Manifest e ícono PWA` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Meta, festivos y avisos` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._