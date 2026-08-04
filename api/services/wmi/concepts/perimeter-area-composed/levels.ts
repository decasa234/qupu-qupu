// Level ladder for perimeter-area-composed. Same param schema ({W, H, cw, ch});
// difficulty climbs on the size of the rectangle you have to multiply out, and on
// what gets taken off it: one square, then a strip, then a genuine block, then a
// block whose area forces a borrow in the subtraction.
//   L1: 3–5 by 3–5, a single unit square cut out — area is "count minus one"
//   L2: 4–6 by 3–5, a 1-wide strip cut out — a small multiplication to take off
//   L3: 5–7 by 4–6, a real block cut (both sides ≥ 2) — two multiplications
//   L4: 6–8 by 5–7, block cut, and the subtraction needs regrouping
//   L5: 7–8 by 6–7, a big block cut (both sides ≥ 3) with regrouping — the largest
//       rectangle and the largest bite the schema allows
// Each rung enumerates its whole legal set, so `cw < W` and `ch < H` (the schema's
// refine) hold by construction and the pool size is exact.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

type Spec = {
  W: [number, number]
  H: [number, number]
  cut: (cw: number, ch: number) => boolean
  regroup: boolean
}

const SPECS: Record<1 | 2 | 3 | 4 | 5, Spec> = {
  1: { W: [3, 5], H: [3, 5], cut: (cw, ch) => cw * ch <= 2, regroup: false },
  2: { W: [4, 6], H: [3, 5], cut: (cw, ch) => Math.min(cw, ch) === 1 && cw * ch >= 2 && cw * ch <= 5, regroup: false },
  3: { W: [5, 7], H: [4, 6], cut: (cw, ch) => cw >= 2 && ch >= 2, regroup: false },
  4: { W: [6, 8], H: [5, 7], cut: (cw, ch) => cw >= 2 && ch >= 2, regroup: true },
  5: { W: [7, 8], H: [6, 7], cut: (cw, ch) => cw >= 3 && ch >= 3, regroup: true },
}

function build(spec: Spec): Params[] {
  const out: Params[] = []
  for (let W = spec.W[0]; W <= spec.W[1]; W++) {
    for (let H = spec.H[0]; H <= spec.H[1]; H++) {
      for (let cw = 1; cw <= Math.min(7, W - 1); cw++) {
        for (let ch = 1; ch <= Math.min(6, H - 1); ch++) {
          if (!spec.cut(cw, ch)) continue
          // Regrouping: the corner's ones digit is bigger than the rectangle's,
          // so the child cannot subtract column by column without borrowing.
          if (spec.regroup && (W * H) % 10 >= (cw * ch) % 10) continue
          out.push({ W, H, cw, ch })
        }
      }
    }
  }
  return out
}

const POOLS: Record<1 | 2 | 3 | 4 | 5, Params[]> = {
  1: build(SPECS[1]),
  2: build(SPECS[2]),
  3: build(SPECS[3]),
  4: build(SPECS[4]),
  5: build(SPECS[5]),
}

export function perimeterAreaComposedLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  return { ...rng.pick(POOLS[level]) }
}
