import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { useBeatControl } from './useBeatControl'
import { countManyGlyph } from '../count-many-objects/index'
import {
  buildCountManySteps,
  type CountManyBeat,
  type CountManyRing,
  type CountManyStoryboard,
} from './countManySteps'

// House palette — literal hex so the animation reads the same everywhere and
// matches the static count-many-objects figure exactly.
const BLUE = '#30598A'
const ORANGE = '#F0853A'
const GREEN = '#58A700'
const YELLOW = '#E0A000'
const ROSE = '#D9534F'
const CREAM = '#FAF6EF'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const INK_MUTED = '#8A93A3'

type RingState = 'planned' | 'done' | 'active' | 'rest'

const RING_STYLE: Record<RingState, { color: string; opacity: number; tint: number }> = {
  planned: { color: BLUE, opacity: 0.32, tint: 0 },
  done: { color: GREEN, opacity: 0.85, tint: 0.1 },
  active: { color: ORANGE, opacity: 1, tint: 0.18 },
  rest: { color: YELLOW, opacity: 1, tint: 0.18 },
}

/**
 * A ring drawn around real icon positions. Boxed layouts (rows, piles of ten)
 * get a rounded box; the scattered pile gets a rope lasso that threads its own
 * five icons — the rope is painted as a wide stroke with a narrower board-
 * coloured stroke on top, which leaves a clean outline hugging the glyphs.
 */
function Lasso({
  ring,
  state,
  drawKey,
  reduce,
}: {
  ring: CountManyRing
  state: RingState
  drawKey: string
  reduce: boolean
}) {
  const { color, opacity, tint } = RING_STYLE[state]
  const anim = reduce
    ? { initial: false as const, animate: { opacity }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, scale: 0.94 },
        animate: { opacity, scale: 1 },
        transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
      }

  if (ring.kind === 'rect') {
    if (ring.w <= 0 || ring.h <= 0) return null
    return (
      <motion.g key={drawKey} {...anim}>
        {tint > 0 && (
          <rect x={ring.x} y={ring.y} width={ring.w} height={ring.h} rx={ring.rx} fill={color} opacity={tint} />
        )}
        <rect
          x={ring.x}
          y={ring.y}
          width={ring.w}
          height={ring.h}
          rx={ring.rx}
          fill="none"
          stroke={color}
          strokeWidth={state === 'planned' ? 2 : 2.8}
        />
      </motion.g>
    )
  }

  if (!ring.d) return null
  const inner = Math.max(1, ring.width - 3)
  return (
    <motion.g key={drawKey} {...anim}>
      {/* outer band → the ring itself */}
      <path d={ring.d} fill="none" stroke={color} strokeWidth={ring.width} strokeLinecap="round" strokeLinejoin="round" />
      {/* board-coloured core punches the band back to a thin outline */}
      <path d={ring.d} fill="none" stroke={SHELL} strokeWidth={inner} strokeLinecap="round" strokeLinejoin="round" />
      {tint > 0 && (
        <path
          d={ring.d}
          fill="none"
          stroke={color}
          strokeWidth={inner}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={tint}
        />
      )}
    </motion.g>
  )
}

