// SEAMO-19-A-Q10 — post-answer explainer.
//
// Reuses TinyPerson + constants (cx, COLOR, SVG_W, SVG_H, GROUND_Y)
// from CassieQueue19A10Illustration.
//
// Animation beats (see cassieQueue19A10Steps.ts):
//   0. intro   — static queue; state positions.
//   1. front   — highlight front group (grey→amber).
//   2. back    — highlight back group (blue→violet).
//   3. count   — show 11 + 1 + 4 = 16 annotation.
//   4. trap    — show 12+5=17 crossed out, correct formula.
//   5. result  — full queue; answer A = 16.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  TinyPerson,
  cx,
  COLOR,
  SVG_W,
  SVG_H,
  GROUND_Y,
} from './CassieQueue19A10Illustration'
import { buildCassieQueue19A10Steps } from './cassieQueue19A10Steps'

const GREEN  = '#10B981'
const AMBER  = '#F59E0B'
const VIOLET = '#7C3AED'
const RED    = '#EF4444'

const N = 16
const FIG_W = Math.min(520, SVG_W)

// ── Per-beat shirt colour ─────────────────────────────────────────────────────

function beatShirt(pos: number, highlight: string): string {
  if (pos === 12) return COLOR.SHIRT_CASSIE
  if (highlight === 'front' && pos <= 11)  return AMBER
  if (highlight === 'back'  && pos >= 13)  return VIOLET
  if (highlight === 'all') {
    if (pos <= 11) return AMBER
    if (pos >= 13) return VIOLET
  }
  // default to illustration colours
  if (pos >= 13) return COLOR.SHIRT_BACK
  return COLOR.SHIRT_FRONT
}

function beatLabel(pos: number, highlight: string): string {
  if (pos === 12) return COLOR.LABEL_CASSIE
  if ((highlight === 'front' || highlight === 'all') && pos <= 11) return '#92400E'
  if ((highlight === 'back'  || highlight === 'all') && pos >= 13) return '#5B21B6'
  if (pos >= 13) return COLOR.LABEL_BACK
  return COLOR.LABEL_FRONT
}

// ── Count annotation ──────────────────────────────────────────────────────────

function CountAnnotation({ lang }: { lang: 'en' | 'id' }) {
  const label = lang === 'id' ? '11 + 1 + 4 = 16 orang' : '11 + 1 + 4 = 16 people'
  return (
    <g>
      <rect x={SVG_W / 2 - 76} y={3} width={152} height={20} rx={10} fill={GREEN} />
      <text
        x={SVG_W / 2} y={13}
        textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={900} fill="white" fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Trap annotation ───────────────────────────────────────────────────────────

function TrapAnnotation({ lang }: { lang: 'en' | 'id' }) {
  const wrong = '12 + 5 = 17 ✗'
  const right = lang === 'id' ? '12 + 5 − 1 = 16 ✓' : '12 + 5 − 1 = 16 ✓'
  return (
    <g>
      <rect x={SVG_W / 2 - 76} y={1} width={152} height={13} rx={6} fill={RED} opacity={0.15} />
      <text
        x={SVG_W / 2} y={8}
        textAnchor="middle" dominantBaseline="central"
        fontSize={9} fontWeight={700} fill={RED} fontFamily="ui-sans-serif, system-ui, sans-serif"
        style={{ textDecoration: 'line-through' }}
      >
        {wrong}
      </text>
      <rect x={SVG_W / 2 - 76} y={15} width={152} height={13} rx={6} fill={GREEN} opacity={0.15} />
      <text
        x={SVG_W / 2} y={22}
        textAnchor="middle" dominantBaseline="central"
        fontSize={9} fontWeight={700} fill={GREEN} fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {right}
      </text>
    </g>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function CassieQueue19A10Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const story = useMemo(() => buildCassieQueue19A10Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
    : { background: '#EDE9FE', borderColor: VIOLET, color: '#4C1D95' }

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Cassie ke-12 dari depan (11 orang di depan) dan ke-5 dari belakang (4 orang di belakang). Total = 11 + 1 + 4 = 16. Jawaban A.'
      : 'Explainer: Cassie is 12th from front (11 ahead) and 5th from back (4 behind). Total = 11 + 1 + 4 = 16. Answer A.'

  return (
    <div className="mx-auto w-full max-w-[560px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* figure */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={FIG_W}
          style={{ display: 'block', maxWidth: '100%' }}
          aria-hidden="true"
        >
          {/* white background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.BG} />

          {/* ground */}
          <rect x={0} y={GROUND_Y} width={SVG_W} height={SVG_H - GROUND_Y} fill={COLOR.GROUND} />
          <line x1={0} y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y}
            stroke={COLOR.GROUND_LINE} strokeWidth={1.5} />

          {/* FRONT / BACK labels */}
          <text x={8} y={GROUND_Y - 55} fontSize={9} fill="#9CA3AF"
            fontFamily="sans-serif" fontWeight="bold">FRONT</text>
          <text x={SVG_W - 36} y={GROUND_Y - 55} fontSize={9} fill="#9CA3AF"
            fontFamily="sans-serif" fontWeight="bold">BACK</text>
          <line x1={28} y1={GROUND_Y - 48} x2={SVG_W - 10} y2={GROUND_Y - 48}
            stroke="#D1D5DB" strokeWidth={1} />
          <polygon
            points={`${SVG_W - 10},${GROUND_Y - 51} ${SVG_W - 3},${GROUND_Y - 48} ${SVG_W - 10},${GROUND_Y - 45}`}
            fill="#D1D5DB"
          />

          {/* Cassie label */}
          <text x={cx(12)} y={GROUND_Y - 88} textAnchor="middle" fontSize={10}
            fontWeight="bold" fill={COLOR.LABEL_CASSIE} fontFamily="sans-serif">Cassie</text>
          <line x1={cx(12)} y1={GROUND_Y - 85} x2={cx(12)} y2={GROUND_Y - 65}
            stroke={COLOR.LABEL_CASSIE} strokeWidth={1} strokeDasharray="2 2" />

          {/* animated count or trap annotation */}
          <AnimatePresence>
            {beat.showCount && (
              <motion.g
                key="count"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              >
                <CountAnnotation lang={lang} />
              </motion.g>
            )}
            {beat.showTrap && (
              <motion.g
                key="trap"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              >
                <TrapAnnotation lang={lang} />
              </motion.g>
            )}
          </AnimatePresence>

          {/* all 16 people */}
          {Array.from({ length: N }, (_, k) => k + 1).map(pos => (
            <AnimatePresence key={pos}>
              <motion.g
                key={`person-${pos}-${beat.highlight}`}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <TinyPerson
                  posX={cx(pos)}
                  shirt={beatShirt(pos, beat.highlight)}
                  pos={pos}
                  labelColor={beatLabel(pos, beat.highlight)}
                  bold={pos === 12}
                />
              </motion.g>
            </AnimatePresence>
          ))}

          {/* answer chip on result beat */}
          {isResult && (
            <text
              x={SVG_W - 12} y={12}
              textAnchor="end" dominantBaseline="hanging"
              fontSize={14} fontWeight={900} fill={GREEN}
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              A ✓
            </text>
          )}
        </svg>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>

      </div>
    </div>
  )
}
