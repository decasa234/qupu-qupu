// api/services/shop/purchase.ts
//
// Atomic, race-safe purchase. Five steps inside withTransaction:
//   1. SELECT shop_items FOR UPDATE — locks the row so price can't change
//      mid-purchase. Validates active.
//   2. INSERT child_inventory ON CONFLICT DO NOTHING RETURNING id —
//      UNIQUE(child_id, shop_item_id) makes (kid, item) the natural
//      idempotency key. If RETURNING is empty, the kid already owns this
//      item — short-circuit with already_owned + current balance.
//   3. UPDATE gamification_profiles SET coin_balance -= price
//        WHERE coin_balance >= price RETURNING coin_balance.
//      If RETURNING is empty, balance dipped below price under us —
//      throw InsufficientFundsError so withTransaction rolls back the
//      inventory insert.
//   4. appendLedger SHOP_PURCHASE with negative coin_delta, idempotent
//      on the new inventory row id.
//   5. Return purchased.

import { queryOne, withTransaction } from '../../db.js'
import { appendLedger } from '../gamification/ledger.js'
import { InsufficientFundsError, type PurchaseResult, type ShopItem } from './types.js'

interface ItemRow {
  id: string
  slug: string
  name: string
  description: string
  kind: 'worksheet' | 'ebook' | 'coloring' | 'sticker' | 'audio'
  coin_price: number
  thumbnail_url: string | null
  sort_order: number
  is_active: boolean
}

function mapItem(r: ItemRow): ShopItem {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    kind: r.kind,
    coinPrice: Number(r.coin_price),
    thumbnailUrl: r.thumbnail_url,
    sortOrder: Number(r.sort_order),
  }
}

export async function purchaseItem(
  childId: string,
  itemId: string,
): Promise<PurchaseResult> {
  try {
    return await withTransaction(async (client) => {
      // 1. Lock the item row + read current price.
      const item = await queryOne<ItemRow>(
        `SELECT id, slug, name, description, kind, coin_price,
                thumbnail_url, sort_order, is_active
           FROM shop_items WHERE id = $1 FOR UPDATE`,
        [itemId],
        client,
      )
      if (!item) return { status: 'not_found' }
      if (!item.is_active) return { status: 'not_available' }
      const mapped = mapItem(item)

      // 2. Idempotency-checked insert.
      const inv = await queryOne<{ id: string }>(
        `INSERT INTO child_inventory (child_id, shop_item_id, coins_spent)
           VALUES ($1, $2, $3)
           ON CONFLICT (child_id, shop_item_id) DO NOTHING
           RETURNING id`,
        [childId, itemId, mapped.coinPrice],
        client,
      )

      if (!inv) {
        // Already owned. Fetch current balance so the client can refresh UI.
        const bal = await queryOne<{ coin_balance: number }>(
          `SELECT coin_balance FROM gamification_profiles WHERE child_id = $1`,
          [childId],
          client,
        )
        return { status: 'already_owned', balance: Number(bal?.coin_balance ?? 0), item: mapped }
      }

      // 3. Conditional debit.
      const debit = await queryOne<{ coin_balance: number }>(
        `UPDATE gamification_profiles
            SET coin_balance = coin_balance - $1, updated_at = NOW()
            WHERE child_id = $2 AND coin_balance >= $1
            RETURNING coin_balance`,
        [mapped.coinPrice, childId],
        client,
      )

      if (!debit) {
        const bal = await queryOne<{ coin_balance: number }>(
          `SELECT coin_balance FROM gamification_profiles WHERE child_id = $1`,
          [childId],
          client,
        )
        throw new InsufficientFundsError(mapped.coinPrice, Number(bal?.coin_balance ?? 0))
      }

      // 4. Append ledger (idempotent on inventory id).
      await appendLedger(client, {
        childId,
        rewardType: 'SHOP_PURCHASE',
        sourceType: 'child_inventory',
        sourceId: inv.id,
        xpDelta: 0,
        coinDelta: -mapped.coinPrice,
        metadata: { itemSlug: mapped.slug, itemName: mapped.name, itemKind: mapped.kind },
      })

      return {
        status: 'purchased',
        balance: Number(debit.coin_balance),
        inventoryId: inv.id,
        item: mapped,
      }
    })
  } catch (err) {
    if (err instanceof InsufficientFundsError) {
      return { status: 'insufficient_funds', balance: err.currentBalance, price: err.price }
    }
    throw err
  }
}
