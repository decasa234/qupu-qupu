// Post-answer explainer for WMI-24P3A-Q18 (2024 Grade-3 Semifinal).
//
// Teaches "try to split each solid back into the two blocks":
//   1. Count cubes in the two blocks: 4 + 4 = 8. Every answer must total 8.
//   2. A valid solid can be cut into exactly these two blocks.
//   3. A, B, D, E all split cleanly.
//   4. C cannot be cut into the two blocks.
//   5. So the impossible solid is C.
//
// Reuses the illustrator's PolyCube primitive + the two BLOCK_A / BLOCK_B shapes
// so the scene matches the static figure. The five options A-E are shown as small
// cards that gain a green check (splittable) or a red cross (impossible). The
// option drawings are schematic (the originals were images), so the explainer
// makes the METHOD and the answer letter unmistakable. SSR-safe + deterministic.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BLOCK_A, BLOCK_B, PolyCube, SOLID_CUBES } from './P24G3Q18Illustration'
import { buildP24G3Q18Steps, type OptionLabel } from './p24G3Q18Steps'

const INK = '#1F2937'
const GREEN = '#10B981'
const RED = '#DC2626'

const LABELS: OptionLabel[] = ['A', 'B', 'C', 'D', 'E']

export default function P24G3Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G3Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: dua balok = ${SOLID_CUBES} kubus; A, B, D, E bisa dibelah jadi dua balok, C tidak bisa, jadi jawabannya C.`
      : `Explainer: two blocks = ${SOLID_CUBES} cubes; A, B, D, E split into the two blocks, C cannot, so the answer is C.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The two blocks + total badge */}
        <svg viewBox="0 0 440 130" width="100%" style={{ maxWidth: 440, display: 'block' }} aria-hidden="true">
          <PolyCube cells={BLOCK_A} ox={56} oy={44} tone="a" />
          <text x={196} y={78} textAnchor="middle" fontSize={26} fontWeight={900} fill="#94A3B8">
            +
          </text>
          <PolyCube cells={BLOCK_B} ox={244} oy={44} tone="b" />
          {beat.showTotal && (
            <g>
              <rect x={350} y={20} width={78} height={34} rx={10} fill={GREEN} />
              <text x={389} y={37} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill="#fff">
                {`= ${SOLID_CUBES}`}
              </text>
              <text x={389} y={62} textAnchor="middle" fontSize={10} fontWeight={700} fill={INK}>
                {lang === 'id' ? 'kubus' : 'cubes'}
              </text>
            </g>
          )}
        </svg>

        {/* Five option cards */}
        <div className="grid w-full grid-cols-5 gap-1.5">
          {LABELS.map((label) => {
            const isMatched = beat.matched.includes(label)
            const isFlagged = beat.flagged === label
            const border = isFlagged ? RED : isMatched ? GREEN : '#CBD5E1'
            const bg = isFlagged ? '#FEE2E2' : isMatched ? '#D1FAE5' : '#FFFFFF'
            const txt = isFlagged ? '#991B1B' : isMatched ? '#065F46' : INK
            return (
              <motion.div
                key={label}
                className="relative flex flex-col items-center rounded-lg border-2 px-1 py-2"
                style={{ background: bg, borderColor: border }}
                animate={{ scale: isFlagged && beat.result ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* schematic solid glyph (3 stacked unit squares) */}
                <svg viewBox="0 0 40 34" width="100%" style={{ maxWidth: 40 }} aria-hidden="true">
                  <rect x={6} y={14} width={12} height={12} fill="#A7D7B0" stroke={INK} strokeWidth={1.2} />
                  <rect x={18} y={14} width={12} height={12} fill="#8FC79B" stroke={INK} strokeWidth={1.2} />
                  <rect x={6} y={2} width={12} height={12} fill="#BFE3C6" stroke={INK} strokeWidth={1.2} />
                </svg>
                <span className="mt-0.5 font-display text-sm font-extrabold" style={{ color: txt }}>
                  {label}
                </span>

                <AnimatePresence>
                  {(isMatched || isFlagged) && (
                    <motion.div
                      key="flag"
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ background: isFlagged ? RED : GREEN }}
                      aria-hidden="true"
                    >
                      {isFlagged ? '✕' : '✓'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
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
                ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
            }
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
