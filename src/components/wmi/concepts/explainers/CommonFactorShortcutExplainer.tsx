import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildCommonFactorSteps, type EqTone } from './commonFactorSteps'
import { useBeatControl } from './useBeatControl'

// A11 `common-factor-shortcut`. Each term is drawn as columns that all stand
// `c` tall: `a × c` is a columns, `b × c` is b columns. Because the two blocks
// are exactly the same height, they slide together into one block of (a + b)
// columns — and the second height label merges into the first. That merge is
// the lesson: the shared factor comes out, two multiplications become one.

const INK = '#30598A' // qupu-brand-blue — first term
const INK_SOFT = '#7FA6D4' // second term (same family, its own identity)
const SHARED = '#F0853A' // qupu-brand-orange — the shared factor
const GREEN = '#58A700' // the settled result
const GREEN_TINT = '#EAF7DA'
const GREEN_INK = '#3C6E00'
const MUTED = '#94A3B8'
const CREAM = '#FFF2DF' // qupu-cream
const PEACH = '#FFD3B1' // qupu-peach
const GRID = 'rgba(255,255,255,0.55)'
const FONT = 'Fredoka, Nunito, system-ui, sans-serif'
// SVG collapses ordinary leading whitespace inside a <tspan>, which would jam
// the equation into one word — separate the tokens with a non-breaking space.
const SPACE = '\u00A0'

const VB_W = 400
const VB_H = 226
const SIDE_PAD = 52 // room for the height braces + their labels
const BAND_TOP = 40
const BAND_BOT = 150
const GAP = 26 // space between the two blocks before they join
const CELL_W_MAX = 26
const CELL_H_MAX = 34
const EQ_BASE = 214 // equation baseline, under the picture

function toneColor(tone: EqTone): string {
  if (tone === 'shared') return SHARED
  if (tone === 'group') return INK
  if (tone === 'answer') return GREEN
  if (tone === 'muted') return MUTED
  return INK
}

/** Vertical measure with end caps, labelled with the column height. */
function HeightBrace({
  x,
  top,
  bot,
  label,
  color,
  side,
}: {
  x: number
  top: number
  bot: number
  label: string
  color: string
  side: 'left' | 'right'
}) {
  const cap = side === 'left' ? 5 : -5
  const s = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const }
  return (
    <g>
      <line x1={x} y1={top} x2={x} y2={bot} {...s} />
      <line x1={x} y1={top} x2={x + cap} y2={top} {...s} />
      <line x1={x} y1={bot} x2={x + cap} y2={bot} {...s} />
      <text
        x={side === 'left' ? x - 6 : x + 6}
        y={(top + bot) / 2 + 6}
        textAnchor={side === 'left' ? 'end' : 'start'}
        fontSize={17}
        fontWeight={800}
        fontFamily={FONT}
        fill={color}
      >
        {label}
      </text>
    </g>
  )
}

/** Horizontal measure under a block, labelled with how many columns it spans. */
function WidthBrace({
  x,
  w,
  y,
  label,
  color,
}: {
  x: number
  w: number
  y: number
  label: string
  color: string
}) {
  const s = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const }
  return (
    <g>
      <line x1={x} y1={y} x2={x + w} y2={y} {...s} />
      <line x1={x} y1={y - 5} x2={x} y2={y + 5} {...s} />
      <line x1={x + w} y1={y - 5} x2={x + w} y2={y + 5} {...s} />
      <text
        x={x + w / 2}
        y={y + 20}
        textAnchor="middle"
        fontSize={16}
        fontWeight={800}
        fontFamily={FONT}
        fill={color}
      >
        {label}
      </text>
    </g>
  )
}

