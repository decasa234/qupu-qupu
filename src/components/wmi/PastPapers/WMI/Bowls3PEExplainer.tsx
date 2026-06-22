import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BowlShape,
  BowlContents,
  BOWL_DATA,
  type BallSpec,
} from './Bowls3PEIllustration'
import { buildBowls3PESteps, type Label } from './bowls3PESteps'

// IKMC-23-PE-Q3 — post-answer animation.
// Walks through each bowl A→E, showing the addend string and running sum,
// then reveals bowl A as the winner (sum 28 is the largest).
//
// Beat structure (7 beats):
//   0.   Intro — prompt the strategy.
//   1–5. Bowl A→E — highlight the focused bowl, show "n+n+n+n = S".
//   6.   Result — green winner badge on bowl A.

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE_BG   = '#E1EFFB'
const BLUE_INK  = '#30598A'
const BLUE_BORDER = '#30598A'

// ── layout constants ──────────────────────────────────────────────────────────
const VW = 120
const VH = 110

const ALL_LABELS: Label[] = ['A', 'B', 'C', 'D', 'E']

// ── sub-components ────────────────────────────────────────────────────────────

/** A mini bowl thumbnail for the "all bowls" intro grid. */
function MiniBowl({ label, active }: { label: Label; active: boolean }) {
  const data = BOWL_DATA[label] as [BallSpec, BallSpec, BallSpec, BallSpec]
  const sum = data.reduce((a, b) => a + b.num, 0)
  return (
    <div className="flex flex-col items-center gap-0.5">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width={64}
        height={58}
        style={{
          display: 'block',
          borderRadius: 8,
          outline: active ? `2.5px solid ${GREEN}` : undefined,
          background: active ? GREEN_BG : undefined,
          transition: 'outline 0.2s',
        }}
        role="img"
        aria-label={`Bowl ${label} sum ${sum}`}
      >
        <BowlShape highlight={active} />
        <BowlContents balls={data} />
      </svg>
      <span
        className="font-display text-xs font-extrabold"
        style={{ color: active ? GREEN_INK : BLUE_INK }}
      >
        {label}
      </span>
    </div>
  )
}

// ── main explainer ─────────────────────────────────────────────────────────────

export default function Bowls3PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBowls3PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: Jumlahkan angka di setiap mangkuk. Mangkuk A = 8+7+4+9 = 28, B = 26, C = 27, D = 24, E = 25. Mangkuk A memiliki total terbesar sehingga jawabannya A.`
      : `Explainer: Add the numbers in each bowl. Bowl A = 8+7+4+9 = 28, B = 26, C = 27, D = 24, E = 25. Bowl A has the largest total so the answer is A.`

  const isResult = beat.result

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* ── Bowl grid: all 5 bowls, active one highlighted ─────────────── */}
        <motion.div
          key={`grid-${index}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-end gap-2"
        >
          {ALL_LABELS.map((label) => (
            <MiniBowl
              key={label}
              label={label}
              active={beat.focus === label}
            />
          ))}
        </motion.div>

        {/* ── Sum display (hidden on intro beat) ────────────────────────── */}
        {beat.focus && (
          <motion.div
            key={`sum-${beat.focus}-${index}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-display text-base font-extrabold"
            style={
              isResult
                ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
                : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_INK }
            }
          >
            <span>{beat.addString}</span>
            <span>=</span>
            <span className="text-lg">{beat.sum}</span>
            {isResult && (
              <span className="ml-1 text-green-700">&#10003;</span>
            )}
          </motion.div>
        )}

        {/* ── Caption box ────────────────────────────────────────────────── */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_INK }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
