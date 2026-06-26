// TrianglesRectOSN08KQ6Illustration — OSN-08-SD-KAB-Q6
//
// "Dari gambar berikut, keliling yang paling besar di antara segitiga ACD,
//  segitiga DEC, dan segitiga DFC adalah …"  Answer: segitiga ACD.
//
// Figure: rectangle ABCD with E and F on the top edge AB (A–E–F–B left→right).
// Six triangle sides are drawn (besides the shared DC base):
//   Triangle ACD: left edge AD + diagonal AC
//   Triangle DEC: strut DE + strut EC
//   Triangle DFC: strut DF + strut FC
//
// Co-exports TrianglesRectFigure so the explainer can highlight specific sides.
// Pure SVG — no hooks, no framer-motion — SSR-safe.

type Pt = [number, number]

// ── Coordinate geometry ───────────────────────────────────────────────────────
// viewBox "0 0 420 250"
// Rectangle interior corners:
export const PA: Pt = [52,  28]   // A top-left
export const PB: Pt = [368, 28]   // B top-right
export const PC: Pt = [368, 212]  // C bottom-right
export const PD: Pt = [52,  212]  // D bottom-left
// E ≈ 34 % along AB from A; F ≈ 63 % along AB from A
export const PE: Pt = [159, 28]   // E on top edge
export const PF: Pt = [251, 28]   // F on top edge

// ── Geometry helpers ──────────────────────────────────────────────────────────
function pt([x, y]: Pt) { return `${x},${y}` }
function line(a: Pt, b: Pt, cls: string, key: string) {
  return <line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={cls} />
}

// ── Shared primitive ──────────────────────────────────────────────────────────
export type TriHighlight = 'ACD' | 'DEC' | 'DFC' | null

/**
 * The geometry figure.  Pass `highlight` in the Explainer to colour one
 * triangle's non-DC sides; pass null (default) for the neutral problem view.
 */
export function TrianglesRectFigure({
  highlight = null,
}: {
  highlight?: TriHighlight
}) {
  // Colour of each edge group
  const cACD = highlight === 'ACD' ? '#2563EB' : highlight ? '#D1D5DB' : '#374151'
  const cDEC = highlight === 'DEC' ? '#EA580C' : highlight ? '#D1D5DB' : '#374151'
  const cDFC = highlight === 'DFC' ? '#16A34A' : highlight ? '#D1D5DB' : '#374151'
  const wACD = highlight === 'ACD' ? 2.8 : highlight ? 1.2 : 1.8
  const wDEC = highlight === 'DEC' ? 2.8 : highlight ? 1.2 : 1.8
  const wDFC = highlight === 'DFC' ? 2.8 : highlight ? 1.2 : 1.8

  // Label colours
  const lblA = highlight === 'ACD' ? '#2563EB' : '#111827'
  const lblD = '#111827'   // D is shared by all
  const lblC = '#111827'   // C is shared by all
  const lblE = highlight === 'DEC' ? '#EA580C' : '#111827'
  const lblF = highlight === 'DFC' ? '#16A34A' : '#111827'

  const rectStroke = '#6B7280'

  return (
    <svg
      viewBox="0 0 420 250"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', maxWidth: 420, height: 'auto', display: 'block' }}
    >
      {/* Rectangle outline */}
      <rect
        x={PA[0]} y={PA[1]}
        width={PB[0] - PA[0]} height={PD[1] - PA[1]}
        fill="none" stroke={rectStroke} strokeWidth={1.6}
      />

      {/* Triangle DFC sides (DF, FC) — drawn first so ACD/DEC can overlap */}
      <line x1={PD[0]} y1={PD[1]} x2={PF[0]} y2={PF[1]}
        stroke={cDFC} strokeWidth={wDFC} />
      <line x1={PF[0]} y1={PF[1]} x2={PC[0]} y2={PC[1]}
        stroke={cDFC} strokeWidth={wDFC} />

      {/* Triangle DEC sides (DE, EC) */}
      <line x1={PD[0]} y1={PD[1]} x2={PE[0]} y2={PE[1]}
        stroke={cDEC} strokeWidth={wDEC} />
      <line x1={PE[0]} y1={PE[1]} x2={PC[0]} y2={PC[1]}
        stroke={cDEC} strokeWidth={wDEC} />

      {/* Triangle ACD sides (AD = left edge, AC = diagonal) */}
      {/* AD is the left edge — override with ACD colour when highlighted */}
      <line x1={PA[0]} y1={PA[1]} x2={PD[0]} y2={PD[1]}
        stroke={cACD} strokeWidth={wACD} />
      {/* AC diagonal */}
      <line x1={PA[0]} y1={PA[1]} x2={PC[0]} y2={PC[1]}
        stroke={cACD} strokeWidth={wACD} />

      {/* Point dots */}
      {[PA, PB, PC, PD, PE, PF].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill="#111827" />
      ))}

      {/* Labels — offset outward from the rectangle */}
      <text x={PA[0] - 14} y={PA[1] + 5} fontSize={15} fontWeight="700"
        fill={lblA} fontFamily="sans-serif" textAnchor="middle">A</text>
      <text x={PB[0] + 14} y={PB[1] + 5} fontSize={15} fontWeight="700"
        fill="#111827" fontFamily="sans-serif" textAnchor="middle">B</text>
      <text x={PC[0] + 14} y={PC[1] + 5} fontSize={15} fontWeight="700"
        fill="#111827" fontFamily="sans-serif" textAnchor="middle">C</text>
      <text x={PD[0] - 14} y={PD[1] + 5} fontSize={15} fontWeight="700"
        fill={lblD} fontFamily="sans-serif" textAnchor="middle">D</text>
      <text x={PE[0]} y={PE[1] - 12} fontSize={15} fontWeight="700"
        fill={lblE} fontFamily="sans-serif" textAnchor="middle">E</text>
      <text x={PF[0]} y={PF[1] - 12} fontSize={15} fontWeight="700"
        fill={lblF} fontFamily="sans-serif" textAnchor="middle">F</text>
    </svg>
  )
}

// ── Default export: neutral problem illustration ───────────────────────────────
export default function TrianglesRectOSN08KQ6Illustration() {
  return (
    <div className="mx-auto w-full max-w-[420px]" role="img"
      aria-label="Persegi panjang ABCD dengan titik E dan F pada sisi atas AB, membentuk segitiga-segitiga ACD, DEC, dan DFC.">
      <TrianglesRectFigure highlight={null} />
    </div>
  )
}
