import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SquareRects19B8Figure,
  SVG_W,
  SVG_H,
} from './SquareRects19B8Illustration'
import { buildSquareRects19B8Steps } from './squareRects19B8Steps'

// SEAMO-19-B-Q8 — post-answer animated explainer.
// Reuses SquareRects19B8Figure from the illustration (prop-driven overlays).
//
// Animation beats:
//   0. intro     — static figure with area labels on both squares.
//   1. sides     — show side-length dimension marks (8 cm, 2 cm).
//   2. rect-dim  — highlight 4 rects green; show 6 cm and 2 cm dims; 8−2=6.
//   3. perimeter — 2×(6+2)=16 cm.
//   4. result    — 16 cm → A.

const GREEN = '#10B981'
const BLUE  = '#30598A'
const FIG_W = Math.min(300, SVG_W)

export default function SquareRects19B8Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildSquareRects19B8Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: sisi persegi besar = 8 cm, sisi persegi kecil = 2 cm; panjang persegi panjang = 8−2 = 6 cm, lebar = 2 cm; keliling = 2×(6+2) = 16 cm — jawaban A.'
      : 'Explainer: big square side = 8 cm, small square side = 2 cm; rectangle length = 8−2 = 6 cm, width = 2 cm; perimeter = 2×(6+2) = 16 cm — answer A.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure — prop-driven overlays via SquareRects19B8Figure */}
        <div style={{ width: FIG_W }}>
          <SquareRects19B8Figure
            showAreaLabels={beat.showAreaLabels}
            showSideLabels={beat.showSideLabels}
            highlightRects={beat.highlightRects}
            showRectDims={beat.showRectDims}
          />
        </div>

        {/* equation pill */}
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
                style={{ background: isResult ? GREEN : BLUE }}
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
