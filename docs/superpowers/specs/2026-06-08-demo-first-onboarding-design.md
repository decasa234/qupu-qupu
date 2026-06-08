# Demo-First Onboarding (`/mulai`) — Design

**Date:** 2026-06-08
**Branch:** `worktree-onboarding-design`
**Status:** Approved design, pending implementation plan

## Goal

Replace the current "register first, land cold on a gamified dashboard" onboarding
with a **demo-first** flow: let a visitor *feel* a win (complete a real, grade-matched
math quiz question, earn their first badge, see what QUPU offers) **before** asking
for any commitment. After the demo, the parent creates an account and the child
profile is **pre-filled** with information captured during the demo.

This is the Duolingo-style "try before you commit" pattern, adapted to QUPU's
parent-creates-account / one-parent-many-children model.

### Primary conversion hook

**Personalized plan.** The demo asks the child's grade up front so the sample quiz
fits; the demo ends on a tailored "[Name]'s Kelas-X math plan" reveal, and signup
carries the captured grade (and optional name) forward.

### Non-goals (YAGNI)

- No backend changes. The demo is 100% client-side and writes **zero** server state.
- No guest-session → account badge migration (a different hook we did not choose).
- No real quiz engine running anonymously in the demo (curated content instead).
- **Zero-click landing demo (Approach C) is explicitly deferred** as a fast-follow
  once the standalone flow is proven.
- No A/B testing infrastructure.

## Current onboarding (what we are replacing)

1. Marketing home → "Daftar" → `/register`.
2. `/register` (`Register.tsx`) — creates the **parent** account (Google one-tap, or
   email + name + phone + password → 6-digit email OTP, 10-min expiry, 60s resend).
   Captures `?ref=` referral codes. → `/onboarding/child`.
3. `/onboarding/child` (`OnboardingChild.tsx` + `ChildForm.tsx`) — first child profile:
   name, age group (optional), avatar color, daily quiz goal. Has a skip link.
4. `/dashboard` — full gamified dashboard (XP, level, streak, coins, recommended video).

**Gaps this design addresses:** child lands on a cold dashboard with no explanation of
the core loop; the highest-leverage moment (first quiz → first badge) is unguided; the
"Lewati untuk sekarang" skip dead-ends on `Dashboard.tsx:94` ("Pilih profil anak dulu");
the onboarding funnel is uninstrumented (only `register_completed`/`login_completed` fire).

## Build approach (chosen: A — Self-contained demo)

A standalone `/mulai` flow with **curated, grade-fitted demo questions in a local data
file**. Reuses the qupu-ui visual language and existing quiz-style visuals. Demo
selections persist to `localStorage` and pre-fill the existing register → child path.
No backend work; fast to ship; full content control. Curated questions (vs. real catalog
content) are intentional — the demo's job is a perfect, reliable first impression.

## Flow & routing

- New **public** route `/mulai` ("start") under the marketing `Layout` — no auth, no
  `AppShell`. Self-contained multi-step state machine in `src/pages/Mulai.tsx`.
- **Home hero** primary CTA → **"Coba gratis — tanpa daftar"** → `/mulai`. "Masuk"
  (login) stays secondary. Direct `/register` still works for visitors who skip the demo.
- The demo funnels into the **existing** `/register` → `/onboarding/child` path. We do
  not rebuild auth. The demo captures **child name + grade**, which pre-fill the child step.
- An authenticated user hitting `/mulai` redirects to `/dashboard` (same guard pattern
  as `HomeRoute` in `App.tsx`).

## The `/mulai` steps

Single page component, one `step` enum, local state
`{ childName, ageGroupId, answers, earnedBadge }`. A slim progress indicator (dots) spans
steps 1–5.

1. **Who's learning** — child's name (1 **optional** field) + **grade picker**
   (age groups from existing `/public/meta`). CTA "Mulai".
2. **Sample quiz** — **2 curated, grade-matched** math questions; real quiz-style
   multiple-choice tiles; instant ✓/✗ feedback with the correct answer shown. **No fail
   state** — a wrong answer reads "Hampir! Jawabannya …" and continues.
3. **Win moment** — confetti + "Kamu dapat badge pertama!" with badge + XP pop.
   Honors `prefers-reduced-motion`. The badge here is an **in-demo delight only** — it
   is illustrative and does **not** persist to the real account (the conversion hook is
   the personalized plan, not saved progress). The real account starts fresh.
