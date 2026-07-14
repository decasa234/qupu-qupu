// src/components/wmi/path/QuestsSheet.tsx
//
// "Misi Hari Ini" behind the chest button on the Belajar path. Wraps the
// existing DailyQuestsPanel unchanged (same fetch + claim flow). The sheet
// stays MOUNTED while closed (hidden via CSS) so the panel's quest fetch can
// report the claimable count for the chest badge before the sheet ever opens.

import { createPortal } from 'react-dom'
import DailyQuestsPanel from '../../me/DailyQuestsPanel'
import { useSheetDrag } from './useSheetDrag'

interface Props {
  childId: string
  open: boolean
  onClose: () => void
  onClaimableCount: (count: number) => void
}

export default function QuestsSheet({ childId, open, onClose, onClaimableCount }: Props) {
  // `open` lets the drag hook reset its state on each reopen (this sheet stays
  // mounted while closed, so it would otherwise keep the last dismissal's transform).
  const { panelRef, dragHandlers, sheetStyle } = useSheetDrag(onClose, open)

  // Portaled to <body>: AppShell's content column is a `relative z-10`
  // stacking context, so an in-tree z-50 would still paint (and hit-test)
  // BELOW the sibling BottomTabBar (z-30). At the root level z-50 wins.
  return createPortal(
    <div className={open ? 'fixed inset-0 z-50' : 'hidden'} aria-hidden={!open}>
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
        aria-label="Misi Hari Ini"
        style={sheetStyle}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[75vh] w-full max-w-[28.75rem] flex-col animate-rise rounded-t-[2rem] bg-qupu-cream shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
      >
        {/* Grab zone: drag the handle strip down to dismiss. Kept OUT of the
            scroll area below so pointer capture works (the list keeps its own
            scroll). */}
        <div
          {...dragHandlers}
          className="cursor-grab touch-none select-none px-4 pb-2 pt-4 active:cursor-grabbing"
        >
          <span className="mx-auto block h-1.5 w-12 rounded-full bg-[#EFE2CC]" aria-hidden="true" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(env(safe-area-inset-bottom),1.75rem)]">
          <DailyQuestsPanel
            childId={childId}
            variant="dashboard"
            onClaimableCount={onClaimableCount}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
