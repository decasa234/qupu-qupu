import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TrainCar, Locomotive, Coupling, AlignmentLine, COLOR, CAR_W, CAR_H, LOCO_W } from './Trains18PEIllustration'
import { buildTrains18PESteps } from './trains18PESteps'

// IKMC-20-PE-Q18 — post-answer animation.
//
// Shows a SCHEMATIC STRIP of cars around positions 12, 19, and 26 for both
// trains. The strip shows: [loco (A)] ... [12] ... [19] ... [26] ... for train A
// (top), and ... [26] ... [19] ... [12] ... [loco (B)] for train B (bottom).
// (Only 12, 19, 26 are drawn as labelled cars; between them are "gap" indicators.)
//
// Animation beats:
//   0. intro   — static two-train strip, no highlights.
//   1. anchor  — alignment line at car 19; both 19s glow amber.
//   2. offset  — car 12 (train B) glows blue; offset label "19 − 12 = 7".
//   3. mirror  — arc/arrow from car 12 zone to car 26 zone across the trains.
//   4. answer  — car 26 (train A) glows green.
//   5. result  — green result beat.

const GREEN = '#10B981'
const BLUE = '#2563EB'
const AMBER = '#D97706'
const INK = COLOR.INK

// ── Schematic layout constants ──────────────────────────────────────────────
// We show a three-car schematic with gap labels between positions 12, 19, 26.
// The layout (left→right) for each train is:
//
//   Train A (dir=left, loco faces LEFT → is leftmost on this strip):
//     Arrow← | Loco-A | gap("…") | [12] | gap(7) | [19] | gap(7) | [26] | gap("…")
//
//   Train B (dir=right, loco faces RIGHT → is rightmost on this strip):
//     gap("…") | [26] | gap(7) | [19] | gap(7) | [12] | gap("…") | Loco-B | →Arrow
//
// This mirrors the real train layout (A numbers 1→31 L→R, B numbers 31→1 L→R
// from the locomotive, so 12 and 26 are at symmetric positions around 19).

const PAD_L = 20
const PAD_R = 20
const PAD_T = 20
const PAD_B = 20

// Schematic cell widths
const CELL_LOCO = LOCO_W          // loco body
const CELL_CAR = CAR_W            // numbered car
const CELL_GAP_DOTS = 24          // "…" separator
const CELL_GAP_NUM = 28           // numeric gap indicator "7"
const CELL_SPACE = 6              // space between elements

// Arrow width for direction indicators
const ARROW_W = 28

// Total schematic width (loco + ... + car12 + 7 + car19 + 7 + car26 + ... + arrow)
const SCHEMA_W =
  ARROW_W + CELL_SPACE +
  CELL_LOCO + CELL_SPACE +
  CELL_GAP_DOTS + CELL_SPACE +
  CELL_CAR + CELL_SPACE +
  CELL_GAP_NUM + CELL_SPACE +
  CELL_CAR + CELL_SPACE +
  CELL_GAP_NUM + CELL_SPACE +
  CELL_CAR + CELL_SPACE +
  CELL_GAP_DOTS + CELL_SPACE +
  ARROW_W

const SVG_W = PAD_L + SCHEMA_W + PAD_R
const TRAIN_A_Y = PAD_T + CAR_H / 2 + 20   // row A centre
const TRAIN_B_Y = TRAIN_A_Y + CAR_H + 50   // row B centre (gap for vertical lines)
const SVG_H = TRAIN_B_Y + CAR_H / 2 + PAD_B + 20

// Compute left x of each element (for Train A, left→right):
// [arrow←] [space] [locoA] [space] [dots] [space] [car12] [space] [gap7] [space] [car19] [space] [gap7] [space] [car26] [space] [dots] [space]
// Train B is the mirror: same x positions but labels/elements reversed.

