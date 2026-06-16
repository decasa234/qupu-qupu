import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { FruitGlyph, FRUIT_ROWS, type FruitKind } from './P24G1Q18Illustration'
import { buildP24G1Q18Steps } from './p24G1Q18Steps'

const GREEN = '#10B981'
const KEEP_RING = '#10B981'

const GLYPH_R = 18
const CELL_W = 56
const ROW_H = 58
const PAD_X = 22
const PAD_Y = 18

const KIND_ORDER: FruitKind[] = ['banana', 'strawberry', 'pineapple', 'orange']
const KIND_LABEL_EN: Record<FruitKind, string> = {
  banana: 'banana',
  strawberry: 'strawberry',
  pineapple: 'pineapple',
  orange: 'orange',
}
const KIND_LABEL_ID: Record<FruitKind, string> = {
  banana: 'pisang',
  strawberry: 'stroberi',
  pineapple: 'nanas',
  orange: 'jeruk',
}

export default function P24G1Q18Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G1Q18Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const cols = Math.max(...FRUIT_ROWS.map((r) => r.length))
  const width = PAD_X * 2 + cols * CELL_W
  const height = PAD_Y * 2 + FRUIT_ROWS.length * ROW_H

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: simpan ${story.keepCount} pisang, buang ${story.removeCount} buah lain.`
      : `Explainer: keep the ${story.keepCount} bananas, remove the other ${story.removeCount} fruits.`

  const labels = lang === 'id' ? KIND_LABEL_ID : KIND_LABEL_EN

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: width, display: 'block', margin: '0 auto' }} aria-hidden="true">
          <rect x={2} y={2} width={width - 4} height={height - 4} rx={16} fill="#AEE0F7" stroke="#7FC4E8" strokeWidth={2} />
          {FRUIT_ROWS.map((row, ri) =>
            row.map((kind, ci) => {
              const cx = PAD_X + ci * CELL_W + CELL_W / 2
              const cy = PAD_Y + ri * ROW_H + ROW_H / 2
              const isKeep = kind === story.keepKind
              const dim = beat.removeOthers && !isKeep
              const ring = beat.highlightKeep && isKeep
              return (
                <g key={`${ri}-${ci}`} opacity={dim ? 0.28 : 1}>
                  {ring && <circle cx={cx} cy={cy} r={GLYPH_R + 8} fill="none" stroke={KEEP_RING} strokeWidth={3} />}
                  <FruitGlyph kind={kind} cx={cx} cy={cy} s={GLYPH_R} />
                  {dim && (
                    <line
                      x1={cx - GLYPH_R}
                      y1={cy - GLYPH_R}
                      x2={cx + GLYPH_R}
                      y2={cy + GLYPH_R}
                      stroke="#B91C1C"
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                  )}
                </g>
              )
            }),
          )}
        </svg>

        {beat.showTally && (
          <div className="flex flex-wrap justify-center gap-2">
            {KIND_ORDER.map((k) => {
              const isKeep = k === story.keepKind
              return (
                <span
                  key={k}
                  className="rounded-lg border-2 px-2 py-1 text-xs font-extrabold"
                  style={
                    isKeep && beat.highlightKeep
                      ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                      : { background: '#F1F5F9', borderColor: '#CBD5E1', color: '#334155' }
                  }
                >
                  {`${labels[k]} ${story.tally[k]}`}
                </span>
              )
            })}
          </div>
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
