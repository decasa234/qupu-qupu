# QUPU End-to-End Gap Audit

> Generated 2026-06-09 by a 32-agent ultracode audit (6 lenses, adversarially verified findings; dropped claims that failed verification).


## 1. Executive summary

QUPU's backend gamification is unusually complete for its stage — idempotent reward ledger, 25-tier XP curve, WIB streaks with recovery, personalized daily quests — but roughly half of it is invisible or unreachable from the kid's actual loop. Login always lands on a stats dashboard, never in learning (`src/pages/Login.tsx:34`); the fastest path to a question silently serves Grade 1 content because the child's onboarded grade is never used (`src/store/wmiStore.ts:13-17`). New-user onboarding ends with **zero questions answered**: kids are routed to a legacy grade-0 drill page and forced through a spectate-only tour (`src/pages/OnboardingChild.tsx:23`, `OnboardingTour.tsx:170-184`). Daily quests — the core Duolingo habit mechanic — are generated server-side and rendered nowhere (`src/pages/Dashboard.tsx:209-220`); quests/achievements only fire on legacy video quizzes, not the flagship WMI garden (`api/services/gamification/concept.ts:42-98`); coins buy a shop that delivers a permanent "ready soon" placeholder (`src/components/me/InventoryItemSheet.tsx:30`). On brand: six fabricated testimonials ship on the public marketing page (`src/data/wmiMarketing.ts:90`) and there is no privacy policy anywhere for a product collecting children's data (`src/components/Layout.tsx:91-117`). Technically, the 20-problem session is held in volatile state and dies on one dropped request (`src/pages/WmiKonsepSession.tsx:128-131`), and the entire app ships as one 1.4MB JS chunk (`src/App.tsx:3-40`). Almost every fix is presentation/wiring, not schema — the state needed for instant landing and a Duolingo-grade loop already exists.

## 2. The login-to-learning funnel today

### Verified tap-by-tap trace

**Returning family (token valid):**
1. App open → `/` → HomeRoute redirects to `/dashboard` (`src/App.tsx:67-73`); child auto-selected from persisted `activeChildId` (`src/store/authStore.ts:48-56`).
2. Dashboard blocks on `GET /me/dashboard` skeleton before anything is tappable (`src/pages/Dashboard.tsx:115-121`).
3. **Fast path (wrong-grade risk):** tap "Latihan Konsep" card → `/latihan/wmi/konsep` auto-fetches a question (`WmiKonsepDrill.tsx:83-85`) — but at `wmiStore.selectedGrade = 1` on every cold load (`src/store/wmiStore.ts:14`). **2 taps, wrong content for non-Grade-1 kids.**
4. **Correct-grade course path:** "Main" tab → LatihanHub → *secondary* button "Lihat semua konsep & ujian" (the primary "Main Sekarang!" goes to the grade-1 drill, `LatihanHub.tsx:142-155`) → WmiHub → re-tap grade chip (selection dies on refresh, `WmiHub.tsx:70`) → tap chapter → answer. **5 taps + 2 decisions + 3 network waits.**

**Brand-new family:** 4 typed fields + OTP email round-trip (`Register.tsx:75-124`) → 4-step gated wizard (name/grade/avatar/goal, `ChildOnboardingWizard.tsx:28-33`) → forced navigation to legacy `/latihan/wmi/drill` with no grade param, so `parseGrade(null) = 0` serves TK content to every child (`OnboardingChild.tsx:23`, `WmiDrill.tsx:11-14`) → 6-step Joyride tour with no skip button and `spotlightClicks` off — the kid **sees but cannot touch** the answer choices (`OnboardingTour.tsx:170-184`) → detour to `/quiz/:slug` → ends on `/dashboard`. **~14-18 interactions, zero questions answered, the wizard's grade choice discarded.**

### Friction list (verified, adjusted severity)

