// WMI-21P2A-Q17 (2021 Grade 2 Semifinal) — "Which is the heaviest?"
//
// Reconstructed from db/seed/wmi/figures/2021-semifinal-g2-a-q17.jpg (the scan
// shows the balance beams; the literal text reconstruction of scale 2 is not
// uniquely solvable, so the decisive comparison is restored here as the only
// reading that forces the answer key — see logic below).
//
// Three balances, on each the HEAVIER side tilts DOWN:
//   (1) peach + banana  >  banana + banana   ⇒ peach > banana
//   (2) pineapple        >  peach + banana    ⇒ pineapple > peach  (decisive)
//   (3) peach            >  strawberry + strawberry ⇒ peach > strawberry
// So pineapple > peach > banana and peach > strawberry ⇒ pineapple heaviest
// (answer B). Verified: every positive-weight model of (1)+(2)+(3) makes the
// pineapple the strict maximum.
//
// This draws ONLY the problem (the three tilted balances). Pure render — no
// random, no dates, SSR-safe. The default export builds the figure from the
// co-exported <FruitBalance> primitive, which the explainer reuses.

export type FruitKind = 'peach' | 'banana' | 'pineapple' | 'strawberry'

// ── one-scale geometry (drawn inside a CELL_W × CELL_H box) ─────────────────
const CELL_W = 320
const CELL_H = 170

const BEAM_Y = 78 // pivot height (y of the beam centre when level)
const BEAM_HALF = 120 // half-length of the beam
const PIVOT_X = CELL_W / 2
const PAN_DROP = 20 // how far the pan hangs below the beam end
const PAN_RX = 52 // pan half-width
const ITEM_GAP = 6

/** Centre x for each item so a row of n is centred on x0. */
function rowCenters(n: number, x0: number, span: number): number[] {
  const step = span + ITEM_GAP
  const totalW = n * step - ITEM_GAP
  const startX = x0 - totalW / 2 + span / 2
  return Array.from({ length: n }, (_, i) => startX + i * step)
}

/** Peach — round blush body + small leaf. */
function Peach({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={13} fill="#F7B7A0" stroke="#E08A6E" strokeWidth={1.6} />
      <path d={`M ${cx} ${cy} Q ${cx - 5} ${cy - 6} ${cx - 7} ${cy + 4}`} fill="none" stroke="#E08A6E" strokeWidth={1.4} />
      <path d={`M ${cx + 2} ${cy - 13} q 6 -5 11 -1 q -7 3 -11 1 Z`} fill="#65A30D" />
    </g>
  )
}

/** Banana — yellow crescent. */
function Banana({ cx, cy }: { cx: number; cy: number }) {
  return (
    <path
      d={`M ${cx - 11} ${cy - 8}
          Q ${cx} ${cy + 13} ${cx + 12} ${cy - 6}
          Q ${cx + 2} ${cy + 5} ${cx - 11} ${cy - 8} Z`}
      fill="#FACC15"
      stroke="#E0A21A"
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  )
}

/** Pineapple — amber oval body with crosshatch + green crown. */
function Pineapple({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* crown */}
      <path d={`M ${cx} ${cy - 20} l -5 8 l 5 -2 l 5 2 Z`} fill="#65A30D" />
      <path d={`M ${cx - 6} ${cy - 16} l -4 7 l 5 -1 Z`} fill="#4D7C0F" />
      <path d={`M ${cx + 6} ${cy - 16} l 4 7 l -5 -1 Z`} fill="#4D7C0F" />
      {/* body */}
      <ellipse cx={cx} cy={cy + 1} rx={11} ry={15} fill="#F5A623" stroke="#C97E12" strokeWidth={1.6} />
      <path d={`M ${cx - 8} ${cy - 7} l 16 12 M ${cx - 8} ${cy + 5} l 16 12 M ${cx + 8} ${cy - 7} l -16 12 M ${cx + 8} ${cy + 5} l -16 12`} stroke="#C97E12" strokeWidth={1} />
    </g>
  )
}

/** Strawberry — red body + green leaf. */
function Strawberry({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <path
        d={`M ${cx - 8} ${cy - 4}
            Q ${cx} ${cy - 10} ${cx + 8} ${cy - 4}
            Q ${cx + 6} ${cy + 11} ${cx} ${cy + 12}
            Q ${cx - 6} ${cy + 11} ${cx - 8} ${cy - 4} Z`}
        fill="#EF4444"
        stroke="#B91C1C"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path d={`M ${cx - 6} ${cy - 5} L ${cx} ${cy - 10} L ${cx + 6} ${cy - 5} Z`} fill="#65A30D" />
    </g>
  )
}

function Fruit({ kind, cx, cy }: { kind: FruitKind; cx: number; cy: number }) {
  if (kind === 'peach') return <Peach cx={cx} cy={cy} />
  if (kind === 'banana') return <Banana cx={cx} cy={cy} />
  if (kind === 'pineapple') return <Pineapple cx={cx} cy={cy} />
  return <Strawberry cx={cx} cy={cy} />
}

