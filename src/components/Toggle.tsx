// src/components/Toggle.tsx
interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  iconOn: string
  iconOff: string
  helper?: string
}

export default function Toggle({
  label,
  checked,
  onChange,
  iconOn,
  iconOff,
  helper,
}: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[1.5rem] bg-qupu-shell px-5 py-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            checked ? 'bg-qupu-brand-yellow text-qupu-brand-blue' : 'bg-white text-qupu-muted'
          }`}
        >
          <i className={`${checked ? iconOn : iconOff} text-base`} aria-hidden="true" />
        </span>
        <div>
          <div className="font-display text-base font-bold text-qupu-brand-blue">{label}</div>
          {helper && <p className="text-xs font-semibold text-qupu-muted">{helper}</p>}
        </div>
      </div>
      <span className="relative inline-flex h-7 w-12 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={`absolute inset-0 rounded-full transition-colors ${
            checked ? 'bg-qupu-brand-orange' : 'bg-qupu-peach'
          }`}
        />
        <span
          className={`relative ml-1 inline-block h-5 w-5 rounded-full bg-white shadow-soft transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </label>
  )
}
