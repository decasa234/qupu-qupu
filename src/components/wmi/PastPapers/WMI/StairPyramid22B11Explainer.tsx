// Post-answer explainer for SEAMO-22-B-Q11.
// "3 layers of 2×2×2 cm cubes — find total visible surface area from top and sides."
// Answer: E (132 cm²) = 33 unit faces × 4 cm².
//
// Beats:
//   1 (intro)   — full pyramid shown in blue; each face = 4 cm².
//   2 (top)     — top 9 exposed faces highlighted gold.
//   3 (front)   — front 3 faces highlighted amber.
//   4 (back)    — back 9 faces highlighted green.
//   5 (sides)   — left+right 6+6 faces highlighted purple.
//   6 (total)   — confirm 33 × 4 = 132 cm², answer E.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoCubes, ISO_BLUE_PALETTE } from './primitives/IsoCubes'
import type { IsoCube } from './primitives/IsoCubes'
import { SEAMO22B11_CUBES } from './StairPyramid22B11Illustration'
import { buildStairPyramid22B11Steps } from './stairPyramid22B11Steps'

const GREEN  = '#10B981'
const BLUE   = '#30598A'

// Colour constants for highlighted face groups
const C_TOP   = '#FFD23F'  // gold — top faces
const C_FRONT = '#F97316'  // amber/orange — front faces
const C_BACK  = '#34D399'  // green — back faces
const C_SIDE  = '#A78BFA'  // purple — side faces

// ---------------------------------------------------------------------------
// Build coloured cube array based on which face groups are highlighted.
// Each cube is coloured based on its position in the staircase.
// ---------------------------------------------------------------------------

function buildHighlightedCubes(highlightFaces: Set<string>): IsoCube[] {
  return SEAMO22B11_CUBES.map((c): IsoCube => {
    const { x, y, z } = c

    // Top faces: cubes whose top is exposed (no cube directly above at z+1)
    // z=0: exposed top only if y=0 (front row, z=1 starts at y=1)
    // z=1: exposed top only if y=1 (z=2 starts at y=2)
    // z=2: always exposed (top layer)
    const isTopExposed =
      (z === 0 && y === 0) ||
      (z === 1 && y === 1) ||
      z === 2

    // Front faces: cubes at y=0, z=0 (only bottom front row is visible from the front)
    const isFrontVisible = y === 0 && z === 0

    // Back faces: cubes at y=2 (all layers visible from the back)
    const isBackVisible = y === 2

    // Left side (x=0): staircase profile visible from the left
    // z=0: all y visible → 3 faces; z=1: y=1,2 → 2 faces; z=2: y=2 → 1 face
    const isLeftVisible = x === 0

    // Right side (x=2): same as left
    const isRightVisible = x === 2

    // Determine colour override based on active highlights
    if (highlightFaces.has('top') && isTopExposed) {
      return { ...c, color: C_TOP }
    }
    if (highlightFaces.has('front') && isFrontVisible) {
      return { ...c, color: C_FRONT }
    }
    if (highlightFaces.has('back') && isBackVisible) {
      return { ...c, color: C_BACK }
    }
    if (highlightFaces.has('left') && isLeftVisible) {
      return { ...c, color: C_SIDE }
    }
    if (highlightFaces.has('right') && isRightVisible) {
      return { ...c, color: C_SIDE }
    }

    return c
  })
}

// ---------------------------------------------------------------------------
// Explainer component
// ---------------------------------------------------------------------------

export default function StairPyramid22B11Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildStairPyramid22B11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cubes = buildHighlightedCubes(beat.highlightFaces)

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: 33 wajah unit terlihat dari atas dan samping × 4 cm² = 132 cm².`
      : `Explainer: 33 visible unit faces from top and sides × 4 cm² = 132 cm².`

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Pyramid figure — faces highlighted per beat */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3">
          <IsoCubes
            cubes={cubes}
            size={26}
            palette={ISO_BLUE_PALETTE}
            viewPadding={10}
          />
        </div>

        {/* Face + area running total */}
        {beat.runningFaces > 0 && (
          <motion.div
            key={`area-${beat.runningArea}`}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-xl font-black tabular-nums"
            style={{ color: beat.result ? GREEN : BLUE }}
          >
            {beat.runningFaces} {lang === 'id' ? 'wajah' : 'faces'} × 4 = {beat.runningArea} cm²
          </motion.div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE,  color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
