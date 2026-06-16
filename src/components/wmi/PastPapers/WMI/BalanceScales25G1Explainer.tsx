import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BalanceScales25G1 } from './BalanceScales25G1Illustration'
import { buildBalanceScales25G1Steps } from './balanceScales25G1Steps'

// Palette echoes the static balance-scales figure (raw hex, matching the scan).
const INK = '#1F2937'
const BALL_FILL = '#A7D154' // green ball
const SQUARE_FILL = '#F6F3A6' // pale yellow square
const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const GREEN_BG = '#D1FAE5'
const BLUE_BG = '#E1EFFB'

// A small candidate chip — a ball or square glyph with the value(s) it can take.
function CandidateChip({
  kind,
  label,
  values,
  active,
}: {
  kind: 'ball' | 'square'
  label: string
  values: number[] | null
  active: boolean
}) {
  return (
    <motion.div
      animate={{ scale: active ? 1.04 : 1, opacity: active ? 1 : 0.55 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      className="flex items-center gap-2 rounded-xl border-2 px-3 py-1.5"
      style={{ borderColor: active ? BRAND_BLUE : '#C9D4E0', background: '#FFFFFF' }}
    >
      <svg viewBox="0 0 28 28" width={26} height={26} role="presentation">
        {kind === 'ball' ? (
          <circle cx={14} cy={14} r={11} fill={BALL_FILL} stroke={INK} strokeWidth={2.5} />
        ) : (
          <rect x={3} y={3} width={22} height={22} rx={4} fill={SQUARE_FILL} stroke={INK} strokeWidth={2.5} />
        )}
      </svg>
      <span className="font-display text-sm font-extrabold tabular-nums" style={{ color: BRAND_BLUE }}>
        {label} ={' '}
        {values ? (
          values.map((v, i) => (
            <span key={v}>
              {i > 0 && <span style={{ color: '#9aa3b2' }}> or </span>}
              {v}
            </span>
          ))
        ) : (
          <span style={{ color: '#9aa3b2' }}>?</span>
        )}
      </span>
    </motion.div>
  )
}

export default function BalanceScales25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBalanceScales25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: read each scale (2b > s, 3b < 2s, b + s < 12) to pin the ball to 3 or 4 and the square to 5 or 7. The two totals are ${story.minTotal} and ${story.maxTotal}, so the answer is ${story.maxTotal} − ${story.minTotal} = ${story.answer}.`,
    `Strategi: baca tiap timbangan (2b > s, 3b < 2s, b + s < 12) untuk menentukan bola 3 atau 4 dan persegi 5 atau 7. Dua total adalah ${story.minTotal} dan ${story.maxTotal}, jadi jawabannya ${story.maxTotal} − ${story.minTotal} = ${story.answer}.`,
  )

  const showCandidates = beat.ballCandidates != null || beat.squareCandidates != null
  const showTotals = beat.totals != null

  return (
    <div className="mx-auto w-full max-w-[720px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* the three scales, spotlighting the current one */}
        <div className="relative w-full">
          <BalanceScales25G1 litScale={beat.litScale} />

          {/* the inequality this scale reads, floated as a chip */}
          <div className="pointer-events-none absolute inset-x-0 top-1 flex justify-center">
            <AnimatePresence mode="wait">
              {beat.rule && (
                <motion.div
                  key={beat.rule}
                  initial={{ opacity: 0, y: -6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                  className="rounded-full border-2 px-4 py-1 font-display text-base font-black tabular-nums"
                  style={{ background: '#FFFFFF', borderColor: BRAND_BLUE, color: BRAND_BLUE }}
                >
                  {beat.rule}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* candidate chips: what the ball and square can be so far */}
        <div className="flex min-h-[2.75rem] items-center justify-center gap-3">
          {showCandidates ? (
            <>
              <CandidateChip kind="ball" label="b" values={beat.ballCandidates} active />
              <CandidateChip kind="square" label="s" values={beat.squareCandidates} active />
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display text-sm font-extrabold"
              style={{ color: BRAND_BLUE }}
            >
              {T('Read the scales one by one', 'Baca timbangan satu per satu')}
            </motion.div>
          )}
        </div>

        {/* the two valid totals + their difference */}
        <div className="flex min-h-[2.5rem] items-center justify-center">
          {showTotals && beat.totals && (
            <motion.div
              key={beat.result ? 'diff' : 'totals'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1 font-display text-2xl font-black tabular-nums"
            >
              {beat.result ? (
                <>
                  <span style={{ color: GREEN_INK }}>{story.maxTotal}</span>
                  <span style={{ color: '#9aa3b2' }}>−</span>
                  <span style={{ color: GREEN_INK }}>{story.minTotal}</span>
                  <span style={{ color: '#9aa3b2' }}>=</span>
                  <span style={{ color: GREEN }}>{story.answer}</span>
                </>
              ) : (
                <>
                  <span style={{ color: BRAND_BLUE }}>{T('totals:', 'total:')}</span>
                  <span style={{ color: BRAND_BLUE }}>{story.minTotal}</span>
                  <span style={{ color: '#9aa3b2' }}>&</span>
                  <span style={{ color: BRAND_BLUE }}>{story.maxTotal}</span>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* caption box */}
        <div
          className="max-w-[520px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
