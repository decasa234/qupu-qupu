import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  StickFigure,
  PANEL_W,
  PANEL_H,
  COLOR,
} from './StickFigX20A3Illustration'
import { buildStickFigX20A3Steps } from './stickFigX20A3Steps'

// SEAMOX-20-A-Q3 — post-answer animation.
// Reuses StickFigure from the illustration.
//
// Beats:
//   0. intro   — all three figures shown, prompt to find rule.
//   1. fig1    — highlight Fig 1, annotate upper/lower sums.
//   2. fig2    — highlight Fig 2, annotate upper/lower sums.
//   3. rule    — show the rule banner.
//   4. apply   — highlight Fig 3, annotate upper/lower sums.
//   5. result  — Fig 3 head reveals answer "5" in green.

const GREEN = '#10B981'
const BLUE = '#30598A'
const ORANGE = '#f0853a'

const SVG_W = PANEL_W * 3 + 16
const SVG_H = PANEL_H + 40

// ── Sum annotation overlay ────────────────────────────────────────────────────

/**
 * Draws two small sum badges (upper and lower) beside the stick figure.
 * `panelX` is the panel's translate-x within the big SVG.
 */
function SumOverlay({
  panelX,
  upperSum,
  lowerSum,
  showUpper,
  showLower,
}: {
  panelX: number
  upperSum: string
  lowerSum: string
  showUpper: boolean
  showLower: boolean
}) {
  const cx = panelX + PANEL_W / 2
  // upper badge above the arms
  const upperY = 22
  // lower badge below the legs
  const lowerY = SVG_H - 16

  return (
    <g fontFamily="ui-sans-serif, system-ui, sans-serif">
      {showUpper && (
        <motion.g
          key="upper"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        >
          <text
            x={cx} y={upperY}
            textAnchor="middle" dominantBaseline="central"
            fontSize={10} fontWeight={800} fill={BLUE}
          >
            {upperSum}
          </text>
        </motion.g>
      )}
      {showLower && (
        <motion.g
          key="lower"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 22 }}
        >
          <text
            x={cx} y={lowerY}
            textAnchor="middle" dominantBaseline="central"
            fontSize={10} fontWeight={800} fill={ORANGE}
          >
            {lowerSum}
          </text>
        </motion.g>
      )}
    </g>
  )
}

// Highlight ring around a panel
function HighlightRing({ panelX }: { panelX: number }) {
  return (
    <motion.rect
      key="ring"
      x={panelX - 2}
      y={8}
      width={PANEL_W + 4}
      height={PANEL_H + 4}
      rx={8}
      fill="none"
      stroke={BLUE}
      strokeWidth={2}
      strokeDasharray="4 3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    />
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function StickFigX20A3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildStickFigX20A3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }

  // Panel X offsets in the SVG
  const gap = 8
  const p1x = 0
  const p2x = PANEL_W + gap
  const p3x = (PANEL_W + gap) * 2

  const panelX = beat.highlight === 1 ? p1x : beat.highlight === 2 ? p2x : p3x

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: aturan adalah kepala = (atas-kiri + atas-kanan) – (bawah-kiri + bawah-kanan); Gambar 3: (6+4)–(2+3)=5.'
      : 'Explainer: rule is head = (upper-left + upper-right) − (lower-left + lower-right); Figure 3: (6+4)−(2+3)=5.'

  // Fig 3 head: show answer on result beat
  const fig3Head = beat.showAnswer ? 5 : ('?' as const)
  const fig3Fill = beat.showAnswer ? GREEN : COLOR.HEAD_FILL

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(300, SVG_W * 1.5)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* Figure 1 */}
          <g transform={`translate(${p1x}, 10)`}>
            <StickFigure head={7} ul={8} ur={5} ll={2} lr={4} />
          </g>

          {/* Figure 2 */}
          <g transform={`translate(${p2x}, 10)`}>
            <StickFigure head={3} ul={9} ur={2} ll={5} lr={3} />
          </g>

          {/* Figure 3 */}
          <g transform={`translate(${p3x}, 10)`}>
            <StickFigure
              head={fig3Head as number | '?'}
              ul={6} ur={4} ll={2} lr={3}
              headFill={fig3Fill}
            />
          </g>

          {/* Highlight ring on focused panel */}
          <AnimatePresence>
            {beat.highlight !== 0 && (
              <HighlightRing key={`ring-${beat.highlight}`} panelX={panelX} />
            )}
          </AnimatePresence>

          {/* Sum overlays for Fig 1 */}
          <AnimatePresence>
            {beat.highlight === 1 && (
              <SumOverlay
                panelX={p1x}
                upperSum="8+5=13"
                lowerSum="2+4=6"
                showUpper={beat.showUpperSum}
                showLower={beat.showLowerSum}
              />
            )}
          </AnimatePresence>

          {/* Sum overlays for Fig 2 */}
          <AnimatePresence>
            {beat.highlight === 2 && (
              <SumOverlay
                panelX={p2x}
                upperSum="9+2=11"
                lowerSum="5+3=8"
                showUpper={beat.showUpperSum}
                showLower={beat.showLowerSum}
              />
            )}
          </AnimatePresence>

          {/* Sum overlays for Fig 3 */}
          <AnimatePresence>
            {beat.highlight === 3 && (
              <SumOverlay
                panelX={p3x}
                upperSum="6+4=10"
                lowerSum="2+3=5"
                showUpper={beat.showUpperSum}
                showLower={beat.showLowerSum}
              />
            )}
          </AnimatePresence>
        </svg>

        {/* Equation row */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
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
