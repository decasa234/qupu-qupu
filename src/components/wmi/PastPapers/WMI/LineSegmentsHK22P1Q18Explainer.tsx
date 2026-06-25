// HKIMO-22-P1H-Q18 — animated explainer.
//
// Beats (see lineSegmentsHK22P1Q18Steps.ts):
//   0 intro  — full figure, no highlights.
//   1 hub    — 4 hub segments amber; counter shows 4.
//   2 outer  — +3 outer-frame segments green; counter 7.
//   3 inner  — +2 inner segments teal; counter 9.
//   4 result — all segments lit; big "9" revealed.

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
} from './LineSegmentsHK22P1Q18Illustration'
import { buildLineSegmentsHK22P1Q18Steps } from './lineSegmentsHK22P1Q18Steps'

// ── Palette ───────────────────────────────────────────────────────────────────

const COL_DIM    = '#D1D5DB'   // grey  — not-yet-highlighted
const COL_HUB    = '#F59E0B'   // amber — hub segments (beat 1)
const COL_OUTER  = '#10B981'   // green — outer frame (beat 2)
const COL_INNER  = '#06B6D4'   // teal  — inner cross (beat 3+)

const HUB_EDGES  = new Set(['AB', 'BC', 'BD', 'BE'])
const OUTER_EDGES = new Set(['CF', 'FG', 'EG'])
const INNER_EDGES = new Set(['DE', 'DF'])

function edgeColor(key: string, phase: string): string {
  if (phase === 'intro') return COL_DIM
  if (HUB_EDGES.has(key)) return COL_HUB
  if (phase === 'outer' || phase === 'inner' || phase === 'result') {
    if (OUTER_EDGES.has(key)) return COL_OUTER
  } else {
    if (OUTER_EDGES.has(key)) return COL_DIM
  }
  if (phase === 'inner' || phase === 'result') {
    if (INNER_EDGES.has(key)) return COL_INNER
  } else {
    if (INNER_EDGES.has(key)) return COL_DIM
  }
  return COL_DIM
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LineSegmentsHK22P1Q18Explainer({
  lang = 'id',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const beats = buildLineSegmentsHK22P1Q18Steps(lang)

  const beatIndex = useBeatControl(beats.length - 1, {
    step,
    playing,
    onStepCount,
    onStepChange,
    onPlayEnd,
    stepMs: 1800,
  })

  const beat = beats[beatIndex]

  // Compute colored edges for this beat
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
