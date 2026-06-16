// Static card illustrations for WMI-20F3A (2020 G3 final), reconstructed from
// the paper scans. Simple questions get a clean visual anchor; the heavier
// figures live in scenes20G3Illustrations / puzzles20G3Illustrations.

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

/** Q1 — the bare computation on a card. */
export function SumCard20G3Illustration() {
  return (
    <Frame aria="The computation 456 minus 89 plus 321.">
      <svg viewBox="0 0 360 64" width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={8} y={8} width={344} height={48} rx={10} fill="#FFF7E6" stroke="#E8965A" strokeWidth={2} />
        <text x={180} y={33} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill={INK} className="font-display">
          456 − 89 + 321 = ?
        </text>
      </svg>
    </Frame>
  )
}

/** Q3 — the empty box that must stay under 300. */
export function BoxUnder300G3Illustration() {
  return (
    <Frame aria="An empty box followed by: less than 300.">
      <svg viewBox="0 0 320 72" width="100%" style={{ maxWidth: 340, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={24} y={12} width={120} height={48} rx={10} fill="white" stroke="#F4B400" strokeWidth={3.5} />
        <text x={84} y={37} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill="#94A3B8" className="font-display">?</text>
        <text x={220} y={37} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={800} fill={INK} className="font-display">&lt; 300</text>
      </svg>
    </Frame>
  )
}

/** Q4 — the four fractions as comparison bars. */
const FRACTIONS: Array<{ label: string; num: number; den: number; color: string }> = [
  { label: '4/9', num: 4, den: 9, color: '#19A7CE' },
  { label: '12/27', num: 12, den: 27, color: '#8E7CC3' },
  { label: '4/5', num: 4, den: 5, color: '#E8965A' },
  { label: '3/9', num: 3, den: 9, color: '#10B981' },
]
export function FractionBarsG3Illustration() {
  const W = 250
  return (
    <Frame aria="Four bars showing the fractions four ninths, twelve twenty-sevenths, four fifths, and three ninths. The three-ninths bar is the shortest fill.">
      <svg viewBox="0 0 360 140" width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {FRACTIONS.map((f, i) => {
          const y = 10 + i * 32
          return (
            <g key={f.label}>
              <text x={48} y={y + 11} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={800} fill={INK} className="font-display">{f.label}</text>
              <rect x={80} y={y} width={W} height={22} rx={5} fill="#F1F5F9" stroke={INK} strokeWidth={1.4} />
              <rect x={80} y={y} width={(W * f.num) / f.den} height={22} rx={5} fill={f.color} opacity={0.85} />
              {Array.from({ length: f.den - 1 }, (_, k) => (
                <line key={k} x1={80 + ((k + 1) * W) / f.den} y1={y} x2={80 + ((k + 1) * W) / f.den} y2={y + 22} stroke="white" strokeWidth={1} />
              ))}
            </g>
          )
        })}
      </svg>
    </Frame>
  )
}

/** Q6 — five mystery odd boxes balancing on the middle. */
export function OddRunG3Illustration() {
  return (
    <Frame aria="Five boxes in a row labelled question marks with plus-two steps between, summing to 745.">
      <svg viewBox="0 0 380 96" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={16 + i * 72} y={26} width={56} height={40} rx={8} fill={i === 2 ? '#E1EFFB' : 'white'} stroke={i === 2 ? BLUE : INK} strokeWidth={2.2} />
            <text x={44 + i * 72} y={47} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={800} fill={i === 2 ? BLUE : '#94A3B8'} className="font-display">?</text>
            {i < 4 && <text x={74 + i * 72} y={18} textAnchor="middle" fontSize={11} fontWeight={800} fill={PINK}>+2</text>}
          </g>
        ))}
        <text x={190} y={86} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK} className="font-display">? + ? + ? + ? + ? = 745</text>
      </svg>
    </Frame>
  )
}

