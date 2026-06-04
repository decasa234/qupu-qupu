# QUPU — Production-Readiness Audit: Findings & Severities

**Date:** 2026-06-04
**Branch:** `feat/latihan-main-konsep`
**Scope:** Full backend (`api/`) + security-relevant frontend (`src/lib`, auth/score flows) + schema (`db/`) + deploy config (`vercel.json`, `app.ts`).
**Method:** Ultra-granular, citation-anchored context build (per `audit-context-building`) across 8 clusters — auth, authz/IDOR, coin economy, scoring/gamification, WMI, referrals, admin/import, public/analytics/frontend — followed by triage. Every finding cites `file:line`.

**Important framing:** QUPU is **pre-launch with no real users yet** (per `TODOS.md`). Severities below assume *intended production with real parent accounts and real children's data*. Where a risk only bites after launch/monetization, that's stated.

## Severity legend
- **Critical** — exploitable now, leads to full compromise or mass data exposure. Fix before any production traffic.
- **High** — real security/integrity impact; fix before launch.
- **Medium** — production-readiness gap (reliability, abuse, hardening); fix in launch window.
- **Low** — correctness/hygiene/latent risk; schedule.
- **Info** — note / tech-debt, no direct risk.

---

## Summary table

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| 1 | **Critical** | JWT secret: hardcoded fallback, no fail-fast, divergent literals, `change-me` default | `middleware/auth.ts:27`, `auth.ts:80,86`, `analytics.ts:28`, `.env.example:2` |
| 2 | **High** | No brute-force protection on auth (login/verify/google); OTP attempt-cap resets on resend; limiter is in-memory | `auth.ts:122,161,227`, `registration.ts:272` |
| 3 | **High** | QUPU video scores are fully client-asserted (no answer key) → unbounded coin/XP/badge minting | `member.ts:82-104`, `pendingScore.ts`, schema (no video answer table) |
| 4 | **High** | Badge unlock **overwrites** instead of upgrade-only — destroys earned tier on a lower re-submit | `member.ts:148-160` |
| 5 | **Medium** | Unauthenticated, unrate-limited analytics ingestion with 10 MB arbitrary `metadata` | `analytics.ts:15`, `app.ts:52,67` |
| 6 | **Medium** | DB pool not serverless-safe: no `max`/timeouts/SSL/`pool.on('error')` | `db.ts:12-18` |
| 7 | **Medium** | No security headers (no `helmet`); CORS reflects any origin + credentials when `APP_ORIGIN` unset | `app.ts:40-50` |
| 8 | **Medium** | Concurrency under READ COMMITTED: double-grant on concurrent first submit; non-atomic assert→mutate gaps | `member.ts:86-100,166`, `db.ts:46`, `loginBonus.ts:55`, `progress.ts:59-66` |
| 9 | **Medium** | Runtime DDL/seeding on first request (serverless cold path) | `wmi/concepts/bootstrap.ts:8-98` |
| 10 | **Low** | Login user-enumeration timing side-channel (bcrypt only on existing email) | `auth.ts:187-202` |
| 11 | **Low** | Latent referral fraud + UUID-disclosure echo; `Math.random()` codes; no rate limit | `referrals.ts:22-30,84-113`, `member.ts:251-270` |
| 12 | **Low** | Inconsistent HTTP status (400/403/404) + string-matched error mapping for same ownership failure | `member.ts` GET handlers, `wmi-member.ts:61-72` |
| 13 | **Low** | Ops cleanup: levelCurve cache never invalidated; `request_rate_limits` never swept; `purgeExpiredPendingRegistrations` unused | `levelCurve.ts:22`, `rateLimit.ts`, `registration.ts:300` |
| 14 | **Low** | WMI concept answer derivable client-side from transmitted `params`; concept rewards uncapped (intentional) | `engine.ts:89`, `concept.ts:17-18` |
| 15 | **Info** | Stale CLAUDE.md/comments, dead code, legacy `supabase/migrations`, unused `users` columns, thin security tests | various |

---

## Critical

