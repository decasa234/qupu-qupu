---
title: "feat: Score-First Auth Flow"
type: feat
status: active
date: 2026-04-26
origin: docs/brainstorms/2026-04-26-score-first-auth-requirements.md
---

# feat: Score-First Auth Flow

## Overview

Invert the auth wall on `/videos/:slug`. Anonymous parents see the score slider and tier preview immediately. Auth (Google OAuth + email/password fallback) only triggers when they click save. Child profile capture collapses to a one-field modal that runs post-auth, only when the parent has zero children. Pending score is held in localStorage across the OAuth round-trip and auto-submitted once auth + child are ready.

## Problem Frame

Today, anonymous visitors to `src/pages/VideoDetail.tsx` see a "Login untuk menyimpan progres" panel instead of any score input. Even after login, they hit a second wall ("Pilih profil anak dulu") before the slider renders. Parents drop off before ever seeing a badge unlock — the actual product reward is gated behind two upfront flows.

This plan implements the score-first flow described in the origin requirements doc: score input is public, auth happens at save time inline, and child capture is one field deferred to first save.

## Requirements Trace

- R1. Anonymous users see the full score slider and tier preview (see origin: `docs/brainstorms/2026-04-26-score-first-auth-requirements.md`)
- R2. Submit button visible/clickable for anonymous users; same label as logged-in flow
- R3. Old login-gating panel removed from the score column
- R4. Save click while unauthenticated opens an inline modal; score state preserved
- R5. Auth modal offers Google OAuth and email/password (login + register both)
- R6. Pending score in localStorage at key `qupu_pending_score`, payload `{ videoId, slug, correctAnswers, capturedAt }`
- R7. 30-minute TTL on pending score; stale entries discarded silently
- R8. Authenticated users with no pending score behave as today
- R9. Post-auth, zero-children parents get a one-field child-name modal that auto-submits the pending score
- R10. Post-auth, parents with one or more children use the active child (no modal)
- R11. Child-name modal is the only blocking step between auth and score save
- R12. Already-logged-in parents with a child profile experience zero new friction
- R13. `/login` and `/register` standalone pages remain functional

## Scope Boundaries

- No magic-link, no phone OTP, no SMS — Google + email/password only
- No removal of the `child_id` foreign key on `score_attempts` / `user_badge_unlocks`
- No redesign of `/login` and `/register` standalone pages — they remain reachable via navbar
- No backend "anonymous score token" infrastructure — localStorage handles the round-trip
- No changes to scoring/badge unlock logic in `api/services/member.ts`

### Deferred to Separate Tasks

- Analytics instrumentation for the new funnel (anonymous-input → save-attempt → auth-success → save-complete) — separate observability task
- Multi-account linking UI (e.g., "this email already registered with password — sign in with password to link Google") — future iteration if collision data shows it matters

## Context & Research

### Relevant Code and Patterns

- `src/pages/VideoDetail.tsx` — current score panel, auth gating, child gating, save submit
- `src/store/authStore.ts` — zustand + persist; `login(user, token)` and `setChildren(children)` already cover post-auth state
- `src/pages/Login.tsx` — pattern for "after login, GET `/me/children`, call `setChildren`, route by child count". Reuse this exact sequence inside the auth modal.
- `src/pages/Register.tsx` — pattern for register → `login()` → navigate. Modal version will skip the navigate and instead trigger the pending-score flow.
- `src/components/ChildModal.tsx` + `src/components/ChildForm.tsx` — existing multi-field child create. The new one-field prompt is a separate modal (intentionally lighter), but should reuse the same `POST /api/children` call shape.
- `src/lib/api.ts` — axios instance with 401/403 clearing both `auth_token` and `auth-storage`. Pending-score replay must run **after** auth state is set, otherwise the request goes out without the token and the interceptor wipes everything.
- `api/routes/auth.ts` — existing `issueToken` and `issueRefreshToken` helpers reusable for OAuth path
- `api/services/member.ts` `submitVideoScore` — unchanged; the existing `POST /api/me/video-scores` body `{ childId, videoId, correctAnswers }` is what pending-score replay submits

