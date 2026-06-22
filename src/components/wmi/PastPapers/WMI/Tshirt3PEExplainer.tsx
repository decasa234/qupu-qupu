// IKMC-21-PE-Q3 — post-answer explainer for the t-shirt mirror question.
//
// Reuses TshirtPrimitive from Tshirt3PEIllustration so the animation reads as
// the static scene coming alive. Walk:
//   original shirt "2021" →
//   digit order reversed "1-2-0-2" →
//   each digit horizontally flipped (answer A visualised) →
//   result badge.
//
// Mirrored-digit rendering strategy:
//   - Mirror "2" using SVG transform="scale(-1,1)" on a <text> element clipped
//     at the glyph centre, so it reads as a "backwards 2".
//   - "0" is rendered normally (horizontally symmetric).
//   - Mirror "1" with the same scale(-1,1) trick (near-symmetric but faithful).
//
// Pure render, SSR-safe — no Math.random / Date / side-effects.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TshirtBody, TshirtPrimitive, TSHIRT_GEOM } from './Tshirt3PEIllustration'
import { buildTshirt3PESteps } from './tshirt3PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE_BG   = '#E1EFFB'
const BLUE_INK  = '#30598A'
const AMBER     = '#F59E0B'
const AMBER_BG  = '#FEF3C7'
const AMBER_INK = '#78350F'

// ── mirrored-digit rendering ──────────────────────────────────────────────────

interface MirroredDigitProps {
  digit: string
  /** SVG x for the digit centre. */
  x: number
  /** SVG y baseline-middle. */
  y: number
  size?: number
  fill?: string
  /** When true, render the digit as-is (not flipped). */
  normal?: boolean
  /** When true, add an amber highlight ring around the digit. */
  highlight?: boolean
}

const INK = '#1F2937'
const FONT = 'ui-monospace, SFMono-Regular, monospace'

/** One digit, optionally rendered as its horizontal mirror via scale(-1,1). */
function MirroredDigit({ digit, x, y, size = 28, fill = INK, normal = false, highlight = false }: MirroredDigitProps) {
  // scale(-1,1) about the digit's own centre x mirrors it horizontally
  const transform = normal ? undefined : `scale(-1,1) translate(${-2 * x},0)`
  return (
    <g>
      {highlight && (
        <circle
          cx={x}
          cy={y}
          r={(size * 0.6) + 5}
          fill={AMBER_BG}
          stroke={AMBER}
          strokeWidth={2}
          opacity={0.85}
        />
      )}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size}
        fontWeight="bold"
        fontFamily={FONT}
        fill={fill}
        transform={transform}
      >
        {digit}
      </text>
    </g>
  )
}

// ── shirt with custom digit row ───────────────────────────────────────────────

interface TshirtWithDigitsProps {
  /**
   * Array of {digit, mirrored} describing the digits to draw left-to-right
   * on the chest. Mirrored digits are rendered with scale(-1,1).
   */
  digits: { digit: string; mirrored: boolean; highlight?: boolean }[]
}

/** T-shirt silhouette with a custom row of (optionally mirrored) digits. */
function TshirtWithDigits({ digits }: TshirtWithDigitsProps) {
  const { VW, VH, COLLAR_CX, CHEST_CY } = TSHIRT_GEOM
  const DIGIT_SPACING = 30
  const totalW = (digits.length - 1) * DIGIT_SPACING
  const startX = COLLAR_CX - totalW / 2

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} width={VW} aria-hidden="true">
      {/* shirt silhouette (bare <g>, no nested <svg>) */}
      <TshirtBody />
      {digits.map(({ digit, mirrored, highlight }, i) => (
        <MirroredDigit
          key={`d-${i}`}
          digit={digit}
          x={startX + i * DIGIT_SPACING}
          y={CHEST_CY}
          normal={!mirrored}
          highlight={highlight ?? false}
        />
      ))}
    </svg>
  )
}

// ── beat → visual config ──────────────────────────────────────────────────────

type DigitSpec = { digit: string; mirrored: boolean; highlight?: boolean }

