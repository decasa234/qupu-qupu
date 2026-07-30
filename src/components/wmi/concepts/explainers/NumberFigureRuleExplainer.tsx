import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { useBeatControl } from './useBeatControl'
import {
  GAP_DASH,
  RULE_INK,
  bubbleNumeral,
  ruleGeometry,
  slotInk,
  type RuleGroupGeom,
} from '../number-figure-rule'
import {
  buildNumberFigureRuleSteps,
  type RuleStep,
  type RuleStoryboard,
  type Slot,
  type Tone,
  type Triple,
} from './numberFigureRuleSteps'

// The palette, the bubble glyph and every coordinate come from the static
// number-figure-rule figure (`../number-figure-rule`), so the animation is that
// same picture coming alive and cannot drift when the figure is redrawn. Only
// the beat inks below — rose for a rejected candidate, the warm shell, the
// darker inks used on filled chips — belong to the animation alone.
const ORANGE_INK = '#9A4A12'
const GREEN_INK = '#3B6F00'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const ROSE = '#E11D48'
const ROSE_INK = '#9F1239'

const TONE: Record<Tone, { ink: string; edge: string; fill: string }> = {
  try: { ink: RULE_INK.given, edge: RULE_INK.given, fill: '#E1EFFB' },
  ok: { ink: GREEN_INK, edge: RULE_INK.result, fill: '#EEF7E0' },
  rule: { ink: RULE_INK.given, edge: RULE_INK.given, fill: '#E1EFFB' },
  trap: { ink: ROSE_INK, edge: ROSE, fill: '#FFF1F2' },
  answer: { ink: ORANGE_INK, edge: RULE_INK.gap, fill: '#FFF2DF' },
}

// One number bubble. `open` is the still-unsolved gap: dashed ring, "?".
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
  const numeral = bubbleNumeral(cx, cy, r)
  return (
    <g>
      {landed && (
        // Halo that blooms once the missing number lands.
        <motion.circle
          cx={cx}
          cy={cy}
          fill="none"
          stroke={RULE_INK.gap}
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
        strokeDasharray={open ? GAP_DASH : '0 0'}
        initial={false}
        animate={{ strokeWidth: lit ? 4.2 : 3 }}
        transition={{ duration: dur }}
      />
      <text
        x={numeral.x}
        y={numeral.y}
        textAnchor="middle"
        fontSize={numeral.fontSize}
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
  const color = kind === 'check' ? RULE_INK.result : ROSE
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

const STRIP_H = 48
const STRIP_GAP = 6

/**
 * The board: the three number groups drawn on the figure's own geometry, with
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
  const { groups, blank } = story
  const geom = ruleGeometry(story.layout)
  const tone = TONE[step.work.tone]
  const dur = reduce ? 0 : 0.35
  const solved = step.answer !== null

  const isGap = (groupIndex: number, slot: Slot) => groupIndex === 2 && slot === blank
  // The gap holds "?" until either a candidate is being tried out (rose, about
  // to be crossed off) or the real answer lands (the figure's gap ink).
  const gapValue = solved ? step.answer : step.trial
  const cellText = (groupIndex: number, slot: Slot, group: Triple) =>
    isGap(groupIndex, slot) ? (gapValue === null ? '?' : String(gapValue)) : String(group[slot])
  const toneOf = (groupIndex: number, slot: Slot) =>
    isGap(groupIndex, slot) && step.trial !== null && !solved
      ? ROSE
      : slotInk(slot, isGap(groupIndex, slot))
  // Unfocused groups stay readable — they are the evidence, not decoration.
  const dim = (i: number) => (step.focus === null || step.focus === i ? 1 : 0.42)
  const focused = (i: number) => step.focus === i

  // The badge goes wherever the layout leaves a clear patch of card.
  const badgeAt = (cell: RuleGroupGeom) =>
    geom.layout === 'row'
      ? { x: (cell.seats[1].cx + cell.seats[2].cx) / 2, y: cell.card.y + 13 }
      : { x: cell.card.x + cell.card.w - 14, y: cell.card.y + cell.card.h - 14 }

  const strip =
    geom.layout === 'row'
      ? { x: geom.groups[0].card.x, w: geom.groups[0].card.w }
      : { x: 4, w: geom.width - 8 }
  const stripY = geom.figureHeight + STRIP_GAP
  const height = stripY + STRIP_H + STRIP_GAP

  const spoken = (groupIndex: number, slot: Slot, group: Triple) =>
    isGap(groupIndex, slot) && !solved ? '?' : cellText(groupIndex, slot, group)
  const ariaGroups = groups
    .map(
      (g, i) => `${i + 1}: ${spoken(i, 'a', g)}, ${spoken(i, 'b', g)}, ${spoken(i, 'c', g)}`,
    )
    .join('. ')

  return (
    <svg
      viewBox={`0 0 ${geom.width} ${height}`}
      width="100%"
      role="presentation"
      aria-hidden
    >
      <title>{ariaGroups}</title>
      {groups.map((g, i) => {
        const cell = geom.groups[i]
        const badge = badgeAt(cell)
        return (
          <motion.g key={i} initial={false} animate={{ opacity: dim(i) }} transition={{ duration: dur }}>
            <motion.rect
              x={cell.card.x}
              y={cell.card.y}
              width={cell.card.w}
              height={cell.card.h}
              rx={cell.card.rx}
              fill={RULE_INK.card}
              initial={false}
              animate={{
                stroke: focused(i) ? tone.edge : RULE_INK.cardEdge,
                strokeWidth: focused(i) ? 3.2 : 2,
              }}
              transition={{ duration: dur }}
            />
            {cell.arrows.map((arrow, k) => (
              <g key={k}>
                <line
                  x1={arrow.x1}
                  y1={arrow.y1}
                  x2={arrow.x2}
                  y2={arrow.y2}
                  stroke={RULE_INK.link}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <polygon points={arrow.head} fill={RULE_INK.link} />
              </g>
            ))}
            {cell.seats.map((seat) => (
              <Bubble
                key={seat.slot}
                cx={seat.cx}
                cy={seat.cy}
                r={geom.r}
                text={cellText(i, seat.slot, g)}
                tone={toneOf(i, seat.slot)}
                open={isGap(i, seat.slot) && gapValue === null}
                lit={focused(i)}
                landed={isGap(i, seat.slot) && solved}
                dur={dur}
              />
            ))}
            {focused(i) && step.badge !== 'none' && (
              <Badge x={badge.x} y={badge.y} kind={step.badge} />
            )}
          </motion.g>
        )
      })}
      <WorkStrip x={strip.x} y={stripY} w={strip.w} h={STRIP_H} step={step} dur={dur} />
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
