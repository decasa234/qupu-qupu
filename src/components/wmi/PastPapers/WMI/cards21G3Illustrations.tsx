// Static card illustrations for WMI-21F3A (2021 G3 final).

const INK = '#1F2937'
const BLUE = '#30598A'
const PINK = '#E75480'

function Frame({ aria, children }: { aria: string; children: React.ReactNode }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2" role="img" aria-label={aria}>
      {children}
    </div>
  )
}

function EquationCard({ text, aria, sub }: { text: string; aria: string; sub?: string }) {
  return (
    <Frame aria={aria}>
      <svg viewBox="0 0 380 72" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={8} y={8} width={364} height={sub ? 38 : 48} rx={10} fill="#FFF7E6" stroke="#E8965A" strokeWidth={2} />
        <text x={190} y={sub ? 28 : 33} textAnchor="middle" dominantBaseline="central" fontSize={sub ? 18 : 20} fontWeight={800} fill={INK} className="font-display">{text}</text>
        {sub && (
          <text x={190} y={60} textAnchor="middle" dominantBaseline="central" fontSize={12.5} fontWeight={700} fill="#6B7280" className="font-display">{sub}</text>
        )}
      </svg>
    </Frame>
  )
}

/** Q1 — plain computation. */
export function Compute21G3Illustration() {
  return <EquationCard text="3273 + 1258 − 2021 = ?" aria="Three thousand two hundred seventy-three plus one thousand two hundred fifty-eight minus two thousand twenty-one." />
}

/** Q2 — the 7-digit number with unknown digits A and B. */
export function DigitsAB21G3Illustration() {
  const digits = ['9', '8', 'A', '7', '5', 'B', '6']
  return (
    <Frame aria="The seven-digit number nine eight A seven five B six; B is three times A and A is odd.">
      <svg viewBox="0 0 330 96" width="100%" style={{ maxWidth: 350, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {digits.map((d, i) => {
          const unknown = d === 'A' || d === 'B'
          return (
            <g key={i}>
              <rect x={12 + i * 44} y={10} width={38} height={44} rx={7} fill={unknown ? '#FDE7EF' : '#E1EFFB'} stroke={unknown ? PINK : BLUE} strokeWidth={2} />
              <text x={31 + i * 44} y={33} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={900} fill={unknown ? PINK : BLUE} className="font-display">{d}</text>
            </g>
          )
        })}
        <text x={165} y={78} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} className="font-display">B = 3 × A,  A odd</text>
      </svg>
    </Frame>
  )
}

/** Q3 — keep A as 32 × 9. */
export function FactorNine21G3Illustration() {
  return <EquationCard text="32 × 9 = A      96 × 9 − A = ?" aria="Thirty-two times nine equals A; find ninety-six times nine minus A." sub="both terms share a factor 9" />
}

/** Q4 — 27 bags, 9 chocolates + 6 candies each, bundles of 3. */
export function Bundles21G3Illustration() {
  return (
    <Frame aria="A snack bag with nine chocolates and six candies, twenty-seven bags in all; chocolates are tied three to a bundle.">
      <svg viewBox="0 0 360 120" width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <path d="M 30 26 L 130 26 L 138 108 L 22 108 Z" fill="#FFF7E6" stroke="#E8965A" strokeWidth={2.4} />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={`c${i}`} cx={48 + (i % 3) * 22} cy={44 + Math.floor(i / 3) * 19} r={8} fill="#6B4423" stroke="#4A2C12" strokeWidth={1.3} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={`s${i}`} cx={114} cy={40 + i * 12.5} r={5.5} fill="#F9A8C9" stroke="#BE3A6C" strokeWidth={1.2} />
        ))}
        <text x={80} y={20} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={INK} className="font-display">9 🍫 + 6 🍬</text>
        <text x={196} y={66} textAnchor="middle" dominantBaseline="central" fontSize={17} fontWeight={900} fill={BLUE} className="font-display">× 27</text>
        <rect x={238} y={36} width={110} height={58} rx={10} fill="#E1EFFB" stroke={BLUE} strokeWidth={2} />
        {Array.from({ length: 3 }, (_, i) => (
          <circle key={i} cx={272 + i * 22} cy={60} r={8} fill="#6B4423" stroke="#4A2C12" strokeWidth={1.3} />
        ))}
        <path d="M 258 60 Q 294 84 330 60" fill="none" stroke={PINK} strokeWidth={2.4} />
        <text x={293} y={86} textAnchor="middle" fontSize={11} fontWeight={800} fill={INK} className="font-display">1 bundle = 3</text>
      </svg>
    </Frame>
  )
}

