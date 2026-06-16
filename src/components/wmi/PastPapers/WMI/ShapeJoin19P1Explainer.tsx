import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ShapeGlyph } from './ShapeJoin19P1Illustration'
import { buildShapeJoin19P1Steps } from './shapeJoin19P1Steps'

// WMI-19P1A-Q13 — apply the join rule (second shape onto the foot of the first,
// same orientation) to T + square. The square hangs under the T's stem, which
// matches choice D.

const BLUE = '#30598A'
const GREEN = '#10B981'
const ORANGE = '#F97316'
const INK = '#1F2937'
const MUTED = '#9CA3AF'

// Option chip geometry
const CHIP_W = 76
const CHIP_H = 80

/** Draws one answer-option chip glyph by label. D is the correct assembly. */
function OptionGlyph({ label, cx, cy }: { label: 'A' | 'B' | 'C' | 'D'; cx: number; cy: number }) {
  switch (label) {
    case 'A':
      // decoy: square ON TOP of the T (wrong way up)
      return (
        <g>
          <ShapeGlyph name="square" cx={cx} cy={cy - 14} size={12} />
          <g transform={`rotate(180 ${cx} ${cy})`}>
            <ShapeGlyph name="T" cx={cx} cy={cy + 12} size={13} />
          </g>
        </g>
      )
    case 'B':
      // decoy: T and square side by side (not joined)
      return (
        <g>
          <ShapeGlyph name="T" cx={cx - 14} cy={cy} size={13} />
          <ShapeGlyph name="square" cx={cx + 14} cy={cy + 2} size={11} />
        </g>
      )
    case 'C':
      // decoy: triangle under the T instead of a square
      return (
        <g>
          <g stroke={INK} strokeWidth={2.6} strokeLinecap="round" fill="none">
            <line x1={cx - 13} y1={cy - 16} x2={cx + 13} y2={cy - 16} />
            <line x1={cx} y1={cy - 16} x2={cx} y2={cy} />
          </g>
          <path
            d={`M ${cx} ${cy} L ${cx + 12} ${cy + 16} L ${cx - 12} ${cy + 16} Z`}
            fill="none"
            stroke={INK}
            strokeWidth={2.6}
            strokeLinejoin="round"
          />
        </g>
      )
    case 'D':
      // correct: T over a square joined at the stem foot
      return <ShapeGlyph name="T+square" cx={cx} cy={cy - 2} size={13} />
    default:
      return null
  }
}

export default function ShapeJoin19P1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildShapeJoin19P1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const VIEW_W = 340
  const VIEW_H = 150

  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: gabungkan persegi di bawah batang T mengikuti aturan contoh — hasilnya gambar D.'
      : 'Explainer: join the square under the T’s stem following the example rule — the result is figure D.'

  const labels: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']
  const chipY = 58 // glyph centre inside each chip box

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: 340, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#FFFFFF" />

          {/* ── rule reminder (Y + triangle → combined) ── */}
          {beat.showRule && (
            <g>
              <ShapeGlyph name="Y" cx={50} cy={66} size={20} />
              <g stroke={INK} strokeWidth={3} strokeLinecap="round">
                <line x1={92} y1={66} x2={108} y2={66} />
                <line x1={100} y1={58} x2={100} y2={74} />
              </g>
              <ShapeGlyph name="triangle" cx={148} cy={66} size={20} />
              <g stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none">
                <line x1={186} y1={61} x2={210} y2={61} />
                <line x1={186} y1={71} x2={210} y2={71} />
                <path d={`M 202 54 L 214 66 L 202 78`} />
              </g>
              <ShapeGlyph name="Y+triangle" cx={280} cy={62} size={20} joinFill="#DBEAFE" />
            </g>
          )}

          {/* ── operands T + square ── */}
          {beat.showOperands && (
            <g>
              <ShapeGlyph name="T" cx={90} cy={70} size={24} />
              <g stroke={INK} strokeWidth={3} strokeLinecap="round">
                <line x1={150} y1={70} x2={170} y2={70} />
                <line x1={160} y1={60} x2={160} y2={80} />
              </g>
              <ShapeGlyph name="square" cx={235} cy={72} size={22} joinFill="#FEF3C7" />
            </g>
          )}

          {/* ── assembled T+square ── */}
          {beat.showAssembled && !beat.showOptions && (
            <motion.g
              key="assembled"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            >
              <ShapeGlyph name="T+square" cx={VIEW_W / 2} cy={62} size={22} joinFill="#FEF3C7" />
              <text x={VIEW_W / 2} y={132} textAnchor="middle" fontSize={13} fontWeight={700} fill={ORANGE}>
                {lang === 'id' ? 'persegi menggantung di bawah batang T' : 'square hangs under the T’s stem'}
              </text>
            </motion.g>
          )}

          {/* ── four option chips ── */}
          {beat.showOptions && (
            <g>
              {labels.map((lab, i) => {
                const x = 18 + i * (CHIP_W + 4)
                const isWinner = beat.highlightWinner && lab === story.answer
                return (
                  <g key={lab}>
                    <motion.rect
                      x={x}
                      y={20}
                      width={CHIP_W}
                      height={CHIP_H}
                      rx={8}
                      fill={isWinner ? '#D1FAE5' : '#FFFFFF'}
                      stroke={isWinner ? GREEN : MUTED}
                      strokeWidth={isWinner ? 3 : 1.5}
                      animate={{ scale: isWinner ? 1.04 : 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      style={{ transformOrigin: `${x + CHIP_W / 2}px ${20 + CHIP_H / 2}px` }}
                    />
                    <OptionGlyph label={lab} cx={x + CHIP_W / 2} cy={chipY} />
                    <text
                      x={x + CHIP_W / 2}
                      y={112}
                      textAnchor="middle"
                      fontSize={13}
                      fontWeight={800}
                      fill={isWinner ? '#065F46' : '#6B7280'}
                    >
                      {lab}
                    </text>
                  </g>
                )
              })}
            </g>
          )}
        </svg>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
