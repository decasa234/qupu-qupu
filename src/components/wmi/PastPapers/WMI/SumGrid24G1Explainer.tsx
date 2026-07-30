// Post-answer explainer for WMI-24F1A-Q25 (2024 Grade 1 Final) — answer 10.
//
// The figure prints nine column sums under the 3x9 grid:
//     15 17 14 18 13 16 9 16 17
// Each row is a permutation of 1-9, the three numbers stacked in a column are all
// different, and every circle is its column's sum. Those constraints pin exactly
// ONE completion (verified by exhaustive search):
//
//     8 7 3 1 6 9 5 4 2
//     6 2 4 8 3 5 1 7 9
//     1 8 7 9 4 2 3 5 6
//
// so the marked cells are bullet 7, diamond 8, star 5 and bullet + diamond -
// star = 10.
//
// An earlier revision of this explainer ASSERTED a filling and called it "one
// that fits", using the triple (8, 3, 1) — which does not satisfy the printed
// sums at all. This version DEDUCES every cell instead, and only the final beat
// lands the answer. The chain is:
//
//   1. the 5th column has one blank: 13 - 6 - 4 = 3
//   2. the 3rd column has one blank: 14 - 3 - 4 = 7
//   3. the bullet column sums to 17 with an 8 present, so its two blanks make 9
//   4. rows 1 and 2 still need {1,5,7,8} / {2,5,7,8} and no second 8 is allowed
//      in the column, so the only pair making 9 is bullet = 7 over 2
//   5. the 6th column: two blanks making 7, and only 5 over 2 fits the rows
//   6. the smallest circle (9) holds a 1, so its two blanks make 8 with no second
//      1: only 5 over 3 fits
//   7. the diamond column sums to 18 with a 9 at the bottom, so top + diamond = 9;
//      row 1 has only {1,8} left and row 2 only {7,8}, so diamond is 8
//   8. each of rows 1 and 2 has a single blank left
//   9. the star column then reads 4 + 7 + star = 16
//  10. bullet + diamond - star = 7 + 8 - 5 = 10
//
// The grid drawing itself is NOT redrawn here: we render the built SumGrid24G1
// primitive and float a transparent overlay (same viewBox + geometry) that
// spotlights the column under discussion and prints the cells deduced so far.
// The final beat hands the grid back to the primitive's own `solved` state.
//
// Deterministic & SSR-safe: a pure render of the beat list, no random / dates.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  SumGrid24G1,
  GRID,
  // Geometry comes from the illustration, which is the rendering source of
  // truth: this explainer's overlay has to register pixel-for-pixel over the
  // grid it draws. These used to be re-declared here under a "keep in sync"
  // comment that nothing enforced.
  CELL,
  GRID_H,
  CIRCLE_R,
  VIEW_W,
  VIEW_H,
  gx,
  gy,
  circleCx,
  circleCy as CIRCLE_CY,
  type Marker,
} from './SumGrid24G1Illustration'

const CAPTION_BG_NEUTRAL = '#E1EFFB'
const CAPTION_BORDER_NEUTRAL = '#30598A'
const CAPTION_TEXT_NEUTRAL = '#30598A'
const CAPTION_BG_OK = '#D1FAE5'
const CAPTION_BORDER_OK = '#059669'
const CAPTION_TEXT_OK = '#065F46'

const FILLED = '#30598A' // qupu brand blue — cells the deduction pins
const MARK = '#F0853A' // qupu brand orange — the bullet / diamond / star values
const SPOT = '#F0853A' // spotlight on the column under discussion
const CHIP_BG = '#FFF2DF'
const CHIP_INK = '#B4791F'

// ---- the deduction chain ---------------------------------------------------

type Cell = number | null

interface Fill {
  r: number
  c: number
  v: number
}

/** One authored beat: which column it spotlights and which cells it pins. */
interface BeatSpec {
  /** 0-based column to spotlight, or null. */
  focus: number | null
  /** Cells this beat deduces. */
  fills: readonly Fill[]
  /** 1-based rows whose still-missing numbers the beat reasons about. */
  needRows: readonly number[]
  /** Hand the grid back to the primitive's own completed state. */
  solved?: boolean
  /** Winning beat styling. */
  ok?: boolean
  hold: number
  caption: { en: string; id: string }
}

