// src/components/shop/ShopItemCard.tsx
//
// Catalog tile. Renders thumbnail (or a coloured placeholder if missing),
// name, price chip, and an overlay badge for owned / unaffordable items.
import type { ShopItemForChild } from '../../lib/shopApi'

interface Props {
  item: ShopItemForChild
  balance: number
  onTap: () => void
}

const KIND_TINT: Record<ShopItemForChild['kind'], string> = {
  worksheet: 'bg-[oklch(0.88_0.14_85)] text-qupu-brand-blue',
  ebook:     'bg-[oklch(0.42_0.09_255)] text-[oklch(0.86_0.04_250)]',
  coloring:  'bg-[oklch(0.84_0.08_52)] text-[oklch(0.45_0.08_260)]',
  sticker:   'bg-[oklch(0.78_0.12_160)] text-[oklch(0.38_0.08_185)]',
  audio:     'bg-[oklch(0.78_0.12_5)] text-[oklch(0.42_0.08_330)]',
  powerup:   'bg-[oklch(0.62_0.16_255)] text-white',
}

const KIND_ICON: Record<ShopItemForChild['kind'], string> = {
  worksheet: 'fa-solid fa-file-lines',
  ebook: 'fa-solid fa-book-open',
  coloring: 'fa-solid fa-palette',
  sticker: 'fa-solid fa-note-sticky',
  audio: 'fa-solid fa-headphones',
  powerup: 'fa-solid fa-shield-halved',
}

const KIND_LABEL: Record<ShopItemForChild['kind'], string> = {
  worksheet: 'Worksheet',
  ebook: 'E-book',
  coloring: 'Mewarnai',
  sticker: 'Stiker',
  audio: 'Audio',
  powerup: 'Power-Up',
}

export default function ShopItemCard({ item, balance, onTap }: Props) {
  const shortBy = item.coinPrice - balance
  return (
    <button
      type="button"
      onClick={onTap}
      className="group relative flex min-h-52 flex-col overflow-hidden rounded-[1.375rem] bg-[#FFF8F0] text-left shadow-[0_4px_0_0_rgba(255,211,177,0.95),0_14px_24px_rgba(116,54,16,0.16)] ring-2 ring-[#FFD3B1] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
    >
      <div className={`relative flex h-24 items-center justify-center ${KIND_TINT[item.kind]}`}>
        <div className="absolute inset-x-4 bottom-0 h-px bg-white/35" />
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/28 text-2xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]">
            <i className={KIND_ICON[item.kind]} aria-hidden="true" />
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.08em] text-qupu-brand-blue/75">
          {KIND_LABEL[item.kind]}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 p-3.5">
        <div className="line-clamp-2 min-h-9 font-display text-sm font-black leading-tight text-qupu-brand-blue">
          {item.name}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1 self-start rounded-full bg-qupu-brand-yellow px-2.5 py-1 text-[11px] font-black text-qupu-brand-blue shadow-[0_2px_0_0_rgba(29,42,77,0.12)]">
            <i className="fa-solid fa-coins" aria-hidden="true" /> {item.coinPrice}
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-qupu-brand-blue text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </span>
        </div>
      </div>
      {item.owned && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[oklch(0.52_0.14_155)] px-2.5 py-1 text-[10px] font-black text-white shadow-[0_2px_0_0_rgba(10,80,55,0.25)]">
          <i className="fa-solid fa-check" aria-hidden="true" /> Dimiliki
        </span>
      )}
      {/* Repurchasable shield: show the owned count instead of "Dimiliki". */}
      {!item.owned && (item.shieldCount ?? 0) > 0 && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[oklch(0.52_0.14_155)] px-2.5 py-1 text-[10px] font-black text-white shadow-[0_2px_0_0_rgba(10,80,55,0.25)]">
          <i className="fa-solid fa-shield-halved" aria-hidden="true" /> x{item.shieldCount}
        </span>
      )}
      {!item.owned && !(item.shieldCount ?? 0) && !item.affordable && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-qupu-brand-blue px-2.5 py-1 text-[10px] font-black text-white shadow-[0_2px_0_0_#0E1430]">
          +{shortBy} koin
        </span>
      )}
    </button>
  )
}
