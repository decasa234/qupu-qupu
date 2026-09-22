# QUPU Design System

The colour, elevation, radius and motion contract for the QUPU frontend.
**This file is the source of truth.** `tailwind.config.js` implements it; the
`qupu-ui` skill teaches it. If the code and this file disagree, the code wins —
then fix this file in the same commit.

Checkpoint: `4179fe0f`.

---

## 1. The four surfaces

QUPU is not one look. Every screen belongs to exactly one of these, and they
must not borrow from each other.

| Surface | Shell | Routes | Register |
|---|---|---|---|
| **Kid app** *(default for members)* | `AppShell.tsx` | `/belajar`, `/main`, `/profil`, `/badges`, `/shop`, `/streak`, `/latihan/**`, `/wmi-arena/**` | Phone-shell game app. Orange chrome bars top + bottom, candy 3D buttons, hard shadows, bottom sheets. |
| **Marketing / auth** | `Layout.tsx` | `/`, `/videos/**`, `/wmi`, `/harga`, `/login`, `/register`, legal | Playful web page. Cream body, mascots, star sprinkles, `<Reveal>` scroll-ins, peach hard-shadow cards. |
| **Parent** | own page chrome, PIN-gated | `/parent` | Calm brand. Same tokens as marketing, no mascots, no game chrome. |
| **Admin** | `AdminLayout.tsx` | `/admin/**` | Warm utilitarian. `admin-*` tokens only. No mascots, no stars, no hard shadows. |

Plus one non-screen palette: **WMI figures** (§7) — the SVG illustrations under
`src/components/wmi/PastPapers/` and `src/components/wmi/concepts/`.

---

## 2. Core brand palette

These carry the identity and appear on every non-admin surface.

| Token | Hex | Role |
|---|---|---|
| `qupu-brand-blue` | `#30598A` | **Primary.** Headings, filled buttons, footer, node chips. |
| `qupu-blue-deep` | `#0E1430` | Hard-shadow under `qupu-brand-blue`. **The current standard.** |
| `qupu-brand-blue-shadow` | `#263B55` | Legacy shadow (`shadow-subscribe`). Marketing surface only. |
| `qupu-brand-orange` | `#f0853a` | **Accent.** Chrome bars, eyebrows, CTA fills, spotlight rings. |
| `qupu-orange-edge` | `#C46123` | Hard-shadow / border under `qupu-brand-orange`. |
| `qupu-orange` | `#F97316` | Hotter orange — flames, mascot cheeks, illustration accents. |
| `qupu-orange-dark` | `#EA580C` | Deeper orange, gradients. |
| `qupu-brand-yellow` | `#ffdd55` | Stars, level-5 gold, footer column titles. |
| `qupu-peach` | `#FFD3B1` | **The peach hard-shadow drop.** Also soft borders on inputs. |
| `qupu-cream` | `#FFF2DF` | `<body>` background (set in `index.css` — never repaint it). |
| `qupu-app` | `#FFF8F0` | Kid-app surface. Brighter than cream. |
| `qupu-shell` | `#FFF9F4` | Nested chip / input background. |
| `qupu-edge` | `#FFE3CC` | Warm hairline ring on app surfaces (`ring-1 ring-qupu-edge`). |
| `qupu-parchment` | `#EFE2CC` | Drag handles, inert tan dividers. |
| `qupu-ink` | `#1E3A8A` | Default body text. |
| `qupu-muted` | `#475569` | Secondary text, captions, helper copy. |

**Pick blue or orange, not both, for a given element's fill + shadow.** Blue fill
takes `#0E1430`; orange fill takes `#C46123`; white pills on orange chrome take
`#C46123`.

## 3. Progress green

The "grown / correct / done" register. Distinct from brand orange — orange means
*go do this*, green means *you did it*.

