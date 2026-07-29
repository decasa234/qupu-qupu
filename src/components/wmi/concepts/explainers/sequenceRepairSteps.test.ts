import { describe, test, expect } from 'vitest'
import {
  buildSequenceRepairSteps,
  repairAnswer,
  sequenceTerms,
  shownNumbers,
  type SequenceRepairParams,
} from './sequenceRepairSteps'

// 3, 6, __, 12, 15 → 9 (the concept's hand-checked fallback)
const BLANK_UP: SequenceRepairParams = {
  rule: { kind: 'arithmetic', start: 3, step: 3, direction: 'up' },
  length: 5,
  defect: { kind: 'interior-blank', at: 2 },
}

// 60, 50, 40, 30, __, 10, 0 → 20
const BLANK_DOWN: SequenceRepairParams = {
  rule: { kind: 'arithmetic', start: 60, step: 10, direction: 'down' },
  length: 7,
  defect: { kind: 'interior-blank', at: 4 },
}

// 6, 32, 9, __, 12, 48, 15 → 40 (blank sits in the big family)
const BLANK_INTERLEAVED: SequenceRepairParams = {
  rule: { kind: 'interleaved', startA: 6, stepA: 3, startB: 32, stepB: 8 },
  length: 7,
  defect: { kind: 'interior-blank', at: 3 },
}

// 8, 27, 10, 36, … blank at index 1 → the family anchor has to come from AFTER it
const BLANK_FIRST_BIG: SequenceRepairParams = {
  rule: { kind: 'interleaved', startA: 8, stepA: 2, startB: 27, stepB: 9 },
  length: 8,
  defect: { kind: 'interior-blank', at: 1 },
}

// 3, 21, 7, __, 11, 35, 15, 42 → 28. The blank sits inside a 4-member big
// family, so the step must be read off a rung that steps clear of it (21→35
// would be two jumps, not one).
const BLANK_MID_BIG: SequenceRepairParams = {
  rule: { kind: 'interleaved', startA: 3, stepA: 4, startB: 21, stepB: 7 },
  length: 8,
  defect: { kind: 'interior-blank', at: 3 },
}

// 45, 50, 54, 55, 60, 65, 70 → remove 54
const INTRUDER_UP: SequenceRepairParams = {
  rule: { kind: 'arithmetic', start: 45, step: 5, direction: 'up' },
  length: 6,
  defect: { kind: 'intruder', at: 2, value: 54 },
}

// 8, 6, 5, 4, 2, 0 → remove 5
const INTRUDER_DOWN: SequenceRepairParams = {
  rule: { kind: 'arithmetic', start: 8, step: 2, direction: 'down' },
  length: 5,
  defect: { kind: 'intruder', at: 2, value: 5 },
}

// 3, 24, 7, 5, 30, 11, 36, 15 → remove 5
const INTRUDER_INTERLEAVED: SequenceRepairParams = {
  rule: { kind: 'interleaved', startA: 3, stepA: 4, startB: 24, stepB: 6 },
  length: 7,
  defect: { kind: 'intruder', at: 3, value: 5 },
}

// 15, 18, 21, …, 33, 36 → 3 hidden
const HIDDEN: SequenceRepairParams = {
  rule: { kind: 'arithmetic', start: 15, step: 3, direction: 'up' },
  length: 8,
  defect: { kind: 'hidden-run', from: 3, count: 3 },
}

const ALL: Array<[string, SequenceRepairParams]> = [
  ['blank up', BLANK_UP],
  ['blank down', BLANK_DOWN],
  ['blank interleaved', BLANK_INTERLEAVED],
  ['blank first big', BLANK_FIRST_BIG],
  ['blank mid big', BLANK_MID_BIG],
  ['intruder up', INTRUDER_UP],
  ['intruder down', INTRUDER_DOWN],
  ['intruder interleaved', INTRUDER_INTERLEAVED],
  ['hidden run', HIDDEN],
]

