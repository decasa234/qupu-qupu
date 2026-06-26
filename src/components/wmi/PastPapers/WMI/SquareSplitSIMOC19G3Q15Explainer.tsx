// Post-answer explainer for SIMOC-19-G3-Q15
// "Jumlah luas kedua persegi (besar + kecil)" — answer: 170 cm²
//
// Beats:
//   intro      — all regions neutral; introduce the partition
//   left_rect  — left rect highlighted amber; p × s = 44
//   right_rect — upper-right rect highlighted amber; derive p=4, s=11
//   big_sq     — full square highlighted blue; s²=121 cm²
//   small_sq   — small square highlighted amber; 7²=49 cm²
//   answer     — both squares (all regions) green; 121+49=170 cm²

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildSquareSplitSIMOC19G3Q15Steps } from './squareSplitSIMOC19G3Q15Steps'
import type { SplitPhase } from './squareSplitSIMOC19G3Q15Steps'

// ── Layout constants (must match Illustration) ───────────────────────────────
const O_X  = 12
const O_Y  = 12
const S_PX = 176
const P_PX = 64

const DIV_X = O_X + P_PX
const DIV_Y = O_Y + P_PX
const END   = O_X + S_PX

// ── Colours ──────────────────────────────────────────────────────────────────
const NEUTRAL = '#F1F5F9'
const AMBER   = '#FEF3C7'
const BLUE    = '#DBEAFE'
const GREEN   = '#D1FAE5'

type Fills = { left: string; upRight: string; smallSq: string }

function fillsForPhase(phase: SplitPhase): Fills {
  switch (phase) {
    case 'left_rect':
      return { left: AMBER,   upRight: NEUTRAL, smallSq: NEUTRAL }
    case 'right_rect':
      return { left: NEUTRAL, upRight: AMBER,   smallSq: NEUTRAL }
    case 'big_sq':
      return { left: BLUE,    upRight: BLUE,    smallSq: BLUE    }
    case 'small_sq':
      return { left: NEUTRAL, upRight: NEUTRAL, smallSq: AMBER   }
    case 'answer':
      return { left: GREEN,   upRight: GREEN,   smallSq: GREEN   }
    default:
      return { left: NEUTRAL, upRight: NEUTRAL, smallSq: NEUTRAL }
  }
}

// Region centres (for area labels)
const L_CX  = O_X + P_PX / 2
const L_CY  = O_Y + S_PX / 2
const UR_CX = DIV_X + (S_PX - P_PX) / 2
const UR_CY = O_Y + P_PX / 2
const SQ_CX = DIV_X + (S_PX - P_PX) / 2
const SQ_CY = DIV_Y + (S_PX - P_PX) / 2

export default function SquareSplitSIMOC19G3Q15Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'id'
  const story = useMemo(() => buildSquareSplitSIMOC19G3Q15Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const fills = fillsForPhase(beat.phase)

  const showSmallArea = beat.phase === 'small_sq' || beat.phase === 'answer'

  return (
    <div
      className="mx-auto w-full max-w-[320px]"
      role="img"
      aria-label={
        lang === 'id'
          ? 'Penjelasan: p=4, s=11 → luas besar 121 + luas kecil 49 = 170 cm²'
          : 'Explainer: p=4, s=11 → big sq 121 + small sq 49 = 170 cm²'
      }
    >
      <div className="flex flex-col items-center gap-3">
        {/* SVG figure */}
        <div className="overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2">
          <svg viewBox="0 0 200 200" width="190" height="190" xmlns="http://www.w3.org/2000/svg">
            {/* Coloured region fills */}
            <rect x={O_X}   y={O_Y}   width={P_PX}           height={S_PX}           fill={fills.left}    />
            <rect x={DIV_X} y={O_Y}   width={S_PX - P_PX}   height={P_PX}           fill={fills.upRight} />
            <rect x={DIV_X} y={DIV_Y} width={S_PX - P_PX}   height={S_PX - P_PX}   fill={fills.smallSq} />

            {/* Big square outline */}
            <rect x={O_X} y={O_Y} width={S_PX} height={S_PX}
              fill="none" stroke="#1E293B" strokeWidth="2" />

            {/* Internal dividers */}
            <line x1={DIV_X} y1={O_Y}   x2={DIV_X} y2={END}   stroke="#1E293B" strokeWidth="1.5" />
            <line x1={DIV_X} y1={DIV_Y} x2={END}   y2={DIV_Y} stroke="#1E293B" strokeWidth="1.5" />

            {/* Static area labels for the two rectangles */}
            <text x={L_CX}  y={L_CY  - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">44</text>
            <text x={L_CX}  y={L_CY  + 10} textAnchor="middle" fontSize="10" fill="#64748B">cm²</text>
            <text x={UR_CX} y={UR_CY - 6}  textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">28</text>
            <text x={UR_CX} y={UR_CY + 10} textAnchor="middle" fontSize="10" fill="#64748B">cm²</text>

            {/* Small square label — "?" until revealed */}
            {!showSmallArea && (
              <text x={SQ_CX} y={SQ_CY + 8} textAnchor="middle" fontSize="24" fontWeight="700" fill="#94A3B8">?</text>
            )}
            {showSmallArea && (
              <text x={SQ_CX} y={SQ_CY + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#065F46">49 cm²</text>
            )}

            {/* Corner labels */}
            <text x={O_X  - 5} y={O_Y  - 2}  textAnchor="end"   fontSize="13" fontWeight="700" fill="#1E293B">A</text>
            <text x={END  + 5} y={O_Y  - 2}  textAnchor="start" fontSize="13" fontWeight="700" fill="#1E293B">B</text>
            <text x={END  + 5} y={END  + 12} textAnchor="start" fontSize="13" fontWeight="700" fill="#1E293B">C</text>
            <text x={O_X  - 5} y={END  + 12} textAnchor="end"   fontSize="13" fontWeight="700" fill="#1E293B">D</text>
          </svg>
        </div>

        {/* Summary badge (shown once a key value is derived) */}
        {beat.badge && (
          <motion.div
            key={beat.phase}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="rounded-xl border-2 px-4 py-1 font-display text-lg font-black tabular-nums"
            style={
              beat.result
                ? { background: '#D1FAE5', borderColor: '#059669', color: '#065F46' }
                : { background: '#DBEAFE', borderColor: '#2563EB', color: '#1E40AF' }
            }
          >
            {beat.badge}
          </motion.div>
        )}

        {/* Beat caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#059669', color: '#065F46' }
              : { background: '#FEF3C7', borderColor: '#D97706', color: '#92400E' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