### 1. JWT secret: hardcoded fallback + no fail-fast → admin-takeover risk
**Where:** `api/middleware/auth.ts:27`, `api/routes/auth.ts:80,86`, `api/routes/analytics.ts:28`, `.env.example:2`
**What:** Verification falls back to a **publicly-known literal** `'your-super-secret-jwt-key-change-in-production'` if `JWT_SECRET` is unset; the signer falls back to a *different* literal `'secret'`; analytics uses a *third* path (`'secret'`). Nothing validates `JWT_SECRET` at startup, and `.env.example` ships `JWT_SECRET=change-me`. Verify also pins no algorithm (`jwt.verify(token, secret, cb)` with no `algorithms`).
**Impact:** If `JWT_SECRET` is ever unset or left as a guessable value in any deploy target, an attacker forges a token with `role:"admin"` and gains the entire `/api/admin` surface — video CRUD, **change any user's role** (`PUT /users/:id/role`), **delete any user** (`DELETE /users/:id`), bulk import. This is the single keystone: *all* authorization in the app reduces to this secret.
**Attack scenario:** Deploy with `JWT_SECRET` accidentally unset (no guardrail stops it) → `jwt.sign({id,email,role:'admin'}, 'your-super-secret-jwt-key-change-in-production')` → call admin endpoints.
**Fix:**
- Fail fast at process start if `JWT_SECRET` is missing or matches any known/weak default; refuse to boot.
- Remove all inline fallback literals; read the secret from one shared module.
- Pin `algorithms: ['HS256']` on every `jwt.verify`.
- Rotate the secret and require ≥32 bytes random in prod.

---

## High

### 2. No brute-force protection on authentication
**Where:** `api/routes/auth.ts:122` (verify), `:161` (login), `:227` (google); `api/services/registration.ts:272` (`attempts_count = 0` on resend)
**What:** `login`, `register-verify`, and `google` have **no rate limiter**. `register-init` has an **in-memory** IP+email limiter (`auth.ts:46-60`) that "resets on serverless cold start" — i.e. effectively per-instance on Vercel. The OTP 5-attempt cap (`registration.ts:166`) is **reset to 0 on every resend**, and resend is gated only by a 60 s cooldown + the cold-start-resettable IP limiter.
**Impact:** Online password brute force / credential stuffing on `login`; OTP brute force (1e6 keyspace, 5 guesses renewable every 60 s, multiplied across cold instances) on `register-verify`.
**Fix:** Use the existing durable Postgres limiter (`api/lib/rateLimit.ts` + `request_rate_limits`) on all auth POSTs. Do **not** reset `attempts_count` on resend (or cap total resends/lifetime). Add exponential backoff / temporary lockout on repeated login failures.

### 3. QUPU video scores are fully client-asserted → economy inflation
**Where:** `api/services/member.ts:82-104`; `src/lib/pendingScore.ts`; schema has **no** answer store for `videos` (only `wmi_questions.answer:497`, `wmi_concept_instances.answer:592`)
**What:** The video quiz has no server-side answer key. The client POSTs `correctAnswers`, validated only as `0 <= correctAnswers <= video.number_of_questions` (`member.ts:82-84`). Badge tier, completion XP, and **coins** all derive from this self-reported number. Anonymous users can stash a self-claimed score in `localStorage` (`pendingScore.ts`) and replay it after login.
**Impact:** Any user mints maximum badges + completion XP + coins on every video with a crafted request. Those coins are spendable in the live content shop (`shop_items`/`child_inventory`). The per-video `isCorrection` gate caps *repeat* completion grants on one video, but not the across-all-videos inflation. Also note WMI concept rewards are uncapped by design (`concept.ts:17-18`) and feed the same `coin_balance`.
**Why High (with caveat):** Breaks the reward economy, leaderboards, and any future paid/limited content. No real-money loss *today* (digital content, pre-launch), so this is "fix before the economy carries value or social comparison."
**Fix (pick per product intent):** server-delivered quizzes with server-side answer checking (largest, most correct); or decouple the spendable currency from self-reported video scores; or cap coin minting per day/child and treat video rewards as non-economic XP only.

