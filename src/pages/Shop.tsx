// src/pages/Shop.tsx
//
// /shop — thin page wrapper around ShopCatalog (kept for deep links, e.g.
// InventoryGrid's "Buka toko"). The primary entry is now the top-bar coins
// pill, which opens the same catalog as a bottom-sheet modal (ShopSheet).
import useDocumentTitle from '../hooks/useDocumentTitle'
import ShopCatalog from '../components/shop/ShopCatalog'

export default function ShopPage() {
  useDocumentTitle('Toko')
  return (
    <div className="mx-auto w-full max-w-[28.75rem] pb-8 pt-1">
      <ShopCatalog />
    </div>
  )
}
