/**
 * StackMapSIMOC19G4Q4Explainer — SIMOC-19-G4-Q4
 *
 * Teaches: front view = column-wise maximum height.
 *
 * Beats:
 *   intro  — full 3D cube arrangement (grey); cue column-by-column strategy.
 *   col1   — column 1 (indigo) highlighted; rest dim; caption: max(2,1)=2.
 *   col2   — column 2 (amber) highlighted; caption: max(2,3)=3.
 *   col3   — column 3 (emerald) highlighted; caption: max(4,1)=4.
 *   answer — all cubes green; front view [2,3,4] shown; "Choice B".
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import {
  GREY_PALETTE,
  buildHighlightedCubes,
} from './StackMapSIMOC19G4Q4Illustration'
import {
  buildStackMapSIMOC19G4Q4Steps,
} from './stackMapSIMOC19G4Q4Steps'
import type { StackMapPhase } from './stackMapSIMOC19G4Q4Steps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const GREEN_P  = { top: '#A7F3D0', left: '#34D399', right: '#059669', ink: '#1E293B' }

const CELL   = 18
const GAP    = 2
const MAX_H  = 4
const TOTAL_W = 3 * CELL + 2 * GAP
const TOTAL_H = MAX_H * CELL

// Front-view heights revealed per phase
const REVEALED: Partial<Record<StackMapPhase, number[]>> = {
  col1:   [2, 0, 0],
  col2:   [2, 3, 0],
  col3:   [2, 3, 4],
  answer: [2, 3, 4],
}

// ---------------------------------------------------------------------------
// Mini front-view SVG
// ---------------------------------------------------------------------------
function FrontViewBar({ heights, highlight }: { heights: number[]; highlight: boolean }) {
  const fill   = highlight ? '#34D399' : '#BFDBFE'
  const stroke = highlight ? '#059669' : '#3B82F6'
  return (
    <svg
      viewBox={`0 0 ${TOTAL_W} ${TOTAL_H}`}
      width={TOTAL_W * 2}
      height={TOTAL_H * 2}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {heights.map((h, ci) => {
        const x = ci * (CELL + GAP)
        return Array.from({ length: h }, (_, zi) => {
          const y = TOTAL_H - (zi + 1) * CELL
          return (
            <rect
              key={`${ci}-${zi}`}
              x={x + 0.5}
              y={y + 0.5}
              width={CELL - 1}
              height={CELL - 1}
              fill={fill}
              stroke={stroke}
              strokeWidth={1}
            />
          )
        })
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Cube builder per phase
// ---------------------------------------------------------------------------
function phaseCubes(phase: StackMapPhase): { cubes: IsoCube[]; palette: typeof GREY_PALETTE } {
  if (phase === 'answer') {
    const GREEN = '#34D399'
    const base = buildHighlightedCubes()
    return {
      palette: GREEN_P,
      cubes: base.map((c) => ({ ...c, color: GREEN })),
    }
  }
  const colMap: Partial<Record<StackMapPhase, number>> = {
    col1: 0,
    col2: 1,
    col3: 2,
  }
  const activeCol = colMap[phase]
  return {
    palette: GREY_PALETTE,
    cubes: buildHighlightedCubes(activeCol),
  }
}

// ---------------------------------------------------------------------------
// Explainer component
// ---------------------------------------------------------------------------
export default function StackMapSIMOC19G4Q4Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildStackMapSIMOC19G4Q4Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { cubes, palette } = phaseCubes(beat.phase)
  const revealedH = REVEALED[beat.phase] ?? [0, 0, 0]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tampak depan = ketinggian maksimum setiap kolom: max(2,1)=2, max(2,3)=3, max(4,1)=4.'
      : 'Explainer: front view = max height per column: max(2,1)=2, max(2,3)=3, max(4,1)=4.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* 3D view */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={cubes}
            size={22}
            palette={palette}
            viewPadding={8}
          />
        </div>

        {/* Progressive front-view bar */}
        {beat.phase !== 'intro' && (
          <motion.div
            key={`fv-${beat.phase}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-0.5"
          >
            <span className="font-display text-[10px] font-semibold text-slate-400">
              {lang === 'id' ? 'Tampak Depan' : 'Front View'}
            </span>
            <FrontViewBar heights={revealedH} highlight={beat.result} />
          </motion.div>
        )}

        {/* Caption */}
        <motion.div
          key={`cap-${beat.phase}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#059669', color: '#065F46' }
              : { background: '#FEF3C7', borderColor: '#D97706', color: '#92400E' }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
