// Race-track figure for WMI-24F3A-Q4 (2024 Grade-3 Final).
// Three runners Amy / Ben / Carol on an 800 m track; shows given distances only,
// never the answer (Amy's distance from the finish).

// ── track geometry ────────────────────────────────────────────────────────────
// SVG is 480 × 190. The visible track segment runs from x=70 (start edge) to
// x=430 (finish line), giving 360 px for ~800 m.  Each runner occupies one lane.

const INK = '#1F2937'

// px per metre on the track ruler
const PX_PER_M = 360 / 800

// x-coordinates
const TRACK_LEFT = 70   // left edge of visible track (start side)
const TRACK_RIGHT = 430  // right edge (finish line)
const FINISH_X = TRACK_RIGHT

// Lane top-y values (3 lanes, each 44 px tall, 6 px gap between)
const LANE_Y = [14, 68, 122]  // top of lane 0 (Amy), 1 (Ben), 2 (Carol)
const LANE_H = 44
const LANE_LABEL_X = TRACK_LEFT - 36  // label x for lane names

// Runner glyph: simple silhouette drawn with basic shapes (head + torso + legs)
function RunnerGlyph({
  x, y, color, flipped = false,
}: { x: number; y: number; color: string; flipped?: boolean }) {
  const sx = flipped ? -1 : 1
  return (
    <g transform={`translate(${x},${y})`}>
      {/* head */}
      <circle cx={sx * 0} cy={-22} r={6} fill={color} />
      {/* torso */}
      <line x1={sx * 0} y1={-16} x2={sx * 0} y2={-4} stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      {/* arms */}
      <line x1={sx * -7} y1={-12} x2={sx * 7} y2={-8} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      {/* legs */}
      <line x1={sx * 0} y1={-4} x2={sx * -6} y2={8} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <line x1={sx * 0} y1={-4} x2={sx * 8} y2={6} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

// Checkered finish flag (drawn, no emoji)
function FinishFlag({ x, y }: { x: number; y: number }) {
  const cells: Array<{ col: number; row: number }> = []
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      if ((col + row) % 2 === 0) cells.push({ col, row })
    }
  }
  const cw = 7, ch = 6
  const fw = 4 * cw, fh = 3 * ch
  return (
    <g transform={`translate(${x},${y})`}>
      {/* flag background */}
      <rect x={0} y={0} width={fw} height={fh} fill="white" stroke={INK} strokeWidth={1} />
      {/* checkered cells */}
      {cells.map(({ col, row }) => (
        <rect key={`${col}-${row}`} x={col * cw} y={row * ch} width={cw} height={ch} fill={INK} />
      ))}
      {/* flag pole */}
      <line x1={-1} y1={0} x2={-1} y2={fh + 18} stroke={INK} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

// Distance annotation: a horizontal brace with label
function DistBrace({
  x1, x2, y, label, color = '#6B7280',
}: { x1: number; x2: number; y: number; label: string; color?: string }) {
  const mid = (x1 + x2) / 2
  return (
    <g>
      {/* main brace line */}
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={1.4} />
      {/* tick marks */}
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke={color} strokeWidth={1.4} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke={color} strokeWidth={1.4} />
      {/* label */}
      <text x={mid} y={y - 7} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>
        {label}
      </text>
    </g>
  )
}

// ── known positions ────────────────────────────────────────────────────────────
// Ben is 596 m from start → pixel x = TRACK_LEFT + 596 * PX_PER_M
const BEN_FROM_START = 596
const CAROL_FROM_FINISH = 144
const CAROL_FROM_START = 800 - CAROL_FROM_FINISH

const BEN_X = TRACK_LEFT + BEN_FROM_START * PX_PER_M     // ≈ 339
const CAROL_X = TRACK_LEFT + CAROL_FROM_START * PX_PER_M  // ≈ 322

// Amy is unknown — shown as a question mark ahead of Carol
// We show Amy somewhere visually ahead (i.e., closer to finish) than Carol
// but do NOT label her x-distance (that's the answer).
// Place her at the equal-gap position for the figure to look meaningful, but
// only label her lane, not her distance.
const GAP_PX = 60 * PX_PER_M  // 60 m gap in px ≈ 27 px
const AMY_X = CAROL_X + GAP_PX  // ahead of Carol by equal gap (visually placed, unlabelled)

// Runner colours matching the source scan
const RUNNER_COLORS = {
  Amy: '#D81B60',   // magenta/pink
  Ben: '#1565C0',   // blue
  Carol: '#2E7D32', // green
}

// ── main component ─────────────────────────────────────────────────────────────
export default function RaceTrack24G3Illustration() {
  const viewW = 490
  const viewH = 190

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Lintasan lari 800 m: Amy di jalur atas, Ben di jalur tengah (596 m dari start), ' +
        'Carol di jalur bawah (144 m dari garis finish). Selisih Amy–Carol sama dengan selisih Carol–Ben.'
      }
    >
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        width={Math.min(480, viewW)}
        aria-hidden="true"
      >
        {/* ── lane backgrounds ──────────────────────────────────────────── */}
        {LANE_Y.map((ly, i) => (
          <rect
            key={i}
            x={TRACK_LEFT}
            y={ly}
            width={TRACK_RIGHT - TRACK_LEFT}
            height={LANE_H}
            className={i === 0 ? 'fill-qupu-peach' : i === 1 ? 'fill-qupu-cream' : 'fill-qupu-cream-dark'}
            fillOpacity={0.35}
            stroke={INK}
            strokeWidth={1.2}
          />
        ))}

        {/* ── start ellipsis (left side) ────────────────────────────────── */}
        <text x={TRACK_LEFT - 10} y={LANE_Y[1] + LANE_H / 2 + 1} textAnchor="end" fontSize={18} fontWeight={900} fill={INK}>
          {'...'}
        </text>

        {/* ── finish line (double line) ─────────────────────────────────── */}
        <line x1={FINISH_X} y1={LANE_Y[0]} x2={FINISH_X} y2={LANE_Y[2] + LANE_H} stroke={INK} strokeWidth={2.5} />
        <line x1={FINISH_X + 4} y1={LANE_Y[0]} x2={FINISH_X + 4} y2={LANE_Y[2] + LANE_H} stroke={INK} strokeWidth={1} />

        {/* ── finish flag ───────────────────────────────────────────────── */}
        <FinishFlag x={FINISH_X + 6} y={LANE_Y[0] - 20} />

        {/* ── lane dividers (horizontal separators) ─────────────────────── */}
        <line x1={TRACK_LEFT} y1={LANE_Y[0] + LANE_H} x2={FINISH_X} y2={LANE_Y[0] + LANE_H} stroke={INK} strokeWidth={1.2} strokeDasharray="5 3" />
        <line x1={TRACK_LEFT} y1={LANE_Y[1] + LANE_H} x2={FINISH_X} y2={LANE_Y[1] + LANE_H} stroke={INK} strokeWidth={1.2} strokeDasharray="5 3" />

        {/* ── runner labels (left side) ─────────────────────────────────── */}
        {(['Amy', 'Ben', 'Carol'] as const).map((name, i) => (
          <text
            key={name}
            x={LANE_LABEL_X}
            y={LANE_Y[i] + LANE_H / 2 + 5}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fill={RUNNER_COLORS[name]}
          >
            {name}
          </text>
        ))}

        {/* ── Amy runner + question mark (position unknown) ─────────────── */}
        <RunnerGlyph x={AMY_X} y={LANE_Y[0] + LANE_H - 6} color={RUNNER_COLORS.Amy} />
        {/* "?" label above Amy runner to indicate her distance is unknown */}
        <text
          x={AMY_X + 14}
          y={LANE_Y[0] + LANE_H / 2 - 4}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill={RUNNER_COLORS.Amy}
        >
          {'?'}
        </text>

        {/* ── Ben runner ────────────────────────────────────────────────── */}
        <RunnerGlyph x={BEN_X} y={LANE_Y[1] + LANE_H - 6} color={RUNNER_COLORS.Ben} />

        {/* ── Carol runner ──────────────────────────────────────────────── */}
        <RunnerGlyph x={CAROL_X} y={LANE_Y[2] + LANE_H - 6} color={RUNNER_COLORS.Carol} />

        {/* ── Ben: "596 m from start" brace ─────────────────────────────── */}
        <DistBrace
          x1={TRACK_LEFT}
          x2={BEN_X}
          y={LANE_Y[1] + LANE_H + 14}
          label={'596 m'}
          color={RUNNER_COLORS.Ben}
        />

        {/* ── Carol: "144 m from finish" brace ──────────────────────────── */}
        <DistBrace
          x1={CAROL_X}
          x2={FINISH_X}
          y={LANE_Y[2] + LANE_H + 14}
          label={'144 m'}
          color={RUNNER_COLORS.Carol}
        />

        {/* ── equal-gap arrows between Amy–Carol and Carol–Ben ──────────── */}
        {/* Small "=" annotation between Amy and Carol at their lane midpoints */}
        <text
          x={(AMY_X + CAROL_X) / 2}
          y={LANE_Y[1] - 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight={800}
          fill="#6B7280"
        >
          {'= d'}
        </text>
        <text
          x={(BEN_X + CAROL_X) / 2 - 2}
          y={LANE_Y[2] - 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight={800}
          fill="#6B7280"
        >
          {'= d'}
        </text>

        {/* ── total track label ─────────────────────────────────────────── */}
        <text
          x={(TRACK_LEFT + FINISH_X) / 2}
          y={LANE_Y[0] - 10}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill={INK}
        >
          {'800 m'}
        </text>
        {/* bracket lines for the 800 m total */}
        <line x1={TRACK_LEFT} y1={LANE_Y[0] - 4} x2={TRACK_LEFT} y2={LANE_Y[0] - 13} stroke={INK} strokeWidth={1.2} />
        <line x1={TRACK_LEFT} y1={LANE_Y[0] - 8} x2={(TRACK_LEFT + FINISH_X) / 2 - 22} y2={LANE_Y[0] - 8} stroke={INK} strokeWidth={1.2} />
        <line x1={FINISH_X} y1={LANE_Y[0] - 4} x2={FINISH_X} y2={LANE_Y[0] - 13} stroke={INK} strokeWidth={1.2} />
        <line x1={(TRACK_LEFT + FINISH_X) / 2 + 22} y1={LANE_Y[0] - 8} x2={FINISH_X} y2={LANE_Y[0] - 8} stroke={INK} strokeWidth={1.2} />
      </svg>
    </div>
  )
}

// ── named exports (for animator / explainer binding) ──────────────────────────
export const RACE_TRACK_DATA = {
  totalM: 800,
  runners: {
    Ben:   { fromStart: 596, fromFinish: 204 },
    Carol: { fromStart: 656, fromFinish: 144 },
    Amy:   { fromStart: 716, fromFinish:  84 },  // answer — only used by animator
  },
  gapM: 60,
} as const
