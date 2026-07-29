import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { useBeatControl } from './useBeatControl'
import {
  buildNumberFigureRuleSteps,
  type RuleStep,
  type RuleStoryboard,
  type Slot,
  type Tone,
  type Triple,
} from './numberFigureRuleSteps'

// Palette copied from the static number-figure-rule figure so the animation
// reads as that same picture coming alive: blue = given, green = result,
// dashed orange = the gap, cream cards on a warm shell.
const BLUE = '#30598A'
const ORANGE = '#F0853A'
const ORANGE_INK = '#9A4A12'
const GREEN = '#58A700'
const GREEN_INK = '#3B6F00'
const CARD = '#FDF8F1'
const CARD_EDGE = '#EADFCD'
const LINK = '#B5A896'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const ROSE = '#E11D48'
const ROSE_INK = '#9F1239'

const TONE: Record<Tone, { ink: string; edge: string; fill: string }> = {
  try: { ink: BLUE, edge: BLUE, fill: '#E1EFFB' },
  ok: { ink: GREEN_INK, edge: GREEN, fill: '#EEF7E0' },
  rule: { ink: BLUE, edge: BLUE, fill: '#E1EFFB' },
  trap: { ink: ROSE_INK, edge: ROSE, fill: '#FFF1F2' },
  answer: { ink: ORANGE_INK, edge: ORANGE, fill: '#FFF2DF' },
}

const SLOTS: Slot[] = ['a', 'b', 'c']

/**
 * Connector that stops short of both circles and ends in an arrow head, so
 * "these two make that one" reads in one direction only. Same trigonometry as
 * the static figure (which does not export it).
 */
function connector(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  trimStart: number,
  trimEnd: number,
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const tipX = x2 - ux * trimEnd
  const tipY = y2 - uy * trimEnd
  const headLen = 8
  const headHalf = 4.5
  const baseX = tipX - ux * headLen
  const baseY = tipY - uy * headLen
  const f = (n: number) => n.toFixed(2)
  return {
    x1: f(x1 + ux * trimStart),
    y1: f(y1 + uy * trimStart),
    x2: f(baseX),
    y2: f(baseY),
    head: `${f(tipX)},${f(tipY)} ${f(baseX - uy * headHalf)},${f(baseY + ux * headHalf)} ${f(
      baseX + uy * headHalf,
    )},${f(baseY - ux * headHalf)}`,
  }
}

// One number bubble. `open` is the still-unsolved gap: dashed orange ring, "?".
function Bubble({
  cx,
  cy,
  r,
  text,
  tone,
  open,
  lit,
  landed,
  dur,
}: {
  cx: number
  cy: number
  r: number
  text: string
  tone: string
  open: boolean
  lit: boolean
  landed: boolean
  dur: number
}) {
  return (
    <g>
      {landed && (
        // Halo that blooms once the missing number lands.
        <motion.circle
          cx={cx}
          cy={cy}
          fill="none"
          stroke={ORANGE}
          strokeWidth={2}
          initial={false}
          animate={{ r: r + 7, opacity: 0.45 }}
          transition={{ duration: dur * 1.2 }}
        />
      )}
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill="#FFFFFF"
        stroke={tone}
        strokeDasharray={open ? '5 4' : '0 0'}
        initial={false}
        animate={{ strokeWidth: lit ? 4.2 : 3 }}
        transition={{ duration: dur }}
      />
      <text
        x={cx}
        y={cy + r * 0.36}
        textAnchor="middle"
        fontSize={r * 1.05}
        fontWeight="bold"
        fill={tone}
      >
        {text}
      </text>
    </g>
  )
}

// Small verdict badge pinned to a spotlighted card.
function Badge({ x, y, kind }: { x: number; y: number; kind: 'check' | 'cross' }) {
  const color = kind === 'check' ? GREEN : ROSE
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill="#FFFFFF" stroke={color} strokeWidth={2} />
      {kind === 'check' ? (
        <path
          d={`M ${x - 4.4} ${y + 0.4} L ${x - 1.2} ${y + 3.6} L ${x + 4.6} ${y - 3.4}`}
          fill="none"
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d={`M ${x - 3.8} ${y - 3.8} L ${x + 3.8} ${y + 3.8} M ${x + 3.8} ${y - 3.8} L ${x - 3.8} ${y + 3.8}`}
          fill="none"
          stroke={color}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
      )}
    </g>
  )
}

