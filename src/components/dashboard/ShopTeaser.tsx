import { Link } from 'react-router-dom'
import type { ShopItemForChild } from '../../lib/shopApi'

interface Props {
  coinBalance: number
  affordableItems: ShopItemForChild[]
}

export default function ShopTeaser({ coinBalance, affordableItems }: Props) {
  return (
    <section className="rounded-[2rem] bg-[#FFF8F0] p-4 shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFD3B1]">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[1.25rem] bg-qupu-brand-orange text-xl text-white shadow-[0_3px_0_0_#C46123]">
          <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-black uppercase tracking-[0.16em] text-qupu-brand-orange">
            Toko QUPU
          </p>
          <h3 className="font-display text-lg font-black leading-none text-qupu-brand-blue">
            Tukar koinmu
          </h3>
          <p className="mt-1 truncate text-[0.6875rem] font-semibold text-qupu-brand-blue/65">
            {affordableItems.length > 0
              ? `${affordableItems.length} item siap dibeli sekarang`
              : `${coinBalance} koin tersimpan untuk hadiah berikutnya`}
          </p>
        </div>
      </div>
      <Link
        to="/shop"
        className="mt-4 flex items-center justify-center gap-2 rounded-full bg-qupu-brand-blue px-4 py-3 text-sm font-black text-white shadow-[0_4px_0_0_#0E1430] transition-transform active:translate-y-0.5 active:shadow-[0_2px_0_0_#0E1430]"
      >
        Buka toko
        <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
      </Link>
    </section>
  )
}
