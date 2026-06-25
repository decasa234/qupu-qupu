// HKIMO-25-P2H-Q19 — animated explainer.
//
// Beats (see polygonCountHK25P2Q19Steps.ts):
//   0 intro  — full polygon, no highlights, count hidden.
//   1 first  — dots on vertices 0–2; counter shows 3.
//   2 all    — dots on all 6 vertices; counter shows 6.
//   3 result — same as all, counter enlarged + green.

import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { VERTICES, SVG_W, SVG_H } from './PolygonCountHK25P2Q19Illustration'
import { buildPolygonCountHK25P2Q19Steps } from './polygonCountHK25P2Q19Steps'

const INK = '#1F2937'
const FILL = '#EFF6FF'
const DOT_R = 5.5
const COL_DOT_A = '#F59E0B' // amber — first group (0–2)
const COL_DOT_B = '#10B981' // green — second group (3–5)

export default function PolygonCountHK25P2Q19Explainer({
  lang = 'id',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const beats = buildPolygonCountHK25P2Q19Steps(lang)

  const beatIndex = useBeatControl(beats.length - 1, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    stepMs: 1800,
  })

  const beat = beats[beatIndex]
  const hiSet = new Set(beat.highlighted)

  return (
    <div style={{ textAlign: 'center', userSelect: 'none' }}>
      {/* Polygon + vertex dots */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <polygon
          points={VERTICES.map(([x, y]) => `${x},${y}`).join(' ')}
          fill={FILL}
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
        {VERTICES.map(([x, y], i) =>
          hiSet.has(i) ? (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={DOT_R}
              fill={i <= 2 ? COL_DOT_A : COL_DOT_B}
              stroke="#fff"
              strokeWidth={1.5}
            />
          ) : null,
        )}
      </svg>

      {/* Counter */}
      <div
        style={{
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 4,
        }}
      >
        <AnimatePresence mode="wait">
          {beat.count >= 0 && (
            <motion.div
              key={beat.count}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                fontSize: beat.phase === 'result' ? 48 : 36,
                fontWeight: 700,
                color: beat.phase === 'result' ? '#10B981' : '#1F2937',
                lineHeight: 1,
              }}
            >
              {beat.count}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.p
          key={beat.phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          style={{
            margin: '6px auto 0',
            maxWidth: 320,
            fontSize: 14,
            color: '#4B5563',
            lineHeight: 1.4,
          }}
        >
          {beat.caption[lang]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
