// In-card illustration for WMI-25F3A-Q13 (2025 Grade-3 Final).
//
// The printed stem shows two coins side by side, each with a picture on its
// face — a SEAHORSE (orange) on the left coin and a CRAB (red) on the right —
// with curved arrows above suggesting both coins spin. Reconstructed straight
// from db/seed/wmi/figures/2025-final-g3-a-q13.jpg.
//
// Mechanics: each coin spins about its VERTICAL diameter (it flips like a
// tossed coin). During that spin you see the face image at every rotation
// about that axis, which means you can see the picture either UPRIGHT or
// LEFT-RIGHT MIRRORED (plus all the thin in-between edge views), but you can
// NEVER see it turned upside-down. So a "spin view" of the pair is reachable
// iff EACH coin's picture is in {upright, horizontally-mirrored}.
//
// The five options A–E each show the seahorse + crab in some orientation:
//   A  seahorse upright,  crab upright          → reachable
//   B  seahorse mirrored, crab upright          → reachable
//   C  seahorse upright,  crab mirrored         → reachable
//   D  seahorse upright,  crab UPSIDE-DOWN      → NOT reachable  (answer)
//   E  seahorse mirrored, crab mirrored         → reachable
//
// The static figure NEVER marks which option is impossible — that is the
// animator's job after the answer is revealed. Each option chip simply shows
// the two oriented coins.

const SEAHORSE = '#f0853a' // qupu-brand-orange
const SEAHORSE_DARK = '#c8631f'
const CRAB = '#d8352a'
const CRAB_DARK = '#a3211a'
const COIN_RING = '#1F2937'

// Per-coin orientation. A spinning coin can only reach 'up' or 'mirror'
// (horizontal flip). 'flip' (upside-down) is what makes an option impossible.
export type CoinFlip = 'up' | 'mirror' | 'flip'

export interface CoinView {
  sea: CoinFlip
  crab: CoinFlip
}

// Each option as a pair of orientations. Co-exported so any future explainer
// and the per-option CHOICE renderer bind to the same source of truth.
export const COIN_OPTIONS25G3: Record<'A' | 'B' | 'C' | 'D' | 'E', CoinView> = {
  A: { sea: 'up', crab: 'up' },
  B: { sea: 'mirror', crab: 'up' },
  C: { sea: 'up', crab: 'mirror' },
  D: { sea: 'up', crab: 'flip' },
  E: { sea: 'mirror', crab: 'mirror' },
}

const FLIP_LABEL_ID: Record<CoinFlip, string> = {
  up: 'tegak',
  mirror: 'dicerminkan kiri-kanan',
  flip: 'terbalik',
}

function viewAria(label: string, v: CoinView): string {
  return `${label}: kuda laut ${FLIP_LABEL_ID[v.sea]}, kepiting ${FLIP_LABEL_ID[v.crab]}`
}

// Transform string for an orientation, applied around the glyph centre (cx,cy).
function orientTransform(flip: CoinFlip, cx: number, cy: number): string | undefined {
  if (flip === 'up') return undefined
  if (flip === 'mirror') return `translate(${cx},${cy}) scale(-1,1) translate(${-cx},${-cy})`
  // 'flip' = upside-down (180° turn)
  return `rotate(180 ${cx} ${cy})`
}

// Stylised seahorse drawn in a box roughly [-r, r] around (cx, cy).
function SeahorseGlyph({ cx, cy, r, flip }: { cx: number; cy: number; r: number; flip: CoinFlip }) {
  const s = r / 18 // glyph authored on an 18px radius
  return (
    <g transform={orientTransform(flip, cx, cy)}>
      <g transform={`translate(${cx},${cy}) scale(${s})`}>
        {/* curled body + tail */}
        <path
          d="M2,-16
             C9,-15 10,-7 5,-3
             C2,0 0,3 1,7
             C2,11 6,12 6,15
             C6,17 3,17 1,16
             C-3,14 -4,9 -3,5
             C-2,0 1,-2 0,-6
             C-1,-9 -4,-9 -5,-12
             C-6,-15 -2,-16 2,-16 Z"
          fill={SEAHORSE}
          stroke={SEAHORSE_DARK}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        {/* snout */}
        <path d="M2,-16 C-3,-17 -7,-15 -8,-12 C-6,-12 -4,-13 -2,-13 Z" fill={SEAHORSE} stroke={SEAHORSE_DARK} strokeWidth={1.2} strokeLinejoin="round" />
        {/* dorsal fin */}
        <path d="M5,-3 C9,-4 11,-1 11,3 C8,1 6,1 4,2 Z" fill={SEAHORSE} stroke={SEAHORSE_DARK} strokeWidth={1.2} strokeLinejoin="round" />
        {/* eye */}
        <circle cx={-2.5} cy={-12.5} r={1.4} fill={SEAHORSE_DARK} />
      </g>
    </g>
  )
}

