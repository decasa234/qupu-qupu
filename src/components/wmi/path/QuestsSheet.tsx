// src/components/wmi/path/QuestsSheet.tsx
//
// "Misi Hari Ini" behind the chest button on the Belajar path. Wraps the
// existing DailyQuestsPanel unchanged (same fetch + claim flow). The sheet
// stays MOUNTED while closed (hidden via CSS) so the panel's quest fetch can
// report the claimable count for the chest badge before the sheet ever opens.

import DailyQuestsPanel from '../../me/DailyQuestsPanel'

interface Props {
  childId: string
  open: boolean
  onClose: () => void
  onClaimableCount: (count: number) => void
}

export default function QuestsSheet({ childId, open, onClose, onClaimableCount }: Props) {
  return (
    <div className={open ? 'fixed inset-0 z-50' : 'hidden'} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Misi Hari Ini"
        className="absolute inset-x-0 bottom-0 mx-auto max-h-[75vh] w-full max-w-[460px] animate-rise overflow-y-auto rounded-t-[2rem] bg-qupu-cream p-4 pb-7 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
      >
        <span className="mx-auto block h-1.5 w-12 rounded-full bg-[#EFE2CC]" aria-hidden="true" />
        <div className="mt-2">
          <DailyQuestsPanel
            childId={childId}
            variant="dashboard"
            onClaimableCount={onClaimableCount}
          />
        </div>
      </div>
    </div>
  )
}
