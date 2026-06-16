// In-card figure for WMI-22P1A-Q4 (2022 Grade 1 Semifinal, Paper A).
//
// Stem: "A rounded tile with two dots rotates step by step. Which figure comes
// next in the pattern?"  Redrawn from db/seed/wmi/figures/2022-semifinal-g1-a-q4.jpg
// — a rounded-rectangle ("domino") tile with two filled dots sitting on its long
// diagonal. The scan preserved a single tile; the original choices A-D were
// pictures, so we reconstruct the rotation sequence the stem describes: the tile
// turns a fixed 45° clockwise each step. Shown steps: 0°, 45°, 90°, 135°; the next
// is 180°. The static figure shows the sequence ending in a "?" — never the answer.
//
// SSR-safe + deterministic: no window/document at module top, no Math.random/Date.

const INK = '#1F2937'
const DOT = '#10A4E8' // bright blue dots, matching the scan
const TILE_FILL = '#FFFFFF'

/** Rotation step (degrees, clockwise) used across the sequence and the options. */
export const STEP_DEG = 45
/** Orientations of the four SHOWN tiles in the sequence (0,45,90,135). */
export const SEQUENCE_DEG = [0, 45, 90, 135] as const
/** The next orientation in the pattern = 135 + 45. */
export const NEXT_DEG = SEQUENCE_DEG[SEQUENCE_DEG.length - 1] + STEP_DEG // 180

/**
 * One rounded-rectangle tile with two diagonal dots, drawn centred at (cx,cy) and
 * rotated `deg` degrees clockwise. The two dots sit near opposite corners of the
 * long diagonal so the rotation is visually unambiguous.
 */
export function RotatingTile({
  cx,
  cy,
  deg,
  size = 1,
  faded = false,
}: {
  cx: number
  cy: number
  deg: number
  /** Scale factor (1 ≈ 56×84 tile). */
  size?: number
  faded?: boolean
}) {
  const w = 50 * size
  const h = 76 * size
  const r = 16 * size
  const dotR = 11 * size
  // dots on the long (vertical, before rotation) diagonal, opposite corners
  const dx = w * 0.22
  const dy = h * 0.24
  return (
    <g transform={`rotate(${deg} ${cx} ${cy})`} opacity={faded ? 0.45 : 1}>
      <rect
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx={r}
        ry={r}
        fill={TILE_FILL}
        stroke={INK}
        strokeWidth={2.6 * size}
      />
      <circle cx={cx - dx} cy={cy - dy} r={dotR} fill={DOT} />
      <circle cx={cx + dx} cy={cy + dy} r={dotR} fill={DOT} />
    </g>
  )
}

/** A dashed slot holding a "?" — the unknown next tile in the sequence. */
function QuestionSlot({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 30} y={cy - 44} width={60} height={88} rx={16} fill="#F8FAFC" stroke="#94A3B8" strokeWidth={2.4} strokeDasharray="6 6" />
      <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="central" fontSize={40} fontWeight={900} fill="#94A3B8" className="font-display">
        ?
      </text>
    </g>
  )
}

export const Q4_VIEW_W = 480
export const Q4_VIEW_H = 200

const FIRST_X = 70
const GAP_X = 86
const ROW_Y = 96

export interface Q4DiagramProps {
  /** Reveal the next tile (the answer orientation) in the "?" slot. */
  revealNext?: boolean
  /** Show small rotation arrows between consecutive tiles. */
  showArrows?: boolean
  /** Index (0..3) of the sequence tile to spotlight, or -1. */
  spotlight?: number
}

export function Q4Diagram({ revealNext = false, showArrows = false, spotlight = -1 }: Q4DiagramProps) {
  const xs = SEQUENCE_DEG.map((_, i) => FIRST_X + i * GAP_X)
  const nextX = FIRST_X + SEQUENCE_DEG.length * GAP_X
  return (
    <svg
      viewBox={`0 0 ${Q4_VIEW_W} ${Q4_VIEW_H}`}
      width="100%"
      style={{ maxWidth: Q4_VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {SEQUENCE_DEG.map((deg, i) => (
        <g key={i}>
          {spotlight === i && <circle cx={xs[i]} cy={ROW_Y} r={52} fill="#FEF3C7" />}
          <RotatingTile cx={xs[i]} cy={ROW_Y} deg={deg} size={0.85} />
        </g>
      ))}

      {showArrows &&
        xs.slice(0, -1).map((x, i) => {
          const mid = (x + xs[i + 1]) / 2
          return (
            <g key={`arr${i}`}>
              <path d={`M ${mid - 10} ${ROW_Y} q 10 -14 22 0`} fill="none" stroke="#F59E0B" strokeWidth={2.6} strokeLinecap="round" />
              <path d={`M ${mid + 12} ${ROW_Y} l -4 -5 l 7 -1 z`} fill="#F59E0B" />
            </g>
          )
        })}

      {/* the unknown next tile */}
      {revealNext ? (
        <g>
          <circle cx={nextX} cy={ROW_Y} r={52} fill="#D1FAE5" />
          <RotatingTile cx={nextX} cy={ROW_Y} deg={NEXT_DEG} size={0.85} />
        </g>
      ) : (
        <QuestionSlot cx={nextX} cy={ROW_Y} />
      )}
    </svg>
  )
}

export default function P22G1Q4Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A rounded tile with two blue dots turning a little more each step; the last slot is a question mark for the next tile."
    >
      <Q4Diagram />
    </div>
  )
}
