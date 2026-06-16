import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ProductGrid25Figure } from './ProductGrid25G2Illustration'
import { buildProductGrid25Steps } from './productGrid25Steps'

// WMI-25F2A-Q19 — solve the product grid by deducing the white cells one at a
// time from the shaded products (a=6, b=5, c=7, d=8), then read the visible "?"
// = b*d = 40. FLAG: the keyed answer 61 needs a SECOND sub-grid (its "?" = 21)
// that the scan did not capture; the final beat states this honestly and never
// invents the missing grid.

const INK = '#1F2937'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const AMBER = '#D97706'
const AMBER_BG = '#FEF3C7'
const AMBER_INK = '#92400E'

// Figure geometry (mirrors ProductGrid25G2Illustration).
const CELL = 52
const PAD = 12

export default function ProductGrid25G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildProductGrid25Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Position of the highlighted shaded clue (if any), in figure coordinates.
  const clue = beat.focusClue
  const cluePos = clue
    ? (() => {
        const [r, c] = clue.split('-').map(Number)
        return { x: PAD + c * CELL, y: PAD + r * CELL }
      })()
    : null

  const width = PAD * 2 + 4 * CELL
  const height = PAD * 2 + 4 * CELL

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={t(
        'Solve the product grid: white cells are 6, 5, 7 and 8, so the visible question mark is 5 times 8 = 40. The keyed answer 61 also needs a second grid the scan did not capture.',
        'Selesaikan grid hasil kali: kotak putih bernilai 6, 5, 7, dan 8, jadi tanda tanya yang terlihat adalah 5 kali 8 = 40. Jawaban kunci 61 juga butuh grid kedua yang tak terekam scan.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* The static figure, animated cell-by-cell via `whites` / `revealQ`. */}
        <div className="relative" style={{ width: '100%', maxWidth: 250 }}>
          <ProductGrid25Figure whites={beat.whites} revealQ={beat.revealQ} />
          {/* Highlight ring over the clue being used this beat. */}
          <svg
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            style={{
              maxWidth: 250,
              position: 'absolute',
              inset: 0,
              margin: '0 auto',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <AnimatePresence>
              {cluePos && (
                <motion.rect
                  key={clue}
                  x={cluePos.x - 3}
                  y={cluePos.y - 3}
                  width={CELL + 6}
                  height={CELL + 6}
                  rx={6}
                  fill="none"
                  stroke={AMBER}
                  strokeWidth={3}
                  strokeDasharray="7 5"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  style={{ transformOrigin: `${cluePos.x + CELL / 2}px ${cluePos.y + CELL / 2}px` }}
                />
              )}
            </AnimatePresence>
          </svg>
        </div>

        {/* Solved white cells, shown as they are deduced. */}
        <div className="flex gap-2">
          {(['a', 'b', 'c', 'd'] as const).map((name) => {
            const v = beat.whites[name]
            const on = v != null
            return (
              <motion.div
                key={name}
                animate={{ scale: on ? 1 : 0.92, opacity: on ? 1 : 0.4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex min-w-[40px] flex-col items-center rounded-lg border-2 px-2 py-1"
                style={{
                  borderColor: on ? BLUE : '#CBD5E1',
                  background: on ? BLUE_BG : 'white',
                }}
              >
                <span className="font-display text-[10px] font-bold" style={{ color: on ? BLUE : '#94A3B8' }}>
                  {name}
                </span>
                <span className="font-display text-sm font-extrabold" style={{ color: on ? INK : '#CBD5E1' }}>
                  {on ? v : '·'}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Caption / verdict box. */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>

        {/* Honest scan-incomplete note on the final beat. */}
        <AnimatePresence>
          {beat.flagged && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border-2 px-3 py-1.5 text-center font-display text-[11px] font-bold"
              style={{ background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }}
            >
              {t(
                'Heads up: only ONE grid was in the scan. The second grid (its ? = 21) is not pictured.',
                'Perhatian: hanya SATU grid yang ada di scan. Grid kedua (? = 21) tidak tergambar.',
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
