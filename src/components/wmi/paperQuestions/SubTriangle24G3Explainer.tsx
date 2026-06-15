import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { SubTriFigure } from './SubTriangle24G3Illustration'
import { buildSubTriStoryboard, type Axis } from './subTriangle24G3Steps'

// WMI-24F3A-Q12 — "B and D are painted; paint 2 MORE so the figure keeps a fold
// line. How many ways?" Walk each of the 3 symmetry axes, shade every winning
// extra pair with a running counter, land on 9 → C.

const FILL_SHADED = '#B6D98A' // matches the static figure's green
const STROKE_SHADED = '#5A8A2A'
const GREEN = '#10B981'
const AXIS_COLOR = '#D97706' // amber fold line, like the static-figure accents

// Fold-line endpoints in the SubTriFigure's 240×220 viewBox (apex top-centre,
// base across the bottom). Each axis runs from a corner to the midpoint of the
// opposite side.
const VW = 240
const VH = 220
const MARGIN = 12
const apex: [number, number] = [VW / 2, MARGIN]
const baseL: [number, number] = [MARGIN, VH - MARGIN]
const baseR: [number, number] = [VW - MARGIN, VH - MARGIN]
const mid = (a: [number, number], b: [number, number]): [number, number] => [
  (a[0] + b[0]) / 2,
  (a[1] + b[1]) / 2,
]
const FOLD: Record<Axis, [[number, number], [number, number]]> = {
  V: [apex, mid(baseL, baseR)],
  L: [baseL, mid(apex, baseR)],
  R: [baseR, mid(apex, baseL)],
}

export default function SubTriangle24G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildSubTriStoryboard(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const { V, L, R } = story.pairsByAxis

  const ariaLabel = t(
    `Testing all three fold lines of the triangle, ${V.length} pairs fit the up–down axis, ${L.length} the bottom-left axis and ${R.length} the bottom-right axis, giving ${story.total} ways in all — answer C.`,
    `Menguji ketiga garis lipat segitiga, ${V.length} pasangan cocok pada sumbu tegak, ${L.length} pada sumbu kiri-bawah, dan ${R.length} pada sumbu kanan-bawah, sehingga ${story.total} cara seluruhnya — jawaban C.`,
  )

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The figure coming alive: SubTriFigure mirrors the static scene; we
            overlay the live fold line and the freshly-painted pair on top. */}
        <div className="relative w-full" style={{ maxWidth: 260, margin: '0 auto' }}>
          <SubTriFigure extraShaded={beat.extra} showLabels />
          {beat.axis && (
            <svg
              viewBox={`0 0 ${VW} ${VH}`}
              width="100%"
              style={{ position: 'absolute', inset: 0, display: 'block' }}
              aria-hidden="true"
            >
              <motion.line
                key={beat.axis}
                x1={FOLD[beat.axis][0][0]}
                y1={FOLD[beat.axis][0][1]}
                x2={FOLD[beat.axis][1][0]}
                y2={FOLD[beat.axis][1][1]}
                stroke={AXIS_COLOR}
                strokeWidth={2.4}
                strokeDasharray="7 5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              />
            </svg>
          )}
        </div>

        {/* Per-axis tally: dots fill as each winning pair is found. */}
        <div className="flex w-full items-stretch justify-center gap-2">
          {(['V', 'L', 'R'] as Axis[]).map((ax) => {
            const found = story.pairsByAxis[ax]
            const filled = countFilled(beat, ax, story)
            const active = beat.axis === ax
            const labelEn = ax === 'V' ? 'up–down' : ax === 'L' ? 'left' : 'right'
            const labelId = ax === 'V' ? 'tegak' : ax === 'L' ? 'kiri' : 'kanan'
            return (
              <div
                key={ax}
                className="flex flex-1 flex-col items-center gap-1 rounded-lg border-2 px-2 py-1.5"
                style={{
                  borderColor: active ? AXIS_COLOR : '#C9D6BE',
                  background: active ? '#FEF3E2' : '#F3F7EE',
                }}
              >
                <div
                  className="font-display text-[10px] font-bold"
                  style={{ color: active ? '#9A5B12' : '#5A6B4B' }}
                >
                  {t(labelEn, labelId)}
                </div>
                <div className="flex gap-1">
                  {found.map((p, i) => (
                    <span
                      key={p}
                      title={p}
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        background: i < filled ? FILL_SHADED : '#FFFFFF',
                        border: `1.5px solid ${i < filled ? STROKE_SHADED : '#C9D6BE'}`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Running total. */}
        <div className="font-display text-sm font-extrabold text-qupu-brand-blue">
          {t('ways so far', 'cara sejauh ini')}: {beat.count}
        </div>

        {/* Caption. */}
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

/** How many of an axis's dots should be filled at the current beat. */
function countFilled(
  beat: { axis: Axis | null; count: number; result: boolean },
  ax: Axis,
  story: ReturnType<typeof buildSubTriStoryboard>,
): number {
  const order: Axis[] = ['V', 'L', 'R']
  const before = order.slice(0, order.indexOf(ax)).reduce((s, a) => s + story.pairsByAxis[a].length, 0)
  // On the final/summary beats every dot is filled.
  if (beat.result || beat.axis == null) {
    // Summary/trap/final beats: fill up to the running count.
    return Math.max(0, Math.min(story.pairsByAxis[ax].length, beat.count - before))
  }
  if (beat.axis === ax) return Math.max(0, beat.count - before)
  // A fully-finished earlier axis stays filled; a not-yet-started one is empty.
  return order.indexOf(beat.axis) > order.indexOf(ax) ? story.pairsByAxis[ax].length : 0
}