/** Q9 — departure clock and the +35 minutes trip. */
export function TripTimeG3Illustration() {
  return (
    <Frame aria="A clock showing seven forty-two, an arrow labelled plus thirty-five minutes, and a question mark clock.">
      <svg viewBox="0 0 360 110" width="100%" style={{ maxWidth: 380, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <circle cx={70} cy={52} r={40} fill="white" stroke={INK} strokeWidth={3} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30 - 90) * (Math.PI / 180)
          return <line key={i} x1={70 + Math.cos(a) * 33} y1={52 + Math.sin(a) * 33} x2={70 + Math.cos(a) * 37} y2={52 + Math.sin(a) * 37} stroke={INK} strokeWidth={2} />
        })}
        {/* 7:42 — hour hand near 8, minute hand at 42 min (252°) */}
        <line x1={70} y1={52} x2={70 + Math.cos((222 - 90) * Math.PI / 180) * 20} y2={52 + Math.sin((222 - 90) * Math.PI / 180) * 20} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <line x1={70} y1={52} x2={70 + Math.cos((252 - 90) * Math.PI / 180) * 30} y2={52 + Math.sin((252 - 90) * Math.PI / 180) * 30} stroke={PINK} strokeWidth={3} strokeLinecap="round" />
        <text x={70} y={102} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK} className="font-display">7:42</text>
        <path d="M 130 52 H 215" stroke={BLUE} strokeWidth={2.6} />
        <polygon points="215,46 228,52 215,58" fill={BLUE} />
        <text x={176} y={36} textAnchor="middle" fontSize={13} fontWeight={800} fill={BLUE} className="font-display">+35 min</text>
        <circle cx={285} cy={52} r={40} fill="white" stroke={INK} strokeWidth={3} />
        <text x={285} y={52} textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={800} fill={PINK} className="font-display">?</text>
      </svg>
    </Frame>
  )
}

/** Q10 — the 13 × 7 rectangle and the equal-perimeter square. */
export function PerimeterSquareG3Illustration() {
  return (
    <Frame aria="A rectangle thirteen by seven centimetres and a square with a question mark, joined by the words same perimeter.">
      <svg viewBox="0 0 380 130" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={22} y={36} width={156} height={84} fill="#FDE7EF" stroke={INK} strokeWidth={2.4} />
        <text x={100} y={28} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>13 cm</text>
        <text x={196} y={78} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>7 cm</text>
        <text x={258} y={20} textAnchor="middle" fontSize={12} fontWeight={800} fill={BLUE} className="font-display">same perimeter</text>
        <rect x={262} y={36} width={84} height={84} fill="#E7F0DC" stroke={INK} strokeWidth={2.4} />
        <text x={304} y={78} textAnchor="middle" dominantBaseline="central" fontSize={24} fontWeight={800} fill={INK} className="font-display">?</text>
      </svg>
    </Frame>
  )
}

/** Q11 — the four equations on cards. */
export function FourLawsG3Illustration() {
  const rows = ['(A) 6 × 9 = 9 × 6', '(B) (4 × 8) × 2 = 4 × (8 × 2)', '(C) 1 + 4 × 3 = 15', '(D) 5 × 4 − 5 × 1 = 5 × (4 − 1)']
  return (
    <Frame aria="Four equation cards labelled A to D; one of them is wrong.">
      <svg viewBox="0 0 380 150" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {rows.map((s, i) => (
          <g key={i}>
            <rect x={14} y={8 + i * 35} width={352} height={28} rx={8} fill={i === 2 ? '#FFF1F2' : '#F8FAFC'} stroke={i === 2 ? '#FB7185' : '#CBD5E1'} strokeWidth={1.6} />
            <text x={190} y={22 + i * 35} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={700} fill={INK} className="font-display">{s}</text>
          </g>
        ))}
      </svg>
    </Frame>
  )
}