const SPECS: readonly BeatSpec[] = [
  {
    focus: null,
    fills: [],
    needRows: [],
    hold: 3000,
    caption: {
      en: 'Each row uses 1–9 once. The three numbers in one column are all different. Every circle is the sum of the three squares above it.',
      id: 'Tiap baris memakai 1–9 sekali. Tiga bilangan dalam satu kolom semuanya berbeda. Tiap lingkaran adalah jumlah tiga kotak di atasnya.',
    },
  },
  {
    focus: 4,
    fills: [{ r: 1, c: 4, v: 3 }],
    needRows: [],
    hold: 2800,
    caption: {
      en: 'Start where only one square is empty. The 5th column from the left holds 6 and 4, and its circle is 13: 13 − 6 − 4 = 3.',
      id: 'Mulai dari kolom yang cuma satu kotaknya kosong. Kolom ke-5 dari kiri punya 6 dan 4, lingkarannya 13: 13 − 6 − 4 = 3.',
    },
  },
  {
    focus: 2,
    fills: [{ r: 2, c: 2, v: 7 }],
    needRows: [],
    hold: 2600,
    caption: {
      en: 'The 3rd column holds 3 and 4 with circle 14, so its empty square is 14 − 3 − 4 = 7.',
      id: 'Kolom ke-3 punya 3 dan 4 dengan lingkaran 14, jadi kotak kosongnya 14 − 3 − 4 = 7.',
    },
  },
  {
    focus: 1,
    fills: [],
    needRows: [],
    hold: 2800,
    caption: {
      en: 'Now the ● column. Its circle is 17 and an 8 already sits there, so ● and the square under it make 17 − 8 = 9.',
      id: 'Sekarang kolom ●. Lingkarannya 17 dan sudah ada 8, jadi ● dan kotak di bawahnya berjumlah 17 − 8 = 9.',
    },
  },
  {
    focus: 1,
    fills: [
      { r: 0, c: 1, v: 7 },
      { r: 1, c: 1, v: 2 },
    ],
    needRows: [1, 2],
    hold: 3200,
    caption: {
      en: 'This column already has an 8, so neither empty square may be 8. The only pair left that makes 9 is ● = 7 above 2.',
      id: 'Kolom ini sudah punya 8, jadi kedua kotak kosongnya tak boleh 8. Satu-satunya pasangan berjumlah 9 adalah ● = 7 di atas 2.',
    },
  },
  {
    focus: 5,
    fills: [
      { r: 1, c: 5, v: 5 },
      { r: 2, c: 5, v: 2 },
    ],
    needRows: [2, 3],
    hold: 3200,
    caption: {
      en: 'The 6th column has 9 on top and circle 16, so its two empty squares make 16 − 9 = 7. Only 5 above 2 fits what these rows still need.',
      id: 'Kolom ke-6 punya 9 di atas dan lingkaran 16, jadi dua kotak kosongnya berjumlah 16 − 9 = 7. Hanya 5 di atas 2 yang cocok dengan sisa kedua baris ini.',
    },
  },
  {
    focus: 6,
    fills: [
      { r: 0, c: 6, v: 5 },
      { r: 2, c: 6, v: 3 },
    ],
    needRows: [1, 3],
    hold: 3200,
    caption: {
      en: 'The smallest circle is 9. That column already holds 1, so its other two squares must add up to 8, and neither may be 1 again. Only 5 above 3 works.',
      id: 'Lingkaran terkecil adalah 9. Kolom itu sudah punya 1, jadi dua kotak lainnya harus berjumlah 8, dan tak boleh 1 lagi. Hanya 5 di atas 3 yang bisa.',
    },
  },
  {
    focus: 3,
    fills: [
      { r: 0, c: 3, v: 1 },
      { r: 1, c: 3, v: 8 },
    ],
    needRows: [1, 2],
    hold: 3400,
    caption: {
      en: 'The ◆ column has 9 at the bottom and circle 18, so the top square and ◆ make 18 − 9 = 9. Row 1 has only 1 and 8 left, row 2 only 7 and 8, so the top is 1 and ◆ is 8.',
      id: 'Kolom ◆ punya 9 di bawah dan lingkaran 18, jadi kotak atas dan ◆ berjumlah 18 − 9 = 9. Baris 1 tinggal 1 dan 8, baris 2 tinggal 7 dan 8, jadi kotak atas 1 dan ◆ adalah 8.',
    },
  },
  {
    focus: null,
    fills: [
      { r: 0, c: 0, v: 8 },
      { r: 1, c: 7, v: 7 },
    ],
    needRows: [],
    hold: 2600,
    caption: {
      en: 'Row 1 has one square left, so it takes the 8. Row 2 has one left too, so it takes the 7.',
      id: 'Baris 1 tinggal satu kotak, jadi diisi 8. Baris 2 juga tinggal satu, jadi diisi 7.',
    },
  },
  {
    focus: 7,
    fills: [
      { r: 2, c: 7, v: 5 },
      { r: 2, c: 0, v: 1 },
    ],
    needRows: [],
    hold: 3000,
    caption: {
      en: 'The ★ column now reads 4 + 7 + ★ = 16, so ★ is 5. Row 3’s last square takes the 1.',
      id: 'Kolom ★ kini 4 + 7 + ★ = 16, jadi ★ adalah 5. Kotak terakhir baris 3 diisi 1.',
    },
  },
  {
    focus: null,
    fills: [],
    needRows: [],
    solved: true,
    ok: true,
    hold: 0,
    caption: {
      en: '● + ◆ − ★ = 7 + 8 − 5 = 10.',
      id: '● + ◆ − ★ = 7 + 8 − 5 = 10.',
    },
  },
]

