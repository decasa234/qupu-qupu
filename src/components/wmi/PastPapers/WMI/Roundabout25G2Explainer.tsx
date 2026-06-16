// Post-answer explainer for WMI-25F2A-Q20 (2025 Grade-2 Final, Q20).
// Strategy: name three arcs x/y/z, sum all three trips to get 2·loop = 852
// → loop = 426, then subtract the known y+z = Brenda→Ashley = 332 to get
// Ashley→Brenda = x = 94 m.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ROUNDABOUT_ARCS } from './Roundabout25G2Illustration'

// ── colour tokens (mirror static illustration) ────────────────────────────────
const CLR_ROAD   = '#D1D5DB'   // fill-gray-300
const CLR_ISLAND = '#F9FAFB'   // fill-gray-50
const CLR_BORDER = '#9CA3AF'   // stroke-gray-400
const CLR_LABEL  = '#B45309'   // amber-700 — known-arc labels
const CLR_KNOWN  = '#F59E0B'   // amber-400 — highlighted known arc
const CLR_UNKNOWN = '#3B82F6'  // blue-500  — the unknown arc (Ashley→Brenda)
const CLR_ANSWER  = '#10B981'  // green-500 — final answer beat
const CLR_HOUSE   = '#4ADE80'  // house roof colour
const CLR_TEXT    = '#1F2937'

// ── geometry (shared with illustration, duplicated for isolation) ─────────────
const CX = 140
const CY = 128
const R_OUTER = 72
const R_INNER = 46
const R_MID   = (R_OUTER + R_INNER) / 2
const R_PERSON = R_OUTER + 32

// Math-convention polar → SVG xy (y-down)
function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180
  return [cx + r * Math.cos(rad), cy - r * Math.sin(rad)]
}

