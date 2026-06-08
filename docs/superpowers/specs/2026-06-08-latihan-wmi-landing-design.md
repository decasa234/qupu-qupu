# Latihan WMI — Landing Section, Dedicated Page & Pricing (V1)

- **Date:** 2026-06-08
- **Branch:** `landing-page-refinements`
- **Status:** Approved design — ready for implementation planning
- **Author:** brainstormed with Claude (superpowers:brainstorming)

## 1. Goal

Promote **Latihan WMI** (QUPU's World Mathematics Invitation practice) to **parents** on the public
marketing surface, so they believe their kid can learn real olympiad math concepts **"with fun, like
playing games."** Convert that belief into free sign-ups.

Three deliverables, all on the **logged-out marketing surface**, fully decoupled from the member app:

1. A **promo band** for Latihan WMI on the Home (landing) page.
2. A **dedicated `/wmi` page** that convinces parents it's worth trying.
3. A **pricing section** (only a **Free** tier in V1; paid tiers shown as "Segera"/coming soon), rendered
   on **both** Home and `/wmi`, plus lightweight **plan data scaffolding** in the backend.

## 2. Context (current state)

- Landing page is `src/pages/Home.tsx` — one long page; sections are **local function components**
  composed in the main return (~lines 104–128) inside a `space-y` stack wrapped in `<Reveal>`.
- WMI is **fully built but entirely behind login**: member routes `/latihan/wmi`, `/latihan/wmi/drill`,
  `/latihan/wmi/konsep`, `/latihan/wmi/ujian`, etc. (under the member `AppShell`). There is **no public/
  parent-facing teaser** today.
- **72 concept-explainer components** exist under `src/components/wmi/concepts/explainers/`, exposed via a
  registry `registry.ts` → `EXPLAINERS: Record<string, ComponentType<ExplainerProps>>` and
  `getExplainer(slug)`. They are **self-contained**: no API, no auth/zustand, no router hooks. They take
  `ExplainerProps` (`params`, `correctAnswer`, `lang?`, `step?`, `playing?`, step callbacks) and animate
  via `useBeatControl`.
- **No pricing/plan/subscription concept exists** anywhere (DB, API, UI). Everything is currently free.
  `level_tiers` is XP gamification, **not** billing.
- Public marketing pages use the `Layout` wrapper (e.g. `/`, `/videos`); member pages use `AppShell`.
- Public nav (`src/components/Navbar.tsx`, `NAV_ITEMS_PARENT` ~lines 51–55, with a mobile mirror): Beranda,
  Kategori, Video.
- Brand tokens (`tailwind.config.js`): `qupu-brand-blue #30598A`, `qupu-brand-orange #f0853a`,
  `qupu-brand-yellow #ffdd55`, `qupu-cream #FFF2DF`, `qupu-peach #FFD3B1`; Baloo 2 (display) + Nunito
  (body); hard-shadow "clay" cards, rounded `[1.75rem]`–`[2.5rem]` surfaces. UI copy is **Indonesian**.
- Icon policy: **Font Awesome 6 only, never emoji** (project convention).

## 3. Decisions locked during brainstorm

1. **Delivery = Approach A** ("Marketing layer + demo sandbox"): new, decoupled public components; the
   live demo mounts existing explainers in a no-login sandbox. Member app untouched.
2. **Proof of value = live playable demo (no login)** — reuse real explainer components.
3. **Pricing scope = "Free plan + data scaffolding"**: real UI for a Free tier + a dormant `plan` field in
   the data model to prep future gating. **Nothing is gated in V1.**
4. **Pricing placement = section on Home + section on `/wmi`** (shared component), **no standalone route**.
5. **Pricing layout = Option C** — one Free card + a compact "Segera hadir" strip of locked future-feature
   chips.
6. **Trust strategy (no fabrication)**: real-olympiad framing + founder/educator story + live demo + **true
   content-coverage stats** + "be among the first" CTA. **Testimonials component built but hidden** until
   real quotes exist.
7. **Founder story = editable placeholder** in V1 (structured for later swap-in).
8. **Page order on `/wmi`: demo at #2** (right after hero). Keep the order below.

## 4. Non-goals (V1)

- No payment/checkout, no real paid tiers, no entitlement gating, no feature-locking by plan.
- No guest sessions into the member WMI app; the demo is a standalone sandbox, not the real drill flow.
- No admin UI for managing plans or testimonials.
- No changes to existing member routes/components under `/latihan/wmi`.
- No fabricated usage numbers or testimonials anywhere.

## 5. Information architecture

### 5.1 Dedicated page `/wmi` (`LatihanWmiPage`) — 9 bands, top→bottom

1. **Hero** — headline "Olimpiade matematika, dimainkan seperti game"; parent-reassuring subhead; CTAs
   "Daftar Gratis" (→ `/register`) + "Main Demo" (scroll to band 2).
2. **Live demo — tanpa login** (`WmiConceptDemo`) — the interactive proof. Concept tabs (~2), step play +
   replay, ID caption, conversion CTAs underneath.
3. **Apa itu WMI?** — explains the real World Mathematics Invitation; builds reasoning not rote; Kelas 0–3.
4. **Cara belajarnya: Konsep → Drill → Ujian** — the gamified journey (XP, badge, confetti) = "fun like
   games."
5. **Angka QUPU** (`WmiTrustStats`) — **true** content-coverage counts from `/api/public/wmi-stats`.
6. **Cerita pendiri** — founder/educator credibility (editable placeholder copy + photo/credential slot).
7. **Testimoni** (`WmiTestimonials`) — **renders nothing while the list is empty**; dormant in V1.
8. **Harga** (`WmiPricingSection`) — Free tier + "Segera" strip (layout C).
9. **CTA penutup** — "Jadi salah satu keluarga pertama" early-adopter framing → "Daftar Gratis".

### 5.2 Home page inserts (only 2 new bands; everything else untouched)

- `<LatihanWmiSection />` with `id="wmi"` — inserted **after `ScoreBadgeCtaSection`, before `VideosSection`**.
- `<WmiPricingSection />` with `id="harga"` — inserted **near the bottom** (after `SubscribeCtaSection`).
- Both wrapped in `<Reveal>` to match the existing pattern.

### 5.3 Routing & navigation

- Add public route `path="wmi" element={<LatihanWmiPage />}` inside the existing public `Layout` block in
  `src/App.tsx` (mirror the `/videos` declaration). **Distinct from member `/latihan/wmi`.**
- Navbar: add public item **"Latihan WMI" → `/wmi`** to `NAV_ITEMS_PARENT` (and the mobile mirror).
- Optional: add **"Harga" → `/#harga`** public item (scrolls to the Home pricing band).

## 6. Component design (all new; under `src/components/wmi/marketing/` unless noted)

### `WmiConceptDemo.tsx` — no-login sandbox
- A thin tabbed wrapper around the existing self-contained `src/components/wmi/WmiExplainer.tsx` (explainer +
  Replay + step controls, no auth/network/router), fed a curated `slug` + hardcoded `params` + `correctAnswer` from
  `src/data/wmiMarketing.ts`. `lang="id"`. Drives step/play with `useBeatControl` (same hook the member
  drill uses). Replay button; tab toggle between the ~2 featured concepts; step-dots.
- **Featured concepts (primary):** `money-shopping-change` (Belanja & Kembalian) and `dice-net-fold`
  (Lipat Dadu). **Backups** if static params render awkwardly: `single-digit-addition`, `block-count-3d`.
  Implementer must visually verify the chosen instances animate cleanly with the hardcoded params.
- No network, no auth, no router. Pure client widget.

### `LatihanWmiSection.tsx` — Home promo band (`id="wmi"`)
- Brand-blue clay card. Left: pill "Baru · Latihan WMI", headline, 3 value bullets (FA check icons), CTA
  "Coba Latihan WMI →" (→ `/wmi`). Right: compact demo-preview tile with a "Main demo" overlay (→ `/wmi`).
- Keep compact — this page is already long.

### `WmiPricingSection.tsx` — shared pricing (layout C), `id="harga"`
- Props allow a `compact` variant (Home) vs full (`/wmi`).
- One **Free** card ("Mulai Gratis", "Rp 0", true V1 features: semua video edukatif; Latihan WMI
  konsep·drill·ujian; XP/badge/progress anak; Kelas 0–3). Below it a "SEGERA HADIR" strip of locked chips
  (placeholder labels: Laporan mendalam, Kelas guru, Bimbingan — confirm/rename freely).
- Tier/feature copy lives in `src/data/wmiMarketing.ts` so it's editable without touching JSX.
- Primary CTA on the Free card → `/register`.

### `WmiTrustStats.tsx` — content-coverage band
- Fetches `/api/public/wmi-stats`; shows counts (konsep, soal ujian/papers, video, grades). **Graceful
  fallback**: if the fetch fails, hide the band (never break the page). Optional static fallback copy.

### `WmiTestimonials.tsx` — dormant
- Reads `testimonials: Testimonial[]` from `src/data/wmiMarketing.ts` (empty in V1). Returns `null` when
  empty. Designed so real quotes drop in later with no redesign.

### Founder band
- Part of `LatihanWmiPage`; clearly-marked **placeholder** copy + photo/credential slot. Content to be
  supplied later by the user.

### `src/data/wmiMarketing.ts` — single source of editable marketing content
- `demoConcepts: { slug, params, correctAnswer, titleId, captionId }[]`
- `pricing: { freeFeatures: string[], comingSoon: string[], ... }`
- `founder: { name, blurb, credentials, photo? }` (placeholder values)
- `testimonials: Testimonial[]` (empty `[]`)

## 7. Backend

### 7.1 Public stats endpoint
- `GET /api/public/wmi-stats` (no auth) → `{ concepts, papers, videos, grades }`.
- Implemented as a thin route delegating to a service that runs cheap `COUNT`s:
  - `SELECT COUNT(*) FROM wmi_concepts WHERE enabled = true`
  - `SELECT COUNT(*) FROM wmi_papers`
  - `SELECT COUNT(*) FROM videos WHERE is_published = true AND deleted_at IS NULL`
  - distinct grades covered (e.g. from `wmi_papers.grade`)
- Mount on the existing public router (confirm exact file: `api/routes/public.ts` vs `meta.ts`/
  `wmi-public.ts`) following the thin-route → service convention. Validate nothing (no input). Returns the
  standard `{ success, data }` shape used elsewhere.

### 7.2 Plan scaffolding (dormant hook, no gating)
- Migration `db/migrations/0034_user_plan.sql` (0033 is already taken by `wmi_curriculum.sql`):
  ```sql
  ALTER TABLE users
    ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
      CHECK (plan IN ('free','premium','pro'));
  ```
- Mirror the column into `db/schema.sql`'s `users` table (fresh installs include all migration changes per
  project convention).
