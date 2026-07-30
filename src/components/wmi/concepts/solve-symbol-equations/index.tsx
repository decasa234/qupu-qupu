import type { ReactNode } from 'react'

// ---------------------------------------------------------------------------
// L9 `solve-symbol-equations` — question figure.
//
// This module is the SINGLE SOURCE of the symbol equations' look: the palette,
// the glyph drawings and the token widths all live here and are exported, so the
// post-answer explainer (src/components/wmi/concepts/explainers/
// SolveSymbolEquationsExplainer.tsx) animates the very same star and circle at
// the very same size instead of keeping a second copy that can drift.
//
// The figure is the primary way the equations are READ: the stem states them in
// words (no ★ / ● characters anywhere in the text), and everything symbolic is
// drawn here — big, coloured and font-independent.
// ---------------------------------------------------------------------------

export type SymbolKind = 'star' | 'circle'

export interface SymbolEqFigureParams {
  /** What one star is worth. */
  s: number
  /** What one circle is worth — never drawn, never spoken. */
  c: number
  /** How many stars stand in the first equation. */
  n: number
}

export const SAMPLE: SymbolEqFigureParams = { s: 4, c: 5, n: 3 }

/** The figure's own clamps — the one place params are coerced onto the board. */
export function normalizeSymbolEqParams(raw: unknown): SymbolEqFigureParams {
  const p = (raw ?? {}) as Partial<SymbolEqFigureParams>
  const int = (v: unknown, lo: number, hi: number, dflt: number) =>
    typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : dflt
  return {
    s: int(p.s, 1, 20, SAMPLE.s),
    c: int(p.c, 1, 30, SAMPLE.c),
    n: int(p.n, 2, 4, SAMPLE.n),
  }
}

// ── palette ───────────────────────────────────────────────────────────────
// Warm house tokens as literal hex, so the equations read identically on the
// question card, in the explainer and in any admin preview.
export const SYMBOL_INK = {
  /** Numbers, and the frame of anything structural. */
  ink: '#30598A',
  /** + and = — quieter than the numbers so the shapes lead. */
  operator: '#7C8AA0',
  starFill: '#FFDD55',
  starStroke: '#E07B18',
  circleFill: '#3E7CC4',
  circleStroke: '#2E5F9C',
  cream: '#FFF2DF',
} as const

// ── glyph + token metrics ─────────────────────────────────────────────────
/** The square box one shape glyph is drawn in, centred on (0, 0). */
export const SHAPE_BOX = 32
const OP_W = 18
const DIGIT_W = 18
const GAP = 7
const PAD = 8
const ROW_H = 46
const ROW_GAP = 16
const NUM_SIZE = 30
const OP_SIZE = 26

export const DISPLAY_FONT = 'Fredoka, "Segoe UI Symbol", sans-serif'

