// src/components/shop/PurchaseCelebration.tsx
//
// Full-screen overlay shown after a successful purchase. Pure CSS confetti
// (no emoji glyphs per project rule) + scale-up spring on the item card.
// Auto-dismisses after 2.5s or on tap.
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { ShopItem } from '../../lib/shopApi'
import { STREAK_SHIELD_SLUG } from '../../lib/shopApi'

interface Props {
  item: ShopItem
  onDismiss: () => void
}

const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i * 90) % 700}ms`,
  color: ['#F0853A', '#FFB400', '#1d2a4d', '#58CC02'][i % 4],
}))

export default function PurchaseCelebration({ item, onDismiss }: Props) {
  const isShield = item.slug === STREAK_SHIELD_SLUG

  useEffect(() => {
    const t = window.setTimeout(onDismiss, 2500)
    return () => window.clearTimeout(t)
  }, [onDismiss])

  return (
    <button
      type="button"
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-qupu-brand-blue/90 px-6 text-center text-white"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className="absolute top-0 h-2 w-2 animate-[fall_1.6s_ease-in_forwards] rounded-sm"
            style={{ left: c.left, backgroundColor: c.color, animationDelay: c.delay }}
          />
        ))}
      </div>
      <i
        className={`fa-solid ${isShield ? 'fa-shield-halved' : 'fa-gift'} text-6xl text-qupu-brand-yellow`}
        aria-hidden="true"
      />
      <h2 className="font-display text-3xl font-extrabold">Hore!</h2>
      <p className="font-display text-xl font-extrabold">
        Kamu dapat <span className="text-qupu-brand-yellow">{item.name}</span>
      </p>
      <p className="text-sm font-medium opacity-80">
        {isShield ? 'Aktif otomatis saat kamu absen 1 hari' : 'Tersimpan di inventaris kamu'}
      </p>
      <Link
        to="/profil#koleksi"
        className="z-10 mt-2 inline-flex items-center gap-2 rounded-full bg-qupu-brand-yellow px-5 py-2 font-display text-sm font-extrabold text-qupu-brand-blue"
        onClick={(e) => { e.stopPropagation() }}
      >
        Lihat inventaris <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </Link>
    </button>
  )
}
