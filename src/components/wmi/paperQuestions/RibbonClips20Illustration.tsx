// Ribbon-measured-in-paperclips figure for WMI-20F1A-Q3.
//
// Recovered from db/seed/wmi/figures/2020-final-g1-a-q3.jpg: a dashed box with
// a pink/purple checkered ribbon and one green paperclip below it. The ribbon
// is exactly 3 paperclip-lengths long (answer B = 3), so the diagram fixes
// CLIP_LEN * CLIPS_ANSWER = RIBBON_LEN.

export const CLIPS_ANSWER = 3

const VIEW_W = 360
const VIEW_H = 164

export const CLIP_LEN = 90
const RIBBON_LEN = CLIP_LEN * CLIPS_ANSWER // 270
const RIBBON_X = 45
const RIBBON_Y = 42 // top edge
const RIBBON_H = 16

const CLIP_ROW_CY = 86 // measuring clips slide in here, right under the ribbon
const LABEL_Y = 124
const LOOSE_CLIP_CY = 110 // the single reference clip in the original figure

const PINK = '#F9A8D4'
const PURPLE = '#A78BFA'
const GREEN = '#10B981'
const DARK = '#1F2937'

/** Green paperclip outline occupying x..x+CLIP_LEN, vertically centred on cy. */
export function PaperclipGlyph({ x, cy, color = GREEN }: { x: number; cy: number; color?: string }) {
  const L = CLIP_LEN
  const d = [
    `M ${x + L - 22} ${cy - 10}`,
    `L ${x + 10} ${cy - 10}`,
    `A 10 10 0 0 0 ${x + 10} ${cy + 10}`,
    `L ${x + L - 14} ${cy + 10}`,
    `A 7 7 0 0 0 ${x + L - 14} ${cy - 4}`,
    `L ${x + 18} ${cy - 4}`,
    `A 4 4 0 0 0 ${x + 18} ${cy + 4}`,
    `L ${x + L - 26} ${cy + 4}`,
  ].join(' ')
  return <path d={d} fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" />
}

export interface RibbonClipsDiagramProps {
  /** How many measuring clips lie under the ribbon (0 = just the loose reference clip). */
  clipsShown?: number
  /** Final beat: count labels turn green. */
  showAnswer?: boolean
}

export function RibbonClipsDiagram({ clipsShown = 0, showAnswer = false }: RibbonClipsDiagramProps) {
  const n = Math.max(0, Math.min(CLIPS_ANSWER, clipsShown))
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: 380, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <defs>
        {/* pink/purple checker, two 8px rows of 9px squares */}
        <pattern id="ribbonChecker20" patternUnits="userSpaceOnUse" x={RIBBON_X} y={RIBBON_Y} width={18} height={16}>
          <rect x={0} y={0} width={9} height={8} fill={PINK} />
          <rect x={9} y={0} width={9} height={8} fill={PURPLE} />
          <rect x={0} y={8} width={9} height={8} fill={PURPLE} />
          <rect x={9} y={8} width={9} height={8} fill={PINK} />
        </pattern>
      </defs>

      {/* checkered ribbon */}
      <rect
        x={RIBBON_X}
        y={RIBBON_Y}
        width={RIBBON_LEN}
        height={RIBBON_H}
        rx={3}
        fill="url(#ribbonChecker20)"
        stroke={PURPLE}
        strokeWidth={1.5}
      />

      {n === 0 ? (
        // original-figure layout: one loose paperclip below-left
        <PaperclipGlyph x={RIBBON_X} cy={LOOSE_CLIP_CY} />
      ) : (
        // measuring clips laid end to end under the ribbon, each with a count label
        Array.from({ length: n }, (_, i) => {
          const cx = RIBBON_X + i * CLIP_LEN
          return (
            <g key={i}>
              <PaperclipGlyph x={cx} cy={CLIP_ROW_CY} />
              <text
                x={cx + CLIP_LEN / 2}
                y={LABEL_Y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={20}
                fontWeight={900}
                fill={showAnswer ? GREEN : DARK}
              >
                {i + 1}
              </text>
            </g>
          )
        })
      )}
    </svg>
  )
}

export default function RibbonClips20Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A pink and purple checkered ribbon with one green paperclip below it. The ribbon is as long as 3 paperclips."
    >
      <RibbonClipsDiagram />
    </div>
  )
}
