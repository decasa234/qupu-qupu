// Beat-by-beat explainer for WMI-22P2A-Q23 (colour ring → strip, answer A).
//
// Reuses the ColorRing primitive from P22G2Q23Illustration so the animation
// reads as the same scene. It unrolls the ring's wedge colours into a straight
// strip, shows that any ROTATION of that strip is the same ring while a FLIP is
// not allowed, and lands on option A.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  ColorRing,
  ReadingArrow,
  RingDefs,
  FILL,
  RING_COLORS,
  RING_N,
  RING_CX,
  RING_CY,
} from './P22G2Q23Illustration'
import { buildP22G2Q23Steps } from './p22G2Q23Steps'

const GREEN = '#10B981'
const EDGE = '#1F2937'

const VIEW_W = 230
const VIEW_H = 300

// strip cell geometry (drawn beneath the ring)
const SW = 24
const SH = 24
const STRIP_Y = 244
const STRIP_X0 = (VIEW_W - RING_N * SW) / 2

export default function P22G2Q23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP22G2Q23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: buka cincin jadi pita; rotasi boleh, balik tidak — pita A cocok, jawaban A.'
      : 'Explainer: unroll the ring into a strip; rotation is allowed, flipping is not — strip A matches, answer A.'

  // The reversed strip shown for the "no flipping" note.
  const reversed = [...RING_COLORS].reverse()

  return (
    <div className="mx-auto w-full max-w-[280px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: VIEW_W, display: 'block' }}>
          <RingDefs />
          <g transform={`translate(${VIEW_W / 2 - RING_CX}, 0)`}>
            <ColorRing litUpto={beat.read} dimOthers={beat.read > 0 && beat.read < RING_N} />
            <ReadingArrow />
            {/* small start marker on wedge 0 (top) */}
            {beat.read > 0 && <circle cx={RING_CX} cy={RING_CY - 70} r={4.5} fill="#F0853A" />}
          </g>

          {/* unrolled strip */}
          {beat.showStrip && (
            <g>
              {RING_COLORS.map((c, i) => (
                <rect
                  key={`s${i}`}
                  x={STRIP_X0 + i * SW}
                  y={STRIP_Y}
                  width={SW}
                  height={SH}
                  fill={FILL[c]}
                  stroke={beat.result ? GREEN : EDGE}
                  strokeWidth={beat.result ? 2 : 1.4}
                />
              ))}
              {/* "join ends" loop hint */}
              <path
                d={`M ${STRIP_X0} ${STRIP_Y + SH + 5} q ${RING_N * SW * 0.5} 16 ${RING_N * SW} 0`}
                fill="none"
                stroke="#9CA3AF"
                strokeWidth={1.4}
                strokeDasharray="3,3"
              />
              {beat.result && (
                <text x={VIEW_W / 2} y={STRIP_Y - 8} textAnchor="middle" fontSize={13} fontWeight={900} fill="#065F46">
                  = strip A
                </text>
              )}
            </g>
          )}

          {/* reversed (illegal flip) strip, crossed out */}
          {beat.flipNote && (
            <g>
              {reversed.map((c, i) => (
                <rect
                  key={`r${i}`}
                  x={STRIP_X0 + i * SW}
                  y={STRIP_Y + SH + 24}
                  width={SW}
                  height={SH}
                  fill={FILL[c]}
                  stroke="#DC2626"
                  strokeWidth={1.4}
                  opacity={0.65}
                />
              ))}
              <line
                x1={STRIP_X0 - 4}
                y1={STRIP_Y + SH + 24 + SH / 2}
                x2={STRIP_X0 + RING_N * SW + 4}
                y2={STRIP_Y + SH + 24 + SH / 2}
                stroke="#DC2626"
                strokeWidth={3}
              />
            </g>
          )}
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
