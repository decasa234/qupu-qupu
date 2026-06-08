# WMI Curriculum & Learning-Path — Design Spec

**Date:** 2026-06-08
**Slice:** 1 of the member-experience epic ("Curriculum & flow")
**Status:** Draft for review
**Branch:** `feat/ui-ux-enhancements`

## Problem

The WMI "Latihan WMI" page shows the 73 concepts as a flat, randomly-ordered grid per grade. Kids can't tell what to do first, every concept tile looks the same (only an hourglass icon differs by status), and there's no sense of a path or of growing understanding. The Drill card's loading spinner also hangs ("Memuat…" never resolves).

This slice turns the flat concept list into a **themed, gated learning path with a per-concept comprehension meter rendered as a growing garden.** It is the foundation the later slices (EXP redesign, per-problem timers, answer-feedback UX) build on.

## Goals

1. Give every concept a clear **home (theme), difficulty, and order**, so there's always one obvious "do this next."
2. Replace binary mastery with a **per-concept comprehension model** driven by *both* volume and accuracy, shown as a motivating, never-punishing garden.
3. Gate chapters as a progression, but let an advanced kid **test out** of a chapter.
4. Keep it unmistakably **on-brand** (QUPU playful card system, mobile-first app feel).
5. Fix the **Drill loading bug** as part of the rework.

## Out of scope (later slices, but this slice feeds them)

- EXP changes: "no XP once proficient", difficulty/time-scaled rewards. *This slice exposes the `proficient` signal those consume.*
- Per-problem timer rewards; the "Explain my mistake" answer-feedback flow; parent PIN; daily-login popup.

## Decisions (from brainstorming)

| # | Decision |
|---|---|
| Path shape | **Themed Units** — concepts grouped into named chapters per grade, ordered easy→hard. |
| Chapters (5) | **Bilangan & Operasi**, **Bentuk & Ruang**, **Pola & Logika**, **Pengukuran & Data**, **Soal Cerita & Uang**. |
| Structure | Theme (chapter) → Concept (subsection) → per-concept comprehension meter. |
| Metaphor | **Garden growth** — each concept is a plant; a chapter is a garden to fill. |
| Comprehension mechanic | Monotonic: correct answers grow it, wrong answers never shrink it. Top tiers gated by *sustained accuracy*. Tier-ups celebrate. |
| Grades | Keep **Grade 0–3** chips. Multi-grade concepts appear in every grade they're tagged for, ordered by difficulty within that grade. |
| Progression | **Chapter-gated**: next chapter unlocks when the current is ~70% grown — **or** unlock early by passing a **Tes Bab** (chapter test, >70%). |
| Difficulty/order | Auto-derived from each concept's number ranges + grade, then hand-tuned; reviewable. |
| Buttons | Path is primary (tap a plant → drill that concept). Secondary: **Latihan Campur** (random mixed practice = old "Latihan Konsep") + **Soal Ujian** (real papers). The broken hub Drill card is removed. |

## Comprehension model

Computed per `(child, concept)`. The visible value is **monotonic non-decreasing** (high-water): the plant never wilts.

**Tiers → plant stages:**

| Tier | Plant stage | Gate |
|---|---|---|
| Belum dimulai | dashed seed | 0 attempts |
| Baru belajar | sprout | ≥ 1 correct |
| Berlatih | leaf | ≥ 3 correct |
| **Mahir** *(proficient line)* | tree | ≥ 6 correct **AND** recent accuracy ≥ ~70% (≥5 of last 7 correct) |
| Dikuasai *(mastered)* | flowering / gold + crown | ≥ 10 correct **AND** recent ≥ ~85% (e.g. last 4 in a row) |

- **Within-tier progress bar:** linear on `correct` between the current and next tier's correct thresholds. When the next tier additionally needs accuracy (Mahir, Dikuasai), the bar fills from volume up to ~92% and only *completes + tiers up* once the accuracy condition is met — so "keep getting them right" is visible without the bar ever dropping.
- **`best_tier` is a high-water mark.** Later dips in accuracy never lower the stored tier or the plant. The EXP slice reads `best_tier ≥ Mahir` as "proficient → stop awarding XP."
- Thresholds (1/3/6/10, 70%/85%, window=7/8) are tunable constants, surfaced in one config module.

## Chapter / garden model

- A **chapter** = a theme within a grade, containing the concepts tagged for that grade in that theme, ordered by `(difficulty, sort_order, name_id)`.
- **Chapter growth %** = mean of its concepts' comprehension % (or share at ≥ Mahir — pick one in build; default: share of concepts at ≥ Mahir, since that's what "grown" reads as).
- **Unlock rule** for chapter *n* (within a grade): unlocked if `n == 1` **OR** chapter *n‑1* growth ≥ 70% **OR** a passed Tes Bab exists for it. Progress-based unlock is derived; only Tes Bab passes are persisted.
- **"LANJUT" recommendation:** the first not-yet-Mahir concept (by order) in the lowest unlocked, not-fully-grown chapter. Exactly one plant carries the orange ring + "LANJUT".
- **Tes Bab:** a fixed set of **6 questions** sampled across the chapter's concepts. Pass = ≥ 70% correct → chapter unlocks immediately. Passing also seeds a head-start (each tested concept jumps to **Berlatih** minimum), since the kid demonstrated understanding; they still grow plants by practicing. Retry allowed (no cooldown — keep gentle).

