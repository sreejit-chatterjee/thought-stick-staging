# thought stick — Build Checkpoints

**Stack:** React + Supabase (no backend server)
**Last updated:** Feb 22, 2026

---

## Legend
- 🔲 Not started
- 🔄 In progress
- ✅ Complete

---

## ✅ CHECKPOINT 0 — Project restructured (complete)

- Moved all React app files from `frontend/` to repo root
- Deleted `frontend/` folder
- Updated `package.json`: renamed to `thought-stick`, removed `react-day-picker` (unused), removed `axios` (no backend), removed `cra-template` (scaffold artefact), added `@supabase/supabase-js`
- Deleted unused `src/components/ui/calendar.jsx`
- Ran `npm install` at root — clean, no peer dep conflicts
- **Verified:** `npm start` compiles and runs from root at `localhost:3000`

---

## ✅ CHECKPOINT 1 — Supabase connected (complete)

**Goal:** Supabase client wired into the React app and connection verified.

### Tasks
- [x] `@supabase/supabase-js` added to `package.json`
- [x] Created `src/lib/supabase.js` (client singleton with env var validation)
- [x] `.env` at repo root already has `REACT_APP_SUPABASE_URL` + `REACT_APP_SUPABASE_ANON_KEY` — CRA picks it up automatically
- [x] **Connection verified:** app compiles and starts cleanly at `localhost:3000`

### Files changed
- `package.json`
- `src/lib/supabase.js` *(new)*

---

## ✅ CHECKPOINT 2 — Database schema + storage live (complete)

- [x] `boards` and `entries` tables created in Supabase SQL editor
- [x] RLS enabled on both tables with `USING` + `WITH CHECK (auth.uid() = user_id)`
- [x] `entry-images` storage bucket created and set to **Private**
- [x] Storage RLS policy applied using `storage.foldername(name)[1]` (correct Supabase helper)
- [x] **Verified:** base URL without token returns `400 "querystring must have required property 'token'"` — bucket is private and secure. Signed URLs work as intended.

### SQL (run in Supabase SQL editor)
```sql
-- boards
create table boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  title text
);

-- entries
create table entries (
  id uuid primary key,
  board_id uuid references boards not null,
  user_id uuid references auth.users not null,
  title text not null,
  commentary text,
  color text not null default 'butter',
  image_path text,
  sticker_type text,
  x float not null,
  y float not null,
  rotation float not null default 0,
  z_index int not null default 10,
  created_at timestamptz default now()
);

-- ⚠️ If you already ran the original SQL above, add the sticker_type column manually:
-- alter table entries add column sticker_type text;

-- RLS (USING = who can see/change rows; WITH CHECK = what rows can be inserted/updated)
alter table boards enable row level security;
alter table entries enable row level security;

create policy "own boards" on boards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own entries" on entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### Storage RLS (in Supabase dashboard → Storage → Policies)
```sql
-- Users can only read/write/delete objects under their own path: {user_id}/...
-- storage.foldername(name) returns text[] of path segments; [1] is first (user_id)
create policy "own files" on storage.objects
  for all
  using (auth.uid()::text = (storage.foldername(name))[1])
  with check (auth.uid()::text = (storage.foldername(name))[1]);
