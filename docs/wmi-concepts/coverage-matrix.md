# WMI Concept Coverage Matrix

> The 9-domain grouping in this file reflects the original past-paper mining.
> The live concept taxonomy is the 6 olympiad strands — see
> `api/services/wmi/concepts/taxonomy.ts` and `taxonomy.md` › *Olympiad strand
> taxonomy (current)*.

Archetype × grade frequency across all 1,400 past-paper questions (2019–2025, both rounds, Papers A+B). Use it to prioritize which generators to build: high-count, multi-grade archetypes pay off most.

## Domain totals

| Domain | Questions | Distinct archetypes |
|---|---:|---:|
| ARI — Arithmetic & Operations | 201 | 13 |
| NUM — Number Sense & Place Value | 159 | 15 |
| WORD — Word Problems | 118 | 10 |
| PAT — Patterns & Sequences | 163 | 5 |
| LOG — Logic & Reasoning | 237 | 19 |
| CNT — Counting & Combinatorics | 96 | 9 |
| GEO — Geometry & Spatial | 284 | 21 |
| MEA — Measurement & Time | 52 | 6 |
| DAT — Data, Tables & Classification | 90 | 9 |
| **Total** | **1400** | **107** |

## Archetype × grade

### ARI — Arithmetic & Operations

| Archetype | G0 | G1 | G2 | G3 | Total | IMG | New? |
|---|--:|--:|--:|--:|--:|--:|:--:|
| `arithmetic-expression-eval` | 8 | 10 | 11 | 21 | 50 | 6 |  |
| `missing-addend` | 17 | 10 | 8 | 1 | 36 | 14 |  |
| `which-expression-equals` | 6 | 8 | 8 | 5 | 27 | 3 |  |
| `alternating-chain-eval` | 3 | 3 | 8 | 7 | 21 | 0 |  |
| `picture-addition` | 13 | 6 | 1 | · | 20 | 19 |  |
| `operator-fill` | 2 | 5 | 5 | 5 | 17 | 3 |  |
| `custom-operation` | 8 | 3 | 2 | 3 | 16 | 12 |  |
| `mistaken-digit-correction` | · | · | 1 | 6 | 7 | 0 |  |
| `single-digit-addition` | 2 | · | · | · | 2 | 1 |  |
| `single-digit-subtraction` | 2 | · | · | · | 2 | 1 |  |
| `factor-tree-product` | · | · | · | 1 | 1 | 1 | ★ |
| `multiplication-small` | · | · | 1 | · | 1 | 0 |  |
| `division-quotient-property` | · | · | · | 1 | 1 | 0 |  |

### NUM — Number Sense & Place Value

| Archetype | G0 | G1 | G2 | G3 | Total | IMG | New? |
|---|--:|--:|--:|--:|--:|--:|:--:|
| `reverse-arithmetic-puzzle` | 1 | 7 | 5 | 14 | 27 | 7 |  |
| `compare-order-numbers` | 8 | 8 | 4 | 6 | 26 | 8 |  |
| `arrange-digits-to-form-number` | 3 | 5 | 10 | 7 | 25 | 9 |  |
| `build-number-from-digit-clues` | 2 | 4 | 5 | 8 | 19 | 3 |  |
| `find-number-by-digit-sum` | · | 3 | 4 | 7 | 14 | 0 |  |
| `divisibility-multiple-property` | · | 1 | 4 | 5 | 10 | 1 |  |
| `odd-even-reasoning` | 1 | 4 | 3 | · | 8 | 2 |  |
| `digit-frequency` | · | 7 | · | · | 7 | 2 |  |
| `more-or-less-by-k` | · | 6 | 1 | · | 7 | 1 |  |
| `perfect-square-search` | · | · | 2 | 3 | 5 | 0 |  |
| `place-value` | · | 1 | 2 | 1 | 4 | 1 |  |
| `product-of-consecutive` | · | · | 1 | 2 | 3 | 0 |  |
| `digit-sum` | · | · | 1 | 1 | 2 | 0 |  |
| `equivalent-fraction-fill` | · | · | · | 1 | 1 | 0 | ★ |
| `find-missing-number-in-set` | 1 | · | · | · | 1 | 1 | ★ |

### WORD — Word Problems

