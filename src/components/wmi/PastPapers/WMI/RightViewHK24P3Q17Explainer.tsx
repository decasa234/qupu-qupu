// Post-answer explainer for HKIMO-24-P3H-Q17.
// "At least how many square(s) can be seen from the right?" — answer: 4.
//
// Beat-by-beat: show the 3-D figure, then incrementally light up
// the right-side silhouette (a y-z grid) as each visible square is found.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import { HK24P3Q17_CUBES } from './RightViewHK24P3Q17Illustration'
import { buildRightViewHK24P3Q17Steps } from './rightViewHK24P3Q17Steps'

const GREEN = '#10B981'
const BLUE = '#30598A'

// ---------------------------------------------------------------------------
// Right-side silhouette grid
// ---------------------------------------------------------------------------
// The right-side view (y-z plane, looking along −x) has:
//   Cols (y): 0 = front, 1 = back
//   Rows (z): 0 = ground, 1 = 2nd, 2 = 3rd (top)
//
// Lit cells in order (litCount 1..4):
const LIT_CELLS: Array<{ col: number; row: number }> = [
  { col: 0, row: 0 }, // (y=0, z=0) — front row ground
  { col: 1, row: 0 }, // (y=1, z=0) — back cluster ground
  { col: 1, row: 1 }, // (y=1, z=1) — back 2nd level
  { col: 1, row: 2 }, // (y=1, z=2) — tower top
]

const CELL = 30 // px per grid cell
const COLS = 2  // y=0 (front), y=1 (back)
const ROWS = 3  // z=0..2

function RightViewGrid({ litCount, final }: { litCount: number; final: boolean }) {
  const W = COLS * CELL + 1
  const H = ROWS * CELL + 1

  return (
    <svg
      width={W + 40}
      height={H + 28}
      viewBox={`-20 -8 ${W + 40} ${H + 28}`}
      aria-hidden="true"
    >
      {/* axis labels */}
      <text x={CELL * 0.5} y={-2} textAnchor="middle" fontSize={9} fill="#6B7280">y=0</text>
      <text x={CELL * 1.5} y={-2} textAnchor="middle" fontSize={9} fill="#6B7280">y=1</text>
      <text x={-4} y={CELL * 0.5 + 3} textAnchor="end" fontSize={9} fill="#6B7280">z=0</text>
      <text x={-4} y={CELL * 1.5 + 3} textAnchor="end" fontSize={9} fill="#6B7280">z=1</text>
      <text x={-4} y={CELL * 2.5 + 3} textAnchor="end" fontSize={9} fill="#6B7280">z=2</text>

      {/* grid background cells */}
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => {
          const cellIndex = LIT_CELLS.findIndex((c) => c.col === col && c.row === row)
          const isLit = cellIndex !== -1 && cellIndex < litCount
          const fill = isLit ? (final ? '#D1FAE5' : '#DBEAFE') : '#F9FAFB'
          const stroke = isLit ? (final ? GREEN : BLUE) : '#D1D5DB'
          return (
            <rect
              key={`${col}-${row}`}
              x={col * CELL}
              y={row * CELL}
              width={CELL}
              height={CELL}
              fill={fill}
              stroke={stroke}
              strokeWidth={isLit ? 2 : 1}
            />
          )
        }),
      )}

      {/* count badge for each lit cell */}
      {LIT_CELLS.slice(0, litCount).map((c, i) => (
        <motion.text
          key={i}
          x={c.col * CELL + CELL / 2}
          y={c.row * CELL + CELL / 2 + 4}
          textAnchor="middle"
          fontSize={13}
          fontWeight="bold"
          fill={final ? '#065F46' : BLUE}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        >
          {i + 1}
        </motion.text>
      ))}

      {/* axis label */}
      <text x={W / 2} y={H + 18} textAnchor="middle" fontSize={9} fill="#6B7280">
        View from right →
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Explainer component
// ---------------------------------------------------------------------------

export default function RightViewHK24P3Q17Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRightViewHK24P3Q17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: dari kanan, 4 persegi terlihat (1 baris depan + 3 baris belakang).'
      : 'Explainer: from the right, 4 squares are visible (1 front + 3 back).'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* 3-D figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={HK24P3Q17_CUBES}
            size={22}
            palette={ISO_BLUE_PALETTE}
            viewPadding={8}
          />
        </div>

        {/* Right-side silhouette grid */}
        <div className="rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <RightViewGrid litCount={beat.litCount} final={beat.result} />
        </div>

        {/* Running count */}
        {beat.litCount > 0 && (
          <motion.div
            key={`count-${beat.litCount}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : BLUE }}
          >
            {beat.litCount}
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
