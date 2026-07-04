// SEAMO-22-B-Q9 — post-answer animation.
// Method: midline E–G splits ABCD in half; the two shaded triangles fill the top half.
// ∴ shaded = 40 ÷ 2 = 20 cm²  → B.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SVG_W,
  SVG_H,
  PAD,
  A,
  B,
  C,
  D,
  E,
  F,
  G,
  H,
  SHADE_FILL,
  RECT_STROKE,
} from './ShadedRect22B9Illustration'
import { buildShadedRect22B9Steps } from './shadedRect22B9Steps'

const BRAND_BLUE  = '#30598A'
const BLUE_BG     = '#E1EFFB'
const GREEN       = '#10B981'
const GREEN_BG    = '#D1FAE5'
const GREEN_DARK  = '#065F46'
const AMBER       = '#FCD34D'
const AMBER_LIGHT = '#FFFBEB'

function pt(p: { x: number; y: number }) {
  return `${p.x},${p.y}`
}

export default function ShadedRect22B9Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildShadedRect22B9Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_DARK }
    : { background: BLUE_BG, borderColor: BRAND_BLUE, color: BRAND_BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Garis tengah EG membagi ABCD menjadi dua sama; segitiga AHE + HDG menutupi tepat setengah atas; luas arsiran = 20 cm² → B.'
      : 'Midline EG halves ABCD; triangles AHE + HDG cover exactly the top half; shaded area = 20 cm² → B.'

  const FIG_W = Math.min(300, SVG_W)

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* White background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* Outer rectangle */}
          <rect
            x={PAD}
            y={PAD}
            width={SVG_W - 2 * PAD}
            height={SVG_H - 2 * PAD}
            fill="white"
            stroke={RECT_STROKE}
            strokeWidth={1.8}
          />

          {/* beat: top — highlight the whole top half amber (behind shading) */}
          <AnimatePresence>
            {beat.highlightTop && (
              <motion.rect
                key="top-half"
                x={PAD}
                y={PAD}
                width={SVG_W - 2 * PAD}
                height={(SVG_H - 2 * PAD) / 2}
                fill={AMBER}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
            )}
          </AnimatePresence>

          {/* Always show the two shaded triangles */}
          <polygon
            points={`${pt(A)} ${pt(H)} ${pt(E)}`}
            fill={isResult ? '#6EE7B7' : SHADE_FILL}
            stroke={RECT_STROKE}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />
          <polygon
            points={`${pt(H)} ${pt(D)} ${pt(G)}`}
            fill={isResult ? '#6EE7B7' : SHADE_FILL}
            stroke={RECT_STROKE}
            strokeWidth={1.2}
            strokeLinejoin="round"
          />

          {/* Interior lines */}
          <line x1={E.x} y1={E.y} x2={H.x} y2={H.y} stroke={RECT_STROKE} strokeWidth={1.4} />
          <line x1={H.x} y1={H.y} x2={F.x} y2={F.y} stroke={RECT_STROKE} strokeWidth={1.4} />
          <line x1={H.x} y1={H.y} x2={G.x} y2={G.y} stroke={RECT_STROKE} strokeWidth={1.4} />
          <line x1={E.x} y1={E.y} x2={F.x} y2={F.y} stroke={RECT_STROKE} strokeWidth={1.2} />
          <line x1={F.x} y1={F.y} x2={G.x} y2={G.y} stroke={RECT_STROKE} strokeWidth={1.2} />

          {/* beat: midline — animate E–G dashed midline */}
          <AnimatePresence>
            {beat.showMidline && (
              <motion.line
                key="midline"
                x1={E.x}
                y1={E.y}
                x2={G.x}
                y2={G.y}
                stroke={BRAND_BLUE}
                strokeWidth={2.2}
                strokeDasharray="6 4"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>

          {/* beat: midline — "20 cm²" labels on each half */}
          <AnimatePresence>
            {beat.showMidline && (
              <motion.g
                key="half-labels"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
              >
                {/* top half label */}
                <text
                  x={(PAD + SVG_W - PAD) / 2}
                  y={PAD + (SVG_H - 2 * PAD) / 4}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight={800}
                  fill={BRAND_BLUE}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  20 cm²
                </text>
                {/* bottom half label */}
                <text
                  x={(PAD + SVG_W - PAD) / 2}
                  y={PAD + (SVG_H - 2 * PAD) * 0.75}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={13}
                  fontWeight={800}
                  fill={BRAND_BLUE}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  20 cm²
                </text>
              </motion.g>
            )}
          </AnimatePresence>

          {/* Corner + midpoint labels */}
          {(
            [
              { p: A, label: 'A', anchor: 'end',    base: 'auto',    dx: -4, dy: -4 },
              { p: D, label: 'D', anchor: 'start',  base: 'auto',    dx:  4, dy: -4 },
              { p: C, label: 'C', anchor: 'start',  base: 'hanging', dx:  4, dy:  4 },
              { p: B, label: 'B', anchor: 'end',    base: 'hanging', dx: -4, dy:  4 },
              { p: H, label: 'H', anchor: 'middle', base: 'auto',    dx:  0, dy: -6 },
              { p: E, label: 'E', anchor: 'end',    base: 'central', dx: -4, dy:  0 },
              { p: F, label: 'F', anchor: 'middle', base: 'hanging', dx:  0, dy:  6 },
              { p: G, label: 'G', anchor: 'start',  base: 'central', dx:  4, dy:  0 },
            ] as Array<{
              p: { x: number; y: number }
              label: string
              anchor: 'start' | 'middle' | 'end'
              base: 'auto' | 'hanging' | 'central'
              dx: number
              dy: number
            }>
          ).map(({ p, label, anchor, base, dx, dy }) => (
            <text
              key={label}
              x={p.x + dx}
              y={p.y + dy}
              textAnchor={anchor}
              dominantBaseline={base}
              fontSize={12}
              fontWeight={700}
              fill="#1F2937"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {label}
            </text>
          ))}
        </svg>

        {/* Equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.75, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BRAND_BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
