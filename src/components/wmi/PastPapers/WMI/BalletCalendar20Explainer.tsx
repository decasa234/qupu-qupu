import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildBalletCalendar20Steps, MONDAYS, THURSDAYS } from './balletCalendar20Steps'
import type { BalletCalStep } from './balletCalendar20Steps'

const GREEN = '#10B981'
const ARROW = '#64748B'

interface BoxTone {
  border: string
  bg: string
  text: string
}

const SAT: BoxTone = { border: '#D97706', bg: '#FEF3C7', text: '#92400E' }
const NEUTRAL: BoxTone = { border: '#94A3B8', bg: '#F1F5F9', text: '#475569' }
const THU: BoxTone = { border: '#7C3AED', bg: '#EDE9FE', text: '#5B21B6' }
const MON: BoxTone = { border: '#2563EB', bg: '#DBEAFE', text: '#1E40AF' }
const STOP: BoxTone = { border: '#9CA3AF', bg: '#F3F4F6', text: '#6B7280' }

function DateBox(props: {
  x: number
  y: number
  w: number
  h: number
  label: string
  tone: BoxTone
  anchor?: boolean
  dashed?: boolean
  fontSize?: number
}) {
  const { x, y, w, h, label, tone, anchor, dashed, fontSize = 11 } = props
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={7}
        fill={tone.bg}
        stroke={tone.border}
        strokeWidth={anchor ? 2.5 : 1.5}
        strokeDasharray={dashed ? '4 3' : undefined}
      />
      <text
        x={x + w / 2}
        y={y + h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={700}
        fill={tone.text}
      >
        {label}
      </text>
    </g>
  )
}

function HopArrow(props: { x1: number; x2: number; y: number; label: string }) {
  const { x1, x2, y, label } = props
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - 4} y2={y} stroke={ARROW} strokeWidth={1.5} markerEnd="url(#bc20-arrow)" />
      <text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle" fontSize={9} fontWeight={700} fill={ARROW}>
        {label}
      </text>
    </g>
  )
}

function CountBadge(props: { x: number; y: number; count: number; label: string; tone: BoxTone }) {
  const { x, y, count, label, tone } = props
  return (
    <g>
      <rect x={x} y={y} width={40} height={32} rx={9} fill={tone.border} />
      <text x={x + 20} y={y + 14} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill="#FFFFFF">
        {count}
      </text>
      <text x={x + 20} y={y + 26} textAnchor="middle" fontSize={7} fontWeight={700} fill="#FFFFFF">
        {label}
      </text>
    </g>
  )
}

/** One walk row (anchor Sat → ±1 → ±1 → target day) plus its ±7 chain row. */
function ChainSection(props: {
  yWalk: number
  yChain: number
  walkLabels: [string, string, string]
  walkArrow: string
  /** Show the Sat 24 anchor box even before the walk appears. */
  showAnchor: boolean
  showWalk: boolean
  showChain: boolean
  showCount: boolean
  dates: number[]
  anchorDate: number
  stopLabel: string
  stopNote: string
  dayLabel: string
  tone: BoxTone
}) {
  const { yWalk, yChain, walkLabels, walkArrow, showAnchor, showWalk, showChain, showCount } = props
  const { dates, anchorDate, stopLabel, stopNote, dayLabel, tone } = props

  const walkW = 52
  const walkStep = 76
  const walkH = 28
  const chainW = 36
  const chainStep = 54
  const chainH = 30
  const stopX = 12 + dates.length * chainStep
  const tones: BoxTone[] = [SAT, NEUTRAL, tone]

  return (
    <g>
      {/* walk row: Sat anchor always shown; the two walk steps appear with showWalk */}
      {walkLabels.map((label, i) => {
        if (i === 0 ? !showAnchor : !showWalk) return null
        const x = 12 + i * walkStep
        return (
          <g key={label}>
            {i > 0 && <HopArrow x1={x - walkStep + walkW + 3} x2={x - 3} y={yWalk + walkH / 2} label={walkArrow} />}
            <DateBox x={x} y={yWalk} w={walkW} h={walkH} label={label} tone={tones[i]} anchor={i === 0 || i === 2} fontSize={10} />
          </g>
        )
      })}

      {/* ±7 chain row */}
      {showChain && (
        <g>
          {dates.map((d, i) => {
            const x = 12 + i * chainStep
            return (
              <g key={d}>
                {i > 0 && <HopArrow x1={x - chainStep + chainW + 3} x2={x - 3} y={yChain + chainH / 2} label="+7" />}
                <DateBox x={x} y={yChain} w={chainW} h={chainH} label={String(d)} tone={tone} anchor={d === anchorDate} />
              </g>
            )
          })}
          {/* grayed stop box: next hop overshoots October's 31 days */}
          <HopArrow x1={stopX - chainStep + chainW + 3} x2={stopX - 3} y={yChain + chainH / 2} label="+7" />
          <DateBox x={stopX} y={yChain} w={44} h={chainH} label={stopLabel} tone={STOP} dashed fontSize={10} />
          <text x={stopX + 22} y={yChain + chainH + 11} textAnchor="middle" fontSize={8} fontWeight={700} fill={STOP.text}>
            {stopNote}
          </text>
        </g>
      )}

      {showCount && <CountBadge x={332} y={yChain - 1} count={dates.length} label={dayLabel} tone={tone} />}
    </g>
  )
}