### 4. Badge unlock overwrites instead of upgrade-only (earned-tier loss)
**Where:** `api/services/member.ts:148-160` (verified firsthand)
**What:** `INSERT … ON CONFLICT (child_id, video_id) DO UPDATE SET badge_count = EXCLUDED.badge_count, correct_answers = EXCLUDED.correct_answers` — **no `GREATEST`, no `WHERE EXCLUDED.badge_count > …`**. This contradicts CLAUDE.md's documented "only upgrade, never downgrade / `GREATEST`" invariant.
**Impact:** A kid who scores 5/5 (gold) and later re-opens the video and scores 2/5 has their stored `badge_count`/`correct_answers` **overwritten downward**. Propagates to displayed badge totals and the `badges_50_earned` achievement predicate (`achievementEvaluator.ts`). User-visible regression of earned rewards — corrosive in a rewards-driven kids' app.
**Fix:** `DO UPDATE SET badge_count = GREATEST(user_badge_unlocks.badge_count, EXCLUDED.badge_count), correct_answers = GREATEST(...)`, or add `WHERE EXCLUDED.badge_count > user_badge_unlocks.badge_count`. Add a regression test.

---

## Medium

### 5. Unauthenticated, unbounded analytics ingestion
**Where:** `api/routes/analytics.ts:15` (no `authenticateToken`, `app.ts:67`); `metadata` is `Joi.object().unknown(true)` with no size/shape cap; bounded only by `express.json({limit:'10mb'})` (`app.ts:52`). No rate limit.
**Impact:** Anonymous storage-cost/DoS via flooding `analytics_events` with 10 MB rows; junk data corrupts dashboards. Errors are swallowed to 204 (`analytics.ts:44-47`), so floods are invisible except `console.error`.
**Fix:** Rate-limit by IP/session; cap `metadata` size (e.g. a few KB) and validate shape; drop the 10 MB JSON limit globally (10 MB is far above any legitimate request here).

### 6. DB pool not configured for serverless
**Where:** `api/db.ts:12-18`
**What:** `new Pool({ connectionString })` with **no `max`, no `connectionTimeoutMillis`/`idleTimeoutMillis`, no SSL config, no `pool.on('error')` handler**.
**Impact:** On Vercel, each warm instance holds its own pool; many instances × unbounded connections → Postgres `max_connections` exhaustion under load. An idle-client error with no handler can crash the Node process (unhandled `'error'` event). No SSL may be rejected by managed Postgres.
**Fix:** Set a small `max` per instance (e.g. 1–5), add `idleTimeoutMillis`/`connectionTimeoutMillis`, `pool.on('error', …)`, and `ssl` per provider. Strongly consider a serverless pooler (PgBouncer / Neon / Supabase pooler / Prisma Accelerate-style) — this is the standard Vercel+Postgres production pattern.

### 7. Missing security headers + permissive CORS default
**Where:** `api/app.ts:40-50`
**What:** No `helmet` (no HSTS/X-Content-Type-Options/etc.). CORS: when `APP_ORIGIN` is unset, `origin: true` reflects **any** origin with `credentials: true`.
**Impact:** Reflect-any-origin + credentials is a misconfiguration pattern (low impact here since auth is Bearer-in-header, not cookies, but still wrong). No baseline hardening headers.
**Fix:** Add `helmet`. Require `APP_ORIGIN` at startup (fail-fast); never reflect-any in production; use an explicit allowlist.

### 8. Concurrency correctness under READ COMMITTED
**Where:** `db.ts:46` (bare `BEGIN`); `member.ts:86-100,166-180` (FC7); `loginBonus.ts:55` + `member.ts:515` and `progress.ts:59-66` (non-atomic assert→mutate)
**What:** (a) Two concurrent *first* submissions for the same `(child, video)` can both read `isCorrection=false` and each append completion XP under distinct `attempt.id` idempotency keys → double grant. (b) A few ownership checks run on a different connection/transaction than the mutation (`claimLoginBonus`, `getConceptProgress`, `getWatchedVideoIds`, `getGamificationSummary`). The coin **debit** itself is safe (atomic conditional UPDATE), so this is hardening, not an overspend hole.
**Impact:** Minor reward double-grant (low likelihood, low value); ownership gaps bounded by the fact children can't be reparented via API.
**Fix:** Key completion-XP idempotency on `(child_id, video_id)` rather than `attempt.id`, or take a per-(child,video) lock; fold the non-atomic ownership checks into their mutation's transaction.

