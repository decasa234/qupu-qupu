import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RepdigitAddFigure } from './puzzles20G2Illustrations'

// WMI-20F2A-Q19 — ♣♣♣♣ + ♥♥♥♥ = ♠333♦
// Strategy: a repdigit ×1111, so (♣+♥)×1111 = ♠333♦. Try 12×1111=13332 → middle 3,3,3 ✓
// → ♣+♥=12, ♠=1, ♦=2, answer = 12+2+1 = 15.

const BLUE = '#30598A'
const GREEN = '#059669'
const GREEN_BG = '#D1FAE5'
const BLUE_BG = '#E1EFFB'
const CLUB_CLR = '#1F7A33'
const HEART_CLR = '#D7263D'
const SPADE_CLR = '#444'
const DIAM_CLR = '#E0408A'
const INK = '#1F2937'

type Beat = {
  phase: 'intro' | 'factor' | 'multiply' | 'read' | 'final'
  hold: number
  result: boolean
  caption: { en: string; id: string }
}

function buildSteps(): Beat[] {
  return [
    {
      phase: 'intro',
      hold: 2800,
      result: false,
      caption: {
        en: 'A digit written 4 times equals that digit × 1111. So ♣♣♣♣ = ♣ × 1111!',
        id: 'Angka yang ditulis 4 kali sama dengan angka itu × 1111. Jadi ♣♣♣♣ = ♣ × 1111!',
      },
    },
    {
      phase: 'factor',
      hold: 2400,
      result: false,
      caption: {
        en: '♣♣♣♣ + ♥♥♥♥ = (♣ × 1111) + (♥ × 1111) = (♣ + ♥) × 1111',
        id: '♣♣♣♣ + ♥♥♥♥ = (♣ × 1111) + (♥ × 1111) = (♣ + ♥) × 1111',
      },
    },
    {
      phase: 'multiply',
      hold: 2600,
      result: false,
      caption: {
        en: 'The middle three digits of ♠333♦ are all 3. Try ♣+♥ = 12: 12 × 1111 = 13332 ✓',
        id: 'Tiga angka tengah ♠333♦ semuanya 3. Coba ♣+♥ = 12: 12 × 1111 = 13332 ✓',
      },
    },
    {
      phase: 'read',
      hold: 2400,
      result: false,
      caption: {
        en: '13332: the leading digit is ♠ = 1, the last digit is ♦ = 2. And ♣ + ♥ = 12.',
        id: '13332: angka depan ♠ = 1, angka terakhir ♦ = 2. Dan ♣ + ♥ = 12.',
      },
    },
    {
      phase: 'final',
      hold: 0,
      result: true,
      caption: {
        en: '♣ + ♦ + ♥ + ♠ = (♣+♥) + ♦ + ♠ = 12 + 2 + 1 = 15',
        id: '♣ + ♦ + ♥ + ♠ = (♣+♥) + ♦ + ♠ = 12 + 2 + 1 = 15',
      },
    },
  ]
}

// ── Annotation panel shown beside/below the vertical sum figure ───────────────

function FactorAnnotation({ phase }: { phase: Beat['phase'] }) {
  // Shown from 'factor' beat onward (before we show the product panel)
  const show = phase === 'factor' || phase === 'multiply' || phase === 'read' || phase === 'final'
  if (!show) return null
  return (
    <g>
      {/* bracket grouping ♣+♥ */}
      <text x={10} y={20} fontSize={13} fontWeight={700} fill={CLUB_CLR} textAnchor="start" dominantBaseline="central">
        ♣ × 1111
      </text>
      <text x={10} y={44} fontSize={13} fontWeight={700} fill="#6B7280" textAnchor="start" dominantBaseline="central">
        +
      </text>
      <text x={10} y={64} fontSize={13} fontWeight={700} fill={HEART_CLR} textAnchor="start" dominantBaseline="central">
        ♥ × 1111
      </text>
      <line x1={8} y1={78} x2={120} y2={78} stroke={INK} strokeWidth={1.8} />
      <text x={10} y={96} fontSize={13} fontWeight={700} fill={INK} textAnchor="start" dominantBaseline="central">
        (♣+♥) × 1111
      </text>
    </g>
  )
}

