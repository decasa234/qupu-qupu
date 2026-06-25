// HKIMO-20-P2H-Q18 — animated explainer.
//
// Beats (see lineSegmentsHK20P2Q18Steps.ts):
//   0 intro    — full figure, no highlights.
//   1 left     — 3 far-left segments amber; counter shows 3.
//   2 hub      — +3 upper-hub segments green; counter 6.
//   3 triangle — +3 right-triangle segments teal; counter 9.
//   4 result   — all lit; big "9" revealed.

import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NodeGraph } from './primitives/NodeGraph'
import type { EdgeDef } from './primitives/NodeGraph'
import {
  NODES,
  EDGES,
  SVG_W,
  SVG_H,
  NODE_R,
} from './LineSegmentsHK20P2Q18Illustration'
import { buildLineSegmentsHK20P2Q18Steps } from './lineSegmentsHK20P2Q18Steps'

// ── Palette ───────────────────────────────────────────────────────────────────

const COL_DIM      = '#D1D5DB'   // grey  — not yet highlighted
const COL_LEFT     = '#F59E0B'   // amber — far-left segments (beat 1)
const COL_HUB      = '#10B981'   // green — upper hub segments (beat 2)
const COL_TRIANGLE = '#06B6D4'   // teal  — right triangle (beat 3+)

const LEFT_EDGES     = new Set(['LD', 'LE', 'LG'])
const HUB_EDGES      = new Set(['BD', 'CD', 'DE'])
const TRIANGLE_EDGES = new Set(['EF', 'EG', 'FG'])

function edgeColor(key: string, phase: string): string {
  if (phase === 'intro') return COL_DIM
  if (LEFT_EDGES.has(key)) return COL_LEFT
  if (HUB_EDGES.has(key)) {
    return (phase === 'hub' || phase === 'triangle' || phase === 'result')
      ? COL_HUB
      : COL_DIM
  }
  if (TRIANGLE_EDGES.has(key)) {
    return (phase === 'triangle' || phase === 'result') ? COL_TRIANGLE : COL_DIM
  }
  return COL_DIM
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LineSegmentsHK20P2Q18Explainer({
  lang = 'id',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const beats = buildLineSegmentsHK20P2Q18Steps(lang)

  const beatIndex = useBeatControl(beats.length - 1, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    stepMs: 1800,
  })

  const beat = beats[beatIndex]

  const coloredEdges: EdgeDef[] = EDGES.map(e => ({
    ...e,
    color: edgeColor(e.a + e.b, beat.phase),
  }))

  return (
    <div style={{ textAlign: 'center', userSelect: 'none' }}>
      {/* Graph */}
      <NodeGraph
        nodes={NODES}
        edges={coloredEdges}
        nodeR={NODE_R}
        width={SVG_W}
        height={SVG_H}
      />

      {/* Counter badge */}
      <div style={{ minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
        <AnimatePresence mode="wait">
          {beat.count >= 0 && (
            <motion.div
              key={beat.count}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{   scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                fontSize: beat.phase === 'result' ? 48 : 36,
                fontWeight: 700,
                color: beat.phase === 'result' ? '#10B981' : '#1F2937',
                lineHeight: 1,
              }}
            >
              {beat.count}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Caption */}
      <AnimatePresence mode="wait">
        <motion.p
          key={beat.phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{   opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          style={{
            margin: '6px auto 0',
            maxWidth: 320,
            fontSize: 14,
            color: '#4B5563',
            lineHeight: 1.4,
          }}
        >
          {beat.caption[lang]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
