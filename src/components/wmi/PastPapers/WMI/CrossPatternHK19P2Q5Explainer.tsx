// CrossPatternHK19P2Q5Explainer.tsx — HKIMO-19-P2H-Q5
//
// Beat-by-beat animation for the growing plus/cross pattern.
// Beats: show groups → count each group → show +4 diffs → reveal formula → substitute n=12 → result.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CrossShape,
  groupX,
  groupDim,
  CENTER_Y,
  LABEL_Y,
  SVG_W,
  SVG_H,
} from './CrossPatternHK19P2Q5Illustration'
import {
  buildCrossPatternHK19P2Q5Steps,
  COUNTS_BY_N,
} from './crossPatternHK19P2Q5Steps'

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------
const INK       = '#1F2937'
const FILL_HL   = '#FEF9C3'   // amber tint — cells when counts are shown
const FILL_BASE = '#EFF6FF'   // default cell fill
const BLUE      = '#1D4ED8'
const GREEN     = '#059669'
const AMBER_TXT = '#92400E'

// ---------------------------------------------------------------------------
// Derived positions
// ---------------------------------------------------------------------------

/** SVG x-centre of group n's bounding box. */
function groupCX(n: number): number {
  return groupX(n) + groupDim(n) / 2
}

/** X midpoint between group n and group n+1 (for "+4" label). */
function midCX(n: number): number {
  return (groupCX(n) + groupCX(n + 1)) / 2
}

// Extra SVG height to show count-badge row below the group-name labels.
const BADGE_Y    = LABEL_Y + 20      // y-centre of count badge circles
const EXPL_SVG_H = SVG_H + 36       // extends SVG_H to fit badge row

const LABELS_EN = ['1st Group', '2nd Group', '3rd Group', '4th Group']
const LABELS_ID = ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4']

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function CrossPatternHK19P2Q5Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildCrossPatternHK19P2Q5Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const labels = lang === 'id' ? LABELS_ID : LABELS_EN
  const cellFill = beat.showCounts ? FILL_HL : FILL_BASE

  return (
    <div
      className="mx-auto w-full max-w-[480px]"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Penjelasan: pola plus/silang → 1, 5, 9, 13 (beda +4) → rumus 4n−3 → kelompok 12 = 45.'
          : 'Explainer: plus/cross pattern → 1, 5, 9, 13 (diff +4) → formula 4n−3 → group 12 = 45.'
      }
    >
      <div className="flex flex-col items-center gap-2">

        {/* SVG: cross groups + count badges + diff labels */}
        <svg viewBox={`0 0 ${SVG_W} ${EXPL_SVG_H}`} width="100%">

          {/* Cross groups */}
          {[1, 2, 3, 4].map((n) => {
            const dim = groupDim(n)
            const xOff = groupX(n)
            const yOff = CENTER_Y - dim / 2
            return (
              <g key={n}>
                <CrossShape n={n} xOff={xOff} yOff={yOff} fill={cellFill} />
                <text
                  x={xOff + dim / 2}
                  y={LABEL_Y + 12}
                  textAnchor="middle"
                  fontSize={11}
                  fill={INK}
                  fontFamily="system-ui, sans-serif"
                >
                  {labels[n - 1]}
                </text>
              </g>
            )
          })}

          {/* Count badges (showCounts) */}
          {beat.showCounts &&
            [1, 2, 3, 4].map((n) => {
              const count = COUNTS_BY_N[n - 1]
              const cx = groupCX(n)
              return (
                <g key={n}>
                  <circle cx={cx} cy={BADGE_Y} r={12} fill={BLUE} />
                  <text
                    x={cx}
                    y={BADGE_Y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fill="white"
                    fontWeight="bold"
                    fontFamily="system-ui, sans-serif"
                  >
                    {count}
                  </text>
                </g>
              )
            })}

          {/* "+4" diff labels (showDiffs) */}
          {beat.showDiffs &&
            [1, 2, 3].map((n) => (
              <text
                key={n}
                x={midCX(n)}
                y={BADGE_Y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fill={AMBER_TXT}
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
              >
                +4
              </text>
            ))}
        </svg>

        {/* Formula banner (showFormula) */}
        {beat.showFormula && (
          <div
            className="rounded-lg border-2 px-4 py-1 text-sm font-bold"
            style={{ borderColor: BLUE, background: '#EFF6FF', color: BLUE }}
          >
            {lang === 'id' ? 'Rumus: 4n − 3' : 'Formula: 4n − 3'}
          </div>
        )}

        {/* Target substitution (showTarget) */}
        {beat.showTarget && (
          <div
            className="rounded-lg border-2 px-4 py-1 text-sm font-bold"
            style={{ borderColor: GREEN, background: '#D1FAE5', color: '#065F46' }}
          >
            {lang === 'id'
              ? 'n = 12 → 4 × 12 − 3 = 48 − 3 = 45'
              : 'n = 12 → 4 × 12 − 3 = 48 − 3 = 45'}
          </div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
