// SEAMO-16-A-Q13 — Explainer: grid-path counting from A to B (right & up only).
//
// Strategy: Pascal's triangle on the lattice.
//   Label each node with the number of paths from A (bottom-left).
//   Each node's count = (count of node to its left) + (count of node below it).
//   The answer at B (top-right) is C(6,3) = 20.
//
// The 4×4 lattice of node counts (row 0 = top, row 3 = bottom = A-row):
//
//   row 0 (top):     1   3   6  10  (→ rightward accumulation from row 3)
//   row 1:           1   3   6  [10] — wait, let's be exact:
//
//   Coordinate convention: col 0..3 (left→right), row 0..3 (top→bottom).
//   NODE_A = (col=0, row=3); NODE_B = (col=3, row=0).
//   Moving right = col+1, moving up = row-1.
//
//   Base: A itself = 1.  All nodes in col 0 (below B column) = 1 (only one way: go straight up).
//   All nodes in row 3 (A row, rightward) = 1 (only one way: go straight right).
//
//   paths(col, row) =
//     paths(col-1, row)   // came from left
//   + paths(col, row+1)   // came from below
//
//   paths(0, 3) = 1            (A)
//   paths(1, 3) = 1  paths(2, 3) = 1  paths(3, 3) = 1   (bottom row)
//   paths(0, 2) = 1  paths(0, 1) = 1  paths(0, 0) = 1   (left column)
//   paths(1, 2) = paths(0,2)+paths(1,3) = 1+1 = 2
//   paths(2, 2) = paths(1,2)+paths(2,3) = 2+1 = 3
//   paths(3, 2) = paths(2,2)+paths(3,3) = 3+1 = 4
//   paths(1, 1) = paths(0,1)+paths(1,2) = 1+2 = 3
//   paths(2, 1) = paths(1,1)+paths(2,2) = 3+3 = 6
//   paths(3, 1) = paths(2,1)+paths(3,2) = 6+4 = 10
//   paths(1, 0) = paths(0,0)+paths(1,1) = 1+3 = 4
//   paths(2, 0) = paths(1,0)+paths(2,1) = 4+6 = 10
//   paths(3, 0) = paths(2,0)+paths(3,1) = 10+10 = 20  ← B, answer A
//
// Animation: beat-by-beat, reveal node counts in left-to-right, bottom-to-top
// order (BFS diagonal order). Each beat labels one "wave" of nodes.

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CELL,
  GRID_N,
  SVG_W,
  SVG_H,
  nodeXY,
  NODE_A,
  NODE_B,
  CELL_FILL,
} from './GridPath16A13Illustration'

// ── Colour tokens ─────────────────────────────────────────────────────────────

const BLUE   = '#30598A'   // qupu brand blue
const GREEN  = '#059669'   // answer accent
const AMBER  = '#D97706'   // highlight new node
const INK    = '#1E3A5F'
const GRID_STROKE = '#3B82F6'
const BORDER_W = 2.0

// ── Node counts (Pascal's triangle on the 4×4 lattice) ───────────────────────

// paths[row][col] — number of paths from A to the node at (col, row).
// row 0 = topmost (near B); row 3 = bottom (A row).
const PATHS: number[][] = [
  [1,  4,  10, 20],   // row 0 (top)
  [1,  3,   6, 10],   // row 1
  [1,  2,   3,  4],   // row 2
  [1,  1,   1,  1],   // row 3 (bottom, A row)
]

// ── Beat storyboard ───────────────────────────────────────────────────────────

