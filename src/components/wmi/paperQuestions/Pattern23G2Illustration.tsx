// In-card illustration for WMI-23F2A-Q24 (2023 Grade-2 Final).
//
// The printed question shows five candidate patterns A–E, each a horizontal
// sequence of small picture-figures (a plane, a hot-air balloon, and a tulip).
// We redraw them in the house monochrome style as three distinct outline glyphs
// so the figure stays clean and SSR-safe (no external images):
//
//   'a' = plane   → circle      (○)
//   'b' = balloon → diamond     (◇)
//   'c' = flower  → triangle    (△)
//
// Read straight from db/seed/wmi/figures/2023-final-g2-a-q24.jpg:
//   (A) plane,  balloon, plane                      → a b a
//   (B) balloon, flower, flower, balloon            → b c c b
//   (C) plane,  plane,  plane                       → a a a
//   (D) flower, flower, plane, flower, flower, flower → c c a c c c
//   (E) flower, plane, balloon, balloon, plane, flower → c a b b a c
//
// The rule: a pattern is buildable by picking a CORE of 1–2 figures ONCE, then
// repeatedly wrapping a same-figure pair on both ends. Such a pattern is exactly
// a palindrome whose innermost 1–2 figures form the core. So A, B, C, E are valid
// palindromes (cores: b / cc / a / bb) and D is NOT a palindrome → invalid.
//
// The static figure NEVER marks which options are valid — that is the animator's
// job after the answer is revealed.

const INK = '#1F2937'

export type PatternToken = 'a' | 'b' | 'c'

// Each option as an ordered array of shape tokens. Co-exported so the explainer
// and the per-option CHOICE renderer bind to the same source of truth.
export const OPTIONS24G2: Record<'A' | 'B' | 'C' | 'D' | 'E', PatternToken[]> = {
  A: ['a', 'b', 'a'],
  B: ['b', 'c', 'c', 'b'],
  C: ['a', 'a', 'a'],
  D: ['c', 'c', 'a', 'c', 'c', 'c'],
  E: ['c', 'a', 'b', 'b', 'a', 'c'],
}

const TOKEN_LABEL_ID: Record<PatternToken, string> = {
  a: 'lingkaran',
  b: 'belah ketupat',
  c: 'segitiga',
}

function tokensAria(tokens: PatternToken[]): string {
  return tokens.map((t) => TOKEN_LABEL_ID[t]).join(', ')
}

// A single outline glyph, centered at (cx, cy) within a box of side ~2*r.
export function PatternGlyph({
  token,
  cx,
  cy,
  r = 13,
  strokeWidth = 2,
}: {
  token: PatternToken
  cx: number
  cy: number
  r?: number
  strokeWidth?: number
}) {
  if (token === 'a') {
    // plane → circle
    return <circle cx={cx} cy={cy} r={r} fill="white" stroke={INK} strokeWidth={strokeWidth} />
  }
  if (token === 'b') {
    // balloon → diamond
    const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`
    return <polygon points={pts} fill="white" stroke={INK} strokeWidth={strokeWidth} strokeLinejoin="round" />
  }
  // flower → upward triangle
  const h = r * 1.15
  const pts = `${cx},${cy - h} ${cx + r},${cy + h * 0.7} ${cx - r},${cy + h * 0.7}`
  return <polygon points={pts} fill="white" stroke={INK} strokeWidth={strokeWidth} strokeLinejoin="round" />
}

// Reusable primitive: one option's horizontal pattern row, drawn as its own SVG.
// Used by the framed figure, the explainer, and the CHOICE renderer.
export function PatternRow23G2({
  tokens,
  r = 13,
  gap = 8,
  pad = 8,
  maxWidth,
}: {
  tokens: PatternToken[]
  r?: number
  gap?: number
  pad?: number
  maxWidth?: number
}) {
  const safe = Array.isArray(tokens) && tokens.length > 0 ? tokens : OPTIONS24G2.A
  const cell = 2 * r
  const w = pad * 2 + safe.length * cell + (safe.length - 1) * gap
  const h = pad * 2 + cell + 4
  const cap = maxWidth ?? Math.min(280, w)
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ maxWidth: cap, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {safe.map((t, i) => (
        <PatternGlyph key={i} token={t} cx={pad + r + i * (cell + gap)} cy={h / 2} r={r} />
      ))}
    </svg>
  )
}

const LABELS: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E']

// The framed five-option figure for the problem card. Two rows: A B C / D E,
// mirroring the scan layout. Never reveals which options are valid.
export function Pattern23G2Illustration() {
  const R = 13
  const GAP = 8
  const cell = 2 * R
  const rowPad = 6
  const labelW = 30
  const rowGap = 26
  // Width is dominated by the longest pattern (D / E, 6 glyphs).
  const longest = 6
  const contentW = labelW + longest * cell + (longest - 1) * GAP
  const W = contentW + rowPad * 2
  const rowH = cell + 12
  const layout: Array<Array<'A' | 'B' | 'C' | 'D' | 'E'>> = [
    ['A', 'B', 'C'],
    ['D', 'E'],
  ]

  const ariaParts = LABELS.map((l) => `${l}: ${tokensAria(OPTIONS24G2[l])}`)

  let yCursor = rowPad
  const lines: Array<{ label: string; tokens: PatternToken[]; y: number }> = []
  for (const group of layout) {
    for (const l of group) {
      lines.push({ label: l, tokens: OPTIONS24G2[l], y: yCursor })
      yCursor += rowH + rowGap
    }
    yCursor += 6
  }
  const H = yCursor - rowGap + rowPad

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label={`Lima pola kandidat dari tiga jenis bentuk (lingkaran, belah ketupat, segitiga). ${ariaParts.join('. ')}.`}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: Math.min(360, W), display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {lines.map(({ label, tokens, y }) => {
          const cy = y + rowH / 2
          return (
            <g key={label}>
              <text
                x={rowPad + 4}
                y={cy}
                textAnchor="start"
                dominantBaseline="central"
                fontSize={16}
                fontWeight={900}
                fill={INK}
                className="font-display"
              >
                {`(${label})`}
              </text>
              {tokens.map((t, i) => (
                <PatternGlyph
                  key={i}
                  token={t}
                  cx={rowPad + labelW + R + i * (cell + GAP)}
                  cy={cy}
                  r={R}
                />
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// CHOICE_RENDERERS-style component: draws ONE option's pattern given its label,
// so the answer chips show the figure instead of a bare letter. Falls back to the
// plain choice text for any unexpected label so previews stay safe.
export function Pattern23G2Option({ choice }: { choice: { label: string; text: string } }) {
  const label = (choice?.label ?? '') as 'A' | 'B' | 'C' | 'D' | 'E'
  const tokens = OPTIONS24G2[label]
  if (!tokens) return <span>{choice?.text}</span>
  const r = 11
  const gap = 7
  const pad = 6
  const cell = 2 * r
  const w = pad * 2 + tokens.length * cell + (tokens.length - 1) * gap
  const h = pad * 2 + cell + 2
  return (
    <span
      role="img"
      aria-label={`Pilihan ${label}: ${tokensAria(tokens)}.`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} width={Math.min(168, w)} style={{ display: 'block' }} aria-hidden="true">
        {tokens.map((t, i) => (
          <PatternGlyph key={i} token={t} cx={pad + r + i * (cell + gap)} cy={h / 2} r={r} strokeWidth={1.8} />
        ))}
      </svg>
    </span>
  )
}

export default Pattern23G2Illustration
