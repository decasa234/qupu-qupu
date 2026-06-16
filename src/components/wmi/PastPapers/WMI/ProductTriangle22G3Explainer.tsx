import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { ProductTriangle } from './ProductTriangle22G3Illustration'
import { buildProductTriangleSteps, ANSWER } from './productTriangle22G3Steps'

// Qupu colour tokens (echoing fill-qupu-* design tokens).
const GREEN = '#10B981'
const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_TEXT = '#065F46'

// Highlight colour for active sides (amber/orange overlay badge).
const HIGHLIGHT = '#F59E0B'

// ---------------------------------------------------------------------------
// Thin coloured pill that labels which side(s) are currently active.
// ---------------------------------------------------------------------------
interface SideHintProps {
  highlight: 'none' | 'topLeft' | 'topRight' | 'bottom' | 'topBoth'
  lang: 'en' | 'id'
}

function SideHint({ highlight, lang }: SideHintProps) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const label =
    highlight === 'topLeft'
      ? t('Upper-left side: × 8 = 104', 'Sisi kiri atas: × 8 = 104')
      : highlight === 'topRight'
        ? t('Upper-right side: × 8 = 72', 'Sisi kanan atas: × 8 = 72')
        : highlight === 'bottom'
          ? t('Bottom side: 13 × 9 = 117 ✓', 'Sisi bawah: 13 × 9 = 117 ✓')
          : highlight === 'topBoth'
            ? t('104 and 72 share the top corner', '104 dan 72 berbagi sudut atas')
            : null

  if (!label) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={highlight}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.25 }}
        className="rounded-full px-3 py-1 text-xs font-bold"
        style={{ background: '#FEF3C7', color: '#92400E', border: `1.5px solid ${HIGHLIGHT}` }}
      >
        {label}
      </motion.div>
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Wrapper that injects per-beat vertex state into the reusable ProductTriangle.
// ---------------------------------------------------------------------------
interface AnimatedTriangleProps {
  vertices: [number, number, number] | null
}

function AnimatedTriangle({ vertices }: AnimatedTriangleProps) {
  return (
    <motion.div
      layout
      style={{ width: '100%', maxWidth: 300 }}
    >
      <ProductTriangle
        sideTopLeft={104}
        sideTopRight={72}
        sideBottom={117}
        vertices={vertices}
      />
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main explainer
// ---------------------------------------------------------------------------
export default function ProductTriangle22G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildProductTriangleSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: faktor persekutuan 104 dan 72 adalah 8 (sudut atas). Sudut kiri bawah = 104 ÷ 8 = 13. Sudut kanan bawah = 72 ÷ 8 = 9. Pemeriksaan: 13 × 9 = 117 ✓. Jumlah = ${ANSWER}.`
      : `Explainer: common factor of 104 and 72 is 8 (top corner). Bottom-left = 104 ÷ 8 = 13. Bottom-right = 72 ÷ 8 = 9. Check: 13 × 9 = 117 ✓. Sum = ${ANSWER}.`

  return (
    <div className="mx-auto w-full max-w-[380px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <AnimatedTriangle vertices={beat.vertices} />

        <SideHint highlight={beat.highlight} lang={lang} />

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              beat.result
                ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TEXT }
                : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
            }
          >
            {beat.caption}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
