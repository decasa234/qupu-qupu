// Static card illustration for IKMC-21-PE-Q11 ("flower pots").
//
// "Julia has two pots with flowers as shown. She keeps the flowers exactly
//  where they are. She buys more flowers so that each pot will have the same
//  number of each type of flower. What is the smallest number of flowers she
//  needs to buy?"  Answer: C = 6.
//
// Setup (the question figure):
//   Pot 1: 3 white pompom flowers, 0 orange sunflower flowers
//   Pot 2: 0 white flowers,        3 orange sunflower flowers
//
// This file draws ONLY the setup. The co-exported primitive `FlowerPots11PE`
// accepts props so the explainer can show added flowers (faded) and spotlight
// one pot at a time. The default export is the static card illustration.
//
// Pure render — no random, no dates, SSR-safe and deterministic.

// ── Colour palette ──────────────────────────────────────────────────────────
const TERRA      = '#C47C5A'  // terracotta pot body
const TERRA_DARK = '#A05C3C'  // pot outline / rim
const SAUCER     = '#D4926E'  // saucer disc
const WHITE_FL   = '#F5F5F5'  // white pompom petal
const WHITE_CTR  = '#E8E0D8'  // pompom centre tint
const ORANGE_FL  = '#F59E0B'  // orange sunflower petal
const CENTER_FL  = '#1F2937'  // sunflower dark centre
const STEM_GR    = '#4B7A3E'  // stem / leaf green
const GLOW       = '#FCD34D'  // spotlight glow ring
const GRAY_LBL   = '#9CA3AF'  // pot number label

// ── Geometry constants ───────────────────────────────────────────────────────
const POT_W   = 80   // pot top opening width
const POT_H   = 65   // pot body height
const RIM_H   = 8    // rim height above the body
const RIM_EX  = 6    // extra width on each side for the rim
const SAUC_RY = 6    // saucer vertical radius (ellipse)
const SAUC_RX = 38   // saucer horizontal radius

const STEM_LEN = 24  // stem length
const HEAD_R   = 18  // radius of the flower-head bounding circle
const POMPOM_R = 5.5 // radius of each pompom bubble
const SUN_CR   = 8   // sunflower centre circle radius
const PETAL_W  = 7   // sunflower petal half-width
const PETAL_L  = 14  // sunflower petal length from centre

// ── White pompom flower ──────────────────────────────────────────────────────
// A cluster of 7 small circles: 6 outer around 1 centre, filling a HEAD_R circle.
const POMPOM_OFFSETS: Array<[number, number]> = [
  [0, 0],
  [0, -10], [9, -5], [9, 5], [0, 10], [-9, 5], [-9, -5],
]

function WhitePompom({ cx, cy, faded }: { cx: number; cy: number; faded?: boolean }) {
  const opacity  = faded ? 0.45 : 1
  const bodyFill = faded ? '#E5E7EB' : WHITE_FL
  const ctrFill  = faded ? '#D1D5DB' : WHITE_CTR
  const stroke   = faded ? '#6B7280' : '#D1D5DB'
  const strokeDash = faded ? '4 3' : undefined

  return (
    <g opacity={opacity}>
      {/* stem */}
      <line
        x1={cx} y1={cy + HEAD_R}
        x2={cx} y2={cy + HEAD_R + STEM_LEN}
        stroke={STEM_GR} strokeWidth={2.5} strokeLinecap="round"
      />
      {/* pompom bubbles */}
      {POMPOM_OFFSETS.map(([dx, dy], i) => (
        <circle
          key={i}
          cx={cx + dx} cy={cy + dy}
          r={POMPOM_R}
          fill={i === 0 ? ctrFill : bodyFill}
          stroke={stroke}
          strokeWidth={i === 0 ? 1 : 0.8}
          strokeDasharray={strokeDash}
        />
      ))}
    </g>
  )
}

// ── Orange sunflower ─────────────────────────────────────────────────────────
// 8 rounded-petal ellipses arranged radially, then a dark centre disc.
const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

