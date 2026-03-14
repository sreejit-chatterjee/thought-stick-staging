# Security Audit — Reference & Templates

## Final Report Template

Write findings to `memory/SECURITY_AUDIT.md` using this structure:

```markdown
# Security Audit Report — thought-stick
**Date:** [date]
**Auditors:** Cipher (AppSec), Red (Red Team), Sage (Supabase/DB)
**Codebase version:** [git commit hash]

---

## Executive Summary

[2–3 paragraph summary: overall security posture, most critical risks, key themes across all three auditors]

**Overall Risk Rating:** [Critical / High / Medium / Low]

---

## Consolidated Findings

| # | Title | Severity | Category | Flagged By | Location |
|---|---|---|---|---|---|
| 1 | ... | Critical | Auth | Cipher + Red | src/hooks/... |

---

## Critical Issues

### [Issue Title]
**Severity:** Critical
**Category:** [Auth / XSS / Injection / Privacy / RLS / Upload / Config]
**Flagged by:** [Cipher] [Red] [Sage] — (all three = independent confirmation)
**Location:** `path/to/file.js` (line N if applicable)

**Description:**
What the issue is and why it's dangerous.

**Attack scenario:**
Step-by-step: an attacker does X → gains Y → impact is Z.

**Fix:**
Specific code change required. Include code snippet if appropriate.

---

## High Issues
[same format]

## Medium Issues
[same format]

## Low / Informational
[same format]

---

## Supabase RLS — Recommended Policies

### boards table
```sql
-- SELECT
CREATE POLICY "Users can view own boards"
  ON boards FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can insert own boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update own boards"
  ON boards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete own boards"
  ON boards FOR DELETE
  USING (auth.uid() = user_id);
```

### entries table
[same four policies for entries]

### Storage bucket: entry-images
```sql
-- SELECT (download)
CREATE POLICY "Users can view own images"
  ON storage.objects FOR SELECT
  USING (auth.uid()::text = (storage.foldername(name))[1]);

-- INSERT (upload)
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.uid()::text = (storage.foldername(name))[1]
    AND octet_length(owner) <= 10485760  -- 10MB
  );

-- DELETE
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Prioritised Action Plan

### Immediate (fix before any public launch)
1. **[Title]** — `file.js` — [one-line description]
2. ...

### Short-term (fix within first sprint after launch)
1. ...

### Medium-term (V1.1 / hardening sprint)
1. ...

### Long-term / V2 (before shared boards or multi-user)
1. ...

---

## Compliance Checklist

| Requirement | Status | Notes |
|---|---|---|
| Age gate (COPPA 13+) | ⚠️ Weak | Checkbox only — no real enforcement |
| PII minimisation | ✅ / ❌ | ... |
| Data deletion (right to erasure) | ✅ / ❌ | ... |
| Privacy policy | ❌ Not yet built | Planned at /privacy |
| Anonymous auth (no PII by default) | ✅ | Supabase anonymous UID only |
| Third-party data sharing | ✅ None | No analytics in V1 |
| Storage encryption at rest | ✅ | Supabase default |

---

## Appendix: Raw Agent Reports