export interface SumGridBeat {
  focus: number | null
  /** The grid as it stands at the END of this beat (givens + everything pinned). */
  grid: Cell[][]
  /** 1-based rows the beat reasons about, in display order. */
  needRows: readonly number[]
  /** Per row (1-based), the numbers that row still needed BEFORE this beat's fills. */
  needs: Record<number, number[]>
  /** Marker values pinned so far. */
  markers: Partial<Record<Marker, number>>
  solved: boolean
  ok: boolean
  hold: number
  caption: { en: string; id: string }
}

const ALL_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

/** The printed givens as a mutable grid, blanks and markers left as null. */
function baseGrid(): Cell[][] {
  return GRID.map((row) => row.map((cell) => (typeof cell.given === 'number' ? cell.given : null)))
}

/** Which of 1–9 row `row1` (1-based) is still missing in `grid`. */
function rowNeeds(grid: Cell[][], row1: number): number[] {
  const used = new Set(grid[row1 - 1].filter((v): v is number => v !== null))
  return ALL_DIGITS.filter((v) => !used.has(v))
}

/** True when the base figure leaves this cell empty (no given, no ●/◆/★ glyph). */
function isBlank(r: number, c: number): boolean {
  const cell = GRID[r][c]
  return cell.given === undefined && cell.mark === undefined
}

/**
 * Walks the authored chain, accumulating the pinned cells so every beat carries
 * the full grid state and the row-remainders its caption argues from. Pure.
 */
export function buildSumGrid24G1Beats(): SumGridBeat[] {
  const grid = baseGrid()
  const markers: Partial<Record<Marker, number>> = {}

  return SPECS.map((spec) => {
    // Row remainders are read BEFORE this beat's own fills — that is the state
    // the caption reasons from ("row 1 still needs …, so …").
    const needs: Record<number, number[]> = {}
    for (const row of spec.needRows) needs[row] = rowNeeds(grid, row)

    for (const fill of spec.fills) {
      grid[fill.r][fill.c] = fill.v
      const mark = GRID[fill.r][fill.c].mark
      if (mark) markers[mark] = fill.v
    }

    return {
      focus: spec.focus,
      grid: grid.map((row) => [...row]),
      needRows: spec.needRows,
      needs,
      markers: { ...markers },
      solved: spec.solved ?? false,
      ok: spec.ok ?? false,
      hold: spec.hold,
      caption: spec.caption,
    }
  })
}

const MARKER_GLYPH: Record<Marker, string> = { bullet: '●', diamond: '◆', star: '★' }
const MARKER_ORDER: readonly Marker[] = ['bullet', 'diamond', 'star']

