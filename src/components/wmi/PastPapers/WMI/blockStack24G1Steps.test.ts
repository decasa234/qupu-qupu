// Coherence check for WMI-24F1A-Q22 (2024 Grade 1 Final, block stacking).
//
// The explainer's step module DERIVES the tallest legal tower from the colour
// cycle and each colour's stock; the illustration HARDCODES the same tower as
// TOWER_SHAPES so it can draw the build. Keeping the derivation independent is
// deliberate — it is what proves the narrated reasoning actually reproduces the
// picture — but until this test existed the two agreed only by convention, so a
// later edit to either could have silently made the animation narrate a tower
// the figure does not draw.
import { describe, expect, it } from 'vitest'
import { GROUPS, TOWER_SHAPES } from './BlockStack24G1Illustration'
import { STOCK, TOWER } from './blockStack24G1Steps'

describe('blockStack24G1: steps module vs illustration', () => {
  it('describes the same paper: per-colour stock matches the drawn groups', () => {
    const fromIllustration = Object.fromEntries(GROUPS.map((g) => [g.hue, g.blocks]))
    expect(fromIllustration).toEqual(STOCK)
  })

  it('derives exactly the tower the illustration draws', () => {
    expect(TOWER.map((p) => p.kind)).toEqual([...TOWER_SHAPES])
  })

  it('lays blocks in the printed colour cycle', () => {
    const cycle = ['blue', 'green', 'white']
    expect(TOWER.map((p) => p.hue)).toEqual(
      TOWER.map((_, i) => cycle[i % cycle.length]),
    )
  })

  it('ends on a sphere and nowhere else — nothing may sit on a sphere', () => {
    expect(TOWER.at(-1)?.kind).toBe('sphere')
    expect(TOWER.slice(0, -1).every((p) => p.kind !== 'sphere')).toBe(true)
  })

  it('spends no more of a colour than the paper provides', () => {
    for (const hue of ['blue', 'green', 'white'] as const) {
      const used = TOWER.filter((p) => p.hue === hue).map((p) => p.kind).sort()
      const stock = [...STOCK[hue]].sort()
      // every used block must be drawable from that colour's stock
      for (const kind of used) {
        const at = stock.indexOf(kind)
        expect(at, `${hue} ran out of ${kind}`).toBeGreaterThanOrEqual(0)
        stock.splice(at, 1)
      }
    }
  })

  it('is 8 blocks tall — the answer the stored key expects', () => {
    expect(TOWER).toHaveLength(8)
  })
})
