// IKMC-19-PE-Q19 — post-answer explainer.
// Animates: separate 3 pieces → assemble left lobe → add right lobe →
// add bottom triangle → complete heart → answer A.
//
// Imports the same piece / heart primitives from Pieces19Illustration so the
// animation reads as the same scene coming alive.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildPieces19Steps, type AssemblePhase } from './pieces19Steps'

const BLUE = '#29ABE2'
const STROKE = '#1A7CA8'
const BLUE_BG = '#E1F5FD'
const BLUE_INK = '#0D6B9A'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'

// ─── SVG path data for the assembled heart ────────────────────────────────────
// Heart in a 100×90 viewport.
const HEART_D = [
  'M 50 82',
  'C 50 82 10 55 10 35',
  'C 10 15 30 12 50 30',
  'C 70 12 90 15 90 35',
  'C 90 55 50 82 50 82',
  'Z',
].join(' ')

// ─── Clipping paths to reveal individual heart pieces ────────────────────────
//
// The heart is divided into 3 regions matching the scan pieces:
//   Piece 1 (left lobe): x < 50, y < 55 — the left curved region
//   Piece 2 (right lobe): x > 50, y < 55 — the right curved region (D-shape-like)
//   Piece 3 (bottom triangle): y > 45 — the bottom point region
//
// For the animation we draw the full heart but reveal it piece-by-piece via
// opacity transitions on each region.

interface HeartAssembleProps {
  phase: AssemblePhase
}

function HeartAssemble({ phase }: HeartAssembleProps) {
  const showLeft  = phase === 'lobe-left'  || phase === 'lobe-right' || phase === 'point' || phase === 'result'
  const showRight = phase === 'lobe-right' || phase === 'point' || phase === 'result'
  const showPoint = phase === 'point'  || phase === 'result'

  return (
    <svg
      viewBox="0 0 100 90"
      width="100%"
      style={{ maxWidth: 180, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <defs>
        {/* Clip left lobe: left half, top portion */}
        <clipPath id="clip-left-19">
          <rect x={0} y={0} width={50} height={90} />
        </clipPath>
        {/* Clip right lobe: right half, top portion */}
        <clipPath id="clip-right-19">
          <rect x={50} y={0} width={50} height={90} />
        </clipPath>
        {/* Clip bottom point: lower region */}
        <clipPath id="clip-bottom-19">
          <polygon points="0,45 100,45 100,90 0,90" />
        </clipPath>
      </defs>

      {/* Outline ghost of full heart (always faintly visible for reference) */}
      <path
        d={HEART_D}
        fill="none"
        stroke="#D1E8F5"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />

      {/* Piece 1 — left lobe */}
      {showLeft && (
        <motion.g
          key="left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          <path d={HEART_D} fill={BLUE} stroke={STROKE} strokeWidth={2} clipPath="url(#clip-left-19)" />
        </motion.g>
      )}

      {/* Piece 2 — right lobe */}
      {showRight && (
        <motion.g
          key="right"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          <path d={HEART_D} fill={BLUE} stroke={STROKE} strokeWidth={2} clipPath="url(#clip-right-19)" />
        </motion.g>
      )}

      {/* Piece 3 — bottom triangle point */}
      {showPoint && (
        <motion.g
          key="point"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          <path d={HEART_D} fill={BLUE} stroke={STROKE} strokeWidth={2} clipPath="url(#clip-bottom-19)" />
        </motion.g>
      )}

      {/* Full outline once all pieces placed */}
      {showPoint && (
        <motion.path
          key="outline"
          d={HEART_D}
          fill="none"
          stroke={STROKE}
          strokeWidth={2.5}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        />
      )}
    </svg>
  )
}

// ─── The 3 pieces shown separately (beat 0) ───────────────────────────────────

function ThreePiecesTray() {
  return (
    <svg
      viewBox="0 0 260 90"
      width="100%"
      style={{ maxWidth: 280, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Piece 1 — curved quarter (left lobe slice) */}
      <g transform="translate(8, 8)">
        <path
          d="M 30 5 C 5 5 5 25 5 38 C 5 52 15 60 32 62 L 58 22 C 46 10 38 5 30 5 Z"
          fill={BLUE}
          stroke={STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </g>
      {/* Piece 2 — D-shape (half-disk) */}
      <g transform="translate(95, 8)">
        <path
          d="M 10 2 L 10 74 A 36 36 0 0 0 10 2 Z"
          fill={BLUE}
          stroke={STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </g>
      {/* Piece 3 — right triangle */}
      <g transform="translate(162, 8)">
        <polygon
          points="5,5 5,74 80,74"
          fill={BLUE}
          stroke={STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

// ─── Explainer ────────────────────────────────────────────────────────────────

export default function Pieces19Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildPieces19Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const isResult = beat.result

  const aria = t(
    'The 3 cut pieces — a curved lobe slice, a half-disk, and a triangle — reassemble into a heart shape. Answer A.',
    '3 potongan — irisan lengkung, setengah lingkaran, dan segitiga — dirakit menjadi bentuk hati. Jawaban A.',
  )

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">

        {/* Main figure area */}
        <motion.div
          key={beat.phase}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
          style={{ width: '100%' }}
        >
          {beat.phase === 'pieces' ? (
            <ThreePiecesTray />
          ) : (
            <HeartAssemble phase={beat.phase} />
          )}
        </motion.div>

        {/* Caption chip */}
        <div
          className="min-h-[44px] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isResult
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE_INK }
          }
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
