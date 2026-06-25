import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  VB_W,
  VB_H,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  I,
  J,
  pts,
} from './LineSegsHK24P1Q18Illustration'
import { buildLineSegsHK24P1Q18Steps } from './lineSegsHK24P1Q18Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const AMBER  = '#F59E0B'
const ORANGE = '#EA580C'
const BLUE   = '#2563EB'
const PURPLE = '#7C3AED'
const GREEN  = '#10B981'
const GREY   = '#9CA3AF'

const SW = 4      // overlay stroke-width
const BASE_SW = 2 // faded base stroke-width

export default function LineSegsHK24P1Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildLineSegsHK24P1Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EFF6FF', borderColor: BLUE, color: '#1E40AF' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: ada 15 segmen garis dalam gambar'
      : 'Explainer: there are 15 line segments in the figure'

  return (
    <div className="mx-auto w-full max-w-[520px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* ── figure with beat-driven overlays ─────────────────────────────── */}
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          style={{ width: '100%', display: 'block' }}
          aria-hidden="true"
        >
          <rect width={VB_W} height={VB_H} fill="white" />

          {/* base figure — faded during highlight beats */}
          <g
            opacity={beat.phase === 'intro' ? 1 : 0.22}
            stroke={GREY}
            strokeWidth={BASE_SW}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <polygon points={pts(A, B, C, D, E)} />
            <line x1={A.x} y1={A.y} x2={D.x} y2={D.y} />
            <line x1={C.x} y1={C.y} x2={E.x} y2={E.y} />
            <polygon points={pts(D, F, G, H, I, J)} />
            <line x1={D.x} y1={D.y} x2={H.x} y2={H.y} />
            <line x1={D.x} y1={D.y} x2={I.x} y2={I.y} />
          </g>

          {/* ── beat overlays ─────────────────────────────────────────────── */}

          {/* left pentagon outer edges */}
          <AnimatePresence>
            {beat.showLeftOuter && (
              <motion.g
                key="left-outer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                stroke={AMBER}
                strokeWidth={SW}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                <polygon points={pts(A, B, C, D, E)} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* left pentagon crossing diagonals */}
          <AnimatePresence>
            {beat.showLeftDiag && (
              <motion.g
                key="left-diag"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                stroke={ORANGE}
                strokeWidth={SW}
                strokeLinecap="round"
              >
                <line x1={A.x} y1={A.y} x2={D.x} y2={D.y} />
                <line x1={C.x} y1={C.y} x2={E.x} y2={E.y} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* right hexagon outer edges */}
          <AnimatePresence>
            {beat.showRightOuter && (
              <motion.g
                key="right-outer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                stroke={BLUE}
                strokeWidth={SW}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                <polygon points={pts(D, F, G, H, I, J)} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* right hexagon internal lines */}
          <AnimatePresence>
            {beat.showRightDiag && (
              <motion.g
                key="right-diag"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                stroke={PURPLE}
                strokeWidth={SW}
                strokeLinecap="round"
              >
                <line x1={D.x} y1={D.y} x2={H.x} y2={H.y} />
                <line x1={D.x} y1={D.y} x2={I.x} y2={I.y} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* running count badge */}
          {beat.count > 0 && (
            <text
              x={VB_W - 14}
              y={VB_H - 12}
              textAnchor="end"
              dominantBaseline="auto"
              fontSize={24}
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
