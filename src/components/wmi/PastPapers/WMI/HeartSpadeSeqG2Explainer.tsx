import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// WMI-20F2A-Q12 — 765, ♥, ◆, 729, ♠, 705
// Six terms decrease by a constant step of −12.
// Deduce: 765→729 spans 3 gaps → step = (765−729)/3 = 12.
// ♥ = 765−12 = 753, ◆ = 741, ♠ = 729−12 = 717.
// ♥ − ♠ = 753 − 717 = 36 → answer B.

// Colour tokens matching the static illustration
const HEART_COLOR = '#F08080'
const DIAMOND_COLOR = '#19A7CE'
const SPADE_COLOR = '#9B7EBD'
const INK = '#1F2937'
const BG = '#F0F6FF'
const CARD_STROKE = '#CBD5E1'
const ARC_COLOR = '#D97706'
const GREEN = '#10B981'

interface Beat {
  // which symbol values are revealed (null = hidden glyph)
  heartVal: number | null
  diamondVal: number | null
  spadeVal: number | null
  // which arcs to draw (between indices 0..5)
  arcs: number[] // arc from index i to i+1
  stepLabel: boolean // show −12 labels on arcs
  showGap: boolean // show the 765→729 = 3×12 annotation
  result: boolean
  hold: number
  caption: string
}

// Card positions: 6 cards evenly spaced in a 400-wide viewBox
const CARD_W = 50
const CARD_H = 44
const GAP = 16
const START_X = 13
const CARD_Y = 18
const CX = (i: number) => START_X + i * (CARD_W + GAP) + CARD_W / 2 // centre x of card i

