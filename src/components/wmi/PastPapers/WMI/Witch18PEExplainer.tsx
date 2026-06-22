// IKMC-21-PE-Q18 — post-answer beat-by-beat explainer.
//
// Reuses WitchRulePanel + Apple + Banana from Witch18PEIllustration
// so the animation reads as the stem figure coming alive.
//
// Animation beats (from witch18PESteps):
//   0. intro   — static rules panel; show starting fruit (4A, 5B).
//   1. step 1  — highlight Rule 1 (3A→1B); show 1A, 6B.
//   2. step 2  — highlight Rule 2 (3B→1A); show 2A, 3B.
//   3. step 3  — highlight Rule 2 again;   show 3A, 0B.
//   4. step 4  — highlight Rule 1;         show 0A, 1B.
//   5. result  — no highlight; "1 banana = Answer A" (green).

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { WitchRulePanel, Apple, Banana } from './Witch18PEIllustration'
import { buildWitch18PESteps } from './witch18PESteps'

// ── palette ──────────────────────────────────────────────────────────────────

const SHELL = '#FFFBF0'
const PANEL_BORDER = '#E4DACB'
const INK = '#1F2937'
const APPLE_RED = '#EF4444'
const BANANA_YELLOW = '#CA8A04'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const BLUE = '#30598A'

// ── FruitTray ────────────────────────────────────────────────────────────────

/**
 * Shows a labelled pile of apples and bananas.
 * Apples and bananas are laid out side by side; up to 6 in one row.
 */
function FruitTray({ apples, bananas, label }: { apples: number; bananas: number; label: string }) {
  const total = apples + bananas
  const S = 14 // fruit size
  const GAP = 30 // horizontal gap between fruit centres
  const W = Math.max(60, total * GAP + 16)
  const H = 52
  const CY = H / 2 + 4

  const items: Array<'apple' | 'banana'> = [
    ...Array<'apple'>(apples).fill('apple'),
    ...Array<'banana'>(bananas).fill('banana'),
  ]

  const startX = W / 2 - ((total - 1) * GAP) / 2

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {total === 0 ? (
          <text x={W / 2} y={CY + 4} textAnchor="middle" fontSize={12} fill="#9CA3AF" fontWeight={700}>
            —
          </text>
        ) : (
          items.map((kind, i) => {
            const cx = startX + i * GAP
            if (kind === 'apple') return <Apple key={i} cx={cx} cy={CY} s={S} />
            return <Banana key={i} cx={cx} cy={CY} s={S} />
          })
        )}
      </svg>
      <span className="font-display text-[11px] font-extrabold" style={{ color: INK }}>
        {label}
      </span>
    </div>
  )
}

// ── CountBadge ────────────────────────────────────────────────────────────────

function CountBadge({
  count,
  kind,
}: {
  count: number
  kind: 'apple' | 'banana'
}) {
  const color = kind === 'apple' ? APPLE_RED : BANANA_YELLOW
  const label = kind === 'apple' ? 'apel' : 'pisang'
  return (
    <div
      className="flex items-center gap-1 rounded-xl border-2 px-2 py-1"
      style={{ borderColor: color, background: '#FFFFFF' }}
    >
      <motion.span
        key={count}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        className="font-display text-xl font-black tabular-nums"
        style={{ color }}
      >
        {count}
      </motion.span>
      <span className="font-display text-[11px] font-bold" style={{ color: INK }}>
        {label}
      </span>
    </div>
  )
}

// ── Explainer ─────────────────────────────────────────────────────────────────

export default function Witch18PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildWitch18PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    'Simulation: witch applies 4A,5B → 3A→1B → 3B→1A → 3B→1A → 3A→1B → final 1 banana (Answer A).',
    'Simulasi: penyihir menerapkan 4A,5B → 3A→1B → 3B→1A → 3B→1A → 3A→1B → akhir 1 pisang (Jawaban A).',
  )

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[300px] flex-col items-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PANEL_BORDER }}
      >
        {/* rules panel — highlight the active rule */}
        <WitchRulePanel highlighted={beat.ruleUsed} />

        {/* current fruit counts */}
        <div className="flex items-center gap-4">
          <CountBadge count={beat.apples} kind="apple" />
          <span className="font-display text-lg font-black" style={{ color: INK }}>
            +
          </span>
          <CountBadge count={beat.bananas} kind="banana" />
        </div>

        {/* fruit tray — visual representation */}
        <FruitTray
          apples={beat.apples}
          bananas={beat.bananas}
          label={T(`Step ${index}`, `Langkah ${index}`)}
        />

        {/* equation line */}
        {beat.equation && (
          <motion.div
            key={beat.equation}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-sm font-black tabular-nums"
            style={{ color: BLUE }}
          >
            {beat.equation}
          </motion.div>
        )}

        {/* caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#FFFFFF', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
