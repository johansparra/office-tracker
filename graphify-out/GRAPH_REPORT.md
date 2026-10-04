# Graph Report - office-tracker  (2026-10-03)

## Corpus Check
- Corpus is ~5,060 words - fits in a single context window. You may not need a graph.

## Summary
- 97 nodes · 179 edges · 9 communities
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.92)
- Token cost: 157,286 input · 0 output

## Community Hubs (Navigation)
- Reminders & Deep Links
- PWA Manifest & Branding
- Change Flow & Undo
- Holidays & Quota Math
- UI Rendering & Auth
- State & Calendar Setup
- Two-Way Calendar Sync
- Deployment & Install
- 192px App Icon

## God Nodes (most connected - your core abstractions)
1. `render()` - 17 edges
2. `S (global state object)` - 10 edges
3. `save()` - 10 edges
4. `gcal()` - 10 edges
5. `pushDay()` - 10 edges
6. `reconcileMonth()` - 10 edges
7. `syncRemindersForDate()` - 9 edges
8. `syncAll()` - 9 edges
9. `applyChange()` - 9 edges
10. `stats()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Sync conflict rule (phone wins if pending, else Calendar)` --semantically_similar_to--> `Two-way Google Calendar sync`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Logica de la meta` --semantically_similar_to--> `Monthly quota logic (8 - adjusted weeks)`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Deshacer y auditoria` --semantically_similar_to--> `Change flow with 5s undo window`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Avisos 10:00 a.m. y 4:30 p.m.` --semantically_similar_to--> `Reminder events (10:00 / 16:30, 21-day horizon)`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Deshacer y auditoria` --semantically_similar_to--> `Audit log (source, timestamp, change id, device id)`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Calendar sync pipeline (serialized via enqueue)** — index_syncall, index_enqueue, index_ensurecalendar, index_reconcilemonth, index_reconcilereminders, index_pushday, index_gcal [EXTRACTED 1.00]
- **Local change and undo flow** — index_toggle, index_applychange, index_schedulepush, index_showundo, index_doundo, index_flushpushes [EXTRACTED 1.00]
- **Reminder notification deep-link flow** — index_reminderbody, index_readdeeplink, index_opennotifsheet, index_verifynonce, index_syncremindersfordate [INFERRED 0.95]

## Communities (9 total, 0 thin omitted)

### Community 0 - "Reminders & Deep Links"
Cohesion: 0.18
Nodes (17): Notification deep links with nonce verification, Reminder events (10:00 / 16:30, 21-day horizon), AuthError, clearToken(), delEvent(), desiredSlots(), gcal(), hasToken() (+9 more)

### Community 1 - "PWA Manifest & Branding"
Cohesion: 0.12
Nodes (15): PWA App Icon 512x512, Brand Palette (Crimson, Gold, Dark Navy), Office Building Symbol, background_color, description, display, icons, id (+7 more)

### Community 2 - "Change Flow & Undo"
Cohesion: 0.20
Nodes (15): Audit log (source, timestamp, change id, device id), Change flow with 5s undo window, applyChange(), dayBody(), doUndo(), flushPushes(), fromKey(), hideUndo() (+7 more)

### Community 3 - "Holidays & Quota Math"
Cohesion: 0.27
Nodes (10): Monthly quota logic (8 - adjusted weeks), easter(), getHol(), holidays(), stats(), toKey(), Festivos Colombia (automatic holidays), Ley Emiliani (holidays moved to Monday) (+2 more)

### Community 4 - "UI Rendering & Auth"
Cohesion: 0.27
Nodes (10): connect(), goMonth(), initGIS(), openDaySheet(), openNotifSheet(), openSheet(), render(), showModal() (+2 more)

### Community 5 - "State & Calendar Setup"
Cohesion: 0.29
Nodes (10): OAuth scope calendar.app.created, Global state object S (localStorage ot-data-v2, schema v3), cleanupLegacy(), ensureCalendar(), load(), S (global state object), save(), whenGIS() (+2 more)

### Community 6 - "Two-Way Calendar Sync"
Cohesion: 0.48
Nodes (7): Two-way Google Calendar sync, Serialized Calendar API queue (enqueue), classify(), enqueue(), reconcileMonth(), syncAll(), Sync conflict rule (phone wins if pending, else Calendar)

### Community 7 - "Deployment & Install"
Cohesion: 0.40
Nodes (5): Office Tracker PWA, Service worker VERSION bump on publish, Android install via Chrome Add to home screen, GitHub Pages deployment, ScotiaTech

### Community 8 - "192px App Icon"
Cohesion: 1.00
Nodes (3): icon-192.png (PWA App Icon 192px), Office Building Glyph (crimson building, gold windows, dark navy background), PWA App Icon

## Knowledge Gaps
- **20 isolated node(s):** `id`, `scope`, `name`, `short_name`, `description` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 24 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `render()` connect `UI Rendering & Auth` to `Reminders & Deep Links`, `Change Flow & Undo`, `Holidays & Quota Math`, `State & Calendar Setup`, `Two-Way Calendar Sync`, `Deployment & Install`?**
  _High betweenness centrality (0.251) - this node is a cross-community bridge._
- **Why does `stats()` connect `Holidays & Quota Math` to `UI Rendering & Auth`, `State & Calendar Setup`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `S (global state object)` connect `State & Calendar Setup` to `Reminders & Deep Links`, `Change Flow & Undo`, `Holidays & Quota Math`, `UI Rendering & Auth`, `Two-Way Calendar Sync`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `S (global state object)` (e.g. with `applyChange()` and `ensureCalendar()`) actually correct?**
  _`S (global state object)` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `id`, `scope`, `name` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `PWA Manifest & Branding` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._