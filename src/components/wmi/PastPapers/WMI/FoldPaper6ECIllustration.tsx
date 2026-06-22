// Stem illustration + co-exported option renderer for IKMC-23-EC-Q6.
//
// "Kristoffer folds the transparent paper along the dashed line.
//  The paper shows some digit shapes. What can he then see?"
//  Answer: E — the combined result shows 4:0:6.
//
// Reconstructed from:
//   docs/reference/ocr-res/ikmc/contest/ecolier/2023.imgs/010.jpg (stem)
//   docs/reference/ocr-res/ikmc/contest/ecolier/2023.imgs/011-015.jpg (options A–E)
//
// The stem shows a transparent rectangular paper divided into top and bottom
// halves by a horizontal dashed fold line. Each half contains three columns
// of 7-segment-style digit shapes. The paper is folded (top half folds DOWN
// onto the bottom half); since the paper is transparent, both layers are
// visible and the segments from both halves overlay.
//
// 7-segment geometry (per column, 2 halves of each digit):
//   Top half:   col1 = top-left bar  | col2 = top + top-right |  col3 = full outer rect
//   Bot half:   col1 = bot-left + bot bar | col2 = top-right + bot-right + bot bar | col3 = top-left + top-right + bot bar
//
// After fold (top reflects vertically onto bottom):
//   col1 → segments from both → digit 4
//   col2 → segments from both → digit 0
//   col3 → segments from both → digit 6
//
// This component is co-exported:
//   default export  FoldPaper6ECIllustration  — stem figure (unfolded paper)
//   named export    FoldPaper6ECOption         — renders ONE A/B/C/D/E choice
//
// Pure render — no Math.random, no Date, SSR-safe, no hooks.

import type { WmiChoice } from '../../../../types/wmi'

// ─── palette ────────────────────────────────────────────────────────────────
const PAPER_FILL   = '#E8F5FC'   // light blue-tinted transparent paper
const PAPER_STROKE = '#4A8BAA'   // paper border
const FOLD_DASH    = '#3A72A0'   // dashed fold line
const SEG_FILL     = '#1B3A52'   // digit segment fill (dark)
const SEG_STROKE   = '#1B3A52'   // same — stroked rectangles for segments
const DISPLAY_BG   = '#EAF5FD'   // option display background (matches paper)
const DOT_FILL     = '#8AAEC5'   // separator dots between digits
const LABEL_COLOR  = '#1B3A52'

// ─── 7-segment segment geometry ─────────────────────────────────────────────
// We model each cell as a W×H bounding box.
// Segment IDs: 'T' top, 'TR' top-right, 'BR' bot-right, 'B' bot,
//              'BL' bot-left, 'TL' top-left, 'M' middle.
// Thickness of each segment bar = SEG_T.

const SEG_T = 5   // segment bar thickness (px)

interface Rect { x: number; y: number; w: number; h: number }

/**
 * Returns SVG rect descriptors for the given segment IDs in a W×H cell at (ox,oy).
 * Gap = 2px between segment end and corner to look like a real 7-seg display.
 */
function segRects(
  segs: string[],
  ox: number, oy: number,
  W: number, H: number,
): Rect[] {
  const g = 2   // gap at ends
  const result: Rect[] = []
  const half = H / 2

  for (const s of segs) {
    switch (s) {
      case 'T':
        result.push({ x: ox + g, y: oy, w: W - 2 * g, h: SEG_T })
        break
      case 'M':
        result.push({ x: ox + g, y: oy + half - SEG_T / 2, w: W - 2 * g, h: SEG_T })
        break
      case 'B':
        result.push({ x: ox + g, y: oy + H - SEG_T, w: W - 2 * g, h: SEG_T })
        break
      case 'TL':
        result.push({ x: ox, y: oy + g, w: SEG_T, h: half - g })
        break
      case 'TR':
        result.push({ x: ox + W - SEG_T, y: oy + g, w: SEG_T, h: half - g })
        break
      case 'BL':
        result.push({ x: ox, y: oy + half, w: SEG_T, h: half - g })
        break
      case 'BR':
        result.push({ x: ox + W - SEG_T, y: oy + half, w: SEG_T, h: half - g })
        break
    }
  }
  return result
}

