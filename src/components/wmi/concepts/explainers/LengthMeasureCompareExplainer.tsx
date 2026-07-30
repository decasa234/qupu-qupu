import { useMemo, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { useBeatControl } from './useBeatControl'
import {
  BAR_H,
  LENGTH_LABELS,
  U,
  buildLengthMeasureSteps,
  xAt,
  type LengthLayout,
  type LengthStep,
} from './lengthMeasureSteps'

// Palette + geometry are deliberately identical to the static question figure
// (src/components/wmi/concepts/length-measure-compare/index.tsx) so the animated
// board and the picture the child answered from are the same picture.
const BLUE = '#30598A'
const CREAM = '#FAF6EF'
const SQUARE_FILL = '#E9F0F8'
const OBJECT_COLORS = ['#F0853A', '#58A700', '#E0A000', '#7C5CBF'] // orange, green, yellow, purple
const ROSE = '#D9534F' // the trap beat only
const ROSE_TINT = '#FDECEA'
const GREEN = '#58A700'
const GREEN_TINT = '#EAF6E0'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const MUTED = '#9AA3B2'
const INK = '#263B55' // brand-blue-shadow, used where a mark must beat every object colour

/** Extra canvas under the ruler used only by the trap bracket. */
const TRAP_BAND = 34

function cap(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// Same drawn object shapes as the static figure — plain SVG, no emoji, no images.
function ObjectBar({
  kind,
  x,
  y,
  w,
  color,
}: {
  kind: string
  x: number
  y: number
  w: number
  color: string
}): ReactNode {
  const h = BAR_H
  if (kind === 'pensil' || kind === 'krayon') {
    const tip = Math.min(kind === 'pensil' ? 11 : 7, w * 0.28)
    return (
      <g>
        <rect x={x} y={y} width={w - tip} height={h} rx={3} fill={color} />
        <polygon
          points={`${x + w - tip},${y} ${x + w},${y + h / 2} ${x + w - tip},${y + h}`}
          fill={color}
        />
        <rect x={x + w - tip - 8} y={y} width={4} height={h} fill={CREAM} opacity={0.85} />
      </g>
    )
  }
  if (kind === 'pita') {
    const notch = Math.min(8, w * 0.2)
    return (
      <path
        d={`M ${x} ${y} H ${x + w} L ${x + w - notch} ${y + h / 2} L ${x + w} ${y + h} H ${x} Z`}
        fill={color}
      />
    )
  }
  if (kind === 'sedotan') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={3} fill={color} />
        <rect x={x + w * 0.34} y={y} width={4} height={h} fill={CREAM} opacity={0.85} />
        <rect x={x + w * 0.62} y={y} width={4} height={h} fill={CREAM} opacity={0.85} />
      </g>
    )
  }
  if (kind === 'tali') {
    return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={color} />
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={color} />
      <line
        x1={x + w * 0.3}
        y1={y + 4}
        x2={x + w * 0.3 + 5}
        y2={y + h - 4}
        stroke={CREAM}
        strokeWidth={2}
        opacity={0.8}
      />
      <line
        x1={x + w * 0.62}
        y1={y + 4}
        x2={x + w * 0.62 + 5}
        y2={y + h - 4}
        stroke={CREAM}
        strokeWidth={2}
        opacity={0.8}
      />
    </g>
  )
}

/** A drawn cross — marks the stretch of ruler that is NOT the object. */
function DeadCross({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={CREAM} stroke={color} strokeWidth={1.8} />
      <path
        d={`M ${cx - r * 0.45} ${cy - r * 0.45} L ${cx + r * 0.45} ${cy + r * 0.45} M ${cx + r * 0.45} ${cy - r * 0.45} L ${cx - r * 0.45} ${cy + r * 0.45}`}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </g>
  )
}

