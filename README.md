# thought stick

A private, intimate memory board. Capture moments as polaroids and throw them onto a freeform canvas.

**Stack:** React · Tailwind CSS · Framer Motion · Supabase

---

## Getting started

```bash
# Install dependencies
yarn install

# Start dev server
yarn start
```

App runs at [http://localhost:3000](http://localhost:3000).

## Environment variables

Create a `.env` file at the project root:

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Build

```bash
yarn build
```

## Project structure

```
src/
  components/    UI components (Board, Polaroid, Composer, etc.)
  hooks/         Custom React hooks (useEntries, useAuth, useVoice, etc.)
  lib/           Third-party clients (supabase.js)
public/
checkpoints.md   Build progress tracker
design_guidelines.json  Visual/UX spec
memory/PRD.md    Full product requirements document
```

## Build checkpoints

See [checkpoints.md](./checkpoints.md) for current build status.

## Auth model (important)

See [`memory/AUTH.md`](./memory/AUTH.md) for the complete authentication + identity model (anonymous-first), how it ties into Supabase schema/RLS, and what’s pending (email claim, age gate, account deletion Edge Function).
