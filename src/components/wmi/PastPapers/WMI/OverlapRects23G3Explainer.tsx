import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { OverlapRects23G3 } from './OverlapRects23G3Illustration'
import { buildOverlapRectsSteps, ANSWER, ANSWER_CHOICE } from './overlapRects23G3Steps'

// WMI-23F3A-Q4 (2023 Grade 3 Final) — two identical rectangles overlap in a
// square; find the perimeter of the whole figure. Answer: E = 312.
//
// The animation deduces it beat by beat, with concrete arithmetic every step:
//   1. goal — trace the outline once;
//   2. one rectangle is 56 × 42 → its perimeter 2·(56+42) = 196;
//   3. reveal/shade the overlap square, derive its side 56 − 36 = 20;
//   4. two rectangles = 2 × 196 = 392 of edge;
//   5. overlapping buries 4 square-sides 4 × 20 = 80 → 392 − 80 = 312;
//   6. land on 312 (choice E).
//
// The figure is the illustrator's OverlapRects23G3 primitive coming alive:
// `showSquare` shades the central overlap square, `showDims` surfaces the
// derived 20 / edge labels. The arithmetic ledger below the figure carries the
// number work so kids see the method, not just the result. Deterministic &
// SSR-safe — a pure render of `buildOverlapRectsSteps(lang)`.

const GREEN = '#10B981' // fill-qupu-green accent (the winning verdict)
const BLUE = '#30598A' // fill-qupu-blue (working captions)
const ORANGE = '#f0853a' // fill-qupu-orange (the live arithmetic line)

export default function OverlapRects23G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildOverlapRectsSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: each rectangle is 56 by 42 so its perimeter is 196; the overlap square has side 56 − 36 = 20; two rectangles give 2 × 196 = 392, minus the 4 buried square sides 4 × 20 = 80, so the figure's perimeter is ${ANSWER}, choice ${ANSWER_CHOICE}.`,
    `Penjelasan: tiap persegi panjang 56 kali 42 jadi kelilingnya 196; persegi tumpang tindih bersisi 56 − 36 = 20; dua persegi panjang memberi 2 × 196 = 392, dikurangi 4 sisi persegi yang tersembunyi 4 × 20 = 80, jadi keliling bangun ${ANSWER}, pilihan ${ANSWER_CHOICE}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* the figure coming alive — the illustrator's primitive */}
        <OverlapRects23G3 showSquare={beat.showSquare} showDims={beat.showDims} />

        {/* live arithmetic ledger — the method made concrete this beat */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            {beat.math != null && (
              <motion.div
                key={beat.math}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="font-display text-lg font-black tabular-nums"
                style={{ color: beat.result ? GREEN : ORANGE }}
              >
                {beat.result ? t(`Perimeter = ${beat.math}`, `Keliling = ${beat.math}`) : beat.math}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* kid-first caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
