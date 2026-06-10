// Scene illustrations for WMI-20F2A, reconstructed from the paper scans.
import { ArrowClock } from './ClockTurnG2Explainer'
import { FRUIT_ROWS } from './FruitCountG2Explainer'

const INK = '#1F2937'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      {children}
    </div>
  )
}

/** Q7 — the four printed clocks and the question mark. */
export function ClockSequenceG2Illustration() {
  const seq = [270, 315, 45, 90] // 9:00, 10:30, 1:30, 3:00 as printed
  return (
    <Frame aria="Four clocks in a row. A pink arrow points at 9, then between 10 and 11, then between 1 and 2, then at 3. A fifth clock is a question mark.">
      <div className="flex flex-wrap items-center justify-center gap-1">
        {seq.map((deg, i) => (
          <span key={i} className="flex items-center">
            <ArrowClock deg={deg} size={86} />
            <span className="px-0.5 font-display text-base font-bold text-gray-400">›</span>
          </span>
        ))}
        <span
          className="flex items-center justify-center rounded-full border-4 font-display text-3xl font-extrabold"
          style={{ width: 80, height: 80, borderColor: '#E75480', color: '#E75480' }}
        >
          ?
        </span>
      </div>
    </Frame>
  )
}

/** Q8 — the fruit rows (12 apples, 10 oranges, 12 bananas). */
export function FruitGridG2Illustration() {
  const GLYPH: Record<string, string> = { a: '🍎', o: '🍊', b: '🍌' }
  return (
    <Frame aria="Rows of fruit stickers: twelve apples, ten oranges, and twelve bananas mixed across three rows.">
      <svg viewBox="0 0 420 110" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={0} y={0} width={420} height={110} rx={10} fill="#E7F0DC" />
        {FRUIT_ROWS.map((row, r) =>
          row.map((f, c) => (
            <text key={`${r}-${c}`} x={20 + c * 33} y={24 + r * 33} textAnchor="middle" dominantBaseline="central" fontSize={22}>
              {GLYPH[f]}
            </text>
          )),
        )}
      </svg>
    </Frame>
  )
}

/** Q10 — rows of roses (12 + 12 + 11 + 10 = 45). */
export const ROSE_ROWS = [12, 12, 11, 10]
export function RosesG2Illustration() {
  return (
    <Frame aria="Rows of roses: twelve, twelve, eleven, and ten — about fifty in total.">
      <svg viewBox="0 0 420 148" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {ROSE_ROWS.map((count, r) =>
          Array.from({ length: count }, (_, c) => (
            <text key={`${r}-${c}`} x={22 + c * 32 + (r % 2) * 8} y={22 + r * 34} textAnchor="middle" dominantBaseline="central" fontSize={20}>
              🌹
            </text>
          )),
        )}
      </svg>
    </Frame>
  )
}

/** Q11 — a clock rim zoom: 1 section = 5 small ticks. */
export function MinuteSectionsG2Illustration() {
  return (
    <Frame aria="A clock face. The five small ticks between two numbers make one section, worth five minutes; each small tick is one minute.">
      <svg viewBox="-90 -90 180 180" width="100%" style={{ maxWidth: 220, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <circle r={70} fill="white" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i * 6 - 90) * (Math.PI / 180)
          const big = i % 5 === 0
          const r1 = big ? 62 : 65.5
          const inSection = i > 0 && i <= 5
          return <line key={i} x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * 68.5} y2={Math.sin(a) * 68.5} stroke={inSection ? '#D7263D' : INK} strokeWidth={big ? 2.4 : inSection ? 2.2 : 1} />
        })}
        {Array.from({ length: 12 }, (_, i) => {
          const n = i + 1
          const a = (n * 30 - 90) * (Math.PI / 180)
          return <text key={n} x={Math.cos(a) * 52} y={Math.sin(a) * 52} textAnchor="middle" dominantBaseline="central" fontSize={12.5} fontWeight={800} fill={INK}>{n}</text>
        })}
        {/* bracket over the 12→1 section */}
        <path d="M 38 -66 A 76 76 0 0 1 66 -38" fill="none" stroke="#D7263D" strokeWidth={2.5} />
        <text x={64} y={-64} textAnchor="middle" fontSize={12} fontWeight={900} fill="#D7263D">5'</text>
      </svg>
    </Frame>
  )
}