// ─── digit segment maps ─────────────────────────────────────────────────────
// Standard 7-segment representations for digits 0–9.
const DIGIT_SEGS: Record<string, string[]> = {
  '0': ['T', 'TL', 'TR', 'BL', 'BR', 'B'],
  '1': ['TR', 'BR'],
  '2': ['T', 'TR', 'M', 'BL', 'B'],
  '3': ['T', 'TR', 'M', 'BR', 'B'],
  '4': ['TL', 'TR', 'M', 'BR'],
  '5': ['T', 'TL', 'M', 'BR', 'B'],
  '6': ['T', 'TL', 'M', 'BL', 'BR', 'B'],
  '7': ['T', 'TR', 'BR'],
  '8': ['T', 'TL', 'TR', 'M', 'BL', 'BR', 'B'],
  '9': ['T', 'TL', 'TR', 'M', 'BR', 'B'],
}

// ─── stem: segments on each half of the paper ───────────────────────────────
// The paper's top half has the UPPER halves of each digit (when folded down,
// these reflect onto the bottom half).
// Top half segments (col index 0,1,2):
//   col0: top-half of digit 4  = TL (top-left) + the top of M (we treat M
//         as straddling the fold — upper half has top of M) + TR upper
//         → for simplicity: top half = segs that are in top half of bounding box
//         → top-half of '4' = TL (upper left), TR (upper right)
//   col1: top-half of digit 0  = T (top bar), TL (upper left), TR (upper right)
//   col2: top-half of digit 6  = T (top bar), TL (upper left)
//
// Bottom half segments:
//   col0: bottom-half of digit 4 = M (middle), BR (lower right)
//   col1: bottom-half of digit 0 = BL (lower left), BR (lower right), B (bottom bar)
//   col2: bottom-half of digit 6 = M, BL, BR, B
//
// (We deliberately split each digit at the mid-fold so when overlaid both
//  layers together produce the correct complete digit.)

// Per-column, per-half: which segment IDs live there.
// In a full cell of height H, "top half" = segments at y < H/2, "bot half" = y >= H/2.
// TL and TR start at g and end at (H/2 - g) — they are in the top half.
// BL and BR start at H/2 and end at (H - g) — they are in the bottom half.
// M straddles the centre — we assign M to the bottom half so it remains
//   visible in the bottom half and is brought up by the fold.
// T is top half; B is bottom half.

const TOP_HALF_SEGS: string[][] = [
  ['TL', 'TR'],        // col0: upper part of the '4' → left and right bars of top
  ['T', 'TL', 'TR'],   // col1: upper part of the '0' → top bar + side bars
  ['T', 'TL'],         // col2: upper part of the '6' → top bar + left bar
]

const BOT_HALF_SEGS: string[][] = [
  ['M', 'BR'],         // col0: lower part of '4' → middle + right-bottom
  ['BL', 'BR', 'B'],   // col1: lower part of '0' → side bars + bottom bar
  ['M', 'BL', 'BR', 'B'], // col2: lower part of '6' → middle + sides + bottom
]

// ─── stem layout constants ────────────────────────────────────────────────────
// Paper: 3 columns of cells, 2 halves (top, bottom), fold line between them.
// Total viewBox = PW × PH.

const CELL_W = 54   // width of each digit cell
const CELL_H = 52   // height of each half (so full digit height = 104)
const COL_GAP = 12  // gap between columns
const PAD_X  = 18   // left/right padding inside paper
const PAD_Y  = 16   // top/bottom padding inside paper

const PW = PAD_X * 2 + 3 * CELL_W + 2 * COL_GAP  // paper width
const PH = PAD_Y * 2 + 2 * CELL_H                 // paper height

const VW = PW + 44   // viewBox width (room for fold arrow on right)
const VH = PH + 12   // viewBox height

