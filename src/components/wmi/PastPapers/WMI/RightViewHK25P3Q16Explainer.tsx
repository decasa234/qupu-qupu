// Post-answer explainer for HKIMO-25-P3H-Q16.
// "At least how many squares can be seen from the right?" — answer: 6.
//
// Animation: reveal each depth layer (y=2 front, then y=3 back) in the
// isometric view, colouring newly revealed cubes gold; simultaneously
// light up the corresponding column of the right-side 2-D silhouette grid.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { HK25P3Q16_CUBES } from './RightViewHK25P3Q16Illustration'
import { buildRightViewHK25P3Q16Steps } from './rightViewHK25P3Q16Steps'

const GOLD = '#FBBF24'
const GREEN = '#10B981'
const GHOST = '#E5EFF8'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Color cubes by which depth layers are currently highlighted. */
function buildColoredCubes(layersShown: 0 | 1 | 2): IsoCube[] {
  return HK25P3Q16_CUBES.map((c) => {
    if (layersShown === 0) return { ...c, color: GHOST }
    if (layersShown === 1) {
      // Only y=2 layer shown; y=3 still ghost
      if (c.y === 2) return { ...c, color: GOLD }
      return { ...c, color: GHOST }
    }
    // layersShown === 2: both layers active; y=3 is the newest (gold), y=2 blue
    if (c.y === 3) return { ...c, color: GOLD }
    return c // y=2 gets default blue palette
  })
}

// ---------------------------------------------------------------------------
// Right-side silhouette mini-grid
// ---------------------------------------------------------------------------
// The silhouette has 2 depth columns (y=2, y=3) and 4 height rows (z=0..3).
// Cell (col, row) is filled if a cube exists at that (y, z) in the structure.
// y=2: z=0,1 → col 0, rows 0 and 1
// y=3: z=0,1,2,3 → col 1, rows 0,1,2,3

interface GridCell { col: number; row: number; filled: boolean }

function buildSilhouetteGrid(layersShown: 0 | 1 | 2): GridCell[] {
  const cells: GridCell[] = []
  for (let row = 0; row < 4; row++) {
    // col 0 = y=2, col 1 = y=3
    cells.push({ col: 0, row, filled: layersShown >= 1 && row < 2 })
    cells.push({ col: 1, row, filled: layersShown >= 2 })
  }
  return cells
}

function SilhouetteGrid({ layersShown, result }: { layersShown: 0 | 1 | 2; result: boolean }) {
  const cells = buildSilhouetteGrid(layersShown)
  const cellSize = 22
  const pad = 4
  const cols = 2
  const rows = 4
  const w = cols * cellSize + pad * 2
  const h = rows * cellSize + pad * 2
  const fillColor = result ? GREEN : GOLD
  const emptyColor = '#E5EFF8'
  const stroke = '#9CA3AF'

  return (
    <svg
      width={w}
      height={h + 20}
      viewBox={`0 0 ${w} ${h + 20}`}
      aria-label="Right-side silhouette"
    >
      {/* Axis labels */}
      <text x={pad + cellSize * 0 + cellSize / 2} y={h + 14} textAnchor="middle" fontSize="8" fill="#6B7280">y=2</text>
      <text x={pad + cellSize * 1 + cellSize / 2} y={h + 14} textAnchor="middle" fontSize="8" fill="#6B7280">y=3</text>

      {cells.map(({ col, row, filled }) => {
        const x = pad + col * cellSize
        // row 0 = z=0 at bottom; draw top-to-bottom so z=3 is at top
        const y = pad + (rows - 1 - row) * cellSize
        return (
          <rect
            key={`${col}-${row}`}
            x={x}
            y={y}
            width={cellSize}
            height={cellSize}
            fill={filled ? fillColor : emptyColor}
            stroke={stroke}
            strokeWidth={1}
            rx={2}
          />
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Explainer component
// ---------------------------------------------------------------------------

export default function RightViewHK25P3Q16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRightViewHK25P3Q16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildColoredCubes(beat.layersShown)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tampak kanan terdiri dari 2 + 4 = 6 persegi.'
      : 'Explainer: right-side view has 2 + 4 = 6 visible squares.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Main row: 3D figure + silhouette grid */}
        <div className="flex items-end gap-4">
          {/* 3D isometric figure */}
          <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
            <IsoCubes
              cubes={cubes}
              size={22}
              palette={ISO_BLUE_PALETTE}
              viewPadding={10}
            />
          </div>

          {/* Right-side silhouette */}
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-display text-[10px] font-bold"
              style={{ color: beat.result ? GREEN : '#30598A' }}
            >
              {lang === 'id' ? 'Tampak Kanan' : 'Right View'}
            </span>
            <SilhouetteGrid layersShown={beat.layersShown} result={beat.result} />
          </div>
        </div>

        {/* Running total */}
        {beat.runningTotal > 0 && (
          <motion.div
            key={`count-${beat.runningTotal}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
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
