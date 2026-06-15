// WMI-25P1A-Q25 (2025 Grade 1 Semifinal, Paper A) — animal equation substitution.
//
// "Lion + Cow = 14, and Lion + Lion + Cow = 25. Find Lion + Cow + Cow."
// Answer: A (17).
//
// Source figure (db/seed/wmi/figures/2025-semifinal-g1-a-q25.jpg) shows the two
// animals as cartoon icons in an equation "Lion + Cow = 14". We redraw the
// animals as clean, basic SVG glyphs (a maned lion head and a horned cow head)
// and present BOTH given equations stacked, plus the question row ending in "?".
//
// REASONING (header so the step-explainer / animator agree):
//   (Lion + Lion + Cow) - (Lion + Cow) = 25 - 14 = 11  ->  Lion = 11
//   Lion + Cow = 14  ->  Cow = 14 - 11 = 3
//   Lion + Cow + Cow = 11 + 3 + 3 = 17  (option A)
//
// The static figure NEVER writes the values 11, 3, or 17 — it shows only the two
// givens and a "?" for the asked combination. Revealing values is the animator's
// job, via the co-exported AnimalGlyph + EqRow primitives.
//
// Pure render: no Math.random, no Date, no window/document at module top.
// SSR-safe & deterministic.

export const LION_VALUE = 11
export const COW_VALUE = 3
export const Q25_ANSWER = LION_VALUE + COW_VALUE + COW_VALUE // 17

const INK = '#2B2622'
const BLUE = '#30598A' // qupu-brand-blue — numerals / chrome
const ORANGE = '#f0853a' // qupu-brand-orange — the asked total / reveal
const LION_MANE = '#E8913C'
const LION_FACE = '#F6C77A'
const COW_BODY = '#F4A9B8'
const COW_FACE = '#FBE3E8'
const COW_HORN = '#D9C27A'

export type AnimalKey = 'lion' | 'cow'

/** A small maned-lion or horned-cow head glyph, centred in a ~52x52 box at (cx,cy). */
export function AnimalGlyph({ kind, cx, cy, s = 1 }: { kind: AnimalKey; cx: number; cy: number; s?: number }) {
  if (kind === 'lion') {
    // mane = ring of rounded petals, face = circle, two ears, eyes + snout
    const petals = Array.from({ length: 10 }, (_, k) => {
      const a = ((36 * k - 90) * Math.PI) / 180
      const px = cx + 22 * s * Math.cos(a)
      const py = cy + 22 * s * Math.sin(a)
      return <circle key={k} cx={px} cy={py} r={9 * s} fill={LION_MANE} />
    })
    return (
      <g>
        {petals}
        <circle cx={cx} cy={cy} r={20 * s} fill={LION_FACE} stroke={INK} strokeWidth={1.6 * s} />
        {/* ears */}
        <circle cx={cx - 13 * s} cy={cy - 15 * s} r={5 * s} fill={LION_FACE} stroke={INK} strokeWidth={1.4 * s} />
        <circle cx={cx + 13 * s} cy={cy - 15 * s} r={5 * s} fill={LION_FACE} stroke={INK} strokeWidth={1.4 * s} />
        {/* eyes */}
        <circle cx={cx - 7 * s} cy={cy - 3 * s} r={2.6 * s} fill={INK} />
        <circle cx={cx + 7 * s} cy={cy - 3 * s} r={2.6 * s} fill={INK} />
        {/* snout */}
        <ellipse cx={cx} cy={cy + 8 * s} rx={9 * s} ry={6 * s} fill="#FFFFFF" stroke={INK} strokeWidth={1.2 * s} />
        <path d={`M ${cx} ${cy + 4 * s} v ${5 * s}`} stroke={INK} strokeWidth={1.4 * s} strokeLinecap="round" />
        <path
          d={`M ${cx - 5 * s} ${cy + 11 * s} Q ${cx} ${cy + 14 * s} ${cx + 5 * s} ${cy + 11 * s}`}
          fill="none"
          stroke={INK}
          strokeWidth={1.4 * s}
          strokeLinecap="round"
        />
      </g>
    )
  }
  // cow: rounded face, two horns, two ears, muzzle with nostrils, top spot
  return (
    <g>
      {/* horns */}
      <path
        d={`M ${cx - 12 * s} ${cy - 16 * s} q ${-9 * s} ${-3 * s} ${-11 * s} ${4 * s} q ${6 * s} ${1 * s} ${11 * s} ${-1 * s} Z`}
        fill={COW_HORN}
        stroke={INK}
        strokeWidth={1.2 * s}
      />
      <path
        d={`M ${cx + 12 * s} ${cy - 16 * s} q ${9 * s} ${-3 * s} ${11 * s} ${4 * s} q ${-6 * s} ${1 * s} ${-11 * s} ${-1 * s} Z`}
        fill={COW_HORN}
        stroke={INK}
        strokeWidth={1.2 * s}
      />
      {/* ears */}
      <ellipse cx={cx - 20 * s} cy={cy - 6 * s} rx={7 * s} ry={4.5 * s} fill={COW_BODY} stroke={INK} strokeWidth={1.2 * s} transform={`rotate(-25 ${cx - 20 * s} ${cy - 6 * s})`} />
      <ellipse cx={cx + 20 * s} cy={cy - 6 * s} rx={7 * s} ry={4.5 * s} fill={COW_BODY} stroke={INK} strokeWidth={1.2 * s} transform={`rotate(25 ${cx + 20 * s} ${cy - 6 * s})`} />
      {/* face */}
      <circle cx={cx} cy={cy} r={20 * s} fill={COW_FACE} stroke={INK} strokeWidth={1.6 * s} />
      {/* top spot */}
      <ellipse cx={cx - 5 * s} cy={cy - 11 * s} rx={6 * s} ry={4 * s} fill={COW_BODY} />
      {/* eyes */}
      <circle cx={cx - 7 * s} cy={cy - 3 * s} r={2.6 * s} fill={INK} />
      <circle cx={cx + 7 * s} cy={cy - 3 * s} r={2.6 * s} fill={INK} />
      {/* muzzle */}
      <ellipse cx={cx} cy={cy + 9 * s} rx={11 * s} ry={7 * s} fill={COW_BODY} stroke={INK} strokeWidth={1.2 * s} />
      <circle cx={cx - 4 * s} cy={cy + 9 * s} r={1.8 * s} fill={INK} />
      <circle cx={cx + 4 * s} cy={cy + 9 * s} r={1.8 * s} fill={INK} />
    </g>
  )
}

