// SEAMOX-23-B-Q14 — Trapezoid with parallel sides and intersecting diagonals.
//
// AD ∥ BC, BC = 1.5 AD. The diagonals AC and BD meet at E.
// Given: Area(△ADE) = 16 cm², Area(△BEC) = 18 cm² (unshaded).
// The SHADED regions are △ABE (left) and △CDE (right).
//
// The STEM shows only the problem — the trapezoid, both diagonals, all vertex
// labels (A–E), the given areas (16, 18), and the shaded regions. The answer
// (36 cm²) is NOT shown here.
//
// Right angle at B (AB ⊥ BC). Parallel tick marks on AD and BC.
//
// SSR-safe: pure render, no hooks, no framer-motion.

type Pt = [number, number]

// ── Trapezoid vertices ──────────────────────────────────────────────────────────
// AD (top)  = 100 units; BC (bottom) = 150 units = 1.5 × AD ✓
// AB (left vertical)    = 120 units; right angle at B.
// ViewBox: 0 0 240 180
export const A: Pt = [40, 28]
export const D: Pt = [140, 28]
export const B: Pt = [40, 148]
export const C: Pt = [190, 148]

// Diagonals AC and BD intersect at E where AE/CE = AD/BC = 2/3 → t = 0.4 along AC.
// AC at t=0.4: (40+150×0.4, 28+120×0.4) = (100, 76)
export const E: Pt = [100, 76]

// Utility helpers
const pts = (verts: Pt[]) => verts.map(([x, y]) => `${x},${y}`).join(' ')
const ctr = ([ax, ay]: Pt, [bx, by]: Pt, [cx, cy]: Pt): Pt => [
  (ax + bx + cx) / 3,
  (ay + by + cy) / 3,
]

// ── Shared primitive ────────────────────────────────────────────────────────────

export interface TrapDiagsX23B14FigureProps {
  /** Which triangle regions to shade amber. Default = problem shading (ABE + CDE). */
  shaded?: Array<'ADE' | 'BEC' | 'ABE' | 'CDE'>
  /** Area label for each triangle; undefined = hide that label. */
  areaLabels?: Partial<Record<'ADE' | 'BEC' | 'ABE' | 'CDE', string>>
  /** Stroke colour for the diagonals. */
  diagStroke?: string
}

const AMBER_FILL = '#FDE68A'  // amber-200 — shaded region fill
const DARK_INK   = '#1C1917'  // near-black for outlines + vertex labels
const BLUE_DIAG  = '#3B6EA5'  // blue-ish for diagonals

const TRIANGLES: Array<{ name: 'ADE' | 'BEC' | 'ABE' | 'CDE'; verts: [Pt, Pt, Pt] }> = [
  { name: 'ADE', verts: [A, D, E] },
  { name: 'BEC', verts: [B, E, C] },
  { name: 'ABE', verts: [A, B, E] },
  { name: 'CDE', verts: [C, D, E] },
]

/**
 * TrapDiagsX23B14Figure — shared SVG primitive (emits `<g>`, not a root `<svg>`).
 * Wrap in: `<svg viewBox="0 0 240 180" ...>`.
 */
