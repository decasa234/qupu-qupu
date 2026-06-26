// TIMO-22-P2H-Q16 — post-answer animated explainer.
//
// Reuses the node/edge layout from TriangleChainTIMO22P2Q16Illustration and
// progressively highlights the four collinear groups to arrive at 18 segments.
//
// Animation beats:
//   0. intro  — static figure, prompt to label every dot
//   1. horiz  — orange: B,D,E,F,H horizontal row → 10 segments
//   2. left   — blue:   A,B,C left diagonal      →  3 more
//   3. right  — blue:   G,H,I right diagonal     →  3 more
//   4. inner  — purple: C–D and F–G              →  2 more
//   5. result — green tally: 10+3+3+2 = 18

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  NODES,
  EDGES,
  SVG_W,
  SVG_H,
  NODE_R,
} from './TriangleChainTIMO22P2Q16Illustration'
import { buildTriangleChainTIMO22P2Q16Steps } from './triangleChainTIMO22P2Q16Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const C_EDGE_BASE   = '#30598A'   // qupu blue — unlit edge
const C_HORIZ       = '#f0853a'   // orange — horizontal row
const C_DIAG        = '#3B82F6'   // blue  — left / right diagonals
const C_INNER       = '#8B5CF6'   // purple — inner edges
const C_GREEN       = '#10B981'
const C_INK         = '#1F2937'
const C_NODE_BASE   = '#F5F0E8'   // default node fill
const C_NODE_STROKE = '#30598A'

// ── node lookup map ───────────────────────────────────────────────────────────
const nodeMap = new Map(NODES.map((n) => [n.id, n]))

// ── helper: edge colour based on current beat flags ───────────────────────────
function edgeColor(
  a: string,
  b: string,
  h: boolean,   // highlightHoriz
  l: boolean,   // highlightLeft
  r: boolean,   // highlightRight
  i: boolean,   // highlightInner
  result: boolean,
): string {
  const key = [a, b].sort().join('-')
  const HORIZ_SET  = new Set(['B-D','B-E','B-F','B-H','D-E','D-F','D-H','E-F','E-H','F-H'])
  const LEFT_SET   = new Set(['A-B','A-C','B-C'])
  const RIGHT_SET  = new Set(['G-H','G-I','H-I'])
  const INNER_SET  = new Set(['C-D','F-G'])

  if (result) {
    if (HORIZ_SET.has(key))  return C_HORIZ
    if (LEFT_SET.has(key))   return C_DIAG
    if (RIGHT_SET.has(key))  return C_DIAG
    if (INNER_SET.has(key))  return C_INNER
  }
  if (i && INNER_SET.has(key))  return C_INNER
  if (r && RIGHT_SET.has(key))  return C_DIAG
  if (l && LEFT_SET.has(key))   return C_DIAG
  if (h && HORIZ_SET.has(key))  return C_HORIZ
  return C_EDGE_BASE
}

// ── node colour based on which group it belongs to in the current beat ────────
function nodeColor(
  id: string,
  h: boolean,
  l: boolean,
  r: boolean,
  i: boolean,
  result: boolean,
): string {
  const HORIZ_NODES  = new Set(['B','D','E','F','H'])
  const LEFT_NODES   = new Set(['A','B','C'])
  const RIGHT_NODES  = new Set(['G','H','I'])
  const INNER_NODES  = new Set(['C','D','F','G'])

  if ((h || result) && HORIZ_NODES.has(id))  return C_HORIZ
  if ((l || result) && LEFT_NODES.has(id))   return C_DIAG
  if ((r || result) && RIGHT_NODES.has(id))  return C_DIAG
  if ((i || result) && INNER_NODES.has(id))  return C_INNER
  return C_NODE_BASE
}

// ── ChainFig: re-renders the SVG with per-beat highlights ─────────────────────
interface ChainFigProps {
  h: boolean
  l: boolean
  r: boolean
  i: boolean
  result: boolean
  showLabels: boolean
}

