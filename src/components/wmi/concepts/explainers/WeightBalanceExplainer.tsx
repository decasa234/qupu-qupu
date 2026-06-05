import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildWeightShareSteps } from './weightShareSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

export default function WeightBalanceExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { bottles: number; perBottle: number; sugar: number }
  const story = useMemo(
    () => buildWeightShareSteps(p.bottles, p.perBottle, p.sugar, lang),
    [p.bottles, p.perBottle, p.sugar, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const phase = beat.phase

  // Phase visibility flags
  const showSubtract = phase === 'subtract' || phase === 'share' || phase === 'result'
  const showShare = phase === 'share' || phase === 'result'
  const showResult = phase === 'result'

  const ariaLabel =
    lang === 'id'
      ? `Timbangan berat: ${p.bottles} botol dan gula ${p.sugar} g; tiap botol ${p.perBottle} g.`
      : `Weight balance: ${p.bottles} bottles and sugar ${p.sugar} g; each bottle ${p.perBottle} g.`

  // Proportions for the bar segments
  const sugarFlex = p.sugar
  const bottlesFlex = story.bottlesTotal

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[210px] flex-col items-center justify-center gap-4">

        {/* Total bar */}
        <div className="w-full">
          {/* Label row */}
          <div className="mb-1 flex items-center justify-between">
            <span
              className="font-display text-xs font-extrabold"
              style={{ color: MUTED }}
            >
              {lang === 'id' ? 'Total:' : 'Total:'}
            </span>
            <span
              className="font-display text-xs font-extrabold"
              style={{ color: BLUE }}
            >
              {story.total} g
            </span>
          </div>

          {/* Bar itself */}
          <div
            className="flex w-full overflow-hidden rounded-xl"
            style={{ border: `3px solid ${BLUE}`, height: '3.5rem' }}
          >
            {/* Sugar segment */}
            <div
              className="relative flex items-center justify-center"
              style={{
                flex: sugarFlex,
                backgroundColor: showSubtract ? '#e5e7eb' : PURPLE,
                borderRight: `2px solid ${BLUE}`,
                transition: 'background-color 0.4s ease',
              }}
            >
              {!showSubtract && (
                <motion.span
                  key="sugar-label-active"
                  className="font-display text-xs font-extrabold"
                  style={{ color: '#fff' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {lang === 'id' ? 'Gula' : 'Sugar'}
                </motion.span>
              )}
              {showSubtract && (
                <motion.span
                  key="sugar-label-muted"
                  className="font-display text-xs font-extrabold"
                  style={{ color: MUTED }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {p.sugar} g
                </motion.span>
              )}
            </div>

            {/* Bottles segment */}
            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden"
              style={{ flex: bottlesFlex }}
            >
              {!showShare ? (
                /* Solid blue bottles block */
                <motion.div
                  key="bottles-solid"
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: BLUE }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span
                    className="font-display text-xs font-extrabold"
                    style={{ color: '#fff' }}
                  >
                    {p.bottles} {lang === 'id' ? 'botol' : 'bottles'}
                  </span>
                </motion.div>
              ) : (
                /* Split into individual bottle cells */
                <motion.div
                  key="bottles-split"
                  className="absolute inset-0 flex"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {Array.from({ length: p.bottles }, (_, i) => (
                    <div
                      key={i}
                      className="relative flex flex-1 items-center justify-center"
                      style={{
                        backgroundColor: ORANGE,
                        borderRight: i < p.bottles - 1 ? `2px solid #fff` : undefined,
                      }}
                    >
                      <motion.span
                        className="font-display text-xs font-extrabold"
                        style={{ color: '#fff' }}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 26,
                          delay: i * 0.07,
                        }}
                      >
                        {showResult ? `${p.perBottle}g` : `?`}
                      </motion.span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Arithmetic display */}
        {showSubtract && (
          <motion.div
            key={`arith-${phase}`}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          >
            {showShare ? (
              /* Division equation */
              <>
                <span
                  className="font-display text-xl font-extrabold"
                  style={{ color: BLUE }}
                >
                  {story.bottlesTotal}
                </span>
                <span className="font-display text-xl font-extrabold" style={{ color: MUTED }}>
                  ÷
                </span>
                <span
                  className="font-display text-xl font-extrabold"
                  style={{ color: BLUE }}
                >
                  {p.bottles}
                </span>
                <span className="font-display text-xl font-extrabold" style={{ color: MUTED }}>
                  =
                </span>
                <motion.span
                  key={`result-val-${showResult}`}
                  className="font-display text-xl font-extrabold"
                  style={{ color: showResult ? GREEN : MUTED }}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                >
                  {showResult ? `${p.perBottle} g` : '?'}
                </motion.span>
              </>
            ) : (
              /* Subtraction equation */
              <>
                <span
                  className="font-display text-xl font-extrabold"
                  style={{ color: BLUE }}
                >
                  {story.total}
                </span>
                <span className="font-display text-xl font-extrabold" style={{ color: MUTED }}>
                  −
                </span>
                <span
                  className="font-display text-xl font-extrabold"
                  style={{ color: PURPLE }}
                >
                  {p.sugar}
                </span>
                <span className="font-display text-xl font-extrabold" style={{ color: MUTED }}>
                  =
                </span>
                <span
                  className="font-display text-xl font-extrabold"
                  style={{ color: BLUE }}
                >
                  {story.bottlesTotal} g
                </span>
              </>
            )}
          </motion.div>
        )}

        {/* Caption */}
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
