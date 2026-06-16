// WMI-23P3A-Q23 (2023 Grade 3 Semifinal, Paper A) — the "computing machine".
//
// Redrawn from db/seed/wmi/figures/2023-semifinal-g3-a-q23.jpg (NOT embedded).
//
// The scan shows a worked example and the question machine:
//   example:   9 ──▶ ( +4 ) ──▶ ( −6 ) ──▶ 7
//   question:  ? ──▶ ( ×2 ) ──▶ ( +5 ) ──▶ ( ×4 ) ──▶ ( −8 ) ──▶ ( ÷3 ) ──▶ 60
//
// Feed the input through the operation pills left → right; the output is 60.
// Find the input. Working forwards: ((? ×2 +5) ×4 −8) ÷3 = 60 ⇒ ? = 21 → choice D.
//
// This file draws ONLY the problem: the worked example chain and the question
// chain with input "?" and output 60. It never reveals 21 and never marks the
// undo arithmetic. Co-exports `OpChain`, a reusable primitive: an input pill,
// a row of operation pills (optionally each annotated with the value flowing
// out of it), and an output pill. The explainer reuses it to fill the running
// values one undo-step at a time.
//
// Pure render — no window/document, no Math.random/Date. SSR-safe + deterministic.

export type Op = { kind: '×' | '+' | '−' | '÷'; n: number }

// The five machine operations, in left → right order.
export const OPS: readonly Op[] = [
  { kind: '×', n: 2 },
  { kind: '+', n: 5 },
  { kind: '×', n: 4 },
  { kind: '−', n: 8 },
  { kind: '÷', n: 3 },
]

export const OUTPUT = 60

/** Apply one operation forward. */
export function applyOp(v: number, op: Op): number {
  switch (op.kind) {
    case '×':
      return v * op.n
    case '+':
      return v + op.n
    case '−':
      return v - op.n
    case '÷':
      return v / op.n
  }
}

/** Undo one operation (inverse), used when working backwards from the output. */
export function undoOp(v: number, op: Op): number {
  switch (op.kind) {
    case '×':
      return v / op.n
    case '+':
      return v - op.n
    case '−':
      return v + op.n
    case '÷':
      return v * op.n
  }
}

// The verified input: undo OUTPUT through the ops in reverse.
export const INPUT = [...OPS].reverse().reduce((v, op) => undoOp(v, op), OUTPUT) // 21 → choice D

const opLabel = (op: Op) => `${op.kind}${op.n}`

// ─── colour tokens ──────────────────────────────────────────────────────────
const INK = '#2B2118'
const PILL = '#E1EFFB'
const PILL_EDGE = '#30598A'
const OP_BG = '#FEF3C7' // yellow op pills (echo the scan)
const OP_EDGE = '#D9A21B'
const ARROW = '#9CC5EC' // pale-blue arrows (echo the scan)
const LIT_BG = '#FFE0B2'
const LIT_EDGE = '#F59E0B'
const VAL_INK = '#15803D'

export const VIEW_W = 560
const VIEW_H = 168

// Layout
const IN_X = 40
const FIRST_OP_X = 132
const OP_GAP = 78
const PILL_RX = 30
const PILL_RY = 22
const CY = 70

const opX = (i: number) => FIRST_OP_X + i * OP_GAP

export interface OpChainProps {
  /** Text in the left input pill ("?", "21", …). */
  input: string
  /** Text in the right output pill ("60", …). */
  output: string
  /**
   * Optional value flowing OUT of operation i, drawn under that pill.
   * Length up to OPS.length; undefined entries draw nothing.
   */
  flowValues?: ReadonlyArray<number | undefined>
  /** Index of the operation pill to highlight warm (the step being undone). */
  litOp?: number
  /** Vertical origin offset. */
  y?: number
}

/** One arrow between two x-centres. */
function Arrow({ x1, x2, cy }: { x1: number; x2: number; cy: number }) {
  const half = 7
  return (
    <g>
      <line x1={x1} y1={cy} x2={x2 - 6} y2={cy} stroke={ARROW} strokeWidth={6} strokeLinecap="round" />
      <polygon points={`${x2},${cy} ${x2 - 11},${cy - half} ${x2 - 11},${cy + half}`} fill={ARROW} />
    </g>
  )
}

