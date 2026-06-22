// Post-answer explainer for IKMC-22-EC-Q13 (Aladdin's folded carpet).
//
// The static illustration shows a folded blue carpet with red dots. Here we
// animate the counting strategy:
//   Beat 0  — intro: whole carpet, no highlight
//   Beat 1  — highlight the right side: 2 rows × 4 = 8 dots per side
//   Beat 2  — highlight the fold corner: it hides dots but the rule holds
//   Beat 3  — light up all four sides: 4 × 8 = 32
//   Beat 4  — answer badge: 32 (E)
//
// We reuse the same carpet geometry from FoldCarpet13ECIllustration so the
// animated scene matches the static figure exactly.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildFoldCarpet13ECSteps } from './foldCarpet13ECSteps'

// Carpet palette (same as illustration — literal hex per this folder's convention).
const CARPET_FILL   = '#7FBFDA'
const CARPET_EDGE   = '#4A8FAD'
const DOT_FILL      = '#D94040'
const DOT_STROKE    = '#A02828'
const FOLD_FILL     = '#FFFFFF'
const FOLD_STROKE   = '#BBBBBB'
const HL_RIGHT      = '#F59E0B'   // amber — right-side highlight
const HL_FOLD       = '#8B5CF6'   // violet — fold highlight
const HL_ALL        = '#10B981'   // green — full border highlight
const ANSWER_GREEN  = '#065F46'
const BLUE          = '#1E4A7A'

const DR = 5  // dot radius

function hRow(sx: number, sy: number, n: number, gap: number) {
  return Array.from({ length: n }, (_, i) => ({ cx: sx + i * gap, cy: sy }))
}
function vCol(sx: number, sy: number, n: number, gap: number) {
  return Array.from({ length: n }, (_, i) => ({ cx: sx, cy: sy + i * gap }))
}

// Carpet geometry — identical to illustration (scaled to 240×240 stage).
const M = 20
const CL = M, CT = M, CW = 200, CH = 200
const CR = CL + CW, CB = CT + CH
const inset1 = 12, inset2 = 24
const dotStart = 24, dotGap = 44, N = 4

// Each side's dots as a named group so we can highlight per-side.
const SIDE_DOTS: Record<string, Array<{ cx: number; cy: number }>> = {
  top:    [...hRow(CL + dotStart, CT + inset2, N, dotGap), ...hRow(CL + dotStart, CT + inset1, N, dotGap)],
  bottom: [...hRow(CL + dotStart, CB - inset1, N, dotGap), ...hRow(CL + dotStart, CB - inset2, N, dotGap)],
  left:   [...vCol(CL + inset1, CT + dotStart, N, dotGap), ...vCol(CL + inset2, CT + dotStart, N, dotGap)],
  right:  [...vCol(CR - inset1, CT + dotStart, N, dotGap), ...vCol(CR - inset2, CT + dotStart, N, dotGap)],
}

const FOLD_PTS = [
  `${CL - 4},${CT + 48}`,
  `${CL + 48},${CT - 4}`,
  `${CL - 22},${CT - 22}`,
].join(' ')

export default function FoldCarpet13ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildFoldCarpet13ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat  = story.steps[index] ?? story.steps[story.finalIndex]

  // Determine which dots to colour per-beat.
  const hl = beat.highlight

  function getDotColor(side: string) {
    if (hl === 'all') return HL_ALL
    if (hl === 'right' && side === 'right') return HL_RIGHT
    return DOT_FILL
  }

  // Highlight border overlay for the right side.
  const showRightBand  = hl === 'right'
  const showFoldCircle = hl === 'fold'
  const showAllRing    = hl === 'all'

  // SVG stage: 240 × 240
  const VW = 240, VH = 240

  return (
    <div
      className="mx-auto w-full max-w-[400px]"
      role="img"
      aria-label={t(
        'Animated carpet: count 2 rows × 4 dots per side, multiply by 4 sides = 32 total dots. Answer E.',
        'Karpet animasi: hitung 2 baris × 4 titik per sisi, kalikan 4 sisi = 32 titik total. Jawaban E.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          width="100%"
          style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Carpet body */}
          <rect x={CL} y={CT} width={CW} height={CH} fill={CARPET_FILL} stroke={CARPET_EDGE} strokeWidth={2} />

          {/* Right-side highlight band */}
          {showRightBand && (
            <motion.rect
              x={CR - 2*inset2}
              y={CT}
              width={2*inset2}
              height={CH}
              fill={HL_RIGHT}
              fillOpacity={0.22}
              rx={4}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            />
          )}

          {/* Fold highlight: ring around the corner fold */}
          {showFoldCircle && (
            <motion.circle
              cx={CL + 24}
              cy={CT + 24}
              r={38}
              fill={HL_FOLD}
              fillOpacity={0.18}
              stroke={HL_FOLD}
              strokeWidth={2.5}
              strokeDasharray="6 5"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              style={{ transformOrigin: `${CL + 24}px ${CT + 24}px` }}
            />
          )}

          {/* All-sides highlight: glowing border */}
          {showAllRing && (
            <motion.rect
              x={CL - 4}
              y={CT - 4}
              width={CW + 8}
              height={CH + 8}
              fill="none"
              stroke={HL_ALL}
              strokeWidth={4}
              rx={6}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Red dots per side, coloured by highlight state */}
          {(['top', 'bottom', 'left', 'right'] as const).map((side) =>
            SIDE_DOTS[side].map((d, i) => (
              <motion.circle
                key={`${side}-${i}`}
                cx={d.cx}
                cy={d.cy}
                r={DR}
                fill={getDotColor(side)}
                stroke={DOT_STROKE}
                strokeWidth={1}
                animate={{ fill: getDotColor(side) }}
                transition={{ duration: 0.3 }}
              />
            ))
          )}

          {/* Folded corner flap — always on top */}
          <polygon points={FOLD_PTS} fill={FOLD_FILL} stroke={FOLD_STROKE} strokeWidth={2} strokeLinejoin="round" />

          {/* Running count badge, animated in once known */}
          {beat.runningCount != null && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              style={{ transformOrigin: `${CL + CW/2}px ${CT + CH/2}px` }}
            >
              <rect
                x={CL + CW/2 - 32}
                y={CT + CH/2 - 18}
                width={64}
                height={36}
                rx={18}
                fill={beat.result ? '#D1FAE5' : '#DBEAFE'}
                stroke={beat.result ? HL_ALL : BLUE}
                strokeWidth={2}
              />
              <text
                x={CL + CW/2}
                y={CT + CH/2 + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight={800}
                fill={beat.result ? ANSWER_GREEN : BLUE}
                className="font-display"
              >
                {beat.runningCount}
              </text>
            </motion.g>
          )}

          {/* Beat-specific label near the right side */}
          {showRightBand && (
            <motion.text
              x={CR - inset1}
              y={CT + CH/2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={10}
              fontWeight={700}
              fill={HL_RIGHT}
              className="font-display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              transform={`rotate(-90, ${CR - inset1}, ${CT + CH/2})`}
            >
              {t('2 rows × 4 = 8', '2 baris × 4 = 8')}
            </motion.text>
          )}
        </svg>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: HL_ALL, color: ANSWER_GREEN }
              : { background: '#EFF6FF', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
