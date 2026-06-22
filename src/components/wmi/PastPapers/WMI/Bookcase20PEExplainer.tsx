/**
 * IKMC-21-PE-Q20 — post-answer explainer.
 *
 * Animates two trial arrangements on the bookcase:
 *   Trial 1: ball on shelf 3 → game on 4, car on 5, blocks on 1 → shelf 3 taken.
 *   Trial 2: ball on shelf 2 → game on 3, remaining toys fill 1/4/5 → shelf 3 taken again.
 * Concludes: shelf 3 is always occupied; puzzle can never go there (answer C).
 *
 * Reuses BookcaseStructure, ShelfLabel, ToyIcon, bayMidY, INNER_X, INNER_W
 * from Bookcase20PEIllustration.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BookcaseStructure,
  ShelfLabel,
  ToyIcon,
  SVG_W,
  SVG_H,
  N_SHELVES,
  INNER_X,
  INNER_W,
  bayMidY,
  TOY_COLOR,
  type ToyName,
} from './Bookcase20PEIllustration'
import { buildBookcase20PESteps, BLOCKED_SHELF } from './bookcase20PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────

const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_INK = '#065F46'
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const ORANGE    = '#F97316'

// ── toy label map ─────────────────────────────────────────────────────────────

const TOY_LABEL_EN: Record<ToyName, string> = {
  ball:   'ball',
  blocks: 'blocks',
  game:   'game',
  puzzle: 'puzzle',
  car:    'car',
}
const TOY_LABEL_ID: Record<ToyName, string> = {
  ball:   'bola',
  blocks: 'balok',
  game:   'permainan',
  puzzle: 'puzzle',
  car:    'mobil',
}

// ── blocked-shelf overlay ─────────────────────────────────────────────────────

/** Red X stripe over the bay of the blocked shelf. */
function BlockedOverlay({ shelf }: { shelf: number }) {
  const my = bayMidY(shelf)
  const bx = INNER_X + 4
  const br = INNER_X + INNER_W - 4
  const r  = 18
  return (
    <g>
      <rect x={bx} y={my - r} width={br - bx} height={r * 2}
            fill="rgba(239,68,68,0.15)" rx={4} />
      <line x1={bx + 4}  y1={my - r + 4} x2={br - 4} y2={my + r - 4}
            stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" />
      <line x1={br - 4}  y1={my - r + 4} x2={bx + 4} y2={my + r - 4}
            stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" />
    </g>
  )
}

/** Orange ring highlight around a shelf bay. */
function ShelfHighlight({ shelf }: { shelf: number }) {
  const my = bayMidY(shelf)
  const bx = INNER_X + 2
  const br = INNER_X + INNER_W - 2
  const r  = 20
  return (
    <rect x={bx} y={my - r} width={br - bx} height={r * 2}
          fill="none" stroke={ORANGE} strokeWidth={2.5} rx={6}
          strokeDasharray="6 3" />
  )
}

// ── full explainer ────────────────────────────────────────────────────────────

export default function Bookcase20PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t    = (en: string, id: string) => (lang === 'id' ? id : en)
  const toyLabel = lang === 'id' ? TOY_LABEL_ID : TOY_LABEL_EN

  const story = useMemo(() => buildBookcase20PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat     = story.steps[index] ?? story.steps[story.finalIndex]
  const isResult = beat.result

  const aria = t(
    `Animated proof: in every valid arrangement shelf ${BLOCKED_SHELF} is always occupied, so the puzzle cannot go there.`,
    `Bukti animasi: dalam setiap susunan valid, rak ${BLOCKED_SHELF} selalu terisi, sehingga puzzle tidak bisa di sana.`,
  )

  // Place toy icons at the horizontal centre of the inner bay.
  const centerX = INNER_X + INNER_W / 2

  return (
    <div className="mx-auto w-full max-w-[280px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <motion.div
          key={index}
          className="w-full"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H + 10}`}
            width="100%"
            style={{ display: 'block', margin: '0 auto', maxWidth: 220 }}
            aria-hidden="true"
          >
            {/* static bookcase structure */}
            <BookcaseStructure />

            {/* shelf number labels */}
            {Array.from({ length: N_SHELVES }, (_, i) => (
              <ShelfLabel key={i + 1} n={i + 1} />
            ))}

            {/* highlight ring (beat-specific) */}
            {beat.highlight !== null && <ShelfHighlight shelf={beat.highlight} />}

            {/* toy icons for this beat */}
            {beat.placements.map(({ shelf, toy }) => {
              const my = bayMidY(shelf)
              return (
                <g key={`${shelf}-${toy}`}>
                  <ToyIcon toy={toy} cx={centerX} cy={my} size={26} />
                  {/* small label below the icon */}
                  <text
                    x={centerX} y={my + 18}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={8} fontWeight={700} fill={TOY_COLOR[toy]}
                    fontFamily="system-ui, sans-serif"
                  >
                    {toyLabel[toy]}
                  </text>
                </g>
              )
            })}

            {/* blocked shelf overlay (final beat) */}
            {beat.blocked !== null && <BlockedOverlay shelf={beat.blocked} />}
          </svg>
        </motion.div>

        <div
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG,  borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG,   borderColor: BLUE,  color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
