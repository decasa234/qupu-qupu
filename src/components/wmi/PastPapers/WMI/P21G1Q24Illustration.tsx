// WMI-21P1A-Q24 (2021 WMI Semifinal Grade 1 Paper A, question 24).
//
// Recovered from db/seed/wmi/figures/2021-semifinal-g1-a-q24.jpg:
//   🦛 + 🦁 + 🦁 + 🦁 + 🐨 = 51
// The stem text also gives a second fact: 🦛 + 🦁 = 20.
// Each animal stands for a number; find the value of the hippo.
//   Lion = 8, Koala = 15, Hippo = 12  →  answer C (12).
//
// The static figure draws ONLY the two given equations (the problem). It never
// reveals any animal's value — that is the explainer's job, via the co-exported
// AnimalEquationRow primitive.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic.

export const HIPPO = '🦛'
export const LION = '🦁'
export const KOALA = '🐨'

// Verified values (used by the explainer, not shown in the static figure).
export const PAIR_TOTAL = 20 // 🦛 + 🦁
export const LONG_TOTAL = 51 // 🦛 + 🦁 + 🦁 + 🦁 + 🐨
export const LION_VALUE = 8
export const KOALA_VALUE = 15
export const HIPPO_VALUE = 12 // answer C

const INK = '#2B2622'
const EQ = '#30598a' // qupu brand blue for the "=" and totals

export const ROW_VIEW_W = 460
export const ROW_VIEW_H = 70

/** One token in an equation row: an animal glyph, a "+", or a number/equals. */
export type Token =
  | { kind: 'animal'; glyph: string }
  | { kind: 'plus' }
  | { kind: 'equals' }
  | { kind: 'num'; text: string }

/**
 * Renders a single equation row of tokens, centered, with even spacing.
 * `highlightPair` draws a soft box around the first `🦛 + 🦁` so the explainer
 * can point at the swap; `revealValues` (optional) prints small value chips under
 * each animal glyph. By itself (no overrides) it shows only the bare equation.
 */
export function AnimalEquationRow({
  tokens,
  highlightFirstThree = false,
  valueChips = null,
}: {
  tokens: Token[]
  /** Outline the first three tokens (🦛 + 🦁) — the pair worth 20. */
  highlightFirstThree?: boolean
  /** Optional per-animal value chip text, keyed by token index. */
  valueChips?: Record<number, string> | null
}) {
  const SLOT = 44
  const startX = (ROW_VIEW_W - tokens.length * SLOT) / 2 + SLOT / 2
  const cy = 30

  // x-range of the first three tokens, for the highlight box.
  const hx0 = startX - SLOT / 2
  const hw = 3 * SLOT

  return (
    <svg
      viewBox={`0 0 ${ROW_VIEW_W} ${ROW_VIEW_H}`}
      width="100%"
      style={{ maxWidth: ROW_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {highlightFirstThree && (
        <rect
          x={hx0 + 4}
          y={6}
          width={hw - 8}
          height={48}
          rx={8}
          fill="rgba(48,89,138,0.10)"
          stroke={EQ}
          strokeWidth={2.5}
        />
      )}

      {tokens.map((tok, i) => {
        const x = startX + i * SLOT
        if (tok.kind === 'animal') {
          return (
            <g key={i}>
              <text x={x} y={cy} fontSize={30} textAnchor="middle" dominantBaseline="central">
                {tok.glyph}
              </text>
              {valueChips && valueChips[i] != null && (
                <g>
                  <rect x={x - 13} y={cy + 18} width={26} height={20} rx={6} fill="#E1EFFB" stroke={EQ} strokeWidth={1.5} />
                  <text x={x} y={cy + 28} fontSize={13} fontWeight={900} textAnchor="middle" dominantBaseline="central" fill={EQ}>
                    {valueChips[i]}
                  </text>
                </g>
              )}
            </g>
          )
        }
        if (tok.kind === 'plus') {
          return (
            <text key={i} x={x} y={cy} fontSize={24} fontWeight={800} textAnchor="middle" dominantBaseline="central" fill={INK}>
              +
            </text>
          )
        }
        if (tok.kind === 'equals') {
          return (
            <text key={i} x={x} y={cy} fontSize={24} fontWeight={800} textAnchor="middle" dominantBaseline="central" fill={EQ}>
              =
            </text>
          )
        }
        return (
          <text key={i} x={x} y={cy} fontSize={26} fontWeight={900} textAnchor="middle" dominantBaseline="central" fill={EQ}>
            {tok.text}
          </text>
        )
      })}
    </svg>
  )
}

/** The long equation tokens: 🦛 + 🦁 + 🦁 + 🦁 + 🐨 = 51. */
export const LONG_ROW: Token[] = [
  { kind: 'animal', glyph: HIPPO },
  { kind: 'plus' },
  { kind: 'animal', glyph: LION },
  { kind: 'plus' },
  { kind: 'animal', glyph: LION },
  { kind: 'plus' },
  { kind: 'animal', glyph: LION },
  { kind: 'plus' },
  { kind: 'animal', glyph: KOALA },
  { kind: 'equals' },
  { kind: 'num', text: String(LONG_TOTAL) },
]

/** The pair equation tokens: 🦛 + 🦁 = 20. */
export const PAIR_ROW: Token[] = [
  { kind: 'animal', glyph: HIPPO },
  { kind: 'plus' },
  { kind: 'animal', glyph: LION },
  { kind: 'equals' },
  { kind: 'num', text: String(PAIR_TOTAL) },
]

export default function P21G1Q24Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Two animal equations. Hippo plus lion equals 20. Hippo plus lion plus lion plus lion plus koala equals 51. Each animal stands for a number; find the hippo."
    >
      <div className="flex flex-col items-center gap-2">
        <AnimalEquationRow tokens={PAIR_ROW} />
        <AnimalEquationRow tokens={LONG_ROW} />
      </div>
    </div>
  )
}
