import { z } from 'zod'
import type { ExplainerProps } from '../../../concepts/explainers/registry'
import { useBeatControl } from '../../../concepts/explainers/useBeatControl'
import { definePoolMeta } from '../poolMeta'

export const paramsSchema = z.object({
  /** Discrete objects to enumerate, in reveal order. */
  items: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
        shape: z.enum(['dot', 'triangle', 'square']),
      }),
    )
    .min(1),
})
export type CountOneByOneParams = z.infer<typeof paramsSchema>

export const meta = definePoolMeta({
  id: 'count-one-by-one',
  title: 'Count objects one by one',
  summary: 'Reveals each object in turn with a running counter, landing on the total.',
  useWhen: 'Question asks "how many X" and the figure is a set of discrete objects to enumerate.',
  tags: ['counting', 'enumeration'],
  grades: [1, 2, 3],
  status: 'template' as const,
  paramsSchema,
  paramsExample: '{ "items": [{"x":40,"y":40,"shape":"dot"}, {"x":90,"y":40,"shape":"dot"}] }',
})

const ACTIVE = '#F59E0B'
const IDLE = '#CBD5E1'

function ShapeMark({ item, lit }: { item: CountOneByOneParams['items'][number]; lit: boolean }) {
  const fill = lit ? ACTIVE : IDLE
  if (item.shape === 'dot') return <circle cx={item.x} cy={item.y} r={11} fill={fill} />
  if (item.shape === 'square')
    return <rect x={item.x - 11} y={item.y - 11} width={22} height={22} rx={2} fill={fill} />
  return (
    <polygon
      points={`${item.x},${item.y - 13} ${item.x - 12},${item.y + 10} ${item.x + 12},${item.y + 10}`}
      fill={fill}
    />
  )
}

/** Reusable figure: all items drawn; the first `litCount` highlighted. */
export function CountFigure({
  items,
  litCount,
}: {
  items: CountOneByOneParams['items']
  litCount: number
}) {
  const maxX = Math.max(...items.map((i) => i.x)) + 30
  const maxY = Math.max(...items.map((i) => i.y)) + 40
  return (
    <svg
      viewBox={`0 0 ${maxX} ${maxY}`}
      width="100%"
      role="img"
      aria-label={`${litCount} of ${items.length} counted`}
    >
      {items.map((it, i) => (
        <ShapeMark key={i} item={it} lit={i < litCount} />
      ))}
      {litCount > 0 && (
        <text
          x={maxX / 2}
          y={maxY - 8}
          textAnchor="middle"
          fontSize="20"
          fontWeight="bold"
          fill="#0F172A"
        >
          {litCount}
        </text>
      )}
    </svg>
  )
}

export function CountOneByOneIllustration({ params }: { params: unknown }) {
  const p = paramsSchema.parse(params)
  return <CountFigure items={p.items} litCount={0} />
}

export function CountOneByOneExplainer(props: ExplainerProps) {
  const p = paramsSchema.parse(props.params)
  const index = useBeatControl(p.items.length - 1, { ...props })
  return <CountFigure items={p.items} litCount={index + 1} />
}

export default {
  meta,
  Illustration: CountOneByOneIllustration,
  Explainer: CountOneByOneExplainer,
}
