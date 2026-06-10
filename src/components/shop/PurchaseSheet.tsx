// src/components/shop/PurchaseSheet.tsx
//
// Bottom sheet for: tap a card → see item detail → confirm → buy.
// Confirm dialog is a second tap inside the same sheet (not a separate
// modal) to keep it phone-native. CTA is disabled when unaffordable.
import { useState } from 'react'
import BottomSheet from './BottomSheet'
import { toIndonesianErrorMessage } from '../../lib/errorMessage'
import type { PurchaseResult, ShopItemForChild } from '../../lib/shopApi'
import { MAX_STREAK_SHIELDS, STREAK_SHIELD_SLUG, purchaseShopItem } from '../../lib/shopApi'

interface Props {
  open: boolean
  onClose: () => void
  item: ShopItemForChild | null
  childId: string
  balance: number
  onPurchased: (result: PurchaseResult) => void
}

export default function PurchaseSheet({ open, onClose, item, childId, balance, onPurchased }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [buyError, setBuyError] = useState<string | null>(null)

  if (!item) return null
  const affordable = balance >= item.coinPrice
  const owned = item.owned
  const isShield = item.slug === STREAK_SHIELD_SLUG
  const shieldCount = item.shieldCount ?? 0
  const shieldAtCap = isShield && shieldCount >= MAX_STREAK_SHIELDS

  async function handleBuy() {
    if (!item) return
    setSubmitting(true)
    setBuyError(null)
    try {
      const result = await purchaseShopItem(childId, item.id)
      onPurchased(result)
    } catch (err) {
      // Network/5xx — purchaseShopItem already unwraps the structured 400s.
      // Surface it inline; the sheet stays open so the kid can retry.
      setBuyError(toIndonesianErrorMessage(err, 'Gagal menukar koin. Coba lagi, ya.'))
    } finally {
      setSubmitting(false)
      setConfirming(false)
    }
  }

  return (
    <BottomSheet open={open} onClose={() => { setConfirming(false); setBuyError(null); onClose() }}>
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
        <p className="text-sm font-medium text-qupu-muted">{item.description}</p>
        <div className="inline-flex items-center gap-2 rounded-full bg-qupu-brand-yellow px-3 py-1 font-display text-sm font-extrabold text-qupu-brand-blue">
          <i className="fa-solid fa-coins" aria-hidden="true" /> {item.coinPrice} koin
        </div>

        {buyError && (
          <div className="rounded-[1.25rem] border-2 border-rose-200 bg-rose-50 p-3 text-center text-sm font-bold text-rose-600">
            <i className="fa-solid fa-circle-exclamation me-1" aria-hidden="true" />
            {buyError}
          </div>
        )}

        {isShield && (
          <div className="flex items-center gap-2 rounded-[1.25rem] bg-qupu-shell p-3 text-sm font-bold text-qupu-brand-blue">
            <i className="fa-solid fa-shield-halved text-qupu-brand-orange" aria-hidden="true" />
            Kamu punya {shieldCount}/{MAX_STREAK_SHIELDS}. Aktif otomatis saat kamu absen 1 hari.
          </div>
        )}

        {shieldAtCap ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe"
          >
            <i className="fa-solid fa-shield-halved" aria-hidden="true" /> Pelindungmu sudah penuh
          </button>
        ) : owned ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe"
          >
            <i className="fa-solid fa-check" aria-hidden="true" /> Sudah ada di inventaris
          </button>
        ) : !affordable ? (
          <button
            type="button"
            disabled
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-muted/40 px-6 py-3 font-display text-base font-extrabold text-white"
          >
            Butuh {item.coinPrice - balance} koin lagi
          </button>
        ) : !confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-qupu-brand-orange px-6 py-3 font-display text-base font-extrabold text-white shadow-subscribe"
          >
            <i className="fa-solid fa-coins" aria-hidden="true" /> Beli — {item.coinPrice} koin
          </button>
        ) : (
          <div className="mt-2 space-y-2 rounded-[1.25rem] bg-qupu-shell p-3">
            <p className="text-center text-sm font-bold text-qupu-brand-blue">
              Tukar {item.coinPrice} koin untuk {item.name}?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-full bg-white px-4 py-2 font-display text-sm font-extrabold text-qupu-brand-blue"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBuy}
                disabled={submitting}
                className="flex-1 rounded-full bg-qupu-brand-orange px-4 py-2 font-display text-sm font-extrabold text-white disabled:opacity-60"
              >
                {submitting ? 'Memproses…' : 'Ya, tukar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
