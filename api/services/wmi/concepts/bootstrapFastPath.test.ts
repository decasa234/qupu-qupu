// Cold-start fast path: once the registry fingerprint is stamped, a fresh
// ensureBootstrapped() (new serverless instance) must skip the ~1,700-query
// seed grind entirely — and a fingerprint change must re-run it.
//
// Runs only against TEST_DATABASE_URL (see api/__tests__/setup.ts).

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { pool, query, queryOne } from '../../../db.js'
import { ensureBootstrapped, _resetBootstrapForTesting } from './bootstrap.js'
import { ALL_SLUGS } from './registry.js'

const RUN = Boolean(process.env.TEST_DATABASE_URL)

describe.skipIf(!RUN)('bootstrap fast path', () => {
  beforeAll(async () => {
    _resetBootstrapForTesting()
    await ensureBootstrapped()
  })
  afterAll(async () => {
    await pool.end()
  })

  it('stamps a fingerprint after bootstrapping', async () => {
    const row = await queryOne<{ fingerprint: string }>(
      'SELECT fingerprint FROM wmi_bootstrap_state WHERE id = 1',
    )
    expect(row?.fingerprint).toBeTruthy()
  })

  it('a fresh latch with a matching fingerprint skips seeding', async () => {
    const slug = ALL_SLUGS[0]
    const victim = await queryOne<{ id: string }>(
      'SELECT id FROM wmi_concept_instances WHERE concept_slug = $1 LIMIT 1',
      [slug],
    )
    expect(victim).not.toBeNull()
    await query('DELETE FROM wmi_concept_instances WHERE id = $1', [victim!.id])

    _resetBootstrapForTesting()
    await ensureBootstrapped()

    // Fast path: the deleted instance must NOT have been re-seeded.
    const counts = await queryOne<{ n: string }>(
      'SELECT count(*)::text AS n FROM wmi_concept_instances WHERE concept_slug = $1',
      [slug],
    )
    expect(Number(counts!.n)).toBeLessThan(20)
  })

  it('a fingerprint change re-runs the full bootstrap', async () => {
    await query(`UPDATE wmi_bootstrap_state SET fingerprint = 'stale' WHERE id = 1`)

    _resetBootstrapForTesting()
    await ensureBootstrapped()

    // Full path: the pool is topped back up to SEED_COUNT.
    const slug = ALL_SLUGS[0]
    const counts = await queryOne<{ n: string }>(
      'SELECT count(*)::text AS n FROM wmi_concept_instances WHERE concept_slug = $1',
      [slug],
    )
    expect(Number(counts!.n)).toBe(20)

    const row = await queryOne<{ fingerprint: string }>(
      'SELECT fingerprint FROM wmi_bootstrap_state WHERE id = 1',
    )
    expect(row?.fingerprint).not.toBe('stale')
  })
})
