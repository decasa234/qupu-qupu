// OSN 2020 SD Kabupaten Q10 — two-floor house plan comparison
// Source: docs/reference/ocr-res/osn/kabupaten/sd/2020.imgs/011.jpg (LT 1) & 012.jpg (LT 2)
// Floor 1: 4.5 m × 8 m = 36 m² (given). Floor 2: 4.5 m × 6 m = 27 m² (to find).
// No matching primitive; fresh SVG floor-plan outlines with room divisions + dimension labels.

export type FloorPlanPhase = 'problem' | 'ratio' | 'result'

export interface FloorPlanFigureProps {
  phase?: FloorPlanPhase
  lang?: 'en' | 'id'
}

// ── Layout (scale 1 m = 13 px) ────────────────────────────────────────────
const M  = 13           // px per metre
const PW = Math.round(4.5 * M)  // 58 — shared floor width
const H1 = 8 * M        // 104 — LT 1 height
const H2 = 6 * M        // 78  — LT 2 height (¾ of LT 1)

const X1 = 28           // LT 1 left edge
const X2 = 163          // LT 2 left edge  (X1 + PW + gap 77)
const YT = 36           // top of both plans

const VW = 255
const VH = 205

// ── Colours ───────────────────────────────────────────────────────────────
const FILL1   = '#FEF9C3'  // warm yellow — LT 1
const FILL2   = '#DBEAFE'  // cool blue   — LT 2
const GRN_BG  = '#D1FAE5'
const WALL    = '#374151'
const GRID_C  = '#D1D5DB'
const AMB     = '#B45309'
const GRN     = '#059669'

// Staircase hatch pattern id
const HATCH_ID = 'stair-hatch-osn20kq10'

// ── Helpers ───────────────────────────────────────────────────────────────
function DimLine({ x1, y1, x2, y2, label, color = WALL, below = false }:
  { x1:number; y1:number; x2:number; y2:number; label:string; color?:string; below?:boolean }) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dy = below ? 10 : -6
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={1} markerStart="url(#arr)" markerEnd="url(#arr)" />
      <text x={mx} y={my + dy} textAnchor="middle" fontSize={8} fill={color} fontWeight={600}>{label}</text>
    </>
  )
}

function GridLines({ x, y, w, h, stepH, stepV }: { x:number; y:number; w:number; h:number; stepH:number; stepV:number }) {
  const vl: number[] = [], hl: number[] = []
  for (let px = x + stepV; px < x + w; px += stepV) vl.push(px)
  for (let py = y + stepH; py < y + h; py += stepH) hl.push(py)
  return (
    <>
      {vl.map((px, i) => <line key={`v${i}`} x1={px} y1={y} x2={px} y2={y + h} stroke={GRID_C} strokeWidth={0.5} />)}
      {hl.map((py, i) => <line key={`h${i}`} x1={x} y1={py} x2={x + w} y2={py} stroke={GRID_C} strokeWidth={0.5} />)}
    </>
  )
}