/** Q8 — the trip timeline. */
export function ClockTrip21G3Illustration() {
  const stop = (x: number, label: string, time: string) => (
    <g>
      <circle cx={x} cy={46} r={17} fill="#E1EFFB" stroke={BLUE} strokeWidth={2} />
      <text x={x} y={47} textAnchor="middle" dominantBaseline="central" fontSize={15}>{label}</text>
      <text x={x} y={78} textAnchor="middle" fontSize={13} fontWeight={900} fill={time === '?' ? '#D7263D' : BLUE} className="font-display">{time}</text>
    </g>
  )
  const arrow = (x1: number, x2: number, label: string) => (
    <g>
      <line x1={x1 + 22} y1={46} x2={x2 - 24} y2={46} stroke="#2E76C9" strokeWidth={2.6} />
      <polygon points={`${x2 - 20},46 ${x2 - 30},41 ${x2 - 30},51`} fill="#2E76C9" />
      <text x={(x1 + x2) / 2} y={30} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={INK} className="font-display">{label}</text>
    </g>
  )
  return (
    <Frame aria="A timeline: home at seven thirty, one hour forty-five minutes to the bank, forty minutes at the bank, leaving time unknown.">
      <svg viewBox="0 0 380 96" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {stop(46, '🏠', '7:30')}
        {arrow(46, 190, '1 h 45 min')}
        {stop(190, '🏦', '')}
        {arrow(190, 332, '40 min')}
        {stop(332, '🏦', '?')}
        <text x={190} y={94} textAnchor="middle" fontSize={11} fontWeight={700} fill="#6B7280" className="font-display">arrive → stay → leave</text>
      </svg>
    </Frame>
  )
}

/** Q9 — starfish and seahorse equations. */
function Starfish({ x, y, r }: { x: number; y: number; r: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (-90 + i * 36) * (Math.PI / 180)
    const rad = i % 2 === 0 ? r : r * 0.45
    return `${x + Math.cos(a) * rad},${y + Math.sin(a) * rad}`
  }).join(' ')
  return <polygon points={pts} fill="#F4A340" stroke="#B5651D" strokeWidth={1.6} />
}
function Seahorse({ x, y }: { x: number; y: number }) {
  return (
    <g stroke="#C2702E" fill="#F4A340" strokeWidth={1.6}>
      <path d={`M ${x} ${y - 14} q 10 -4 10 6 q 0 8 -6 10 q 8 2 8 10 q 0 10 -10 10 q -8 0 -8 -7 q -6 8 -2 14`} fill="none" strokeWidth={5} strokeLinecap="round" />
      <circle cx={x - 1} cy={y - 13} r={5.5} />
      <line x1={x - 6} y1={y - 15} x2={x - 13} y2={y - 16} strokeWidth={3} strokeLinecap="round" />
    </g>
  )
}
export function Starfish21G3Illustration() {
  return (
    <Frame aria="A starfish plus a starfish plus a starfish equals twenty-one; three hundred thirty-six divided by a starfish equals a seahorse.">
      <svg viewBox="0 0 360 130" width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <Starfish x={50} y={34} r={17} />
        <text x={80} y={35} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={900} fill={INK} className="font-display">+</text>
        <Starfish x={110} y={34} r={17} />
        <text x={140} y={35} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={900} fill={INK} className="font-display">+</text>
        <Starfish x={170} y={34} r={17} />
        <text x={222} y={35} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={900} fill={INK} className="font-display">= 21</text>
        <text x={86} y={96} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={900} fill={INK} className="font-display">336 ÷</text>
        <Starfish x={134} y={95} r={17} />
        <text x={164} y={96} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={900} fill={INK} className="font-display">=</text>
        <Seahorse x={196} y={92} />
        <text x={246} y={96} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={900} fill="#D7263D" className="font-display">= ?</text>
      </svg>
    </Frame>
  )
}

