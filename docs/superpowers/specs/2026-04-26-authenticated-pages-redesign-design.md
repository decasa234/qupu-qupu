# Authenticated Pages Redesign — Requirements

**Date:** 2026-04-26
**Scope:** Pure UI restyle of `/dashboard`, `/badges`, `/admin/videos` to match the visual language already shipped on `/`, `/login`, `/register`, `/onboarding/child`, `/videos`, `/videos/:slug`.
**Out of scope:** Content rewrites, new widgets, form restructure, API/schema changes.

---

## Context

The home/auth/videos pages were redesigned in the `redesign/public-pages` branch (commits `b7e74e7…a7d3450`) using a unified token system: dashed-orange hero borders, peach offset shadows, FontAwesome icons, `qupu-brand-blue` headings, and mascot accents on every shell. The three remaining pages still use the legacy tokens (`text-qupu-purple`, `border-qupu-peach`, `shadow-soft`, lucide icons) — they look out of place once a parent logs in.

This work brings them in line. No structural changes; pure token swap plus a few small additions (mascot peeks, FontAwesome icons, pill input/toggle styles for the admin form).

## Goals

- Visual consistency: parent flow (Login → Dashboard → Badges) and admin flow (`/admin/videos`) look part of the same product as the public pages.
- Reuse what's already been built (`AuthCard`, `Reveal`, `Slider`, `VideoCard`, `PillField` shell). Add at most one new shared component.
- Zero regression to existing flows: child switcher gating, progress fetch, badge fetch, admin video CRUD with badge rule editor.

## Non-goals

- New dashboard widgets (streaks, weekly summary, recommended next video).
- AdminVideos form restructure (tabs, wizard, multi-step). The 467-line single-page form stays as one form.
- Copy rewrites beyond eyebrow/title text already shown in the existing pages.
- API or schema changes.
- Mobile-specific layout overhauls — current responsive grids stay as-is.
- New animations beyond the existing `Reveal` cadence and button hover/active.

## Token mapping (applies to all 3 pages)

| Old | New |
|---|---|
| `text-qupu-purple` | `text-qupu-brand-blue` |
| lucide icons | FontAwesome equivalents |
| Header card: `border-qupu-peach bg-white shadow-soft` | `border-[3px] border-dashed border-qupu-brand-orange/60 bg-white shadow-[6px_8px_0_0_#FFD3B1]` |
| Inner content card: `border-qupu-peach shadow-soft` | `border-[3px] border-qupu-brand-blue/15 shadow-[5px_6px_0_0_#FFD3B1]` |
| Smallest item rows: `bg-qupu-shell` | unchanged |
| Eyebrow color | keep `text-qupu-brand-orange` |
| Top section wrapper | wrap in `<Reveal>` to match home/videos cadence |

## Per-page restyle

### `/dashboard` (`src/pages/Dashboard.tsx`)

- **Header card** — dashed-orange hero treatment. Mascot `/achievement-left.png` peeks from right column. 4 corner stars (`fa-solid fa-star text-qupu-brand-yellow`).
- **`SummaryCard` ×4** — keep `bg-qupu-shell`. Each gets a small FontAwesome chip top-left:
  - Attempt tersimpan → `fa-list-check`
  - Rata-rata skor → `fa-percent`
  - Video selesai → `fa-circle-check`
  - Badge kebuka → `fa-medal`
  - Big number colored `text-qupu-brand-blue`.
- **Recent attempts card** — new inner card token. Eyebrow `Aktivitas terbaru` paired with `fa-clock-rotate-left`. Row chips already colored — keep.
- **Best per video card** — new inner card token. Eyebrow paired with `fa-trophy`. Tier chip + "belum unlock" chip restyled as pill.
- **Right column profile card** — new inner card token. `BadgeCheck` → `fa-award`.
- **Empty state ("Pilih profil anak dulu")** — wrap in `AuthCard` shell with `/hero-mascot.png`. Eyebrow `Dashboard`, CTA navy w/ `fa-user-plus` "Tambah profil anak".
- **Loading skeleton** — replace gray pulse with `SkeletonCard` (see Shared Additions below).

### `/badges` (`src/pages/Badges.tsx`)

- **Header card** — dashed-orange hero treatment. Mascot `/achievement-right.png` peeks from right.
- **Family card** — new inner card token. Family color chip stays. Section icon `fa-medal`.
- **Unlock row** — `bg-qupu-shell` unchanged. Lucide `Sparkles`/`Trophy`/`Crown` map → FA `fa-star`/`fa-trophy`/`fa-crown`. Tier 3 unlocks gain 2 small overlapping yellow stars (`fa-star text-qupu-brand-yellow`) like the VideoDetail celebration.
- **Empty state** — wrap in `AuthCard` shell with `/hero-mascot.png`. Eyebrow `Badge`, CTA orange w/ `fa-compass` "Jelajahi video".
- **Loading skeleton** — `SkeletonCard`.