// Arc path CCW (visually counterclockwise)
function arcPath(r: number, a1Deg: number, a2Deg: number): string {
  const [x1, y1] = polar(CX, CY, r, a1Deg)
  const [x2, y2] = polar(CX, CY, r, a2Deg)
  let span = a1Deg - a2Deg
  if (span < 0) span += 360
  const large = span > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`
}

function midAngleCCW(a1: number, a2: number): number {
  let diff = a1 - a2
  if (diff < 0) diff += 360
  const mid = a1 - diff / 2
  return ((mid % 360) + 360) % 360
}

// Person angles (math convention)
const A_ASHLEY = 130
const A_BRENDA = 210
const A_CHERYL = 330

// ── Mini-roundabout ring ───────────────────────────────────────────────────────
// Draws the road ring, island and optional arc highlights plus house dots.
type ArcHighlight = {
  from: number
  to: number
  color: string
  label?: string
  labelR?: number
  strokeWidth?: number
}

function Ring({ highlights }: { highlights: ArcHighlight[] }) {
  // Dashed centre-line: 12 short arcs
  const dashes = Array.from({ length: 12 }, (_, i) => {
    const a1 = (i * 360) / 12
    const a2 = ((i + 0.55) * 360) / 12
    return arcPath(R_MID, a1, a2)
  })

  return (
    <g>
      {/* Road fill */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill={CLR_ROAD} />
      {/* Centre island */}
      <circle cx={CX} cy={CY} r={R_INNER} fill={CLR_ISLAND} stroke={CLR_BORDER} strokeWidth={1} />
      {/* Outer border */}
      <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke={CLR_BORDER} strokeWidth={1.5} />
      {/* Dashes */}
      {dashes.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="white" strokeWidth={1.5} />
      ))}
      {/* Highlighted arcs */}
      {highlights.map((h, i) => {
        const d = arcPath(R_MID + 4, h.from, h.to)
        const lAngle = midAngleCCW(h.from, h.to)
        const lr = h.labelR ?? R_OUTER + 20
        const [lx, ly] = polar(CX, CY, lr, lAngle)
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={h.color} strokeWidth={h.strokeWidth ?? 5} strokeLinecap="round" opacity={0.85} />
            {h.label && (
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight={700} fill={h.color}>
                {h.label}
              </text>
            )}
          </g>
        )
      })}
      {/* House dots */}
      {[
        { angle: A_ASHLEY, name: 'A' },
        { angle: A_BRENDA, name: 'B' },
        { angle: A_CHERYL, name: 'C' },
      ].map(({ angle, name }) => {
        const [hx, hy] = polar(CX, CY, R_PERSON - 16, angle)
        return (
          <g key={name}>
            <circle cx={hx} cy={hy} r={12} fill={CLR_HOUSE} stroke={CLR_TEXT} strokeWidth={1.5} />
            <text x={hx} y={hy} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={800} fill={CLR_TEXT}>
              {name}
            </text>
          </g>
        )
      })}
    </g>
  )
}

// ── Equation card ─────────────────────────────────────────────────────────────
function EqCard({ lines, accent }: { lines: string[]; accent?: boolean }) {
  return (
    <div
      className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
      style={{
        background: accent ? '#D1FAE5' : '#FEF9C3',
        borderColor: accent ? CLR_ANSWER : '#D97706',
        color: accent ? '#065F46' : '#92400E',
        minWidth: 220,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  )
}

// ── Legend chip ───────────────────────────────────────────────────────────────
function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: color + '22', color }}>
      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: color }} />
      {label}
    </span>
  )
}

// ── Beat definitions ──────────────────────────────────────────────────────────
type Beat = {
  caption: { en: string; id: string }
  highlights: ArcHighlight[]
  eq: { lines: string[]; accent?: boolean } | null
  hold: number
}

function buildBeats(): Beat[] {
  const { ashleyToCheryl: AC, brendaToAshley: BA, cherylToBrenda: CB } = ROUNDABOUT_ARCS
  // Derived quantities — all from ROUNDABOUT_ARCS
  const sumTrips    = AC + BA + CB            // 207+332+313 = 852
  const loop        = sumTrips / 2            // 426
  const ashleyBrenda = loop - BA              // 426−332 = 94

  return [
    // Beat 0 — introduce the three arc variables
    {
      caption: {
        en: 'The road is one-way, so name the three arcs: x = Ashley→Brenda, y = Brenda→Cheryl, z = Cheryl→Ashley.',
        id: 'Jalan satu arah, jadi beri nama: x = Ashley→Brenda, y = Brenda→Cheryl, z = Cheryl→Ashley.',
      },
      highlights: [
        { from: A_ASHLEY, to: A_BRENDA, color: CLR_UNKNOWN, label: 'x = ?', strokeWidth: 4 },
        { from: A_BRENDA, to: A_CHERYL, color: CLR_BORDER,  label: 'y',     strokeWidth: 3 },
        { from: A_CHERYL, to: A_ASHLEY, color: CLR_BORDER,  label: 'z',     strokeWidth: 3 },
      ],
      eq: null,
      hold: 2800,
    },
    // Beat 1 — write the three equations from given trips
    {
      caption: {
        en: `The three given trips: x + y = ${AC} (Ashley→Cheryl), y + z = ${BA} (Brenda→Ashley), z + x = ${CB} (Cheryl→Brenda).`,
        id: `Tiga perjalanan diketahui: x + y = ${AC} (Ashley→Cheryl), y + z = ${BA} (Brenda→Ashley), z + x = ${CB} (Cheryl→Brenda).`,
      },
      highlights: [
        { from: A_ASHLEY, to: A_BRENDA, color: CLR_UNKNOWN, label: 'x',     strokeWidth: 4 },
        { from: A_BRENDA, to: A_CHERYL, color: CLR_KNOWN,   label: 'y',     strokeWidth: 4 },
        { from: A_CHERYL, to: A_ASHLEY, color: CLR_LABEL,   label: 'z',     strokeWidth: 4 },
      ],
      eq: {
        lines: [
          `x + y = ${AC}`,
          `y + z = ${BA}`,
          `z + x = ${CB}`,
        ],
      },
      hold: 2800,
    },
    // Beat 2 — add all three equations
    {
      caption: {
        en: `Add them all: (x+y) + (y+z) + (z+x) = ${AC}+${BA}+${CB} → 2(x+y+z) = ${sumTrips} → loop = ${loop} m.`,
        id: `Jumlahkan semua: (x+y) + (y+z) + (z+x) = ${AC}+${BA}+${CB} → 2(x+y+z) = ${sumTrips} → satu putaran = ${loop} m.`,
      },
      highlights: [
        { from: A_ASHLEY, to: A_BRENDA, color: CLR_UNKNOWN, strokeWidth: 4 },
        { from: A_BRENDA, to: A_CHERYL, color: CLR_KNOWN,   strokeWidth: 4 },
        { from: A_CHERYL, to: A_ASHLEY, color: CLR_LABEL,   strokeWidth: 4 },
      ],
      eq: {
        lines: [
          `${AC} + ${BA} + ${CB} = ${sumTrips}`,
          `2 × (x+y+z) = ${sumTrips}`,
          `x + y + z = ${loop} m`,
        ],
      },
      hold: 2800,
    },
    // Beat 3 — subtract the known y+z trip
    {
      caption: {
        en: `x = loop − (y+z) = ${loop} − ${BA} = ${ashleyBrenda} m. Ashley walks ${ashleyBrenda} m to Brenda!`,
        id: `x = putaran − (y+z) = ${loop} − ${BA} = ${ashleyBrenda} m. Ashley berjalan ${ashleyBrenda} m ke Brenda!`,
      },
      highlights: [
        { from: A_ASHLEY, to: A_BRENDA, color: CLR_ANSWER, label: `${ashleyBrenda} m`, strokeWidth: 6, labelR: R_OUTER + 22 },
        // Dim y+z arc in grey to show what's subtracted
        { from: A_BRENDA, to: A_ASHLEY, color: CLR_BORDER, strokeWidth: 3 },
      ],
      eq: {
        lines: [
          `x = ${loop} − ${BA}`,
          `x = ${ashleyBrenda} m`,
        ],
        accent: true,
      },
      hold: 0,
    },
  ]
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Roundabout25G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats = useMemo(buildBeats, [])

  const index = useBeatControl(beats.length - 1, {
    ...props,
    holds: beats.map((b) => b.hold),
  })
  const beat = beats[index] ?? beats[beats.length - 1]

  const { ashleyToCheryl: AC, brendaToAshley: BA, cherylToBrenda: CB } = ROUNDABOUT_ARCS
  const ashleyBrenda = (AC + BA + CB) / 2 - BA

  return (
    <div
      className="mx-auto w-full max-w-[480px]"
      role="img"
      aria-label={t(
        `Roundabout arc method: name arcs x, y, z; the three given trips sum to ${AC + BA + CB}, so the full loop is ${(AC + BA + CB) / 2} m; Ashley to Brenda = ${ashleyBrenda} m.`,
        `Metode busur bundaran: beri nama x, y, z; tiga perjalanan berjumlah ${AC + BA + CB}, satu putaran ${(AC + BA + CB) / 2} m; Ashley ke Brenda = ${ashleyBrenda} m.`,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Ring visual */}
        <motion.svg
          viewBox="0 0 280 270"
          width="100%"
          style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
          initial={false}
          animate={{ opacity: 1 }}
        >
          <Ring highlights={beat.highlights} />
          {/* Legend labels at house dots */}
          {[
            { angle: A_ASHLEY, name: 'Ashley' },
            { angle: A_BRENDA, name: 'Brenda' },
            { angle: A_CHERYL, name: 'Cheryl' },
          ].map(({ angle, name }) => {
            // Place label further out than the dot
            const [lx, ly] = polar(CX, CY, R_PERSON + 8, angle)
            return (
              <text key={name} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={700} fill={CLR_TEXT}>
                {name}
              </text>
            )
          })}
        </motion.svg>

        {/* Legend chips for arc colours */}
        <div className="flex flex-wrap justify-center gap-2">
          <LegendChip color={CLR_UNKNOWN} label={t('Ashley → Brenda (x = ?)', 'Ashley → Brenda (x = ?)')} />
          <LegendChip color={CLR_KNOWN}   label={t('Brenda → Cheryl (y)', 'Brenda → Cheryl (y)')} />
          <LegendChip color={CLR_LABEL}   label={t('Cheryl → Ashley (z)', 'Cheryl → Ashley (z)')} />
        </div>

        {/* Equation card */}
        {beat.eq && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            <EqCard lines={beat.eq.lines} accent={beat.eq.accent} />
          </motion.div>
        )}

        {/* Caption */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.eq?.accent
              ? { background: '#D1FAE5', borderColor: CLR_ANSWER, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {lang === 'id' ? beat.caption.id : beat.caption.en}
        </motion.div>
      </div>
    </div>
  )
}
