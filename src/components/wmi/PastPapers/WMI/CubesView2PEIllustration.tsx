// IKMC-23-PE-Q2 — "The picture shows 5 cubes viewed from the front. What is the
// view from above?" Answer: B.
//
// Stem figure (002.jpg): 5 coloured cubes in a front-facing elevation.
//   Column 1 (left):  2 tall — red on top, yellow below
//   Column 2 (mid):   1 tall — yellow only
//   Column 3 (right): 2 tall — blue on top, yellow below
// Heights [2, 1, 2] over 3 columns → 5 cubes total.
//
// From above you look straight down:
//   Col 1 → you see the TOP of the RED cube (it's the highest)
//   Col 2 → you see the TOP of the YELLOW cube (only one)
//   Col 3 → you see the TOP of the BLUE cube (it's the highest)
// Top view: [RED | YELLOW | BLUE] in a horizontal row → matches option B.
//
// Reuses the flat-face square style (overhead squares) for the top-view options;
// the stem is rendered as stacked coloured cuboids (simplified front elevation)
// so the three column heights are immediately legible.
//
// Options A–E each show 3 coloured squares in a row with different colour orders:
//   A — [YELLOW | YELLOW | YELLOW]  (003.jpg — 3 yellows)
//   B — [RED | YELLOW | BLUE]       (004.jpg — correct)
//   C — [YELLOW | RED | BLUE]       (005.jpg)
//   D — [BLUE | RED | YELLOW]       (006.jpg)
//   E — [RED | BLUE | YELLOW]       (007.jpg)
//
// Pure SVG, SSR-safe, no random, no dates.

import type { WmiChoice } from '../../../../types/wmi'

// ---------------------------------------------------------------------------
// Colours matching the source images
// ---------------------------------------------------------------------------

const INK = '#1F2937'

// Cube face fills — three distinct cube colours from the stem + answer images.
const COL_RED  = '#D9534F'   // the left-column top cube (red)
const COL_BLUE = '#3A80C1'   // the right-column top cube (blue)
const COL_YEL  = '#F5C842'   // yellow (bottom row + middle column)

// Slightly darkened variants for the lower/left faces of the front-elevation cubes
const COL_RED_DARK  = '#A53530'
const COL_BLUE_DARK = '#235A8A'
const COL_YEL_DARK  = '#C49B10'

// ---------------------------------------------------------------------------
// Front-elevation primitive — one rectangular block (a cube drawn in 2-D flat
// elevation, with a subtle left-side shadow strip to hint at depth).
// ---------------------------------------------------------------------------

interface FrontBlockProps {
  x: number     // left edge in SVG coords
  y: number     // top edge in SVG coords
  w: number     // width
  h: number     // height
  fill: string
  dark: string  // shadow strip fill
}

