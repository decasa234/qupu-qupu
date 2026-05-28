interface Props {
  active: boolean
  onToggle: () => void
}

export default function WmiBreakdownToggle({ active, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="mt-2 rounded-lg border-2 border-qupu-brand-blue px-3 py-1 text-sm font-bold text-qupu-brand-blue"
    >
      {active ? 'Soal utuh' : 'Pecah soal'}
    </button>
  )
}
