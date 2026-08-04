// Level ladder for weight-balance-word (total − sugar, then ÷ bottles). Same
// param schema (bottles 2..8, perBottle/sugar 20..500). Difficulty climbs on the
// size of the total AND on how many bottles the remainder has to be shared over:
//   L1: 2 bottles, everything a multiple of 50 — subtract, then halve
//   L2: 2–3 bottles, multiples of 10
//   L3: 3–4 bottles, multiples of 5 — bigger totals, division by 3 or 4
//   L4: 4–6 bottles, weights to 400 g, sugar no longer round
//   L5: 6–8 bottles, any weight to 500 g — four-digit totals, division by 7/8
//
// INVARIANT enforced at every rung: the Indonesian breakdown highlights the
// bottle count as a BARE digit (phrase_id = `${bottles}`), so that digit must not
// occur inside the other two number highlights (`${total} g`, `…${sugar} g`) or
// one of the highlights is silently swallowed by the other.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

function digitsClash(p: Params): boolean {
  const d = String(p.bottles)
  const total = String(p.sugar + p.bottles * p.perBottle)
  return total.includes(d) || String(p.sugar).includes(d)
}

// Rejection-sample the triple until the bare-digit highlight is unambiguous.
function draw(make: () => Params, fallback: Params): Params {
  for (let i = 0; i < 60; i++) {
    const p = make()
    if (!digitsClash(p)) return p
  }
  return fallback
}

// A multiple of `step` drawn from [step*loK, step*hiK].
function mult(rng: Rng, step: number, loK: number, hiK: number): number {
  return step * rng.int(loK, hiK)
}

export function weightBalanceWordLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return draw(() => ({
        bottles: 2,
        perBottle: mult(rng, 50, 1, 5), // 50..250
        sugar: mult(rng, 50, 1, 4), // 50..200
      }), { bottles: 2, perBottle: 150, sugar: 50 })
    case 2:
      return draw(() => ({
        bottles: rng.int(2, 3),
        perBottle: mult(rng, 10, 8, 25), // 80..250
        sugar: mult(rng, 10, 6, 25), // 60..250
      }), { bottles: 2, perBottle: 150, sugar: 60 })
    case 3:
      return draw(() => ({
        bottles: rng.int(3, 4),
        perBottle: mult(rng, 5, 16, 60), // 80..300
        sugar: mult(rng, 5, 12, 60), // 60..300
      }), { bottles: 3, perBottle: 100, sugar: 60 })
    case 4:
      return draw(() => ({
        bottles: rng.int(4, 6),
        perBottle: mult(rng, 5, 20, 80), // 100..400
        sugar: rng.int(70, 450),
      }), { bottles: 4, perBottle: 200, sugar: 100 })
    case 5:
      return draw(() => ({
        bottles: rng.int(6, 8),
        perBottle: rng.int(150, 500),
        sugar: rng.int(80, 500),
      }), { bottles: 7, perBottle: 200, sugar: 100 })
  }
}
