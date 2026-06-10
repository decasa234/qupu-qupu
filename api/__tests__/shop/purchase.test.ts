// api/__tests__/shop/purchase.test.ts
//
// Race-safe coin-spending tests. Skips unless TEST_DATABASE_URL is set
// (see api/__tests__/setup.ts). Reuses createFixtures() to build a
// parent + child + age group + subject + video graph.

import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { pool, query, queryOne, withTransaction } from '../../db.js'
import { purchaseItem } from '../../services/shop/purchase.js'
import { ensureProfile, updateProfileWithDelta } from '../../services/gamification/profileUpdater.js'
import { wibDateString } from '../../lib/wib.js'
import { createFixtures, cleanupFixtures, type Fixtures } from '../helpers/fixtures.js'

const RUN = Boolean(process.env.TEST_DATABASE_URL)

async function seedItem(price: number): Promise<string> {
  const slug = `test-item-${randomUUID().slice(0, 8)}`
  const row = await queryOne<{ id: string }>(
    `INSERT INTO shop_items (slug, name, description, kind, coin_price)
       VALUES ($1, $2, $3, 'worksheet', $4) RETURNING id`,
    [slug, `Test Item ${slug}`, 'A test item.', price],
  )
  return row!.id
}

async function setBalance(childId: string, balance: number): Promise<void> {
  const today = wibDateString(new Date())
  await withTransaction((c) => ensureProfile(c, childId))
  // Drop balance to zero first (cannot set negative), then add the desired
  // amount via the atomic helper so we exercise the same code path.
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE gamification_profiles SET coin_balance = 0 WHERE child_id = $1`,
      [childId],
    )
  })
  if (balance > 0) {
    await withTransaction((c) =>
      updateProfileWithDelta(c, { childId, xpDelta: 0, coinDelta: balance, activityDate: today }),
    )
  }
}

async function fetchBalance(childId: string): Promise<number> {
  const row = await queryOne<{ coin_balance: number }>(
    `SELECT coin_balance FROM gamification_profiles WHERE child_id = $1`,
    [childId],
  )
  return Number(row?.coin_balance ?? 0)
}

async function countLedger(childId: string, sourceId: string): Promise<number> {
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM reward_ledger
       WHERE child_id = $1 AND reward_type = 'SHOP_PURCHASE' AND source_id = $2`,
    [childId, sourceId],
  )
  return Number(rows[0]?.count ?? 0)
}