export default function HeartSpadeSeqG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo((): Beat[] => {
    return [
      // Beat 0 — intro: show the six cards, find the constant step
      {
        heartVal: null,
        diamondVal: null,
        spadeVal: null,
        arcs: [],
        stepLabel: false,
        showGap: false,
        result: false,
        hold: 2600,
        caption: t(
          'The numbers go DOWN by the same amount each step. Can we find the step?',
          'Angka-angkanya TURUN dengan jumlah yang sama setiap langkah. Bisa kita temukan stepnya?',
        ),
      },
      // Beat 1 — span: 765 to 729 is 3 gaps, so step = 36/3 = 12
      {
        heartVal: null,
        diamondVal: null,
        spadeVal: null,
        arcs: [],
        stepLabel: false,
        showGap: true,
        result: false,
        hold: 2600,
        caption: t(
          '765 to 729 skips 3 gaps: 765 − 729 = 36, and 36 ÷ 3 = 12. Each step is −12!',
          '765 ke 729 melewati 3 langkah: 765 − 729 = 36, dan 36 ÷ 3 = 12. Setiap langkah −12!',
        ),
      },
      // Beat 2 — reveal ♥ and ◆
      {
        heartVal: 753,
        diamondVal: 741,
        spadeVal: null,
        arcs: [0, 1, 2],
        stepLabel: true,
        showGap: false,
        result: false,
        hold: 2200,
        caption: t(
          '♥ = 765 − 12 = 753. ◆ = 753 − 12 = 741.',
          '♥ = 765 − 12 = 753. ◆ = 753 − 12 = 741.',
        ),
      },
      // Beat 3 — reveal ♠
      {
        heartVal: 753,
        diamondVal: 741,
        spadeVal: 717,
        arcs: [0, 1, 2, 3, 4],
        stepLabel: true,
        showGap: false,
        result: false,
        hold: 2200,
        caption: t(
          '♠ = 729 − 12 = 717. Check: 717 − 12 = 705 ✓',
          '♠ = 729 − 12 = 717. Cek: 717 − 12 = 705 ✓',
        ),
      },
      // Beat 4 — final answer
      {
        heartVal: 753,
        diamondVal: 741,
        spadeVal: 717,
        arcs: [0, 1, 2, 3, 4],
        stepLabel: true,
        showGap: false,
        result: true,
        hold: 0,
        caption: t(
          '♥ − ♠ = 753 − 717 = 36 → Answer B',
          '♥ − ♠ = 753 − 717 = 36 → Jawaban B',
        ),
      },
    ]
  }, [lang])

  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  // The six sequence items with their display info
  type Item = { glyph: string; numVal: number | null; color: string }
  const items: Item[] = [
    { glyph: '765', numVal: 765, color: INK },
    { glyph: '♥', numVal: beat.heartVal, color: HEART_COLOR },
    { glyph: '◆', numVal: beat.diamondVal, color: DIAMOND_COLOR },
    { glyph: '729', numVal: 729, color: INK },
    { glyph: '♠', numVal: beat.spadeVal, color: SPADE_COLOR },
    { glyph: '705', numVal: 705, color: INK },
  ]

  const SVG_W = 400
  const SVG_H = beat.showGap ? 130 : 110

  // Arc path from centre of card i to centre of card i+1, curving upward
  function arcPath(i: number) {
    const x1 = CX(i)
    const x2 = CX(i + 1)
    const y = CARD_Y - 4
    const mx = (x1 + x2) / 2
    const my = y - 18
    return `M ${x1} ${y} Q ${mx} ${my} ${x2} ${y}`
  }

  // For the gap annotation: bracket from card 0 to card 3
  const gapX1 = CX(0)
  const gapX2 = CX(3)
  const gapY = CARD_Y + CARD_H + 18

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={t(
        'Number pattern: each term decreases by 12. Heart equals 753, spade equals 717, so heart minus spade equals 36, answer B.',
        'Pola angka: setiap suku berkurang 12. Hati sama dengan 753, sekop sama dengan 717, jadi hati dikurangi sekop sama dengan 36, jawaban B.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Background */}
          <rect x={0} y={0} width={SVG_W} height={SVG_H} rx={10} fill={BG} />

          {/* Step arcs */}
          {beat.arcs.map((i) => (
            <g key={`arc-${i}`}>
              <path
                d={arcPath(i)}
                fill="none"
                stroke={ARC_COLOR}
                strokeWidth={2}
                strokeDasharray="5 3"
              />
              {beat.stepLabel && (
                <text
                  x={(CX(i) + CX(i + 1)) / 2}
                  y={CARD_Y - 22}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={10}
                  fontWeight={700}
                  fill={ARC_COLOR}
                >
                  −12
                </text>
              )}
            </g>
          ))}

          {/* Gap span annotation: 765 to 729 = 3×12 */}
          {beat.showGap && (
            <g>
              {/* bracket line */}
              <line x1={gapX1} y1={gapY - 6} x2={gapX1} y2={gapY} stroke={ARC_COLOR} strokeWidth={2} />
              <line x1={gapX1} y1={gapY} x2={gapX2} y2={gapY} stroke={ARC_COLOR} strokeWidth={2} />
              <line x1={gapX2} y1={gapY - 6} x2={gapX2} y2={gapY} stroke={ARC_COLOR} strokeWidth={2} />
              <text
                x={(gapX1 + gapX2) / 2}
                y={gapY + 14}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={700}
                fill={ARC_COLOR}
              >
                {t('3 gaps → 36 ÷ 3 = 12', '3 langkah → 36 ÷ 3 = 12')}
              </text>
            </g>
          )}

          {/* Cards */}
          {items.map((item, i) => {
            const cx = CX(i)
            const x = cx - CARD_W / 2
            // Highlight revealed symbol cards with a warm stroke on the beat they appear
            const isRevealed = item.numVal !== null && item.glyph !== String(item.numVal)
            const cardStroke = isRevealed ? item.color : CARD_STROKE
            const cardStrokeW = isRevealed ? 2.5 : 1.5

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={CARD_Y}
                  width={CARD_W}
                  height={CARD_H}
                  rx={8}
                  fill="white"
                  stroke={cardStroke}
                  strokeWidth={cardStrokeW}
                />
                {/* Main glyph (symbol or known number) */}
                <text
                  x={cx}
                  y={item.numVal !== null && item.glyph !== String(item.numVal) ? CARD_Y + CARD_H * 0.45 : CARD_Y + CARD_H / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={item.glyph.length > 1 ? 17 : 22}
                  fontWeight={900}
                  fill={item.color}
                >
                  {item.glyph}
                </text>
                {/* Revealed numeric value shown above the card */}
                {item.numVal !== null && item.glyph !== String(item.numVal) && (
                  <text
                    x={cx}
                    y={CARD_Y - 6}
                    textAnchor="middle"
                    dominantBaseline="auto"
                    fontSize={13}
                    fontWeight={800}
                    fill={item.color}
                  >
                    {item.numVal}
                  </text>
                )}
              </g>
            )
          })}

          {/* Final beat: highlight ♥ and ♠ with a subtraction line */}
          {beat.result && (
            <g>
              {/* underline ♥ card */}
              <rect
                x={CX(1) - CARD_W / 2 - 2}
                y={CARD_Y - 2}
                width={CARD_W + 4}
                height={CARD_H + 4}
                rx={9}
                fill="none"
                stroke={HEART_COLOR}
                strokeWidth={2.5}
              />
              {/* underline ♠ card */}
              <rect
                x={CX(4) - CARD_W / 2 - 2}
                y={CARD_Y - 2}
                width={CARD_W + 4}
                height={CARD_H + 4}
                rx={9}
                fill="none"
                stroke={SPADE_COLOR}
                strokeWidth={2.5}
              />
              {/* equation */}
              <text
                x={SVG_W / 2}
                y={CARD_Y + CARD_H + 22}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={16}
                fontWeight={900}
                fill={GREEN}
              >
                753 − 717 = 36
              </text>
            </g>
          )}
        </svg>

        {/* Caption box */}
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
