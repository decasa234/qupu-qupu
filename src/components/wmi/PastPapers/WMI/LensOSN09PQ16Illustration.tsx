// LensOSN09PQ16Illustration — OSN-09-SD-PROV-Q16
//
// A 7 cm × 7 cm square contains a leaf-shaped (daun/lens) shaded region.
// Each curved boundary arc is a quarter-circle of radius 7 cm centred at a
// corner of the square:
//   Arc 1 — centred at top-right (TR), sweeps TL → BR (bulges toward BL interior).
//   Arc 2 — centred at bottom-left (BL), sweeps BR → TL (bulges toward TR interior).
//
// The lens is the intersection of the two quarter-circle sectors.
// Area derivation: Lens = 2 × ¼πr² − r² = 49(π/2 − 1) cm².
//
// Pure SVG — no hooks, no framer-motion — SSR-safe.
// Co-exports LensOSN09PQ16Figure (reused by the explainer).

const INK  = '#1F2937'  // square outline + labels
const BLUE = '#30598A'  // arc stroke
const FILL = '#BFDBFE'  // lens fill (light blue)
const AMB  = '#FCD34D'  // sector-1 highlight (amber)
const GRN  = '#86EFAC'  // sector-2 highlight (green)

// Square geometry: 7 cm → 140 px (20 px/cm), offset (40,30) for label room.
const S  = 140
const OX = 40
const OY = 30

// Corner coordinates
const TLx = OX,       TLy = OY
const TRx = OX + S,   TRy = OY
const BLx = OX,       BLy = OY + S
const BRx = OX + S,   BRy = OY + S

// ── Arc path builders ─────────────────────────────────────────────────────────
//
// SVG arc formula:  A rx ry x-rot large-arc sweep ex ey
// sweep=0 = counter-clockwise in SVG screen coords (y-down).
//
// Arc 1 (TL → BR, centre at TR, sweep=0): bulges toward BL interior.
//   Verified: SVG places centre at (180,30)=TR when fA=0, fS=0.
// Arc 2 (BR → TL, centre at BL, sweep=0): bulges toward TR interior.
//   Verified: SVG places centre at (40,170)=BL when fA=0, fS=0.

const arc1 = `M ${TLx} ${TLy} A ${S} ${S} 0 0 0 ${BRx} ${BRy}`
const arc2 = `M ${BRx} ${BRy} A ${S} ${S} 0 0 0 ${TLx} ${TLy}`

// Filled lens shape
const lensPath = `M ${TLx} ${TLy} A ${S} ${S} 0 0 0 ${BRx} ${BRy} A ${S} ${S} 0 0 0 ${TLx} ${TLy} Z`

// Sector pie slices (used in explainer beats)
const sector1Path = `M ${TRx} ${TRy} L ${TLx} ${TLy} A ${S} ${S} 0 0 0 ${BRx} ${BRy} Z`
const sector2Path = `M ${BLx} ${BLy} L ${BRx} ${BRy} A ${S} ${S} 0 0 0 ${TLx} ${TLy} Z`

// ── Shared figure primitive ───────────────────────────────────────────────────

export type LensHighlight = 'sector1' | 'sector2' | 'sectors' | null

export interface LensFigureProps {
  highlight?: LensHighlight
  showAnswer?: boolean
}

/** Core SVG figure reused by LensOSN09PQ16Explainer. */
export function LensOSN09PQ16Figure({
  highlight = null,
  showAnswer = false,
}: LensFigureProps = {}) {
  const showS1 = highlight === 'sector1' || highlight === 'sectors'
  const showS2 = highlight === 'sector2' || highlight === 'sectors'
  const cx = (OX + OX + S) / 2  // horizontal centre of square
  const cy = (OY + OY + S) / 2  // vertical centre of square

  return (
    <svg viewBox="0 0 245 215" width={280} aria-hidden="true">
      {/* Sector fills (explainer beats only) */}
      {showS1 && (
        <path d={sector1Path} fill={AMB} fillOpacity={0.55} stroke="none" />
      )}
      {showS2 && (
        <path d={sector2Path} fill={GRN} fillOpacity={0.55} stroke="none" />
      )}

      {/* Lens fill */}
      <path d={lensPath} fill={FILL} fillOpacity={0.75} stroke="none" />

      {/* Square outline */}
      <rect
        x={OX} y={OY} width={S} height={S}
        fill="none" stroke={INK} strokeWidth={1.8}
      />

      {/* Arc strokes */}
      <path d={arc1} fill="none" stroke={BLUE} strokeWidth={2.2} strokeLinecap="round" />
      <path d={arc2} fill="none" stroke={BLUE} strokeWidth={2.2} strokeLinecap="round" />

      {/* Dimension label — top edge */}
      <text
        x={cx} y={OY - 9}
        textAnchor="middle" dominantBaseline="auto"
        fontSize={14} fontWeight={600} fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        7 cm
      </text>
      {/* Dimension label — right edge */}
      <text
        x={OX + S + 11} y={cy}
        textAnchor="start" dominantBaseline="central"
        fontSize={14} fontWeight={600} fill={INK}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        7 cm
      </text>

      {/* Answer formula (final beat only) */}
      {showAnswer && (
        <text
          x={cx} y={OY + S + 30}
          textAnchor="middle" dominantBaseline="auto"
          fontSize={13} fontWeight={700} fill="#065F46"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {'49(π/2 − 1) cm²'}
        </text>
      )}
    </svg>
  )
}

// ── Default export (illustration for the drill viewer) ────────────────────────

const ARIA =
  'A 7 cm by 7 cm square. A leaf-shaped (daun) shaded region spans from the ' +
  'top-left corner to the bottom-right corner, bounded by two quarter-circle arcs ' +
  'each of radius 7 cm centred at the top-right and bottom-left corners of the square.'

export default function LensOSN09PQ16Illustration() {
  return (
    <div className="my-4 flex justify-center" role="img" aria-label={ARIA}>
      <LensOSN09PQ16Figure />
    </div>
  )
}