export default function SumGrid24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const beats = useMemo(() => buildSumGrid24G1Beats(), [])
  const index = useBeatControl(beats.length - 1, {
    ...props,
    holds: beats.map((b) => b.hold),
  })
  const beat = beats[index] ?? beats[beats.length - 1]

  const captionBg = beat.ok ? CAPTION_BG_OK : CAPTION_BG_NEUTRAL
  const captionBorder = beat.ok ? CAPTION_BORDER_OK : CAPTION_BORDER_NEUTRAL
  const captionText = beat.ok ? CAPTION_TEXT_OK : CAPTION_TEXT_NEUTRAL

  const knownMarkers = MARKER_ORDER.filter((m) => beat.markers[m] !== undefined)

  // Describes the METHOD only — it never states the answer or the ●/◆/★ values.
  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan bertahap: mulai dari kolom yang hanya punya satu kotak kosong, lalu pakai jumlah di lingkaran dan bilangan yang belum dipakai pada setiap baris untuk mengisi kisi sampai nilai bulatan, belah ketupat, dan bintang ditemukan.'
      : 'Step-by-step explainer: start from the columns with only one empty square, then use each circle sum together with the numbers every row still needs to fill the grid until the bullet, diamond and star cells are pinned down.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The built figure, with a transparent overlay carrying the deduction. */}
        <div className="relative w-full" style={{ maxWidth: VIEW_W }}>
          <SumGrid24G1 solved={beat.solved} />

          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {/* spotlight on the column under discussion */}
            {beat.focus !== null && (
              <motion.g
                key={`spot-${beat.focus}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <rect
                  x={gx(beat.focus)}
                  y={gy(0)}
                  width={CELL}
                  height={GRID_H}
                  fill={SPOT}
                  opacity={0.14}
                />
                <rect
                  x={gx(beat.focus)}
                  y={gy(0)}
                  width={CELL}
                  height={GRID_H}
                  fill="none"
                  stroke={SPOT}
                  strokeWidth={2.5}
                />
                <circle
                  cx={circleCx(beat.focus)}
                  cy={CIRCLE_CY}
                  r={CIRCLE_R + 3}
                  fill="none"
                  stroke={SPOT}
                  strokeWidth={2.5}
                />
              </motion.g>
            )}

            {/* the cells pinned so far — skipped once the primitive prints them all */}
            {!beat.solved &&
              beat.grid.map((row, r) =>
                row.map((value, c) => {
                  if (value === null || !isBlank(r, c)) return null
                  return (
                    <motion.text
                      key={`f-${r}-${c}`}
                      x={gx(c) + CELL / 2}
                      y={gy(r) + CELL / 2}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="font-display"
                      fontSize={17}
                      fontWeight={800}
                      fill={FILLED}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    >
                      {value}
                    </motion.text>
                  )
                }),
              )}
          </svg>
        </div>

        {/* what each row still needed — the other half of every deduction */}
        {beat.needRows.length > 0 && (
          <div className="flex w-full flex-col gap-1">
            {beat.needRows.map((row) => (
              <div key={`need-${row}`} className="flex items-center justify-center gap-1.5">
                <span className="font-display text-[11px] font-bold" style={{ color: CHIP_INK }}>
                  {lang === 'id' ? `baris ${row} masih perlu` : `row ${row} still needs`}
                </span>
                {beat.needs[row]?.map((v) => (
                  <span
                    key={`need-${row}-${v}`}
                    className="rounded-md px-1.5 font-display text-[12px] font-black tabular-nums"
                    style={{ background: CHIP_BG, color: CHIP_INK }}
                  >
                    {v}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* the ●/◆/★ values, appearing as each one is pinned */}
        {knownMarkers.length > 0 && (
          <div className="flex items-center gap-2">
            {knownMarkers.map((m) => (
              <motion.span
                key={`mk-${m}`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                className="rounded-lg border-2 px-2 py-0.5 font-display text-base font-black tabular-nums"
                style={{ borderColor: MARK, color: MARK, background: '#FFF1E6' }}
              >
                {MARKER_GLYPH[m]} {beat.markers[m]}
              </motion.span>
            ))}
          </div>
        )}

        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={{ background: captionBg, borderColor: captionBorder, color: captionText }}
        >
          {lang === 'id' ? beat.caption.id : beat.caption.en}
        </div>
      </div>
    </div>
  )
}
