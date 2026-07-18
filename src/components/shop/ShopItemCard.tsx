// src/components/shop/ShopItemCard.tsx
//
// Catalog tile per the design: centered column — solid-color icon tile (or
// thumbnail), name, then one chip: green "Dimiliki" when owned (or shield
// count for the repurchasable Perisai Beku), otherwise the coin price.
import {
  STREAK_SHIELD_SLUG,
  shopItemDisplayName,
  type ShopItemForChild,
} from '../../lib/shopApi'

interface Props {
  item: ShopItemForChild
  onTap: () => void
}

// Design palette accents — solid tile + white icon, like the Main world tiles.
const KIND_TINT: Record<ShopItemForChild['kind'], string> = {
  worksheet: '#F59E0B',
  ebook: '#4A90D9',
  coloring: '#F472B6',
  sticker: '#58A700',
  audio: '#8A5BF0',
  powerup: '#4A90D9',
}

const KIND_ICON: Record<ShopItemForChild['kind'], string> = {
  worksheet: 'fa-solid fa-file-lines',
  ebook: 'fa-solid fa-book-open',
  coloring: 'fa-solid fa-palette',
  sticker: 'fa-solid fa-note-sticky',
  audio: 'fa-solid fa-headphones',
  powerup: 'fa-solid fa-shield-halved',
}

export default function ShopItemCard({ item, onTap }: Props) {
  const isShield = item.slug === STREAK_SHIELD_SLUG
  const shieldCount = item.shieldCount ?? 0
  const held = item.owned || (isShield && shieldCount > 0)

  return (
    <button
      type="button"
      onClick={onTap}
      className="flex flex-col items-center gap-2.5 rounded-[1.375rem] bg-white p-4 pt-5 text-center shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_2px_0_0_#FFD3B1]"
    >
      {item.thumbnailUrl ? (
        <img
          loading="lazy"
          decoding="async"
          src={item.thumbnailUrl}
          alt=""
          className="h-14 w-14 rounded-[1.125rem] object-cover shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)]"
        />
      ) : (
        <span
          className="flex h-14 w-14 items-center justify-center rounded-[1.125rem] text-2xl text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.15)]"
          style={{ background: KIND_TINT[item.kind] }}
        >
          <i
            className={isShield ? 'fa-solid fa-snowflake' : KIND_ICON[item.kind]}
            aria-hidden="true"
          />
        </span>
      )}
      <span className="line-clamp-2 min-h-9 font-display text-sm font-black leading-tight text-qupu-brand-blue">
        {shopItemDisplayName(item)}
      </span>
      {held ? (
        <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#E7F6E0] px-3 py-1.5 text-[0.6875rem] font-black text-[#3F7A25]">
          <i className="fa-solid fa-check" aria-hidden="true" />
          {isShield && !item.owned ? `x${shieldCount}` : 'Dimiliki'}
        </span>
      ) : (
        <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#EFE6D6] px-3 py-1.5 text-[0.6875rem] font-black text-qupu-brand-blue">
          <i className="fa-solid fa-coins text-[#D9A406]" aria-hidden="true" />
          {item.coinPrice}
        </span>
      )}
    </button>
  )
}
