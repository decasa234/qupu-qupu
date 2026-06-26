// OSN 2025 SD Kabupaten Q13 — three adjacent square parks, top-aligned staircase.
// Source figure: docs/reference/ocr-res/osn/kabupaten/sd/2025.imgs/007.jpg
// Taman 1 (dark green, 5 units), Taman 2 (medium green, 4 units), Taman 3 (light green, 3 units).
// All tops aligned; the bottoms form a descending staircase left-to-right.
// Explainer phases: plain → side1 (reveal Taman 1 = 10 m) → sided (all sides) → perimeter.

import type { ParkPhase } from './parkSquaresOSN25KQ13Steps'

// ── Layout (15 px per ratio unit) ────────────────────────────────────────────
const U  = 15   // px per ratio unit
const PL = 18   // padding left
const PT = 24   // padding top (room for side labels)
const PR = 18   // padding right
const PB = 16   // padding bottom

const AX = PL,          AY = PT, AW = 5 * U, AH = 5 * U  // Taman 1: 75×75
const BX = PL + 5 * U,  BY = PT, BW = 4 * U, BH = 4 * U  // Taman 2: 60×60
const CX = PL + 9 * U,  CY = PT, CW = 3 * U, CH = 3 * U  // Taman 3: 45×45

const VBW = PL + 12 * U + PR  // 216
const VBH = PT + 5 * U + PB   // 115

// Clockwise outer perimeter polygon (start = top-left of Taman 1)
const PERI_PTS = [
  `${AX},${AY}`,
  `${CX + CW},${AY}`,
  `${CX + CW},${CY + CH}`,
  `${CX},${CY + CH}`,
  `${CX},${BY + BH}`,
  `${BX},${BY + BH}`,
  `${BX},${AY + AH}`,
  `${AX},${AY + AH}`,
].join(' ')

export interface ParkSquaresFigureProps {
  phase?: ParkPhase
  lang?: 'en' | 'id'
}

/** Shared SVG figure — used by both the illustration and the explainer. */
export function ParkSquaresFigure({ phase = 'plain', lang = 'id' }: ParkSquaresFigureProps) {
  const showSide1    = phase === 'side1' || phase === 'sided' || phase === 'perimeter'
  const showAllSides = phase === 'sided' || phase === 'perimeter'
  const showPeri     = phase === 'perimeter'

  const n1 = lang === 'id' ? 'Taman 1' : 'Park 1'
  const n2 = lang === 'id' ? 'Taman 2' : 'Park 2'
  const n3 = lang === 'id' ? 'Taman 3' : 'Park 3'

  return (
    <svg
      viewBox={`0 0 ${VBW} ${VBH}`}
      width="100%"
      style={{ maxWidth: 270, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── Three squares ─────────────────────────────────────────────── */}
      <rect x={AX} y={AY} width={AW} height={AH} fill="#2D6A4F" rx={3} />
      <rect x={BX} y={BY} width={BW} height={BH} fill="#52B788" rx={3} />
      <rect x={CX} y={CY} width={CW} height={CH} fill="#95D5B2" rx={3} />

      {/* ── Labels inside squares ─────────────────────────────────────── */}
      <text
        x={AX + AW / 2} y={AY + AH / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={700} fill="white"
      >{n1}</text>
      <text
        x={BX + BW / 2} y={BY + BH / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={10} fontWeight={700} fill="#1B4332"
      >{n2}</text>
      <text
        x={CX + CW / 2} y={CY + CH / 2}
        textAnchor="middle" dominantBaseline="central"
        fontSize={9} fontWeight={700} fill="#1B4332"
      >{n3}</text>

      {/* ── Side-1 label: 10 m above Taman 1 ─────────────────────────── */}
      {showSide1 && (
        <text
          x={AX + AW / 2} y={AY - 7}
          textAnchor="middle" fontSize={9} fontWeight={700} fill="#1B4332"
        >10 m</text>
      )}

      {/* ── Remaining side labels ──────────────────────────────────────── */}
      {showAllSides && (
        <>
          <text
            x={BX + BW / 2} y={BY - 7}
            textAnchor="middle" fontSize={9} fontWeight={700} fill="#1B4332"
          >8 m</text>
          <text
            x={CX + CW / 2} y={CY - 7}
            textAnchor="middle" fontSize={9} fontWeight={700} fill="#1B4332"
          >6 m</text>
        </>
      )}

      {/* ── Outer perimeter highlight ──────────────────────────────────── */}
      {showPeri && (
        <polygon
          points={PERI_PTS}
          fill="none"
          stroke="#EF4444"
          strokeWidth={3}
          strokeLinejoin="round"
          opacity={0.85}
        />
      )}
    </svg>
  )
}

/** Stem illustration — shows the problem only, no dimensions. */
export default function ParkSquaresOSN25KQ13Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Tiga taman berbentuk persegi berimpitan (Taman 1, Taman 2, Taman 3) dijajarkan dari kiri ke kanan, sejajar di bagian atas, dengan sisi dalam rasio 5:4:3."
    >
      <ParkSquaresFigure phase="plain" lang="id" />
    </div>
  )
}
