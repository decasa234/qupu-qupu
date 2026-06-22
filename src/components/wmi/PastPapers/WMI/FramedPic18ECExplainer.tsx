import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  FrameGrid,
  SVG_W,
  SVG_H,
  CELL,
  PAD,
  OUTER_N,
  OUTER_BOTTOM_Y,
  COLOR,
} from './FramedPic18ECIllustration'
import { buildFramedPic18ECSteps } from './framedPic18ECSteps'

// IKMC-19-EC-Q18 — post-answer beat-driven explainer.
// Reuses FrameGrid from the illustration so the animation reads as the
// static 7×7 framed picture coming alive.
//
// Beat sequence:
//   0. intro      — framed picture + "32 squares".
//   1. top-side   — orange highlight on top border row, count 9.
//   2. sides      — orange ring on all 32 border cells, 4×9−4=32.
//   3. formula    — formula chip: 4(n+2)−4, verify n=7.
//   4. apply      — switch to 10×10 scene (12×12 outer), 4×12−4=44.
//   5. result     — 44 → C (green).

const GREEN  = '#10B981'
const BLUE   = '#30598A'
const ORANGE = '#f0853a'

const FIG_W = Math.min(300, SVG_W)

// ── Border-cell highlight overlay (all 32 cells, orange tint) ────────────────

/** Renders all 32 border cells of the n×n+2 outer grid with an orange tint. */
function AllBorderHighlight({ outerN, cellSize, pad }: { outerN: number; cellSize: number; pad: number }) {
  const gxLocal = (c: number) => pad + c * cellSize
  const gyLocal = (r: number) => pad + r * cellSize
  const cells: JSX.Element[] = []
  for (let r = 0; r < outerN; r++) {
    for (let c = 0; c < outerN; c++) {
      const isBorder = r === 0 || r === outerN - 1 || c === 0 || c === outerN - 1
      if (!isBorder) continue
      cells.push(
        <rect
          key={`hi${r}_${c}`}
          x={gxLocal(c)}
          y={gyLocal(r)}
          width={cellSize}
          height={cellSize}
          fill={ORANGE}
          fillOpacity={0.35}
          stroke={ORANGE}
          strokeWidth={2}
        />,
      )
    }
  }
  return <g>{cells}</g>
}

/** Highlights just the top border row (row 0 of the outer grid). */
function TopRowHighlight({ outerN, cellSize, pad }: { outerN: number; cellSize: number; pad: number }) {
  const gxLocal = (c: number) => pad + c * cellSize
  const gyLocal = (r: number) => pad + r * cellSize
  const cells: JSX.Element[] = []
  for (let c = 0; c < outerN; c++) {
    cells.push(
      <rect
        key={`top${c}`}
        x={gxLocal(c)}
        y={gyLocal(0)}
        width={cellSize}
        height={cellSize}
        fill={ORANGE}
        fillOpacity={0.45}
        stroke={ORANGE}
        strokeWidth={2.5}
      />,
    )
  }
  return <g>{cells}</g>
}

// ── 10×10 apply scene ─────────────────────────────────────────────────────────

/**
 * Compact 12×12 outer grid for the n=10 "apply" beat.
 * Uses smaller cell size to fit within SVG_W.
 */
