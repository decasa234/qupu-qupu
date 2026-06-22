// IKMC-22-PE-Q1 — post-answer explainer: "Which box contains the most triangles?"
//
// Strategy: examine each box in turn, count ONLY the triangles, track the
// running best. Box B has 4 triangles (the most) → answer B.
//
// Beats (7 total):
//   0. Goal  — read one box at a time, count ONLY triangles.
//   1. Box A — 1 triangle (best so far: A).
//   2. Box B — 4 triangles (new best: B).
//   3. Box C — 2 triangles (still B).
//   4. Box D — 3 triangles (still B).
//   5. Box E — 1 triangle (still B).
//   6. Result— B wins with 4.
//
// Reuses ShapeGlyph + OPTION_SHAPES + TRIANGLE_COUNTS from the Illustration so
// the animation reads as the same boxes coming alive. Deterministic, SSR-safe.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  ShapeGlyph,
  OPTION_SHAPES,
  TRIANGLE_COUNTS,
  OPTION_LABELS,
} from './TriangleBoxes1PEIllustration'
import { buildTriangleBoxesSteps } from './triangleBoxes1PESteps'

// ---------------------------------------------------------------------------
// Colour tokens
// ---------------------------------------------------------------------------
const GREEN = '#10B981'
const GREEN_DEEP = '#065F46'
const GREEN_BG = '#D1FAE5'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const HIGHLIGHT = '#F59E0B'
const DIM_OPACITY = 0.28

// ---------------------------------------------------------------------------
// Box geometry
// ---------------------------------------------------------------------------
const BW = 118   // box width
const BH = 82    // box height
const PAD = 4    // border padding
const IW = BW - PAD * 2
const IH = BH - PAD * 2

// ---------------------------------------------------------------------------
// TriangleCounter badge — pops in under the active box
// ---------------------------------------------------------------------------
function TriangleBadge({ count, isNew }: { count: number; isNew: boolean }) {
  return (
    <motion.g
      key={count}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 340, damping: 20 }}
    >
      <rect
        x={-22}
        y={0}
        width={44}
        height={22}
        rx={6}
        fill={isNew ? HIGHLIGHT : '#F3F4F6'}
        stroke={isNew ? '#D97706' : '#9CA3AF'}
        strokeWidth={1.5}
      />
      <text
        x={0}
        y={15}
        textAnchor="middle"
        fontSize={13}
        fontWeight={800}
        fill={isNew ? '#92400E' : '#374151'}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {count}
      </text>
    </motion.g>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------
export default function TriangleBoxes1PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildTriangleBoxesSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: count triangles in each box. Box B has 4 triangles, the most. Answer B.`,
    `Penjelasan: hitung segitiga di setiap kotak. Kotak B punya 4 segitiga, paling banyak. Jawaban B.`,
  )

  // Row layout: 5 boxes side by side
  const GAP = 8
  const totalW = OPTION_LABELS.length * BW + (OPTION_LABELS.length - 1) * GAP
  const BADGE_H = 26
  const SVG_H = BH + BADGE_H + 6

  const isResult = beat.phase === 'result'

  return (
    <div
      className="mx-auto w-full max-w-[660px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Five boxes with shape glyphs + triangle count badges */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <svg
            viewBox={`0 0 ${totalW} ${SVG_H}`}
            width="100%"
            style={{ maxWidth: totalW, display: 'block', margin: '0 auto' }}
            aria-hidden="true"
          >
            {OPTION_LABELS.map((label, i) => {
              const shapes = OPTION_SHAPES[label]
              const triCount = TRIANGLE_COUNTS[label]
              const isActive = beat.option === label
              const isKnown = beat.counted.includes(label)
              const isBest = beat.best === label
              const dim = !isKnown && beat.phase !== 'goal'
              const ox = i * (BW + GAP)

              // Box fill highlight colour
              const boxStroke =
                isResult && isBest
                  ? GREEN
                  : isActive
                    ? HIGHLIGHT
                    : '#1F2937'

              const boxStrokeW =
                (isActive && !isResult) || (isResult && isBest) ? 2.5 : 1.5

              return (
                <g key={label} opacity={dim ? DIM_OPACITY : 1}>
                  {/* option letter */}
                  <text
                    x={ox + BW / 2}
                    y={14}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={700}
                    fill={
                      isResult && isBest
                        ? GREEN_DEEP
                        : isActive
                          ? '#92400E'
                          : '#6B7280'
                    }
                  >
                    {label}
                  </text>
                  {/* box border */}
                  <rect
                    x={ox}
                    y={16}
                    width={BW}
                    height={BH}
                    fill="#FFFFFF"
                    stroke={boxStroke}
                    strokeWidth={boxStrokeW}
                    rx={3}
                  />
                  {/* shapes — triangles highlighted on active beat */}
                  {shapes.map((sh, si) => {
                    const isTriangle = sh.kind === 'triangle'
                    // On a count beat for this box, make triangles pulse slightly
                    const highlightTri = isActive && isTriangle
                    return (
                      <g
                        key={si}
                        opacity={
                          isActive && sh.kind !== 'triangle' && beat.phase === 'count'
                            ? 0.45
                            : 1
                        }
                      >
                        <ShapeGlyph
                          kind={sh.kind}
                          cx={ox + PAD + sh.fx * IW}
                          cy={16 + PAD + sh.fy * IH}
                          s={sh.fs * IH}
                        />
                        {/* triangle accent ring */}
                        {highlightTri && (
                          <circle
                            cx={ox + PAD + sh.fx * IW}
                            cy={16 + PAD + sh.fy * IH}
                            r={sh.fs * IH * 1.35}
                            fill="none"
                            stroke={HIGHLIGHT}
                            strokeWidth={1.8}
                            strokeDasharray="4 3"
                          />
                        )}
                      </g>
                    )
                  })}
                  {/* triangle count badge */}
                  {isKnown && (
                    <g transform={`translate(${ox + BW / 2}, ${16 + BH + 4})`}>
                      <TriangleBadge
                        count={triCount}
                        isNew={isBest && beat.option === label}
                      />
                    </g>
                  )}
                  {/* result crown indicator */}
                  {isResult && isBest && (
                    <text
                      x={ox + BW / 2}
                      y={16 + BH + 30}
                      textAnchor="middle"
                      fontSize={16}
                      fill={GREEN}
                    >
                      ★
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_DEEP }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
