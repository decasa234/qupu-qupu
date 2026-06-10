// api/services/shop/inventory.ts
//
// listInventory: items the child owns, newest-first. No pagination — v1
// inventories are small (<20 items expected).

import { query } from '../../db.js'
import type { InventoryItem, ShopItemKind } from './types.js'

interface Row {
  inventory_id: string
  item_id: string
  name: string
  kind: ShopItemKind
  thumbnail_url: string | null
  acquired_at: Date
}

export async function listInventory(childId: string): Promise<InventoryItem[]> {
  const rows = await query<Row>(
    `SELECT ci.id          AS inventory_id,
            si.id          AS item_id,
            si.name,
            si.kind,
            si.thumbnail_url,
            ci.acquired_at
       FROM child_inventory ci
       JOIN shop_items si ON si.id = ci.shop_item_id
       WHERE ci.child_id = $1
       ORDER BY ci.acquired_at DESC`,
    [childId],
  )
  return rows.map((r) => ({
    inventoryId: r.inventory_id,
    itemId: r.item_id,
    name: r.name,
    kind: r.kind,
    thumbnailUrl: r.thumbnail_url,
    acquiredAt: r.acquired_at.toISOString(),
  }))
}
