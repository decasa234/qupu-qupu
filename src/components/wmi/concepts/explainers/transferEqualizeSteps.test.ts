import { describe, test, expect } from 'vitest'
import {
  buildTransferEqualizeSteps,
  equalizingTransfer,
  type TransferParams,
  type TransferStoryboard,
} from './transferEqualizeSteps'

const base: TransferParams = {
  ask: 'equalize',
  nameA: 'Budi',
  nameB: 'Siti',
  startA: 10,
  startB: 4,
  transfer: 3,
  subject: 'giver',
  item_en: 'marbles',
  item_one_en: 'marble',
  item_id: 'kelereng',
}

const equalize = (over: Partial<TransferParams> = {}) =>
  buildTransferEqualizeSteps({ ...base, ...over }, 'en')

const afterTransfer = (over: Partial<TransferParams> = {}) =>
  buildTransferEqualizeSteps(
    { ...base, ask: 'after-transfer', startA: 12, startB: 3, transfer: 2, ...over },
    'en',
  )

const findOriginal = (over: Partial<TransferParams> = {}) =>
  buildTransferEqualizeSteps(
    { ...base, ask: 'find-original', startA: 9, startB: 4, transfer: 3, ...over },
    'en',
  )

/** The counts the two rows show, beat by beat. */
const counts = (sb: TransferStoryboard) => sb.steps.map((s) => [s.countA, s.countB])

describe('equalizingTransfer', () => {
  test('returns the whole number that levels the two counts', () => {
    expect(equalizingTransfer(10, 4)).toBe(3)
    expect(equalizingTransfer(7, 7)).toBe(0)
  })

  test('returns null when no whole number works (odd total)', () => {
    expect(equalizingTransfer(8, 3)).toBeNull()
  })
})

