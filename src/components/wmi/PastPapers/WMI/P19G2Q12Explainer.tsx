import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoStack } from './P19G2Q12Illustration'
import { buildP19G2Q12Steps } from './p19G2Q12Steps'

// WMI-19P2A-Q12 — post-answer explainer. First shows the isometric solid with the
// view arrow, then "flattens" it: builds the side silhouette one across-column at a
// time (each column = its TALLEST stack, depth collapsed), landing on the staircase
// outline that matches Figure A. Mirrors the static figure (same IsoStack).

const INK = '#1F2937'
const GREEN = '#10B981'
const FILL = '#BFD9F2' // pale-blue silhouette square
const FILL_DONE = '#A7F3D0' // green wash on the final beat

const CELL = 34

export default function P19G2Q12Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildP19G2Q12Steps(props.correctAnswer, lang), [props.correctAnswer, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cols = story.colHeights
  const maxH = Math.max(...cols)
  const gridW = cols.length * CELL
  const gridH = maxH * CELL
  const sqFill = beat.result ? FILL_DONE : FILL

  return (
    <div
      className="mx-auto w-full max-w-[360px]"
      role="img"
      aria-label={t(
        `Flattening the stack from the arrow gives a ${cols.join('-')} staircase outline, which matches Figure ${story.answer}.`,
        `Memipihkan tumpukan dari panah menghasilkan siluet tangga ${cols.join('-')}, yang cocok dengan Gambar ${story.answer}.`,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {beat.showSolid ? (
          <IsoStack />
        ) : (
          <svg
            viewBox={`0 0 ${gridW + 24} ${gridH + 24}`}
            width="100%"
            style={{ maxWidth: 220, display: 'block', margin: '0 auto' }}
            aria-hidden="true"
          >
            {/* the flat outline, built column by column; squares sit on a common baseline */}
            {cols.map((h, x) =>
              x < beat.builtCols
                ? Array.from({ length: h }, (_, k) => {
                    // k = 0 is the bottom square of this column
                    const sx = 12 + x * CELL
                    const sy = 12 + (maxH - 1 - k) * CELL
                    return (
                      <motion.rect
                        key={`${x}-${k}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        x={sx}
                        y={sy}
                        width={CELL}
                        height={CELL}
                        fill={sqFill}
                        stroke={INK}
                        strokeWidth={2}
                        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                      />
                    )
                  })
                : null,
            )}
          </svg>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
