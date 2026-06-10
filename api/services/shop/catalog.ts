// api/services/shop/catalog.ts
//
// listItemsForChild: every active AND deliverable shop item, plus
// per-child owned/affordable flags. The legacy worksheet/ebook/... rows
// stay in the DB but are filtered out of the serve until real file
// delivery exists (DELIVERABLE_SLUGS) — the shop must never sell a stub.
// One round-trip for the items + one for the profile (balance + shields).

import { query, queryOne } from '../../db.js'
import {
  DELIVERABLE_SLUGS,
  STREAK_SHIELD_SLUG,
  type ShopItemForChild,
  type ShopItemKind,
} from './types.js'

interface Row {
  id: string
  slug: string
  name: string
  description: string
  kind: ShopItemKind
  coin_price: number
  thumbnail_url: string | null
  sort_order: number
  owned: boolean
}

export async function listItemsForChild(childId: string): Promise<ShopItemForChild[]> {
  const profileRow = await queryOne<{ coin_balance: number; streak_shields: number }>(
    `SELECT coin_balance, streak_shields FROM gamification_profiles WHERE child_id = $1`,
    [childId],
  )
  const balance = Number(profileRow?.coin_balance ?? 0)
  const shields = Number(profileRow?.streak_shields ?? 0)

  const rows = await query<Row>(
    `SELECT si.id, si.slug, si.name, si.description, si.kind,
            si.coin_price, si.thumbnail_url, si.sort_order,
            (ci.id IS NOT NULL) AS owned
       FROM shop_items si
       LEFT JOIN child_inventory ci
         ON ci.shop_item_id = si.id AND ci.child_id = $1
       WHERE si.is_active = TRUE AND si.slug = ANY($2::text[])
       ORDER BY si.sort_order, si.name`,
    [childId, [...DELIVERABLE_SLUGS]],
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
    // The shield is repurchasable — `owned` stays false; the count is the
    // ownership signal (cap handled by the purchase path + UI).
    owned: r.slug === STREAK_SHIELD_SLUG ? false : r.owned,
    affordable: balance >= Number(r.coin_price),
    ...(r.slug === STREAK_SHIELD_SLUG ? { shieldCount: shields } : {}),
  }))
}
