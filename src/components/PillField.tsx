type PillFieldProps = {
  label: string
  icon: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  helper?: string
  name?: string
  autoComplete?: string
}

export default function PillField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  helper,
  name,
  autoComplete,
}: PillFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-qupu-muted">{label}</span>
      <div className="relative mt-2">
        <i
          className={`${icon} pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-base text-qupu-muted`}
          aria-hidden="true"
        />
        <input
          type={type}
          value={value}
          name={name}
          autoComplete={autoComplete}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border-2 border-qupu-peach bg-qupu-shell px-12 py-3 text-qupu-ink outline-none transition-colors focus:border-qupu-brand-orange"
        />
      </div>
      {helper && <div className="mt-2 text-xs font-semibold text-qupu-muted">{helper}</div>}
    </label>
  )
}
