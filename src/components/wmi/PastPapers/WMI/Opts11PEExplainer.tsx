/**
 * IKMC-20-PE-Q11 — post-answer explainer: which cube shape uses the most cubes?
 *
 * Strategy: count all cubes (including hidden ones) in each shape and compare.
 *   A (yellow staircase):  4 cubes
 *   B (orange plus):       5 cubes
 *   C (pink S-pentomino):  5 cubes
 *   D (purple Z-pentomino):5 cubes
 *   E (green L-tower):     6 cubes  ← answer!
 *
 * Beat-by-beat animation:
 *   0 — intro: count carefully, including hidden cubes.
 *   1 — A: 4 cubes (staircase).
 *   2 — B: 5 cubes (plus sign).
 *   3 — C & D: 5 cubes each.
 *   4 — E: 6 cubes (L-tower with 2-high stack on the left).
 *   5 — result: E wins → answer E.
 *
 * Reuses CubeGroupColored from Opts11PEIllustration so the option figures look
 * identical to those shown in the question.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CubeGroupColored } from './Opts11PEIllustration'
import { buildOpts11PESteps } from './opts11PESteps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const GREEN      = '#16A34A'
const GREEN_BG   = '#DCFCE7'
const GREEN_TEXT = '#14532D'
const BLUE       = '#1D4ED8'
const BLUE_BG    = '#DBEAFE'
const ORANGE     = '#D97706'
const ORANGE_BG  = '#FEF3C7'
const INK        = '#1F2937'
const GRAY       = '#D1D5DB'

// ---------------------------------------------------------------------------
// Voxel sets + palettes (mirrors Opts11PEIllustration to keep visuals in sync)
// ---------------------------------------------------------------------------
type Voxel3 = [number, number, number]

const VOXELS_A: Voxel3[] = [[0,0,2],[1,0,2],[2,0,1],[3,0,0]]
const VOXELS_B: Voxel3[] = [[1,0,0],[0,1,0],[1,1,0],[2,1,0],[1,2,0]]
const VOXELS_C: Voxel3[] = [[0,0,0],[1,0,0],[2,0,0],[1,1,0],[2,1,0]]
const VOXELS_D: Voxel3[] = [[0,0,0],[1,0,0],[2,0,0],[0,1,0],[1,1,0]]
const VOXELS_E: Voxel3[] = [[0,0,0],[1,0,0],[2,0,0],[3,0,0],[0,0,1],[0,0,2]]

const PALETTES = {
  A: { top: '#FFF176', left: '#FFD600', right: '#F9A825' },
  B: { top: '#FFCC80', left: '#FF9800', right: '#E65100' },
  C: { top: '#F48FB1', left: '#E91E63', right: '#880E4F' },
  D: { top: '#CE93D8', left: '#9C27B0', right: '#6A1B9A' },
  E: { top: '#A5D6A7', left: '#4CAF50', right: '#2E7D32' },
}

const SHAPE_VOXELS = { A: VOXELS_A, B: VOXELS_B, C: VOXELS_C, D: VOXELS_D, E: VOXELS_E }
const SHAPE_LABELS = ['A', 'B', 'C', 'D', 'E'] as const
const CUBE_COUNTS: Record<string, number> = { A: 4, B: 5, C: 5, D: 5, E: 6 }

// ---------------------------------------------------------------------------
// ShapePanel — one labelled shape with optional count badge
// ---------------------------------------------------------------------------

interface ShapePanelProps {
  label: string
  isActive: boolean
  isAnswer: boolean
  isElim: boolean
  count: number | null
  showCount: boolean
}

function ShapePanel({ label, isActive, isAnswer, isElim, count, showCount }: ShapePanelProps) {
  const voxels = SHAPE_VOXELS[label as keyof typeof SHAPE_VOXELS]
  const palette = PALETTES[label as keyof typeof PALETTES]
  if (!voxels || !palette) return null

  let borderColor = GRAY
  if (isActive && isAnswer) borderColor = GREEN
  else if (isActive && isElim) borderColor = ORANGE
  else if (isActive) borderColor = BLUE

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        minWidth: 56,
      }}
    >
      <CubeGroupColored voxels={voxels} palette={palette} width={56} pad={5} />
      <span
        className="font-display text-xs font-bold"
        style={{ color: isActive && isAnswer ? GREEN : isActive && isElim ? ORANGE : isActive ? BLUE : INK }}
      >
        {label}
      </span>
      <AnimatePresence>
        {isActive && showCount && count !== null && (
          <motion.div
            key={`tag-${label}-${count}`}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded px-1.5 py-0.5 text-center font-display text-[11px] font-black"
            style={{
              background: isAnswer ? GREEN_BG : ORANGE_BG,
              color: isAnswer ? GREEN_TEXT : '#92400E',
              border: `1.5px solid ${isAnswer ? GREEN : ORANGE}`,
            }}
          >
            {count}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

export default function Opts11PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildOpts11PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const activeSet = new Set(beat.activeShapes as ReadonlyArray<string>)

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Hitung semua kubus di setiap bentuk. A=4, B=5, C=5, D=5, E=6. Bentuk E (menara L hijau) punya kubus paling banyak. Jawaban E.'
      : 'Explainer: Count all cubes in each shape. A=4, B=5, C=5, D=5, E=6. Shape E (green L-tower) has the most cubes. Answer E.'

  // For showing count badges
  const showCount = beat.phase !== 'intro'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five shape panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {SHAPE_LABELS.map((label) => {
            const isActive = activeSet.has(label)
            const isAnswer = label === 'E' && (beat.phase === 'shapeE' || beat.phase === 'result')
            const isElim = isActive && !isAnswer && beat.eliminated
            const panelCount = isActive ? CUBE_COUNTS[label] : null
            return (
              <ShapePanel
                key={label}
                label={label}
                isActive={isActive}
                isAnswer={isAnswer}
                isElim={isElim}
                count={panelCount}
                showCount={showCount}
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