| Token | Hex | Role |
|---|---|---|
| `qupu-grass` | `#58A700` | Filled progress arcs, correct bar, level-3 node, primary "Lanjut" button. |
| `qupu-grass-deep` | `#3F7A18` | Side rim / hard-shadow under grass. Also level-4 node fill. `#3C7400` appears in `TrackLesson.tsx` for the same job — a stray; use the token. |
| `qupu-grass-ink` | `#2D6B00` | "Benar!" text on a light green tint. |
| `qupu-grass-tint` | `#E8F5D6` | Correct-answer panel background. |

Wrong answers use Tailwind's **rose** scale (`border-rose-200 bg-rose-50
text-rose-600`, dot `bg-rose-400`) — never red-500. Rose reads as "try again",
not "error".

## 4. Accent colours (single-purpose)

Use only for the thing named. Do not repurpose.

| Hex | Meaning |
|---|---|
| `#D9A406` | Coins. The gold coin icon, shop prices. |
| `#FFE159` / `#D9A800` / `#8A6400` | Cleared-gate crown: face / rim / icon. |
| `#F59E0B` | Twinkling stars on a mastered node; amber highlights. |
| `#8A5BF0` | Shop items + purchase celebration. |
| `#E7E2D6` / `#D8D2C2` / `#9AA0AC` | Locked node: face / rim / icon. |
| `#C3CAD6` | Locked chip background. |

## 5. Elevation — the hard-shadow system

QUPU has **no soft shadows** on kid or marketing surfaces. Depth is a solid,
blur-free offset. Three families:

**a. Peach drop (cards).** Offset down-right, colour `#FFD3B1`.
```
shadow-[3px_4px_0_0_#FFD3B1]   small secondary boxes
shadow-[5px_6px_0_0_#FFD3B1]   standard card              ← default
shadow-[6px_8px_0_0_#FFD3B1]   hero / auth / banner
shadow-[8px_10px_0_0_#FFD3B1]  the lg+ phone frame
```

**b. Button underline (tap targets).** Straight down, no x-offset. Depth scales
with the element: 2px pill → 6px card-button. Collapses on press.
```jsx
className="tap-press bg-qupu-brand-orange shadow-[0_4px_0_0_#C46123]
           active:translate-y-0.5 active:shadow-[0_2px_0_0_#C46123]"
```
Colour follows the fill: blue → `#0E1430`, orange → `#C46123`, grass → `#3F7A18`.
`.tap-press` (in `index.css`) gives the instant-press / springy-release timing —
always pair it with `active:translate-y-*`.

**c. Candy rim (track nodes).** A *static* solid-colour layer behind a circular
face, offset down by 6–9px; the face sinks part-way onto it on press. The rim
never moves or changes colour. See `TrackNode.tsx` and `themes.ts` (`rimHex`).
Add `shadow-[inset_0_6px_8px_-3px_rgba(255,255,255,0.65)]` for the gloss.

Soft shadows are allowed in exactly two places: bottom sheets
(`shadow-[0_-6px_28px_rgba(0,0,0,0.16)]`) and the admin `shadow-admin-soft`.

## 6. Radius, type, motion

**Radius** — arbitrary values, always larger than Tailwind's defaults:
`2.75rem` phone frame · `2.5rem` hero · `2rem` primary card & sheet top ·
`1.75rem` feature · `1.5rem` secondary · `1.25rem` chip · `rounded-full`
buttons/pills/inputs · `rounded-md` icon chiclets inside buttons.

**Type** — `font-display` (Fredoka) for titles, labels, buttons, numbers-as-statement;
default `font-sans` (Nunito) for prose. Kid-app weights run heavier than
marketing: `font-black` on buttons and node chips, `font-extrabold` on marketing
CTAs. Eyebrow: `text-xs font-bold uppercase tracking-[0.22em]
text-qupu-brand-orange` (`0.18em` for form labels, `0.12em` for node chips).

