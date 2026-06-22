import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CardRow9EC, FRUIT_NAME_EN, FRUIT_NAME_ID } from './CardSets9ECIllustration'
import { buildCardSets9ECSteps } from './cardSets9ECSteps'

// Post-answer explainer for IKMC-21-EC-Q9.
// Tests each set B–E with one valid swap, then shows set A is impossible.
// Palette echoes the illustration (qupu tokens).

const INK = '#1F2937'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const ORANGE = '#F2912B'
const ORANGE_DK = '#C56A12'
const BLUE = '#2D7FB8'
const BLUE_DK = '#1E5C86'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const RED = '#EF4444'
const RED_DK = '#B91C1C'

export default function CardSets9ECExplainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const fruitName = lang === 'id' ? FRUIT_NAME_ID : FRUIT_NAME_EN

  const story = useMemo(() => buildCardSets9ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const displayFruits = beat.swapped ?? beat.fruits
  const isImpossible = beat.result
  const hasSwap = beat.swapped !== null
  // A bad swap = we've swapped in set A and it still doesn't work (not the final beat)
  const badSwap = hasSwap && !isImpossible && beat.optionLabel === 'A'

  const captionStyle = isImpossible
    ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
    : badSwap
      ? { background: '#FEE2E2', borderColor: RED, color: RED_DK }
      : hasSwap
        ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
        : { background: '#E1EFFB', borderColor: BLUE_DK, color: BLUE_DK }

  const ariaLabel = T(
    'Testing each card set: sets B, C, D, E can all be fixed with one swap. Set A — apple, cherry, grapes, apple, grapes — cannot be fixed with any single swap. Answer: A.',
    'Menguji setiap set kartu: set B, C, D, E semuanya bisa diperbaiki dengan satu pertukaran. Set A — apel, ceri, anggur, apel, anggur — tidak bisa diperbaiki dengan satu pertukaran mana pun. Jawaban: A.',
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[280px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* Option label chip */}
        <div className="flex items-center gap-2">
          <motion.div
            key={beat.optionLabel}
            className="flex h-8 w-8 items-center justify-center rounded-full font-display text-base font-black"
            style={
              isImpossible
                ? { background: '#FEE2E2', color: RED_DK, border: `2px solid ${RED}` }
                : { background: '#E1EFFB', color: BLUE_DK, border: `2px solid ${BLUE}` }
            }
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.35 }}
          >
            {beat.optionLabel}
          </motion.div>
          <span className="font-display text-sm font-extrabold" style={{ color: INK }}>
            {T('Set', 'Set')} {beat.optionLabel}
          </span>
        </div>

        {/* Card row */}
        <motion.div
          key={`${beat.optionLabel}-${beat.swapped ? 'after' : 'before'}`}
          className="w-full"
          initial={{ opacity: 0.6, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardRow9EC fruits={displayFruits} highlight={beat.swapped ? [] : beat.highlight} />
        </motion.div>

        {/* Swap arrow (shown when highlighting, before swap) */}
        {beat.highlight.length === 2 && !beat.swapped && (
          <div className="flex items-center gap-1 font-display text-xs font-bold" style={{ color: ORANGE_DK }}>
            <span>{T('pos', 'pos')} {beat.highlight[0] + 1}</span>
            <span style={{ color: ORANGE }}>{'⇄'}</span>
            <span>{T('pos', 'pos')} {beat.highlight[1] + 1}</span>
          </div>
        )}

        {/* After-swap fruit names */}
        {beat.swapped && (
          <div className="font-display text-xs font-bold" style={{ color: badSwap ? RED_DK : GREEN_INK }}>
            {beat.swapped.map((f) => fruitName[f]).join(' · ')}
          </div>
        )}

        {/* Caption */}
        <motion.div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
          animate={{ scale: isImpossible ? [1, 1.04, 1] : 1 }}
          transition={{ duration: 0.4 }}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