### 9. Runtime DDL/seeding on first request
**Where:** `api/services/wmi/concepts/bootstrap.ts:8-98`
**What:** First WMI request lazily runs `ALTER TABLE … ADD COLUMN IF NOT EXISTS` and seeds 20 instances/concept, gated by a module-level promise latch.
**Impact:** Cold-start latency spikes; concurrent cold instances race on DDL (idempotent via `IF NOT EXISTS`/`ON CONFLICT`, but fragile); schema changes happen outside the migration system.
**Fix:** Move the DDL + seed into `db/migrations/` and run it at deploy, not at request time.

---

## Low

### 10. Login user-enumeration timing side-channel
**Where:** `api/routes/auth.ts:187-202` — not-found returns immediately; wrong-password runs bcrypt(12) first. Identical bodies, different timing. **Fix:** compare against a dummy hash on the not-found path.

### 11. Latent referral fraud + info disclosure
**Where:** `api/services/referrals.ts:22-30,84-113`, `api/routes/member.ts:251-270`
**What:** No reward is wired today (recording only), but: codes use `Math.random()` (not CSPRNG); `/me/referrals/use` echoes the referrer's internal `users.id` UUID verbatim and has no rate limit; there's no cap on `referrer_user_id` (unbounded Sybil if a reward is later attached); self-referral guard only covers the same-account case. **Fix before wiring any referral reward:** CSPRNG codes, don't echo the UUID, rate-limit the endpoint, add per-referrer caps + fresh-account constraint.

### 12. Inconsistent error→HTTP-status mapping
**Where:** `member.ts` GET handlers map `'Child not found'` to 400 in four places vs 404 elsewhere; `wmi-member.ts:61-72` maps a specific Indonesian string to 403. **Fix:** typed error classes (`NotFoundError`/`ForbiddenError`) instead of string matching; consistent codes.

### 13. Operational cleanup gaps
- `levelCurve.ts:22` module cache never invalidated → live `level_tiers` edits invisible until cold start.
- `request_rate_limits` rows never swept (`rateLimit.ts`).
- `purgeExpiredPendingRegistrations` (`registration.ts:300`) appears to have no caller → `pending_registrations` grows unbounded.
**Fix:** a periodic cleanup (cron / scheduled function) for expired rows; document the tier-cache immutability assumption or add invalidation.

