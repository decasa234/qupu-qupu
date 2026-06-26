// SIMOC-19-G2-Q8 — animated explainer for the net-folding question.
//
// 5 beats:
//   0 net       — show flat net + face count
//   1 wide      — highlight the 4 wide column faces
//   2 ends      — highlight the 2 square end flanks
//   3 fold      — net + arrow + isometric box B side by side
//   4 result    — box B alone with "B ✓"

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NetGroup, IsoBox, NET_VB_W, NET_VB_H } from './NetFoldSIMOC19G2Q8Illustration'
import { buildNetFoldSIMOC19G2Q8Steps } from './netFoldSIMOC19G2Q8Steps'

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------
const BLUE      = '#1D4ED8'
const BLUE_BG   = '#DBEAFE'
const GREEN     = '#059669'
const GREEN_BG  = '#D1FAE5'
const INK       = '#1F2937'

// Face coordinates mirror the constants in the illustration.
const U  = 20
const CW = 4 * U
const CH = 1 * U
const CD = 1 * U

type HL = { x: number; y: number; w: number; h: number; color: string }

const WIDE_HL: HL[] = [
  { x: CD,   y: 0,    w: CW, h: CH, color: 'rgba(59,130,246,0.30)' },
  { x: CD,   y: CH,   w: CW, h: CH, color: 'rgba(59,130,246,0.30)' },
  { x: CD,   y: CH*2, w: CW, h: CH, color: 'rgba(59,130,246,0.30)' },
  { x: CD,   y: CH*3, w: CW, h: CH, color: 'rgba(59,130,246,0.30)' },
]
const END_HL: HL[] = [
  { x: 0,       y: CH*2, w: CD, h: CH, color: 'rgba(234,88,12,0.32)' },
  { x: CD+CW,   y: CH*2, w: CD, h: CH, color: 'rgba(234,88,12,0.32)' },
]

// ---------------------------------------------------------------------------
// Inline net SVG (uses NetGroup, no nesting)
// ---------------------------------------------------------------------------

function NetInline({ width, highlights }: { width: number; highlights: HL[] }) {
  const h = Math.round((width * NET_VB_H) / NET_VB_W)
  return (
    <svg
      viewBox={`0 0 ${NET_VB_W} ${NET_VB_H}`}
      width={width}
      height={h}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <NetGroup highlights={highlights} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Explainer
// ---------------------------------------------------------------------------

export default function NetFoldSIMOC19G2Q8Explainer({
  lang = 'id',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const story = useMemo(() => buildNetFoldSIMOC19G2Q8Steps(lang as 'en' | 'id'), [lang])

  const beat = useBeatControl(story.finalIndex, {
    step, playing, onStepCount, onStepChange, onPlayEnd,
    holds: story.steps.map((s) => s.hold),
  })

  const current = story.steps[beat]
  const { phase } = current

  const highlights: HL[] = [
    ...(phase === 'wide-faces' || phase === 'fold' ? WIDE_HL : []),
    ...(phase === 'end-faces'  || phase === 'fold' ? END_HL  : []),
  ]

  const isResult = current.result
  const eqColor  = isResult ? GREEN : BLUE
  const eqBg     = isResult ? GREEN_BG : BLUE_BG

  return (
    <div className="flex flex-col items-center gap-4 p-4 select-none">
      {/* Visual area */}
      <div style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {phase !== 'result' && phase !== 'fold' && (
            <motion.div
              key="net-only"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
            >
              <NetInline width={200} highlights={highlights} />
            </motion.div>
          )}

          {phase === 'fold' && (
            <motion.div
              key="net-arrow-box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <NetInline width={130} highlights={highlights} />
              <span style={{ fontSize: 26, fontWeight: 700, color: BLUE }}>→</span>
              <IsoBox W={4} D={1} H={1} S={12} width={100} />
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="box-result"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14 }}
            >
              <IsoBox W={4} D={1} H={1} S={14} width={130} />
              <span style={{ fontSize: 24, fontWeight: 800, color: GREEN }}>B ✓</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Equation chip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.equation}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.22 }}
          style={{
            background: eqBg,
            color: eqColor,
            borderRadius: 8,
            padding: '4px 14px',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          {current.equation}
        </motion.div>
      </AnimatePresence>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.p
          key={beat}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="text-center text-sm leading-relaxed"
          style={{ color: INK, maxWidth: 340 }}
        >
          {current.caption}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