// Stylised crab drawn in a box roughly [-r, r] around (cx, cy).
function CrabGlyph({ cx, cy, r, flip }: { cx: number; cy: number; r: number; flip: CoinFlip }) {
  const s = r / 18
  return (
    <g transform={orientTransform(flip, cx, cy)}>
      <g transform={`translate(${cx},${cy}) scale(${s})`}>
        {/* legs (4 each side) */}
        {[-1, 1].map((side) =>
          [0, 1, 2, 3].map((i) => {
            const y = -3 + i * 4.5
            return (
              <path
                key={`${side}-${i}`}
                d={`M${side * 6},${y} C${side * 12},${y - 1} ${side * 15},${y + 3} ${side * 16},${y + 5}`}
                fill="none"
                stroke={CRAB_DARK}
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            )
          }),
        )}
        {/* claws */}
        {[-1, 1].map((side) => (
          <g key={`claw-${side}`}>
            <path d={`M${side * 6},-3 C${side * 13},-9 ${side * 17},-9 ${side * 18},-13`} fill="none" stroke={CRAB_DARK} strokeWidth={1.8} strokeLinecap="round" />
            <path
              d={`M${side * 18},-13 C${side * 21},-16 ${side * 16},-18 ${side * 14},-15 C${side * 12},-13 ${side * 15},-11 ${side * 18},-13 Z`}
              fill={CRAB}
              stroke={CRAB_DARK}
              strokeWidth={1.2}
              strokeLinejoin="round"
            />
          </g>
        ))}
        {/* shell */}
        <path
          d="M0,-7
             C9,-7 13,-1 12,4
             C11,8 6,10 0,10
             C-6,10 -11,8 -12,4
             C-13,-1 -9,-7 0,-7 Z"
          fill={CRAB}
          stroke={CRAB_DARK}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
        {/* eyes */}
        <circle cx={-3.5} cy={-6} r={1.6} fill="white" stroke={CRAB_DARK} strokeWidth={0.9} />
        <circle cx={3.5} cy={-6} r={1.6} fill="white" stroke={CRAB_DARK} strokeWidth={0.9} />
        <circle cx={-3.5} cy={-6} r={0.7} fill={CRAB_DARK} />
        <circle cx={3.5} cy={-6} r={0.7} fill={CRAB_DARK} />
      </g>
    </g>
  )
}

// A single coin: ring + one animal glyph in the given orientation.
export function CoinFace({ cx, cy, r, animal, flip }: { cx: number; cy: number; r: number; animal: 'sea' | 'crab'; flip: CoinFlip }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="white" stroke={COIN_RING} strokeWidth={r * 0.12} />
      {animal === 'sea' ? (
        <SeahorseGlyph cx={cx} cy={cy} r={r * 0.62} flip={flip} />
      ) : (
        <CrabGlyph cx={cx} cy={cy} r={r * 0.6} flip={flip} />
      )}
    </g>
  )
}

// Curved double-headed rotation arrow above a coin, hinting the spin.
function SpinArrow({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  // a wide shallow arc spanning the top of the coin, arrowheads at both ends
  const x1 = cx - r * 0.95
  const x2 = cx + r * 0.95
  const yTop = cy - r * 0.55
  const sweep = r * 0.55
  return (
    <g stroke={COIN_RING} strokeWidth={r * 0.085} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M${x1},${yTop} C${cx - r * 0.4},${yTop - sweep} ${cx + r * 0.4},${yTop - sweep} ${x2},${yTop}`} />
      <path d={`M${x1},${yTop} l ${r * 0.18},${-r * 0.16} M${x1},${yTop} l ${r * 0.22},${r * 0.05}`} />
      <path d={`M${x2},${yTop} l ${-r * 0.18},${-r * 0.16} M${x2},${yTop} l ${-r * 0.22},${r * 0.05}`} />
    </g>
  )
}

// The two-coin problem stem for the card: seahorse coin + crab coin, both
// upright, with spin arrows. Never reveals which option is impossible.
export default function Coin25G3Illustration() {
  const R = 46
  const gap = 28
  const pad = 14
  const arrowH = 26
  const W = pad * 2 + R * 4 + gap
  const H = pad * 2 + arrowH + R * 2
  const cyCoin = pad + arrowH + R
  const cxLeft = pad + R
  const cxRight = pad + R * 3 + gap

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Dua koin yang berputar: koin kiri bergambar kuda laut, koin kanan bergambar kepiting. Cari tampilan yang tidak mungkin terjadi saat keduanya berputar."
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: Math.min(280, W), display: 'block', margin: '0 auto' }}
        aria-hidden="true"
      >
        <SpinArrow cx={cxLeft} cy={cyCoin - R} r={R} />
        <SpinArrow cx={cxRight} cy={cyCoin - R} r={R} />
        <CoinFace cx={cxLeft} cy={cyCoin} r={R} animal="sea" flip="up" />
        <CoinFace cx={cxRight} cy={cyCoin} r={R} animal="crab" flip="up" />
      </svg>
    </div>
  )
}

// CHOICE_RENDERERS component: draws ONE option (the two oriented coins) given
// its label, so the answer chips show the figure instead of a bare letter.
// Falls back to plain choice text for any unexpected label so previews stay safe.
export function Coin25G3Option({ choice }: { choice: { label: string; text: string } }) {
  const label = (choice?.label ?? '') as 'A' | 'B' | 'C' | 'D' | 'E'
  const view = COIN_OPTIONS25G3[label]
  if (!view) return <span>{choice?.text}</span>
  const r = 26
  const gap = 12
  const pad = 6
  const W = pad * 2 + r * 4 + gap
  const H = pad * 2 + r * 2
  const cy = pad + r
  const cxLeft = pad + r
  const cxRight = pad + r * 3 + gap
  return (
    <span role="img" aria-label={`Pilihan ${viewAria(label, view)}.`} style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={Math.min(132, W)} style={{ display: 'block' }} aria-hidden="true">
        <CoinFace cx={cxLeft} cy={cy} r={r} animal="sea" flip={view.sea} />
        <CoinFace cx={cxRight} cy={cy} r={r} animal="crab" flip={view.crab} />
      </svg>
    </span>
  )
}
