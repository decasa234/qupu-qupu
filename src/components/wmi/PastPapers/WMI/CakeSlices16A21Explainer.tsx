import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  CakeBase,
  CUTS,
  SVG_W,
  SVG_H,
  CX,
  CY,
  R,
  COLOR,
} from './CakeSlices16A21Illustration'
import { buildCakeSlices16A21Steps, PIECE_COUNTS } from './cakeSlices16A21Steps'

// SEAMO-16-A-Q21 — animated explainer for the cake-slices problem.
// Reveals each straight cut one-by-one on a round cake, showing the +1/+2/+3
// increment rule, then rejects the 6-piece trap, and lands on 7.

const INK = '#1F2937'
const GREEN = '#10B981'
const ORANGE = '#D97706'
const RED = '#DC2626'
const BLUE = '#30598A'

// Clip-path ID for the cake circle so cut lines don't bleed outside.
const CLIP_ID = 'cake-clip-16a21'

// ── Single cut line clipped to the cake circle ────────────────────────────────

function CutLine({
  index,
  focus,
  opacity,
}: {
  index: number
  focus: boolean
  opacity: number
}) {
  const [x1, y1, x2, y2] = CUTS[index]
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={focus ? RED : COLOR.CUTS}
      strokeWidth={focus ? 3.5 : 2.5}
      strokeLinecap="round"
      clipPath={`url(#${CLIP_ID})`}
      initial={false}
      animate={{ opacity }}
      transition={{ duration: 0.4 }}
    />
  )
}

// ── Trap star-burst pattern: 3 concurrent lines through one point ─────────────

function TrapLines() {
  // Three lines all passing through the centre — gives only 6 pieces.
  const trapCuts: [number, number, number, number][] = [
    [CX - R, CY, CX + R, CY],            // horizontal
    [CX - R * 0.7, CY - R * 0.7, CX + R * 0.7, CY + R * 0.7], // diagonal
    [CX + R * 0.7, CY - R * 0.7, CX - R * 0.7, CY + R * 0.7], // other diagonal
  ]
  return (
    <g opacity={0.72}>
      {trapCuts.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={ORANGE}
          strokeWidth={2.8}
          strokeLinecap="round"
          clipPath={`url(#${CLIP_ID})`}
        />
      ))}
      {/* big X at the centre to flag the mistake */}
      <text
        x={CX}
        y={CY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
        fontWeight={900}
        fill={RED}
      >
        ✕
      </text>
    </g>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

export default function CakeSlices16A21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => buildCakeSlices16A21Steps(lang), [lang])
  const index = useBeatControl(steps.length - 1, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[steps.length - 1]

  return (
    <div
      className="mx-auto w-full max-w-[360px]"
      role="img"
      aria-label={t(
        'Animated explanation: 3 straight cuts on a round cake produce at most 7 pieces.',
        'Penjelasan animasi: 3 potongan lurus pada kue bulat menghasilkan paling banyak 7 irisan.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* ── SVG scene ── */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: 260, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={CLIP_ID}>
              <circle cx={CX} cy={CY} r={R} />
            </clipPath>
          </defs>

          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* cake base */}
          <CakeBase />

          {/* trap state: three concurrent lines */}
          {beat.showTrap && <TrapLines />}

          {/* normal cuts — revealed one-by-one */}
          {!beat.showTrap &&
            CUTS.map((_, i) => (
              <CutLine
                key={i}
                index={i}
                focus={beat.focusCut === i}
                opacity={i < beat.cutsShown ? 1 : 0}
              />
            ))}

          {/* piece-count badge in centre */}
          <motion.text
            x={CX}
            y={CY}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={28}
            fontWeight={900}
            fill={beat.result ? GREEN : beat.reject ? RED : BLUE}
            initial={false}
            animate={{ scale: beat.result ? 1.15 : 1 }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          >
            {beat.pieces}
          </motion.text>

          {/* piece-label below the count */}
          <text
            x={CX}
            y={CY + 22}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fontWeight={700}
            fill={INK}
          >
            {t('pieces', 'irisan')}
          </text>
        </svg>

        {/* ── piece-count row: 1 → 2 → 4 → 7 ── */}
        <div className="flex items-center gap-1">
          {PIECE_COUNTS.map((n, i) => {
            const active = beat.cutsShown >= i && !beat.showTrap
            const isResult = n === 7 && beat.result
            return (
              <div key={n} className="flex items-center gap-1">
                <motion.span
                  initial={false}
                  animate={{
                    opacity: active ? 1 : 0.28,
                    scale: isResult ? 1.15 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 font-display text-sm font-extrabold"
                  style={{
                    borderColor: isResult ? GREEN : active ? BLUE : '#D1D5DB',
                    background: isResult ? '#D1FAE5' : active ? '#E1EFFB' : 'white',
                    color: isResult ? '#065F46' : active ? BLUE : '#9CA3AF',
                  }}
                >
                  {n}
                </motion.span>
                {i < PIECE_COUNTS.length - 1 && (
                  <span
                    className="font-display text-xs font-bold"
                    style={{ color: '#9CA3AF' }}
                  >
                    →
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* ── formula badge ── */}
        {beat.showFormula && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-xl border-2 px-3 py-2 text-center font-display text-sm font-extrabold"
            style={{ background: '#E1EFFB', borderColor: BLUE, color: BLUE }}
          >
            {t('pieces(n) = 1 + n(n+1)/2', 'irisan(n) = 1 + n(n+1)/2')}
          </motion.div>
        )}

        {/* ── trap badge ── */}
        {beat.showTrap && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border-2 px-3 py-1 text-center font-display text-xs font-bold"
            style={{ background: '#FDE2E2', borderColor: RED, color: '#991B1B' }}
          >
            {t('All through 1 point → 6 only  ✗', 'Semua lewat 1 titik → cuma 6  ✗')}
          </motion.div>
        )}

        {/* ── caption box ── */}
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
