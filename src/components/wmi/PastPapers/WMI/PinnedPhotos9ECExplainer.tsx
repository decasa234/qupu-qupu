import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  PinnedPhotosRow,
  SVG_W,
  SVG_H,
  PHOTO_W,
  PHOTO_H,
  MARGIN_TOP,
  COLOR,
} from './PinnedPhotos9ECIllustration'
import { buildPinnedPhotos9ECSteps } from './pinnedPhotos9ECSteps'

// IKMC-19-EC-Q9 — post-answer animation.
// Reuses PinnedPhotosRow from the illustration so the animation reads as
// the static scene coming alive.
//
// Animation beats:
//   0. intro    — show 3 photos with 8 pins; state the given fact.
//   1. columns  — highlight 4 pin columns with vertical guide lines.
//   2. formula  — reveal the formula chip; verify n=3.
//   3. apply    — switch to 7 (scaled) photos; apply formula.
//   4. result   — 16 → B (green).

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#f0853a'

// ── SVG dimensions ────────────────────────────────────────────────────────────
// For 7-photo beat: we need a wider viewbox or smaller photos.
// We scale photos to SMALL_PHOTO_W so 7 fit in SVG_W with comfortable margins.
const SMALL_PHOTO_W = 36
const SMALL_PHOTO_H = 52
const SMALL_MARGIN_TOP = 28

const FIG_W = Math.min(360, SVG_W)

// ── Pin-column guide lines ────────────────────────────────────────────────────

/** Vertical dashed guide lines marking each pin column for the n=3 scene. */
function ColumnGuides3({ startX }: { startX: number }) {
  const numCols = 4 // 3 photos + 1
  const lines: JSX.Element[] = []
  for (let col = 0; col < numCols; col++) {
    const cx = startX + col * PHOTO_W
    lines.push(
      <line
        key={`g${col}`}
        x1={cx}
        y1={MARGIN_TOP - 10}
        x2={cx}
        y2={MARGIN_TOP + PHOTO_H + 10}
        stroke={ORANGE}
        strokeWidth={1.5}
        strokeDasharray="4 3"
        strokeLinecap="round"
      />,
    )
    // column number label above
    lines.push(
      <text
        key={`gl${col}`}
        x={cx}
        y={MARGIN_TOP - 14}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={700}
        fill={ORANGE}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {col + 1}
      </text>,
    )
  }
  return <g>{lines}</g>
}

// ── Small-photo row for 7-photo beat ─────────────────────────────────────────

/** Renders `count` small photos in a row (scaled down for 7 photos). */
function SmallPinnedPhotosRow({
  count,
  startX,
  startY,
  showColumns,
}: {
  count: number
  startX: number
  startY: number
  showColumns: boolean
}) {
  const photos: JSX.Element[] = []
  const pins: JSX.Element[] = []
  const guides: JSX.Element[] = []

  for (let i = 0; i < count; i++) {
    const x = startX + i * SMALL_PHOTO_W
    // photo frame
    photos.push(
      <rect
        key={`p${i}`}
        x={x}
        y={startY}
        width={SMALL_PHOTO_W}
        height={SMALL_PHOTO_H}
        fill={COLOR.PHOTO_FILL}
        stroke={COLOR.PHOTO_STROKE}
        strokeWidth={1.5}
        rx={1}
        ry={1}
      />,
    )
  }

  const numCols = count + 1
  for (let col = 0; col < numCols; col++) {
    const cx = startX + col * SMALL_PHOTO_W
    const topY = startY
    const botY = startY + SMALL_PHOTO_H
    // pin dots
    pins.push(
      <circle
        key={`pt${col}`}
        cx={cx}
        cy={topY}
        r={3}
        fill={COLOR.PIN_FILL}
        stroke={COLOR.PIN_STROKE}
        strokeWidth={0.5}
      />,
    )
    pins.push(
      <circle
        key={`pb${col}`}
        cx={cx}
        cy={botY}
        r={3}
        fill={COLOR.PIN_FILL}
        stroke={COLOR.PIN_STROKE}
        strokeWidth={0.5}
      />,
    )
    // column guides
    if (showColumns) {
      guides.push(
        <line
          key={`g${col}`}
          x1={cx}
          y1={startY - 8}
          x2={cx}
          y2={botY + 8}
          stroke={ORANGE}
          strokeWidth={1}
          strokeDasharray="3 2"
          strokeLinecap="round"
        />,
      )
    }
  }

  return (
    <g>
      {guides}
      {photos}
      {pins}
    </g>
  )
}

