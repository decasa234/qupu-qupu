import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'

// WMI-20F2A-Q15 — follow four −10 hops then one −3 hop on the number line.
// Start: 80. After each −10: 70, 60, 50, 40. Then 40 − 3 = 37 → answer B.

const BLUE = '#19A7CE'
const GREEN = '#10B981'
const INK = '#1F2937'

// Geometry matching NumberLineHopsG2Illustration in scenes20G2Illustrations.tsx
const X80 = 350
const STEP = 52
// Tick x-positions for 80, 70, 60, 50, 40
const XS = [X80, X80 - STEP, X80 - 2 * STEP, X80 - 3 * STEP, X80 - 4 * STEP] as const
// Box (question mark / answer) lands here — same offset as the illustration
const XQ = XS[4] - 18 // 124

// Labels shown below each major tick
const LABELS: Record<number, string> = {
  [XS[0]]: '80',
  [XS[1]]: '70',
  [XS[2]]: '60',
  [XS[3]]: '50',
  [XS[4]]: '40',
}

interface Beat {
  hopsShown: number   // how many −10 arcs are visible (0‥4)
  showMinus3: boolean // show the −3 arc
  boxValue: string    // '?' until the final reveal
  landing: number | null // highlighted landing tick x (null = none)
  hold: number
  result: boolean
  caption: string
}

