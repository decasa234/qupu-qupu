/**
 * WMI-19P2A-Q21 (2019 Grade 2 Semifinal, Paper A) — the "decomposition machine".
 *
 * Redrawn from db/seed/wmi/figures/2019-semifinal-g2-a-q21.jpg (NOT embedded).
 *
 * The scan shows a worked example and an empty machine:
 *   ( 4 = ) ──▶ a wide box holding the FOUR ways to write 4 as a sum of
 *               two-or-more whole numbers ──▶ output  4
 *               (1+3, 1+1+2, 2+2, 1+1+1+1)
 *   ( 6 = ) ──▶ an EMPTY box ──▶ output  ?
 *
 * So the machine counts how many ways its input number can be written as a sum
 * of two or more whole numbers (order ignored). For 4 that count is 4 (shown).
 * For 6 the answer is 10 → choice C.  This file draws ONLY the problem
 * (the worked example for 4 and the empty box for 6) — never the answer.
 *
 * Co-exports `MachineRow`, a reusable primitive: a labelled input pill, an
 * arrow-shaped box that can hold any list of sum-strings, and an output pill.
 * The explainer fills the 6-box one partition per beat with this same primitive.
 *
 * Pure render — no window/document, no Math.random/Date. SSR-safe + deterministic.
 */

// The worked-example partitions of 4 (two-or-more parts), exactly as drawn.
export const FOUR_PARTS = ['1+3', '1+1+2', '2+2', '1+1+1+1'] as const

// The ten partitions of 6 into two-or-more parts (the machine's answer for 6).
export const SIX_PARTS = [
  '1+5',
  '2+4',
  '3+3',
  '1+1+4',
  '1+2+3',
  '2+2+2',
  '1+1+1+3',
  '1+1+2+2',
  '1+1+1+1+2',
  '1+1+1+1+1+1',
] as const

export const SIX_COUNT = SIX_PARTS.length // 10  → choice C

// ─── colour tokens ──────────────────────────────────────────────────────────
const INK = '#2B2118'
const PILL = '#E1EFFB'
const PILL_EDGE = '#30598A'
const TILE_EDGE = '#9CA3AF'
const TILE_BG = '#FFFFFF'
const LIT_BG = '#FFE9C7'
const LIT_EDGE = '#F59E0B'

export const VIEW_W = 460
export const ROW_H = 150

interface MachineRowProps {
  /** Number entering the machine, shown in the left pill. */
  input: number
  /** Output text in the right pill ("4", "?", "10", …). */
  output: string
  /** Sum-strings already placed in the box (drawn as dotted tiles, 2 per row). */
  parts?: readonly string[]
  /** Index of the part to highlight (warm) — for the step-by-step reveal. */
  litIndex?: number
  /** Vertical origin of this row inside its own svg. */
  y?: number
}

/**
 * One machine row: ( input = ) ──▶ [ box of sum-tiles ] ──▶ ( output ).
 * The box is an arrow/banner shape (flat left, pointed right) mirroring the scan.
 */
export function MachineRow({ input, output, parts = [], litIndex, y = 0 }: MachineRowProps) {
  // box geometry
  const boxX = 96
  const boxY = y + 12
  const boxW = 250
  const boxH = ROW_H - 36
  const tipX = boxX + boxW + 28 // arrow tip

  // tile layout inside the box: 2 columns
  const cols = 2
  const padX = 14
  const padY = 16
  const gapX = 10
  const gapY = 10
  const tileW = (boxW - padX * 2 - gapX) / cols
  const tileH = 30

  return (
    <g>
      {/* input pill */}
      <g>
        <ellipse cx={44} cy={y + ROW_H / 2} rx={36} ry={24} fill={PILL} stroke={PILL_EDGE} strokeWidth={2.4} />
        <text
          x={44}
          y={y + ROW_H / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={22}
          fontWeight={800}
          fill={INK}
        >
          {`${input} =`}
        </text>
      </g>

      {/* arrow-shaped machine box */}
      <polygon
        points={`${boxX},${boxY} ${boxX + boxW},${boxY} ${tipX},${boxY + boxH / 2} ${boxX + boxW},${boxY + boxH} ${boxX},${boxY + boxH}`}
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />

      {/* sum tiles */}
      {parts.map((p, i) => {
        const r = Math.floor(i / cols)
        const c = i % cols
        const tx = boxX + padX + c * (tileW + gapX)
        const ty = boxY + padY + r * (tileH + gapY)
        const lit = litIndex === i
        return (
          <g key={`${p}-${i}`}>
            <rect
              x={tx}
              y={ty}
              width={tileW}
              height={tileH}
              rx={5}
              fill={lit ? LIT_BG : TILE_BG}
              stroke={lit ? LIT_EDGE : TILE_EDGE}
              strokeWidth={lit ? 2.4 : 1.4}
              strokeDasharray={lit ? undefined : '3 3'}
            />
            <text
              x={tx + tileW / 2}
              y={ty + tileH / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={14}
              fontWeight={700}
              fill={INK}
            >
              {p}
            </text>
          </g>
        )
      })}

      {/* output pill */}
      <g>
        <rect
          x={tipX + 18}
          y={y + ROW_H / 2 - 26}
          width={72}
          height={52}
          rx={12}
          fill={PILL}
          stroke={PILL_EDGE}
          strokeWidth={2.4}
        />
        <text
          x={tipX + 18 + 36}
          y={y + ROW_H / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={24}
          fontWeight={800}
          fill={INK}
        >
          {output}
        </text>
      </g>
    </g>
  )
}

export default function P19G2Q21Illustration() {
  const totalH = ROW_H * 2 + 20
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A number machine. 4 goes in and the box shows the four ways to write 4 as a sum of two or more numbers, output 4. Then 6 goes into an empty box with output question mark."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${totalH}`}
        width="100%"
        style={{ display: 'block', margin: '0 auto', maxWidth: VIEW_W }}
        aria-hidden="true"
      >
        {/* worked example: 4 → the four partitions → 4 */}
        <MachineRow input={4} output="4" parts={FOUR_PARTS} y={0} />
        {/* the question: 6 → empty box → ? */}
        <MachineRow input={6} output="?" y={ROW_H + 20} />
      </svg>
    </div>
  )
}
