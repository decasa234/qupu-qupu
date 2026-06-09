// src/components/onboarding/GardenCoachMark.tsx
//
// One-shot coach-mark for the WMI garden's resume hero. Replaces the old
// react-joyride spectate tour with a single dismissible bubble pointing at
// the "Mulai" button below it. It never blocks interaction: tapping the
// bubble, the X, or the hero button itself marks it done (the once-only
// localStorage flag lives in WmiHub) and it never shows again.

export default function GardenCoachMark({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="relative mt-4 animate-rise" role="status">
      {/* pointer toward the hero button below */}
      <span
        aria-hidden="true"
        className="absolute -bottom-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 bg-white ring-2 ring-[#FFE3CC]"
      />
      <div
        onClick={onDismiss}
        className="relative flex cursor-pointer items-center gap-3 rounded-[1.25rem] bg-white px-4 py-3 shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]"
      >
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-qupu-brand-yellow text-sm text-qupu-brand-blue">
          <i className="fa-solid fa-hand-pointer" aria-hidden="true" />
        </span>
        <p className="flex-1 font-display text-sm font-black leading-snug text-qupu-brand-blue">
          Ketuk untuk mulai latihan pertamamu!
        </p>
        <button
          type="button"
          aria-label="Tutup petunjuk"
          onClick={(event) => {
            event.stopPropagation()
            onDismiss()
          }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-qupu-cream text-xs text-qupu-brand-blue transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
