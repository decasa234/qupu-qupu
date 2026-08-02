import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import {
  buildMapRouteDistanceSteps,
  type RoadState,
  type TownState,
} from './mapRouteDistanceSteps'
import { useBeatControl } from './useBeatControl'
import { NodeGraph } from '../../PastPapers/WMI/primitives/NodeGraph'

// The same map, in the same place, every single beat. Towns never move and roads
// never move — they only change colour, so the child's eye stays on the numbers
// instead of chasing a redrawn picture. One route is lit at a time while its
// total is added out loud, and the total then parks in the ledger under the map
// so the final comparison is made against numbers that are all still on screen.
//
// Geometry belongs to NodeGraph; this file supplies data and the beat colours.

const BLUE = '#30598A'
const BLUE_SOFT = '#E1EFFB'
const GREEN = '#58A700'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F'
const ROSE_SOFT = '#FBE9E8'
const AMBER = '#E0A000'
const AMBER_SOFT = '#FFF3D4'
const AMBER_INK = '#8A6100'
const SHELL = '#FFF9F4'
const PAPER = '#F5F0E8'
const PEACH = '#FFD3B1'
const MUTED = '#9AA2AE'
const FAINT = '#C9D4E2'
const INK = '#1F2937'

/** Mirrors MAP_WIDTH / MAP_HEIGHT / NODE_R in the concept. */
const WIDTH = 300
const HEIGHT = 250
const NODE_R = 18

const ROAD_COLOR: Record<RoadState, string> = {
  idle: FAINT,
  lit: AMBER,
  trap: ROSE,
  best: GREEN,
}

const TOWN_FILL: Record<TownState, string> = {
  idle: PAPER,
  end: BLUE_SOFT,
  lit: AMBER_SOFT,
  must: GREEN_SOFT,
}

const LEDGER_STYLE: Record<
  'plain' | 'out' | 'trap' | 'best',
  { background: string; borderColor: string; color: string; opacity: number }
> = {
  plain: { background: '#FFFFFF', borderColor: PEACH, color: INK, opacity: 1 },
  out: { background: '#FFFFFF', borderColor: FAINT, color: MUTED, opacity: 0.55 },
  trap: { background: ROSE_SOFT, borderColor: ROSE, color: ROSE, opacity: 1 },
  best: { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK, opacity: 1 },
}

export default function MapRouteDistanceExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const still = !!reduce
  const story = useMemo(() => buildMapRouteDistanceSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const nodes = story.towns.map((t, i) => ({
    id: t.id,
    x: t.x,
    y: t.y,
    label: t.id,
    fill: TOWN_FILL[beat.townState[i] ?? 'idle'],
  }))
  const edges = story.roads.map((r, i) => ({
    a: r.a,
    b: r.b,
    label: String(r.km),
    curve: r.curve,
    color: ROAD_COLOR[beat.roadState[i] ?? 'idle'],
  }))

  // The chip names what the beat is doing, so the child can tell "still adding"
  // from "now comparing" without reading the caption.
  const chipTone: 'amber' | 'rose' | 'green' =
    beat.phase === 'trap' ? 'rose' : beat.phase === 'result' ? 'green' : 'amber'
  const chipText =
    beat.phase === 'setup'
      ? T(`${story.routeCount} routes`, `${story.routeCount} rute`)
      : beat.phase === 'route'
        ? T(
            `Route ${beat.ledger.length} of ${story.routeCount}`,
            `Rute ${beat.ledger.length} dari ${story.routeCount}`,
          )
        : beat.phase === 'filter'
          ? T(`Must pass ${story.via}`, `Wajib lewat ${story.via}`)
          : beat.phase === 'trap'
            ? T('Careful', 'Hati-hati')
            : T('Compare', 'Bandingkan')

  const captionStyle =
    beat.phase === 'trap'
      ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
      : beat.phase === 'result'
        ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
        : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = T(
    `Strategy: write down every route, add the km on its roads, and park each total in a list. Only once every route has a total do you compare them — which leaves ${story.answer}.`,
    `Strategi: tulis semua rute, jumlahkan km pada jalan-jalannya, lalu simpan tiap total di daftar. Baru setelah semua rute punya total, totalnya dibandingkan — sehingga hasilnya ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        <div className="flex w-full items-center justify-between gap-2">
          <span
            className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide"
            style={{ color: MUTED }}
          >
            {T('Map', 'Peta')}
          </span>
          <span
            className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold"
            style={{
              background: chipTone === 'green' ? GREEN_SOFT : chipTone === 'rose' ? ROSE_SOFT : AMBER_SOFT,
              borderColor: chipTone === 'green' ? GREEN : chipTone === 'rose' ? ROSE : AMBER,
              color: chipTone === 'green' ? GREEN_INK : chipTone === 'rose' ? ROSE : AMBER_INK,
            }}
          >
            {chipText}
          </span>
        </div>

        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" style={{ maxWidth: '16rem' }}>
          <NodeGraph nodes={nodes} edges={edges} nodeR={NODE_R} width={WIDTH} height={HEIGHT} />
          {story.towns.map((t) => (
            <text
              key={`name-${t.id}`}
              x={t.x}
              y={t.y + NODE_R + 12}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fontWeight={700}
              fill={INK}
              stroke="white"
              strokeWidth={3}
              paintOrder="stroke"
              className="font-display"
            >
              {t.name}
            </text>
          ))}
        </svg>

        {/* The running totals. Every route the child has already added stays on
            screen, so the closing comparison is made against visible numbers. */}
        <div className="flex min-h-[1.75rem] w-full flex-wrap items-center justify-center gap-1.5">
          {beat.ledger.map((row) => {
            const tone = LEDGER_STYLE[row.tone]
            return (
              <span
                key={row.label}
                className="rounded-full border-2 px-2 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
                style={{
                  background: tone.background,
                  borderColor: tone.borderColor,
                  color: tone.color,
                  opacity: tone.opacity,
                  textDecoration: row.tone === 'out' ? 'line-through' : 'none',
                }}
              >
                {row.label} {row.total}
              </span>
            )
          })}
          {beat.reveal !== null && (
            <motion.span
              initial={still ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{ background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }}
            >
              {T('Answer', 'Jawaban')} {beat.reveal}
            </motion.span>
          )}
        </div>

        <div
          className="w-full rounded-xl border-2 px-3 py-2 text-center font-display text-[0.8125rem] font-extrabold leading-snug"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
