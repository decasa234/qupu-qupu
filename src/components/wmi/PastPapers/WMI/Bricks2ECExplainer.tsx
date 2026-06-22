/**
 * IKMC-21-EC-Q2 — post-answer explainer: which 3-D shape can be built from 4 bricks?
 *
 * Teaches the "count unit cubes then check tilability" strategy:
 *   Beat 0 — intro: 4 bricks × 2 cubes = 8 unit cubes needed.
 *   Beat 1 — B: only 6 cubes → too small → ✗.
 *   Beat 2 — D: only 7 cubes → one short → ✗.
 *   Beat 3 — A: 8 cubes but internal brick orientation would overlap → ✗.
 *   Beat 4 — E: 8 cubes but irregular shape → bricks can't lie flat → ✗.
 *   Beat 5 — C: 8 cubes in a 2×2×2 cube → layer 1: 2 bricks; layer 2: rotated 90° → ✓.
 *   Beat 6 — result: only C works → answer C.
 *
 * Reuses CubeGroup from Bricks2ECIllustration; voxels are duplicated here
 * (same pattern as CubeShapes14Explainer) to avoid non-component exports.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CubeGroup } from './Bricks2ECIllustration'
import { buildBricks2ECSteps } from './bricks2ECSteps'

// ---------------------------------------------------------------------------
// Voxel sets (duplicated from Bricks2ECIllustration per house pattern)
// ---------------------------------------------------------------------------
type Voxel3 = [number, number, number]

const VOXELS_A: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
]
const VOXELS_B: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 1, 1], [1, 1, 1],
]
const VOXELS_C: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
]
const VOXELS_D: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [0, 1, 1], [1, 1, 1],
]
const VOXELS_E: Voxel3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [0, 1, 1],
  [2, 0, 0], [2, 1, 0],
]

const SHAPE_VOXELS: Record<string, Voxel3[]> = {
  A: VOXELS_A,
  B: VOXELS_B,
  C: VOXELS_C,
  D: VOXELS_D,
  E: VOXELS_E,
}

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const RED = '#EF4444'
const RED_BG = '#FEE2E2'
const RED_TEXT = '#991B1B'
const INK = '#1F2937'
const GRAY = '#D1D5DB'

// ---------------------------------------------------------------------------
// OptionPanel — one labelled isometric option with a status badge
// ---------------------------------------------------------------------------

interface OptionPanelProps {
  label: string
  active: boolean
  passes: boolean | null
  cubeCount: number | null
}

function OptionPanel({ label, active, passes, cubeCount }: OptionPanelProps) {
  const voxels = SHAPE_VOXELS[label]
  if (!voxels) return null

  let borderColor = GRAY
  if (active && passes === true) borderColor = GREEN
  else if (active && passes === false) borderColor = RED
  else if (active) borderColor = BLUE

  const tagBg = passes === true ? GREEN_BG : RED_BG
  const tagColor = passes === true ? GREEN_TEXT : RED_TEXT
  const tagBorder = passes === true ? GREEN : RED
  const tagIcon = passes === true ? '✓' : '✗'

  return (
    <motion.div
      layout
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        minWidth: 60,
      }}
    >
      <CubeGroup voxels={voxels} width={58} pad={5} />
      <span
        className="font-display text-xs font-bold"
        style={{
          color:
            active && passes === true
              ? GREEN
              : active && passes === false
                ? RED
                : INK,
        }}
      >
        {label}
      </span>
      <AnimatePresence>
        {active && cubeCount !== null && passes !== null && (
          <motion.div
            key={`tag-${label}`}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded px-1 py-0.5 text-center font-display text-[10px] font-bold"
            style={{
              background: tagBg,
              color: tagColor,
              border: `1.5px solid ${tagBorder}`,
            }}
          >
            {cubeCount}□ {tagIcon}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

const OPTION_ORDER = ['A', 'B', 'C', 'D', 'E'] as const

export default function Bricks2ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildBricks2ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : beat.passes === false
      ? { background: RED_BG, borderColor: RED, color: RED_TEXT }
      : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 4 bata × 2 = 8 unit kubus. B (6) dan D (7) terlalu kecil. A dan E memiliki 8 kubus tapi tidak bisa disusun dengan benar. Hanya C (kubus 2×2×2) yang pas — jawaban C.'
      : 'Explainer: 4 bricks × 2 = 8 unit cubes needed. B (6) and D (7) are too small. A and E have 8 cubes but cannot be tiled correctly. Only C (2×2×2 cube) works — answer C.'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Five option panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {OPTION_ORDER.map((label) => {
            const isActive = beat.activeOption === label
            return (
              <OptionPanel
                key={label}
                label={label}
                active={isActive}
                passes={isActive ? beat.passes : null}
                cubeCount={isActive ? beat.cubeCount : null}
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
                style={{
                  background:
                    isResult ? GREEN : beat.passes === false ? RED : BLUE,
                }}
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