function makePositions(startX: number) {
  let x = startX
  const pos: Record<string, number> = {}

  pos.arrowA_x = x                   // left arrow (← for train A)
  x += ARROW_W + CELL_SPACE
  pos.locoA_x = x                    // loco A
  x += CELL_LOCO + CELL_SPACE
  pos.dotsLeft_x = x                 // left "…"
  x += CELL_GAP_DOTS + CELL_SPACE
  pos.car12A_x = x                   // car 12 of train A (or car 26 of B)
  x += CELL_CAR + CELL_SPACE
  pos.gap7left_x = x                 // "7" gap indicator (left)
  x += CELL_GAP_NUM + CELL_SPACE
  pos.car19_x = x                    // car 19 (both trains)
  x += CELL_CAR + CELL_SPACE
  pos.gap7right_x = x                // "7" gap indicator (right)
  x += CELL_GAP_NUM + CELL_SPACE
  pos.car26A_x = x                   // car 26 of train A (or car 12 of B)
  x += CELL_CAR + CELL_SPACE
  pos.dotsRight_x = x               // right "…"
  x += CELL_GAP_DOTS + CELL_SPACE
  pos.arrowB_x = x                   // right arrow (→ for train B)

  return pos
}

const P = makePositions(PAD_L)

// Car centres (x = left edge + CAR_W/2)
const CAR_19_CX = P.car19_x + CAR_W / 2     // car 19 (both trains)
const CAR_26A_CX = P.car26A_x + CAR_W / 2   // car 26 of train A

// In train B (mirrored), car 12 is at the same x-column as car 26 of A:
const CAR_12B_CX = CAR_26A_CX               // car 12 of train B is at the same x as car 26 of A

// Top y of a car given its row centre:
const topAY = TRAIN_A_Y - CAR_H / 2
const topBY = TRAIN_B_Y - CAR_H / 2

// ── Sub-components ──────────────────────────────────────────────────────────

function DirectionArrowLeft({ y }: { y: number }) {
  const ex = P.arrowA_x
  const sx = ex + ARROW_W - 4
  const hy = 6
  const hl = 8
  return (
    <g stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill={INK}>
      <line x1={sx} y1={y} x2={ex} y2={y} />
      <polygon points={`${ex},${y} ${ex + hl},${y - hy} ${ex + hl},${y + hy}`} stroke="none" />
    </g>
  )
}

function DirectionArrowRight({ y }: { y: number }) {
  const sx = P.arrowB_x
  const ex = sx + ARROW_W
  const hy = 6
  const hl = 8
  return (
    <g stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill={INK}>
      <line x1={sx} y1={y} x2={ex} y2={y} />
      <polygon points={`${ex},${y} ${ex - hl},${y - hy} ${ex - hl},${y + hy}`} stroke="none" />
    </g>
  )
}

function Dots({ cx, cy }: { cx: number; cy: number }) {
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={16}
      fontWeight={900}
      fill={COLOR.DOTS}
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      …
    </text>
  )
}