### 14. WMI concept answer derivable client-side; concept rewards uncapped
**Where:** `engine.ts:89` sends `params`; `StorySumExplainer.tsx:79-80` recomputes the answer from them; `concept.ts:17-18` documents uncapped farming.
**What:** Server grading is correct and authoritative, but the answer is computable client-side pre-submission (fairness only), and uncapped concept rewards feed the shared `coin_balance` (ties into #3). **Fix:** if fairness matters, server-side rendering of figures so `params` need not be exposed; cap concept coin minting if the economy must be bounded.

---

## Info / hygiene
- **Stale docs/comments:** CLAUDE.md describes a much smaller app than exists (no gamification/shop/WMI/referrals/children); idle-timeout comment says "30m" but code is 15m (`useIdleLogout.ts:66`); referral migration claims Postgres-generated codes but code uses JS.
- **Dead code:** unreachable `if (!user.password_hash)` branch in login (`auth.ts:192-195`); refresh token issued but no `/refresh` route.
- **Schema drift:** legacy `supabase/migrations/` not in the active flow; unused `users` columns (`verification_token`, `reset_token`, `reset_token_expires`, `is_verified` for the password flow); bcrypt silently truncates passwords >72 bytes (Joi only enforces `min(8)`).
- **Tests:** vitest covers gamification/shop/WMI math, but there are no tests for the auth, ownership, or score-validation security paths.

---

## Recommended "must-fix before launch" shortlist
1. **#1** JWT secret fail-fast + remove fallbacks + pin algorithm. *(Critical — do first.)*
2. **#2** Durable rate limiting on auth + stop OTP attempt-reset-on-resend.
3. **#4** Badge upgrade-only fix (quick, high user-visible value).
4. **#6 / #7** Serverless DB pool config + helmet + required `APP_ORIGIN`.
5. **#3** Decide the economy-integrity stance for client-asserted scores (design call).
6. **#5** Lock down analytics ingestion (rate limit + metadata cap).

Items #8–#14 are launch-window hardening; #15 is tech-debt.

---

## Remediation status — 2026-06-04 (same day)

Typecheck clean, ESLint 0 errors, test suite 77 passed / 31 skipped (DB-integration suites skip without `TEST_DATABASE_URL`). No code committed.

| # | Status | What changed |
|---|--------|--------------|
| 1 | ✅ Fixed | New `api/lib/jwt.ts` — single secret source, fails fast at startup (`app.ts` `assertJwtSecret()`) when `JWT_SECRET` is missing, or default/short in production; HS256 pinned on verify. `middleware/auth.ts`, `auth.ts`, `analytics.ts` all route through it. No inline fallback literals remain. |
| 2 | ✅ Fixed | Durable Postgres rate limiter applied to `login` (10/5min), `register-init` (5/h IP + 5/day email), `register-verify` (10/10min), `register-resend` (5/h **per pendingId** — bounds the OTP attempt-reset), `google` (20/5min), and analytics (120/min IP). Rate-limit table key generalized UUID→TEXT (`db/migrations/0026_*`). |
| 3 | ⚠️ Deferred (design) | Left as a product decision. Full fix = server-delivered quizzes/answer-checking. Note: completion rewards are already once-per-video (the `isCorrection` gate) and bounded by video count; the unbounded earn path is concept farming (#14). |
| 4 | ✅ Fixed | `member.ts` badge upsert now uses `GREATEST(...)` — upgrade-only, matching the documented invariant. |
| 5 | ✅ Fixed | `analytics.ts`: per-IP rate limit (fail-open) + 4 KB metadata cap; global JSON body limit cut 10 MB → 1 MB. |
| 6 | ✅ Fixed | `db.ts`: `max` (env `PG_POOL_MAX`, default 5), idle/connection timeouts, opt-in SSL (`DATABASE_SSL`), and a `pool.on('error')` handler. |
| 7 | ✅ Fixed | `helmet()` added; `APP_ORIGIN` now required at startup in production (no reflect-any). |
| 8 | ◑ Partial | Login-bonus ownership check moved **inside** the claim transaction (`loginBonus.ts`). The concurrent-first-submit completion double-grant (attempt-scoped key) left as-is — very low likelihood/value; documented, not changed. |
| 9 | ✅ Fixed | Removed the runtime `ALTER TABLE` from `wmi/concepts/bootstrap.ts` (columns already in `schema.sql` + migration 0023). Idempotent instance seeding remains. |
| 10 | ✅ Fixed | `login` runs a dummy bcrypt compare on the unknown-email path (timing equalized); dead `!password_hash` branch removed. |
| 11 | ✅ Fixed | Referral codes use `crypto.randomInt`; `/referrals/use` no longer echoes the referrer UUID and is rate-limited (10/h); generate error message genericized. |
| 12 | ✅ Fixed | `statusForError()` helper — `'Child not found'` now maps to 404 consistently across member GET handlers. |
| 13 | ✅ Fixed | `api/services/maintenance.ts` + `GET /api/cron/cleanup` (CRON_SECRET-guarded) + Vercel cron (daily 03:00) purge expired pending registrations and stale rate-limit rows. |
| 14 | ⚠️ Deferred (design) | Concept reward farming + answer-derivable-from-params are intentional/structural; capping is a product call. |
| 15 | ◑ Partial | Fixed: stale idle-timeout/express-rate-limit comments, dead login branch. Left: CLAUDE.md staleness, legacy `supabase/migrations/`, unused `users` columns (doc/schema debt). |

**Deployment prerequisites introduced by these fixes:**
1. **Apply `db/migrations/0026_rate_limit_key_text.sql`** to existing databases.
2. **Set `JWT_SECRET`** to a unique ≥32-char value in production (the app now refuses to boot otherwise). Generate: `openssl rand -base64 48`.
3. **Set `APP_ORIGIN`** (comma-separated allowlist) in production.
4. **Set `CRON_SECRET`** so the maintenance cron is authorized.
5. Optional: `PG_POOL_MAX`, `DATABASE_SSL` (`verify` preferred).
6. `helmet` added to dependencies (`npm install` already run).