export default function LengthMeasureCompareExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const story = useMemo(() => buildLengthMeasureSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat: LengthStep = story.steps[index] ?? story.steps[story.finalIndex]

  const { layout, params: p } = story
  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const soft = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 210, damping: 26 }
  const pop = reduce ? { duration: 0 } : { type: 'spring' as const, stiffness: 420, damping: 24 }

  const hasTrapBeat = story.steps.some((s) => s.trap !== null)
  const extraBottom = layout.kind === 'ruler' && hasTrapBeat ? TRAP_BAND : 0
  const viewH = layout.height + extraBottom
  const colorFor = (i: number) => OBJECT_COLORS[i % OBJECT_COLORS.length]

  const activeRow = beat.item === null ? null : layout.rows[beat.item]
  const marks: number[] = []
  if (activeRow && layout.kind === 'ruler') {
    if (beat.markStart) marks.push(activeRow.start)
    if (beat.markEnd) marks.push(activeRow.end)
  }

  const ariaLabel = T(
    `Step by step: measure the span on the picture instead of reading the number at the right end. ${beat.caption}`,
    `Langkah demi langkah: ukur rentangnya di gambar, jangan membaca angka di ujung kanan. ${beat.caption}`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* strategy chip */}
        <div
          className="rounded-full px-3 py-1 font-display text-[0.6875rem] font-extrabold uppercase tracking-wide"
          style={{ background: BLUE, color: CREAM }}
        >
          {story.strategy}
        </div>

        {/* the figure — same coordinates as the question picture */}
        <svg
          viewBox={`0 0 ${layout.width} ${viewH}`}
          width={Math.min(360, layout.width)}
          className="max-w-full"
          role="presentation"
        >
          {layout.kind === 'ruler' ? (
            <RulerBoard
              layout={layout}
              beat={beat}
              marks={marks}
              colorFor={colorFor}
              names={story.names}
              soft={soft}
              pop={pop}
              reduce={!!reduce}
            />
          ) : (
            <ChainBoard
              layout={layout}
              beat={beat}
              colorFor={colorFor}
              names={story.names}
              soft={soft}
              reduce={!!reduce}
            />
          )}
        </svg>

        {/* measured bars, lined up against each other */}
        {story.compare && (
          <CompareStrip
            layout={layout}
            beat={beat}
            colorFor={colorFor}
            names={story.names}
            showLetters={layout.showLetters}
            diffPair={p.ask === 'difference' ? [story.aIndex, story.bIndex] : null}
            soft={soft}
          />
        )}

        {/* running tally */}
        <div className="flex min-h-[2.25rem] items-center justify-center gap-2">
          {beat.tally !== null ? (
            <motion.div
              key={`tally-${beat.tally}`}
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={pop}
              className="flex items-baseline gap-1 rounded-xl border-2 px-3 py-1"
              style={{
                background: beat.result ? GREEN_TINT : '#E1EFFB',
                borderColor: beat.result ? GREEN : BLUE,
              }}
            >
              <span
                className="font-display text-xl font-black tabular-nums"
                style={{ color: beat.result ? GREEN : BLUE }}
              >
                {beat.tally}
              </span>
              <span className="font-display text-[0.6875rem] font-extrabold" style={{ color: MUTED }}>
                {story.unitShort}
              </span>
            </motion.div>
          ) : beat.trap ? (
            <div
              className="flex items-center gap-2 rounded-xl border-2 px-3 py-1"
              style={{ background: ROSE_TINT, borderColor: ROSE }}
            >
              <span className="font-display text-xl font-black tabular-nums line-through" style={{ color: ROSE }}>
                {beat.trap.wrong}
              </span>
              <span className="font-display text-[0.6875rem] font-extrabold" style={{ color: ROSE }}>
                {T('not the length', 'bukan panjangnya')}
              </span>
            </div>
          ) : null}
        </div>

        {/* caption */}
        <div
          className="rounded-xl border-2 px-3 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_TINT, borderColor: GREEN, color: '#2F5C00' }
              : beat.trap
                ? { background: ROSE_TINT, borderColor: ROSE, color: '#8C2F2B' }
                : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ruler board
// ---------------------------------------------------------------------------

