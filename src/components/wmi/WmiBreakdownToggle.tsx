interface Props {
  active: boolean
  onToggle: () => void
}

export default function WmiBreakdownToggle({ active, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? 'Tampilkan soal utuh' : 'Pecah soal'}
      title={active ? 'Soal utuh' : 'Pecah soal'}
      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 font-display text-lg font-bold transition-colors ${
        active
          ? 'border-qupu-brand-blue bg-qupu-brand-blue text-white'
          : 'border-qupu-brand-blue bg-white text-qupu-brand-blue'
      }`}
    >
      Q
    </button>
  )
}
