import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

/*
 * Admin UI kit — the single source of truth for the admin panel's visual
 * vocabulary (warm, lightly-branded utilitarian register). Every admin page
 * composes these primitives instead of re-typing Tailwind class strings, so
 * the panel stays consistent screen to screen. Accent = qupu-brand-blue,
 * highlight = qupu-brand-orange, neutrals are the warm `admin-*` tokens.
 */

/* Shared form-control look: warm border + a real brand-blue focus ring (the
   global focus ring only covers <button>/<a>, so controls need their own). */
export const fieldControl =
  'w-full min-w-0 rounded-lg border border-admin-edge bg-white px-3 py-2 text-sm text-admin-ink placeholder:text-admin-faint outline-none transition-colors focus:border-qupu-brand-blue focus:ring-2 focus:ring-qupu-brand-blue/25 disabled:cursor-not-allowed disabled:opacity-60'

/* ------------------------------------------------------------------ */
/* Panel + section heading                                             */
/* ------------------------------------------------------------------ */

export function Panel({
  children,
  className = '',
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border border-admin-line bg-admin-card shadow-admin-soft ${
        padded ? 'p-4 sm:p-5' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionHeading({
  children,
  right,
  className = '',
}: {
  children: ReactNode
  right?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <h2 className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-admin-ink">
        {children}
      </h2>
      {right}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md'

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-qupu-brand-blue/40 disabled:cursor-not-allowed disabled:opacity-50'

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-qupu-brand-blue font-bold text-white hover:bg-qupu-brand-blue-shadow',
  secondary: 'border border-admin-edge bg-white font-semibold text-admin-ink hover:bg-admin-sunk',
  danger: 'border border-red-200 bg-white font-semibold text-red-600 hover:bg-red-50',
  ghost: 'font-semibold text-admin-muted hover:bg-admin-sunk hover:text-admin-ink',
}

/* Class helper for non-<button> elements that must look like a button
   (e.g. react-router <Link>). */
export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = '',
) {
  return `${BUTTON_BASE} ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]} ${extra}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: string
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <i className={icon} aria-hidden="true" />
      )}
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Form controls + field wrapper                                       */
/* ------------------------------------------------------------------ */

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldControl} ${className}`} {...rest} />
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldControl} ${className}`} {...rest} />
}

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${fieldControl} ${className}`} {...rest}>
      {children}
    </select>
  )
}

export function Field({
  label,
  hint,
  required,
  children,
  className = '',
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`grid min-w-0 gap-1 ${className}`}>
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-admin-muted">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && <span className="text-[11px] text-admin-faint">{hint}</span>}
    </label>
  )
}

/* ------------------------------------------------------------------ */
/* Segmented control (filter pills / range toggles)                    */
/* ------------------------------------------------------------------ */

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className = '',
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: ReactNode }>
  className?: string
}) {
  return (
    <div className={`inline-flex rounded-lg border border-admin-line bg-admin-card p-0.5 ${className}`}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              active ? 'bg-qupu-brand-blue text-white' : 'text-admin-muted hover:bg-admin-sunk'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Tag / chip                                                          */
/* ------------------------------------------------------------------ */

export type TagTone = 'neutral' | 'brand' | 'success' | 'warn' | 'danger' | 'ink'

const TAG_TONES: Record<TagTone, string> = {
  neutral: 'bg-admin-sunk text-admin-muted',
  brand: 'bg-qupu-brand-blue/10 text-qupu-brand-blue',
  success: 'bg-emerald-50 text-emerald-700',
  warn: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
  ink: 'bg-admin-ink text-white',
}

export function Tag({
  tone = 'neutral',
  color,
  children,
  className = '',
}: {
  tone?: TagTone
  color?: string // explicit hex (e.g. subject color) → solid swatch
  children: ReactNode
  className?: string
}) {
  if (color) {
    return (
      <span
        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${className}`}
        style={{ backgroundColor: color }}
      >
        {children}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TAG_TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Stat card — one canonical implementation for Dashboard + Analytics  */
/* ------------------------------------------------------------------ */

export function StatCard({
  icon,
  label,
  value,
  hint,
  suffix,
}: {
  icon: string
  label: string
  value: ReactNode
  hint?: ReactNode
  suffix?: string
}) {
  return (
    <Panel>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-qupu-brand-blue/10 text-qupu-brand-blue">
          <i className={`${icon} text-sm`} aria-hidden="true" />
        </span>
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-admin-muted">{label}</div>
      </div>
      <div className="mt-3 font-display text-2xl font-extrabold text-qupu-brand-blue">
        {value}
        {suffix && <span className="text-lg text-admin-muted">{suffix}</span>}
      </div>
      {hint && <div className="mt-0.5 text-[11px] text-admin-faint">{hint}</div>}
    </Panel>
  )
}

/* ------------------------------------------------------------------ */
/* Empty state + skeleton                                              */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon,
  title,
  hint,
  action,
  bordered = true,
  className = '',
}: {
  icon?: string
  title: string
  hint?: string
  action?: ReactNode
  bordered?: boolean
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-10 text-center ${
        bordered ? 'rounded-xl border border-dashed border-admin-edge bg-admin-sunk' : ''
      } ${className}`}
    >
      {icon && <i className={`${icon} mb-2 text-xl text-admin-faint`} aria-hidden="true" />}
      <div className="text-sm font-semibold text-admin-ink">{title}</div>
      {hint && <p className="mt-1 max-w-sm text-xs text-admin-muted">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-admin-line/70 ${className}`} />
}
