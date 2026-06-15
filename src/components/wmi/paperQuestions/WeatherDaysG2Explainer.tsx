import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'

// WMI-20F2A-Q20 — five consecutive days (11–15), two sunny, two rainy, one cloudy.
// Rules: no two same days in a row; a rainy day can never follow a sunny day.
// Deduction order:
//   Beat 0 — intro: counts and no-repeat rule
//   Beat 1 — key constraint: rainy can't follow sunny, so each rainy must open or follow cloudy
//   Beat 2 — only one cloudy → at most one rainy can follow it; so the OTHER rainy must be day 11
//   Beat 3 — fill 11=Rain, then 12 can't be Rain → try 12=Sun; second Rain must follow the cloud
//   Beat 4 — fill 13=Cloud, 14=Rain, 15=Sun; check: no repeat, no Rain-after-Sun
//   Beat 5 (final) — highlight day 13 as the answer

// Colour palette (qupu tokens as hex)
const CARD_BG = '#FFFFFF'
const CARD_BORDER = '#1F2937'
const SUNNY_COLOR = '#F59E0B'   // amber
const RAINY_COLOR = '#3B82F6'   // blue
const CLOUDY_COLOR = '#94A3B8'  // slate
const UNKNOWN_COLOR = '#94A3B8'
const HIGHLIGHT_COLOR = '#10B981'
const CAPTION_BLUE_BG = '#E1EFFB'
const CAPTION_BLUE_BORDER = '#30598A'
const CAPTION_BLUE_TEXT = '#30598A'
const CAPTION_GREEN_BG = '#D1FAE5'
const CAPTION_GREEN_BORDER = '#10B981'
const CAPTION_GREEN_TEXT = '#065F46'

type Weather = 'sunny' | 'rainy' | 'cloudy' | null

// Per-beat: which cells are filled, and which is highlighted (the answer cell)
interface Beat {
  filled: Weather[]       // null means still unknown
  highlightIdx: number    // -1 = none
  result: boolean
  hold: number
  caption: [string, string] // [en, id]
}

function buildBeats(): Beat[] {
  const none: Weather[] = [null, null, null, null, null]
  return [
    {
      filled: [...none],
      highlightIdx: -1,
      result: false,
      hold: 2600,
      caption: [
        'Jim had 2 sunny ☀️, 2 rainy 🌧️ and 1 cloudy ☁️ day — and the SAME weather never happened two days in a row.',
        'Jim punya 2 ☀️ cerah, 2 🌧️ hujan, 1 ☁️ mendung — dan cuaca yang SAMA tidak boleh dua hari berturut-turut.',
      ],
    },
    {
      filled: [...none],
      highlightIdx: -1,
      result: false,
      hold: 2800,
      caption: [
        'Key rule: a rainy 🌧️ day can NEVER come right after a sunny ☀️ day. So each 🌧️ must either start the row OR follow the cloudy ☁️ day.',
        'Aturan penting: hari hujan 🌧️ tidak boleh tepat setelah hari cerah ☀️. Jadi setiap 🌧️ harus memulai urutan ATAU langsung sesudah hari mendung ☁️.',
      ],
    },
    {
      filled: ['rainy', null, null, null, null],
      highlightIdx: 0,
      result: false,
      hold: 2800,
      caption: [
        'There is only ONE ☁️ day, so at most one 🌧️ can follow it. The OTHER 🌧️ must be the very first day → Day 11 = 🌧️ Rainy!',
        'Hanya ada SATU hari ☁️, jadi paling banyak satu 🌧️ bisa mengikutinya. 🌧️ yang lain harus menjadi hari pertama → Hari ke-11 = 🌧️ Hujan!',
      ],
    },
    {
      filled: ['rainy', 'sunny', null, null, null],
      highlightIdx: 1,
      result: false,
      hold: 2400,
      caption: [
        'Day 12 can\'t be 🌧️ again (repeat!). Try ☀️ sunny → Day 12 = ☀️. Now the second 🌧️ must sit right after the ☁️ cloud.',
        'Hari ke-12 tidak bisa 🌧️ lagi (terulang!). Coba ☀️ cerah → Hari ke-12 = ☀️. Kini 🌧️ kedua harus tepat sesudah ☁️ mendung.',
      ],
    },
    {
      filled: ['rainy', 'sunny', 'cloudy', 'rainy', 'sunny'],
      highlightIdx: -1,
      result: false,
      hold: 2600,
      caption: [
        'Fill in: 11🌧️ 12☀️ 13☁️ 14🌧️ 15☀️ — no repeats ✓ — no 🌧️ after ☀️ ✓ — all counts right ✓',
        'Isi: 11🌧️ 12☀️ 13☁️ 14🌧️ 15☀️ — tak ada pengulangan ✓ — tak ada 🌧️ setelah ☀️ ✓ — jumlah cuaca tepat ✓',
      ],
    },
    {
      filled: ['rainy', 'sunny', 'cloudy', 'rainy', 'sunny'],
      highlightIdx: 2,
      result: true,
      hold: 0,
      caption: [
        'The cloudy ☁️ day is the 13th!',
        'Hari mendung ☁️ adalah tanggal 13!',
      ],
    },
  ]
}