function OrangeSunflower({ cx, cy, faded }: { cx: number; cy: number; faded?: boolean }) {
  const opacity    = faded ? 0.45 : 1
  const petalFill  = faded ? '#FDE68A' : ORANGE_FL
  const centerFill = faded ? '#6B7280' : CENTER_FL
  const strokeDash = faded ? '4 3' : undefined

  return (
    <g opacity={opacity}>
      {/* stem */}
      <line
        x1={cx} y1={cy + HEAD_R}
        x2={cx} y2={cy + HEAD_R + STEM_LEN}
        stroke={STEM_GR} strokeWidth={2.5} strokeLinecap="round"
      />
      {/* petals */}
      {PETAL_ANGLES.map((deg) => {
        const rad = (deg * Math.PI) / 180
        const px = cx + Math.round(Math.cos(rad) * PETAL_L)
        const py = cy + Math.round(Math.sin(rad) * PETAL_L)
        return (
          <ellipse
            key={deg}
            cx={px} cy={py}
            rx={PETAL_W} ry={PETAL_W * 1.6}
            transform={`rotate(${deg + 90} ${px} ${py})`}
            fill={petalFill}
            stroke={faded ? '#D97706' : '#D97706'}
            strokeWidth={0.8}
            strokeDasharray={strokeDash}
          />
        )
      })}
      {/* dark centre */}
      <circle cx={cx} cy={cy} r={SUN_CR} fill={centerFill} />
      {/* subtle highlight on centre */}
      <circle cx={cx - 2} cy={cy - 2} r={2} fill="#ffffff" opacity={0.25} />
    </g>
  )
}

// ── Single flower pot with flowers ───────────────────────────────────────────
interface PotProps {
  /** Centre x of this pot in SVG space. */
  cx: number
  /** Y coordinate of the pot's top rim (flowers grow upward from here). */
  potTopY: number
  /** Number of white pompom flowers to draw (original). */
  whiteFl: number
  /** Number of orange sunflower flowers to draw (original). */
  orangeFl: number
  /** Extra orange flowers "being added" (drawn faded). */
  addedOrange?: number
  /** Extra white flowers "being added" (drawn faded). */
  addedWhite?: number
  /** When true, render a glow ring around the pot to spotlight it. */
  spotlit?: boolean
  /** Pot label ("1" or "2"). */
  label: string
}

function FlowerPot({
  cx, potTopY, whiteFl, orangeFl,
  addedOrange = 0, addedWhite = 0,
  spotlit = false, label,
}: PotProps) {
  const rimY    = potTopY                        // top of the rim
  const bodyY   = rimY + RIM_H                  // top of the body
  const bodyBot = bodyY + POT_H                 // bottom of the body
  const saucY   = bodyBot + SAUC_RY             // vertical centre of saucer ellipse

  // Pot trapezoid: wider at top (rim width), narrower at bottom (80 % of rim).
  const topW    = POT_W
  const botW    = POT_W * 0.78
  const leftTop = cx - topW / 2
  const rightTop= cx + topW / 2
  const leftBot = cx - botW / 2
  const rightBot= cx + botW / 2

  // Flower stem base sits at the rim top edge
  const stemBase = rimY

  // All flowers: white originals, white added (faded), orange originals, orange added (faded)
  // We lay them out in FLOWER_XS slots. Max 3 originals + 3 added = up to 6 slots but
  // for this problem each type is at most 3 + 3 = 6 which doesn't fit; however the
  // problem only has 3 originals and 3 added per type per pot at most. We spread them.
  const totalFlowers = whiteFl + orangeFl + addedOrange + addedWhite
  // Build a list of flower descriptors in draw order
  const flowers: Array<{ type: 'white' | 'orange'; faded: boolean }> = []
  for (let i = 0; i < whiteFl;      i++) flowers.push({ type: 'white',  faded: false })
  for (let i = 0; i < orangeFl;     i++) flowers.push({ type: 'orange', faded: false })
  for (let i = 0; i < addedOrange;  i++) flowers.push({ type: 'orange', faded: true  })
  for (let i = 0; i < addedWhite;   i++) flowers.push({ type: 'white',  faded: true  })

  // Evenly space flowers within [-30, 30] band centred on cx
  const spread = 52
  const flowerXs =
    totalFlowers === 0
      ? []
      : totalFlowers === 1
        ? [cx]
        : Array.from({ length: totalFlowers }, (_, i) =>
            cx - spread / 2 + (i * spread) / (totalFlowers - 1),
          )

  // Each flower head centre Y (stems hang below)
  const headY = stemBase - HEAD_R - STEM_LEN - 4

  // Glow ring around whole pot (spotlight)
  const glowCx = cx
  const glowCy = (rimY + saucY) / 2
  const glowRx = topW / 2 + RIM_EX + 14
  const glowRy = (saucY - rimY) / 2 + 18

  return (
    <g>
      {/* spotlight glow ring */}
      {spotlit && (
        <ellipse
          cx={glowCx} cy={glowCy}
          rx={glowRx} ry={glowRy}
          fill="none"
          stroke={GLOW}
          strokeWidth={6}
          opacity={0.55}
        />
      )}

      {/* flowers */}
      {flowers.map((fl, i) => {
        const fx = flowerXs[i] ?? cx
        return fl.type === 'white'
          ? <WhitePompom  key={i} cx={fx} cy={headY} faded={fl.faded} />
          : <OrangeSunflower key={i} cx={fx} cy={headY} faded={fl.faded} />
      })}

      {/* rim (wider rectangle on top of body) */}
      <rect
        x={leftTop - RIM_EX} y={rimY}
        width={topW + RIM_EX * 2} height={RIM_H}
        rx={3}
        fill={TERRA} stroke={TERRA_DARK} strokeWidth={1.8}
      />
      {/* pot body — trapezoid */}
      <path
        d={`M ${leftTop} ${bodyY} L ${rightTop} ${bodyY} L ${rightBot} ${bodyBot} L ${leftBot} ${bodyBot} Z`}
        fill={TERRA} stroke={TERRA_DARK} strokeWidth={1.8}
      />
      {/* saucer */}
      <ellipse
        cx={cx} cy={saucY}
        rx={SAUC_RX} ry={SAUC_RY}
        fill={SAUCER} stroke={TERRA_DARK} strokeWidth={1.6}
      />

      {/* pot label below saucer */}
      <text
        x={cx} y={saucY + SAUC_RY + 14}
        textAnchor="middle"
        fontSize={11}
        fontFamily="sans-serif"
        fill={GRAY_LBL}
        fontWeight="600"
      >
        {label}
      </text>
    </g>
  )
}

