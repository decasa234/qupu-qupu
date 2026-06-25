import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  VB_W, VB_H,
  ptA, ptB, ptC, ptD, ptG, ptH, ptI, ptJ, ptK,
  TL, TR,
} from './SegmentCountHK24P2Q18Illustration'
import { buildSegmentCountHK24P2Q18Steps } from './segmentCountHK24P2Q18Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const AMBER  = '#F59E0B'
const BLUE   = '#2563EB'
const GREEN  = '#10B981'
const PURPLE = '#7C3AED'
const ORANGE = '#EA580C'
const GREY   = '#9CA3AF'

const SW      = 4   // overlay stroke-width
const BASE_SW = 2   // faded base stroke-width
const DOT_R   = 4

const ALL_DOTS = [ptA, ptB, ptC, ptD, ptG, ptH, ptI, ptJ, ptK]

export default function SegmentCountHK24P2Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildSegmentCountHK24P2Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EFF6FF', borderColor: BLUE, color: '#1E40AF' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: ada 20 segmen garis dalam gambar'
      : 'Explainer: there are 20 line segments in the figure'

  return (
    <div className="mx-auto w-full max-w-[240px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* ── figure with beat-driven overlays ─────────────────────────────── */}
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          style={{ width: '100%', display: 'block' }}
          aria-hidden="true"
        >
          <rect width={VB_W} height={VB_H} fill="white" />

          {/* base figure — faded during highlight beats */}
          <g opacity={beat.phase === 'intro' ? 1 : 0.22}>
            <g stroke={GREY} strokeWidth={BASE_SW} strokeLinecap="round" strokeLinejoin="round" fill="none">
              <line x1={ptA.x} y1={ptA.y} x2={ptK.x} y2={ptK.y} />
              <line x1={ptC.x} y1={ptC.y} x2={ptD.x} y2={ptD.y} />
              <polyline points={`${TL.x},${TL.y} ${TR.x},${TR.y} ${ptJ.x},${ptJ.y} ${ptH.x},${ptH.y} ${TL.x},${TL.y}`} />
              <line x1={TL.x} y1={TL.y} x2={ptJ.x} y2={ptJ.y} />
              <line x1={TR.x} y1={TR.y} x2={ptH.x} y2={ptH.y} />
              <line x1={ptH.x} y1={ptH.y} x2={ptK.x} y2={ptK.y} />
              <line x1={ptJ.x} y1={ptJ.y} x2={ptK.x} y2={ptK.y} />
            </g>
            <g fill={GREY}>
              {ALL_DOTS.map(({ x, y }, i) => (
                <circle key={i} cx={x} cy={y} r={DOT_R} />
              ))}
            </g>
          </g>

          {/* ── beat overlays ─────────────────────────────────────────────── */}

          {/* vertical: A→K with 5 dots (amber) */}
          <AnimatePresence>
            {beat.showVertical && (
              <motion.g key="vert"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <line
                  x1={ptA.x} y1={ptA.y} x2={ptK.x} y2={ptK.y}
                  stroke={AMBER} strokeWidth={SW} strokeLinecap="round"
                />
                <g fill={AMBER}>
                  {[ptA, ptB, ptG, ptI, ptK].map(({ x, y }, i) => (
                    <circle key={i} cx={x} cy={y} r={DOT_R + 1} />
                  ))}
                </g>
              </motion.g>
            )}
          </AnimatePresence>

          {/* horizontal: C→D with 3 dots (blue) */}
          <AnimatePresence>
            {beat.showHorizontal && (
              <motion.g key="horiz"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <line
                  x1={ptC.x} y1={ptC.y} x2={ptD.x} y2={ptD.y}
                  stroke={BLUE} strokeWidth={SW} strokeLinecap="round"
                />
                <g fill={BLUE}>
                  {[ptC, ptB, ptD].map(({ x, y }, i) => (
                    <circle key={i} cx={x} cy={y} r={DOT_R + 1} />
                  ))}
                </g>
              </motion.g>
            )}
          </AnimatePresence>

          {/* bottom edge: H→J with 3 dots (green) */}
          <AnimatePresence>
            {beat.showBottomEdge && (
              <motion.g key="bot"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <line
                  x1={ptH.x} y1={ptH.y} x2={ptJ.x} y2={ptJ.y}
                  stroke={GREEN} strokeWidth={SW} strokeLinecap="round"
                />
                <g fill={GREEN}>
                  {[ptH, ptI, ptJ].map(({ x, y }, i) => (
                    <circle key={i} cx={x} cy={y} r={DOT_R + 1} />
                  ))}
                </g>
              </motion.g>
            )}
          </AnimatePresence>

          {/* partial diagonals: G-J and G-H (purple) */}
          <AnimatePresence>
            {beat.showDiagonals && (
              <motion.g key="diag"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                stroke={PURPLE} strokeWidth={SW} strokeLinecap="round"
              >
                <line x1={ptG.x} y1={ptG.y} x2={ptJ.x} y2={ptJ.y} />
                <line x1={ptG.x} y1={ptG.y} x2={ptH.x} y2={ptH.y} />
                <g fill={PURPLE} stroke="none">
                  {[ptG, ptH, ptJ].map(({ x, y }, i) => (
                    <circle key={i} cx={x} cy={y} r={DOT_R + 1} />
                  ))}
                </g>
              </motion.g>
            )}
          </AnimatePresence>

          {/* triangle sides: H-K and J-K (orange) */}
          <AnimatePresence>
            {beat.showTriangle && (
              <motion.g key="tri"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                stroke={ORANGE} strokeWidth={SW} strokeLinecap="round"
              >
                <line x1={ptH.x} y1={ptH.y} x2={ptK.x} y2={ptK.y} />
                <line x1={ptJ.x} y1={ptJ.y} x2={ptK.x} y2={ptK.y} />
                <g fill={ORANGE} stroke="none">
                  {[ptH, ptJ, ptK].map(({ x, y }, i) => (
                    <circle key={i} cx={x} cy={y} r={DOT_R + 1} />
                  ))}
                </g>
              </motion.g>
            )}
          </AnimatePresence>

          {/* running count badge */}
          {beat.count > 0 && (
            <text
              x={VB_W - 8}
              y={VB_H - 8}
              textAnchor="end"
              dominantBaseline="auto"
              fontSize={22}
              fontWeight={800}
              fill={isResult ? GREEN : BLUE}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {beat.count}
            </text>
          )}
        </svg>

        {/* equation */}
        {beat.equation && (
          <div className="font-mono text-sm font-bold text-slate-700">{beat.equation}</div>
        )}

        {/* caption */}
        <div
          className="rounded-lg border px-4 py-2 text-sm text-center font-medium"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