| Archetype | G0 | G1 | G2 | G3 | Total | IMG | New? |
|---|--:|--:|--:|--:|--:|--:|:--:|
| `story-sum` | 3 | 14 | 16 | 16 | 49 | 4 |  |
| `weight-balance-word` | 3 | 7 | 6 | 6 | 22 | 15 |  |
| `money-shopping-change` | 2 | 4 | 3 | 7 | 16 | 4 |  |
| `legs-items-rate` | 1 | 7 | 2 | 5 | 15 | 6 |  |
| `money-coins-total` | · | 1 | 3 | 2 | 6 | 5 |  |
| `distance-rate-time` | · | · | 1 | 3 | 4 | 1 |  |
| `budget-selection` | · | · | 2 | 1 | 3 | 1 |  |
| `net-progress-cycles` | · | · | 1 | · | 1 | 0 | ★ |
| `rope-wraps-ratio` | · | · | 1 | · | 1 | 0 | ★ |
| `lacking-money-shared` | · | 1 | · | · | 1 | 0 |  |

### PAT — Patterns & Sequences

| Archetype | G0 | G1 | G2 | G3 | Total | IMG | New? |
|---|--:|--:|--:|--:|--:|--:|:--:|
| `pattern-next` | 17 | 9 | 13 | 14 | 53 | 22 |  |
| `visual-pattern-next` | 28 | 12 | 8 | 5 | 53 | 52 |  |
| `shape-transformation-rule` | 23 | 4 | 3 | 4 | 34 | 34 |  |
| `number-pyramid` | 5 | 6 | 3 | 1 | 15 | 14 |  |
| `block-transformation-sequence` | 2 | · | 4 | 2 | 8 | 7 |  |

### LOG — Logic & Reasoning

| Archetype | G0 | G1 | G2 | G3 | Total | IMG | New? |
|---|--:|--:|--:|--:|--:|--:|:--:|
| `grid-number-constraint` | 12 | 16 | 20 | 20 | 68 | 57 |  |
| `cryptarithm` | 3 | 5 | 13 | 13 | 34 | 18 |  |
| `which-might-be` | 4 | 9 | 10 | 3 | 26 | 7 |  |
| `order-from-statements` | 2 | 4 | 7 | 5 | 18 | 7 |  |
| `assignment-cycle` | 3 | 5 | 5 | 4 | 17 | 9 |  |
| `sum-partition-split` | 1 | 3 | 5 | 5 | 14 | 6 |  |
| `position-in-line` | · | 10 | 2 | · | 12 | 2 |  |
| `venn-set-membership` | · | 6 | 4 | 1 | 11 | 10 |  |
| `symbol-value-equation` | 4 | 2 | 3 | · | 9 | 4 | ★ |
| `range-count-evaluate` | 1 | 3 | 3 | · | 7 | 3 |  |
| `target-hit-equal-sum` | 2 | 2 | 3 | · | 7 | 5 |  |
| `which-cannot-be` | · | 1 | 1 | 4 | 6 | 2 |  |
| `code-deduction` | · | 1 | · | 1 | 2 | 2 | ★ |
| `equation-substitution-solve` | · | · | · | 1 | 1 | 0 | ★ |
| `system-pairwise-sums` | · | · | · | 1 | 1 | 0 | ★ |
| `digit-fill-equation` | · | 1 | · | · | 1 | 1 | ★ |
| `flowchart-trace-eval` | · | · | 1 | · | 1 | 1 | ★ |
| `shape-overlay-max-sum` | · | · | 1 | · | 1 | 1 | ★ |
| `card-match-deduction` | · | · | 1 | · | 1 | 1 | ★ |

### CNT — Counting & Combinatorics

| Archetype | G0 | G1 | G2 | G3 | Total | IMG | New? |
|---|--:|--:|--:|--:|--:|--:|:--:|
| `count-objects` | 26 | 12 | 7 | 1 | 46 | 45 |  |
| `count-shapes-in-figure` | 5 | 9 | 7 | 4 | 25 | 25 |  |
| `combination-product-sum` | · | 3 | 2 | 5 | 10 | 2 |  |
| `minimum-swaps-sort` | · | 3 | 3 | 1 | 7 | 2 |  |
| `how-many-ways-subsequence` | · | · | · | 3 | 3 | 0 |  |
| `remove-to-keep-one-kind` | · | 1 | 1 | · | 2 | 2 |  |
| `count-compositions` | · | · | 1 | · | 1 | 0 | ★ |
| `count-paths-number-grid` | · | 1 | · | · | 1 | 1 | ★ |
| `pigeonhole-guarantee` | · | 1 | · | · | 1 | 0 | ★ |

