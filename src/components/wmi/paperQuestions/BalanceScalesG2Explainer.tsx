import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { Scale22, Glyph22 } from './puzzles20G2Illustrations'

// WMI-20F2A-Q22 — Five blocks weigh 2, 3, 3, 3, 5 g.
// Three scales tell us: (1) ▲+◼+⬡ = ●+★  (level)
//                       (2) ★+⬡ > ◼+●      (left heavier)
//                       (3) ▲+● > ◼+⬡      (right heavier)
// Deduction: total=16 → each side of scale 1 = 8 → {●,★}={3,5}
//   Scale 2: if ●=5 then ★=3, star side ≤ 3+3=6 < ◼+●≥2+5=7 ✗ → ●=3, ★=5
//   Scale 3: ▲+3 > 8−▲ → 2▲>5 → ▲=3
//   Answer: ▲+● = 3+3 = 6

const GREEN = '#10B981'
const GREEN_INK = '#065F46'
const BRAND_BLUE = '#30598A'
const ROSE = '#e11d48'

// Colour tokens matching Glyph22 fills
const COL: Record<string, string> = {
  '▲': '#F08080',
  '◼': '#9B8EC4',
  '⬡': '#7CB342',
  '●': '#2D9CDB',
  '★': '#F2994A',
}

type GlyphChar = '▲' | '◼' | '⬡' | '●' | '★'

interface Beat {
  /** Scale to highlight (0-2), or null for all */
  focus: 0 | 1 | 2 | null
  /** Known values to show as chips */
  known: Partial<Record<GlyphChar, number>>
  /** Red/rejected hypothetical (shown as chip with rose bg) */
  reject?: { glyph: GlyphChar; value: number }
  caption: string
  hold: number
  result: boolean
}

