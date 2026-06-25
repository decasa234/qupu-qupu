// HKIMO-25-P1H-Q18 — animated explainer.
//
// Beats:
//   0 intro  — full figure, all dim; no counter.
//   1 outer  — 7 outer boundary edges amber; counter shows 7.
//   2 inner  — +4 inner diagonal edges green; counter shows 11.
//   3 result — all lit; big green "11" revealed.

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
} from './PolySegHK25P1Q18Illustration'
import { buildPolySegHK25P1Q18Steps } from './polySegHK25P1Q18Steps'

// ── Palette ───────────────────────────────────────────────────────────────────

const COL_DIM   = '#D1D5DB'  // grey — not yet highlighted
const COL_OUTER = '#F59E0B'  // amber — outer boundary (beat 1)
const COL_INNER = '#10B981'  // green — inner diagonals (beat 2+)

const OUTER_SET = new Set(['AB', 'BE', 'EH', 'HG', 'GF', 'FD', 'DA'])
const INNER_SET = new Set(['AC', 'CE', 'BC', 'CD'])

function edgeColor(key: string, phase: string): string {
  if (phase === 'intro') return COL_DIM
  if (OUTER_SET.has(key)) return COL_OUTER
  if ((phase === 'inner' || phase === 'result') && INNER_SET.has(key)) return COL_INNER
  return COL_DIM
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PolySegHK25P1Q18Explainer({
  lang = 'id',
  step,
  playing,
  onStepCount,
  onStepChange,
  onPlayEnd,
}: ExplainerProps) {
  const beats = buildPolySegHK25P1Q18Steps(lang)

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
