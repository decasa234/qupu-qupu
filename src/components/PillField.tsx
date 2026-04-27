// src/components/PillField.tsx
import type { HTMLInputTypeAttribute } from 'react'

interface PillFieldProps {
  label: string
  icon: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  type?: HTMLInputTypeAttribute
  required?: boolean
  helper?: string
  error?: string
  name?: string
  autoComplete?: string
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'url' | 'search'
  maxLength?: number
}

export default function PillField({
  label,
  icon,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  required = false,
  helper,
  error,
  name,
  autoComplete,
  inputMode,
  maxLength,
}: PillFieldProps) {
  const borderClass = error
    ? 'border-red-300 focus:border-red-500'
    : 'border-qupu-peach focus:border-qupu-brand-orange'

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
          inputMode={inputMode}
          maxLength={maxLength}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={error ? 'true' : undefined}
          className={`w-full rounded-full border-2 bg-qupu-shell px-12 py-3 text-qupu-ink outline-none transition-colors ${borderClass}`}
        />
      </div>
      {error ? (
        <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
      ) : helper ? (
        <p className="mt-2 text-xs font-semibold text-qupu-muted">{helper}</p>
      ) : null}
    </label>
  )
}
