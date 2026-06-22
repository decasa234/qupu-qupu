// IKMC-20-PE-Q13 — post-answer explainer.
// "In which of the following pictures is more of the shape shaded than any of
// the others?"  Answer: B.
//
// Beat-by-beat: reveal each option A→E in turn, show its shaded fraction,
// then highlight B as the winner.
//
// Reuses the Opts13PEOption figure primitive for visual consistency.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Opts13PEOption } from './Opts13PEIllustration'
import { opts13PESteps } from './opts13PESteps'

const GREEN = '#10B981'
const RED   = '#DC2626'
const INK   = '#1F2937'
const BLUE  = '#30598A'

// Shaded fraction labels for each option (used in the verdict overlays)
const FRACS: Record<string, string> = {
  A: '7/9',
  B: '7½/9 ✓',
  C: '< 7½/9',
  D: '7/9',
  E: '7/9',
}

export default function Opts13PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const steps = useMemo(() => opts13PESteps, [])
  const index = useBeatControl(steps.length - 1, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[steps.length - 1]

  const caption = lang === 'id' ? beat.caption_id : beat.caption_en

  const LABELS = ['A', 'B', 'C', 'D', 'E'] as const

  const aria =
    lang === 'id'
      ? 'Gambar B memiliki arsiran terbanyak yaitu 7½ dari 9 sel.'
      : 'Picture B has the most shading: 7½ of 9 cells are grey.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        {/* Row of five option figures */}
        <svg
          viewBox="0 0 480 130"
          width="100%"
          style={{ maxWidth: 480, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {LABELS.map((label, i) => {
            // Reveal order: beat.reveal tells us how many options to show at full opacity.
            // beat.reveal 0 = none highlighted, 1 = A, 2 = A+B, …, 5 = A–E
            const optIdx = i + 1  // 1-indexed to match reveal
            const on = optIdx <= beat.reveal || beat.result
            const isAnswer = label === 'B'
            const verdict = on ? FRACS[label] : ''

            return (
              <g key={label} transform={`translate(${i * 96}, 0)`} opacity={on ? 1 : 0.25}>
                {/* Label */}
                <text
                  x={48}
                  y={14}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={800}
                  fill={INK}
                >
                  {label}
                </text>
                {/* Option figure at (0, 18) */}
                <g transform="translate(0, 18)">
                  <Opts13PEOption choice={{ label, text: `(figure ${label})` }} />
                </g>
                {/* Verdict text */}
                {on && (
                  <text
                    x={48}
                    y={122}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={900}
                    fill={isAnswer ? GREEN : RED}
                  >
                    {verdict}
                  </text>
                )}
                {/* Highlight box on correct answer */}
                {beat.result && isAnswer && (
                  <rect
                    x={2}
                    y={16}
                    width={92}
                    height={100}
                    rx={6}
                    fill="none"
                    stroke={GREEN}
                    strokeWidth={3}
                  />
                )}
              </g>
            )
          })}
        </svg>

        {/* Caption bar */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {caption}
        </div>
      </div>
    </div>
  )
}