describe('sequence term arithmetic mirrors the concept', () => {
  test('arithmetic runs climb and fall by the step', () => {
    expect(sequenceTerms(BLANK_UP)).toEqual([3, 6, 9, 12, 15])
    expect(sequenceTerms(BLANK_DOWN)).toEqual([60, 50, 40, 30, 20, 10, 0])
  })

  test('interleaved runs take turns between the two families', () => {
    expect(sequenceTerms(BLANK_INTERLEAVED)).toEqual([6, 32, 9, 40, 12, 48, 15])
  })

  test('the intruder is wedged into the shown list, nothing removed', () => {
    expect(shownNumbers(INTRUDER_UP)).toEqual([45, 50, 54, 55, 60, 65, 70])
    expect(shownNumbers(BLANK_UP)).toEqual([3, 6, 9, 12, 15])
  })

  test('the answer is the blank value, the intruder, or the hidden count', () => {
    expect(repairAnswer(BLANK_UP)).toBe('9')
    expect(repairAnswer(INTRUDER_UP)).toBe('54')
    expect(repairAnswer(HIDDEN)).toBe('3')
  })
})

describe('buildSequenceRepairSteps — shape', () => {
  test.each(ALL)('%s: at least 3 beats, exactly one result, the last', (_name, params) => {
    const sb = buildSequenceRepairSteps(params, 'id')
    expect(sb.beats.length).toBeGreaterThanOrEqual(3)
    expect(sb.finalIndex).toBe(sb.beats.length - 1)
    expect(sb.beats.filter((b) => b.result)).toHaveLength(1)
    expect(sb.beats[sb.finalIndex].result).toBe(true)
    expect(sb.beats[sb.finalIndex].hold).toBe(0)
    expect(sb.beats.slice(0, -1).every((b) => b.hold > 0)).toBe(true)
  })

  test.each(ALL)('%s: no beat carries undefined/NaN text', (_name, params) => {
    for (const lang of ['en', 'id'] as const) {
      const sb = buildSequenceRepairSteps(params, lang)
      for (const beat of sb.beats) {
        const text = [beat.caption, ...beat.chips.map((c) => c.label), ...beat.links.map((l) => l.label)].join(' | ')
        expect(text).not.toMatch(/undefined|NaN/)
      }
    }
  })

  test.each(ALL)('%s: link endpoints stay on the board and ids stay unique', (_name, params) => {
    const sb = buildSequenceRepairSteps(params, 'id')
    for (const beat of sb.beats) {
      expect(new Set(beat.chips.map((c) => c.id)).size).toBe(beat.chips.length)
      expect(new Set(beat.links.map((l) => l.id)).size).toBe(beat.links.length)
      for (const link of beat.links) {
        expect(link.from).toBeGreaterThanOrEqual(0)
        expect(link.to).toBeGreaterThan(link.from)
        expect(link.to).toBeLessThan(beat.chips.length)
      }
    }
  })
})

