// IKMC-22-PE-Q1 — "Which box contains the most triangles?"
//
// The five A–E options ARE the figures (boxes with cyan shapes). There is NO
// separate stem figure — build ONLY the Option renderer (no default export
// illustration; the choices duplicate the stem).
//
// Shape counts, transcribed from the scanned option images (2022.imgs/001-005.jpg):
//   A: 1 triangle, 3 circles, 2 squares   (answer: 1 triangle)
//   B: 4 triangles, 1 circle, 1 square    (answer: MOST → correct)
//   C: 2 triangles, 2 circles, 2 squares  (answer: 2 triangles)
//   D: 3 triangles, 1 circle, 1 square    (answer: 3 triangles)
//   E: 1 triangle, 1 circle, 2 squares    (answer: 1 triangle)
//
// Pure SVG, SSR-safe, no random/date/state. Box aspect from scans ≈ 1.45:1 (w:h).
// Cyan fill from the scan: #30B8DA (mid), #219EBC (dark), #E0F7FA (light accent).

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Shape primitives
// ---------------------------------------------------------------------------

const CYAN_FILL = '#30B8DA'
const BOX_STROKE = '#1F2937'
const BOX_BG = '#FFFFFF'

type ShapeKind = 'triangle' | 'circle' | 'square'

interface Shape {
  kind: ShapeKind
  /** centre x as fraction of box width */
  fx: number
  /** centre y as fraction of box height */
  fy: number
  /** size as fraction of box height */
  fs: number
}

/** Render one shape glyph centred on (cx, cy) with half-size s (in user units). */
export function ShapeGlyph({
  kind,
  cx,
  cy,
  s,
}: {
  kind: ShapeKind
  cx: number
  cy: number
  s: number
}) {
  if (kind === 'circle') {
    return <circle cx={cx} cy={cy} r={s} fill={CYAN_FILL} />
  }
  if (kind === 'square') {
    const side = s * 1.8
    return (
      <rect
        x={cx - side / 2}
        y={cy - side / 2}
        width={side}
        height={side}
        fill={CYAN_FILL}
        rx={1}
      />
    )
  }
  // triangle (equilateral pointing up)
  const h = s * 1.8
  const hw = s * 1.05
  const tip = cy - h * 0.7
  const base = cy + h * 0.3
  const pts = `${cx},${tip} ${cx - hw},${base} ${cx + hw},${base}`
  return <polygon points={pts} fill={CYAN_FILL} />
}

// ---------------------------------------------------------------------------
// Layout definitions — positions faithfully match the scanned images
// ---------------------------------------------------------------------------

type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'

// Positions are (fx, fy) fractions of box interior (after border padding).
// Sizes are fs = glyph radius as fraction of box height.
//
// Reading the scans:
//   A (001.jpg): circle TL, circle ML, triangle TC-right, circle BL, square MR-top, square MR-bot
//   B (002.jpg): circle ML, triangle TC, triangle TC-right, triangle BM-left, triangle BM-right, square MR
//   C (003.jpg): square TL, circle MC, square MR, circle BM-left, triangle BM-right, triangle BR
//   D (004.jpg): circle ML, triangle TC-left, triangle TC-right, triangle BM, square MR
//   E (005.jpg): triangle TC, circle ML, square BM-left, square MR

