import { describe, expect, it } from 'vitest'
import { validateTrack, type ValidatorDeps } from './validate.js'
import { TRACKS } from './registry.js'
import { getConcept } from '../concepts/registry.js'
import { hasLevelGeneration } from '../concepts/levels.js'
import type { TrackDef } from './types.js'

const okDeps: ValidatorDeps = {
  conceptExists: () => true,
  conceptHasLevels: () => true,
  problemRefExists: () => true,
}

const base: TrackDef = {
  id: 't', mode: 'wmi', grade: 1, status: 'draft', theme: 'forest',
  nameId: 'T', nameEn: 'T',
  units: [{
    key: 'u1', nameId: 'U', nameEn: 'U', colorHex: '#000000', iconKey: 'plus',
    nodes: [
      { kind: 'concept', slug: 'a' },
      { kind: 'gate', key: 'g1', problemRef: 'P#1', requires: ['a'] },
    ],
  }],
}

describe('validateTrack', () => {
  it('accepts a well-formed track', () => {
    expect(validateTrack(base, okDeps)).toEqual([])
  })

  it('rejects unknown concept slugs', () => {
    const errs = validateTrack(base, { ...okDeps, conceptExists: () => false })
    expect(errs.join(' ')).toMatch(/unknown concept/i)
  })

  it('rejects concepts without level generation', () => {
    const errs = validateTrack(base, { ...okDeps, conceptHasLevels: () => false })
    expect(errs.join(' ')).toMatch(/level/i)
  })

  it('rejects gate requires that do not appear earlier in the spine', () => {
    const bad: TrackDef = {
      ...base,
      units: [{
        ...base.units[0],
        nodes: [
          { kind: 'gate', key: 'g1', problemRef: 'P#1', requires: ['a'] },
          { kind: 'concept', slug: 'a' },
        ],
      }],
    }
    expect(validateTrack(bad, okDeps).join(' ')).toMatch(/earlier in the spine/i)
  })

  it('rejects unresolvable problemRefs and malformed refs', () => {
    expect(
      validateTrack(base, { ...okDeps, problemRefExists: () => false }).join(' '),
    ).toMatch(/problemRef/i)
    const malformed: TrackDef = {
      ...base,
      units: [{
        ...base.units[0],
        nodes: [
          { kind: 'concept', slug: 'a' },
          { kind: 'gate', key: 'g1', problemRef: 'no-hash', requires: ['a'] },
        ],
      }],
    }
    expect(validateTrack(malformed, okDeps).join(' ')).toMatch(/problemRef/i)
  })

  it('rejects duplicate gate keys and duplicate concept slugs', () => {
    const dup: TrackDef = {
      ...base,
      units: [{
        ...base.units[0],
        nodes: [
          { kind: 'concept', slug: 'a' },
          { kind: 'concept', slug: 'a' },
          { kind: 'gate', key: 'g1', problemRef: 'P#1', requires: ['a'] },
          { kind: 'gate', key: 'g1', problemRef: 'P#2', requires: ['a'] },
        ],
      }],
    }
    const errs = validateTrack(dup, okDeps)
    expect(errs.join(' ')).toMatch(/duplicate/i)
  })
})

// CI gate: every REGISTERED track must validate against the real registries.
// problemRef existence needs the DB, so statically we check format only —
// the Postgres suite (Task 6) covers live resolution.
describe('registered tracks are valid', () => {
  it('validates every track in TRACKS', () => {
    for (const track of TRACKS) {
      const errs = validateTrack(track, {
        conceptExists: (slug) => getConcept(slug) !== undefined,
        conceptHasLevels: (slug) => hasLevelGeneration(slug),
        problemRefExists: (ref) => /^[A-Z0-9-]+#\d+$/.test(ref),
      })
      expect(errs, `track ${track.id}`).toEqual([])
    }
  })
})
