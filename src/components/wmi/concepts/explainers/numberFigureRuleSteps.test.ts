import { describe, test, expect } from 'vitest'
import {
  applyRule,
  buildNumberFigureRuleSteps,
  solveBlank,
  type RuleKind,
  type Slot,
  type Triple,
} from './numberFigureRuleSteps'

const MINUS = '−'

// sum: 8+4=12, 5+7=12, 6+3=9
const SUM_GROUPS: Triple[] = [
  { a: 8, b: 4, c: 12 },
  { a: 5, b: 7, c: 12 },
  { a: 6, b: 3, c: 9 },
]
// diff: 9-4=5, 11-3=8, 13-6=7
const DIFF_GROUPS: Triple[] = [
  { a: 9, b: 4, c: 5 },
  { a: 11, b: 3, c: 8 },
  { a: 13, b: 6, c: 7 },
]
// sum-minus-one: 5+3-1=7, 6+2-1=7 ... keep all slots distinct
const SMO_GROUPS: Triple[] = [
  { a: 5, b: 3, c: 7 },
  { a: 4, b: 6, c: 9 },
  { a: 7, b: 2, c: 8 },
]

function params(rule: RuleKind, groups: Triple[], blankPosition: Slot, layout = 'row') {
  return { layout, rule, groups, blankPosition }
}

/**
 * Every "a op b = c" claim inside a caption, with "?" replaced by the answer,
 * re-evaluated left to right. A caption that states arithmetic must state it
 * truthfully — this is the failure mode that matters most here.
 */
function arithmeticClaims(text: string, answer: number): { claim: string; ok: boolean }[] {
  const src = text.replace(/\?/g, String(answer))
  const pattern = /\d+(?:\s*[+−]\s*\d+)*(?:\s*=\s*\d+(?:\s*[+−]\s*\d+)*)+/g
  return (src.match(pattern) ?? []).map((claim) => {
    const values = claim.split('=').map((side) => {
      const terms = side.trim().split(/\s*([+−])\s*/)
      let acc = Number(terms[0])
      for (let i = 1; i < terms.length; i += 2) {
        acc = terms[i] === '+' ? acc + Number(terms[i + 1]) : acc - Number(terms[i + 1])
      }
      return acc
    })
    return { claim, ok: values.every((v) => v === values[0]) }
  })
}

