// WMI-23F3A-Q17 (2023 Grade 3 Final) — folded-triangle angle chase.
//
// "Triangle ABC is folded along EF, so that B maps to B' and C maps to C'.
//  If ∠EAF = 60° and ∠B'EA = 95°, find ∠AFC'."  Answer: 25° (fill-in).
//
// PROOF (for reference only — the static figure must NOT reveal 25°):
//   The fold reflects the flap across the crease EF, so it copies the triangle's
//   base angles: ∠AEF = ∠B'EF and ∠AFE = ∠C'FE.
//   At E the points A-E-B are collinear (E is on AB), and B' is the reflected B,
//   so  ∠AEB' = 180 − 2·∠AEF.   Likewise at F (A-F-C collinear):
//   ∠AFC' = 180 − 2·∠AFE.
//   In triangle AEF,  ∠AEF + ∠AFE = 180 − ∠EAF = 180 − 60 = 120, hence
//   ∠B'EA + ∠AFC' = (180−2·∠AEF) + (180−2·∠AFE) = 360 − 2·120 = 2·∠EAF = 120.
//   So  ∠AFC' = 120 − ∠B'EA = 120 − 95 = 25°.
//
// The default figure draws ONLY the folded configuration with the labelled points
// and the two GIVEN angles (∠EAF = 60° at A, ∠B'EA = 95° at E). It never shows
// ∠AFC'. The co-exported `FoldTriangle23G3` primitive adds the ∠AFC' = 25° tag at
// F only when `showAnswer` is set — the animator's post-answer reveal.
//
// Pure render: no Math.random, no Date, SSR-safe & deterministic. The coordinates
// below were solved so that ∠EAF = 60°, ∠B'EA = 95°, ∠AFC' = 25° exactly (the
// crease EF reflects the base triangle whose angles at E and F are 42.5° and
// 77.5°). A is the original apex; B, C are the original base (drawn DASHED); E, F
// lie on the crease; B', C' are the folded images bounding the shaded flap.

type Pt = [number, number]

// Un-tokened figure colours. The codebase uses raw hex where no qupu token maps
// (e.g. Angles23G3 LETTER_INK). The light-green fold tint has no token.
const INK = '#2B2119' // figure ink / labels
const FLAP_FILL = '#CDE8D5' // shaded folded flap (light green, from source)
const FLAP_STROKE = '#5C8B6E' // flap outline (muted green)

export const ANSWER = 25 // ∠AFC' in degrees — never drawn in the static figure

// --- solved geometry (authored in a local box, y down) ----------------------
const A: Pt = [228.9, 139.9] // original apex
const B: Pt = [32.9, 352.5] // original base-left  (dashed)
const C: Pt = [285.2, 320.3] // original base-right (dashed)
const E: Pt = [120, 258] // on AB, on the crease
const F: Pt = [262, 246] // on AC, on the crease
const Bp: Pt = [18.3, 179.5] // B' — folded image of B
const Cp: Pt = [272.4, 168.9] // C' — folded image of C

// --- angle-mark helpers (adapted from Angles23G3Illustration) ---------------

// Circular arc centred at `vertex`, swept the short way between the directions
// toward `a` and `b`, at radius `r`.
function angleArc(vertex: Pt, a: Pt, b: Pt, r: number): string {
  const ang = (p: Pt) => Math.atan2(p[1] - vertex[1], p[0] - vertex[0])
  const a0 = ang(a)
  let d = ang(b) - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  const a1 = a0 + d
  const sweep = d >= 0 ? 1 : 0
  const x0 = vertex[0] + r * Math.cos(a0)
  const y0 = vertex[1] + r * Math.sin(a0)
  const x1 = vertex[0] + r * Math.cos(a1)
  const y1 = vertex[1] + r * Math.sin(a1)
  return `M ${x0} ${y0} A ${r} ${r} 0 0 ${sweep} ${x1} ${y1}`
}

