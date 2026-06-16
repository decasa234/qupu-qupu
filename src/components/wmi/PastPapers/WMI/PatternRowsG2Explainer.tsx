import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'

// WMI-20F2A-Q14 — growing pattern rows (3→8 cells).
// Rule: end cells = orange circle (#E8965A), interior cells = purple square (#C5BCE0).
// ♥ is the 5th cell of the 6-cell row (interior → square).
// ♠ is the 2nd cell of the 7-cell row (interior → square).
// Answer: A — both square.

const ORANGE = '#E8965A'
const PURPLE = '#C5BCE0'
const INK = '#1F2937'
const GREEN = '#10B981'
const BLUE = '#30598A'

// Row lengths in the figure
const ROW_LENGTHS = [3, 4, 5, 6, 7, 8]

// Which rows are "known" (fully drawn) in the static figure: rows 0,1,5 (indices)
// Rows 2,3,4 are blank with marks
const KNOWN_ROWS = new Set([0, 1, 5])

// Beat IDs for clarity
type BeatId =
  | 'intro'      // row lengths grow by 1
  | 'rule'       // ends = circle, interior = square (highlight on 4-cell row)
  | 'heart'      // find ♥: 5th cell of 6-cell row → interior → square
  | 'spade'      // find ♠: 2nd cell of 7-cell row → interior → square
  | 'answer'     // both square → A

interface Beat {
  id: BeatId
  hold: number
  result: boolean
  caption: string
}

function buildSteps(lang: 'en' | 'id'): Beat[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      id: 'intro',
      hold: 2400,
      result: false,
      caption: t(
        'Each row is 1 cell longer than the row above it.',
        'Setiap baris 1 kotak lebih panjang dari baris di atasnya.',
      ),
    },
    {
      id: 'rule',
      hold: 2600,
      result: false,
      caption: t(
        'The RULE: the two end cells are orange circles. Every inside cell is a purple square.',
        'ATURAN: dua sel ujung adalah lingkaran oranye. Semua sel tengah adalah kotak ungu.',
      ),
    },
    {
      id: 'heart',
      hold: 2600,
      result: false,
      caption: t(
        '♥ is cell 5 in the 6-cell row. It is NOT an end cell → it is a SQUARE.',
        '♥ adalah sel ke-5 di baris 6 sel. Bukan ujung → berarti KOTAK.',
      ),
    },
    {
      id: 'spade',
      hold: 2600,
      result: false,
      caption: t(
        '♠ is cell 2 in the 7-cell row. It is NOT an end cell → it is a SQUARE.',
        '♠ adalah sel ke-2 di baris 7 sel. Bukan ujung → berarti KOTAK.',
      ),
    },
    {
      id: 'answer',
      hold: 0,
      result: true,
      caption: t(
        '♠ = square and ♥ = square → Answer A.',
        '♠ = kotak dan ♥ = kotak → Jawaban A.',
      ),
    },
  ]
}

