// src/components/wmi/WmiDots.tsx
//
// A row of question markers used across konsep / drill (session history) and
// exam (question navigator). Each dot carries a state:
//   correct  — answered correctly (green check)
//   wrong    — answered incorrectly (red x)
//   answered — answered, correctness hidden (navy; used for the blind exam)
//   pending  — not yet done (outline)
// `current` rings the active question; `onClick` makes a dot a jump button.
export type WmiDotState = 'correct' | 'wrong' | 'answered' | 'pending'

export interface WmiDot {
  key: string
  state: WmiDotState
  current?: boolean
  onClick?: () => void
  label?: string
}

const STATE_STYLE: Record<WmiDotState, string> = {
  correct: 'bg-[#58A700] text-white',
  wrong: 'bg-[#E11D48] text-white',
  answered: 'bg-qupu-brand-blue text-white',
  pending: 'bg-white text-qupu-brand-blue/30 ring-2 ring-[#FFE3CC]',
}

const STATE_ICON: Partial<Record<WmiDotState, string>> = {
  correct: 'fa-solid fa-check',
  wrong: 'fa-solid fa-xmark',
}

export default function WmiDots({ dots }: { dots: WmiDot[] }) {
  if (dots.length === 0) return null
  return (
    <div className="rounded-[1.5rem] bg-white p-3 shadow-[0_4px_0_0_#FFD3B1] ring-2 ring-[#FFE3CC]">
      <div className="flex flex-wrap gap-2">
        {dots.map((dot) => {
          const ring = dot.current
            ? 'ring-2 ring-qupu-brand-orange ring-offset-2 ring-offset-white'
            : ''
          const className = `flex h-7 w-7 items-center justify-center rounded-full text-[11px] ${STATE_STYLE[dot.state]} ${ring}`
          const icon = STATE_ICON[dot.state]
          const content = icon ? <i className={icon} aria-hidden="true" /> : null

          return dot.onClick ? (
            <button
              key={dot.key}
              type="button"
              onClick={dot.onClick}
              aria-label={dot.label}
              title={dot.label}
              className={`${className} transition-transform active:translate-y-0.5`}
            >
              {content}
            </button>
          ) : (
            <span key={dot.key} className={className} aria-label={dot.label} title={dot.label}>
              {content}
            </span>
          )
        })}
      </div>
    </div>
  )
}
