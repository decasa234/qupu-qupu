// SIMOC-21-G1-Q12 — post-answer explainer: top-down view of a 9-cube arrangement.
//
// Teaches the "bird's-eye footprint" strategy beat-by-beat:
//   Beat 0 — intro: imagine hovering above the shape.
//   Beat 1 — back: back pair → 2 cells at top.
//   Beat 2 — middle: wide row → 4 cells.
//   Beat 3 — front: front pair + extension → 3 cells.
//   Beat 4 — match: full 9-cell footprint; compare with options.
//   Beat 5 — result: footprint matches option E → answer E.
//
// Reuses IsoCubes (from the illustration) and Polyomino (for the footprint preview).
// No framer-motion required beyond AnimatePresence for caption swap.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes } from './primitives/IsoCubes'
import { Polyomino } from './primitives/Polyomino'
import { buildTopViewSIMOC21G1Q12Steps } from './topViewSIMOC21G1Q12Steps'
import type { IsoCube } from './primitives/IsoCubes'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const AMBER = '#F59E0B'
const INK = '#1F2937'

// ---------------------------------------------------------------------------
// Cube data (same footprint as Illustration)
// ---------------------------------------------------------------------------

const ALL_CUBES: (IsoCube & { layer: 'back' | 'middle' | 'front' })[] = [
  // back pair (y=0)
  { x: 1, y: 0, z: 0, layer: 'back' },
  { x: 2, y: 0, z: 0, layer: 'back' },
  // wide middle row (y=1)
  { x: 0, y: 1, z: 0, layer: 'middle' },
  { x: 1, y: 1, z: 0, layer: 'middle' },
  { x: 2, y: 1, z: 0, layer: 'middle' },
  { x: 3, y: 1, z: 0, layer: 'middle' },
  // front pair (y=2)
  { x: 1, y: 2, z: 0, layer: 'front' },
  { x: 2, y: 2, z: 0, layer: 'front' },
  // front extension (y=3)
  { x: 1, y: 3, z: 0, layer: 'front' },
]

// Polyomino cells for the full top-down footprint (matches option E)
type Cell = [number, number]
const FOOTPRINT_ALL: Cell[] = [
  [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2], [1, 3],
  [2, 1], [2, 2],
  [3, 1],
]
const FOOTPRINT_BACK: Cell[] = [[0, 1], [0, 2]]
const FOOTPRINT_MIDDLE: Cell[] = [[1, 0], [1, 1], [1, 2], [1, 3]]
const FOOTPRINT_FRONT: Cell[] = [[2, 1], [2, 2], [3, 1]]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function layerColor(layer: 'back' | 'middle' | 'front', active: boolean): string | undefined {
  if (!active) return undefined
  if (layer === 'back') return AMBER
  if (layer === 'middle') return GREEN
  return '#818CF8' // indigo for front
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

export default function TopViewSIMOC21G1Q12Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTopViewSIMOC21G1Q12Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: bayangkan tampak atas. Bagian belakang → 2 sel. Baris tengah → 4 sel. Bagian depan → 3 sel. Total 9 sel cocok dengan pilihan E. Jawaban E.'
      : 'Explainer: imagine bird-eye view. Back layer → 2 cells. Middle row → 4 cells. Front → 3 cells. 9 cells total match option E. Answer E.'

  // Colour-code cubes by layer when a layer is highlighted
  const highlightedCubes: IsoCube[] = ALL_CUBES.map((c) => {
    const isActiveLayer =
      beat.highlightRow === 'all' ||
      (beat.highlightRow === 'back' && c.layer === 'back') ||
      (beat.highlightRow === 'middle' && c.layer === 'middle') ||
      (beat.highlightRow === 'front' && c.layer === 'front')
    const color = layerColor(c.layer, beat.highlightRow !== 'none' && isActiveLayer)
    return color ? { x: c.x, y: c.y, z: c.z, color } : { x: c.x, y: c.y, z: c.z }
  })

  // Which footprint cells to show
  const footprintCells: Cell[] | null = (() => {
    if (beat.phase === 'back') return FOOTPRINT_BACK
    if (beat.phase === 'middle') return FOOTPRINT_MIDDLE
    if (beat.phase === 'front') return FOOTPRINT_FRONT
    if (beat.phase === 'match' || beat.phase === 'result') return FOOTPRINT_ALL
    return null
  })()

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* 3D figure + footprint preview side by side */}
        <div className="flex items-center justify-center gap-6">
          {/* 3D isometric view */}
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-display text-[10px] font-bold uppercase tracking-wide"
              style={{ color: INK, opacity: 0.5 }}
            >
              {lang === 'id' ? 'Bentuk 3D' : '3D shape'}
            </span>
            <IsoCubes cubes={highlightedCubes} size={22} viewPadding={8} />
          </div>

          {/* Arrow */}
          <span style={{ color: INK, opacity: 0.4, fontSize: 24, lineHeight: 1 }}>→</span>

          {/* Footprint preview */}
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-display text-[10px] font-bold uppercase tracking-wide"
              style={{ color: INK, opacity: 0.5 }}
            >
              {lang === 'id' ? 'Tampak atas' : 'Top view'}
            </span>
            <AnimatePresence mode="wait">
              {footprintCells ? (
                <motion.div
                  key={beat.phase}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  <Polyomino
                    cells={footprintCells}
                    cellSize={20}
                    pad={4}
                    fill={isResult ? GREEN_BG : '#F3F4F6'}
                    stroke={isResult ? GREEN : BLUE}
                    strokeWidth={2}
                    showGrid
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    width: 88,
                    height: 88,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #D1D5DB',
                    borderRadius: 8,
                  }}
                >
                  <span style={{ color: '#9CA3AF', fontSize: 28 }}>?</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption card */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
