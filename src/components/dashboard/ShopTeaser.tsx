// src/components/dashboard/ShopTeaser.tsx
//
// Compact yellow card on Home pointing to /shop. Phase A renders a CTA
// only — Phase C adds 1–3 affordable item thumbnails once the shop API
// exists.
import { Link } from 'react-router-dom'

interface Props {
  coinBalance: number
}

export default function ShopTeaser({ coinBalance }: Props) {
  return (
    <Link
      to="/shop"
      className="flex items-center gap-3 rounded-[2rem] bg-qupu-brand-yellow p-4 shadow-[5px_6px_0_0_#FFD3B1] transition-transform hover:-translate-y-0.5"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-qupu-brand-orange">
        <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <h3 className="font-display text-base font-extrabold text-qupu-brand-blue">Toko QUPU</h3>
        <p className="text-xs font-medium text-qupu-brand-blue/70">
          Tukar koinmu jadi paket worksheet & e-book ({coinBalance} koin)
        </p>
      </div>
      <span className="rounded-full bg-qupu-brand-blue px-3 py-1 font-display text-xs font-extrabold text-qupu-brand-yellow">
        Lihat <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </span>
    </Link>
  )
}