// We reveal nodes in "anti-diagonal" waves (col + (GRID_N - row) = d):
//   d=0: (0,3) — just A itself
//   d=1: (1,3), (0,2)
//   d=2: (2,3), (1,2), (0,1)
//   d=3: (3,3), (2,2), (1,1), (0,0)
//   d=4: (3,2), (2,1), (1,0)
//   d=5: (3,1), (2,0)
//   d=6: (3,0) — B
//
// Group these into 5 explainer beats (some diagonals merged for pacing):
//   Beat 0: d=0 — introduce A = 1
//   Beat 1: d=1,2 — fill bottom row and left column (all = 1)
//   Beat 2: d=3,4 — fill interior bottom-left triangle
//   Beat 3: d=5 — fill second-to-top diagonal
//   Beat 4: d=6 — reveal B = 20 (answer)

// Which nodes are "revealed" (shown with a number label) at each beat.
// Cumulative: beat N shows all nodes from beats 0..N.
const WAVE_NODES: Array<Array<[number, number]>> = [
  // beat 0 — just A
  [[0, 3]],
  // beat 1 — rest of bottom row + left column (all value = 1)
  [[1, 3], [2, 3], [3, 3], [0, 2], [0, 1], [0, 0]],
  // beat 2 — interior rows 2 and 1
  [[1, 2], [2, 2], [3, 2], [1, 1], [2, 1], [3, 1]],
  // beat 3 — row 0 all except B
  [[1, 0], [2, 0]],
  // beat 4 — B = 20 (answer)
  [[3, 0]],
]

interface GridBeat {
  /** Cumulative set of nodes whose count is visible. */
  revealed: Set<string>
  caption: string
  hold: number
  result: boolean
}

const nodeKey = (col: number, row: number) => `${col},${row}`

function buildBeats(lang: 'en' | 'id'): GridBeat[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const captions = [
    t(
      'Point A is the start. There is exactly 1 way to be at A — doing nothing.',
      'Titik A adalah awal. Ada tepat 1 cara berada di A — tidak kemana-mana.',
    ),
    t(
      'Moving only right or up: the entire bottom row and left column each have just 1 path (straight line).',
      'Bergerak hanya kanan atau atas: baris bawah dan kolom kiri masing-masing hanya punya 1 jalur (garis lurus).',
    ),
    t(
      'Each interior node = (paths from left) + (paths from below). Fill in the counts!',
      'Setiap simpul dalam = (jalur dari kiri) + (jalur dari bawah). Isi hitungannya!',
    ),
    t(
      'Continue the Pascal\'s-triangle pattern row by row toward B.',
      'Lanjutkan pola segitiga Pascal baris demi baris menuju B.',
    ),
    t(
      '20 paths reach B! The answer is 20 → A.',
      '20 jalur mencapai B! Jawabannya 20 → A.',
    ),
  ]

  const holds = [2200, 2000, 2000, 1800, 0]

  const beats: GridBeat[] = []
  const revealed = new Set<string>()

  for (let i = 0; i < WAVE_NODES.length; i++) {
    for (const [col, row] of WAVE_NODES[i]) {
      revealed.add(nodeKey(col, row))
    }
    beats.push({
      revealed: new Set(revealed),
      caption: captions[i],
      hold: holds[i],
      result: i === WAVE_NODES.length - 1,
    })
  }

  return beats
}

// ── Sub-components ────────────────────────────────────────────────────────────