[Paste each agent's full raw findings here for traceability]

### Cipher's Raw Report
...

### Red's Raw Report
...

### Sage's Raw Report
...
```

---

## Audit Checklist (for each agent to use internally)

### Frontend (src/)

- [ ] No `dangerouslySetInnerHTML` with unsanitised user content
- [ ] No `eval()`, `Function()`, or `innerHTML` with dynamic data
- [ ] All text rendered via React (auto-escaped) — confirm no raw DOM manipulation
- [ ] localStorage: what keys are stored? Is any sensitive data (tokens, keys) stored in plain text?
- [ ] Web Speech API: is transcript ever sent to a third party or backend?
- [ ] Environment variables: only `REACT_APP_*` prefixed vars in frontend bundle — confirm no secret keys
- [ ] File upload: MIME type validation before Supabase upload
- [ ] File upload: file size enforced client-side (belt) and server/RLS side (braces)
- [ ] Image paths: constructed predictably? Can path traversal occur?
- [ ] Microphone permission: only requested on user action, not on mount

### Backend — Architecture note

**There is no Python/FastAPI backend.** Architecture is React → Supabase directly.
The only server-side code is a single Supabase Edge Function (`delete-account`).
`backend/server.py` is legacy scaffold being deleted — do not audit as production code.
Flag any frontend `fetch()` calls to `localhost` or `REACT_APP_BACKEND_URL` as cleanup items.

### Edge Function (supabase/functions/delete-account)

- [ ] Caller's JWT is verified with `supabase.auth.getUser()` before any privileged operation
- [ ] `service_role` key, if and when needed, sourced from Deno environment variable (never hardcoded, never in frontend)
- [ ] CORS headers restrict allowed origins to the app domain (not `*`)
- [ ] Function confirms the user being deleted matches the authenticated caller (no IDOR)
- [ ] Storage file listing scoped to `{user_id}/` before deletion
- [ ] Auth user deletion (`adminClient.auth.admin.deleteUser`) only fires after storage cleanup succeeds
- [ ] Error responses do not leak internal details (Supabase error messages sanitised)
- [ ] No other Edge Functions exist that use `service_role` without JWT verification

### Supabase / Data Layer

- [ ] RLS enabled on all tables (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] All four CRUD operations have policies (SELECT, INSERT, UPDATE, DELETE)
- [ ] `WITH CHECK` clauses on INSERT/UPDATE (not just `USING`)
- [ ] Storage bucket is not public (not `public = true` in bucket config)
- [ ] Storage RLS uses `storage.foldername(name)[1]` to scope to user's folder
- [ ] Anonymous session: what happens after 1 hour? Is `onAuthStateChange` handled?
- [ ] Account upgrade: `updateUser({ email })` — does this preserve `user_id` in all tables?
- [ ] Delete account: does it cascade to `entries`, `boards`, and `storage.objects`?
- [ ] Anon key: publicly safe (by design), but confirm it cannot be used to bypass RLS
- [ ] `image_path` stored in DB: is it validated server-side before storage lookup?

### Dependencies

- [ ] Run `npm audit` — note any high/critical CVEs
- [ ] Pinned versions vs. ranges (`^` prefix risks)
- [ ] Known vulnerable packages: check framer-motion, react, any auth libraries

### public/index.html

- [ ] `Content-Security-Policy` meta tag present?
- [ ] `X-Frame-Options` / `X-Content-Type-Options` headers (set at hosting layer or meta)
- [ ] No inline scripts with user-controlled content
- [ ] External script sources (CDN fonts, etc.) — integrity hashes?

---

## Severity Definitions

| Level | CVSS Range | Meaning |
|---|---|---|
| Critical | 9.0–10.0 | Direct data breach, full account takeover, RLS bypass |
| High | 7.0–8.9 | Significant data exposure, auth weakness, stored XSS |
| Medium | 4.0–6.9 | Limited impact, requires user interaction or specific conditions |
| Low | 0.1–3.9 | Hardening, defence-in-depth, best practice gaps |
| Info | N/A | Observations, architecture notes, compliance gaps |

---

## Key Files to Read During Audit

```
src/App.js
src/index.js
src/hooks/useNotes.js (or useEntries.js once migrated)
src/hooks/useVoice.js
src/hooks/useAuth.js (once created)
src/lib/supabase.js             ← Supabase client init; check for service_role key
src/components/Board.jsx
src/components/NoteComposer.jsx
src/components/ExpandedNoteCard.jsx
src/hooks/useAuth.js
src/hooks/useEntries.js
src/lib/supabase.js
supabase/functions/delete-account/index.ts  ← Edge Function; most security-critical file (when implemented)
public/index.html
package.json
.env                            ← must contain only REACT_APP_SUPABASE_URL + REACT_APP_SUPABASE_ANON_KEY
memory/PRD.md
checkpoints.md                  ← read to understand what has/hasn't been built yet

NOT production code (being deleted):
backend/server.py               ← legacy MongoDB scaffold
backend/requirements.txt
tests/
test_reports/
```
