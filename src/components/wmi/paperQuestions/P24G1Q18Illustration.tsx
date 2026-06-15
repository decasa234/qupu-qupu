// WMI-24P1A-Q18 (2024 Grade 1 Semifinal, Paper A) — stem illustration.
//
// "There are 4 kinds of fruit, as shown. If only one kind of fruit is to be
// kept, at least how many fruits should be taken away?"  Answer = B (6).
//
// The scan (db/seed/wmi/figures/2024-semifinal-g1-a-q18.jpg) shows 10 fruits on
// a blue card in two rows of five, transcribed below so the drawing can never
// drift from the printed paper:
//
//   row 1: pineapple, orange, strawberry, banana, pineapple
//   row 2: strawberry, banana, banana, banana, strawberry
//
//   TALLY (10):  banana 4 · strawberry 3 · pineapple 2 · orange 1
//   → keep the biggest group (4 bananas), remove 10 - 4 = 6.
//
// This file draws ONLY the 10 fruits — never the tally, never the answer. Pure
// render, SSR-safe, deterministic (no random/date, no state).
//
// FruitGlyph is exported so the explainer reuses the exact same icons.

export type FruitKind = 'pineapple' | 'orange' | 'strawberry' | 'banana'

export const FRUIT_LABEL_EN: Record<FruitKind, string> = {
  pineapple: 'pineapple',
  orange: 'orange',
  strawberry: 'strawberry',
  banana: 'banana',
}
export const FRUIT_LABEL_ID: Record<FruitKind, string> = {
  pineapple: 'nanas',
  orange: 'jeruk',
  strawberry: 'stroberi',
  banana: 'pisang',
}

// The 10 fruits in reading order across the two rows of the scan.
export const FRUIT_ROWS: FruitKind[][] = [
  ['pineapple', 'orange', 'strawberry', 'banana', 'pineapple'],
  ['strawberry', 'banana', 'banana', 'banana', 'strawberry'],
]

/**
 * Draws one fruit glyph of the given kind centred on (cx, cy), scaled by `s`
 * (roughly the glyph radius in px). Built from basic shapes only — no emoji.
 */