function GridBg() {
  const cells: React.ReactNode[] = []
  for (let r = 0; r < GRID_N; r++) {
    for (let c = 0; c < GRID_N; c++) {
      const [x, y] = nodeXY(c, r)
      cells.push(
        <rect key={`cell-${r}-${c}`} x={x} y={y} width={CELL} height={CELL} fill={CELL_FILL} />,
      )
    }
  }
  const lines: React.ReactNode[] = []
  for (let c = 0; c <= GRID_N; c++) {
    const [x] = nodeXY(c, 0)
    lines.push(
      <line key={`v${c}`} x1={x} y1={nodeXY(0, 0)[1]} x2={x} y2={nodeXY(0, GRID_N)[1]}
        stroke={GRID_STROKE} strokeWidth={BORDER_W} />,
    )
  }
  for (let r = 0; r <= GRID_N; r++) {
    const [, y] = nodeXY(0, r)
    lines.push(
      <line key={`h${r}`} x1={nodeXY(0, r)[0]} y1={y} x2={nodeXY(GRID_N, r)[0]} y2={y}
        stroke={GRID_STROKE} strokeWidth={BORDER_W} />,
    )
  }
  return <g>{cells}{lines}</g>
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GridPath16A13Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats = useMemo(() => buildBeats(lang), [lang])
  const finalIndex = beats.length - 1
  const index = useBeatControl(finalIndex, { ...props, holds: beats.map((b) => b.hold) })
  const beat = beats[index] ?? beats[finalIndex]

  const ariaLabel = t(
    'Grid-path explainer: label each node with path count using Pascal\'s triangle. The top-right node B gets 20 paths — answer A.',
    'Penjelasan jalur kisi: beri label tiap simpul dengan jumlah jalur menggunakan segitiga Pascal. Simpul B di kanan atas mendapat 20 jalur — jawaban A.',
  )

  const [ax, ay] = nodeXY(...NODE_A)
  const [bx, by] = nodeXY(...NODE_B)

  return (
    <div
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* strategy pill */}
        <div
          className="rounded-lg px-3 py-1 text-center font-display text-xs font-bold"
          style={{ background: '#DBEAFE', color: BLUE }}
        >
          {t(
            'Pascal\'s triangle: each node = left + below',
            'Segitiga Pascal: tiap simpul = kiri + bawah',
          )}
        </div>

        {/* the grid scene */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={Math.min(280, SVG_W)}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          <GridBg />

          {/* Node count labels */}
          {Array.from({ length: GRID_N + 1 }, (_, row) =>
            Array.from({ length: GRID_N + 1 }, (_, col) => {
              const key = nodeKey(col, row)
              if (!beat.revealed.has(key)) return null
              const [nx, ny] = nodeXY(col, row)
              const count = PATHS[row][col]
              const isB = col === NODE_B[0] && row === NODE_B[1]
              const isA = col === NODE_A[0] && row === NODE_A[1]
              const isNew = WAVE_NODES[index]?.some(([c, r]) => c === col && r === row)
              const color = isB && beat.result ? GREEN : isNew ? AMBER : BLUE

              return (
                <AnimatePresence key={key}>
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                  >
                    {/* backing circle */}
                    <circle
                      cx={nx}
                      cy={ny}
                      r={isB || isA ? 15 : 13}
                      fill={isB && beat.result ? GREEN : isA ? BLUE : '#E0EEFF'}
                      stroke={color}
                      strokeWidth={isB || isA ? 2.5 : 1.5}
                    />
                    <text
                      x={nx}
                      y={ny}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={count >= 10 ? 10 : 12}
                      fontWeight={800}
                      fontFamily="system-ui, sans-serif"
                      fill={isB && beat.result ? 'white' : isA ? 'white' : color}
                    >
                      {count}
                    </text>
                  </motion.g>
                </AnimatePresence>
              )
            }),
          )}

          {/* "A" corner label */}
          <text
            x={ax - 2}
            y={ay + 22}
            textAnchor="middle"
            dominantBaseline="auto"
            fontSize={16}
            fontWeight={800}
            fontFamily="system-ui, sans-serif"
            fill={INK}
          >
            A
          </text>

          {/* "B" corner label */}
          <text
            x={bx + 4}
            y={by - 6}
            textAnchor="start"
            dominantBaseline="auto"
            fontSize={16}
            fontWeight={800}
            fontFamily="system-ui, sans-serif"
            fill={beat.result ? GREEN : INK}
          >
            B
          </text>
        </svg>

        {/* answer badge — only shown on final beat */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence initial={false}>
            {beat.result && (
              <motion.span
                key="answer-badge"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-5 py-1 font-display text-sm font-black text-white"
                style={{ background: GREEN }}
              >
                {t('20 paths → A', '20 jalur → A')}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#DBEAFE', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
