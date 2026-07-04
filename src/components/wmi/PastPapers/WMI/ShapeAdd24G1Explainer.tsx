import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ShapeAdd24G1 } from './ShapeAdd24G1Illustration'
import { buildShapeAdd24G1Steps } from './shapeAdd24G1Steps'

// Colours echo the illustration / qupu tokens so the animation reads as the
// same scene coming alive.
const GREEN = '#10B981' // fill-qupu-green — winning beat
const WARM = '#FBBF6B' // the ★ glyph fill from ShapeAdd24G1Illustration
const BLUE_BG = '#E1EFFB'
const BLUE_INK = '#30598A'

// Geometry mirrored from ShapeAdd24G1Illustration so the highlight band lines
// up over each tree (viewBox 0 0 320 250). The two trees occupy the left and
// right halves; each band covers a tree's top box + its two children + the path
// down to the shared total at the bottom.
const VIEW_W = 320
const VIEW_H = 250

// x-spans for each tree's highlight band (a little padding around the boxes).
const LEFT_BAND = { x: 8, w: 142 }
const RIGHT_BAND = { x: 170, w: 142 }

export default function ShapeAdd24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapeAdd24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const showLeft = beat.side === 'left'
  const showRight = beat.side === 'right'
  const bandColor = beat.result ? GREEN : WARM

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: kotak kiri = 13 − 7 = ${story.leftBox}; kedua kotak kosong berjumlah ${story.total}, jadi kotak kanan = ${story.rightBox}; ★ = ${story.given} + ${story.rightBox} = ${story.answer}.`
      : `Explainer: left box = 13 − 7 = ${story.leftBox}; the two empty boxes total ${story.total}, so the right box = ${story.rightBox}; ★ = ${story.given} + ${story.rightBox} = ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Figure + animated highlight band sharing one viewBox so they register. */}
        <div className="relative w-full" style={{ maxWidth: 320, margin: '0 auto' }}>
          <ShapeAdd24G1
            revealStar={beat.revealStar}
            revealLeftBox={beat.revealLeftBox}
            revealRightBox={beat.revealRightBox}
          />
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {showLeft && (
              <motion.rect
                key="left"
                x={LEFT_BAND.x}
                y={12}
                width={LEFT_BAND.w}
                height={VIEW_H - 24}
                rx={14}
                fill={bandColor}
                opacity={0.16}
                stroke={bandColor}
                strokeOpacity={0.55}
                strokeWidth={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              />
            )}
            {showRight && (
              <motion.rect
                key="right"
                x={RIGHT_BAND.x}
                y={12}
                width={RIGHT_BAND.w}
                height={VIEW_H - 24}
                rx={14}
                fill={bandColor}
                opacity={0.16}
                stroke={bandColor}
                strokeOpacity={0.55}
                strokeWidth={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              />
            )}
          </svg>
        </div>

        {/* Answer chip — appears once ★ is solved on the final beat. */}
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