// Point along an angle's bisector, `dist` from the vertex (for placing labels).
function bisectorPoint(vertex: Pt, a: Pt, b: Pt, dist: number): Pt {
  const ang = (p: Pt) => Math.atan2(p[1] - vertex[1], p[0] - vertex[0])
  const a0 = ang(a)
  let d = ang(b) - a0
  while (d <= -Math.PI) d += 2 * Math.PI
  while (d > Math.PI) d -= 2 * Math.PI
  const mid = a0 + d / 2
  return [vertex[0] + dist * Math.cos(mid), vertex[1] + dist * Math.sin(mid)]
}

// Direction (unit) from `from` toward `to`, scaled by `s`, offset from `from`.
function along(from: Pt, to: Pt, s: number): Pt {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy) || 1
  return [from[0] + (dx / len) * s, from[1] + (dy / len) * s]
}

export interface FoldTriangle23G3Props {
  /** Reveal ∠AFC' = 25° at F (animator post-answer only). Default: hidden. */
  showAnswer?: boolean
}

const ARIA =
  'Segitiga ABC dilipat sepanjang garis EF sehingga titik B berpindah ke B beraksen ' +
  'dan titik C berpindah ke C beraksen. Titik A adalah puncak segitiga, alas BC digambar ' +
  'putus-putus sebagai posisi awal, E terletak pada AB dan F pada AC sebagai garis lipatan, ' +
  'sedangkan bagian yang terlipat (B beraksen, E, F, C beraksen) diarsir hijau muda. ' +
  'Diketahui sudut EAF = 60 derajat di titik A dan sudut B-beraksen-E-A = 95 derajat di titik E. ' +
  'Cari besar sudut A-F-C-beraksen.'

/**
 * The folded-triangle figure. With the default (`showAnswer = false`) it draws
 * only the setup and the two GIVEN angles (∠EAF = 60°, ∠B'EA = 95°). When
 * `showAnswer` is set it additionally tags ∠AFC' = 25° at F — for the animator's
 * post-answer reveal only.
 */
