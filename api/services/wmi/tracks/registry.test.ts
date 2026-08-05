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
  it('registers the pilot track as published', () => {
    const track = getTrack('wmi-grade-1')
    expect(track).toBeDefined()
    expect(track!.mode).toBe('wmi')
    expect(track!.grade).toBe(1)
    expect(track!.status).toBe('published')
    expect(track!.theme).toBe('forest')
    expect(track!.units.length).toBeGreaterThan(0)
  })

  // Asserts the STRUCTURE, not the content. This used to pin the two slugs the
  // pilot track happened to contain, which made it fail the moment the track
  // was generated from the curriculum — a test that only described the status
  // quo. What actually has to hold is that every unit ends with a gate and that
  // a gate never requires a concept the child has not met yet.
  it('lists concept slugs in spine order, concepts before their gate', () => {
    for (const track of TRACKS) {
      const slugs = conceptSlugsInSpineOrder(track)
      expect(slugs.length).toBeGreaterThan(0)
      expect(new Set(slugs).size).toBe(slugs.length)

      const seen = new Set<string>()
      for (const unit of track.units) {
        const last = unit.nodes[unit.nodes.length - 1]
        expect(last.kind, `${track.id}/${unit.key} must end with its gate`).toBe('gate')
        for (const node of unit.nodes) {
          if (node.kind === 'concept') seen.add(node.slug)
          else for (const req of node.requires) expect(seen.has(req)).toBe(true)
        }
      }
    }
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
  it('delegates to TRACKS and finds the published wmi grade-1 pilot', () => {
    expect(getPublishedTrack('wmi', 1)?.id).toBe('wmi-grade-1')
  })
})