4. **Mini-tour** — 2–3 swipeable highlight cards: Badges & XP · Latihan/WMI math
   practice · Daily goal & streak.
5. **Plan reveal** — "**Rencana belajar [Name], Kelas-X**": subjects + count of quizzes
   available for that grade + badges to collect (from `/public/meta`). Big CTA
   **"Buat akun & mulai"** → `/register`. Subtle "Nanti saja" escape.

## Data & pre-fill (no backend changes)

- **Curated questions** — `src/lib/demoQuestions.ts`: one short 2-question set per
  **grade band**, keyed by a stable band derived from the age group's `minAge`, **not**
  by DB UUID (age-group IDs differ across environments). The selected age group maps to
  its nearest band.
- **Demo storage** — `src/lib/demoStorage.ts`, mirroring the existing
  `referralStorage.ts` pattern: saves `{ childName, ageGroupId }` to `localStorage` when
  the visitor reaches the plan CTA.
- **Pre-fill** — `OnboardingChild` / `ChildForm` read demo storage to pre-set child name
  and age group, with a "Lanjutkan rencana [Name]" context line. Storage is **cleared**
  once the child profile is created (same lifecycle as referral redeem in
  `redeemPendingReferral`).
- **Optional / deferrable** — `/register` shows a small "dari demo" context banner.

## Visual / UX

Full-screen, **app-like** steps (not the `AuthCard` web-form chrome) — phone-first, big
tap targets, mascots, hard-shadow cards, Baloo 2 display font, brand blue/orange/yellow,
confetti. Built via the **qupu-ui** skill. Each step is its own small component under
`src/components/onboarding/`, independently readable and testable.

## Analytics (closes the invisible-funnel gap)

New events in `src/lib/analytics.ts`: `demo_started`, `demo_grade_selected`,
`demo_question_answered` (`correct` bool), `demo_badge_earned`, `demo_tour_viewed`,
`demo_plan_viewed`, `demo_signup_click`, `demo_skipped`, plus `onboarding_child_created`.
Combined with existing `register_completed`, this makes the full demo → signup → first
profile funnel measurable.

## Error handling / edge cases

- `/public/meta` fails → fall back to a hardcoded minimal grade list so the demo still
  runs (it is pre-account and must be resilient).
- No grade chosen → default to a middle band.
- Stale / missing demo storage at register time → child form simply isn't pre-filled
  (graceful, no error).
- A visitor who navigates straight to `/register` (skipping the demo) → unchanged behavior.
- Authenticated user at `/mulai` → redirect to `/dashboard`.
- `prefers-reduced-motion` honored for confetti and badge animations.

## Files

**New**
- `src/pages/Mulai.tsx` — demo flow page / state machine.
- `src/components/onboarding/` — `WhoStep`, `SampleQuiz`, `WinMoment`, `MiniTour`,
  `PlanReveal`, `ProgressDots`.
- `src/lib/demoStorage.ts` — localStorage get/save/clear for demo selections.
- `src/lib/demoQuestions.ts` — curated questions by band + band-mapping helper.

**Edits**
- `src/App.tsx` — add `/mulai` route + authenticated redirect guard.
- `src/pages/Home.tsx` — hero CTA → `/mulai`.
- `src/pages/OnboardingChild.tsx` + `src/components/ChildForm.tsx` — pre-fill from demo
  storage; clear storage on child creation.
- `src/lib/analytics.ts` — add the new event names.

## Testing / QA

No test runner is configured in this repo. Validation is:

- `npm run check` (typecheck) and `npm run lint` must pass.
- Manual QA via the **webwright** skill (the project's standard for browser test runs):
  - Run the demo at each grade band; verify grade-matched questions render.
  - Verify name + grade pre-fill into the child profile after signup.
  - Verify the "Nanti saja" / direct-`/register` skip paths.
  - Verify `prefers-reduced-motion` suppresses confetti.
  - Verify an authenticated user is redirected away from `/mulai`.
  - Verify graceful behavior when `/public/meta` is unavailable.

## Resolved decisions (defaults baked in)

- Sample quiz length: **2 questions**.
- Child name in the demo: **optional** (low friction); plan reveal degrades to
  "Rencana belajar Kelas-X" without it.
- Tour cards: **Badges & XP · Latihan/WMI · Daily goal & streak**.
- Demo content keyed by **grade band (from `minAge`)**, not age-group UUID.