| # | Friction | Sev | Evidence |
|---|---|---|---|
| 1 | Every auth entry hardcodes `/dashboard`; no resume mechanism exists anywhere | High | `Login.tsx:34`, `Register.tsx:69`, `App.tsx:67-81` |
| 2 | Grade collected at onboarding never mapped to WMI; `selectedGrade` defaults to 1, unpersisted, shared across siblings; server trusts client grade (`api/routes/wmi-member.ts:219-233`) | High | `wmiStore.ts:13-17`, `ChildOnboardingWizard.tsx:84-101` |
| 3 | Onboarding routes to legacy grade-0 drill, spectate-only tour, no activation moment | High | `OnboardingChild.tsx:20-24`, `OnboardingTour.tsx:144-184` |
| 4 | Persisted tour gating can trap users on a broken drill page indefinitely (no skip, force-redirect while `stage === 'wmi'`) | Med | `OnboardingTour.tsx:136-142`, `tourStore.ts:20-29` |
| 5 | Dashboard hero is hardcoded video-first; recommendation engine cannot recommend WMI resume | Med | `dashboardData.ts:185-193` |
| 6 | LatihanHub is a single-course interstitial whose primary CTA misdirects to the grade-1 drill | Med | `LatihanHub.tsx:142-155` |
| 7 | Transient `/me/children` failure misroutes returning parents into the child wizard (duplicate-child + full tour risk); serial fetch delays login | Med | `Login.tsx:25-34` |
| 8 | Wizard front-loads 2 skippable steps (avatar, goal) that already have defaults | Med | `ChildOnboardingWizard.tsx:28-33,52-54` |
| 9 | TK (grade 0) children have no reachable garden — chips are `[1,2,3]` only; note `wmi_subjects.grade` CHECK is 1-3 so content must be decided too | Med | `WmiGradeChips.tsx:3`, `db/schema.sql:583` |

**Key enabler (verified inventory):** everything needed for instant landing exists — `activeChildId` persists and auto-selects (`authStore.ts:48-56`), `subjectKey` encodes grade so `/latihan/wmi/sesi/:subjectKey` is a self-sufficient deep link (`WmiKonsepSession.tsx:66-67`), and the garden API returns per-chapter `unlocked`/`grownCount` so "resume" is computable with **zero schema changes**.

## 3. Gamification: what exists vs what's dead vs what's missing

| Mechanic | Backend | UI | Loop quality |
|---|---|---|---|
| XP + 25 level tiers | Solid (`levelCurve.ts`, `profileUpdater.ts`) | Strip, hero, LevelDetail | **Hollow** — levels gate nothing anywhere (`db/schema.sql:196-233`); xpToNext has no destination |
| Coins | 4 income sources, atomic debit (`purchase.ts:87-112`) | Strip, shop, reward modal | **Broken trust** — only sink is a mock shop; delivery is a permanent "ready soon" stub (`InventoryItemSheet.tsx:3-30`); `shop_items` has no asset column (`db/schema.sql:750-762`) |
| Streak (WIB days) | Solid incl. recovery (`streakUpdater.ts:181-249`) | Decorative card, week strip | **No teeth** — zero reminders (no push/email/cron beyond OTP), no at-risk state (`HomeActionCards.tsx:209-240`) |
| Streak recovery | Fully built: `POST /me/streak-recovery` (`api/routes/member.ts:287-307`), `recoveryEligible` in payload | **None** — zero `.tsx` consumers of `recoveryEligible`, endpoint never called | **Dead feature** — broken 10-day streak silently restarts at 1 |
| Daily quests (3 personalized slots) | Solid (`questGenerator.ts`, `questEvaluator.ts`); returned in dashboard payload (`api/services/dashboard.ts:322`) | **None** — no component reads `vm.quests`; only retroactive "Quest selesai" rows (`PostQuizRewardSummary.tsx:207-214`) | **Dead as a goal display** — the open-app→see-3-goals loop doesn't exist |
| Quest claim ritual | Schema ready (`claimed_at`, `db/schema.sql:333-352`) | None — rewards auto-grant in-transaction (`questEvaluator.ts:138-160`) | Missing chest-open beat |
| Achievements (9) | Evaluator solid, but runs **only** on video-quiz submit (`gamification/index.ts:296`) | Badges tab | WMI-only kids with 7-day streaks never unlock `streak_7_days`; zero garden achievements (`db/schema.sql:389-410`) |
| Login bonus | Flat 5 coins (`loginBonus.ts:28-31`) | Dashboard-only card | No escalation, undiscoverable from `/latihan` |
| WMI concept rewards | Wired for XP/coins/streak (`concept.ts:42-98`) but never calls `emitEvent`/`evaluateAchievements`; quest templates all target video-quiz events (`db/schema.sql:306-331`) | Garden, "Konsep Tumbuh" | **The flagship surface can't progress a single quest or achievement**; exams and Tes Bab grant zero rewards (`wmi/sessions.ts:103-149`, `chapterTest.ts:41-104`) |
| Concept XP design | Flat +5 forever, capless, documented as "intentionally farmable" (`concept.ts:15-29`); tier data exists but never read by rewards | — | Med — anti-mastery incentive: grinding mastered content pays the same as tier-ups, which pay nothing |
| Garden mastery (tiers, comprehension) | Solid (`wmi_concept_progress`) | Garden | The one genuinely healthy loop |
| Reward timing (20-q session) | Per-answer grade is "NO writes, NO XP" by design (`concepts/session.ts:19`) | Result screen omits coins/streak; `TopStatStrip` stays stale (no `useGamificationStats` patch) | Med — contradictory reward grammar vs drill (`WmiKonsepSession.tsx:217-283`) |
| Daily goal / heatmap | Counts `score_attempts` (video quizzes) only (`api/services/dashboard.ts:303-305`) | Ring + week strip | Med — full WMI session shows "0/3 today" beside a lit streak |

