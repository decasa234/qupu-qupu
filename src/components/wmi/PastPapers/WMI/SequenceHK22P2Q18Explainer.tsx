// HKIMO 2022 Heat Primary-2 Q18 — animated explainer
// Three-beat animation: identify ▲-runs → extend to run 5 → reveal ? = ▲

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SEQUENCE,
  TRI_GROUPS,
  QUESTION_IDX,
} from './SequenceHK22P2Q18Illustration'
import { buildSequenceHK22P2Q18Steps } from './sequenceHK22P2Q18Steps'

// ── colours ──────────────────────────────────────────────────────────────────

const INK   = '#1F2937'
const BLUE  = '#30598A'
const AMBER = '#F59E0B'
const GREEN = '#10B981'
const GOLD  = '#D97706'

// ── geometry (matches Illustration constants) ─────────────────────────────────

const VIEW_W = 512
const VIEW_H = 100
const ROW_Y  = 44
const X0     = 12
const STEP   = 21
const R      = 8
const TH     = 9

const BR_Y0  = ROW_Y + 14
const BR_Y1  = ROW_Y + 22
const LBL_Y  = ROW_Y + 34

function cx(i: number) { return X0 + i * STEP }

// ── component ─────────────────────────────────────────────────────────────────

export default function SequenceHK22P2Q18Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildSequenceHK22P2Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria =
    lang === 'id'
      ? 'Penjelasan: kelompok segitiga bertambah 1, 2, 3, 4, 5 — jadi ? = ▲.'
      : 'Explainer: triangle runs grow 1, 2, 3, 4, 5 — so ? = ▲.'

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* sequence symbols */}
          {SEQUENCE.map((sym, i) => {
            const x = cx(i)
            const highlighted = beat.highlightIdx.includes(i)
            const dimmed =
              beat.highlightIdx.length > 0 && !highlighted && i !== QUESTION_IDX
            const opacity = dimmed ? 0.3 : 1

            if (i === QUESTION_IDX) {
              if (beat.revealAnswer) {
                return (
                  <polygon
                    key={i}
                    points={`${x},${ROW_Y - TH} ${x - R},${ROW_Y + TH - 2} ${x + R},${ROW_Y + TH - 2}`}
                    fill={GREEN}
                  />
                )
              }
              return (
                <g key={i}>
                  <rect
                    x={x - R - 1} y={ROW_Y - TH - 1}
                    width={(R + 1) * 2} height={(TH + 1) * 2}
                    rx={3} fill={highlighted ? 'rgba(245,158,11,0.15)' : 'none'}
                    stroke={AMBER} strokeWidth={1.8} strokeDasharray="4 3"
                  />
                  <text
                    x={x} y={ROW_Y + 1}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={13} fontWeight={900} fill={AMBER}
                  >?</text>
                </g>
              )
            }

            if (sym === '●') {
              return (
                <circle
                  key={i} cx={x} cy={ROW_Y} r={R}
                  fill={highlighted ? BLUE : INK}
                  opacity={opacity}
                />
              )
            }

            // '▲'
            return (
              <polygon
                key={i}
                points={`${x},${ROW_Y - TH} ${x - R},${ROW_Y + TH - 2} ${x + R},${ROW_Y + TH - 2}`}
                fill={highlighted ? BLUE : INK}
                opacity={opacity}
              />
            )
          })}

          {/* … */}
          <text
            x={cx(SEQUENCE.length) + 2} y={ROW_Y + 2}
            textAnchor="start" fontSize={10} fill={INK}
          >…</text>

          {/* triangle-run brackets */}
          {beat.showGroups.map((gi) => {
            const g   = TRI_GROUPS[gi]
            const x0  = cx(g.start) - R - 2
            const x1  = cx(g.end)   + R + 2
            const mid = (x0 + x1) / 2
            const isLast = gi === TRI_GROUPS.length - 1
            const col = isLast ? GOLD : BLUE
            return (
              <g key={gi}>
                <path
                  d={`M${x0} ${BR_Y0} v${BR_Y1 - BR_Y0} h${x1 - x0} v${-(BR_Y1 - BR_Y0)}`}
                  fill="none" stroke={col} strokeWidth={1.5}
                />
                <text
                  x={mid} y={LBL_Y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={9} fontWeight={800} fill={col}
                >{gi + 1}▲</text>
              </g>
            )
          })}
        </svg>

        {/* caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
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
