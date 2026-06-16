import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeAdd23G1 } from './ShapeAdd23G1Illustration'
import { buildShapeAdd23G1Steps } from './shapeAdd23G1Steps'

// Colours echo the illustration / qupu tokens so the animation reads as the
// same scene coming alive.
const GREEN = '#10B981' // fill-qupu-green — winning beat
const WARM = '#FBBF6B' // the shared glyph fill from ShapeAdd23G1Illustration
const BLUE_BG = '#E1EFFB'
const BLUE_INK = '#30598A'

// Geometry mirrored from ShapeAdd23G1Illustration so the highlight band lines
// up exactly with the four rows (viewBox 0 0 300 244, rows centred at these y).
const VIEW_W = 300
const VIEW_H = 244
const ROW_Y = [44, 100, 156, 212]
const BAND_H = 50

export default function ShapeAdd23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapeAdd23G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const bandY = beat.activeRow != null ? ROW_Y[beat.activeRow] - BAND_H / 2 : -BAND_H
  const bandColor = beat.result ? GREEN : WARM

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: pakai baris demi baris — ● = ${story.circle}, ■ = ${story.square}, lalu ★ = 25 − ${story.square} = ${story.answer}.`
      : `Explainer: work row by row — ● = ${story.circle}, ■ = ${story.square}, then ★ = 25 − ${story.square} = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Figure + animated highlight band sharing one viewBox so they register. */}
        <div className="relative w-full" style={{ maxWidth: 300, margin: '0 auto' }}>
          <ShapeAdd23G1 revealUpTo={beat.revealUpTo} />
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {beat.activeRow != null && (
              <motion.rect
                key={beat.activeRow}
                x={8}
                width={VIEW_W - 16}
                height={BAND_H}
                rx={12}
                fill={bandColor}
                opacity={0.18}
                stroke={bandColor}
                strokeOpacity={0.55}
                strokeWidth={2}
                initial={{ y: bandY, opacity: 0 }}
                animate={{ y: bandY, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              />
            )}
          </svg>
        </div>

        {/* Running answer chip — appears once ★ is solved on the final beat. */}
        {beat.result && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: GREEN }}
          >
            ★ = {story.answer}
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