const SLOT = 56 // horizontal slot width per token in an equation row
const ROW_H = 64

/** One equation row token: an animal, a "+"/"=" operator, or a numeral/"?". */
export type Token =
  | { t: 'animal'; kind: AnimalKey }
  | { t: 'op'; op: '+' | '=' }
  | { t: 'num'; value: number | '?'; accent?: boolean }

/**
 * Render a single equation as a horizontal SVG row. Deterministic; lays each
 * token in a fixed-width slot so equations stack in neat columns.
 */
export function EqRow({ tokens, width }: { tokens: Token[]; width: number }) {
  const totalW = tokens.length * SLOT
  const x0 = (width - totalW) / 2 + SLOT / 2
  const cy = ROW_H / 2
  return (
    <g>
      {tokens.map((tok, i) => {
        const cx = x0 + i * SLOT
        if (tok.t === 'animal') return <AnimalGlyph key={i} kind={tok.kind} cx={cx} cy={cy} s={0.82} />
        if (tok.t === 'op')
          return (
            <text
              key={i}
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={28}
              fontWeight={900}
              fill={INK}
            >
              {tok.op}
            </text>
          )
        return (
          <text
            key={i}
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={30}
            fontWeight={900}
            fill={tok.accent ? ORANGE : BLUE}
            className="font-display"
          >
            {tok.value}
          </text>
        )
      })}
    </g>
  )
}

export interface P25G1Q25DiagramProps {
  /** Reveal the asked total (17) in the bottom row instead of "?". */
  revealAnswer?: boolean
}

const PAD_Y = 12

/** The three stacked rows: two givens + the asked combination. */
export function P25G1Q25Diagram({ revealAnswer = false }: P25G1Q25DiagramProps = {}) {
  const lion: Token = { t: 'animal', kind: 'lion' }
  const cow: Token = { t: 'animal', kind: 'cow' }
  const plus: Token = { t: 'op', op: '+' }
  const eq: Token = { t: 'op', op: '=' }

  const rows: Token[][] = [
    [lion, plus, cow, eq, { t: 'num', value: 14 }], // Lion + Cow = 14
    [lion, plus, lion, plus, cow, eq, { t: 'num', value: 25 }], // Lion + Lion + Cow = 25
    [lion, plus, cow, plus, cow, eq, { t: 'num', value: revealAnswer ? Q25_ANSWER : '?', accent: true }],
  ]
  const maxTokens = Math.max(...rows.map((r) => r.length))
  const width = maxTokens * SLOT
  const H = PAD_Y * 2 + rows.length * ROW_H + (rows.length - 1) * 10

  return (
    <svg
      viewBox={`0 0 ${width} ${H}`}
      width="100%"
      style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {rows.map((tokens, r) => (
        <g key={r} transform={`translate(0 ${PAD_Y + r * (ROW_H + 10)})`}>
          {/* faint guide under the asked row */}
          {r === 2 && (
            <rect x={width * 0.06} y={2} width={width * 0.88} height={ROW_H - 4} rx={12} fill="#FFF4EA" stroke={ORANGE} strokeWidth={1.6} />
          )}
          <EqRow tokens={tokens} width={width} />
        </g>
      ))}
    </svg>
  )
}

export default function P25G1Q25Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Dua persamaan: Singa tambah Sapi sama dengan 14, dan Singa tambah Singa tambah Sapi sama dengan 25. Pertanyaannya: Singa tambah Sapi tambah Sapi sama dengan berapa?"
    >
      <P25G1Q25Diagram />
    </div>
  )
}
