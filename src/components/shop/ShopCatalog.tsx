// src/components/shop/ShopCatalog.tsx
//
// The shop catalog body (design layout): header row with store tile +
// "Toko QUPU" + balance chip, then a 2-col grid of ShopItemCard. Tap →
// PurchaseSheet; success → PurchaseCelebration + refresh + stat-strip sync.
// Used by both the /shop route and the top-bar ShopSheet modal.
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useGamificationStats } from '../../hooks/useGamificationStats'
import { fetchShopItems, type ShopItemForChild, type PurchaseResult } from '../../lib/shopApi'
import ShopItemCard from './ShopItemCard'
import PurchaseSheet from './PurchaseSheet'
import PurchaseCelebration from './PurchaseCelebration'
import ErrorRetry from '../ErrorRetry'
import Skeleton from '../Skeleton'

export default function ShopCatalog() {
  const { activeChildId } = useAuthStore()
  const stats = useGamificationStats((s) => s.stats)
  const patchCoinBalance = useGamificationStats((s) => s.patchCoinBalance)
  const patchStats = useGamificationStats((s) => s.patchStats)
  const balance = stats?.coinBalance ?? 0

  const [items, setItems] = useState<ShopItemForChild[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [loadTick, setLoadTick] = useState(0)
  const [sheetItem, setSheetItem] = useState<ShopItemForChild | null>(null)
  const [celebrate, setCelebrate] = useState<PurchaseResult | null>(null)

  useEffect(() => {
    if (!activeChildId) return
    let cancelled = false
    setLoadError(false)
    fetchShopItems(activeChildId)
      .then((data) => { if (!cancelled) setItems(data) })
      // A failed catalog load must NOT leave the skeleton forever — show a
      // retry state instead (loadTick re-runs this effect).
      .catch(() => { if (!cancelled) setLoadError(true) })
    return () => { cancelled = true }
  }, [activeChildId, loadTick])

  function handlePurchased(result: PurchaseResult) {
    if (!activeChildId) return
    if (result.status === 'purchased') {
      patchCoinBalance(activeChildId, result.balance)
      if (typeof result.streakShields === 'number') {
        patchStats(activeChildId, { streakShields: result.streakShields })
      }
      setCelebrate(result)
      fetchShopItems(activeChildId).then(setItems) // refresh owned flags + shield count
      setSheetItem(null)
    } else if (result.status === 'already_owned') {
      patchCoinBalance(activeChildId, result.balance)
      setSheetItem(null)
    } else if (result.status === 'shield_cap') {
      // Cap reached (no debit happened). Refresh — including the open
      // sheet's item, whose shieldCount drives the "sudah penuh" state.
      patchCoinBalance(activeChildId, result.balance)
      patchStats(activeChildId, { streakShields: result.shields })
      fetchShopItems(activeChildId).then((data) => {
        setItems(data)
        setSheetItem((prev) => (prev ? data.find((i) => i.id === prev.id) ?? prev : prev))
      })
    } else if (result.status === 'insufficient_funds') {
      patchCoinBalance(activeChildId, result.balance)
      // sheet stays open; CTA will re-render as disabled after the next fetch
      fetchShopItems(activeChildId).then(setItems)
    }
  }

  if (!activeChildId) {
    return <p className="p-4 text-sm font-medium text-qupu-muted">Pilih profil anak dulu.</p>
  }

  return (
    <div className="flex w-full flex-col gap-3.5">
      {/* Header row: store tile + title + balance chip */}
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[0.875rem] bg-qupu-brand-orange text-base text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.15)]"
          aria-hidden="true"
        >
          <i className="fa-solid fa-store" />
        </span>
        <h2 className="min-w-0 flex-1 font-display text-xl font-black leading-none text-qupu-brand-blue">
          Toko QUPU
        </h2>
        <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-qupu-cream px-3 py-1.5 font-display text-sm font-black text-qupu-brand-blue">
          <i className="fa-solid fa-coins text-[#D9A406]" aria-hidden="true" />
          {balance}
        </span>
      </div>

      {items === null && loadError ? (
        <ErrorRetry
          message="Gagal memuat toko. Coba lagi, ya."
          onRetry={() => setLoadTick((t) => t + 1)}
        />
      ) : items === null ? (
        <div className="grid grid-cols-2 gap-3" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-40 rounded-[1.375rem]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-[1.5rem] bg-white p-4 text-sm font-semibold text-qupu-brand-blue shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
          Toko sedang menyiapkan barang baru. Cek lagi nanti, ya!
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <ShopItemCard key={item.id} item={item} onTap={() => setSheetItem(item)} />
          ))}
        </div>
      )}

      <PurchaseSheet
        open={sheetItem !== null}
        onClose={() => setSheetItem(null)}
        item={sheetItem}
        childId={activeChildId}
        balance={balance}
        onPurchased={handlePurchased}
      />

      {celebrate?.status === 'purchased' && (
        <PurchaseCelebration item={celebrate.item} onDismiss={() => setCelebrate(null)} />
      )}
    </div>
  )
}
