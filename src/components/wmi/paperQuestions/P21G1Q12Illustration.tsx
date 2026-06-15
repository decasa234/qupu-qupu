// WMI-21P1A-Q12 (2021 WMI Semifinal Grade 1 Paper A) — "After Judy visits Hellen,
// she will visit Amy. At least how many metres does she walk in total?"
//
// Source figure (db/seed/wmi/figures/2021-semifinal-g1-a-q12.jpg): three friends
// at the corners of a triangle —
//   Amy (bottom-left)  ── 11 m ──  Hellen (bottom-right)
//   Amy ── 9 m ── Judy          Judy ── 5 m ── Hellen
// and a small right-angle bracket above Hellen showing Judy is 3 m across + 4 m
// down from a point straight above Hellen (the 3-4-5 that fixes the 5 m leg).
//
// MATH (for reference — never drawn in the static figure):
// Judy must go to Hellen first, then to Amy:  Judy→Hellen = 5 m, Hellen→Amy = 11 m,
// total = 5 + 11 = 16 m → answer B. (The 9 m Amy→Judy edge is a decoy: walking
// Judy→Hellen→Amy beats any route through it.)
//
// The static figure draws ONLY the map (all three people + every labelled edge).
// It never highlights the route or reveals "16". The reusable <FriendsMap>
// primitive accepts a `litLegs` set so the explainer can light Judy→Hellen then
// Hellen→Amy and show the running total.
//
// Pure render: no window/document at module top, no Math.random/Date — SSR-safe
// & deterministic.

const EDGE = '#1F2937'
const AUX = '#9CA3AF' // dashed 3 m / 4 m construction lines
const LIT = '#F0853A' // highlighted route leg

export type Leg = 'judyHellen' | 'hellenAmy' | 'amyJudy'

// Problem-space points (metres, y up). Amy at origin; Hellen 11 m east.
// Judy: 9 m from Amy and 5 m from Hellen → (≈8.05, ≈4.03); the figure squares
// this off as 3 m across + 4 m down from the point straight above Hellen.
export const AMY = { x: 0, y: 0 }
export const HELLEN = { x: 11, y: 0 }
export const JUDY = { x: 8, y: 4 }
const ABOVE_HELLEN = { x: 11, y: 4 } // corner of the 3-4 right angle

export const LEG_LEN: Record<Leg, number> = { judyHellen: 5, hellenAmy: 11, amyJudy: 9 }
export const ANSWER = LEG_LEN.judyHellen + LEG_LEN.hellenAmy // 16 — answer B

// ---- geometry --------------------------------------------------------------
const SCALE = 26 // px per metre
const PAD = 44 // headroom for the face emoji + labels
const MIN_X = 0
const MAX_X = 11
const MIN_Y = 0
const MAX_Y = 4
const WIDTH = (MAX_X - MIN_X) * SCALE + PAD * 2
const HEIGHT = (MAX_Y - MIN_Y) * SCALE + PAD * 2

const sx = (x: number) => PAD + (x - MIN_X) * SCALE
const sy = (y: number) => PAD + (MAX_Y - y) * SCALE // flip: problem y up → SVG y down

function midLabel(a: { x: number; y: number }, b: { x: number; y: number }, dx: number, dy: number) {
  return { x: (sx(a.x) + sx(b.x)) / 2 + dx, y: (sy(a.y) + sy(b.y)) / 2 + dy }
}

/** One labelled person: a single-codepoint face glyph + name. */
function Person({
  px,
  py,
  glyph,
  name,
  nameDx,
  nameDy,
  anchor,
}: {
  px: number
  py: number
  glyph: string
  name: string
  nameDx: number
  nameDy: number
  anchor: 'start' | 'middle' | 'end'
}) {
  return (
    <g>
      <circle cx={px} cy={py} r={4.5} fill={EDGE} />
      <text x={px} y={py - 12} textAnchor="middle" fontSize={20}>
        {glyph}
      </text>
      <text x={px + nameDx} y={py + nameDy} textAnchor={anchor} fontSize={13} fontWeight={800} fill={EDGE}>
        {name}
      </text>
    </g>
  )
}

export interface FriendsMapProps {
  /** Route legs to highlight, in walking order (explainer only). */
  litLegs?: ReadonlyArray<Leg>
  /** Running total (metres) shown in a badge when > 0 (explainer only). */
  runningTotal?: number
}

/**
 * Reusable primitive: draws the three friends + every labelled edge. Legs in
 * `litLegs` are drawn thick in amber so the explainer can light the route; a
 * running-total badge appears when `runningTotal` > 0.
 */
