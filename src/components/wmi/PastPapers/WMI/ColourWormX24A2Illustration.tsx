// SEAMOX-24-A-Q2 — "Find the colour of the circle marked with '?'."
//
// Stem figure: a caterpillar/worm of overlapping coloured circles (Red, Green, Yellow)
// with a blank "?" circle at the tail. Answer: Yellow (repeating cycle).
//
// No existing primitive covers the snake-of-circles layout → fresh SVG.
// Shared ColourWormDiagram co-exported so the explainer can re-use and add highlights.
// Adapted from BubblePatternX22A1Illustration (co-export + highlight-prop approach).

const INK = '#1F2937'
const STROKE = '#374151'

const RED_FILL    = '#EF9A9A'  // coral-red
const GREEN_FILL  = '#A5D6A7'  // medium-green
const YELLOW_FILL = '#FFF176'  // golden-yellow
const UNKNOWN_FILL = '#FFFFFF' // white for "?"

const W = 520
const H = 340

interface WormCircle {
  id: string
  cx: number
  cy: number
  r: number
  label: string
  fill: string
}

// Circles in painter order (largest drawn first, smallest on top).
// Sequence head→tail: y3 y2 g5 r3 r2 g4 g3 r1 y1 g2 g1 q
const CIRCLES: WormCircle[] = [
  { id: 'g2', cx: 182, cy: 228, r: 55,  label: 'Green',  fill: GREEN_FILL  },
  { id: 'r1', cx: 104, cy: 185, r: 46,  label: 'Red',    fill: RED_FILL    },
  { id: 'r3', cx: 428, cy: 193, r: 46,  label: 'Red',    fill: RED_FILL    },
  { id: 'y3', cx: 490, cy: 162, r: 40,  label: 'Yellow', fill: YELLOW_FILL },
  { id: 'g5', cx: 466, cy: 230, r: 42,  label: 'Green',  fill: GREEN_FILL  },
  { id: 'g3', cx: 268, cy: 222, r: 37,  label: 'Green',  fill: GREEN_FILL  },
  { id: 'r2', cx: 376, cy: 218, r: 33,  label: 'Red',    fill: RED_FILL    },
  { id: 'g4', cx: 322, cy: 240, r: 28,  label: 'Green',  fill: GREEN_FILL  },
  { id: 'y2', cx: 492, cy: 288, r: 26,  label: 'Yellow', fill: YELLOW_FILL },
  { id: 'g1', cx: 114, cy: 270, r: 24,  label: 'Green',  fill: GREEN_FILL  },
  { id: 'y1', cx: 152, cy: 162, r: 20,  label: 'Yellow', fill: YELLOW_FILL },
  { id: 'q',  cx:  78, cy: 295, r: 17,  label: '?',      fill: UNKNOWN_FILL },
]

export interface ColourWormDiagramProps {
  revealAnswer?: boolean
  highlightIds?: string[]
}

export function ColourWormDiagram({
  revealAnswer = false,
  highlightIds = [],
}: ColourWormDiagramProps) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {CIRCLES.map((c) => {
        const isQ    = c.id === 'q'
        const fill   = isQ && revealAnswer ? YELLOW_FILL : c.fill
        const label  = isQ && revealAnswer ? 'Yellow' : c.label
        const ringed = highlightIds.includes(c.id)
        const fs     = Math.max(8, Math.min(14, Math.floor(c.r / 3.5)))
        return (
          <g key={c.id}>
            {ringed && (
              <circle
                cx={c.cx} cy={c.cy} r={c.r + 5}
                fill="none" stroke="#F59E0B" strokeWidth={2.5}
              />
            )}
            <circle
              cx={c.cx} cy={c.cy} r={c.r}
              fill={fill} stroke={STROKE} strokeWidth={1.8}
            />
            <text
              x={c.cx} y={c.cy}
              textAnchor="middle" dominantBaseline="central"
              fontSize={fs} fontWeight={800} fill={INK}
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** SEAMOX-24-A-Q2 stem illustration — shows the problem only; ? stays blank. */
export default function ColourWormX24A2Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-xl border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="A caterpillar of coloured circles — Red, Green, Yellow — in a repeating pattern. One circle at the tail is blank and marked '?'. Find its colour."
    >
      <ColourWormDiagram />
    </div>
  )
}
