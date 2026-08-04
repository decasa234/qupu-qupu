// Level ladder for custom-operation. The schema has two modes and the ladder
// uses both: 'nested' states the rule and makes you apply it twice, 'infer'
// hides the rule and makes you recover it from two worked examples — strictly
// harder, so the two nested rungs sit below the three infer rungs. Inside each
// mode the formula itself gets heavier (add → multiply → square).
// Difficulty proxy: (infer ? 20 : 0) + 4 × formula weight + |answer| / 10.
// The invariant an 'infer' question depends on — the two examples must pin down
// ONE rule — is enforced here by resampling until no other INFER_FORMULAS entry
// reproduces both example results (the concept's own generate never checks this).
//   L1: nested, a ☼ b = 2 × (a + b), operands 2–4 — rule given, doubling
//   L2: nested, a ☼ b = a × b − b, operands 2–5 — rule given, two multiplications
//   L3: infer, a ☼ b = a × b − a — recover a one-step rule from two examples
//   L4: infer, a ☼ b = a² − b — recover a squaring rule
//   L5: infer, a ☼ b = (a + b)² − a × b, bigger operands — the heaviest rule in the registry
import type { Rng } from '../types.js'
import { INFER_FORMULAS, applyInferFormula, type Params } from './index.js'

/** True when no OTHER infer formula reproduces both worked examples. */
function pinsDownTheRule(id: string, e1: number, e2: number, e3: number, e4: number): boolean {
  const r1 = applyInferFormula(id, e1, e2)
  const r2 = applyInferFormula(id, e3, e4)
  if (!Number.isInteger(r1) || !Number.isInteger(r2)) return false
  return INFER_FORMULAS.every(
    (f) =>
      f.id === id ||
      applyInferFormula(f.id, e1, e2) !== r1 ||
      applyInferFormula(f.id, e3, e4) !== r2,
  )
}

function inferParams(rng: Rng, formula: string, aLo: number, aHi: number, bLo: number, bHi: number): Params {
  let last: Params | null = null
  for (let attempt = 0; attempt < 200; attempt++) {
    const e1 = rng.int(aLo, aHi)
    const e2 = rng.int(bLo, bHi)
    const e3 = rng.int(aLo, aHi)
    const e4 = rng.int(bLo, bHi)
    const c = rng.int(aLo, aHi)
    const d = rng.int(bLo, bHi)
    // The two examples must differ from each other and from the query pair.
    if (e1 === e3 && e2 === e4) continue
    if ((c === e1 && d === e2) || (c === e3 && d === e4)) continue
    last = { mode: 'infer', formula, e1, e2, e3, e4, c, d }
    if (pinsDownTheRule(formula, e1, e2, e3, e4)) return last
  }
  return last ?? { mode: 'infer', formula, e1: aLo, e2: bHi, e3: aHi, e4: bLo, c: aLo, d: bLo }
}

export function customOperationLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return { mode: 'nested', formula: 'nested-double-sum', a: rng.int(2, 4), b: rng.int(2, 4), c: rng.int(2, 4) }
    case 2:
      return { mode: 'nested', formula: 'nested-mul-minus-b', a: rng.int(2, 5), b: rng.int(2, 5), c: rng.int(2, 5) }
    case 3:
      return inferParams(rng, 'mul-minus-a', 2, 5, 2, 7)
    case 4:
      return inferParams(rng, 'square-minus-b', 2, 7, 2, 9)
    case 5:
      return inferParams(rng, 'sum-sq-minus-prod', 3, 8, 4, 12)
  }
}
