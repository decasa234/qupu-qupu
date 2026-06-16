// Ship-under-bridge illustration for WMI-24F3A-Q2.
// A bridge deck is split into 16 equal segments (156 m total). A ship labelled
// "038" passes underneath and its width aligns with 4 of those segments.
// Reconstruct the printed figure: bridge with checkerboard deck, guardrail,
// abutments, and the ship with dotted width markers.
// Problem-only — does NOT reveal which segment count is the answer.

const INK = '#1F2937'

// ------------------------------------------------------------------
// Exported data (so the explainer can bind to the same constants)
// ------------------------------------------------------------------

/** Total deck segments in the printed figure. */
export const BRIDGE_SEGMENTS = 16

/** Number of segments spanned by the ship (used for proportion). */
export const SHIP_SEGMENTS = 4

/** Bridge length as printed on the problem. */
export const BRIDGE_LENGTH_M = 156

// ------------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------------

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="Jembatan sepanjang 156 m dengan dek yang dibagi menjadi 16 ruas sama. Kapal bernomor 038 melintas di bawah, dengan lebar ditandai dua garis putus-putus yang menutupi 4 ruas."
    >
      {children}
    </div>
  )
}

/** Checkerboard deck: 16 segments alternating light/dark. */
function BridgeDeck({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const segW = w / BRIDGE_SEGMENTS
  return (
    <g>
      {Array.from({ length: BRIDGE_SEGMENTS }, (_, i) => (
        <rect
          key={i}
          x={x + i * segW}
          y={y}
          width={segW}
          height={h}
          fill={i % 2 === 0 ? '#FFFFFF' : '#B0B8C1'}
          stroke={INK}
          strokeWidth={0.6}
        />
      ))}
      {/* outer border over the top */}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={INK} strokeWidth={1.5} />
    </g>
  )
}

/** Simple railing: top rail + bottom rail + evenly-spaced vertical posts. */
function BridgeRailing({ x, y, w, railH }: { x: number; y: number; w: number; railH: number }) {
  const postCount = 10
  const postSpacing = w / (postCount - 1)
  return (
    <g>
      {/* top horizontal rail */}
      <line x1={x} y1={y} x2={x + w} y2={y} stroke={INK} strokeWidth={2} />
      {/* bottom horizontal rail */}
      <line x1={x} y1={y + railH} x2={x + w} y2={y + railH} stroke={INK} strokeWidth={2} />
      {/* vertical posts */}
      {Array.from({ length: postCount }, (_, i) => (
        <line
          key={i}
          x1={x + i * postSpacing}
          y1={y}
          x2={x + i * postSpacing}
          y2={y + railH}
          stroke={INK}
          strokeWidth={1.5}
        />
      ))}
    </g>
  )
}

/** Grey abutment / land mass on one side. Trapezoid-ish fill. */
function Abutment({ x, y, w, h, flip }: { x: number; y: number; w: number; h: number; flip?: boolean }) {
  // Points: angled top edge, straight outer edge, bottom edge
  const pts = flip
    ? `${x},${y + h} ${x},${y} ${x + w * 0.6},${y} ${x + w},${y + h}`
    : `${x},${y + h} ${x},${y} ${x + w},${y} ${x + w * 0.4},${y + h}`
  return <polygon points={pts} fill="#9CA3AF" stroke={INK} strokeWidth={1} />
}

/**
 * The ship: curved hull, stacked cabin tiers, small mast, label "038".
 * Ship is centered under the bridge, width = SHIP_SEGMENTS/BRIDGE_SEGMENTS * bridgeW.
 */
function Ship({ cx, cy, shipW, shipH }: { cx: number; cy: number; shipW: number; shipH: number }) {
  const hullH = shipH * 0.42
  const cabinW = shipW * 0.5
  const tier1H = shipH * 0.24
  const tier2H = shipH * 0.16
  const tier3H = shipH * 0.1
  const tier2W = cabinW * 0.72
  const tier3W = cabinW * 0.45

  // Hull: a rounded trapezoid drawn as a path
  const hullTop = cy - shipH * 0.5 + (shipH - hullH)
  const hullBottom = cy + shipH * 0.5
  const hl = cx - shipW / 2
  const hr = cx + shipW / 2
  // Curve the bottom slightly
  const hullPath = `
    M ${hl} ${hullTop}
    L ${hr} ${hullTop}
    L ${hr - 8} ${hullBottom}
    Q ${cx} ${hullBottom + 6} ${hl + 8} ${hullBottom}
    Z
  `

  // Cabin tiers stacked above the hull
  const tier1Y = hullTop - tier1H
  const tier2Y = tier1Y - tier2H
  const tier3Y = tier2Y - tier3H

  // Mast / chimney on top of tier3
  const mastH = shipH * 0.08

  return (
    <g>
      {/* hull */}
      <path d={hullPath} fill="#E5E7EB" stroke={INK} strokeWidth={1.5} />

      {/* label "038" in the hull */}
      <text
        x={cx}
        y={hullTop + hullH * 0.55}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={800}
        fill={INK}
      >
        038
      </text>

      {/* cabin tier 1 (widest) */}
      <rect
        x={cx - cabinW / 2}
        y={tier1Y}
        width={cabinW}
        height={tier1H}
        fill="#F3F4F6"
        stroke={INK}
        strokeWidth={1.2}
      />

      {/* cabin tier 2 */}
      <rect
        x={cx - tier2W / 2}
        y={tier2Y}
        width={tier2W}
        height={tier2H}
        fill="#F3F4F6"
        stroke={INK}
        strokeWidth={1.2}
      />

      {/* cabin tier 3 */}
      <rect
        x={cx - tier3W / 2}
        y={tier3Y}
        width={tier3W}
        height={tier3H}
        fill="#F3F4F6"
        stroke={INK}
        strokeWidth={1.2}
      />

      {/* mast */}
      <rect
        x={cx - 1.5}
        y={tier3Y - mastH}
        width={3}
        height={mastH}
        fill={INK}
      />
    </g>
  )
}

// ------------------------------------------------------------------
// Main illustration
// ------------------------------------------------------------------

export function ShipBridge24G3Figure() {
  // Canvas
  const VW = 400
  const VH = 220

  // Bridge deck geometry
  const abutW = 48
  const deckY = 72
  const deckH = 16
  const deckX = abutW
  const deckW = VW - 2 * abutW

  // Railing above the deck
  const railH = 22
  const railY = deckY - railH

  // Bridge support band (thick horizontal bar just below the deck)
  const bandH = 10
  const bandY = deckY + deckH

  // Abutments (land)
  const abutY = deckY - railH
  const abutH = deckY + deckH + bandH - abutY

  // Ship — positioned below the bridge band, centered
  const segW = deckW / BRIDGE_SEGMENTS
  // Ship spans 4 segments, centered in the middle 4 of 16 (segments 6-9)
  const shipLeft = deckX + 6 * segW
  const shipRight = deckX + (6 + SHIP_SEGMENTS) * segW
  const shipW = shipRight - shipLeft
  const shipCX = (shipLeft + shipRight) / 2
  const shipTopY = bandY + 8
  const shipH = 70
  const shipCY = shipTopY + shipH * 0.5

  // Dotted marker lines (from deck bottom down to ship bottom)
  const markerTop = bandY + 2
  const markerBottom = shipTopY + shipH + 6

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* abutments / land masses */}
      <Abutment x={0} y={abutY} w={abutW + 4} h={abutH} />
      <Abutment x={VW - abutW - 4} y={abutY} w={abutW + 4} h={abutH} flip />

      {/* bridge horizontal support band */}
      <rect x={deckX} y={bandY} width={deckW} height={bandH} fill="#9CA3AF" stroke={INK} strokeWidth={1} />

      {/* checkerboard deck */}
      <BridgeDeck x={deckX} y={deckY} w={deckW} h={deckH} />

      {/* railing on top of deck */}
      <BridgeRailing x={deckX} y={railY} w={deckW} railH={railH} />

      {/* dotted lines marking ship width */}
      <line
        x1={shipLeft}
        y1={markerTop}
        x2={shipLeft}
        y2={markerBottom}
        stroke={INK}
        strokeWidth={1.2}
        strokeDasharray="4 3"
      />
      <line
        x1={shipRight}
        y1={markerTop}
        x2={shipRight}
        y2={markerBottom}
        stroke={INK}
        strokeWidth={1.2}
        strokeDasharray="4 3"
      />

      {/* the ship */}
      <Ship cx={shipCX} cy={shipCY} shipW={shipW} shipH={shipH} />

      {/* bridge length label above the railing */}
      <text
        x={VW / 2}
        y={railY - 6}
        textAnchor="middle"
        dominantBaseline="auto"
        fontSize={11}
        fontWeight={700}
        fill={INK}
      >
        156 m
      </text>
      {/* dimension arrows */}
      <line x1={deckX + 4} y1={railY - 4} x2={VW / 2 - 20} y2={railY - 4} stroke={INK} strokeWidth={1} />
      <line x1={VW / 2 + 20} y1={railY - 4} x2={VW - deckX - 4} y2={railY - 4} stroke={INK} strokeWidth={1} />
      <polygon points={`${deckX + 2},${railY - 7} ${deckX + 8},${railY - 4} ${deckX + 2},${railY - 1}`} fill={INK} />
      <polygon points={`${VW - deckX - 2},${railY - 7} ${VW - deckX - 8},${railY - 4} ${VW - deckX - 2},${railY - 1}`} fill={INK} />

      {/* "?" label for the ship width between the dotted lines */}
      <text
        x={shipCX}
        y={markerBottom + 10}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill="#2563EB"
      >
        ? m
      </text>
    </svg>
  )
}

export default function ShipBridge24G3Illustration() {
  return (
    <Frame>
      <ShipBridge24G3Figure />
    </Frame>
  )
}