/** Q14 — the growing pattern rows with ♥ and ♠. */
export function PatternRowsG2Illustration() {
  const CELL = 38
  const rows = [3, 4, 5, 6, 7, 8]
  return (
    <Frame aria="A pattern of rows growing from three to eight cells. Each row starts and ends with an orange circle and has purple squares in between. Rows five to seven are blank; a heart marks the fifth cell of the six-cell row and a spade marks the second cell of the seven-cell row.">
      <svg viewBox="0 0 360 252" width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {rows.map((n, r) => {
          const y = 6 + r * 40
          const known = r < 2 || r === 5
          return (
            <g key={r}>
              {Array.from({ length: n }, (_, c) => {
                const x = 8 + c * CELL
                const isEnd = c === 0 || c === n - 1
                if (known) {
                  return isEnd ? (
                    <circle key={c} cx={x + 16} cy={y + 16} r={15} fill="#E8965A" />
                  ) : (
                    <rect key={c} x={x + 2} y={y + 2} width={28} height={28} fill="#C5BCE0" />
                  )
                }
                const mark = (r === 3 && c === 4) ? '♥' : (r === 4 && c === 1) ? '♠' : null
                return (
                  <g key={c}>
                    <rect x={x + 1} y={y + 1} width={30} height={30} fill="white" stroke={INK} strokeWidth={1.8} />
                    {mark && (
                      <text x={x + 16} y={y + 17} textAnchor="middle" dominantBaseline="central" fontSize={19} fill={mark === '♥' ? '#D7263D' : INK}>
                        {mark}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          )
        })}
        <text x={330} y={150} textAnchor="middle" fontSize={20} fontWeight={900} fill={INK} className="font-display">♠,♥=?</text>
      </svg>
    </Frame>
  )
}

/** Q15 — the number line with −10 hops and a −3 hop ending at the box. */
export function NumberLineHopsG2Illustration() {
  const x80 = 350, step = 52
  const xs = [x80, x80 - step, x80 - 2 * step, x80 - 3 * step, x80 - 4 * step] // 80,70,60,50,40
  const xq = xs[4] - 18 // 37
  return (
    <Frame aria="A number line marked 0 to past 80. From 80, four hops of minus ten land on 40, then one hop of minus three lands on a box marked with a question mark.">
      <svg viewBox="0 0 400 120" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <line x1={8} y1={78} x2={392} y2={78} stroke={INK} strokeWidth={2.5} />
        <polygon points="392,72 404,78 392,84" fill={INK} />
        {[14, ...xs, 376].map((x, i) => (
          <line key={i} x1={x} y1={70} x2={x} y2={86} stroke={INK} strokeWidth={2.5} />
        ))}
        <text x={14} y={102} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}>0</text>
        <text x={60} y={80} textAnchor="middle" fontSize={14} fill={INK}>… …</text>
        <text x={xs[1]} y={102} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}>70</text>
        <text x={xs[0]} y={102} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}>80</text>
        {xs.slice(0, 4).map((x, i) => (
          <g key={i}>
            <path d={`M ${x} 66 Q ${x - step / 2} 36 ${x - step} 66`} fill="none" stroke="#19A7CE" strokeWidth={2.4} />
            <text x={x - step / 2} y={32} textAnchor="middle" fontSize={13} fontWeight={800} fill="#19A7CE">−10</text>
          </g>
        ))}
        <path d={`M ${xs[4]} 66 Q ${xs[4] - 9} 46 ${xq} 62`} fill="none" stroke="#19A7CE" strokeWidth={2.4} />
        <polygon points={`${xq - 3},58 ${xq},68 ${xq + 5},59`} fill="#19A7CE" />
        <text x={xs[4] - 8} y={40} textAnchor="middle" fontSize={13} fontWeight={800} fill="#19A7CE">−3</text>
        <rect x={xq - 14} y={88} width={28} height={24} rx={5} fill="white" stroke="#19A7CE" strokeWidth={2.4} />
        <text x={xq} y={101} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill={INK}>?</text>
        <line x1={xq} y1={66} x2={xq} y2={86} stroke="#19A7CE" strokeWidth={2.4} />
      </svg>
    </Frame>
  )
}

/** Q20 — five dated day-cards with the three weather kinds as a legend. */
export function WeatherDaysG2Illustration() {
  return (
    <Frame aria="Five day cards numbered 11 to 15 with unknown weather, and a legend showing the three weather kinds: sunny, rainy, cloudy.">
      <svg viewBox="0 0 380 130" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {[11, 12, 13, 14, 15].map((dnum, i) => (
          <g key={dnum}>
            <rect x={16 + i * 70} y={14} width={58} height={66} rx={9} fill="white" stroke={INK} strokeWidth={2.2} />
            <text x={45 + i * 70} y={32} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>{dnum}</text>
            <text x={45 + i * 70} y={60} textAnchor="middle" dominantBaseline="central" fontSize={20} fill="#94A3B8">?</text>
          </g>
        ))}
        <text x={120} y={110} textAnchor="middle" fontSize={18}>☀️ ×2</text>
        <text x={190} y={110} textAnchor="middle" fontSize={18}>🌧️ ×2</text>
        <text x={260} y={110} textAnchor="middle" fontSize={18}>☁️ ×1</text>
      </svg>
    </Frame>
  )
}
