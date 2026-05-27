// src/components/me/InventoryGrid.tsx
//
// Owned-items grid on /me. Newest first. Tap → InventoryItemSheet.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchInventory, type InventoryItem } from '../../lib/shopApi'
import InventoryItemSheet from './InventoryItemSheet'

interface Props {
  childId: string
}

export default function InventoryGrid({ childId }: Props) {
  const [items, setItems] = useState<InventoryItem[] | null>(null)
  const [active, setActive] = useState<InventoryItem | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchInventory(childId).then((data) => { if (!cancelled) setItems(data) })
    return () => { cancelled = true }
  }, [childId])

  if (items === null) {
    return <p className="text-sm font-medium text-qupu-muted">Memuat koleksi…</p>
  }

  if (items.length === 0) {
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
        {items.map((it) => (
          <button
            key={it.inventoryId}
            type="button"
            onClick={() => setActive(it)}
            className="flex flex-col overflow-hidden rounded-[1.5rem] border-[3px] border-qupu-peach bg-white text-left shadow-[5px_6px_0_0_#FFD3B1]"
          >
            <div className="flex h-24 items-center justify-center bg-qupu-shell">
              {it.thumbnailUrl ? (
                <img src={it.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <i className="fa-solid fa-image text-3xl text-qupu-muted" aria-hidden="true" />
              )}
            </div>
            <div className="p-2">
              <div className="line-clamp-1 font-display text-sm font-extrabold text-qupu-brand-blue">{it.name}</div>
              <div className="text-[10px] font-medium text-qupu-muted">
                {new Date(it.acquiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </div>
            </div>
          </button>
        ))}
      </div>
      <InventoryItemSheet open={active !== null} onClose={() => setActive(null)} item={active} />
    </>
  )
}