describe('buildSequenceRepairSteps — the answer only lands on the last beat', () => {
  test.each(ALL)('%s: the final caption names the answer', (_name, params) => {
    const answer = repairAnswer(params)
    for (const lang of ['en', 'id'] as const) {
      const sb = buildSequenceRepairSteps(params, lang)
      expect(sb.answer).toBe(answer)
      expect(sb.beats[sb.finalIndex].caption).toContain(answer)
    }
  })

  test('interior-blank: the missing number never appears on the board before the end', () => {
    for (const params of [BLANK_UP, BLANK_DOWN, BLANK_INTERLEAVED, BLANK_FIRST_BIG, BLANK_MID_BIG]) {
      const sb = buildSequenceRepairSteps(params, 'id')
      const answer = repairAnswer(params)
      for (const beat of sb.beats.slice(0, -1)) {
        expect(beat.chips.map((c) => c.label)).not.toContain(answer)
        expect(beat.chips.some((c) => c.kind === 'blank')).toBe(true)
      }
      // …and the last beat swaps the blank for the number.
      const last = sb.beats[sb.finalIndex]
      expect(last.chips.some((c) => c.kind === 'blank')).toBe(false)
      expect(last.chips.filter((c) => c.tone === 'reveal').map((c) => c.label)).toEqual([answer])
    }
  })

  test('intruder: the culprit is never named in a caption before the end', () => {
    for (const params of [INTRUDER_UP, INTRUDER_DOWN, INTRUDER_INTERLEAVED]) {
      for (const lang of ['en', 'id'] as const) {
        const sb = buildSequenceRepairSteps(params, lang)
        const answer = repairAnswer(params)
        const token = new RegExp(`(^|\\D)${answer}(\\D|$)`)
        for (const beat of sb.beats.slice(0, -1)) {
          expect(beat.caption).not.toMatch(token)
          expect(beat.chips.some((c) => c.tone === 'gone')).toBe(false)
        }
        expect(sb.beats[sb.finalIndex].chips.filter((c) => c.tone === 'gone')).toHaveLength(1)
      }
    }
  })

  test('hidden-run: the dots only open on the last beat, and the trap count is shown first', () => {
    const sb = buildSequenceRepairSteps(HIDDEN, 'id')
    for (const beat of sb.beats.slice(0, -1)) {
      expect(beat.chips.some((c) => c.kind === 'dots')).toBe(true)
    }
    const last = sb.beats[sb.finalIndex]
    expect(last.chips.some((c) => c.kind === 'dots')).toBe(false)
    // 3 hidden numbers revealed, and they are the real ones
    expect(last.chips.filter((c) => c.tone === 'reveal').map((c) => c.label)).toEqual(['24', '27', '30'])
    // the jumps beat states 4 (count + 1) — the classic off-by-one the final beat corrects
    expect(sb.beats[sb.finalIndex - 1].caption).toContain('4 lompatan')
    expect(last.caption).toContain('3 bilangan')
  })
})

