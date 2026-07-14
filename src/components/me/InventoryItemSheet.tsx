// src/components/me/InventoryItemSheet.tsx
//
// Tap on an owned item shows this sheet. v1: "ready soon" placeholder
// because actual digital file delivery is stubbed for Phase 2. The streak
// shield (kind 'powerup') is the exception — it is genuinely delivered, so
// it gets its own copy: owned count + auto-activation note.
import BottomSheet from '../shop/BottomSheet'
import type { InventoryItem } from '../../lib/shopApi'
import { MAX_STREAK_SHIELDS } from '../../lib/shopApi'

interface Props {
  open: boolean
  onClose: () => void
  item: InventoryItem | null
  // Owned shield count — only meaningful when item.kind === 'powerup'.
  shieldCount?: number
}

export default function InventoryItemSheet({ open, onClose, item, shieldCount = 0 }: Props) {
  if (!item) return null
  const isShield = item.kind === 'powerup'
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex h-40 items-center justify-center rounded-[1.25rem] bg-qupu-shell">
          {item.thumbnailUrl ? (
            <img loading="lazy" decoding="async" src={item.thumbnailUrl} alt="" className="h-full w-full rounded-[1.25rem] object-cover" />
          ) : (
            <i
              className={`fa-solid ${isShield ? 'fa-shield-halved text-qupu-brand-orange' : 'fa-image text-qupu-muted'} text-5xl`}
              aria-hidden="true"
            />
          )}
        </div>
        <div className="text-[0.625rem] font-bold uppercase tracking-[0.2em] text-qupu-brand-orange">
          {isShield ? 'Power-Up' : item.kind}
        </div>
        <h2 className="font-display text-xl font-extrabold text-qupu-brand-blue">{item.name}</h2>
        {isShield ? (
          <div className="flex items-center gap-2 rounded-[1.25rem] bg-qupu-shell p-3 text-sm font-bold text-qupu-brand-blue">
            <i className="fa-solid fa-shield-halved text-qupu-brand-orange" aria-hidden="true" />
            Kamu punya {shieldCount}/{MAX_STREAK_SHIELDS}. Aktif otomatis saat kamu absen 1 hari.
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-[1.25rem] bg-qupu-shell p-3 text-sm font-bold text-qupu-brand-blue">
            <i className="fa-solid fa-clock text-qupu-brand-orange" aria-hidden="true" />
            Item kamu siap diunduh sebentar lagi.
          </div>
        )}
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
