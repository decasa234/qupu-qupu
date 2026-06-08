# WMI C4 Count Squares Grid Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an animated C4 explainer that counts all squares of any size in a grid.

**Architecture:** Put all-squares formula and beat state in a pure step builder, render the visual in a focused SVG React component, and update the backend concept wording/formula. The existing slug remains `count-rectangles-grid` for compatibility, but the user-facing concept asks for squares.

**Tech Stack:** React 18, Framer Motion, Vitest, existing `useBeatControl`.

---

## File Structure

- Modify `api/services/wmi/concepts/count-rectangles-grid/index.ts`: answer and hints count all squares by size.
- Modify `api/services/wmi/concepts/count-rectangles-grid/index.test.ts`: regression tests assert all-squares counting.
- Create `src/components/wmi/concepts/explainers/countRectanglesSteps.ts`: pure C4 story builder.
- Create `src/components/wmi/concepts/explainers/countRectanglesSteps.test.ts`: formula and caption tests.
- Create `src/components/wmi/concepts/explainers/CountRectanglesGridExplainer.tsx`: animated SVG explainer.
- Modify `src/components/wmi/concepts/explainers/registry.ts`: import and register C4.

## Tasks

- [ ] Write failing tests for `buildCountRectanglesSteps` covering `2x2 -> 5`, `3x3 -> 14`, `4x3 -> 20`, and final sum caption.
- [ ] Run the test and confirm it fails because the builder does not exist.
- [ ] Update backend C4 to ask for squares of any size and answer `sum((cols-k+1)*(rows-k+1))`.
- [ ] Implement `buildCountRectanglesSteps(cols, rows, lang)` with beats for grid and each square size.
- [ ] Run the targeted test and confirm it passes.
- [ ] Add `CountRectanglesGridExplainer.tsx` using SVG grid lines and motion overlays.
- [ ] Register `count-rectangles-grid` in `registry.ts`.
- [ ] Run `npx vitest run src/components/wmi/concepts/explainers/countRectanglesSteps.test.ts`, `npm run check`, and `npm run lint`.

## Self-Review

- Covers the approved all-squares method.
- Uses exact current params: `cols`, `rows`.
- No backend changes required.
