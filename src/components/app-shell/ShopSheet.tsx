// src/components/app-shell/ShopSheet.tsx
//
// The shop as a bottom-sheet modal (design), opened from the top-bar coins
// pill. Wraps ShopCatalog; the /shop route renders the same catalog full-page
// for deep links. Mounted only while open so each open refetches the catalog
// (fresh owned flags + balance). PurchaseSheet/celebration portal themselves
// to <body> above this sheet (z-70+).
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import ShopCatalog from '../shop/ShopCatalog'
import { useSheetDrag } from '../wmi/path/useSheetDrag'

interface Props {
  onClose: () => void
}

export default function ShopSheet({ onClose }: Props) {
  const { panelRef, dragHandlers, sheetStyle } = useSheetDrag(onClose)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Toko QUPU"
        style={sheetStyle}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[85vh] w-full max-w-[28.75rem] flex-col animate-rise rounded-t-[2rem] bg-white shadow-[0_-6px_28px_rgba(0,0,0,0.16)]"
      >
        {/* Grab zone: drag the handle strip down to dismiss. */}
        <div
          {...dragHandlers}
          className="cursor-grab touch-none select-none px-4 pb-1 pt-3 active:cursor-grabbing"
        >
          <span className="mx-auto block h-1.5 w-12 rounded-full bg-[#EFE2CC]" aria-hidden="true" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(env(safe-area-inset-bottom),1.75rem)] pt-1">
          <ShopCatalog />
        </div>
      </div>
    </div>,
    document.body,
  )
}
