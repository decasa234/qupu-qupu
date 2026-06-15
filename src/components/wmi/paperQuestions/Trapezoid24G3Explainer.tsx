import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  TRAPEZOID_A,
  TRAPEZOID_B,
  TRIANGLE_SIDES,
} from './Trapezoid24G3Illustration'

// WMI-24F3A-Q9 — Four identical 3-4-5 right triangles form a trapezoid in two ways.
// Strategy: try both orientations (short-leg vertical vs long-leg vertical),
// compute the perimeter for each, and land on "both 22 and 26" → answer E.
//
// Beats:
//   0  Introduce: 4 identical right triangles, sides 3-4-5. Goal: find perimeter.
//   1  Trap: area of 4 triangles = 24 cm² — that's AREA, not perimeter!
//   2  Arrangement A: stand height-4 triangles → bases 3 & 9, legs 5 & 5 → 3+9+5+5=22
//   3  Arrangement B: stand height-3 triangles → bases 4 & 12, legs 5 & 5 → 4+12+5+5=26
//   4  Both are real trapezoids → perimeter is 22 or 26, answer E.

// ── colour tokens (mirror Trapezoid24G3Illustration) ──────────────────────────
const INK       = '#1F2937'
const FILL_A    = '#D1E8F5'   // light blue — trapezoid A
const FILL_B    = '#D5EDD5'   // light green — trapezoid B
const DASH_CLR  = '#6B7280'
const LABEL_CLR = '#92400E'
const GREEN     = '#10B981'
const WARN      = '#DC2626'   // red for the trap/wrong answer
const GOLD      = '#D97706'   // amber for active highlight

// ── scale constants (mirror illustration) ─────────────────────────────────────
const SCALE_A = 22   // px per unit for trapezoid A
const SCALE_B = 18   // px per unit for trapezoid B

