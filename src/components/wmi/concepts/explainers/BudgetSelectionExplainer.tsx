import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildBudgetSteps } from './budgetSteps'
import { useBeatControl } from './useBeatControl'

// Palette echoes the static budget-selection illustration (qupu tokens).
const TICKET_BODY = '#FFF2DF' // qupu-cream
const TICKET_STROKE = '#f0853a' // qupu-brand-orange
const SHELL = '#FFF9F4' // qupu-shell (notch fill / panel)
const PEACH = '#FFD3B1' // qupu-peach
const BRAND_BLUE = '#30598A' // qupu-brand-blue (price + banner)
const BRAND_BLUE_SHADOW = '#263B55' // qupu-brand-blue-shadow (banner flap)
const BRAND_YELLOW = '#ffdd55' // qupu-brand-yellow (wallet)
const CREAM = '#FFF2DF' // banner text
const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const ROSE = '#e11d48'
const MUTED = '#9aa3b2'

// One animated ticket card, mirroring the static figure: cream body, orange
// outline, perforation line + notches, price in brand-blue, a little ticket
// glyph on the stub. Lights up (and recolors) when it is part of the pair.
function TicketCard({
  value,
  state,
}: {
  value: number
  /** idle = not in pair, try = in an over-budget pair, fit = pair fits, win = the winner */
  state: 'idle' | 'try' | 'fit' | 'win'
}) {
  const active = state !== 'idle'
  const accent = state === 'try' ? ROSE : state === 'idle' ? TICKET_STROKE : GREEN
  const bg = state === 'try' ? '#FFF1F2' : state === 'idle' ? TICKET_BODY : '#ECFDF5'
  const priceColor = state === 'try' ? ROSE : state === 'idle' ? BRAND_BLUE : GREEN_INK

  const w = 96
  const h = 60
  const notchX = w * 0.66

  return (
    <motion.div
      animate={{
        scale: active ? 1.06 : 1,
        y: active ? -3 : 0,
        filter: !active && state === 'idle' ? 'saturate(0.92)' : 'saturate(1)',
      }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      style={{ width: w, height: h }}
    >
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="presentation">
        <rect
          x={2}
          y={2}
          width={w - 4}
          height={h - 4}
          rx={12}
          fill={bg}
          stroke={accent}
          strokeWidth={2.5}
        />
        {/* perforation line splitting stub from ticket */}
        <line x1={notchX} y1={8} x2={notchX} y2={h - 8} stroke={accent} strokeWidth={2} strokeDasharray="3 3" />
        {/* notch cut-outs top and bottom */}
        <circle cx={notchX} cy={2} r={4.5} fill={SHELL} stroke={accent} strokeWidth={2} />
        <circle cx={notchX} cy={h - 2} r={4.5} fill={SHELL} stroke={accent} strokeWidth={2} />
        {/* price on the main panel */}
        <text
          x={notchX / 2 + 1}
          y={h / 2 + 7}
          textAnchor="middle"
          fontSize="20"
          fontWeight="800"
          fontFamily="Fredoka, sans-serif"
          fill={priceColor}
        >
          {`$${value}`}
        </text>
        {/* little ticket glyph on the stub side */}
        <g transform={`translate(${notchX + (w - notchX) / 2 - 8}, ${h / 2 - 11})`}>
          <rect x={0} y={0} width={16} height={22} rx={3} fill={PEACH} stroke={accent} strokeWidth={1.5} />
          <line x1={3.5} y1={6} x2={12.5} y2={6} stroke={accent} strokeWidth={1.5} />
          <line x1={3.5} y1={11} x2={12.5} y2={11} stroke={accent} strokeWidth={1.5} />
          <line x1={3.5} y1={16} x2={9.5} y2={16} stroke={accent} strokeWidth={1.5} />
        </g>
      </svg>
    </motion.div>
  )
}

// The budget meter: a track the width of the budget, filling with the current
// pair's sum. Green while it fits, rose with an overflow tail when it busts.
function BudgetMeter({
  budget,
  sum,
  fits,
  win,
}: {
  budget: number
  sum: number | null
  fits: boolean | null
  win: boolean
}) {
  const has = sum !== null
  const ratio = has ? Math.min(1, (sum as number) / budget) : 0
  const over = has && (sum as number) > budget
  // overflow tail length, capped so a wild bust still reads on the track
  const overRatio = over ? Math.min(0.35, ((sum as number) - budget) / budget) : 0
  const fill = win || fits ? GREEN : over ? ROSE : MUTED

  return (
    <div className="w-full max-w-[18.75rem]">
      <div className="mb-1 flex items-center justify-between font-display text-[0.6875rem] font-extrabold" style={{ color: BRAND_BLUE }}>
        <span>$0</span>
        <span>{`Budget $${budget}`}</span>
      </div>
      <div className="relative h-7 w-full">
        {/* track */}
        <div className="absolute inset-0 overflow-hidden rounded-full" style={{ background: SHELL, border: `2px solid ${PEACH}` }} />
        {/* fill up to sum (clamped to budget) */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-l-full"
          style={{ background: fill, borderRadius: ratio >= 1 ? 0 : undefined }}
          initial={false}
          animate={{ width: `${ratio * 100}%`, background: fill }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        {/* overflow tail bursting past the budget line when over budget */}
        {over && (
          <motion.div
            className="absolute inset-y-0 rounded-r-full"
            style={{ left: '100%', background: ROSE, opacity: 0.55 }}
            initial={{ width: 0 }}
            animate={{ width: `${overRatio * 100}%` }}
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          />
        )}
        {/* budget cap line */}
        <div className="absolute inset-y-0 right-0 w-[0.1875rem] rounded-full" style={{ background: BRAND_BLUE }} />
      </div>
    </div>
  )
}

// Small drawn verdict badge — check when the pair fits, cross when it busts.
function Verdict({ fits }: { fits: boolean }) {
  const color = fits ? GREEN : ROSE
  return (
    <motion.span
      key={fits ? 'ok' : 'no'}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className="ml-1 inline-flex"
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width={24} height={24}>
        <circle cx={12} cy={12} r={11} fill={fits ? '#ECFDF5' : '#FFF1F2'} stroke={color} strokeWidth={2} />
        {fits ? (
          <path d="M7 12.5 L10.5 16 L17 8.5" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M8 8 L16 16 M16 8 L8 16" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
        )}
      </svg>
    </motion.span>
  )
}

export default function BudgetSelectionExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const p = params as { prices: number[]; budget: number }
  const story = useMemo(
    () => buildBudgetSteps(p.prices, p.budget, lang),
    [p.prices, p.budget, lang],
  )
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]
  const { prices, budget } = story

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  // Per-ticket visual state for the current beat.
  const ticketState = (price: number): 'idle' | 'try' | 'fit' | 'win' => {
    if (!beat.pair) return 'idle'
    const inPair = beat.pair[0] === price || beat.pair[1] === price
    if (!inPair) return 'idle'
    if (beat.result) return 'win'
    return beat.fits ? 'fit' : 'try'
  }

  const ariaLabel = T(
    `Strategy: buy two different tickets and spend the most you can within ${budget}. The best pair totals ${story.answer}.`,
    `Strategi: beli dua tiket berbeda dan belanjakan sebanyak mungkin dalam ${budget}. Pasangan terbaik berjumlah ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* budget banner — wallet + amount, echoing the static figure */}
        <div
          className="relative flex w-full max-w-[18.75rem] items-center gap-2 overflow-hidden rounded-xl px-3 py-2"
          style={{ background: BRAND_BLUE }}
        >
          {/* wallet flap accent */}
          <div className="absolute inset-x-0 top-0 h-3 rounded-t-xl" style={{ background: BRAND_BLUE_SHADOW }} />
          {/* drawn wallet glyph */}
          <svg viewBox="0 0 30 26" width={30} height={26} className="relative shrink-0" role="presentation">
            <rect x={1} y={4} width={26} height={20} rx={4} fill={BRAND_YELLOW} stroke={SHELL} strokeWidth={1.5} />
            <rect x={17} y={10} width={12} height={8} rx={2} fill={PEACH} stroke={SHELL} strokeWidth={1.5} />
            <circle cx={23} cy={14} r={1.6} fill={BRAND_BLUE} />
          </svg>
          <span className="relative font-display text-base font-extrabold" style={{ color: CREAM }}>
            {T(`Budget: $${budget}`, `Anggaran: $${budget}`)}
          </span>
        </div>

        {/* four price tickets in a 2x2 grid, matching the static layout */}
        <div className="grid grid-cols-2 place-items-center gap-x-4 gap-y-3">
          {prices.map((price, i) => (
            <TicketCard key={i} value={price} state={ticketState(price)} />
          ))}
        </div>

        {/* running pair sum + verdict */}
        <div className="flex min-h-[2.5rem] items-center justify-center">
          {beat.pair ? (
            <motion.div
              key={`${beat.pair[0]}-${beat.pair[1]}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center font-display text-2xl font-black tabular-nums"
            >
              <span style={{ color: BRAND_BLUE }}>${beat.pair[0]}</span>
              <span style={{ color: MUTED }}> + </span>
              <span style={{ color: BRAND_BLUE }}>${beat.pair[1]}</span>
              <span style={{ color: MUTED }}> = </span>
              <span style={{ color: beat.fits ? GREEN_INK : ROSE }}>${beat.sum}</span>
              <Verdict fits={!!beat.fits} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display text-base font-extrabold"
              style={{ color: BRAND_BLUE }}
            >
              {T('Try the priciest pairs first', 'Coba pasangan termahal dulu')}
            </motion.div>
          )}
        </div>

        {/* budget meter: sum vs budget */}
        <BudgetMeter budget={budget} sum={beat.sum} fits={beat.fits} win={beat.result} />

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
