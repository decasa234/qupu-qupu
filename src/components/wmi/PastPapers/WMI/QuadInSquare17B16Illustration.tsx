/**
 * SEAMO-17-B-Q16 — "The figure shows a square of sides 10 cm. The area of
 * rectangle EFGH is 8 cm². Find the area of the quadrilateral ABCD in cm²."
 *
 * Answer: E (None of the above).
 *
 * FIGURE DESCRIPTION (from 2017.imgs/022.jpg):
 *   • Outer square with corners at top, right, bottom, left (axis-aligned, labels
 *     appear at outer corners — implicitly the outer frame, not a labelled vertex
 *     square; but from the image, the labels A–D sit on the MID-POINTS of the outer
 *     square sides: A = left midpoint, B = bottom midpoint, C = right midpoint,
 *     D = top midpoint).
 *   • ABCD is therefore a square rotated 45° (a rhombus) inscribed in the 10×10 outer
 *     square, touching each side at its midpoint.
 *   • Inside ABCD, a shaded rectangle EFGH is drawn roughly centred in the rhombus.
 *     H = upper-left, G = upper-right, F = lower-right, E = lower-left (reading
 *     labels from the figure).
 *   • The four outer square corners are connected to the EFGH rectangle by straight
 *     lines, creating the triangular sub-regions visible in the scan.
 *
 * Pure SVG — no hooks, no framer-motion, SSR-safe & deterministic.
 * Import-first: no suitable primitive covers this figure type — custom geometry.
 */

// ── colour tokens ──────────────────────────────────────────────────────────────
const C = {
  OUTER_FILL:   '#FFFFFF',
  OUTER_STROKE: '#374151',   // dark grey outline — outer frame
  RHOMBUS_FILL: '#FFFFFF',
  RHOMBUS_STROKE: '#374151',
  RECT_FILL:    '#D1D5DB',   // grey shading for EFGH (matching source scan)
  RECT_STROKE:  '#374151',
  LINE:         '#374151',   // construction lines from outer corners to inner rect
  LABEL:        '#111827',
  BG:           '#FFFFFF',
} as const

// ── layout constants ───────────────────────────────────────────────────────────
// Outer square side = S px in SVG. Chosen so the figure fits comfortably.
const S = 180
const PAD = 28    // padding around the outer square for labels

// Outer square corners (axis-aligned, starting top-left, clockwise).
const OX = PAD
const OY = PAD
const OW = S
const OH = S

// Mid-points of the outer square's sides — these are the ABCD rhombus vertices.
const A = { x: OX,           y: OY + OH / 2 }  // left mid
const B = { x: OX + OW / 2,  y: OY + OH       }  // bottom mid
const C2 = { x: OX + OW,     y: OY + OH / 2 }  // right mid
const D = { x: OX + OW / 2,  y: OY           }  // top mid

// Outer square corner points (unlabelled in problem).
const TL = { x: OX,      y: OY       }  // top-left
const TR = { x: OX + OW, y: OY       }  // top-right
const BR = { x: OX + OW, y: OY + OH  }  // bottom-right
const BL = { x: OX,      y: OY + OH  }  // bottom-left

// Centre of the figure.
const CX = OX + OW / 2
const CY = OY + OH / 2

// Rectangle EFGH: positioned at the geometric centre of the rhombus.
// From the figure the rect is roughly 1/3 of the rhombus diagonal in each dim.
// Rhombus diagonal half-lengths: diag1 = S/2 (horizontal), diag2 = S/2 (vertical).
// We choose EFGH width and height so it looks proportional to the scan.
// The rect appears to span about 35% of S in width and 25% of S in height.
const EFW = S * 0.35   // ~63 px width
const EFH = S * 0.22   // ~40 px height
const EX  = CX - EFW / 2  // left edge of EFGH
const EY  = CY - EFH / 2  // top edge of EFGH

// EFGH corners: E = bottom-left, F = bottom-right, G = upper-right, H = upper-left
// (matching label positions in figure scan)
const H_pt = { x: EX,        y: EY        }  // upper-left
const G_pt = { x: EX + EFW,  y: EY        }  // upper-right
const F_pt = { x: EX + EFW,  y: EY + EFH  }  // lower-right
const E_pt = { x: EX,        y: EY + EFH  }  // lower-left

// ── helper to turn an object array into an SVG points string ──────────────────
function pts(arr: Array<{ x: number; y: number }>): string {
  return arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
}

// ── viewBox dimensions ─────────────────────────────────────────────────────────
const VBW = S + PAD * 2
const VBH = S + PAD * 2

// ── label offset helper ────────────────────────────────────────────────────────
function labelPos(
  pt: { x: number; y: number },
  dx: number,
  dy: number,
): { x: number; y: number } {
  return { x: pt.x + dx, y: pt.y + dy }
}