function starPoints(r: number): string {
  const inner = r * 0.44
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : inner
    // start at the top point and walk clockwise — fully deterministic
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    pts.push(`${(rad * Math.cos(a)).toFixed(2)},${(rad * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

/**
 * One shape glyph, centred on (0, 0) inside a box of `SHAPE_BOX`. Chunky fill +
 * a darker outline so it stays legible at any size and never depends on a font
 * having the ★ / ● characters.
 */
export function symbolGlyph(kind: SymbolKind, key?: string): ReactNode {
  const r = SHAPE_BOX / 2 - 1.4
  if (kind === 'circle') {
    return (
      <circle
        key={key}
        cx={0}
        cy={0}
        r={r}
        fill={SYMBOL_INK.circleFill}
        stroke={SYMBOL_INK.circleStroke}
        strokeWidth={2.4}
      />
    )
  }
  return (
    <polygon
      key={key}
      // nudge down: a star's visual centre sits above its bounding-box centre
      points={starPoints(r + 1.4)}
      transform="translate(0,1.4)"
      fill={SYMBOL_INK.starFill}
      stroke={SYMBOL_INK.starStroke}
      strokeWidth={2.2}
      strokeLinejoin="round"
    />
  )
}

/** A standalone `<svg>` holding one glyph, sized in px. Used by the explainer. */
export function SymbolGlyphBox({ kind, size }: { kind: SymbolKind; size: number }) {
  const half = SHAPE_BOX / 2
  return (
    <svg
      viewBox={`${-half} ${-half} ${SHAPE_BOX} ${SHAPE_BOX}`}
      width={size}
      height={size}
      role="presentation"
      style={{ display: 'block' }}
    >
      {symbolGlyph(kind)}
    </svg>
  )
}

// ── row layout ────────────────────────────────────────────────────────────
type Token =
  | { kind: 'shape'; shape: SymbolKind }
  | { kind: 'op'; text: string }
  | { kind: 'num'; text: string }

function tokenWidth(t: Token): number {
  if (t.kind === 'shape') return SHAPE_BOX
  if (t.kind === 'op') return OP_W
  return Math.max(DIGIT_W, t.text.length * DIGIT_W)
}

function rowWidth(tokens: Token[]): number {
  if (tokens.length === 0) return 0
  return tokens.reduce((w, t) => w + tokenWidth(t), 0) + GAP * (tokens.length - 1)
}

/** `★ + ★ + ★` — the left-hand side of the first equation. */
function starChain(n: number): Token[] {
  const out: Token[] = []
  for (let i = 0; i < n; i++) {
    if (i > 0) out.push({ kind: 'op', text: '+' })
    out.push({ kind: 'shape', shape: 'star' })
  }
  return out
}

export interface EquationRow {
  lhs: Token[]
  total: string
}

export function symbolEquationRows(p: SymbolEqFigureParams): [EquationRow, EquationRow] {
  return [
    { lhs: starChain(p.n), total: String(p.n * p.s) },
    {
      lhs: [
        { kind: 'shape', shape: 'star' },
        { kind: 'op', text: '+' },
        { kind: 'shape', shape: 'circle' },
      ],
      total: String(p.s + p.c),
    },
  ]
}

/** Draws one token with its LEFT edge at x, vertically centred on the row. */
function TokenNode({ token, x, tag }: { token: Token; x: number; tag: string }) {
  const w = tokenWidth(token)
  if (token.kind === 'shape') {
    return <g transform={`translate(${(x + w / 2).toFixed(2)},0)`}>{symbolGlyph(token.shape, tag)}</g>
  }
  const isOp = token.kind === 'op'
  return (
    <text
      x={x + w / 2}
      y={0}
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily={DISPLAY_FONT}
      fontSize={isOp ? OP_SIZE : NUM_SIZE}
      fontWeight={isOp ? 700 : 900}
      fill={isOp ? SYMBOL_INK.operator : SYMBOL_INK.ink}
    >
      {token.text}
    </text>
  )
}

function EquationRowNode({ row, lhsRight, tag }: { row: EquationRow; lhsRight: number; tag: string }) {
  // Right-align the left-hand side so both "=" signs stack — the equations then
  // read like a worksheet instead of two ragged lines.
  let x = lhsRight - rowWidth(row.lhs)
  const nodes: ReactNode[] = []
  row.lhs.forEach((t, i) => {
    nodes.push(<TokenNode key={`${tag}-l${i}`} token={t} x={x} tag={`${tag}-l${i}`} />)
    x += tokenWidth(t) + GAP
  })
  const eq: Token = { kind: 'op', text: '=' }
  x = lhsRight + GAP
  nodes.push(<TokenNode key={`${tag}-eq`} token={eq} x={x} tag={`${tag}-eq`} />)
  x += OP_W + GAP
  nodes.push(
    <TokenNode key={`${tag}-t`} token={{ kind: 'num', text: row.total }} x={x} tag={`${tag}-t`} />,
  )
  return <>{nodes}</>
}

// ── screen-reader label ───────────────────────────────────────────────────
// Policy: speak exactly the two equations the picture draws — the same two facts
// the stem already states in words. What one circle is worth is never derived
// here, so the label can never hand over the answer.
export function symbolFigureAriaLabel(p: SymbolEqFigureParams): string {
  const total1 = p.n * p.s
  const total2 = p.s + p.c
  return (
    `Dua persamaan bergambar. Persamaan pertama: ${p.n} bintang dijumlahkan menjadi ${total1}. ` +
    `Persamaan kedua: satu bintang ditambah satu lingkaran menjadi ${total2}.`
  )
}

/**
 * solve-symbol-equations — question figure.
 *
 * Two stacked equations built from big coloured SVG shapes: a yellow star and a
 * blue circle at ~32px, with the `+`, `=` and the totals set in the house
 * display font. Both `=` signs line up. Nothing here reveals what a circle is
 * worth — the second total is a given, printed on the page.
 *
 * Pure render from params — no random, no dates, SSR-safe. Falls back to a
 * sample when params arrive in the wrong shape so previews still render.
 */
export default function SolveSymbolEquationsIllustration({ params }: { params: unknown }) {
  const p = normalizeSymbolEqParams(params)
  const rows = symbolEquationRows(p)

  const lhsRight = PAD + Math.max(...rows.map((r) => rowWidth(r.lhs)))
  const rhsWidth = GAP + OP_W + GAP + Math.max(...rows.map((r) => r.total.length * DIGIT_W))
  const width = lhsRight + rhsWidth + PAD
  const height = PAD * 2 + ROW_H * 2 + ROW_GAP

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={symbolFigureAriaLabel(p)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={Math.min(330, width)}
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {rows.map((row, i) => (
          <g key={`eq-${i}`} transform={`translate(0,${PAD + ROW_H / 2 + i * (ROW_H + ROW_GAP)})`}>
            <EquationRowNode row={row} lhsRight={lhsRight} tag={`eq${i}`} />
          </g>
        ))}
      </svg>
    </div>
  )
}