### Institutional Learnings

- `docs/solutions/` does not exist in this repo at planning time — no prior incidents to honor.

### External References

- `google-auth-library` (Node) — `OAuth2Client.verifyIdToken` for backend ID-token verification
- `@react-oauth/google` — `GoogleOAuthProvider` + `GoogleLogin` / `useGoogleLogin` for the frontend button
- Google Identity Services docs — ID token includes `sub` (Google user ID), `email`, `email_verified`, `name`, `picture`

## Key Technical Decisions

- **Add `google_sub` column + make `password_hash` and `phone` nullable, instead of a separate `user_oauth_identities` table.** Rationale: single-provider for now, YAGNI on multi-provider join table. Lookup order at OAuth time: by `google_sub` first, fall back to `email` only when Google's `email_verified=true`. (see origin: Dependencies section)
- **localStorage key `qupu_pending_score` with TTL.** Rationale: simplest possible cross-redirect handoff; 30 minutes is enough to complete OAuth even with consent screens, but short enough that a stale entry from a previous session won't auto-submit on a different video.
- **Pending-score replay lives inside `VideoDetail.tsx`, not in `App.tsx` or auth store.** Rationale: replay should only fire on the page that owns the score's video. App-level replay risks submitting on the wrong page after navigation.
- **One-field child prompt is a new component, not a variant of `ChildModal`.** Rationale: the existing `ChildModal` uses `ChildForm` (name + age group + avatar color). Squeezing a one-field mode through the same component would force conditional logic into both. A separate `ChildNamePrompt` is clearer and the duplicated child POST call is one line.
- **Auth modal contains both Google button and the existing email/password form, in one component, on one screen.** Rationale: avoid a 2-step "pick method" intro screen. Modal shows: big Google button, small "atau" divider, email/password form below.
- **Email/password modal supports both login and register via a single tab toggle, not a separate route.** Rationale: standalone pages already exist for users who prefer them; the modal is opt-in for parents already mid-flow.

## Open Questions

### Resolved During Planning

- **OAuth library on backend?** `google-auth-library` (`OAuth2Client.verifyIdToken`). Standard, maintained by Google.
- **OAuth library on frontend?** `@react-oauth/google`. Provides `GoogleOAuthProvider` + a styled `GoogleLogin` component, well-maintained, no manual script loading.
- **Schema migration for OAuth user?** ALTER `users.password_hash` to nullable, ALTER `users.phone` to nullable, ADD `users.google_sub VARCHAR(255) UNIQUE`. Confirmed against `db/schema.sql`.
- **Is `children.age_group_id` nullable?** Yes — already nullable in schema. One-field child create works with no migration.
- **Does `POST /api/children` accept name-only?** Yes — `createSchema` in `api/routes/children.ts` requires only `name`; `ageGroupId` and `avatarColor` are optional.
- **Where does pending-score replay run?** Inside `src/pages/VideoDetail.tsx` via a `useEffect` that watches `(isAuthenticated, activeChildId, pendingScore.videoId === video.id)`. Guarded with a "submitted" flag in the same component to prevent double-submit on remount.
- **Does the auth modal break other auth-state-dependent UI?** No — `Navbar`, `Layout`, etc. read `useAuthStore()` reactively. Allowing anonymous score input on `VideoDetail` does not change any other component's behavior.

### Deferred to Implementation

- Exact copy strings for the auth modal eyebrow, headline, divider ("atau" vs "or"), and Google button label — pick during implementation to match existing AuthCard tone.
- Whether to render the auth modal via React portal or in-tree inside `VideoDetail.tsx` — implementer's call after seeing how the modal interacts with the existing `ChildModal` z-index stack.
- Whether to migrate via a new `db/migrations/0001_oauth_support.sql` file or simply append to `db/schema.sql` — the project's bootstrap is manual (per CLAUDE.md). Implementer chooses; this plan recommends a new migration file for clarity but updating `db/schema.sql` to match for fresh installs.
- Refresh-token storage / rotation strategy for OAuth users — current code issues a refresh token but does not actually use it anywhere visible. Out of scope to fix here; just match the existing email/password contract.
- Whether `VITE_GOOGLE_CLIENT_ID` and backend `GOOGLE_CLIENT_ID` should be the same value or different — they should be the same (single Web OAuth client), but verify during Google Cloud Console setup.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
[ Anonymous on /videos/:slug ]
        |
        | input score (slider always visible)
        v
