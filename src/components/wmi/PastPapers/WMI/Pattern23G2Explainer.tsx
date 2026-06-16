import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { OPTIONS24G2, PatternGlyph, type PatternToken } from './Pattern23G2Illustration'
import { buildPatternSteps, type OptionKey } from './pattern23G2Steps'

// WMI-23F2A-Q24 — post-answer explainer.
//
// A valid pattern is a palindrome (mirror) whose innermost 1–2 figures are the
// core: Step 1 lays a 1–2 figure core, Step 2 wraps a matching same-figure pair
// on BOTH ends and may repeat. We teach that by PEELING equal end-pairs inward,
// one option per beat: A `a b a` ✓, B `b c c b` ✓, C `a a a` ✓, D `c c a c c c`
// ✗ (ends differ → not a mirror), E `c a b b a c` ✓. The validity comes from the
// peel/palindrome check in pattern23G2Steps.ts (peelPattern) — never asserted —
// so the final ABCE is whatever the code decides.

const INK = '#1F2937'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_LINE = '#059669'
const RED = '#DC2626'
const RED_BG = '#FEE2E2'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'

const R = 14
const GAP = 12
const CELL = 2 * R
const PAD = 14
const ROW_H = CELL + 30 // headroom for the peel brackets above/below

// Geometry helper: x-center of glyph i in a row of n.
function glyphCx(i: number) {
  return PAD + R + i * (CELL + GAP)
}
function rowWidth(n: number) {
  return PAD * 2 + n * CELL + (n - 1) * GAP
}

