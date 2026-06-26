// SASMO-20-G4-Q2 — Gear-train post-answer explainer.
// Propagates rotation arrows from A through F beat-by-beat, then highlights
// Gear C (answer D: anti-clockwise).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  GEARS,
  VW,
  VH,
  gearPath,
  RotationArrow,
} from './GearTrainSASMO20G4Q2Illustration'
import { buildGearTrainSASMO20G4Q2Steps } from './gearTrainSASMO20G4Q2Steps'

// ── palette ───────────────────────────────────────────────────────────────────
const FILL_BODY   = '#4BBFCF'
const FILL_HI     = '#A7F3D0'   // green highlight fill for gear C
const FILL_DIM    = '#94D8E3'   // dimmed body
const STROKE_GEAR = '#0E6B7C'
const STROKE_DIM  = '#5FA3AF'   // dimmed stroke
const HOLE        = '#E8FAFB'
const COLOR_CCW   = '#3B82F6'   // blue  – anti-clockwise arrow
const COLOR_CW    = '#F97316'   // orange – clockwise arrow
const COLOR_HI    = '#059669'   // green – highlight arrow on C
const BLUE        = '#1D4ED8'
const GREEN       = '#059669'
const SW          = 1.4

// Rotation direction for each gear index (A=CCW, alternating)
const DIR: ('ccw' | 'cw')[] = ['ccw', 'cw', 'ccw', 'cw', 'ccw', 'cw']

function GearBody({
  gIdx, dimmed, highlighted,
}: { gIdx: number; dimmed: boolean; highlighted: boolean }) {
  const g = GEARS[gIdx]
  const fill    = highlighted ? FILL_HI  : dimmed ? FILL_DIM  : FILL_BODY
  const stroke  = highlighted ? '#047857' : dimmed ? STROKE_DIM : STROKE_GEAR
  const hFill   = highlighted ? '#D1FAE5' : HOLE

  return (
    <g opacity={dimmed ? 0.4 : 1}>
      <path d={gearPath(g)} fill={fill} stroke={stroke} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx={g.cx} cy={g.cy} r={g.innerR * 0.92}
        fill={fill} stroke={stroke} strokeWidth={SW * 0.75} />
      <circle cx={g.cx} cy={g.cy} r={g.innerR * 0.60}
        fill="none" stroke={stroke} strokeWidth={SW * 0.65} />
      <circle cx={g.cx} cy={g.cy} r={g.holeR}
        fill={hFill} stroke={stroke} strokeWidth={SW * 0.65} />
    </g>
  )
}

const ARIA_EN = 'Gear-train explainer: rotation directions A through F, answer is Gear C anti-clockwise.'
const ARIA_ID = 'Explainer roda gigi: arah putaran A hingga F, jawaban Roda Gigi C berlawanan jarum jam.'

export default function GearTrainSASMO20G4Q2Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildGearTrainSASMO20G4Q2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const aria = lang === 'id' ? ARIA_ID : ARIA_EN

  return (
    <div className="mx-auto w-full max-w-[640px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          style={{ maxWidth: VW * 2, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {GEARS.map((g, i) => {
            const revealed   = i < beat.revealCount
            const isC        = g.id === 'C'
            const highlighted = beat.highlightC && isC
            const dimmed      = beat.highlightC && !isC

            // Arrow colour for this gear
            let arrowColor = DIR[i] === 'ccw' ? COLOR_CCW : COLOR_CW
            if (highlighted) arrowColor = COLOR_HI

            // Arc radius: midpoint between holeR and innerR
            const arcR = (g.holeR + g.innerR) / 2

            return (
              <g key={g.id}>
                <GearBody gIdx={i} dimmed={dimmed} highlighted={highlighted} />

                {/* Rotation arrow (visible once this gear is revealed) */}
                {revealed && (
                  <g opacity={dimmed ? 0.4 : 1}>
                    <RotationArrow
                      cx={g.cx}
                      cy={g.cy}
                      arcR={arcR}
                      dir={DIR[i]}
                      color={arrowColor}
                    />
                  </g>
                )}

                {/* Gear label */}
                <text
                  x={g.cx}
                  y={g.cy - g.outerR - 5}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  fill={highlighted ? GREEN : dimmed ? '#5FA3AF' : STROKE_GEAR}
                  className="font-display"
                >
                  {g.id}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN,  color: '#064E3B' }
              : { background: '#E0F2FE', borderColor: BLUE,   color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
