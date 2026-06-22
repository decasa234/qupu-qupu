// IKMC-21-PE-Q2 — "Kangaroo constellation"
//
// Each of the A–E choices IS a picture of a star constellation — no separate
// stem figure. This file provides ONLY the option renderer (Constellation2PEOption)
// used by CHOICE_RENDERERS.
//
// Numbers on each star (from seed choices_en):
//   A: 3, 4, 7, 6  (4 stars, sum=20 but contains 3 — eliminated)
//   B: 5, 8, 7      (3 stars, all >3, sum=20 — ANSWER)
//   C: 3, 7, 2, 5, 8 (5 stars, contains 3 and 2 — eliminated)
//   D: 5, 1, 4, 9   (4 stars, contains 1 — eliminated)
//   E: 9, 2, 9      (3 stars in a row, contains 2 — eliminated)
//
// Layouts faithfully reproduce the source image crops (2021.imgs/002-006.jpg).
// Pure SVG, no raster, no random, no Date — SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Star primitive (5-point, outline style matching source)
// ---------------------------------------------------------------------------

function starPoints(cx: number, cy: number, r: number): string {
  const inner = r * 0.40
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rad = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : inner
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`)
  }
  return pts.join(' ')
}

interface StarProps {
  cx: number
  cy: number
  r: number
  label: number
  filled?: boolean
}

function ConstellationStar({ cx, cy, r, label, filled = false }: StarProps) {
  const fontSize = r * 0.85
  return (
    <g>
      <polygon
        points={starPoints(cx, cy, r)}
        fill={filled ? '#FCD34D' : '#FEF3C7'}
        stroke="#D97706"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <text
        x={cx}
        y={cy + fontSize * 0.38}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
        fill="#92400E"
      >
        {label}
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Constellation data: positions and star numbers per option
// Each layout is normalised to a 90×70 viewBox.
// Positions are based on faithful reconstruction from the image crops.
// ---------------------------------------------------------------------------

interface StarDef {
  cx: number
  cy: number
  r: number
  n: number
}

// Option A: 4 stars — loose Big Dipper-ish scatter (3,4,7,6)
// Image shows: upper-left 3, upper-right 4, lower-middle-left 7, lower-right 6
const STARS_A: StarDef[] = [
  { cx: 20, cy: 22, r: 13, n: 3 },
  { cx: 66, cy: 16, r: 15, n: 4 },
  { cx: 30, cy: 55, r: 14, n: 7 },
  { cx: 68, cy: 56, r: 13, n: 6 },
]

// Option B: 3 stars — close triangular cluster (5,8,7) — ANSWER
// Image shows: left 5, right 8, bottom 7 (tightly grouped)
const STARS_B: StarDef[] = [
  { cx: 22, cy: 24, r: 14, n: 5 },
  { cx: 65, cy: 22, r: 18, n: 8 },
  { cx: 44, cy: 54, r: 15, n: 7 },
]

// Option C: 5 stars — scattered wide (3,7,2,5,8)
// Image shows: upper-left 3, upper-mid 7, lower-left 2, mid 5, right 8
const STARS_C: StarDef[] = [
  { cx: 14, cy: 16, r: 11, n: 3 },
  { cx: 48, cy: 12, r: 13, n: 7 },
  { cx: 12, cy: 50, r: 10, n: 2 },
  { cx: 48, cy: 50, r: 12, n: 5 },
  { cx: 76, cy: 36, r: 14, n: 8 },
]

// Option D: 4 stars — roughly square / kite arrangement (5,1,4,9)
// Image shows: top-left 5, top-right 1, bottom-left 4, bottom-right 9
const STARS_D: StarDef[] = [
  { cx: 20, cy: 18, r: 14, n: 5 },
  { cx: 62, cy: 14, r: 10, n: 1 },
  { cx: 24, cy: 56, r: 12, n: 4 },
  { cx: 66, cy: 54, r: 17, n: 9 },
]

// Option E: 3 stars in a loose diagonal line (9,2,9)
// Image shows: upper-left 9, mid 2, lower-right 9
const STARS_E: StarDef[] = [
  { cx: 16, cy: 18, r: 17, n: 9 },
  { cx: 44, cy: 38, r: 10, n: 2 },
  { cx: 72, cy: 56, r: 17, n: 9 },
]

const OPTION_STARS: Record<string, StarDef[]> = {
  A: STARS_A,
  B: STARS_B,
  C: STARS_C,
  D: STARS_D,
  E: STARS_E,
}

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Constellation A: four stars numbered 3, 4, 7, 6. Sum is 20 but contains 3 (not greater than 3).',
    id: 'Rasi A: empat bintang bernomor 3, 4, 7, 6. Jumlah 20 tapi mengandung 3 (tidak lebih dari 3).',
  },
  B: {
    en: 'Constellation B: three stars numbered 5, 8, 7. All greater than 3 and sum is 20. This is the Kangaroo constellation.',
    id: 'Rasi B: tiga bintang bernomor 5, 8, 7. Semua lebih dari 3 dan jumlah 20. Ini adalah rasi bintang Kanguru.',
  },
  C: {
    en: 'Constellation C: five stars numbered 3, 7, 2, 5, 8. Contains 3 and 2, which are not greater than 3.',
    id: 'Rasi C: lima bintang bernomor 3, 7, 2, 5, 8. Mengandung 3 dan 2, yang tidak lebih dari 3.',
  },
  D: {
    en: 'Constellation D: four stars numbered 5, 1, 4, 9. Contains 1, which is not greater than 3.',
    id: 'Rasi D: empat bintang bernomor 5, 1, 4, 9. Mengandung 1, yang tidak lebih dari 3.',
  },
  E: {
    en: 'Constellation E: three stars numbered 9, 2, 9. Contains 2, which is not greater than 3.',
    id: 'Rasi E: tiga bintang bernomor 9, 2, 9. Mengandung 2, yang tidak lebih dari 3.',
  },
}

// ---------------------------------------------------------------------------
// ConstellationPanel — renders one constellation's stars (with optional line connectors)
// ---------------------------------------------------------------------------

interface ConstellationPanelProps {
  stars: StarDef[]
  /** When true, highlight the answer group (all gold-filled). */
  correct?: boolean
  /** When true, show a subtle red cross-through on invalid stars. */
  showBad?: boolean
  /** Set of star indices that are invalid (number ≤ 3). */
  badIndices?: number[]
  width?: number
  height?: number
}

export function ConstellationPanel({
  stars,
  correct = false,
  showBad = false,
  badIndices = [],
  width = 90,
  height = 70,
}: ConstellationPanelProps) {
  const VB_W = 90
  const VB_H = 70
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={width}
      height={height}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Faint dot-line connectors between stars for "constellation" feel */}
      {stars.length > 1 && stars.map((s, i) => {
        if (i === 0) return null
        const prev = stars[i - 1]
        return (
          <line
            key={`l${i}`}
            x1={prev.cx} y1={prev.cy}
            x2={s.cx} y2={s.cy}
            stroke="#D4A84B"
            strokeWidth={0.8}
            strokeDasharray="3 3"
            opacity={0.5}
          />
        )
      })}

      {/* Stars */}
      {stars.map((s, i) => {
        const isBad = showBad && badIndices.includes(i)
        return (
          <g key={i}>
            <ConstellationStar
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              label={s.n}
              filled={correct && !isBad}
            />
            {isBad && (
              <line
                x1={s.cx - s.r * 0.7} y1={s.cy - s.r * 0.7}
                x2={s.cx + s.r * 0.7} y2={s.cy + s.r * 0.7}
                stroke="#DC2626"
                strokeWidth={2.5}
                strokeLinecap="round"
                opacity={0.8}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Constellation2PEOption — choice renderer for CHOICE_RENDERERS['IKMC-21-PE-Q2']
// ---------------------------------------------------------------------------

/**
 * Constellation2PEOption renders one A/B/C/D/E choice as a star-constellation SVG.
 * Registered in CHOICE_RENDERERS for IKMC-21-PE-Q2.
 */
export function Constellation2PEOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const stars = OPTION_STARS[k]
  const aria = OPTION_ARIA[k]
  if (!stars) return <span>{choice.text}</span>

  const isAnswer = k === 'B'

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <ConstellationPanel
        stars={stars}
        correct={isAnswer}
        width={88}
        height={68}
      />
    </span>
  )
}
