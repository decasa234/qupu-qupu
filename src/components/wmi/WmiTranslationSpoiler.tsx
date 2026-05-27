interface Props {
  revealed: boolean
  onReveal: () => void
  children: React.ReactNode
}

export default function WmiTranslationSpoiler({ revealed, onReveal, children }: Props) {
  if (revealed) {
    return <div className="mt-4 rounded-lg bg-qupu-cream/70 p-3 text-gray-700">{children}</div>
  }

  return (
    <button
      type="button"
      onClick={onReveal}
      className="mt-4 rounded-full border-2 border-qupu-peach px-4 py-2 text-sm font-bold text-qupu-brand-blue"
    >
      Lihat terjemahan Bahasa Indonesia
    </button>
  )
}
