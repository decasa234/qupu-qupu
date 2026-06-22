/**
 * IKMC-21-EC-Q4 — post-answer explainer for "Alaya's sun" visual-matching question.
 *
 * Reuses FullSun, SunFace, SVG_W, SVG_H, CX, CY, R from Sun4ECIllustration.
 *
 * Animation beats:
 *   0. intro      — show the sun; state the task.
 *   1. scan-rays  — glow ring highlights all rays; label "~13 rays, evenly spaced".
 *   2. test-b     — overlay option B fan (3 even rays) on a matching section of the sun.
 *   3. result     — confirm answer B in green.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  FullSun,
  SVG_W,
  SVG_H,
  CX,
  CY,
  R,
} from './Sun4ECIllustration'
import { buildSun4ECSteps } from './sun4ECSteps'

const GREEN = '#10B981'
const BLUE = '#2563EB'
const AMBER = '#B45309'

// ── B-overlay: 3 even rays overlaid on the sun at ~0°, 26°, 51° (top-right section) ──

const UP = 270   // "up" in SVG degrees
const B_ANGLES = [UP - 26, UP, UP + 26]   // match 3 neighbouring rays of the sun
const B_BASE_R = R + 4
const B_TIP_R  = 88
const B_HALF_W = 6.5
const B_STROKE = '#10B981'    // green overlay to show the matching section

function toRad(d: number) { return (d * Math.PI) / 180 }

function BRayOverlay({ angleDeg }: { angleDeg: number }) {
  const ang = toRad(angleDeg)
  const dL  = toRad(angleDeg - B_HALF_W)
  const dR  = toRad(angleDeg + B_HALF_W)

  const tipX  = CX + B_TIP_R  * Math.cos(ang)
  const tipY  = CY + B_TIP_R  * Math.sin(ang)
  const blX   = CX + B_BASE_R * Math.cos(dL)
  const blY   = CY + B_BASE_R * Math.sin(dL)
  const brX   = CX + B_BASE_R * Math.cos(dR)
  const brY   = CY + B_BASE_R * Math.sin(dR)

  return (
    <polygon
      points={`${tipX},${tipY} ${blX},${blY} ${brX},${brY}`}
      fill={B_STROKE + '40'}  // semi-transparent green fill
      stroke={B_STROKE}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function Sun4ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildSun4ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: '#1E40AF' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Matahari Alaya memiliki ~13 sinar runcing. Pilihan B menunjukkan 3 sinar dalam kipas rata yang persis cocok dengan bagian matahari. Jawaban B.'
      : "Explainer: Alaya's sun has ~13 spiky rays. Option B shows 3 rays in an even fan that exactly fits a section of the sun. Answer B."

  const FIG_W = Math.min(240, SVG_W)

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* full sun (with optional ray-ring highlight) */}
          <FullSun cx={CX} cy={CY} r={R} highlightRays={beat.highlightRays} />

          {/* option B overlay — three green-tinted rays on a matching section */}
          <AnimatePresence>
            {beat.showBOverlay && (
              <motion.g
                key="b-overlay"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                {B_ANGLES.map((ang, i) => (
                  <BRayOverlay key={i} angleDeg={ang} />
                ))}
                {/* bracket/label "B" over the matching section */}
                <text
                  x={CX + 94 * Math.cos(toRad(UP)) - 10}
                  y={CY + 94 * Math.sin(toRad(UP)) - 6}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                  fontWeight={900}
                  fill={B_STROKE}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  B
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* result badge */}
          <AnimatePresence>
            {beat.showResult && (
              <motion.g
                key="result-badge"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              >
                <rect
                  x={CX - 34}
                  y={CY - 14}
                  width={68}
                  height={28}
                  rx={14}
                  fill={GREEN}
                />
                <text
                  x={CX}
                  y={CY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                  fontWeight={900}
                  fill="white"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {lang === 'id' ? 'Jawaban B' : 'Answer B'}
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : AMBER }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