export default function NumberLineHopsG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo<Beat[]>(() => [
    // Beat 0 — intro: show the full number line, no hops yet
    {
      hopsShown: 0,
      showMinus3: false,
      boxValue: '?',
      landing: null,
      hold: 2600,
      result: false,
      caption: t(
        'Start at 80. We will hop LEFT each time!',
        'Mulai dari 80. Kita akan melompat ke KIRI setiap kali!',
      ),
    },
    // Beat 1 — first −10 hop: 80 − 10 = 70
    {
      hopsShown: 1,
      showMinus3: false,
      boxValue: '?',
      landing: XS[1],
      hold: 1900,
      result: false,
      caption: t('Hop −10: 80 − 10 = 70', 'Lompat −10: 80 − 10 = 70'),
    },
    // Beat 2 — second −10 hop: 70 − 10 = 60
    {
      hopsShown: 2,
      showMinus3: false,
      boxValue: '?',
      landing: XS[2],
      hold: 1900,
      result: false,
      caption: t('Hop −10: 70 − 10 = 60', 'Lompat −10: 70 − 10 = 60'),
    },
    // Beat 3 — third −10 hop: 60 − 10 = 50
    {
      hopsShown: 3,
      showMinus3: false,
      boxValue: '?',
      landing: XS[3],
      hold: 1900,
      result: false,
      caption: t('Hop −10: 60 − 10 = 50', 'Lompat −10: 60 − 10 = 50'),
    },
    // Beat 4 — fourth −10 hop: 50 − 10 = 40
    {
      hopsShown: 4,
      showMinus3: false,
      boxValue: '?',
      landing: XS[4],
      hold: 1900,
      result: false,
      caption: t('Hop −10: 50 − 10 = 40', 'Lompat −10: 50 − 10 = 40'),
    },
    // Beat 5 — −3 hop: 40 − 3 = 37 → reveal box
    {
      hopsShown: 4,
      showMinus3: true,
      boxValue: '37',
      landing: XQ,
      hold: 2200,
      result: false,
      caption: t('Hop −3: 40 − 3 = 37 → the box is 37!', 'Lompat −3: 40 − 3 = 37 → kotaknya adalah 37!'),
    },
    // Beat 6 — FINAL result: answer B
    {
      hopsShown: 4,
      showMinus3: true,
      boxValue: '37',
      landing: XQ,
      hold: 0,
      result: true,
      caption: t('The box = 37 → answer B.', 'Kotak = 37 → jawaban B.'),
    },
  ], [lang])

  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  // Build the four −10 arc paths (same quadratic bezier as the illustration)
  const minusTenArcs = XS.slice(0, 4).map((x, i) => {
    const from = x
    const to = x - STEP
    const midX = from - STEP / 2
    const midY = 36  // control-point y (illustration uses 36 above the baseline at 66)
    return { path: `M ${from} 66 Q ${midX} ${midY} ${to} 66`, labelX: midX, i }
  })

  // The −3 arc
  const minus3Path = `M ${XS[4]} 66 Q ${XS[4] - 9} 46 ${XQ} 62`

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={t(
        'Number line strategy: four hops of minus ten from 80 land on 40, then one hop of minus three gives 37 — answer B.',
        'Strategi garis bilangan: empat lompatan minus sepuluh dari 80 mendarat di 40, lalu satu lompatan minus tiga menghasilkan 37 — jawaban B.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          viewBox="0 0 400 130"
          width="100%"
          style={{ maxWidth: 440, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* ── Number line baseline ── */}
          <line x1={8} y1={78} x2={392} y2={78} stroke={INK} strokeWidth={2.5} />
          {/* Arrow head */}
          <polygon points="392,72 404,78 392,84" fill={INK} />

          {/* ── Tick marks ── */}
          {/* 0 at the left edge */}
          <line x1={14} y1={70} x2={14} y2={86} stroke={INK} strokeWidth={2.5} />
          <text x={14} y={102} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}>0</text>
          {/* ellipsis gap */}
          <text x={60} y={80} textAnchor="middle" fontSize={14} fill={INK}>… …</text>
          {/* Major ticks at 40, 50, 60, 70, 80 */}
          {XS.map((x) => (
            <g key={x}>
              <line x1={x} y1={70} x2={x} y2={86} stroke={INK} strokeWidth={2.5} />
              <text x={x} y={102} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}>
                {LABELS[x]}
              </text>
            </g>
          ))}
          {/* Extra right tick at 376 (to hint the line continues) */}
          <line x1={376} y1={70} x2={376} y2={86} stroke={INK} strokeWidth={2.5} />

          {/* ── Box tick at XQ (the answer position) ── */}
          <line x1={XQ} y1={66} x2={XQ} y2={86} stroke={BLUE} strokeWidth={2.4} />

          {/* ── Four −10 hop arcs ── */}
          {minusTenArcs.map(({ path, labelX, i }) => {
            const visible = beat.hopsShown > i
            const isLatest = beat.hopsShown === i + 1 && !beat.showMinus3
            return (
              <g key={i} opacity={visible ? 1 : 0}>
                <path
                  d={path}
                  fill="none"
                  stroke={BLUE}
                  strokeWidth={2.4}
                  strokeOpacity={isLatest ? 1 : 0.55}
                />
                <text
                  x={labelX}
                  y={32}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={800}
                  fill={BLUE}
                  fillOpacity={isLatest ? 1 : 0.55}
                >
                  −10
                </text>
              </g>
            )
          })}

          {/* ── −3 hop arc ── */}
          {beat.showMinus3 && (
            <g>
              <path d={minus3Path} fill="none" stroke={BLUE} strokeWidth={2.4} />
              {/* Arrow tip matching the illustration */}
              <polygon points={`${XQ - 3},58 ${XQ},68 ${XQ + 5},59`} fill={BLUE} />
              <text x={XS[4] - 8} y={40} textAnchor="middle" fontSize={13} fontWeight={800} fill={BLUE}>
                −3
              </text>
            </g>
          )}

          {/* ── Landing highlight dot ── */}
          {beat.landing !== null && (
            <circle
              cx={beat.landing === XQ ? XQ : beat.landing}
              cy={78}
              r={5}
              fill={beat.result ? GREEN : BLUE}
            />
          )}

          {/* ── Answer box ── */}
          <rect
            x={XQ - 14}
            y={88}
            width={28}
            height={24}
            rx={5}
            fill={beat.result ? '#D1FAE5' : 'white'}
            stroke={beat.result ? GREEN : BLUE}
            strokeWidth={2.4}
          />
          <text
            x={XQ}
            y={101}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={beat.boxValue === '?' ? 15 : 13}
            fontWeight={900}
            fill={beat.result ? '#065F46' : INK}
          >
            {beat.boxValue}
          </text>
        </svg>

        {/* ── Caption box ── */}
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