// ── Formula chip ──────────────────────────────────────────────────────────────

/** Formula chip showing "(n + 1) × 2" positioned below the figure. */
function FormulaChip({ y, isResult }: { y: number; isResult: boolean }) {
  const color = isResult ? GREEN : BLUE
  return (
    <g>
      <rect
        x={SVG_W / 2 - 62}
        y={y}
        width={124}
        height={22}
        rx={11}
        fill={color}
        opacity={0.15}
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
        pins = (n + 1) × 2
      </text>
    </g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────

export default function PinnedPhotos9ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildPinnedPhotos9ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: 3 foto = 4 kolom paku = 8 paku; pola (n+1)×2; untuk 7 foto: (7+1)×2 = 16 paku — jawaban B.'
      : 'Explainer: 3 photos = 4 pin columns = 8 pins; pattern (n+1)×2; for 7 photos: (7+1)×2 = 16 pins — answer B.'

  // Compute layout for the current beat
  const showing3 = beat.photoCount === 3
  // For 3 photos: horizontally centre in SVG_W
  const totalPhotoW3 = 3 * PHOTO_W
  const startX3 = (SVG_W - totalPhotoW3) / 2
  const startY3 = MARGIN_TOP

  // For 7 photos: scale down and centre
  const totalSmallW = 7 * SMALL_PHOTO_W
  const startX7 = (SVG_W - totalSmallW) / 2
  const startY7 = SMALL_MARGIN_TOP

  // SVG viewBox height: enough for 3-photo scene + labels
  const svgH = SVG_H + 10

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${svgH}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={svgH} fill="white" />

          {/* ── 3-photo scene (beats 0, 1, 2) ── */}
          <AnimatePresence>
            {showing3 && (
              <motion.g
                key="scene3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* column guides — beat 1 onwards */}
                <AnimatePresence>
                  {beat.showColumns && (
                    <motion.g
                      key="guides3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    >
                      <ColumnGuides3 startX={startX3} />
                    </motion.g>
                  )}
                </AnimatePresence>

                {/* the 3 photos + pins */}
                <PinnedPhotosRow count={3} startX={startX3} startY={startY3} />

                {/* pin count label */}
                <text
                  x={SVG_W / 2}
                  y={startY3 + PHOTO_H + 20}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={700}
                  fill={COLOR.LABEL}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {lang === 'id' ? '3 foto — 8 paku' : '3 photos — 8 pins'}
                </text>

                {/* formula chip */}
                <AnimatePresence>
                  {beat.showFormula && (
                    <motion.g
                      key="formula3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                    >
                      <FormulaChip y={startY3 + PHOTO_H + 40} isResult={isResult} />
                    </motion.g>
                  )}
                </AnimatePresence>
              </motion.g>
            )}
          </AnimatePresence>

          {/* ── 7-photo scene (beats 3, 4) ── */}
          <AnimatePresence>
            {!showing3 && (
              <motion.g
                key="scene7"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SmallPinnedPhotosRow
                  count={7}
                  startX={startX7}
                  startY={startY7}
                  showColumns={beat.showColumns}
                />

                {/* label */}
                <text
                  x={SVG_W / 2}
                  y={startY7 + SMALL_PHOTO_H + 18}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={700}
                  fill={isResult ? GREEN : COLOR.LABEL}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                >
                  {lang === 'id' ? '7 foto — 16 paku' : '7 photos — 16 pins'}
                </text>

                {/* formula chip */}
                <AnimatePresence>
                  {beat.showFormula && (
                    <motion.g
                      key="formula7"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                    >
                      <FormulaChip y={startY7 + SMALL_PHOTO_H + 38} isResult={isResult} />
                    </motion.g>
                  )}
                </AnimatePresence>
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
