import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CakeDisc,
  CutSeg,
  CAKE,
  COLOR,
  LEFT_CUTS,
  RIGHT_CUTS,
} from './CakeCuts20A12Illustration'
import { buildCakeCuts20A12Steps, PIECE_COUNTS } from './cakeCuts20A12Steps'

// SEAMO-20-A-Q12 — animated explainer for the 3-cuts cake problem.
// Shows three cakes in a row:
//   Given 1 (1 cut → 2)   Given 2 (2 cuts → 4)   Question (0–3 cuts, animating)
// Reveals the question cake cuts one-by-one, shows the trap, then lands on 7.

const INK    = '#1F2937'
const GREEN  = '#10B981'
const ORANGE = '#D97706'
const RED    = '#DC2626'
const BLUE   = '#30598A'

// Three-cake SVG layout constants
const W = 420
const H = 170
const R  = CAKE.R   // 62
const CY = CAKE.CY  // 80

// Centres for each of the three cakes
const CX1 = 70       // given: 1 cut
const CX2 = 210      // given: 2 cuts
const CX3 = 350      // question: animated

// The three optimal cuts for the QUESTION cake (same geometry as 16A21):
const Q_CUTS: [number, number, number, number][] = [
  // cut 1 — roughly horizontal
  [CX3 - R, CY - 12, CX3 + R, CY - 12],
  // cut 2 — diagonal top-left → bottom-right, crosses cut 1
  [CX3 - R * 0.62, CY - R * 0.92, CX3 + R * 0.62, CY + R * 0.92],
  // cut 3 — diagonal top-right → bottom-left, crosses both
  [CX3 + R * 0.62, CY - R * 0.92, CX3 - R * 0.62, CY + R * 0.92],
]

// Trap cuts — all three through the centre (6 pieces, not 7)
const TRAP_CUTS: [number, number, number, number][] = [
  [CX3 - R, CY, CX3 + R, CY],
  [CX3 - R * 0.7, CY - R * 0.7, CX3 + R * 0.7, CY + R * 0.7],
  [CX3 + R * 0.7, CY - R * 0.7, CX3 - R * 0.7, CY + R * 0.7],
]

function TrapLines() {
  return (
    <g opacity={0.8}>
      {TRAP_CUTS.map(([x1, y1, x2, y2], i) => (
        <line
          key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={ORANGE} strokeWidth={2.6} strokeLinecap="round"
          clipPath="url(#cc20a12-exp-q)"
        />
      ))}
      <text x={CX3} y={CY} textAnchor="middle" dominantBaseline="central"
        fontSize={20} fontWeight={900} fill={RED}>✕</text>
    </g>
  )
}