function FrontBlock({ x, y, w, h, fill, dark }: FrontBlockProps) {
  const strip = w * 0.12  // left shadow strip width
  return (
    <g>
      {/* main face */}
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke={INK} strokeWidth={1.5} strokeLinejoin="round" />
      {/* subtle left-shadow strip */}
      <rect x={x} y={y} width={strip} height={h} fill={dark} opacity={0.45} />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Stem illustration — front elevation of the 5-cube arrangement
// ---------------------------------------------------------------------------

const CUBE_W = 40  // width of each cube column in the elevation
const CUBE_H = 40  // height of each cube in the elevation
const GAP    = 2   // gap between adjacent columns

// Column heights: [2, 1, 2] — 3 columns
const HEIGHTS_FRONT = [2, 1, 2]
// Colours for each column: top cube then bottom cube (or just one if h=1)
// Column 0: red (top), yellow (bottom)
// Column 1: yellow
// Column 2: blue (top), yellow (bottom)
const COL_FILLS = [
  [COL_RED,  COL_YEL],   // col 0 (left)
  [COL_YEL],             // col 1 (mid)
  [COL_BLUE, COL_YEL],   // col 2 (right)
]
const COL_DARKS = [
  [COL_RED_DARK,  COL_YEL_DARK],
  [COL_YEL_DARK],
  [COL_BLUE_DARK, COL_YEL_DARK],
]

const MAX_HEIGHT = 2  // tallest column, to align bottom edge

// Aria labels
const STEM_ARIA_EN =
  'Front view of 5 coloured cubes: left column has a red cube on top of a yellow cube; ' +
  'middle column has one yellow cube; right column has a blue cube on top of a yellow cube.'
const STEM_ARIA_ID =
  'Tampilan depan 5 kubus berwarna: kolom kiri memiliki kubus merah di atas kubus kuning; ' +
  'kolom tengah memiliki satu kubus kuning; kolom kanan memiliki kubus biru di atas kubus kuning.'

/** FrontElevation — the 5-cube arrangement as a flat front view. */
export function FrontElevation({ lang = 'en' }: { lang?: 'en' | 'id' }) {
  const svgW = HEIGHTS_FRONT.length * CUBE_W + (HEIGHTS_FRONT.length - 1) * GAP + 24
  const svgH = MAX_HEIGHT * CUBE_H + 24

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width="100%"
      style={{ maxWidth: 180, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {HEIGHTS_FRONT.map((h, colIdx) => {
        const colX = 12 + colIdx * (CUBE_W + GAP)
        // bottom of all columns aligned at svgH - 12
        const baseY = svgH - 12

        return Array.from({ length: h }, (_, rowFromTop) => {
          // rowFromTop=0 is the TOP cube; h-1 is the BOTTOM cube
          const cubeY = baseY - (h - rowFromTop) * CUBE_H
          const fill = COL_FILLS[colIdx][rowFromTop] ?? COL_YEL
          const dark = COL_DARKS[colIdx][rowFromTop] ?? COL_YEL_DARK
          return (
            <FrontBlock
              key={`${colIdx}-${rowFromTop}`}
              x={colX}
              y={cubeY}
              w={CUBE_W}
              h={CUBE_H}
              fill={fill}
              dark={dark}
            />
          )
        })
      })}
    </svg>
  )
}

/** CubesView2PEIllustration — default stem figure for IKMC-23-PE-Q2. */
export default function CubesView2PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={STEM_ARIA_EN}
    >
      <FrontElevation lang="en" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Top-view option data
// Each option is 3 coloured squares in a row (the top-down view of the 3 columns).
// ---------------------------------------------------------------------------

// Colour sequences (left → right) for each option label, per the source images:
//   A  003.jpg: all yellow (3 yellows — the viewer sees only floor level)
//   B  004.jpg: red | yellow | blue  ← correct answer
//   C  005.jpg: yellow | red | blue
//   D  006.jpg: blue | red | yellow
//   E  007.jpg: red | blue | yellow
const OPTION_COLS: Record<string, string[]> = {
  A: [COL_YEL,  COL_YEL,  COL_YEL],
  B: [COL_RED,  COL_YEL,  COL_BLUE],
  C: [COL_YEL,  COL_RED,  COL_BLUE],
  D: [COL_BLUE, COL_RED,  COL_YEL],
  E: [COL_RED,  COL_BLUE, COL_YEL],
}

const OPTION_ARIA_EN: Record<string, string> = {
  A: 'Top view option A: three yellow squares in a row.',
  B: 'Top view option B: red, yellow, blue squares in a row — the correct top view.',
  C: 'Top view option C: yellow, red, blue squares in a row.',
  D: 'Top view option D: blue, red, yellow squares in a row.',
  E: 'Top view option E: red, blue, yellow squares in a row.',
}
const OPTION_ARIA_ID: Record<string, string> = {
  A: 'Tampilan atas pilihan A: tiga kotak kuning berjajar.',
  B: 'Tampilan atas pilihan B: kotak merah, kuning, biru berjajar — tampilan atas yang benar.',
  C: 'Tampilan atas pilihan C: kotak kuning, merah, biru berjajar.',
  D: 'Tampilan atas pilihan D: kotak biru, merah, kuning berjajar.',
  E: 'Tampilan atas pilihan E: kotak merah, biru, kuning berjajar.',
}

// Square size for the top-view option cells
const SQ = 22
const SQ_PAD = 3

interface TopViewRowProps {
  colours: string[]
}

/** Three coloured squares in a horizontal row — the top-down view of the 3 columns. */
function TopViewRow({ colours }: TopViewRowProps) {
  const w = colours.length * SQ + (colours.length - 1) * SQ_PAD + 8
  const h = SQ + 8
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {colours.map((fill, i) => (
        <rect
          key={i}
          x={4 + i * (SQ + SQ_PAD)}
          y={4}
          width={SQ}
          height={SQ}
          fill={fill}
          stroke={INK}
          strokeWidth={1.4}
          rx={2}
        />
      ))}
    </svg>
  )
}

/**
 * CubesView2PEOption — renders one A/B/C/D/E option as a coloured top-view row.
 * Registered in CHOICE_RENDERERS for IKMC-23-PE-Q2.
 */
export function CubesView2PEOption({ choice }: { choice: WmiChoice }) {
  const colours = OPTION_COLS[choice.label]
  if (!colours) return <span>{choice.text}</span>

  return (
    <span
      role="img"
      aria-label={OPTION_ARIA_EN[choice.label] ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', padding: 4 }}
    >
      <TopViewRow colours={colours} />
    </span>
  )
}

export {
  STEM_ARIA_EN, STEM_ARIA_ID,
  OPTION_ARIA_EN, OPTION_ARIA_ID,
  OPTION_COLS,
  SQ,
  TopViewRow,
  FrontElevation as CubesView2PEStem,
}
