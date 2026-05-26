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
  worksheet: 'bg-qupu-brand-yellow',
  ebook:     'bg-qupu-brand-blue text-white',
  coloring:  'bg-qupu-peach',
  sticker:   'bg-emerald-300',
  audio:     'bg-rose-300',
}

export default function ShopItemCard({ item, balance, onTap }: Props) {
  const shortBy = item.coinPrice - balance
  return (
    <button
      type="button"
      onClick={onTap}
      className="relative flex flex-col overflow-hidden rounded-[1.5rem] border-[3px] border-qupu-peach bg-white text-left shadow-[5px_6px_0_0_#FFD3B1] transition-transform active:scale-[0.98]"
    >
      <div className={`flex h-28 items-center justify-center ${KIND_TINT[item.kind]}`}>
        {item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <i className="fa-solid fa-image text-3xl opacity-70" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="line-clamp-1 font-display text-sm font-extrabold text-qupu-brand-blue">{item.name}</div>
        <div className="inline-flex items-center gap-1 self-start rounded-full bg-qupu-brand-yellow px-2 py-0.5 text-[11px] font-extrabold text-qupu-brand-blue">
          <i className="fa-solid fa-coins" aria-hidden="true" /> {item.coinPrice}
        </div>
      </div>
      {item.owned && (
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
          <i className="fa-solid fa-check" aria-hidden="true" /> Dimiliki
        </span>
      )}
      {!item.owned && !item.affordable && (
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-qupu-brand-blue/85 px-2 py-0.5 text-[10px] font-extrabold text-white">
          Butuh {shortBy} lagi
        </span>
      )}
    </button>
  )
}
