# thought-stick — Comprehensive Engineering Notes
**Date:** 2026-03-14  
**Purpose:** Supreme product + engineering context dump. Read this before touching any code.

---

## 1. PRODUCT IDENTITY & PIVOT

**thought-stick** is pivoting from a **sticker-based note-throwing app** to a **living memory board with polaroid entries**.

### What it WAS (V1-sticker, currently in code):
- Animated SVG sticker characters (ghost, kitty, bunny, etc.) thrown onto a board
- Single text field per entry
- "Ideas" framing ("new idea", "ideas stuck")

### What it MUST BECOME (V1-polaroid, per PRD):
- Polaroid-style cards with: photo area, title (Caveat), commentary (Nunito)
- Image upload (gallery + camera)
- "Memories" framing ("capture moments", "your future self")
- No stickers in V1-final (stickers are V0 legacy)

### The anti-pitch (PRD §1):
Not Canva. Not Unfold. Not a design tool. Not a social media scheduler. Not a productivity app. The messiness of throw placement IS the feature.

---

## 2. ARCHITECTURE (as-built)

```
React (CRA + CRACO) ──→ Supabase (Auth + PostgreSQL + Storage)
         │
         ├── No backend server (Python/FastAPI deleted in CP3)
         ├── Frontend uses anon key + RLS
         └── Only planned server-side code: Edge Function for account deletion
```

### Tech stack:
| Layer | Tech | Notes |
|---|---|---|
| Framework | React 19 + CRA + CRACO | `@` alias via craco + jsconfig |
| Styling | Tailwind CSS 3.4 + App.css (vanilla) | Most styles are in App.css, Tailwind barely used |
| Animation | Framer Motion 12 | Drag, throw, expand, spring physics |
| UI library | shadcn/ui (Radix primitives) | ~40 UI components installed, ALMOST NONE USED |
| Database | Supabase PostgreSQL | `boards` + `entries` tables |
| Auth | Supabase anonymous auth | `signInAnonymously()` → session persists |
| Storage | Supabase Storage | `entry-images` bucket (private), NOT YET USED by UI |
| Voice | Web Speech API (browser-native) | No backend dependency |
| Icons | Lucide React | Plus, ZoomIn, ZoomOut, Mic, etc. |
| Toasts | sonner | Used directly, NOT shadcn toast |
| Fonts | Caveat (headwriting) + Nunito (UI) | Loaded in App.css. Google Fonts preconnect in index.html. Inter removed in CP4.5. |

### Build system:
- `npm start` → `craco start` (not `react-scripts start`)
- CRACO config: `@` alias, eslint (react-hooks rules), watchOptions — Emergent plugins removed in CP4.5
- `jsconfig.json` maps `@/*` → `src/*`
- `components.json` = shadcn/ui config (new-york style, no RSC, no TSX)

---

## 3. FILE MAP (every file, what it does)

### Entry points:
| File | Purpose |
|---|---|
| `src/index.js` | ReactDOM.createRoot, renders `<App />` in StrictMode |
| `src/App.js` | Auth gate: waits for `authReady`, then renders `<Board>` |
| `src/App.css` | ALL custom CSS (~732 lines): board, stickers, composer, expanded, throw, zoom, pan |
| `src/index.css` | Tailwind directives + shadcn CSS variables + debug wrapper styles |
| `public/index.html` | CRA template — title, meta description, Google Fonts preconnect, root div |

### Components (src/components/):
| File | Status | Purpose |
|---|---|---|
| `Board.jsx` | ACTIVE | Main orchestrator: zoom/pan, notes rendering, composer/throw/expand state machine |
| `StickerNote.jsx` | ACTIVE (LEGACY) | On-board sticker: drag, spring physics, zoom-aware bounds, click-to-expand |
| `StickerCharacters.jsx` | ACTIVE (LEGACY) | 12 SVG sticker characters (ghost, kitty, bunny, cloud, star, frog, bear, mushroom, chick, dino, alien, whale) |
| ~~`StickyNote.jsx`~~ | ✅ DELETED | Old sticky-note component — removed in CP4.5 |
| `ThrowableNote.jsx` | ACTIVE | Manual throw overlay: user drags sticker from bottom-center, velocity-based landing |
| `NoteComposer.jsx` | ACTIVE (NEEDS REBUILD) | Create entry: single text field, color picker, voice, "let's throw". Must become polaroid composer. |
| `ExpandedNoteCard.jsx` | ACTIVE (NEEDS REBUILD) | Full-screen edit: text + color only. Must become polaroid expanded view with image/title/commentary. |
| `Doodles.jsx` | ACTIVE | Decorative SVG elements (stars, squiggles, bows, hearts, paper clips) at fixed viewport positions |
| `ui/*.jsx` | INSTALLED, MOSTLY UNUSED | ~40 shadcn/ui components. Only `sonner` toast is actively used (imported directly, not via ui/toaster). |

