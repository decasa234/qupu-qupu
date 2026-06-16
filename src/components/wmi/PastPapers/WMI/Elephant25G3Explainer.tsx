import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  ELEPHANT_PATH,
  buildElephantOutline,
  type ElephantVertex,
} from './Elephant25G3Illustration'
import { buildElephant25G3Steps } from './elephant25G3Steps'

// WMI-25F3A-Q25 — post-answer explainer for the "elephant area" problem.
//
// It re-animates the SAME scene as the static figure (1 cm grid + the shaded
// elephant), then teaches the breakdown's AREA method one beat at a time:
//   1. goal → 2. each square = 1 cm² → 3. name the pieces (7 segments, 6 long
//   arcs, 4 short arcs) → 4. count the 59 whole squares inside → 5. the short
//   arcs pair out/in and cancel → 6. the long arcs pair out/in and cancel →
//   7. answer = 59 cm².
// Deterministic + SSR-safe: pure render of the storyboard, no params/random.

// qupu colour tokens, echoed as hex so the SVG matches the static figure.
const GRID = '#FBD9BD' // ~ stroke-qupu-peach
const BODY_FILL = '#CFE8FA' // ~ fill-qupu-sky
const BODY_STROKE = '#30598A' // ~ stroke-qupu-brand-blue
const OUT_ARC = '#16A34A' // outward bulge (adds area) — green
const IN_ARC = '#DC2626' // inward bulge (removes area) — red
const SQUARE_FILL = '#FBBF24' // ~ amber, the counted whole-square wash
const GREEN = '#10B981'

// ---- pixel layout (must match Elephant25G3Illustration) ---------------------
const CELL = 40
const PAD = 8
const COLS = 14
const ROWS = 13
const VIEW_W = PAD * 2 + COLS * CELL
const VIEW_H = PAD * 2 + ROWS * CELL

function px(gx: number, gy: number): [number, number] {
  return [PAD + gx * CELL, PAD + gy * CELL]
}

// Midpoint of an arc piece in pixels, used to drop the +/− bulge marker.
function pieceMid(path: ElephantVertex[], i: number): [number, number] {
  const [ax, ay] = px(path[i - 1].p[0], path[i - 1].p[1])
  const [bx, by] = px(path[i].p[0], path[i].p[1])
  return [(ax + bx) / 2, (ay + by) / 2]
}

interface ArcMark {
  i: number
  kind: 'La' | 'Sa'
  out: boolean
  x: number
  y: number
}

const ARC_MARKS: ArcMark[] = ELEPHANT_PATH.flatMap((v, i) => {
  if (v.edge !== 'La' && v.edge !== 'Sa') return []
  const [x, y] = pieceMid(ELEPHANT_PATH, i)
  return [{ i, kind: v.edge, out: v.bulge !== 'in', x, y }]
})

export default function Elephant25G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildElephant25G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const outline = useMemo(() => buildElephantOutline(ELEPHANT_PATH), [])

  return (
    <div
      className="mx-auto w-full max-w-[380px]"
      role="img"
      aria-label={t(
        'Strategy: count the whole grid squares inside the elephant, then notice the outward and inward arcs pair up and cancel, so the area is 59 square centimetres.',
        'Strategi: hitung petak penuh di dalam gajah, lalu lihat busur ke luar dan ke dalam berpasangan dan saling meniadakan, jadi luasnya 59 sentimeter persegi.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          style={{ maxWidth: 360, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* 1 cm grid */}
          {Array.from({ length: COLS + 1 }, (_, c) => {
            const [x] = px(c, 0)
            return (
              <line
                key={`vx${c}`}
                x1={x}
                y1={PAD}
                x2={x}
                y2={PAD + ROWS * CELL}
                stroke={GRID}
                strokeWidth={1}
              />
            )
          })}
          {Array.from({ length: ROWS + 1 }, (_, r) => {
            const [, y] = px(0, r)
            return (
              <line
                key={`hz${r}`}
                x1={PAD}
                y1={y}
                x2={PAD + COLS * CELL}
                y2={y}
                stroke={GRID}
                strokeWidth={1}
              />
            )
          })}

          {/* the counted whole-square wash washes in once we count the squares */}
          <motion.path
            d={outline}
            fill={beat.showSquares ? SQUARE_FILL : BODY_FILL}
            animate={{ fillOpacity: beat.showSquares ? 0.45 : 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          />

          {/* shaded elephant body outline (matches the static figure) */}
          <path
            d={outline}
            fill={BODY_FILL}
            fillOpacity={beat.showSquares ? 0 : 0.85}
            stroke={BODY_STROKE}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* arc bulge markers: + for outward (adds), − for inward (removes) */}
          {ARC_MARKS.map((m) => {
            const active =
              (m.kind === 'Sa' && beat.showShort) ||
              (m.kind === 'La' && beat.showLong)
            const color = m.out ? OUT_ARC : IN_ARC
            return (
              <motion.g
                key={`arc-${m.i}`}
                initial={false}
                animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.4 }}
                transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                style={{ transformOrigin: `${m.x}px ${m.y}px` }}
              >
                <circle cx={m.x} cy={m.y} r={10} fill={color} />
                <text
                  x={m.x}
                  y={m.y + 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={15}
                  fontWeight={900}
                  fill="#FFFFFF"
                  className="font-display"
                >
                  {m.out ? '+' : '−'}
                </text>
              </motion.g>
            )
          })}
        </svg>

        {/* running-area meter */}
        <div className="flex items-center gap-2">
          <span className="font-display text-xs font-bold text-qupu-brand-blue">
            {t('area so far', 'luas sejauh ini')}
          </span>
          <motion.span
            key={`run-${beat.running ?? 'na'}`}
            initial={{ scale: 0.7, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="rounded-lg px-3 py-1 font-display text-base font-extrabold"
            style={{
              background: beat.result ? '#D1FAE5' : '#E1EFFB',
              color: beat.result ? '#065F46' : '#30598A',
              border: `2px solid ${beat.result ? GREEN : BODY_STROKE}`,
            }}
          >
            {beat.running == null ? t('—', '—') : `${beat.running} cm²`}
          </motion.span>
        </div>

        {/* legend for the +/− arc markers, visible once arcs come into play */}
        {(beat.showShort || beat.showLong) && (
          <div className="flex items-center justify-center gap-4 font-display text-[11px] font-bold">
            <span className="flex items-center gap-1" style={{ color: OUT_ARC }}>
              <span
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-white"
                style={{ background: OUT_ARC }}
              >
                +
              </span>
              {t('bulge out adds', 'menjorok keluar menambah')}
            </span>
            <span className="flex items-center gap-1" style={{ color: IN_ARC }}>
              <span
                className="inline-flex h-4 w-4 items-center justify-center rounded-full text-white"
                style={{ background: IN_ARC }}
              >
                −
              </span>
              {t('bulge in removes', 'menjorok ke dalam mengurangi')}
            </span>
          </div>
        )}

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BODY_STROKE, color: BODY_STROKE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