// ── public primitive for the explainer ────────────────────────────────────────

export interface QuadInSquare17B16Props {
  /** Highlight the rhombus ABCD area (animator step). */
  highlightABCD?: boolean
  /** Highlight the rectangle EFGH (animator step). */
  highlightEFGH?: boolean
}

/**
 * QuadInSquare17B16 — re-usable primitive SVG (wrapped in <svg>).
 * The explainer can import this and compose it with animation props.
 */
export function QuadInSquare17B16({
  highlightABCD = false,
  highlightEFGH = false,
}: QuadInSquare17B16Props = {}) {
  const rhombusFill = highlightABCD ? '#FEF3C7' : C.RHOMBUS_FILL
  const rectFill    = highlightEFGH ? '#FDE68A' : C.RECT_FILL

  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      width={Math.min(260, VBW)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      {/* white background */}
      <rect x={0} y={0} width={VBW} height={VBH} fill={C.BG} />

      {/* ── Outer square ── */}
      <rect
        x={OX}
        y={OY}
        width={OW}
        height={OH}
        fill={C.OUTER_FILL}
        stroke={C.OUTER_STROKE}
        strokeWidth={1.8}
      />

      {/* ── Rhombus ABCD (tilted square inscribed in outer square) ── */}
      <polygon
        points={pts([A, B, C2, D])}
        fill={rhombusFill}
        stroke={C.RHOMBUS_STROKE}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* ── Construction lines from outer corners to EFGH corners ──
           The figure shows lines connecting each outer corner to two of the EFGH corners,
           creating the triangular mesh inside the rhombus.
           TL → H, TL → G  (top-left corner)
           TR → G, TR → F  (top-right corner)
           BR → F, BR → E  (bottom-right corner)
           BL → E, BL → H  (bottom-left corner)
      ── */}
      {[
        [TL, H_pt], [TL, G_pt],
        [TR, G_pt], [TR, F_pt],
        [BR, F_pt], [BR, E_pt],
        [BL, E_pt], [BL, H_pt],
      ].map(([from, to], i) => (
        <line
          key={i}
          x1={(from as {x:number;y:number}).x}
          y1={(from as {x:number;y:number}).y}
          x2={(to as {x:number;y:number}).x}
          y2={(to as {x:number;y:number}).y}
          stroke={C.LINE}
          strokeWidth={1.2}
        />
      ))}

      {/* ── Shaded rectangle EFGH ── */}
      <rect
        x={EX}
        y={EY}
        width={EFW}
        height={EFH}
        fill={rectFill}
        stroke={C.RECT_STROKE}
        strokeWidth={1.6}
      />

      {/* ── Vertex labels ── */}
      {/* Outer square side midpoints: A (left), B (bottom), C (right), D (top) */}
      {(
        [
          { pt: A,   label: 'A', ...labelPos(A, -14, 4)  },
          { pt: B,   label: 'B', ...labelPos(B, 0,  14)  },
          { pt: C2,  label: 'C', ...labelPos(C2, 10, 4)  },
          { pt: D,   label: 'D', ...labelPos(D, 0, -10)  },
        ] as Array<{ pt: {x:number;y:number}; label: string; x: number; y: number }>
      ).map(({ label, x, y }) => (
        <text
          key={label}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={13}
          fontWeight={700}
          fill={C.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {label}
        </text>
      ))}

      {/* Rectangle EFGH labels */}
      {(
        [
          { label: 'H', x: H_pt.x - 10, y: H_pt.y - 2  },
          { label: 'G', x: G_pt.x + 10, y: G_pt.y - 2  },
          { label: 'F', x: F_pt.x + 10, y: F_pt.y + 2  },
          { label: 'E', x: E_pt.x - 10, y: E_pt.y + 2  },
        ]
      ).map(({ label, x, y }) => (
        <text
          key={label}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11}
          fontWeight={600}
          fill={C.LABEL}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}

// ── Default export: illustration wrapper ──────────────────────────────────────

/**
 * QuadInSquare17B16Illustration
 *
 * Stem figure for SEAMO-17-B-Q16.
 * Shows a 10 cm outer square with inscribed rhombus ABCD and shaded inner
 * rectangle EFGH (area 8 cm²). Does NOT reveal the answer (None of the above).
 */
export default function QuadInSquare17B16Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Persegi luar dengan sisi 10 cm. Di dalamnya terdapat segiempat ABCD ' +
        'yang berbentuk belah ketupat dengan titik sudut di tengah setiap sisi persegi luar. ' +
        'Di dalam ABCD terdapat persegi panjang EFGH yang diarsir dengan luas 8 cm². ' +
        'Terdapat garis dari setiap sudut persegi luar menuju sudut-sudut EFGH.'
      }
    >
      <QuadInSquare17B16 />
    </div>
  )
}
