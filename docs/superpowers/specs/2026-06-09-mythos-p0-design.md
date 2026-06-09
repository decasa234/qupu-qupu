# Mythos P0 — Instant Learning + Living Gamification + Brand Trust

**Date:** 2026-06-09 · **Branch:** `claude-mythos-optimization` · **Status:** Approved, building
**Evidence base:** `docs/audits/2026-06-09-e2e-gap-audit.md` (32-agent verified audit). File:line refs below come from it.

## Goals (founder)
1. **Fewer actions:** login lands the user *in* learning, not on a stats dashboard.
2. **Duolingo-level gamification** — refine what exists (half the backend loop is invisible in UI).
3. **Reliable brand image** — kill the integrity-level gaps.

## Approved decisions
- **Landing = the WMI garden** (the course), correct grade auto-selected per child, daily-quest panel on top, one dominant **"Lanjutkan"** that starts the right subsection session (1 tap to learning). NOT auto-starting a session (all-or-nothing 20-problem commitment must stay consensual).
- Dashboard demoted to the parent/profile area; bottom-tab **Home → garden**; Profil gains a "Rapor & Statistik" link to `/dashboard`. `/dashboard` route stays (deep links keep working).
- Scope = all 8 P0 items below.

## Items

### 1. Per-child grade (foundation)
Today `wmiStore.selectedGrade` defaults to 1, is unpersisted and shared across siblings; the wizard's grade choice is discarded (`wmiStore.ts:13-17`, `ChildOnboardingWizard.tsx:84-101`).
- Derive each child's WMI grade from their `age_group_id` (reverse of the wizard's grade→ageGroup mapping). TK/grade-0 → **grade 1** (wmi_subjects CHECK is 1–3).
- `wmiStore` becomes per-child: `gradeByChild: Record<childId, WmiGrade>` persisted (zustand persist); `selectedGrade` resolves as `gradeByChild[activeChildId] ?? inferredFromChild ?? 1`. Manual chip changes write to the active child's entry.
- Also persist `lastSubjectKey` per child (written when a session starts) for resume.

### 2. Instant landing + resume
- `resolvePostLoginRoute(user, children)`: admin → `/admin/videos`; member with ≥1 child → **`/latihan/wmi`**; member with 0 children → onboarding. Used by `Login.tsx:34`, `Register.tsx:69`, and the authed `/` redirect (`App.tsx:67-81`).
- Garden hero: a **resume block** above the chapters — "Lanjutkan — <subsection name_id>" → `/latihan/wmi/sesi/<subjectKey>`. Subject = persisted `lastSubjectKey` if still unlocked/not-fully-grown, else the first unlocked chapter that isn't fully grown (the chapter containing `nextConceptSlug`). Falls back to "Mulai Latihan" on the first chapter.
- `BottomTabBar` Home tab → `/latihan/wmi`. Profil/Me page gains "Rapor & Statistik" row → `/dashboard`.

### 3. Onboarding rebuild — first question is the tutorial
Today: 4-step wizard → legacy grade-0 drill → 6-step spectate-only tour with no skip → video detour → dashboard; zero questions answered; tour-gating can trap users (`OnboardingChild.tsx:20-24`, `OnboardingTour.tsx:136-184`).
- Wizard trimmed to **name + grade** (avatar/goal get defaults, editable later on profile).
- After wizard: write the child's grade into `gradeByChild`, navigate to **`/latihan/wmi`**. A single dismissible **coach-mark** (plain React, no joyride) points at the resume button: "Ketuk untuk mulai latihan pertamamu!". Fully interactive, skippable, shown once (localStorage).
- Delete: the legacy-drill routing, the spectate tour flow and its forced-redirect gating, and the `/quiz/:slug` detour. `tourStore` stage machinery removed or reduced to the one coach-mark flag.

### 4. "Misi Hari Ini" quest panel (revive the dead mechanic)
Quests are generated server-side daily and rendered nowhere (`Dashboard.tsx:209-220` reads payload but no component shows `vm.quests`).
- New `GET /me/quests?childId` → ensures today's quests exist (reuse the generator the dashboard service calls; factor out) and returns `{quests:[{id, title_id, progress, target, rewardCoins, rewardXp, completed, claimed}]}`.
- Shared `DailyQuestsPanel` component: compact card, 3 quests with progress bars + reward chips. Rendered at the **top of the garden** and as the **first Dashboard card**.

### 5. Wire WMI into the gamification loop (backend)
The flagship surface can't progress a single quest or achievement (`gamification/concept.ts:42-98` never emits events; templates are video-only; exams/Tes Bab grant nothing).
- `commitKonsepSession`: after the answer loop, emit a session event (questions answered, correct count, concepts grown) through the existing `gamification_events` → evaluator path; run quest evaluation + `evaluateAchievements` in the same transaction.
- `submitChapterTest` (pass): grant a Tes Bab reward (coins+XP) via the ledger, idempotent on the `wmi_chapter_tests` row id; emit event.
- Migration **0037** seeds: WMI quest templates (e.g. "Jawab N soal konsep", "Selesaikan 1 sesi", "Tumbuhkan 1 tanaman ke tier baru") and garden/streak achievements (first Mahir plant, first chapter 70%, streak 14/30) — all flowing through the single-currency ledger invariant.
- Keep flat +5 XP for now (mastery-scaled XP is P2; explicitly out of scope here).

### 6. Session resilience
One dropped request kills the 20-problem session; grading errors are swallowed (`WmiKonsepSession.tsx:128-131,150-152`).
- Persist `{subjectKey, planSlugs, answers, idx, startedAt}` to sessionStorage on every change; on mount with a fresh (<2h) matching record, offer "Lanjutkan sesi yang terputus?" (resume restores plan + answers).
- Per-question fetch failure → inline retry (keep the session alive, never the fatal screen).
- Grading failure → visible Indonesian error + retry; `beforeunload` guard while a session is active. All-or-nothing commit semantics unchanged; clear storage on commit/quit.

### 7. Brand integrity
- Empty the fabricated `TESTIMONIALS` (`wmiMarketing.ts:90-99`); marquee renders nothing when empty (verify); remove placeholder founder entries.
- New `/privasi` + `/ketentuan` pages (Indonesian, accurate to actual data collected: parent email/phone, child name/age; parental consent, retention, deletion contact — UU PDP-aware). Linked from footer, register, cookie banner.
- Footer: fix dead `/#tentang|faq|kontak` anchors; remove `href="#"` social icons until real.

### 8. Streak-recovery UI (ship the built backend)
`POST /me/streak-recovery` + `recoveryEligible` exist with zero UI consumers (`member.ts:287-307`).
- Expose `recoveryEligible` (+ broken-streak length) via the gamification summary the member shell already loads; on garden mount when eligible → modal "Streak <N> harimu putus — pulihkan?" → call endpoint → celebrate + refresh stats. Dismissal stored per eligibility window.

## Out of scope (named, deferred)
Reward ceremony + Pelindung Streak (P1 next), code-splitting, error tracking, commit idempotency, WhatsApp loop, mastery-scaled XP, checkpoint chests, sibling leaderboard.

## Verification
Full suite (check/lint/test/build) green; migration 0037 applied + backfilled on the LAN DB; final integration review workflow over the whole diff; manual flow check: login → garden (correct grade) → 1 tap → session; new-user register → wizard(2 steps) → garden → coach-mark → first question.
