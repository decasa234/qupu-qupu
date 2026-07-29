// Track state service (Task 6). Runs only against TEST_DATABASE_URL
// (see api/__tests__/setup.ts).
import { describe, expect, it, beforeAll, afterAll, afterEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import { pool, query, queryOne } from '../db.js'
import { getTrackState } from '../services/wmi/tracks/trackState.js'
import {
  ensureBootstrapped,
  _resetBootstrapForTesting,
} from '../services/wmi/concepts/bootstrap.js'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

const TRACK_ID = 'wmi-grade-1'
const CONCEPT_SLUG = 'single-digit-addition'
const GATE_KEY = 'gate-penjumlahan-dasar'

;(runIntegration ? describe : describe.skip)('getTrackState', () => {
  const createdUserIds: string[] = []

  beforeAll(async () => {
    _resetBootstrapForTesting()
    await ensureBootstrapped() // seeds wmi_concepts, incl. single-digit-addition
  })

  afterEach(async () => {
    if (createdUserIds.length) {
      // users -> children -> wmi_concept_progress/wmi_gate_clears cascade.
      await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [createdUserIds])
      createdUserIds.length = 0
    }
  })

  afterAll(async () => {
    await pool.end()
  })

  async function createChild(): Promise<{ parentUserId: string; childId: string }> {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`track-state-${tag}@example.test`, `Track State Test ${tag}`],
    )
    createdUserIds.push(user!.id)
    const child = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [user!.id, `Child ${tag}`],
    )
    return { parentUserId: user!.id, childId: child!.id }
  }

  it('reports stored level, gate unlock/clear, and derives level from best_tier when level is NULL', async () => {
    const { parentUserId, childId } = await createChild()

    await query(
      `INSERT INTO wmi_concept_progress (child_id, concept_slug, level, best_tier)
       VALUES ($1, $2, 4, 0)`,
      [childId, CONCEPT_SLUG],
    )

    const state1 = await getTrackState(parentUserId, childId, TRACK_ID)
    expect(state1.trackId).toBe(TRACK_ID)
    const unit1 = state1.units[0]
    const concept1 = unit1.nodes.find((n) => n.kind === 'concept')
    const gate1 = unit1.nodes.find((n) => n.kind === 'gate')
    expect(concept1).toMatchObject({ kind: 'concept', slug: CONCEPT_SLUG, level: 4, gold: false })
    // Test-out: every gate is attemptable regardless of concept levels or unit
    // lock; no wmi_gate_clears row yet, so it is not cleared.
    expect(gate1).toMatchObject({ kind: 'gate', key: GATE_KEY, unlocked: true, cleared: false })
    // Unit 2 stays LOCKED until a gate at or after it is cleared — but its own
    // gate is still attemptable straight away (test-out jump).
    expect(state1.units[1]).toMatchObject({ unlocked: false })
    expect(state1.units[1].nodes.find((n) => n.kind === 'gate')).toMatchObject({ unlocked: true })

    await query(
      `INSERT INTO wmi_gate_clears (child_id, track_id, gate_key) VALUES ($1, $2, $3)`,
      [childId, TRACK_ID, GATE_KEY],
    )

    const state2 = await getTrackState(parentUserId, childId, TRACK_ID)
    const gate2 = state2.units[0].nodes.find((n) => n.kind === 'gate')
    expect(gate2).toMatchObject({ cleared: true })
    // Clearing unit 1's gate unlocks unit 2 — and (test-out) its gate too.
    expect(state2.units[1]).toMatchObject({ unlocked: true })
    expect(state2.units[1].nodes.find((n) => n.kind === 'gate')).toMatchObject({ unlocked: true })

    // NULL level derives from best_tier via the ladder mapping (tier 3 -> level 4).
    await query(
      `UPDATE wmi_concept_progress SET level = NULL, best_tier = 3
       WHERE child_id = $1 AND concept_slug = $2`,
      [childId, CONCEPT_SLUG],
    )
    const state3 = await getTrackState(parentUserId, childId, TRACK_ID)
    const concept3 = state3.units[0].nodes.find((n) => n.kind === 'concept')
    expect(concept3).toMatchObject({ level: 4 })
  })

  it('opens every unit up to a tested-out gate (unlock-through jump)', async () => {
    const { parentUserId, childId } = await createChild()
    // Clear ONLY the later unit's gate (test-out), skipping unit 1's entirely.
    await query(
      `INSERT INTO wmi_gate_clears (child_id, track_id, gate_key) VALUES ($1, $2, $3)`,
      [childId, TRACK_ID, 'gate-pengurangan-dasar'],
    )
    const state = await getTrackState(parentUserId, childId, TRACK_ID)
    // Both units are open even though unit 1's own gate was never cleared.
    expect(state.units.every((u) => u.unlocked)).toBe(true)
  })

  it('rejects a child the caller does not own', async () => {
    const { childId } = await createChild()
    const otherParent = await createChild()
    await expect(getTrackState(otherParent.parentUserId, childId, TRACK_ID)).rejects.toThrow(
      'Child not found',
    )
  })

  it('rejects an unknown track id', async () => {
    const { parentUserId, childId } = await createChild()
    await expect(getTrackState(parentUserId, childId, 'nonexistent-track')).rejects.toThrow(
      'Track not found',
    )
  })
})
