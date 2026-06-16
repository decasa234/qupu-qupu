import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ParaPolygon, PARA_DIVIDERS, PARA_POINTS, paraPoint } from './ParaDivide25G3Illustration'
import { buildParaDivide25G3Steps } from './paraDivide25G3Steps'

// WMI-25F3A-Q19 — post-answer explainer. Enumerates every parallelogram and every
// trapezoid in the divided figure, ONE shape per beat, with a running counter that
// lands on exactly 14 (7 parallelograms + 7 trapezoids). Mirrors the static figure:
// same lattice, same dividing strokes, with each counted shape tinted in turn.

const INK = '#1F2937'
const PARA_FILL = '#3B82F6' // fill-qupu-brand-blue family
const TRAP_FILL = '#F59E0B' // fill-qupu-* amber family
const GREEN = '#10B981'

function project(name: keyof typeof PARA_POINTS) {
  return paraPoint(PARA_POINTS[name])
}

export default function ParaDivide25G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildParaDivide25G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const fill = beat.kind === 'trapezoid' ? TRAP_FILL : PARA_FILL

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={t(
        `Counting shape by shape: ${story.parallelogramCount} parallelograms plus ${story.trapezoidCount} trapezoids make ${story.answer} in total.`,
        `Menghitung bentuk demi bentuk: ${story.parallelogramCount} jajar genjang ditambah ${story.trapezoidCount} trapesium menjadi ${story.answer} secara keseluruhan.`,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox="0 0 430 200"
          width="100%"
          style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* the qualifying shape, tinted */}
          {beat.shape && (
            <motion.g
              key={`${index}-${beat.shape.join('')}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <ParaPolygon
                pts={beat.shape}
                fill={fill}
                stroke={fill}
                strokeWidth={3}
                opacity={0.32}
              />
              <ParaPolygon pts={beat.shape} fill="none" stroke={fill} strokeWidth={3.5} />
            </motion.g>
          )}

          {/* outer parallelogram */}
          <ParaPolygon pts={['BL', 'BR', 'TR', 'TL']} fill="none" stroke={INK} strokeWidth={2.4} />
          {/* internal dividing lines (same as static figure) */}
          {PARA_DIVIDERS.map(([a, b], i) => {
            const p1 = project(a)
            const p2 = project(b)
            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={INK}
                strokeWidth={2}
                strokeLinecap="round"
              />
            )
          })}
        </svg>

        {/* running counter */}
        <div className="flex items-center gap-3 font-display text-xs font-bold">
          <span style={{ color: PARA_FILL }}>
            {t('parallelograms', 'jajar genjang')}:{' '}
            {Math.min(beat.count, story.parallelogramCount)}
          </span>
          <span style={{ color: TRAP_FILL }}>
            {t('trapezoids', 'trapesium')}:{' '}
            {Math.max(0, beat.count - story.parallelogramCount)}
          </span>
          <motion.span
            key={beat.count}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="rounded-full px-2 py-0.5 font-extrabold text-white"
            style={{ background: beat.result ? GREEN : '#30598A' }}
          >
            {t('total', 'total')} {beat.count}
          </motion.span>
        </div>

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