/** Q12 — the division boxes and the number chips. */
export function DivisionChipsG3Illustration() {
  const nums = [3, 6, 7, 8, 15, 25, 48, 54, 72, 91]
  return (
    <Frame aria="The equation box divided by box equals box, with ten number chips: 3, 6, 7, 8, 15, 25, 48, 54, 72, 91.">
      <svg viewBox="0 0 400 122" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {[120, 200, 292].map((x, i) => (
          <rect key={i} x={x - 24} y={12} width={48} height={40} rx={8} fill="white" stroke={INK} strokeWidth={2.4} />
        ))}
        <text x={160} y={33} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>÷</text>
        <text x={246} y={33} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill={INK}>=</text>
        <rect x={14} y={68} width={372} height={42} rx={10} fill="#E7F0DC" />
        {nums.map((n, i) => (
          <text key={n} x={36 + i * 37} y={89} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill={INK} className="font-display">{n}</text>
        ))}
      </svg>
    </Frame>
  )
}

/** Q15 — the ten-digit strip with the five kept digits ringed. */
export function DigitStripG3Illustration() {
  const digits = '7503375812'.split('')
  const kept = new Set([3, 4, 6, 8, 9]) // 3,3,5,1,2 → 33512
  return (
    <Frame aria="The ten digits seven five zero three three seven five eight one two; the kept digits three three five one two are circled.">
      <svg viewBox="0 0 400 86" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {digits.map((d, i) => (
          <g key={i}>
            <rect x={12 + i * 38} y={18} width={32} height={40} rx={6} fill={kept.has(i) ? '#D1FAE5' : 'white'} stroke={kept.has(i) ? '#10B981' : INK} strokeWidth={kept.has(i) ? 2.6 : 1.8} />
            <text x={28 + i * 38} y={39} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={800} fill={kept.has(i) ? '#065F46' : INK} className="font-display">{d}</text>
          </g>
        ))}
        <text x={200} y={74} textAnchor="middle" fontSize={12.5} fontWeight={800} fill="#6B7280" className="font-display">keep 5 digits in order → smallest number</text>
      </svg>
    </Frame>
  )
}

/** Q16 — the long 99 + 9 sum. */
export function NinetyNinesG3Illustration() {
  return (
    <Frame aria="Six 99s and three 9s to add.">
      <svg viewBox="0 0 400 88" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <rect x={14 + i * 50} y={10} width={42} height={30} rx={7} fill="#FFE3E3" stroke="#D7263D" strokeWidth={1.8} />
            <text x={35 + i * 50} y={26} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill="#7A0C1E" className="font-display">99</text>
          </g>
        ))}
        {Array.from({ length: 3 }, (_, i) => (
          <g key={i}>
            <rect x={100 + i * 50} y={48} width={42} height={30} rx={7} fill="#E1EFFB" stroke={BLUE} strokeWidth={1.8} />
            <text x={121 + i * 50} y={64} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={800} fill={BLUE} className="font-display">9</text>
          </g>
        ))}
        <text x={290} y={64} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={800} fill={INK} className="font-display">= ?</text>
      </svg>
    </Frame>
  )
}

/** Q18 — the two subtractions: wrong (written) vs original. */
export function DigitErrorsG3Illustration() {
  return (
    <Frame aria="A subtraction where a tens digit 1 of the top number and a units digit 1 of the bottom number were both written as 7, giving 380.">
      <svg viewBox="0 0 380 120" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <text x={100} y={20} textAnchor="middle" fontSize={13} fontWeight={800} fill="#D7263D" className="font-display">written (wrong)</text>
        <text x={100} y={46} textAnchor="middle" fontSize={18} fontWeight={800} fill={INK} className="font-display">□ 7 □ − □ □ 7</text>
        <text x={100} y={74} textAnchor="middle" fontSize={16} fontWeight={800} fill="#D7263D" className="font-display">= 380</text>
        <text x={280} y={20} textAnchor="middle" fontSize={13} fontWeight={800} fill="#10B981" className="font-display">original</text>
        <text x={280} y={46} textAnchor="middle" fontSize={18} fontWeight={800} fill={INK} className="font-display">□ 1 □ − □ □ 1</text>
        <text x={280} y={74} textAnchor="middle" fontSize={16} fontWeight={800} fill="#10B981" className="font-display">= ?</text>
        <text x={190} y={104} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#6B7280" className="font-display">both 1s were copied as 7s</text>
      </svg>
    </Frame>
  )
}

