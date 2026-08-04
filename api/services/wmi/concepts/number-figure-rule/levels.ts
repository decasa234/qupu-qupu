// Level ladder for number-figure-rule. Two axes, both already in the schema:
// how hard the hidden rule is to read (add → subtract → add-then-take-1) and
// whether the blank is the RESULT slot (apply the rule forwards) or an INPUT
// slot (undo the rule). Fairness is non-negotiable: every trio is chosen with
// the concept's own `fittingAnswers` proof, so exactly one number can sit in
// the blank — same guarantee `generate()` gives.
import type { Rng } from '../types.js'
import { applyRule, fittingAnswers } from './index.js'
import type { LayoutKind, Params, RuleKind, Slot, Triple } from './index.js'

/** Same grade-1-safe candidate space as index.ts, narrowed by a size ceiling. */
function candidatesFor(rule: RuleKind, maxSlot: number): Triple[] {
  const out: Triple[] = []
  if (rule === 'diff') {
    for (let b = 2; b <= 8; b++) {
      for (let c = 2; c <= 9; c++) {
        if (b === c) continue
        const t: Triple = { a: b + c, b, c }
        if (Math.max(t.a, t.b, t.c) <= maxSlot) out.push(t)
      }
    }
    return out
  }
  for (let a = 2; a <= 9; a++) {
    for (let b = 2; b <= 9; b++) {
      if (a === b) continue
      const t: Triple = { a, b, c: applyRule(rule, a, b) }
      if (Math.max(t.a, t.b, t.c) <= maxSlot) out.push(t)
    }
  }
  return out
}

/** No slot value may repeat across groups — else the figure "explains" itself. */
function slotsDiffer(x: Triple, y: Triple): boolean {
  return x.a !== y.a && x.b !== y.b && x.c !== y.c
}

/** First trio (in the shuffled order) with distinct slots AND exactly one fit. */
function search(order: Triple[], blank: Slot): Triple[] | null {
  const n = order.length
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (j === i || !slotsDiffer(order[i], order[j])) continue
      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue
        if (!slotsDiffer(order[i], order[k]) || !slotsDiffer(order[j], order[k])) continue
        const trio = [order[i], order[j], order[k]]
        if (fittingAnswers(trio, blank).length === 1) return trio
      }
    }
  }
  return null
}

function build(rng: Rng, layout: LayoutKind, rule: RuleKind, blank: Slot, maxSlot: number): Params {
  const groups =
    search(rng.shuffle(candidatesFor(rule, maxSlot)), blank) ??
    // Ceiling too tight for this rule — reopen the full candidate space.
    search(rng.shuffle(candidatesFor(rule, 20)), blank)
  if (!groups) throw new Error(`number-figure-rule: no fair trio for ${rule}/${blank}`)
  return { layout, rule, groups, blankPosition: blank }
}

const eitherInput = (rng: Rng): Slot => rng.pick(['a', 'b'] as const)
const eitherLayout = (rng: Rng): LayoutKind => rng.pick(['row', 'pyramid'] as const)

export function numberFigureRuleLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: add, blank is the result, nothing above 10 — one addition fact.
    case 1:
      return build(rng, 'row', 'sum', 'c', 10)
    // L2: still adding, but the blank is one of the numbers being added, so the
    // rule has to be undone (missing addend) — and the totals reach 17.
    case 2:
      return build(rng, eitherLayout(rng), 'sum', eitherInput(rng), 20)
    // L3: the rule is now subtraction — "just add them" is a live trap.
    case 3:
      return build(rng, eitherLayout(rng), 'diff', 'c', 20)
    // L4: subtraction AND the blank is an input — spot it, then undo it.
    case 4:
      return build(rng, eitherLayout(rng), 'diff', eitherInput(rng), 20)
    // L5: a two-step rule (add, then take 1 away) with the blank on an input —
    // the hardest combination the schema allows.
    case 5:
      return build(rng, eitherLayout(rng), 'sum-minus-one', eitherInput(rng), 20)
  }
}
