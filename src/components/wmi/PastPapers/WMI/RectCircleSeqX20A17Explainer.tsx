// RectCircleSeqX20A17Explainer.tsx
//
// Animated explainer for SEAMOX-20-A-Q17:
//   "In which figure are there 32 circles?"
//
// Beat-by-beat: overview → count Fig 1 (8) → count Fig 2 (12) → count Fig 3 (16)
//   → notice +4 pattern → formula 4(n+1) → solve n=7 → answer: Figure 7.
//
// Imports the co-exported RectCircleSeqPanel from the Illustration.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RectCircleSeqPanel, panelSize } from './RectCircleSeqX20A17Illustration'
import { buildRectCircleSeqX20A17Steps } from './rectCircleSeqX20A17Steps'

const BLUE  = '#30598A'
const GREEN = '#10B981'
const AMBER = '#D97706'

// ── layout constants (same as illustration) ──────────────────────────────────
const PANEL_GAP = 20

const FIGURES = [1, 2, 3]
const PANEL_WIDTHS = FIGURES.map((n) => panelSize(n)[0])
const PANEL_HEIGHT = panelSize(3)[1]

const VB_W =
  PANEL_WIDTHS.reduce((a, b) => a + b, 0) + PANEL_GAP * (FIGURES.length - 1)
const VB_H = PANEL_HEIGHT

const PANEL_X_OFFSETS: number[] = []
{
  let x = 0
  for (const w of PANEL_WIDTHS) {
    PANEL_X_OFFSETS.push(x)
    x += w + PANEL_GAP
  }
}

// ── component ─────────────────────────────────────────────────────────────────

export default function RectCircleSeqX20A17Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'en'
  const t     = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildRectCircleSeqX20A17Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const captionColor = beat.result ? GREEN : beat.highlightPanel !== null ? AMBER : BLUE

  const ariaLabel = t(
    'Explainer: Fig 1=8, Fig 2=12, Fig 3=16 circles. Formula 4(n+1)=32 → n=7. Answer: Figure 7.',
    'Penjelasan: Gambar 1=8, Gambar 2=12, Gambar 3=16 lingkaran. Rumus 4(n+1)=32 → n=7. Jawaban: Gambar 7.',
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Strategy banner */}
        <div
          className="rounded-lg bg-blue-50 px-3 py-1 text-center font-display text-xs font-bold"
          style={{ color: BLUE }}
        >
          {t(
            'Each divider line → 4 circles → circles = 4(n + 1)',
            'Setiap garis pembatas → 4 lingkaran → lingkaran = 4(n + 1)',
          )}
        </div>

        {/* Figure panels */}
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width="100%"
          style={{ maxWidth: VB_W * 2.5, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={VB_W} height={VB_H} fill="#FFFFFF" />
          {FIGURES.map((n, i) => {
            const isHighlighted = beat.highlightPanel === i
            return (
              <g key={n} transform={`translate(${PANEL_X_OFFSETS[i]},0)`}>
                {/* Amber glow behind highlighted panel */}
                {isHighlighted && (
                  <rect
                    x={0}
                    y={0}
                    width={PANEL_WIDTHS[i]}
                    height={PANEL_HEIGHT}
                    rx={6}
                    fill="#FEF3C7"
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                  />
                )}
                <RectCircleSeqPanel
                  n={n}
                  highlight={isHighlighted && beat.highlightCircles ? 'count' : 'none'}
                />
              </g>
            )
          })}
        </svg>

        {/* Formula chip */}
        {beat.showFormula && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-sm font-bold"
            style={{ color: AMBER }}
          >
            {t(
              'Circles(n) = 4 × (n + 1)   →   4(n + 1) = 32   →   n = 7',
              'Lingkaran(n) = 4 × (n + 1)   →   4(n + 1) = 32   →   n = 7',
            )}
          </motion.div>
        )}

        {/* Beat caption */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={`cap-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="text-center font-display text-sm leading-snug"
            style={{ color: captionColor }}
          >
            {beat.caption}
          </motion.p>
        </AnimatePresence>

        {/* Final answer chip */}
        {beat.result && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 16, delay: 0.15 }}
            className="rounded-xl px-4 py-1.5 font-display text-base font-extrabold"
            style={{ background: GREEN, color: '#fff' }}
          >
            {t('Answer: Figure 7 (4 × 8 = 32 circles)', 'Jawaban: Gambar 7 (4 × 8 = 32 lingkaran)')}
          </motion.div>
        )}

      </div>
    </div>
  )
}
