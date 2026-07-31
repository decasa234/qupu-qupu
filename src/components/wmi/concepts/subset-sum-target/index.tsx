import { BalanceScale, WeightBlock } from '../../PastPapers/WMI/primitives/BalanceScale'

// In-card figure for `subset-sum-target`. The problem hands the child a set of
// numbered things and a total to hit; seeing the set laid out is most of the
// work, so this draws exactly what the stem lists and nothing more — no answer,
// no grouping, no hint of which cards win.
//
// Pure SVG, no hooks, no randomness: safe to render on the server and identical
// for the same params every time.

type Ask = 'which-subset' | 'which-cut-line' | 'balance-the-seesaw'

interface Params {
  ask: Ask
  values: number[]
  target: number
  size: number
}

const INK = '#30598A'
const INK_SOFT = '#E1EFFB'
const AMBER = '#E0A000'
const AMBER_SOFT = '#FFF3D4'
const MUTED = '#B9C0CC'
const CREAM = '#FFF9F4'

const CARD_W = 46
const CARD_H = 56
const GAP = 12

function read(raw: unknown): Params {
  const p = (raw ?? {}) as Partial<Params>
  const values = Array.isArray(p.values)
    ? p.values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v)).map((v) => Math.round(v))
    : []
  const ask: Ask =
    p.ask === 'which-cut-line' || p.ask === 'balance-the-seesaw' ? p.ask : 'which-subset'
  return {
    ask,
    values: values.length > 0 ? values : [4, 6, 12, 13],
    target: typeof p.target === 'number' && Number.isFinite(p.target) ? Math.round(p.target) : 0,
    size: typeof p.size === 'number' && Number.isFinite(p.size) ? Math.round(p.size) : 2,
  }
}

/** A row of number cards, optionally with the gaps between them dashed in. */
function CardRow({ values, showGaps, unit }: { values: number[]; showGaps: boolean; unit: string }) {
  const width = values.length * CARD_W + (values.length - 1) * GAP
  const height = CARD_H + 12

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ maxWidth: Math.min(width * 1.6, 420) }}>
      {values.map((v, i) => {
        const x = i * (CARD_W + GAP)
        return (
          <g key={`c${i}`}>
            <rect
              x={x}
              y={6}
              width={CARD_W}
              height={CARD_H}
              rx={9}
              fill={INK_SOFT}
              stroke={INK}
              strokeWidth={2.5}
            />
            <text
              x={x + CARD_W / 2}
              y={6 + CARD_H / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={unit ? 17 : 22}
              fontWeight={900}
              fill={INK}
            >
              {v}
              {unit}
            </text>
          </g>
        )
      })}
      {/* Every place a cut could go — drawn faint so none of them looks chosen. */}
      {showGaps &&
        values.slice(1).map((_, i) => {
          const x = (i + 1) * (CARD_W + GAP) - GAP / 2
          return (
            <line
              key={`g${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke={MUTED}
              strokeWidth={2}
              strokeDasharray="5 5"
              strokeLinecap="round"
            />
          )
        })}
    </svg>
  )
}

/** The "hit this total" badge that sits above the set. */
function TargetBadge({ text }: { text: string }) {
  return (
    <div
      className="rounded-full border-2 px-3 py-0.5 font-display text-sm font-extrabold tabular-nums"
      style={{ background: AMBER_SOFT, borderColor: AMBER, color: AMBER }}
    >
      {text}
    </div>
  )
}

export default function SubsetSumTargetIllustration({ params }: { params: unknown }) {
  const p = read(params)

  if (p.ask === 'balance-the-seesaw') {
    return (
      <div
        className="my-4 flex flex-col items-center justify-center gap-2"
        role="img"
        aria-label={`Timbangan dengan satu balok ${p.target} kg di piring kiri dan piring kanan masih kosong. Balok yang tersedia: ${p.values.join(', ')} kg.`}
      >
        <div className="w-full max-w-[20rem]">
          <BalanceScale
            tilt={1}
            panW={120}
            left={<WeightBlock kg={p.target} />}
            right={
              <g>
                <rect
                  x={-24}
                  y={-48}
                  width={48}
                  height={48}
                  rx={7}
                  fill={CREAM}
                  stroke={MUTED}
                  strokeWidth={2.5}
                  strokeDasharray="6 5"
                />
                <text x={0} y={-24} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={900} fill={MUTED}>
                  ?
                </text>
              </g>
            }
          />
        </div>
        <CardRow values={p.values} showGaps={false} unit=" kg" />
      </div>
    )
  }

  if (p.ask === 'which-cut-line') {
    return (
      <div
        className="my-4 flex flex-col items-center justify-center gap-2"
        role="img"
        aria-label={`Deret kartu angka ${p.values.join(', ')} dengan celah di antara tiap kartu tempat garis potong bisa dipasang.`}
      >
        <CardRow values={p.values} showGaps unit="" />
      </div>
    )
  }

  return (
    <div
      className="my-4 flex flex-col items-center justify-center gap-2"
      role="img"
      aria-label={`Kartu angka ${p.values.join(', ')}; ambil ${p.size} kartu yang jumlahnya ${p.target}.`}
    >
      <TargetBadge text={`${p.size} → ${p.target}`} />
      <CardRow values={p.values} showGaps={false} unit="" />
    </div>
  )
}
