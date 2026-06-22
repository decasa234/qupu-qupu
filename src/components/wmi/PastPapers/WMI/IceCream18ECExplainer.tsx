// IKMC-20-EC-Q18 — post-answer animation.
//
// Reuses the IceCreamCone / Cherry / WaferDisc / ChocolateChip primitives
// from IceCream18ECIllustration so the animation reads as the static figure
// coming alive.
//
// Beat structure (6 beats — see iceCream18ECSteps.ts):
//   0  setup   — static figure + rule
//   1  testA   — highlight: choc+cherry (✓)
//   2  testB   — highlight: vanilla+cherry (✓)
//   3  testC   — highlight: lemon+wafer, then cascade conflict (✗)
//   4  testD   — highlight: choc+wafer (✓)
//   5  result  — green: lemon+wafer is impossible → answer C

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  COLOR,
  SVG_W,
  SVG_H,
  TOPPINGS_X,
  IceCreamCone,
  Cherry,
  WaferDisc,
  ChocolateChip,
} from './IceCream18ECIllustration'
import { buildIceCream18ECSteps } from './iceCream18ECSteps'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const RED    = '#EF4444'
const AMBER  = '#F59E0B'
const BLUE   = '#30598A'

// ── Layout constants (mirror illustration) ────────────────────────────────────
const CONE_SPACING = 32
const CONES_START_X = 20
const CONE_BASE_Y   = 54

const CHERRY_Y   = 38
const TOPPING2_Y = 80
const TX = TOPPINGS_X

// Scoop fill colours (same order as illustration: 3 vanilla, 2 choc, 1 lemon)
const SCOOP_FILLS = [
  COLOR.SCOOP_VANILLA,
  COLOR.SCOOP_VANILLA,
  COLOR.SCOOP_VANILLA,
  COLOR.SCOOP_CHOC,
  COLOR.SCOOP_CHOC,
  COLOR.SCOOP_LEMON,
]

// ── Highlight ring for a cone ─────────────────────────────────────────────────

function ConeHighlight({
  coneIndex,
  color,
}: {
  coneIndex: number
  color: string
}) {
  const cx = CONES_START_X + coneIndex * CONE_SPACING
  return (
    <motion.circle
      key={`cone-hl-${coneIndex}`}
      cx={cx}
      cy={CONE_BASE_Y}
      r={18}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 22 }}
    />
  )
}

// ── Highlight ring for a topping ──────────────────────────────────────────────

function ToppingHighlight({
  cx,
  cy,
  color,
  id,
}: {
  cx: number
  cy: number
  color: string
  id: string
}) {
  return (
    <motion.circle
      key={`thl-${id}`}
      cx={cx}
      cy={cy}
      r={13}
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 22 }}
    />
  )
}

// ── Cross mark (for the impossible option) ────────────────────────────────────

function CrossMark({ cx, cy }: { cx: number; cy: number }) {
  const S = 7
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <circle cx={cx} cy={cy} r={10} fill={RED} opacity={0.15} />
      <line x1={cx - S} y1={cy - S} x2={cx + S} y2={cy + S}
        stroke={RED} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={cx + S} y1={cy - S} x2={cx - S} y2={cy + S}
        stroke={RED} strokeWidth={2.2} strokeLinecap="round" />
    </motion.g>
  )
}

// ── Test-option badge (A / B / C / D) ─────────────────────────────────────────

