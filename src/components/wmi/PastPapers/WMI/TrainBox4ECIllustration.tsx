// IKMC-22-EC-Q4 — "What is the smallest number of boxes that Bill has to move
// to be able to open the dark TRAIN box?"  Answer: C (5).
//
// The source figure (docs/reference/ocr-res/ikmc/contest/ecolier/2022.imgs/008.jpg)
// shows a three-row shelf arrangement of labelled boxes drawn in a flat
// rectangular style:
//
//   Top row (row 2):    books   | music sheets | board games
//   Middle row (row 1): stuffed animals (wide) | bedding (wide) | puzzles
//   Bottom row (row 0): cloths | TRAIN (dark) | CDs | BOOKS
//
// The TRAIN box is the dark (filled) box at the bottom-center. To open it Bill
// must first move the boxes stacked above and around it.
//
// This file draws ONLY the question setup — all 11 boxes labelled, TRAIN dark.
// It NEVER highlights which boxes must move and NEVER reveals the answer (5).
//
// The co-exported primitive `TrainBox4EC` accepts a `movedBoxes` prop (set of
// box IDs to cross out / dim) so the explainer can reveal boxes one-by-one.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── colour palette ────────────────────────────────────────────────────────────
const INK = '#1F2937'
const BOX_FILL = '#F8F4EF'          // plain box face
const BOX_STROKE = '#9C7F5E'        // warm brown outline
const TRAIN_FILL = '#2D2D2D'        // the dark TRAIN box
const TRAIN_STROKE = '#1A1A1A'
const TRAIN_TEXT = '#FFFFFF'
const MOVED_FILL = '#E5E7EB'        // dimmed box when animator marks as moved
const MOVED_STROKE = '#9CA3AF'
const MOVED_TEXT = '#9CA3AF'
const SHELF_FILL = '#D3C4B0'        // shelf surface colour
const SHELF_STROKE = '#9C7F5E'

// ── layout constants ──────────────────────────────────────────────────────────
const PAD = 14
const BOX_H = 40          // standard box height
const BOX_H_WIDE = 48     // taller middle-row wide boxes
const GAP = 6             // gap between boxes
const SHELF_H = 5         // shelf plank thickness

// Column x-positions and widths for the three rows.
// Bottom row: 4 boxes —  cloths | TRAIN | CDs | BOOKS
const ROW0_Y = 130        // y of bottom row top
const R0_W = [62, 56, 56, 68] as const
const R0_LABELS = ['cloths', 'TRAIN', 'CDs', 'BOOKS'] as const
const R0_TRAIN_IDX = 1    // TRAIN is the second box (index 1) in row 0

// Middle row: 3 boxes — stuffed animals (wide) | bedding (wide) | puzzles
const ROW1_Y = ROW0_Y - BOX_H_WIDE - SHELF_H - GAP
const R1_W = [118, 100, 68] as const
const R1_LABELS = ['stuffed animals', 'bedding', 'puzzles'] as const

// Top row: 3 boxes — books | music sheets | board games
const ROW2_Y = ROW1_Y - BOX_H - SHELF_H - GAP
const R2_W = [62, 84, 96] as const
const R2_LABELS = ['books', 'music sheets', 'board games'] as const

// The total SVG width (2*PAD + total occupied width + gaps)
const TOTAL_ROW_W = R0_W.reduce((a, b) => a + b, 0) + 3 * GAP
const VIEW_W = PAD * 2 + TOTAL_ROW_W
const VIEW_H = ROW2_Y + BOX_H + PAD

// ── x positions computed from left to right in each row ──────────────────────
function rowXs(widths: readonly number[]): number[] {
  const xs: number[] = []
  let x = PAD
  for (const w of widths) {
    xs.push(x)
    x += w + GAP
  }
  return xs
}

const R0_XS = rowXs(R0_W)
const R1_XS = rowXs(R1_W)
const R2_XS = rowXs(R2_W)

// Box IDs for the explainer to reference.
// Bottom: 'cloths' | 'train' | 'cds' | 'books-bottom'
// Middle: 'stuffed' | 'bedding' | 'puzzles'
// Top: 'books-top' | 'music' | 'board'
export type BoxId =
  | 'cloths' | 'train' | 'cds' | 'books-bottom'
  | 'stuffed' | 'bedding' | 'puzzles'
  | 'books-top' | 'music' | 'board'