### GEO — Geometry & Spatial

| Archetype | G0 | G1 | G2 | G3 | Total | IMG | New? |
|---|--:|--:|--:|--:|--:|--:|:--:|
| `perimeter-area-composed` | 2 | 3 | 5 | 42 | 52 | 42 |  |
| `same-figure-identify` | 20 | 7 | 4 | 2 | 33 | 33 |  |
| `piece-assembly` | 13 | 7 | 7 | 3 | 30 | 29 |  |
| `block-count-3d` | 6 | 8 | 7 | 5 | 26 | 26 |  |
| `length-segment-compare` | 5 | 7 | 8 | 4 | 24 | 22 |  |
| `move-rule-traversal` | 12 | 4 | 4 | 3 | 23 | 23 |  |
| `maze-path-shortest` | 10 | 6 | 2 | 3 | 21 | 20 |  |
| `direction-orientation` | 2 | 2 | 7 | 3 | 14 | 6 |  |
| `dice-net-fold` | 4 | 2 | 4 | 3 | 13 | 13 |  |
| `path-optimize-value` | 1 | 6 | 4 | 1 | 12 | 9 |  |
| `fold-result-count` | 3 | 2 | 1 | 2 | 8 | 8 |  |
| `dice-opposite-faces` | · | 1 | 2 | 4 | 7 | 6 |  |
| `symmetry-count` | · | · | 1 | 4 | 5 | 3 |  |
| `shape-perimeter-square` | · | · | 1 | 2 | 3 | 0 |  |
| `spinning-states` | 1 | · | 1 | 1 | 3 | 3 |  |
| `block-stability` | · | 2 | 1 | · | 3 | 3 |  |
| `fraction-of-region` | · | · | · | 2 | 2 | 2 | ★ |
| `dial-lock-read` | · | 1 | 1 | · | 2 | 2 | ★ |
| `line-of-sight-hit` | 1 | · | · | · | 1 | 1 | ★ |
| `projection-view-3d` | · | · | 1 | · | 1 | 1 | ★ |
| `layered-sheets-order` | · | · | 1 | · | 1 | 1 | ★ |

### MEA — Measurement & Time

| Archetype | G0 | G1 | G2 | G3 | Total | IMG | New? |
|---|--:|--:|--:|--:|--:|--:|:--:|
| `clock-time-after` | · | 8 | 11 | 7 | 26 | 8 |  |
| `length-sum-compare` | · | 6 | 4 | 1 | 11 | 10 |  |
| `unit-conversion` | 1 | · | 2 | 3 | 6 | 1 |  |
| `clock-hand-rotation` | 3 | 1 | 2 | · | 6 | 6 |  |
| `clock-read-time` | · | 2 | · | · | 2 | 2 | ★ |
| `calendar-day-count` | · | · | 1 | · | 1 | 0 | ★ |

### DAT — Data, Tables & Classification

| Archetype | G0 | G1 | G2 | G3 | Total | IMG | New? |
|---|--:|--:|--:|--:|--:|--:|:--:|
| `table-grid-position` | 15 | 6 | 8 | 5 | 34 | 32 |  |
| `compare-counts-figure` | 8 | 6 | 1 | 3 | 18 | 18 |  |
| `ratio-pictograph` | 7 | 3 | 3 | 3 | 16 | 16 |  |
| `odd-one-out` | 11 | 3 | · | · | 14 | 13 |  |
| `page-numbering` | · | 2 | 2 | · | 4 | 2 |  |
| `consecutive-identical-runs` | 1 | · | · | · | 1 | 1 | ★ |
| `identify-figure-by-description` | · | 1 | · | · | 1 | 1 | ★ |
| `chart-trend-extreme` | · | · | · | 1 | 1 | 1 | ★ |
| `letter-frequency-count` | · | · | 1 | · | 1 | 0 | ★ |

★ = archetype discovered during extraction (not in the Phase-0 seed). IMG = image-dependent count.
