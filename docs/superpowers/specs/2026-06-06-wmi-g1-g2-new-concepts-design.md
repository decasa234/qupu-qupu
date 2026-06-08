# WMI G1-G2 new concepts design

Status: approved design; implementation follows immediately

## Goal

Add 10 new G1/G2 WMI concept generators that are slightly harder than the current basics while avoiding duplicates in the live catalog.

## Concepts

- A9 `missing-addend`: inverse addition/subtraction blank solving.
- N14 `arrange-digits-to-form-number`: enumerate and order 2-digit numbers from digits.
- P4 `visual-pattern-next`: continue icon cycles.
- P5 `shape-transformation-rule`: apply rotate/flip/recolor rule.
- W9 `net-progress-cycles`: repeated up/down net movement.
- W10 `rope-wraps-ratio`: inverse wrap-count ratio.
- N15 `equivalent-fraction-fill`: scale equivalent fractions.
- D3 `table-lookup-combine`: table lookup plus total/difference.
- L8 `truth-order-clues`: solve ordering clues.
- C5 `make-groups-leftover`: equal groups and leftovers.

## Implementation

Each concept gets a backend module with zod params, deterministic `generate(rng)`, `render(params)`, and tests. Each concept is wired into backend registry, preview domain/short IDs, and frontend explainer registry with a lightweight shared explainer style.

## Verification

Run all new concept tests, explainer gap check, `npm run check`, and `npm run lint`.
