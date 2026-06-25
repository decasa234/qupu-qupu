// Post-answer explainer for HKIMO-19-P3H-Q16.
// "At least how many squares can be seen if observing the figure from the right?"
// Answer: 4.
//
// Animation strategy:
//   Beat 0 – show 3-D structure (no highlights, right-view blank)
//   Beat 1 – highlight front staircase (y=0) in gold; show 3 squares in right-view
//   Beat 2 – highlight back flat row (y=1) in green; add 1 square in right-view
//   Beat 3 – all lit, count = 4, result confirmed

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import {
  STAIR_FRONT_CUBES,
  STAIR_BACK_CUBES,
} from './CubeStair19HKP3Q16Illustration'
import { buildCubeStair19HKP3Q16Steps } from './cubeStair19HKP3Q16Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GOLD   = '#F59E0B'
const GREEN  = '#10B981'
const RESULT_GREEN = '#065F46'
const DIM    = '#D1E8FA'

// ── helpers ───────────────────────────────────────────────────────────────────

function buildCubes(frontLit: boolean, backLit: boolean): IsoCube[] {
  const back  = STAIR_BACK_CUBES.map((c) =>
    backLit ? { ...c, color: GREEN } : { ...c, color: DIM },
  )
  const front = STAIR_FRONT_CUBES.map((c) =>
    frontLit ? { ...c, color: GOLD } : c,
  )
  // painter order: y=1 (back) first, y=0 (front) second
  return [...back, ...front]
}

// Right-side view grid: 3 rows (z=2 top → z=0 bottom), 2 cols (c=0 = front/y=0, c=1 = back/y=1)
// Filled cells:
//   col 0 (front y=0): rows 0,1,2 — the 3-step staircase silhouette
//   col 1 (back  y=1): row 2 only  — the flat back row at ground level
const CELL = 44

function rightViewFill(rightViewCols: 0 | 1 | 2) {
  return (r: number, c: number): string | undefined => {
    if (c === 0 && rightViewCols >= 1) return GOLD   // front col: 3 squares
    if (c === 1 && r === 2 && rightViewCols >= 2) return GREEN // back col bottom
    return undefined
  }
}

// ── component ─────────────────────────────────────────────────────────────────

export default function CubeStair19HKP3Q16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCubeStair19HKP3Q16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes       = buildCubes(beat.frontLit, beat.backLit)
  const fillFn      = rightViewFill(beat.rightViewCols)
  const vb          = gridBoardViewBox(3, 2, CELL)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: amati gambar 3-D dari sisi kanan. Kolom depan menampilkan 3 persegi, baris belakang menambah 1. Total = 4.'
      : 'Explainer: observe the 3-D figure from the right. The front column shows 3 squares, the back row adds 1. Total = 4.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* 3-D isometric figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={cubes}
            size={26}
            palette={ISO_BLUE_PALETTE}
            viewPadding={10}
          />
        </div>

        {/* Right-side view panel */}
        <div className="flex flex-col items-center gap-1">
          <p className="font-display text-xs font-bold text-gray-500">
            {lang === 'id' ? 'Tampak dari kanan →' : 'Right-side view →'}
          </p>
          <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
            <svg viewBox={vb} width={2 * CELL + 4} height={3 * CELL + 4}>
              <GridBoard
                rows={3}
                cols={2}
                cellSize={CELL}
                fill={fillFn}
                label={(r, c) => {
                  // label the axes on first/last cells
                  if (r === 0 && c === 0 && beat.rightViewCols === 0) return ''
                  return undefined
                }}
              />
            </svg>
          </div>
          {/* depth-axis labels */}
          <div className="flex w-full justify-around" style={{ maxWidth: 2 * CELL + 4 }}>
            <span className="font-display text-[10px] text-gray-400">
              {lang === 'id' ? 'Depan' : 'Front'}
            </span>
            <span className="font-display text-[10px] text-gray-400">
              {lang === 'id' ? 'Belakang' : 'Back'}
            </span>
          </div>
        </div>

        {/* Running count */}
        {beat.squaresFound > 0 && (
          <motion.div
            key={`count-${beat.squaresFound}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : '#30598A' }}
          >
            {beat.squaresFound}
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: RESULT_GREEN }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
