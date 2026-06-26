// OSN-15-SD-NAS-Q15 — Trapezoid ABCD with triangle ABP inside.
// Source: docs/reference/ocr-res/osn/nasional/sd/2015.imgs/006.jpg
//
// Problem (id): "Diketahui pada trapesium ABCD, AB sejajar CD. Pada trapesium tersebut
//   dibentuk segitiga ABP dengan P terletak pada sisi CD. Jika panjang sisi AB sama
//   dengan tiga kali panjang sisi CD, maka perbandingan luas segitiga ABP dan luas
//   trapesium ABCD adalah ..."
// Problem (en): "In trapezoid ABCD, AB is parallel to CD. Triangle ABP is formed with
//   P on side CD. If AB = 3 × CD, find the ratio of area(ABP) to area(ABCD)."
// Answer: 3:4
//
// FIGURE: Isosceles trapezoid — A(bottom-left), B(bottom-right), C(top-right),
//   D(top-left). AB is long base, DC is short top (AB = 3 × DC). P sits on DC
//   close to D. Lines AP and PB are drawn, forming triangle ABP. No fill in original.
//
// Co-exports TrapezoidFigure — consumed by the explainer.
// SSR-safe: no hooks, no framer-motion, no window/document/Date/random.

// ── layout ────────────────────────────────────────────────────────────────────
// AB = 240 px (3 units), DC = 80 px (1 unit), height = 110 px
const VW = 320, VH = 230

const AX = 40,  AY = 185   // bottom-left
const BX = 280, BY = 185   // bottom-right
const DX = 120, DY = 75    // top-left
const CX = 200, CY = 75    // top-right
// P at ~1/4 from D toward C — matches source image
const PX = DX + (CX - DX) * 0.25  // 140
const PY = DY                       // 75

const INK       = '#374151'
const FILL_TRI  = 'rgba(30,58,95,0.10)'

export interface TrapezoidFigureProps {
  /** Fill triangle ABP with a blue tint. */
  fillTriangle?: boolean
  /** Highlight AB (bottom base) in amber. */
  highlightAB?: boolean
  /** Highlight DC (top base) in amber. */
  highlightDC?: boolean
  /** Show dashed height line between the parallel sides. */
  showHeight?: boolean
}

export function TrapezoidFigure({
  fillTriangle = false,
  highlightAB  = false,
  highlightDC  = false,
  showHeight   = false,
}: TrapezoidFigureProps) {
  const hx = (AX + BX) / 2  // 160 — midpoint for height drop-line

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <rect width={VW} height={VH} fill="#FAFAFA" />

      {/* triangle ABP fill */}
      {fillTriangle && (
        <polygon
          points={`${AX},${AY} ${BX},${BY} ${PX},${PY}`}
          fill={FILL_TRI}
          stroke="none"
        />
      )}

      {/* trapezoid outline */}
      <polygon
        points={`${AX},${AY} ${BX},${BY} ${CX},${CY} ${DX},${DY}`}
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* lines AP and PB forming triangle ABP */}
      <line x1={AX} y1={AY} x2={PX} y2={PY} stroke={INK} strokeWidth={1.5} />
      <line x1={PX} y1={PY} x2={BX} y2={BY} stroke={INK} strokeWidth={1.5} />

      {/* dashed height line */}
      {showHeight && (
        <>
          <line
            x1={hx} y1={AY} x2={hx} y2={DY}
            stroke="#E74C3C" strokeWidth={1.5} strokeDasharray="5 3"
          />
          <text
            x={hx + 8} y={(AY + DY) / 2 + 4}
            fontSize={12} fontWeight="bold" fill="#E74C3C"
          >
            h
          </text>
        </>
      )}

      {/* amber highlights */}
      {highlightAB && (
        <line x1={AX} y1={AY} x2={BX} y2={BY}
          stroke="#F59E0B" strokeWidth={4} strokeLinecap="round" />
      )}
      {highlightDC && (
        <line x1={DX} y1={DY} x2={CX} y2={CY}
          stroke="#F59E0B" strokeWidth={4} strokeLinecap="round" />
      )}

      {/* vertex labels */}
      <text x={AX - 15} y={AY + 5}  fontSize={15} fontWeight="bold" fill={INK}>A</text>
      <text x={BX + 6}  y={BY + 5}  fontSize={15} fontWeight="bold" fill={INK}>B</text>
      <text x={CX + 6}  y={CY + 5}  fontSize={15} fontWeight="bold" fill={INK}>C</text>
      <text x={DX - 17} y={DY + 5}  fontSize={15} fontWeight="bold" fill={INK}>D</text>
      <text x={PX - 4}  y={PY - 9}  fontSize={15} fontWeight="bold" fill={INK}>P</text>
    </svg>
  )
}

// ── default export: static illustration ───────────────────────────────────────
export default function TrapezoidOSN15NQ15Illustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Trapesium ABCD dengan AB sejajar DC. AB sama dengan tiga kali DC. P terletak pada DC. Segitiga ABP digambar di dalam trapesium."
    >
      <TrapezoidFigure />
    </div>
  )
}
