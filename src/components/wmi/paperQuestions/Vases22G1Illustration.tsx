// WMI-22F1A-Q17 — "three vases that sum to 100" figure.
//
// Seven pink vases stand in a row, each with a printed number. In the scan they
// are staggered: odd-indexed vases sit a little lower than even-indexed ones.
// Three of the seven numbers add to exactly 100 (13 + 39 + 48 = 100); written
// smallest→largest they give 133948. The static figure shows ONLY the seven
// vases with their numbers — it never reveals which three are the answer.
//
// The animator imports `VaseRow` and passes `litIndexes` (0-based) to ring the
// chosen vases in amber, in the fixed left→right order [13,57,8,39,48,29,47].

// Fixed printed order of the vase numbers, left → right (as in the scan).
const NUMBERS: readonly number[] = [13, 57, 8, 39, 48, 29, 47]

// --- layout ---------------------------------------------------------------
const VASE_W = 58 // body width at the belly
const VASE_H = 96 // body height (neck to base)
const SLOT_W = 64 // horizontal slot each vase occupies
const STAGGER = 18 // how far odd-indexed vases drop
const PAD_X = 12
const PAD_TOP = 10
const PAD_BOTTOM = 16

const COUNT = NUMBERS.length
const VIEW_W = PAD_X * 2 + COUNT * SLOT_W
const VIEW_H = PAD_TOP + VASE_H + STAGGER + PAD_BOTTOM

const VASE_DARK = '#2B2B2B' // number ink (dark, centred)
const RING = '#F59E0B' // amber lit ring (answer reveal — animator only)

// A single vase glyph: rounded body, narrow neck, flared lip, plus a lighter
// oval label carrying the number. `x`,`y` are the top-left of the vase slot.
function Vase({ x, y, value, lit }: { x: number; y: number; value: number; lit?: boolean }) {
  const cx = x + VASE_W / 2
  const top = y // lip level
  const neckY = y + 14
  const bellyY = y + VASE_H * 0.55
  const baseY = y + VASE_H

  // Pot silhouette: flared lip → narrow neck → round belly → tucked base.
  const half = VASE_W / 2
  const neckHalf = VASE_W * 0.2
  const baseHalf = VASE_W * 0.26
  const body = [
    `M ${cx - neckHalf - 5} ${top}`, // lip left
    `Q ${cx} ${top + 6} ${cx + neckHalf + 5} ${top}`, // lip curve
    `L ${cx + neckHalf} ${neckY}`, // down right neck
    `C ${cx + half + 6} ${bellyY - 14} ${cx + half} ${bellyY + 20} ${cx + baseHalf} ${baseY}`, // right belly → base
    `Q ${cx} ${baseY + 6} ${cx - baseHalf} ${baseY}`, // base curve
    `C ${cx - half} ${bellyY + 20} ${cx - half - 6} ${bellyY - 14} ${cx - neckHalf} ${neckY}`, // left belly → neck
    'Z',
  ].join(' ')

  // The number label oval, centred on the belly.
  const labelCy = bellyY + 8
  const labelRx = VASE_W * 0.34
  const labelRy = VASE_H * 0.2

  return (
    <g>
      {/* vase body */}
      <path
        d={body}
        className="fill-qupu-peach"
        stroke={lit ? RING : '#E6A580'}
        strokeWidth={lit ? 5 : 2.5}
        strokeLinejoin="round"
      />
      {/* lip ellipse so the mouth reads as a 3-D rim */}
      <ellipse
        cx={cx}
        cy={top + 1}
        rx={neckHalf + 5}
        ry={4}
        className="fill-qupu-peach"
        stroke={lit ? RING : '#E6A580'}
        strokeWidth={lit ? 4 : 2}
      />
      {/* lighter label oval carrying the number */}
      <ellipse cx={cx} cy={labelCy} rx={labelRx} ry={labelRy} className="fill-qupu-shell" />
      <text
        x={cx}
        y={labelCy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        className="font-display"
        fontSize={26}
        fontWeight={800}
        fill={VASE_DARK}
      >
        {value}
      </text>
    </g>
  )
}

/**
 * Reusable primitive: the seven vases in their fixed printed order
 * [13, 57, 8, 39, 48, 29, 47]. `litIndexes` (0-based) rings those vases in
 * amber — used by the animator after the answer is revealed. Draw-only; safe
 * to call with no props (renders the plain problem setup).
 */
export function VaseRow({ litIndexes }: { litIndexes?: number[] }) {
  const lit = new Set(Array.isArray(litIndexes) ? litIndexes : [])
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ display: 'block', margin: '0 auto', maxWidth: 360 }}
      aria-hidden="true"
    >
      {NUMBERS.map((value, i) => {
        const x = PAD_X + i * SLOT_W
        // Odd-indexed vases sit lower (staggered), as in the scan.
        const y = PAD_TOP + (i % 2 === 1 ? STAGGER : 0)
        return <Vase key={i} x={x} y={y} value={value} lit={lit.has(i)} />
      })}
    </svg>
  )
}

export default function Vases22G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Tujuh vas berjajar, masing-masing bertuliskan angka: 13, 57, 8, 39, 48, 29, dan 47. Pilih tiga vas yang jumlah angkanya tepat 100."
    >
      <VaseRow />
    </div>
  )
}
