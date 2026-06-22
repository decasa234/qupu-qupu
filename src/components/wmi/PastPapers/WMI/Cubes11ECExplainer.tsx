// IKMC-21-EC-Q11 — post-answer explainer: find the grey part by subtraction.
//
// Strategy:
//   total = 18 cubes
//   white = 4 (front-left 2×2 of top layer)
//   black = 5 (right column + back row of bottom layer)
//   grey  = 18 − 4 − 5 = 9 cubes → answer E
//
// Reuses the isometric solid and colour logic from Cubes11ECIllustration.
// Animation highlights white → black → reveals grey → result.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildCubes11ECSteps } from './cubes11ECSteps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const BLUE       = '#30598A'
const BLUE_BG    = '#E1EFFB'
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const INK        = '#1F2937'

// ---------------------------------------------------------------------------
// Isometric primitive — matches Cubes11ECIllustration exactly
// ---------------------------------------------------------------------------

const SIZE = 22
const CX = SIZE * 0.866
const CY = SIZE * 0.5

type Voxel = [number, number, number]

function project([x, y, z]: Voxel): { sx: number; sy: number } {
  return { sx: (x + y) * CX, sy: (x - y) * CY - z * SIZE }
}

function paintOrder(voxels: Voxel[]): Voxel[] {
  return [...voxels].sort((a, b) => b[1] - a[1] || a[2] - b[2] || a[0] - b[0])
}

// Colour palettes
const WHITE_T = '#F0F4F8'; const WHITE_L = '#CBD5E0'; const WHITE_R = '#A0AEC0'
const BLACK_T = '#4A5568'; const BLACK_L = '#2D3748'; const BLACK_R = '#1A202C'
const GREY_T  = '#C0C8D0'; const GREY_L  = '#8896A4'; const GREY_R  = '#647080'
const LIT_T   = '#FDE68A'; const LIT_L   = '#F59E0B'; const LIT_R   = '#D97706'
const DIM_OPACITY = 0.18

const WHITE_SET = new Set(['0,0,1', '1,0,1', '0,1,1', '1,1,1'])
const BLACK_SET = new Set(['2,0,0', '2,1,0', '2,2,0', '0,2,0', '1,2,0'])

function cubeColorType(x: number, y: number, z: number): 'white' | 'black' | 'grey' {
  const k = `${x},${y},${z}`
  if (WHITE_SET.has(k)) return 'white'
  if (BLACK_SET.has(k)) return 'black'
  return 'grey'
}

interface IsoCubeProps {
  v: Voxel
  top: string; left: string; right: string
  opacity?: number
}

function IsoCube({ v, top, left, right, opacity = 1 }: IsoCubeProps) {
  const { sx, sy } = project(v)
  const tp  = `${sx},${sy} ${sx+CX},${sy-CY} ${sx+2*CX},${sy} ${sx+CX},${sy+CY}`
  const lp  = `${sx},${sy} ${sx+CX},${sy+CY} ${sx+CX},${sy+CY+SIZE} ${sx},${sy+SIZE}`
  const rp  = `${sx+CX},${sy+CY} ${sx+2*CX},${sy} ${sx+2*CX},${sy+SIZE} ${sx+CX},${sy+CY+SIZE}`
  return (
    <g opacity={opacity}>
      <polygon points={tp} fill={top}   stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      <polygon points={lp} fill={left}  stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      <polygon points={rp} fill={right} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Animated 18-cube solid
// ---------------------------------------------------------------------------

function buildStemVoxels(): Voxel[] {
  const out: Voxel[] = []
  for (let x = 0; x < 3; x++)
    for (let y = 0; y < 3; y++)
      for (let z = 0; z < 2; z++)
        out.push([x, y, z])
  return out
}

const STEM_VOXELS: Voxel[] = buildStemVoxels()

interface AnimSolidProps {
  litWhite: boolean
  litBlack: boolean
  litGrey: boolean
}

function AnimSolid({ litWhite, litBlack, litGrey }: AnimSolidProps) {
  // Compute viewBox
  const allPts = STEM_VOXELS.flatMap(v => {
    const { sx, sy } = project(v)
    return [sx, sx + 2 * CX, sy - CY, sy + CY + SIZE]
  })
  const pad = 10
  const minX = Math.min(...allPts.filter((_, i) => i % 4 === 0)) - pad
  const maxX = Math.max(...allPts.filter((_, i) => i % 4 === 1)) + pad
  const minY = Math.min(...allPts.filter((_, i) => i % 4 === 2)) - pad
  const maxY = Math.max(...allPts.filter((_, i) => i % 4 === 3)) + pad

  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      width="100%"
      style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {paintOrder(STEM_VOXELS).map((v, i) => {
        const col = cubeColorType(v[0], v[1], v[2])
        const isActive =
          (col === 'white' && litWhite) ||
          (col === 'black' && litBlack) ||
          (col === 'grey'  && litGrey)
        const isDimmed =
          !isActive && (litWhite || litBlack || litGrey)

        let t: string, l: string, r: string
        if (isActive) {
          t = LIT_T; l = LIT_L; r = LIT_R
        } else if (col === 'white') {
          t = WHITE_T; l = WHITE_L; r = WHITE_R
        } else if (col === 'black') {
          t = BLACK_T; l = BLACK_L; r = BLACK_R
        } else {
          t = GREY_T; l = GREY_L; r = GREY_R
        }

        return <IsoCube key={i} v={v} top={t} left={l} right={r} opacity={isDimmed ? DIM_OPACITY : 1} />
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------

export default function Cubes11ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCubes11ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map(s => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel = lang === 'id'
    ? '18 kubus total − 4 putih − 5 hitam = 9 kubus abu-abu. Susunan abu-abu cocok dengan gambar E — jawaban E.'
    : '18 total cubes − 4 white − 5 black = 9 grey cubes. The grey arrangement matches picture E — answer E.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Animated 18-cube solid */}
        <div className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <AnimSolid
            litWhite={beat.litWhite}
            litBlack={beat.litBlack}
            litGrey={beat.litGrey}
          />
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
