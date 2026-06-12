/**
 * CubeNet22G3Explainer — post-answer animation for WMI-22F3A-Q11
 *
 * Teaches the try-and-eliminate strategy for net validity:
 *   Strip 2-3-4-5 = 4 side faces. Need exactly one top cap + one bottom cap.
 *   Remove 1 → both 6 and 7 collide on the bottom ✗
 *   Remove 6 → 1 tops, 7 bottoms ✓
 *   Remove 7 → 1 tops, 6 bottoms ✓
 *   Answer D: "6 or 7"
 *
 * Reuses the SquareNet primitive from the illustrator's file (same colours,
 * same layout) so the animation reads as the same scene coming alive.
 *
 * SSR-safe, deterministic. No Math.random, no Date.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { SquareNet, NET_SQUARES, CELL } from './CubeNet22G3Illustration'
import { buildCubeNet22G3Steps } from './cubeNet22G3Steps'

// Palette echoing the illustration's qupu colour tokens
const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const ROSE = '#e11d48'
const SHELL = '#F0F7FC'
const PEACH = '#cfe8f5'

// Layout constants matching the illustration's SVG
const PAD = 10
const GRID_COLS = 4
const GRID_ROWS = 3
const VIEW_W = GRID_COLS * CELL + PAD * 2
const VIEW_H = GRID_ROWS * CELL + PAD * 2
const DISPLAY_W = Math.min(260, VIEW_W)

// Collision badge — drawn as two overlapping squares with a warning mark
function CollisionBadge() {
  return (
    <motion.div
      key="collision"
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.3, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className="flex items-center gap-1 rounded-lg px-3 py-1.5"
      style={{ background: '#FFF1F2', border: `2px solid ${ROSE}` }}
      aria-hidden
    >
      <svg viewBox="0 0 36 20" width={36} height={20}>
        {/* two squares overlapping */}
        <rect x={0} y={2} width={14} height={14} rx={2} fill="#fecdd3" stroke={ROSE} strokeWidth={1.5} />
        <rect x={8} y={4} width={14} height={14} rx={2} fill="#fecdd3" stroke={ROSE} strokeWidth={1.5} />
        {/* lightning/collision mark */}
        <text x={26} y={14} fontSize="10" fontWeight="800" fill={ROSE} fontFamily="sans-serif">!</text>
      </svg>
      <span style={{ color: ROSE, fontWeight: 700, fontSize: 13, fontFamily: 'sans-serif' }}>
        collision
      </span>
    </motion.div>
  )
}

// Valid badge — green checkmark circle
function ValidBadge() {
  return (
    <motion.div
      key="valid"
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.3, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className="flex items-center gap-1 rounded-lg px-3 py-1.5"
      style={{ background: '#ECFDF5', border: `2px solid ${GREEN}` }}
      aria-hidden
    >
      <svg viewBox="0 0 20 20" width={20} height={20}>
        <circle cx={10} cy={10} r={9} fill="#ECFDF5" stroke={GREEN} strokeWidth={2} />
        <path d="M5.5 10.5 L8.5 13.5 L14.5 7" fill="none" stroke={GREEN} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ color: GREEN_INK, fontWeight: 700, fontSize: 13, fontFamily: 'sans-serif' }}>
        valid cube
      </span>
    </motion.div>
  )
}

export default function CubeNet22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCubeNet22G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = t(
    'Strategy: the strip 2-3-4-5 forms the four sides. Only one of squares 6 or 7 can serve as the bottom cap, so the other must be removed. Answer D: remove 6 or 7.',
    'Strategi: baris 2-3-4-5 membentuk empat sisi. Hanya satu dari persegi 6 atau 7 yang bisa jadi tutup bawah, jadi yang lain harus dibuang. Jawaban D: buang 6 atau 7.',
  )

  const isResult = beat.phase === 'result'

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[280px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* animated net SVG */}
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0.7, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            width={DISPLAY_W}
            style={{ display: 'block' }}
            aria-hidden="true"
          >
            <g transform={`translate(${PAD}, ${PAD})`}>
              <SquareNet
                squares={NET_SQUARES}
                removed={beat.removed}
                highlight={beat.highlight}
              />
            </g>
          </svg>
        </motion.div>

        {/* verdict badge area — fixed height to prevent layout shift */}
        <div className="flex h-9 items-center justify-center">
          {beat.collision && <CollisionBadge />}
          {beat.valid === true && !beat.collision && <ValidBadge />}
        </div>

        {/* caption box */}
        <motion.div
          key={beat.caption}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : beat.collision
                ? { background: '#FFF1F2', borderColor: ROSE, color: ROSE }
                : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
