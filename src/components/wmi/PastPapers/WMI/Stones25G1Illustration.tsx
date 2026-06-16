// Static card illustration for WMI-25F1A-Q1 (2025 G1 final).
//
// The figure is a single horizontal row of 14 birds, with a "Left" label at the
// far-left end and a "Right" label at the far-right end. Thirteen of them are
// small bullfinches (red breast, blue wing, black head); ONE of them — the 10th
// from the left — is a big toucan (yellow beak). So the row reads:
//
//   Left  [bf bf bf bf bf bf bf bf bf]  [TOUCAN]  [bf bf bf bf]  Right
//          \________ 9 birds ________/             \__ 4 birds _/
//
// The answer (9, choice C) is the count of small birds to the LEFT of the toucan.
// (Total small birds = 13; to the right of the toucan = 4.) This component draws
// ONLY the row exactly as scanned — it never highlights the toucan, the left
// group, or otherwise reveals the count.
//
// The slug "stones" is a carry-over from the OCR'd brief (the layout was first
// guessed as a board of black/white stones with a Left/Right split). The actual
// scan is a bird row, so we draw birds; the Left/Right split that yields 9 is the
// same idea. Post-answer, the animator lights the nine left birds via the
// co-exported primitive `Stones25G1`'s `litStones` prop.
//
// Pure render — no random, no dates, SSR-safe & deterministic. The primitive
// falls back to an empty lit set when given the wrong shape so previews render.

const INK = '#1F2937'
const BLUE = '#30598A' // qupu-brand-blue (bullfinch wing + outlines)
const RED = '#d8654a' // salmon-red breast (matches the source birds)
const BLACK = '#222831' // head / tail
const WHITE = '#FFFFFF'
const YELLOW = '#F4B400' // qupu-brand-yellow (toucan beak)
const ORANGE = '#f0853a' // qupu-brand-orange (lit highlight, animator only)
const LIT_FILL = '#FDE3CF' // peach wash behind a lit bird (animator only)
const LABEL_FILL = '#DBE7D4' // soft sage pill behind the Left / Right labels

// The 14-figure row, left to right. ids are stable so the animator can target
// individual birds. The toucan sits at index 9 (the 10th figure).
const TOUCAN_INDEX = 9
const ROW_LENGTH = 14
export const STONE_IDS: string[] = Array.from({ length: ROW_LENGTH }, (_, i) =>
  i === TOUCAN_INDEX ? 'toucan' : `b${i}`,
)

