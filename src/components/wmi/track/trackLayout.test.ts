import { describe, it, expect } from 'vitest'
import { pickCheckpoint } from './TrackTrail'
import type { TrackUnitState } from '../../../types/wmi'

function concept(slug: string, level: number, gold = level >= 5): TrackUnitState['nodes'][number] {
  return { kind: 'concept', slug, nameId: slug, level, gold }
}

function gate(key: string): TrackUnitState['nodes'][number] {
  return { kind: 'gate', key, problemRef: `WMI-1#${key}`, requires: [], unlocked: true, cleared: false }
}

function unit(key: string, unlocked: boolean, nodes: TrackUnitState['nodes']): TrackUnitState {
  return { key, nameId: key, colorHex: '#000000', iconKey: 'star', unlocked, nodes }
}

describe('pickCheckpoint', () => {
  it('picks the first non-gold concept in an unlocked unit', () => {
    const units = [
      unit('u1', true, [concept('a', 5), concept('b', 2), concept('c', 0), gate('g1')]),
    ]
    expect(pickCheckpoint(units)).toBe('b')
  })

  it('skips locked units and finds the checkpoint in the first unlocked one', () => {
    const units = [
      unit('locked', false, [concept('a', 0)]),
      unit('u2', true, [concept('b', 5), concept('c', 3)]),
    ]
    expect(pickCheckpoint(units)).toBe('c')
  })

  it('returns null when every concept in unlocked units is gold', () => {
    const units = [
      unit('u1', true, [concept('a', 5), gate('g1')]),
      unit('locked', false, [concept('b', 0)]),
    ]
    expect(pickCheckpoint(units)).toBeNull()
  })
})
