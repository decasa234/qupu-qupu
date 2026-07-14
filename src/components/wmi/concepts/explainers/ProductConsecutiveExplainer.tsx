import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildProductConsecutiveSteps } from './productConsecutiveSteps'
import { useBeatControl } from './useBeatControl'

const BLUE = '#2f6df0'
const ORANGE = '#F97316'
const GREEN = '#10B981'
const PURPLE = '#341857'
const MUTED = '#9aa3b2'

function Chip({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="flex h-14 min-w-[3.5rem] items-center justify-center rounded-xl border-[3px] bg-white px-3 font-display text-3xl font-extrabold"
      style={{ borderColor: color, color: PURPLE }}
    >
      {children}
    </motion.div>
  )
}

function Op({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-display text-2xl font-extrabold" style={{ color: MUTED }}>
      {children}
    </span>
  )
}

export default function ProductConsecutiveExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { k: number }
  const story = useMemo(() => buildProductConsecutiveSteps(p.k, lang), [p.k, lang])
  const index = useBeatControl(story.finalIndex, { ...props, stepMs: 1900 })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { smaller, larger, product, answer } = story
  const phase = beat.phase

  // Visibility flags
  const showProductChip = phase === 'intro' || phase === 'near'
  const showSqrtHint = phase === 'near'
  const showPair = phase === 'pair' || phase === 'verify' || phase === 'result'
  const showVerifyEq = phase === 'verify'
  const showResult = phase === 'result'

  // Approximate sqrt for hint text
  const sqrtApprox = Math.sqrt(product).toFixed(1)

  const ariaLabel =
    lang === 'id'
      ? `Cara berpikir: dua bilangan berurutan dikalikan menghasilkan ${product}; bilangan yang lebih besar adalah ${answer}.`
      : `Strategy: two consecutive numbers multiply to ${product}; the larger number is ${answer}.`

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div className="flex min-h-[13.125rem] flex-col items-center justify-center gap-4">

        {/* Intro / Near: big product chip */}
        {showProductChip && (
          <motion.div
            key="product-chip"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="flex h-16 min-w-[4rem] items-center justify-center rounded-2xl border-[3px] bg-white px-4 font-display text-4xl font-extrabold"
            style={{ borderColor: PURPLE, color: PURPLE }}
          >
            {product}
          </motion.div>
        )}

        {/* Near: sqrt hint */}
        {showSqrtHint && (
          <motion.div
            key="sqrt-hint"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="font-display text-base font-bold"
            style={{ color: MUTED }}
          >
            √{product} ≈ {sqrtApprox}
          </motion.div>
        )}

        {/* Pair / Verify / Result: two consecutive tiles */}
        {showPair && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Chip color={BLUE}>{smaller}</Chip>

            {showVerifyEq && <Op>×</Op>}

            <Chip color={showResult ? GREEN : ORANGE}>{larger}</Chip>

            {showVerifyEq && (
              <>
                <Op>=</Op>
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 26 }}
                  className="font-display text-3xl font-extrabold"
                  style={{ color: PURPLE }}
                >
                  {product}
                </motion.div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-display text-2xl"
                  style={{ color: GREEN }}
                >
                  ✓
                </motion.span>
              </>
            )}

            {showResult && (
              <>
                <Op>=</Op>
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="font-display text-3xl font-extrabold"
                  style={{ color: GREEN }}
                >
                  {answer}
                </motion.div>
              </>
            )}
          </div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