// Column x-offsets (left edge of each cell)
const COL_X = [
  PAD_X,
  PAD_X + CELL_W + COL_GAP,
  PAD_X + CELL_W * 2 + COL_GAP * 2,
]

// Row y-offsets (top edge of top half and bottom half)
const ROW_TOP_Y = PAD_Y               // top half
const ROW_BOT_Y = PAD_Y + CELL_H     // bottom half (immediately after top)

// Fold line y
const FOLD_Y = PAD_Y + CELL_H

// ─── fold arrow (right side, showing top folds down) ─────────────────────────
// Curved arrow: right of the paper, pointing downward.
const ARR_X   = PW + 16
const ARR_CY  = PH / 2
const ARR_R   = 20

// ─── stem illustration ────────────────────────────────────────────────────────

function StemSvg() {
  // Build segment rects for top half and bottom half cells
  type SegRect = Rect & { key: string }
  const topRects: SegRect[] = []
  const botRects: SegRect[] = []

  COL_X.forEach((cx, ci) => {
    segRects(TOP_HALF_SEGS[ci], cx, ROW_TOP_Y, CELL_W, CELL_H).forEach((r, ri) => {
      topRects.push({ ...r, key: `t${ci}-${ri}` })
    })
    segRects(BOT_HALF_SEGS[ci], cx, ROW_BOT_Y, CELL_W, CELL_H).forEach((r, ri) => {
      botRects.push({ ...r, key: `b${ci}-${ri}` })
    })
  })

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Paper background */}
      <rect
        x={0}
        y={0}
        width={PW}
        height={PH}
        rx={6}
        fill={PAPER_FILL}
        stroke={PAPER_STROKE}
        strokeWidth={2}
      />

      {/* Separator dots between columns (top half) */}
      {[1, 2].map((c) => {
        const dotX = COL_X[c] - COL_GAP / 2
        return [CELL_H * 0.35, CELL_H * 0.65].map((dy, di) => (
          <circle
            key={`dt${c}-${di}`}
            cx={dotX}
            cy={ROW_TOP_Y + dy}
            r={2.5}
            fill={DOT_FILL}
          />
        ))
      })}

      {/* Separator dots between columns (bottom half) */}
      {[1, 2].map((c) => {
        const dotX = COL_X[c] - COL_GAP / 2
        return [CELL_H * 0.35, CELL_H * 0.65].map((dy, di) => (
          <circle
            key={`db${c}-${di}`}
            cx={dotX}
            cy={ROW_BOT_Y + dy}
            r={2.5}
            fill={DOT_FILL}
          />
        ))
      })}

      {/* Top-half segment shapes */}
      {topRects.map(({ key, x, y, w, h }) => (
        <rect
          key={key}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={1.5}
          fill={SEG_FILL}
          stroke={SEG_STROKE}
          strokeWidth={0.5}
        />
      ))}

      {/* Bottom-half segment shapes */}
      {botRects.map(({ key, x, y, w, h }) => (
        <rect
          key={key}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={1.5}
          fill={SEG_FILL}
          stroke={SEG_STROKE}
          strokeWidth={0.5}
        />
      ))}

      {/* Dashed fold line */}
      <line
        x1={0}
        y1={FOLD_Y}
        x2={PW}
        y2={FOLD_Y}
        stroke={FOLD_DASH}
        strokeWidth={2.5}
        strokeDasharray="6 4"
      />

      {/* Fold arrow: arc on the right, shows top folds down */}
      <path
        d={`M ${ARR_X - ARR_R} ${ARR_CY - ARR_R}
            A ${ARR_R} ${ARR_R} 0 0 1 ${ARR_X} ${ARR_CY + ARR_R}`}
        fill="none"
        stroke={FOLD_DASH}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Arrowhead pointing downward */}
      <polygon
        points={`
          ${ARR_X},${ARR_CY + ARR_R}
          ${ARR_X - 7},${ARR_CY + ARR_R - 9}
          ${ARR_X + 3},${ARR_CY + ARR_R - 6}
        `}
        fill={FOLD_DASH}
      />
    </svg>
  )
}

