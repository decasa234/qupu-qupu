// IKMC-23-EC-Q5 — Theatre lights timeline
//
// PROBLEM ONLY: shows the Gantt-style schedule exactly as it appears in the paper.
//   - Three labelled rows: Green, Orange, Blue.
//   - Time axis 0–12 with integer tick marks.
//   - Coloured bar segments faithful to the source figure:
//       Green  : [2, 5]  and  [7, 10]
//       Orange : [2, 7]  and  [8, 12]
//       Blue   : [0, 3],  [6, 8],  and  [10, 12]
//
// Does NOT show:
//   - which intervals have exactly 2 lights (the question)
//   - the answer (8 minutes)
//
// Co-exports layout constants and the TimelineGrid primitive so the explainer
// can overlay highlights in the same coordinate system.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── Layout constants ──────────────────────────────────────────────────────────

export const SVG_W = 340
export const SVG_H = 140

/** Pixels from left edge to minute-0 tick. */
export const AXIS_LEFT = 46
/** Pixels from left edge to minute-12 tick. */
export const AXIS_RIGHT = 322
/** Pixel width of one minute interval. */
export const MIN_W = (AXIS_RIGHT - AXIS_LEFT) / 12   // = 23

/** Y centres for each light row (top to bottom: Green, Orange, Blue). */
export const ROW_Y = {
  green:  28,
  orange: 62,
  blue:   96,
} as const

/** Half-height of each bar segment. */
export const BAR_H = 13
/** Y of the time axis line. */
export const AXIS_Y = 118

/** Colour tokens. */
export const COLOR = {
  GREEN:        '#22C55E',
  GREEN_STROKE: '#15803D',
  ORANGE:       '#F97316',
  ORANGE_STROKE:'#C2410C',
  BLUE:         '#3B82F6',
  BLUE_STROKE:  '#1D4ED8',
  AXIS:         '#374151',
  LABEL:        '#1F2937',
  BG:           '#FFFFFF',
} as const

// ── Bar-segment data ──────────────────────────────────────────────────────────

/** An interval bar: [start, end) in minutes plus the light colour. */
export interface LightSeg {
  light: 'green' | 'orange' | 'blue'
  start: number
  end: number
}

/** All ON-segments faithful to the source figure. */
// eslint-disable-next-line react-refresh/only-export-components
export const SEGMENTS: LightSeg[] = [
  // Green
  { light: 'green',  start: 2,  end: 5  },
  { light: 'green',  start: 7,  end: 10 },
  // Orange
  { light: 'orange', start: 2,  end: 7  },
  { light: 'orange', start: 8,  end: 12 },
  // Blue
  { light: 'blue',   start: 0,  end: 3  },
  { light: 'blue',   start: 6,  end: 8  },
  { light: 'blue',   start: 10, end: 12 },
]

// ── Helper: minute → SVG x ────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export const minToX = (m: number): number => AXIS_LEFT + m * MIN_W

// ── Sub-components ────────────────────────────────────────────────────────────

/** One coloured bar segment on the timeline. */
export function BarSeg({
  seg,
  opacity = 1,
}: {
  seg: LightSeg
  opacity?: number
}) {
  const x      = minToX(seg.start)
  const width  = (seg.end - seg.start) * MIN_W
  const y      = ROW_Y[seg.light] - BAR_H
  const height = BAR_H * 2
  const fill   = COLOR[seg.light.toUpperCase() as keyof typeof COLOR] as string
  const stroke = COLOR[`${seg.light.toUpperCase()}_STROKE` as keyof typeof COLOR] as string

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={2}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.5}
      opacity={opacity}
    />
  )
}

/** The time axis with integer tick marks and "minutes" label. */
export function TimeAxis() {
  const ticks = Array.from({ length: 13 }, (_, i) => i)

  return (
    <g>
      {/* axis baseline */}
      <line
        x1={AXIS_LEFT}
        y1={AXIS_Y}
        x2={AXIS_RIGHT}
        y2={AXIS_Y}
        stroke={COLOR.AXIS}
        strokeWidth={1.5}
      />
      {/* tick marks and labels */}
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={minToX(t)}
            y1={AXIS_Y}
            x2={minToX(t)}
            y2={AXIS_Y + 5}
            stroke={COLOR.AXIS}
            strokeWidth={1.5}
          />
          <text
            x={minToX(t)}
            y={AXIS_Y + 14}
            textAnchor="middle"
            fontSize={9}
            fill={COLOR.LABEL}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontWeight={500}
          >
            {t}
          </text>
        </g>
      ))}
      {/* "minutes" label */}
      <text
        x={(AXIS_LEFT + AXIS_RIGHT) / 2}
        y={AXIS_Y + 25}
        textAnchor="middle"
        fontSize={9}
        fontWeight={600}
        fill={COLOR.LABEL}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        minutes
      </text>
    </g>
  )
}

/** Row labels on the left: Green, Orange, Blue. */
export function RowLabels() {
  return (
    <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700} fontSize={10}>
      <text x={AXIS_LEFT - 4} y={ROW_Y.green}  textAnchor="end" dominantBaseline="central" fill={COLOR.GREEN_STROKE}>
        Green
      </text>
      <text x={AXIS_LEFT - 4} y={ROW_Y.orange} textAnchor="end" dominantBaseline="central" fill={COLOR.ORANGE_STROKE}>
        Orange
      </text>
      <text x={AXIS_LEFT - 4} y={ROW_Y.blue}   textAnchor="end" dominantBaseline="central" fill={COLOR.BLUE_STROKE}>
        Blue
      </text>
    </g>
  )
}

/** The full static timeline grid (re-exported for the explainer). */
export function TimelineGrid({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <g opacity={dimmed ? 0.35 : 1}>
      {SEGMENTS.map((seg, i) => (
        <BarSeg key={i} seg={seg} />
      ))}
      <TimeAxis />
      <RowLabels />
    </g>
  )
}

// ── Default export ────────────────────────────────────────────────────────────

/**
 * Lights5ECIllustration
 *
 * Static, problem-only figure for IKMC-23-EC-Q5.
 * Shows the theatre lights schedule exactly as in the source paper — three
 * coloured rows (Green / Orange / Blue) over a 0–12 minute axis. The question
 * asks how many minutes EXACTLY 2 lights are on at the same time; this
 * illustration never highlights the answer intervals.
 */
export default function Lights5ECIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Theatre lights schedule 0–12 minutes. ' +
        'Green: on 2–5 and 7–10. ' +
        'Orange: on 2–7 and 8–12. ' +
        'Blue: on 0–3, 6–8, and 10–12. ' +
        'How long are exactly 2 lights on at the same time?'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* white background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

        {/* timeline grid: all bar segments + axis + labels */}
        <TimelineGrid />
      </svg>
    </div>
  )
}