describe('buildNumberFigureRuleSteps', () => {
  test('beats run guess → test → rule → … → answer, and only the last beat lands the number', () => {
    const sb = buildNumberFigureRuleSteps(params('sum', SUM_GROUPS, 'c'), 'id')
    const kinds = sb.steps.map((s) => s.kind)
    expect(kinds[0]).toBe('guess')
    expect(kinds[1]).toBe('test')
    expect(kinds[2]).toBe('rule')
    expect(kinds[kinds.length - 2]).toBe('setup')
    expect(kinds[kinds.length - 1]).toBe('answer')
    expect(sb.steps.length).toBeGreaterThanOrEqual(4)
    expect(sb.finalIndex).toBe(sb.steps.length - 1)

    // the rule is EARNED: beat 0 looks at figure 1, beat 1 at figure 2
    expect(sb.steps[0].focus).toBe(0)
    expect(sb.steps[1].focus).toBe(1)
    expect(sb.steps[1].badge).toBe('check')

    // nothing before the end resolves the gap
    expect(sb.steps.slice(0, -1).every((s) => s.answer === null)).toBe(true)
    expect(sb.steps.slice(0, -1).every((s) => s.result === false)).toBe(true)
    expect(sb.steps[sb.finalIndex].answer).toBe(9)
    expect(sb.steps[sb.finalIndex].result).toBe(true)
    expect(sb.answer).toBe(9)
  })

  test('the rule the storyboard names actually holds for every group on screen', () => {
    for (const [rule, groups] of [
      ['sum', SUM_GROUPS],
      ['diff', DIFF_GROUPS],
      ['sum-minus-one', SMO_GROUPS],
    ] as const) {
      const sb = buildNumberFigureRuleSteps(params(rule, groups, 'c'), 'en')
      expect(sb.rule).toBe(rule)
      expect(sb.groups.every((g) => applyRule(rule, g.a, g.b) === g.c)).toBe(true)
    }
  })

  test('blank as result vs blank as input: the arithmetic works backwards', () => {
    // 6 + 3 = 9 → gap on c is 9
    expect(buildNumberFigureRuleSteps(params('sum', SUM_GROUPS, 'c'), 'en').answer).toBe(9)
    // ? + 3 = 9 → gap on a is 6
    expect(buildNumberFigureRuleSteps(params('sum', SUM_GROUPS, 'a'), 'en').answer).toBe(6)
    // 6 + ? = 9 → gap on b is 3
    expect(buildNumberFigureRuleSteps(params('sum', SUM_GROUPS, 'b'), 'en').answer).toBe(3)
    // 13 − 6 = 7 → each gap in turn
    expect(buildNumberFigureRuleSteps(params('diff', DIFF_GROUPS, 'a'), 'en').answer).toBe(13)
    expect(buildNumberFigureRuleSteps(params('diff', DIFF_GROUPS, 'b'), 'en').answer).toBe(6)
    expect(buildNumberFigureRuleSteps(params('diff', DIFF_GROUPS, 'c'), 'en').answer).toBe(7)
    // 7 + 2 − 1 = 8
    expect(buildNumberFigureRuleSteps(params('sum-minus-one', SMO_GROUPS, 'a'), 'en').answer).toBe(7)
    expect(buildNumberFigureRuleSteps(params('sum-minus-one', SMO_GROUPS, 'b'), 'en').answer).toBe(2)
    expect(buildNumberFigureRuleSteps(params('sum-minus-one', SMO_GROUPS, 'c'), 'en').answer).toBe(8)
  })

  test('every arithmetic claim in every caption and work line is true', () => {
    for (const [rule, groups] of [
      ['sum', SUM_GROUPS],
      ['diff', DIFF_GROUPS],
      ['sum-minus-one', SMO_GROUPS],
    ] as const) {
      for (const blank of ['a', 'b', 'c'] as Slot[]) {
        for (const lang of ['en', 'id'] as const) {
          const sb = buildNumberFigureRuleSteps(params(rule, groups, blank), lang)
          for (const s of sb.steps) {
            const claims = [
              ...arithmeticClaims(s.caption, sb.answer),
              ...arithmeticClaims(s.work.expr, sb.answer),
              ...arithmeticClaims(s.work.sub ?? '', sb.answer),
            ]
            for (const c of claims) {
              expect(`${rule}/${blank}/${lang} ${c.claim}: ${c.ok}`).toBe(
                `${rule}/${blank}/${lang} ${c.claim}: true`,
              )
            }
          }
        }
      }
    }
  })

  test('the trap beat disproves the tempting number instead of asserting it', () => {
    // diff with the result blanked: the tempting move is to add
    const sb = buildNumberFigureRuleSteps(params('diff', DIFF_GROUPS, 'c'), 'id')
    const trap = sb.steps.find((s) => s.kind === 'trap')
    expect(trap).toBeDefined()
    expect(trap?.badge).toBe('cross')
    expect(trap?.work.tone).toBe('trap')
    // it shows the addition that tempts (13 + 6 = 19) and kills it on figure 1
    expect(trap?.caption).toContain('13 + 6 = 19')
    expect(trap?.caption).toContain('9 + 4 = 13')
    expect(trap?.caption).toContain('bukan 5')
    // the trap never shows the real answer as its own value
    expect(trap?.answer).toBeNull()
    // the disproof lands on a solved group, so the gap keeps its "?"
    expect(trap?.trial).toBeNull()
  })

  test('when the gap itself is being tested, the rejected candidate sits in it', () => {
    // sum with an input blanked: the slip is to add the two visible numbers
    const sb = buildNumberFigureRuleSteps(params('sum', SUM_GROUPS, 'a'), 'id')
    const trap = sb.steps.find((s) => s.kind === 'trap')
    expect(trap).toBeDefined()
    expect(trap?.focus).toBe(2)
    // 9 + 3 = 12 is the tempting number, and it is NOT the answer (6)
    expect(trap?.trial).toBe(12)
    expect(trap?.trial).not.toBe(sb.answer)
    expect(trap?.caption).toContain('9 + 3 = 12')
    // no other beat parks a number in the gap
    expect(sb.steps.filter((s) => s.trial !== null)).toHaveLength(1)
  })

  test('sum with the result blanked has no honest trap, so no trap beat', () => {
    const sb = buildNumberFigureRuleSteps(params('sum', SUM_GROUPS, 'c'), 'en')
    expect(sb.steps.some((s) => s.kind === 'trap')).toBe(false)
  })

  test('both layouts survive, including the legacy layout names', () => {
    expect(buildNumberFigureRuleSteps(params('sum', SUM_GROUPS, 'c', 'row'), 'id').layout).toBe('row')
    expect(buildNumberFigureRuleSteps(params('sum', SUM_GROUPS, 'c', 'pyramid'), 'id').layout).toBe(
      'pyramid',
    )
    expect(buildNumberFigureRuleSteps(params('sum', SUM_GROUPS, 'c', 'chain'), 'id').layout).toBe('row')
    expect(buildNumberFigureRuleSteps(params('sum', SUM_GROUPS, 'c', 'triangle'), 'id').layout).toBe(
      'pyramid',
    )
  })

  test('a stale rule that the picture contradicts is re-derived from the groups', () => {
    // the stored rule says "sum" but every group on screen is a subtraction
    const sb = buildNumberFigureRuleSteps(params('sum' as RuleKind, DIFF_GROUPS, 'c'), 'en')
    expect(sb.rule).toBe('diff')
    expect(sb.answer).toBe(7)
    expect(sb.steps[0].caption).toContain(`9 ${MINUS} 4 = 5`)
  })

  test('malformed params fall back to a drawable sample instead of NaN', () => {
    const sb = buildNumberFigureRuleSteps({ groups: 'nope' }, 'id')
    expect(sb.groups).toHaveLength(3)
    expect(Number.isInteger(sb.answer)).toBe(true)
    expect(sb.steps.every((s) => !/NaN|undefined/.test(s.caption))).toBe(true)
  })

  test('language switch: id and en captions differ and stay in their own language', () => {
    const en = buildNumberFigureRuleSteps(params('sum', SUM_GROUPS, 'c'), 'en')
    const id = buildNumberFigureRuleSteps(params('sum', SUM_GROUPS, 'c'), 'id')
    expect(en.steps[1].caption).toContain('Check figure 2')
    expect(id.steps[1].caption).toContain('Cek gambar 2')
    expect(en.steps[2].caption).toContain('add the first two numbers')
    expect(id.steps[2].caption).toContain('angka pertama ditambah angka kedua')
    expect(id.steps[id.finalIndex].caption).toContain('Angka yang hilang: 9')
  })

  test('deterministic: same params in, identical storyboard out', () => {
    const a = buildNumberFigureRuleSteps(params('sum-minus-one', SMO_GROUPS, 'b'), 'id')
    const b = buildNumberFigureRuleSteps(params('sum-minus-one', SMO_GROUPS, 'b'), 'id')
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  test('solveBlank inverts the rule for every slot', () => {
    const g: Triple = { a: 6, b: 3, c: 9 }
    expect(solveBlank('sum', g, 'c')).toBe(9)
    expect(solveBlank('sum', g, 'a')).toBe(6)
    expect(solveBlank('sum', g, 'b')).toBe(3)
    const d: Triple = { a: 9, b: 3, c: 6 }
    expect(solveBlank('diff', d, 'c')).toBe(6)
    expect(solveBlank('diff', d, 'a')).toBe(9)
    expect(solveBlank('diff', d, 'b')).toBe(3)
    const s: Triple = { a: 6, b: 4, c: 9 }
    expect(solveBlank('sum-minus-one', s, 'c')).toBe(9)
    expect(solveBlank('sum-minus-one', s, 'a')).toBe(6)
    expect(solveBlank('sum-minus-one', s, 'b')).toBe(4)
  })
})