function ChainsDiagram({ beat, lang }: { beat: BalletCalStep; lang: 'en' | 'id' }) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const sat = t('Sat 24', 'Sab 24')

  return (
    <svg viewBox="0 0 384 262" className="w-full" aria-hidden="true">
      <defs>
        <marker id="bc20-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={ARROW} />
        </marker>
      </defs>

      {/* Thursday: walk back 2 days, then hop by 7s */}
      <ChainSection
        yWalk={14}
        yChain={62}
        walkLabels={[sat, t('Fri 23', 'Jum 23'), t('Thu 22', 'Kam 22')]}
        walkArrow="−1"
        showAnchor
        showWalk={beat.showThuWalk}
        showChain={beat.showThuChain}
        showCount={beat.showThuCount}
        dates={THURSDAYS}
        anchorDate={22}
        stopLabel="36 ✗"
        stopNote="> 31"
        dayLabel={t('Thu', 'Kam')}
        tone={THU}
      />

      {/* Monday: walk forward 2 days, then hop by 7s */}
      <ChainSection
        yWalk={128}
        yChain={176}
        walkLabels={[sat, t('Sun 25', 'Min 25'), t('Mon 26', 'Sen 26')]}
        walkArrow="+1"
        showAnchor={beat.showMonWalk}
        showWalk={beat.showMonWalk}
        showChain={beat.showMonChain}
        showCount={beat.showMonCount}
        dates={MONDAYS}
        anchorDate={26}
        stopLabel="33 ✗"
        stopNote="> 31"
        dayLabel={t('Mon', 'Sen')}
        tone={MON}
      />

      {/* final sum badge */}
      {beat.badge && (
        <g>
          <rect x={142} y={228} width={100} height={28} rx={9} fill="#D1FAE5" stroke={GREEN} strokeWidth={2} />
          <text x={192} y={242} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800} fill="#065F46">
            {beat.badge}
          </text>
        </g>
      )}
    </svg>
  )
}

export default function BalletCalendar20Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildBalletCalendar20Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: hari yang sama berulang setiap 7 hari. Dari Sabtu 24, mundur 2 hari ke Kamis 22 lalu loncat 7: Kamis jatuh pada ${THURSDAYS.join(', ')} (${story.thursdayCount} kelas). Maju 2 hari ke Senin 26 lalu loncat 7: Senin jatuh pada ${MONDAYS.join(', ')} (${story.mondayCount} kelas). Jadi ${story.thursdayCount} + ${story.mondayCount} = ${story.answer} kelas.`
      : `Explainer: the same weekday repeats every 7 days. From Saturday 24, walk back 2 days to Thursday 22 then hop by 7s: Thursdays fall on ${THURSDAYS.join(', ')} (${story.thursdayCount} classes). Walk forward 2 days to Monday 26 then hop by 7s: Mondays fall on ${MONDAYS.join(', ')} (${story.mondayCount} classes). So ${story.thursdayCount} + ${story.mondayCount} = ${story.answer} classes.`

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <ChainsDiagram beat={beat} lang={lang} />

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
