import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FiveSquares23G3, ANSWER } from './FiveSquares23G3Illustration'
import { buildFiveSquaresSteps } from './fiveSquares23G3Steps'

// WMI-23F3A-Q18 — five squares (sides 2,3,4,5,6) on a baseline, a fan of lines
// from one apex P shading a triangle (base = top edge) inside each square. Find
// the total shaded area (answer 45). The elegant method: each triangle has base
// s and height s (P is on the baseline, the top edge sits s above it), so it is
// exactly HALF its square — independent of where P sits. We spotlight the tallest
// square first (½·6·6 = 18 = half of 36), generalize to all five, add the squares
// 4+9+16+25+36 = 90, and halve: 90 ÷ 2 = 45. Each beat shows the concrete
// arithmetic and reuses the FiveSquares23G3 primitive (highlightIndex + showHalves)
// so the animation reads as the static figure coming alive. The winner lands last
// with hold 0.

const ORANGE = '#f0853a' // fill-qupu-brand-orange — the spotlight accent
const BLUE = '#30598A' // fill-qupu-brand-blue — apex P / generic accent
const GREEN = '#10B981' // verdict green

export default function FiveSquares23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildFiveSquaresSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: P sits on the baseline, so each shaded triangle has base s and height s — exactly half its square. Add the squares 4 + 9 + 16 + 25 + 36 = 90 and halve: the shaded area is ${ANSWER}.`,
    `Penjelasan: P di garis alas, jadi tiap segitiga arsir beralas s dan tinggi s — tepat setengah perseginya. Jumlahkan persegi 4 + 9 + 16 + 25 + 36 = 90 lalu dibagi dua: luas arsir adalah ${ANSWER}.`,
  )

  const accent = beat.result ? GREEN : beat.spotlightSide != null ? ORANGE : BLUE

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* one-line legend: the key idea, always visible */}
        <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-1 text-center font-display text-xs font-bold text-orange-700">
          <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: BLUE }} />
          {t('Each triangle = half its square', 'Tiap segitiga = setengah perseginya')}
        </div>

        {/* the scene, coming alive — spotlight one square, then label all halves */}
        <div className="flex min-h-[7rem] items-center justify-center">
          <FiveSquares23G3 highlightIndex={beat.highlightIndex} showHalves={beat.showHalves} />
        </div>

        {/* arithmetic strip: the concrete number(s) for this beat */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait" initial={false}>
            {beat.spotlightSide != null && (
              <motion.div
                key={`half-${beat.spotlightSide}`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="font-display text-lg font-black tabular-nums"
                style={{ color: ORANGE }}
              >
                {`½·${beat.spotlightSide}·${beat.spotlightSide} = ${(beat.spotlightSide * beat.spotlightSide) / 2}`}
              </motion.div>
            )}
            {beat.spotlightSide == null && beat.sumLine != null && (
              <motion.div
                key={beat.result ? 'final' : 'sum'}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="font-display text-base font-black tabular-nums"
                style={{ color: beat.result ? GREEN : BLUE }}
              >
                {beat.result
                  ? `${story.squaresSum} ÷ 2 = ${ANSWER}`
                  : beat.sumLine}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.spotlightSide != null
                ? { background: '#FFF7ED', borderColor: ORANGE, color: '#9A3412' }
                : { background: '#E1EFFB', borderColor: accent, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