### `/admin/videos` (`src/pages/AdminVideos.tsx`)

- **New header card** — page currently starts cold with the form. Add a dashed-orange hero card: eyebrow `Admin · Videos`, title "Kelola video QUPU", 1-line subtitle, mascot `/hero-mascot.png` right column.
- **Form card** — wrap in new inner card token. Section sub-headers each get a FA icon: `fa-circle-info` Detail, `fa-medal` Badge rules, `fa-toggle-on` Status.
- **Text inputs** — reuse `PillField` shell shape from auth pages (rounded-full, peach border, focus orange). Extract pattern locally if not already exported.
- **Select inputs** — pill select matching `PillField` shell (cross-browser caveat — see Risks).
- **Number inputs** (`numberOfQuestions`, `sortOrder`) — small pill inputs, monospace digits.
- **Toggles** (`isPublished`, `isFeatured`) — rounded toggle pills:
  - Published: yellow when on, gray when off, `fa-eye` / `fa-eye-slash`
  - Featured: yellow when on, gray when off, `fa-star` / regular star
- **Badge rule rows ×3** — `bg-qupu-shell` row, tier chip colored per tier (1=blue, 2=orange, 3=yellow), min/max as small pill inputs.
- **Save button** — navy CTA `fa-floppy-disk` "Simpan video", same shape as home Subscribe button.
- **Cancel/New** — outline orange CTA `fa-plus` "Video baru".
- **Edit/Delete on list rows** — small icon-button pills: navy `fa-pencil` Edit, red-outline `fa-trash` Hapus.
- **Video list** — grid of mini cards, dashed border on hover, status badge `fa-circle-check` (published) / `fa-circle-pause` (draft).
- **Toast/message** — pill banner: green-50 + `fa-circle-check` for success, red-50 + `fa-triangle-exclamation` for error.

## Shared additions

- **`SkeletonCard`** — one new file (~15 lines): white card, dashed orange border, animate-pulse, peach offset shadow. Used by Dashboard and Badges loading states. Lives at `src/components/SkeletonCard.tsx`.
- **`AuthCard` reuse** — empty states on Dashboard and Badges wrap in the existing `src/components/AuthCard.tsx`. No new code there.

No other component extractions. No new routes. No API or schema work.

## Success criteria

- All 3 pages use new tokens (FA icons, dashed-orange hero card, peach offset shadow, `text-qupu-brand-blue`, mascot accents); visually indistinguishable in tone from `/`, `/videos`, `/login`.
- `npm run check` clean.
- `npm run lint` clean.
- `npm run build` clean.
- Existing flows still work end-to-end: child switcher gating, progress fetch, badge fetch, admin video CRUD (create/edit/delete), badge rule editor, publish/feature toggles.
- One new shared component (`SkeletonCard`); one reused (`AuthCard`).

## Risks

- **Form size.** AdminVideos has ~20 input nodes. Restyling selects can hit cross-browser quirks. Mitigation: same arbitrary `[&::-webkit-…]` selector trick already used in `src/components/Slider.tsx`.
- **AuthCard sizing for empty states.** Was designed for ~400px content slots. Empty-state copy on Dashboard/Badges must stay ≤ 2 lines or it overflows. Mitigation: cap copy length.
- **Toggle pill is a new pattern.** Not yet used elsewhere in the product. Risk: feels off-brand. Mitigation: build small, screenshot review before applying to both publish/feature toggles.

## Open questions

- None blocking. Mascot asset choice per page (`achievement-left` vs `achievement-right` vs `hero-mascot`) is reversible — picked on first pass, swapped if it feels off.

## Asset inventory

All assets already in `public/`:
- `/achievement-left.png`, `/achievement-right.png` — mascot peek illustrations.
- `/hero-mascot.png` — full mascot.
- `/logo-qupu.png` — header logo.
- FontAwesome 6.5.2 already loaded via CDN in `index.html`.

## Reference implementations

- `src/components/AuthCard.tsx` — hero shell pattern.
- `src/pages/Videos.tsx` — header card with mascot right column, dashed orange border, 4 corner stars.
- `src/pages/VideoDetail.tsx` — score celebration overlapping yellow stars (reused for Tier 3 badges).
- `src/pages/Login.tsx` — `PillField` input shape.
- `src/components/Slider.tsx` — cross-browser arbitrary Tailwind selector pattern.
- `src/components/Reveal.tsx` — entry animation cadence.