describe.skipIf(!RUN)('shop purchase', () => {
  let fx: Fixtures
  const itemIds: string[] = []

  beforeEach(async () => {
    fx = await createFixtures()
  })

  afterEach(async () => {
    await cleanupFixtures(fx)
    if (itemIds.length > 0) {
      await query(`DELETE FROM shop_items WHERE id = ANY($1::uuid[])`, [itemIds])
      itemIds.length = 0
    }
  })

  afterAll(async () => {
    await pool.end()
  })

  it('happy path: kid with enough coins purchases an item', async () => {
    const itemId = await seedItem(100)
    itemIds.push(itemId)
    await setBalance(fx.childId, 200)

    const result = await purchaseItem(fx.childId, itemId)
    expect(result.status).toBe('purchased')
    if (result.status !== 'purchased') return
    expect(result.balance).toBe(100)
    expect(result.item.coinPrice).toBe(100)

    const inv = await query(
      `SELECT id FROM child_inventory WHERE child_id = $1 AND shop_item_id = $2`,
      [fx.childId, itemId],
    )
    expect(inv).toHaveLength(1)
    // Generic items always create an inventory row (null only for the shield).
    expect(result.inventoryId).not.toBeNull()
    expect(await countLedger(fx.childId, result.inventoryId!)).toBe(1)
    expect(await fetchBalance(fx.childId)).toBe(100)
  })

  it('insufficient funds leaves balance and inventory untouched', async () => {
    const itemId = await seedItem(100)
    itemIds.push(itemId)
    await setBalance(fx.childId, 50)

    const result = await purchaseItem(fx.childId, itemId)
    expect(result.status).toBe('insufficient_funds')
    if (result.status === 'insufficient_funds') {
      expect(result.balance).toBe(50)
      expect(result.price).toBe(100)
    }

    expect(await fetchBalance(fx.childId)).toBe(50)
    const inv = await query(
      `SELECT id FROM child_inventory WHERE child_id = $1 AND shop_item_id = $2`,
      [fx.childId, itemId],
    )
    expect(inv).toHaveLength(0)
    const ledger = await query(
      `SELECT id FROM reward_ledger WHERE child_id = $1 AND reward_type = 'SHOP_PURCHASE'`,
      [fx.childId],
    )
    expect(ledger).toHaveLength(0)
  })

  it('idempotency: same purchase twice → already_owned, single debit', async () => {
    const itemId = await seedItem(100)
    itemIds.push(itemId)
    await setBalance(fx.childId, 300)

    const first = await purchaseItem(fx.childId, itemId)
    expect(first.status).toBe('purchased')

    const second = await purchaseItem(fx.childId, itemId)
    expect(second.status).toBe('already_owned')

    expect(await fetchBalance(fx.childId)).toBe(200)
    const inv = await query(
      `SELECT id FROM child_inventory WHERE child_id = $1 AND shop_item_id = $2`,
      [fx.childId, itemId],
    )
    expect(inv).toHaveLength(1)
    const ledger = await query(
      `SELECT id FROM reward_ledger WHERE child_id = $1 AND reward_type = 'SHOP_PURCHASE'`,
      [fx.childId],
    )
    expect(ledger).toHaveLength(1)
  })

  it('race safety (same item): 10 parallel purchases → 1 purchased, 9 already_owned, single debit', async () => {
    const itemId = await seedItem(100)
    itemIds.push(itemId)
    await setBalance(fx.childId, 300)

    const results = await Promise.all(
      Array.from({ length: 10 }, () => purchaseItem(fx.childId, itemId)),
    )
    const purchased = results.filter((r) => r.status === 'purchased').length
    const owned = results.filter((r) => r.status === 'already_owned').length
    expect(purchased).toBe(1)
    expect(owned).toBe(9)
    expect(await fetchBalance(fx.childId)).toBe(200)
    const ledger = await query(
      `SELECT id FROM reward_ledger WHERE child_id = $1 AND reward_type = 'SHOP_PURCHASE'`,
      [fx.childId],
    )
    expect(ledger).toHaveLength(1)
  })

  it('race safety (cross-product): kid with just enough for 4 of 5 items', async () => {
    const ids = await Promise.all([
      seedItem(100), seedItem(100), seedItem(100), seedItem(100), seedItem(100),
    ])
    ids.forEach((id) => itemIds.push(id))
    await setBalance(fx.childId, 400) // exactly 4 affordable

    const results = await Promise.all(ids.map((id) => purchaseItem(fx.childId, id)))
    const purchased = results.filter((r) => r.status === 'purchased').length
    const insufficient = results.filter((r) => r.status === 'insufficient_funds').length
    expect(purchased).toBe(4)
    expect(insufficient).toBe(1)
    expect(await fetchBalance(fx.childId)).toBe(0)

    const ledgerRows = await query<{ coin_delta: number }>(
      `SELECT coin_delta FROM reward_ledger WHERE child_id = $1 AND reward_type = 'SHOP_PURCHASE'`,
      [fx.childId],
    )
    const sumDebits = ledgerRows.reduce((acc, r) => acc + Number(r.coin_delta), 0)
    expect(sumDebits).toBe(-400)
  })

  it('CHECK belt-and-braces: direct UPDATE to negative balance errors', async () => {
    await setBalance(fx.childId, 50)
    await expect(
      query(`UPDATE gamification_profiles SET coin_balance = -1 WHERE child_id = $1`, [fx.childId]),
    ).rejects.toThrow(/coin_balance/i)
  })
})