### Duolingo gap-map (research-backed, unverified against code)

1. **Session-end reward ceremony** — Duolingo never ends on a blank screen (XP tick, streak flame, quest bars, chest drop). QUPU computes everything (ledger, quests, streak, achievements) but never sequences it. Highest-leverage single build for 6-10 year olds.
2. **Streak freeze as keystone coin sink** — Duolingo's freeze cut at-risk churn ~21%; QUPU has only a free, *reactive*, invisible recovery. A purchasable "Pelindung Streak" simultaneously fixes the coin-sink and streak-retention gaps. Kids' schedules are parent-controlled, so freezes matter *more* here.
3. **Engagement-multiplying coin sinks** — current shop sells one-shot static goods; Duolingo's gems buy loop items (freezes, XP boosts) plus cosmetics. Garden cosmetics are the COPPA-safe evergreen sink that fits the plant metaphor.
4. **Path checkpoint chests / goal gradient** — garden has no reward nodes between concepts, no checkpoint celebration, no "gold plant" replay state.
5. **Parent-mediated out-of-app loop** — no notification channel exists at all (Resend = OTP only). The Indonesian channel is WhatsApp; the target is the parent, never the child (COPPA-aligned, matching Duolingo ABC's design which also strips leaderboards).
6. **COPPA-safe competition substitutes** — sibling leaderboard (parent account already provides a private mini-league), ghost percentiles, beat-your-own-week. No public leagues.
7. **Family co-op quests** — QUPU's parent+child dyad enables "Misi Keluarga" without a social graph.
8. **Combo/improvement bonuses** — `daily_improvement` quest template already seeded; no in-session combo feedback. Avoid perfection-only bonuses and hearts (punishes strugglers).
9. **Protect the single-currency invariant** — every new mechanic must flow through `gamification_events` → `reward_ledger` (the architecture already has this shape; don't fragment it).

## 4. Brand-reliability gaps (ordered by brand damage)

1. **Fabricated testimonials live on the public /wmi page (High).** Six invented named parent/teacher quotes marked "SAMPLE … TODO: replace with real, consented quotes" render via `WmiTestimonialsMarquee` (`src/data/wmiMarketing.ts:90-99`, `LatihanWmi.tsx:121`), directly above a CTA reading "Jadi salah satu keluarga pertama" (`LatihanWmi.tsx:138`) — internally contradictory and legally risky for a paid kids' product. Fix is emptying one array.
2. **No privacy policy or terms anywhere (High).** Product collects parent email/phone and child names/ages; cookie banner links to nothing (`CookieConsentBanner.tsx:21-45`); footer has no Kebijakan Privasi/S&K (`Layout.tsx:91-117`); register collects No. HP with no purpose statement (`Register.tsx:239-253`). UU PDP has special children's-data provisions — trust and compliance gap.
3. **Raw English axios errors shown to members (Med).** `err instanceof Error ? err.message : 'Gagal memuat'` never falls through (AxiosError IS an Error), so kids see "Network Error" / "Request failed with status code 500" verbatim — confirmed at 14 sites (`WmiPapers.tsx:28,73` et al.); `unwrap()` only localizes 2xx failures (`wmiApi.ts:23-26`).
4. **Auth flow code-switches English/Indonesian (Med).** Wrong password — the most common week-one error — returns "Invalid email or password" (`api/routes/auth.ts:197,204`) displayed verbatim (`Login.tsx:64-67`); raw English Joi messages at `auth.ts:108,130,155,172,236`; meanwhile rate-limit and registration errors are Indonesian. `Register.tsx:117` string-matches Indonesian copy for flow control — fragile.
5. **No OG/meta, `lang="en"`, bare "QUPU" title (Med).** Zero meta description/OG/twitter/manifest (`index.html:2,20,3-162`); WhatsApp — the dominant Indonesian share channel — renders shared links with no preview; no per-page titles anywhere in src/.
6. **Dead footer links + "#" social icons (Med, unverified).** `/#tentang`, `/#faq`, `/#kontak` point at nonexistent sections; Instagram/TikTok/Facebook all `href="#"` (`Layout.tsx:93-108`) — classic abandoned-product signal.
7. **3.7MB splash mascot PNG; 2.1MB `_bak` file shipped (Med, unverified).** First brand impression is seconds of missing mascot on Indonesian 4G (`index.html:175`, `public/hero-mascot_bak.png`).
8. **English fragments in kid surfaces (Med, unverified).** "Submit" on every fill-in question (`WmiQuestionView.tsx:183`), "Home" tab (`BottomTabBar.tsx:17`), quiz/kuis register mixing.
9. **Font drift (Med/Low, unverified).** Dead `"Baloo 2"` hardcoded in the W7 *reference* explainer (`BudgetSelectionExplainer.tsx:74`) — the template new explainers copy; mismatched system-ui/Nunito/sans stacks across explainer SVGs; the global `qupu-ui` skill still prescribes Baloo 2; Fredoka double-loaded via link + blocking `@import` (`index.css:1`).
10. **EN-first question default (Low — verified as intentional).** Per-question English reset is load-bearing telemetry (`revealed_id_translation`, `db/schema.sql:561`) for English-competition prep; the real residual gap is no sticky language preference (20 re-taps per session for an ID-preferring kid) (`WmiQuestionView.tsx:79-86`).
11. **Placeholder founder data one import from shipping (Low).** `'[Nama Pendiri]'` / "PLACEHOLDER:" in the same file that already shipped its SAMPLE testimonials (`wmiMarketing.ts:76`).

## 5. Technical gaps (ordered by incident risk)

1. **One dropped request destroys a 20-problem session (High).** All session state is volatile React state; any `fetchQuestion` failure swaps the whole UI to a fatal screen whose only action is "Kembali ke Kebun" (`WmiKonsepSession.tsx:128-131, 296-309`); no `beforeunload`/blocker/sessionStorage anywhere; grading failures are swallowed silently (`:150-152`). The grade endpoint is write-free by design (`concepts/session.ts:19-20`), so the session is truly all-or-nothing. Most likely repeated trust-destroyer on mobile.
2. **No code-splitting: 1,400KB single chunk (395KB gz, build-verified) (High).** All ~38 pages including admin statically imported (`App.tsx:3-40`); every WMI illustration/explainer statically registered (`concepts/registry.ts:2-24`, ~1.6MB source + framer-motion); `recharts` is a dead dependency (`package.json:41`); react-joyride in the main chunk. Marketing visitors download the admin panel.
3. **Zero error tracking, no ErrorBoundary, no member-funnel analytics (Med).** No Sentry/onerror/ErrorBoundary in the tree — a render error in any of ~75 param-driven illustration components white-screens the kid app invisibly; analytics has no member events (`src/lib/analytics.ts:21-40`), so commit failures and abandonment are unmeasurable.
4. **Konsep commit not idempotent (Med).** No session id/idempotency key (`api/routes/wmi-member.ts:387,348-360`); retry after a lost response duplicates 20 `wmi_attempts` rows and double-counts comprehension (unique index covers `mode='exam'` only, `db/schema.sql:572-574`); XP/coins are ledger-protected, tiers monotonic. Window is post-COMMIT response loss only.
5. **Commit runs ~140 sequential DB round-trips in one transaction (Med).** 20 answers × ~7 queries with `FOR UPDATE` (`concepts/session.ts:93-153`) — 2-4s of held locks at remote-Postgres RTT; on serverless this is exactly what produces the lost-response retry in #4.
6. **403 force-logs-out like 401 (Med).** `src/lib/api.ts:26-44` treats any authorization denial as token expiry: `logout()` + full-page redirect, wiping an in-progress session.
7. **Zero tests on the load-bearing paths (Med).** Nothing on `api/routes/auth.ts`, `/konsep/commit`, garden/chapter gating, or streak/quest/achievement evaluators; every DB suite `skipIf(!TEST_DATABASE_URL)` (`konsep.test.ts:13-15`) so a green run can execute almost nothing; no visible CI.
8. **Public endpoints have no rate limiting (Med).** `/api/public/*` and `/api/meta` hit Postgres per request with no limiter or server cache (`public.ts:7-95`); per-instance pools turn a cheap flood into shared-DB pressure.
9. **Answer-revealing grade + unverified commit = scriptable 20/20 farming (Low).** `gradeConceptAnswer` returns `correct_answer` pre-commit and commit never checks instances were served (`concepts/session.ts:43-50,107`); farmability is a documented trade-off, but coins are now shop currency.
10. **CORS footgun (Low).** Unset/misspelled `NODE_ENV` + empty `APP_ORIGIN` silently reflects any origin with credentials (`api/app.ts:82`); admin gating, cron auth, and client-bundle secrets otherwise verified sound.

*(Dropped after adversarial verification: "dev proxy writes to prod DB" — the axios client uses an absolute baseURL that bypasses the Vite proxy entirely; only stale docs remain as an issue.)*

## 6. Prioritized roadmap

### P0 — directly serves the founder's 3 goals (instant learning, Duolingo loop, brand trust)

| What | Why | Effort |
|---|---|---|
| Persist `wmiStore` per child + infer grade from `ageGroupId` (reverse the wizard's mapping; decide TK→grade-1 explicitly since `wmi_subjects` has no grade 0) | The single change that makes every existing 1-tap shortcut serve correct-grade content (`wmiStore.ts:13-17`) | S |
| `resolvePostLoginRoute()` used by Login/Register/HomeRoute: returning single-child users deep-link to `/latihan/wmi/sesi/<resume-subjectKey>` (computable from existing garden API; store last subjectKey in localStorage) | Goal #1 verbatim — login lands *in* learning; zero schema changes needed | M |
| Rebuild onboarding: cut wizard to name+grade (defaults for avatar/goal), delete the legacy-drill tour, make the first real question the tutorial (1-2 dismissible hints, `spotlightClicks` on), drop the video detour; delete the tour-gating trap (`OnboardingTour.tsx:136-142`) | New families currently answer zero questions and can get permanently trapped; this is the activation moment | M |
| Render "Misi Hari Ini" quest panel as the first Dashboard card (data already in `vm.quests`); make the hero polymorphic — WMI "Lanjutkan <bab>" when in progress, video fallback | Revives the dead core habit mechanic + fixes video-first hierarchy with data already in the payload | S |
| Wire gamification events to WMI: emit `KONSEP_SESSION_COMPLETED`/`CHAPTER_TEST_PASSED`, add WMI quest templates, run `evaluateAchievements` at commit, reward Tes Bab | The flagship surface must feed the loop; currently quests/achievements are unreachable from where kids play | M |
| Session resilience: inline per-question retry (pattern exists at `WmiKonsepSession.tsx:422-443`), sessionStorage persistence of `{plan, answers, idx}`, beforeunload guard, visible grading-error message | Stops the most likely repeated trust-destroying failure | M |
| Empty the TESTIMONIALS array; add `/privasi` + `/ketentuan` pages linked from footer/register/cookie banner; fix dead footer anchors and `#` social icons | Goal #3 — the two integrity-level brand items plus the abandoned-product signals | S |
| Streak recovery modal (`recoveryEligible` already in payload) + at-risk state on the streak card | Cheapest retention win in the codebase: ship a fully-built backend feature's missing UI | S |

### P1 — closes the Duolingo gap and the reliability floor

| What | Why | Effort |
|---|---|---|
| Session-end reward ceremony (XP tick → coins → streak → quest bars → achievement → plant grows), single render point for all reward types; patch `useGamificationStats` from commit result | Converts "I finished" into "I'll come back"; backend already computes everything | M |
| "Pelindung Streak" shop SKU (equippable, cap 2, auto-consumed in `streakUpdater`) + pivot shop to deliverable garden/avatar cosmetics; stop selling stubbed goods until then | Fixes broken currency trust and gives coins their keystone sink in one move | M |
| Shared `toIndonesianErrorMessage()` helper replacing the `err.message` pattern at all 14 sites; localize auth errors + Joi messages; error codes for `Register.tsx:117` | Kills the raw-English-error brand damage product-wide | S |
| Code-splitting: lazy `/admin` subtree, member-vs-public boundary, dynamic-import concept/explainer registries; remove recharts | 395KB gz → fast first paint on Indonesian Android | M |
| Commit idempotency (client sessionId + UNIQUE, return cached result) + batch to <15 round-trips; dedupe `concept_instance_ids` in Joi | Removes the double-write/timeout failure pair (#4/#5 in tech gaps) | M |
| Top-level ErrorBoundary + illustration-slot boundary; Sentry (or pipe onerror into existing analytics); member-funnel events | Right now all client failures are invisible | M |
| Restrict forced logout to 401; let 403 reject normally | Stops session-wiping on authorization denials | S |
| Child switcher + "Tambah anak" on Me page; fix the four stale "switcher di navbar" empty states | Multi-child parents currently have no in-app path to switch | S |
| `lang="id"`, descriptive title, OG/twitter/theme-color/manifest, per-route titles | WhatsApp link sharing is the growth channel; today shares render bare | S |
| Self-hydrating `useGamificationStats` (fetch `/me/gamification` when null); count WMI in daily goal + heatmap | Kills "0 hari streak" coldness and the "you did nothing today" contradiction | S |
| Point Main tab + dashboard card at the garden; align drill/session feedback + reward grammar | Makes the flagship surface canonical instead of demoted | S |

### P2 — compounding loop depth and hardening

| What | Why | Effort |
|---|---|---|
| Parent notification channel: Resend first, WhatsApp (Fonnte/Wablas) as the real Indonesian channel; streak-at-risk + weekly digest via daily cron; calendar-aware mercy for Idul Fitri/semester breaks | The out-of-app loop — biggest remaining retention lever, COPPA-clean via the parent | L |
| Checkpoint chests every 3-5 concepts + "gold plant" legendary state + quest claim ritual (schema's `claimed_at` is ready) + variable coin drops | Goal gradient + variable reward layers on the existing garden | M |
| Sibling leaderboard + "Misi Keluarga" co-op quest (parent account = built-in private league) | COPPA-safe competition without a social graph | M |
| Level unlocks (avatar icons/colors at tier bands, exclusive shop items) + extend achievements (streak 14/30/100, garden milestones) | Gives 25 tiers and the XP bar a destination; mostly seed inserts | M |
| Mastery-scaled concept XP (decay by `best_tier`, one-time tier-up bonuses via ledger idempotency) + combo/improvement session bonuses | Points incentives at learning instead of farming; pairs with served-instance verification | M |
| Tests: `/konsep/commit` (incl. retry-idempotency), auth routes, streak/quest day-boundary logic; CI guard on `TEST_DATABASE_URL` | The load-bearing paths regress invisibly today | M |
| Rate-limit/edge-cache public endpoints; tighten CORS reflect branch to explicit dev signal | Cheap DB-flood and misconfig insurance | S |
| Image pipeline: WebP mascots at display size, delete `hero-mascot_bak.png`; fix font duplication; update `qupu-ui` skill + W7 explainer to Fredoka | First-impression speed + stops font drift at the source | S |
| Exam exit/confirm/resume (open-session detection exists via `completed_at IS NULL`); restyle legacy exam stack to the brand kit; sticky language preference | Finishes the remaining off-brand/abandonment pockets | M |