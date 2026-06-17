# Rebrand Concept/Umbrella Copy to "Math Olympiad" — Implementation Plan (Sub-project B)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the brand-agnostic concept system and the practice-hub umbrella from "WMI" to "Olimpiade Matematika" / "Math Olympiad" in user-facing copy, while keeping "WMI" on the genuinely-WMI exam papers/drill items.

**Architecture:** Pure string edits in 6 React page files. No routes, no `wmi_*` code/DB identifiers, no data model, no logic. Indonesian learner chrome → "Olimpiade Matematika"; English admin chrome → "Math Olympiad".

**Tech Stack:** React 18 + TypeScript + Tailwind (`src/`). Verified with `npm run check` (tsc), `npm run lint`, and grep guards.

**Spec:** `docs/superpowers/specs/2026-06-16-rebrand-concepts-math-olympiad-design.md`

---

## File structure

| File | Change |
|---|---|
| `src/pages/LatihanHub.tsx` | 3 strings (hub title, subtitle, feature-list "(WMI)") |
| `src/pages/WmiHub.tsx` | 1 string (hub h1) |
| `src/pages/WmiKonsepDrill.tsx` | 1 string (concept eyebrow) |
| `src/pages/Report.tsx` | 1 string (concept progress label) |
| `src/pages/admin/AdminWmiConcepts.tsx` | 2 strings (eyebrow + title) |
| `src/pages/admin/AdminDashboard.tsx` | 1 string (concept tile) |

No tests are added — these are static strings on pages with no existing test coverage; verification is typecheck + lint + grep guards.

---

## Task 1: Learner-facing copy → "Olimpiade Matematika"

**Files:**
- Modify: `src/pages/LatihanHub.tsx`
- Modify: `src/pages/WmiHub.tsx`
- Modify: `src/pages/WmiKonsepDrill.tsx`
- Modify: `src/pages/Report.tsx`

- [ ] **Step 1: Edit `LatihanHub.tsx` — hub title**

Replace:
```tsx
            <h2 className="font-display text-xl font-black leading-tight">Latihan WMI</h2>
```
with:
```tsx
            <h2 className="font-display text-xl font-black leading-tight">Olimpiade Matematika</h2>
```

- [ ] **Step 2: Edit `LatihanHub.tsx` — subtitle (drop the WMI expansion)**

Replace:
```tsx
            <p className="text-[11px] font-bold text-white/80">World Mathematics Invitation</p>
```
with:
```tsx
            <p className="text-[11px] font-bold text-white/80">Latihan bergaya olimpiade internasional</p>
```

- [ ] **Step 3: Edit `LatihanHub.tsx` — feature list item (drop "(WMI)")**

Replace:
```tsx
  { icon: 'fa-solid fa-medal', text: 'Soal bergaya olimpiade matematika internasional (WMI).' },
```
with:
```tsx
  { icon: 'fa-solid fa-medal', text: 'Soal bergaya olimpiade matematika internasional.' },
```

- [ ] **Step 4: Edit `WmiHub.tsx` — hub h1**

Replace:
```tsx
            <h1 className="font-display text-2xl font-black leading-none">Latihan WMI</h1>
```
with:
```tsx
            <h1 className="font-display text-2xl font-black leading-none">Olimpiade Matematika</h1>
```

- [ ] **Step 5: Edit `WmiKonsepDrill.tsx` — concept eyebrow**

Replace:
```tsx
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/75">WMI · Konsep</p>
```
with:
```tsx
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/75">Olimpiade · Konsep</p>
```

- [ ] **Step 6: Edit `Report.tsx` — concept progress label**

Find the JSX text `Latihan WMI (konsep)` (around line 145) and change it to `Latihan Konsep`. The surrounding element/markup stays; only the visible text changes.

- [ ] **Step 7: Verify**

Run: `cd D:\claude\wmi && npm run check`
Expected: exit 0.

Run: `cd D:\claude\wmi && npx eslint src/pages/LatihanHub.tsx src/pages/WmiHub.tsx src/pages/WmiKonsepDrill.tsx src/pages/Report.tsx`
Expected: no new errors.