function ApplyGrid({ isResult }: { isResult: boolean }) {
  const SMALL_CELL = 19
  const SMALL_PAD = PAD
  const SMALL_OUTER = 12  // 10 + 2

  const svgWS = SMALL_PAD * 2 + SMALL_OUTER * SMALL_CELL
  const svgHS = svgWS

  const gxS = (c: number) => SMALL_PAD + c * SMALL_CELL
  const gyS = (r: number) => SMALL_PAD + r * SMALL_CELL

  // Inner picture area fill (light sky)
  const innerX = gxS(1)
  const innerY = gyS(1)
  const innerW = 10 * SMALL_CELL
  const innerH = 10 * SMALL_CELL

  const accentColor = isResult ? GREEN : ORANGE

  const frameCells: JSX.Element[] = []
  for (let r = 0; r < SMALL_OUTER; r++) {
    for (let c = 0; c < SMALL_OUTER; c++) {
      const isBorder = r === 0 || r === SMALL_OUTER - 1 || c === 0 || c === SMALL_OUTER - 1
      if (!isBorder) continue
      frameCells.push(
        <rect
          key={`s${r}_${c}`}
          x={gxS(c)}
          y={gyS(r)}
          width={SMALL_CELL}
          height={SMALL_CELL}
          fill={isResult ? '#D1FAE5' : '#FDE68A'}
          stroke={accentColor}
          strokeWidth={1.5}
        />,
      )
    }
  }

  return (
    <svg
      viewBox={`0 0 ${svgWS} ${svgHS}`}
      width={Math.min(FIG_W, svgWS)}
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect x={0} y={0} width={svgWS} height={svgHS} fill="white" />
      {/* inner picture */}
      <rect x={innerX} y={innerY} width={innerW} height={innerH} fill={COLOR.SKY} />
      {/* inner picture label */}
      <text
        x={innerX + innerW / 2}
        y={innerY + innerH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={800}
        fill="#1F2937"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        10×10
      </text>
      {/* border cells */}
      {frameCells}
      {/* dimension label below */}
      <text
        x={svgWS / 2}
        y={svgHS - 4}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={10}
        fontWeight={700}
        fill={accentColor}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        outer: 12×12
      </text>
    </svg>
  )
}

// ── Formula chip ──────────────────────────────────────────────────────────────

function FormulaChip({ y, isResult }: { y: number; isResult: boolean }) {
  const color = isResult ? GREEN : BLUE
  const label = isResult ? '4 × 12 − 4 = 44' : '4 × (n+2) − 4'
  return (
    <g>
      <rect
        x={SVG_W / 2 - 72}
        y={y}
        width={144}
        height={22}
        rx={11}
        fill={color}
        opacity={0.14}
      />
      <text
        x={SVG_W / 2}
        y={y + 11}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={800}
        fill={color}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function FramedPic18ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildFramedPic18ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: tepi gambar 7×7 berisi 4×9−4=32 kotak; rumus bingkai 4(n+2)−4; untuk 10×10: 4×12−4=44 — jawaban C.'
      : 'Explainer: border of 7×7 picture has 4×9−4=32 squares; frame formula 4(n+2)−4; for 10×10: 4×12−4=44 — answer C.'

  // SVG for the 7×7 scene beats (with optional formula chip)
  const svgH7 = SVG_H + (beat.showFormula && !beat.showApply ? 36 : 0)

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure area */}
        <AnimatePresence mode="wait">

          {/* ── 7×7 scene beats (intro / top-side / sides / formula) ── */}
          {!beat.showApply && (
            <motion.div
              key="scene7"
              className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg
                viewBox={`0 0 ${SVG_W} ${svgH7}`}
                width={FIG_W}
                style={{ display: 'block' }}
                aria-hidden="true"
              >
                <rect x={0} y={0} width={SVG_W} height={svgH7} fill="white" />

                {/* base framed picture */}
                <FrameGrid />

                {/* top-row highlight: beat top-side */}
                <AnimatePresence>
                  {beat.highlightTop && (
                    <motion.g
                      key="top-hi"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    >
                      <TopRowHighlight outerN={OUTER_N} cellSize={CELL} pad={PAD} />
                    </motion.g>
                  )}
                </AnimatePresence>

                {/* all-border highlight: beat sides */}
                <AnimatePresence>
                  {beat.highlightAll && (
                    <motion.g
                      key="all-hi"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    >
                      <AllBorderHighlight outerN={OUTER_N} cellSize={CELL} pad={PAD} />
                    </motion.g>
                  )}
                </AnimatePresence>

                {/* border-cell count label (beat sides) */}
                <AnimatePresence>
                  {beat.highlightAll && (
                    <motion.g
                      key="count-label"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                    >
                      <text
                        x={SVG_W / 2}
                        y={OUTER_BOTTOM_Y - 4}
                        textAnchor="middle"
                        dominantBaseline="auto"
                        fontSize={12}
                        fontWeight={800}
                        fill={ORANGE}
                        fontFamily="ui-sans-serif, system-ui, sans-serif"
                      >
                        32 squares / kotak
                      </text>
                    </motion.g>
                  )}
                </AnimatePresence>

                {/* formula chip: beat formula */}
                <AnimatePresence>
                  {beat.showFormula && (
                    <motion.g
                      key="formula"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                    >
                      <FormulaChip y={SVG_H + 8} isResult={false} />
                    </motion.g>
                  )}
                </AnimatePresence>
              </svg>
            </motion.div>
          )}

          {/* ── 10×10 apply scene (beats apply / result) ── */}
          {beat.showApply && (
            <motion.div
              key="scene10"
              className="w-full overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              <ApplyGrid isResult={isResult} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* equation pill */}
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

        {/* caption */}
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