// Draw a single cell at (x, y) in a row of length `rowLen` at position `col` (0-based).
// `reveal`: if true, show the solved shape; if false, show blank with optional mark.
// `highlight`: ring the cell with a glow border.
function Cell({
  x,
  y,
  col,
  rowLen,
  reveal,
  mark,
  highlight,
}: {
  x: number
  y: number
  col: number
  rowLen: number
  reveal: boolean
  mark?: '♥' | '♠' | null
  highlight?: boolean
}) {
  const isEnd = col === 0 || col === rowLen - 1
  const CELL = 34

  if (reveal) {
    if (isEnd) {
      return (
        <>
          {highlight && <circle cx={x + CELL / 2} cy={y + CELL / 2} r={CELL / 2 + 3} fill="none" stroke="#FBBF24" strokeWidth={3} />}
          <circle cx={x + CELL / 2} cy={y + CELL / 2} r={14} fill={ORANGE} />
        </>
      )
    }
    return (
      <>
        {highlight && <rect x={x - 2} y={y - 2} width={CELL + 4} height={CELL + 4} rx={5} fill="none" stroke="#FBBF24" strokeWidth={3} />}
        <rect x={x + 2} y={y + 2} width={CELL - 4} height={CELL - 4} fill={PURPLE} />
      </>
    )
  }

  // Blank cell (unknown rows in the original figure)
  return (
    <>
      {highlight && <rect x={x - 2} y={y - 2} width={CELL + 4} height={CELL + 4} rx={5} fill="none" stroke="#FBBF24" strokeWidth={3} />}
      <rect x={x + 1} y={y + 1} width={CELL - 2} height={CELL - 2} fill="white" stroke={INK} strokeWidth={1.6} />
      {mark && (
        <text
          x={x + CELL / 2}
          y={y + CELL / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={17}
          fill={mark === '♥' ? '#D7263D' : INK}
        >
          {mark}
        </text>
      )}
    </>
  )
}

export default function PatternRowsG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => buildSteps(lang), [lang])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const CELL = 34
  const GAP = 2
  const LEFT = 12
  const TOP = 8

  // Which rows should be fully revealed on this beat
  // intro: only known rows (0,1,5)
  // rule: known rows + highlight ends on row 1 (4-cell, index 1)
  // heart: known rows + reveal row 3 (6-cell, index 3) heart cell only
  // spade: known + reveal row 3 + row 4 (7-cell) spade cell
  // answer: all rows revealed

  return (
    <div
      className="mx-auto w-full max-w-[420px]"
      role="img"
      aria-label={t(
        'Pattern rows: end cells are circles, interior cells are squares. Both ♥ and ♠ are squares — answer A.',
        'Baris pola: sel ujung adalah lingkaran, sel tengah adalah kotak. ♥ dan ♠ keduanya kotak — jawaban A.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox="0 0 320 236"
          width="100%"
          style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={320} height={236} rx={10} fill="#F8F4F0" />

          {ROW_LENGTHS.map((rowLen, r) => {
            const y = TOP + r * (CELL + GAP + 2)
            return (
              <g key={r}>
                {Array.from({ length: rowLen }, (_, c) => {
                  const x = LEFT + c * (CELL + GAP)

                  // Decide if this cell is "revealed" (shows its shape) or blank
                  const isKnown = KNOWN_ROWS.has(r)

                  // What mark does this cell carry?
                  const mark: '♥' | '♠' | null =
                    r === 3 && c === 4 ? '♥' : r === 4 && c === 1 ? '♠' : null

                  let reveal = isKnown

                  // On 'heart' beat: reveal row 3 (6-cell) fully
                  if (beat.id === 'heart' && r === 3) reveal = true
                  // On 'spade' beat: reveal rows 3 and 4
                  if (beat.id === 'spade' && (r === 3 || r === 4)) reveal = true
                  // On 'answer' beat: reveal all rows
                  if (beat.id === 'answer') reveal = true

                  // Highlight logic
                  // 'rule' beat: highlight end cells of row 1 (4-cell row)
                  let highlight = false
                  if (beat.id === 'rule' && r === 1 && (c === 0 || c === rowLen - 1)) highlight = true
                  // 'heart' beat: highlight the ♥ cell (row 3, col 4)
                  if (beat.id === 'heart' && r === 3 && c === 4) highlight = true
                  // 'spade' beat: highlight the ♠ cell (row 4, col 1)
                  if (beat.id === 'spade' && r === 4 && c === 1) highlight = true
                  // 'answer' beat: highlight both marked cells
                  if (beat.id === 'answer' && ((r === 3 && c === 4) || (r === 4 && c === 1))) highlight = true

                  return (
                    <Cell
                      key={c}
                      x={x}
                      y={y}
                      col={c}
                      rowLen={rowLen}
                      reveal={reveal}
                      mark={reveal ? null : mark}
                      highlight={highlight}
                    />
                  )
                })}

                {/* Row length label on right side — only on 'intro' beat */}
                {beat.id === 'intro' && (
                  <text
                    x={LEFT + rowLen * (CELL + GAP) + 4}
                    y={y + CELL / 2}
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight={700}
                    fill="#6B7280"
                  >
                    {rowLen}
                  </text>
                )}
              </g>
            )
          })}

          {/* On 'rule' beat: annotate the 4-cell row ends */}
          {beat.id === 'rule' && (
            <>
              <text x={LEFT + 0 * (CELL + GAP) + CELL / 2} y={TOP + 1 * (CELL + GAP + 2) + CELL + 12} textAnchor="middle" fontSize={10} fontWeight={800} fill={ORANGE}>
                {t('circle', 'lingkaran')}
              </text>
              <text x={LEFT + 3 * (CELL + GAP) + CELL / 2} y={TOP + 1 * (CELL + GAP + 2) + CELL + 12} textAnchor="middle" fontSize={10} fontWeight={800} fill={ORANGE}>
                {t('circle', 'lingkaran')}
              </text>
              <text x={LEFT + 1 * (CELL + GAP) + CELL / 2 + 18} y={TOP + 1 * (CELL + GAP + 2) + CELL / 2} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={800} fill={PURPLE}>
                {t('squares', 'kotak')}
              </text>
            </>
          )}

          {/* On 'heart' beat: position label for ♥ */}
          {beat.id === 'heart' && (
            <text
              x={LEFT + 4 * (CELL + GAP) + CELL / 2}
              y={TOP + 3 * (CELL + GAP + 2) + CELL + 13}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fill="#D7263D"
            >
              {t('cell 5 → inside', 'sel 5 → dalam')}
            </text>
          )}

          {/* On 'spade' beat: position label for ♠ */}
          {beat.id === 'spade' && (
            <text
              x={LEFT + 1 * (CELL + GAP) + CELL / 2}
              y={TOP + 4 * (CELL + GAP + 2) + CELL + 13}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fill={INK}
            >
              {t('cell 2 → inside', 'sel 2 → dalam')}
            </text>
          )}

          {/* On 'answer' beat: badge */}
          {beat.id === 'answer' && (
            <>
              <rect x={200} y={180} width={108} height={44} rx={10} fill="#D1FAE5" stroke={GREEN} strokeWidth={2.2} />
              <text x={254} y={196} textAnchor="middle" fontSize={11} fontWeight={900} fill="#065F46">
                ♥ = {t('square', 'kotak')}
              </text>
              <text x={254} y={213} textAnchor="middle" fontSize={11} fontWeight={900} fill="#065F46">
                ♠ = {t('square', 'kotak')}
              </text>
            </>
          )}
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
