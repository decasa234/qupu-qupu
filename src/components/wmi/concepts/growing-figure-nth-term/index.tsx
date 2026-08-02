import { Polyomino } from '../../PastPapers/WMI/primitives/Polyomino'
import {
  growingFigureCells,
  layoutPictures,
  pickCellSize,
  readGrowingParams,
} from '../explainers/growingFigureNthTermSteps'

// In-card figure for `growing-figure-nth-term`. The stem says a pattern exists;
// this picture is the evidence for WHICH pattern — pictures 1 … k drawn side by
// side on one baseline so the growth reads as growth, then a dashed slot for the
// picture the question asks about but nobody drew.
//
// Every square here comes from `growingFigureCells`, the same function the
// answer counts. There is no second description of the shape for the drawing to
// drift away from, which is the whole point: a figure that contradicts its own
// stated answer is impossible to author here.
//
// It must NEVER draw the asked-for picture, and the aria-label must never say
// how many squares it holds — that is the answer. The drawn pictures are
// described freely; the child can count them anyway.
//
// Pure SVG, no hooks, no randomness: safe to render on the server and identical
// for the same params every time. Cell geometry is entirely Polyomino's; this
// file only decides which cells exist and where each picture sits.

const BLUE = '#30598A'
const PEACH = '#FFD3B1'
const MUTED = '#9AA2AE'
const AMBER = '#E0A000'
const AMBER_SOFT = '#FFF3D4'

const GAP = 16
const PAD = 2
const STRIP_WIDTH = 250
const CAPTION = 18

export default function GrowingFigureNthTermIllustration({ params }: { params: unknown }) {
  const p = readGrowingParams(params)
  const pictures = Array.from({ length: p.shownCount }, (_, i) =>
    growingFigureCells(p.shape, p.height, i + 1),
  )
  const cell = pickCellSize(pictures, STRIP_WIDTH, GAP, PAD)
  const strip = layoutPictures(pictures, cell, GAP, PAD)

  // The dashed slot standing in for the picture the question asks about. It is
  // deliberately the size of a single square: drawing it any bigger would hint
  // at how many squares the answer holds.
  const slotSize = Math.max(26, Math.round(cell * 1.6))
  const slotX = strip.width + GAP * 1.5
  const slotY = strip.height - slotSize
  // A little air on the right so a caption wider than the slot still fits.
  const width = slotX + slotSize + 14
  const height = strip.height + CAPTION

  const slotLabel =
    p.ask === 'n-where-count-is'
      ? 'ke-?'
      : p.ask === 'difference-between-two'
        ? 'selisih'
        : `ke-${p.targetIndex}`

  // The label speaks only what is drawn: how many squares each drawn picture
  // holds. The picture the question is about is announced as not drawn, and its
  // count — the answer — is never mentioned.
  const drawn = pictures
    .map((cells, i) => `gambar ke-${i + 1} punya ${cells.length} persegi`)
    .join(', ')
  const ariaLabel = `${p.shownCount} gambar berjajar dari persegi kecil, makin ke kanan makin besar: ${drawn}. Di sebelah kanannya ada kotak bergaris putus-putus bertanda tanya untuk gambar yang tidak digambar.`

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width * 1.6 }}>
        {strip.boxes.map((box, i) => (
          <g key={`p${i}`} transform={`translate(${box.x}, ${box.y})`}>
            <Polyomino
              cells={pictures[i]}
              cellSize={cell}
              pad={PAD}
              fill={PEACH}
              stroke={BLUE}
              strokeWidth={1.5}
            />
          </g>
        ))}
        {strip.boxes.map((box, i) => (
          <text
            key={`c${i}`}
            x={box.x + box.w / 2}
            y={strip.height + CAPTION - 5}
            textAnchor="middle"
            fontSize={12}
            fontWeight={800}
            fill={BLUE}
          >
            {i + 1}
          </text>
        ))}

        {/* The picture the question asks about: present, but not drawn. */}
        <rect
          x={slotX}
          y={slotY}
          width={slotSize}
          height={slotSize}
          rx={6}
          fill={AMBER_SOFT}
          stroke={AMBER}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <text
          x={slotX + slotSize / 2}
          y={slotY + slotSize / 2 + 5}
          textAnchor="middle"
          fontSize={14}
          fontWeight={800}
          fill={AMBER}
        >
          ?
        </text>
        <text
          x={slotX + slotSize / 2}
          y={strip.height + CAPTION - 5}
          textAnchor="middle"
          fontSize={11}
          fontWeight={800}
          fill={MUTED}
        >
          {slotLabel}
        </text>
      </svg>
    </div>
  )
}
