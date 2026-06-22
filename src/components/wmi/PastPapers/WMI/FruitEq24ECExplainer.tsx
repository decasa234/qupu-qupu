// FruitEq24ECExplainer.tsx
// IKMC-22-EC-Q24 — animated post-answer explainer for Joanna's card-fruit equations.
//
// Reuses the EquationRow primitive from FruitEq24ECIllustration to stay visually
// consistent. Beat-by-beat shows the substitution and value-assignment path.

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  EQ_VIEW_W,
  EquationRow,
  StrawberryGlyph,
  WatermelonGlyph,
  GrapesGlyph,
  TomatoGlyph,
} from './FruitEq24ECIllustration'
import { buildFruitEq24ECSteps } from './fruitEq24ECSteps'

const BLUE  = '#30598A'
const GREEN = '#10B981'
const AMBER = '#F59E0B'
const INK   = '#1F2937'

// ── Fruit row with optional value badge (used in the legend strip) ────────────

interface LegendFruitProps {
  label: string
  value: number | null
  idx: number
}

type GlyphFC = (props: { cx: number; cy: number; r?: number }) => JSX.Element | null
const GLYPH_MAP: Record<string, GlyphFC> = {
  strawberry: StrawberryGlyph,
  watermelon: WatermelonGlyph,
  grapes: GrapesGlyph,
  tomato: TomatoGlyph,
}

function LegendFruit({ label, value, idx }: LegendFruitProps) {
  const VIEW_W_LEGEND = 280
  const slotW = VIEW_W_LEGEND / 4
  const cx = slotW * idx + slotW / 2
  const Glyph = GLYPH_MAP[label]
  return (
    <g key={label}>
      <Glyph cx={cx} cy={22} r={14} />
      {value !== null && (
        <g>
          <circle cx={cx + 12} cy={8} r={9} fill={GREEN} stroke="#FFFFFF" strokeWidth={1.5} />
          <text x={cx + 12} y={8} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={900} fill="#FFFFFF">
            {value}
          </text>
        </g>
      )}
    </g>
  )
}

// ── Main explainer ─────────────────────────────────────────────────────────────

const EXPL_VIEW_W = EQ_VIEW_W   // 280
const EXPL_VIEW_H = 310

export default function FruitEq24ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildFruitEq24ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const accent = beat.result ? GREEN : beat.highlightEq1 || beat.highlightEq2 ? AMBER : BLUE
  const fruits = ['strawberry', 'watermelon', 'grapes', 'tomato'] as const

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: Misalkan stroberi=1, semangka=2, anggur=3, tomat=4. Maka semangka + tomat = 2 + 4 = 6, jawaban D.'
      : 'Explainer: Let strawberry=1, watermelon=2, grapes=3, tomato=4. Then watermelon + tomato = 2 + 4 = 6, answer D.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* phase chip */}
        <motion.div
          key={`phase-${index}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="font-display text-xs font-bold uppercase tracking-wide"
          style={{ color: accent }}
        >
          {beat.phase === 'intro'    ? t('Read the clues', 'Baca petunjuknya') :
           beat.phase === 'eq1'     ? t('Equation 1', 'Persamaan 1') :
           beat.phase === 'eq2-sub' ? t('Equation 2 → substitute', 'Persamaan 2 → substitusi') :
           beat.phase === 'try'     ? t('Try values', 'Coba nilai') :
           beat.phase === 'reveal'  ? t('Assign all values', 'Tetapkan semua nilai') :
                                      t('Answer', 'Jawaban')}
        </motion.div>

        {/* SVG panel */}
        <motion.div
          key={`panel-${index}`}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          className="w-full rounded-2xl border-2 bg-white p-2"
          style={{ borderColor: accent }}
        >
          <svg
            viewBox={`0 0 ${EXPL_VIEW_W} ${EXPL_VIEW_H}`}
            width="100%"
            style={{ display: 'block' }}
            aria-hidden="true"
          >
            {/* legend strip — fruit icons with optional value badges */}
            {beat.showValues && (
              <g>
                {fruits.map((f, i) => (
                  <LegendFruit key={f} label={f} value={beat.values[f]} idx={i} />
                ))}
              </g>
            )}
            {!beat.showValues && (
              /* placeholder strip so layout doesn't jump */
              <rect x={0} y={0} width={EXPL_VIEW_W} height={44} fill="transparent" />
            )}

            {/* Equation 1 */}
            <EquationRow
              left="strawberry"
              right="watermelon"
              result="grapes"
              cy={95}
              highlightColor={beat.highlightEq1 ? AMBER : undefined}
            />

            {/* Equation 2 */}
            <EquationRow
              left="grapes"
              right="strawberry"
              result="tomato"
              cy={165}
              highlightColor={beat.highlightEq2 ? AMBER : undefined}
            />

            {/* answer row: watermelon + tomato = ? / 6 */}
            <g opacity={beat.showAnswer ? 1 : 0.2}>
              <EquationRow
                left="watermelon"
                right="tomato"
                result={beat.showAnswer ? 'question' : 'question'}
                cy={240}
                highlightColor={beat.result ? GREEN : '#D1D5DB'}
              />
              {/* overlay the = result with 6 when answer is shown */}
              {beat.showAnswer && (
                <text
                  x={EXPL_VIEW_W / 2 + 130 * 0.62}
                  y={240}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={26}
                  fontWeight={900}
                  fill={GREEN}
                >
                  6
                </text>
              )}
            </g>

            {/* equation text */}
            {beat.equation.length > 0 && (
              <text
                x={EXPL_VIEW_W / 2}
                y={288}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={700}
                fill={INK}
                fontFamily="ui-monospace, monospace"
              >
                {beat.equation}
              </text>
            )}
          </svg>
        </motion.div>

        {/* answer chip */}
        <AnimatePresence>
          {beat.result && (
            <motion.div
              key="answer-chip"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="font-display text-2xl font-black tracking-wide"
              style={{ color: GREEN }}
            >
              {t('Answer: D', 'Jawaban: D')}
            </motion.div>
          )}
        </AnimatePresence>

        {/* caption box */}
        <motion.div
          key={`cap-${index}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </motion.div>

      </div>
    </div>
  )
}