/** Q19 — the two shape multiplications side by side. */
export function CryptarithmG3Illustration() {
  return (
    <Frame aria="Left: triangle one square times five equals star square star. Right: triangle star times star square equals question mark.">
      <svg viewBox="0 0 380 130" width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <g className="font-display">
          <text x={100} y={28} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK}>△ 1 □</text>
          <text x={100} y={58} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK}>× 5</text>
          <line x1={40} y1={70} x2={160} y2={70} stroke={INK} strokeWidth={2.4} />
          <text x={100} y={94} textAnchor="middle" fontSize={22} fontWeight={800} fill={PINK}>☆ □ ☆</text>
          <text x={280} y={28} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK}>△ ☆</text>
          <text x={280} y={58} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK}>× ☆ □</text>
          <line x1={220} y1={70} x2={340} y2={70} stroke={INK} strokeWidth={2.4} />
          <rect x={252} y={78} width={56} height={30} rx={7} fill="#CDEBFA" stroke="#19A7CE" strokeWidth={2} />
          <text x={280} y={94} textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill={INK}>?</text>
        </g>
      </svg>
    </Frame>
  )
}

/** Q24 — the password clue box. */
export function PasswordCluesG3Illustration() {
  return (
    <Frame aria="Clue box: five times five equals five; seven times seven times seven equals six; three times seven equals three; open paren three plus seven plus five close paren times nine equals five nine. Below: the password written 79536 with five empty boxes.">
      <svg viewBox="0 0 400 150" width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }} aria-hidden="true">
        <rect x={20} y={8} width={360} height={78} rx={10} fill="#FDEBD3" stroke="#E8965A" strokeWidth={2.2} />
        <g className="font-display" fontWeight={800} fill={INK}>
          <text x={110} y={34} textAnchor="middle" fontSize={16}>5 × 5 = 5</text>
          <text x={285} y={34} textAnchor="middle" fontSize={16}>7 × 7 × 7 = 6</text>
          <text x={110} y={66} textAnchor="middle" fontSize={16}>3 × 7 = 3</text>
          <text x={285} y={66} textAnchor="middle" fontSize={16}>(3 + 7 + 5) × 9 = 59</text>
        </g>
        <text x={108} y={120} textAnchor="middle" fontSize={20} fontWeight={800} fill={INK} className="font-display">79536 ➜</text>
        {Array.from({ length: 5 }, (_, i) => (
          <rect key={i} x={170 + i * 38} y={100} width={32} height={34} rx={5} fill="white" stroke={INK} strokeWidth={2.2} />
        ))}
      </svg>
    </Frame>
  )
}

/** Q25 — the 3×3 digit grid plus single digit summing to 999. */
export function SumGrid999G3Illustration() {
  return (
    <Frame aria="Three rows of three boxes (a six placed in the middle), plus a single box, adding to nine nine nine.">
      <svg viewBox="0 0 280 200" width="100%" style={{ maxWidth: 280, display: 'block', margin: '0 auto' }} aria-hidden="true">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <g key={`${r}-${c}`}>
              <rect x={90 + c * 46} y={8 + r * 42} width={36} height={34} rx={6} fill={r === 1 && c === 1 ? '#E1EFFB' : 'white'} stroke={INK} strokeWidth={2.2} />
              {r === 1 && c === 1 && (
                <text x={108 + c * 46} y={25 + r * 42} textAnchor="middle" dominantBaseline="central" fontSize={19} fontWeight={800} fill={BLUE} className="font-display">6</text>
              )}
            </g>
          )),
        )}
        <text x={66} y={147} textAnchor="middle" fontSize={22} fontWeight={800} fill={INK}>+</text>
        <rect x={182} y={130} width={36} height={34} rx={6} fill="white" stroke={INK} strokeWidth={2.2} />
        <line x1={56} y1={172} x2={232} y2={172} stroke={INK} strokeWidth={2.6} />
        <g className="font-display" fontWeight={800} fontSize={20} fill={INK}>
          <text x={108} y={189} textAnchor="middle">9</text>
          <text x={154} y={189} textAnchor="middle">9</text>
          <text x={200} y={189} textAnchor="middle">9</text>
        </g>
      </svg>
    </Frame>
  )
}
