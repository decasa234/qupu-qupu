import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { PathTrace, nodeCenter, TRACE_FILL, NODE_STROKE, NODE_TEXT } from './BoardPath24G2Illustration'
import { buildBoardPathStory } from './boardPath24Steps'

// WMI-24F2A-Q24 (HARD) — post-answer explainer for the board-game teleport
// problem. It mirrors the static figure (PathTrace) and walks the token one
// move per beat: first roll 3 → teleport to 13, then it tests each ◇ candidate
// from 13, rejecting the dead ends and collecting the winning (◇,△) pairs whose
// products add to 24. Deterministic + SSR-safe: pure render of the storyboard.

// qupu colour echoes (kept in sync with the illustration tokens)
const WIN_BG = '#D1FAE5'
const WIN_BORDER = '#10B981'
const WIN_TEXT = '#065F46'
const BAD_BG = '#FDE2E1'
const BAD_BORDER = '#E0533D'
const BAD_TEXT = '#8A2C20'
const NEUTRAL_BG = '#E1EFFB'
const NEUTRAL_BORDER = '#30598A'
const NEUTRAL_TEXT = '#30598A'

const VIEW_W = 920
const VIEW_H = 470

export default function BoardPath24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildBoardPathStory(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const token = beat.tokenAt != null ? nodeCenter(beat.tokenAt) : null

  const verdictStyle =
    beat.verdict === true
      ? { background: WIN_BG, borderColor: WIN_BORDER, color: WIN_TEXT }
      : beat.verdict === 'bad'
        ? { background: BAD_BG, borderColor: BAD_BORDER, color: BAD_TEXT }
        : { background: NEUTRAL_BG, borderColor: NEUTRAL_BORDER, color: NEUTRAL_TEXT }

  const aria = t(
    'Trace the board path: roll 3 jumps from square 3 to 13, then the pairs (2,1), (4,1) and (6,3) reach FINISH, and 2 + 4 + 18 = 24.',
    'Telusuri jalur papan: lemparan 3 melompat dari kotak 3 ke 13, lalu pasangan (2,1), (4,1), dan (6,3) sampai FINISH, dan 2 + 4 + 18 = 24.',
  )

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        {/* board + animated token overlay, sharing the illustration's viewBox */}
        <div className="relative w-full" style={{ maxWidth: 560, margin: '0 auto' }}>
          <PathTrace activeIds={beat.activeIds} showTeleports={beat.showTeleports} width={560} />
          {/* token marker, positioned over the active square via an aligned overlay svg */}
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            width="100%"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            aria-hidden="true"
          >
            {token && (
              <motion.g
                key={`${beat.tokenAt}-${index}`}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <circle cx={token.x} cy={token.y} r={18} fill={TRACE_FILL} stroke={NODE_STROKE} strokeWidth={3} />
                <text
                  x={token.x}
                  y={token.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={20}
                  fontWeight={900}
                  fill={NODE_TEXT}
                  className="font-display"
                >
                  ●
                </text>
              </motion.g>
            )}
          </svg>
        </div>

        {/* tally strip — winning (◇,△) pairs found so far */}
        {beat.tally.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {beat.tally.map((w) => (
              <motion.div
                key={`${w.a}-${w.b}`}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="rounded-lg border-2 px-2.5 py-1 font-display text-xs font-extrabold"
                style={{ background: WIN_BG, borderColor: WIN_BORDER, color: WIN_TEXT }}
              >
                {w.a} × {w.b} = {w.prod}
              </motion.div>
            ))}
          </div>
        )}

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={verdictStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
