import { describe, it, expect } from 'vitest'
import { getThemePack } from './themes'

describe('getThemePack', () => {
  it('returns a theme pack with exactly 6 stages', () => {
    const pack = getThemePack('forest')
    expect(pack.stages.length).toBe(6)
  })

  it('stage 0 has icon fa-egg', () => {
    const pack = getThemePack('forest')
    expect(pack.stages[0].icon).toBe('fa-egg')
  })

  it('stage 5 has forest: true and gold bg #ffdd55', () => {
    const pack = getThemePack('forest')
    expect(pack.stages[5].forest).toBe(true)
    expect(pack.stages[5].bg).toBe('#ffdd55')
  })

  it('unknown key falls back to forest', () => {
    const pack = getThemePack('unknown-key')
    expect(pack.key).toBe('forest')
  })

  it('every stage has non-empty rimHex', () => {
    const pack = getThemePack('forest')
    pack.stages.forEach((stage, index) => {
      expect(stage.rimHex, `stage ${index} should have rimHex`).toBeTruthy()
    })
  })
})
