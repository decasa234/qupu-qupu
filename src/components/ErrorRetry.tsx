// src/components/ErrorRetry.tsx
//
// The one error+retry card for member/parent pages.
interface ErrorRetryProps {
  message?: string
  onRetry: () => void
  retryLabel?: string
  className?: string
}

export default function ErrorRetry({
  message = 'Gagal memuat. Periksa koneksimu.',
  onRetry,
  retryLabel = 'Coba lagi',
  className,
}: ErrorRetryProps) {
  return (
    <div
      className={`rounded-[1.5rem] bg-white p-5 text-center shadow-[0_5px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]${
        className ? ` ${className}` : ''
      }`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
        <i className="fa-solid fa-circle-exclamation text-xl" aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-semibold text-qupu-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-qupu-brand-orange px-5 py-2.5 font-display text-sm font-black text-white shadow-[0_4px_0_0_#C46123] transition-transform active:translate-y-0.5"
      >
        <i className="fa-solid fa-rotate-right" aria-hidden="true" />
        {retryLabel}
      </button>
    </div>
  )
}
