/**
 * WMI-23F1A-Q12 (2023 Grade 1 Final, Paper A) — bracelet length ordering.
 *
 * Alice, Becky and Chloe each thread a bracelet from FOUR kinds of beads. When
 * each bracelet is straightened, order them longest -> shortest.
 *
 * --- Legend (read from the source scan) ----------------------------------
 *   big square  (BS) = 3 cm   (large tilted square)
 *   big circle  (BC) = 2 cm   (large circle)
 *   small diamond (SD) = 1 cm (tiny tilted square)
 *   small circle (SC) = 1 cm  (small circle)
 *
 * --- Bead sequences + totals (one clean monochrome shape set) -------------
 *   Alice  : 4 big squares, 4 big circles, 2 small circles, 1 small diamond
 *            = 4*3 + 4*2 + 2*1 + 1*1 = 12 + 8 + 2 + 1 = 23 cm
 *   Becky  : 2 big squares, 4 big circles, 4 small circles, 1 small diamond
 *            = 2*3 + 4*2 + 4*1 + 1*1 =  6 + 8 + 4 + 1 = 19 cm
 *   Chloe  : 4 big squares, 1 big circle, 2 small circles, 2 small diamonds
 *            = 4*3 + 1*2 + 2*1 + 2*1 = 12 + 2 + 2 + 2 = 18 cm
 *
 * CONFIRMED order longest -> shortest:  Alice (23) > Becky (19) > Chloe (18)
 *   => answer (B) Alice, Becky, Chloe.
 *
 * The DEFAULT export draws only the problem setup: the legend + three labelled
 * coiled bracelets. It never straightens them, never shows totals and never
 * reveals the order. The exported `Bracelets23G1` primitive lets the animator
 * straighten each bracelet, reveal its total length and arrange the rows.
 *
 * Pure render, no random / no dates, SSR-safe and deterministic.
 */

// ---------------------------------------------------------------------------
// Bead model
// ---------------------------------------------------------------------------

type BeadKind = 'BS' | 'BC' | 'SD' | 'SC'

interface BeadDef {
  kind: BeadKind
  /** length in cm */
  cm: number
  /** drawn glyph half-extent (px) used for both legend + bracelet */
  r: number
  shape: 'circle' | 'square' | 'diamond'
}

const BEADS: Record<BeadKind, BeadDef> = {
  BS: { kind: 'BS', cm: 3, r: 15, shape: 'square' },
  BC: { kind: 'BC', cm: 2, r: 12, shape: 'circle' },
  SD: { kind: 'SD', cm: 1, r: 7, shape: 'diamond' },
  SC: { kind: 'SC', cm: 1, r: 8, shape: 'circle' },
}

/** Legend draw order: 3cm square, 1cm diamond, 2cm circle, 1cm circle. */
const LEGEND_ORDER: BeadKind[] = ['BS', 'SD', 'BC', 'SC']

interface BraceletDef {
  name: string
  beads: BeadKind[]
}

// Sequences chosen so the per-bead lengths total to the confirmed figures.
const ALICE: BraceletDef = {
  name: 'Alice',
  beads: ['BS', 'BC', 'BC', 'SC', 'BS', 'SD', 'BS', 'SC', 'BC', 'BC', 'BS'],
}
const BECKY: BraceletDef = {
  name: 'Becky',
  beads: ['BC', 'BS', 'BC', 'SD', 'SC', 'BC', 'SC', 'BC', 'SC', 'BS', 'SC'],
}
const CHLOE: BraceletDef = {
  name: 'Chloe',
  beads: ['BS', 'BS', 'SC', 'SD', 'BC', 'SD', 'SC', 'BS', 'BS'],
}

const BRACELETS: Record<string, BraceletDef> = {
  Alice: ALICE,
  Becky: BECKY,
  Chloe: CHLOE,
}

function total(b: BraceletDef): number {
  return b.beads.reduce((s, k) => s + BEADS[k].cm, 0)
}

// ---------------------------------------------------------------------------
// Colours (qupu palette; raw hex permitted for this paper figure)
// ---------------------------------------------------------------------------

const INK = '#3B342F' // dark warm ink for bead outlines / string
const STRING = '#8C7B6B'
const FILL = '#FFFFFF'
const LABEL = '#C2410C' // qupu brand orange-ish for the name labels
const TOTAL_FILL = '#2563EB' // qupu brand blue for revealed totals

// ---------------------------------------------------------------------------
// One drawn bead glyph (identical everywhere)
// ---------------------------------------------------------------------------