// The working-out note under the figure: the arithmetic annotation for this beat.
function WorkStrip({
  x,
  y,
  w,
  h,
  step,
  dur,
}: {
  x: number
  y: number
  w: number
  h: number
  step: RuleStep
  dur: number
}) {
  const tone = TONE[step.work.tone]
  const cx = x + w / 2
  const hasSub = !!step.work.sub
  const exprSize = w > 240 ? 22 : 19
  return (
    <motion.g initial={false} animate={{ opacity: 1 }} transition={{ duration: dur }}>
      <motion.rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        strokeWidth={2}
        initial={false}
        animate={{ fill: tone.fill, stroke: tone.edge }}
        transition={{ duration: dur }}
      />
      <text
        x={cx}
        y={hasSub ? y + h * 0.46 : y + h * 0.63}
        textAnchor="middle"
        fontSize={exprSize}
        fontWeight="bold"
        fill={tone.ink}
      >
        {step.work.expr}
      </text>
      {hasSub && (
        <text
          x={cx}
          y={y + h * 0.82}
          textAnchor="middle"
          fontSize={10}
          fontWeight="bold"
          fill={tone.ink}
          opacity={0.78}
        >
          {step.work.sub}
        </text>
      )}
    </motion.g>
  )
}

/**
 * The board: the three number groups drawn exactly like the static figure, with
 * the current beat's group spotlighted (the others dimmed) and the arithmetic
 * annotation in a work strip underneath.
 */
function RuleBoard({
  story,
  step,
  reduce,
}: {
  story: RuleStoryboard
  step: RuleStep
  reduce: boolean
}) {
  const { layout, groups, blank } = story
  const tone = TONE[step.work.tone]
  const dur = reduce ? 0 : 0.35
  const solved = step.answer !== null

  const isGap = (groupIndex: number, slot: Slot) => groupIndex === 2 && slot === blank
  // The gap holds "?" until either a candidate is being tried out (rose, about
  // to be crossed off) or the real answer lands (orange).
  const gapValue = solved ? step.answer : step.trial
  const cellText = (groupIndex: number, slot: Slot, group: Triple) =>
    isGap(groupIndex, slot) ? (gapValue === null ? '?' : String(gapValue)) : String(group[slot])
  const toneOf = (groupIndex: number, slot: Slot) =>
    isGap(groupIndex, slot)
      ? step.trial !== null && !solved
        ? ROSE
        : ORANGE
      : slot === 'c'
        ? GREEN
        : BLUE
  // Unfocused groups stay readable — they are the evidence, not decoration.
  const dim = (i: number) => (step.focus === null || step.focus === i ? 1 : 0.42)
  const focused = (i: number) => step.focus === i

  const spoken = (groupIndex: number, slot: Slot, group: Triple) =>
    isGap(groupIndex, slot) && !solved ? '?' : cellText(groupIndex, slot, group)
  const ariaGroups = groups
    .map(
      (g, i) =>
        `${i + 1}: ${spoken(i, 'a', g)}, ${spoken(i, 'b', g)}, ${spoken(i, 'c', g)}`,
    )
    .join('. ')

  // --- row: three circles in a straight line, groups stacked ---------------
  if (layout === 'row') {
    const r = 19
    const cxs = [36, 86, 172]
    const cardX = 4
    const cardW = 200
    const cardH = 62
    const pitch = cardH + 11
    const width = 208
    const figureH = 6 + cardH * 3 + 11 * 2 + 6
    const stripY = figureH + 6
    const stripH = 48
    const height = stripY + stripH + 6

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="presentation" aria-hidden>
        <title>{ariaGroups}</title>
        {groups.map((g, i) => {
          const cardY = 6 + i * pitch
          const cy = cardY + cardH / 2
          const arrow = connector(cxs[1], cy, cxs[2], cy, r + 10, r + 9)
          return (
            <motion.g key={i} initial={false} animate={{ opacity: dim(i) }} transition={{ duration: dur }}>
              <motion.rect
                x={cardX}
                y={cardY}
                width={cardW}
                height={cardH}
                rx={14}
                fill={CARD}
                initial={false}
                animate={{
                  stroke: focused(i) ? tone.edge : CARD_EDGE,
                  strokeWidth: focused(i) ? 3.2 : 2,
                }}
                transition={{ duration: dur }}
              />
              <line
                x1={arrow.x1}
                y1={arrow.y1}
                x2={arrow.x2}
                y2={arrow.y2}
                stroke={LINK}
                strokeWidth={3}
                strokeLinecap="round"
              />
              <polygon points={arrow.head} fill={LINK} />
              {SLOTS.map((slot, k) => (
                <Bubble
                  key={slot}
                  cx={cxs[k]}
                  cy={cy}
                  r={r}
                  text={cellText(i, slot, g)}
                  tone={toneOf(i, slot)}
                  open={isGap(i, slot) && gapValue === null}
                  lit={focused(i)}
                  landed={isGap(i, slot) && solved}
                  dur={dur}
                />
              ))}
              {focused(i) && step.badge !== 'none' && (
                // sits in the clear strip above the arrow, between b and c
                <Badge x={(cxs[1] + cxs[2]) / 2} y={cardY + 13} kind={step.badge} />
              )}
            </motion.g>
          )
        })}
        <WorkStrip x={cardX} y={stripY} w={cardW} h={stripH} step={step} dur={dur} />
      </svg>
    )
  }

  // --- pyramid: two above, one below, groups side by side ------------------
  const r = 16
  const groupW = 88
  const gapX = 9
  const cyTop = 30
  const cyBot = 94
  const cardY = 4
  const cardH = 116
  const width = 4 + groupW * 3 + gapX * 2 + 4
  const figureH = cardY + cardH + 4
  const stripY = figureH + 6
  const stripH = 48
  const height = stripY + stripH + 6

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="presentation" aria-hidden>
      <title>{ariaGroups}</title>
      {groups.map((g, i) => {
        const ox = 4 + i * (groupW + gapX)
        const cxA = ox + 24
        const cxB = ox + 64
        const cxC = ox + 44
        const legs = [
          connector(cxA, cyTop, cxC, cyBot, r + 2, r + 3),
          connector(cxB, cyTop, cxC, cyBot, r + 2, r + 3),
        ]
        const seats: Array<[Slot, number, number]> = [
          ['a', cxA, cyTop],
          ['b', cxB, cyTop],
          ['c', cxC, cyBot],
        ]
        return (
          <motion.g key={i} initial={false} animate={{ opacity: dim(i) }} transition={{ duration: dur }}>
            <motion.rect
              x={ox}
              y={cardY}
              width={groupW}
              height={cardH}
              rx={14}
              fill={CARD}
              initial={false}
              animate={{
                stroke: focused(i) ? tone.edge : CARD_EDGE,
                strokeWidth: focused(i) ? 3.2 : 2,
              }}
              transition={{ duration: dur }}
            />
            {legs.map((leg, k) => (
              <g key={k}>
                <line
                  x1={leg.x1}
                  y1={leg.y1}
                  x2={leg.x2}
                  y2={leg.y2}
                  stroke={LINK}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <polygon points={leg.head} fill={LINK} />
              </g>
            ))}
            {seats.map(([slot, sx, sy]) => (
              <Bubble
                key={slot}
                cx={sx}
                cy={sy}
                r={r}
                text={cellText(i, slot, g)}
                tone={toneOf(i, slot)}
                open={isGap(i, slot) && gapValue === null}
                lit={focused(i)}
                landed={isGap(i, slot) && solved}
                dur={dur}
              />
            ))}
            {focused(i) && step.badge !== 'none' && (
              // bottom-right corner is the only empty spot in a pyramid card
              <Badge x={ox + groupW - 14} y={cardY + cardH - 14} kind={step.badge} />
            )}
          </motion.g>
        )
      })}
      <WorkStrip x={4} y={stripY} w={width - 8} h={stripH} step={step} dur={dur} />
    </svg>
  )
}

