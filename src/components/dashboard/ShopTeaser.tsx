// src/components/dashboard/ShopTeaser.tsx (v2)
import { Link } from 'react-router-dom'
import type { ShopItemForChild } from '../../lib/shopApi'

interface Props {
  coinBalance: number
  affordableItems: ShopItemForChild[] // sorted by price asc, first 3
}

export default function ShopTeaser({ coinBalance, affordableItems }: Props) {
  return (
    <Link
      to="/shop"
      className="flex flex-col gap-3 rounded-[2rem] bg-qupu-brand-yellow p-4 shadow-[5px_6px_0_0_#FFD3B1] transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-qupu-brand-orange">
          <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-base font-extrabold text-qupu-brand-blue">Toko QUPU</h3>
          <p className="text-xs font-medium text-qupu-brand-blue/70">
            {affordableItems.length > 0
              ? `${affordableItems.length} item siap dibeli (${coinBalance} koin)`
              : `Sedikit lagi untuk item pertama! (${coinBalance} koin)`}
          </p>
        </div>
        <span className="rounded-full bg-qupu-brand-blue px-3 py-1 font-display text-xs font-extrabold text-qupu-brand-yellow">
          Lihat <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </span>
      </div>
      {affordableItems.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {affordableItems.map((it) => (
            <div key={it.id} className="flex w-20 flex-shrink-0 flex-col items-center rounded-2xl bg-white p-2 text-center">
              <i className="fa-solid fa-image text-2xl text-qupu-muted" aria-hidden="true" />
              <div className="mt-1 line-clamp-1 w-full text-[10px] font-extrabold text-qupu-brand-blue">{it.name}</div>
              <div className="text-[10px] font-bold text-qupu-brand-orange">{it.coinPrice} koin</div>
            </div>
          ))}
        </div>
      )}
    </Link>
  )
}