- Surface `plan` (read-only) in the `/api/users/me` response (profile read). **No write path, no gating.**
- The `'free'/'premium'/'pro'` enum is an **internal** value set only — it is **not** shown to users. All
  visible tier/feature labels come from `src/data/wmiMarketing.ts` (Indonesian, e.g. "Gratis").

## 8. Copy & i18n

- All new copy is **Indonesian**, matching the existing playful-yet-reassuring Home voice.
- Hero headline: **"Olimpiade matematika, dimainkan seperti game."**
- Tone: speak to **parents** (educational value, structured, safe, real olympiad) while showing **kid
  delight** (XP, badge, confetti). No fabricated claims.
- Centralize user-facing marketing strings in `src/data/wmiMarketing.ts` where practical.

## 9. Visual / brand conventions

Follow the QUPU visual language (per the `qupu-ui` skill): Baloo 2 headings, Nunito body, brand-blue/orange/
yellow + cream/peach, hard-shadow "clay" cards, generous rounded corners, `<Reveal>` scroll-ins, Font
Awesome 6 icons (**never emoji**), mobile-first. Reuse existing patterns from `Home.tsx` sections.

## 10. Success criteria

- A logged-out visitor can: reach `/wmi` (public), **play a concept with no account**, read the real-WMI
  explainer + true stats, see the Free pricing card with the "Segera" strip, and click **Daftar Gratis**
  (→ `/register`).
