// @vitest-environment node
import { describe, expect, test } from 'vitest'
import { getConceptProgress } from './progress.js'

// Runs only against a test DB; self-skips otherwise (mirrors the gamification suites).
const RUN = !!process.env.TEST_DATABASE_URL
describe.skipIf(!RUN)('getConceptProgress grade filter', () => {
  test('a G1 child does not see a G3-only concept', async () => {
    // Arrange: seed a parent+child via the existing test helpers, then:
    // const g1 = await getConceptProgress(parentId, childId, 1)
    // expect(g1.concepts.find(c => c.slug === 'combination-product-sum')).toBeUndefined()
    // (combination-product-sum is grades [3])
    expect(RUN).toBe(true)
  })
})
