# Public Pages Redesign — Design

**Date:** 2026-04-25
**Status:** Draft (pending user review)
**Scope:** Apply the home page's design language to the 5 public-facing pages.

## Problem

The home page (`Home.tsx` + `Layout.tsx`) was rebuilt with a cohesive design language: cream/peach palette, brand-blue (#30598A) navy, brand-orange (#EF711A), brand-yellow (#FFCE0C), peach offset shadows, dashed orange borders, FontAwesome icons, mascot illustrations, and `Reveal` spring motion. The five other public-facing routes still use the older Tailwind defaults (rounded-2xl, generic shadows, Lucide icons, no decoration), so they read as a different product.

This spec captures how we'll align those pages without rebuilding the data flow underneath.

## Scope

In: visual + interaction redesign of these five routes.

| Route | File |
|---|---|
| `/login` | `src/pages/Login.tsx` |
| `/register` | `src/pages/Register.tsx` |
| `/onboarding/child` | `src/pages/OnboardingChild.tsx` |
| `/videos` | `src/pages/Videos.tsx` |
| `/videos/:slug` | `src/pages/VideoDetail.tsx` |

Out of scope:

- Authenticated pages (`/dashboard`, `/badges`, `/admin/videos`).
- Backend endpoints, schema, or data shapes — none change.
- The `<ChildModal>` modal styling is consumed by Onboarding; it stays as-is unless it visibly clashes after the page redesign.

## Reference

The home page (current state at HEAD) is the visual reference. No external mockups.

## Shared patterns

Tokens and conventions reused across all five pages.

- **Page bg:** `bg-qupu-cream` (already on Layout).
- **Headings:** `font-display` + `text-qupu-brand-blue`.
- **Eyebrow labels:** uppercase small, `tracking-[0.18em]`, `text-qupu-brand-orange` (or yellow when on a navy bg).
- **Body text:** `text-qupu-muted` for forms, `text-qupu-blue-dark/85` for callouts.
- **Card surface:** white bg, rounded large (`rounded-[2rem]` or `rounded-[2.5rem]`).
  - Big page cards: `shadow-[6px_8px_0_0_#FFD3B1]`.
  - Child cards: `shadow-[4px_5px_0_0_#FFD3B1]`.
- **Card border:** optional `border-[3px] border-dashed border-qupu-brand-orange/60` for "fun" cards (auth, header, badge family). Solid `border-[3px] border-qupu-brand-blue/15` (hover orange) for content cards (video cards).
- **Form inputs (text):** rounded-full pills, `border-2 border-qupu-peach`, focus → `border-qupu-brand-orange`. FontAwesome icon left-pinned inside.
- **Sliders (numeric ranges):** `<input type="range">` styled via Tailwind:
  - Track: `bg-qupu-peach`, 8px, `rounded-full`.
  - Filled portion: `bg-qupu-brand-orange` (via gradient or accent-color).
  - Thumb: 28px white circle, `border-[3px] border-qupu-brand-orange`, `shadow-subscribe`.
  - Floating value chip above the thumb: navy bg, white bold number, downward triangle pointer.
  - Selectors: `[&::-webkit-slider-thumb]:` and `[&::-moz-range-thumb]:` arbitrary classes.
- **Primary CTA:** `rounded-full bg-qupu-brand-blue` + `shadow-subscribe`, white FontAwesome icon on a small white tile, hover `-translate-y-0.5`.
- **Secondary CTA:** `rounded-full border-[3px] border-qupu-brand-orange bg-white text-qupu-brand-orange`, hover inverts.
- **Decor:** scattered yellow `fa-solid fa-star` (FontAwesome) at varying sizes/opacities. Optional `Sparkles` from Lucide where established (we mostly migrated to FA).
- **Motion:** wrap each major card in the existing `<Reveal>` helper from `Home.tsx`. Spring transition (stiffness 95, damping 14, mass 0.9). Stagger nested children with `delay: index * 0.05–0.1`.

### New shared component

`src/components/AuthCard.tsx` — wrapper for the three auth pages. Props:

- `mascotSrc: string` — PNG path
- `eyebrow: string` — uppercase label
- `title: string`
- `subtitle?: string`
- `children: ReactNode` — form contents
- `footer?: ReactNode` — alt-action link below the form

Renders:

- Centered max-w container (`max-w-lg`).
- White card, `rounded-[2.5rem]`, dashed orange border, peach offset shadow.
- Mascot peeks from top-right (absolute, `-mt-12 -mr-4`, `h-28`).
- Eyebrow → title → subtitle stack at top.
- Form children below.
- Footer at the bottom, smaller and muted.
- 4 yellow FontAwesome stars at corners, varied sizes.
- Reveal motion on mount.

## Page designs

### Login (`/login`)

- `<AuthCard>` shell.
- `mascotSrc="/achievement-left.png"`, `eyebrow="MASUK"`, `title="Selamat datang kembali"`, `subtitle="Lanjutkan progres anak-anak kamu di QUPU"`.
- Form: email + password text pills with FontAwesome `fa-envelope`, `fa-lock` icons.
- Primary CTA: "Masuk ke akun" — navy pill, FontAwesome `fa-arrow-right-to-bracket` on white tile.
- Footer: "Belum punya akun? **Buat akun baru**" → `/register`.
- Existing post-login routing (children fetch + redirect) preserved.

### Register (`/register`)

- `<AuthCard>` shell.
- `mascotSrc="/achievement-right.png"`, `eyebrow="DAFTAR"`, `title="Buat akun orang tua"`, `subtitle="Satu akun untuk semua anak"`.
- Form: name, email, phone, password text pills with FontAwesome icons (`fa-user`, `fa-envelope`, `fa-phone`, `fa-lock`).
- Primary CTA: "Buat akun orang tua" — orange `qupu-brand-orange` pill (variation from Login to highlight create vs sign-in), FontAwesome `fa-user-plus`.
- Footer: "Sudah punya akun? **Login di sini**" → `/login`.
- Existing post-register redirect to `/onboarding/child` preserved.

### OnboardingChild (`/onboarding/child`)

- `<AuthCard>` shell.
- `mascotSrc="/hero-mascot.png"`, `eyebrow="PROFIL ANAK"`, `title="Tambah profil anak pertama"`, `subtitle="Setiap anak punya progres dan badge sendiri"`.
- Body: render the child-creation form inline (lift the form fields out of `<ChildModal>` so they appear on the page, not in a modal). Same fields: name, age group select, avatar color swatches.
- Primary CTA: "Simpan dan mulai" — orange pill, FontAwesome `fa-circle-check`.
- Footer: "Lewati untuk sekarang" → `/dashboard` (small, muted).
- Existing redirect logic preserved (auto-route to dashboard if a child already exists).

### Videos catalog (`/videos`)

**Page header card** — refined card-style:

- 2-column on `lg+`, stacked on mobile.
- Left column: eyebrow "KATALOG VIDEO" → title "Cari video QUPU favorit anak" → subtitle → search pill with `fa-magnifying-glass` icon and clear button. "Link YouTube terdeteksi" hint shows below when input matches a YouTube URL pattern.
- Right column (hidden on mobile): `hero-mascot.png` at `max-w-[320px]` with drop shadow.
- Card: `rounded-[2.5rem]`, white bg, dashed orange border, peach offset shadow, decor with 3-4 yellow FA stars.
- Reveal motion on the card.

**Video grid:**

- Refine `src/components/VideoCard.tsx`:
  - Card: `rounded-[2rem]` white, `shadow-[5px_6px_0_0_#FFD3B1]`, `border-[3px] border-qupu-brand-blue/15` → hover `border-qupu-brand-orange`, hover lift.
  - Thumbnail: aspect-video, subject pill top-left, hover overlay with FontAwesome `fa-play` on orange circle.
  - Body: title in navy (hover orange), small chip row (subject + age + question count), badge family chip at bottom-left, `Detail` orange pill at bottom-right with `fa-arrow-right`.
- Grid: 1 col mobile / 2 col sm / 3 col xl. `gap-5`. Each card wrapped in `motion.div` with `delay: index * 0.06` for parade entry.

**Loading state:** 6 skeleton cards `aspect-[4/5] bg-qupu-peach/40 animate-pulse`, staggered.

**Empty state:** dashed orange border card, cream `fa-magnifying-glass` icon tile, navy heading "Video belum ditemukan", body copy varies by whether the search looks like a YouTube URL, secondary "Hapus pencarian" pill.

### VideoDetail (`/videos/:slug`)

**Page layout:** `lg:grid-cols-[1.2fr_0.8fr]`, gap-8, stacks on mobile. All cards Reveal-animated with stagger.

**Video player frame** (left top): `rounded-[2rem] overflow-hidden bg-qupu-cream shadow-[6px_8px_0_0_#FFD3B1] border-[3px] border-qupu-brand-blue/15`, 16:9 iframe.

**Description card** (left bottom): white card, dashed orange border, peach offset shadow. Top meta pills row (subject color / age group / `{N} soal` / published date). Title in navy display font. Body in muted.

**Badge family card** (right top): white card, dashed orange border, peach offset shadow. Eyebrow "BADGE FAMILY" + family name in navy + "3 TIER" pill (family color) on the right. Family description below. Three tier rows stacked, each with tier color circle + name + correct-answer range + small "unlock" pill. Each row Reveals with `delay: 0.05 * i`.

**Score input card** (right bottom — centerpiece). Four states (3 entry states + 1 result state):

1. **Unauthenticated** → cream `fa-lock` tile, navy heading "Login untuk menyimpan progres", muted body, two stacked CTAs (orange "Buat akun" / outline "Sudah punya akun? Login").

2. **Authenticated, no active child** → cream `fa-user-plus` tile, navy heading "Pilih profil anak dulu", muted body, primary CTA "Tambah profil anak" opening `<ChildModal>`.

3. **Authenticated + active child** → score input UI:

   - Header: eyebrow "INPUT SKOR" + title "Skor {childName}" + small avatar dot.
   - Helper text: "Geser untuk masukkan jumlah jawaban benar."
   - Slider (0 to `numberOfQuestions`) with floating value chip (navy bg, white bold number).
   - Live tier preview card: color-coded by the matched tier, shows tier name + range. Wraps in `motion.div` keyed by tier number. When tier crosses a threshold, scale pop (0.9 → 1.05 → 1) and color cross-fade. If the score doesn't reach tier 1, show "Belum membuka badge — coba lagi".
   - Primary CTA: "Simpan skor {score}/{N}" — navy pill with `fa-floppy-disk` on white tile, `shadow-subscribe`, hover lift, disabled until score is set.

4. **Result** (replaces 3 after successful submit):

   - Cream gradient panel inside the card.
   - Big `text-6xl` score percentage in navy display font.
   - Unlocked badge tier chip (color from rule, FontAwesome icon by `iconName`), animates with scale + slight rotate, yellow star burst behind it.
   - Message: "Badge kamu naik tier!" when `isUpgrade`, else "Badge untuk hasil ini sudah tersimpan."
   - Two CTAs at bottom: primary "Lihat dashboard" (navy pill) + secondary "Coba skor lain" (resets state to step 3).

**Not-found state:** dashed orange card, cream `fa-circle-question` icon tile, navy heading "Video belum tersedia", body, "Kembali ke beranda" orange pill.

## Success criteria

A user navigating from the home page to any of these five routes feels they're in the same product. Specifically:

- All cards on these pages use the peach offset shadow + (where applicable) dashed orange border.
- All primary CTAs use the navy `shadow-subscribe` + FontAwesome icon-on-white-tile pattern.
- Form text inputs are pill-shaped with the peach border + orange focus.
- Numeric range inputs use the new slider pattern (with floating value chip).
- The score-input card cycles through the three states based on auth + active child without flicker.
- Reveal motion fires once per session, respects `prefers-reduced-motion`.
- No regressions in routing, auth flow, score submission, or child handling.

## Implementation notes (for the plan)

- New file: `src/components/AuthCard.tsx`. Refactor Login/Register/OnboardingChild to consume it.
- Modify `src/pages/Login.tsx`, `Register.tsx`, `OnboardingChild.tsx`, `Videos.tsx`, `VideoDetail.tsx`.
- Modify `src/components/VideoCard.tsx`.
- No new dependencies — `framer-motion` and FontAwesome already present.
- The slider component is straightforward Tailwind on `<input type="range">`. Consider extracting it to `src/components/Slider.tsx` if both Onboarding (age) and VideoDetail (score) end up using it; otherwise inline in VideoDetail.
- Move `<Reveal>` from `src/pages/Home.tsx` to `src/components/Reveal.tsx` so all redesigned pages can import it without circularity. Update Home to import from the new location.
- Lift the child-creation form fields out of `<ChildModal>` into a smaller `ChildForm` component that both the modal and the OnboardingChild page can render.

## Open questions

None remaining. All clarifying questions resolved during the brainstorm:

- Scope: 5 public pages (decided).
- Reference: home page design language (decided).
- Auth layout: centered card (decided).
- Auth mascots: achievement-left / achievement-right / hero-mascot (decided).
- Catalog header: refined card-style (decided).
- Score input: slider + live tier preview (decided).
- Sliders apply to any numeric range (decided).

## Sources & references

- Home page implementation: `src/pages/Home.tsx`, `src/components/Layout.tsx`, `src/components/Navbar.tsx`.
- Reveal component definition: `src/pages/Home.tsx` (function `Reveal`).
- Tailwind tokens: `tailwind.config.js`.
- Existing data flow: `api/services/member.ts` (`submitVideoScore`), `api/routes/member.ts`, `api/routes/auth.ts`.
