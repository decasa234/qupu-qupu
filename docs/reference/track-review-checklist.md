# Track Review Checklist

A track may move `draft → review → published` only when every box is checked
by a human reviewer on the PR that changes its `status`.

## Structure (CI enforces, reviewer spot-checks)
- [ ] `npm run check` and the track validator test pass (`validate.test.ts`).
- [ ] Every gate's `requires` list is the COMPLETE decomposition of its problem
      (a child mastering exactly those concepts can genuinely solve it).

## Per concept
- [ ] The 5 level param sets climb monotonically (L1 easiest → L5 hardest);
      no level is a difficulty plateau or regression.
- [ ] L1 is genuinely entry-level for the track's grade.
- [ ] L5 matches the difficulty the gate problem actually demands.
- [ ] Instance pools exist for all 5 levels (`ensureLevelPools` run against
      the target environment) and rendered questions read naturally in
      Indonesian at every level.

## Per unit
- [ ] Unit length: 2–6 concepts (spec: "concepts that take root without
      overwhelming the child").
- [ ] The gate problem is solvable using ONLY concepts from the spine so far.

## Rollout
- [ ] `status: 'review'` verified by an admin account end-to-end (lesson,
      recall labels, gate) before `published`.
- [ ] Tier→level migration behavior confirmed for reused slugs (spec mapping
      0,1,2,3→4,4→5).
