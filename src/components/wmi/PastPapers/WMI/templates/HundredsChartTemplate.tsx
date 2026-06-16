import { z } from 'zod'
import type { ExplainerProps } from '../../../concepts/explainers/registry'
import { useBeatControl } from '../../../concepts/explainers/useBeatControl'
import { definePoolMeta } from '../poolMeta'

export const paramsSchema = z.object({
  /** Value in the top-left cell (default 1 for a classic 1–100 chart). */
  start: z.number().int().default(1),
  /** Number of rows in the chart. */
  rows: z.number().int().min(1).max(10),
  /** Numbers per row (default 10). Moving right adds 1, moving down adds `cols`. */
  cols: z.number().int().min(1).max(10).default(10),
  /** Cell VALUES to light up, in reveal order (e.g. a skip-count 2,4,6,…). */
  highlights: z.array(z.number().int()).min(1),
})
export type HundredsChartParams = z.infer<typeof paramsSchema>

export const meta = definePoolMeta({
  id: 'hundreds-chart',
  title: 'Number chart skip-count',
  summary:
    'Draws a number grid (right +1, down +cols) and reveals a sequence of cells one per beat, building the readout — for skip-counting and number-pattern questions.',
  useWhen:
    'Question is about a 1–100 (or similar) number chart: skip-counting, number sequences/patterns, or "right adds 1, down adds 10" reasoning.',
  tags: ['hundreds-chart', 'number-grid', 'skip-count', 'pattern'],
  grades: [1, 2, 3],
  status: 'template' as const,
  paramsSchema,
  paramsExample: '{ "start": 1, "rows": 3, "cols": 10, "highlights": [2, 4, 6, 8, 10] }',
})

const ACTIVE = '#f0853a' // qupu-brand-orange
const GRID = '#CBD5E1'
const INK = '#0F172A'
const GREEN = '#10B981'

/** A `rows × cols` number grid starting at `start`; cells whose value is in `lit` are highlighted. */
export function ChartFigure({
  start,
  rows,
  cols,
  lit,
}: {
  start: number
  rows: number
  cols: number
  lit: Set<number>
}) {
  const cell = 30
  const w = cols * cell
  const h = rows * cell
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w }} role="img" aria-label="Number chart">
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const value = start + r * cols + c
          const on = lit.has(value)
          const x = c * cell
          const y = r * cell
          return (
            <g key={`${r}-${c}`}>
              <rect
                x={x}
                y={y}
                width={cell}
                height={cell}
                fill={on ? ACTIVE : 'white'}
                stroke={GRID}
                strokeWidth={1}
              />
              <text
                x={x + cell / 2}
                y={y + cell / 2 + 4}
                textAnchor="middle"
                fontSize={12}
                fontWeight={on ? 'bold' : 'normal'}
                fill={on ? 'white' : INK}
              >
                {value}
              </text>
            </g>
          )
        }),
      )}
    </svg>
  )
}

/** Static figure: the clean chart with NO cell lit, so it never reveals the pattern. */
export function HundredsChartIllustration({ params }: { params: unknown }) {
  const p = paramsSchema.parse(params)
  return (
    <div className="my-4 flex justify-center">
      <ChartFigure start={p.start} rows={p.rows} cols={p.cols} lit={new Set()} />
    </div>
  )
}

export function HundredsChartExplainer(props: ExplainerProps) {
  const p = paramsSchema.parse(props.params)
  const lang = props.lang ?? 'en'
  const index = useBeatControl(p.highlights.length - 1, { ...props })
  const revealed = p.highlights.slice(0, index + 1)
  const lit = new Set(revealed)
  const done = index >= p.highlights.length - 1
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={t('Number chart skip-count', 'Hitung lompat di papan angka')}>
      <div className="flex flex-col items-center gap-3">
        <ChartFigure start={p.start} rows={p.rows} cols={p.cols} lit={lit} />
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold tabular-nums"
          style={
            done
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#FFF1E6', borderColor: ACTIVE, color: '#9A3412' }
          }
        >
          {t('Count: ', 'Hitung: ')}
          {revealed.join(', ')}
        </div>
      </div>
    </div>
  )
}

export default {
  meta,
  Illustration: HundredsChartIllustration,
  Explainer: HundredsChartExplainer,
}