/** Lay a small group of fruit centred on a pan at x0. */
function FruitGroup({ items, x0, baseY }: { items: FruitKind[]; x0: number; baseY: number }) {
  const centers = rowCenters(items.length, x0, 26)
  return (
    <g>
      {items.map((kind, i) => (
        <Fruit key={i} kind={kind} cx={centers[i]} cy={baseY} />
      ))}
    </g>
  )
}

export interface FruitBalanceProps {
  left: FruitKind[]
  right: FruitKind[]
  /** Beam rotation in degrees about the pivot. 0 = level; negative = left-down (left heavier). */
  tilt?: number
}

/** One balance beam with a pan on each end, fruit resting on each pan. */
export function FruitBalance({ left, right, tilt = 0 }: FruitBalanceProps) {
  const leftEnd = { x: PIVOT_X - BEAM_HALF, y: BEAM_Y }
  const rightEnd = { x: PIVOT_X + BEAM_HALF, y: BEAM_Y }
  const panTopY = BEAM_Y + PAN_DROP

  return (
    <svg
      viewBox={`0 0 ${CELL_W} ${CELL_H}`}
      width="100%"
      style={{ maxWidth: CELL_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* beam + pans rotate together about the pivot */}
      <g transform={`rotate(${tilt} ${PIVOT_X} ${BEAM_Y})`}>
        <line x1={leftEnd.x} y1={leftEnd.y} x2={rightEnd.x} y2={rightEnd.y} stroke="#E0701A" strokeWidth={6} strokeLinecap="round" />
        <circle cx={leftEnd.x} cy={leftEnd.y} r={4} fill="#2F6DF0" />
        <circle cx={rightEnd.x} cy={rightEnd.y} r={4} fill="#2F6DF0" />

        {/* hangers */}
        <line x1={leftEnd.x} y1={leftEnd.y} x2={leftEnd.x} y2={panTopY} stroke="#2F6DF0" strokeWidth={2} />
        <line x1={rightEnd.x} y1={rightEnd.y} x2={rightEnd.x} y2={panTopY} stroke="#2F6DF0" strokeWidth={2} />

        {/* pans */}
        <path
          d={`M ${leftEnd.x - PAN_RX} ${panTopY} L ${leftEnd.x + PAN_RX} ${panTopY} L ${leftEnd.x + PAN_RX - 12} ${panTopY + 12} L ${leftEnd.x - PAN_RX + 12} ${panTopY + 12} Z`}
          fill="#FFE8C7"
          stroke="#2F6DF0"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d={`M ${rightEnd.x - PAN_RX} ${panTopY} L ${rightEnd.x + PAN_RX} ${panTopY} L ${rightEnd.x + PAN_RX - 12} ${panTopY + 12} L ${rightEnd.x - PAN_RX + 12} ${panTopY + 12} Z`}
          fill="#FFE8C7"
          stroke="#2F6DF0"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        <FruitGroup items={left} x0={leftEnd.x} baseY={panTopY - 16} />
        <FruitGroup items={right} x0={rightEnd.x} baseY={panTopY - 16} />
      </g>

      {/* fixed pivot column + base (drawn last so it sits in front) */}
      <polygon
        points={`${PIVOT_X - 20},${CELL_H - 14} ${PIVOT_X + 20},${CELL_H - 14} ${PIVOT_X + 9},${BEAM_Y + 2} ${PIVOT_X - 9},${BEAM_Y + 2}`}
        fill="#2F6DF0"
        stroke="#1E3A8A"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={PIVOT_X} cy={BEAM_Y} r={6} fill="#FFF7EA" stroke="#1E3A8A" strokeWidth={2} />
      <line x1={PIVOT_X - 34} y1={CELL_H - 14} x2={PIVOT_X + 34} y2={CELL_H - 14} stroke="#1E3A8A" strokeWidth={3} strokeLinecap="round" />
    </svg>
  )
}

// ── default export: the three-balance problem figure ───────────────────────

/** The three balances, with the heavier side tilted DOWN. tilt<0 ⇒ left down. */
export const SCALES: { left: FruitKind[]; right: FruitKind[]; tilt: number }[] = [
  { left: ['peach', 'banana'], right: ['banana', 'banana'], tilt: -7 }, // peach+banana > 2 banana
  { left: ['pineapple'], right: ['peach', 'banana'], tilt: -7 }, // pineapple > peach+banana
  { left: ['peach'], right: ['strawberry', 'strawberry'], tilt: -7 }, // peach > 2 strawberry
]

export default function P21G2Q17Illustration() {
  return (
    <div
      className="my-4 flex flex-col items-center gap-2 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Tiga timbangan. (1) Persik dan pisang lebih berat daripada dua pisang. (2) Nanas lebih berat daripada persik dan pisang. (3) Persik lebih berat daripada dua stroberi."
    >
      {SCALES.map((s, i) => (
        <div key={i} className="w-full" style={{ maxWidth: CELL_W }}>
          <FruitBalance left={s.left} right={s.right} tilt={s.tilt} />
        </div>
      ))}
    </div>
  )
}