export function FoldTriangle23G3({ showAnswer = false }: FoldTriangle23G3Props = {}) {
  // --- layout / viewBox with headroom so arcs + labels never clip ----------
  const pts: Pt[] = [A, B, C, E, F, Bp, Cp]
  const margin = 30
  const minX = Math.min(...pts.map((p) => p[0])) - margin
  const minY = Math.min(...pts.map((p) => p[1])) - margin
  const maxX = Math.max(...pts.map((p) => p[0])) + margin
  const maxY = Math.max(...pts.map((p) => p[1])) + margin
  const width = maxX - minX
  const height = maxY - minY

  const STROKE = 2.6 // solid edges of the folded flap + creases to A
  const DASH = 2.4 // dashed original base

  // shaded folded flap: quadrilateral B' - E - F - C'
  const flap = `M ${Bp[0]} ${Bp[1]} L ${E[0]} ${E[1]} L ${F[0]} ${F[1]} L ${Cp[0]} ${Cp[1]} Z`

  // label offsets (each point's text nudged clear of the strokes)
  const labels: Array<{ p: Pt; t: string; dx: number; dy: number }> = [
    { p: A, t: 'A', dx: 6, dy: -8 },
    { p: B, t: 'B', dx: -2, dy: 20 },
    { p: C, t: 'C', dx: 12, dy: 16 },
    { p: E, t: 'E', dx: -4, dy: 22 },
    { p: F, t: 'F', dx: 16, dy: 4 },
    { p: Bp, t: "B'", dx: -22, dy: 6 },
    { p: Cp, t: "C'", dx: -2, dy: -12 },
  ]

  // angle-arc label anchors
  const eafLabel = bisectorPoint(A, E, F, 40) // ∠EAF = 60° (at A)
  const beaLabel = bisectorPoint(E, Bp, A, 40) // ∠B'EA = 95° (at E)
  const afcLabel = bisectorPoint(F, A, Cp, 40) // ∠AFC' = 25° (at F, answer)

  return (
    <svg
      viewBox={`${minX} ${minY} ${width} ${height}`}
      width={Math.min(300, width)}
      aria-hidden="true"
    >
      {/* shaded folded flap B'-E-F-C' */}
      <path d={flap} fill={FLAP_FILL} stroke={FLAP_STROKE} strokeWidth={STROKE} strokeLinejoin="round" />

      {/* original base BC + the legs down to it — DASHED (original position) */}
      <polyline
        points={`${B[0]},${B[1]} ${C[0]},${C[1]}`}
        fill="none"
        stroke={INK}
        strokeWidth={DASH}
        strokeDasharray="6 6"
        strokeLinecap="round"
      />
      <polyline
        points={`${E[0]},${E[1]} ${B[0]},${B[1]}`}
        fill="none"
        stroke={INK}
        strokeWidth={DASH}
        strokeDasharray="6 6"
        strokeLinecap="round"
      />
      <polyline
        points={`${F[0]},${F[1]} ${C[0]},${C[1]}`}
        fill="none"
        stroke={INK}
        strokeWidth={DASH}
        strokeDasharray="6 6"
        strokeLinecap="round"
      />

      {/* crease EF + the apex creases A-E and A-F (solid) */}
      <polyline
        points={`${E[0]},${E[1]} ${F[0]},${F[1]}`}
        fill="none"
        stroke={INK}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <polyline
        points={`${A[0]},${A[1]} ${E[0]},${E[1]}`}
        fill="none"
        stroke={INK}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <polyline
        points={`${A[0]},${A[1]} ${F[0]},${F[1]}`}
        fill="none"
        stroke={INK}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />

      {/* vertex dots */}
      {pts.map((p, i) => (
        <circle key={`d-${i}`} cx={p[0]} cy={p[1]} r={2.6} fill={INK} />
      ))}

      {/* GIVEN angle arc ∠EAF = 60° at A */}
      <path
        d={angleArc(A, along(A, E, 26), along(A, F, 26), 26)}
        fill="none"
        className="stroke-qupu-brand-blue"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <text
        x={eafLabel[0]}
        y={eafLabel[1]}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={700}
        className="fill-qupu-brand-blue"
      >
        60°
      </text>

      {/* GIVEN angle arc ∠B'EA = 95° at E */}
      <path
        d={angleArc(E, along(E, Bp, 24), along(E, A, 24), 24)}
        fill="none"
        className="stroke-qupu-brand-blue"
        strokeWidth={2.6}
        strokeLinecap="round"
      />
      <text
        x={beaLabel[0]}
        y={beaLabel[1]}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={700}
        className="fill-qupu-brand-blue"
      >
        95°
      </text>

      {/* ANSWER angle ∠AFC' = 25° at F — animator post-answer only */}
      {showAnswer && (
        <>
          <path
            d={angleArc(F, along(F, A, 24), along(F, Cp, 24), 24)}
            fill="none"
            className="stroke-qupu-brand-orange"
            strokeWidth={3.2}
            strokeLinecap="round"
          />
          <text
            x={afcLabel[0]}
            y={afcLabel[1]}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={15}
            fontWeight={800}
            className="fill-qupu-brand-orange"
          >
            25°
          </text>
        </>
      )}

      {/* point labels */}
      {labels.map((l) => (
        <text
          key={`l-${l.t}`}
          x={l.p[0] + l.dx}
          y={l.p[1] + l.dy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontStyle="italic"
          fontWeight={600}
          fill={INK}
        >
          {l.t}
        </text>
      ))}
    </svg>
  )
}

/**
 * Default export: the plain folded-triangle problem figure — labelled points,
 * the shaded flap, and ONLY the two given angles (∠EAF = 60°, ∠B'EA = 95°). It
 * never reveals ∠AFC' = 25°.
 */
export default function FoldTriangle23G3Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <FoldTriangle23G3 />
    </div>
  )
}
