import { useMemo, type ComponentType } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Shared "find the step, fill the gaps" explainer for number-sequence questions.
// Beats: show the row with gaps → discover the step from two adjacent KNOWN
// numbers → fill every gap in order → reveal the ★ → result. The star's value
// is derived on screen, never asserted.

const GREEN = '#10B981'
const BLUE = '#2563EB'
const AMBER = '#D97706'
const INK = '#1F2937'

interface SeqConfig {
  /** The full sequence values, left to right. */
  seq: number[]
  /** Which positions are printed in the problem (the rest are gaps). */
  known: boolean[]
  /** Index of the ★ cell. */
  starIndex: number
  /** Step label shown between boxes, e.g. "+4" or "−10". */
  stepText: string
  /** The two adjacent KNOWN indices used to discover the step. */
  pair: [number, number]
  build: (lang: Lang) => { intro: string; find: string; fill: string; star: string; final: string; aria: string }
}

export function makeSequenceFillExplainer(cfg: SeqConfig): ComponentType<ExplainerProps> {
  const VIEW_W = 380
  const VIEW_H = 116
  const n = cfg.seq.length
  const GAP = 8
  const BOX_W = Math.min(54, (VIEW_W - 24 - (n - 1) * GAP) / n)
  const BOX_H = 38
  const x0 = (VIEW_W - (n * BOX_W + (n - 1) * GAP)) / 2
  const ROW_Y = 46
  const bx = (i: number) => x0 + i * (BOX_W + GAP)

  return function SequenceFillExplainer(props: ExplainerProps) {
    const lang = (props.lang ?? 'en') as Lang
    const text = useMemo(() => cfg.build(lang), [lang])
    const finalIndex = 4
    const holds = useMemo(() => [2200, 2600, 2600, 2400, 0], [])
    const index = useBeatControl(finalIndex, { ...props, holds })

    const showStep = index >= 1
    const fillGaps = index >= 2
    const showStar = index >= 3
    const result = index >= finalIndex
    const caption = [text.intro, text.find, text.fill, text.star, text.final][Math.min(index, 4)]

    return (
      <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={text.aria}>
        <div className="flex flex-col items-center gap-3">
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
            {/* discovery ring around the adjacent known pair */}
            {index === 1 && (
              <rect
                x={bx(cfg.pair[0]) - 4}
                y={ROW_Y - 6}
                width={BOX_W * 2 + GAP + 8}
                height={BOX_H + 12}
                rx={9}
                fill="rgba(245,158,11,0.10)"
                stroke={AMBER}
                strokeWidth={2}
                strokeDasharray="6 4"
              />
            )}

            {cfg.seq.map((v, i) => {
              const isStar = i === cfg.starIndex
              const revealed = cfg.known[i] || (isStar ? showStar : fillGaps)
              const deduced = revealed && !cfg.known[i]
              return (
                <g key={i}>
                  {isStar && (
                    <text x={bx(i) + BOX_W / 2} y={ROW_Y - 12} textAnchor="middle" fontSize={13} fontWeight={800} fill={AMBER}>
                      ★
                    </text>
                  )}
                  <rect
                    x={bx(i)}
                    y={ROW_Y}
                    width={BOX_W}
                    height={BOX_H}
                    rx={6}
                    fill={deduced ? 'rgba(16,185,129,0.15)' : '#FFFFFF'}
                    stroke={deduced ? GREEN : revealed ? INK : '#9CA3AF'}
                    strokeWidth={deduced ? 3 : revealed ? 2 : 1.5}
                    strokeDasharray={revealed ? undefined : '4 4'}
                  />
                  <text
                    x={bx(i) + BOX_W / 2}
                    y={ROW_Y + BOX_H / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-display"
                    fontSize={cfg.seq[i] >= 100 ? 14 : 16}
                    fontWeight={900}
                    fill={deduced ? '#065F46' : revealed ? INK : '#9CA3AF'}
                  >
                    {revealed ? String(v) : isStar ? '★' : '?'}
                  </text>
                </g>
              )
            })}

            {/* step labels between boxes */}
            {showStep &&
              cfg.seq.slice(0, -1).map((_, i) => (
                <text
                  key={`s-${i}`}
                  x={bx(i) + BOX_W + GAP / 2}
                  y={ROW_Y + BOX_H + 16}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={800}
                  fill={BLUE}
                  className="font-display"
                >
                  {cfg.stepText}
                </text>
              ))}
          </svg>

          <div
            className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
            style={
              result
                ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
            }
          >
            {caption}
          </div>
        </div>
      </div>
    )
  }
}

/** WMI-19F1A-Q3 — 56 → 60 → (___) → (___) → (★) → (___) → 80, step +4. */
export const SequenceFillG1Q3Explainer = makeSequenceFillExplainer({
  seq: [56, 60, 64, 68, 72, 76, 80],
  known: [true, true, false, false, false, false, true],
  starIndex: 4,
  stepText: '+4',
  pair: [0, 1],
  build: (lang) =>
    lang === 'id'
      ? {
          intro: 'Barisan dengan bagian kosong — temukan ★.',
          find: '56 → 60 melompat +4. Cek ujungnya: enam lompatan +4 dari 56 memang sampai 80. Jadi polanya +4.',
          fill: 'Isi yang kosong secara urut: 64, 68, lalu setelah ★ ada 76.',
          star: 'Kotak ★ datang setelah 68: 68 + 4 = 72.',
          final: '★ = 72 (D).',
          aria: 'Barisan bertambah 4: bintang adalah 72.',
        }
      : {
          intro: 'A sequence with gaps — find the ★.',
          find: '56 → 60 jumps +4. Check the ends: six +4 jumps from 56 does reach 80. So the pattern is +4.',
          fill: 'Fill the gaps in order: 64, 68, and after the ★ comes 76.',
          star: 'The ★ box comes after 68: 68 + 4 = 72.',
          final: '★ = 72 (D).',
          aria: 'The sequence climbs by 4: the star is 72.',
        },
})

/** WMI-19F2A-Q1 — 441 → (___) → 421 → 411 → (___) → (★), step −10. */
export const SequenceFillG2Q1Explainer = makeSequenceFillExplainer({
  seq: [441, 431, 421, 411, 401, 391],
  known: [true, false, true, true, false, false],
  starIndex: 5,
  stepText: '−10',
  pair: [2, 3],
  build: (lang) =>
    lang === 'id'
      ? {
          intro: 'Barisan dengan bagian kosong — temukan ★.',
          find: '421 → 411 turun 10. Cek: 441 ke 421 adalah dua lompatan −10. Jadi polanya −10.',
          fill: 'Isi yang kosong secara urut: 431, lalu 401.',
          star: 'Kotak ★ datang setelah 401: 401 − 10 = 391.',
          final: '★ = 391 (C).',
          aria: 'Barisan berkurang 10: bintang adalah 391.',
        }
      : {
          intro: 'A sequence with gaps — find the ★.',
          find: '421 → 411 drops by 10. Check: 441 to 421 is two −10 jumps. So the pattern is −10.',
          fill: 'Fill the gaps in order: 431, then 401.',
          star: 'The ★ box comes after 401: 401 − 10 = 391.',
          final: '★ = 391 (C).',
          aria: 'The sequence drops by 10: the star is 391.',
        },
})
