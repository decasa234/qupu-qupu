import { useMemo, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BalanceScale, WeightBlock } from '../../PastPapers/WMI/primitives/BalanceScale'
import type { ExplainerProps } from './registry'
import { buildSubsetSumTargetSteps, deltaText, type SubsetBeat } from './subsetSumTargetSteps'
import { useBeatControl } from './useBeatControl'

// Warm brand palette — literal hex so the figure reads the same on any surface.
const BLUE = '#30598A'
const BLUE_SOFT = '#E1EFFB'
const GREEN = '#58A700'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F'
const ROSE_SOFT = '#FBE9E8'
const AMBER = '#E0A000'
const AMBER_SOFT = '#FFF3D4'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const MUTED = '#8B94A3'
const MUTED_SOFT = '#F2F4F7'

/** One number card / weight block in the pool strip. */
function Card({ value, lit, tone, unit, still }: {
  value: number
  lit: boolean
  tone: 'neutral' | 'wrong' | 'right'
  unit: string
  still: boolean
}) {
  const accent = !lit ? MUTED : tone === 'wrong' ? ROSE : tone === 'right' ? GREEN : BLUE
  const bg = !lit ? MUTED_SOFT : tone === 'wrong' ? ROSE_SOFT : tone === 'right' ? GREEN_SOFT : BLUE_SOFT
  return (
    <motion.span
      animate={still ? undefined : { scale: lit ? 1.06 : 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className="flex min-w-[2.25rem] items-center justify-center rounded-xl border-2 px-2 py-1.5 font-display text-[0.9375rem] font-black tabular-nums"
      style={{ background: bg, borderColor: accent, color: accent }}
    >
      {value}
      {unit}
    </motion.span>
  )
}

/** The dashed cut line that slides between two cards. */
function CutLine({ tone }: { tone: 'wrong' | 'right' }) {
  const color = tone === 'right' ? GREEN : ROSE
  return (
    <motion.span
      layoutId="sst-cut"
      transition={{ type: 'spring', stiffness: 340, damping: 30 }}
      className="mx-0.5 block self-stretch"
      style={{ width: 0, borderLeft: `3px dashed ${color}`, minHeight: '2.25rem' }}
    />
  )
}

/** Weight blocks spread across one pan of the balance. */
function PanBlocks({ kgs }: { kgs: number[] }) {
  const step = 50
  const start = -((kgs.length - 1) * step) / 2
  return (
    <>
      {kgs.map((kg, i) => (
        <g key={`${kg}-${i}`} transform={`translate(${start + i * step},0)`}>
          <WeightBlock kg={kg} />
        </g>
      ))}
    </>
  )
}

/** An empty right pan, before any block has been tried. */
function PanUnknown() {
  return (
    <g>
      <rect x={-22} y={-46} width={44} height={46} rx={7} fill="none" stroke={MUTED} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={0} y={-22} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={900} fill={MUTED}>
        ?
      </text>
    </g>
  )
}

function Cross({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 16" width={10} height={10} role="presentation">
      <path d="M3 3 L13 13 M13 3 L3 13" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    </svg>
  )
}

function Check({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 16" width={11} height={11} role="presentation">
      <path d="M3 8.5 L6.5 12 L13 4" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Small pill used for the target, the running sums and the verdicts. */
function Chip({ tone, children }: { tone: 'neutral' | 'wrong' | 'right' | 'target'; children: ReactNode }) {
  const map = {
    neutral: { bg: BLUE_SOFT, border: BLUE, ink: BLUE },
    wrong: { bg: ROSE_SOFT, border: ROSE, ink: ROSE },
    right: { bg: GREEN_SOFT, border: GREEN, ink: GREEN_INK },
    target: { bg: AMBER_SOFT, border: AMBER, ink: AMBER },
  }[tone]
  return (
    <span
      className="flex items-center gap-1 rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
      style={{ background: map.bg, borderColor: map.border, color: map.ink }}
    >
      {children}
    </span>
  )
}

export default function SubsetSumTargetExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const story = useMemo(() => buildSubsetSumTargetSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat: SubsetBeat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const still = !!reduce
  const scale = story.ask === 'balance-the-seesaw'
  const cutLine = story.ask === 'which-cut-line'
  const unit = scale ? ' kg' : ''

  const active = useMemo(() => new Set(beat.active), [beat])
  const chosen = useMemo(
    () => beat.active.map((i) => story.values[i]).filter((v) => typeof v === 'number'),
    [beat, story.values],
  )

  // The beam reads the numbers on screen: it only goes flat when the right pan
  // matches the left one exactly.
  const tilt: -1 | 0 | 1 =
    beat.optionSum == null ? 1 : beat.optionSum < story.target ? 1 : beat.optionSum > story.target ? -1 : 0

  const captionStyle =
    beat.tone === 'wrong'
      ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
      : beat.tone === 'right'
        ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
        : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel = cutLine
    ? T(
        `Strategy: slide a cut line along a row of number cards, reading the total on each side, until both sides match.`,
        `Strategi: geser garis potong di sepanjang deret kartu angka sambil membaca jumlah tiap sisi, sampai kedua sisi sama.`,
      )
    : T(
        `Strategy: add up each group of ${story.size} and compare it with ${story.target}; only the exact total counts.`,
        `Strategi: jumlahkan tiap kelompok berisi ${story.size} lalu bandingkan dengan ${story.target}; hanya jumlah yang persis yang benar.`,
      )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-2.5 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* What we are aiming at — on screen from the first beat to the last. */}
        <div className="flex min-h-[1.75rem] w-full flex-wrap items-center justify-center gap-2">
          <Chip tone="target">
            {cutLine
              ? T(`Each half ${story.half}`, `Tiap bagian ${story.half}`)
              : scale
                ? T(`Left pan ${story.target} kg`, `Piring kiri ${story.target} kg`)
                : T(`Target ${story.target}`, `Target ${story.target}`)}
          </Chip>
          {beat.optionLabel && beat.optionSum != null && (
            <Chip tone={beat.tone === 'right' ? 'right' : 'wrong'}>
              {beat.tone === 'right' ? <Check color={GREEN_INK} /> : <Cross color={ROSE} />}
              {beat.optionLabel} = {beat.optionSum}
              {unit} ({deltaText(beat.delta ?? 0, lang)})
            </Chip>
          )}
          {cutLine && beat.leftSum != null && beat.rightSum != null && (
            <Chip tone={beat.tone === 'right' ? 'right' : 'wrong'}>
              {beat.tone === 'right' ? <Check color={GREEN_INK} /> : <Cross color={ROSE} />}
              {T('Left', 'Kiri')} {beat.leftSum} · {T('Right', 'Kanan')} {beat.rightSum}
            </Chip>
          )}
        </div>

        {/* The balance only exists for the seesaw ask; the other two are a strip
            of cards, with a cut line sliding between them when there is one. */}
        {scale && (
          <div className="w-full">
            <BalanceScale
              tilt={tilt}
              panW={130}
              left={<WeightBlock kg={story.target} />}
              right={chosen.length > 0 ? <PanBlocks kgs={chosen} /> : <PanUnknown />}
            />
          </div>
        )}

        <div className="flex w-full flex-wrap items-stretch justify-center gap-1.5">
          {story.values.map((v, i) => (
            <span key={`slot-${i}`} className="flex items-stretch">
              {beat.cutAt === i && i > 0 && <CutLine tone={beat.tone === 'right' ? 'right' : 'wrong'} />}
              <Card
                value={v}
                unit={unit}
                lit={active.has(i)}
                tone={beat.tone}
                still={still}
              />
            </span>
          ))}
        </div>

        {/* The tempting stop, named so the child can see what they nearly did. */}
        <div className="flex min-h-[1.5rem] items-center justify-center">
          {beat.trap && beat.trapLabel && (
            <Chip tone="wrong">
              <Cross color={ROSE} />
              {beat.trapLabel}
            </Chip>
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
