import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { answerLabel, boxesNeeded, distractors, optionValues } from './index.js'

describe('container-capacity-allocation', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: answer is the ceiling of total / capacity, served as A-D', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      // There must be a genuine leftover, so ceiling > floor.
      expect(p.total % p.capacity).not.toBe(0)

      const floor = Math.floor(p.total / p.capacity)
      const ceil = Math.ceil(p.total / p.capacity)
      expect(floor + 1).toBe(ceil)

      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      expect(r.answer).toMatch(/^[A-D]$/)

      const choices = r.choices_id!
      expect(choices).toHaveLength(4)
      expect(choices.map((c) => c.label)).toEqual(['A', 'B', 'C', 'D'])

      const values = choices.map((c) => Number(c.text))
      // distinct, positive, ascending
      expect(new Set(values).size).toBe(4)
      expect(values.every((v) => Number.isInteger(v) && v > 0)).toBe(true)
      expect(values).toEqual([...values].sort((a, b) => a - b))

      // The labelled option carries the independently recomputed ceiling.
      const picked = choices.find((c) => c.label === r.answer)!
      expect(Number(picked.text)).toBe(ceil)
      expect(Number(picked.text)).toBe(boxesNeeded(p))

      // The breakdown agrees with the served answer, as a choice letter.
      expect(r.breakdown?.answer.form).toBe('choice')
      expect(r.breakdown?.answer.value).toBe(r.answer)

      // The floor-division trap is one of the options, and never the answer.
      expect(values).toContain(Number(r.breakdown?.trap?.wrong))
      expect(Number(r.breakdown?.trap?.wrong)).toBe(floor)

      for (const h of r.breakdown?.highlights ?? []) {
        expect(r.body_en).toContain(h.phrase_en)
        expect(r.body_id).toContain(h.phrase_id)
      }
    }
  })

  test('the answer does not sit in a fixed slot across seeds', () => {
    const labels = new Set<string>()
    for (let seed = 1; seed <= 200; seed++) {
      labels.add(concept.render(concept.generate(mulberry32(seed))).answer)
    }
    // B, C and D are all reachable. A is not, by design: the floor-division
    // option is always served and is always smaller than the answer.
    expect([...labels].sort()).toEqual(['B', 'C', 'D'])
  })

  test('every wrong option is a named misconception', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const p = concept.generate(mulberry32(seed))
      const ds = distractors(p)
      expect(ds).toHaveLength(3)
      // the floor-division trap is always on the board
      expect(ds.some((d) => d.kind === 'floorMiss' && d.value === boxesNeeded(p) - 1)).toBe(true)
      expect(ds.every((d) => d.kind !== 'spare')).toBe(true)
    }
  })

  test('worked example: 137 eggs, boxes of 9 -> 16 boxes (15 remainder 2)', () => {
    const p = { total: 137, capacity: 9 }
    expect(boxesNeeded(p)).toBe(16)
    // (137 + 9) % 4 = 2 → the 'floorMiss / doubleCount / boxPerLeftover' set.
    // 15 = floor division; 17 = counted the part-full box twice; 15 + 2 = 17…
    // collides, so the cycle moves on to 'floorMiss / doubleCount / perBox'.
    expect(distractors(p)).toEqual([
      { kind: 'floorMiss', value: 15 },
      { kind: 'doubleCount', value: 17 },
      { kind: 'perBox', value: 9 },
    ])
    expect(optionValues(p)).toEqual([9, 15, 16, 17])
    expect(answerLabel(p)).toBe('C')
  })

  test('a trio entirely below the answer puts it on D', () => {
    // 22 eggs, boxes of 3 → 8 boxes. floor 7, remainder 1, capacity 3 — every
    // wrong option sits below the answer, so the answer sorts last.
    const p = { total: 22, capacity: 3 }
    expect(boxesNeeded(p)).toBe(8)
    expect(distractors(p)).toEqual([
      { kind: 'floorMiss', value: 7 },
      { kind: 'leftoverCount', value: 1 },
      { kind: 'perBox', value: 3 },
    ])
    expect(optionValues(p)).toEqual([1, 3, 7, 8])
    expect(answerLabel(p)).toBe('D')
  })

  test('options stay distinct and positive on params the generator would skip', () => {
    // remainder 3 collides with answer + 1 (= 3), so the sets that use it are
    // skipped and `capacity` stands in.
    const p = { total: 23, capacity: 20 }
    expect(boxesNeeded(p)).toBe(2)
    expect(optionValues(p)).toEqual([1, 2, 3, 20])
    expect(answerLabel(p)).toBe('B')

    // Exact fit: answer 1, so floorMiss would be 0 — the ladder escapes upward.
    const q = { total: 20, capacity: 20 }
    const vals = optionValues(q)
    expect(new Set(vals).size).toBe(4)
    expect(vals.every((v) => Number.isInteger(v) && v > 0)).toBe(true)
    expect(Number(concept.render(q).choices_id!.find((c) => c.label === answerLabel(q))!.text)).toBe(1)
  })
})
