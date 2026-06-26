// ShadedSquareSIMOC19G4Q17Explainer — SIMOC-19-G4-Q17
//
// Post-answer animated explainer.
// Beats:
//   0. intro    — bare figure, no colour
//   1. region1  — amber fill on quad L-H-D-G (+30 cm² label)
//   2. region2  — green fill on △L-F-E (+18 cm² label)
//   3. region3  — blue fill on △L-J-K (+12 cm² label)
//   4. total    — all regions lit, result = 60 cm²

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  VB,
  SCALE,
  PT,
  FAN_TARGETS,
  REGION1,
  REGION2,
  REGION3,
} from './ShadedSquareSIMOC19G4Q17Illustration'
import { buildShadedSquareSIMOC19G4Q17Steps } from './shadedSquareSIMOC19G4Q17Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const AMBER  = '#F59E0B'
const GREEN  = '#10B981'
const BLUE   = '#3B82F6'
const RESULT = '#065F46'
const INK    = '#1E293B'
const FONT   = 'system-ui, sans-serif'

// ── component ─────────────────────────────────────────────────────────────────

export default function ShadedSquareSIMOC19G4Q17Explainer(props: ExplainerProps) {
  const lang   = props.lang ?? 'id'
  const story  = useMemo(() => buildShadedSquareSIMOC19G4Q17Steps(lang), [lang])
  const index  = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map(s => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = lang === 'id'
    ? 'Penjelasan: tiga daerah diarsir berjumlah 60 cm².'
    : 'Explainer: three shaded regions sum to 60 cm².'

  const { A, B, C, D, H, I, G, F, E, J, K, L } = PT
  const dots: [number, number][] = [H, I, G, F, E, J, K, L]

  type Anchor = 'start' | 'middle' | 'end'
  const labels: Array<{ t: string; x: number; y: number; a: Anchor }> = [
    { t: 'D', x: D[0] - 6,  y: D[1] - 5,  a: 'end'    },
    { t: 'G', x: G[0],      y: G[1] - 9,  a: 'middle' },
    { t: 'F', x: F[0],      y: F[1] - 9,  a: 'middle' },
    { t: 'E', x: E[0],      y: E[1] - 9,  a: 'middle' },
    { t: 'C', x: C[0] + 6,  y: C[1] - 5,  a: 'start'  },
    { t: 'H', x: H[0] - 8,  y: H[1] + 5,  a: 'end'    },
    { t: 'I', x: I[0] - 8,  y: I[1] + 5,  a: 'end'    },
    { t: 'J', x: J[0] + 8,  y: J[1] + 5,  a: 'start'  },
    { t: 'K', x: K[0] + 8,  y: K[1] + 5,  a: 'start'  },
    { t: 'A', x: A[0] - 6,  y: A[1] + 13, a: 'end'    },
    { t: 'L', x: L[0],      y: L[1] + 14, a: 'middle' },
    { t: 'B', x: B[0] + 6,  y: B[1] + 13, a: 'start'  },
  ]

  // Centroid label positions for area annotations (SVG px)
  const R1_LBL: [number, number] = [88, 155]  // inside quad L-H-D-G
  const R2_LBL: [number, number] = [220, 148] // inside △L-F-E
  const R3_LBL: [number, number] = [288, 238] // inside △L-J-K

  const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } }

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Figure SVG */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <svg
            viewBox={`0 0 ${VB} ${VB}`}
            style={{ display: 'block', width: '100%', height: 'auto' }}
          >
            {/* Colour overlays — appear beat by beat */}
            {beat.showR1 && (
              <motion.polygon key="r1" points={REGION1}
                fill={AMBER} fillOpacity={0.45} {...fade} />
            )}
            {beat.showR2 && (
              <motion.polygon key="r2" points={REGION2}
                fill={GREEN} fillOpacity={0.45} {...fade} />
            )}
            {beat.showR3 && (
              <motion.polygon key="r3" points={REGION3}
                fill={BLUE} fillOpacity={0.45} {...fade} />
            )}

            {/* Square border */}
            <rect
              x={D[0]} y={D[1]}
              width={12 * SCALE} height={12 * SCALE}
              fill="none" stroke={INK} strokeWidth={2}
            />

            {/* Fan lines */}
            {FAN_TARGETS.map(([tx, ty], i) => (
              <line key={i}
                x1={L[0]} y1={L[1]} x2={tx} y2={ty}
                stroke={INK} strokeWidth={1} strokeOpacity={0.45}
              />
            ))}

            {/* Division dots */}
            {dots.map(([dx, dy], i) => (
              <circle key={i} cx={dx} cy={dy} r={3.5} fill={INK} />
            ))}

            {/* Point labels */}
            {labels.map(({ t, x, y, a }, i) => (
              <text key={i} x={x} y={y}
                fontSize={12} fontWeight="700" fontFamily={FONT}
                fill={INK} textAnchor={a}
              >
                {t}
              </text>
            ))}

            {/* Area annotations inside each region */}
            {beat.showR1 && (
              <motion.text key="lbl1"
                x={R1_LBL[0]} y={R1_LBL[1]}
                fontSize={13} fontWeight="800" fontFamily={FONT}
                fill={AMBER} textAnchor="middle"
                {...fade}
              >
                30
              </motion.text>
            )}
            {beat.showR2 && (
              <motion.text key="lbl2"
                x={R2_LBL[0]} y={R2_LBL[1]}
                fontSize={13} fontWeight="800" fontFamily={FONT}
                fill={GREEN} textAnchor="middle"
                {...fade}
              >
                18
              </motion.text>
            )}
            {beat.showR3 && (
              <motion.text key="lbl3"
                x={R3_LBL[0]} y={R3_LBL[1]}
                fontSize={13} fontWeight="800" fontFamily={FONT}
                fill={BLUE} textAnchor="middle"
                {...fade}
              >
                12
              </motion.text>
            )}
          </svg>
        </div>

        {/* Result badge */}
        {beat.result && (
          <motion.div
            key="result"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: RESULT }}
          >
            60 cm²
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: RESULT }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