/** Label badge pinned above or below a car position. */
function CarLabel({
  cx,
  y,
  label,
  color,
  above,
}: {
  cx: number
  y: number
  label: string
  color: string
  above: boolean
}) {
  const badgeW = 36
  const badgeH = 16
  const by = above ? y - badgeH - 4 : y + badgeH + 4
  return (
    <g>
      <rect x={cx - badgeW / 2} y={by} width={badgeW} height={badgeH} rx={8} fill={color} />
      <text
        x={cx}
        y={by + badgeH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={800}
        fill="#fff"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

/** Horizontal brace between two positions on the same row, with a label. */
function HBrace({
  x1,
  x2,
  y,
  label,
  color,
  above,
}: {
  x1: number
  x2: number
  y: number
  label: string
  color: string
  above: boolean
}) {
  const braceY = above ? y - 10 : y + 10
  const tickH = 5
  const midX = (x1 + x2) / 2
  return (
    <g stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none">
      <line x1={x1} y1={braceY} x2={x2} y2={braceY} />
      <line x1={x1} y1={braceY - tickH} x2={x1} y2={braceY + tickH} />
      <line x1={x2} y1={braceY - tickH} x2={x2} y2={braceY + tickH} />
      <text
        x={midX}
        y={braceY + (above ? -6 : 6)}
        textAnchor="middle"
        dominantBaseline={above ? 'auto' : 'hanging'}
        fontSize={10}
        fontWeight={800}
        fill={color}
        stroke="none"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── The schematic scene ──────────────────────────────────────────────────────

interface SceneProps {
  showAnchor: boolean
  showOffset: boolean
  showAnswer: boolean
  isResult: boolean
}

function TrainsSchematic({ showAnchor, showOffset, showAnswer, isResult }: SceneProps) {
  const car19Color = showAnchor ? AMBER : COLOR.BODY_STROKE
  const car19Fill = showAnchor ? '#FEF3C7' : COLOR.BODY
  const car12BColor = showOffset ? BLUE : COLOR.BODY_STROKE
  const car12BFill = showOffset ? '#DBEAFE' : COLOR.BODY
  const car26AColor = showAnswer ? (isResult ? GREEN : AMBER) : COLOR.BODY_STROKE
  const car26AFill = showAnswer ? (isResult ? '#DCFCE7' : '#FEF3C7') : COLOR.BODY

  // Coupling y = row centre
  const coupAY = TRAIN_A_Y
  const coupBY = TRAIN_B_Y

  return (
    <>
      {/* ── Train A (top, facing LEFT) ── */}
      <DirectionArrowLeft y={TRAIN_A_Y} />
      <Locomotive x={P.locoA_x} y={topAY} dir="left" />

      {/* coupling: loco → dots area → car 12 */}
      <Coupling x1={P.locoA_x + LOCO_W} x2={P.dotsLeft_x} y={coupAY} />
      <Dots cx={P.dotsLeft_x + CELL_GAP_DOTS / 2} cy={TRAIN_A_Y} />
      <Coupling x1={P.dotsLeft_x + CELL_GAP_DOTS} x2={P.car12A_x} y={coupAY} />

      {/* car 12 of train A */}
      <TrainCar x={P.car12A_x} y={topAY} label="12" fill={COLOR.BODY} stroke={COLOR.BODY_STROKE} />
      <Coupling x1={P.car12A_x + CAR_W} x2={P.car19_x} y={coupAY} />

      {/* car 19 of train A */}
      <TrainCar x={P.car19_x} y={topAY} label="19" fill={car19Fill} stroke={car19Color} />
      <Coupling x1={P.car19_x + CAR_W} x2={P.car26A_x} y={coupAY} />

      {/* car 26 of train A */}
      <TrainCar x={P.car26A_x} y={topAY} label="26" fill={car26AFill} stroke={car26AColor} />
      <Coupling x1={P.car26A_x + CAR_W} x2={P.dotsRight_x} y={coupAY} />
      <Dots cx={P.dotsRight_x + CELL_GAP_DOTS / 2} cy={TRAIN_A_Y} />

      {/* ── Train B (bottom, facing RIGHT) ── */}
      {/* … [26] [19] [12] … [loco B] → */}
      <Dots cx={P.dotsLeft_x + CELL_GAP_DOTS / 2} cy={TRAIN_B_Y} />
      <Coupling x1={P.dotsLeft_x + CELL_GAP_DOTS} x2={P.car12A_x} y={coupBY} />

      {/* car 26 of train B (at same x-position as car 12 of train A) */}
      <TrainCar x={P.car12A_x} y={topBY} label="26" fill={COLOR.BODY} stroke={COLOR.BODY_STROKE} />
      <Coupling x1={P.car12A_x + CAR_W} x2={P.car19_x} y={coupBY} />

      {/* car 19 of train B */}
      <TrainCar x={P.car19_x} y={topBY} label="19" fill={car19Fill} stroke={car19Color} />
      <Coupling x1={P.car19_x + CAR_W} x2={P.car26A_x} y={coupBY} />

      {/* car 12 of train B (at same x-position as car 26 of train A) */}
      <TrainCar x={P.car26A_x} y={topBY} label="12" fill={car12BFill} stroke={car12BColor} />
      <Coupling x1={P.car26A_x + CAR_W} x2={P.dotsRight_x} y={coupBY} />
      <Dots cx={P.dotsRight_x + CELL_GAP_DOTS / 2} cy={TRAIN_B_Y} />
      <Coupling x1={P.dotsRight_x + CELL_GAP_DOTS} x2={P.arrowB_x} y={coupBY} />
      <Locomotive x={P.arrowB_x} y={topBY} dir="right" />
      <DirectionArrowRight y={TRAIN_B_Y} />

      {/* ── Row labels ── */}
      <text
        x={4}
        y={TRAIN_A_Y}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={700}
        fill="#888"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        A
      </text>
      <text
        x={4}
        y={TRAIN_B_Y}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={700}
        fill="#888"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        B
      </text>
    </>
  )
}

// ── Main explainer component ─────────────────────────────────────────────────

export default function Trains18PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildTrains18PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: gerbong 19 A berhadapan gerbong 19 B. Gerbong 12 B berjarak 7 dari gerbong 19. Kereta berlawanan mencerminkan: 19+7=26. Jawaban D adalah gerbong 26.'
      : 'Explainer: car 19 A faces car 19 B. Car 12 B is 7 from car 19. Opposite trains mirror: 19+7=26. Answer D is car 26.'

  // Vertical alignment line x-centre for car 19
  const align19X = CAR_19_CX
  const alignTopY = topAY
  const alignBotY = TRAIN_B_Y + CAR_H / 2

  // Vertical alignment line for car 12(B)↔car 26(A)
  const align12BX = CAR_12B_CX   // = CAR_26A_CX
  const align26AX = CAR_26A_CX   // same as above (they share the same column)

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: 'block', maxWidth: SVG_W }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* base schematic (trains always visible) */}
          <TrainsSchematic
            showAnchor={beat.showAnchor}
            showOffset={beat.showOffset}
            showAnswer={beat.showAnswer}
            isResult={isResult}
          />

          {/* alignment line at car 19 (beats anchor, offset, mirror) */}
          <AnimatePresence>
            {beat.showAnchor && (
              <motion.g
                key="align-19"
                initial={{ opacity: 0, scaleY: 0.5 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <AlignmentLine
                  x={align19X}
                  y1={alignTopY - 2}
                  y2={alignBotY + 2}
                  color={AMBER}
                  dashed={false}
                />
                <CarLabel cx={align19X} y={topAY} label="19 A" color={AMBER} above={true} />
                <CarLabel cx={align19X} y={TRAIN_B_Y + CAR_H / 2} label="19 B" color={AMBER} above={false} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* offset brace on train B (beat offset) */}
          <AnimatePresence>
            {beat.showOffset && (
              <motion.g
                key="offset-brace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {/* brace: car 12 B → car 19 B (bottom) */}
                <HBrace
                  x1={CAR_19_CX - CAR_W / 2}
                  x2={align12BX - CAR_W / 2}
                  y={TRAIN_B_Y + CAR_H / 2}
                  label="7"
                  color={BLUE}
                  above={false}
                />
                <CarLabel cx={align12BX} y={TRAIN_B_Y + CAR_H / 2} label="12 B" color={BLUE} above={false} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* mirror arrow from car 19 A position → car 26 A position (beat mirror) */}
          <AnimatePresence>
            {beat.showMirror && (
              <motion.g
                key="mirror-arrow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {/* brace: car 19 A → car 26 A (top) */}
                <HBrace
                  x1={CAR_19_CX + CAR_W / 2}
                  x2={align26AX + CAR_W / 2}
                  y={topAY}
                  label="+7"
                  color={AMBER}
                  above={true}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* answer alignment line at car 26 A / car 12 B (beat answer + result) */}
          <AnimatePresence>
            {beat.showAnswer && (
              <motion.g
                key="align-answer"
                initial={{ opacity: 0, scaleY: 0.5 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <AlignmentLine
                  x={align26AX + CAR_W / 2}
                  y1={alignTopY - 2}
                  y2={alignBotY + 2}
                  color={isResult ? GREEN : AMBER}
                  dashed={false}
                />
                <CarLabel
                  cx={align26AX + CAR_W / 2}
                  y={topAY}
                  label="26 A"
                  color={isResult ? GREEN : AMBER}
                  above={true}
                />
                <CarLabel
                  cx={align26AX + CAR_W / 2}
                  y={TRAIN_B_Y + CAR_H / 2}
                  label="12 B"
                  color={isResult ? GREEN : BLUE}
                  above={false}
                />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* equation row */}
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
                style={{ background: isResult ? GREEN : '#30598A' }}
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
