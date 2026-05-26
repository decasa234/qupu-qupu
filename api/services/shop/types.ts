// api/services/shop/types.ts
//
// Shared TS types for the shop service + route layer.

export type ShopItemKind = 'worksheet' | 'ebook' | 'coloring' | 'sticker' | 'audio'

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
  | { status: 'purchased'; balance: number; inventoryId: string; item: ShopItem }
  | { status: 'already_owned'; balance: number; item: ShopItem }
  | { status: 'insufficient_funds'; balance: number; price: number }
  | { status: 'not_found' }
  | { status: 'not_available' }

// Sentinel error used to force a withTransaction rollback while still
// carrying the structured data the route handler returns to the client.
export class InsufficientFundsError extends Error {
  constructor(public price: number, public currentBalance: number) {
    super('insufficient funds')
  }
}
