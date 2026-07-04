/**
 * MirrorBlocks22G1Explainer — WMI-22F1A-Q24 (Grade 1)
 *
 * Post-answer animation teaching the "decode the mirrors, then count" strategy:
 *   1. Recall the three block sizes (white = 1, gray = 2 long, black = 3 long).
 *   2. A long/tall mirror shadow can only be made by a long block — so the black
 *      1×3 and gray 1×2 blocks are forced into place.
 *   3. After the long blocks are placed, every leftover single cube must be white.
 *   4. Light up the white singles via <MirrorScene highlightWhite /> and count them.
 *   5. Result: WHITE_COUNT (= 3) white blocks.
 *
 * Reuses the illustrator's documented exports (MirrorScene + WHITE_COUNT) so the
 * animation reads as the same scene coming alive. SSR-safe — no Math.random, no
 * Date, pure render of props + lang.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { MirrorScene, WHITE_COUNT, SCENE_VIEW_W, SCENE_VIEW_H } from './MirrorBlocks22G1Illustration'
import { buildMirrorBlocks22G1Steps } from './mirrorBlocks22G1Steps'

// ---------------------------------------------------------------------------
// Colour tokens (mirror the illustration palette)
// ---------------------------------------------------------------------------

const WHITE_FILL = '#f3f4f6'
const GRAY_FILL = '#9ca3af'
const BLACK_FILL = '#3a3a3a'
const GREEN = '#10B981'
const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = GREEN
const GREEN_TEXT = '#065F46'
const AMBER = '#f59e0b'

// ---------------------------------------------------------------------------
// Piece-type legend chip
// ---------------------------------------------------------------------------

interface LegendChipProps {
  color: 'white' | 'gray' | 'black'
  label: string
  active: boolean
}

function LegendChip({ color, label, active }: LegendChipProps) {
  const bg = color === 'white' ? WHITE_FILL : color === 'gray' ? GRAY_FILL : BLACK_FILL
  const text = color === 'black' ? '#ffffff' : '#1f2937'
  const border = active ? AMBER : '#d1d5db'
  const shadow = active ? `0 0 0 3px rgba(245,158,11,0.4)` : 'none'

  return (
    <motion.div
      animate={{ boxShadow: shadow, borderColor: border, scale: active ? 1.08 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{
        background: bg,
        color: text,
        border: `2px solid ${border}`,
        borderRadius: 10,
        padding: '4px 12px',
        fontFamily: 'sans-serif',
        fontSize: 13,
        fontWeight: 700,
        display: 'inline-block',
        minWidth: 96,
        textAlign: 'center',
      }}
    >
      {label}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function MirrorBlocks22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildMirrorBlocks22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: bayangan cermin yang panjang hanya bisa dibuat balok panjang, jadi balok hitam 1×3 dan abu-abu 1×2 sudah pasti tempatnya. Setiap kubus tunggal yang tersisa pasti balok putih. Ada ${WHITE_COUNT} balok putih.`
      : `Explainer: a long mirror shadow can only come from a long block, so the black 1×3 and gray 1×2 blocks are pinned down. Every leftover single cube must be a white block. There are ${WHITE_COUNT} white blocks.`

  const tWhite = lang === 'id' ? 'Putih 1×1×1' : 'White 1×1×1'
  const tGray = lang === 'id' ? 'Abu 1×1×2' : 'Gray 1×1×2'
  const tBlack = lang === 'id' ? 'Hitam 1×1×3' : 'Black 1×1×3'

  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The solid + its two mirrors — white singles light up once decoded. */}
        <svg
          viewBox={`0 0 ${SCENE_VIEW_W} ${SCENE_VIEW_H}`}
          width="100%"
          style={{ display: 'block', maxWidth: 470 }}
          aria-hidden="true"
        >
          <MirrorScene highlightWhite={beat.highlightWhite} />
        </svg>

        {/* Block-type legend chips */}
        <div className="flex flex-wrap justify-center gap-2">
          <LegendChip color="white" label={tWhite} active={beat.highlightTypes.includes('white')} />
          <LegendChip color="gray" label={tGray} active={beat.highlightTypes.includes('gray')} />
          <LegendChip color="black" label={tBlack} active={beat.highlightTypes.includes('black')} />
        </div>

        {/* Caption */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28 }}
            className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              beat.result
                ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
                : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
            }
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
