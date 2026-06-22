/**
 * IKMC-22-PE-Q10 — post-answer explainer: "Which basket is the puppy in?"
 *
 * Animation beats:
 *   0. intro         — show all 5 baskets; state the task.
 *   1. koala-fox     — highlight baskets 2 & 4 (same pattern AND shape).
 *   2. kang-ostrich  — highlight baskets 1 & 3 (same pattern, different shape).
 *   3. process       — both pairs highlighted; "4 assigned → 1 remains".
 *   4. result        — highlight basket 5 (puppy); equation + green caption.
 *
 * Reuses BasketGlyph, BASKET_CX, BASELINE_Y, SVG_W, SVG_H, C
 * from ./Baskets10PEIllustration.
 */

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  BasketGlyph,
  BASKET_CX,
  BASELINE_Y,
  SVG_W,
  SVG_H,
} from './Baskets10PEIllustration'
import { buildBaskets10PESteps } from './baskets10PESteps'

// ── Colour tokens ─────────────────────────────────────────────────────────────

const BLUE = '#2563EB'
const BLUE_BG = '#EFF6FF'
const GREEN = '#16A34A'
const GREEN_BG = '#DCFCE7'
const GREEN_TEXT = '#14532D'
const TEAL = '#0D9488'
const TEAL_BG = '#CCFBF1'
const TEAL_TEXT = '#134E4A'
const LABEL = '#374151'

// Highlight colours per group
const COLOR_KOALA_FOX = '#F59E0B'   // amber: koala + fox pair
const COLOR_KANG_OST = '#8B5CF6'    // violet: kangaroo + ostrich pair
const COLOR_PUPPY = '#10B981'       // emerald: the answer basket

// Which basket indices (0-based) belong to which group
const IDX_KOALA_FOX = [1, 3]   // baskets 2 & 4
const IDX_KANG_OST = [0, 2]    // baskets 1 & 3
const IDX_PUPPY = 4            // basket 5

const FIG_W = Math.min(400, SVG_W)

// ── PairBadge: floating label above a basket pair ────────────────────────────

interface PairBadgeProps {
  basketIndices: number[]
  label: string
  color: string
}

function PairBadge({ basketIndices, label, color }: PairBadgeProps) {
  // Centre badge between the pair's baskets
  const xs = basketIndices.map((i) => BASKET_CX[i])
  const midX = (Math.min(...xs) + Math.max(...xs)) / 2
  const badgeY = 18

  return (
    <g>
      <rect
        x={midX - 34}
        y={badgeY - 10}
        width={68}
        height={20}
        rx={10}
        fill={color}
      />
      <text
        x={midX}
        y={badgeY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={800}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── PuppyBadge: star badge above basket 5 ─────────────────────────────────────

function PuppyBadge({ label }: { label: string }) {
  const cx = BASKET_CX[IDX_PUPPY]
  return (
    <g>
      <rect
        x={cx - 24}
        y={8}
        width={48}
        height={22}
        rx={11}
        fill={COLOR_PUPPY}
      />
      <text
        x={cx}
        y={19}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={900}
        fill="white"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Helpers: compute highlight colour per basket index ───────────────────────

function getHighlight(
  idx: number,
  showKoalaFox: boolean,
  showKangOst: boolean,
  showPuppy: boolean,
): string | null {
  if (showPuppy && idx === IDX_PUPPY) return COLOR_PUPPY
  if (showKoalaFox && IDX_KOALA_FOX.includes(idx)) return COLOR_KOALA_FOX
  if (showKangOst && IDX_KANG_OST.includes(idx)) return COLOR_KANG_OST
  return null
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function Baskets10PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildBaskets10PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  // Pair badge labels
  const koalaFoxLabel = lang === 'id' ? 'Koala + Rubah' : 'Koala + Fox'
  const kangOstLabel = lang === 'id' ? 'Kanguru + B.Unta' : 'Kangaroo + Ostrich'
  const puppyLabel = lang === 'id' ? 'Anak Anjing!' : 'Puppy!'

  // Caption style
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
    : beat.phase === 'koala-fox'
      ? { background: '#FEF3C7', borderColor: COLOR_KOALA_FOX, color: '#78350F' }
      : beat.phase === 'kang-ostrich' || beat.phase === 'process'
        ? { background: TEAL_BG, borderColor: TEAL, color: TEAL_TEXT }
        : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const equationColor = isResult ? GREEN : beat.phase === 'koala-fox' ? COLOR_KOALA_FOX : TEAL

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Koala dan rubah ada di keranjang 2 dan 4 (titik + bentuk sama). Kanguru dan burung unta ada di keranjang 1 dan 3 (pola anyaman sama). Keranjang 5 yang tersisa adalah milik anak anjing — jawaban E.'
      : 'Explainer: Koala and fox are in baskets 2 and 4 (same dots + same shape). Kangaroo and ostrich are in baskets 1 and 3 (same weave pattern). The remaining basket 5 belongs to the puppy — answer E.'

  // Basket types for rendering (1-indexed)
  const basketTypes = [1, 2, 3, 4, 5] as const

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="white" />

          {/* Baskets */}
          {basketTypes.map((type, i) => (
            <BasketGlyph
              key={type}
              cx={BASKET_CX[i]}
              baseY={BASELINE_Y}
              type={type}
              highlight={getHighlight(
                i,
                beat.highlightKoalaFox,
                beat.highlightKangOstrich,
                beat.highlightPuppy,
              )}
            />
          ))}

          {/* Basket number labels */}
          {BASKET_CX.map((bx, i) => (
            <text
              key={i}
              x={bx}
              y={BASELINE_Y + 12}
              textAnchor="middle"
              dominantBaseline="hanging"
              fontSize={11}
              fontWeight={700}
              fill={LABEL}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {i + 1}
            </text>
          ))}

          {/* Koala/Fox pair badge */}
          <AnimatePresence>
            {beat.highlightKoalaFox && (
              <motion.g
                key="koala-fox-badge"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <PairBadge
                  basketIndices={IDX_KOALA_FOX}
                  label={koalaFoxLabel}
                  color={COLOR_KOALA_FOX}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Kangaroo/Ostrich pair badge */}
          <AnimatePresence>
            {beat.highlightKangOstrich && (
              <motion.g
                key="kang-ost-badge"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                <PairBadge
                  basketIndices={IDX_KANG_OST}
                  label={kangOstLabel}
                  color={COLOR_KANG_OST}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Puppy badge */}
          <AnimatePresence>
            {beat.highlightPuppy && (
              <motion.g
                key="puppy-badge"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              >
                <PuppyBadge label={puppyLabel} />
              </motion.g>
            )}
          </AnimatePresence>
        </svg>

        {/* Equation chip */}
        <div className="flex min-h-[2rem] items-center justify-center">
          <AnimatePresence mode="wait">
            {beat.equation !== '' && (
              <motion.span
                key={beat.equation}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                className="rounded-full px-4 py-1 font-display text-sm font-black tabular-nums text-white"
                style={{ background: equationColor }}
              >
                {beat.equation}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Caption */}
        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