type Trans = { duration: number } | { type: 'spring'; stiffness: number; damping: number }

function RulerBoard({
  layout,
  beat,
  marks,
  colorFor,
  names,
  soft,
  pop,
  reduce,
}: {
  layout: LengthLayout
  beat: LengthStep
  marks: number[]
  colorFor: (i: number) => string
  names: string[]
  soft: Trans
  pop: Trans
  reduce: boolean
}) {
  const { rulerTop, rulerH, rulerMax, single, showLetters, padL } = layout
  const trap = beat.trap
  const trapRow = trap && beat.item !== null ? layout.rows[beat.item] : null
  const trapColor = beat.item === null ? BLUE : colorFor(beat.item)
  const bandY = layout.height + 8 // the trap bracket lives under the ruler

  const ticks: ReactNode[] = []
  for (let v = 0; v <= rulerMax; v++) {
    const x = xAt(layout, v)
    const major = v % 5 === 0
    const hot = marks.includes(v)
    const wrong = !!trap && v === trap.wrong
    const chip = hot || wrong
    const chipFill = wrong ? ROSE : BLUE
    ticks.push(
      <g key={v}>
        <line
          x1={x}
          y1={rulerTop}
          x2={x}
          y2={rulerTop + (major || chip ? 15 : 10)}
          stroke={chip ? chipFill : BLUE}
          strokeWidth={major || chip ? 2 : 1.2}
        />
        {chip && <rect x={x - 9} y={rulerTop + 18} width={18} height={16} rx={5} fill={chipFill} />}
        <text
          x={x}
          y={rulerTop + 30}
          textAnchor="middle"
          fontSize={11}
          fontWeight="bold"
          fill={chip ? CREAM : BLUE}
        >
          {v}
        </text>
      </g>,
    )
  }

  return (
    <g>
      {/* ruler body */}
      <rect
        x={xAt(layout, 0) - 10}
        y={rulerTop}
        width={rulerMax * U + 20}
        height={rulerH}
        rx={6}
        fill={CREAM}
        stroke={BLUE}
        strokeWidth={2}
      />
      {ticks}
      <text
        x={xAt(layout, rulerMax) + 6}
        y={rulerTop + rulerH - 6}
        textAnchor="end"
        fontSize={10}
        fill={BLUE}
      >
        cm
      </text>

      {/* pointers dropping onto the marked ticks */}
      {marks.map((v) => (
        <motion.polygon
          key={`ptr-${v}`}
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={pop}
          points={`${xAt(layout, v) - 5},${rulerTop - 11} ${xAt(layout, v) + 5},${rulerTop - 11} ${xAt(layout, v)},${rulerTop - 2}`}
          fill={trapColor}
        />
      ))}

      {/* objects */}
      {layout.rows.map((row, i) => {
        const color = colorFor(i)
        const active = beat.item === i
        const dim = beat.item !== null && !active
        const swept = active ? beat.countTo : 0
        return (
          <g key={i} opacity={dim ? 0.42 : 1}>
            {single ? (
              <text
                x={(row.x0 + row.x1) / 2}
                y={row.barY - 8}
                textAnchor="middle"
                fontSize={12}
                fontWeight="bold"
                fill={color}
              >
                {cap(names[i])}
              </text>
            ) : (
              <text
                x={padL - 12}
                y={row.barY + BAR_H - 4}
                textAnchor="end"
                fontSize={12}
                fontWeight="bold"
                fill={color}
              >
                {showLetters ? `${LENGTH_LABELS[i]}. ${cap(names[i])}` : cap(names[i])}
              </text>
            )}
            <ObjectBar kind={row.name} x={row.x0} y={row.barY} w={row.x1 - row.x0} color={color} />

            {/* the span, carved into single units as it sweeps */}
            {swept > 0 && (
              <g>
                {Array.from({ length: swept }, (_, j) => (
                  <motion.rect
                    key={j}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.22, delay: j * 0.06 }}
                    x={row.x0 + j * U}
                    y={row.barY}
                    width={U}
                    height={BAR_H}
                    fill={CREAM}
                    fillOpacity={0.25}
                    stroke={CREAM}
                    strokeWidth={1.6}
                  />
                ))}
                <motion.rect
                  initial={false}
                  animate={{ width: swept * U }}
                  transition={soft}
                  x={row.x0}
                  y={row.barY - 2}
                  height={BAR_H + 4}
                  rx={3}
                  fill="none"
                  stroke={beat.result ? GREEN : BLUE}
                  strokeWidth={2.6}
                />
              </g>
            )}

            {/* dashed drop lines from both ends onto the ruler */}
            <line
              x1={row.x0}
              y1={row.barY + BAR_H}
              x2={row.x0}
              y2={rulerTop}
              stroke={color}
              strokeWidth={active && beat.markStart ? 2.6 : 1.5}
              strokeDasharray="3 3"
            />
            <line
              x1={row.x1}
              y1={row.barY + BAR_H}
              x2={row.x1}
              y2={rulerTop}
              stroke={color}
              strokeWidth={active && beat.markEnd ? 2.6 : 1.5}
              strokeDasharray="3 3"
            />
          </g>
        )
      })}

      {/* THE TRAP: the right-end number measures the empty ruler too */}
      {trap && trapRow && (
        <motion.g
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={soft}
        >
          {/* whole 0 → wrong bracket */}
          <line
            x1={xAt(layout, 0)}
            y1={bandY + 4}
            x2={xAt(layout, trap.wrong)}
            y2={bandY + 4}
            stroke={ROSE}
            strokeWidth={2}
          />
          <line x1={xAt(layout, 0)} y1={bandY} x2={xAt(layout, 0)} y2={bandY + 8} stroke={ROSE} strokeWidth={2} />
          <line
            x1={xAt(layout, trap.wrong)}
            y1={bandY}
            x2={xAt(layout, trap.wrong)}
            y2={bandY + 8}
            stroke={ROSE}
            strokeWidth={2}
          />
          {/* the dead stretch the number wrongly swallows */}
          <rect
            x={xAt(layout, trap.from)}
            y={bandY + 8}
            width={xAt(layout, trap.to) - xAt(layout, trap.from)}
            height={12}
            fill={ROSE}
            fillOpacity={0.18}
            stroke={ROSE}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          {Array.from(
            { length: Math.max(1, Math.floor((xAt(layout, trap.to) - xAt(layout, trap.from)) / 7)) },
            (_, k) => {
              const hx = xAt(layout, trap.from) + k * 7
              return (
                <line
                  key={k}
                  x1={hx}
                  y1={bandY + 20}
                  x2={hx + 7}
                  y2={bandY + 8}
                  stroke={ROSE}
                  strokeWidth={1}
                  opacity={0.6}
                />
              )
            },
          )}
          {/* the part that really is the object */}
          <rect
            x={trapRow.x0}
            y={bandY + 8}
            width={trapRow.x1 - trapRow.x0}
            height={12}
            fill={trapColor}
            fillOpacity={0.3}
            stroke={trapColor}
            strokeWidth={1.5}
          />
          <DeadCross
            cx={(xAt(layout, trap.from) + xAt(layout, trap.to)) / 2}
            cy={bandY + 14}
            r={7}
            color={ROSE}
          />
          <text
            x={xAt(layout, trap.wrong) + 4}
            y={bandY + 8}
            textAnchor="start"
            fontSize={11}
            fontWeight="bold"
            fill={ROSE}
          >
            {trap.wrong}
          </text>
        </motion.g>
      )}
    </g>
  )
}

