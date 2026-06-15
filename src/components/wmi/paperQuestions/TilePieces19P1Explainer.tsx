import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PLACED_FILL, TilePiece, type PieceId } from './TilePieces19P1Illustration'
import { buildTilePieces19P1Steps } from './tilePieces19P1Steps'

const GREEN = '#10B981'
const INK = '#1F2937'

const VIEW_W = 320
const VIEW_H = 170

// The shared target rectangle (the thing all sets must tile).
const RECT = { x: 70, y: 30, w: 180, h: 110 }

// Schematic placement of each set's pieces INSIDE the rectangle: one region
// rect per piece. The regions partition the rectangle with no gaps/overlaps,
// so "fits" reads visually (area-fill framing, not pixel-true polyomino packs).
type Region = { id: PieceId; x: number; y: number; w: number; h: number }

const EXAMPLE_REGIONS: Region[] = [
  { id: 1, x: RECT.x, y: RECT.y, w: 70, h: 110 },
  { id: 2, x: RECT.x + 70, y: RECT.y, w: 40, h: 70 },
  { id: 3, x: RECT.x + 70, y: RECT.y + 70, w: 40, h: 40 },
  { id: 6, x: RECT.x + 110, y: RECT.y, w: 70, h: 110 },
]

const B_REGIONS: Region[] = [
  { id: 6, x: RECT.x, y: RECT.y, w: 110, h: 70 },
  { id: 2, x: RECT.x + 110, y: RECT.y, w: 70, h: 110 },
  { id: 4, x: RECT.x, y: RECT.y + 70, w: 70, h: 40 },
  { id: 3, x: RECT.x + 70, y: RECT.y + 70, w: 40, h: 40 },
]

function Filled({ region }: { region: Region }) {
  const cx = region.x + region.w / 2
  const cy = region.y + region.h / 2
  return (
    <g>
      <rect
        x={region.x}
        y={region.y}
        width={region.w}
        height={region.h}
        fill={PLACED_FILL[region.id] ?? '#CBD5E1'}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill={INK}>
        {region.id}
      </text>
    </g>
  )
}

export default function TilePieces19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildTilePieces19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: set B (2 + 3 + 4 + 6) menutup persegi panjang dengan pas. Jawaban B.'
      : 'Explainer: set B (2 + 3 + 4 + 6) tiles the rectangle exactly. Answer B.'

  const regions = beat.mode === 'example' ? EXAMPLE_REGIONS : B_REGIONS
  const placedRegions = regions.filter((r) => beat.placed.includes(r.id))

  // The set label shown above the rectangle.
  const setLabel =
    beat.mode === 'example' ? '1 + 2 + 3 + 6' : beat.mode === 'B' ? '2 + 3 + 4 + 6' : ''

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* set label */}
          {setLabel && (
            <text x={VIEW_W / 2} y={16} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill="#30598A">
              {setLabel}
            </text>
          )}

          {/* the empty target rectangle */}
          <rect
            x={RECT.x}
            y={RECT.y}
            width={RECT.w}
            height={RECT.h}
            fill="#FFFFFF"
            stroke="#2f6df0"
            strokeWidth={2.5}
            strokeDasharray={beat.placed.length === 0 ? '6 5' : '0'}
          />

          {/* placed pieces fill the rectangle */}
          {placedRegions.map((r) => (
            <Filled key={r.id} region={r} />
          ))}

          {/* intro beat: show the bare pieces of the example set as a reminder */}
          {beat.mode === 'intro' && (
            <g transform="translate(8, 44)">
              <TilePiece id={2} x={0} y={0} label />
            </g>
          )}
        </svg>

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
