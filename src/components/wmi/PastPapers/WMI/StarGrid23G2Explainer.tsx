import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { STAR_GRID23, StarGrid23G2 } from './StarGrid23G2Illustration'

// ── colour tokens (echoing fill-qupu-* palette) ────────────────────────────
const BRAND_BLUE = '#30598A'
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const ORANGE = '#EA580C'

// ── deterministic enumeration ───────────────────────────────────────────────
// Returns { bySize, examples, total } where:
//   bySize[s]   = count of squares of size s×s covering exactly one star
//   examples[s] = first qualifying square {r,c,size} to highlight as example
//   total       = sum over all sizes (must equal 18)
function enumerateStarSquares(gridSize: number, stars: Array<[number, number]>) {
  const bySize: Record<number, number> = {}
  const examples: Record<number, { r: number; c: number; size: number }[]> = {}

  for (let size = 1; size <= gridSize; size++) {
    bySize[size] = 0
    examples[size] = []
    for (let r = 0; r <= gridSize - size; r++) {
      for (let c = 0; c <= gridSize - size; c++) {
        let count = 0
        for (const [sr, sc] of stars) {
          if (sr >= r && sr < r + size && sc >= c && sc < c + size) count++
        }
        if (count === 1) {
          bySize[size]++
          // keep up to 3 example squares per size for the highlight
          if (examples[size].length < 3) {
            examples[size].push({ r, c, size })
          }
        }
      }
    }
  }

  const total = Object.values(bySize).reduce((a, b) => a + b, 0)
  return { bySize, examples, total }
}

// ── beat type ───────────────────────────────────────────────────────────────
interface StarGridBeat {
  phase: 'intro' | 'size' | 'result'
  /** Sizes whose qualifying squares are lit up on this beat ([] = none). */
  highlightSquares: Array<{ r: number; c: number; size: number }>
  /** Running total of qualifying squares revealed so far. */
  running: number
  caption: string
  hold: number
  result: boolean
}

// ── storyboard builder ──────────────────────────────────────────────────────
function buildStarGridSteps(lang: 'en' | 'id') {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const { gridSize, stars } = STAR_GRID23
  const { bySize, examples, total } = enumerateStarSquares(gridSize, stars)

  const steps: StarGridBeat[] = []

  // Beat 0 — intro
  steps.push({
    phase: 'intro',
    highlightSquares: [],
    running: 0,
    hold: 2400,
    result: false,
    caption: t(
      'Count squares of EVERY size (1×1, 2×2, 3×3 …) that hold exactly one ★.',
      'Hitung persegi dari SEMUA ukuran (1×1, 2×2, 3×3 …) yang memuat tepat satu ★.',
    ),
  })

  // Beats per active size
  let running = 0
  for (let size = 1; size <= gridSize; size++) {
    const n = bySize[size]
    if (n === 0 && size > 3) {
      // Skip sizes with 0 qualifiers after size 3 (4,5,6 each have 0)
      // but reveal them together in the result caption
      continue
    }
    running += n
    const ex = examples[size]

    if (n === 0) {
      // Still emit a beat showing zero for instructive sizes ≤ 3
      steps.push({
        phase: 'size',
        highlightSquares: [],
        running,
        hold: 1600,
        result: false,
        caption: t(
          `${size}×${size}: 0 qualify (each covers 0 or 2+ stars). Running: ${running}.`,
          `${size}×${size}: 0 yang lolos (tiap kotak memuat 0 atau ≥2 bintang). Total: ${running}.`,
        ),
      })
    } else {
      steps.push({
        phase: 'size',
        highlightSquares: ex,
        running,
        hold: size === 1 ? 2000 : 2200,
        result: false,
        caption: t(
          `${size}×${size} squares: ${n} hold exactly one ★. Running total: ${running}.`,
          `Persegi ${size}×${size}: ${n} memuat tepat satu ★. Total sejauh ini: ${running}.`,
        ),
      })
    }
  }

  // Final beat — result
  const sizeParts = [1, 2, 3].map((s) => bySize[s]).join(' + ')
  steps.push({
    phase: 'result',
    highlightSquares: [],
    running: total,
    hold: 0,
    result: true,
    caption: t(
      `${sizeParts} = ${total} squares total contain exactly one ★.`,
      `${sizeParts} = ${total} persegi memuat tepat satu ★.`,
    ),
  })

  return { steps, finalIndex: steps.length - 1, total }
}

// ── component ───────────────────────────────────────────────────────────────
export default function StarGrid23G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildStarGridSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accentColor = beat.result ? GREEN : beat.phase === 'size' && beat.highlightSquares.length > 0 ? ORANGE : BRAND_BLUE

  const ariaLabel = t(
    `Strategy: count squares of every size holding exactly one star. Answer: ${story.total}.`,
    `Strategi: hitung persegi segala ukuran yang memuat tepat satu bintang. Jawaban: ${story.total}.`,
  )

  return (
    <div
      className="mx-auto w-full max-w-[340px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Grid */}
        <StarGrid23G2
          gridSize={STAR_GRID23.gridSize}
          stars={STAR_GRID23.stars}
          highlightSquares={beat.highlightSquares}
        />

        {/* Running counter */}
        <AnimatePresence mode="wait">
          {beat.running > 0 && (
            <motion.div
              key={beat.running}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="font-display text-3xl font-black tabular-nums"
              style={{ color: beat.result ? GREEN : accentColor }}
            >
              {beat.running}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Caption */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : beat.phase === 'size' && beat.highlightSquares.length > 0
                ? { background: '#FFF7ED', borderColor: ORANGE, color: ORANGE }
                : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