/** One small bullfinch: black head + tail, red breast, blue wing, white wing-bar. */
function Bullfinch({ x, y, s, lit }: { x: number; y: number; s: number; lit: boolean }) {
  // s = body scale (full bird ~ 2.0*s wide). Drawn facing right.
  const cx = x
  const cy = y
  const bodyR = 12 * s
  const stroke = lit ? ORANGE : INK
  const strokeW = lit ? 2.4 : 1.6
  return (
    <g>
      {/* tail — black wedge sweeping back-left */}
      <path
        d={`M ${cx - bodyR * 0.4} ${cy + bodyR * 0.2}
            L ${cx - bodyR * 2.0} ${cy + bodyR * 0.95}
            L ${cx - bodyR * 0.9} ${cy + bodyR * 0.9} Z`}
        fill={BLACK}
        stroke={stroke}
        strokeWidth={strokeW * 0.7}
        strokeLinejoin="round"
      />
      {/* red breast / body */}
      <circle cx={cx} cy={cy + bodyR * 0.15} r={bodyR} fill={RED} stroke={stroke} strokeWidth={strokeW} />
      {/* blue wing over the back */}
      <path
        d={`M ${cx - bodyR * 0.95} ${cy - bodyR * 0.05}
            Q ${cx - bodyR * 0.2} ${cy - bodyR * 0.7} ${cx + bodyR * 0.85} ${cy - bodyR * 0.1}
            Q ${cx} ${cy + bodyR * 0.2} ${cx - bodyR * 0.95} ${cy - bodyR * 0.05} Z`}
        fill={BLUE}
        stroke={stroke}
        strokeWidth={strokeW * 0.7}
        strokeLinejoin="round"
      />
      {/* white wing-bar */}
      <path
        d={`M ${cx - bodyR * 0.55} ${cy - bodyR * 0.02}
            L ${cx - bodyR * 0.05} ${cy + bodyR * 0.05}
            L ${cx - bodyR * 0.35} ${cy + bodyR * 0.2} Z`}
        fill={WHITE}
      />
      {/* black head */}
      <circle cx={cx + bodyR * 0.85} cy={cy - bodyR * 0.35} r={bodyR * 0.62} fill={BLACK} stroke={stroke} strokeWidth={strokeW * 0.7} />
      {/* eye */}
      <circle cx={cx + bodyR * 1.0} cy={cy - bodyR * 0.45} r={bodyR * 0.1} fill={WHITE} />
      {/* short beak */}
      <path
        d={`M ${cx + bodyR * 1.45} ${cy - bodyR * 0.3}
            L ${cx + bodyR * 1.85} ${cy - bodyR * 0.2}
            L ${cx + bodyR * 1.45} ${cy - bodyR * 0.05} Z`}
        fill={BLACK}
      />
      {/* legs */}
      <line x1={cx - bodyR * 0.1} y1={cy + bodyR * 1.1} x2={cx - bodyR * 0.1} y2={cy + bodyR * 1.6} stroke={BLACK} strokeWidth={strokeW * 0.6} />
      <line x1={cx + bodyR * 0.35} y1={cy + bodyR * 1.1} x2={cx + bodyR * 0.35} y2={cy + bodyR * 1.6} stroke={BLACK} strokeWidth={strokeW * 0.6} />
    </g>
  )
}

/** The toucan: bigger black body, white face patch, large yellow beak. */
function Toucan({ x, y, s, lit }: { x: number; y: number; s: number; lit: boolean }) {
  const cx = x
  const cy = y
  const bodyR = 15 * s
  const stroke = lit ? ORANGE : INK
  const strokeW = lit ? 2.6 : 1.8
  return (
    <g>
      {/* black body */}
      <ellipse cx={cx} cy={cy + bodyR * 0.25} rx={bodyR * 0.95} ry={bodyR * 1.05} fill={BLACK} stroke={stroke} strokeWidth={strokeW} />
      {/* white / yellow face patch */}
      <path
        d={`M ${cx - bodyR * 0.1} ${cy - bodyR * 0.9}
            Q ${cx + bodyR * 0.9} ${cy - bodyR * 0.9} ${cx + bodyR * 0.85} ${cy - bodyR * 0.1}
            Q ${cx + bodyR * 0.3} ${cy + bodyR * 0.1} ${cx - bodyR * 0.1} ${cy - bodyR * 0.9} Z`}
        fill={YELLOW}
        stroke={stroke}
        strokeWidth={strokeW * 0.7}
        strokeLinejoin="round"
      />
      {/* eye ring + eye */}
      <circle cx={cx + bodyR * 0.45} cy={cy - bodyR * 0.55} r={bodyR * 0.2} fill={YELLOW} stroke={BLACK} strokeWidth={strokeW * 0.5} />
      <circle cx={cx + bodyR * 0.45} cy={cy - bodyR * 0.55} r={bodyR * 0.09} fill={INK} />
      {/* big curved yellow beak sweeping down-left (toucan faces left, like the scan) */}
      <path
        d={`M ${cx + bodyR * 0.2} ${cy - bodyR * 0.75}
            Q ${cx - bodyR * 1.7} ${cy - bodyR * 0.7} ${cx - bodyR * 1.4} ${cy + bodyR * 0.35}
            Q ${cx - bodyR * 0.6} ${cy - bodyR * 0.1} ${cx + bodyR * 0.1} ${cy - bodyR * 0.15} Z`}
        fill={YELLOW}
        stroke={stroke}
        strokeWidth={strokeW * 0.8}
        strokeLinejoin="round"
      />
      {/* red dab on the chest (like the source toucan) */}
      <circle cx={cx} cy={cy + bodyR * 0.55} r={bodyR * 0.12} fill={RED} />
      {/* feet */}
      <line x1={cx - bodyR * 0.25} y1={cy + bodyR * 1.25} x2={cx - bodyR * 0.25} y2={cy + bodyR * 1.7} stroke={BLACK} strokeWidth={strokeW * 0.7} />
      <line x1={cx + bodyR * 0.25} y1={cy + bodyR * 1.25} x2={cx + bodyR * 0.25} y2={cy + bodyR * 1.7} stroke={BLACK} strokeWidth={strokeW * 0.7} />
    </g>
  )
}