```

---

## ✅ CHECKPOINT 3 — Python backend removed (complete)

- [x] Deleted `backend/` (FastAPI server + requirements.txt)
- [x] Deleted `tests/` (Python Playwright test files)
- [x] Deleted `test_reports/`
- [x] Deleted `test_result.md`
- [x] `axios` already removed in CP0 when `package.json` was cleaned up
- [x] No `REACT_APP_BACKEND_URL` or `localhost` fetch calls found in `src/`
- [x] App is purely React + Supabase. No Python dependencies remain.

### Architecture note
- Data flows: React → Supabase directly (anon key + RLS)
- Account deletion (which needs `service_role`) will be a Supabase Edge Function — planned for CP11
  - [ ] CORS restricted to app domain (not `*`)
  - [ ] Error responses sanitised (no internal Supabase errors leaked to client)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set as Edge Function secret in Supabase dashboard (never in `.env`)
- [ ] Wire `DELETE /account` call from React (settings or profile screen)
- [ ] Verified: account deletion wipes auth user + all entries + all storage files

### SQL — Add cascade deletes to schema (run in Supabase SQL editor)
```sql
-- Ensure boards and entries cascade-delete when auth user is deleted
ALTER TABLE boards
  DROP CONSTRAINT IF EXISTS boards_user_id_fkey,
  ADD CONSTRAINT boards_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE entries
  DROP CONSTRAINT IF EXISTS entries_user_id_fkey,
  ADD CONSTRAINT entries_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE entries
  DROP CONSTRAINT IF EXISTS entries_board_id_fkey,
  ADD CONSTRAINT entries_board_id_fkey
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE;
```

---

## ✅ CHECKPOINT 4 — Anonymous auth + data layer (complete)

- [x] Created `src/hooks/useAuth.js`: silent anonymous sign-in on first load; checks for existing session first, creates board if user has none, exposes `{ userId, boardId, authReady }`
- [x] Created `src/hooks/useEntries.js`: drop-in replacement for `useNotes.js` with identical API surface; optimistic local state + Supabase persistence; full field mapping between UI shape and DB columns
- [x] Swapped `useNotes` → `useEntries` in `Board.jsx`; `Board` now receives `userId` + `boardId` props from `App.js`
- [x] `App.js` initialises auth before rendering Board; shows warm loading state while session is being confirmed
- [x] Added `sticker_type` column to schema (SQL migration note added to CP2 SQL block)
- [x] App compiles cleanly — webpack reports no errors

### ⚠️ Action required before CP4 is fully verified
Run this in Supabase SQL editor to add the missing column:
```sql
alter table entries add column sticker_type text;
```
Then test: create a note in the app, reload the page — note should still be there (from Supabase, not localStorage).

---

## ✅ CHECKPOINT 4.5 — Emergent cleanup (complete)

**Goal:** Remove all Emergent platform scaffolding from the codebase to eliminate the fetch-interceptor root cause and its workarounds, leaving a clean foundation for the V1 polaroid build.

### What was removed
- [x] `emergent-main.js`, PostHog analytics, "Made with Emergent" badge, debug-monitor iframe block, DOMException error suppression script, and Inter font import from `public/index.html`
- [x] Updated page `<title>` to "thought stick" and meta description to "thought stick — a living memory board"
- [x] `plugins/visual-edits/` folder deleted (babel-metadata-plugin.js + dev-server-setup.js, ~3,100 lines)
- [x] `plugins/health-check/` folder deleted (webpack-health-plugin.js + health-endpoints.js, ~330 lines)
- [x] `craco.config.js` simplified: all plugin-loading code removed (~107 lines → ~30 lines)
- [x] `data-debug-wrapper` CSS block removed from `src/index.css`
- [x] `isBodyStreamError()` function + 5 call sites removed from `src/hooks/useEntries.js`
- [x] Board insert in `src/hooks/useAuth.js` restored to standard `.select('id').single()` pattern
- [x] `.gitconfig` deleted (was setting git author to `emergent-agent-e1 / github@emergent.sh`)
- [x] `.cursor/debug-ed6f9f.log` deleted (stale Emergent-era debug trace)
- [x] Dead code deleted: `src/components/StickyNote.jsx`, `src/hooks/useNotes.js`, `src/hooks/use-toast.js`
- [x] DOCS.md, ENGINEERING_NOTES.md, checkpoints.md updated to reflect clean state
- [x] **Verified:** app compiles, boots, no "body stream already read" errors in console

---

## 🔲 CHECKPOINT 5 — Custom polaroid component

**Goal:** Polaroid SVG/CSS asset designed and rendered on the board.

### Tasks
- [ ] Build `src/components/Polaroid.jsx` (photo area, title tab, caption)
- [ ] Build `src/components/PolaroidOnBoard.jsx` (draggable, throwable, velocity release)
- [ ] Verified: renders at all 4 color accents, correct fonts, no gradients, random rotation

---

## 🔲 CHECKPOINT 6 — Composer rebuilt for polaroid

**Goal:** Entry creation flow updated to match polaroid model.

### Tasks
- [ ] Rebuild `NoteComposer.jsx` with live polaroid preview
- [ ] Title field (Caveat, required — gates "let's throw" button)
- [ ] Commentary field (Nunito, optional)
- [ ] Photo area placeholder in preview
- [ ] Keep 4 color dots, voice mic, throw logic
- [ ] Verified: live preview updates, title gate works, voice fills commentary

---

## 🔲 CHECKPOINT 7 — Image upload

**Goal:** Users can attach a photo from gallery or camera to any polaroid.

### Tasks
- [ ] Create `src/hooks/useImageUpload.js`
- [ ] Client-side compression before upload (<1MB target)
- [ ] `supabase.storage.from('entry-images').upload()`
- [ ] Image area in composer (tap → gallery or camera)
- [ ] `image_path` saved on entry in Supabase
- [ ] Verified: image uploads, URL stored, polaroid preview shows image

---

## 🔲 CHECKPOINT 8 — Expanded polaroid view

**Goal:** Full-detail view on tap; all fields editable and persisted.

### Tasks
- [ ] Rebuild `ExpandedNoteCard.jsx` for polaroid layout
- [ ] Photo area tappable (view/change per State A/B)
- [ ] Editable title + commentary
- [ ] Color accent picker (updates Supabase in real time)
- [ ] Date created display
- [ ] Delete with one-tap confirm (removes from DB + Storage)
- [ ] Close with swoosh animation, changes persisted
- [ ] Verified: all edits saved to Supabase, delete cleans up Storage

---

## 🔲 CHECKPOINT 9 — Image lightbox

**Goal:** Full-screen image viewer triggered from expanded view.

### Tasks
- [ ] Build `src/components/ImageLightbox.jsx`
- [ ] Full-screen overlay, tap/Escape to dismiss
- [ ] Framer Motion fade in/out
- [ ] Verified: opens and closes cleanly, image fills screen at native ratio

---

## 🔲 CHECKPOINT 10 — Age gate + privacy

**Goal:** 13+ age confirmation on first load; privacy policy page.

### Tasks
- [ ] Build `src/components/AgeGate.jsx` (renders before Board, one-time)
- [ ] localStorage flag to suppress after first confirm
- [ ] Add `/privacy` route (React Router)
- [ ] Static privacy page content (Supabase as processor, deletion rights, no data selling)
- [ ] Link from AgeGate and board footer
- [ ] Verified: gate shows first load, dismissed permanently, `/privacy` accessible

---

## 🔲 CHECKPOINT 11 — Email nudge system

**Goal:** Convert anonymous users to retained users via gentle email prompt.

### Tasks
- [ ] Create `src/hooks/useEmailNudge.js`
- [ ] Fires toast after first entry created
- [ ] Snooze logic (localStorage timestamp, re-show after 2–3 weeks)
- [ ] Email input → `supabase.auth.updateUser({ email })`
- [ ] Confirm toast on success; anonymous session → real account, data preserved
- [ ] Verified: nudge fires, snooze works, email update completes without data loss

---

## 🔲 CHECKPOINT 12 — Final test + polish

**Goal:** Full end-to-end validation and PRD compliance sweep.

### Tasks
- [ ] Full user journey: age gate → auth → create → throw → drag → expand → edit → image → lightbox → delete → nudge
- [ ] Board mechanics regression: zoom (5–300%), pan, pan hint, reset
- [ ] Design audit: no purple, no gradients, Caveat/Nunito only, warm shadows
- [ ] Cross-browser: Chrome, Safari, Firefox, mobile Safari
- [ ] Update `DOCUMENTATION.md`

---

*Generated during thought-stick migration from FastAPI/MongoDB → React + Supabase.*
