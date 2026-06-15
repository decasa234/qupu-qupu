// WMI-23F1A-Q24 (2023 Grade 1 Final, Paper B) — pattern-building rules.
//
// Reconstructed from the scan
//   wmiPastPaper/WMI 2023 Final Grade 01 Paper B Question/images/
//     edb2074bbe54ebdbe65414497f4be5d1dd8ae38157bf75ac0b08836362e910e3.jpg
// which shows five labelled patterns (A)–(E), each a horizontal row of simple
// figures built from at most three kinds of shape. The original scan used a
// plane / hot-air-balloon / tulip icon set; we map those one-to-one onto a clean
// monochrome glyph set, identical everywhere:
//
//   plane   → circle   ○   ('circle')
//   balloon → square   □   ('square')
//   flower  → triangle △   ('triangle')
//
// RECOVERED SEQUENCES (left → right, P=plane/○, B=balloon/□, F=flower/△):
//   (A)  P B P        → ○ □ ○
//   (B)  B F F B      → □ △ △ □
//   (C)  P P P        → ○ ○ ○
//   (D)  F F P F F F  → △ △ ○ △ △ △
//   (E)  F P B B P F  → △ ○ □ □ ○ △
//
// RULE MODEL (the question's two steps):
//   Step 1 (once, first): draw ONE figure 1 or 2 times → a CENTRE of one or two
//     IDENTICAL figures.
//   Step 2 (repeatable): draw a figure once at the FAR LEFT and the SAME figure
//     once at the FAR RIGHT. Each application wraps a matching pair onto both ends.
//   ⇒ A valid pattern is a PALINDROME that grows symmetrically from a 1- or
//     2-figure identical centre, using at most 3 kinds of figures.
//
// SOLVER — peel matching end-pairs until a 1- or 2-figure centre remains; the
// centre's figures must be identical, and ≤3 kinds overall (throwaway tsx, now
// deleted; reasoning preserved here and verified by isValidPattern below):
//   (A) ○ □ ○      peel ○…○ → centre □ (1 fig). kinds {○,□}=2.            PASS ✓
//   (B) □ △ △ □    peel □…□ → centre △△ (2 identical). kinds {□,△}=2.     PASS ✓
//   (C) ○ ○ ○      peel ○…○ → centre ○ (1 fig). kinds {○}=1.             PASS ✓
//   (D) △△○△△△    peel △…△ → △○△△; peel △…△ → centre ○△ — NOT identical
//                  (and the whole row isn't a palindrome).                FAIL ✗
//   (E) △○□□○△    peel △…△ → ○□□○; peel ○…○ → centre □□ (2 identical).
//                  kinds {△,○,□}=3 ≤ 3.                                   PASS ✓
//   ⇒ exactly A, B, C, E are valid; D is not.  ANSWER = ABCE.
//
// The static figure draws ONLY the five labelled rows as recovered — no ✓/✗,
// no answer. The animator marks one row per beat via the co-exported
// PatternRules23G1 primitive (litRow / verdicts), both defaulting off.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic. qupu-* tokens
// in the figure chrome; the monochrome glyph ink is a raw hex (allowed here).

// Monochrome ink for the figure glyphs (single clean shape set).
const INK = '#2B2622'
const PASS = '#3F9A6A' // animator-only ✓ ring
const FAIL = '#D6483B' // animator-only ✗ ring

/** One symbol in a pattern row. */
export type Glyph = 'circle' | 'square' | 'triangle'

/** The five recovered patterns, left → right. */
export const PATTERNS: Record<string, readonly Glyph[]> = {
  A: ['circle', 'square', 'circle'],
  B: ['square', 'triangle', 'triangle', 'square'],
  C: ['circle', 'circle', 'circle'],
  D: ['triangle', 'triangle', 'circle', 'triangle', 'triangle', 'triangle'],
  E: ['triangle', 'circle', 'square', 'square', 'circle', 'triangle'],
}

/** Stable row order for rendering. */
export const ROW_KEYS = ['A', 'B', 'C', 'D', 'E'] as const
export type RowKey = (typeof ROW_KEYS)[number]

/**
 * Does a sequence obey the build rules? Peel matching end-pairs until ≤2 figures
 * remain; that centre must be a single figure, or two IDENTICAL figures. (Also
 * caps the kinds at three.) This is the literal rule check, not a lookup — it
 * confirms A,B,C,E pass and D fails for the recovered sequences above.
 */
export function isValidPattern(seq: readonly Glyph[]): boolean {
  if (new Set(seq).size > 3) return false
  let lo = 0
  let hi = seq.length - 1
  while (hi - lo + 1 > 2) {
    if (seq[lo] !== seq[hi]) return false // ends must match to be a Step-2 wrap
    lo++
    hi--
  }
  // remaining centre is seq[lo..hi]: 1 figure (lo===hi) is fine; 2 figures must match.
  if (lo === hi) return true
  return seq[lo] === seq[hi]
}

// ---- layout ----------------------------------------------------------------
const PAD_X = 10
const PAD_TOP = 10
const PAD_BOTTOM = 10
const LABEL_W = 34 // room for "(A)" etc.
const SLOT = 34 // horizontal pitch per glyph
const GLYPH = 22 // nominal glyph box
const ROW_H = 38 // vertical pitch per pattern row
const ROW_GAP = 8

const MAX_LEN = Math.max(...ROW_KEYS.map((k) => PATTERNS[k].length)) // 6

