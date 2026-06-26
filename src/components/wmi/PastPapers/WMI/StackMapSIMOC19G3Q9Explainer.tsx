// SIMOC-19-G3-Q9 — stack map → front view animated explainer
//
// Reuses StackMapGrid + FrontViewSilhouette geometry from the illustration file.
// Animation beats (5 total):
//   0. intro   — show the stack map; explain the front-view rule.
//   1. col0    — highlight column 1; max(1,2)=2.
//   2. col1    — highlight column 2; max(3,2)=3.
//   3. col2    — highlight column 3; max(1,4)=4.
//   4. result  — show the profile [2,3,4]; circle answer B.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CELL,
  STACK_MAP,
  FRONT_HEIGHTS,
  GRID_CUBES,
  StackMapSIMOC19G3Q9Option,
} from './StackMapSIMOC19G3Q9Illustration'
import { IsoCubes, ISO_BLUE_PALETTE, ISO_GOLD_PALETTE, type IsoCube } from './primitives/IsoCubes'
import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'
import { buildStackMapSIMOC19G3Q9Steps } from './stackMapSIMOC19G3Q9Steps'

// ── colours ──────────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const AMBER  = '#D97706'
const INK    = '#1F2937'
const MUTED  = '#6B7280'

const GRID_VB = gridBoardViewBox(2, 3, CELL)

// ── helpers ───────────────────────────────────────────────────────────────────

/** Returns voxels for only the cubes in a given iso x-column. */
function colVoxels(colX: number): IsoCube[] {
  return GRID_CUBES.filter((v) => v.x === colX)
}

// Gold palette highlight for the active column cubes
const GOLD_CUBES = (colX: number): IsoCube[] =>
  colVoxels(colX).map((v) => ({ ...v, color: '#FFD23F' }))

// Build the full cube list with one column highlighted in gold
function cubesWithHighlight(colX: number): IsoCube[] {
  if (colX < 0) return GRID_CUBES
  const others = GRID_CUBES.filter((v) => v.x !== colX)
  return [...others, ...GOLD_CUBES(colX)]
}

// ── FrontViewResult sub-component ────────────────────────────────────────────
// Shows the 3-column front-view answer profile.

const OPT_CELL = 22
const OPT_COLS = 3
const OPT_MAX_H = 4

function FrontViewResult({ heights, label }: { heights: readonly number[]; label: string }) {
  const w = OPT_COLS * OPT_CELL
  const h = OPT_MAX_H * OPT_CELL
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {Array.from({ length: OPT_COLS }, (_, c) => {
          const colH = heights[c] ?? 0
          const topRow = OPT_MAX_H - colH
          return Array.from({ length: OPT_MAX_H }, (__, r) => {
            const filled = r >= topRow
            return (
              <rect
                key={`${c}-${r}`}
                x={c * OPT_CELL}
                y={r * OPT_CELL}
                width={OPT_CELL}
                height={OPT_CELL}
                fill={filled ? '#BBF7D0' : 'none'}
                stroke={filled ? GREEN : '#d1d5db'}
                strokeWidth={filled ? 1.5 : 0.6}
              />
            )
          })
        })}
      </svg>
      <span style={{ fontSize: 12, fontWeight: 700, color: GREEN }}>{label}</span>
    </div>
  )
}

// ── Explainer component ───────────────────────────────────────────────────────

export default function StackMapSIMOC19G3Q9Explainer({
  lang = 'id',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = useMemo(
    () => buildStackMapSIMOC19G3Q9Steps(lang as 'en' | 'id'),
    [lang],
  )

  const finalIndex = story.length - 1
  const beatIndex = useBeatControl(finalIndex, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    holds: story.map((b) => b.hold || 2600),
  })

  const beat = story[beatIndex]
  const hlCol = beat.highlightCol
  const isResult = beat.result

  // Active cube list — gold-highlights the highlighted column
  const activeCubes = cubesWithHighlight(hlCol)

  return (
    <div className="flex flex-col items-center gap-3 py-2 select-none">
      {/* Grid + 3-D side by side */}
      <div className="flex items-start justify-center gap-6 flex-wrap">
        {/* 2-D stack map with animated column highlight */}
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>
            {lang === 'id' ? 'Peta Tumpukan' : 'Stack Map'}
          </span>
          <div style={{ position: 'relative' }}>
            <svg
              viewBox={GRID_VB}
              width={3 * CELL}
              height={2 * CELL}
              aria-hidden="true"
              style={{ display: 'block' }}
            >
              <GridBoard
                rows={2}
                cols={3}
                cellSize={CELL}
                label={(r, c) => String(STACK_MAP[r][c])}
                fill={() => '#FFFFFF'}
              />
              {/* Column highlight overlay */}
              <AnimatePresence>
                {hlCol >= 0 && (
                  <motion.rect
                    key={`hl-${hlCol}`}
                    x={hlCol * CELL}
                    y={0}
                    width={CELL}
                    height={2 * CELL}
                    fill="#FEF3C7"
                    fillOpacity={0.55}
                    stroke={AMBER}
                    strokeWidth={2}
                    rx={3}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                )}
              </AnimatePresence>
            </svg>
          </div>
          {/* Column-height readout */}
          <AnimatePresence mode="wait">
            {hlCol >= 0 && (
              <motion.div
                key={`eq-${hlCol}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: AMBER,
                  background: '#FFFBEB',
                  borderRadius: 6,
                  padding: '2px 8px',
                  border: `1px solid ${AMBER}`,
                }}
              >
                {beat.equation}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3-D IsoCubes with highlighted column */}
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>
            {lang === 'id' ? 'Tampilan 3-D' : '3-D View'}
          </span>
          <IsoCubes
            cubes={activeCubes}
            size={24}
            cellGap={1}
            palette={ISO_BLUE_PALETTE}
            viewPadding={10}
          />
        </div>

        {/* Result: show front-view profile */}
        {isResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-1"
          >
            <span style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>
              {lang === 'id' ? 'Tampilan Depan' : 'Front View'}
            </span>
            <FrontViewResult
              heights={FRONT_HEIGHTS}
              label={lang === 'id' ? 'Jawaban B ✓' : 'Answer B ✓'}
            />
          </motion.div>
        )}
      </div>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.p
          key={`cap-${beatIndex}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: 13,
            color: isResult ? GREEN : INK,
            fontWeight: isResult ? 700 : 400,
            textAlign: 'center',
            maxWidth: 340,
            margin: 0,
          }}
        >
          {beat.caption}
        </motion.p>
      </AnimatePresence>

      {/* Result equation banner */}
      {isResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: GREEN,
            background: '#ECFDF5',
            border: `1.5px solid ${GREEN}`,
            borderRadius: 8,
            padding: '4px 16px',
          }}
        >
          {beat.equation}
        </motion.div>
      )}
    </div>
  )
}
