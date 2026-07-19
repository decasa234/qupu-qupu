import { describe, expect, it } from 'vitest'
import {
  TRACKS,
  getTrack,
  conceptSlugsInSpineOrder,
  findPublishedTrack,
  getPublishedTrack,
} from './registry.js'
import type { TrackDef, TrackMode } from './types.js'

function makeTrack(overrides: Partial<TrackDef>): TrackDef {
  return {
    id: 'fixture',
    mode: 'wmi',
    grade: 1,
    status: 'draft',
    theme: 'forest',
    nameId: 'Fixture',
    nameEn: 'Fixture',
    units: [],
    ...overrides,
  }
}

describe('track registry', () => {
  it('registers the pilot track as review', () => {
    const track = getTrack('wmi-grade-1')
    expect(track).toBeDefined()
    expect(track!.mode).toBe('wmi')
    expect(track!.grade).toBe(1)
    expect(track!.status).toBe('review')
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

describe('findPublishedTrack', () => {
  it('returns the published match', () => {
    const tracks = [makeTrack({ id: 'a', status: 'published' })]
    expect(findPublishedTrack(tracks, 'wmi', 1)).toBe(tracks[0])
  })

  it('skips draft and review tracks', () => {
    const tracks = [
      makeTrack({ id: 'a', status: 'draft' }),
      makeTrack({ id: 'b', status: 'review' }),
    ]
    expect(findPublishedTrack(tracks, 'wmi', 1)).toBeUndefined()
  })

  it('respects grade — a published track for a different grade is skipped', () => {
    const tracks = [makeTrack({ id: 'a', status: 'published', grade: 2 })]
    expect(findPublishedTrack(tracks, 'wmi', 1)).toBeUndefined()
  })

  it('respects mode — a published track for a different mode is skipped', () => {
    const tracks = [
      makeTrack({ id: 'a', status: 'published', mode: 'basic-math' as TrackMode }),
    ]
    expect(findPublishedTrack(tracks, 'wmi', 1)).toBeUndefined()
  })

  it('returns the first match when several qualify', () => {
    const tracks = [
      makeTrack({ id: 'a', status: 'published' }),
      makeTrack({ id: 'b', status: 'published' }),
    ]
    expect(findPublishedTrack(tracks, 'wmi', 1)).toBe(tracks[0])
  })
})

describe('getPublishedTrack', () => {
  it('delegates to TRACKS and is undefined for wmi grade 1 while the pilot is review', () => {
    expect(getPublishedTrack('wmi', 1)).toBeUndefined()
  })
})
