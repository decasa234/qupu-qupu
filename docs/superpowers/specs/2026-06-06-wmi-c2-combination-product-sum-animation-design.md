# WMI C2 combination-product-sum animation design

Status: approved design; pending written-spec review

## Goal

Add an animated explainer for C2, `combination-product-sum`, so learners can see how the two hidden numbers are found from their sum and product.

The concept gives two whole numbers with known `sum = x + y` and `product = x * y`, then asks for the larger number `y`. The explainer should not treat this as generic outfit-style combinations. It should teach the intended search: list whole-number pairs with the target sum, multiply each pair, and stop when the product matches.

## User Experience

Use a compact visual grid inside the existing WMI explainer area.

Beats:

1. Show the target facts: `sum = S`, `product = P`.
2. Reveal candidate sum-pairs: `(1, S-1)`, `(2, S-2)`, continuing until `(x, y)`.
3. Multiply early pairs and mark them as not matching when their product is not `P`.
4. Highlight the matching pair `(x, y)` when `x * y = P`.
5. Emphasize the answer: the larger number is `y`.

Animation style:

- Candidate rows pop in one at a time using existing Framer Motion patterns.
- Product cells fill or count up as each row is checked.
- Non-matching rows fade slightly; the matching row turns green.
- The final answer pill uses the same green success styling as other explainers.

## Architecture

Add a small pure step builder beside the component:

- `combinationProductSteps.ts` builds the beat list from `{ x, y }` and `lang`.
- `combinationProductSteps.test.ts` verifies candidate rows preserve the target sum, the highlighted row has product `x * y`, and the final answer is `y`.
- `CombinationProductSumExplainer.tsx` renders the steps and uses `useBeatControl` with per-beat holds.
- `registry.ts` maps `combination-product-sum` to the new explainer.

The component should read only the current params shape from `api/services/wmi/concepts/combination-product-sum/index.ts`: `{ x: number, y: number }`. No backend generator change is needed.

## Data Flow

Input params:

- `x`: smaller hidden number, currently `2..9`.
- `y`: larger hidden number, currently `x+1..12`.

Derived values:

- `sum = x + y`.
- `product = x * y`.
- Candidate rows from `a = 1` through `a = x`, where each row is `(a, sum - a)`.

The final row is always the matching row because the backend guarantees `y > x` and asks for the larger number.

## Edge Cases

- Clamp rendering to sane numeric values if params are malformed, but do not add compatibility paths for unsupported shapes.
- Keep the grid stable for the largest generated case, so rows do not jump as new products appear.
- Avoid rendering too many candidate rows; current generator caps at `x <= 9`, so the grid remains small.
- Use language-specific captions for English and Indonesian.

## Testing

Run:

- `npm run check`
- `npm run lint`
- `npx vitest run src/components/wmi/concepts/explainers/combinationProductSteps.test.ts`

If feasible, run an SSR smoke or preview render for C2 in both `en` and `id` to confirm all beats render without crashing.

## Review Queue

After implementation, flag C2 as pending in the concept review workflow, consistent with recent WMI explainer work. Do not change unrelated review statuses.

## Self-Review

- No placeholders remain.
- Scope is limited to C2 animation and registry wiring.
- The design matches the actual C2 params and math identity.
- The visual grid approach is adapted to sum-pair/product search, not generic combinations.