// ---------------------------------------------------------------------------
// unit-square chain board
// ---------------------------------------------------------------------------

function ChainBoard({
  layout,
  beat,
  colorFor,
  names,
  soft,
  reduce,
}: {
  layout: LengthLayout
  beat: LengthStep
  colorFor: (i: number) => string
  names: string[]
  soft: Trans
  reduce: boolean
}) {
  const { single, showLetters, padL } = layout
  return (
    <g>
      {layout.rows.map((row, i) => {
        const color = colorFor(i)
        const active = beat.item === i
        const dim = beat.item !== null && !active
        const lit = active ? beat.countTo : 0
        return (
          <g key={i} opacity={dim ? 0.42 : 1}>
            {single ? (
              <text
                x={row.x0 + (row.x1 - row.x0) / 2}
                y={row.top - 6}
                textAnchor="middle"
                fontSize={12}
                fontWeight="bold"
                fill={color}
              >
                {cap(names[i])}
              </text>
            ) : (
              <text
                x={padL - 12}
                y={row.top + BAR_H - 4}
                textAnchor="end"
                fontSize={12}
                fontWeight="bold"
                fill={color}
              >
                {showLetters ? `${LENGTH_LABELS[i]}. ${cap(names[i])}` : cap(names[i])}
              </text>
            )}
            <ObjectBar kind={row.name} x={row.x0} y={row.barY} w={row.x1 - row.x0} color={color} />

            {/* the unit squares, lighting up one at a time as they are counted */}
            {Array.from({ length: row.length }, (_, j) => {
              const on = j < lit
              return (
                <motion.rect
                  key={j}
                  initial={false}
                  animate={{ fill: on ? color : SQUARE_FILL, fillOpacity: on ? 0.55 : 1 }}
                  transition={
                    reduce ? { duration: 0 } : { duration: 0.24, delay: on ? j * 0.09 : 0 }
                  }
                  x={row.x0 + j * U}
                  y={row.stripY}
                  width={U}
                  height={U}
                  stroke={BLUE}
                  strokeWidth={1.5}
                  shapeRendering="crispEdges"
                />
              )
            })}
            {/* counted numbers appear inside the squares as they light */}
            {Array.from({ length: lit }, (_, j) => (
              <motion.text
                key={`n-${j}`}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={reduce ? { duration: 0 } : { duration: 0.2, delay: j * 0.09 }}
                x={row.x0 + j * U + U / 2}
                y={row.stripY + U / 2 + 4}
                textAnchor="middle"
                fontSize={11}
                fontWeight="bold"
                fill={BLUE}
              >
                {j + 1}
              </motion.text>
            ))}
            <rect
              x={row.x0}
              y={row.stripY}
              width={row.length * U}
              height={U}
              fill="none"
              stroke={BLUE}
              strokeWidth={2.4}
              shapeRendering="crispEdges"
            />
            {/* the counting frontier — a moving line, then a green ring once landed */}
            {lit > 0 && !beat.result && (
              <motion.line
                initial={false}
                animate={{ x1: row.x0 + lit * U, x2: row.x0 + lit * U }}
                transition={soft}
                y1={row.stripY - 3}
                y2={row.stripY + U + 3}
                stroke={GREEN}
                strokeWidth={2.8}
                strokeLinecap="round"
              />
            )}
            {lit > 0 && beat.result && (
              <rect
                x={row.x0 - 2}
                y={row.stripY - 3}
                width={lit * U + 4}
                height={U + 6}
                rx={4}
                fill="none"
                stroke={GREEN}
                strokeWidth={2.8}
              />
            )}
            <line
              x1={row.x0}
              y1={row.barY + BAR_H}
              x2={row.x0}
              y2={row.stripY}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
            <line
              x1={row.x1}
              y1={row.barY + BAR_H}
              x2={row.x1}
              y2={row.stripY}
              stroke={color}
              strokeWidth={1.5}
              strokeDasharray="3 3"
            />
          </g>
        )
      })}
    </g>
  )
}

