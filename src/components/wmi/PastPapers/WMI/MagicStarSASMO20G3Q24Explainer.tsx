// SASMO 2020 G3 Q24 — animated explainer.
// Beat-by-beat: intro → total=77 → place 20 at junction → fill arms → result S=39.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  MagicStarSASMO20G3Q24,
  NODES_BASE,
  W,
  H,
} from './MagicStarSASMO20G3Q24Illustration'
import { buildMagicStarSASMO20G3Q24Steps } from './magicStarSASMO20G3Q24Steps'

// ── palette ─────────────────────────────────────────────────────────────────
const BLUE     = '#30598A'
const BLUE_BG  = '#E1EFFB'
const GREEN    = '#10B981'
const GREEN_BG = '#D1FAE5'
const AMBER    = '#D97706'
const AMBER_BG = '#FEF3C7'

export default function MagicStarSASMO20G3Q24Explainer(props: ExplainerProps) {
  const lang  = props.lang ?? 'id'
  const story = useMemo(() => buildMagicStarSASMO20G3Q24Steps(lang), [lang])

  const beatIndex = useBeatControl(story.finalIndex, {
    step:        props.step,
    playing:     props.playing,
    onStepCount: props.onStepCount,
    onStepChange: props.onStepChange,
    onPlayEnd:   props.onPlayEnd,
    holds:       story.steps.map(s => s.hold),
  })

  const beat = story.steps[beatIndex]

  const labels: Record<string, string> = {}
  for (const [id, val] of Object.entries(beat.filled)) {
    labels[id] = String(val)
  }

  const isResult  = beat.result
  const eqColor   = isResult ? GREEN   : BLUE
  const eqBg      = isResult ? GREEN_BG : BLUE_BG
  const hasEq     = beat.equation.length > 0

  // Build node-id → pixel position map for overlay labels
  // (NodeGraph renders at width=W, height=H with viewBox 0 0 W H)
  const NODE_PX = Object.fromEntries(NODES_BASE.map(n => [n.id, { x: n.x, y: n.y }]))
  const scale   = Math.min(300, W) / W   // matches NodeGraph's `width={Math.min(width, 300)}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, fontFamily: 'inherit' }}>
      {/* ── figure + animated overlays ──────────────────────────────────── */}
      <div style={{ position: 'relative', width: Math.min(W, 300) * scale, height: H * scale }}>
        <MagicStarSASMO20G3Q24
          highlighted={beat.lit}
          labels={{}}
        />

        {/* Number labels fade in via AnimatePresence */}
        {NODES_BASE.map(n => {
          const val = labels[n.id]
          const px  = NODE_PX[n.id]
          const isJunction = n.id === 'jn'
          return (
            <AnimatePresence key={n.id}>
              {val && (
                <motion.span
                  key={`${n.id}-${val}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    position: 'absolute',
                    left: px.x * scale,
                    top:  px.y * scale,
                    transform: 'translate(-50%, -50%)',
                    fontWeight: 700,
                    fontSize: isJunction ? 15 : 13,
                    color: isJunction ? AMBER : '#1F2937',
                    pointerEvents: 'none',
                    lineHeight: 1,
                  }}
                >
                  {val}
                </motion.span>
              )}
            </AnimatePresence>
          )
        })}
      </div>

      {/* ── equation chip ────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {hasEq && (
          <motion.div
            key={beat.equation}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.3 }}
            style={{
              background: eqBg,
              color: eqColor,
              border: `1.5px solid ${eqColor}`,
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.01em',
              textAlign: 'center',
            }}
          >
            {beat.equation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── caption ──────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.p
          key={beat.caption}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: 13,
            color: '#374151',
            textAlign: 'center',
            maxWidth: 320,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {beat.caption}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