## Data model (schema changes)

New `db/migrations/NNNN_wmi_curriculum.sql` (and folded into `db/schema.sql`):

1. **`wmi_themes`** — lookup for the 5 chapters.
   `theme_key TEXT PK, name_id TEXT, name_en TEXT, color_hex TEXT, icon_key TEXT, sort_order INT`.
2. **`wmi_concepts`** — add `theme_key TEXT REFERENCES wmi_themes(theme_key)`, `difficulty SMALLINT CHECK (1..3)`, `sort_order INT NOT NULL DEFAULT 0`. Backfill all 73 via a seed script (theme + difficulty + order), reviewable.
3. **`wmi_concept_progress`** — materialized per-child per-concept progress, updated on each concept attempt.
   `child_id UUID, concept_slug TEXT, attempts INT, correct INT, current_streak INT, recent JSONB (last N results), best_tier SMALLINT, comprehension_pct SMALLINT, updated_at TIMESTAMPTZ, PRIMARY KEY (child_id, concept_slug)`.
4. **`wmi_chapter_tests`** — Tes Bab results.
   `id UUID PK, child_id UUID, grade SMALLINT, theme_key TEXT, score_pct SMALLINT, passed BOOLEAN, created_at TIMESTAMPTZ`.

`best_tier` is high-water (never lowered). `wmi_concept_progress` is the read source for the garden and the write target on attempt submit (keeps reads cheap and monotonicity guaranteed).

## API changes (`api/`)

- **`GET /me/wmi/garden?childId&grade`** → the grade's chapters in order, each with: theme display data, concepts (name, plant stage/tier, comprehension %), chapter growth %, unlock state + whether Tes Bab is offered, and the single `nextConceptSlug`. Supersedes the ad-hoc `/konsep/progress` shape for this page.
- **Attempt submit** (existing concept-attempt path) → also upsert `wmi_concept_progress` (recompute tier, apply high-water, recompute within-tier %).
- **`POST /me/wmi/chapter-test`** (+ a start/fetch endpoint) → serve 6 sampled questions; on submit, record `wmi_chapter_tests`, return pass/fail; on pass, unlock + seed concepts to ≥ Berlatih.
- Tapping a plant reuses the existing concept-drill endpoint (`/konsep/next?concept=slug`).
- **Drill bug:** remove the hub-level `fetchPapers` that drove the stuck spinner; papers load only on the Soal Ujian surface. Confirm and fix the underlying never-resolving loading state there too.

## Frontend changes (`src/`)

- Rebuild the WMI hub (`WmiHub.tsx` + `ConceptCatalog.tsx`) into the **garden chapters** layout matching the approved hi-fi mockup (`/.superpowers/brainstorm/.../hifi-learning-path.html`).
- New components: `ConceptPlant` (5 stages + LANJUT ring), `ChapterGarden` (header chiclet, growth bar, plant row, locked/test-out states), `ChapterTest` flow.
- Secondary actions row: **Latihan Campur** (rename/repoint of the old random "Latihan Konsep") + **Soal Ujian**. Remove the standalone "Latihan Konsep" and broken "Drill" hub cards.
- Tier-up celebration reuses existing `KonsepConfetti` / `reward-pop`.
- Apply qupu-ui tokens throughout (Baloo 2 + Nunito, `#30598A`/`#f0853a`/`#ffdd55`, `5px 6px 0 #FFD3B1` shadow, `2rem` radii, eyebrows, star sprinkles). Wrap top-level sections in `<Reveal>`.

## Content work

A reviewable seed assigns all 73 concepts a `theme_key`, `difficulty` (1–3), and `sort_order`. Initial difficulty auto-derived from each generator's number ranges + grade, then hand-tuned. Grade 0 keeps its ~2 concepts (likely a single small chapter) — content can be grown later.

## Risks / open notes

- **Garden green** is off the core palette but already used for "mastered" (`#58A700`); foliage greens are scoped to plant tiles only.
- Chapter-growth definition (mean % vs. share-at-Mahir) — default to share-at-Mahir; revisit if it feels too slow.
- The 73-concept theme/difficulty seed is editorial; first pass is mine, for your review.
- Drill bug root cause to be confirmed against `fetchPapers`/`papersLoading` during build; the redesign removes the hung surface regardless.

## Success criteria

- A kid lands on Grade N, sees ordered chapters, and there is always exactly one obvious "LANJUT".
- Concepts are visually distinct by theme + growth stage (no more identical icons).
- Comprehension climbs with practice, never visibly drops, and top tiers require accuracy.
- Locked chapters can be entered either by growing the prior chapter to 70% or by passing a Tes Bab.
- No stuck spinner anywhere on the hub.
