// GridPathX22B10Explainer.tsx
// SEAMOX-22-B-Q10 — animated explainer for the U-shaped path counting grid.
//
// Beats progressively fill in the Pascal-triangle path counts at each node,
// starting from A=1 and ending at B=100.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  nodeX,
  nodeY,
  SVG_W,
  SVG_H,
  CELL,
  PAD,
  C,
} from './GridPathX22B10Illustration'
import { buildGridPathX22B10Steps } from './gridPathX22B10Steps'
import type { PathNode } from './gridPathX22B10Steps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const BLUE   = '#1D4ED8'
const AMBER  = '#F59E0B'
const INK    = '#1F2937'

// ── Grid background (cells only, no interactive nodes) ────────────────────────
function GridBackground() {
  const rects: React.ReactElement[] = []
  // Left arm (cols 0-2, rows 0-1 → cells; we draw border at node positions)
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      rects.push(
        <rect
          key={`l${r}-${c}`}
          x={nodeX(c)} y={nodeY(r)}
          width={CELL} height={CELL}
          fill={C.FILL} stroke={C.GRID} strokeWidth={1.2}
        />
      )
    }
  }
  // Right arm (cols 4-6, rows 0-1)
  for (let r = 0; r < 2; r++) {
    for (let c = 4; c < 7; c++) {
      rects.push(
        <rect
          key={`r${r}-${c}`}
          x={nodeX(c)} y={nodeY(r)}
          width={CELL} height={CELL}
          fill={C.FILL} stroke={C.GRID} strokeWidth={1.2}
        />
      )
    }
  }
  // Bridge dashed line
  rects.push(
    <line
      key="bridge"
      x1={nodeX(3)} y1={nodeY(2)}
      x2={nodeX(4)} y2={nodeY(2)}
      stroke={C.BRIDGE} strokeWidth={1.5} strokeDasharray="3 2"
    />
  )
  return <g>{rects}</g>
}

// ── A / B anchor labels (always visible) ─────────────────────────────────────
function AnchorLabels() {
  return (
    <g fontFamily="ui-sans-serif, system-ui, sans-serif">
      {/* A */}
      <circle cx={nodeX(0)} cy={nodeY(0)} r={9} fill={BLUE} />
      <text x={nodeX(0)} y={nodeY(0)} textAnchor="middle" dominantBaseline="central"
        fontSize={10} fontWeight={800} fill="white">A</text>
      {/* B */}
      <circle cx={nodeX(7)} cy={nodeY(0)} r={9} fill={INK} />
      <text x={nodeX(7)} y={nodeY(0)} textAnchor="middle" dominantBaseline="central"
        fontSize={10} fontWeight={800} fill="white">B</text>
    </g>
  )
}

// ── Animated path-count label at one node ────────────────────────────────────
function NodeLabel({ node, isResult }: { node: PathNode; isResult: boolean }) {
  const x = nodeX(node.col)
  const y = nodeY(node.row)
  const isA = node.col === 0 && node.row === 0
  const isB = node.col === 7 && node.row === 0
  if (isA || isB) return null   // anchor labels handle A and B

  const bg   = node.highlight ? (isResult ? GREEN : AMBER) : '#E0E7FF'
  const text = node.highlight ? (isResult ? GREEN : AMBER) : BLUE

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.3 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
    >
      <circle cx={x} cy={y} r={11} fill={bg} />
      <text
        x={x} y={y}
        textAnchor="middle" dominantBaseline="central"
        fontSize={node.count >= 100 ? 7 : node.count >= 10 ? 8 : 9}
        fontWeight={800}
        fill={text}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {node.count}
      </text>
    </motion.g>
  )
}

// ── B label when highlighted (result beat) ───────────────────────────────────
function BResult() {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
    >
      <circle cx={nodeX(7)} cy={nodeY(0)} r={13} fill={GREEN} />
      <text x={nodeX(7)} y={nodeY(0)} textAnchor="middle" dominantBaseline="central"
        fontSize={8} fontWeight={900} fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        100
      </text>
    </motion.g>
  )
}

// ── Main explainer component ──────────────────────────────────────────────────
export default function GridPathX22B10Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildGridPathX22B10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EEF2FF', borderColor: BLUE, color: BLUE }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: isi jumlah lintasan di setiap simpul menggunakan aturan penjumlahan Pascal — B mendapat 100 lintasan.'
      : 'Explainer: fill each node with its running path count using the Pascal addition rule — B gets 100 paths.'

  // Nodes to render, excluding A (col=0,row=0) which the anchor handles
  const labelNodes = beat.nodes.filter((n) => !(n.col === 0 && n.row === 0))
  const bNode = beat.nodes.find((n) => n.col === 7 && n.row === 0)

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(340, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <GridBackground />

          {/* Beat-driven path-count labels */}
          <AnimatePresence>
            {labelNodes
              .filter((n) => !(n.col === 7 && n.row === 0))
              .map((n) => (
                <NodeLabel
                  key={`${n.col}-${n.row}`}
                  node={n}
                  isResult={isResult}
                />
              ))}
          </AnimatePresence>

          {/* B node: highlighted only when it appears in the beat */}
          <AnimatePresence>
            {isResult && bNode && <BResult key="b-result" />}
          </AnimatePresence>

          {/* A and B anchors always on top */}
          <AnchorLabels />
        </svg>

        {/* equation pill */}
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

        {/* caption */}
        <div
          className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