export const OPTION_SHAPES: Record<OptionLabel, Shape[]> = {
  A: [
    { kind: 'circle',   fx: 0.18, fy: 0.22, fs: 0.18 },
    { kind: 'circle',   fx: 0.18, fy: 0.57, fs: 0.18 },
    { kind: 'triangle', fx: 0.42, fy: 0.24, fs: 0.13 },
    { kind: 'circle',   fx: 0.22, fy: 0.84, fs: 0.17 },
    { kind: 'square',   fx: 0.72, fy: 0.42, fs: 0.14 },
    { kind: 'square',   fx: 0.72, fy: 0.75, fs: 0.14 },
  ],
  B: [
    { kind: 'circle',   fx: 0.18, fy: 0.52, fs: 0.18 },
    { kind: 'triangle', fx: 0.44, fy: 0.22, fs: 0.14 },
    { kind: 'triangle', fx: 0.62, fy: 0.22, fs: 0.14 },
    { kind: 'triangle', fx: 0.44, fy: 0.58, fs: 0.14 },
    { kind: 'triangle', fx: 0.62, fy: 0.58, fs: 0.14 },
    { kind: 'square',   fx: 0.84, fy: 0.52, fs: 0.14 },
  ],
  C: [
    { kind: 'square',   fx: 0.17, fy: 0.22, fs: 0.15 },
    { kind: 'circle',   fx: 0.46, fy: 0.30, fs: 0.17 },
    { kind: 'square',   fx: 0.74, fy: 0.22, fs: 0.15 },
    { kind: 'circle',   fx: 0.33, fy: 0.72, fs: 0.16 },
    { kind: 'triangle', fx: 0.58, fy: 0.74, fs: 0.13 },
    { kind: 'triangle', fx: 0.75, fy: 0.74, fs: 0.13 },
  ],
  D: [
    { kind: 'circle',   fx: 0.18, fy: 0.55, fs: 0.18 },
    { kind: 'triangle', fx: 0.47, fy: 0.24, fs: 0.14 },
    { kind: 'triangle', fx: 0.65, fy: 0.24, fs: 0.14 },
    { kind: 'triangle', fx: 0.47, fy: 0.64, fs: 0.14 },
    { kind: 'square',   fx: 0.82, fy: 0.55, fs: 0.14 },
  ],
  E: [
    { kind: 'triangle', fx: 0.43, fy: 0.22, fs: 0.14 },
    { kind: 'circle',   fx: 0.20, fy: 0.62, fs: 0.18 },
    { kind: 'square',   fx: 0.50, fy: 0.74, fs: 0.14 },
    { kind: 'square',   fx: 0.76, fy: 0.55, fs: 0.15 },
  ],
}

/** Count of triangles per option (source of truth for explainer logic). */
export const TRIANGLE_COUNTS: Record<OptionLabel, number> = {
  A: 1,
  B: 4,
  C: 2,
  D: 3,
  E: 1,
}

export const OPTION_LABELS: OptionLabel[] = ['A', 'B', 'C', 'D', 'E']

// ---------------------------------------------------------------------------
// TriangleBoxes1PEOption — choice renderer for CHOICE_RENDERERS['IKMC-22-PE-Q1']
// ---------------------------------------------------------------------------

/**
 * Renders a single choice box (A–E) as an SVG box containing cyan shapes,
 * faithfully matching the scanned option images.
 */
export function TriangleBoxes1PEOption({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '').trim().toUpperCase() as OptionLabel
  const shapes = OPTION_SHAPES[label]
  if (!shapes) return <span>{choice?.text}</span>

  // Box geometry — matches scan aspect ratio ≈ 1.45 w:h
  const BW = 145  // box width in SVG units
  const BH = 100  // box height in SVG units
  const PAD = 4   // border padding
  const IW = BW - PAD * 2  // inner width
  const IH = BH - PAD * 2  // inner height

  const ariaLabel = `Pilihan ${label}: kotak berisi ${TRIANGLE_COUNTS[label]} segitiga`

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg
        viewBox={`0 0 ${BW} ${BH}`}
        width={Math.min(120, BW)}
        style={{ display: 'block' }}
      >
        {/* outer border */}
        <rect
          x={0}
          y={0}
          width={BW}
          height={BH}
          fill={BOX_BG}
          stroke={BOX_STROKE}
          strokeWidth={1.5}
          rx={2}
        />
        {/* shapes */}
        {shapes.map((sh, i) => (
          <ShapeGlyph
            key={i}
            kind={sh.kind}
            cx={PAD + sh.fx * IW}
            cy={PAD + sh.fy * IH}
            s={sh.fs * IH}
          />
        ))}
      </svg>
    </span>
  )
}

// No default export — this file's purpose is the Option renderer.
// (The choices ARE the only figures; a stem illustration would duplicate them.)
