# thought-stick — Project Documentation

## Overview

**thought-stick** is a private, freeform digital memory board. Users capture life moments as polaroids and throw them onto an infinite canvas.

**Key docs for onboarding:**
- `memory/PRD.md` — full product requirements and scope (V1/V2/V3)
- `checkpoints.md` — build progress tracker and database/storage SQL snippets
- `memory/AUTH.md` — authentication + identity model (anonymous-first → email claim), schema/RLS contracts, and pending security-critical work

---

## Skills

### security-audit

**Location:** `.cursor/skills/security-audit/`

**Purpose:** Runs a coordinated multi-agent security audit of the codebase using three specialist personas:

| Persona | Role | Focus |
|---|---|---|
| **Cipher** | AppSec Lead (12 yrs) | Auth flows, privacy compliance, input validation, API security |
| **Red** | Red Team Operator (11 yrs) | XSS, CSRF, injection, adversarial attack surfaces |
| **Sage** | Supabase/DB Architect (13 yrs) | RLS policies, storage bucket security, anonymous auth, schema |

**How it works:**
1. Three subagents run concurrently, each independently auditing the full codebase
2. Each produces a structured findings report with severity ratings
3. The orchestrating agent cross-references all three reports
4. A final consolidated report with a prioritised action plan is written to `memory/SECURITY_AUDIT.md`

**Trigger:** Ask the AI to "run a security audit", "audit the codebase", "check for vulnerabilities", or "review Supabase RLS".

**Output:** `memory/SECURITY_AUDIT.md` — full report with executive summary, findings table, RLS policy templates, and prioritised fix plan.

**Files:**
- `SKILL.md` — orchestration logic, agent prompts, execution steps
- `reference.md` — final report template, per-layer audit checklist, severity definitions, key files list

---

## Bug Fixes & Known Issues

### `useAuth` — Three concurrent-init bugs fixed (Mar 2026)

**File:** `src/hooks/useAuth.js`

**Root causes (confirmed by runtime logging):**

| Bug | Cause | Fix |
|---|---|---|
| **2 users created on first visit** | React StrictMode double-invokes `useEffect`. Both runs called `getSession()` → both saw no session → both called `signInAnonymously()` before either completed | `anonSignInStarted` ref gates the first call; second is rejected |
| **"loading your board" stuck forever** | `onAuthStateChange(INITIAL_SESSION)` fired at the same time `getSession()` resolved, both calling `init()` concurrently. Both tried to INSERT a board, causing concurrent insert conflicts; both failed → `authReady` never set | `initStarted` ref ensures only one `init()` runs; `INITIAL_SESSION` event is explicitly skipped |
| **Stale JWT after user deletion** | `getSession()` reads only localStorage — it reports a valid session even if the user was deleted from `auth.users`. All subsequent Supabase calls fail with 401 | `getUser()` validates the session server-side at the start of `init()`; on failure, the Supabase auth token is removed directly from `localStorage` (even `signOut({ scope: 'local' })` makes a server call that 403s), then `signInAnonymously()` creates a fresh user inline |

---

## Project Structure

```
thought-stick-staging/
├── src/                      # React frontend
│   ├── components/           # Board, StickerNote, NoteComposer, etc.
│   ├── hooks/                # useEntries, useAuth, useVoice
│   └── lib/                  # Supabase client, utils
├── public/
│   └── index.html
├── memory/
│   ├── PRD.md                # Full product requirements document
│   ├── AUTH.md               # Auth + identity onboarding doc
│   └── ENGINEERING_NOTES.md  # Comprehensive codebase context
├── .cursor/
│   └── skills/
│       └── security-audit/   # Multi-agent security audit skill
├── design_guidelines.json    # Authoritative color/font/shadow spec
└── DOCS.md                   # This file
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, framer-motion |
| Backend | None (React talks to Supabase directly) |
| Database | Supabase PostgreSQL |
| Auth | Supabase anonymous auth → email upgrade |
| Storage | Supabase Storage (bucket: `entry-images`) |
| Voice | Web Speech API (browser-native) |
| Fonts | Caveat (handwriting), Nunito (UI) |
