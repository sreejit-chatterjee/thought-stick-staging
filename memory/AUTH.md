# thought-stick — Authentication & Identity (V1 → V2)
**Last updated:** 2026-03-12  
**Source of truth:** This document is derived from the current codebase (`src/lib/supabase.js`, `src/hooks/useAuth.js`, `src/hooks/useEntries.js`) plus product/docs (`memory/PRD.md`, `checkpoints.md`, `DOCS.md`) and is intended to be the onboarding reference for new developers.

---

## 0. Executive summary

**thought-stick uses Supabase Auth with an anonymous-first model.** On first load, the app silently creates (or restores) a Supabase session. The session’s `user.id` (equivalent to Postgres `auth.uid()`) is the stable identity key used for:

- **Row ownership** in Postgres tables (`boards.user_id`, `entries.user_id`) enforced by **RLS**
- **(Planned) Storage object ownership** in the private `entry-images` bucket under the prefix `{user_id}/...`

**There is no custom backend.** The frontend uses the Supabase **anon key** (safe-by-design when RLS is correct). The only planned server-side code is a Supabase Edge Function for **account deletion**, which requires `service_role`.

---

## 1. Terminology

- **Anonymous user**: A Supabase Auth user created via `signInAnonymously()`. Has a stable UUID (`auth.uid()`), but no email attached.
- **Recognized user**: The *same Supabase Auth user* after an email is attached (planned). The UUID remains the same. The exact cross-device sign-in UX (magic link / OTP / password) is still pending definition and implementation.
- **Identity key**: `auth.uid()` in Postgres, `session.user.id` in the client.
- **V1 model**: exactly **one board per user** (created automatically).

---

## 2. Implemented (current code)

### 2.1 Supabase client initialization (session persistence)
**File:** `src/lib/supabase.js`

The client is configured to persist sessions and refresh tokens:

- `persistSession: true`
- `autoRefreshToken: true`
- `detectSessionInUrl: false`

This means users typically remain logged in on the same device/browser without any explicit login UI.

### 2.2 App boot auth flow (silent anonymous-first)
**File:** `src/hooks/useAuth.js`

On initial app load:

1. Call `supabase.auth.getSession()`.
2. If a session exists, use it.
3. If no session exists, call `supabase.auth.signInAnonymously()` (silent; no UI).
4. Extract `uid = session.user.id` and store it as `userId`.

### 2.3 Board provisioning (creates/loads the user’s board)
**File:** `src/hooks/useAuth.js`

After a session is available:

1. Query `boards` for `user_id = uid` and take the first result.
2. If no board exists, insert `boards` row with `{ user_id: uid }`.
3. Store the board id as `boardId`.
4. Set `authReady=true`.

**Important:** This is what enforces the V1 “single board” pattern. V2 (“multiple boards”) will change this logic.

### 2.4 Render gating (prevents DB calls before auth context exists)
**File:** `src/App.js`

`App` does not render `Board` until `authReady` is true. This prevents:

- `useEntries(boardId)` from querying with a null/undefined `boardId`
- UI flicker caused by loading entries before auth/board context is ready

### 2.5 Auth state subscription (refresh / restoration safety net)
**File:** `src/hooks/useAuth.js`

`supabase.auth.onAuthStateChange` is subscribed. When a session is observed, `init(session)` may run to complete provisioning. (Implementation note: `useAuth` currently uses a mount-only effect; any state checks inside the callback should be treated carefully to avoid stale closures.)

**StrictMode recovery:** In dev, React mounts → unmounts → remounts. If `getSession().then()` runs after the first unmount, `init()` bails on `!mounted`. A `queueMicrotask()` recovery path calls `init(session, skipMountedCheck=true)` so provisioning completes without the "No API key" race. The listener only runs `init()` when `recoveryNeeded` is set (avoids duplicate init from both getSession and listener).

---

## 3. How auth ties to Supabase data (required invariants)

### 3.1 Postgres: ownership columns + RLS
**Docs reference:** `checkpoints.md` (CP2), `memory/PRD.md` (Data model / RLS)

The core invariant (intended) is:

> **All rows are owned by the authenticated user:** `user_id = auth.uid()`.

RLS must ensure the anon-key client cannot read/write any rows that do not belong to the current JWT’s `auth.uid()`.

**Important:** The application code does not always supply `user_id` on inserts (see §6.2). If `user_id` is required, the database must set it (default/trigger) or inserts will fail.

Recommended explicit policies (SELECT/INSERT/UPDATE/DELETE) are documented in `.cursor/skills/security-audit/reference.md`.

### 3.2 Storage: private bucket scoped by `{user_id}/...`
**Docs reference:** `checkpoints.md` (CP2), `memory/PRD.md` (Storage)

The `entry-images` bucket is intended to be **Private**. RLS should scope storage objects so users can only read/write/delete under their own first path segment:

`{user_id}/{entry_id}.jpg`

Policy pattern (conceptually): `auth.uid()::text = (storage.foldername(name))[1]`.

**Status note:** Bucket + policies are described as created in `checkpoints.md`, but the UI upload/download flows are not implemented yet (see CP7/CP8).

