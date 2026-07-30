// Post-answer explainer for WMI-24F1A-Q22 (2024 Grade 1 Final) — answer 8.
//
// Binds to the built BlockStack24G1 primitive: the three COLOUR groups and the
// blue -> green -> white order strip stay on screen every beat while
// `stackHeight` grows the tallest legal tower. The reasoning lives in
// blockStack24G1Steps — the colour of each turn is forced by the cycle, and the
// tower ends when the scarcest colour (green, with only two carrying blocks)
// comes round a third time with nothing left but spheres.
//
// Deterministic & SSR-safe: a pure render of the storyboard.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BlockStack24G1 } from './BlockStack24G1Illustration'
import { buildBlockStack24G1Steps, type BlockHue } from './blockStack24G1Steps'

const GREEN = '#10B981' // fill-qupu-green — winning beat
const BLUE_BG = '#E1EFFB'
const BLUE_INK = '#30598A'

// Accent for the running count: takes the COLOUR of the block just laid, since
// the colour is what the cycle forces. Hex values echo the illustration's face
// fills (white darkened to stay legible as text on the card).
const HUE_INK: Record<BlockHue, string> = {
  blue: '#30598A',
  green: '#417C00',
  white: '#8C8172',
}

export default function BlockStack24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBlockStack24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accent = beat.hue ? HUE_INK[beat.hue] : BLUE_INK

  // Describes the METHOD only — it never states the block count.
  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan bertahap: balok diambil menurut urutan warna biru, hijau, putih, dan tidak ada balok yang boleh diletakkan di atas bola. Menara ditumpuk terus sampai warna dengan balok pemikul paling sedikit datang lagi tanpa sisa pemikul, lalu berhenti.'
      : 'Step-by-step explainer: blocks are taken in the colour order blue, green, white, and nothing may sit on a sphere. The tower keeps growing until the colour with the fewest carrying blocks comes round again with none left, and then it stops.'

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