// Emoji glyphs for each weather type
function weatherEmoji(w: Weather): string {
  if (w === 'sunny') return '☀️'
  if (w === 'rainy') return '🌧️'
  if (w === 'cloudy') return '☁️'
  return '?'
}

function weatherBorderColor(w: Weather): string {
  if (w === 'sunny') return SUNNY_COLOR
  if (w === 'rainy') return RAINY_COLOR
  if (w === 'cloudy') return CLOUDY_COLOR
  return UNKNOWN_COLOR
}

// SVG day-card row, matching WeatherDaysG2Illustration style
function DayCardRow({ filled, highlightIdx }: { filled: Weather[]; highlightIdx: number }) {
  const days = [11, 12, 13, 14, 15]
  // viewBox: 380 × 130, five cards of width 58, height 66, with gaps
  // same layout as the illustration: x = 16 + i*70
  return (
    <svg
      viewBox="0 0 380 110"
      width="100%"
      style={{ maxWidth: 400, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* Legend row below cards */}
      <text x={70} y={100} textAnchor="middle" fontSize={15}>☀️ ×2</text>
      <text x={190} y={100} textAnchor="middle" fontSize={15}>🌧️ ×2</text>
      <text x={310} y={100} textAnchor="middle" fontSize={15}>☁️ ×1</text>

      {days.map((dnum, i) => {
        const cx = 45 + i * 70
        const isHighlighted = highlightIdx === i
        const w = filled[i]
        const borderColor = isHighlighted
          ? HIGHLIGHT_COLOR
          : w != null
            ? weatherBorderColor(w)
            : CARD_BORDER
        const borderWidth = isHighlighted ? 3.5 : 2.2
        const cardBg = isHighlighted ? '#ECFDF5' : CARD_BG

        return (
          <g key={dnum}>
            <rect
              x={16 + i * 70}
              y={4}
              width={58}
              height={72}
              rx={9}
              fill={cardBg}
              stroke={borderColor}
              strokeWidth={borderWidth}
            />
            {/* Day number */}
            <text
              x={cx}
              y={22}
              textAnchor="middle"
              fontSize={14}
              fontWeight={800}
              fill={isHighlighted ? HIGHLIGHT_COLOR : CARD_BORDER}
            >
              {dnum}
            </text>
            {/* Weather emoji or question mark */}
            <text
              x={cx}
              y={56}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={w != null ? 22 : 20}
              fill={w == null ? '#CBD5E1' : undefined}
            >
              {weatherEmoji(w)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function WeatherDaysG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const beats = useMemo(() => buildBeats(), [])
  const index = useBeatControl(beats.length - 1, {
    ...props,
    holds: beats.map((b) => b.hold),
  })
  const beat = beats[index] ?? beats[beats.length - 1]

  const ariaLabel = t(
    'Weather deduction: no-repeat and rainy-never-after-sunny rules force day 11=Rainy, 12=Sunny, 13=Cloudy, 14=Rainy, 15=Sunny. The cloudy day is the 13th.',
    'Deduksi cuaca: aturan tidak berulang dan hujan tidak setelah cerah memaksa hari ke-11=Hujan, 12=Cerah, 13=Mendung, 14=Hujan, 15=Cerah. Hari mendung adalah tanggal 13.',
  )

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        <DayCardRow filled={beat.filled} highlightIdx={beat.highlightIdx} />
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: CAPTION_GREEN_BG, borderColor: CAPTION_GREEN_BORDER, color: CAPTION_GREEN_TEXT }
              : { background: CAPTION_BLUE_BG, borderColor: CAPTION_BLUE_BORDER, color: CAPTION_BLUE_TEXT }
          }
        >
          {t(beat.caption[0], beat.caption[1])}
        </div>
      </div>
    </div>
  )
}
