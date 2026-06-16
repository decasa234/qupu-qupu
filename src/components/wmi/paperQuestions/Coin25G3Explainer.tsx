import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { CoinFace, type CoinView } from './Coin25G3Illustration'
import { buildCoin25G3Steps, type OptionKey } from './coin25G3Steps'

// WMI-25F3A-Q13 — post-answer animation for the spinning-coins problem.
// We reuse CoinFace (the same glyphs as the static figure and the answer chips)
// so the animation reads as the same scene coming alive. The active option's two
// coins gently spin (a horizontal scaleX wobble = turning about the vertical
// diameter), the accepted options earn a green ✓, and the upside-down option
// earns a red ✕ — landing on D, the view a spin can never produce.

const GREEN = '#10B981'
const RED = '#DC2626'
const BLUE = '#30598A'

// One option's pair of coins, the active option's coins spinning.
function CoinPair({ view, spinning, flip }: { view: CoinView; spinning: boolean; flip: boolean }) {
  const r = 42
  const gap = 24
  const pad = 12
  const W = pad * 2 + r * 4 + gap
  const H = pad * 2 + r * 2
  const cy = pad + r
  const cxLeft = pad + r
  const cxRight = pad + r * 3 + gap

  // The spin = turning about the vertical diameter, so we squash horizontally and
  // back. Animating scaleX through 0 (edge-on) and into negative (mirror) lets the
  // viewer see both the upright and mirrored faces during one play.
  const spin = spinning ? { scaleX: [1, 0.06, -1, -0.06, 1] } : { scaleX: 1 }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 300, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {([['sea', cxLeft, view.sea] as const, ['crab', cxRight, view.crab] as const]).map(([animal, cx]) => (
        <motion.g
          key={animal}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' } as React.CSSProperties}
          animate={spin}
          transition={spinning ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
        >
          <CoinFace cx={cx} cy={cy} r={r} animal={animal} flip={view[animal]} />
        </motion.g>
      ))}
      {/* When an upside-down picture is the culprit, ring it in red so the eye lands. */}
      {flip &&
        (['sea', 'crab'] as const).map((animal, i) =>
          view[animal] === 'flip' ? (
            <circle
              key={`ring-${animal}`}
              cx={i === 0 ? cxLeft : cxRight}
              cy={cy}
              r={r + 4}
              fill="none"
              stroke={RED}
              strokeWidth={3}
              strokeDasharray="6 5"
            />
          ) : null,
        )}
    </svg>
  )
}

export default function Coin25G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const answer = ((props.correctAnswer || 'D').trim().toUpperCase() as OptionKey) || 'D'
  const story = useMemo(() => buildCoin25G3Steps(answer, lang), [answer, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: koin yang berputar hanya menampilkan gambarnya tegak atau dicerminkan kiri-kanan, tak pernah terbalik. Pilihan A, B, C, dan E hanya memakai tegak atau cermin, jadi semuanya bisa terjadi. Hanya pilihan ${story.answer} yang menampilkan kepiting terbalik, yang tak bisa dihasilkan putaran, jadi jawabannya ${story.answer}.`
      : `Explainer: a spinning coin only shows its picture upright or left-right mirrored, never upside-down. Options A, B, C and E use only upright or mirror, so they can all happen. Only option ${story.answer} shows the crab upside-down, which a spin can never produce, so the answer is ${story.answer}.`

  // Per-beat verdict chip.
  const chip =
    beat.phase === 'accept'
      ? { color: GREEN, mark: '✓', text: lang === 'id' ? 'bisa terjadi' : 'can happen' }
      : beat.phase === 'reject' || beat.phase === 'result'
        ? { color: RED, mark: '✕', text: lang === 'id' ? 'tak mungkin' : 'impossible' }
        : null

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Option label badge so the learner sees which chip is on trial. */}
        {beat.option && (
          <motion.div
            key={`opt-${beat.option}-${beat.phase}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-sm font-black"
            style={{ color: beat.phase === 'accept' ? GREEN : beat.flipSpotted ? RED : BLUE }}
          >
            {lang === 'id' ? `Pilihan ${beat.option}` : `Option ${beat.option}`}
          </motion.div>
        )}

        {beat.view ? (
          <CoinPair view={beat.view} spinning={beat.phase === 'accept'} flip={beat.flipSpotted} />
        ) : (
          // intro / rule beats: show both spinning coins of the problem stem.
          <CoinPair view={{ sea: 'up', crab: 'up' }} spinning flip={false} />
        )}

        {chip && (
          <motion.div
            key={`chip-${index}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-display text-sm font-black"
            style={{ borderColor: chip.color, color: chip.color, background: '#FFFFFF' }}
          >
            <span aria-hidden="true">{chip.mark}</span>
            {chip.text}
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'reject'
                ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
