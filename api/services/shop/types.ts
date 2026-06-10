// api/services/shop/types.ts
//
// Shared TS types for the shop service + route layer.

export type ShopItemKind = 'worksheet' | 'ebook' | 'coloring' | 'sticker' | 'audio' | 'powerup'

// The streak shield (P1.2). Delivery = gamification_profiles.streak_shields
// increment, capped at MAX_STREAK_SHIELDS; consumed automatically by
// streakUpdater.ts when the kid misses day(s).
export const STREAK_SHIELD_SLUG = 'streak_shield'
export const MAX_STREAK_SHIELDS = 2

// Only items the shop can ACTUALLY deliver are served to kids. The legacy
// worksheet/ebook/... rows stay in the DB but are hidden until their file
// delivery exists — selling a permanent "ready soon" stub burns currency
// trust.
export const DELIVERABLE_SLUGS: readonly string[] = [STREAK_SHIELD_SLUG]

export interface ShopItem {
  id: string
  slug: string
  name: string
  description: string
  kind: ShopItemKind
  coinPrice: number
  thumbnailUrl: string | null
  sortOrder: number
}

export interface ShopItemForChild extends ShopItem {
  owned: boolean
  affordable: boolean
  // Only set on the streak-shield row: how many the child currently holds
  // (0..MAX_STREAK_SHIELDS). The shield is repurchasable, so `owned` stays
  // false for it; the count is the real ownership signal.
  shieldCount?: number
}

export interface InventoryItem {
  inventoryId: string
  itemId: string
  name: string
  kind: ShopItemKind
  thumbnailUrl: string | null
  acquiredAt: string // ISO
}

export type PurchaseResult =
  // inventoryId is null for the streak shield (no child_inventory row —
  // delivery is the streak_shields increment, echoed in streakShields).
  | { status: 'purchased'; balance: number; inventoryId: string | null; item: ShopItem; streakShields?: number }
  | { status: 'already_owned'; balance: number; item: ShopItem }
  | { status: 'insufficient_funds'; balance: number; price: number }
  // Streak-shield only: already at MAX_STREAK_SHIELDS. Checked BEFORE any
  // debit, so no coins move.
  | { status: 'shield_cap'; balance: number; shields: number; item: ShopItem }
  | { status: 'not_found' }
  | { status: 'not_available' }

// Sentinel error used to force a withTransaction rollback while still
// carrying the structured data the route handler returns to the client.
export class InsufficientFundsError extends Error {
  constructor(public price: number, public currentBalance: number) {
    super('insufficient funds')
  }
}
