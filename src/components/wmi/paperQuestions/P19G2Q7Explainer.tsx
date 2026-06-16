import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { DIVIDERS, Piece, node } from './P19G2Q7Illustration'
import { buildP19G2Q7Steps } from './p19G2Q7Steps'

// WMI-19P2A-Q7 — post-answer explainer. The divided trapezoid is examined ONE
// shape-kind at a time (triangle → rectangle → parallelogram → trapezoid),
// tinting genuine pieces of the figure, then it lands on the answer letter (A):
// the table whose four counts agree. Mirrors the static figure exactly — same
// trapezoid + same dashed dividers — with the current kind's pieces highlighted.

const INK = '#1F2937'
const GREEN = '#10B981'

const KIND_FILL: Record<string, string> = {
  triangle: '#3B82F6', // blue
  rectangle: '#10B981', // green
  parallelogram: '#8B5CF6', // violet
  trapezoid: '#F59E0B', // amber
}

const KIND_LABEL: Record<string, [string, string]> = {
  triangle: ['triangles', 'segitiga'],
  rectangle: ['rectangles', 'persegi panjang'],
  parallelogram: ['parallelograms', 'jajar genjang'],
  trapezoid: ['trapezoids', 'trapesium'],
}

export default function P19G2Q7Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildP19G2Q7Steps(props.correctAnswer, lang), [props.correctAnswer, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const fill = beat.kind ? KIND_FILL[beat.kind] : INK
  const kindLabel = beat.kind ? t(KIND_LABEL[beat.kind][0], KIND_LABEL[beat.kind][1]) : ''

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={t(
        `Counting the pieces one shape-kind at a time, the four counts match the table in Figure ${story.answer}.`,
        `Menghitung bagian satu jenis bentuk setiap kali, keempat jumlah cocok dengan tabel di Gambar ${story.answer}.`,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 410 200" width="100%" style={{ maxWidth: 360, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {/* tinted pieces for the current shape-kind */}
          {beat.shapes.map((pts, i) => (
            <motion.g
              key={`${index}-${i}`}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <Piece pts={pts} fill={fill} stroke={fill} strokeWidth={3} opacity={0.3} />
              <Piece pts={pts} fill="none" stroke={fill} strokeWidth={3.2} />
            </motion.g>
          ))}

          {/* outer trapezoid (solid) */}
          <Piece pts={['TL', 'TR', 'BR', 'BL']} fill="none" stroke={INK} strokeWidth={2.6} />
          {/* internal dashed dividers (identical to the static figure) */}
          {DIVIDERS.map(([a, b], i) => {
            const p1 = node(a)
            const p2 = node(b)
            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={INK}
                strokeWidth={2}
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            )
          })}
        </svg>

        {/* current-kind tally chip */}
        {beat.kind && (
          <motion.div
            key={`${index}-chip`}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="rounded-full px-3 py-0.5 font-display text-xs font-extrabold text-white"
            style={{ background: fill }}
          >
            {kindLabel}: {beat.shapes.length}
          </motion.div>
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