export function TrapDiagsX23B14Figure({
  shaded = ['ABE', 'CDE'],
  areaLabels = { ADE: '16', BEC: '18' },
  diagStroke = BLUE_DIAG,
}: TrapDiagsX23B14FigureProps = {}) {
  const isShaded = (n: 'ADE' | 'BEC' | 'ABE' | 'CDE') => shaded.includes(n)

  return (
    <g>
      {/* ── Shaded fills (behind outlines) ───────────────────────────────────── */}
      {TRIANGLES.map(({ name, verts }) =>
        isShaded(name) ? (
          <polygon
            key={`shade-${name}`}
            points={pts(verts)}
            fill={AMBER_FILL}
            stroke="none"
          />
        ) : null,
      )}

      {/* ── Trapezoid outline ─────────────────────────────────────────────────── */}
      <polygon
        points={pts([A, D, C, B])}
        fill="none"
        stroke={DARK_INK}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      {/* ── Diagonals AC and BD ────────────────────────────────────────────────── */}
      <line x1={A[0]} y1={A[1]} x2={C[0]} y2={C[1]} stroke={diagStroke} strokeWidth={1.5} />
      <line x1={B[0]} y1={B[1]} x2={D[0]} y2={D[1]} stroke={diagStroke} strokeWidth={1.5} />

      {/* ── Right-angle mark at B (AB ⊥ BC) ─────────────────────────────────── */}
      <path
        d={`M ${B[0]},${B[1] - 11} L ${B[0] + 11},${B[1] - 11} L ${B[0] + 11},${B[1]}`}
        fill="none"
        stroke={DARK_INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />

      {/* ── Parallel tick marks on AD (top) ──────────────────────────────────── */}
      {[86, 94].map((x) => (
        <line key={`adtick-${x}`} x1={x} y1={A[1] - 5} x2={x} y2={A[1] + 5}
          stroke={DARK_INK} strokeWidth={1.4} />
      ))}

      {/* ── Parallel tick marks on BC (bottom) ───────────────────────────────── */}
      {[113, 121].map((x) => (
        <line key={`bctick-${x}`} x1={x} y1={B[1] - 5} x2={x} y2={B[1] + 5}
          stroke={DARK_INK} strokeWidth={1.4} />
      ))}

      {/* ── Area labels inside each triangle ──────────────────────────────────── */}
      {TRIANGLES.map(({ name, verts }) => {
        const label = areaLabels?.[name]
        if (!label) return null
        const [cx, cy] = ctr(...verts)
        return (
          <text
            key={`lbl-${name}`}
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={700}
            fill={isShaded(name) ? '#92400E' : DARK_INK}
          >
            {label}
          </text>
        )
      })}

      {/* ── Vertex labels ─────────────────────────────────────────────────────── */}
      {(
        [
          { label: 'A', pt: A, dx: -11, dy: -6 },
          { label: 'D', pt: D, dx:  11, dy: -6 },
          { label: 'B', pt: B, dx: -11, dy:  9 },
          { label: 'C', pt: C, dx:  11, dy:  9 },
          { label: 'E', pt: E, dx: -14, dy:  0 },
        ] as const
      ).map(({ label, pt, dx, dy }) => (
        <text
          key={label}
          x={pt[0] + dx}
          y={pt[1] + dy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight={700}
          fontStyle="italic"
          fill={DARK_INK}
        >
          {label}
        </text>
      ))}
    </g>
  )
}

// ── Default export: static stem illustration ────────────────────────────────────

/**
 * TrapDiagsX23B14Illustration
 *
 * Shows trapezoid ABCD (AD ∥ BC, BC = 1.5 AD, right angle at B) with both
 * diagonals intersecting at E. The SHADED regions △ABE and △CDE are filled
 * amber; given areas △ADE = 16 and △BEC = 18 are labelled. The answer is
 * NOT shown.
 */
export default function TrapDiagsX23B14Illustration({ params }: { params?: unknown }) {
  void params
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Trapesium ABCD dengan AD sejajar BC dan BC sama dengan 1,5 AD. ' +
        'Diagonal AC dan BD berpotongan di E. ' +
        'Luas segitiga ADE = 16 cm² dan luas segitiga BEC = 18 cm² ditandai. ' +
        'Daerah yang diarsir adalah segitiga ABE di kiri dan segitiga CDE di kanan.'
      }
    >
      <svg
        viewBox="0 0 240 180"
        width="100%"
        style={{ maxWidth: 320, display: 'block' }}
        aria-hidden="true"
      >
        <TrapDiagsX23B14Figure />
      </svg>
    </div>
  )
}
