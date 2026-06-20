// IKMC-19-PE-Q15 — post-answer animated explainer.
//
// Reuses TileFloorPrimitive + layout constants from TileFloor15Illustration so
// the animation reads as the static scene coming alive.
//
// Beat sequence:
//   0. intro    — static floor, short side labelled 1 m.
//   1. pattern  — ring the cross-section (3 horizontal tiles beside 1 vertical);
//                 equation "3 × 1 m".
//   2. long     — annotate the vertical tile's long side as 3 m;
//                 equation "3 × 1 m = 3 m".
//   3. count    — ring the 4 vertical tiles on the "?" side; equation "4 × 3 m".
//   4. result   — equation "4 × 3 m = 12 m"; green caption.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  TileFloorPrimitive,
  SVG_W,
  SVG_H,
  GRID_X,
  GRID_Y,
  GRID_H,
  SHORT,
  LONG,
  ROW_H,
  N_ROWS,
  COLOR,
} from './TileFloor15Illustration'
import { buildTileFloor15Steps } from './tileFloor15Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN       = '#10B981'
const GREEN_LIGHT = '#D1FAE5'
const BLUE        = '#30598A'
const BLUE_LIGHT  = '#E1EFFB'
const ORANGE      = '#F59E0B'
const HIGHLIGHT   = '#FCA500'

// ── sub-components ────────────────────────────────────────────────────────────

/**
 * CrossSectionHighlight — rings the first column-group of the top row to show
 * 3 horizontal tiles (right slot) beside 1 vertical tile (left slot).
 * Uses a dashed orange rectangle overlay.
 */
function CrossSectionHighlight() {
  // The first column group spans x: GRID_X .. GRID_X + (SHORT + LONG) = GRID_X + 80
  // and y: GRID_Y .. GRID_Y + LONG (= one row height = 60 px)
  const x = GRID_X - 2
  const y = GRID_Y - 2
  const w = SHORT + LONG + 4   // 84
  const h = LONG + 4           // 64

  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill="none"
      stroke={ORANGE}
      strokeWidth={2.5}
      strokeDasharray="5 3"
      rx={3}
    />
  )
}

/**
 * LongSideLabel — shows "3 m" annotation on the long side of the first
 * vertical tile (left slot of first column group, top row).
 */
function LongSideLabel({ color }: { color: string }) {
  const tileX = GRID_X + SHORT   // right edge of first vertical tile
  const tileTopY = GRID_Y
  const tileBotY = GRID_Y + LONG
  const midY = (tileTopY + tileBotY) / 2
  const bx = tileX + 10
  const tick = 4

  return (
    <g fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round">
      {/* vertical brace on the right of the vertical tile */}
      <line x1={bx} y1={tileTopY} x2={bx} y2={tileBotY} />
      <line x1={bx - tick} y1={tileTopY} x2={bx + tick} y2={tileTopY} />
      <line x1={bx - tick} y1={tileBotY} x2={bx + tick} y2={tileBotY} />
      {/* label */}
      <text
        x={bx + 7}
        y={midY}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fill={color}
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        3 m
      </text>
    </g>
  )
}

/**
 * SideHighlight — rings the N_ROWS vertical tiles on the far-left column,
 * highlighting the "?" side tiles.
 */
function SideHighlight() {
  // Far-left column: x = GRID_X .. GRID_X + SHORT; full height GRID_H
  const x = GRID_X - 3
  const y = GRID_Y - 3
  const w = SHORT + 6
  const h = GRID_H + 6

  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      fill="rgba(251, 191, 36, 0.18)"
      stroke={HIGHLIGHT}
      strokeWidth={2.5}
      strokeDasharray="6 3"
      rx={3}
    />
  )
}

/**
 * CountLabels — small "×3 m" labels beside each highlighted vertical tile on
 * the left column, showing the multiplication clearly.
 */
function CountLabels({ color }: { color: string }) {
  return (
    <g fontSize={10} fontWeight={700} fill={color} fontFamily="ui-sans-serif, system-ui, sans-serif">
      {Array.from({ length: N_ROWS }, (_, i) => {
        const midY = GRID_Y + i * ROW_H + ROW_H / 2
        return (
          <text
            key={i}
            x={GRID_X - 6}
            y={midY}
            textAnchor="end"
            dominantBaseline="central"
          >
            3 m
          </text>
        )
      })}
    </g>
  )
}

/**
 * QuestionBracket — the "?" bracket on the left side (always shown in explainer).
 */
function QuestionBracket({ color }: { color: string }) {
  const x = GRID_X - 24
  const topY = GRID_Y
  const botY = GRID_Y + GRID_H
  const midY = (topY + botY) / 2
  const tick = 5

  return (
    <g fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round">
      <line x1={x} y1={topY} x2={x} y2={botY} />
      <line x1={x - tick} y1={topY} x2={x + tick} y2={topY} />
      <line x1={x - tick} y1={botY} x2={x + tick} y2={botY} />
      <text
        x={x - 7}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
        fontWeight={900}
        fill={color}
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        ?
      </text>
    </g>
  )
}

/**
 * ShortSideLabel — the "1 m" brace at the top of the first vertical tile
 * (always shown in explainer).
 */
function ShortSideLabel({ color }: { color: string }) {
  const tileX = GRID_X
  const labelY = GRID_Y - 10
  const midX = tileX + SHORT / 2
  const tick = 4

  return (
    <g fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round">
      <line x1={tileX} y1={labelY} x2={tileX + SHORT} y2={labelY} />
      <line x1={tileX} y1={labelY - tick} x2={tileX} y2={labelY + tick} />
      <line x1={tileX + SHORT} y1={labelY - tick} x2={tileX + SHORT} y2={labelY + tick} />
      <text
        x={midX}
        y={labelY - 5}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={10}
        fontWeight={700}
        fill={color}
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        1 m
      </text>
    </g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function TileFloor15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTileFloor15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_LIGHT, borderColor: GREEN, color: '#065F46' }
    : { background: BLUE_LIGHT, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 3 ubin pendek = 1 sisi panjang ubin → sisi panjang = 3 m; 4 ubin di sisi "?" → 4 × 3 m = 12 m — jawaban E.'
      : 'Explainer: 3 short tiles = 1 long tile height → long side = 3 m; 4 tiles on the "?" side → 4 × 3 m = 12 m — answer E.'

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(280, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* floor background */}
          <rect
            x={GRID_X}
            y={GRID_Y}
            width={/* GRID_W= */2 * (SHORT + LONG)}
            height={GRID_H}
            fill={COLOR.FLOOR_BG}
          />

          {/* tile grid — always shown */}
          <TileFloorPrimitive />

          {/* short-side label — always shown */}
          <ShortSideLabel color={BLUE} />

          {/* "?" bracket — always shown */}
          <QuestionBracket color={beat.result ? GREEN : BLUE} />

          {/* beat-driven overlays */}

          {/* cross-section ring: beats pattern + long */}
          <AnimatePresence>
            {beat.showCrossSection && (
              <motion.g
                key="cross-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              >
                <CrossSectionHighlight />
              </motion.g>
            )}
          </AnimatePresence>

          {/* long-side brace "3 m": beats long → result */}
          <AnimatePresence>
            {beat.showLongLabel && (
              <motion.g
                key="long-label"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <LongSideLabel color={beat.result ? GREEN : ORANGE} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* side highlight + count labels: beats count → result */}
          <AnimatePresence>
            {beat.highlightSide && (
              <motion.g
                key="side-highlight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <SideHighlight />
                <CountLabels color={beat.result ? GREEN : ORANGE} />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

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
