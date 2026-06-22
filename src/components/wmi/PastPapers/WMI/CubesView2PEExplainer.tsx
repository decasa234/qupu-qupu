// IKMC-23-PE-Q2 — Explainer
//
// Post-answer animated walkthrough for:
// "5 cubes viewed from the front → what is the top view?" (Answer B).
//
// Walks through 5 beats:
//   1 (intro)  — plain front elevation; introduce the 3-column layout.
//   2 (col-l)  — highlight left column; note RED is on top → seen from above = red.
//   3 (col-m)  — highlight middle column; YELLOW only.
//   4 (col-r)  — highlight right column; BLUE is on top → seen from above = blue.
//   5 (result) — show assembled top-view strip [red|yellow|blue] → answer B.

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildCubesView2PESteps } from './cubesView2PESteps'
import { OPTION_COLS, TopViewRow } from './CubesView2PEIllustration'

// ---------------------------------------------------------------------------
// Colours (must match the illustration)
// ---------------------------------------------------------------------------

const INK = '#1F2937'

const COL_RED  = '#D9534F'
const COL_BLUE = '#3A80C1'
const COL_YEL  = '#F5C842'

const COL_RED_DARK  = '#A53530'
const COL_BLUE_DARK = '#235A8A'
const COL_YEL_DARK  = '#C49B10'

const HIGHLIGHT_RING = '#F59E0B'   // amber ring around the focused column
const GREEN = '#10B981'

// ---------------------------------------------------------------------------
// Front-elevation data (column heights + fills, same as the illustration)
// ---------------------------------------------------------------------------

const HEIGHTS_FRONT = [2, 1, 2]

const COL_FILLS = [
  [COL_RED,  COL_YEL],
  [COL_YEL],
  [COL_BLUE, COL_YEL],
]
const COL_DARKS = [
  [COL_RED_DARK,  COL_YEL_DARK],
  [COL_YEL_DARK],
  [COL_BLUE_DARK, COL_YEL_DARK],
]

const CUBE_W = 38
const CUBE_H = 38
const GAP    = 2
const MAX_H  = 2

// ---------------------------------------------------------------------------
// AnimatedFrontElevation — same as the illustration but with one column
// circled when highlightCol >= 0.
// ---------------------------------------------------------------------------

function AnimatedFrontElevation({ highlightCol }: { highlightCol: number }) {
  const numCols = HEIGHTS_FRONT.length
  const svgW = numCols * CUBE_W + (numCols - 1) * GAP + 24
  const svgH = MAX_H * CUBE_H + 28

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width="100%"
      style={{ maxWidth: 180, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {HEIGHTS_FRONT.map((h, colIdx) => {
        const colX = 12 + colIdx * (CUBE_W + GAP)
        const baseY = svgH - 12
        const isLit = highlightCol === colIdx

        return (
          <g key={colIdx}>
            {/* highlight ring around the focused column */}
            {isLit && (
              <rect
                x={colX - 3}
                y={baseY - h * CUBE_H - 3}
                width={CUBE_W + 6}
                height={h * CUBE_H + 6}
                fill="none"
                stroke={HIGHLIGHT_RING}
                strokeWidth={3}
                rx={4}
              />
            )}

            {Array.from({ length: h }, (_, rowFromTop) => {
              const cubeY = baseY - (h - rowFromTop) * CUBE_H
              const fill = COL_FILLS[colIdx][rowFromTop] ?? COL_YEL
              const dark = COL_DARKS[colIdx][rowFromTop] ?? COL_YEL_DARK
              const strip = CUBE_W * 0.12

              return (
                <g key={rowFromTop} opacity={highlightCol >= 0 && !isLit ? 0.35 : 1}>
                  <rect
                    x={colX}
                    y={cubeY}
                    width={CUBE_W}
                    height={CUBE_H}
                    fill={fill}
                    stroke={INK}
                    strokeWidth={1.4}
                    strokeLinejoin="round"
                  />
                  <rect
                    x={colX}
                    y={cubeY}
                    width={strip}
                    height={CUBE_H}
                    fill={dark}
                    opacity={0.45}
                  />
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// The explainer component
// ---------------------------------------------------------------------------

/**
 * CubesView2PEExplainer — post-answer explainer for IKMC-23-PE-Q2.
 */
export default function CubesView2PEExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildCubesView2PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tampilan dari atas adalah merah | kuning | biru — jawaban B.'
      : 'Explainer: the top view is red | yellow | blue — answer B.'

  const captionStyle = beat.result
    ? { background: '#D1FAE5', borderColor: GREEN,    color: '#065F46' }
    : { background: '#E1EFFB', borderColor: '#30598A', color: '#1E3A5F' }

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Front elevation — animates column highlighting */}
        <AnimatedFrontElevation highlightCol={beat.highlightCol} />

        {/* Top-view answer strip (revealed on final beat) */}
        {beat.showTopView && (
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-display text-xs font-bold"
              style={{ color: '#374151' }}
            >
              {lang === 'id' ? 'Tampilan dari atas:' : 'Top view:'}
            </span>
            <TopViewRow colours={OPTION_COLS['B']} />
          </div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