describe('buildTransferEqualizeSteps — equalize', () => {
  test('answer is half the gap, and the storyboard recomputes it from the counts', () => {
    const sb = equalize()
    expect(sb.gapBefore).toBe(6)
    expect(sb.answer).toBe(3)
    // A bogus `transfer` in params is overridden by the direct simulation.
    expect(equalize({ transfer: 5 }).answer).toBe(3)
  })

  test('beats run setup, gap, trap, then the split first move and the rest', () => {
    const sb = equalize()
    expect(sb.steps.map((s) => s.phase)).toEqual(['setup', 'gap', 'trap', 'move', 'move', 'move', 'move'])
  })

  test('the gap is bracketed on the leader before anything moves', () => {
    const sb = equalize()
    expect(sb.steps[1].gap).toEqual({ side: 'A', count: 6 })
  })

  test('the trap beat hands over the whole gap and only swaps the two children', () => {
    const trap = equalize().steps.find((s) => s.trap)!
    expect(trap.trapValue).toBe(6)
    expect([trap.countA, trap.countB]).toEqual([4, 10]) // swapped, not equal
    expect(trap.gap).toEqual({ side: 'B', count: 6 })
    expect(trap.result).toBe(false)
  })

  test('one item moving drops the gap twice — once leaving, once landing', () => {
    const sb = equalize()
    const [lift, land] = sb.steps.slice(3, 5)
    expect(lift.flight).toHaveLength(1)
    expect([lift.countA, lift.countB]).toEqual([9, 4]) // left the giver, landed nowhere
    expect(lift.gap).toEqual({ side: 'A', count: 5 })
    expect(land.flight).toHaveLength(0)
    expect([land.countA, land.countB]).toEqual([9, 5])
    expect(land.gap).toEqual({ side: 'A', count: 4 }) // 6 → 5 → 4: two drops, one item
    expect(land.caption).toContain('2, not 1')
  })

  test('counts walk the story exactly and never go negative', () => {
    expect(counts(equalize())).toEqual([
      [10, 4], // setup
      [10, 4], // gap
      [4, 10], // trap: gave the whole gap away
      [9, 4], // 1 lifted out
      [9, 5], // …and landed
      [8, 6],
      [7, 7], // equal
    ])
  })

  test('the last beat settles both rows equal and names the answer', () => {
    const sb = equalize()
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.settled).toBe(true)
    expect(last.reveal).toBe(sb.answer)
    expect(last.caption).toContain('3 marbles')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('a one-item transfer still gets both half-beats, so the doubling is never skipped', () => {
    const sb = equalize({ startA: 6, startB: 4 })
    expect(sb.answer).toBe(1)
    expect(counts(sb)).toEqual([
      [6, 4],
      [6, 4],
      [4, 6], // trap: swapped
      [5, 4], // lifted
      [5, 5], // landed — and this is the answer beat
    ])
    const last = sb.steps[sb.finalIndex]
    expect(last.caption).toContain('2 off the gap, not 1')
  })
})

describe('buildTransferEqualizeSteps — after-transfer', () => {
  test('answer is the gap after the move, not the gap minus the transfer', () => {
    const sb = afterTransfer()
    expect(sb.gapBefore).toBe(9)
    expect(sb.answer).toBe(5) // 9 − 2×2
    const trap = sb.steps.find((s) => s.trap)!
    expect(trap.trapValue).toBe(7) // 9 − 2, the tempting one
    expect(trap.trapValue).not.toBe(sb.answer)
  })

  test('the trap beat draws its own claim: everything left the giver, nothing landed', () => {
    const trap = afterTransfer().steps.find((s) => s.trap)!
    expect(trap.flight).toHaveLength(2)
    expect([trap.countA, trap.countB]).toEqual([10, 3])
    expect(trap.gap).toEqual({ side: 'A', count: 7 }) // the picture matches the wrong number
    expect(trap.trapRow).toBe('B') // the row the tempting answer forgot to change
  })

  test('counts walk the story exactly and never go negative', () => {
    expect(counts(afterTransfer())).toEqual([
      [12, 3], // setup
      [12, 3], // gap
      [10, 3], // trap: both lifted, neither landed
      [11, 3], // 1 lifted
      [11, 4], // …and landed
      [10, 5], // second item across
    ])
  })

  test('the last beat shows the real after-counts and the doubled gap change', () => {
    const sb = afterTransfer()
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect([last.countA, last.countB]).toEqual([sb.afterA, sb.afterB])
    expect(last.gap).toEqual({ side: 'A', count: 5 })
    expect(last.reveal).toBe(5)
    expect(last.caption).toContain('9 − 2 × 2 = 5')
  })

  test('a single-item transfer still lands on the doubled gap', () => {
    const sb = afterTransfer({ startA: 10, startB: 3, transfer: 1 })
    expect(sb.answer).toBe(5) // 7 − 2
    const last = sb.steps[sb.finalIndex]
    expect([last.countA, last.countB]).toEqual([9, 4])
    expect(last.caption).toContain('7 − 2 × 1 = 5')
  })
})

describe('buildTransferEqualizeSteps — find-original', () => {
  test('opens on the AFTER counts and rewinds to the start', () => {
    const sb = findOriginal()
    expect([sb.afterA, sb.afterB]).toEqual([6, 7])
    expect(sb.answer).toBe(9) // the giver's original count
    expect(counts(sb)).toEqual([
      [6, 7], // setup — the AFTER counts
      [6, 7], // gap — the three that came over glow
      [3, 7], // trap: took another 3 off the giver
      [6, 6], // 1 lifted back off the receiver
      [7, 6], // …and landed back on the giver
      [8, 5],
      [9, 4], // back to the start
    ])
  })

  test('the giver trap subtracts again instead of putting back', () => {
    const trap = findOriginal().steps.find((s) => s.trap)!
    expect(trap.trapValue).toBe(3) // afterA − transfer
    expect(trap.trapRow).toBe('A')
    expect(trap.flight).toHaveLength(3)
  })

  test('the receiver trap adds again instead of taking back', () => {
    const sb = findOriginal({ subject: 'receiver' })
    expect(sb.answer).toBe(4) // the receiver's original count
    const trap = sb.steps.find((s) => s.trap)!
    expect(trap.trapValue).toBe(10) // afterB + transfer
    expect(trap.phantomB).toBe(3)
    expect(trap.countB).toBe(10)
    expect(trap.trapRow).toBe('B')
  })

  test('the last beat restores both rows and names the asked-for child', () => {
    const sb = findOriginal({ subject: 'receiver' })
    const last = sb.steps[sb.finalIndex]
    expect([last.countA, last.countB]).toEqual([sb.startA, sb.startB])
    expect(last.reveal).toBe(4)
    expect(last.highlightRow).toBe('B')
    expect(last.caption).toContain('Siti had 4 marbles at first')
  })
})

describe('buildTransferEqualizeSteps — invariants across every ask', () => {
  const all = [equalize(), afterTransfer(), findOriginal(), findOriginal({ subject: 'receiver' })]

  test('at least 3 beats, and exactly one of them is the result', () => {
    for (const sb of all) {
      expect(sb.steps.length).toBeGreaterThanOrEqual(3)
      expect(sb.steps.filter((s) => s.result)).toHaveLength(1)
      expect(sb.steps[sb.finalIndex].result).toBe(true)
    }
  })

  test('only the final beat reveals the answer', () => {
    for (const sb of all) {
      sb.steps.slice(0, -1).forEach((s) => expect(s.reveal).toBeNull())
      expect(sb.steps[sb.finalIndex].reveal).toBe(sb.answer)
    }
  })

  test('no beat ever shows a negative count, and the counters are conserved', () => {
    for (const sb of all) {
      for (const s of sb.steps) {
        expect(s.countA).toBeGreaterThanOrEqual(0)
        expect(s.countB).toBeGreaterThanOrEqual(0)
        // Every token sits in exactly one place; phantoms are the only invention.
        expect(s.rowA.length + s.rowB.length + s.flight.length).toBe(sb.total)
        const seen = new Set([...s.rowA, ...s.rowB, ...s.flight])
        expect(seen.size).toBe(sb.total)
      }
    }
  })

  test('the tempting number is never the answer', () => {
    for (const sb of all) {
      const trap = sb.steps.find((s) => s.trap)!
      expect(trap).toBeDefined()
      expect(trap.trapValue).not.toBe(sb.answer)
      expect(trap.result).toBe(false)
    }
  })

  test('capacity covers the widest row so the layout never reflows', () => {
    for (const sb of all) {
      const widest = Math.max(...sb.steps.flatMap((s) => [s.countA, s.countB]))
      expect(sb.capacity).toBe(widest)
    }
  })
})

describe('buildTransferEqualizeSteps — language', () => {
  test('id captions use Indonesian wording, en captions use English', () => {
    const id = buildTransferEqualizeSteps(base, 'id')
    const en = buildTransferEqualizeSteps(base, 'en')
    expect(id.steps[0].caption).toContain('punya')
    expect(en.steps[0].caption).toContain('has')
    expect(id.steps[1].caption).toContain('selisih')
    expect(id.steps.find((s) => s.trap)!.caption).toContain('Kalau')
    expect(id.steps[id.finalIndex].caption).toContain('kelereng')
    expect(en.steps[en.finalIndex].caption).toContain('marbles')
  })

  test('the trap chip is localised and both languages keep the same beat shape', () => {
    const id = buildTransferEqualizeSteps({ ...base, ask: 'after-transfer', startA: 12, startB: 3, transfer: 2 }, 'id')
    const en = afterTransfer()
    expect(id.steps.find((s) => s.trap)!.trapLabel).toBe('Selisih 7?')
    expect(en.steps.find((s) => s.trap)!.trapLabel).toBe('Gap 7?')
    expect(id.steps.map((s) => s.phase)).toEqual(en.steps.map((s) => s.phase))
    expect(id.steps.map((s) => s.countA)).toEqual(en.steps.map((s) => s.countA))
  })
})

describe('buildTransferEqualizeSteps — defensive', () => {
  test('junk params still produce a playable storyboard with a result beat', () => {
    const sb = buildTransferEqualizeSteps({}, 'id')
    expect(sb.steps.length).toBeGreaterThanOrEqual(3)
    expect(sb.steps[sb.finalIndex].result).toBe(true)
    sb.steps.forEach((s) => {
      expect(Number.isFinite(s.countA)).toBe(true)
      expect(s.countA).toBeGreaterThanOrEqual(0)
      expect(s.countB).toBeGreaterThanOrEqual(0)
      expect(s.caption).not.toContain('undefined')
      expect(s.caption).not.toContain('NaN')
    })
  })

  test('nobody can give away more than they hold', () => {
    const sb = buildTransferEqualizeSteps({ ...base, ask: 'after-transfer', startA: 2, startB: 0, transfer: 9 }, 'en')
    expect(sb.transfer).toBe(2)
    sb.steps.forEach((s) => expect(s.countA).toBeGreaterThanOrEqual(0))
  })
})
