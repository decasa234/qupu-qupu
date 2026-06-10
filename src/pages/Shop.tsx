// src/pages/Shop.tsx
//
// Real catalog (replaces Phase A stub). Header band with balance + filter
// chips + inventory shortcut. Grid of ShopItemCard. Tap → PurchaseSheet.
// Successful purchase → PurchaseCelebration + refresh list + sync stat strip.
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { useGamificationStats } from '../hooks/useGamificationStats'
import { fetchShopItems, type ShopItemForChild, type PurchaseResult } from '../lib/shopApi'
import ShopItemCard from '../components/shop/ShopItemCard'
import PurchaseSheet from '../components/shop/PurchaseSheet'
import PurchaseCelebration from '../components/shop/PurchaseCelebration'
import SkeletonCard from '../components/SkeletonCard'

// Indonesian chip labels for the kinds that can appear in the (deliverable-
// only) listing. Chips are derived from the fetched items so empty legacy
// categories never render as dead filters.
const KIND_CHIP_LABEL: Record<ShopItemForChild['kind'], string> = {
  worksheet: 'Worksheet',
  ebook: 'E-book',
  coloring: 'Mewarnai',
  sticker: 'Stiker',
  audio: 'Audio',
  powerup: 'Power-Up',
}

type Filter = 'Semua' | ShopItemForChild['kind']

export default function ShopPage() {
  useDocumentTitle('Toko')
  const { activeChildId } = useAuthStore()
  const stats = useGamificationStats((s) => s.stats)
  const patchCoinBalance = useGamificationStats((s) => s.patchCoinBalance)
  const patchStats = useGamificationStats((s) => s.patchStats)
  const balance = stats?.coinBalance ?? 0

  const [items, setItems] = useState<ShopItemForChild[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [loadTick, setLoadTick] = useState(0)
  const [filter, setFilter] = useState<Filter>('Semua')
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

  // Filter chips derived from what the shop actually serves ('Semua' +
  // present kinds, in listing order).
  const kinds = useMemo<Filter[]>(() => {
    if (!items) return ['Semua']
    return ['Semua', ...new Set(items.map((i) => i.kind))]
  }, [items])

  const filtered = useMemo(() => {
    if (!items) return []
    return filter === 'Semua' ? items : items.filter((i) => i.kind === filter)
  }, [items, filter])

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
    return (
      <div className="mx-auto w-full max-w-md sm:max-w-lg">
        <p className="text-sm font-medium text-qupu-muted">Pilih profil anak dulu.</p>
      </div>
    )
  }

  if (items === null && loadError) {
    return (
      <div className="mx-auto w-full max-w-md sm:max-w-lg">
        <div className="rounded-[1.5rem] bg-[#FFF8F0] p-5 text-center shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
            <i className="fa-solid fa-circle-exclamation text-xl" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-semibold text-qupu-muted">Gagal memuat toko. Coba lagi, ya.</p>
          <button
            type="button"
            onClick={() => setLoadTick((t) => t + 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display font-black text-white shadow-[0_3px_0_0_#C46123] transition-transform active:translate-y-0.5"
          >
            <i className="fa-solid fa-rotate-right text-sm" aria-hidden="true" />
            Coba lagi
          </button>
        </div>
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
    <div className="flex w-full flex-col gap-4 pb-8">
      <section className="sticky top-12 z-20 -mx-2 rounded-b-[2rem] bg-[#FFF8F0] px-4 pb-4 pt-4 shadow-[0_5px_0_0_rgba(196,97,35,0.28)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-qupu-brand-orange">
              Tukar koin
            </p>
            <h1 className="font-display text-2xl font-black leading-none text-qupu-brand-blue">
              Toko QUPU
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-qupu-brand-yellow px-3 py-1 font-display text-xs font-black text-qupu-brand-blue shadow-[0_2px_0_0_rgba(29,42,77,0.15)]">
              <i className="fa-solid fa-coins" aria-hidden="true" /> {balance}
            </span>
            <Link
              to="/me#koleksi"
              className="inline-flex items-center gap-1 rounded-full bg-qupu-brand-blue px-3 py-1 font-display text-[11px] font-black text-white"
            >
              <i className="fa-solid fa-box-archive" aria-hidden="true" /> Inventaris
            </Link>
          </div>
        </div>
        {kinds.length > 2 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={`whitespace-nowrap rounded-full px-3.5 py-2 font-display text-[10px] font-black uppercase tracking-[0.08em] transition-colors ${
                  filter === k
                    ? 'bg-qupu-brand-blue text-white shadow-[0_2px_0_0_#0E1430]'
                    : 'bg-white text-qupu-brand-blue/75 shadow-[0_1px_0_0_rgba(29,42,77,0.08)]'
                }`}
              >
                {k === 'Semua' ? 'Semua' : KIND_CHIP_LABEL[k]}
              </button>
            ))}
          </div>
        )}
      </section>

      {filtered.length === 0 ? (
        <p className="rounded-[1.5rem] bg-[#FFF8F0] p-4 text-sm font-semibold text-qupu-brand-blue">
          {items.length === 0
            ? 'Toko sedang menyiapkan barang baru. Cek lagi nanti, ya!'
            : 'Tidak ada item di kategori ini.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
