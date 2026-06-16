import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BlockStack24G1 } from './BlockStack24G1Illustration'
import { buildBlockStack24G1Steps, type BlockKind } from './blockStack24G1Steps'

// Colours echo the illustration / qupu tokens so the animation reads as the
// same scene coming alive (hex mirrors of BlockStack24G1Illustration's fills).
const GREEN = '#10B981' // fill-qupu-green — winning beat
const BLUE = '#2C9CDB' // cube faces
const CYL = '#9ACA3C' // cylinder body
const BLUE_BG = '#E1EFFB'
const BLUE_INK = '#30598A'

// Accent for the running count: takes the colour of the block just laid.
const KIND_COLOR: Record<BlockKind, string> = {
  cube: BLUE,
  cylinder: CYL,
  sphere: '#CBD7DF',
}

export default function BlockStack24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBlockStack24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accent = beat.laid ? KIND_COLOR[beat.laid] : BLUE_INK

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: bola tak bisa memikul balok, jadi selang-seling kubus dan tabung. Dibatasi ${story.cylinders} tabung, tumpukan tertinggi = ${story.answer} balok.`
      : `Explainer: a sphere can't carry a block, so alternate cubes and cylinders. Bounded by ${story.cylinders} cylinders, the tallest stack is ${story.answer} blocks.`

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The bound primitive grows the tallest legal tower to stackHeight. */}
        <BlockStack24G1 stackHeight={beat.stackHeight} />

        {/* Running block count — appears once we start building. */}
        {beat.running > 0 && (
          <motion.div
            key={`count-${beat.running}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : accent }}
          >
            {beat.running}
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