function ProductPanel({ phase }: { phase: Beat['phase'] }) {
  if (phase !== 'multiply' && phase !== 'read' && phase !== 'final') return null

  const digit1 = phase === 'read' || phase === 'final'
  const digit5 = phase === 'read' || phase === 'final'

  return (
    <g>
      {/* 12 × 1111 = 13332 */}
      <text x={10} y={18} fontSize={14} fontWeight={800} fill={INK} textAnchor="start" dominantBaseline="central">
        12 × 1111 = 13332
      </text>
      {/* annotate digits in 13332 */}
      {/* Boxes around the 5 digits of 13332 */}
      {['1', '3', '3', '3', '2'].map((d, i) => {
        const x = 10 + i * 28
        const isSpade = i === 0
        const isDiam = i === 4
        const highlight = (isSpade && digit1) || (isDiam && digit5)
        return (
          <g key={i}>
            <rect
              x={x}
              y={30}
              width={24}
              height={24}
              rx={4}
              fill={highlight ? (isSpade ? '#E8F0FE' : '#FDE8F4') : '#F3F4F6'}
              stroke={highlight ? (isSpade ? SPADE_CLR : DIAM_CLR) : '#D1D5DB'}
              strokeWidth={1.6}
            />
            <text
              x={x + 12}
              y={42}
              fontSize={15}
              fontWeight={900}
              fill={isSpade && digit1 ? SPADE_CLR : isDiam && digit5 ? DIAM_CLR : i >= 1 && i <= 3 ? '#6B7280' : INK}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {d}
            </text>
          </g>
        )
      })}
      {/* labels */}
      {(phase === 'read' || phase === 'final') && (
        <>
          <text x={22} y={72} fontSize={11} fontWeight={700} fill={SPADE_CLR} textAnchor="middle" dominantBaseline="central">
            ♠=1
          </text>
          <text x={122} y={72} fontSize={11} fontWeight={700} fill={DIAM_CLR} textAnchor="middle" dominantBaseline="central">
            ♦=2
          </text>
        </>
      )}
    </g>
  )
}

function FinalBadge() {
  return (
    <g>
      <rect x={0} y={0} width={180} height={54} rx={10} fill={GREEN_BG} stroke={GREEN} strokeWidth={2} />
      <text x={90} y={18} fontSize={12} fontWeight={700} fill="#065F46" textAnchor="middle" dominantBaseline="central">
        ♣+♥ = 12 &nbsp; ♠ = 1 &nbsp; ♦ = 2
      </text>
      <line x1={16} y1={30} x2={164} y2={30} stroke={GREEN} strokeWidth={1.2} />
      <text x={90} y={44} fontSize={15} fontWeight={900} fill="#065F46" textAnchor="middle" dominantBaseline="central">
        12 + 2 + 1 = 15
      </text>
    </g>
  )
}

function IntroAnnotation() {
  // Shows ♣♣♣♣ = ♣ × 1111 decomposition
  return (
    <g>
      <text x={10} y={20} fontSize={13} fontWeight={700} fill={CLUB_CLR} textAnchor="start" dominantBaseline="central">
        ♣♣♣♣
      </text>
      <text x={60} y={20} fontSize={13} fontWeight={700} fill={INK} textAnchor="start" dominantBaseline="central">
        = ♣ × 1111
      </text>
      <text x={10} y={50} fontSize={13} fontWeight={700} fill={HEART_CLR} textAnchor="start" dominantBaseline="central">
        ♥♥♥♥
      </text>
      <text x={60} y={50} fontSize={13} fontWeight={700} fill={INK} textAnchor="start" dominantBaseline="central">
        = ♥ × 1111
      </text>
    </g>
  )
}

export default function RepdigitAddG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (cap: { en: string; id: string }) => (lang === 'id' ? cap.id : cap.en)

  const steps = useMemo(() => buildSteps(), [])
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const ariaLabel =
    lang === 'id'
      ? 'Animasi: repdigit kali 1111. ♣♣♣♣ + ♥♥♥♥ = (♣+♥)×1111. Coba 12×1111=13332, sehingga ♠=1, ♦=2, ♣+♥=12. Jawaban: 12+2+1=15.'
      : 'Animation: repdigit times 1111. ♣♣♣♣ + ♥♥♥♥ = (♣+♥)×1111. Try 12×1111=13332, so ♠=1, ♦=2, ♣+♥=12. Answer: 12+2+1=15.'

  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* Main layout: vertical sum figure left, annotation panel right */}
        <svg
          viewBox="0 0 420 180"
          width="100%"
          style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Left side: vertical sum figure (RepdigitAddFigure is ~280 wide, scale down) */}
          <g transform="translate(0, 5) scale(0.72)">
            <RepdigitAddFigure reveal={false} />
          </g>

          {/* Right side: annotation area at x=210 */}
          <g transform="translate(210, 20)">
            {beat.phase === 'intro' && <IntroAnnotation />}
            {(beat.phase === 'factor' ||
              beat.phase === 'multiply' ||
              beat.phase === 'read') && <FactorAnnotation phase={beat.phase} />}
            {(beat.phase === 'multiply' || beat.phase === 'read') && (
              <g transform="translate(0, 112)">
                <ProductPanel phase={beat.phase} />
              </g>
            )}
            {beat.phase === 'final' && (
              <g transform="translate(0, 20)">
                <FinalBadge />
              </g>
            )}
          </g>
        </svg>

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN, color: '#065F46' }
              : { background: BLUE_BG, borderColor: BLUE, color: BLUE }
          }
        >
          {t(beat.caption)}
        </div>
      </div>
    </div>
  )
}