// ── Trapezoid A mini-figure (inline SVG, reusable) ────────────────────────────
// Bases 3 & 9, height 4, legs 5. ViewBox 260 × 130.
function TrapAMini({ highlight }: { highlight: boolean }) {
  const S = SCALE_A
  // Shape centred in 260-wide canvas; ox=14, oy=20
  const ox = 14, oy = 20
  // Outer vertices
  const TLx = ox + 3*S, TLy = oy
  const TRx = ox + 6*S, TRy = oy
  const BLx = ox,       BLy = oy + 4*S
  const BRx = ox + 9*S, BRy = oy + 4*S

  const outline = `${TLx},${TLy} ${TRx},${TRy} ${BRx},${BRy} ${BLx},${BLy}`

  return (
    <svg
      viewBox="0 0 220 115"
      width="100%"
      style={{ maxWidth: 220, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Filled trapezoid */}
      <polygon
        points={outline}
        fill={FILL_A}
        stroke={highlight ? GOLD : INK}
        strokeWidth={highlight ? 2.5 : 1.8}
        strokeLinejoin="round"
      />

      {/* Internal division lines (dashed) */}
      {/* Left top vertical: TL → bottom at (3,4) */}
      <line x1={TLx} y1={TLy} x2={TLx} y2={BLy} stroke={DASH_CLR} strokeWidth={1.2} strokeDasharray="4 3" />
      {/* Right top vertical: TR → bottom at (6,4) */}
      <line x1={TRx} y1={TRy} x2={TRx} y2={BLy} stroke={DASH_CLR} strokeWidth={1.2} strokeDasharray="4 3" />
      {/* Central diagonal: (3,4) → TR */}
      <line x1={TLx} y1={BLy} x2={TRx} y2={TRy} stroke={DASH_CLR} strokeWidth={1.2} strokeDasharray="4 3" />

      {/* Side labels — outer boundary only */}
      {/* Top base "3" */}
      <text x={(TLx+TRx)/2} y={TLy-6} textAnchor="middle" dominantBaseline="auto"
        fontSize={12} fontWeight={700} fill={LABEL_CLR}>3</text>
      {/* Bottom base "9" */}
      <text x={(BLx+BRx)/2} y={BLy+14} textAnchor="middle" dominantBaseline="auto"
        fontSize={12} fontWeight={700} fill={LABEL_CLR}>9</text>
      {/* Left leg "5" */}
      <text x={(BLx+TLx)/2-13} y={(BLy+TLy)/2} textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight={700} fill={LABEL_CLR}>5</text>
      {/* Right leg "5" */}
      <text x={(BRx+TRx)/2+13} y={(BRy+TRy)/2} textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight={700} fill={LABEL_CLR}>5</text>
      {/* Height note */}
      <text x={BRx+5} y={(BLy+TLy)/2} textAnchor="start" dominantBaseline="central"
        fontSize={9} fill={DASH_CLR}>h=4</text>
    </svg>
  )
}

// ── Trapezoid B mini-figure ────────────────────────────────────────────────────
// Bases 4 & 12, height 3, legs 5. Wide but short.
function TrapBMini({ highlight }: { highlight: boolean }) {
  const S = SCALE_B
  const ox = 10, oy = 20
  const TLx = ox + 4*S, TLy = oy
  const TRx = ox + 8*S, TRy = oy
  const BLx = ox,       BLy = oy + 3*S
  const BRx = ox + 12*S, BRy = oy + 3*S

  const outline = `${TLx},${TLy} ${TRx},${TRy} ${BRx},${BRy} ${BLx},${BLy}`

  return (
    <svg
      viewBox="0 0 250 90"
      width="100%"
      style={{ maxWidth: 250, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <polygon
        points={outline}
        fill={FILL_B}
        stroke={highlight ? GOLD : INK}
        strokeWidth={highlight ? 2.5 : 1.8}
        strokeLinejoin="round"
      />

      {/* Internal lines */}
      <line x1={TLx} y1={TLy} x2={TLx} y2={BLy} stroke={DASH_CLR} strokeWidth={1.2} strokeDasharray="4 3" />
      <line x1={TRx} y1={TRy} x2={TRx} y2={BLy} stroke={DASH_CLR} strokeWidth={1.2} strokeDasharray="4 3" />
      <line x1={TLx} y1={BLy} x2={TRx} y2={TRy} stroke={DASH_CLR} strokeWidth={1.2} strokeDasharray="4 3" />

      {/* Labels */}
      <text x={(TLx+TRx)/2} y={TLy-6} textAnchor="middle" dominantBaseline="auto"
        fontSize={12} fontWeight={700} fill={LABEL_CLR}>4</text>
      <text x={(BLx+BRx)/2} y={BLy+14} textAnchor="middle" dominantBaseline="auto"
        fontSize={12} fontWeight={700} fill={LABEL_CLR}>12</text>
      <text x={(BLx+TLx)/2-13} y={(BLy+TLy)/2} textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight={700} fill={LABEL_CLR}>5</text>
      <text x={(BRx+TRx)/2+13} y={(BRy+TRy)/2} textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight={700} fill={LABEL_CLR}>5</text>
      <text x={BRx+5} y={(BLy+TLy)/2} textAnchor="start" dominantBaseline="central"
        fontSize={9} fill={DASH_CLR}>h=3</text>
    </svg>
  )
}

// ── Single triangle icon (for intro beat) ─────────────────────────────────────
function TriangleIcon({ index }: { index: number }) {
  // A 3-4-5 right triangle miniature, tiled four times.
  const S = 12
  const ox = index * 48 + 6
  const oy = 6
  return (
    <g>
      <polygon
        points={`${ox},${oy+4*S} ${ox+3*S},${oy} ${ox+3*S},${oy+4*S}`}
        fill={FILL_A}
        stroke={INK}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* right angle marker */}
      <polyline
        points={`${ox+3*S-5},${oy+4*S} ${ox+3*S-5},${oy+4*S-5} ${ox+3*S},${oy+4*S-5}`}
        fill="none" stroke={INK} strokeWidth={1.2}
      />
      {/* side labels */}
      <text x={ox+3*S/2} y={oy+4*S+10} textAnchor="middle" fontSize={8} fill={LABEL_CLR} fontWeight={700}>3</text>
      <text x={ox+3*S+5} y={oy+2*S} textAnchor="start" fontSize={8} fill={LABEL_CLR} fontWeight={700}>4</text>
    </g>
  )
}

// ── Perimeter formula row ──────────────────────────────────────────────────────
function PerimRow({
  top, bot, leg, result, color,
}: {
  top: number; bot: number; leg: number; result: number; color: string
}) {
  return (
    <div className="font-mono text-xs font-bold" style={{ color }}>
      {top} + {bot} + {leg} + {leg} = {result}
    </div>
  )
}

// ── Beat type ─────────────────────────────────────────────────────────────────
type Phase = 'intro' | 'trap' | 'trapA' | 'trapB' | 'both'

interface Beat {
  phase: Phase
  hold: number
  result: boolean
  caption: string
}

// ── Explainer ─────────────────────────────────────────────────────────────────
export default function Trapezoid24G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const { short, long, hyp } = TRIANGLE_SIDES   // 3, 4, 5
  const pA = TRAPEZOID_A.perimeter              // 22
  const pB = TRAPEZOID_B.perimeter              // 26

  const steps = useMemo<Beat[]>(() => [
    {
      phase: 'intro',
      hold: 2600,
      result: false,
      caption: t(
        `Four identical ${short}-${long}-${hyp} right triangles. Goal: add all OUTSIDE edges of the trapezoid they make.`,
        `Empat segitiga siku-siku ${short}-${long}-${hyp} identik. Tujuan: jumlahkan semua sisi LUAR trapesium yang terbentuk.`,
      ),
    },
    {
      phase: 'trap',
      hold: 2800,
      result: false,
      caption: t(
        `Watch out! Area of 4 triangles = 4 × (${short}×${long}÷2) = 24 cm² — that is AREA, not perimeter. Don't pick 24!`,
        `Hati-hati! Luas 4 segitiga = 4 × (${short}×${long}÷2) = 24 cm² — itu LUAS, bukan keliling. Jangan pilih 24!`,
      ),
    },
    {
      phase: 'trapA',
      hold: 3000,
      result: false,
      caption: t(
        `Arrangement A: short legs (${short}) face each other on top → top=${TRAPEZOID_A.topBase}, bottom=${TRAPEZOID_A.bottomBase}, legs ${hyp} and ${hyp}. Perimeter = ${TRAPEZOID_A.topBase}+${TRAPEZOID_A.bottomBase}+${hyp}+${hyp} = ${pA}.`,
        `Susunan A: kaki pendek (${short}) berhadapan di atas → atas=${TRAPEZOID_A.topBase}, bawah=${TRAPEZOID_A.bottomBase}, kaki ${hyp} dan ${hyp}. Keliling = ${TRAPEZOID_A.topBase}+${TRAPEZOID_A.bottomBase}+${hyp}+${hyp} = ${pA}.`,
      ),
    },
    {
      phase: 'trapB',
      hold: 3000,
      result: false,
      caption: t(
        `Arrangement B: long legs (${long}) face each other on top → top=${TRAPEZOID_B.topBase}, bottom=${TRAPEZOID_B.bottomBase}, legs ${hyp} and ${hyp}. Perimeter = ${TRAPEZOID_B.topBase}+${TRAPEZOID_B.bottomBase}+${hyp}+${hyp} = ${pB}.`,
        `Susunan B: kaki panjang (${long}) berhadapan di atas → atas=${TRAPEZOID_B.topBase}, bawah=${TRAPEZOID_B.bottomBase}, kaki ${hyp} dan ${hyp}. Keliling = ${TRAPEZOID_B.topBase}+${TRAPEZOID_B.bottomBase}+${hyp}+${hyp} = ${pB}.`,
      ),
    },
    {
      phase: 'both',
      hold: 0,
      result: true,
      caption: t(
        `Both arrangements are real trapezoids! Perimeter is ${pA} or ${pB} → answer E.`,
        `Kedua susunan adalah trapesium yang sah! Keliling adalah ${pA} atau ${pB} → jawaban E.`,
      ),
    },
  ], [lang, short, long, hyp, pA, pB])

  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const ariaLabel = t(
    `The four 3-4-5 triangles can form two trapezoids: arrangement A has perimeter 22, arrangement B has perimeter 26. Both are valid, so the answer is E.`,
    `Empat segitiga 3-4-5 dapat membentuk dua trapesium: susunan A berkeliling 22, susunan B berkeliling 26. Keduanya sah, jadi jawaban E.`,
  )

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">

        {/* ── Visual area ── */}
        <div className="w-full">

          {/* INTRO: show four triangles */}
          {beat.phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <svg
                viewBox="0 0 210 70"
                width="100%"
                style={{ maxWidth: 220, display: 'block', margin: '0 auto' }}
                aria-hidden="true"
              >
                <rect x={0} y={0} width={210} height={70} rx={10} fill="#F0F9FF" />
                {[0, 1, 2, 3].map((i) => (
                  <TriangleIcon key={i} index={i} />
                ))}
                <text x={105} y={62} textAnchor="middle" fontSize={9} fill={DASH_CLR}>
                  {t('× 4 identical right triangles', '× 4 segitiga siku-siku identik')}
                </text>
              </svg>
            </motion.div>
          )}

          {/* TRAP: area warning */}
          {beat.phase === 'trap' && (
            <motion.div
              key="trap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <svg
                viewBox="0 0 260 80"
                width="100%"
                style={{ maxWidth: 260, display: 'block', margin: '0 auto' }}
                aria-hidden="true"
              >
                <rect x={0} y={0} width={260} height={80} rx={10} fill="#FEF2F2" stroke={WARN} strokeWidth={1.5} />
                <text x={130} y={26} textAnchor="middle" fontSize={13} fontWeight={700} fill={WARN}>
                  {t('Area trap!', 'Jebakan Luas!')}
                </text>
                <text x={130} y={46} textAnchor="middle" fontSize={11} fill={INK}>
                  {`4 × (3×4÷2) = 4 × 6 = 24 cm²`}
                </text>
                <text x={130} y={63} textAnchor="middle" fontSize={10} fill={WARN}>
                  {t('24 = AREA, not perimeter — skip B!', '24 = LUAS, bukan keliling — jangan pilih B!')}
                </text>
              </svg>
            </motion.div>
          )}

          {/* TRAP A */}
          {beat.phase === 'trapA' && (
            <motion.div
              key="trapA"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <div className="text-center text-xs font-bold" style={{ color: '#1D4ED8', marginBottom: 2 }}>
                {t('Arrangement A', 'Susunan A')}
              </div>
              <TrapAMini highlight />
              <div className="mt-1 text-center">
                <PerimRow
                  top={TRAPEZOID_A.topBase}
                  bot={TRAPEZOID_A.bottomBase}
                  leg={TRAPEZOID_A.leg}
                  result={pA}
                  color="#1D4ED8"
                />
              </div>
            </motion.div>
          )}

          {/* TRAP B */}
          {beat.phase === 'trapB' && (
            <motion.div
              key="trapB"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <div className="text-center text-xs font-bold" style={{ color: '#15803D', marginBottom: 2 }}>
                {t('Arrangement B', 'Susunan B')}
              </div>
              <TrapBMini highlight />
              <div className="mt-1 text-center">
                <PerimRow
                  top={TRAPEZOID_B.topBase}
                  bot={TRAPEZOID_B.bottomBase}
                  leg={TRAPEZOID_B.leg}
                  result={pB}
                  color="#15803D"
                />
              </div>
            </motion.div>
          )}

          {/* BOTH: side-by-side verdict */}
          {beat.phase === 'both' && (
            <motion.div
              key="both"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, type: 'spring', stiffness: 240, damping: 20 }}
              className="flex flex-row items-start justify-center gap-3"
            >
              {/* Panel A */}
              <div
                className="flex flex-1 flex-col items-center rounded-xl border-2 py-2"
                style={{ borderColor: '#93C5FD', background: '#EFF6FF' }}
              >
                <div className="text-xs font-bold" style={{ color: '#1D4ED8' }}>
                  {t('Arr. A', 'Sus. A')}
                </div>
                <TrapAMini highlight={false} />
                <div className="font-mono text-xs font-bold" style={{ color: '#1D4ED8' }}>
                  {pA} cm
                </div>
              </div>
              {/* Panel B */}
              <div
                className="flex flex-1 flex-col items-center rounded-xl border-2 py-2"
                style={{ borderColor: '#86EFAC', background: '#F0FDF4' }}
              >
                <div className="text-xs font-bold" style={{ color: '#15803D' }}>
                  {t('Arr. B', 'Sus. B')}
                </div>
                <TrapBMini highlight={false} />
                <div className="font-mono text-xs font-bold" style={{ color: '#15803D' }}>
                  {pB} cm
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Caption box ── */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
