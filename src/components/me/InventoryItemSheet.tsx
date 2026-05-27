// src/components/me/InventoryItemSheet.tsx
//
// Tap on an owned item shows this sheet. v1: "ready soon" placeholder
// because actual digital file delivery is stubbed for Phase 2.
import BottomSheet from '../shop/BottomSheet'
import type { InventoryItem } from '../../lib/shopApi'

interface Props {
  open: boolean
  onClose: () => void
  item: InventoryItem | null
}

export default function InventoryItemSheet({ open, onClose, item }: Props) {
  if (!item) return null
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex h-40 items-center justify-center rounded-[1.25rem] bg-qupu-shell">
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt="" className="h-full w-full rounded-[1.25rem] object-cover" />
          ) : (
            <i className="fa-solid fa-image text-5xl text-qupu-muted" aria-hidden="true" />
          )}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-qupu-brand-orange">{item.kind}</div>
        <h2 className="font-display text-xl font-extrabold text-qupu-brand-blue">{item.name}</h2>
        <div className="flex items-center gap-2 rounded-[1.25rem] bg-qupu-shell p-3 text-sm font-bold text-qupu-brand-blue">
          <i className="fa-solid fa-clock text-qupu-brand-orange" aria-hidden="true" />
          Item kamu siap diunduh sebentar lagi.
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-qupu-brand-blue px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe"
        >
          Tutup
        </button>
      </div>
    </BottomSheet>
  )
}
