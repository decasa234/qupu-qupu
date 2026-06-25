import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  D,
  COLOR,
  OuterTriangle,
  Cevians,
  InnerTriangleDEF,
  OuterLabels,
  InnerLabels,
} from './CevianX22B11Illustration'
import { buildCevianX22B11Steps } from './cevianX22B11Steps'

// SEAMO-X 2022 Paper B Q11 — animated explainer.
// Reuses the sub-components exported from CevianX22B11Illustration.
//
// Beats:
//   0. intro    — show the full static figure.
//   1. cevians  — highlight the three cevians in amber.
//   2. inner    — also highlight the inner triangle DEF in green.
//   3. calc     — fade cevians, keep green DEF, show ratio badge + equation.
//   4. result   — △DEF = 3 cm² (green).

const GREEN  = '#10B981'
const BLUE   = COLOR.BLUE

export default function CevianX22B11Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCevianX22B11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN,  color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE,   color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tiga garis cevian dengan perbandingan 2:1 membentuk segitiga dalam DEF seluas 1/7 × 21 = 3 cm².'
      : 'Explainer: three 2:1 cevians form inner triangle DEF with area = 1/7 × 21 = 3 cm².'

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

          {/* cevians — normal grey or highlighted amber */}
          <AnimatePresence initial={false}>
            {beat.highlightCevians ? (
              <motion.g
                key="cevians-hi"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Cevians color={COLOR.CEVIAN_HI} />
              </motion.g>
            ) : (
              <motion.g
                key="cevians-normal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Cevians />
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
              <InnerTriangleDEF fill={beat.highlightInner ? COLOR.INNER_FILL_HI : COLOR.INNER_FILL} />
            </motion.g>
          </AnimatePresence>

          {/* outer triangle always on top of inner fill */}
          <OuterTriangle />
          <OuterLabels />
          <InnerLabels />

          {/* ratio badge ¹⁄₇ near the inner triangle centroid */}
          <AnimatePresence>
            {beat.showRatio && (
              <motion.g
                key="ratio"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              >
                {/* centroid of DEF ≈ (150, 169) */}
                <circle cx={150} cy={169} r={18} fill={isResult ? GREEN : BLUE} />
                <text
                  x={150}
                  y={169}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={11}
                  fontWeight={900}
                  fill="white"
                  fontFamily="ui-sans-serif,system-ui,sans-serif"
                >
                  ¹⁄₇
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation */}
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