function ChainFig({ h, l, r, i, result, showLabels }: ChainFigProps) {
  // Edges that are actually drawn in the figure (the 10 direct connections).
  // We also render ALL collinear combo edges when their group is highlighted.
  const COLLINEAR_HORIZ: [string,string][] = [
    ['B','D'],['B','E'],['B','F'],['B','H'],
    ['D','E'],['D','F'],['D','H'],
    ['E','F'],['E','H'],
    ['F','H'],
  ]
  const COLLINEAR_LEFT:  [string,string][] = [['A','B'],['B','C'],['A','C']]
  const COLLINEAR_RIGHT: [string,string][] = [['G','H'],['H','I'],['G','I']]
  const INNER_EDGES:     [string,string][] = [['C','D'],['F','G']]

  // Build the set of edges to render, deduped by sorted key
  const edgeSet = new Map<string, [string,string]>()
  for (const e of EDGES) {
    const key = [e.a, e.b].sort().join('-')
    edgeSet.set(key, [e.a, e.b])
  }
  if (h || result) COLLINEAR_HORIZ.forEach(([a,b]) => edgeSet.set([a,b].sort().join('-'),[a,b]))
  if (l || result) COLLINEAR_LEFT.forEach(([a,b])  => edgeSet.set([a,b].sort().join('-'),[a,b]))
  if (r || result) COLLINEAR_RIGHT.forEach(([a,b]) => edgeSet.set([a,b].sort().join('-'),[a,b]))
  if (i || result) INNER_EDGES.forEach(([a,b])     => edgeSet.set([a,b].sort().join('-'),[a,b]))

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={Math.min(SVG_W, 340)}
      aria-hidden="true"
      style={{ display: 'block', margin: '0 auto' }}
    >
      {/* edges */}
      {Array.from(edgeSet.values()).map(([a, b]) => {
        const na = nodeMap.get(a)
        const nb = nodeMap.get(b)
        if (!na || !nb) return null
        const color = edgeColor(a, b, h, l, r, i, result)
        const isLit = color !== C_EDGE_BASE
        return (
          <line
            key={`e-${a}-${b}`}
            x1={na.x} y1={na.y}
            x2={nb.x} y2={nb.y}
            stroke={color}
            strokeWidth={isLit ? 2.8 : 2}
            strokeLinecap="round"
            opacity={isLit ? 1 : 0.35}
          />
        )
      })}

      {/* node circles */}
      {NODES.map((n) => {
        const fill = nodeColor(n.id, h, l, r, i, result)
        const isLit = fill !== C_NODE_BASE
        return (
          <circle
            key={`n-${n.id}`}
            cx={n.x}
            cy={n.y}
            r={NODE_R}
            fill={fill}
            stroke={isLit ? fill : C_NODE_STROKE}
            strokeWidth={2.4}
            opacity={isLit ? 1 : 0.6}
          />
        )
      })}

      {/* node labels (shown from beat 0 onwards) */}
      {showLabels && NODES.map((n) => (
        <text
          key={`lbl-${n.id}`}
          x={n.x}
          y={n.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={NODE_R * 0.9}
          fontWeight={700}
          fill={nodeColor(n.id, h, l, r, i, result) === C_NODE_BASE ? C_INK : '#ffffff'}
          style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
        >
          {n.id}
        </text>
      ))}
    </svg>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function TriangleChainTIMO22P2Q16Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildTriangleChainTIMO22P2Q16Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: C_GREEN,  color: '#065F46' }
    : { background: '#E1EFFB', borderColor: C_EDGE_BASE, color: C_EDGE_BASE }

  return (
    <div style={{ maxWidth: 360, margin: '0 auto', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      {/* figure */}
      <ChainFig
        h={beat.highlightHoriz}
        l={beat.highlightLeft}
        r={beat.highlightRight}
        i={beat.highlightInner}
        result={isResult}
        showLabels
      />

      {/* equation badge */}
      <AnimatePresence mode="wait">
        {beat.equation && (
          <motion.div
            key={beat.equation}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            style={{
              textAlign: 'center',
              fontSize: 17,
              fontWeight: 800,
              color: isResult ? C_GREEN : C_INK,
              marginTop: 8,
              letterSpacing: '0.01em',
            }}
          >
            {beat.equation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* caption */}
      <AnimatePresence mode="wait">
        <motion.div
          key={beat.caption}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            marginTop: 10,
            padding: '8px 12px',
            borderRadius: 8,
            border: `1.5px solid ${captionStyle.borderColor}`,
            background: captionStyle.background,
            color: captionStyle.color,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {beat.caption}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
