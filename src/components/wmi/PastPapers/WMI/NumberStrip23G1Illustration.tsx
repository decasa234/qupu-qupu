// Static card illustration for WMI-23F1A-Q3 (2023 G1 final).
//
// "In the row of numbers below, A is the second-smallest number, B is the 9th
//  number counting from the left, and C is the number in the middle. Among A, B
//  and C, what is the difference between the largest and the smallest?"
//
// This draws ONLY the setup: a single horizontal strip of 11 number cells in the
// fixed printed order. It never marks A/B/C or reveals the answer (11). The
// animator lights the 2nd-smallest / 9th / middle cells one at a time post-answer
// via the co-exported primitive.
//
// Pure render — no random, no dates, SSR-safe & deterministic.

const INK = '#1F2937'
const BLUE = '#30598A' // qupu-brand-blue
const ORANGE = '#f0853a' // qupu-brand-orange
const GREEN = '#5B8C5A'

/** The eleven numbers in printed left→right order (shared with the explainer). */
export const NUMBERS23 = [8, 11, 14, 9, 16, 18, 20, 7, 12, 19, 5]

/** A→blue, B→orange, C→green so the animator can colour each marked cell. */
const MARK_FILL: Record<'A' | 'B' | 'C', string> = { A: '#E1EFFB', B: '#FDEBDD', C: '#E5F0E4' }
const MARK_STROKE: Record<'A' | 'B' | 'C', string> = { A: BLUE, B: ORANGE, C: GREEN }

type Mark = 'A' | 'B' | 'C'

/**
 * The eleven-cell number strip. `marks` lets the animator highlight individual
 * cells by their 0-based index, each tagged with the label it stands for
 * (A = 2nd-smallest, B = 9th from left, C = middle). With no marks it renders
 * the bare problem strip.
 */
export function NumberStrip23G1({ marks }: { marks?: Array<{ index: number; label: Mark }> } = {}) {
  const safe = Array.isArray(marks) ? marks : []
  const cellW = 34
  const gap = 3
  const padX = 10
  const padTop = 22
  const cellH = 36
  const width = padX * 2 + NUMBERS23.length * cellW + (NUMBERS23.length - 1) * gap
  const height = padTop + cellH + 22

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {NUMBERS23.map((n, i) => {
        const mark = safe.find((m) => m.index === i)
        const x = padX + i * (cellW + gap)
        const cx = x + cellW / 2
        const fill = mark ? MARK_FILL[mark.label] : 'white'
        const stroke = mark ? MARK_STROKE[mark.label] : INK
        return (
          <g key={i}>
            <rect
              x={x}
              y={padTop}
              width={cellW}
              height={cellH}
              rx={6}
              fill={fill}
              stroke={stroke}
              strokeWidth={mark ? 2.6 : 1.6}
            />
            <text
              x={cx}
              y={padTop + cellH / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={15}
              fontWeight={800}
              fill={INK}
              className="font-display"
            >
              {n}
            </text>
            {mark && (
              <text
                x={cx}
                y={padTop - 9}
                textAnchor="middle"
                fontSize={13}
                fontWeight={800}
                fill={MARK_STROKE[mark.label]}
                className="font-display"
              >
                {mark.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Default export — the bare problem strip inside the card (no box). */
export default function NumberStrip23G1Illustration() {
  const ariaList = NUMBERS23.join(', ')
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={`Deretan sebelas bilangan dari kiri ke kanan: ${ariaList}. A adalah bilangan terkecil kedua, B adalah bilangan ke-9 dari kiri, dan C adalah bilangan di tengah.`}
    >
      <NumberStrip23G1 />
    </div>
  )
}
