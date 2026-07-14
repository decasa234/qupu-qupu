// src/components/me/InventoryGrid.tsx
//
// Owned-items grid on /me. Newest first. Tap → InventoryItemSheet.
// The streak shield lives on gamification_profiles (no child_inventory
// row), so when the child holds any, a synthetic tile is prepended.
// Self-sufficient like LevelDetail: fetches its own data per child.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchInventory, type InventoryItem } from '../../lib/shopApi'
import { fetchGamificationSummary } from '../../lib/gamificationApi'
import InventoryItemSheet from './InventoryItemSheet'

interface Props {
  childId: string
}

// Synthetic entry for the shield tile/sheet — not a real inventory row.
const SHIELD_ENTRY: InventoryItem = {
  inventoryId: 'streak-shield',
  itemId: 'streak-shield',
  name: 'Pelindung Streak',
  kind: 'powerup',
  thumbnailUrl: null,
  acquiredAt: '',
}

export default function InventoryGrid({ childId }: Props) {
  const [items, setItems] = useState<InventoryItem[] | null>(null)
  const [shieldCount, setShieldCount] = useState(0)
  const [active, setActive] = useState<InventoryItem | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchInventory(childId)
      .then((data) => { if (!cancelled) setItems(data) })
      // Quiet failure: render the empty-collection state instead of an
      // eternal "Memuat koleksi…" — the /me page must not look broken.
      .catch((err) => {
        console.error('Inventory load failed:', err)
        if (!cancelled) setItems([])
      })
    fetchGamificationSummary(childId)
      .then((summary) => { if (!cancelled) setShieldCount(summary.streakShields ?? 0) })
      .catch(() => { /* shield tile just stays hidden */ })
    return () => { cancelled = true }
  }, [childId])

  if (items === null) {
    return <p className="text-sm font-medium text-qupu-muted">Memuat koleksi…</p>
  }

  const entries: InventoryItem[] =
    shieldCount > 0 ? [SHIELD_ENTRY, ...items] : items

  if (entries.length === 0) {
    return (
      <>
        <p className="text-sm font-medium text-qupu-muted">
          Belum ada item. Selesaikan misi dan tukar koinmu di toko.
        </p>
        <Link
          to="/shop"
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-4 py-2 font-display text-sm font-extrabold text-white shadow-subscribe"
        >
          <i className="fa-solid fa-bag-shopping" aria-hidden="true" /> Buka toko
        </Link>
      </>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {entries.map((it) => {
          const isShield = it.kind === 'powerup'
          return (
            <button
              key={it.inventoryId}
              type="button"
              onClick={() => setActive(it)}
              className="flex flex-col overflow-hidden rounded-[1.5rem] border-[3px] border-qupu-peach bg-white text-left shadow-[5px_6px_0_0_#FFD3B1]"
            >
              <div className="flex h-24 items-center justify-center bg-qupu-shell">
                {it.thumbnailUrl ? (
                  <img loading="lazy" decoding="async" src={it.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <i
                    className={`fa-solid ${isShield ? 'fa-shield-halved text-qupu-brand-orange' : 'fa-image text-qupu-muted'} text-3xl`}
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="p-2">
                <div className="line-clamp-1 font-display text-sm font-extrabold text-qupu-brand-blue">{it.name}</div>
                <div className="text-[0.625rem] font-medium text-qupu-muted">
                  {isShield
                    ? `x${shieldCount} — aktif otomatis`
                    : new Date(it.acquiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      <InventoryItemSheet
        open={active !== null}
        onClose={() => setActive(null)}
        item={active}
        shieldCount={shieldCount}
      />
    </>
  )
}
