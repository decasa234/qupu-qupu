import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { BallTubes24G1 } from './BallTubes24G1Illustration'
import { buildBallTubes24G1Steps } from './ballTubes24G1Steps'

// Palette echoes the static ball-and-tubes illustration (same tube fills/rims).
const INK = '#1F2937'
const SHELL = '#FFF9F4'
const YELLOW_FILL = '#FFF3B0'
const YELLOW_RIM = '#E0B400'
const BLUE_RIM = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const BRAND_BLUE = '#30598A'

// The three deltas are GIVEN in the problem — print them as little chips so the
// animation reads as the same legend coming alive while we reason.
function RuleChip({ label, delta, fill, rim }: { label: string; delta: string; fill: string; rim: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5 font-display text-[11px] font-extrabold"
      style={{ background: fill, borderColor: rim, color: INK }}
    >
      <span>{label}</span>
      <span className="tabular-nums">{delta}</span>
    </span>
  )
}

// A small yellow tube glyph used in the running yellow-count chip.
function YellowDot() {
  return (
    <svg viewBox="0 0 22 14" width={22} height={14} role="presentation" className="inline-block">
      <rect x={2} y={2} width={18} height={10} rx={3} fill={YELLOW_FILL} stroke={YELLOW_RIM} strokeWidth={1.75} />
      <ellipse cx={2} cy={7} rx={2.5} ry={5} fill="#9CA3AF" stroke={YELLOW_RIM} strokeWidth={1.5} />
    </svg>
  )
}

export default function BallTubes24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBallTubes24G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  // The running number is the segment accent unless we've landed on the answer.
  const accent = beat.result ? GREEN : beat.segment === 'A' ? YELLOW_RIM : beat.segment === 'B' ? BLUE_RIM : BRAND_BLUE

  const ariaLabel = T(
    `Strategy: Yellow +2, Blue −2, Red −1. From 5 to 6 the two unknown tubes must add +1 (Yellow + Red = 1 yellow); from 6 to 5 the three unknown tubes must add +2 (Yellow + Yellow + Blue = 2 yellow). In all, ${story.answer} yellow tubes.`,
    `Strategi: Kuning +2, Biru −2, Merah −1. Dari 5 ke 6 dua tabung tak diketahui harus menambah +1 (Kuning + Merah = 1 kuning); dari 6 ke 5 tiga tabung tak diketahui harus menambah +2 (Kuning + Kuning + Biru = 2 kuning). Semuanya ${story.answer} tabung kuning.`,
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: '#FFD3B1' }}
      >
        {/* rule key chips — the given deltas */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <RuleChip label={T('Yellow', 'Kuning')} delta="+2" fill={YELLOW_FILL} rim={YELLOW_RIM} />
          <RuleChip label={T('Blue', 'Biru')} delta="−2" fill="#D7E9F7" rim={BLUE_RIM} />
          <RuleChip label={T('Red', 'Merah')} delta="−1" fill="#F7D9DE" rim="#C0506A" />
        </div>

        {/* the equation path, with the ball glowing on the current node */}
        <BallTubes24G1 litStep={beat.litStep} />

        {/* running number + proven yellow count */}
        <div className="flex items-center justify-center gap-4">
          {beat.running !== null && (
            <motion.div
              key={`run-${index}-${beat.running}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              className="flex items-center gap-1 font-display text-xl font-black tabular-nums"
              style={{ color: accent }}
            >
              <span className="text-[11px] font-extrabold" style={{ color: INK }}>
                {T('ball', 'bola')}
              </span>
              <span>{beat.running}</span>
            </motion.div>
          )}

          {/* yellow tally chip — fills in as we prove yellows */}
          <motion.div
            key={`yellow-${beat.yellowSoFar}`}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="flex items-center gap-1 rounded-full border-2 px-2 py-0.5 font-display text-sm font-black tabular-nums"
            style={{
              background: beat.result ? '#ECFDF5' : '#FFFDF2',
              borderColor: beat.result ? GREEN : YELLOW_RIM,
              color: beat.result ? GREEN_INK : INK,
            }}
          >
            <YellowDot />
            <span>×{beat.yellowSoFar}</span>
          </motion.div>
        </div>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
