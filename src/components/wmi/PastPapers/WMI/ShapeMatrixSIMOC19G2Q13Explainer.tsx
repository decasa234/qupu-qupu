// Post-answer explainer for SIMOC-19-G2-Q13.
// "What is x in the 3×3 shape matrix?" — answer: X alone.
//
// Animation strategy:
//   intro        — full grid shown; prompt to find the pattern
//   row_pattern  — bottom-row cells [2,0] and [2,1] highlighted amber; caption about stripping
//   col_pattern  — right-column cells [0,2] and [1,2] highlighted amber
//   answer       — [2,2] highlighted green; reveals x = × alone

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  ShapeMatrixGrid,
  CELL,
  PAD,
} from './ShapeMatrixSIMOC19G2Q13Illustration'
import { buildShapeMatrixSIMOC19G2Q13Steps } from './shapeMatrixSIMOC19G2Q13Steps'

const AMBER_COLOR  = '#FEF3C7'
const AMBER_BORDER = '#D97706'
const GREEN_COLOR  = '#D1FAE5'
const GREEN_BORDER = '#059669'

export default function ShapeMatrixSIMOC19G2Q13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildShapeMatrixSIMOC19G2Q13Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map(s => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const hlColor  = beat.result ? GREEN_COLOR  : AMBER_COLOR
  const hlBorder = beat.result ? GREEN_BORDER : AMBER_BORDER

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: matriks bentuk 3×3 — baris dan kolom melepas lapisan luar; x = × saja.'
      : 'Explainer: 3×3 shape matrix — rows and columns strip outer layers; x = × alone.'

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Grid with highlighted cells */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <ShapeMatrixGrid
            highlight={
              beat.highlights.length > 0
                ? { cells: beat.highlights, color: hlColor, borderColor: hlBorder }
                : undefined
            }
          />
        </div>

        {/* Answer badge (only on final beat) */}
        {beat.result && (
          <motion.div
            key="answer-badge"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          >
            <svg viewBox="0 0 80 80" width={64} height={64}>
              <line x1={16} y1={16} x2={64} y2={64} stroke={GREEN_BORDER} strokeWidth={5} strokeLinecap="round" />
              <line x1={64} y1={16} x2={16} y2={64} stroke={GREEN_BORDER} strokeWidth={5} strokeLinecap="round" />
            </svg>
          </motion.div>
        )}

        {/* Caption */}
        <motion.div
          key={`caption-${beat.phase}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_COLOR, borderColor: GREEN_BORDER, color: '#065F46' }
              : { background: AMBER_COLOR, borderColor: AMBER_BORDER, color: '#92400E' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