---

## 4. Data layer behavior (current)

### 4.1 Entries are loaded by `board_id`
**File:** `src/hooks/useEntries.js`

`useEntries(boardId)` queries:

- `from('entries').select('*').eq('board_id', boardId).order('z_index')`

This is why `useAuth` must provide a valid `boardId` before rendering the board.

### 4.2 Writes are optimistic
**File:** `src/hooks/useEntries.js`

All mutations (insert/update/delete/z-index) update local state first, then write to Supabase in the background. Failures are currently logged to the console (no user-visible retry UX yet).

---

## 5. Planned / pending (from PRD + checkpoints)

### 5.1 Email-claim (“recognized”) nudge
**Status:** Pending  
**Docs reference:** `memory/PRD.md` (V1 auth + nudge), `checkpoints.md` (CP11)

After the first entry is created, show a gentle toast prompting the user to add an email:

- Snooze logic stored in localStorage; remind after ~2–3 weeks
- Email submission calls `supabase.auth.updateUser({ email })`
- Data remains attached to the same `auth.uid()` (no migration)

### 5.2 Age gate (13+)
**Status:** Pending  
**Docs reference:** `memory/PRD.md` (privacy compliance), `checkpoints.md` (CP10)

On first load, render an age confirmation gate (“I am 13+”) before the board. Store a localStorage flag so it is shown only once.

### 5.3 Privacy policy page (`/privacy`)
**Status:** Pending  
**Docs reference:** `memory/PRD.md` (privacy compliance), `checkpoints.md` (CP10)

Add a route/page describing:

- Supabase as a processor
- no data selling / no third-party analytics in V1
- deletion rights and how to delete an account

### 5.4 Delete account + data wipe (Edge Function)
**Status:** Pending  
**Docs reference:** `checkpoints.md` (CP3 architecture note), `memory/PRD.md` (delete account), `.cursor/skills/security-audit/reference.md` (Edge Function checklist)

Because deleting an auth user and performing global cleanup requires privileged access:

- Implement a Supabase Edge Function (e.g. `delete-account`)
- Store `SUPABASE_SERVICE_ROLE_KEY` only in Supabase secrets (never in frontend `.env`)
- Verify caller JWT server-side (`supabase.auth.getUser()`) before any privileged operations
- Restrict CORS to the app’s domain (not `*`)
- Sanitize errors (avoid leaking internal Supabase details)
- Delete storage objects under `{user_id}/...` and then delete the auth user
- Ensure DB cascades remove `boards` and `entries`

### 5.5 Abuse/quotas (open question)
**Status:** Open question  
**Docs reference:** `memory/PRD.md` (Open Questions)

Decide whether to cap anonymous users (entries count, storage, etc.) prior to email claim to reduce abuse risk.

---

## 6. Known implementation risks / reconciliation items (verify before launch)

These items must be verified against the **actual** Supabase schema/policies because they materially affect correctness and security.

### 6.1 `entries.id` type vs client-generated IDs
**Code:** `src/components/Board.jsx` generates IDs like `note-<timestamp>-<rand>`.  
**Docs:** `checkpoints.md` defines `entries.id uuid primary key`.

**Action:** Reconcile this before shipping. As-written, inserts will fail against a strict UUID primary key unless either:

- the database schema differs (e.g., `id text`), or
- the client switches to UUIDs, or
- the database generates UUIDs and the client stops supplying its own string IDs.

### 6.2 How `entries.user_id` is set on insert
**Code:** `src/hooks/useEntries.js` does not include `user_id` in insert payload.  
**Docs:** `checkpoints.md` defines `entries.user_id uuid references auth.users not null`.

**Action:** Confirm one of:

- `entries.user_id` has a DB default of `auth.uid()`, or a trigger that sets it, or
- schema differs from the checkpoint doc (nullable, removed, etc.)

If neither is true, inserts will fail or ownership/RLS will be incorrect.

### 6.3 RLS completeness (CRUD)
The security reference recommends explicit SELECT/INSERT/UPDATE/DELETE policies with `WITH CHECK`. If using a single `FOR ALL` policy, confirm it correctly covers insert/update checks.

### 6.4 Cross-device behavior
Until email claim exists, users’ access is effectively bound to the local persisted anonymous session. Clearing site data may lose access to the board.

---

## 7. Developer checklist (auth-related)

When making auth/schema changes, verify:

- `.env` contains only `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` (no secrets)
- RLS is enabled on all app tables
- Policies correctly bind `user_id` to `auth.uid()` and include `WITH CHECK` for inserts/updates
- Storage bucket is private and scoped to `{user_id}/...`
- Any Edge Function using `service_role` verifies caller JWT and prevents IDOR

---

## 8. References

- Product requirements: `memory/PRD.md`
- Build tracker & SQL snippets: `checkpoints.md`
- Project overview: `DOCS.md`, `README.md`
- Code:
  - `src/lib/supabase.js`
  - `src/hooks/useAuth.js`
  - `src/hooks/useEntries.js`
  - `src/App.js`
- Security audit reference (policies + checklist): `.cursor/skills/security-audit/reference.md`

