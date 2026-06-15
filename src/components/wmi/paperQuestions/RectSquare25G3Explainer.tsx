// WMI-25F3A-Q4 — Three identical rectangles (portrait, w × 3w) arranged
// side-by-side form a square. Each rectangle has perimeter 48 cm.
// Strategy: name the short side w → perimeter equation 8w = 48 → w = 6
//           → square side = 3w = 18 → square perimeter = 4 × 18 = 72. Answer C.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'

// ── Colour tokens (mirror illustration palette) ───────────────────────────────
const INK = '#1F2937'
const FILL_A = '#DBEAFE' // column 0 & 2
const FILL_B = '#EFF6FF' // column 1
const GREEN = '#10B981'
const AMBER = '#D97706'
const CAPTION_BG = '#E1EFFB'
const CAPTION_BORDER = '#30598A'
const CAPTION_TEXT = '#30598A'
const RESULT_BG = '#D1FAE5'
const RESULT_BORDER = '#10B981'
const RESULT_TEXT = '#065F46'

// ── SVG layout (same proportions as RectSquare25G3Figure) ────────────────────
const W = 54   // short side of each rectangle (SVG units)
const S = W * 3 // square side = long side = 162
const PAD = 24
const VW = S + PAD * 2          // 210
const VH = S + PAD * 2 + 40    // 250

const X0 = PAD
const Y0 = PAD

// per-column fill colours
const COL_FILLS = [FILL_A, FILL_B, FILL_A]

// ── Bilingual helper ──────────────────────────────────────────────────────────
function t(lang: 'en' | 'id', en: string, id: string) {
  return lang === 'id' ? id : en
}

// ── Beat definition ───────────────────────────────────────────────────────────
interface Beat {
  /** Which columns to highlight with an amber stroke ring */
  highlightCols: boolean[]
  /** Overlay label shown on the right side (optional) */
  sideLabel: string | null
  /** Equation row text */
  equation: string | null
  /** Whether this is the winning answer beat */
  result: boolean
  /** Caption text (bilingual) */
  caption: [string, string]
  hold: number
}

function buildBeats(): Beat[] {
  return [
    {
      highlightCols: [false, false, false],
      sideLabel: null,
      equation: null,
      result: false,
      caption: [
        'Three identical rectangles stand side by side to make a square — let\'s find w!',
        'Tiga persegi panjang identik berdiri berdampingan membentuk persegi — cari w!',
      ],
      hold: 2400,
    },
    {
      highlightCols: [true, false, false],
      sideLabel: 'short = w\nlong = 3w',
      equation: '2(3w + w) = 48',
      result: false,
      caption: [
        'Each rectangle has short side w and long side 3w. Perimeter: 2(3w + w) = 48.',
        'Tiap persegi panjang: sisi pendek w, sisi panjang 3w. Keliling: 2(3w + w) = 48.',
      ],
      hold: 2600,
    },
    {
      highlightCols: [true, false, false],
      sideLabel: '8w = 48\nw = 6',
      equation: '8w = 48  →  w = 6 cm',
      result: false,
      caption: [
        'Simplify: 8w = 48, so w = 6 cm.',
        'Sederhanakan: 8w = 48, jadi w = 6 cm.',
      ],
      hold: 2200,
    },
    {
      highlightCols: [true, true, true],
      sideLabel: '3w = 18 cm\n(square side)',
      equation: '3 × 6 = 18 cm  (square side)',
      result: false,
      caption: [
        'The square side equals the long side = 3 × 6 = 18 cm.',
        'Sisi persegi sama dengan sisi panjang = 3 × 6 = 18 cm.',
      ],
      hold: 2200,
    },
    {
      highlightCols: [true, true, true],
      sideLabel: '4 × 18\n= 72 cm',
      equation: '4 × 18 = 72 cm  ✓  C',
      result: true,
      caption: [
        'Square perimeter = 4 × 18 = 72 cm → Answer C!',
        'Keliling persegi = 4 × 18 = 72 cm → Jawaban C!',
      ],
      hold: 0,
    },
  ]
}