describe('buildSequenceRepairSteps — the rule is read before it is used', () => {
  test('arithmetic blank: two intact pairs establish the step before the gap is filled', () => {
    const sb = buildSequenceRepairSteps(BLANK_UP, 'id')
    const captions = sb.beats.map((b) => b.caption)
    // 3, 6, __, 12, 15 — the intact pairs are (12,15) only at the tail plus (3,6)
    expect(captions[1]).toContain('bedanya 3')
    expect(captions[2]).toContain('juga')
    expect(captions[captions.length - 2]).toContain('tepat setelah 6')
    expect(captions[captions.length - 1]).toContain('6 + 3 = 9')
  })

  test('descending blank: the final equation subtracts', () => {
    const sb = buildSequenceRepairSteps(BLANK_DOWN, 'id')
    expect(sb.beats[sb.finalIndex].caption).toContain('30 − 10 = 20')
  })

  test('interleaved blank at index 1 anchors on the family member that comes after', () => {
    const sb = buildSequenceRepairSteps(BLANK_FIRST_BIG, 'en')
    const captions = sb.beats.map((b) => b.caption)
    expect(captions.some((c) => c.includes('After it comes 36'))).toBe(true)
    expect(sb.beats[sb.finalIndex].caption).toContain('36 − 9 = 27')
  })

  test('interleaved blank splits into two family bands with the blank in its own band', () => {
    const sb = buildSequenceRepairSteps(BLANK_INTERLEAVED, 'id')
    expect(sb.layout).toBe('zigzag')
    const split = sb.beats[1]
    expect(split.chips.map((c) => c.row)).toEqual([
      'bottom', 'top', 'bottom', 'top', 'bottom', 'top', 'bottom',
    ])
    // blank at index 3 is a big number, so it rides the top band
    expect(split.chips[3].kind).toBe('blank')
    expect(split.chips[3].row).toBe('top')
  })

  test('interleaved blank: a family step is only ever read off a rung that clears the blank', () => {
    // big family is 21, __, 35, 42 — the only honest rung is 35 → 42
    const sb = buildSequenceRepairSteps(BLANK_MID_BIG, 'id')
    const captions = sb.beats.map((b) => b.caption)
    expect(captions.some((c) => c === 'Yang besar: 35 lalu 42 — tambah 7.')).toBe(true)
    // 21 → 35 is two jumps; claiming it as "tambah 7" would be a lie
    expect(captions.some((c) => c.includes('21 lalu 35'))).toBe(false)
    expect(sb.beats[sb.finalIndex].caption).toContain('21 + 7 = 28')
  })

  test('interleaved blank between the only two visible family members uses the halfway span', () => {
    // big family is 32, __, 48 — no rung clears the blank, so the step comes
    // out of the 16-wide span instead of being asserted.
    const sb = buildSequenceRepairSteps(BLANK_INTERLEAVED, 'id')
    const captions = sb.beats.map((b) => b.caption)
    expect(captions.some((c) => c === 'Yang besar cuma terlihat 32 dan 48 — bedanya 16.')).toBe(true)
    expect(captions.some((c) => c.includes('tambah 8'))).toBe(false)
    expect(captions[captions.length - 2]).toContain('tepat di tengah')
    expect(captions[captions.length - 1]).toBe('Tengah-tengah 32 dan 48 itu 40. Isi 40.')
  })

  test('arithmetic intruder: the expected value is named before the culprit is', () => {
    const sb = buildSequenceRepairSteps(INTRUDER_UP, 'id')
    const captions = sb.beats.map((b) => b.caption)
    // 45, 50, [54], 55, 60, 65, 70 — after 50 it should be 55, and 55 is one box later
    expect(captions.some((c) => c.includes('Setelah 50 seharusnya 55'))).toBe(true)
    expect(captions.some((c) => c.includes('Tapi 55 ada di kotak berikutnya'))).toBe(true)
    expect(captions[captions.length - 1]).toContain('Buang 54')
  })

  test('interleaved intruder: both ladders are read before the odd one out is flagged', () => {
    const sb = buildSequenceRepairSteps(INTRUDER_INTERLEAVED, 'id')
    const captions = sb.beats.map((b) => b.caption)
    expect(captions.some((c) => c.startsWith('Yang kecil: 3 lalu 7'))).toBe(true)
    expect(captions.some((c) => c.startsWith('Yang besar: 24 lalu 30'))).toBe(true)
    const flag = sb.beats[sb.finalIndex - 1]
    expect(flag.caption).toContain('tidak ikut tangga')
    expect(flag.chips[3].tone).toBe('bad')
    expect(flag.chips[3].row).toBe('mid')
  })

  test('hidden run: the step is read off BOTH flanks before the span is measured', () => {
    const sb = buildSequenceRepairSteps(HIDDEN, 'id')
    const captions = sb.beats.map((b) => b.caption)
    expect(captions[1]).toContain('15 lalu 18')
    expect(captions[2]).toContain('Cek ujung kanan: 33 lalu 36')
    expect(captions[3]).toContain('Dari 21 ke 33 bedanya 12')
  })
})

describe('buildSequenceRepairSteps — language switch', () => {
  test.each(ALL)('%s: en and id captions differ and stay in their language', (_name, params) => {
    const en = buildSequenceRepairSteps(params, 'en')
    const id = buildSequenceRepairSteps(params, 'id')
    expect(en.beats.length).toBe(id.beats.length)
    expect(en.beats[0].caption).not.toBe(id.beats[0].caption)
    expect(id.beats[0].caption).toMatch(/kotak|bilangan|Ada/)
    expect(en.beats[0].caption).toMatch(/box|number|hidden/i)
  })

  test('deterministic: same params, same storyboard', () => {
    const a = JSON.stringify(buildSequenceRepairSteps(INTRUDER_INTERLEAVED, 'id'))
    const b = JSON.stringify(buildSequenceRepairSteps(INTRUDER_INTERLEAVED, 'id'))
    expect(a).toBe(b)
  })
})
