// src/pages/Shop.tsx
//
// Real catalog (replaces Phase A stub). Header band with balance + filter
// chips + inventory shortcut. Grid of ShopItemCard. Tap → PurchaseSheet.
// Successful purchase → PurchaseCelebration + refresh list + sync stat strip.
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useGamificationStats } from '../hooks/useGamificationStats'
import { fetchShopItems, type ShopItemForChild, type PurchaseResult } from '../lib/shopApi'
import ShopItemCard from '../components/shop/ShopItemCard'
import PurchaseSheet from '../components/shop/PurchaseSheet'
import PurchaseCelebration from '../components/shop/PurchaseCelebration'
import SkeletonCard from '../components/SkeletonCard'

const KINDS = ['Semua', 'worksheet', 'ebook', 'coloring', 'sticker', 'audio'] as const
type Filter = typeof KINDS[number]

export default function ShopPage() {
  const { activeChildId } = useAuthStore()
  const stats = useGamificationStats((s) => s.stats)
  const patchCoinBalance = useGamificationStats((s) => s.patchCoinBalance)
  const balance = stats?.coinBalance ?? 0

  const [items, setItems] = useState<ShopItemForChild[] | null>(null)
  const [filter, setFilter] = useState<Filter>('Semua')
  const [sheetItem, setSheetItem] = useState<ShopItemForChild | null>(null)
  const [celebrate, setCelebrate] = useState<PurchaseResult | null>(null)

  useEffect(() => {
    if (!activeChildId) return
    let cancelled = false
    fetchShopItems(activeChildId).then((data) => { if (!cancelled) setItems(data) })
    return () => { cancelled = true }
  }, [activeChildId])

  const filtered = useMemo(() => {
    if (!items) return []
    return filter === 'Semua' ? items : items.filter((i) => i.kind === filter)
  }, [items, filter])

  function handlePurchased(result: PurchaseResult) {
    if (!activeChildId) return
    if (result.status === 'purchased') {
      patchCoinBalance(result.balance)
      setCelebrate(result)
      fetchShopItems(activeChildId).then(setItems) // refresh owned flags
      setSheetItem(null)
    } else if (result.status === 'already_owned') {
      patchCoinBalance(result.balance)
      setSheetItem(null)
    } else if (result.status === 'insufficient_funds') {
      patchCoinBalance(result.balance)
      // sheet stays open; CTA will re-render as disabled after the next fetch
      fetchShopItems(activeChildId).then(setItems)
    }
  }

  if (!activeChildId) {
    return (
      <div className="mx-auto w-full max-w-md sm:max-w-lg">
        <p className="text-sm font-medium text-qupu-muted">Pilih profil anak dulu.</p>
      </div>
    )
  }

  if (items === null) {
    return (
      <div className="mx-auto w-full max-w-md sm:max-w-lg">
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 sm:max-w-lg">
      <section className="sticky top-12 z-20 -mx-4 bg-qupu-shell px-4 pb-2 pt-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-display text-xl font-extrabold text-qupu-brand-blue">Toko QUPU</h1>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-qupu-brand-yellow px-3 py-1 font-display text-xs font-extrabold text-qupu-brand-blue">
              <i className="fa-solid fa-coins" aria-hidden="true" /> {balance}
            </span>
            <Link
              to="/me#koleksi"
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-display text-xs font-extrabold text-qupu-brand-blue"
            >
              <i className="fa-solid fa-box-archive" aria-hidden="true" /> Inventaris
            </Link>
          </div>
        </div>
        <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`whitespace-nowrap rounded-full px-3 py-1 font-display text-[11px] font-extrabold uppercase ${
                filter === k ? 'bg-qupu-brand-blue text-white' : 'bg-white text-qupu-brand-blue'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <p className="text-sm font-medium text-qupu-muted">Tidak ada item di kategori ini.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((item) => (
            <ShopItemCard key={item.id} item={item} balance={balance} onTap={() => setSheetItem(item)} />
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