### Hooks (src/hooks/):
| File | Status | Purpose |
|---|---|---|
| `useAuth.js` | ACTIVE | Anonymous-first auth + board provisioning. Has StrictMode guards, stale-JWT recovery. |
| `useEntries.js` | ACTIVE | Supabase CRUD for entries. Optimistic UI. Maps between UI shape and DB columns. |
| ~~`useNotes.js`~~ | ✅ DELETED | Original localStorage-only persistence — removed in CP4.5 |
| `useVoice.js` | ACTIVE | Web Speech API: continuous recognition, auto-restart on Chrome silence, error handling |
| ~~`use-toast.js`~~ | ✅ DELETED | shadcn toast hook — removed in CP4.5 (app uses sonner directly) |

### Lib (src/lib/):
| File | Purpose |
|---|---|
| `supabase.js` | Supabase client singleton. Reads env vars. `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: false`. |
| `utils.js` | `cn()` helper (clsx + tailwind-merge). Used by shadcn/ui components. |

### Design spec:
| File | Purpose |
|---|---|
| `design_guidelines.json` | V0-era design spec: color palette (#FDFBF7 board bg, 4 note colors), font hierarchy (Caveat → Patrick Hand → Nunito), shadow specs, texture URL, component behavior, no-go rules. Authoritative for colors. |

### ~~Plugins (plugins/):~~ ✅ DELETED (CP4.5)

`plugins/visual-edits/` and `plugins/health-check/` (4 files, ~3,400 lines) were removed in CP4.5. `craco.config.js` was also simplified to remove all plugin loading code.

---

## 4. CRITICAL BUGS & MISMATCHES (must fix before anything else works)

### BUG 1: `sticker_type` column missing from Supabase → 400 on insert
**Error:** `Could not find the 'sticker_type' column of 'entries' in the schema cache`
**Root cause:** `noteToDb()` in `useEntries.js` sends `sticker_type` on every insert, but the `entries` table in Supabase may not have this column yet.
**Fix:** Run in Supabase SQL editor: `ALTER TABLE entries ADD COLUMN sticker_type text;`
**Note:** This was flagged in checkpoints CP4 as "action required" but may not have been done.

### BUG 2: `entries.id` type mismatch (string vs UUID)
**Code:** `Board.jsx` `makeNote()` generates `id: "note-1710000000000-abc12"` (string)
**Schema:** `checkpoints.md` says `entries.id uuid primary key`
**Impact:** If DB is UUID, inserts fail silently or with 400. If DB was changed to text, this works but diverges from docs.
**Action:** Verify actual DB type. Either change client to generate UUIDs or confirm DB is text.

### BUG 3: `entries.user_id` not sent on insert
**Code:** `noteToDb()` does not include `user_id` in the insert payload.
**Schema:** `entries.user_id uuid references auth.users not null`
**Impact:** Inserts fail unless DB has `DEFAULT auth.uid()` or a trigger.
**Action:** Verify actual DB default. Add `DEFAULT auth.uid()` if missing.

### BUG 4: Color format mismatch (hex vs semantic)
**Code:** Composer stores hex codes (`#F9E07B`, `#7BC47F`, etc.)
**Schema:** `checkpoints.md` says `color text not null default 'butter'` (semantic names)
**Impact:** If DB validates or other code expects `butter`/`grass`/`mint`/`sky`, hex values break.
**Action:** Decide on one format. Either store hex everywhere or map to semantic names before insert.

### ~~BUG 5: Emergent `emergent-main.js` intercepts fetch → "body stream already read"~~ ✅ RESOLVED
**Was:** `public/index.html` loaded `emergent-main.js` which intercepted `fetch()` and consumed response bodies before Supabase client could parse them.
**Fixed (CP4.5):** `emergent-main.js` removed from `index.html`. `isBodyStreamError()` workaround deleted from `useEntries.js` (all 5 call sites). Board insert in `useAuth.js` restored to normal `.select('id').single()` pattern.

### ~~BUG 6: "loading your board" hang~~ ✅ RESOLVED
**Was:** `authReady` never became `true` — app stuck on "loading your board".
**Root causes (all fixed):**
1. React StrictMode double-mount causing two concurrent `init()` calls → fixed by `initStarted` ref in `useAuth.js`
2. Emergent fetch interceptor causing `getUser()` to fail → triggering unnecessary stale-JWT recovery → creating a new anon user with no board → fixed by removing `emergent-main.js` (CP4.5)
3. Auth state flapping between two UIDs due to the above recovery loop → resolved by 1 + 2

---

## 5. AUTH MODEL (detailed)

### Flow (implemented):
1. `App.js` calls `useAuth()` → gates render on `authReady`
2. `useAuth` calls `getSession()` → if exists, use it; else `signInAnonymously()`
3. Validates session server-side with `getUser()` (catches stale JWTs)
4. If stale: clears localStorage token manually, signs in anonymously fresh
5. Queries `boards` for `user_id = uid`; creates one if missing
6. Sets `boardId` + `authReady = true`
7. Subscribes to `onAuthStateChange` (skips `INITIAL_SESSION` to avoid double init)

### Guards against React StrictMode:
- `initStarted` ref → prevents concurrent `init()` calls
- `anonSignInStarted` ref → prevents concurrent `signInAnonymously()` calls
- `mounted` flag → prevents state updates after unmount

### RLS (in Supabase, per CP2):
- `boards`: `FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
- `entries`: same
- `storage.objects` (entry-images): `auth.uid()::text = (storage.foldername(name))[1]`

### Pending auth work:
- Email claim nudge (CP11)
- Age gate 13+ (CP10)
- Privacy page /privacy (CP10)
- Account deletion Edge Function (CP3 architecture note)
- OAuth providers (V2)

See `memory/AUTH.md` for full documentation.

---

## 6. DATA MODEL

### UI "note" shape (what components use):
```js
{
  id: string,           // "note-<timestamp>-<rand>" — MISMATCH with UUID schema
  text: string,         // maps to DB 'title'
  commentary: string,   // maps to DB 'commentary'
  color: string,        // hex code — MISMATCH with semantic names in schema
  stickerType: string,  // maps to DB 'sticker_type' — MAY NOT EXIST in DB
  imagePath: string,    // maps to DB 'image_path' — not used by UI yet
  x: number,
  y: number,
  rotation: number,
  zIndex: number,       // maps to DB 'z_index'
  createdAt: number,    // timestamp ms, from DB 'created_at'
  autoThrow: boolean,   // client-only (not persisted)
}
```

### DB schema (per checkpoints):
```sql
boards (id uuid PK, user_id uuid FK, created_at timestamptz, title text)
entries (id uuid PK, board_id uuid FK, user_id uuid FK NOT NULL,
         title text NOT NULL, commentary text, color text DEFAULT 'butter',
         image_path text, sticker_type text, x float, y float,
         rotation float DEFAULT 0, z_index int DEFAULT 10,
         created_at timestamptz DEFAULT now())
```

### Mapping layer: `useEntries.js`
- `dbToNote()`: DB row → UI shape
- `noteToDb()`: UI shape → DB insert row (does NOT include `user_id`)
- `partialNoteToDb()`: partial UI updates → DB column names

---

## 7. STORAGE MODEL

### The model (per PRD):
Data goes to **Supabase from the very first interaction**. There is no localStorage-first phase.

1. User opens app → `signInAnonymously()` creates anonymous Supabase session
2. Session token persisted in localStorage (this is the *auth token*, not the data)
3. All entries stored in Supabase PostgreSQL under the anonymous user's UUID
4. All images stored in Supabase Storage under `{user_id}/{entry_id}.jpg`
5. Nudge flow prompts user to add email → `updateUser({ email })` → same UUID, no migration
6. `useNotes.js` (localStorage data) is V0 dead code from the pre-Supabase era

### Current implementation matches the model:
- `useEntries.js` talks to Supabase directly for all CRUD
- `useAuth.js` handles anonymous sign-in and session persistence
- No localStorage data storage exists (only Supabase auth token in localStorage)

### Image storage (planned, not implemented):
- Bucket: `entry-images` (private)
- Path convention: `{user_id}/{entry_id}.jpg`
- CP7 plans: client-side compression, upload via `supabase.storage.from('entry-images').upload()`
- Signed URLs for display (private bucket requires them)

---

## 8. BOARD INTERACTION MODEL

### Coordinate spaces:
- **Screen coords**: pixels relative to board element
- **Canvas coords**: what's stored in DB (x, y)
- Transform: `.board-canvas` gets `translate(panX, panY) scale(zoom)` with `transformOrigin: center center`
- Conversion: `screenToCanvas(sx, sy)` in Board.jsx

### Zoom: 5% → 300% (0.05 → 3.0)
- Ctrl+scroll / pinch = zoom
- Two-finger scroll = pan
- Middle-mouse drag = pan
- +/- buttons
- Reset button → zoom=1, pan=(0,0)

### Throw state machine:
1. `composerOpen=true` → user writes/speaks
2. `handleThrow(text, color, isVoice, stickerType)`:
   - Voice → `addNote(note)` directly (auto-throw, random position)
   - Typed → `setPendingNote(note)` → ThrowableNote overlay
3. User drags ThrowableNote → `handleLand(sx, sy)` → screenToCanvas → addNote
4. Toast confirms

### Expansion:
- Click sticker → `handleExpand(noteId, rect)` → records origin rect
- ExpandedNoteCard animates from sticker position to center
- On close → `handleCollapse()` → sets `hiddenId` to avoid double-render → `onExitComplete` clears it

---

## 9. DESIGN SYSTEM

### Source of truth: `design_guidelines.json` + `memory/PRD.md` §4

### Colors:
| Name | design_guidelines.json | PRD | Code | Notes |
|---|---|---|---|---|
| board_bg | #FDFBF7 | #F5F0E8 | #FDFBF7 | Code matches design_guidelines; PRD is different |
| butter | #F9E07B | #F9E07B | #F9E07B | Consistent |
| grass | #7BC47F | #7BC47F | #7BC47F | Consistent |
| mint | #98E8C1 | #87D4C0 | #98E8C1 | Code matches design_guidelines; PRD is different |
| sky | #87CEEB | #87CEEB | #87CEEB | Consistent |
| ink_primary | #2D2D2D | — | #2D2D2D | Consistent |
| warm-brown | — | #5A4A3A | #5A4A3A | In PRD and code, not in design_guidelines as named |
| alert_red | #E06C75 | — | #E06C75 | Consistent |

**Resolution:** `design_guidelines.json` is the authoritative color source (it matches the code). PRD colors for board_bg and mint are outdated.

### Fonts:
- **Caveat**: headings, note text, emotional text (primary)
- **Patrick Hand**: shorter labels or buttons (secondary — in design_guidelines, NOT yet imported in code)
- **Nunito**: small UI elements, tooltips where legibility is critical
- ~~**Inter**~~: removed from index.html in CP4.5 (PRD forbids Inter in UI)
- **CRITICAL**: NEVER use Inter, Roboto, or System Sans in app UI

### Shadows (design_guidelines):
- `note_lift`: `2px 4px 12px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.2)`
- `note_floating`: `10px 20px 30px rgba(0,0,0,0.2)`
- Use distinct, directional shadows — NOT generic "clean SaaS" shadows

### Textures (design_guidelines):
- Paper overlay on `.App` container: `mix-blend-mode: multiply`, low opacity (10-20%) — NOT implemented yet
- Paper texture URL provided in design_guidelines.json

### No-go rules:
- NO gradients (FORBIDDEN — `design_guidelines.json`)
- NO purple
- NO blue-toned shadows (use warm browns)
- NO Inter/Roboto/system fonts in UI
- NO rounded-2xl on main cards (feels corporate)
- NO symmetry — randomize rotations
- Avoid "clean" aesthetic — imperfection is the feature

---

## 10. CHECKPOINT STATUS (what's done, what's not)

| CP | Status | Summary |
|---|---|---|
| CP0 | ✅ | Repo restructured, deps cleaned |
| CP1 | ✅ | Supabase client wired |
| CP2 | ✅ | DB schema + RLS + storage bucket (but sticker_type column may be missing) |
| CP3 | ✅ | Python backend removed |
| CP4 | ✅ (with caveats) | Anonymous auth + useEntries (but schema mismatches remain) |
| CP5 | 🔲 | Polaroid component (THE PIVOT — replaces stickers) |
| CP6 | 🔲 | Composer rebuilt for polaroid |
| CP7 | 🔲 | Image upload |
| CP8 | 🔲 | Expanded polaroid view |
| CP9 | 🔲 | Image lightbox |
| CP10 | 🔲 | Age gate + privacy page |
| CP11 | 🔲 | Email nudge + account deletion |
| CP12 | 🔲 | Final test + polish |

---

## 11. DEAD CODE & CLEANUP NEEDED

| Item | Location | Status |
|---|---|---|
| ~~`StickyNote.jsx`~~ | `src/components/` | ✅ DELETED (CP4.5) |
| ~~`useNotes.js`~~ | `src/hooks/` | ✅ DELETED (CP4.5) |
| ~~`use-toast.js`~~ | `src/hooks/` | ✅ DELETED (CP4.5) |
| ~~Inter font import~~ | `public/index.html` | ✅ DELETED (CP4.5) |
| ~~Emergent badge~~ | `public/index.html` | ✅ DELETED (CP4.5) |
| ~~PostHog analytics~~ | `public/index.html` | ✅ DELETED (CP4.5) |
| ~~`emergent-main.js`~~ | `public/index.html` | ✅ DELETED (CP4.5) |
| ~40 shadcn/ui components | `src/components/ui/` | Pending — most are unused. Audit during V1 build. |

---

## 12. EMERGENT PLATFORM ARTIFACTS ✅ ALL REMOVED (CP4.5)

The V0 of this app was built on Emergent.sh (an AI app builder). All artifacts were removed in CP4.5:

| Artifact | Was | Removed |
|---|---|---|
| `emergent-main.js` | Loaded in `public/index.html` — intercepted all fetch() calls | ✅ |
| PostHog analytics | Loaded in `public/index.html` — third-party analytics + API key | ✅ |
| "Made with Emergent" badge | Rendered in `public/index.html` | ✅ |
| debug-monitor.js | Loaded in iframe-conditional block in `public/index.html` | ✅ |
| Inter font import | `public/index.html` — PRD forbids Inter | ✅ |
| `plugins/visual-edits/` | Babel plugin (JSX metadata) + dev-server /edit-file endpoint | ✅ |
| `plugins/health-check/` | Webpack health plugin + /health endpoints | ✅ |
| `.gitconfig` | Set git author to `emergent-agent-e1` | ✅ |
| `.cursor/debug-ed6f9f.log` | Stale debug trace from Emergent-era debugging | ✅ |
| `data-debug-wrapper` CSS | `src/index.css` — applied to babel-metadata-injected wrappers | ✅ |
| `isBodyStreamError()` | `src/hooks/useEntries.js` — workaround for fetch interception | ✅ |
| Board insert workaround | `src/hooks/useAuth.js` — no-`.select()` + re-query pattern | ✅ |

`design_guidelines.json` (V0-era) is **kept** — still the authoritative color/font/shadow spec.

---

## 13. IMMEDIATE PRIORITIES (in order)

### P0 — Make the app bootable (fix auth hang):
1. Verify/add `sticker_type` column in Supabase
2. Verify `entries.id` type (UUID or text)
3. Verify `entries.user_id` has DEFAULT or fix insert
4. Consider removing/isolating `emergent-main.js` to stop fetch interception

### P1 — Stabilize current sticker flow (so we have a working baseline):
1. Fix all schema mismatches so CRUD works end-to-end
2. Verify: create → throw → persist → reload → still there

### P2 — Begin polaroid pivot (CP5-CP6):
1. Build `Polaroid.jsx` + `PolaroidOnBoard.jsx`
2. Rebuild `NoteComposer.jsx` for title + commentary + image placeholder
3. Replace `StickerNote` references in Board with Polaroid
4. Update domain model: `text` → `title` + `commentary`

### P3 — Image pipeline (CP7-CP9):
1. Build `useImageUpload.js`
2. Wire image area in composer
3. Signed URLs for display
4. Expanded polaroid with image view/change
5. Lightbox

### P4 — Compliance & identity (CP10-CP11):
1. Age gate
2. Privacy page
3. Email nudge
4. Account deletion Edge Function

---

## 14. DOC INCONSISTENCIES (cross-reference findings)

1. **PRD §8 says "Backend: FastAPI (existing, minimal)"** — this is stale. FastAPI was deleted in CP3. PRD should be updated.
2. **PRD §6 title says "V2 pivot"** but this IS the V1 target. The polaroid IS V1-final; stickers are V0 legacy. PRD section numbering is misleading.
3. **checkpoints.md CP5-12** still reference `frontend/src/components/` paths — the `frontend/` folder was deleted in CP0. All paths are now `src/components/`.
4. **DOCS.md** lists `useNotes` in hooks but should list `useEntries` (which replaced it).
5. **README.md** references `design_guidelines.json` — file exists at repo root (116 lines). Contains authoritative color palette, font rules, shadow specs, texture references, and component behavior specs from V0.
6. **entries schema** in CP2 includes `sticker_type text` with a note about adding it manually. The CP4 checkpoint also has an "action required" note for the same migration — unclear if it was actually run.
7. **PRD says `entries.id uuid PK`** but `Board.jsx` generates string IDs. The CP2 SQL shows `id uuid primary key` with NO `default gen_random_uuid()` — this means the client MUST supply a valid UUID, which it does not.

---

## 15. OPEN QUESTIONS (from PRD + observed)

1. **Board naming in V1?** Currently untitled (default null)
2. **Entry limit for anonymous?** No caps currently
3. **Client-side image compression?** Planned in CP7 but no library chosen
4. **Offline support?** Not planned for V1
5. **Offline/service-worker caching?** Not planned for V1. Data always goes to Supabase (even for anonymous users).
6. **Mint color discrepancy:** PRD says #87D4C0, code uses #98E8C1
7. **Board background color:** PRD says #F5F0E8, code uses #FDFBF7
8. **Which shadcn/ui components are actually needed?** Most of the 40+ installed are unused

---

## 16. KEY FILES TO MODIFY FOR THE POLAROID PIVOT

| Current file | What changes |
|---|---|
| `Board.jsx` | Replace `StickerNote` → `PolaroidOnBoard`, update `makeNote()` to include title+commentary, remove `STICKER_TYPES` dependency |
| `NoteComposer.jsx` | Title field (required, gates throw), commentary field, image placeholder, live polaroid preview |
| `ExpandedNoteCard.jsx` | Polaroid layout: image area (view/change), editable title + commentary, delete with confirm + storage cleanup |
| `useEntries.js` | Rename `text` → `title` in mapping, ensure `commentary` flows through, add image path handling |
| `StickerNote.jsx` | Replace with `PolaroidOnBoard.jsx` (new file) |
| `StickerCharacters.jsx` | Eventually remove (no stickers in polaroid V1) |
| `ThrowableNote.jsx` | Update to show polaroid instead of sticker character |
| `App.css` | Add polaroid styles, eventually remove sticker-specific styles |

---

## 17. SUPABASE SCHEMA VERIFICATION (MUST DO)

The Supabase MCP was not authenticated during this analysis. Before any code changes, verify the live schema by running in the Supabase SQL editor:

```sql
-- Check entries table columns
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'entries'
ORDER BY ordinal_position;

-- Check boards table columns
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'boards'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';

-- Check if sticker_type column exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'entries' AND column_name = 'sticker_type';

-- Check entries.id type
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'entries' AND column_name = 'id';

-- Check if user_id has a default
SELECT column_name, column_default FROM information_schema.columns
WHERE table_name = 'entries' AND column_name = 'user_id';
```

These results will confirm or refute Bugs 1-4 in section 4.

---

## 18. ~~EMERGENT PLATFORM FETCH INTERCEPTOR~~ ✅ RESOLVED (CP4.5)

`emergent-main.js` and all workarounds have been removed. See section 12 for the full list of what was deleted.

**Historical note:** The `emergent-main.js` script intercepted all `fetch()` calls and consumed response bodies before Supabase could parse them, causing "body stream already read" errors in `useAuth.js` (board insert, `getUser()`) and `useEntries.js` (all mutations). Workarounds included `isBodyStreamError()` in `useEntries.js` and a no-`.select()` + re-query pattern in `useAuth.js`. All workarounds have been removed alongside the root cause.

---

*This document was generated by reading every file in the thought-stick codebase. Last updated: 2026-03-14.*
