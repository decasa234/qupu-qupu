// Level ladder for row-column-sum-grid. The concept's own `generate` is the only
// safe source of grids — it is what proves each puzzle has exactly one
// completion (`solve(...).forced`) and rejects decoy covers — so this ladder does
// not build grids by hand. It draws from `generate` and keeps the draw whose
// shape matches the level, which climbs on the two axes that actually decide the
// work: how long the forcing chain is (one covered square per link) and how much
// the child must do with the uncovered numbers once the chain is walked.
//   L1: 1 cover, read one square       — a single subtraction
//   L2: 2 covers, read one square      — the first cover has to unlock the second
//   L3: 2 covers, add the two          — same chain, plus a combine step
//   L4: 3 covers, add two of them      — three-link chain
//   L5: 3 covers, form the 2-digit number — three-link chain, and the order of
//       the two digits now matters (the concept's only real trap)
import type { Rng } from '../types.js'
import { ASKS, generate, type Ask, type Params } from './index.js'

interface Profile {
  hidden: number
  ask: Ask
}

const PROFILES: Record<1 | 2 | 3 | 4 | 5, Profile> = {
  1: { hidden: 1, ask: 'one-cell' },
  2: { hidden: 2, ask: 'one-cell' },
  3: { hidden: 2, ask: 'sum-of-two' },
  4: { hidden: 3, ask: 'sum-of-two' },
  5: { hidden: 3, ask: 'two-digit-number-formed' },
}

/** Distance from a drawn grid to the level's profile; 0 is an exact match. */
function distance(p: Params, want: Profile): number {
  const chain = Math.abs(p.hidden.length - want.hidden)
  const combine = Math.abs(ASKS.indexOf(p.ask) - ASKS.indexOf(want.ask))
  return chain * 4 + combine
}

export function rowColumnSumGridLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const want = PROFILES[level]
  // Three-cover grids are rare (`generate` only reaches for a third cover when
  // the shape can carry it), so the search is generous. The nearest draw seen is
  // kept as a fallback: an off-by-one-cover puzzle is still a correct, uniquely
  // solvable one, which matters more than hitting the profile exactly.
  let nearest: Params | null = null
  let nearestDistance = Number.POSITIVE_INFINITY
  for (let attempt = 0; attempt < 4000; attempt++) {
    const candidate = generate(rng)
    const d = distance(candidate, want)
    if (d === 0) return candidate
    if (d < nearestDistance) {
      nearestDistance = d
      nearest = candidate
    }
  }
  return nearest as Params
}