// ── Figure SVG ────────────────────────────────────────────────────────────────
function RectFigure({ beat }: { beat: Beat }) {
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Column fills */}
      {[0, 1, 2].map((i) => (
        <rect
          key={`fill-${i}`}
          x={X0 + i * W}
          y={Y0}
          width={W}
          height={S}
          fill={COL_FILLS[i]}
          stroke={INK}
          strokeWidth={2}
        />
      ))}

      {/* Outer square border */}
      <rect
        x={X0}
        y={Y0}
        width={S}
        height={S}
        fill="none"
        stroke={INK}
        strokeWidth={2.5}
      />

      {/* Highlight ring for active columns */}
      {beat.highlightCols[0] && beat.highlightCols[2] && (
        <rect
          x={X0 - 3}
          y={Y0 - 3}
          width={S + 6}
          height={S + 6}
          fill="none"
          stroke={AMBER}
          strokeWidth={2.5}
          strokeDasharray="8 4"
          rx={4}
        />
      )}
      {beat.highlightCols[0] && !beat.highlightCols[2] && (
        <rect
          x={X0 - 3}
          y={Y0 - 3}
          width={W + 6}
          height={S + 6}
          fill="none"
          stroke={AMBER}
          strokeWidth={2.5}
          strokeDasharray="8 4"
          rx={4}
        />
      )}

      {/* "w" labels above each column */}
      {[0, 1, 2].map((i) => (
        <text
          key={`lbl-${i}`}
          x={X0 + i * W + W / 2}
          y={Y0 - 8}
          textAnchor="middle"
          dominantBaseline="auto"
          fontSize={13}
          fontWeight={700}
          fill={INK}
        >
          w
        </text>
      ))}

      {/* "3w" label on right */}
      <text
        x={X0 + S + 10}
        y={Y0 + S / 2}
        textAnchor="start"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={INK}
      >
        3w
      </text>

      {/* Perimeter note below */}
      <text
        x={X0 + S / 2}
        y={Y0 + S + 18}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fill="#6B7280"
      >
        Keliling / Perimeter = 48 cm
      </text>

      {/* Side label overlay (top-right inside the square) */}
      {beat.sideLabel && (
        <>
          <rect
            x={X0 + S / 2 - 2}
            y={Y0 + 6}
            width={S / 2 - 2}
            height={46}
            rx={6}
            fill={beat.result ? '#D1FAE5' : '#FEF3C7'}
            stroke={beat.result ? GREEN : AMBER}
            strokeWidth={1.5}
            opacity={0.95}
          />
          {beat.sideLabel.split('\n').map((line, li) => (
            <text
              key={`sl-${li}`}
              x={X0 + S * 0.75}
              y={Y0 + 22 + li * 18}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={700}
              fill={beat.result ? RESULT_TEXT : '#92400E'}
            >
              {line}
            </text>
          ))}
        </>
      )}
    </svg>
  )
}

// ── Equation chip ─────────────────────────────────────────────────────────────
function EquationChip({ text, result }: { text: string; result: boolean }) {
  return (
    <div
      style={{
        background: result ? '#D1FAE5' : '#FFF7ED',
        border: `2px solid ${result ? GREEN : AMBER}`,
        color: result ? RESULT_TEXT : '#92400E',
        borderRadius: 10,
        padding: '6px 16px',
        fontFamily: 'monospace',
        fontSize: 15,
        fontWeight: 700,
        textAlign: 'center',
        letterSpacing: 0.3,
      }}
    >
      {text}
    </div>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────
export default function RectSquare25G3Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const beats = useMemo(() => buildBeats(), [])
  const finalIndex = beats.length - 1

  const index = useBeatControl(finalIndex, {
    ...props,
    holds: beats.map((b) => b.hold),
  })

  const beat = beats[index] ?? beats[finalIndex]
  const caption = beat.caption[lang === 'id' ? 1 : 0]

  return (
    <div
      className="mx-auto w-full max-w-[400px]"
      role="img"
      aria-label={t(
        lang,
        'Three rectangles with perimeter 48 cm form a square: 8w=48 → w=6 → side 18 → perimeter 72 cm, answer C.',
        'Tiga persegi panjang keliling 48 cm membentuk persegi: 8w=48 → w=6 → sisi 18 → keliling 72 cm, jawaban C.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{ width: '100%' }}
        >
          <RectFigure beat={beat} />
        </motion.div>

        {beat.equation && (
          <motion.div
            key={`eq-${index}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.08 }}
            style={{ width: '100%' }}
          >
            <EquationChip text={beat.equation} result={beat.result} />
          </motion.div>
        )}

        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="w-full"
        >
          <div
            className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              beat.result
                ? { background: RESULT_BG, borderColor: RESULT_BORDER, color: RESULT_TEXT }
                : { background: CAPTION_BG, borderColor: CAPTION_BORDER, color: CAPTION_TEXT }
            }
          >
            {caption}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