export default function NumberFigureRuleExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const story = useMemo(() => buildNumberFigureRuleSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const step = story.steps[index] ?? story.steps[story.finalIndex]
  const reduce = !!useReducedMotion()
  const tone = TONE[step.work.tone]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: guess a rule from the first finished figure, test it on the second, then use it on the figure with the gap. The missing number is ${story.answer}.`,
    `Strategi: tebak aturan dari gambar pertama yang lengkap, uji di gambar kedua, lalu pakai di gambar yang kosong. Angka yang hilang adalah ${story.answer}.`,
  )

  const phase =
    step.kind === 'guess'
      ? T('1. Guess a rule', '1. Tebak aturannya')
      : step.kind === 'test'
        ? T('2. Test it', '2. Uji aturannya')
        : step.kind === 'rule'
          ? T('3. The rule', '3. Aturannya')
          : step.kind === 'trap'
            ? T('Careful', 'Hati-hati')
            : step.kind === 'setup'
              ? T('4. Use the rule', '4. Pakai aturannya')
              : T('5. The missing number', '5. Angka yang hilang')

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* phase chip — names the move the beat is making */}
        <div
          className="rounded-full border-2 px-3 py-1 font-display text-[0.6875rem] font-extrabold uppercase tracking-wide"
          style={{ background: tone.fill, borderColor: tone.edge, color: tone.ink }}
        >
          {phase}
        </div>

        {/* the figure, coming alive */}
        <div className={story.layout === 'row' ? 'w-full max-w-[16.25rem]' : 'w-full max-w-[18rem]'}>
          <RuleBoard story={story} step={step} reduce={reduce} />
        </div>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={{ background: tone.fill, borderColor: tone.edge, color: tone.ink }}
        >
          {step.caption}
        </div>
      </div>
    </div>
  )
}