/**
 * The operation chain: input pill → op pills (×2, +5, …) → output pill, joined
 * by arrows. Pass `flowValues` to annotate the running value out of each op, and
 * `litOp` to warm-highlight one op pill.
 */
export function OpChain({ input, output, flowValues = [], litOp, y = 0 }: OpChainProps) {
  const cy = CY + y
  const lastOpX = opX(OPS.length - 1)
  const outX = lastOpX + OP_GAP + 8

  return (
    <g>
      {/* input pill */}
      <g>
        <ellipse cx={IN_X} cy={cy} rx={PILL_RX} ry={PILL_RY} fill={PILL} stroke={PILL_EDGE} strokeWidth={2.4} />
        <text x={IN_X} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>
          {input}
        </text>
      </g>

      {/* arrow input → first op */}
      <Arrow x1={IN_X + PILL_RX} x2={opX(0) - PILL_RX} cy={cy} />

      {/* op pills + connecting arrows */}
      {OPS.map((op, i) => {
        const x = opX(i)
        const lit = litOp === i
        const fv = flowValues[i]
        return (
          <g key={`op${i}`}>
            <ellipse
              cx={x}
              cy={cy}
              rx={PILL_RX}
              ry={PILL_RY}
              fill={lit ? LIT_BG : OP_BG}
              stroke={lit ? LIT_EDGE : OP_EDGE}
              strokeWidth={lit ? 3 : 2.4}
            />
            <text x={x} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={INK}>
              {opLabel(op)}
            </text>
            {/* value flowing out of this op (post-answer annotation) */}
            {fv !== undefined && (
              <text
                x={x + PILL_RX + OP_GAP / 2 - PILL_RX}
                y={cy + PILL_RY + 18}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={16}
                fontWeight={800}
                fill={VAL_INK}
              >
                {fv}
              </text>
            )}
            {/* arrow to next op (or to output after the last op) */}
            {i < OPS.length - 1 ? (
              <Arrow x1={x + PILL_RX} x2={opX(i + 1) - PILL_RX} cy={cy} />
            ) : (
              <Arrow x1={x + PILL_RX} x2={outX - 30} cy={cy} />
            )}
          </g>
        )
      })}

      {/* output pill */}
      <g>
        <rect x={outX - 30} y={cy - 26} width={66} height={52} rx={12} fill={PILL} stroke={PILL_EDGE} strokeWidth={2.4} />
        <text x={outX + 3} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill={INK}>
          {output}
        </text>
      </g>
    </g>
  )
}

/** The small worked-example chain  9 → (+4) → (−6) → 7, drawn compactly. */
function ExampleChain() {
  const cy = 28
  const x0 = 40
  const x1 = 116
  const x2 = 196
  const x3 = 272
  const rx = 22
  const ry = 17
  const pill = (cx: number, label: string, op = false) => (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={op ? OP_BG : PILL} stroke={op ? OP_EDGE : PILL_EDGE} strokeWidth={2} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill={INK}>
        {label}
      </text>
    </g>
  )
  const arr = (a: number, b: number) => (
    <g>
      <line x1={a + rx} y1={cy} x2={b - rx - 5} y2={cy} stroke={ARROW} strokeWidth={4} strokeLinecap="round" />
      <polygon points={`${b - rx},${cy} ${b - rx - 9},${cy - 5} ${b - rx - 9},${cy + 5}`} fill={ARROW} />
    </g>
  )
  return (
    <g>
      <text x={x0 - 30} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={13} fontStyle="italic" fontWeight={700} fill={INK}>
        EX
      </text>
      {pill(x0, '9')}
      {arr(x0, x1)}
      {pill(x1, '+4', true)}
      {arr(x1, x2)}
      {pill(x2, '−6', true)}
      {arr(x2, x3)}
      {pill(x3, '7')}
    </g>
  )
}

export default function P23G3Q23Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A computing machine. Example: 9 goes in, then plus 4, then minus 6, output 7. The question machine: an unknown input goes through times 2, plus 5, times 4, minus 8, divide by 3, and the output is 60. Find the input."
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        style={{ display: 'block', margin: '0 auto', maxWidth: VIEW_W }}
        aria-hidden="true"
      >
        <ExampleChain />
        <OpChain input="?" output={String(OUTPUT)} y={40} />
      </svg>
    </div>
  )
}
