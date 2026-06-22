// IKMC-19-EC-Q2 — "Which picture stands for 12?"
//
// This is an options-only question: the A–E choices ARE the dot-bar figures.
// There is NO separate stem figure (the options would duplicate it).
//
// Notation rule: dot = 1, bar = 5.
// Options (from source images 002–005):
//   A — 1 dot  + 2 bars = 11  (wrong)
//   B — 1 dot  + 3 bars = 16  (wrong)
//   C — 2 dots + 2 bars = 12  ✓ (answer — canonical grouping)
//   D — 2 dots + 2 bars = 12  (trap — different dot arrangement)
//   E — 4 dots + 3 bars = 19  (wrong)
//
// Co-exports DotBar2ECOption (A–E choice renderer).
// Pure SVG, no raster, no random, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const INK    = '#1F2937'   // dot/bar fill + stroke
const BG     = 'none'

// ---------------------------------------------------------------------------
// Dimensions
// ---------------------------------------------------------------------------
const DOT_R   = 8          // dot radius
const BAR_W   = 50         // bar width
const BAR_H   = 9          // bar height
const BAR_GAP = 5          // vertical gap between bars
const DOT_GAP = 8          // horizontal gap between dots
const LAYER_GAP = 12       // vertical gap between dots layer and bars layer

// ---------------------------------------------------------------------------
// Option spec: which layout each choice uses
// ---------------------------------------------------------------------------

/** Single-dot layout variant */
type DotLayout =
  | { kind: 'row'; count: number }         // dots in a horizontal row (centred)
  | { kind: 'pair-stacked'; count: 2 }     // 2 dots stacked vertically (D's trap)

export interface DotBarSpec {
  dots: DotLayout
  bars: number
  /** Aria description */
  aria: { en: string; id: string }
}

