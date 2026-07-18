// Leveled instance pools (Task 5). Runs only against TEST_DATABASE_URL
// (see api/__tests__/setup.ts).
import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { pool, query } from '../db.js'
import { ensureLevelPools } from '../services/wmi/concepts/levelPools.js'
import {
  ensureBootstrapped,
  _resetBootstrapForTesting,
} from '../services/wmi/concepts/bootstrap.js'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

;(runIntegration ? describe : describe.skip)('ensureLevelPools', () => {
  beforeAll(async () => {
    _resetBootstrapForTesting()
    await ensureBootstrapped()
  })

  afterAll(async () => {
    await pool.end()
  })

  it('fills 5 level pools for a levelled concept and is idempotent', async () => {
    await ensureLevelPools(['single-digit-addition'], 4)
    const rows = await query<{ level: number; n: string }>(
      `SELECT level, COUNT(*) AS n FROM wmi_concept_instances
       WHERE concept_slug = $1 AND level > 0 GROUP BY level ORDER BY level`,
      ['single-digit-addition'],
    )
    expect(rows.map((r) => r.level)).toEqual([1, 2, 3, 4, 5])
    for (const r of rows) expect(Number(r.n)).toBeGreaterThanOrEqual(4)

    await ensureLevelPools(['single-digit-addition'], 4) // idempotent top-up
    const again = await query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM wmi_concept_instances WHERE concept_slug = $1 AND level > 0`,
      ['single-digit-addition'],
    )
    expect(Number(again[0].n)).toBe(Number(rows.reduce((s, r) => s + Number(r.n), 0)))
  })

  it('rejects a concept without level generation', async () => {
    await expect(ensureLevelPools(['digit-sum'])).rejects.toThrow(/level generation/)
  })
})
