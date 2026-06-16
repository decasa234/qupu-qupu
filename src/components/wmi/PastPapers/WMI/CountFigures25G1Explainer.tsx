import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FigureGlyph, type FigureKind } from './CountFigures25G1Illustration'
import {
  buildCountFiguresSteps,
  FIGURE_COUNTS,
  type OptionLabel,
} from './countFigures25G1Steps'

// Post-answer explainer for WMI-25F1A-Q14 (2025 Grade 1 Final, Paper A).
//
// Teaches the method: tally each kind of flower, then check every option's pair
// for an EQUAL count. Reuses FigureGlyph + OPTION_PAIRS so the animation reads as
// the same scene coming alive. Deterministic + SSR-safe: every beat renders an
// <svg>, no random/date/state.

const GREEN = '#10B981'
const GREEN_DEEP = '#065F46'
const GREEN_BG = '#D1FAE5'
const BLUE = '#30598A'
const BLUE_BG = '#E1EFFB'
const RED = '#DC2626'

// Tally order (matches the storyboard); a stable column layout for the board.
const TALLY_ORDER: FigureKind[] = ['rose', 'cosmos', 'blue', 'tulip', 'xflower']

export default function CountFigures25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildCountFiguresSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: tally each kind of flower, then check each pair for an equal count. Rose 12 and cosmos 12 match, so the answer is ${story.answer}.`,
    `Penjelasan: hitung tiap jenis bunga, lalu cek setiap pasangan apakah jumlahnya sama. Mawar 12 dan kosmos 12 sama, jadi jawabannya ${story.answer}.`,
  )

  // --- tally board geometry -------------------------------------------------
  const cols = TALLY_ORDER.length
  const cellW = 64
  const boardW = cols * cellW
  const boardH = 92
  const glyphR = 15

  // --- pair-check geometry --------------------------------------------------
  const checking = beat.phase === 'check' || beat.phase === 'result'
  const pair = beat.pair

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Tally board: one glyph per kind with its running count. */}
        <svg
          viewBox={`0 0 ${boardW} ${boardH}`}
          width="100%"
          style={{ maxWidth: boardW, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={boardW} height={boardH} rx={12} fill="#FBF1F6" />
          {TALLY_ORDER.map((kind, i) => {
            const known = beat.tallied.includes(kind)
            const active = beat.kind === kind
            const inPair = checking && pair != null && (pair[0] === kind || pair[1] === kind)
            const cx = i * cellW + cellW / 2
            const dim = checking && !inPair ? 0.32 : known ? 1 : 0.28
            return (
              <g key={kind} opacity={dim}>
                {(active || (inPair && beat.equal)) && (
                  <rect
                    x={cx - cellW / 2 + 4}
                    y={4}
                    width={cellW - 8}
                    height={boardH - 8}
                    rx={9}
                    fill="none"
                    stroke={inPair && beat.equal ? GREEN : '#D6256E'}
                    strokeWidth={2.5}
                    strokeDasharray={active ? '6 4' : undefined}
                  />
                )}
                <FigureGlyph kind={kind} cx={cx} cy={34} s={glyphR} />
                <text
                  x={cx}
                  y={74}
                  textAnchor="middle"
                  fontSize={18}
                  fontWeight={800}
                  fill={inPair && beat.equal ? GREEN_DEEP : known ? '#9E1A50' : '#C9A9BA'}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {known ? FIGURE_COUNTS[kind] : '?'}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Pair-check panel: the two figures, their counts, =/≠, and a verdict. */}
        {checking && pair != null ? (
          <PairCheck label={beat.option as OptionLabel} pair={pair} equal={beat.equal} t={t} />
        ) : (
          <div className="h-[2px] w-full" aria-hidden="true" />
        )}

        {/* Caption box. */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_DEEP }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}

function PairCheck({
  label,
  pair,
  equal,
  t,
}: {
  label: OptionLabel
  pair: [FigureKind, FigureKind]
  equal: boolean
  t: (en: string, id: string) => string
}) {
  const a = FIGURE_COUNTS[pair[0]]
  const b = FIGURE_COUNTS[pair[1]]
  const accent = equal ? GREEN : RED

  const w = 240
  const h = 78
  const s = 17
  const cyG = 30
  const leftX = 44
  const rightX = w - 44

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ maxWidth: w, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* option chip */}
      <rect x={0} y={0} width={w} height={h} rx={12} fill="#FFFFFF" stroke={accent} strokeWidth={2} />
      <text x={w / 2} y={20} textAnchor="middle" fontSize={13} fontWeight={800} fill={accent}>
        {label}
      </text>

      {/* left figure + count */}
      <FigureGlyph kind={pair[0]} cx={leftX} cy={cyG + 16} s={s} />
      <text x={leftX} y={h - 6} textAnchor="middle" fontSize={20} fontWeight={900} fill={accent}
        style={{ fontVariantNumeric: 'tabular-nums' }}>
        {a}
      </text>

      {/* equals / not-equals sign — pops in */}
      <motion.g
        key={`${label}-${equal}`}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        style={{ transformOrigin: `${w / 2}px ${cyG + 20}px` }}
      >
        <text x={w / 2} y={cyG + 24} textAnchor="middle" fontSize={30} fontWeight={900} fill={accent}>
          {equal ? '=' : '≠'}
        </text>
        <text x={w / 2} y={h - 8} textAnchor="middle" fontSize={13} fontWeight={800} fill={accent}>
          {equal ? t('equal ✓', 'sama ✓') : t('not equal ✗', 'beda ✗')}
        </text>
      </motion.g>

      {/* right figure + count */}
      <FigureGlyph kind={pair[1]} cx={rightX} cy={cyG + 16} s={s} />
      <text x={rightX} y={h - 6} textAnchor="middle" fontSize={20} fontWeight={900} fill={accent}
        style={{ fontVariantNumeric: 'tabular-nums' }}>
        {b}
      </text>
    </svg>
  )
}
