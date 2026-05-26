// src/lib/shopApi.ts
//
// Typed axios wrappers for the shop endpoints. Re-exports the union types
// from the backend service so the UI can pattern-match on result.status
// without redefining shapes.

import api from './api'

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
  acquiredAt: string
}

export type PurchaseResult =
  | { status: 'purchased'; balance: number; inventoryId: string; item: ShopItem }
  | { status: 'already_owned'; balance: number; item: ShopItem }
  | { status: 'insufficient_funds'; balance: number; price: number }
  | { status: 'not_found' }
  | { status: 'not_available' }

export async function fetchShopItems(childId: string): Promise<ShopItemForChild[]> {
  const res = await api.get('/shop/items', { params: { childId } })
  return res.data.data.items as ShopItemForChild[]
}

export async function purchaseShopItem(childId: string, itemId: string): Promise<PurchaseResult> {
  try {
    const res = await api.post('/shop/purchase', { childId, itemId })
    return res.data.data as PurchaseResult
  } catch (err: unknown) {
    // 400 insufficient_funds returns the structured payload too.
    if (
      typeof err === 'object' && err !== null && 'response' in err &&
      typeof (err as { response?: { data?: { data?: { status?: string } } } }).response?.data?.data?.status === 'string'
    ) {
      return (err as { response: { data: { data: PurchaseResult } } }).response.data.data
    }
    throw err
  }
}

export async function fetchInventory(childId: string): Promise<InventoryItem[]> {
  const res = await api.get('/me/inventory', { params: { childId } })
  return res.data.data.items as InventoryItem[]
}