// ── one labelled box (flat style) ─────────────────────────────────────────────
function Box({
  x,
  y,
  w,
  h,
  label,
  isTrain = false,
  isMoved = false,
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
  isTrain?: boolean
  isMoved?: boolean
}) {
  const fill = isMoved ? MOVED_FILL : isTrain ? TRAIN_FILL : BOX_FILL
  const stroke = isMoved ? MOVED_STROKE : isTrain ? TRAIN_STROKE : BOX_STROKE
  const textColor = isMoved ? MOVED_TEXT : isTrain ? TRAIN_TEXT : INK
  const strokeW = isTrain ? 2.5 : 2

  // Font size: smaller for long labels.
  const fontSize = label.length > 10 ? 8 : label.length > 7 ? 9.5 : 11

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={fill} stroke={stroke} strokeWidth={strokeW} />
      {/* label — centred, possibly split into two lines for wide labels */}
      {label === 'stuffed animals' ? (
        <>
          <text x={x + w / 2} y={y + h / 2 - 6} textAnchor="middle" fontSize={8} fontWeight={700} fill={textColor}>stuffed</text>
          <text x={x + w / 2} y={y + h / 2 + 6} textAnchor="middle" fontSize={8} fontWeight={700} fill={textColor}>animals</text>
        </>
      ) : label === 'board games' ? (
        <>
          <text x={x + w / 2} y={y + h / 2 - 5} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={textColor}>board</text>
          <text x={x + w / 2} y={y + h / 2 + 6} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={textColor}>games</text>
        </>
      ) : label === 'music sheets' ? (
        <>
          <text x={x + w / 2} y={y + h / 2 - 5} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={textColor}>music</text>
          <text x={x + w / 2} y={y + h / 2 + 6} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={textColor}>sheets</text>
        </>
      ) : (
        <text
          x={x + w / 2}
          y={y + h / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={700}
          fill={textColor}
        >
          {label}
        </text>
      )}
    </g>
  )
}

/** A horizontal shelf plank below `y` spanning the full row width. */
function Shelf({ y, w }: { y: number; w: number }) {
  return (
    <rect
      x={PAD}
      y={y}
      width={w}
      height={SHELF_H}
      fill={SHELF_FILL}
      stroke={SHELF_STROKE}
      strokeWidth={1.5}
    />
  )
}

// ── shared primitive: the 11-box scene ────────────────────────────────────────

/**
 * The stacked-box scene: 3 rows of boxes on two shelves.
 *
 * @param movedBoxes  Set of box IDs the animator has "moved" (dimmed/crossed).
 *                    Defaults to empty — the bare question setup.
 */
export function TrainBox4EC({ movedBoxes = new Set<BoxId>() }: { movedBoxes?: Set<BoxId> } = {}) {
  const m = (id: BoxId) => movedBoxes.has(id)

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── shelves ────────────────────────────────────────────────────────── */}
      {/* shelf below middle row */}
      <Shelf y={ROW0_Y - SHELF_H} w={TOTAL_ROW_W} />
      {/* shelf below top row */}
      <Shelf y={ROW1_Y - SHELF_H} w={TOTAL_ROW_W} />

      {/* ── bottom row (row 0) ─────────────────────────────────────────────── */}
      {R0_LABELS.map((label, i) => (
        <Box
          key={`r0-${i}`}
          x={R0_XS[i]}
          y={ROW0_Y}
          w={R0_W[i]}
          h={BOX_H}
          label={label}
          isTrain={i === R0_TRAIN_IDX}
          isMoved={label !== 'TRAIN' && m(label === 'cloths' ? 'cloths' : label === 'CDs' ? 'cds' : 'books-bottom')}
        />
      ))}

      {/* ── middle row (row 1) ─────────────────────────────────────────────── */}
      {R1_LABELS.map((label, i) => {
        const id: BoxId = i === 0 ? 'stuffed' : i === 1 ? 'bedding' : 'puzzles'
        return (
          <Box
            key={`r1-${i}`}
            x={R1_XS[i]}
            y={ROW1_Y}
            w={R1_W[i]}
            h={BOX_H_WIDE}
            label={label}
            isMoved={m(id)}
          />
        )
      })}

      {/* ── top row (row 2) ────────────────────────────────────────────────── */}
      {R2_LABELS.map((label, i) => {
        const id: BoxId = i === 0 ? 'books-top' : i === 1 ? 'music' : 'board'
        return (
          <Box
            key={`r2-${i}`}
            x={R2_XS[i]}
            y={ROW2_Y}
            w={R2_W[i]}
            h={BOX_H}
            label={label}
            isMoved={m(id)}
          />
        )
      })}
    </svg>
  )
}

// ── ARIA description ──────────────────────────────────────────────────────────
const ARIA_ID =
  'Rak berisi 11 kotak tersusun dalam tiga baris. ' +
  'Baris bawah: cloths, TRAIN (gelap), CDs, BOOKS. ' +
  'Baris tengah: stuffed animals, bedding, puzzles. ' +
  'Baris atas: books, music sheets, board games. ' +
  'Berapa kotak minimum yang harus dipindahkan Bill untuk membuka kotak TRAIN?'

const ARIA_EN =
  'A shelf holding 11 labelled boxes in three rows. ' +
  'Bottom row: cloths, TRAIN (dark), CDs, BOOKS. ' +
  'Middle row: stuffed animals, bedding, puzzles. ' +
  'Top row: books, music sheets, board games. ' +
  'What is the smallest number of boxes Bill must move to open the TRAIN box?'

// ── default export: the static stem illustration ──────────────────────────────

export default function TrainBox4ECIllustration({ lang }: { lang?: string } = {}) {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={lang === 'id' ? ARIA_ID : ARIA_EN}
    >
      <TrainBox4EC />
    </div>
  )
}