**Motion** — named keyframes live in `tailwind.config.js` (`rise`, `tapPop`,
`twinkle`, `bob`, `breathe`, `ring`) and `index.css` (`flame-pop`, `spark-burst`,
`pin-shake`, `goal-fill`, `badge-shine`, `reward-*`, `plant-bob`, `drop-drip`,
`worm`). Prefix looping animations with `motion-safe:`. `prefers-reduced-motion`
is handled globally in `index.css` — no per-component logic. `<Reveal>` scroll-in
is **marketing only**; the kid app uses `animate-rise` on sheets instead.

## 7. WMI figure palette (SVG only)

The illustrations use a separate, Tailwind-derived palette so a figure reads as a
diagram, not as chrome. Do not use these in UI; do not use §2 tokens in figures.

| Role | Fill | Tint | Ink |
|---|---|---|---|
| Neutral / structure | `#1F2937` | `#E5E7EB` | `#374151` |
| Blue (primary group) | `#2563EB` | `#E1EFFB` | `#30598A` |
| Green (correct / set A) | `#10B981` | `#D1FAE5` | `#065F46` |
| Amber (highlight / set B) | `#F59E0B` | `#FEF3C7` | `#92400E` |
| Red (wrong / excluded) | `#DC2626` | `#FEE2E2` | `#991B1B` |
| Orange (accent) | `#F0853A` | `#FFF7ED` | `#B45309` |

Grays `#6B7280` / `#9CA3AF` / `#CBD5E1` / `#D1D5DB` for rules, gridlines, and
faded elements. See `docs/reference/competition-papers/PRIMITIVE-INDEX.md` before
drawing anything new.

## 8. Admin palette

Warm neutrals only. Accent is `qupu-brand-blue`, highlight `qupu-brand-orange`.

`admin-bg #F7F3EC` · `admin-card #FFFFFF` · `admin-sunk #FAF6EF` ·
`admin-line #E9E1D5` · `admin-edge #D9CFC0` · `admin-ink #332E29` ·
`admin-muted #736B61` · `admin-faint #A99F92` · `shadow-admin-soft`

Compose `src/components/admin/ui.tsx`; don't re-type raw Tailwind there.

---

## 9. Rules

1. **No new raw hexes in UI code.** If a colour isn't in §2–4, add a token here
   and to `tailwind.config.js` first. (Figures §7 and per-theme `rimHex` values
   are the exceptions.)
2. **No soft shadows** on kid/marketing surfaces — §5 or nothing.
3. **No Tailwind default radii** (`rounded-lg/xl/2xl`) — §6.
4. **No generic grays** (`gray-*`, `slate-*`) outside admin. Use `qupu-muted`.
5. **No `dark:` classes.** `color-scheme: light` is forced.
6. **No emoji.** Font Awesome 6 (`fa-solid fa-*`) or lucide-react — one set per
   component, never mixed for the same role.
7. **Don't repaint the body background.** `Layout`/`AppShell` own it.
8. **Don't import `src/components/ui/Button.tsx` or `Input.tsx`** — abandoned
   scaffolding referencing undefined `bg-primary` tokens.

## 10. Reference implementations

| Pattern | File |
|---|---|
| App shell + phone frame | `src/components/AppShell.tsx` |
| Orange chrome bar (top / bottom) | `app-shell/TopStatStrip.tsx`, `app-shell/BottomTabBar.tsx` |
| Candy 3D node | `wmi/track/TrackNode.tsx` + `wmi/track/themes.ts` |
| Bottom sheet | `wmi/track/TrackConceptSheet.tsx` |
| Blue action card | `dashboard/HomeActionCards.tsx` |
| Answer feedback (correct / wrong) | `src/pages/TrackLesson.tsx` |
| Celebration / reward modal | `wmi/KonsepCeremony.tsx`, `PostQuizRewardSummary.tsx` |
| Marketing hero + banners | `src/pages/Home.tsx` |
| Emphasis card, mascot + stars | `src/components/AuthCard.tsx` |
| Pill input | `src/components/PillField.tsx` |
| Admin kit | `src/components/admin/ui.tsx` |
