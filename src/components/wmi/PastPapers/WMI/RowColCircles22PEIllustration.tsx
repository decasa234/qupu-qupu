// IKMC-20-PE-Q22 — "Roo wrote each of the numbers 1, 2, 3, 4 and 5 in one of
// the circles so that the sum of the numbers in the row is equal to the sum of
// the numbers in the column. What number could be written in the circle with the
// question mark?"  Answer: E (1, 3 or 5).
//
// THE FIGURE: five circles arranged in a plus/cross shape.
//   - top arm, left arm, CENTER (with "?"), right arm, bottom arm.
//   - Numbers 1–5 fill the five circles; none is pre-filled in the problem.
//   - The center circle bears a "?" mark.
//   - Row (left → center → right) sum  = Column (top → center → bottom) sum.
//
// STATIC FIGURE shows only the empty problem:
//   five blank circles in a plus layout with "?" at the center.
//
// The co-exported primitive `RowColCircles22PE` accepts `revealCenter?` (number)
// to fill in the center value — used by the explainer on the result beat.
//
// Pure render: no Math.random, no Date.now, SSR-safe & deterministic.

const INK    = '#1F2937' // circle outlines & connecting lines
const BLUE   = '#30598A' // qupu-brand-blue — arm-circle labels (when revealed)
const ORANGE = '#f0853a' // qupu-brand-orange — center circle accent
const SHADE_FILL  = '#FDE3CF' // peach wash inside the center circle
const WHITE  = '#FFFFFF'

// ── layout ──────────────────────────────────────────────────────────────────
const NODE_R = 24        // radius of each circle
const GAP    = 16        // gap between circle edges (the connecting line section)
const STEP   = NODE_R * 2 + GAP // centre-to-centre distance

// SVG viewport: fits a 3-wide × 3-tall plus, centred.
// Centre of the whole cross sits at (CX, CY).
const CX = NODE_R + STEP           // 64  — leave one full step from each side
const CY = NODE_R + STEP           // 64
const VIEW_W = NODE_R * 2 + STEP * 2   // = 2*24 + 2*(24*2+16) = 48 + 128 = 176
const VIEW_H = NODE_R * 2 + STEP * 2

// The five node positions in SVG coordinates (cx, cy):
const TOP    = { x: CX,      y: CY - STEP }
const LEFT   = { x: CX - STEP, y: CY }
const CENTER = { x: CX,      y: CY }
const RIGHT  = { x: CX + STEP, y: CY }
const BOTTOM = { x: CX,      y: CY + STEP }

// The connecting line segments (from edge to edge of adjacent circles):
// We draw lines between circle CENTERS and rely on the circles (drawn later)
// to paint over the line ends so only the gap segment is visible.
const LINES = [
  { x1: TOP.x,    y1: TOP.y,    x2: BOTTOM.x, y2: BOTTOM.y }, // vertical
  { x1: LEFT.x,   y1: LEFT.y,   x2: RIGHT.x,  y2: RIGHT.y  }, // horizontal
]

export interface RowColCircles22PEProps {
  /**
   * When supplied, write this value into the center circle (used by the
   * explainer when demonstrating a specific valid center assignment).
   * When undefined, the center shows "?".
   */
  revealCenter?: number
  /**
   * When supplied, these four values are written into [top, left, right, bottom]
   * arm circles — used by the explainer to show a concrete arrangement.
   */
  revealArms?: [number, number, number, number]
}

/**
 * Bare 5-circle plus primitive for IKMC-20-PE-Q22.
 *
 * Default: all circles blank (center shows "?"), connecting lines, no numbers.
 * With revealCenter + revealArms: shows a concrete valid arrangement.
 */
export function RowColCircles22PE({
  revealCenter,
  revealArms,
}: RowColCircles22PEProps = {}) {
  const centerLabel = revealCenter != null ? String(revealCenter) : '?'
  const [armTop, armLeft, armRight, armBottom] = revealArms ?? [null, null, null, null]

  function ArmCircle({ x, y, value }: { x: number; y: number; value: number | null }) {
    return (
      <g>
        <circle cx={x} cy={y} r={NODE_R} fill={WHITE} stroke={INK} strokeWidth={2.4} />
        {value != null && (
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
            fontWeight={700}
            fill={BLUE}
            className="font-display"
          >
            {value}
          </text>
        )}
      </g>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={Math.min(220, VIEW_W)}
      aria-hidden="true"
    >
      {/* connecting lines drawn first so circles paint over the ends */}
      {LINES.map((l, i) => (
        <line
          key={`line-${i}`}
          x1={l.x1} y1={l.y1}
          x2={l.x2} y2={l.y2}
          stroke={INK}
          strokeWidth={2.2}
          strokeOpacity={0.5}
        />
      ))}

      {/* arm circles */}
      <ArmCircle x={TOP.x}    y={TOP.y}    value={armTop}    />
      <ArmCircle x={LEFT.x}   y={LEFT.y}   value={armLeft}   />
      <ArmCircle x={BOTTOM.x} y={BOTTOM.y} value={armBottom} />
      <ArmCircle x={RIGHT.x}  y={RIGHT.y}  value={armRight}  />

      {/* center circle — peach wash, orange stroke */}
      <circle
        cx={CENTER.x}
        cy={CENTER.y}
        r={NODE_R}
        fill={SHADE_FILL}
        stroke={ORANGE}
        strokeWidth={3}
      />
      <text
        x={CENTER.x}
        y={CENTER.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        fontWeight={800}
        fill={ORANGE}
        className="font-display"
      >
        {centerLabel}
      </text>
    </svg>
  )
}

/** Default export — the bare plus figure inside its card (no answer revealed). */
export default function RowColCircles22PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Lima lingkaran tersusun dalam bentuk plus: satu lingkaran di tengah (bertanda tanya), satu di atas, satu di kiri, satu di kanan, dan satu di bawah. Keduanya dihubungkan oleh garis; angka 1–5 harus diisikan sehingga jumlah baris sama dengan jumlah kolom."
    >
      <RowColCircles22PE />
    </div>
  )
}