export function FriendsMap({ litLegs = [], runningTotal = 0 }: FriendsMapProps) {
  const lit = (leg: Leg) => litLegs.includes(leg)
  const legStroke = (leg: Leg) => (lit(leg) ? LIT : EDGE)
  const legWidth = (leg: Leg) => (lit(leg) ? 5 : 2.5)

  const lblAmyJudy = midLabel(AMY, JUDY, -6, -6)
  const lblJudyHellen = midLabel(JUDY, HELLEN, 8, 0)
  const lblAmyHellen = midLabel(AMY, HELLEN, 0, 18)

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      style={{ maxWidth: WIDTH, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ── dashed 3 m / 4 m construction bracket above Hellen ── */}
      <line x1={sx(JUDY.x)} y1={sy(JUDY.y)} x2={sx(ABOVE_HELLEN.x)} y2={sy(ABOVE_HELLEN.y)} stroke={AUX} strokeWidth={1.5} strokeDasharray="5 4" />
      <line x1={sx(ABOVE_HELLEN.x)} y1={sy(ABOVE_HELLEN.y)} x2={sx(HELLEN.x)} y2={sy(HELLEN.y)} stroke={AUX} strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={(sx(JUDY.x) + sx(ABOVE_HELLEN.x)) / 2} y={sy(ABOVE_HELLEN.y) - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill={AUX}>
        3 m
      </text>
      <text x={sx(ABOVE_HELLEN.x) + 8} y={(sy(ABOVE_HELLEN.y) + sy(HELLEN.y)) / 2} textAnchor="start" dominantBaseline="central" fontSize={11} fontWeight={700} fill={AUX}>
        4 m
      </text>

      {/* ── triangle edges ── */}
      <line x1={sx(AMY.x)} y1={sy(AMY.y)} x2={sx(JUDY.x)} y2={sy(JUDY.y)} stroke={legStroke('amyJudy')} strokeWidth={legWidth('amyJudy')} strokeLinecap="round" />
      <line x1={sx(JUDY.x)} y1={sy(JUDY.y)} x2={sx(HELLEN.x)} y2={sy(HELLEN.y)} stroke={legStroke('judyHellen')} strokeWidth={legWidth('judyHellen')} strokeLinecap="round" />
      <line x1={sx(AMY.x)} y1={sy(AMY.y)} x2={sx(HELLEN.x)} y2={sy(HELLEN.y)} stroke={legStroke('hellenAmy')} strokeWidth={legWidth('hellenAmy')} strokeLinecap="round" />

      {/* ── edge labels ── */}
      <text x={lblAmyJudy.x} y={lblAmyJudy.y} textAnchor="middle" fontSize={13} fontWeight={800} fill={lit('amyJudy') ? LIT : EDGE}>
        9 m
      </text>
      <text x={lblJudyHellen.x} y={lblJudyHellen.y} textAnchor="start" dominantBaseline="central" fontSize={13} fontWeight={800} fill={lit('judyHellen') ? LIT : EDGE}>
        5 m
      </text>
      <text x={lblAmyHellen.x} y={lblAmyHellen.y} textAnchor="middle" fontSize={13} fontWeight={800} fill={lit('hellenAmy') ? LIT : EDGE}>
        11 m
      </text>

      {/* ── people ── */}
      <Person px={sx(AMY.x)} py={sy(AMY.y)} glyph="🙍" name="Amy" nameDx={-8} nameDy={16} anchor="end" />
      <Person px={sx(JUDY.x)} py={sy(JUDY.y)} glyph="🙂" name="Judy" nameDx={0} nameDy={-22} anchor="middle" />
      <Person px={sx(HELLEN.x)} py={sy(HELLEN.y)} glyph="🙎" name="Hellen" nameDx={8} nameDy={18} anchor="start" />

      {/* ── running-total badge ── */}
      {runningTotal > 0 && (
        <g>
          <rect x={WIDTH / 2 - 34} y={6} width={68} height={24} rx={12} fill="#FFF3E0" stroke={LIT} strokeWidth={2} />
          <text x={WIDTH / 2} y={18} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={900} fill="#B45309">
            {`${runningTotal} m`}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function P21G1Q12Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A map of three friends at the corners of a triangle: Amy at bottom-left, Hellen at bottom-right (11 m apart), and Judy at the top. Amy to Judy is 9 m and Judy to Hellen is 5 m. After Judy visits Hellen she will visit Amy — at least how far does she walk?"
    >
      <FriendsMap />
    </div>
  )
}
