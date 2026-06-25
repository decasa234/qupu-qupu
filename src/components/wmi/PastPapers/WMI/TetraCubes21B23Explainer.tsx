// Post-answer explainer for SEAMO-21-B-Q23.
// "How many cubes are there altogether in Figures 1 to 5?" — answer: 70.
//
// Animation strategy: reveal each tetrahedral figure one beat at a time,
// highlighting the new figure in gold while previous figures stay blue.
// A running total tally appears below. The final beat shows the sum 1+4+10+20+35=70.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GOLD_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { tetrahedralCubes, T } from './TetraCubes21B23Illustration'
import { buildTetraCubes21B23Steps } from './tetraCubes21B23Steps'

const GREEN = '#10B981'

// Precompute all five figure voxel sets (cubes are tiny so this is trivial).
// We use figures 1–5 in the explainer (the original only shows 1–3).
const ALL_FIGS: IsoCube[][] = [1, 2, 3, 4, 5].map((n) => tetrahedralCubes(n))

/**
 * Build a single combined cube set that shows `figureShown` figures.
 * Each figure is offset horizontally so they sit side-by-side in the same SVG.
 * The figure at `highlightIndex` is painted gold; the rest are blue.
 *
 * Horizontal offset between figures: each figure n spans roughly (n) iso units
 * in screen x.  We add a gap of 2 units between figures.
 */
function buildDisplayCubes(figureShown: number, highlightIndex: number): IsoCube[][] {
  return ALL_FIGS.slice(0, figureShown).map((cubes, idx) => {
    const isHighlighted = idx === highlightIndex
    return cubes.map((c) => ({
      ...c,
      color: isHighlighted ? ISO_GOLD_PALETTE.top : undefined,
    }))
  })
}

// Figure counts for display.
const FIG_COUNTS = [1, 2, 3, 4, 5].map((n) => T(n))
const FIG_LABELS = ['Fig 1', 'Fig 2', 'Fig 3', 'Fig 4', 'Fig 5']

export default function TetraCubes21B23Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTetraCubes21B23Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const figureSets = buildDisplayCubes(beat.figureShown, beat.highlightIndex)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: Gambar tetrahedral T(n)=n(n+1)(n+2)/6. Jumlah gambar 1–5: 1+4+10+20+35 = 70.`
      : `Explainer: Tetrahedral figures T(n)=n(n+1)(n+2)/6. Sum of figures 1–5: 1+4+10+20+35 = 70.`

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-4">

        {/* Row of figures — each in its own mini panel */}
        <div className="flex flex-wrap items-end justify-center gap-3">
          {figureSets.map((cubes, idx) => {
            const isHighlighted = idx === beat.highlightIndex
            const isDone = beat.result
            return (
              <motion.div
                key={FIG_LABELS[idx]}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="overflow-hidden rounded-lg border-2 bg-white p-2"
                  style={{
                    borderColor: isDone
                      ? GREEN
                      : isHighlighted
                        ? '#F4B400'
                        : '#C8DDE8',
                  }}
                >
                  <IsoCubes
                    cubes={cubes}
                    size={20}
                    palette={ISO_BLUE_PALETTE}
                    viewPadding={6}
                  />
                </div>
                <span
                  className="font-display text-[10px] font-bold tabular-nums"
                  style={{
                    color: isDone ? GREEN : isHighlighted ? '#D97706' : '#6B7280',
                  }}
                >
                  {FIG_LABELS[idx]}
                  {' '}
                  <span className="font-black">{FIG_COUNTS[idx]}</span>
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Running total counter */}
        {beat.runningTotal > 0 && (
          <motion.div
            key={`total-${beat.runningTotal}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-3xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : '#30598A' }}
          >
            {beat.runningTotal}
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
