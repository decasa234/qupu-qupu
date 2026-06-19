/**
 * IKMC-19-PE-Q14 — post-answer explainer: smallest painted area.
 *
 * Teaches the "count hidden faces" strategy one shape per beat:
 *   Beat 0 — intro: 4 cubes × 6 faces = 24 total.
 *   Beat 1 — key idea: each joint hides 2 faces.
 *   Beat 2 — shape A: 3 joints → 18 painted.
 *   Beat 3 — shape B: 4 joints → 16 painted (smallest!).
 *   Beat 4 — shapes C/D/E: 3 joints each → 18 painted.
 *   Beat 5 — result: B wins.
 *
 * Reuses CubeGroup from CubeShapes14Illustration so the animation reads as
 * the same scene coming alive.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CubeGroup } from './CubeShapes14Illustration'
import { buildCubeShapes14Steps } from './cubeShapes14Steps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const ORANGE = '#F59E0B'
const ORANGE_BG = '#FFF7ED'
const INK = '#1F2937'

// ---------------------------------------------------------------------------
// Voxel sets (same as Illustration — duplicated to keep explainer self-contained)
// ---------------------------------------------------------------------------
type Voxel3 = [number, number, number]

const VOXELS_A: Voxel3[] = [[0,0,0],[1,0,0],[2,0,0],[3,0,0]]
const VOXELS_B: Voxel3[] = [[0,0,0],[1,0,0],[0,1,0],[1,1,0]]
const VOXELS_C: Voxel3[] = [[0,0,0],[1,0,0],[2,0,0],[2,1,0]]
const VOXELS_D: Voxel3[] = [[0,0,0],[1,0,0],[2,0,0],[1,1,0]]
const VOXELS_E: Voxel3[] = [[0,0,0],[1,0,1],[2,0,2],[3,0,3]]

const SHAPE_VOXELS: Record<string, Voxel3[]> = {
  A: VOXELS_A,
  B: VOXELS_B,
  C: VOXELS_C,
  D: VOXELS_D,
  E: VOXELS_E,
}

const SHAPE_LABELS = ['A', 'B', 'C', 'D', 'E'] as const

// ---------------------------------------------------------------------------
// ShapePanel — shows one labelled isometric shape with an optional highlight ring
// ---------------------------------------------------------------------------

interface ShapePanelProps {
  label: string
  active: boolean
  isAnswer: boolean
  joints: number | null
  painted: number | null
}

function ShapePanel({ label, active, isAnswer, joints, painted }: ShapePanelProps) {
  const voxels = SHAPE_VOXELS[label]
  if (!voxels) return null

  let borderColor = '#D1D5DB'
  if (active && isAnswer) borderColor = GREEN
  else if (active) borderColor = ORANGE

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        minWidth: 64,
      }}
    >
      <CubeGroup voxels={voxels} width={60} pad={5} />
      <span
        className="font-display text-xs font-bold"
        style={{ color: active && isAnswer ? GREEN : active ? ORANGE : INK }}
      >
        {label}
      </span>
      <AnimatePresence>
        {active && joints !== null && (
          <motion.div
            key={`tag-${label}`}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded px-1 py-0.5 text-center font-display text-[10px] font-bold"
            style={{
              background: isAnswer ? GREEN_BG : ORANGE_BG,
              color: isAnswer ? GREEN_TEXT : '#92400E',
              border: `1.5px solid ${isAnswer ? GREEN : ORANGE}`,
            }}
          >
            {joints}j → {painted}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

export default function CubeShapes14Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCubeShapes14Steps(lang), [lang])
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
      ? 'Penjelasan: 4 kubus = 24 sisi. Setiap sambungan menyembunyikan 2 sisi. B (blok 2×2) punya 4 sambungan → hanya 16 sisi dicat — paling sedikit. Jawaban B.'
      : 'Explainer: 4 cubes = 24 faces. Each joint hides 2 faces. B (2×2 block) has 4 joints → only 16 faces to paint — the fewest. Answer B.'

  // Determine which shapes to highlight based on the beat phase
  const activeShapes = (() => {
    if (beat.phase === 'shapeA') return new Set(['A'])
    if (beat.phase === 'shapeB') return new Set(['B'])
    if (beat.phase === 'shapesCDE') return new Set(['C', 'D', 'E'])
    if (beat.phase === 'result') return new Set(['B'])
    return new Set<string>()
  })()

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five shape panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {SHAPE_LABELS.map((label) => {
            const isActive = activeShapes.has(label)
            const isAnswer = label === 'B' && (beat.phase === 'shapeB' || beat.phase === 'result')
            return (
              <ShapePanel
                key={label}
                label={label}
                active={isActive}
                isAnswer={isAnswer}
                joints={isActive ? beat.joints : null}
                painted={isActive ? beat.painted : null}
              />
            )
          })}
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

        {/* Caption */}
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