function getDigits(phase: string): DigitSpec[] {
  if (phase === 'intro') {
    // original: 2 0 2 1, all normal (left-to-right)
    return [
      { digit: '2', mirrored: false },
      { digit: '0', mirrored: false },
      { digit: '2', mirrored: false },
      { digit: '1', mirrored: false },
    ]
  }
  if (phase === 'reverse') {
    // order reversed to 1-2-0-2, but NOT yet flipped (intermediate step)
    return [
      { digit: '1', mirrored: false },
      { digit: '2', mirrored: false },
      { digit: '0', mirrored: false },
      { digit: '2', mirrored: false },
    ]
  }
  if (phase === 'flip-ann') {
    // reversed AND flipped; highlight the '2' digits to show the flip
    return [
      { digit: '1', mirrored: true },
      { digit: '2', mirrored: true, highlight: true },
      { digit: '0', mirrored: false },          // 0 is symmetric
      { digit: '2', mirrored: true, highlight: true },
    ]
  }
  // result — same as flip-ann but no individual highlights
  return [
    { digit: '1', mirrored: true },
    { digit: '2', mirrored: true },
    { digit: '0', mirrored: false },
    { digit: '2', mirrored: true },
  ]
}

// ── explainer component ───────────────────────────────────────────────────────

const ARIA_EN =
  'Explainer: The original t-shirt shows 2021. ' +
  'A mirror reverses left and right, so the digit order becomes 1-2-0-2. ' +
  'Each digit is also horizontally flipped in the mirror. ' +
  'The result — reversed order with flipped digits — is choice A.'

const ARIA_ID =
  'Penjelasan: Kaos awalnya bertuliskan 2021. ' +
  'Cermin membalik kiri dan kanan, sehingga urutan digit menjadi 1-2-0-2. ' +
  'Setiap digit juga dibalik secara horizontal di cermin. ' +
  'Hasilnya — urutan terbalik dengan digit yang dibalik — adalah pilihan A.'

export default function Tshirt3PEExplainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildTshirt3PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const digits = getDigits(beat.phase)
  const isResult = beat.result
  const isFlipAnn = beat.phase === 'flip-ann'

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : isFlipAnn
      ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }
      : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }

  // Phase label shown above the shirt
  const phaseLabel = (() => {
    switch (beat.phase) {
      case 'intro':    return t('Original t-shirt', 'Kaos asli')
      case 'reverse':  return t('Step 1: reverse order → 1-2-0-2', 'Langkah 1: urutan terbalik → 1-2-0-2')
      case 'flip-ann': return t('Step 2: flip each digit', 'Langkah 2: balik setiap digit')
      case 'result':   return t('Mirror image (Answer A)', 'Bayangan cermin (Jawaban A)')
    }
  })()

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={lang === 'id' ? ARIA_ID : ARIA_EN}>
      <div className="flex flex-col items-center gap-3">

        {/* phase label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={beat.phase}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-lg px-3 py-1 font-display text-xs font-extrabold"
            style={{ background: '#F1F5F9', color: '#475569' }}
          >
            {phaseLabel}
          </motion.div>
        </AnimatePresence>

        {/* t-shirt SVG with animated digit row */}
        <AnimatePresence mode="wait">
          <motion.div
            key={beat.phase}
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {beat.phase === 'intro' ? (
              // Original shirt — use the plain primitive for exact match
              <TshirtPrimitive label="2021" />
            ) : (
              <TshirtWithDigits digits={digits} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* digit chips row */}
        <div className="flex items-center gap-2">
          {digits.map(({ digit, mirrored, highlight }, i) => {
            const bg     = highlight ? AMBER_BG : '#F1F5F9'
            const border = highlight ? AMBER     : '#CBD5E1'
            const ink    = highlight ? AMBER_INK : '#475569'
            const badge  = mirrored
              ? t(`${digit} (flipped)`, `${digit} (dibalik)`)
              : digit === '0'
                ? t('0 (sym)', '0 (sim)')
                : digit
            return (
              <motion.div
                key={`chip-${i}`}
                className="flex h-8 min-w-[2.5rem] items-center justify-center rounded-lg border-2 font-display text-xs font-black"
                style={{ background: bg, borderColor: border, color: ink }}
                animate={{ scale: highlight ? [1, 1.18, 1] : 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {badge}
              </motion.div>
            )
          })}
        </div>

        {/* answer badge — result beat only */}
        <div className="flex min-h-[2.25rem] items-center justify-center">
          <AnimatePresence>
            {isResult && (
              <motion.div
                key="result"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                className="rounded-full px-5 py-1 font-display text-sm font-black text-white"
                style={{ background: GREEN }}
              >
                {t('Answer A', 'Jawaban A')}
              </motion.div>
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
