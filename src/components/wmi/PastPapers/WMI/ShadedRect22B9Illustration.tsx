/**
 * SEAMO-22-B-Q9 — Rectangle ABCD with midpoints E, F, G and point H on AD.
 *
 * PROBLEM ONLY: shows the static figure from paper-b/2022.imgs/004.jpg.
 *   - Rectangle ABCD (A top-left, D top-right, C bottom-right, B bottom-left)
 *   - H: a point along the top edge AD (placed at ~70% from A)
 *   - E: midpoint of AB (left side)
 *   - F: midpoint of BC (bottom edge)
 *   - G: midpoint of CD (right side)
 *   - Shaded regions: triangle A-H-E (upper-left) and triangle H-D-G (upper-right)
 *   - Unshaded interior: pentagon E-B-F-C-G + connector to H
 *
 * Does NOT reveal the answer (20 cm²). Pure SVG — SSR-safe, no hooks.
 *
 * Key quantities (from seed):
 *   area(ABCD) = 40 cm²
 *   shaded area = 20 cm²   → answer B
 */

// ── Layout constants (re-exported for the explainer) ─────────────────────────

export const SVG_W = 280
export const SVG_H = 200

/** Padding inside SVG around the rectangle */
export const PAD = 24

/** Rectangle corners in SVG coordinates */
export const A = { x: PAD,          y: PAD }           // top-left
export const D = { x: SVG_W - PAD,  y: PAD }           // top-right
export const C = { x: SVG_W - PAD,  y: SVG_H - PAD }  // bottom-right
export const B = { x: PAD,          y: SVG_H - PAD }   // bottom-left

/** H: point along AD (top edge), placed at 70% from A to D to match the scan */
export const H = { x: A.x + (D.x - A.x) * 0.70, y: PAD }

/** E: midpoint of AB (left side) */
export const E = { x: PAD, y: (A.y + B.y) / 2 }

/** F: midpoint of BC (bottom edge) */
export const F = { x: (B.x + C.x) / 2, y: SVG_H - PAD }

/** G: midpoint of CD (right side) */
export const G = { x: SVG_W - PAD, y: (C.y + D.y) / 2 }

/** Shade fill — medium grey matching the scan */
export const SHADE_FILL = '#B0B0B0'
export const SHADE_STROKE = '#374151'
export const RECT_STROKE = '#1F2937'

// ── Helper ────────────────────────────────────────────────────────────────────

function pt(p: { x: number; y: number }) {
  return `${p.x},${p.y}`
}

// ── Illustration ─────────────────────────────────────────────────────────────

export default function ShadedRect22B9Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Persegi panjang ABCD. H titik di sisi AD. E, F, G titik tengah AB, BC, CD. ' +
        'Daerah yang diarsir: segitiga AHE dan segitiga HDG. Luas ABCD = 40 cm².'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(300, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* White background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

        {/* Outer rectangle outline */}
        <rect
          x={PAD}
          y={PAD}
          width={SVG_W - 2 * PAD}
          height={SVG_H - 2 * PAD}
          fill="white"
          stroke={RECT_STROKE}
          strokeWidth={1.8}
        />

        {/* Shaded region 1: triangle A–H–E (upper-left) */}
        <polygon
          points={`${pt(A)} ${pt(H)} ${pt(E)}`}
          fill={SHADE_FILL}
          stroke={SHADE_STROKE}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />

        {/* Shaded region 2: triangle H–D–G (upper-right) */}
        <polygon
          points={`${pt(H)} ${pt(D)} ${pt(G)}`}
          fill={SHADE_FILL}
          stroke={SHADE_STROKE}
          strokeWidth={1.2}
          strokeLinejoin="round"
        />

        {/* Interior dividing lines (E→H, H→F, H→G visible in scan) */}
        <line x1={E.x} y1={E.y} x2={H.x} y2={H.y} stroke={RECT_STROKE} strokeWidth={1.4} />
        <line x1={H.x} y1={H.y} x2={F.x} y2={F.y} stroke={RECT_STROKE} strokeWidth={1.4} />
        <line x1={H.x} y1={H.y} x2={G.x} y2={G.y} stroke={RECT_STROKE} strokeWidth={1.4} />
        <line x1={E.x} y1={E.y} x2={F.x} y2={F.y} stroke={RECT_STROKE} strokeWidth={1.2} />
        <line x1={F.x} y1={F.y} x2={G.x} y2={G.y} stroke={RECT_STROKE} strokeWidth={1.2} />

        {/* Corner & midpoint labels */}
        {(
          [
            { p: A, label: 'A', anchor: 'end',    base: 'auto',    dx: -5, dy: -5 },
            { p: D, label: 'D', anchor: 'start',  base: 'auto',    dx:  5, dy: -5 },
            { p: C, label: 'C', anchor: 'start',  base: 'hanging', dx:  5, dy:  5 },
            { p: B, label: 'B', anchor: 'end',    base: 'hanging', dx: -5, dy:  5 },
            { p: H, label: 'H', anchor: 'middle', base: 'auto',    dx:  0, dy: -6 },
            { p: E, label: 'E', anchor: 'end',    base: 'central', dx: -5, dy:  0 },
            { p: F, label: 'F', anchor: 'middle', base: 'hanging', dx:  0, dy:  6 },
            { p: G, label: 'G', anchor: 'start',  base: 'central', dx:  5, dy:  0 },
          ] as Array<{
            p: { x: number; y: number }
            label: string
            anchor: string
            base: string
            dx: number
            dy: number
          }>
        ).map(({ p, label, anchor, base, dx, dy }) => (
          <text
            key={label}
            x={p.x + dx}
            y={p.y + dy}
            textAnchor={anchor}
            dominantBaseline={base}
            fontSize={13}
            fontWeight={700}
            fill="#1F2937"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
}
