import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { BallSet } from './Balls22G1Option'
import { buildBalls22G1Steps } from './balls22G1Steps'

// WMI-22F1A-Q11 (Grade 1). Kiki's 4 balls must have MORE BLACK than white AND
// MORE LARGE than small. The animation states both rules, then walks A→D —
// ringing the black balls then the large balls — rejecting the sets that fail a
// rule (counts shown), and landing on B as the only set passing both.

const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const RED = '#DC2626'
const RED_BG = '#FEE2E2'
const RED_INK = '#991B1B'
const BLUE_BG = '#E1EFFB'
const BLUE_INK = '#30598A'
const NEUTRAL = '#94A3B8'

type Verdict = 'pass' | 'fail' | undefined

function RulePill({ label, verdict }: { label: string; verdict: Verdict }) {
  const isPass = verdict === 'pass'
  const isFail = verdict === 'fail'
  const bg = isPass ? GREEN_BG : isFail ? RED_BG : '#F1F5F9'
  const ink = isPass ? GREEN_INK : isFail ? RED_INK : NEUTRAL
  const border = isPass ? GREEN : isFail ? RED : '#CBD5E1'
  const mark = isPass ? '✓' : isFail ? '✗' : '·'
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-display text-xs font-extrabold"
      style={{ background: bg, color: ink, borderColor: border }}
    >
      <span>{label}</span>
      <span aria-hidden="true">{mark}</span>
    </div>
  )
}

export default function Balls22G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBalls22G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: Kiki butuh kumpulan 4 bola dengan lebih banyak hitam daripada putih DAN lebih banyak besar daripada kecil. Cek tiap pilihan: A seri 2 hitam 2 putih, C hanya 2 besar 2 kecil, D hanya 1 hitam. Hanya kumpulan ${story.answer} yang memenuhi kedua aturan, jadi jawabannya ${story.answer}.`
      : `Explainer: Kiki needs a set of 4 balls with more black than white AND more large than small. Check each option: A ties 2 black 2 white, C has only 2 large 2 small, D has only 1 black. Only set ${story.answer} satisfies both rules, so the answer is ${story.answer}.`

  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Option label badge + the four balls of the set under test. */}
        <div className="flex flex-col items-center gap-2">
          {beat.label && (
            <motion.div
              key={`label-${beat.label}`}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 font-display text-lg font-black"
              style={
                beat.result
                  ? { background: GREEN_BG, color: GREEN_INK, borderColor: GREEN }
                  : { background: BLUE_BG, color: BLUE_INK, borderColor: BLUE_INK }
              }
            >
              {beat.label}
            </motion.div>
          )}

          <motion.div
            key={`set-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="rounded-2xl border-2 bg-white px-3 py-2"
            style={{ borderColor: beat.result ? GREEN : '#E2E8F0' }}
          >
            <BallSet balls={beat.balls} mark={beat.mark} />
          </motion.div>
        </div>

        {/* The two rule verdict pills. */}
        <div className="flex items-center gap-2">
          <RulePill label={story.ruleColorLabel} verdict={beat.colorVerdict} />
          <RulePill label={story.ruleSizeLabel} verdict={beat.sizeVerdict} />
        </div>

        {/* Caption box — blue while deducing, green on the winning beat. */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