export default function CommonFactorShortcutExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const story = useMemo(() => buildCommonFactorSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { a, b, c, sum } = story

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const tr = (d: number) => ({ duration: reduce ? 0 : d, ease: 'easeOut' as const })
  const spring = reduce
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 210, damping: 26 }

  // ── geometry ────────────────────────────────────────────────────────────
  const cols = a + b
  const availW = VB_W - SIDE_PAD * 2
  const bandH = BAND_BOT - BAND_TOP
  // One cell width for every beat, so joining moves the blocks without resizing.
  const cellW = Math.min((availW - GAP) / cols, CELL_W_MAX)
  const blockH = Math.min(bandH, c * CELL_H_MAX)
  const cellH = blockH / c
  const top = BAND_TOP + (bandH - blockH) / 2
  const bot = top + blockH

  const spanW = cols * cellW
  const openStart = (VB_W - (spanW + GAP)) / 2
  const joinStart = (VB_W - spanW) / 2
  const start = beat.joined ? joinStart : openStart
  const leftW = a * cellW
  const rightW = b * cellW
  const leftX = start
  const rightX = start + leftW + (beat.joined ? 0 : GAP)

  const braceY = bot + 13
  const inset = cellW >= 9 ? 1.2 : 0.7
  const rightFill = beat.phase === 'group' || beat.phase === 'result' ? INK : INK_SOFT
  const sharedInk = beat.sharedLit ? SHARED : MUTED

  // Where the second height label sat before it was lifted out.
  const oldBraceX = openStart + spanW + GAP + 11
  const newBraceX = joinStart - 11

  const plateW = Math.max(28, beat.plate.length * 13 + 16)
  const plateH = 30

  const columns = (count: number, fill: string, keyPrefix: string) =>
    Array.from({ length: count }, (_, i) => (
      <motion.rect
        key={`${keyPrefix}-${i}`}
        x={i * cellW + inset / 2}
        y={top}
        width={Math.max(1, cellW - inset)}
        height={blockH}
        rx={2}
        fill={fill}
        initial={false}
        animate={{ fill }}
        transition={tr(0.35)}
      />
    ))

  const rowLines = (w: number, keyPrefix: string) =>
    Array.from({ length: Math.max(0, c - 1) }, (_, r) => (
      <line
        key={`${keyPrefix}-r${r}`}
        x1={0}
        y1={top + (r + 1) * cellH}
        x2={w}
        y2={top + (r + 1) * cellH}
        stroke={GRID}
        strokeWidth={1}
      />
    ))

  const plate = (id: string, cx: number, text: string, settled: boolean) => (
    <motion.g
      key={`plate-${id}-${settled ? 'ans' : 'ask'}-${text}`}
      initial={false}
      animate={
        settled
          ? { scale: reduce ? 1 : [0.7, 1.12, 1] }
          : beat.phase === 'long' && !reduce
            ? { scale: [1, 1.07, 1] }
            : { scale: 1 }
      }
      transition={
        settled
          ? tr(0.45)
          : beat.phase === 'long' && !reduce
            ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
            : tr(0.2)
      }
    >
      <rect
        x={cx - plateW / 2}
        y={(top + bot) / 2 - plateH / 2}
        width={plateW}
        height={plateH}
        rx={9}
        fill={settled ? GREEN_TINT : CREAM}
        stroke={settled ? GREEN : INK}
        strokeWidth={2.5}
      />
      <text
        x={cx}
        y={(top + bot) / 2 + 7}
        textAnchor="middle"
        fontSize={19}
        fontWeight={800}
        fontFamily={FONT}
        fill={settled ? GREEN_INK : INK}
      >
        {text}
      </text>
    </motion.g>
  )

  const ariaLabel = T(
    `Strategy: ${a} × ${c} + ${b} × ${c} share the factor ${c}, so the two blocks of columns join into (${a} + ${b}) × ${c} — one multiplication instead of two.`,
    `Strategi: ${a} × ${c} + ${b} × ${c} punya faktor sama ${c}, jadi kedua blok kolom digabung menjadi (${a} + ${b}) × ${c} — satu perkalian saja.`,
  )

  return (
    <div className="mx-auto flex w-full max-w-[27.5rem] flex-col items-center gap-3">
      <div
        className="w-full overflow-hidden rounded-2xl border-2 bg-white"
        style={{ borderColor: PEACH }}
        role="img"
        aria-label={ariaLabel}
      >
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" role="presentation">
          {/* dashed proof that the two blocks stand exactly the same height */}
          {beat.heightGuides && (
            <motion.g initial={false} animate={{ opacity: 1 }} transition={tr(0.3)}>
              {[top, bot].map((y) => (
                <line
                  key={y}
                  x1={leftX - 18}
                  y1={y}
                  x2={rightX + rightW + 18}
                  y2={y}
                  stroke={SHARED}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  opacity={0.75}
                />
              ))}
            </motion.g>
          )}

          {/* first term: a columns, each c tall */}
          <motion.g initial={false} animate={{ x: leftX }} transition={spring}>
            {columns(a, INK, 'l')}
            {rowLines(leftW, 'l')}
            <HeightBrace x={-11} top={top} bot={bot} label={String(c)} color={sharedInk} side="left" />
            {!beat.joined && (
              <WidthBrace x={0} w={leftW} y={braceY} label={String(a)} color={INK} />
            )}
          </motion.g>

          {/* second term: b columns, the same c tall */}
          <motion.g initial={false} animate={{ x: rightX }} transition={spring}>
            {columns(b, rightFill, 'r')}
            {rowLines(rightW, 'r')}
            {!beat.joined && (
              <>
                <HeightBrace
                  x={rightW + 11}
                  top={top}
                  bot={bot}
                  label={String(c)}
                  color={sharedInk}
                  side="right"
                />
                <WidthBrace x={0} w={rightW} y={braceY} label={String(b)} color={INK_SOFT} />
              </>
            )}
          </motion.g>

          {/* the seam where the two blocks met, still visible right after joining */}
          {beat.seam && (
            <motion.line
              initial={false}
              animate={{ opacity: 1 }}
              transition={tr(0.3)}
              x1={joinStart + leftW}
              y1={top}
              x2={joinStart + leftW}
              y2={bot}
              stroke={CREAM}
              strokeWidth={2.5}
              strokeDasharray="5 4"
            />
          )}

          {/* the shared factor lifting out: a trail from the second height
              label, arcing over the blocks, into the one that is left */}
          {beat.liftTrail && (
            <motion.g initial={false} animate={{ opacity: 1 }} transition={tr(0.4)}>
              <path
                d={`M ${oldBraceX} ${top - 6} Q ${(oldBraceX + newBraceX) / 2} ${top - 34} ${newBraceX} ${top - 6}`}
                fill="none"
                stroke={SHARED}
                strokeWidth={2.5}
                strokeDasharray="6 5"
                strokeLinecap="round"
              />
              <path
                d={`M ${newBraceX - 5} ${top - 13} L ${newBraceX} ${top - 4} L ${newBraceX + 6} ${top - 12}`}
                fill="none"
                stroke={SHARED}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x={oldBraceX + 6}
                y={top - 1}
                textAnchor="start"
                fontSize={17}
                fontWeight={800}
                fontFamily={FONT}
                fill={SHARED}
                opacity={0.4}
              >
                {c}
              </text>
            </motion.g>
          )}

          {/* one measure under the joined block: (a + b), then a + b itself */}
          {beat.joined && (
            <WidthBrace
              x={joinStart}
              w={spanW}
              y={braceY}
              label={beat.widthLabel === 'sum' ? String(sum) : `${a} + ${b}`}
              color={INK}
            />
          )}

          {/* the running value: two unknowns, then one, then the answer */}
          {beat.joined
            ? plate('one', joinStart + spanW / 2, beat.plate, beat.result)
            : [
                plate('l', leftX + leftW / 2, beat.plate, false),
                plate('r', rightX + rightW / 2, beat.plate, false),
              ]}

          {/* the equation, rewriting itself under the picture */}
          <motion.text
            key={beat.phase}
            x={VB_W / 2}
            y={EQ_BASE}
            textAnchor="middle"
            fontSize={23}
            fontWeight={800}
            fontFamily={FONT}
            initial={false}
            animate={{ opacity: 1, scale: reduce ? 1 : [0.94, 1] }}
            transition={tr(0.35)}
          >
            {beat.equation.map((tok, i) => (
              <tspan key={i} fill={toneColor(tok.tone)}>
                {(i > 0 ? SPACE : '') + tok.text}
              </tspan>
            ))}
          </motion.text>
        </svg>
      </div>

      <div
        className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
        style={
          beat.result
            ? { background: GREEN_TINT, borderColor: GREEN, color: GREEN_INK }
            : { background: '#E1EFFB', borderColor: INK, color: INK }
        }
      >
        {beat.caption}
      </div>
    </div>
  )
}
