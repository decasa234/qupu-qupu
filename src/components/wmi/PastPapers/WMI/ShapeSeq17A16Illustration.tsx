// SEAMO-17-A-Q16 — "How would the 4th figure look like?"
//
// Pattern of three nested shapes (three layers each), cycling through:
//   outer:  diamond → circle → square → circle  (4th)
//   middle: square  → diamond → circle → diamond (4th)
//   inner:  circle  → square  → diamond → circle  (4th)  ← wait: seed says inner=diamond
//
// Seed (breakdown.note_en): "Fig 4 outer = circle, inner = diamond"
// OCR answer images confirm: option C (020.jpg) = circle outside diamond (2 visible layers).
//
// Colours match the original paper:
//   diamond = yellow #F5C842
//   circle  = blue   #5BAED4
//   square  = orange #D9541E
//
// No primitives cover nested-shape sequences — built from scratch with pure SVG.
// SSR-safe: no hooks, no framer-motion.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Colour palette
// ---------------------------------------------------------------------------
const C = {
  diamond: '#F5C842',
  circle:  '#5BAED4',
  square:  '#D9541E',
  stroke:  '#2D1A00',
}

// ---------------------------------------------------------------------------
// Atomic shape renderers (all in a 100×100 coordinate space)
// ---------------------------------------------------------------------------

/** Rotated-square (diamond) with given half-width, centred at 50,50. */
function Diamond({ hw, fill }: { hw: number; fill: string }) {
  const cx = 50
  const cy = 50
  const pts = `${cx},${cy - hw} ${cx + hw},${cy} ${cx},${cy + hw} ${cx - hw},${cy}`
  return (
    <polygon
      points={pts}
      fill={fill}
      stroke={C.stroke}
      strokeWidth={2}
      strokeLinejoin="round"
    />
  )
}

/** Axis-aligned square with half-width hw, centred at 50,50. */
function Square({ hw, fill }: { hw: number; fill: string }) {
  return (
    <rect
      x={50 - hw}
      y={50 - hw}
      width={hw * 2}
      height={hw * 2}
      fill={fill}
      stroke={C.stroke}
      strokeWidth={2}
    />
  )
}

/** Circle with radius r, centred at 50,50. */
function Circle({ r, fill }: { r: number; fill: string }) {
  return (
    <circle
      cx={50}
      cy={50}
      r={r}
      fill={fill}
      stroke={C.stroke}
      strokeWidth={2}
    />
  )
}

// ---------------------------------------------------------------------------
// Shape-figure composer
// The three shape names in painter order (outermost → innermost).
// Each shape is rendered at a progressively smaller scale.
// ---------------------------------------------------------------------------

type ShapeName = 'diamond' | 'circle' | 'square'

interface NestedFigureProps {
  /** Shapes listed outermost-first. 2 or 3 layers supported. */
  layers: ShapeName[]
  /** SVG size in px. Default 100. */
  size?: number
  ariaLabel?: string
}

/** Half-widths / radii for each layer when there are n layers. */
const SCALES: Record<number, number[]> = {
  2: [44, 26],
  3: [44, 32, 20],
}

function NestedFigure({ layers, size = 100, ariaLabel }: NestedFigureProps) {
  const n = layers.length
  const scales = SCALES[n] ?? SCALES[3]

  function renderShape(name: ShapeName, hw: number, key: number) {
    switch (name) {
      case 'diamond': return <Diamond key={key} hw={hw} fill={C.diamond} />
      case 'circle':  return <Circle  key={key} r={hw}   fill={C.circle} />
      case 'square':  return <Square  key={key} hw={hw}  fill={C.square} />
    }
  }

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      aria-hidden={ariaLabel ? undefined : true}
      style={{ display: 'block' }}
    >
      {/* Render outermost first (painter order: outer → inner) */}
      {layers.map((name, i) => renderShape(name, scales[i], i))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Stem illustration — the three given figures in sequence
// ---------------------------------------------------------------------------

const STEM_FIGURES: { label: string; layers: ShapeName[] }[] = [
  { label: '1st', layers: ['diamond', 'square', 'circle'] },
  { label: '2nd', layers: ['circle',  'diamond', 'square'] },
  { label: '3rd', layers: ['square',  'circle',  'diamond'] },
]

/**
 * ShapeSeq17A16Illustration — shows the three given nested-shape figures
 * (1st, 2nd, 3rd) with a "4th = ?" placeholder.
 */
export default function ShapeSeq17A16Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Three nested-shape figures: ' +
        '1st is a diamond outside a square outside a circle; ' +
        '2nd is a circle outside a diamond outside a square; ' +
        '3rd is a square outside a circle outside a diamond. ' +
        'How does the 4th figure look?'
      }
    >
      <div className="flex flex-wrap items-center justify-center gap-4" aria-hidden="true">
        {STEM_FIGURES.map(({ label, layers }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <NestedFigure layers={layers} size={80} />
            <span className="text-xs font-bold text-gray-700">{label}</span>
          </div>
        ))}
        {/* Placeholder for the 4th figure */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex items-center justify-center rounded"
            style={{ width: 80, height: 80, border: '2px dashed #9CA3AF', color: '#9CA3AF', fontSize: 24, fontWeight: 700 }}
          >
            ?
          </div>
          <span className="text-xs font-bold text-gray-700">4th</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Option renderers — one per choice label A–E
// ---------------------------------------------------------------------------

/**
 * Option definitions for SEAMO-17-A-Q16.
 *
 * From OCR + seed analysis:
 *   A (018.jpg) — square outside diamond only (2 layers: square, diamond)
 *   B (019.jpg) — circle outside diamond outside square (3 layers: same as Fig 2)
 *   C (020.jpg) — circle outside diamond (2 layers) ← CORRECT 4th figure
 *   D (021.jpg) — diamond outside square outside circle (3 layers, like a variant)
 *   E           — None of the above
 */
const OPTION_LAYERS: Record<string, ShapeName[] | null> = {
  A: ['square', 'diamond'],
  B: ['circle', 'diamond', 'square'],
  C: ['circle', 'diamond'],
  D: ['diamond', 'square', 'circle'],
  E: null,
}

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Option A: a square outside a diamond (two layers).',
    id: 'Pilihan A: persegi di luar belah ketupat (dua lapis).',
  },
  B: {
    en: 'Option B: a circle outside a diamond outside a square (three layers).',
    id: 'Pilihan B: lingkaran di luar belah ketupat di luar persegi (tiga lapis).',
  },
  C: {
    en: 'Option C: a circle outside a diamond (two layers) — the 4th figure in the pattern.',
    id: 'Pilihan C: lingkaran di luar belah ketupat (dua lapis) — gambar ke-4 dalam pola.',
  },
  D: {
    en: 'Option D: a diamond outside a square outside a circle (three layers).',
    id: 'Pilihan D: belah ketupat di luar persegi di luar lingkaran (tiga lapis).',
  },
  E: {
    en: 'Option E: none of the above.',
    id: 'Pilihan E: tidak ada jawaban di atas.',
  },
}

/**
 * ShapeSeq17A16Option — renders one A–E choice for SEAMO-17-A-Q16
 * as a nested-shape SVG figure.
 */
export function ShapeSeq17A16Option({ choice }: { choice: WmiChoice }) {
  const k = (choice.label ?? '').trim().toUpperCase()
  const layers = OPTION_LAYERS[k]
  const aria = OPTION_ARIA[k]

  if (layers === null || !layers) {
    // E = "None of the above" — plain text
    return <span>{choice.text}</span>
  }

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <NestedFigure layers={layers} size={72} />
    </span>
  )
}
