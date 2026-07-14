import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildFractionRegionSteps } from './fractionRegionSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'
const SHELL = '#f6f1e7'

export default function FractionRegionExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { parts: number; shaded: number }
  const story = useMemo(
    () => buildFractionRegionSteps(p.parts, p.shaded, lang),
    [p.parts, p.shaded, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const phase = beat.phase
  const showShading = phase === 'shade' || phase === 'count' || phase === 'result'
  const showMarks = phase === 'count' || phase === 'result'
  const showResult = phase === 'result'

  const ariaLabel =
    lang === 'id'
      ? `Batang dibagi ${p.parts} bagian; ${p.shaded} diarsir, ${story.answer} tidak diarsir.`
      : `Bar divided into ${p.parts} parts; ${p.shaded} shaded, ${story.answer} unshaded.`

  let markCounter = 0

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[12.5rem] flex-col items-center justify-center gap-4">
        {/* Bar */}
        <div
          className="flex w-full overflow-hidden rounded-xl"
          style={{ border: `3px solid ${BLUE}` }}
        >
          {Array.from({ length: p.parts }, (_, i) => {
            const isShaded = i < p.shaded
            const isUnshaded = !isShaded

            // Increment the counter for unshaded cells (for marking 1, 2, 3…)
            if (isUnshaded) markCounter += 1
            const markNumber = markCounter

            return (
              <div
                key={i}
                className="relative flex flex-1 items-center justify-center"
                style={{
                  height: '4rem',
                  borderRight: i < p.parts - 1 ? `2px solid ${BLUE}` : undefined,
                  backgroundColor: isShaded && showShading ? ORANGE : SHELL,
                  transition: 'background-color 0.3s ease',
                }}
              >
                {/* Shading entrance animation overlay */}
                {isShaded && showShading && (
                  <motion.div
                    key={`shade-${i}`}
                    className="absolute inset-0"
                    style={{ backgroundColor: ORANGE }}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28, delay: i * 0.06 }}
                  />
                )}

                {/* Unshaded mark (✓ number) */}
                {isUnshaded && showMarks && (
                  <motion.span
                    key={`mark-${i}-${phase}`}
                    className="relative z-10 font-display text-sm font-extrabold"
                    style={{ color: PURPLE }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 26,
                      delay: (i - p.shaded) * 0.1,
                    }}
                  >
                    {markNumber}
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>

        {/* Counter row */}
        {showMarks && (
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-extrabold" style={{ color: MUTED }}>
              {lang === 'id' ? 'Tidak diarsir:' : 'Unshaded:'}
            </span>
            <motion.span
              key={`counter-${phase}`}
              className="font-display text-2xl font-extrabold"
              style={{ color: showResult ? GREEN : PURPLE }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            >
              {story.answer}
            </motion.span>
            {showResult && (
              <motion.span
                key="eq-result"
                className="font-display text-2xl font-extrabold"
                style={{ color: GREEN }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 26, delay: 0.15 }}
              >
                = {story.answer}
              </motion.span>
            )}
          </div>
        )}

        {/* Result equation */}
        {showResult && (
          <motion.div
            key="result-eq"
            className="font-display text-3xl font-extrabold"
            style={{ color: GREEN }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
          >
            {p.parts} − {p.shaded} = {story.answer}
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
