import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { SubtractionDiagram, ANSWER } from './SubtractionShapesG2Illustration'
import { buildSubtractionShapesG2Steps } from './subtractionShapesG2Steps'

const GREEN = '#10B981'
const PURPLE = '#341857'

/** Answer options A/B/C/D as drawn in the figure. D = 18 is correct. */
const OPTIONS: { label: 'A' | 'B' | 'C' | 'D'; value: number }[] = [
  { label: 'A', value: 14 },
  { label: 'B', value: 16 },
  { label: 'C', value: 17 },
  { label: 'D', value: ANSWER }, // 18
]

export default function SubtractionShapesG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSubtractionShapesG2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: ○ = 9 dan □ = 9, jadi □ + ○ = 18 — pilihan D.'
      : 'Explainer: ○ = 9 and □ = 9, so □ + ○ = 18 — option D.'

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The column subtraction, with the active column / borrow / reveals. */}
        <SubtractionDiagram
          activeColumn={beat.activeColumn}
          showBorrow={beat.showBorrow}
          revealCircle={beat.revealCircle}
          revealSquare={beat.revealSquare}
        />

        {/* Answer options A B C D. */}
        <svg viewBox="0 0 460 70" width="100%" style={{ maxWidth: 420 }} aria-hidden="true">
          {OPTIONS.map((opt, i) => {
            const cx = 70 + i * 110
            const chosen = beat.highlightOption === opt.label
            return (
              <g key={opt.label}>
                {chosen && <rect x={cx - 44} y={6} width={88} height={56} rx={10} fill="none" stroke={GREEN} strokeWidth={3} />}
                <text x={cx} y={28} fontSize={22} fontWeight={900} textAnchor="middle" dominantBaseline="central" fill={chosen ? '#065F46' : PURPLE}>
                  {opt.value}
                </text>
                <text x={cx} y={52} fontSize={14} fontWeight="bold" textAnchor="middle" fill={chosen ? '#065F46' : PURPLE}>
                  {opt.label}
                </text>
              </g>
            )
          })}
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