[ See tier preview, click "Simpan skor X/N" ]
        |
        | save pending score to localStorage:
        |   { videoId, slug, correctAnswers, capturedAt }
        v
[ AuthModal opens ]
   |                 |
   | Google button   | Email/password form (login or register tab)
   v                 v
[ POST /auth/google ID token]   [ POST /auth/login or /auth/register ]
        |                              |
        v                              v
        +------ JWT issued -----+
                |
                v
        [ authStore.login(user, token) + GET /me/children + setChildren ]
                |
        +-------+-------+
        |               |
   children == 0    children >= 1
        |               |
        v               v
[ ChildNamePrompt    [ activeChild already set ]
  one-field modal ]         |
        |                   |
   POST /api/children        |
        |                   |
        v                   v
        +------- replay effect fires -------+
                            |
                            v
              [ POST /me/video-scores w/ pending score ]
                            |
                            v
              [ clear localStorage, render badge celebration ]
```

## Implementation Units

- [ ] **Unit 1: Schema migration for OAuth-compatible users**

**Goal:** Allow `users` rows that have no password and no phone, and that can be looked up by Google subject ID.

**Requirements:** R5 (OAuth path needs a user row); Dependencies in origin doc

**Dependencies:** None

**Files:**
- Create: `db/migrations/0001_oauth_support.sql`
- Modify: `db/schema.sql` (mirror the same changes so fresh bootstraps match)

**Approach:**
- `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`
- `ALTER TABLE users ALTER COLUMN phone DROP NOT NULL`
- `ALTER TABLE users ADD COLUMN google_sub VARCHAR(255) UNIQUE`
- Add `CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub)` for lookup
- Update `db/schema.sql` to reflect the same nullable columns and new column so a fresh `psql -f schema.sql` produces the same state

**Patterns to follow:**
- Existing `db/schema.sql` style — `IF NOT EXISTS` guards, snake_case columns, `VARCHAR` lengths consistent with `email`

**Test scenarios:**
- Test expectation: none — pure schema migration. Verification is via successful apply against an empty DB and against a DB that already has data; no test runner is configured in this repo (per CLAUDE.md).

**Verification:**
- `psql $DATABASE_URL -f db/migrations/0001_oauth_support.sql` applies cleanly on both an empty DB and a DB with existing email/password users
- `\d users` shows `password_hash` and `phone` as nullable, plus a new `google_sub UNIQUE` column
- Existing `INSERT INTO users` calls in `api/routes/auth.ts` still succeed (phone and password still provided in that path)

---

- [ ] **Unit 2: Backend `POST /api/auth/google` endpoint**

**Goal:** Accept a Google ID token from the frontend, verify it, find or create the matching user, and return the same `{ user, token, refreshToken }` payload that `/auth/login` returns.

**Requirements:** R5

**Dependencies:** Unit 1 (needs `google_sub` column and nullable `password_hash` / `phone`)

**Files:**
- Modify: `api/routes/auth.ts` — add `POST /google` handler
- Modify: `package.json` — add `google-auth-library` dependency
- Create: `api/services/oauth.ts` — `verifyGoogleIdToken(idToken): Promise<{ sub, email, emailVerified, name }>` and `findOrCreateGoogleUser(claims): Promise<User>`

**Approach:**
- Reuse existing `issueToken` and `issueRefreshToken` from `api/routes/auth.ts`
- Joi schema for body: `{ idToken: Joi.string().required() }`
- `verifyGoogleIdToken` uses `OAuth2Client(GOOGLE_CLIENT_ID).verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })`
- `findOrCreateGoogleUser`:
  1. Look up by `google_sub`. If found, return user.
  2. Else, if `email_verified === true`, look up by `email`. If found, UPDATE that row to set `google_sub` and return.
  3. Else, INSERT new row: `email`, `name`, `google_sub`, `role = 'parent'`, `password_hash = NULL`, `phone = NULL`, `is_verified = TRUE`.
- Reject when `email_verified !== true` and the email already exists with a different account, with a 409 and explicit error message.
- Add `GOOGLE_CLIENT_ID` to required env vars; document in `.env.example`.

**Patterns to follow:**
- Joi validation + thin route handler pattern from `api/routes/auth.ts`
- `queryOne` / `withTransaction` helpers from `api/db.ts`
- Error response shape: `{ success: false, error: string }`

**Test scenarios:**
- Happy path: valid ID token, new Google user → new `users` row created with `google_sub`, JWT returned matching `/auth/login` shape
- Happy path: valid ID token, existing Google user (already has `google_sub`) → no row created, same user returned, JWT returned
- Happy path: valid ID token, existing email-only user, `email_verified=true` → `google_sub` is set on the existing row, JWT returned
- Edge case: valid ID token, `email_verified=false`, no matching `google_sub` → 401 with message about needing verified email
- Error path: malformed/expired ID token → `verifyIdToken` throws → 401 with generic "Invalid Google credential" (do not leak verifier internals)
- Error path: missing `idToken` body field → 400 from Joi
- Error path: `GOOGLE_CLIENT_ID` env var unset on the server → fail-fast at boot, not a per-request 500
- Integration scenario: a user created via this endpoint can then log in via `POST /auth/login` only if they later set a password (i.e., login should fail with the existing password compare logic when `password_hash IS NULL`)

**Verification:**
- Curl a real (or test) Google ID token against `/api/auth/google` and receive a JWT identical in shape to `/auth/login`
- Subsequent `GET /api/users/me` with that JWT returns the new user
- Existing `/auth/login` with `password_hash IS NULL` rejects cleanly (no crash from `bcrypt.compare(value.password, null)`)

---

- [ ] **Unit 3: Login route hardening for OAuth-only accounts**

**Goal:** Prevent crashes when an OAuth-only user (with `password_hash IS NULL`) attempts password login.

**Requirements:** R5 (correctness), R13 (existing pages must keep working)

**Dependencies:** Unit 1

**Files:**
- Modify: `api/routes/auth.ts` — `POST /login` handler

**Approach:**
- After fetching the user row, check `if (!user.password_hash) return 401 'Use Google to sign in'`
- Keep the generic "Invalid email or password" wording for unknown email + wrong password to avoid account enumeration; only switch wording when the email exists but has no password hash.

**Patterns to follow:**
- Existing handler structure in `api/routes/auth.ts`

**Test scenarios:**
- Happy path: existing email/password user logs in → unchanged behavior
- Edge case: email exists but `password_hash IS NULL` → 401 with "Use Google to sign in" or equivalent (not a 500 from bcrypt comparing to null)
- Edge case: email does not exist → 401 with generic invalid-credentials message

**Verification:**
- Manual test via the standalone `/login` page against an OAuth-only user shows a friendly error, not a crash

---

- [ ] **Unit 4: Pending-score helper module**

**Goal:** Centralize localStorage read/write/clear for the cross-redirect score handoff with TTL enforcement.

**Requirements:** R6, R7

**Dependencies:** None

**Files:**
- Create: `src/lib/pendingScore.ts`

**Approach:**
- Export `savePendingScore({ videoId, slug, correctAnswers })` — writes JSON to `qupu_pending_score`, stamping `capturedAt = Date.now()`
- Export `readPendingScore(): PendingScore | null` — parses JSON, returns null if missing, malformed, or older than `PENDING_SCORE_TTL_MS = 30 * 60 * 1000`. Always treat parse errors as "no pending score"; never throw at the call site.
- Export `clearPendingScore()` — `localStorage.removeItem('qupu_pending_score')`
- Define and export the `PendingScore` TS type next to the helpers

**Patterns to follow:**
- Module style of `src/lib/api.ts` and `src/lib/youtube.ts` — small, focused, no React imports

**Test scenarios:**
- Happy path: write → read → returns same shape with `capturedAt` populated
- Edge case: read on empty localStorage → returns null
- Edge case: read after `capturedAt` is older than 30 minutes → returns null AND removes the stale key
- Edge case: read on malformed JSON in the key → returns null AND removes the corrupt key (do not throw)
- Edge case: write twice in succession → the second write overwrites the first (no array of pending scores)

**Verification:**
- The replay site (Unit 8) can reliably detect a fresh score and ignore a stale one without try/catch at the call site

---

- [ ] **Unit 5: Frontend Google OAuth provider wiring**

**Goal:** Make `GoogleLogin` available to the auth modal without forcing an extra script tag in `index.html`.

**Requirements:** R5

**Dependencies:** None (parallelizable with backend work)

**Files:**
- Modify: `package.json` — add `@react-oauth/google` dependency
- Modify: `src/main.tsx` — wrap `<App />` in `<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>`
- Modify: `.env.example` — add `VITE_GOOGLE_CLIENT_ID`
- Modify: `src/vite-env.d.ts` — declare `VITE_GOOGLE_CLIENT_ID` on `ImportMetaEnv`

**Approach:**
- The provider is fine to render even when `clientId` is undefined in dev — the `GoogleLogin` component will visibly fail. Document this in `.env.example` so the dev knows to populate it.
- No backend dep on this unit; safe to land before or after Unit 2.

**Patterns to follow:**
- Existing `src/main.tsx` shape — keep the BrowserRouter and StrictMode wrapping that already exist (verify by reading the file before editing)

**Test scenarios:**
- Test expectation: none — config wiring only. Verified by Unit 6 mounting the Google button without errors.

**Verification:**
- `npm run dev` starts cleanly with `VITE_GOOGLE_CLIENT_ID` set; the auth modal in Unit 6 renders the Google button without console errors

---

- [ ] **Unit 6: `AuthModal` component**

**Goal:** A single inline modal that gives the parent two parallel auth paths — Google and email/password — with a tab toggle for login vs register inside the email/password section. Returns control to the caller (with the parent now authenticated and `setChildren` populated) so the score-flow can continue.

**Requirements:** R4, R5, R8

**Dependencies:** Unit 2 (backend `/auth/google`), Unit 5 (provider)

**Files:**
- Create: `src/components/AuthModal.tsx`
- Possibly modify: `src/components/AuthCard.tsx` — only if a layout style needs to be exposed for modal reuse; otherwise leave untouched

**Approach:**
- Props: `{ open: boolean, onClose: () => void, onAuthenticated: () => void }`
- Layout: full-screen overlay with a centered card (mirror `ChildModal` shell)
- Top: Google button via `GoogleLogin` from `@react-oauth/google`. On success, POST `/auth/google` with `{ idToken: credential }`, then call the same post-auth sequence as `Login.tsx`: `useAuthStore().login(user, token)`, `GET /me/children`, `setChildren(children)`, then `onAuthenticated()`.
- Middle: "atau" divider
- Bottom: a `useState`-driven tab toggle (Login / Register). Login form mirrors `src/pages/Login.tsx` form. Register form mirrors `src/pages/Register.tsx` form (name, email, phone, password). On success: same post-auth sequence above, then `onAuthenticated()`.
- The `onAuthenticated` callback is what `VideoDetail.tsx` uses to fire the post-auth orchestration (Unit 7 + 8). The modal does not navigate.
- Modal must NOT render any of its content when `open === false` (mirror `ChildModal.tsx`).

**Patterns to follow:**
- `src/components/ChildModal.tsx` for the shell/overlay/close button styling
- `src/pages/Login.tsx` for the post-auth `setChildren` sequence
- `src/components/PillField.tsx` for input styling
- `src/components/AuthCard.tsx` typography and buttons inside the card body (without using `AuthCard` itself, to avoid the page-level mascot)

**Test scenarios:**
- Happy path: Google success → POST `/auth/google` → store hydrated → `onAuthenticated` fires → modal stays open or closes per spec; no navigation
- Happy path: email/password login tab, valid credentials → store hydrated → `onAuthenticated` fires
- Happy path: email/password register tab, valid form → store hydrated → `onAuthenticated` fires
- Edge case: Google rejected (user cancels Google consent) → modal stays open, no error toast, no state mutation
- Error path: Google ID token rejected by backend (Unit 2 returns 401) → inline error rendered in modal
- Error path: email/password login with wrong password → existing 401 error surfaced inline
- Error path: register with already-used email → existing 409 error surfaced inline
- Edge case: `open` toggled false → modal unmounts cleanly (no late state writes)
- Edge case: backdrop click / ESC → calls `onClose` (mirror existing modal behavior in `ChildModal`)
- Integration scenario: after `onAuthenticated`, `useAuthStore().children` is populated via the same `GET /me/children` call that `Login.tsx` uses — confirming the auth modal does not silently skip child hydration

**Verification:**
- Mounting the modal manually on a test page, all three auth paths complete and the auth store reflects the new user + children list

---

- [ ] **Unit 7: `ChildNamePrompt` modal (post-auth, zero-children only)**

**Goal:** A one-field modal that asks for the child's name and creates the child via the existing `POST /api/children`, then signals completion so the score-flow can continue.

**Requirements:** R9, R10, R11

**Dependencies:** None on backend (existing `/api/children` endpoint already supports name-only)

**Files:**
- Create: `src/components/ChildNamePrompt.tsx`

**Approach:**
- Props: `{ open: boolean, onCreated: (child: Child) => void, onClose?: () => void }`
- Single text field, "Beri nama profil anak" eyebrow, big primary action button
- On submit: POST `/api/children` with `{ name }` only; on success, call `useAuthStore().addChild(child)` (which also sets `activeChildId` if it was null), then `onCreated(child)`
- Render only when `open === true`; otherwise render null
- Should NOT offer a close button by default in the score-flow path (it is the only blocker between auth and save). `onClose` is optional for callers that want a dismissible variant.

**Patterns to follow:**
- `src/components/ChildModal.tsx` shell
- `src/components/ChildForm.tsx` for the create call shape (POST body, error handling, response mapping)
- `src/store/authStore.ts` `addChild` reducer

**Test scenarios:**
- Happy path: empty children list, submit "Andi" → POST `/api/children` with `{ name: "Andi" }` → `addChild` called → `activeChildId` becomes the new child's id → `onCreated` fires
- Edge case: empty input + submit → button disabled or inline validation; no request fired
- Error path: backend 400 on duplicate-or-invalid name → inline error rendered, modal stays open
- Edge case: `open` flips to false mid-submit → suppress the response handler (avoid setState after unmount)
- Integration scenario: after `onCreated`, the auth store has a populated `activeChildId`, which is the precondition for Unit 8's replay effect

**Verification:**
- After auth, a parent with no children sees this modal; submitting it leaves the store with one child and `activeChildId` set, ready for score replay

---

- [ ] **Unit 8: `VideoDetail.tsx` refactor for score-first flow + pending-score replay**

**Goal:** Make the score panel anonymous-friendly, orchestrate the `AuthModal` → `ChildNamePrompt` → save sequence, and replay any pending score after auth + child are ready.

**Requirements:** R1, R2, R3, R4, R6, R7, R8, R9, R10, R11, R12

**Dependencies:** Units 4, 6, 7 (and indirectly 2)

**Files:**
- Modify: `src/pages/VideoDetail.tsx`
- Possibly modify: `src/components/Slider.tsx` — only if it currently disables interaction based on auth (verify; do not modify if it doesn't)

**Approach:**
- Render the slider, tier preview, and submit button regardless of auth state. Remove the `!isAuthenticated` block that gates the score column.
- Keep the existing logged-in-no-child branch but only after auth — i.e., do not render the "Pilih profil anak dulu" panel for anonymous users (it never reaches them; auth modal handles them first).
- On submit click:
  - If `isAuthenticated && activeChild`: existing behavior — POST `/me/video-scores`
  - Else: `savePendingScore({ videoId: video.id, slug, correctAnswers: score })`, then open `AuthModal`
- Add a `useEffect` that runs whenever `(isAuthenticated, activeChildId, video?.id)` change. Inside:
  - Read pending score; if absent or `videoId !== video.id`, return.
  - If `!isAuthenticated`, return.
  - If `isAuthenticated && !activeChildId`, open `ChildNamePrompt` (do not open `AuthModal`).
  - If `isAuthenticated && activeChildId`, fire the existing submit logic with the pending score, then `clearPendingScore()`.
- Use a `useRef<boolean>` "submitted" guard so a remount or store update doesn't double-submit the same pending score.
- Submit button label is unchanged for both anonymous and authed users — disclosure of the auth step happens in the modal that opens, not in the button text.

**Patterns to follow:**
- Existing state machine in `src/pages/VideoDetail.tsx` — keep `score`, `saving`, `submitError`, `result` exactly as is for the authed flow
- `src/pages/Login.tsx` post-auth `setChildren` sequence — it is what `AuthModal.onAuthenticated` will already have run; this page just reads `activeChildId` afterward

**Test scenarios:**
- Happy path: anonymous user inputs score, clicks save → pending score persisted, AuthModal opens
- Happy path: anonymous → Google auth → has children → effect fires → score submits → result panel renders
- Happy path: anonymous → Google auth → zero children → ChildNamePrompt opens → child created → effect fires → score submits → result panel renders
- Happy path: anonymous → email/password register → zero children → ChildNamePrompt → score submits
- Happy path: already-logged-in parent with active child → submit click → existing direct save path → no modal opens
- Edge case: anonymous user inputs score, closes the AuthModal without authenticating → pending score remains for the TTL window; reopening save re-opens the modal
- Edge case: pending score exists for a different video slug than the current page → effect ignores it; the parent can interact with the current page normally
- Edge case: pending score is older than 30 min on page load → `readPendingScore` returns null and silently clears; no auto-submit
- Edge case: page remount while replay is in flight → "submitted" ref prevents double-POST
- Error path: pending score replay POST returns 400 (e.g., child was deleted between auth and replay) → existing `submitError` rendering in the panel; pending score is cleared so the user can re-input cleanly without an infinite retry loop
- Error path: replay POST returns 401 (token wiped by interceptor mid-flow) → effect bails; user sees the auth modal again on next save click
- Integration scenario: badge tier preview computation (`previewTier` memo) runs identically for anonymous and authed users — visual proof that R1's "full preview" is honored
- Integration scenario: after a successful replay, navigating to `/dashboard` shows the new score in recent attempts (existing `/api/me/progress` data flow is untouched)

**Verification:**
- Manual run-through in `npm run dev`: incognito → /videos/:slug → input score → save → Google → name child → see badge celebration. Observed taps from landing to badge: ≤4.
- Existing logged-in flow: input score → save → see badge celebration. Observed taps: 1.
- Refresh mid-OAuth: pending score survives, replay still fires.
- Wait 31 minutes with a pending score in localStorage, refresh: pending score is silently dropped on next read.

---

- [ ] **Unit 9: Env vars and bootstrap docs**

**Goal:** Make the new env vars discoverable and the migration step documented.

**Requirements:** R5 (operational); supports R12 by avoiding accidental dev breakage

**Dependencies:** Units 1, 2, 5

**Files:**
- Modify: `.env.example` — add `GOOGLE_CLIENT_ID` (server) and `VITE_GOOGLE_CLIENT_ID` (client)
- Modify: `CLAUDE.md` — append a one-line note that bootstrap now also requires `db/migrations/0001_oauth_support.sql` after `db/schema.sql` for existing DBs (fresh installs are covered by the updated `db/schema.sql`)

**Approach:**
- No code changes. Documentation only.
- Keep notes minimal — the project's CLAUDE.md is already terse.

**Patterns to follow:**
- Existing `.env.example` and CLAUDE.md tone

**Test scenarios:**
- Test expectation: none — docs and env scaffolding only.

**Verification:**
- A fresh clone + `cp .env.example .env` + `npm run dev` exposes the new env vars as expected to fill in
- A new contributor reading CLAUDE.md sees the migration step

## System-Wide Impact

- **Interaction graph:** New `AuthModal` and `ChildNamePrompt` mount inside `VideoDetail.tsx`. They both feed into existing `useAuthStore` reducers (`login`, `setChildren`, `addChild`). No middleware or callbacks changed.
- **Error propagation:** The 401/403 axios interceptor in `src/lib/api.ts` still wipes tokens on auth errors. The replay effect must run AFTER `setChildren` resolves; otherwise the request goes out token-less and the interceptor wipes the freshly-set state. Unit 8 sequences this correctly via the `(isAuthenticated, activeChildId)` dependency array.
- **State lifecycle risks:** Pending score in localStorage survives tab close, OAuth redirect, and full reload. Risk: stale entry from a long-abandoned session auto-submits on a different device or after weeks. Mitigated by the 30-minute TTL and slug match check.
- **API surface parity:** No change to `/api/me/video-scores`, `/api/me/children`, or `/api/me/progress`. New `/api/auth/google` follows the exact response shape of `/api/auth/login`.
- **Integration coverage:** The path from OAuth → `setChildren` → replay submit crosses three layers (network, store, page). Unit 8's integration scenarios cover this end-to-end manually since no test runner is configured.
- **Unchanged invariants:** `score_attempts` and `user_badge_unlocks` schemas, `submitVideoScore` business logic in `api/services/member.ts`, badge tier matching rules, `/login` and `/register` standalone pages, navbar auth-gated UI all remain exactly as today.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| OAuth user with email collision against an existing email/password account | Match by `google_sub` first; only fall back to email when `email_verified=true`. If both exist with same email but different `google_sub`/no `google_sub`, link them. Document edge case in code comments. |
| `bcrypt.compare(password, null)` crash when an OAuth-only user tries password login | Unit 3 explicitly guards against this. |
| Replay double-submit on remount | `useRef` "submitted" flag inside the replay effect; clear pending score immediately after a successful submit. |
| Stale localStorage pending score replays on the wrong account | TTL of 30 minutes + slug match check + auto-clear on stale read. Worst case: a 29-minute-old score on the same video slug for the same parent — that is the intended replay. |
| OAuth in dev with no `VITE_GOOGLE_CLIENT_ID` set causes confusing failures | `.env.example` documents the new var; the modal still allows email/password fallback so dev is not blocked. |
| Schema migration applied out of order (e.g., before existing data is backed up) | Project's bootstrap is manual per CLAUDE.md; document the migration step in CLAUDE.md (Unit 9). Migration is additive and reversible (`DROP NOT NULL`, `ADD COLUMN`), so risk is low. |
| Google Identity Services consent screen latency makes the 30-min TTL feel tight on slow connections | 30 min is far longer than even a slow consent flow (~1-2 min). No change needed. |

## Documentation / Operational Notes

- New env vars: `GOOGLE_CLIENT_ID` (server), `VITE_GOOGLE_CLIENT_ID` (client) — same value, single Web OAuth client in Google Cloud Console
- Bootstrap step added: apply `db/migrations/0001_oauth_support.sql` once on existing DBs; fresh installs from updated `db/schema.sql` need no extra step
- No new monitoring; existing 4xx/5xx logs from `api/routes/auth.ts` cover the new endpoint
- Rollout: feature is purely additive on backend (new endpoint, additive schema). Frontend score-first flow is the user-visible change. No flag needed; the existing `/login` and `/register` pages remain as a fallback if anything goes wrong with the modal.

## Sources & References

- Origin document: `docs/brainstorms/2026-04-26-score-first-auth-requirements.md`
- Related code: `src/pages/VideoDetail.tsx`, `src/store/authStore.ts`, `src/pages/Login.tsx`, `src/pages/Register.tsx`, `src/components/ChildModal.tsx`, `api/routes/auth.ts`, `api/routes/children.ts`, `api/services/member.ts`, `db/schema.sql`
- External docs: `@react-oauth/google` (npm), `google-auth-library` (npm), Google Identity Services overview
