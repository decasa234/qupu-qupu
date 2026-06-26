/**
 * SASMO-19-G3-Q12 explainer — "What is the perimeter of the figure with the
 * largest perimeter?" (Answer: D = 48 cm)
 *
 * Beat sequence:
 *  0 — intro:    show all 4 figures; "Identify each figure's square count"
 *  1 — largest area: Figure B has 12 squares → 48 ÷ 12 = 4 cm² → side = 2 cm
 *  2 — compare:  find the most spread-out shape (most exposed edges)
 *  3 — count C:  Figure C (H-shape) has 24 exposed edges
 *  4 — result:   24 × 2 cm = 48 cm — Answer D
 *
 * Reuses Polyomino from the primitive so the shapes read as the same scene.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Polyomino } from './primitives/Polyomino'

// ─── Colours ─────────────────────────────────────────────────────────────────

const BLUE    = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN   = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_TEXT = '#065F46'
const ORANGE  = '#F59E0B'
const ORANGE_BG = '#FFF7ED'
const INK     = '#1F2937'

// ─── Cell data (duplicate from Illustration — keeps explainer self-contained) ─

type Cells = [number, number][]

const CELLS_A: Cells = [[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[2,0],[2,1],[3,0]]
const CELLS_B: Cells = [[0,1],[0,2],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,1],[3,2]]
const CELLS_C: Cells = [[0,0],[0,2],[1,0],[1,2],[2,0],[2,1],[2,2],[3,0],[3,2],[4,0],[4,2]]
const CELLS_D: Cells = [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,1],[2,2],[2,3],[3,1],[3,2],[3,3]]

const FIGURE_CELLS: Record<string, Cells> = { A: CELLS_A, B: CELLS_B, C: CELLS_C, D: CELLS_D }

// ─── Beat definitions ─────────────────────────────────────────────────────────

interface Beat {
  phase: 'intro' | 'largestArea' | 'compare' | 'countC' | 'result'
  caption_en: string
  caption_id: string
  equation: string
  hold: number
  result: boolean
}

function buildBeats(): Beat[] {
  return [
    {
      phase: 'intro',
      caption_en: 'Four figures — all made of identical small squares.',
      caption_id: 'Empat bangun — semua terdiri dari kotak-kotak kecil yang identik.',
      equation: '',
      hold: 1800,
      result: false,
    },
    {
      phase: 'largestArea',
      caption_en: 'Figure B has the most squares (12) → largest area. Each square = 48 ÷ 12 = 4 cm² → side = 2 cm.',
      caption_id: 'Bangun B punya paling banyak kotak (12) → luas terbesar. Tiap kotak = 48 ÷ 12 = 4 cm² → sisi = 2 cm.',
      equation: '48 ÷ 12 = 4 cm² → sisi = 2 cm',
      hold: 2400,
      result: false,
    },
    {
      phase: 'compare',
      caption_en: 'A "spread-out" shape exposes more edges → larger perimeter. Which figure is most spread out?',
      caption_id: 'Bentuk yang "tersebar" memiliki lebih banyak tepi yang terbuka → keliling lebih besar. Bangun mana yang paling tersebar?',
      equation: '',
      hold: 2000,
      result: false,
    },
    {
      phase: 'countC',
      caption_en: 'Figure C (H-shape) has 24 exposed unit edges — more than A, B, or D (each 16).',
      caption_id: 'Bangun C (bentuk H) memiliki 24 tepi unit yang terbuka — lebih dari A, B, atau D (masing-masing 16).',
      equation: '24 tepi terbuka',
      hold: 2200,
      result: false,
    },
    {
      phase: 'result',
      caption_en: 'Perimeter of C = 24 × 2 cm = 48 cm — Answer D!',
      caption_id: 'Keliling C = 24 × 2 cm = 48 cm — Jawaban D!',
      equation: '24 × 2 cm = 48 cm',
      hold: 2500,
      result: true,
    },
  ]
}

// ─── Figure panel ─────────────────────────────────────────────────────────────

interface PanelProps {
  label: string
  highlight: 'area' | 'perimeter' | 'dim' | 'none'
  squareCount?: number
  edgeCount?: number
}

function FigurePanel({ label, highlight, squareCount, edgeCount }: PanelProps) {
  const cells = FIGURE_CELLS[label]
  if (!cells) return null

  const borderColor =
    highlight === 'area'      ? ORANGE :
    highlight === 'perimeter' ? GREEN  :
    highlight === 'dim'       ? '#D1D5DB' :
                                '#D1D5DB'

  const tagBg =
    highlight === 'area'      ? ORANGE_BG :
    highlight === 'perimeter' ? GREEN_BG  : 'transparent'

  const tagColor =
    highlight === 'area'      ? '#92400E' :
    highlight === 'perimeter' ? GREEN_TEXT : INK

  const tagBorder =
    highlight === 'area'      ? ORANGE :
    highlight === 'perimeter' ? GREEN  : 'transparent'

  const showTag = (highlight === 'area' && squareCount != null) ||
                  (highlight === 'perimeter' && edgeCount != null)

  return (
    <div
      className="flex flex-col items-center gap-0.5"
      style={{
        border: `2.5px solid ${borderColor}`,
        borderRadius: 10,
        padding: '4px 6px',
        background: '#fff',
        opacity: highlight === 'dim' ? 0.35 : 1,
        minWidth: 60,
      }}
    >
      <Polyomino
        cells={cells}
        cellSize={18}
        fill="#FFFFFF"
        stroke={highlight === 'dim' ? '#9CA3AF' : INK}
        strokeWidth={1.5}
        pad={3}
      />
      <span className="text-xs font-bold" style={{ color: INK }}>{label}</span>
      {showTag && (
        <span
          className="mt-0.5 rounded px-1.5 py-0.5 text-center text-[10px] font-bold"
          style={{
            background: tagBg,
            color: tagColor,
            border: `1.5px solid ${tagBorder}`,
          }}
        >
          {highlight === 'area'      ? `${squareCount!} □` : `${edgeCount!} edges`}
        </span>
      )}
    </div>
  )
}

// ─── Main explainer ───────────────────────────────────────────────────────────

export default function PolyomSASMO19G3Q12Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const beats = useMemo(buildBeats, [])
  const finalIndex = beats.length - 1

  const index = useBeatControl(finalIndex, {
    ...props,
    holds: beats.map((b) => b.hold),
  })
  const beat = beats[index] ?? beats[finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  // Determine highlight for each label
  const getHighlight = (label: string): PanelProps['highlight'] => {
    if (beat.phase === 'largestArea') return label === 'B' ? 'area' : 'dim'
    if (beat.phase === 'countC')     return label === 'C' ? 'perimeter' : 'dim'
    if (beat.phase === 'result')     return label === 'C' ? 'perimeter' : 'dim'
    return 'none'
  }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Bangun B punya 12 kotak terbesar (luas 48 cm²) → sisi 2 cm. Bangun C (huruf H) punya 24 tepi terbuka — keliling terbesar. 24 × 2 cm = 48 cm. Jawaban D.'
      : 'Explainer: Figure B has 12 squares (largest area 48 cm²) → side 2 cm. Figure C (H-shape) has 24 exposed edges — largest perimeter. 24 × 2 cm = 48 cm. Answer D.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Four figure panels */}
        <div className="flex flex-wrap items-end justify-center gap-2">
          {(['A', 'B', 'C', 'D'] as const).map((label) => (
            <FigurePanel
              key={label}
              label={label}
              highlight={getHighlight(label)}
              squareCount={label === 'B' ? 12 : undefined}
              edgeCount={label === 'C' ? 24 : undefined}
            />
          ))}
        </div>

        {/* Equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 text-sm font-black tabular-nums text-white"
                style={{ background: isResult ? GREEN : BLUE }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center text-sm font-extrabold"
          style={captionStyle}
        >
          {lang === 'id' ? beat.caption_id : beat.caption_en}
        </div>

      </div>
    </div>
  )
}