// eslint-disable-next-line react-refresh/only-export-components
export const DOT_BAR_SPECS: Record<string, DotBarSpec> = {
  A: {
    dots: { kind: 'row', count: 1 },
    bars: 2,
    aria: {
      en: 'Figure A: one dot above two bars (1 + 10 = 11)',
      id: 'Gambar A: satu titik di atas dua batang (1 + 10 = 11)',
    },
  },
  B: {
    dots: { kind: 'row', count: 1 },
    bars: 3,
    aria: {
      en: 'Figure B: one dot above three bars (1 + 15 = 16)',
      id: 'Gambar B: satu titik di atas tiga batang (1 + 15 = 16)',
    },
  },
  C: {
    dots: { kind: 'row', count: 2 },
    bars: 2,
    aria: {
      en: 'Figure C: two dots above two bars (2 + 10 = 12)',
      id: 'Gambar C: dua titik di atas dua batang (2 + 10 = 12)',
    },
  },
  D: {
    dots: { kind: 'pair-stacked', count: 2 },
    bars: 2,
    aria: {
      en: 'Figure D: two dots beside two bars in a different arrangement (2 + 10 = 12)',
      id: 'Gambar D: dua titik di samping dua batang dengan tata letak berbeda (2 + 10 = 12)',
    },
  },
  E: {
    dots: { kind: 'row', count: 4 },
    bars: 3,
    aria: {
      en: 'Figure E: four dots above three bars (4 + 15 = 19)',
      id: 'Gambar E: empat titik di atas tiga batang (4 + 15 = 19)',
    },
  },
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

/** Compute SVG dimensions for the "row" layout (dots on top, bars below). */
function rowLayoutSize(dotCount: number, barCount: number) {
  const dotsW = dotCount * 2 * DOT_R + (dotCount - 1) * DOT_GAP
  const svgW  = Math.max(dotsW, BAR_W) + 16
  const svgH  =
    2 * DOT_R                          // dot row height
    + LAYER_GAP
    + barCount * BAR_H + (barCount - 1) * BAR_GAP
    + 16
  return { svgW, svgH }
}

/** Compute SVG dimensions for the "pair-stacked" layout (D: dots on the side). */
function stackedLayoutSize(barCount: number) {
  // Bars are centred; dots are stacked vertically to the left of the first bar
  const barsH = barCount * BAR_H + (barCount - 1) * BAR_GAP
  const dotsH = 2 * (2 * DOT_R) + DOT_GAP
  const svgH  = Math.max(barsH, dotsH) + 16
  const svgW  = BAR_W + DOT_GAP + 2 * DOT_R + 16
  return { svgW, svgH }
}

// ---------------------------------------------------------------------------
// DotBarFigure — renders one dot-bar option as an SVG
// ---------------------------------------------------------------------------

interface DotBarFigureProps {
  spec: DotBarSpec
  /** Width of the SVG output. Height scales automatically. */
  width?: number
}

export function DotBarFigure({ spec, width = 80 }: DotBarFigureProps) {
  const { dots, bars: barCount } = spec

  if (dots.kind === 'pair-stacked') {
    // ── Layout D: two dots stacked vertically to the left, bars to the right ──
    const { svgW, svgH } = stackedLayoutSize(barCount)
    const svgDisplayH = Math.round(svgH * (width / svgW))

    // Dots: stacked vertically, left-aligned
    const dotX = 8 + DOT_R
    const barsH = barCount * BAR_H + (barCount - 1) * BAR_GAP
    const dotsH = 2 * (2 * DOT_R) + DOT_GAP
    const topPad = 8 + (Math.max(barsH, dotsH) - dotsH) / 2
    const dot1Y = topPad + DOT_R
    const dot2Y = dot1Y + 2 * DOT_R + DOT_GAP

    // Bars: to the right of dots
    const barsX = dotX + DOT_R + DOT_GAP
    const barsTopY = 8 + (Math.max(barsH, dotsH) - barsH) / 2

    return (
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={width}
        height={svgDisplayH}
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        <rect width={svgW} height={svgH} fill={BG} />
        {/* Two stacked dots */}
        <circle cx={dotX} cy={dot1Y} r={DOT_R} fill={INK} />
        <circle cx={dotX} cy={dot2Y} r={DOT_R} fill={INK} />
        {/* Bars */}
        {Array.from({ length: barCount }).map((_, i) => (
          <rect
            key={i}
            x={barsX}
            y={barsTopY + i * (BAR_H + BAR_GAP)}
            width={BAR_W}
            height={BAR_H}
            fill={INK}
            rx={1}
          />
        ))}
      </svg>
    )
  }

  // ── Standard "row" layout: dots centred on top, bars centred below ──────────
  const { svgW, svgH } = rowLayoutSize(dots.count, barCount)
  const svgDisplayH = Math.round(svgH * (width / svgW))

  const cx = svgW / 2  // horizontal centre

  // Dots row: centred
  const dotsRowW = dots.count * 2 * DOT_R + (dots.count - 1) * DOT_GAP
  const dotStartX = cx - dotsRowW / 2 + DOT_R
  const dotY = 8 + DOT_R

  // Bars: centred
  const barsTopY = dotY + DOT_R + LAYER_GAP
  const barsX = cx - BAR_W / 2

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={width}
      height={svgDisplayH}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect width={svgW} height={svgH} fill={BG} />
      {/* Dots row */}
      {Array.from({ length: dots.count }).map((_, i) => (
        <circle
          key={i}
          cx={dotStartX + i * (2 * DOT_R + DOT_GAP)}
          cy={dotY}
          r={DOT_R}
          fill={INK}
        />
      ))}
      {/* Bars */}
      {Array.from({ length: barCount }).map((_, i) => (
        <rect
          key={i}
          x={barsX}
          y={barsTopY + i * (BAR_H + BAR_GAP)}
          width={BAR_W}
          height={BAR_H}
          fill={INK}
          rx={1}
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// DotBar2ECOption — renders ONE A/B/C/D/E choice as a dot-bar figure.
// Registered in CHOICE_RENDERERS for IKMC-19-EC-Q2.
// ---------------------------------------------------------------------------

export function DotBar2ECOption({ choice }: { choice: WmiChoice }) {
  const spec = DOT_BAR_SPECS[choice.label]
  if (!spec) return <span>{choice.text}</span>

  const lang = 'en' as 'en' | 'id'
  return (
    <span
      role="img"
      aria-label={spec.aria[lang]}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <DotBarFigure spec={spec} width={72} />
    </span>
  )
}
