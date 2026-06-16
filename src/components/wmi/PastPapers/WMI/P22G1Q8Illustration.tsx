// WMI-22P1A-Q8 (2022 Semifinal Grade 1 Paper A) — a scatter of vases and bones.
// Answer: C (35).
//
// Faithful redraw of db/seed/wmi/figures/2022-semifinal-g1-a-q8.jpg: a light-blue
// rounded field strewn with little orange VASES and tan BONES. A pixel count of
// the scan gives EXACTLY 35 vases (all ~equal area) and 6 bones — and the seed's
// answer is option C = 35, i.e. the number of vases. (The OCR'd "worth 3 / worth
// 6 / total value" wording does not reconcile with the figure arithmetically, so
// the figure + key agree only on the *count of vases* = 35 = option C; the
// explainer derives the answer by counting the vases.)
//
// We reproduce the scene with a FIXED, hand-placed layout: 35 vases + 6 bones,
// non-overlapping, in the same loose rows as the scan.
//
// The static figure shows ONLY the scatter — no count, no answer. The animator
// numbers the vases one by one via the co-exported VaseScatter22 primitive
// (countedVases prop). Pure render: SSR-safe & deterministic.

const BG = '#dceffb' // light-blue field
const VASE = '#e6820f' // body orange
const VASE_DK = '#c96d08' // base / foot
const BONE = '#f4e3c2' // bone tan
const BONE_DK = '#d9c397'
const COUNT_FILL = '#FEF3C7' // count badge
const COUNT_STROKE = '#f0853a' // qupu orange
const COUNT_INK = '#92400E'

export type Item = { x: number; y: number; kind: 'vase' | 'bone' }

// Fixed scatter — 35 vases + 6 bones, in three loose rows like the scan.
// Coordinates are in a 1031 x 381 viewBox (the scan's aspect).
export const ITEMS: readonly Item[] = [
  // ---- top band ----
  { x: 78, y: 96, kind: 'vase' },
  { x: 170, y: 86, kind: 'vase' },
  { x: 256, y: 110, kind: 'bone' },
  { x: 300, y: 92, kind: 'vase' },
  { x: 372, y: 96, kind: 'vase' },
  { x: 452, y: 78, kind: 'vase' },
  { x: 524, y: 70, kind: 'vase' },
  { x: 596, y: 92, kind: 'vase' },
  { x: 680, y: 80, kind: 'vase' },
  { x: 760, y: 96, kind: 'vase' },
  { x: 840, y: 84, kind: 'vase' },
  { x: 912, y: 84, kind: 'vase' },
  { x: 980, y: 92, kind: 'vase' },
  // ---- middle band ----
  { x: 56, y: 196, kind: 'vase' },
  { x: 124, y: 196, kind: 'vase' },
  { x: 210, y: 170, kind: 'vase' },
  { x: 286, y: 200, kind: 'vase' },
  { x: 356, y: 180, kind: 'vase' },
  { x: 420, y: 196, kind: 'vase' },
  { x: 462, y: 150, kind: 'bone' },
  { x: 538, y: 176, kind: 'vase' },
  { x: 584, y: 200, kind: 'vase' },
  { x: 660, y: 168, kind: 'bone' },
  { x: 528, y: 240, kind: 'bone' },
  { x: 668, y: 232, kind: 'vase' },
  { x: 748, y: 188, kind: 'vase' },
  { x: 836, y: 196, kind: 'vase' },
  { x: 916, y: 168, kind: 'vase' },
  { x: 980, y: 200, kind: 'vase' },
  // ---- bottom band ----
  { x: 110, y: 300, kind: 'vase' },
  { x: 184, y: 280, kind: 'vase' },
  { x: 286, y: 304, kind: 'vase' },
  { x: 372, y: 312, kind: 'bone' },
  { x: 430, y: 300, kind: 'vase' },
  { x: 510, y: 304, kind: 'vase' },
  { x: 612, y: 302, kind: 'vase' },
  { x: 668, y: 318, kind: 'bone' },
  { x: 752, y: 268, kind: 'vase' },
  { x: 836, y: 280, kind: 'vase' },
  { x: 916, y: 276, kind: 'vase' },
  { x: 980, y: 280, kind: 'vase' },
] as const

export const VASE_COUNT = ITEMS.filter((i) => i.kind === 'vase').length // 35
export const BONE_COUNT = ITEMS.filter((i) => i.kind === 'bone').length // 6

/** A little orange vase centred at (x, y). */
export function Vase({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* body */}
      <path
        d="M0 -26 C 6 -26 7 -20 4 -16 C 14 -10 14 6 8 14 C 4 19 -4 19 -8 14 C -14 6 -14 -10 -4 -16 C -7 -20 -6 -26 0 -26 Z"
        fill={VASE}
      />
      {/* neck rim */}
      <rect x={-5} y={-28} width={10} height={4} rx={2} fill={VASE} />
      {/* base / foot */}
      <rect x={-7} y={16} width={14} height={5} rx={1.5} fill={VASE_DK} />
    </g>
  )
}

/** A little tan bone centred at (x, y). */
export function Bone({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(28)`}>
      <rect x={-15} y={-4} width={30} height={8} rx={4} fill={BONE} stroke={BONE_DK} strokeWidth={1} />
      <circle cx={-15} cy={-5} r={5} fill={BONE} stroke={BONE_DK} strokeWidth={1} />
      <circle cx={-15} cy={5} r={5} fill={BONE} stroke={BONE_DK} strokeWidth={1} />
      <circle cx={15} cy={-5} r={5} fill={BONE} stroke={BONE_DK} strokeWidth={1} />
      <circle cx={15} cy={5} r={5} fill={BONE} stroke={BONE_DK} strokeWidth={1} />
    </g>
  )
}

const VIEW_W = 1031
const VIEW_H = 381

export interface VaseScatter22Props {
  /** How many vases have been numbered so far (in ITEMS reading order). */
  countedVases?: number
}

/** The scatter field. Optionally numbers the first N vases (animation only). */
export function VaseScatter22({ countedVases = 0 }: VaseScatter22Props = {}) {
  let vaseSeen = 0
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 640, display: 'block', margin: '0 auto' }} aria-hidden="true">
      {/* field */}
      <rect x={6} y={6} width={VIEW_W - 12} height={VIEW_H - 12} rx={40} fill={BG} />
      {ITEMS.map((it, i) => {
        if (it.kind === 'bone') return <Bone key={i} x={it.x} y={it.y} />
        vaseSeen += 1
        const n = vaseSeen
        const numbered = n <= countedVases
        return (
          <g key={i}>
            <Vase x={it.x} y={it.y} />
            {numbered && (
              <g>
                <circle cx={it.x} cy={it.y - 34} r={11} fill={COUNT_FILL} stroke={COUNT_STROKE} strokeWidth={2} />
                <text x={it.x} y={it.y - 34} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={900} fill={COUNT_INK}>
                  {n}
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function P22G1Q8Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A light-blue field scattered with little orange vases and a few tan bones. Count the vases."
    >
      <VaseScatter22 />
    </div>
  )
}