function buildSteps(lang: 'en' | 'id'): { steps: Beat[]; finalIndex: number } {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Beat[] = [
    {
      focus: null,
      known: {},
      hold: 2000,
      result: false,
      caption: t(
        'Five blocks weigh 2, 3, 3, 3 and 5 g — total = 16 g. Scale 1 is level, so each side = 16 ÷ 2 = 8 g.',
        'Lima balok beratnya 2, 3, 3, 3 dan 5 g — total = 16 g. Timbangan 1 seimbang, jadi tiap sisi = 16 ÷ 2 = 8 g.',
      ),
    },
    {
      focus: 0,
      known: {},
      hold: 2200,
      result: false,
      caption: t(
        '● + ★ = 8. From {2,3,3,3,5} the only pair that sums to 8 is 3 + 5. So {●, ★} = {3, 5}. But which one is 5?',
        '● + ★ = 8. Dari {2,3,3,3,5} satu-satunya pasangan yang berjumlah 8 adalah 3 + 5. Jadi {●, ★} = {3, 5}. Tapi mana yang 5?',
      ),
    },
    {
      focus: 1,
      known: {},
      reject: { glyph: '●', value: 5 },
      hold: 2400,
      result: false,
      caption: t(
        'Try ● = 5 → ★ = 3. Scale 2 says ★+⬡ is heavier, but ★+⬡ ≤ 3+3 = 6 while ◼+● ≥ 2+5 = 7. That tips the wrong way! ✗',
        'Coba ● = 5 → ★ = 3. Timbangan 2 bilang ★+⬡ lebih berat, tapi ★+⬡ ≤ 3+3 = 6 sedang ◼+● ≥ 2+5 = 7. Itu salah arah! ✗',
      ),
    },
    {
      focus: 1,
      known: { '●': 3, '★': 5 },
      hold: 2200,
      result: false,
      caption: t(
        'So ● = 3 and ★ = 5. Check: ★+⬡ side has 5+⬡ vs ◼+3. With ⬡ from {2,3,3} and ◼ from the rest, that works.',
        'Jadi ● = 3 dan ★ = 5. Cek: sisi ★+⬡ punya 5+⬡ vs ◼+3. Dengan ⬡ dari {2,3,3} dan ◼ sisanya, itu cocok.',
      ),
    },
    {
      focus: 2,
      known: { '●': 3, '★': 5, '▲': 3 },
      hold: 2200,
      result: false,
      caption: t(
        'Scale 3: ▲+● > ◼+⬡. Since ◼+⬡ = 8−▲, we get ▲+3 > 8−▲ → 2▲ > 5 → ▲ ≥ 3. The only available weight ≥ 3 for ▲ is 3. So ▲ = 3.',
        'Timbangan 3: ▲+● > ◼+⬡. Karena ◼+⬡ = 8−▲, kita dapat ▲+3 > 8−▲ → 2▲ > 5 → ▲ ≥ 3. Berat yang tersedia ≥ 3 untuk ▲ adalah 3. Jadi ▲ = 3.',
      ),
    },
    {
      focus: null,
      known: { '●': 3, '★': 5, '▲': 3 },
      hold: 0,
      result: true,
      caption: t('▲ + ● = 3 + 3 = 6 g.', '▲ + ● = 3 + 3 = 6 g.'),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}

// Small chip showing a glyph with its deduced value (plain div — SSR safe)
function ValueChip({
  glyph,
  value,
  rejected,
}: {
  glyph: GlyphChar
  value: number
  rejected?: boolean
}) {
  const bg = rejected ? '#FFF1F2' : '#ECFDF5'
  const border = rejected ? ROSE : GREEN
  const textCol = rejected ? ROSE : GREEN_INK
  return (
    <div
      className="flex items-center gap-1 rounded-full px-2 py-0.5 font-display text-sm font-extrabold"
      style={{ background: bg, border: `2px solid ${border}`, color: textCol }}
    >
      <span style={{ color: COL[glyph] }}>{glyph}</span>
      <span>{rejected ? `≠ ${value}` : `= ${value} g`}</span>
      {rejected && (
        <span aria-hidden style={{ color: ROSE }}>
          {'✗'}
        </span>
      )}
    </div>
  )
}

// The three scales rendered with focus dimming + value badges
function SceneWithFocus({
  focus,
  known,
  reject,
}: {
  focus: 0 | 1 | 2 | null
  known: Partial<Record<GlyphChar, number>>
  reject?: { glyph: GlyphChar; value: number }
}) {
  // Scale configs: same as BalanceScalesFigure
  const scales: Array<{ left: GlyphChar[]; right: GlyphChar[]; tilt: 'level' | 'left' | 'right'; x: number }> = [
    { x: 70, left: ['▲', '◼', '⬡'], right: ['●', '★'], tilt: 'level' },
    { x: 210, left: ['★', '⬡'], right: ['◼', '●'], tilt: 'left' },
    { x: 350, left: ['◼', '⬡'], right: ['▲', '●'], tilt: 'right' },
  ]

  return (
    <svg
      viewBox="0 0 420 140"
      width="100%"
      style={{ maxWidth: 440, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {scales.map((s, i) => {
        const dim = focus !== null && focus !== i
        return (
          <g key={i} opacity={dim ? 0.22 : 1}>
            <Scale22 x={s.x} left={s.left} right={s.right} tilt={s.tilt} />
            {/* Value badges for known glyphs on this scale */}
            {[...s.left, ...s.right].map((g, gi) => {
              const val = known[g as GlyphChar]
              const isReject = reject?.glyph === g
              if (val !== undefined || isReject) {
                // position badges above each glyph chip on the scale
                // The Glyph22 renders chips at roughly x ± offsets, y around 30-55
                // We overlay a simple text badge near the top of this scale column
                const badgeX = s.x + (gi % 2 === 0 ? -20 : 20) * (gi < 2 ? 1 : -1)
                const badgeY = 10 + gi * 14
                const displayVal = isReject ? reject!.value : val!
                const col = isReject ? ROSE : GREEN
                return (
                  <g key={`badge-${i}-${gi}`}>
                    <rect x={badgeX - 18} y={badgeY - 8} width={36} height={16} rx={8} fill={col} stroke="#fff" strokeWidth={1.2} />
                    <text
                      x={badgeX}
                      y={badgeY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={9}
                      fontWeight={900}
                      fill="#fff"
                    >
                      {`${g}=${displayVal}`}
                    </text>
                  </g>
                )
              }
              return null
            })}
          </g>
        )
      })}
      {/* Asked line: ▲ + ● = ? at the bottom */}
      <g>
        <Glyph22 t="▲" x={164} y={122} />
        <text x={185} y={122} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill={BRAND_BLUE}>
          +
        </text>
        <Glyph22 t="●" x={200} y={122} />
        <text x={218} y={122} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill={BRAND_BLUE}>
          =
        </text>
        <text
          x={240}
          y={122}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fontWeight={900}
          fill={known['▲'] !== undefined && known['●'] !== undefined ? GREEN : '#94A3B8'}
        >
          {known['▲'] !== undefined && known['●'] !== undefined
            ? `${(known['▲'] ?? 0) + (known['●'] ?? 0)} g`
            : '? g'}
        </text>
      </g>
    </svg>
  )
}

export default function BalanceScalesG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    'Strategy: use the balanced scale to fix the total at 8 per side, then eliminate the wrong assignment with scales 2 and 3. Answer: triangle plus circle equals 6 grams.',
    'Strategi: gunakan timbangan seimbang untuk menetapkan total 8 per sisi, lalu singkirkan penugasan yang salah dengan timbangan 2 dan 3. Jawaban: segitiga ditambah lingkaran sama dengan 6 gram.',
  )

  // Collect chips to display
  const chips: Array<{ glyph: GlyphChar; value: number; rejected: boolean }> = []
  for (const [g, v] of Object.entries(beat.known) as Array<[GlyphChar, number]>) {
    chips.push({ glyph: g, value: v, rejected: false })
  }
  if (beat.reject) {
    chips.push({ glyph: beat.reject.glyph, value: beat.reject.value, rejected: true })
  }

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <SceneWithFocus focus={beat.focus} known={beat.known} reject={beat.reject} />

        {/* value chips row */}
        {chips.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {chips.map((c) => (
              <ValueChip key={`${c.glyph}-${c.rejected}`} glyph={c.glyph} value={c.value} rejected={c.rejected} />
            ))}
          </div>
        )}

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