export default function CakeCuts20A12Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => buildCakeCuts20A12Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[steps.length - 1]

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={t(
        '3 straight cuts on a round cake produce at most 7 pieces when each cut crosses all previous cuts.',
        '3 potongan lurus pada kue bulat menghasilkan paling banyak 7 bagian jika setiap potongan memotong semua garis sebelumnya.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* ── Three-cake SVG ── */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <defs>
            {/* clip paths for each cake */}
            <clipPath id="cc20a12-exp-1">
              <circle cx={CX1} cy={CY} r={R} />
            </clipPath>
            <clipPath id="cc20a12-exp-2">
              <circle cx={CX2} cy={CY} r={R} />
            </clipPath>
            <clipPath id="cc20a12-exp-q">
              <circle cx={CX3} cy={CY} r={R} />
            </clipPath>
          </defs>

          <rect x={0} y={0} width={W} height={H} fill="white" />

          {/* GIVEN cake 1 — 1 cut */}
          <CakeDisc cx={CX1} cy={CY} />
          {LEFT_CUTS.map(([x1, y1, x2, y2], i) => (
            <CutSeg key={i} x1={x1 - CAKE.C1X + CX1} y1={y1} x2={x2 - CAKE.C1X + CX1} y2={y2}
              clipPathId="cc20a12-exp-1" />
          ))}
          <text x={CX1} y={CY} textAnchor="middle" dominantBaseline="central"
            fontSize={18} fontWeight={900} fill={BLUE}>2</text>
          <text x={CX1} y={CY + R + 14}
            textAnchor="middle" dominantBaseline="central"
            fontSize={9} fontWeight={700} fill={INK}>
            {t('1 cut', '1 potong')}
          </text>

          {/* GIVEN cake 2 — 2 cuts */}
          <CakeDisc cx={CX2} cy={CY} />
          {RIGHT_CUTS.map(([x1, y1, x2, y2], i) => (
            <CutSeg key={i} x1={x1 - CAKE.C2X + CX2} y1={y1} x2={x2 - CAKE.C2X + CX2} y2={y2}
              clipPathId="cc20a12-exp-2" />
          ))}
          <text x={CX2} y={CY} textAnchor="middle" dominantBaseline="central"
            fontSize={18} fontWeight={900} fill={BLUE}>4</text>
          <text x={CX2} y={CY + R + 14}
            textAnchor="middle" dominantBaseline="central"
            fontSize={9} fontWeight={700} fill={INK}>
            {t('2 cuts', '2 potong')}
          </text>

          {/* QUESTION cake — animated */}
          <CakeDisc cx={CX3} cy={CY} />

          {/* trap state */}
          {beat.showTrap && <TrapLines />}

          {/* normal animated cuts */}
          {!beat.showTrap &&
            Q_CUTS.map(([x1, y1, x2, y2], i) => (
              <motion.line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={beat.focusCut === i ? RED : COLOR.CUT}
                strokeWidth={beat.focusCut === i ? 3.2 : 2.4}
                strokeLinecap="round"
                clipPath="url(#cc20a12-exp-q)"
                initial={false}
                animate={{ opacity: i < beat.cutsShown ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
            ))}

          {/* piece count in the question cake */}
          <motion.text
            x={CX3} y={CY}
            textAnchor="middle" dominantBaseline="central"
            fontSize={22} fontWeight={900}
            fill={beat.result ? GREEN : beat.reject ? RED : BLUE}
            initial={false}
            animate={{ scale: beat.result ? 1.18 : 1 }}
            style={{ transformOrigin: `${CX3}px ${CY}px` }}
          >
            {beat.pieces}
          </motion.text>

          <text x={CX3} y={CY + R + 14}
            textAnchor="middle" dominantBaseline="central"
            fontSize={9} fontWeight={700} fill={INK}>
            {t('3 cuts', '3 potong')}
          </text>
        </svg>

        {/* ── Piece-count chain: 1 → 2 → 4 → 7 ── */}
        <div className="flex items-center gap-1">
          {PIECE_COUNTS.map((n, i) => {
            const active = beat.cutsShown >= i && !beat.showTrap
            const isResult = n === 7 && beat.result
            return (
              <div key={n} className="flex items-center gap-1">
                <motion.span
                  initial={false}
                  animate={{ opacity: active ? 1 : 0.28, scale: isResult ? 1.15 : 1 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 font-display text-sm font-extrabold"
                  style={{
                    borderColor: isResult ? GREEN : active ? BLUE : '#D1D5DB',
                    background:  isResult ? '#D1FAE5' : active ? '#E1EFFB' : 'white',
                    color:       isResult ? '#065F46' : active ? BLUE : '#9CA3AF',
                  }}
                >
                  {n}
                </motion.span>
                {i < PIECE_COUNTS.length - 1 && (
                  <span className="font-display text-xs font-bold" style={{ color: '#9CA3AF' }}>→</span>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Formula badge ── */}
        {beat.showFormula && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-xl border-2 px-3 py-2 text-center font-display text-sm font-extrabold"
            style={{ background: '#E1EFFB', borderColor: BLUE, color: BLUE }}
          >
            {t('pieces(n) = 1 + n(n+1)/2', 'bagian(n) = 1 + n(n+1)/2')}
          </motion.div>
        )}

        {/* ── Trap badge ── */}
        {beat.showTrap && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border-2 px-3 py-1 text-center font-display text-xs font-bold"
            style={{ background: '#FDE2E2', borderColor: RED, color: '#991B1B' }}
          >
            {t('All 3 through one point → only 6  ✗', 'Ketiga garis bertemu 1 titik → hanya 6  ✗')}
          </motion.div>
        )}

        {/* ── Caption box ── */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.reject
                ? { background: '#FDE2E2', borderColor: RED, color: '#991B1B' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