- The Home page shows the WMI promo band (after the Score & Badge journey) and the pricing band (near
  bottom); both link/scroll correctly.
- Public nav exposes "Latihan WMI".
- `/api/users/me` returns `plan` (defaulting to `free`).
- **The member WMI app (`/latihan/wmi*`) is behaviorally unchanged.**
- Mobile-first/responsive; `npm run check` and `npm run lint` pass.

## 11. Verification plan (no test runner configured)

1. `npm run check` (tsc) and `npm run lint` clean.
2. Manual / webwright pass (logged out): load `/` → see WMI promo + pricing bands; load `/wmi` → play both
   demo concepts, replay works, CTAs route to `/register`; `WmiTrustStats` shows numbers (and degrades
   gracefully if the endpoint is stubbed to fail).
3. Apply migration `0033` to a dev DB; confirm `/api/users/me` returns `plan: 'free'`.
4. Sanity-check the member app: log in, open `/latihan/wmi` and the konsep drill — unchanged.

## 12. Open items / placeholders to fill later (intentional, not gaps)

- Founder/educator story real copy + photo/credentials (V1 ships an editable placeholder).
- Real testimonials (component ships dormant/empty).
- Final names for future tiers and the "Segera" feature chips (placeholders: Juara/Sekolah; Laporan
  mendalam/Kelas guru/Bimbingan).
- Confirm exact public-router filename during implementation.
- (Optional later) run a 5–10 family pilot to harvest real testimonials, then populate `testimonials`.
