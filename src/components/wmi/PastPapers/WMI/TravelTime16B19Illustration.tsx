// TravelTime16B19Illustration.tsx
//
// Stem illustration for SEAMO-16-B-Q19:
//   "The distance between Medan city and Lake Toba is approximately 90 km.
//    Henry left Medan for Lake Toba at 8:00 am, travelling at a constant speed of
//    90 km/h. 20 minutes later, Annisa left Medan also for Lake Toba, at 120 km/h.
//    How far was Annisa's car from the destination when Henry had arrived?"
//
// Classification: stem — the OCR references an image (2016.imgs/017.jpg) for Q19.
// The figure is a horizontal distance map:
//   Medan  ──────────────────────────────  Lake Toba (90 km)
// with two traveller markers showing their positions at 9:00 am:
//   Henry  → arrived at Lake Toba (80 km from Medan when Annisa departs,
//             i.e. Annisa has covered 80 km and is 10 km short of Toba).
//
// Primitive: NodeGraph from ./primitives/NodeGraph (node-edge graph / distance map).
// Adapted from: Graph15ECIllustration pattern (two endpoint nodes + intermediate marker).
//
// Pure SVG, SSR-safe — no hooks, no framer-motion.

import { NodeGraph } from './primitives/NodeGraph'

// ── Layout constants ───────────────────────────────────────────────────────────

const W = 340
const H = 180

// Node x positions (y = mid-row for the road)
const ROAD_Y = 90
const MEDAN_X = 40
const TOBA_X = 300

// Annisa's position at 9:00 am: she has driven 80 km out of 90 km
// Map 90 km → (TOBA_X - MEDAN_X) = 260 px
const KM_TO_PX = (TOBA_X - MEDAN_X) / 90   // ≈ 2.889 px / km
const ANNISA_X = MEDAN_X + 80 * KM_TO_PX    // 80 km covered

// ── Colour palette ─────────────────────────────────────────────────────────────

const BLUE   = '#2563EB'   // Henry
const ORANGE = '#EA580C'   // Annisa
const GREEN  = '#16A34A'   // Lake Toba destination

// ── Exported params (bound to seed breakdown.quantities) ───────────────────────

/** Distance Medan → Lake Toba */
export const TOTAL_KM = 90
/** Distance Annisa covered when Henry arrives */
export const ANNISA_COVERED_KM = 80
/** Remaining distance (the answer) */
export const REMAINING_KM = 10

// ── Figure component ───────────────────────────────────────────────────────────

export default function TravelTime16B19Illustration() {
  // NodeGraph nodes:
  //   M  = Medan (start, left)
  //   T  = Lake Toba (end, right, green)
  //   A  = Annisa's position at 9:00 am (80 km)
  //   H  = Henry — he is AT Toba, so shares the same node visually;
  //        we indicate his arrival with a flag glyph above Toba instead.
  const nodes = [
    { id: 'M', x: MEDAN_X,   y: ROAD_Y, fill: '#F5F0E8', label: 'M' },
    { id: 'A', x: ANNISA_X,  y: ROAD_Y, fill: ORANGE,    label: 'A' },
    { id: 'T', x: TOBA_X,    y: ROAD_Y, fill: GREEN,     label: 'T' },
  ]

  const edges = [
    // Medan → Annisa's position (road travelled by Annisa)
    { a: 'M', b: 'A', label: '80 km', color: ORANGE },
    // Annisa's position → Toba (remaining gap — the answer)
    { a: 'A', b: 'T', label: '10 km', color: '#9CA3AF' },
  ]

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label={
        'Distance map: Medan to Lake Toba (90 km). ' +
        'Henry (blue) leaves at 8:00 am at 90 km/h and arrives at Lake Toba at 9:00 am. ' +
        'Annisa (orange) leaves at 8:20 am at 120 km/h; by 9:00 am she has covered 80 km ' +
        'and is 10 km from Lake Toba.'
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        {/* ── Road baseline ──────────────────────────────────────────────────── */}
        <line
          x1={MEDAN_X} y1={ROAD_Y}
          x2={TOBA_X}  y2={ROAD_Y}
          stroke="#D1D5DB"
          strokeWidth={6}
          strokeLinecap="round"
        />

        {/* ── NodeGraph draws nodes + edge labels ──────────────────────────── */}
        {/* We render NodeGraph in a nested <svg> with matching viewBox so the
            coordinate space lines up exactly with our road line above. */}
        <NodeGraph
          nodes={nodes}
          edges={edges}
          nodeR={16}
          width={W}
          height={H}
        />

        {/* ── Henry flag at Lake Toba ───────────────────────────────────────── */}
        {/* Henry arrived — a small flag above the Toba node */}
        <line
          x1={TOBA_X + 10} y1={ROAD_Y - 16}
          x2={TOBA_X + 10} y2={ROAD_Y - 44}
          stroke={BLUE} strokeWidth={2} strokeLinecap="round"
        />
        <polygon
          points={`${TOBA_X + 10},${ROAD_Y - 44} ${TOBA_X + 28},${ROAD_Y - 38} ${TOBA_X + 10},${ROAD_Y - 30}`}
          fill={BLUE}
        />

        {/* ── Labels: city names ────────────────────────────────────────────── */}
        <text
          x={MEDAN_X}
          y={ROAD_Y + 32}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="#374151"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Medan
        </text>
        <text
          x={TOBA_X}
          y={ROAD_Y + 32}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill={GREEN}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Lake Toba
        </text>

        {/* ── Legend ────────────────────────────────────────────────────────── */}
        {/* Henry label */}
        <circle cx={TOBA_X + 10} cy={ROAD_Y - 56} r={5} fill={BLUE} />
        <text
          x={TOBA_X + 18} y={ROAD_Y - 56}
          dominantBaseline="central"
          fontSize={10}
          fontWeight={600}
          fill={BLUE}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Henry (arrived)
        </text>

        {/* Annisa label */}
        <circle cx={MEDAN_X + 4} cy={ROAD_Y - 26} r={5} fill={ORANGE} />
        <text
          x={MEDAN_X + 12} y={ROAD_Y - 26}
          dominantBaseline="central"
          fontSize={10}
          fontWeight={600}
          fill={ORANGE}
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          Annisa (at 9:00 am)
        </text>

        {/* Total distance brace label */}
        <text
          x={(MEDAN_X + TOBA_X) / 2}
          y={18}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill="#6B7280"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          90 km total
        </text>
      </svg>
    </div>
  )
}

// ── VISUALS entry (the exact registry object literal for SEAMO-16-B-Q19) ──────

export const VISUALS_ENTRY = {
  illustration: () =>
    import('./TravelTime16B19Illustration').then((m) => ({ default: m.default })),
}