// --- glyph paths (all centred on (cx, cy), identical everywhere) -------------

/** Up-pointing triangle centred at (cx, cy). */
function trianglePoints(cx: number, cy: number, s: number): string {
  const h = (s * Math.sqrt(3)) / 2
  const top = `${cx},${(cy - h / 2).toFixed(2)}`
  const left = `${(cx - s / 2).toFixed(2)},${(cy + h / 2).toFixed(2)}`
  const right = `${(cx + s / 2).toFixed(2)},${(cy + h / 2).toFixed(2)}`
  return `${top} ${left} ${right}`
}

/** Draw one glyph centred at (cx, cy). Identical rendering at every position. */
function GlyphMark({ g, cx, cy }: { g: Glyph; cx: number; cy: number }) {
  const r = GLYPH / 2
  const sq = GLYPH * 0.86
  const triS = GLYPH * 1.04
  switch (g) {
    case 'circle':
      return <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={2.4} />
    case 'square':
      return (
        <rect
          x={cx - sq / 2}
          y={cy - sq / 2}
          width={sq}
          height={sq}
          fill="none"
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
      )
    case 'triangle':
      return (
        <polygon
          points={trianglePoints(cx, cy, triS)}
          fill="none"
          stroke={INK}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
      )
  }
}

export interface PatternRules23G1Props {
  /**
   * Animator only — highlight exactly ONE row (its label, e.g. 'A') as the one
   * currently under test. Null/undefined ⇒ no highlight (the static default).
   */
  litRow?: string | null
  /**
   * Animator only — per-row verdict to draw as a ✓ (true) / ✗ (false) badge at
   * the row's right edge. Omit a key ⇒ no badge for that row. Empty/undefined ⇒
   * no badges at all (the static figure default reveals no answer).
   */
  verdicts?: Record<string, boolean>
}

/**
 * Bare five-row figure primitive, with optional post-answer overlays. By itself
 * it reveals nothing about which rows are valid — both overlay props default off.
 */
export function PatternRules23G1({ litRow = null, verdicts }: PatternRules23G1Props = {}) {
  const badges = verdicts ?? {}
  const hasBadges = Object.keys(badges).length > 0

  const stripW = MAX_LEN * SLOT
  // give the right edge headroom for an optional ✓/✗ badge so it never clips
  const badgePad = hasBadges ? 26 : 6
  const viewW = PAD_X + LABEL_W + stripW + badgePad + PAD_X
  const viewH = PAD_TOP + ROW_KEYS.length * (ROW_H + ROW_GAP) - ROW_GAP + PAD_BOTTOM

  const stripX0 = PAD_X + LABEL_W

  return (
    <svg viewBox={`0 0 ${viewW} ${viewH}`} width={Math.min(300, viewW)} aria-hidden="true">
      {ROW_KEYS.map((key, rowIdx) => {
        const seq = PATTERNS[key]
        const rowTop = PAD_TOP + rowIdx * (ROW_H + ROW_GAP)
        const cy = rowTop + ROW_H / 2
        const lit = litRow != null && litRow.toUpperCase() === key
        const verdict = key in badges ? badges[key] : null
        // centre each row's glyphs within the fixed strip width
        const rowW = seq.length * SLOT
        const rowX0 = stripX0 + (stripW - rowW) / 2 + SLOT / 2

        return (
          <g key={key}>
            {lit && (
              <rect
                x={PAD_X - 2}
                y={rowTop - 2}
                width={LABEL_W + stripW + 4}
                height={ROW_H + 4}
                rx={10}
                fill="rgba(240,133,58,0.14)"
                stroke="#f0853a"
                strokeWidth={2}
              />
            )}
            {/* row label (A)–(E) */}
            <text
              x={PAD_X + 2}
              y={cy}
              dominantBaseline="central"
              fontSize={15}
              fontWeight={700}
              className="fill-qupu-brand-blue"
            >
              {`(${key})`}
            </text>
            {/* the row's glyphs, left → right */}
            {seq.map((g, i) => (
              <GlyphMark key={i} g={g} cx={rowX0 + i * SLOT} cy={cy} />
            ))}
            {/* animator-only verdict badge */}
            {verdict != null && (
              <g transform={`translate(${stripX0 + stripW + 12}, ${cy})`}>
                <circle r={10} fill="none" stroke={verdict ? PASS : FAIL} strokeWidth={2.2} />
                {verdict ? (
                  <path d="M-4,0 L-1,3.5 L5,-4" fill="none" stroke={PASS} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M-4,-4 L4,4 M4,-4 L-4,4" fill="none" stroke={FAIL} strokeWidth={2.4} strokeLinecap="round" />
                )}
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Default export: the five bare labelled rows, no verdicts, no answer shown. */
export default function PatternRules23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Lima pola berlabel (A) sampai (E), tiap pola satu baris bangun datar: lingkaran, persegi, atau segitiga. ' +
        '(A) lingkaran, persegi, lingkaran. (B) persegi, segitiga, segitiga, persegi. (C) lingkaran, lingkaran, lingkaran. ' +
        '(D) segitiga, segitiga, lingkaran, segitiga, segitiga, segitiga. (E) segitiga, lingkaran, persegi, persegi, lingkaran, segitiga. ' +
        'Tentukan pola mana yang mengikuti aturan.'
      }
    >
      <PatternRules23G1 />
    </div>
  )
}