/** The wandering finger: a messy rose trail that skips one icon and doubles another. */
function SlipOverlay({ story, reduce }: { story: CountManyStoryboard; reduce: boolean }) {
  const pts = story.slipPath.map((i) => story.dots[i]).filter(Boolean)
  if (pts.length === 0) return null
  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
  const missed = story.slipMissed !== null ? story.dots[story.slipMissed] : null
  const doubled = story.slipDoubled !== null ? story.dots[story.slipDoubled] : null
  const mark = story.r + 4

  return (
    <g>
      <motion.path
        d={d}
        fill="none"
        stroke={ROSE}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="5 4"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.85 }}
        transition={reduce ? { duration: 0 } : { duration: 1.4, ease: 'easeInOut' }}
      />
      {doubled && (
        <motion.g
          initial={reduce ? false : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduce ? { duration: 0 } : { delay: 0.8, type: 'spring', stiffness: 340, damping: 20 }}
          style={{ transformOrigin: `${doubled.x}px ${doubled.y}px` }}
        >
          <circle cx={doubled.x} cy={doubled.y} r={mark} fill="none" stroke={ROSE} strokeWidth={2} strokeDasharray="3 3" />
          <circle cx={doubled.x + mark} cy={doubled.y - mark} r={7} fill={ROSE} />
          <text
            x={doubled.x + mark}
            y={doubled.y - mark + 3.4}
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="800"
            fontFamily="Fredoka, sans-serif"
            fill={CREAM}
          >
            2x
          </text>
        </motion.g>
      )}
      {missed && (
        <motion.g
          initial={reduce ? false : { opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduce ? { duration: 0 } : { delay: 1.05, type: 'spring', stiffness: 340, damping: 20 }}
          style={{ transformOrigin: `${missed.x}px ${missed.y}px` }}
        >
          <circle cx={missed.x} cy={missed.y} r={mark} fill="none" stroke={ROSE} strokeWidth={2} strokeDasharray="3 3" />
          <path
            d={`M ${missed.x - 4} ${missed.y - 4} L ${missed.x + 4} ${missed.y + 4} M ${missed.x + 4} ${missed.y - 4} L ${missed.x - 4} ${missed.y + 4}`}
            stroke={ROSE}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        </motion.g>
      )}
    </g>
  )
}

/** Small chip in the skip-count chain. */
function Chip({ text, tone }: { text: string; tone: 'past' | 'now' | 'rest' | 'sum' }) {
  const style =
    tone === 'now'
      ? { background: '#FDECDD', borderColor: ORANGE, color: '#8A4718' }
      : tone === 'rest'
        ? { background: '#FBF1D2', borderColor: YELLOW, color: '#7A5A00' }
        : tone === 'sum'
          ? { background: '#E4F3D2', borderColor: GREEN, color: '#3B6B00' }
          : { background: SHELL, borderColor: PEACH, color: INK_MUTED }
  return (
    <span
      className="rounded-full border-2 px-2 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
      style={style}
    >
      {text}
    </span>
  )
}

