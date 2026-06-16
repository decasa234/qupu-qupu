import type { WmiChoice } from '../../../../types/wmi'

// CHOICE renderer for WMI-23F1A-Q14 (2023 Grade 1 Final): each option is an ODD
// two-digit number drawn in matchsticks as 7-segment digits. The question asks
// which option can be turned into an EVEN number by moving exactly ONE matchstick.
//
// The numbers are read straight from the scanned option images and hardcoded by
// label so the drawn matchstick digits can never drift from the printed paper:
//   A = 81   B = 25   C = 47   D = 59   E = 65   (all odd)
//
// THE PUZZLE (answer = D):
//   D = 59. Move the MIDDLE matchstick of the 9 down to the bottom-left position:
//   the 9 (segments a,b,c,d,f,g) loses g and gains e, becoming a 0 (a,b,c,d,e,f).
//   So 59 -> 50, which is EVEN, with exactly one stick moved inside the units digit.
//   This is the clean within-digit move the official solution intends.
//
// Segment labels (standard 7-segment):
//   a = top, b = top-right, c = bottom-right, d = bottom,
//   e = bottom-left, f = top-left, g = middle.

type Seg = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'

// Which segments each digit lights up.
const DIGIT_SEGMENTS: Record<string, Seg[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
}

// The two-digit number printed in each option, keyed by choice label.
const OPTION_NUMBER: Record<'A' | 'B' | 'C' | 'D' | 'E', string> = {
  A: '81',
  B: '25',
  C: '47',
  D: '59',
  E: '65',
}

// Geometry of one 7-segment cell (a single matchstick per segment).
const W = 34 // cell width  (horizontal stick length)
const H = 58 // cell height (two vertical stick spans)
const VLEN = H / 2 // vertical stick length

// Endpoint coordinates of each segment within a cell whose top-left is (0,0).
// Each segment is one matchstick: [x1, y1, x2, y2].
const SEG_LINE: Record<Seg, [number, number, number, number]> = {
  a: [0, 0, W, 0], // top
  b: [W, 0, W, VLEN], // top-right
  c: [W, VLEN, W, H], // bottom-right
  d: [0, H, W, H], // bottom
  e: [0, VLEN, 0, H], // bottom-left
  f: [0, 0, 0, VLEN], // top-left
  g: [0, VLEN, W, VLEN], // middle
}

const MATCH_TAN = '#C8943B' // matchstick wood
const MATCH_HEAD = '#3A322B' // dark match-head / burnt tip

// Draws one matchstick (a line with a round head at each end), like the scan.
function Matchstick({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
}) {
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={MATCH_TAN}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <circle cx={x1} cy={y1} r={3.6} fill={MATCH_HEAD} />
      <circle cx={x2} cy={y2} r={3.6} fill={MATCH_HEAD} />
    </g>
  )
}

// Draws a single digit as matchstick 7-segment, offset by (ox, oy).
function MatchDigit({ digit, ox, oy }: { digit: string; ox: number; oy: number }) {
  const segs = DIGIT_SEGMENTS[digit] ?? []
  return (
    <g transform={`translate(${ox} ${oy})`}>
      {segs.map((s) => {
        const [x1, y1, x2, y2] = SEG_LINE[s]
        return <Matchstick key={s} x1={x1} y1={y1} x2={x2} y2={y2} />
      })}
    </g>
  )
}

export default function MatchNum23G1Option({ choice }: { choice: WmiChoice }) {
  const label = (choice?.label ?? '') as 'A' | 'B' | 'C' | 'D' | 'E'
  const number = OPTION_NUMBER[label]
  if (!number) return <span>{choice?.text}</span>

  const PAD = 8 // headroom so match-heads / stroke caps never clip
  const GAP = 22 // space between the tens and units digit cells
  const digits = number.split('')
  const totalW = digits.length * W + (digits.length - 1) * GAP
  const vbW = totalW + PAD * 2
  const vbH = H + PAD * 2

  return (
    <span
      role="img"
      aria-label={`Pilihan ${label}: angka ${number} yang dibentuk dari batang korek api.`}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        width={Math.min(130, vbW * 1.4)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {digits.map((d, i) => (
          <MatchDigit key={i} digit={d} ox={PAD + i * (W + GAP)} oy={PAD} />
        ))}
      </svg>
    </span>
  )
}
