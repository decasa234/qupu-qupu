# WMI C4 count-squares-grid animation design

Status: approved design; implementation follows immediately

## Goal

Add an animated explainer for C4, `count-rectangles-grid`, that asks for all squares of any size in a grid. This is harder than counting unit cells and fits Grade 3 better.

## Design

The backend params are `{ cols, rows }`. The question asks for the number of squares of any size in the grid. For each square size `k`, the count is `(cols - k + 1) x (rows - k + 1)`, for `k = 1..min(cols, rows)`. The answer is the sum of those counts.

The animation uses these beats:

1. Show the full grid dimensions.
2. Highlight and count all `1x1` squares.
3. Highlight and count all `2x2` squares if present.
4. Highlight larger square sizes if present.
5. Show the sum by size, such as `9 + 4 + 1 = 14`.

## Implementation

- Add `countRectanglesSteps.ts` for pure math and bilingual captions.
- Add `countRectanglesSteps.test.ts` for the formula and shortcut labels.
- Add `CountRectanglesGridExplainer.tsx` using SVG grid lines, pair highlights, and a sample rectangle overlay.
- Register `count-rectangles-grid` in `registry.ts`.

## Verification

Run the C4 step test, `npm run check`, and `npm run lint`.

## Self-Review

- Scope is only C4.
- The formula is explicit by square size and fits the approved all-squares scope.
- The design matches the current backend params and answer formula.