/** Default export — stem illustration: unfolded transparent paper with digit segments + fold line. */
export default function FoldPaper6ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Transparent paper with digit-segment shapes in two rows divided by a dashed fold line. ' +
        'When folded, the overlapping segments form the digits shown in option E.'
      }
    >
      <StemSvg />
    </div>
  )
}

// ─── option renderer — draws ONE A/B/C/D/E folded-result display ─────────────

// Each option shows 3 digits in a 7-segment-style display.
const OPTION_DIGITS: Record<string, [string, string, string]> = {
  A: ['7', '8', '9'],
  B: ['2', '0', '7'],
  C: ['6', '0', '4'],
  D: ['3', '5', '5'],
  E: ['4', '0', '6'],
}

const OPTION_ARIA: Record<string, { en: string; id: string }> = {
  A: { en: 'Digits 7, 8, 9', id: 'Angka 7, 8, 9' },
  B: { en: 'Digits 2, 0, 7', id: 'Angka 2, 0, 7' },
  C: { en: 'Digits 6, 0, 4', id: 'Angka 6, 0, 4' },
  D: { en: 'Digits 3, 5, 5', id: 'Angka 3, 5, 5' },
  E: { en: 'Digits 4, 0, 6', id: 'Angka 4, 0, 6' },
}

// Option display dimensions (smaller than stem)
const OPT_CW = 36   // cell width per digit
const OPT_CH = 48   // cell height per digit
const OPT_GAP = 8   // gap between digits (holds separator dots)
const OPT_PX = 8    // horizontal padding
const OPT_PY = 6    // vertical padding

const OPT_W = OPT_PX * 2 + 3 * OPT_CW + 2 * OPT_GAP
const OPT_H = OPT_PY * 2 + OPT_CH

const OPT_COL_X = [
  OPT_PX,
  OPT_PX + OPT_CW + OPT_GAP,
  OPT_PX + OPT_CW * 2 + OPT_GAP * 2,
]

function OptionSvg({ digits }: { digits: [string, string, string] }) {
  type SegRect = Rect & { key: string }
  const allRects: SegRect[] = []

  OPT_COL_X.forEach((cx, ci) => {
    const segs = DIGIT_SEGS[digits[ci]] ?? []
    segRects(segs, cx, OPT_PY, OPT_CW, OPT_CH).forEach((r, ri) => {
      allRects.push({ ...r, key: `d${ci}-${ri}` })
    })
  })

  return (
    <svg
      viewBox={`0 0 ${OPT_W} ${OPT_H}`}
      width={OPT_W * 1.4}
      height={OPT_H * 1.4}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Display background */}
      <rect
        x={0}
        y={0}
        width={OPT_W}
        height={OPT_H}
        rx={4}
        fill={DISPLAY_BG}
        stroke={PAPER_STROKE}
        strokeWidth={1.5}
      />

      {/* Separator dots */}
      {[1, 2].map((c) => {
        const dotX = OPT_COL_X[c] - OPT_GAP / 2
        return [OPT_CH * 0.35 + OPT_PY, OPT_CH * 0.65 + OPT_PY].map((dy, di) => (
          <circle key={`sep${c}-${di}`} cx={dotX} cy={dy} r={2} fill={DOT_FILL} />
        ))
      })}

      {/* Digit segments */}
      {allRects.map(({ key, x, y, w, h }) => (
        <rect
          key={key}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={1}
          fill={SEG_FILL}
          stroke={SEG_STROKE}
          strokeWidth={0.4}
        />
      ))}
    </svg>
  )
}

/**
 * FoldPaper6ECOption — renders ONE A/B/C/D/E choice as a 7-segment digit display.
 * Registered in CHOICE_RENDERERS for IKMC-23-EC-Q6.
 */
export function FoldPaper6ECOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label as keyof typeof OPTION_DIGITS
  const digits = OPTION_DIGITS[k]
  const aria = OPTION_ARIA[k]
  if (!digits) return <span style={{ color: LABEL_COLOR }}>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={aria.en}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}
    >
      <OptionSvg digits={digits} />
    </span>
  )
}
