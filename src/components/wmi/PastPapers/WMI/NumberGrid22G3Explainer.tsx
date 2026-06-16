// WMI-22F3A-Q25 — animated explainer (post-answer).
//
// Strategy: deduce one cell (or pair) per beat using a concrete circle or pattern
// arithmetic equation, filling the grid progressively until all 9 digits are placed.
// Final beat highlights A=(2,0)=8, B=(1,1)=4, C=(2,2)=1 → ABC=841.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { NumberGrid3x3 } from './NumberGrid22G3Illustration'
import { buildNumberGrid22G3Steps } from './numberGrid22G3Steps'

// ---- colour tokens (mirror fill-qupu-* Tailwind tokens) ----------------------
const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const HIGHLIGHT_RING = '#F59E0B' // amber — freshly-placed cell ring
const ANSWER_RING = '#10B981'    // green — A/B/C answer cells in the final beat

// ---- Layout constants (must match the illustration's CELL / PAD values) ------
const CELL = 70
const PAD = 16
const GRID = CELL * 3
const HEX_GAP = 34
const HEX_W = 56
const HEX_H = 50
const HEX_VGAP = (GRID - 3 * HEX_H) / 2

const VIEW_W = PAD + GRID + HEX_GAP + HEX_W + PAD
const VIEW_H = PAD + GRID + PAD

const cellX = (col: number) => PAD + col * CELL
const cellY = (row: number) => PAD + row * CELL

// Pattern type mirrors the illustration — needed to reproduce the hexagon colours.
type CellPattern = 'striped' | 'gray' | 'white'

const HEXES: { pattern: CellPattern; target: number }[] = [
  { pattern: 'white', target: 10 },
  { pattern: 'gray', target: 13 },
  { pattern: 'striped', target: 22 },
]

const STRIPE_FILL = 'url(#ng-exp-stripes)'

function hexFill(p: CellPattern): string {
  return p === 'striped' ? STRIPE_FILL : p === 'gray' ? '#D7DBE0' : '#FFFFFF'
}

function hexPoints(cx: number, cy: number, w: number, h: number): string {
  const hw = w / 2
  const hh = h / 2
  const inset = hw * 0.5
  return [
    [cx - inset, cy - hh],
    [cx + inset, cy - hh],
    [cx + hw, cy],
    [cx + inset, cy + hh],
    [cx - inset, cy + hh],
    [cx - hw, cy],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ')
}

// ---- Highlight ring overlay ---------------------------------------------------

interface RingOverlayProps {
  row: number
  col: number
  color: string
}

function RingOverlay({ row, col, color }: RingOverlayProps) {
  const x = cellX(col) + 3
  const y = cellY(row) + 3
  const size = CELL - 6
  return (
    <motion.rect
      x={x}
      y={y}
      width={size}
      height={size}
      rx={6}
      fill="none"
      stroke={color}
      strokeWidth={4}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      style={{ transformOrigin: `${cellX(col) + CELL / 2}px ${cellY(row) + CELL / 2}px` }}
    />
  )
}

// ---- Caption box -------------------------------------------------------------

interface CaptionProps {
  text: string
  result: boolean
}

function Caption({ text, result }: CaptionProps) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
      style={
        result
          ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
          : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
      }
    >
      {text}
    </motion.div>
  )
}

// ---- Main component ----------------------------------------------------------

export default function NumberGrid22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildNumberGrid22G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // The A/B/C cells to ring in the final beat.
  const isFinal = beat.result
  const answerCells: Array<[number, number]> = isFinal
    ? [
        [2, 0],
        [1, 1],
        [2, 2],
      ]
    : []

  const hexColX = PAD + GRID + HEX_GAP + HEX_W / 2

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: gunakan pola abu-abu dan lingkaran kanan atas untuk menemukan sel (0,1)=7; pola putih memberi (0,0)+(2,2)=3; pola garis dan lingkaran kiri bawah memberi B=4; lanjutkan mengisi semua sel. Jawaban A=8, B=4, C=1 → ABC=841.`
      : `Explainer: use the gray pattern and top-right circle to find cell (0,1)=7; the white pattern gives (0,0)+(2,2)=3; the striped pattern and bottom-left circle give B=4; continue filling all cells. Answer A=8, B=4, C=1 → ABC=841.`

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* SVG: grid + hexagons + highlight rings */}
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={Math.min(340, VIEW_W)}>
          <defs>
            <pattern
              id="ng-exp-stripes"
              width="14"
              height="14"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="14" height="14" fill="#FFFFFF" />
              <rect width="7" height="14" fill="#B9BFC7" />
            </pattern>
          </defs>

          {/* grid with current values */}
          <NumberGrid3x3 values={beat.values} showCircles showLabels />

          {/* hexagons on the right (static — always shown) */}
          {HEXES.map(({ pattern, target }, i) => {
            const cy = PAD + HEX_VGAP + HEX_H / 2 + i * (HEX_H + HEX_VGAP)
            return (
              <g key={`hex-${i}`}>
                <polygon
                  points={hexPoints(hexColX, cy, HEX_W, HEX_H)}
                  fill={hexFill(pattern)}
                  stroke="#1E293B"
                  strokeWidth={2.5}
                />
                <text
                  x={hexColX}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={20}
                  fontWeight={800}
                  fill="#1E293B"
                  fontFamily="Nunito, sans-serif"
                >
                  {target}
                </text>
              </g>
            )
          })}

          {/* highlight rings: freshly filled cells (amber) */}
          <AnimatePresence>
            {beat.highlight.map(([r, c]) => (
              <RingOverlay key={`hl-${r}-${c}-${index}`} row={r} col={c} color={HIGHLIGHT_RING} />
            ))}
          </AnimatePresence>

          {/* answer rings: A/B/C cells on the final beat (green) */}
          <AnimatePresence>
            {answerCells.map(([r, c]) => (
              <RingOverlay key={`ans-${r}-${c}`} row={r} col={c} color={ANSWER_RING} />
            ))}
          </AnimatePresence>
        </svg>

        {/* Caption */}
        <AnimatePresence mode="wait">
          <Caption key={`cap-${index}`} text={beat.caption} result={beat.result} />
        </AnimatePresence>
      </div>
    </div>
  )
}
