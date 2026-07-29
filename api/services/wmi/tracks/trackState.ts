// Per-child track state: resolved levels, gate unlock/clear status.
// NOT browser-safe — owns SQL (unlike registry.ts/ladder.ts/types.ts).
import { pool, query } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { getTrack } from './registry.js'
import { effectiveLevel, GOLD_LEVEL } from './ladder.js'
import { getConcept } from '../concepts/registry.js'

export type TrackNodeState =
  | { kind: 'concept'; slug: string; nameId: string; level: number; gold: boolean }
  | {
      kind: 'gate'
      key: string
      problemRef: string
      requires: string[]
      unlocked: boolean
      cleared: boolean
    }

export interface TrackUnitState {
  key: string
  nameId: string
  colorHex: string
  iconKey: string
  unlocked: boolean
  nodes: TrackNodeState[]
}

export interface TrackState {
  trackId: string
  theme: string
  status: string
  units: TrackUnitState[]
}

export async function getTrackState(
  parentUserId: string,
  childId: string,
  trackId: string,
): Promise<TrackState> {
  const track = getTrack(trackId)
  if (!track) throw new Error('Track not found')

  const client = await pool.connect()
  try {
    await assertChildOwnership(client, parentUserId, childId)
  } finally {
    client.release()
  }

  const progress = await query<{ concept_slug: string; level: number | null; best_tier: number }>(
    `SELECT concept_slug, level, best_tier FROM wmi_concept_progress WHERE child_id = $1`,
    [childId],
  )
  const levelBySlug = new Map(progress.map((p) => [p.concept_slug, effectiveLevel(p.level, p.best_tier)]))

  const clears = await query<{ gate_key: string }>(
    `SELECT gate_key FROM wmi_gate_clears WHERE child_id = $1 AND track_id = $2`,
    [childId, trackId],
  )
  const cleared = new Set(clears.map((c) => c.gate_key))

  // Test-out "jump": passing a chapter's Tes Bab unlocks every unit up to and
  // including it, PLUS the next one — so clearing a far gate opens everything
  // before it (mirrors /belajar, where any locked chapter's boss is takeable).
  // maxClearedIdx is the deepest unit whose gate(s) are all cleared; every unit
  // at or before maxClearedIdx + 1 is open.
  const gateKeysByUnit = track.units.map((u) =>
    u.nodes.flatMap((n) => (n.kind === 'gate' ? [n.key] : [])),
  )
  let maxClearedIdx = -1
  gateKeysByUnit.forEach((keys, i) => {
    if (keys.length > 0 && keys.every((k) => cleared.has(k))) maxClearedIdx = i
  })

  let previousGateCleared = true // first unit is always open
  const units: TrackUnitState[] = track.units.map((unit, i) => {
    // Open by normal progression (previous gate cleared, or a transparent
    // no-gate unit passing through) OR by a test-out jump reaching here.
    const unlocked = previousGateCleared || i <= maxClearedIdx + 1
    const nodes: TrackNodeState[] = unit.nodes.map((node) => {
      if (node.kind === 'concept') {
        const level = levelBySlug.get(node.slug) ?? 0
        return {
          kind: 'concept' as const,
          slug: node.slug,
          nameId: getConcept(node.slug)?.meta.name_id ?? node.slug,
          level,
          gold: level >= GOLD_LEVEL,
        }
      }
      // Every gate is attemptable, even in a locked unit — tapping a far
      // chapter's Tes Bab and passing it IS the jump. getTrackState is the
      // single unlock authority; gates.ts trusts this flag.
      return {
        kind: 'gate' as const,
        key: node.key,
        problemRef: node.problemRef,
        requires: [...node.requires],
        unlocked: true,
        cleared: cleared.has(node.key),
      }
    })
    const unitGates = nodes.filter((n): n is Extract<TrackNodeState, { kind: 'gate' }> => n.kind === 'gate')
    previousGateCleared = unitGates.length === 0 ? unlocked : unitGates.every((g) => g.cleared)
    return { key: unit.key, nameId: unit.nameId, colorHex: unit.colorHex, iconKey: unit.iconKey, unlocked, nodes }
  })

  return { trackId: track.id, theme: track.theme, status: track.status, units }
}