- [ ] **Step 8: Commit**

```bash
git add src/pages/LatihanHub.tsx src/pages/WmiHub.tsx src/pages/WmiKonsepDrill.tsx src/pages/Report.tsx
git commit -m "feat(wmi): rebrand learner concept/umbrella copy to Olimpiade Matematika"
```

---

## Task 2: Admin concept copy → "Math Olympiad"

**Files:**
- Modify: `src/pages/admin/AdminWmiConcepts.tsx`
- Modify: `src/pages/admin/AdminDashboard.tsx`

- [ ] **Step 1: Edit `AdminWmiConcepts.tsx` — eyebrow**

Replace:
```tsx
        eyebrow="Admin · WMI"
```
with:
```tsx
        eyebrow="Admin · Konsep"
```
(Note: this file has the eyebrow `"Admin · WMI"` at the concept proofreading header, around line 234. `AdminWmiDrill.tsx` also has `"Admin · WMI"` — do NOT touch that one; it's the WMI drill page and stays "WMI".)

- [ ] **Step 2: Edit `AdminWmiConcepts.tsx` — page title**

Replace:
```tsx
        title="WMI Concept Proofreading"
```
with:
```tsx
        title="Math Olympiad Concept Proofreading"
```

- [ ] **Step 3: Edit `AdminDashboard.tsx` — concept tile label**

Replace:
```tsx
          <div className="font-display text-sm font-extrabold text-admin-ink">WMI Concept Proofreading</div>
```
with:
```tsx
          <div className="font-display text-sm font-extrabold text-admin-ink">Math Olympiad Concept Proofreading</div>
```

- [ ] **Step 4: Verify**

Run: `cd D:\claude\wmi && npm run check`
Expected: exit 0.

Run: `cd D:\claude\wmi && npx eslint src/pages/admin/AdminWmiConcepts.tsx src/pages/admin/AdminDashboard.tsx`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/AdminWmiConcepts.tsx src/pages/admin/AdminDashboard.tsx
git commit -m "feat(wmi): rebrand admin concept proofreading copy to Math Olympiad"
```

---

## Task 3: Verification guards

**Files:** none (verification only)

- [ ] **Step 1: Confirm the removed strings are gone**

Run: `cd D:\claude\wmi && git grep -n "World Mathematics Invitation" -- src/`
Expected: no matches.

Run: `cd D:\claude\wmi && git grep -n "Latihan WMI" -- 'src/**/*.tsx'`
Expected: no matches in JSX render output. (Matches inside `//` code comments — e.g. `src/components/report/RaporLatihan.tsx` and `LatihanHub.tsx` file-header comments — are acceptable; confirm any remaining hit is a comment, not rendered text.)

- [ ] **Step 2: Confirm the KEEP strings remain**

Run: `cd D:\claude\wmi && git grep -n "WMI · Ujian\|Soal ujian WMI asli\|WMI Drill Papers" -- src/`
Expected: still present (WmiPapers.tsx, WmiHub.tsx, AdminWmiDrill.tsx).

- [ ] **Step 3: Final typecheck + lint**

Run: `cd D:\claude\wmi && npm run check`
Expected: exit 0.

Run: `cd D:\claude\wmi && npm run lint`
Expected: no new errors (the repo carries pre-existing warnings; this change adds none).

---

## Notes for the implementer

- The contrast that drives every decision: **concept system + hub umbrella → neutral; genuine WMI papers/drill → keep "WMI".** When in doubt about a string, check whether it labels the *concept practice / overall course* (neutralize) or *WMI exam papers / WMI drill* (keep).
- `AdminWmiDrill.tsx` and `WmiPapers.tsx` are the WMI papers/drill surfaces — leave their "WMI" copy intact.
- Routes (`/latihan/wmi`), `wmi_*` DB tables, `/api/wmi*` routes, and all `Wmi*` component/file names are out of scope — code identifiers stay `wmi`.
