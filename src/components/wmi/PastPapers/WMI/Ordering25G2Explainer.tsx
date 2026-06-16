import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import {
  EXPRESSIONS_25G2Q15,
  SLOT_COUNT,
  SMILEY_SLOT_INDEX,
} from './Ordering25G2Illustration'

// ---------------------------------------------------------------------------
// Colour tokens mirroring the static illustration
// ---------------------------------------------------------------------------
const INK = '#1F2937'
const SLOT_FILL = '#FFFFFF'
const SLOT_STROKE = INK
const SMILEY_YELLOW = '#F5C518'
const SMILEY_STROKE = '#B8860B'
const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = '#10B981'
const GREEN_TEXT = '#065F46'
const HIGHLIGHT = '#FEF3C7'
const HIGHLIGHT_BORDER = '#D97706'
const DIM = 0.25

// ---------------------------------------------------------------------------
// Derived data — pure, no randomness
// ---------------------------------------------------------------------------

// Build the sorted ranking (largest first) from EXPRESSIONS_25G2Q15.
// We do this at module scope so it is computed once and is deterministic.
const RANKED = [...EXPRESSIONS_25G2Q15].sort((a, b) => b.value - a.value)
// The answer is whichever expression lands in SMILEY_SLOT_INDEX.
const ANSWER_LABEL = RANKED[SMILEY_SLOT_INDEX].label // "B"

// ---------------------------------------------------------------------------
// SVG layout (mirroring Ordering25G2Illustration)
// ---------------------------------------------------------------------------
const SLOT_W = 46
const SLOT_H = 28
const GAP_BETWEEN = 18
const SMILEY_R = 13
const SMILEY_GAP = 8
const SIDE_PAD = 16
const TOP_PAD = 14

const totalSlotSpan = SLOT_COUNT * SLOT_W + (SLOT_COUNT - 1) * GAP_BETWEEN
const SVG_W = SIDE_PAD * 2 + totalSlotSpan
const SMILEY_CY = TOP_PAD + SMILEY_R
const SLOT_Y = SMILEY_CY + SMILEY_R + SMILEY_GAP
const SVG_H = SLOT_Y + SLOT_H + 14