export default function Pattern23G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildPatternSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // The scene width is dominated by the longest option (D / E = 6 glyphs).
  const maxLen = Math.max(...(Object.values(OPTIONS24G2) as PatternToken[][]).map((o) => o.length))
  const W = rowWidth(maxLen)
  const rowCY = ROW_H / 2

  // What pattern (if any) to draw this beat, centered in the scene.
  const tokens = beat.tokens
  const n = tokens.length
  const xShift = n > 0 ? (W - rowWidth(n)) / 2 : 0

  // Which outer pairs are peeled this beat, and the failing pair (if any).
  const matchedPairs = beat.key != null ? beat.peeledPairs : 0
  // Recompute the first mismatching pair index for the invalid option.
  let badPairIdx: number | null = null
  if (beat.key != null && beat.valid === false) {
    let lo = 0
    let hi = n - 1
    let depth = 0
    while (hi - lo >= 2) {
      if (tokens[lo] !== tokens[hi]) {
        badPairIdx = depth
        break
      }
      lo += 1
      hi -= 1
      depth += 1
    }
  }

  const aria = t(
    `A valid pattern is a mirror: matching figures wrap a 1–2 figure middle. Options ${story.answer.split('').join(', ')} pass, D does not, so the answer is ${story.answer}.`,
    `Pola yang sah itu cermin: gambar sama membungkus inti 1–2 gambar. Pilihan ${story.answer.split('').join(', ')} lolos, D tidak, jadi jawabannya ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        {/* Option chip */}
        <div className="flex min-h-[28px] items-center gap-2">
          {beat.key != null ? (
            <span
              className="font-display text-base font-extrabold"
              style={{
                color: beat.valid === false ? RED : beat.valid ? GREEN_LINE : INK,
              }}
            >
              {t('Option', 'Pilihan')} {beat.key}
            </span>
          ) : beat.result ? (
            <span className="font-display text-base font-extrabold" style={{ color: GREEN_LINE }}>
              {t('Answer', 'Jawaban')}
            </span>
          ) : (
            <span className="font-display text-sm font-bold" style={{ color: BLUE }}>
              {t('How to test a pattern', 'Cara menguji pola')}
            </span>
          )}
        </div>

        {/* The animated pattern row */}
        <svg
          viewBox={`0 0 ${W} ${ROW_H + 8}`}
          width="100%"
          style={{ maxWidth: Math.min(420, Math.max(W, 280)), display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <AnimatePresence mode="popLayout">
            {beat.key == null && beat.result ? (
              // Final beat: the answer letters A B C E.
              <FinalAnswer key="final" answer={story.answer} width={W} cy={rowCY} />
            ) : beat.key == null ? (
              // Intro: a tiny mirror schematic ◁ | ▷.
              <IntroSchematic key="intro" width={W} cy={rowCY} t={t} />
            ) : (
              <motion.g
                key={beat.key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                transform={`translate(${xShift} 0)`}
              >
                {tokens.map((tk, i) => {
                  const mirror = n - 1 - i
                  const inPeeledPair =
                    Math.min(i, mirror) < matchedPairs && i !== mirror
                  const isBad =
                    badPairIdx != null &&
                    Math.min(i, mirror) === badPairIdx &&
                    i !== mirror
                  const isCore =
                    beat.core != null && beat.core.length > 0 && Math.min(i, mirror) >= matchedPairs
                  return (
                    <motion.g
                      key={i}
                      initial={false}
                      animate={{ opacity: inPeeledPair ? 0.28 : 1 }}
                      transition={{ duration: 0.5, delay: inPeeledPair ? Math.min(i, mirror) * 0.18 : 0 }}
                    >
                      <PatternGlyph token={tk} cx={glyphCx(i)} cy={rowCY} r={R} />
                      {isCore && (
                        <motion.circle
                          cx={glyphCx(i)}
                          cy={rowCY}
                          r={R + 6}
                          fill="none"
                          stroke={GREEN}
                          strokeWidth={2.5}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.55, type: 'spring', stiffness: 280, damping: 20 }}
                          style={{ transformOrigin: `${glyphCx(i)}px ${rowCY}px` }}
                        />
                      )}
                      {isBad && (
                        <motion.text
                          x={glyphCx(i)}
                          y={rowCY - R - 6}
                          textAnchor="middle"
                          fontSize={18}
                          fontWeight={900}
                          fill={RED}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          ✗
                        </motion.text>
                      )}
                    </motion.g>
                  )
                })}

                {/* Peel brackets linking each matched outer pair. */}
                {Array.from({ length: matchedPairs }).map((_, p) => {
                  const li = p
                  const ri = n - 1 - p
                  const x1 = glyphCx(li)
                  const x2 = glyphCx(ri)
                  const yTop = rowCY - R - 8 - p * 4
                  return (
                    <motion.path
                      key={`peel-${p}`}
                      d={`M ${x1} ${rowCY - R - 2} L ${x1} ${yTop} L ${x2} ${yTop} L ${x2} ${rowCY - R - 2}`}
                      fill="none"
                      stroke={GREEN}
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.45, delay: p * 0.18 }}
                    />
                  )
                })}
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* Caption box: blue for steps, green for the winning answer, red on a bust. */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: '#065F46' }
              : beat.valid === false
                ? { background: RED_BG, borderColor: RED, color: '#991B1B' }
                : beat.valid
                  ? { background: GREEN_BG, borderColor: GREEN, color: '#065F46' }
                  : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}

// Intro schematic: a small mirror cue — a dashed center bar with arrows wrapping
// outward, echoing "matching pairs wrap a center".
function IntroSchematic({
  width,
  cy,
  t,
}: {
  width: number
  cy: number
  t: (en: string, id: string) => string
}) {
  const midX = width / 2
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* center core */}
      <PatternGlyph token="b" cx={midX} cy={cy} r={R} />
      <text x={midX} y={cy + R + 18} textAnchor="middle" fontSize={11} fontWeight={800} fill={BLUE}>
        {t('core', 'inti')}
      </text>
      {/* wrapped pair */}
      {[1, 2].map((k) => {
        const off = k * (CELL + GAP)
        return (
          <g key={k}>
            <PatternGlyph token="c" cx={midX - off} cy={cy} r={R} />
            <PatternGlyph token="c" cx={midX + off} cy={cy} r={R} />
            <path
              d={`M ${midX - off} ${cy - R - 6} Q ${midX} ${cy - R - 10 - k * 8} ${midX + off} ${cy - R - 6}`}
              fill="none"
              stroke={GREEN}
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          </g>
        )
      })}
    </motion.g>
  )
}

// Final answer beat: the winning option letters spelled out.
function FinalAnswer({ answer, width, cy }: { answer: string; width: number; cy: number }) {
  const letters = answer.split('') as OptionKey[]
  const span = letters.length * 40
  const startX = (width - span) / 2 + 20
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      {letters.map((ch, i) => (
        <g key={ch}>
          <motion.rect
            x={startX + i * 40 - 16}
            y={cy - 18}
            width={34}
            height={36}
            rx={8}
            fill={GREEN_BG}
            stroke={GREEN}
            strokeWidth={2.5}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.12 }}
          />
          <text
            x={startX + i * 40 + 1}
            y={cy + 1}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={20}
            fontWeight={900}
            fill={GREEN_LINE}
            className="font-display"
          >
            {ch}
          </text>
        </g>
      ))}
    </motion.g>
  )
}
