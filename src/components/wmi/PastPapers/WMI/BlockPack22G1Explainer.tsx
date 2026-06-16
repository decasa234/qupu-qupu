/**
 * BlockPack22G1Explainer — WMI-22F1A-Q8 (Grade 1)
 *
 * Post-answer animation teaching the "divide-into-equal-pieces" strategy:
 *   1. Show the whole cube model and count the cubes (N).
 *   2. A 3 × 1 block is 3 cubes, so the most you can cut is N ÷ 3.
 *   3. Actually cut the blocks one at a time, colouring the used cubes and
 *      ticking a running counter 1, 2, 3, … up to the last block.
 *   4. Every cube ends up used → the count matches N ÷ 3 → that is the answer.
 *
 * Mirrors the static figure by reusing the illustrator's CubeModel (it colours
 * the first `showBlocks` blocks of the verified PACKING), so the animation reads
 * as the same scene coming alive. The cube count and block count are DERIVED from
 * CUBES / PACKING in blockPack22G1Steps, so the counter and the "N ÷ 3"
 * arithmetic can never drift.
 *
 * SSR-safe — no Math.random, no Date, pure render of props + lang.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CubeModel } from './BlockPack22G1Illustration'
import { buildBlockPack22G1Steps } from './blockPack22G1Steps'

// ── Colour tokens (echo the qupu palette used by the static figure) ───────────
const GREEN = '#10B981' // fill-qupu-green — finished / correct
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = GREEN
const GREEN_TEXT = '#065F46'
const ORANGE = '#E89A3C' // fill-qupu-orange — running block counter
const ORANGE_BG = '#FFE9CC'
const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'

export default function BlockPack22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBlockPack22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: setiap balok 3 × 1 memakai 3 kubus, jadi paling banyak ${story.cubeCount} ÷ 3 = ${story.bound} balok. Kita potong satu per satu sampai semua kubus terpakai, dan ternyata pas ${story.blockCount} balok. Jawabannya ${story.answer}.`
      : `Explainer: each 3 × 1 block uses 3 cubes, so at most ${story.cubeCount} ÷ 3 = ${story.bound} blocks fit. We cut them one at a time until every cube is used, and exactly ${story.blockCount} blocks fit. The answer is ${story.answer}.`

  // The running counter chip shows the divide-and-build progress: the goal bound
  // until cutting starts, then the live block count.
  const showCounter = beat.count > 0 || beat.phase === 'bound'
  const counterColor = beat.result ? GREEN : ORANGE
  const counterBg = beat.result ? GREEN_BG : ORANGE_BG

  return (
    <div className="mx-auto w-full max-w-[470px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The cube model — same renderer as the static figure, colouring the
            first `showBlocks` blocks of the verified packing. */}
        <div className="relative flex w-full items-end justify-center pt-1">
          <CubeModel showBlocks={beat.showBlocks} />

          {/* Running block counter chip */}
          <AnimatePresence>
            {showCounter && (
              <motion.div
                key="counter"
                initial={{ opacity: 0, scale: 0.6, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                className="absolute right-1 top-1 flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-sm font-extrabold"
                style={{ background: counterBg, color: counterColor, border: `2px solid ${counterColor}` }}
                aria-hidden="true"
              >
                {beat.phase === 'bound' ? (
                  <span>
                    {story.cubeCount} ÷ 3 = {story.bound}
                  </span>
                ) : (
                  <>
                    <span className="text-base leading-none">{beat.count}</span>
                    <span className="text-[11px] uppercase tracking-wide">{story.blocksLabel}</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Caption strip */}
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