function OptionBadge({
  label,
  ok,
}: {
  label: string
  ok: boolean | null
}) {
  const bg    = ok === true ? GREEN : ok === false ? RED : AMBER
  const emoji = ok === true ? '✓' : ok === false ? '✗' : '?'
  return (
    <motion.span
      key={`badge-${label}`}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.7, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 font-display text-xs font-black text-white"
      style={{ background: bg }}
    >
      {label} {emoji}
    </motion.span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function IceCream18ECExplainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const story = useMemo(() => buildIceCream18ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.isResult
  const accentCol = isResult ? GREEN : beat.testResult === false ? RED : BLUE

  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : beat.testResult === false
      ? { background: '#FEE2E2', borderColor: RED, color: '#7F1D1D' }
      : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  // Which cone indices to highlight on each beat:
  // A: chocolate (index 3)  B: vanilla (index 0)  C: lemon (index 5)  D: chocolate (index 4)
  const highlightCones: Record<string, number[]> = {
    A: [3],
    B: [0],
    C: [5],
    D: [4],
  }
  const activeCones = beat.testOption ? highlightCones[beat.testOption] ?? [] : []

  // Topping highlight positions:
  // cherries at TX+14, TX+40, TX+66 / CHERRY_Y
  // wafers at TX+14, TX+40 / TOPPING2_Y
  // chip at TX+68 / TOPPING2_Y
  type ToppingKey = 'cherry1' | 'cherry2' | 'cherry3' | 'wafer1' | 'wafer2' | 'chip'
  const toppingCoords: Record<ToppingKey, { cx: number; cy: number }> = {
    cherry1: { cx: TX + 14, cy: CHERRY_Y },
    cherry2: { cx: TX + 40, cy: CHERRY_Y },
    cherry3: { cx: TX + 66, cy: CHERRY_Y },
    wafer1:  { cx: TX + 14, cy: TOPPING2_Y },
    wafer2:  { cx: TX + 40, cy: TOPPING2_Y },
    chip:    { cx: TX + 68, cy: TOPPING2_Y },
  }

  // Which toppings to highlight per beat:
  const highlightToppings: Record<string, ToppingKey[]> = {
    A: ['cherry1'],
    B: ['cherry1'],
    C: ['wafer1'],
    D: ['wafer2'],
  }
  const activeToppings: ToppingKey[] = beat.testOption
    ? highlightToppings[beat.testOption] ?? []
    : []

  // On testC beat, also show the conflict — all vanilla toppings used, nothing for choc
  const showConflict = beat.phase === 'testC' || (isResult && beat.testOption === 'C')

  const hlColor = beat.testResult === false ? RED
    : isResult ? GREEN
    : AMBER

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: opsi C (lemon + wafer) memaksa kedua scoop cokelat berbagi hanya ceri, menciptakan duplikat — tidak mungkin. Jawaban: C.'
      : 'Explainer: option C (lemon + wafer) forces both chocolate scoops to share only cherry, creating a duplicate — impossible. Answer: C.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(320, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

          {/* ── Cones ── */}
          {SCOOP_FILLS.map((fill, i) => (
            <IceCreamCone
              key={i}
              cx={CONES_START_X + i * CONE_SPACING}
              cy={CONE_BASE_Y}
              scoopFill={fill}
            />
          ))}

          {/* ── Toppings ── */}
          <Cherry cx={TX + 14} cy={CHERRY_Y} />
          <Cherry cx={TX + 40} cy={CHERRY_Y} />
          <Cherry cx={TX + 66} cy={CHERRY_Y} />
          <WaferDisc cx={TX + 14} cy={TOPPING2_Y} />
          <WaferDisc cx={TX + 40} cy={TOPPING2_Y} />
          <ChocolateChip cx={TX + 68} cy={TOPPING2_Y} />

          {/* ── Cone highlights ── */}
          <AnimatePresence>
            {activeCones.map((ci) => (
              <ConeHighlight key={`cone-${ci}`} coneIndex={ci} color={hlColor} />
            ))}
          </AnimatePresence>

          {/* On result beat, also ring the impossible lemon cone */}
          <AnimatePresence>
            {isResult && (
              <ConeHighlight key="cone-result-5" coneIndex={5} color={RED} />
            )}
          </AnimatePresence>

          {/* ── Topping highlights ── */}
          <AnimatePresence>
            {activeToppings.map((key) => {
              const coords = toppingCoords[key]
              return (
                <ToppingHighlight
                  key={key}
                  cx={coords.cx}
                  cy={coords.cy}
                  color={hlColor}
                  id={key}
                />
              )
            })}
          </AnimatePresence>

          {/* On result beat, ring the impossible wafer topping */}
          <AnimatePresence>
            {isResult && (
              <ToppingHighlight
                key="topping-result-wafer"
                cx={TX + 14}
                cy={TOPPING2_Y}
                color={RED}
                id="result-wafer"
              />
            )}
          </AnimatePresence>

          {/* On testC / result beat: cross marks on the two chocolate cones */}
          <AnimatePresence>
            {showConflict && (
              <>
                <CrossMark key="x-choc1" cx={CONES_START_X + 3 * CONE_SPACING} cy={CONE_BASE_Y - 20} />
                <CrossMark key="x-choc2" cx={CONES_START_X + 4 * CONE_SPACING} cy={CONE_BASE_Y - 20} />
              </>
            )}
          </AnimatePresence>
        </svg>

        {/* option badge + equation pill */}
        <div className="flex min-h-[2rem] flex-wrap items-center justify-center gap-2">
          <AnimatePresence mode="wait">
            {beat.testOption != null && (
              <OptionBadge
                key={`opt-${beat.testOption}`}
                label={`${lang === 'id' ? 'Pilihan' : 'Option'} ${beat.testOption}`}
                ok={beat.testResult}
              />
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {beat.equation != null && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                className="rounded-full px-3 py-1 font-display text-xs font-black text-white"
                style={{ background: accentCol }}
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
