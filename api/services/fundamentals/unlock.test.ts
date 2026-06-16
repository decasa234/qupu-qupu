import { describe, it, expect } from 'vitest'
import { applyLinearUnlock } from './unlock.js'

const seq = (...completed: boolean[]) =>
  completed.map((c, i) => ({ slug: `l${i}`, completed: c }))

describe('applyLinearUnlock', () => {
  it('unlocks the first lesson even when nothing is complete', () => {
    const r = applyLinearUnlock(seq(false, false, false))
    expect(r.map((l) => l.locked)).toEqual([false, true, true])
  })

  it('unlocks the next lesson once the prior is complete', () => {
    const r = applyLinearUnlock(seq(true, false, false))
    expect(r.map((l) => l.locked)).toEqual([false, false, true])
  })

  it('unlocks everything when all lessons are complete', () => {
    const r = applyLinearUnlock(seq(true, true, true))
    expect(r.map((l) => l.locked)).toEqual([false, false, false])
  })

  it('never locks a completed lesson that sits after an incomplete one', () => {
    const r = applyLinearUnlock(seq(false, true))
    // l0 is the unlocked "next"; l1 is completed so it must not be locked.
    expect(r.map((l) => l.locked)).toEqual([false, false])
  })

  it('returns an empty array unchanged', () => {
    expect(applyLinearUnlock([])).toEqual([])
  })
})
