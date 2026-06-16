import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PatternRules23G1, PATTERNS, type Glyph } from './PatternRules23G1Illustration'
import { buildPatternRulesSteps } from './patternRules23G1Steps'

// WMI-23F1A-Q24 post-answer explainer. Mirrors the static five-row figure by
// driving its co-exported primitive (litRow + accumulating verdicts), and adds a
// small "fold to the middle" strip that peels matching end-pairs one beat at a
// time so the palindrome test is shown, not asserted. Lands on ABCE.

// qupu tokens echoed as hex so the strip reads as the same scene coming alive.
const BLUE = '#2f6df0' // fill-qupu-brand-blue (neutral / testing)
const PASS = '#3F9A6A' // ✓ ring colour (matches the primitive)
const FAIL = '#D6483B' // ✗ ring colour (matches the primitive)
const AMBER = '#f0853a' // fill-qupu-* highlight used by the lit-row glow
const INK = '#2B2622' // glyph ink, identical to the figure

/** Mini glyph for the fold strip — same shape language as the figure. */
function MiniGlyph({ g, cx, cy, faded }: { g: Glyph; cx: number; cy: number; faded: boolean }) {
  const r = 9
  const sq = 16
  const tri = 19
  const stroke = faded ? '#C9C2BA' : INK
  const w = faded ? 1.8 : 2.4
  if (g === 'circle') return <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={w} />
  if (g === 'square')
    return (
      <rect
        x={cx - sq / 2}
        y={cy - sq / 2}
        width={sq}
        height={sq}
        fill="none"
        stroke={stroke}
        strokeWidth={w}
        strokeLinejoin="round"
      />
    )
  const h = (tri * Math.sqrt(3)) / 2
  const pts = `${cx},${(cy - h / 2).toFixed(2)} ${(cx - tri / 2).toFixed(2)},${(cy + h / 2).toFixed(2)} ${(
    cx +
    tri / 2
  ).toFixed(2)},${(cy + h / 2).toFixed(2)}`
  return <polygon points={pts} fill="none" stroke={stroke} strokeWidth={w} strokeLinejoin="round" />
}

/**
 * The fold strip: draws the row under test, greys out figures already peeled,
 * and parks two arrows on the live ends pointing inward. On the result beat it
 * shows nothing (the five-row figure carries the answer).
 */
function FoldStrip({
  seq,
  lo,
  hi,
  tone,
}: {
  seq: readonly Glyph[]
  lo: number
  hi: number
  tone: string
}) {
  const SLOT = 30
  const PAD = 22
  const W = PAD * 2 + seq.length * SLOT
  const H = 56
  const x0 = PAD + SLOT / 2
  const cy = 26
  const liveCount = hi - lo + 1

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={Math.min(280, W)} aria-hidden="true">
      {seq.map((g, i) => {
        const live = i >= lo && i <= hi
        return <MiniGlyph key={i} g={g} cx={x0 + i * SLOT} cy={cy} faded={!live} />
      })}
      {/* inward-pointing fold arrows on the two live ends (only while peeling) */}
      {liveCount > 2 && (
        <>
          <motion.path
            key={`L-${lo}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            d={`M${x0 + lo * SLOT - 14},${H - 8} l5,-5 m-5,5 l5,5`}
            stroke={tone}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.path
            key={`R-${hi}`}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            d={`M${x0 + hi * SLOT + 14},${H - 8} l-5,-5 m5,5 l-5,5`}
            stroke={tone}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {/* underline the surviving centre once peeling is done */}
      {liveCount <= 2 && (
        <motion.line
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          x1={x0 + lo * SLOT - 13}
          y1={H - 9}
          x2={x0 + hi * SLOT + 13}
          y2={H - 9}
          stroke={tone}
          strokeWidth={3}
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

export default function PatternRules23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildPatternRulesSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Tone of the current beat: the verdict beat colours by pass/fail, otherwise
  // neutral blue while testing.
  const rowVerdict = beat.row != null ? beat.verdicts[beat.row] : undefined
  const tone =
    beat.phase === 'verdict'
      ? rowVerdict
        ? PASS
        : FAIL
      : beat.phase === 'result'
        ? PASS
        : beat.phase === 'intro'
          ? BLUE
          : AMBER

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: lipat tiap baris dari dua ujung ke tengah untuk menguji pola; yang mengikuti aturan adalah ${story.answer}.`
      : `Explainer: fold each row from both ends to the middle to test it; the patterns that follow the rules are ${story.answer}.`

  const seq = beat.row != null ? PATTERNS[beat.row] : null

  return (
    <div className="mx-auto w-full max-w-[300px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The five labelled rows — same scene as the static figure, with the row
            under test lit and verdict badges accumulating. */}
        <PatternRules23G1 litRow={beat.row} verdicts={beat.verdicts} />

        {/* The fold strip for the row under test (hidden on intro/result). */}
        <div className="flex min-h-[56px] items-center justify-center">
          <AnimatePresence mode="wait">
            {seq && (
              <motion.div
                key={`${beat.row}-${beat.lo}-${beat.hi}-${beat.phase}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              >
                <FoldStrip seq={seq} lo={beat.lo ?? 0} hi={beat.hi ?? seq.length - 1} tone={tone} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: PASS, color: '#065F46' }
              : beat.phase === 'verdict'
                ? rowVerdict
                  ? { background: '#D1FAE5', borderColor: PASS, color: '#065F46' }
                  : { background: '#FDE2DF', borderColor: FAIL, color: '#8A2B22' }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
