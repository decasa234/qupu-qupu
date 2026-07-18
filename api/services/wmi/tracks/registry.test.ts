import { describe, expect, it } from 'vitest'
import { TRACKS, getTrack, conceptSlugsInSpineOrder } from './registry.js'

describe('track registry', () => {
  it('registers the pilot track as draft', () => {
    const track = getTrack('wmi-grade-1')
    expect(track).toBeDefined()
    expect(track!.mode).toBe('wmi')
    expect(track!.grade).toBe(1)
    expect(track!.status).toBe('draft')
    expect(track!.theme).toBe('forest')
    expect(track!.units.length).toBeGreaterThan(0)
  })

  it('lists concept slugs in spine order, concepts before their gate', () => {
    const track = getTrack('wmi-grade-1')!
    const slugs = conceptSlugsInSpineOrder(track)
    expect(slugs).toEqual(['single-digit-addition'])
    const gate = track.units[0].nodes.find((n) => n.kind === 'gate')
    expect(gate).toBeDefined()
  })

  it('getTrack returns undefined for unknown ids', () => {
    expect(getTrack('nope')).toBeUndefined()
  })

  it('every registered track id is unique', () => {
    const ids = TRACKS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