function slotCX(i: number): number {
  return SIDE_PAD + i * (SLOT_W + GAP_BETWEEN) + SLOT_W / 2
}
function slotX(i: number): number {
  return SIDE_PAD + i * (SLOT_W + GAP_BETWEEN)
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SmileGlyph({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const eyeOffX = r * 0.32
  const eyeOffY = r * 0.22
  const eyeR = r * 0.12
  const smileRad = r * 0.42
  const smileY = cy + r * 0.14
  const sx = cx - smileRad
  const sy = smileY
  const ex = cx + smileRad
  const ey = smileY
  const sweepR = smileRad * 1.05
  const d = `M ${sx} ${sy} A ${sweepR} ${sweepR} 0 0 1 ${ex} ${ey}`
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={SMILEY_YELLOW} stroke={SMILEY_STROKE} strokeWidth={r * 0.12} />
      <circle cx={cx - eyeOffX} cy={cy - eyeOffY} r={eyeR} fill={INK} />
      <circle cx={cx + eyeOffX} cy={cy - eyeOffY} r={eyeR} fill={INK} />
      <path d={d} fill="none" stroke={INK} strokeWidth={r * 0.13} strokeLinecap="round" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Beat definitions
// ---------------------------------------------------------------------------

type Phase = 'compute' | 'rank' | 'answer'

interface Beat {
  phase: Phase
  /** Which expression index (in EXPRESSIONS array) is currently being highlighted */
  activeExprIdx: number | null
  /** How many expressions have been computed so far (shown in a mini table) */
  computedCount: number
  /** How many ranked slots are filled (0 = none, 5 = all) */
  rankedCount: number
  /** Whether to flash the smiley slot as the answer */
  showAnswer: boolean
  hold: number
  caption: string
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Ordering25G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo<Beat[]>(() => {
    const beats: Beat[] = []

    // Beat 0: intro
    beats.push({
      phase: 'compute',
      activeExprIdx: null,
      computedCount: 0,
      rankedCount: 0,
      showAnswer: false,
      hold: 2200,
      caption: t(
        'Compute each expression first — then sort largest to smallest!',
        'Hitung setiap ekspresi dulu — lalu urutkan dari terbesar ke terkecil!',
      ),
    })

    // Beats 1–5: compute each expression one by one
    for (let i = 0; i < EXPRESSIONS_25G2Q15.length; i++) {
      const expr = EXPRESSIONS_25G2Q15[i]
      beats.push({
        phase: 'compute',
        activeExprIdx: i,
        computedCount: i + 1,
        rankedCount: 0,
        showAnswer: false,
        hold: 2000,
        caption: t(
          `${expr.label}: ${expr.expr} = ${expr.value}`,
          `${expr.label}: ${expr.expr} = ${expr.value}`,
        ),
      })
    }

    // Beats 6–10: fill ranking slots one by one (largest first)
    for (let r = 0; r < RANKED.length; r++) {
      const ranked = RANKED[r]
      beats.push({
        phase: 'rank',
        activeExprIdx: null,
        computedCount: EXPRESSIONS_25G2Q15.length,
        rankedCount: r + 1,
        showAnswer: false,
        hold: r === SMILEY_SLOT_INDEX ? 2200 : 1800,
        caption:
          r === SMILEY_SLOT_INDEX
            ? t(
                `Rank ${r + 1}: ${ranked.label} (${ranked.value}) — this is the smiley slot!`,
                `Urutan ke-${r + 1}: ${ranked.label} (${ranked.value}) — ini slot wajah senyum!`,
              )
            : t(
                `Rank ${r + 1}: ${ranked.label} = ${ranked.value}`,
                `Urutan ke-${r + 1}: ${ranked.label} = ${ranked.value}`,
              ),
      })
    }

    // Final beat: answer
    beats.push({
      phase: 'answer',
      activeExprIdx: null,
      computedCount: EXPRESSIONS_25G2Q15.length,
      rankedCount: RANKED.length,
      showAnswer: true,
      hold: 0,
      caption: t(
        `The 2nd-largest is ${ANSWER_LABEL} (${RANKED[SMILEY_SLOT_INDEX].expr} = ${RANKED[SMILEY_SLOT_INDEX].value}) — answer ${ANSWER_LABEL}!`,
        `Terbesar ke-2 adalah ${ANSWER_LABEL} (${RANKED[SMILEY_SLOT_INDEX].expr} = ${RANKED[SMILEY_SLOT_INDEX].value}) — jawaban ${ANSWER_LABEL}!`,
      ),
    })

    return beats
  }, [lang])

  const finalIndex = steps.length - 1
  const index = useBeatControl(finalIndex, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[finalIndex]

  // Build the mini computation table rows visible so far
  const visibleExprs = EXPRESSIONS_25G2Q15.slice(0, beat.computedCount)

  // Which slots in the ranked row are filled
  const filledRanked = RANKED.slice(0, beat.rankedCount)

  const isAnswerBeat = beat.showAnswer

  return (
    <div
      className="mx-auto w-full max-w-[480px]"
      role="img"
      aria-label={t(
        `Ordering expressions largest to smallest. The 2nd-largest is answer ${ANSWER_LABEL}.`,
        `Mengurutkan ekspresi dari terbesar ke terkecil. Terbesar ke-2 adalah jawaban ${ANSWER_LABEL}.`,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Main SVG: ordering slots */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: SVG_W * 1.5, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} rx={10} fill="#F0F7FF" />

          {/* Smiley above slot SMILEY_SLOT_INDEX */}
          <SmileGlyph cx={slotCX(SMILEY_SLOT_INDEX)} cy={SMILEY_CY} r={SMILEY_R} />

          {/* Five ordering slots */}
          {Array.from({ length: SLOT_COUNT }, (_, i) => {
            const x = slotX(i)
            const ranked = filledRanked[i]
            const isSmileySlot = i === SMILEY_SLOT_INDEX
            const isAnswerSlot = isSmileySlot && isAnswerBeat

            let fill = SLOT_FILL
            if (isAnswerSlot) fill = GREEN_BG
            else if (isSmileySlot && beat.rankedCount > SMILEY_SLOT_INDEX) fill = HIGHLIGHT

            let stroke = SLOT_STROKE
            if (isAnswerSlot) stroke = GREEN_BORDER
            else if (isSmileySlot && beat.rankedCount > SMILEY_SLOT_INDEX) stroke = HIGHLIGHT_BORDER

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={SLOT_Y}
                  width={SLOT_W}
                  height={SLOT_H}
                  rx={3}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isAnswerSlot ? 2.5 : 2}
                />
                {ranked && (
                  <text
                    x={x + SLOT_W / 2}
                    y={SLOT_Y + SLOT_H / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight={700}
                    fill={isAnswerSlot ? GREEN_TEXT : INK}
                  >
                    {ranked.label}={ranked.value}
                  </text>
                )}
              </g>
            )
          })}

          {/* ">" separators */}
          {Array.from({ length: SLOT_COUNT - 1 }, (_, i) => {
            const gx = SIDE_PAD + (i + 1) * SLOT_W + i * GAP_BETWEEN + GAP_BETWEEN / 2
            const gy = SLOT_Y + SLOT_H / 2
            return (
              <text
                key={i}
                x={gx}
                y={gy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
                fontWeight={700}
                fill={INK}
              >
                {'>'}
              </text>
            )
          })}
        </svg>

        {/* Computation table */}
        {beat.phase !== 'rank' && beat.phase !== 'answer' && visibleExprs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {visibleExprs.map((expr, i) => {
              const isActive = beat.activeExprIdx === i
              return (
                <div
                  key={expr.label}
                  className="rounded-lg border-2 px-3 py-1 font-display text-sm font-bold"
                  style={
                    isActive
                      ? { background: HIGHLIGHT, borderColor: HIGHLIGHT_BORDER, color: INK }
                      : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
                  }
                >
                  {expr.label}: {expr.expr} = {expr.value}
                </div>
              )
            })}
          </div>
        )}

        {/* Ranked table (visible during rank + answer phases) */}
        {(beat.phase === 'rank' || beat.phase === 'answer') && (
          <div className="flex flex-wrap justify-center gap-2">
            {EXPRESSIONS_25G2Q15.map((expr) => {
              const rankPos = RANKED.findIndex((r) => r.label === expr.label)
              const isVisible = rankPos < beat.rankedCount
              const isSmileyExpr = rankPos === SMILEY_SLOT_INDEX
              const isWinner = isAnswerBeat && isSmileyExpr
              return (
                <div
                  key={expr.label}
                  className="rounded-lg border-2 px-3 py-1 font-display text-sm font-bold"
                  style={
                    !isVisible
                      ? { background: '#F3F4F6', borderColor: '#D1D5DB', color: '#9CA3AF', opacity: DIM }
                      : isWinner
                        ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
                        : isSmileyExpr
                          ? { background: HIGHLIGHT, borderColor: HIGHLIGHT_BORDER, color: INK }
                          : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
                  }
                >
                  #{rankPos + 1} {expr.label}: {expr.value}
                </div>
              )
            })}
          </div>
        )}

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            isAnswerBeat
              ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
              : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