export default function CountManyObjectsExplainer(props: ExplainerProps) {
  const { params, lang = 'id', correctAnswer } = props
  const reduce = !!useReducedMotion()
  const story = useMemo(
    () => buildCountManySteps(params, lang, correctAnswer),
    [params, lang, correctAnswer],
  )
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat: CountManyBeat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  // Which icons are in the spotlight this beat. A long pile counts two or three
  // rings per beat, so the spotlight is a union, not a single group.
  const litMembers = useMemo(() => {
    if (beat.result) return null // the landing beat brightens the whole pile
    if (beat.activeGroups.length > 0) {
      const lit = new Set<number>()
      for (const g of beat.activeGroups) for (const i of story.groups[g]?.members ?? []) lit.add(i)
      return lit
    }
    if (beat.leftoverLit && story.leftoverGroup) return new Set(story.leftoverGroup.members)
    return null
  }, [beat, story])

  const ringState = (g: number): RingState => {
    if (beat.activeGroups.includes(g)) return 'active'
    return g < beat.counted ? 'done' : 'planned'
  }

  // One chip per skip-count stop, so the chain stays as short as the beats do.
  const chips: { text: string; tone: 'past' | 'now' | 'rest' | 'sum' }[] = []
  const stopsDone = Math.ceil(beat.counted / Math.max(1, story.groupsPerBeat))
  for (let k = 0; k < stopsDone && k < story.stops.length; k++) {
    chips.push({
      text: String(story.stops[k]),
      tone: k === stopsDone - 1 && !beat.result ? 'now' : 'past',
    })
  }
  if (beat.leftoverLit && story.leftover > 0) chips.push({ text: `+${story.leftover}`, tone: 'rest' })
  if (beat.result) chips.push({ text: `= ${story.total}`, tone: 'sum' })

  const runningColor = beat.result ? GREEN : beat.leftoverLit ? YELLOW : beat.slip ? ROSE : ORANGE

  const strategy = {
    rows: T('count row by row', 'hitung per baris'),
    'grouped-tens': T('count pile by pile', 'hitung per tumpukan'),
    scatter: T('ring off fives, then count the rings', 'lingkari lima-lima, lalu hitung lingkarannya'),
  }[story.layout]

  const ariaLabel = T(
    `Strategy: do not count one by one — ${strategy}. ${story.chunks} groups of ${story.step} make ${story.fromChunks}${story.leftover > 0 ? `, plus ${story.leftover} left over` : ''}, so the total is ${story.total}.`,
    `Strategi: jangan hitung satu per satu — ${strategy}. ${story.chunks} kelompok berisi ${story.step} jadi ${story.fromChunks}${story.leftover > 0 ? `, ditambah sisa ${story.leftover}` : ''}, jadi jumlahnya ${story.total}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-3 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* the pile — the same icons in the same places as the question figure */}
        <div className="flex w-full justify-center">
          <svg
            viewBox={`0 0 ${story.width} ${story.height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', maxWidth: story.width, maxHeight: '13.75rem' }}
            role="presentation"
          >
            {/* rings first so the icons always sit on top of them */}
            {beat.ringsDrawn > 0 &&
              story.groups.slice(0, beat.ringsDrawn).map((g) => (
                <Lasso
                  key={`ring-${g.index}`}
                  drawKey={`ring-${g.index}-${ringState(g.index)}`}
                  ring={g.ring}
                  state={ringState(g.index)}
                  reduce={reduce}
                />
              ))}
            {beat.showLeftover && story.leftoverGroup && (
              <Lasso
                key="ring-rest"
                drawKey={`ring-rest-${beat.leftoverLit ? 'lit' : 'plan'}`}
                ring={story.leftoverGroup.ring}
                state={beat.leftoverLit ? 'rest' : 'planned'}
                reduce={reduce}
              />
            )}

            {story.dots.map((dot, i) => {
              const lit = !litMembers || litMembers.has(i)
              return (
                <motion.g
                  key={`icon-${i}`}
                  transform={`translate(${dot.x.toFixed(2)} ${dot.y.toFixed(2)})`}
                  initial={false}
                  animate={{ opacity: lit ? 1 : 0.42 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.28 }}
                >
                  {countManyGlyph(story.icon, story.r)}
                </motion.g>
              )
            })}

            {beat.slip && <SlipOverlay story={story} reduce={reduce} />}
          </svg>
        </div>

        {/* running total + the skip-count chain */}
        <div className="flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-1">
          {beat.running === null ? (
            <div className="font-display text-sm font-extrabold" style={{ color: beat.slip ? ROSE : BLUE }}>
              {beat.slip
                ? T('one by one is where you slip', 'satu-satu itu gampang keliru')
                : T('group first, then count', 'kelompokkan dulu, baru hitung')}
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[0.6875rem] font-extrabold uppercase" style={{ color: INK_MUTED }}>
                  {beat.result ? T('total', 'jumlah') : T('so far', 'baru')}
                </span>
                <motion.span
                  key={`run-${beat.running}-${beat.result ? 'f' : 'r'}`}
                  initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 20 }}
                  className="font-display text-3xl font-black tabular-nums"
                  style={{ color: runningColor }}
                >
                  {beat.running}
                </motion.span>
              </div>
              {chips.length > 0 && (
                <div className="flex max-w-full flex-wrap items-center justify-center gap-1">
                  {chips.map((c, i) => (
                    <Chip key={`chip-${i}-${c.text}`} text={c.text} tone={c.tone} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#E4F3D2', borderColor: GREEN, color: '#3B6B00' }
              : beat.slip
                ? { background: '#FBE6E5', borderColor: ROSE, color: '#8C2F2C' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>

        {beat.note && (
          <div className="px-2 text-center font-display text-[0.6875rem] font-bold" style={{ color: ROSE }}>
            {beat.note}
          </div>
        )}
      </div>
    </div>
  )
}