/** Q10 — archery score relations measured from Mike. */
export function Archery21G3Illustration() {
  const bar = (y: number, name: string, extra: number | null, color: string, note?: string) => (
    <g>
      <text x={66} y={y + 12} textAnchor="end" fontSize={12.5} fontWeight={800} fill={INK} className="font-display">{name}</text>
      <rect x={74} y={y} width={120} height={22} rx={5} fill="#E2E8F0" stroke={INK} strokeWidth={1.2} />
      {extra != null && extra > 0 && (
        <g>
          <rect x={194} y={y} width={extra} height={22} rx={5} fill={color} stroke={INK} strokeWidth={1.2} />
          <text x={194 + extra + 8} y={y + 12} dominantBaseline="central" fontSize={11.5} fontWeight={800} fill={INK} className="font-display">{note}</text>
        </g>
      )}
      {extra == null && (
        <text x={202} y={y + 12} dominantBaseline="central" fontSize={11.5} fontWeight={800} fill={INK} className="font-display">{note}</text>
      )}
    </g>
  )
  return (
    <Frame aria="Bars measured from Mike's score: Jerry sticks out one hundred twenty-three points, Nancy one hundred fifteen, Mike none; Vincent scored one hundred eight points.">
      <svg viewBox="0 0 380 130" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {bar(8, 'Jerry', 92, '#7EC8E3', '= Mike + 123')}
        {bar(38, 'Nancy', 86, '#8FD6A8', '= Mike + 115')}
        {bar(68, 'Mike', 0, '', '')}
        {bar(98, 'Vincent', null, '', '108 points')}
      </svg>
    </Frame>
  )
}

/** Q14 — the snaking deal order. */
export function SnakeDeal21G3Illustration() {
  const names = ['Ada', 'Ben', 'Carol', 'David']
  return (
    <Frame aria="Cards are dealt to Ada, Ben, Carol, David, then back: David, Carol, Ben, Ada — a snake that repeats every eight cards.">
      <svg viewBox="0 0 380 110" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {names.map((n, i) => (
          <g key={n}>
            <rect x={26 + i * 88} y={36} width={70} height={34} rx={9} fill={n === 'Ben' ? '#FFE9A8' : '#E1EFFB'} stroke={n === 'Ben' ? '#D97706' : BLUE} strokeWidth={2} />
            <text x={61 + i * 88} y={54} textAnchor="middle" dominantBaseline="central" fontSize={13.5} fontWeight={800} fill={INK} className="font-display">{n}</text>
          </g>
        ))}
        <path d="M 60 32 Q 190 4 320 32" fill="none" stroke="#2E76C9" strokeWidth={2.4} markerEnd="none" />
        <polygon points="324,34 312,28 314,40" fill="#2E76C9" />
        <text x={190} y={14} textAnchor="middle" fontSize={11} fontWeight={800} fill="#2E76C9" className="font-display">1 2 3 4 →</text>
        <path d="M 320 74 Q 190 102 60 74" fill="none" stroke="#D7263D" strokeWidth={2.4} />
        <polygon points="56,72 68,68 66,80" fill="#D7263D" />
        <text x={190} y={102} textAnchor="middle" fontSize={11} fontWeight={800} fill="#D7263D" className="font-display">← 5 6 7 8, then repeat</text>
      </svg>
    </Frame>
  )
}

/** Q16 — the all-sevens expression. */
export function SevenChain21G3Illustration() {
  return <EquationCard text="77 + 77 ÷ 7 + 7 × 77 − 7 = ?" aria="Seventy-seven plus seventy-seven divided by seven plus seven times seventy-seven minus seven." sub="÷ and × before + and −" />
}

/** Q17 — even sum divided by odd sum. */
export function EvenSum21G3Illustration() {
  return <EquationCard text="(2 + 4 + 6 + … + 98) ÷ (9 + 7 + 5 + 3 + 1)" aria="The sum of the even numbers from two to ninety-eight, divided by nine plus seven plus five plus three plus one." />
}

/** Q22 — two 2-digit factors of 2021. */
export function Factor202121G3Illustration() {
  return <EquationCard text="□□ × □□ = 2021" aria="Two two-digit numbers multiply to two thousand twenty-one; find their sum." sub="hunt near √2021 ≈ 45" />
}

/** Q23 — the 1–9 triple A, 2A, 3A. */
export function TripleABC21G3Illustration() {
  return (
    <Frame aria="Three three-digit numbers A, B and C use the digits one to nine once each, with B twice A and C three times A; example two nineteen, four thirty-eight, six fifty-seven.">
      <svg viewBox="0 0 360 104" width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {(['A', 'B = 2A', 'C = 3A'] as const).map((t, i) => (
          <g key={t}>
            <rect x={28 + i * 112} y={12} width={92} height={36} rx={9} fill="#E1EFFB" stroke={BLUE} strokeWidth={2} />
            <text x={74 + i * 112} y={31} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={900} fill={BLUE} className="font-display">{t}</text>
          </g>
        ))}
        <text x={180} y={68} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={INK} className="font-display">digits 1–9, each exactly once</text>
        <text x={180} y={90} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#6B7280" className="font-display">example: 219, 438, 657</text>
      </svg>
    </Frame>
  )
}
