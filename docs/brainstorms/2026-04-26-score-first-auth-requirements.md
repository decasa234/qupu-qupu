---
date: 2026-04-26
topic: score-first-auth
---

# Score-First Authentication Flow

## Problem Frame

Parents drop off before completing signup. Current `/videos/:slug` page hits two walls before any save:

1. **Auth wall** — anonymous users see a "Login untuk menyimpan progres" panel with no score input visible. Score slider, badge tier preview, and submit button are all gated behind login/register.
2. **Child profile wall** — even after login, parents must create a child profile before the score input renders.

Parents do not get to see the badge unlock reward (the actual product magic) until they have committed to two upfront flows. Result: high abandonment before any value moment.

The change inverts the order: let parents play with the score and see the tier preview as anonymous users, then ask for auth and child name only at the moment of save.

## Requirements

**Anonymous score-first experience**
- R1. On `/videos/:slug`, anonymous users see the full score slider and the badge tier preview ("Skor 8/10 → Tier 2 Bintang Perak akan terbuka"), identical to the logged-in preview, regardless of auth state.
- R2. The submit button on the score panel is visible and clickable for anonymous users. Its label communicates the next step (e.g., "Simpan skor 8/10" — same wording as logged-in flow; the auth step is disclosed in the modal that opens after click, not in the button itself).
- R3. The current "Login untuk menyimpan progres" gating panel is removed from the score column; no auth wall renders before score input.

**Auth at save moment**
- R4. Clicking submit while unauthenticated opens an inline auth modal on the same page, without navigating away from the video. The score state (correctAnswers, slider position) must remain intact when the modal closes or the user returns.
- R5. The auth modal offers two paths: Google OAuth (one-tap / sign-in button) and email + password (login or register, current backend flow). Both paths must land the user back on `/videos/:slug` with the same pending score.
- R6. Pending score is persisted to localStorage (key: `qupu_pending_score`, payload: `{ videoId, slug, correctAnswers, capturedAt }`) before any redirect that may occur during OAuth. After successful auth, the frontend reads the pending score, submits it, then clears the key.
- R7. Pending score has a 30-minute TTL — anything older is discarded silently on read so a stale localStorage entry does not auto-submit the wrong score next visit.
- R8. Authenticated users with no pending score behavior is unchanged.

**Child profile capture (post-save)**
- R9. After successful auth, if the parent has zero children, a one-field modal prompts for the child's name ("Beri nama profil anak"). Submitting this modal creates the child, sets it active, then automatically submits the pending score.
- R10. After successful auth, if the parent has one or more children, the active child is used (existing behavior). No extra modal.
- R11. The child-name modal is the only blocking step between auth and score save; age group, avatar color, and other child fields can be edited later in dashboard. Defaults are applied server-side or client-side.

**Returning user experience**
- R12. Already-logged-in parents with a child profile experience zero new friction — score input, submit, and save behave as today.
- R13. Existing `/login` and `/register` standalone pages remain functional (entry from navbar, deep links). The score-flow modal is an additional entry point, not a replacement.

## Success Criteria

- A parent landing on `/videos/:slug` for the first time can input a score, see the badge tier preview, click save, sign in with Google, and see the unlocked badge — all without leaving the video page (modulo the OAuth redirect itself).
- The number of taps from "land on video page" to "see unlocked badge celebration" drops from 7+ (login → register → fill form → confirm → add child → fill form → input score → submit) to ≤4 (input score → click save → Google auth → child name → done).
- Funnel metric: ratio of (anonymous score-input events) → (saved score events) is observable and trackable. (Concrete instrumentation chosen during planning.)
- No regression for already-logged-in parents — they hit save in one click.
- A pending score in localStorage cannot be submitted to the wrong account or wrong video; if its TTL expires or video slug mismatches the current page, it is discarded silently.

## Scope Boundaries

- **Out of scope: magic-link / passwordless email auth.** Considered, deferred — adds email-service infrastructure cost.
- **Out of scope: phone/WhatsApp OTP auth.** Indonesian-friendly but adds SMS or WhatsApp Business API cost. Reconsider if Google + email/password do not move the needle.
- **Out of scope: removing the child concept entirely.** Multi-child households are a real use case; we keep the model but defer creation to one field, post-save.
- **Out of scope: redesigning `/login` and `/register` standalone pages.** They keep working for direct navigation. Only the in-flow auth surface (the modal) is new.
- **Out of scope: backend "anonymous score token" infrastructure.** localStorage is sufficient for the cross-redirect handoff.
- **Out of scope: changes to `score_attempts`, `user_badge_unlocks`, or scoring rules.** All scoring/badge logic in `api/services/member.ts` is unchanged.

## Key Decisions

- **Score-first, auth-at-save**: parents see and interact with the badge tier preview before paying any auth friction. Rationale: the tier preview is the motivation; gating it removes the very thing that would make signup feel worth it.
- **Add Google OAuth alongside email/password**: cuts the biggest single drop-off (typing email + creating password). Email/password kept as fallback so we don't lock out users who refuse OAuth.
- **localStorage for pending score, not a backend token table**: no new schema, survives OAuth round-trip, sufficient for a single-tab single-device flow. Backend token would be over-engineering for this.
- **Defer child profile to a one-field post-save modal, not "skip child concept"**: keeps the existing `child_id` foreign key on `score_attempts` and `user_badge_unlocks` intact (zero schema change), while still removing the perceived second wall.
- **Show full badge tier preview to anonymous users**: revealing the reward before the friction is the whole point of inverting the flow.

## Dependencies / Assumptions

- **Google OAuth requires new backend route + Google Cloud project setup.** New endpoint to exchange Google ID token for our JWT, new user upsert path (find-or-create by Google `sub` or email). [Unverified — backend currently only has `/api/auth/register` and `/api/auth/login`; OAuth route does not exist.]
- **Existing `users` table** must accept an OAuth-created user (no password). Either nullable `password_hash` or a separate auth-providers table. [Unverified — needs schema check during planning.]
- **`children` table** must accept a child created with only `name` (other fields nullable or defaulted). [Unverified — needs schema check during planning.]
- **Frontend `axios` interceptor in `src/lib/api.ts`** already clears auth on 401/403; pending-score replay must run after auth state is set, not before, to avoid using a cleared token.

## Outstanding Questions

### Resolve Before Planning

(None — product decisions are all resolved.)

### Deferred to Planning

- [Affects R5][Technical] Which Google OAuth library on the backend (`google-auth-library` vs custom verification of ID token)? And on the frontend, Google Identity Services script vs `@react-oauth/google`?
- [Affects R5, Dependencies][Technical] Does the existing `users` table support a password-less OAuth user, or do we need a migration (nullable `password_hash`, or new `user_oauth_identities` table)? Verify against `db/schema.sql`.
- [Affects R11][Technical] Is `children.age_group_id` nullable in the current schema? If not, the post-save child-creation needs a sensible default or a migration. Verify against `db/schema.sql`.
- [Affects R6][Technical] Where exactly in the frontend should the pending-score replay run — in `App.tsx` after `isAuthenticated` flips true, in a dedicated effect inside `VideoDetail.tsx`, or in the OAuth callback handler? Avoid double-submit on remount.
- [Affects R4][Needs research] Should the auth modal be a portal-based component or live inside `VideoDetail.tsx`? Consider reuse from other gated actions in the future.
- [Affects R12][Technical] Confirm by reading `src/components/Navbar.tsx` and `src/store/authStore.ts` that no other auth-state-dependent UI breaks if `VideoDetail.tsx` allows anonymous score input.

## Next Steps

-> `/ce-plan` for structured implementation planning.
