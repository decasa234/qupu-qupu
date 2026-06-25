import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  ABC_CX,
  ABC_CY,
  COLOR,
  OuterTriangle,
  ExtensionLines,
  InnerTriangleABC,
  OuterRegion,
  OuterLabels,
  InnerLabels,
} from './TriOuterX23B11Illustration'
import { buildTriOuterX23B11Steps } from './triOuterX23B11Steps'

// SEAMO-X 2023 Paper B Q11 — animated explainer.
// Reuses the sub-components exported from TriOuterX23B11Illustration.
//
// Beats:
//   0. intro     — full static figure, area 10 cm² visible.
//   1. extend    — extension lines glow amber; midpoint property noted.
//   2. one-flap  — outer △DAF shaded blue; area 20 label.
//   3. all-flaps — all three outer regions shaded; total 60.
//   4. calc      — green inner + all three shaded; equation 10+20+20+20.
//   5. result    — △DEF = 70 cm².

const GREEN = '#10B981'
const BLUE  = COLOR.BLUE

export default function TriOuterX23B11Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTriOuterX23B11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN,  color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,   color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: memperpanjang setiap sisi △ABC menghasilkan △DEF dengan luas 7 × 10 = 70 cm².'
      : 'Explainer: extending each side of △ABC creates △DEF with area 7 × 10 = 70 cm².'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* outer region highlights (rendered below everything else) */}
          {(['daf', 'fce', 'dbe'] as const).map((r) =>
            beat.shadeRegions.includes(r) ? (
              <AnimatePresence key={r}>
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <OuterRegion region={r} />
                </motion.g>
              </AnimatePresence>
            ) : null
          )}

          {/* extension lines — normal grey or highlighted amber */}
          <AnimatePresence initial={false}>
            {beat.highlightExt ? (
              <motion.g
                key="ext-hi"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ExtensionLines color={COLOR.EXT_HI} />
              </motion.g>
            ) : (
              <motion.g
                key="ext-normal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ExtensionLines />
              </motion.g>
            )}
          </AnimatePresence>

          {/* inner triangle — grey or highlighted green */}
          <AnimatePresence initial={false}>
            <motion.g
              key={beat.highlightInner ? 'inner-hi' : 'inner-normal'}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <InnerTriangleABC fill={beat.highlightInner ? COLOR.INNER_FILL_HI : COLOR.INNER_FILL} />
            </motion.g>
          </AnimatePresence>

          {/* outer triangle always on top */}
          <OuterTriangle />
          <OuterLabels />
          <InnerLabels />

          {/* area label inside △ABC */}
          <text
            x={ABC_CX} y={ABC_CY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontWeight={700}
            fill={COLOR.LABEL_INNER}
            fontFamily="ui-sans-serif,system-ui,sans-serif"
          >
            10 cm²
          </text>
        </svg>

        {/* equation badge */}
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