export function FruitGlyph({ kind, cx, cy, s }: { kind: FruitKind; cx: number; cy: number; s: number }) {
  if (kind === 'pineapple') {
    return (
      <g>
        {/* spiky green crown */}
        <g fill="#3FA34D">
          <path d={`M ${cx} ${cy - s * 1.7} L ${cx - s * 0.35} ${cy - s * 0.7} L ${cx + s * 0.35} ${cy - s * 0.7} Z`} />
          <path d={`M ${cx - s * 0.5} ${cy - s * 1.4} L ${cx - s * 0.75} ${cy - s * 0.6} L ${cx - s * 0.1} ${cy - s * 0.7} Z`} />
          <path d={`M ${cx + s * 0.5} ${cy - s * 1.4} L ${cx + s * 0.75} ${cy - s * 0.6} L ${cx + s * 0.1} ${cy - s * 0.7} Z`} />
        </g>
        {/* body */}
        <ellipse cx={cx} cy={cy} rx={s * 0.72} ry={s} fill="#F2B705" stroke="#D69A00" strokeWidth={1.2} />
        {/* cross-hatch */}
        <g stroke="#C98A00" strokeWidth={1}>
          <line x1={cx - s * 0.5} y1={cy - s * 0.5} x2={cx + s * 0.5} y2={cy + s * 0.2} />
          <line x1={cx - s * 0.5} y1={cy + s * 0.2} x2={cx + s * 0.5} y2={cy - s * 0.5} />
          <line x1={cx - s * 0.5} y1={cy + s * 0.5} x2={cx + s * 0.5} y2={cy - s * 0.2} />
          <line x1={cx - s * 0.5} y1={cy - s * 0.2} x2={cx + s * 0.5} y2={cy + s * 0.5} />
        </g>
      </g>
    )
  }

  if (kind === 'orange') {
    return (
      <g>
        <circle cx={cx} cy={cy} r={s} fill="#FB8C00" stroke="#E67200" strokeWidth={1.2} />
        <circle cx={cx - s * 0.3} cy={cy - s * 0.32} r={s * 0.22} fill="#FFB74D" opacity={0.8} />
        {/* small leaf */}
        <ellipse cx={cx + s * 0.1} cy={cy - s * 0.95} rx={s * 0.28} ry={s * 0.14} fill="#3FA34D" transform={`rotate(-25 ${cx + s * 0.1} ${cy - s * 0.95})`} />
      </g>
    )
  }

  if (kind === 'strawberry') {
    return (
      <g>
        {/* green calyx */}
        <g fill="#3FA34D">
          <path d={`M ${cx} ${cy - s * 0.95} L ${cx - s * 0.55} ${cy - s * 0.55} L ${cx + s * 0.55} ${cy - s * 0.55} Z`} />
          <path d={`M ${cx - s * 0.45} ${cy - s * 0.85} L ${cx - s * 0.7} ${cy - s * 0.4} L ${cx} ${cy - s * 0.5} Z`} />
          <path d={`M ${cx + s * 0.45} ${cy - s * 0.85} L ${cx + s * 0.7} ${cy - s * 0.4} L ${cx} ${cy - s * 0.5} Z`} />
        </g>
        {/* red body — heart-ish */}
        <path
          d={`M ${cx} ${cy + s} C ${cx - s * 1.1} ${cy + s * 0.1} ${cx - s * 0.85} ${cy - s * 0.6} ${cx} ${cy - s * 0.5} C ${cx + s * 0.85} ${cy - s * 0.6} ${cx + s * 1.1} ${cy + s * 0.1} ${cx} ${cy + s} Z`}
          fill="#E53935"
          stroke="#C62828"
          strokeWidth={1.2}
        />
        {/* seeds */}
        {[
          [-0.35, -0.05],
          [0.35, -0.05],
          [0, 0.25],
          [-0.55, 0.3],
          [0.55, 0.3],
        ].map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx * s} cy={cy + dy * s} r={s * 0.07} fill="#FFE082" />
        ))}
      </g>
    )
  }

  // banana — a yellow crescent
  return (
    <g>
      <path
        d={`M ${cx - s} ${cy - s * 0.6} Q ${cx} ${cy + s * 1.1} ${cx + s} ${cy - s * 0.4} Q ${cx + s * 0.5} ${cy + s * 0.2} ${cx} ${cy + s * 0.55} Q ${cx - s * 0.5} ${cy + s * 0.2} ${cx - s} ${cy - s * 0.6} Z`}
        fill="#FFD23F"
        stroke="#E0AE0A"
        strokeWidth={1.2}
      />
      <circle cx={cx + s} cy={cy - s * 0.42} r={s * 0.12} fill="#9A6B00" />
    </g>
  )
}

const GLYPH_R = 20
const CELL_W = 60
const ROW_H = 64
const PAD_X = 24
const PAD_Y = 22

export default function P24G1Q18Illustration() {
  const cols = Math.max(...FRUIT_ROWS.map((r) => r.length))
  const width = PAD_X * 2 + cols * CELL_W
  const height = PAD_Y * 2 + FRUIT_ROWS.length * ROW_H

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Ten fruits in two rows: pineapple, orange, strawberry, banana, pineapple; then strawberry, banana, banana, banana, strawberry."
    >
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width, display: 'block' }} aria-hidden="true">
        <rect x={2} y={2} width={width - 4} height={height - 4} rx={18} fill="#AEE0F7" stroke="#7FC4E8" strokeWidth={2} />
        {FRUIT_ROWS.map((row, ri) =>
          row.map((kind, ci) => (
            <FruitGlyph
              key={`${ri}-${ci}`}
              kind={kind}
              cx={PAD_X + ci * CELL_W + CELL_W / 2}
              cy={PAD_Y + ri * ROW_H + ROW_H / 2}
              s={GLYPH_R}
            />
          )),
        )}
      </svg>
    </div>
  )
}