/** Shared figure — imported by the explainer. */
export function FloorPlanFigure({ phase = 'problem', lang = 'id' }: FloorPlanFigureProps) {
  const showRatio  = phase === 'ratio'
  const showResult = phase === 'result'
  const lt2Fill    = showResult ? GRN_BG : FILL2
  const lt2AreaTxt = showResult ? '27 m²' : (lang === 'id' ? '? m²' : '? m²')
  const lt2Color   = showResult ? GRN : '#9CA3AF'

  // Floor 2 Y starts at same top as Floor 1 (same scale, just shorter)
  const Y1 = YT        // LT 1 top
  const Y2 = YT        // LT 2 top (same top, shorter height shows ratio)

  // Staircase region LT 1 — top-right: ~1.5 m × 3 m (in px: ~20 × 39)
  const stW1 = Math.round(1.5 * M)   // 20
  const stH1 = Math.round(3   * M)   // 39
  const stX1 = X1 + PW - stW1

  // Staircase region LT 2 — top-right: ~1.5 m × 2 m
  const stW2 = Math.round(1.5 * M)
  const stH2 = Math.round(2   * M)
  const stX2 = X2 + PW - stW2

  // Kitchen/service area LT 1: top 3 m
  const kitH = Math.round(3 * M)    // 39 px

  // Bedroom divider LT 2: at 3 m from top
  const bedH = Math.round(3 * M)    // 39 px

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <defs>
        <pattern id={HATCH_ID} width={4} height={4} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={4} stroke={GRID_C} strokeWidth={1.5} />
        </pattern>
        <marker id="arr" markerWidth={4} markerHeight={4} refX={2} refY={2} orient="auto">
          <path d="M0,0 L4,2 L0,4 Z" fill={WALL} />
        </marker>
      </defs>

      {/* ─── DENAH LT 1 ─────────────────────────────────────────── */}
      {/* Base fill */}
      <rect x={X1} y={Y1} width={PW} height={H1} fill={FILL1} stroke={WALL} strokeWidth={2} />

      {/* Grid lines every 1 m */}
      <GridLines x={X1} y={Y1} w={PW} h={H1} stepH={M} stepV={M} />

      {/* Kitchen/stair zone (top 3 m) — slightly darker fill */}
      <rect x={X1} y={Y1} width={PW} height={kitH} fill="#FDE68A" opacity={0.5} />

      {/* Staircase box LT 1 */}
      <rect x={stX1} y={Y1} width={stW1} height={stH1} fill={`url(#${HATCH_ID})`} stroke={WALL} strokeWidth={1} />

      {/* Horizontal divider at 3 m */}
      <line x1={X1} y1={Y1 + kitH} x2={X1 + PW} y2={Y1 + kitH} stroke={WALL} strokeWidth={1.2} />

      {/* Room labels LT 1 */}
      <text x={X1 + (PW - stW1)/2} y={Y1 + kitH/2} textAnchor="middle" dominantBaseline="central" fontSize={7} fill="#92400E">
        {lang === 'id' ? 'Dapur' : 'Kitchen'}
      </text>
      <text x={X1 + PW/2} y={Y1 + kitH + (H1 - kitH)/2} textAnchor="middle" dominantBaseline="central" fontSize={7} fill="#374151">
        {lang === 'id' ? 'Ruang Tamu' : 'Living Room'}
      </text>

      {/* LT 1 label */}
      <text x={X1 + PW/2} y={Y1 - 14} textAnchor="middle" fontSize={9} fontWeight={700} fill={WALL}>DENAH LT 1</text>

      {/* Width label LT 1 */}
      <DimLine x1={X1} y1={Y1 + H1 + 14} x2={X1 + PW} y2={Y1 + H1 + 14} label="4,5 m" below />

      {/* Height label LT 1 */}
      <DimLine x1={X1 - 16} y1={Y1} x2={X1 - 16} y2={Y1 + H1} label="8 m" color={AMB} />

      {/* Area label LT 1 (given) */}
      <text x={X1 + PW/2} y={Y1 + H1 + 38} textAnchor="middle" fontSize={9} fontWeight={800} fill={AMB}>
        36 m²
      </text>
      <text x={X1 + PW/2} y={Y1 + H1 + 48} textAnchor="middle" fontSize={7} fill="#6B7280">
        {lang === 'id' ? '(diketahui)' : '(given)'}
      </text>

      {/* ─── DENAH LT 2 ─────────────────────────────────────────── */}
      {/* Base fill */}
      <rect x={X2} y={Y2} width={PW} height={H2} fill={lt2Fill} stroke={WALL} strokeWidth={2} />

      {/* Grid lines every 1 m */}
      <GridLines x={X2} y={Y2} w={PW} h={H2} stepH={M} stepV={M} />

      {/* Staircase box LT 2 */}
      <rect x={stX2} y={Y2} width={stW2} height={stH2} fill={`url(#${HATCH_ID})`} stroke={WALL} strokeWidth={1} />

      {/* Bedroom divider at 3 m */}
      <line x1={X2} y1={Y2 + bedH} x2={X2 + PW} y2={Y2 + bedH} stroke={WALL} strokeWidth={1.2} />

      {/* Room labels LT 2 */}
      <text x={X2 + (PW - stW2)/2} y={Y2 + bedH/2} textAnchor="middle" dominantBaseline="central" fontSize={7} fill="#1E3A8A">
        {lang === 'id' ? 'Kamar 1' : 'Bedroom 1'}
      </text>
      <text x={X2 + PW/2} y={Y2 + bedH + (H2 - bedH)/2} textAnchor="middle" dominantBaseline="central" fontSize={7} fill={showResult ? '#065F46' : '#374151'}>
        {lang === 'id' ? 'Kamar 2' : 'Bedroom 2'}
      </text>

      {/* LT 2 label */}
      <text x={X2 + PW/2} y={Y2 - 14} textAnchor="middle" fontSize={9} fontWeight={700} fill={WALL}>DENAH LT 2</text>

      {/* Width label LT 2 */}
      <DimLine x1={X2} y1={Y2 + H2 + 14} x2={X2 + PW} y2={Y2 + H2 + 14} label="4,5 m" below />

      {/* Height label LT 2 */}
      <DimLine x1={X2 + PW + 14} y1={Y2} x2={X2 + PW + 14} y2={Y2 + H2} label="6 m" color={showResult ? GRN : '#6B7280'} />

      {/* Area label LT 2 */}
      <text x={X2 + PW/2} y={Y2 + H2 + 38} textAnchor="middle" fontSize={9} fontWeight={800} fill={lt2Color}>
        {lt2AreaTxt}
      </text>
      <text x={X2 + PW/2} y={Y2 + H2 + 48} textAnchor="middle" fontSize={7} fill="#6B7280">
        {lang === 'id' ? '(ditanya)' : '(to find)'}
      </text>

      {/* ─── Ratio comparison bracket (ratio phase) ────────────────── */}
      {showRatio && (
        <>
          {/* LT 1 height bracket */}
          <line x1={X1 - 8} y1={Y1} x2={X1 - 8} y2={Y1 + H1} stroke={AMB} strokeWidth={2} />
          <line x1={X1 - 12} y1={Y1} x2={X1 - 4} y2={Y1} stroke={AMB} strokeWidth={2} />
          <line x1={X1 - 12} y1={Y1 + H1} x2={X1 - 4} y2={Y1 + H1} stroke={AMB} strokeWidth={2} />

          {/* LT 2 height bracket */}
          <line x1={X2 + PW + 8} y1={Y2} x2={X2 + PW + 8} y2={Y2 + H2} stroke={GRN} strokeWidth={2} />
          <line x1={X2 + PW + 4} y1={Y2} x2={X2 + PW + 12} y2={Y2} stroke={GRN} strokeWidth={2} />
          <line x1={X2 + PW + 4} y1={Y2 + H2} x2={X2 + PW + 12} y2={Y2 + H2} stroke={GRN} strokeWidth={2} />

          {/* "= ¾" annotation */}
          <text x={(X1 - 8 + X2 + PW + 8) / 2} y={YT + H1/2} textAnchor="middle" fontSize={13} fontWeight={800} fill={GRN}>
            ¾
          </text>
          <text x={(X1 - 8 + X2 + PW + 8) / 2} y={YT + H1/2 + 16} textAnchor="middle" fontSize={8} fill="#374151">
            {lang === 'id' ? '6 = ¾ × 8' : '6 = ¾ × 8'}
          </text>
        </>
      )}
    </svg>
  )
}

export default function FloorPlanOSN20KQ10Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-3"
      role="img"
      aria-label="Denah rumah Pak Amir: Lantai 1 lebar 4,5 m × tinggi 8 m = 36 m² (diketahui). Lantai 2 lebar 4,5 m × tinggi 6 m. Berapa luas lantai 2?"
    >
      <FloorPlanFigure phase="problem" />
    </div>
  )
}
