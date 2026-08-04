// Level ladder for shape-transformation-rule.
//
// HONEST CAVEAT: this schema admits exactly FOUR distinct problems
// ({▲,▶} × {flip,turn}), so it cannot carry five genuinely different rungs.
// The ladder below is the closest honest ordering: mirroring (flip) before
// rotation (turn, which also needs a sense of clockwise), the up-pointing shape
// before the sideways one, and an unfixed shape at L4 so the child cannot
// pre-plan the answer. L4 and L5 differ only in that predictability.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function shapeTransformationRuleLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: flip the up-arrow — a straight up/down mirror, the most obvious one.
    case 1:
      return { shape: '▲', transform: 'flip' }
    // L2: flip the side-arrow — same rule, but the mirror axis is now left/right.
    case 2:
      return { shape: '▶', transform: 'flip' }
    // L3: turn the up-arrow — rotation, so "clockwise" has to be understood.
    case 3:
      return { shape: '▲', transform: 'turn' }
    // L4: turn, shape unknown in advance — the rule can't be rehearsed.
    case 4:
      return { shape: rng.pick(['▲', '▶'] as const), transform: 'turn' }
    // L5: turn the side-arrow (▶ → ▼) — the one step with no visual shortcut.
    case 5:
      return { shape: '▶', transform: 'turn' }
  }
}
