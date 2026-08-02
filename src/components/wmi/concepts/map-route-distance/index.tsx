import { NodeGraph } from '../../PastPapers/WMI/primitives/NodeGraph'

// In-card figure for `map-route-distance`. The stem states the rules; this
// picture carries the evidence — which towns exist, which pairs actually have a
// road between them, and how many km each of those roads is worth.
//
// It must NEVER hint at which route wins: no route is drawn thicker, brighter or
// straighter than another, and the aria-label reads the map out road by road
// without ever adding two of them together.
//
// Geometry is entirely NodeGraph's; this file only supplies data. The one thing
// drawn on top is the town NAME under each circle — the circle itself carries a
// single letter (NodeGraph sizes node text to the radius, so a name would spill
// out of it) while every sentence in the question uses the full name.
//
// Pure SVG, no hooks, no randomness: safe to render on the server and identical
// for the same params every time.

/** Mirrors MAP_WIDTH / MAP_HEIGHT / NODE_R in api/services/wmi/concepts/map-route-distance. */
const WIDTH = 300
const HEIGHT = 250
const NODE_R = 18

const SHELL = '#F5F0E8'
const BLUE_SOFT = '#E1EFFB'
const INK = '#1F2937'

interface Town {
  id: string
  name: string
  x: number
  y: number
}

interface Road {
  a: string
  b: string
  km: number
  curve: number
}

interface Params {
  towns: Town[]
  roads: Road[]
  from: string
  to: string
}

const FALLBACK: Params = {
  towns: [
    { id: 'B', name: 'Bogor', x: 56, y: 56 },
    { id: 'D', name: 'Depok', x: 252, y: 186 },
    { id: 'C', name: 'Ciawi', x: 246, y: 44 },
    { id: 'S', name: 'Sentul', x: 44, y: 176 },
  ],
  roads: [
    { a: 'B', b: 'C', km: 4, curve: 0 },
    { a: 'C', b: 'D', km: 3, curve: 0 },
    { a: 'B', b: 'D', km: 9, curve: 0 },
    { a: 'B', b: 'S', km: 5, curve: 0 },
    { a: 'S', b: 'C', km: 2, curve: 0 },
  ],
  from: 'B',
  to: 'D',
}

const int = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback

const text = (v: unknown): string => (typeof v === 'string' ? v : '')

/**
 * Params arrive as `unknown` from the DB, so every field is re-derived and
 * clamped. Anything that does not add up falls back whole rather than in
 * pieces — half a map would draw roads nobody built.
 */
function read(raw: unknown): Params {
  const p = (raw ?? {}) as Partial<Params>
  const towns = (Array.isArray(p.towns) ? p.towns : [])
    .map((t) => ({
      id: text((t as Town)?.id).slice(0, 1),
      name: text((t as Town)?.name),
      x: Math.max(0, Math.min(WIDTH, int((t as Town)?.x, -1))),
      y: Math.max(0, Math.min(HEIGHT, int((t as Town)?.y, -1))),
    }))
    .filter((t) => t.id !== '' && t.name !== '')
  if (towns.length < 2 || new Set(towns.map((t) => t.id)).size !== towns.length) return FALLBACK

  const ids = new Set(towns.map((t) => t.id))
  const roads = (Array.isArray(p.roads) ? p.roads : [])
    .map((r) => ({
      a: text((r as Road)?.a).slice(0, 1),
      b: text((r as Road)?.b).slice(0, 1),
      km: int((r as Road)?.km, 0),
      curve: Math.max(-60, Math.min(60, int((r as Road)?.curve, 0))),
    }))
    .filter((r) => r.a !== r.b && ids.has(r.a) && ids.has(r.b) && r.km > 0)
  if (roads.length === 0) return FALLBACK

  const from = ids.has(text(p.from)) ? text(p.from) : towns[0].id
  const to = ids.has(text(p.to)) && text(p.to) !== from ? text(p.to) : towns[1].id
  return { towns, roads, from, to }
}

export default function MapRouteDistanceIllustration({ params }: { params: unknown }) {
  const p = read(params)
  const nameOf = (id: string): string => p.towns.find((t) => t.id === id)?.name ?? id

  // Every town looks the same except the two the walk runs between, which are
  // tinted so a child can find them without hunting through the names.
  const nodes = p.towns.map((t) => ({
    id: t.id,
    x: t.x,
    y: t.y,
    label: t.id,
    fill: t.id === p.from || t.id === p.to ? BLUE_SOFT : SHELL,
  }))
  const edges = p.roads.map((r) => ({
    a: r.a,
    b: r.b,
    label: String(r.km),
    curve: r.curve,
  }))

  // The label speaks only what is drawn: which towns exist and how long each
  // road is. It never adds two roads together, so it cannot leak the answer.
  const roadSpeech = p.roads
    .map((r) => `${nameOf(r.a)} ke ${nameOf(r.b)} sepanjang ${r.km} km`)
    .join('; ')
  const ariaLabel =
    `Peta dengan ${p.towns.length} kota: ${p.towns.map((t) => t.name).join(', ')}. ` +
    `Jalan yang tersedia: ${roadSpeech}.`

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ maxWidth: '20rem' }}>
        <NodeGraph nodes={nodes} edges={edges} nodeR={NODE_R} width={WIDTH} height={HEIGHT} />
        {/* Town names, printed under their circle. Drawn after the graph so the
            white halo sits over any road that passes nearby. */}
        {p.towns.map((t) => (
          <text
            key={`name-${t.id}`}
            x={t.x}
            y={t.y + NODE_R + 12}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={700}
            fill={INK}
            stroke="white"
            strokeWidth={3}
            paintOrder="stroke"
            className="font-display"
          >
            {t.name}
          </text>
        ))}
      </svg>
    </div>
  )
}