// ── Public primitive: FlowerPots11PE ─────────────────────────────────────────

export interface FlowerPots11PEProps {
  /** How many orange flowers are "being added" to Pot 1 (shown faded). */
  addedOrangePot1?: number
  /** How many white flowers are "being added" to Pot 2 (shown faded). */
  addedWhitePot2?: number
  /** Which pot to spotlight (show a glow ring). */
  activePot?: 1 | 2 | null
}

const SVG_W = 360
const SVG_H = 210
const POT1_CX = 105
const POT2_CX = 255
const POT_TOP_Y = 120

/**
 * The two flower pots.
 *
 * Without props renders the bare problem setup (Pot 1: 3 white; Pot 2: 3 orange).
 * In the explainer, `addedOrangePot1` / `addedWhitePot2` show ghosted flowers
 * being bought, and `activePot` adds a spotlight glow ring.
 */
export function FlowerPots11PE({
  addedOrangePot1 = 0,
  addedWhitePot2  = 0,
  activePot       = null,
}: FlowerPots11PEProps = {}) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      <FlowerPot
        cx={POT1_CX}
        potTopY={POT_TOP_Y}
        whiteFl={3}
        orangeFl={0}
        addedOrange={Math.max(0, Math.min(3, addedOrangePot1))}
        addedWhite={0}
        spotlit={activePot === 1}
        label="1"
      />
      <FlowerPot
        cx={POT2_CX}
        potTopY={POT_TOP_Y}
        whiteFl={0}
        orangeFl={3}
        addedOrange={0}
        addedWhite={Math.max(0, Math.min(3, addedWhitePot2))}
        spotlit={activePot === 2}
        label="2"
      />
    </svg>
  )
}

// ── Default export: static card illustration (no props, pure setup) ───────────
export default function FlowerPots11PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Dua pot bunga. Pot 1 berisi 3 bunga pompom putih. ' +
        'Pot 2 berisi 3 bunga matahari oranye. ' +
        'Gambar belum menunjukkan bunga yang ditambahkan.'
      }
    >
      <FlowerPots11PE />
    </div>
  )
}