// ---------------------------------------------------------------------------
// measured bars, lined up so the comparison is visual
// ---------------------------------------------------------------------------

const CMP_W = 268
const CMP_LABEL = 74
const CMP_ROW = 24
const CMP_GAP = 8

function CompareStrip({
  layout,
  beat,
  colorFor,
  names,
  showLetters,
  diffPair,
  soft,
}: {
  layout: LengthLayout
  beat: LengthStep
  colorFor: (i: number) => string
  names: string[]
  showLetters: boolean
  diffPair: [number, number] | null
  soft: Trans
}) {
  const rows = layout.rows
  const maxLen = rows.reduce((m, r) => Math.max(m, r.length), 1)
  const track = CMP_W - CMP_LABEL - 30
  const scale = Math.min(U, track / maxLen)
  const height = rows.length * CMP_ROW + (rows.length - 1) * CMP_GAP + 12

  const diffOverlay =
    diffPair && beat.result
      ? {
          row: diffPair[0],
          from: rows[diffPair[1]].length,
          to: rows[diffPair[0]].length,
        }
      : null

  return (
    <svg
      viewBox={`0 0 ${CMP_W} ${height}`}
      width={Math.min(300, CMP_W)}
      className="max-w-full"
      role="presentation"
    >
      {rows.map((row, i) => {
        const y = 6 + i * (CMP_ROW + CMP_GAP)
        const value = beat.measured[i]
        const on = value !== null && value !== undefined
        // ring only when a single bar is being talked about, so it reads as
        // "this one" instead of decorating every bar on the compare beat
        const hot = beat.focus.length === 1 && beat.focus[0] === i
        const color = colorFor(i)
        const w = on ? (value as number) * scale : 0
        return (
          <g key={i} opacity={on ? 1 : 0.5}>
            <text
              x={CMP_LABEL - 8}
              y={y + 15}
              textAnchor="end"
              fontSize={11}
              fontWeight="bold"
              fill={on ? color : MUTED}
            >
              {showLetters ? `${LENGTH_LABELS[i]}. ${cap(names[i])}` : cap(names[i])}
            </text>
            {/* neutral track — never reveals the length before it is measured */}
            <rect
              x={CMP_LABEL}
              y={y + 3}
              width={maxLen * scale}
              height={16}
              rx={4}
              fill={SQUARE_FILL}
              stroke={MUTED}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            {on && (
              <motion.rect
                initial={false}
                animate={{ width: w }}
                transition={soft}
                x={CMP_LABEL}
                y={y + 3}
                height={16}
                rx={4}
                fill={color}
                stroke={hot ? BLUE : color}
                strokeWidth={hot ? 2 : 1}
              />
            )}
            {on &&
              Array.from({ length: value as number }, (_, j) => (
                <line
                  key={j}
                  x1={CMP_LABEL + (j + 1) * scale}
                  y1={y + 3}
                  x2={CMP_LABEL + (j + 1) * scale}
                  y2={y + 19}
                  stroke={CREAM}
                  strokeWidth={1}
                  opacity={0.75}
                />
              ))}
            {on && (
              <text
                x={CMP_LABEL + maxLen * scale + 6}
                y={y + 15}
                textAnchor="start"
                fontSize={12}
                fontWeight="bold"
                fill={color}
              >
                {value}
              </text>
            )}
          </g>
        )
      })}

      {/* the difference — the tail the longer bar has spare, carved out and counted */}
      {diffOverlay && (
        <motion.g initial={false} animate={{ opacity: 1 }} transition={soft}>
          <rect
            x={CMP_LABEL + diffOverlay.from * scale}
            y={6 + diffOverlay.row * (CMP_ROW + CMP_GAP) + 2}
            width={(diffOverlay.to - diffOverlay.from) * scale}
            height={18}
            rx={4}
            fill={CREAM}
            stroke={INK}
            strokeWidth={2.2}
          />
          <text
            x={CMP_LABEL + ((diffOverlay.from + diffOverlay.to) / 2) * scale}
            y={6 + diffOverlay.row * (CMP_ROW + CMP_GAP) + 15}
            textAnchor="middle"
            fontSize={11}
            fontWeight="bold"
            fill={INK}
          >
            {diffOverlay.to - diffOverlay.from}
          </text>
        </motion.g>
      )}
    </svg>
  )
}
