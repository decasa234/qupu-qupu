import { describe, test, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  applyRule,
  buildNumberFigureRuleSteps,
  solveBlank,
  type RuleKind,
  type Slot,
  type Triple,
} from './numberFigureRuleSteps'
import NumberFigureRuleIllustration, {
  GAP_DASH,
  RULE_INK,
  bubbleNumeral,
  ruleFigureAriaLabel,
  ruleGeometry,
  type Layout,
} from '../number-figure-rule'
import NumberFigureRuleExplainer from './NumberFigureRuleExplainer'

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

// ---------------------------------------------------------------------------
// The figure's aria-label
// ---------------------------------------------------------------------------

const LAYOUTS: Layout[] = ['row', 'pyramid']

/** Every run of digits in a string, as numbers. */
function digitsIn(text: string): number[] {
  return (text.match(/\d+/g) ?? []).map(Number)
}

describe('ruleFigureAriaLabel', () => {
  test('names the layout, the group count and every given number', () => {
    const label = ruleFigureAriaLabel({
      layout: 'row',
      groups: SUM_GROUPS,
      blankPosition: 'c',
    })
    expect(label).toBe(
      'Tiga kelompok angka, satu kelompok tiap baris. Tiap baris berisi tiga lingkaran berjajar mendatar, dan panah menunjuk ke lingkaran terakhir. ' +
        'Semua kelompok memakai aturan yang sama. ' +
        'Kelompok 1: 8 dan 4 menjadi 12. Kelompok 2: 5 dan 7 menjadi 12. Kelompok 3: 6 dan 3 menjadi tanda tanya. ' +
        'Satu lingkaran berisi tanda tanya, itulah angka yang harus dicari.',
    )
    // the pyramid label describes the other picture, not the same words
    const pyramid = ruleFigureAriaLabel({
      layout: 'pyramid',
      groups: SUM_GROUPS,
      blankPosition: 'c',
    })
    expect(pyramid).toContain('berbentuk segitiga')
    expect(pyramid).not.toContain('tiap baris')
  })

  test('speaks the blank as "tanda tanya" and never leaks a number that is not given', () => {
    for (const layout of LAYOUTS) {
      for (const [rule, groups] of [
        ['sum', SUM_GROUPS],
        ['diff', DIFF_GROUPS],
        ['sum-minus-one', SMO_GROUPS],
      ] as const) {
        for (const blank of ['a', 'b', 'c'] as Slot[]) {
          const label = ruleFigureAriaLabel({ layout, groups, blankPosition: blank })
          const where = `${layout}/${rule}/${blank}`

          expect(`${where} ${label.includes('tanda tanya')}`).toBe(`${where} true`)

          // Everything the label says out loud: the three group numbers plus the
          // GIVEN slots. The blanked slot must never appear.
          const shown = [1, 2, 3]
          groups.forEach((g, i) => {
            for (const slot of ['a', 'b', 'c'] as Slot[]) {
              if (i === 2 && slot === blank) continue
              shown.push(g[slot])
            }
          })
          const spoken = digitsIn(label)
          expect(`${where} ${spoken.length}`).toBe(`${where} ${shown.length}`)
          expect(`${where} ${[...spoken].sort((x, y) => x - y).join()}`).toBe(
            `${where} ${[...shown].sort((x, y) => x - y).join()}`,
          )

          // The blanked slot itself reads as a question mark, whatever its value.
          expect(`${where} ${label}`).toContain(
            blank === 'a'
              ? `Kelompok 3: tanda tanya dan ${groups[2].b} menjadi ${groups[2].c}`
              : blank === 'b'
                ? `Kelompok 3: ${groups[2].a} dan tanda tanya menjadi ${groups[2].c}`
                : `Kelompok 3: ${groups[2].a} dan ${groups[2].b} menjadi tanda tanya`,
          )
        }
      }
    }
  })

  test('same params in, identical label out', () => {
    const p = { layout: 'pyramid' as Layout, groups: DIFF_GROUPS, blankPosition: 'b' as Slot }
    expect(ruleFigureAriaLabel(p)).toBe(ruleFigureAriaLabel(p))
  })
})

// ---------------------------------------------------------------------------
// Figure ↔ explainer: one geometry, not two copies of it
// ---------------------------------------------------------------------------

const figureHtml = (p: unknown) =>
  renderToStaticMarkup(createElement(NumberFigureRuleIllustration, { params: p }))

const explainerHtml = (p: unknown, step: number) =>
  renderToStaticMarkup(
    createElement(NumberFigureRuleExplainer, { params: p, correctAnswer: '9', lang: 'id', step }),
  )

describe('the explainer draws the figure, not a copy of it', () => {
  for (const layout of LAYOUTS) {
    test(`${layout}: both SSR renders agree on every shared coordinate and ink`, () => {
      const p = params('sum', SUM_GROUPS, 'c', layout)
      const fig = figureHtml(p)
      const exp = explainerHtml(p, 0)
      const geom = ruleGeometry(layout)

      // the connector trigonometry: long, distinctive strings from one function
      for (const group of geom.groups) {
        for (const arrow of group.arrows) {
          expect(fig).toContain(`points="${arrow.head}"`)
          expect(exp).toContain(`points="${arrow.head}"`)
          expect(fig).toContain(`x1="${arrow.x1}"`)
          expect(exp).toContain(`x1="${arrow.x1}"`)
          expect(fig).toContain(`y2="${arrow.y2}"`)
          expect(exp).toContain(`y2="${arrow.y2}"`)
        }
        // the card and every bubble seat
        expect(fig).toContain(`height="${group.card.h}"`)
        expect(exp).toContain(`height="${group.card.h}"`)
        for (const seat of group.seats) {
          expect(fig).toContain(`cx="${seat.cx}"`)
          expect(exp).toContain(`cx="${seat.cx}"`)
          expect(fig).toContain(`cy="${seat.cy}"`)
          expect(exp).toContain(`cy="${seat.cy}"`)
        }
      }

      // the numeral inside a bubble is sized by the shared helper
      const size = bubbleNumeral(0, 0, geom.r).fontSize
      expect(fig).toContain(`font-size="${size}"`)
      expect(exp).toContain(`font-size="${size}"`)

      // the palette, and the dashes that mark the still-open gap
      for (const ink of [RULE_INK.given, RULE_INK.result, RULE_INK.card, RULE_INK.link]) {
        expect(fig).toContain(ink)
        expect(exp).toContain(ink)
      }
      expect(fig).toContain(`stroke-dasharray="${GAP_DASH}"`)
      expect(exp).toContain(`stroke-dasharray="${GAP_DASH}"`)

      // the figure's own viewBox comes from the same geometry
      expect(fig).toContain(`viewBox="0 0 ${geom.width} ${geom.figureHeight}"`)
      // the explainer keeps that width and only grows downward for its work strip
      expect(exp).toContain(`viewBox="0 0 ${geom.width} `)
    })
  }

  test('the figure renders identically for identical params', () => {
    const p = params('diff', DIFF_GROUPS, 'a', 'pyramid')
    expect(figureHtml(p)).toBe(figureHtml(p))
  })
})