function Bead({ kind, cx, cy }: { kind: BeadKind; cx: number; cy: number }) {
  const d = BEADS[kind]
  if (d.shape === 'circle') {
    return <circle cx={cx} cy={cy} r={d.r} fill={FILL} stroke={INK} strokeWidth={2} />
  }
  if (d.shape === 'square') {
    // big square drawn as a tilted (diamond-oriented) square, matching the scan
    const r = d.r
    return (
      <polygon
        points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
        fill={FILL}
        stroke={INK}
        strokeWidth={2}
      />
    )
  }
  // small diamond
  const r = d.r
  return (
    <polygon
      points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`}
      fill={FILL}
      stroke={INK}
      strokeWidth={2}
    />
  )
}

// ---------------------------------------------------------------------------
// Layout helpers — coiled (looped) vs straightened bead paths
// ---------------------------------------------------------------------------

const COILED_W = 150
const ROW_GAP = 96
const ROW_TOP = 78
const STRAIGHT_LEFT = 58
const BEAD_GAP = 26 // centre-to-centre spacing along a straightened string
const PX_PER_CM = 9 // for the revealed total bar

/** Even spread of beads around an ellipse for the coiled look. */
function coiledPositions(n: number, ccx: number, ccy: number) {
  const rx = COILED_W / 2 - 16
  const ry = ROW_GAP / 2 - 12
  return Array.from({ length: n }, (_, i) => {
    const a = (-Math.PI / 2) + (i * 2 * Math.PI) / n
    return { x: ccx + rx * Math.cos(a), y: ccy + ry * Math.sin(a) }
  })
}

/** Beads in a straight horizontal line. */
function straightPositions(n: number, x0: number, y: number) {
  return Array.from({ length: n }, (_, i) => ({ x: x0 + i * BEAD_GAP, y }))
}

// ---------------------------------------------------------------------------
// One bracelet row (coiled or straightened, with optional total)
// ---------------------------------------------------------------------------

interface RowProps {
  def: BraceletDef
  y: number
  straighten: boolean
  revealLengths: boolean
}

function BraceletRow({ def, y, straighten, revealLengths }: RowProps) {
  const n = def.beads.length
  const positions = straighten
    ? straightPositions(n, STRAIGHT_LEFT, y)
    : coiledPositions(n, STRAIGHT_LEFT + COILED_W / 2, y)

  const tot = total(def)

  return (
    <g>
      {/* name label */}
      <text x={14} y={y + 5} fontSize={15} fontWeight={700} fill={LABEL}>
        {def.name}
      </text>

      {/* the string */}
      {straighten ? (
        <line
          x1={positions[0].x}
          y1={y}
          x2={positions[n - 1].x}
          y2={y}
          stroke={STRING}
          strokeWidth={2}
        />
      ) : (
        <ellipse
          cx={STRAIGHT_LEFT + COILED_W / 2}
          cy={y}
          rx={COILED_W / 2 - 16}
          ry={ROW_GAP / 2 - 12}
          fill="none"
          stroke={STRING}
          strokeWidth={2}
        />
      )}

      {/* beads */}
      {positions.map((p, i) => (
        <Bead key={i} kind={def.beads[i]} cx={p.x} cy={p.y} />
      ))}

      {/* revealed total — only when the animator asks for it */}
      {revealLengths && (
        <g>
          <rect
            x={STRAIGHT_LEFT + n * BEAD_GAP + 8}
            y={y - 13}
            width={tot * PX_PER_CM + 14}
            height={26}
            rx={7}
            fill={TOTAL_FILL}
          />
          <text
            x={STRAIGHT_LEFT + n * BEAD_GAP + 8 + (tot * PX_PER_CM + 14) / 2}
            y={y + 5}
            textAnchor="middle"
            fontSize={14}
            fontWeight={700}
            fill="#FFFFFF"
          >
            {`${tot} cm`}
          </text>
        </g>
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
// The legend strip (each bead kind = its cm length)
// ---------------------------------------------------------------------------

function Legend({ y }: { y: number }) {
  const slot = 92
  const left = 18
  return (
    <g>
      {LEGEND_ORDER.map((kind, i) => {
        const cx = left + i * slot + 22
        return (
          <g key={kind}>
            <Bead kind={kind} cx={cx} cy={y} />
            <text x={cx + 22} y={y + 5} fontSize={15} fontWeight={700} fill={INK}>
              {`= ${BEADS[kind].cm} cm`}
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ---------------------------------------------------------------------------
// Primitive: the animator drives straighten / revealLengths / order.
// ---------------------------------------------------------------------------

export interface Bracelets23G1Props {
  /** Straighten each bracelet into a horizontal line. */
  straighten?: boolean
  /** Show each bracelet's total length (a blue cm bar). */
  revealLengths?: boolean
  /** Row order top -> bottom by name, e.g. ['Alice','Becky','Chloe']. */
  order?: string[]
  /** Hide the bead-length legend (animator may suppress it mid-sequence). */
  hideLegend?: boolean
}

const DEFAULT_ORDER = ['Alice', 'Becky', 'Chloe']

export function Bracelets23G1({
  straighten = false,
  revealLengths = false,
  order,
  hideLegend = false,
}: Bracelets23G1Props) {
  const names =
    Array.isArray(order) && order.length === 3 && order.every((n) => n in BRACELETS)
      ? order
      : DEFAULT_ORDER

  const legendY = 30
  const firstRow = hideLegend ? 56 : ROW_TOP
  // when straightened, totals can sit far right -> widen the viewBox
  const maxBeads = Math.max(...names.map((n) => BRACELETS[n].beads.length))
  const straightWidth =
    STRAIGHT_LEFT + maxBeads * BEAD_GAP + 8 + 23 * PX_PER_CM + 14 + 8
  const width = straighten ? Math.max(360, straightWidth) : 360
  const height = firstRow + (names.length - 1) * ROW_GAP + 64

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(320, width)}>
      {!hideLegend && <Legend y={legendY} />}
      {!hideLegend && (
        <line x1={14} y1={legendY + 26} x2={width - 14} y2={legendY + 26} stroke="#E7DDD2" strokeWidth={1.5} />
      )}
      {names.map((name, i) => (
        <BraceletRow
          key={name}
          def={BRACELETS[name]}
          y={firstRow + i * ROW_GAP}
          straighten={straighten}
          revealLengths={revealLengths}
        />
      ))}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Default export — the in-card problem figure.
// ---------------------------------------------------------------------------

export default function Bracelets23G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Legenda manik: persegi besar = 3 cm, wajik kecil = 1 cm, lingkaran besar = 2 cm, ' +
        'lingkaran kecil = 1 cm. Tiga gelang melingkar milik Alice, Becky, dan Chloe dari ' +
        'rangkaian manik-manik. Urutkan dari yang terpanjang ke terpendek saat gelang ' +
        'diluruskan.'
      }
    >
      <Bracelets23G1 />
    </div>
  )
}
