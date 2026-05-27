// api/services/shop/catalog.ts
//
// listItemsForChild: every active shop item, plus per-child owned and
// affordable flags. One round-trip — joins inventory + the child's
// coin_balance in a single SELECT.

import { query, queryOne } from '../../db.js'
import type { ShopItemForChild } from './types.js'

interface Row {
  id: string
  slug: string
  name: string
  description: string
  kind: 'worksheet' | 'ebook' | 'coloring' | 'sticker' | 'audio'
  coin_price: number
  thumbnail_url: string | null
  sort_order: number
  owned: boolean
}

export async function listItemsForChild(childId: string): Promise<ShopItemForChild[]> {
  const balanceRow = await queryOne<{ coin_balance: number }>(
    `SELECT coin_balance FROM gamification_profiles WHERE child_id = $1`,
    [childId],
  )
  const balance = Number(balanceRow?.coin_balance ?? 0)

  const rows = await query<Row>(
    `SELECT si.id, si.slug, si.name, si.description, si.kind,
            si.coin_price, si.thumbnail_url, si.sort_order,
            (ci.id IS NOT NULL) AS owned
       FROM shop_items si
       LEFT JOIN child_inventory ci
         ON ci.shop_item_id = si.id AND ci.child_id = $1
       WHERE si.is_active = TRUE
       ORDER BY si.sort_order, si.name`,
    [childId],
  )

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    kind: r.kind,
    coinPrice: Number(r.coin_price),
    thumbnailUrl: r.thumbnail_url,
    sortOrder: Number(r.sort_order),
    owned: r.owned,
    affordable: balance >= Number(r.coin_price),
  }))
}