/** A small rounded "Left" / "Right" label pill. */
function EndLabel({ x, y, text }: { x: number; y: number; text: string }) {
  const w = text.length * 7 + 16
  const h = 20
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill={LABEL_FILL} stroke={BLUE} strokeWidth={1.2} />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={12} fontStyle="italic" fontWeight={700} fill={INK} className="font-display">
        {text}
      </text>
    </g>
  )
}

/**
 * The 14-figure bird row.
 *
 * @param litStones  Ids of birds to highlight (peach wash + orange outline) — used
 *                   by the animator to tally the nine birds left of the toucan.
 *                   Valid ids are `b0`..`b8`, `toucan`, `b10`..`b13` (see STONE_IDS).
 *                   Out-of-range / non-array input is ignored.
 *
 * With no props it renders the bare row — the problem setup, with nothing lit.
 */
export function Stones25G1({ litStones }: { litStones?: string[] } = {}) {
  const litSet = new Set(
    (Array.isArray(litStones) ? litStones : []).filter((id) => typeof id === 'string' && STONE_IDS.includes(id)),
  )

  // --- layout -------------------------------------------------------------
  const cellW = 46 // horizontal slot per figure
  const padX = 18
  const padTop = 30 // room for the Left/Right labels above the row
  const padBottom = 26 // room for legs
  const rowY = padTop + 30 // baseline-ish y for the bird bodies
  const width = padX * 2 + ROW_LENGTH * cellW
  const height = padTop + 90 + padBottom
  const labelY = padTop - 12

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 520, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* end labels */}
      <EndLabel x={padX + cellW * 0.5} y={labelY} text="Kiri" />
      <EndLabel x={width - padX - cellW * 0.5} y={labelY} text="Kanan" />

      {/* the row of figures */}
      {STONE_IDS.map((id, i) => {
        const cx = padX + i * cellW + cellW / 2
        const lit = litSet.has(id)
        const isToucan = i === TOUCAN_INDEX
        return (
          <g key={id}>
            {/* lit wash behind a highlighted figure (animator only) */}
            {lit && (
              <rect
                x={cx - cellW / 2 + 2}
                y={rowY - 34}
                width={cellW - 4}
                height={82}
                rx={10}
                fill={LIT_FILL}
                stroke={ORANGE}
                strokeWidth={1.6}
              />
            )}
            {isToucan ? (
              <Toucan x={cx} y={rowY} s={1} lit={lit} />
            ) : (
              <Bullfinch x={cx} y={rowY} s={1} lit={lit} />
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Default export — the bare bird row inside the card (no box, no highlight). */
export default function Stones25G1Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label="Sebaris 14 burung dengan tanda Kiri di ujung kiri dan Kanan di ujung kanan. Tiga belas di antaranya burung kecil berdada merah, dan satu burung besar berparuh kuning (toucan) berada di posisi ke-10 dari kiri. Pertanyaannya: berapa banyak burung kecil yang berada di sebelah kiri toucan."
    >
      <Stones25G1 />
    </div>
  )
}
