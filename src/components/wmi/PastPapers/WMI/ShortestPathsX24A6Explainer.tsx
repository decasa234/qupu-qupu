// ShortestPathsX24A6Explainer.tsx
// SEAMO-X 2024 Paper A Q6 — animated explainer.
//
// Beats fill in the Pascal-triangle path counts for the 4×4 node grid (3×3 cells),
// with x=0 blocking intersection (1,1), landing on B=(3,3)=8 paths.

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  nodeX,
  nodeY,
  SVG_W,
  SVG_H,
  CELL,
  COLS,
  ROWS,
  C,
} from './ShortestPathsX24A6Illustration'
import { buildShortestPathsX24A6Steps } from './shortestPathsX24A6Steps'
import type { PathNode } from './shortestPathsX24A6Steps'

// ── Colour tokens ──────────────────────────────────────────────────────────────
const GREEN  = '#10B981'
const BLUE   = '#1D4ED8'
const AMBER  = '#F59E0B'
const RED    = '#DC2626'
const INK    = '#1F2937'

// ── Grid background (static cells) ────────────────────────────────────────────
function GridBackground() {
  const rects: React.ReactElement[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      rects.push(
        <rect
          key={`${r}-${c}`}
          x={nodeX(c)}
          y={nodeY(r)}
          width={CELL}
          height={CELL}
          fill={C.FILL}
          stroke={C.GRID}
          strokeWidth={1.2}
        />,
      )
    }
  }
  return <g>{rects}</g>
}

// ── A / B anchor labels (always visible) ─────────────────────────────────────
function AnchorLabels() {
  return (
    <g fontFamily="ui-sans-serif, system-ui, sans-serif">
      {/* A */}
      <circle cx={nodeX(0)} cy={nodeY(0)} r={11} fill={BLUE} />
      <text x={nodeX(0)} y={nodeY(0)} textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={800} fill="white">A</text>
      {/* B (placeholder — overridden on result beat) */}
      <circle cx={nodeX(3)} cy={nodeY(3)} r={11} fill={INK} />
      <text x={nodeX(3)} y={nodeY(3)} textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={800} fill="white">B</text>
    </g>
  )
}

// ── Animated path-count label at one node ─────────────────────────────────────
function NodeLabel({ node, isResult }: { node: PathNode; isResult: boolean }) {
  const x = nodeX(node.col)
  const y = nodeY(node.row)

  // A is always handled by AnchorLabels
  if (node.col === 0 && node.row === 0) return null

  // Blocked node — show as red X
  if (node.count === 0) {
    return (
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.3 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      >
        <circle cx={x} cy={y} r={11} fill={RED} />
        <text
          x={x} y={y}
          textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={800} fill="white"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontStyle="italic"
        >
          x
        </text>
      </motion.g>
    )
  }

  // B node — handled separately on result beat
  if (node.col === 3 && node.row === 3) return null

  const bg   = node.highlight ? (isResult ? GREEN : AMBER) : '#E0E7FF'
  const text = node.highlight ? 'white' : BLUE

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
        fontSize={node.count >= 10 ? 8 : 10}
        fontWeight={800}
        fill={text}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {node.count}
      </text>
    </motion.g>
  )
}

// ── B result bubble (final beat) ──────────────────────────────────────────────
function BResult() {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
    >
      <circle cx={nodeX(3)} cy={nodeY(3)} r={13} fill={GREEN} />
      <text x={nodeX(3)} y={nodeY(3)} textAnchor="middle" dominantBaseline="central"
        fontSize={10} fontWeight={900} fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif">
        8
      </text>
    </motion.g>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function ShortestPathsX24A6Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const story = useMemo(() => buildShortestPathsX24A6Steps(lang), [lang])
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
      ? 'Penjelasan: isi jumlah jalur di setiap simpul menggunakan aturan penjumlahan Pascal; simpul x diblokir (nilai 0); B mendapat 8 jalur.'
      : 'Explainer: fill each node with its path count using Pascal addition; x is blocked (value 0); B gets 8 paths.'

  // Nodes excluding A (always shown by AnchorLabels) and B (shown by BResult on result beat)
  const labelNodes = beat.nodes.filter((n) => !(n.col === 0 && n.row === 0))
  const bNode = beat.nodes.find((n) => n.col === 3 && n.row === 3)

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(280, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <GridBackground />

          {/* Beat-driven path-count labels */}
          <AnimatePresence>
            {labelNodes
              .filter((n) => !(n.col === 3 && n.row === 3))
              .map((n) => (
                <NodeLabel
                  key={`${n.col}-${n.row}-${n.count}`}
                  node={n}
                  isResult={isResult}
                />
              ))}
          </AnimatePresence>

          {/* B result bubble (only on final beat) */}
          <AnimatePresence>
            {isResult && bNode && <BResult key="b-result" />}
          </AnimatePresence>

          {/* A / B anchors always on top */}
          <AnchorLabels />
        </svg>

        {/* Equation pill */}
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
          className="min-h-[3rem] w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
