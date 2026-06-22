// IKMC-21-PE-Q4 — "Michael's toy shelf"
//
// PROBLEM ONLY: shows five numbered shelves, each holding three toys.
// Forbidden items are present on shelves 1, 2, 3, 5.
// Shelf 4 (the correct answer) has none of the forbidden toys.
//
// Toy inventory (faithful to the paper scan):
//   Shelf 1: brown teddy bear · white rabbit · panda
//   Shelf 2: brown teddy bear · horse        · yellow duck
//   Shelf 3: turtle           · robot        · toy cart
//   Shelf 4: grey dog         · robot        · panda        ← answer (D)
//   Shelf 5: turtle           · white rabbit · lion
//
// Does NOT show: which shelf is correct, or X/✓ markings.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic.

// ── layout constants (re-exported for the explainer) ─────────────────────────

export const SVG_W = 320
export const SVG_H = 340

/** Left x of the shelf planks. */
export const SHELF_LEFT = 32
/** Right x of the shelf planks. */
export const SHELF_RIGHT = 300
/** Shelf plank height. */
export const PLANK_H = 8
/** Vertical gap between bottom of one toy-row and top of the next shelf. */
export const ROW_GAP = 60
/** Y of the BOTTOM of each shelf plank (index 0..4 = shelves 1..5). */
export const SHELF_Y: number[] = [56, 116, 176, 236, 296]
/** X positions of the three toys on each shelf. */
export const TOY_XS: number[] = [80, 168, 256]

// ── colour palette ────────────────────────────────────────────────────────────

export const COLOR = {
  SHELF: '#C8A96A',
  SHELF_STROKE: '#8B6914',
  WALL: '#F5F0E8',
  NUMBER: '#374151',
  PANDA_BODY: '#F5F5F5',
  PANDA_SPOT: '#1F2937',
  BEAR_BODY: '#8B5E2A',
  BEAR_STROKE: '#5C3A10',
  RABBIT_BODY: '#F9F4F0',
  RABBIT_STROKE: '#C4A882',
  RABBIT_EAR: '#F4B0C0',
  TURTLE_BODY: '#3A7D44',
  TURTLE_STROKE: '#1A5C2A',
  TURTLE_SHELL: '#2E6B38',
  ROBOT_BODY: '#6B7280',
  ROBOT_STROKE: '#374151',
  ROBOT_EYE: '#3B82F6',
  CART_BODY: '#DC2626',
  CART_WHEEL: '#374151',
  HORSE_BODY: '#A0785A',
  HORSE_STROKE: '#6B4A32',
  DUCK_BODY: '#FBBF24',
  DUCK_STROKE: '#92400E',
  DOG_BODY: '#9CA3AF',
  DOG_STROKE: '#4B5563',
  LION_BODY: '#F59E0B',
  LION_STROKE: '#92400E',
} as const

// ── toy primitives ────────────────────────────────────────────────────────────

/** Brown teddy bear — round body + head, stubby ears. */
export function BrownBear({ cx, botY }: { cx: number; botY: number }) {
  const bh = 22; const bw = 18
  const hy = botY - bh - 10; const hr = 9
  return (
    <g>
      {/* ears */}
      <circle cx={cx - 7} cy={hy - 6} r={5} fill={COLOR.BEAR_BODY} stroke={COLOR.BEAR_STROKE} strokeWidth={1} />
      <circle cx={cx + 7} cy={hy - 6} r={5} fill={COLOR.BEAR_BODY} stroke={COLOR.BEAR_STROKE} strokeWidth={1} />
      {/* head */}
      <ellipse cx={cx} cy={hy} rx={hr} ry={hr - 1} fill={COLOR.BEAR_BODY} stroke={COLOR.BEAR_STROKE} strokeWidth={1.5} />
      {/* snout */}
      <ellipse cx={cx} cy={hy + 4} rx={5} ry={3.5} fill="#C08040" />
      {/* eyes */}
      <circle cx={cx - 3} cy={hy - 1} r={1.5} fill={COLOR.BEAR_STROKE} />
      <circle cx={cx + 3} cy={hy - 1} r={1.5} fill={COLOR.BEAR_STROKE} />
      {/* body */}
      <ellipse cx={cx} cy={botY - bh / 2} rx={bw / 2} ry={bh / 2} fill={COLOR.BEAR_BODY} stroke={COLOR.BEAR_STROKE} strokeWidth={1.5} />
    </g>
  )
}

/** White rabbit — round body + head, tall thin ears. */
export function WhiteRabbit({ cx, botY }: { cx: number; botY: number }) {
  const bh = 20; const bw = 16
  const hy = botY - bh - 11; const hr = 8
  return (
    <g>
      {/* left ear */}
      <ellipse cx={cx - 5} cy={hy - 14} rx={3} ry={9} fill={COLOR.RABBIT_BODY} stroke={COLOR.RABBIT_STROKE} strokeWidth={1} />
      <ellipse cx={cx - 5} cy={hy - 14} rx={1.5} ry={7} fill={COLOR.RABBIT_EAR} />
      {/* right ear */}
      <ellipse cx={cx + 5} cy={hy - 14} rx={3} ry={9} fill={COLOR.RABBIT_BODY} stroke={COLOR.RABBIT_STROKE} strokeWidth={1} />
      <ellipse cx={cx + 5} cy={hy - 14} rx={1.5} ry={7} fill={COLOR.RABBIT_EAR} />
      {/* head */}
      <ellipse cx={cx} cy={hy} rx={hr} ry={hr - 1} fill={COLOR.RABBIT_BODY} stroke={COLOR.RABBIT_STROKE} strokeWidth={1.5} />
      {/* eyes */}
      <circle cx={cx - 3} cy={hy - 1} r={1.5} fill="#E879A0" />
      <circle cx={cx + 3} cy={hy - 1} r={1.5} fill="#E879A0" />
      {/* nose */}
      <circle cx={cx} cy={hy + 3} r={1} fill="#E879A0" />
      {/* body */}
      <ellipse cx={cx} cy={botY - bh / 2} rx={bw / 2} ry={bh / 2} fill={COLOR.RABBIT_BODY} stroke={COLOR.RABBIT_STROKE} strokeWidth={1.5} />
    </g>
  )
}

/** Panda — black-and-white bear with eye patches. */
export function PandaGlyph({ cx, botY }: { cx: number; botY: number }) {
  const bh = 22; const bw = 19
  const hy = botY - bh - 10; const hr = 9
  return (
    <g>
      {/* black ears */}
      <circle cx={cx - 7} cy={hy - 7} r={5} fill={COLOR.PANDA_SPOT} />
      <circle cx={cx + 7} cy={hy - 7} r={5} fill={COLOR.PANDA_SPOT} />
      {/* head */}
      <ellipse cx={cx} cy={hy} rx={hr} ry={hr} fill={COLOR.PANDA_BODY} stroke={COLOR.PANDA_SPOT} strokeWidth={1.5} />
      {/* eye patches */}
      <ellipse cx={cx - 3.5} cy={hy - 1} rx={3} ry={2.5} fill={COLOR.PANDA_SPOT} />
      <ellipse cx={cx + 3.5} cy={hy - 1} rx={3} ry={2.5} fill={COLOR.PANDA_SPOT} />
      {/* eyes */}
      <circle cx={cx - 3.5} cy={hy - 1} r={1} fill="white" />
      <circle cx={cx + 3.5} cy={hy - 1} r={1} fill="white" />
      {/* nose */}
      <ellipse cx={cx} cy={hy + 4} rx={4} ry={2.5} fill={COLOR.PANDA_SPOT} />
      {/* body */}
      <ellipse cx={cx} cy={botY - bh / 2} rx={bw / 2} ry={bh / 2} fill={COLOR.PANDA_BODY} stroke={COLOR.PANDA_SPOT} strokeWidth={1.5} />
      {/* belly patch */}
      <ellipse cx={cx} cy={botY - bh / 2 + 2} rx={bw / 2 - 5} ry={bh / 2 - 6} fill="#E8E8E8" />
    </g>
  )
}

/** Turtle — oval shell on top, small head & feet. */
export function TurtleGlyph({ cx, botY }: { cx: number; botY: number }) {
  const sw = 20; const sh = 12
  const shellY = botY - sh - 4
  return (
    <g>
      {/* feet */}
      <ellipse cx={cx - 9} cy={botY - 3} rx={5} ry={3} fill={COLOR.TURTLE_BODY} />
      <ellipse cx={cx + 9} cy={botY - 3} rx={5} ry={3} fill={COLOR.TURTLE_BODY} />
      {/* shell */}
      <ellipse cx={cx} cy={shellY} rx={sw / 2} ry={sh / 2} fill={COLOR.TURTLE_SHELL} stroke={COLOR.TURTLE_STROKE} strokeWidth={1.5} />
      {/* shell pattern */}
      <line x1={cx} y1={shellY - sh / 2} x2={cx} y2={shellY + sh / 2} stroke={COLOR.TURTLE_BODY} strokeWidth={1} />
      <line x1={cx - 8} y1={shellY - 2} x2={cx + 8} y2={shellY - 2} stroke={COLOR.TURTLE_BODY} strokeWidth={1} />
      <line x1={cx - 6} y1={shellY + 3} x2={cx + 6} y2={shellY + 3} stroke={COLOR.TURTLE_BODY} strokeWidth={1} />
      {/* head */}
      <ellipse cx={cx + sw / 2 + 3} cy={shellY} rx={5} ry={4} fill={COLOR.TURTLE_BODY} stroke={COLOR.TURTLE_STROKE} strokeWidth={1} />
      <circle cx={cx + sw / 2 + 4} cy={shellY - 1} r={1} fill={COLOR.TURTLE_STROKE} />
    </g>
  )
}

/** Simple robot — rectangular body + head, antenna, eye lenses. */
export function RobotGlyph({ cx, botY }: { cx: number; botY: number }) {
  const bw = 16; const bh = 18
  const hw = 12; const hh = 10
  const bodyTop = botY - bh
  const headTop = bodyTop - hh - 2
  return (
    <g>
      {/* antenna */}
      <line x1={cx} y1={headTop} x2={cx} y2={headTop - 7} stroke={COLOR.ROBOT_STROKE} strokeWidth={1.5} />
      <circle cx={cx} cy={headTop - 8} r={2} fill={COLOR.ROBOT_EYE} />
      {/* head */}
      <rect x={cx - hw / 2} y={headTop} width={hw} height={hh} rx={2} fill={COLOR.ROBOT_BODY} stroke={COLOR.ROBOT_STROKE} strokeWidth={1.5} />
      {/* eye lenses */}
      <circle cx={cx - 3} cy={headTop + 5} r={2.5} fill={COLOR.ROBOT_EYE} />
      <circle cx={cx + 3} cy={headTop + 5} r={2.5} fill={COLOR.ROBOT_EYE} />
      {/* mouth */}
      <rect x={cx - 3} y={headTop + hh - 3} width={6} height={1.5} fill={COLOR.ROBOT_STROKE} />
      {/* neck */}
      <rect x={cx - 3} y={bodyTop - 2} width={6} height={2} fill={COLOR.ROBOT_BODY} />
      {/* body */}
      <rect x={cx - bw / 2} y={bodyTop} width={bw} height={bh} rx={2} fill={COLOR.ROBOT_BODY} stroke={COLOR.ROBOT_STROKE} strokeWidth={1.5} />
      {/* panel buttons */}
      <circle cx={cx - 4} cy={bodyTop + 6} r={1.5} fill="#EF4444" />
      <circle cx={cx} cy={bodyTop + 6} r={1.5} fill="#10B981" />
      <circle cx={cx + 4} cy={bodyTop + 6} r={1.5} fill={COLOR.ROBOT_EYE} />
      {/* legs */}
      <rect x={cx - bw / 2} y={botY} width={5} height={5} rx={1} fill={COLOR.ROBOT_STROKE} />
      <rect x={cx + bw / 2 - 5} y={botY} width={5} height={5} rx={1} fill={COLOR.ROBOT_STROKE} />
    </g>
  )
}

/** Red toy cart with two wheels. */
export function ToyCart({ cx, botY }: { cx: number; botY: number }) {
  const bw = 20; const bh = 10
  const bodyY = botY - bh - 5
  return (
    <g>
      {/* handle */}
      <line x1={cx + bw / 2} y1={bodyY} x2={cx + bw / 2 + 8} y2={bodyY - 10} stroke={COLOR.CART_BODY} strokeWidth={2} strokeLinecap="round" />
      {/* body */}
      <rect x={cx - bw / 2} y={bodyY} width={bw} height={bh} rx={2} fill={COLOR.CART_BODY} stroke="#991B1B" strokeWidth={1.5} />
      {/* wheels */}
      <circle cx={cx - 6} cy={botY - 2} r={5} fill={COLOR.CART_WHEEL} stroke="#111827" strokeWidth={1} />
      <circle cx={cx - 6} cy={botY - 2} r={2} fill="#9CA3AF" />
      <circle cx={cx + 6} cy={botY - 2} r={5} fill={COLOR.CART_WHEEL} stroke="#111827" strokeWidth={1} />
      <circle cx={cx + 6} cy={botY - 2} r={2} fill="#9CA3AF" />
    </g>
  )
}

/** Brown horse — oval body, long legs, mane. */
export function HorseGlyph({ cx, botY }: { cx: number; botY: number }) {
  const bh = 16; const bw = 22
  const legH = 12
  const headX = cx + bw / 2 + 4
  const headY = botY - bh - legH / 2 - 6
  return (
    <g>
      {/* legs */}
      <rect x={cx - 7} y={botY - legH} width={4} height={legH} rx={2} fill={COLOR.HORSE_BODY} />
      <rect x={cx - 1} y={botY - legH} width={4} height={legH} rx={2} fill={COLOR.HORSE_BODY} />
      <rect x={cx + 3} y={botY - legH} width={4} height={legH} rx={2} fill={COLOR.HORSE_BODY} />
      <rect x={cx + 8} y={botY - legH} width={4} height={legH} rx={2} fill={COLOR.HORSE_BODY} />
      {/* body */}
      <ellipse cx={cx} cy={botY - bh / 2 - legH} rx={bw / 2} ry={bh / 2} fill={COLOR.HORSE_BODY} stroke={COLOR.HORSE_STROKE} strokeWidth={1.5} />
      {/* neck */}
      <rect x={headX - 12} y={headY - 4} width={8} height={12} rx={3} fill={COLOR.HORSE_BODY} stroke={COLOR.HORSE_STROKE} strokeWidth={1} />
      {/* head */}
      <ellipse cx={headX} cy={headY} rx={7} ry={5} fill={COLOR.HORSE_BODY} stroke={COLOR.HORSE_STROKE} strokeWidth={1.5} />
      {/* eye */}
      <circle cx={headX + 1} cy={headY - 1} r={1.5} fill={COLOR.HORSE_STROKE} />
      {/* mane */}
      <ellipse cx={headX - 6} cy={headY - 6} rx={4} ry={5} fill="#7A5230" />
    </g>
  )
}

/** Yellow duck — round body, small head, beak. */
export function DuckGlyph({ cx, botY }: { cx: number; botY: number }) {
  const bodyRX = 11; const bodyRY = 9
  const bodyCY = botY - bodyRY
  const headCX = cx + bodyRX - 2
  const headCY = bodyCY - 7
  return (
    <g>
      {/* body */}
      <ellipse cx={cx} cy={bodyCY} rx={bodyRX} ry={bodyRY} fill={COLOR.DUCK_BODY} stroke={COLOR.DUCK_STROKE} strokeWidth={1.5} />
      {/* tail */}
      <ellipse cx={cx - bodyRX + 2} cy={bodyCY - 3} rx={5} ry={4} fill={COLOR.DUCK_BODY} stroke={COLOR.DUCK_STROKE} strokeWidth={1} />
      {/* head */}
      <ellipse cx={headCX} cy={headCY} rx={7} ry={6} fill={COLOR.DUCK_BODY} stroke={COLOR.DUCK_STROKE} strokeWidth={1.5} />
      {/* eye */}
      <circle cx={headCX + 1} cy={headCY - 1} r={1.5} fill={COLOR.DUCK_STROKE} />
      {/* beak */}
      <path d={`M ${headCX + 6} ${headCY + 1} l 6 -1 l -2 3 z`} fill="#F97316" />
    </g>
  )
}

/** Grey dog — round body, head with floppy ears. */
export function DogGlyph({ cx, botY }: { cx: number; botY: number }) {
  const bh = 20; const bw = 18
  const hy = botY - bh - 10; const hr = 9
  return (
    <g>
      {/* floppy ears */}
      <ellipse cx={cx - 8} cy={hy + 3} rx={4} ry={7} fill={COLOR.DOG_BODY} stroke={COLOR.DOG_STROKE} strokeWidth={1} />
      <ellipse cx={cx + 8} cy={hy + 3} rx={4} ry={7} fill={COLOR.DOG_BODY} stroke={COLOR.DOG_STROKE} strokeWidth={1} />
      {/* head */}
      <ellipse cx={cx} cy={hy} rx={hr} ry={hr - 1} fill={COLOR.DOG_BODY} stroke={COLOR.DOG_STROKE} strokeWidth={1.5} />
      {/* snout */}
      <ellipse cx={cx} cy={hy + 4} rx={5} ry={3.5} fill="#D1D5DB" />
      {/* nose */}
      <ellipse cx={cx} cy={hy + 2} rx={2} ry={1.5} fill={COLOR.DOG_STROKE} />
      {/* eyes */}
      <circle cx={cx - 3} cy={hy - 1} r={1.5} fill={COLOR.DOG_STROKE} />
      <circle cx={cx + 3} cy={hy - 1} r={1.5} fill={COLOR.DOG_STROKE} />
      {/* body */}
      <ellipse cx={cx} cy={botY - bh / 2} rx={bw / 2} ry={bh / 2} fill={COLOR.DOG_BODY} stroke={COLOR.DOG_STROKE} strokeWidth={1.5} />
      {/* tail */}
      <path d={`M ${cx + bw / 2} ${botY - bh * 0.6} q 10 -12 6 -18`} stroke={COLOR.DOG_STROKE} strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  )
}

/** Yellow lion — round body with mane circle. */
export function LionGlyph({ cx, botY }: { cx: number; botY: number }) {
  const bh = 20; const bw = 18
  const hy = botY - bh - 12; const hr = 8
  return (
    <g>
      {/* mane */}
      <ellipse cx={cx} cy={hy} rx={hr + 5} ry={hr + 5} fill={COLOR.LION_STROKE} />
      {/* head */}
      <ellipse cx={cx} cy={hy} rx={hr} ry={hr} fill={COLOR.LION_BODY} stroke={COLOR.LION_STROKE} strokeWidth={1} />
      {/* eyes */}
      <circle cx={cx - 3} cy={hy - 2} r={1.5} fill={COLOR.LION_STROKE} />
      <circle cx={cx + 3} cy={hy - 2} r={1.5} fill={COLOR.LION_STROKE} />
      {/* nose */}
      <ellipse cx={cx} cy={hy + 3} rx={3} ry={2} fill={COLOR.LION_STROKE} />
      {/* body */}
      <ellipse cx={cx} cy={botY - bh / 2} rx={bw / 2} ry={bh / 2} fill={COLOR.LION_BODY} stroke={COLOR.LION_STROKE} strokeWidth={1.5} />
    </g>
  )
}

// ── Shelf plank primitive ─────────────────────────────────────────────────────

export function ShelfPlank({ y, label }: { y: number; label: string }) {
  return (
    <g>
      <rect
        x={SHELF_LEFT}
        y={y - PLANK_H}
        width={SHELF_RIGHT - SHELF_LEFT}
        height={PLANK_H}
        rx={2}
        fill={COLOR.SHELF}
        stroke={COLOR.SHELF_STROKE}
        strokeWidth={1.5}
      />
      {/* number label on left bracket */}
      <rect x={SHELF_LEFT - 22} y={y - PLANK_H - 2} width={18} height={18} rx={3} fill={COLOR.SHELF} stroke={COLOR.SHELF_STROKE} strokeWidth={1.5} />
      <text
        x={SHELF_LEFT - 13}
        y={y - PLANK_H + 9}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={800}
        fill={COLOR.NUMBER}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {label}
      </text>
    </g>
  )
}

// ── Row of toys for one shelf ─────────────────────────────────────────────────

type ToyId =
  | 'brown-bear' | 'rabbit' | 'panda'
  | 'horse' | 'duck'
  | 'turtle' | 'robot' | 'cart'
  | 'dog' | 'lion'

function ToyGlyph({ id, cx, botY }: { id: ToyId; cx: number; botY: number }) {
  switch (id) {
    case 'brown-bear': return <BrownBear cx={cx} botY={botY} />
    case 'rabbit':     return <WhiteRabbit cx={cx} botY={botY} />
    case 'panda':      return <PandaGlyph cx={cx} botY={botY} />
    case 'horse':      return <HorseGlyph cx={cx} botY={botY} />
    case 'duck':       return <DuckGlyph cx={cx} botY={botY} />
    case 'turtle':     return <TurtleGlyph cx={cx} botY={botY} />
    case 'robot':      return <RobotGlyph cx={cx} botY={botY} />
    case 'cart':       return <ToyCart cx={cx} botY={botY} />
    case 'dog':        return <DogGlyph cx={cx} botY={botY} />
    case 'lion':       return <LionGlyph cx={cx} botY={botY} />
  }
}

/** All 5 shelves with their toys. */
export const SHELF_ROWS: { label: string; toys: ToyId[] }[] = [
  { label: '1', toys: ['brown-bear', 'rabbit', 'panda'] },
  { label: '2', toys: ['brown-bear', 'horse', 'duck'] },
  { label: '3', toys: ['turtle', 'robot', 'cart'] },
  { label: '4', toys: ['dog', 'robot', 'panda'] },
  { label: '5', toys: ['turtle', 'rabbit', 'lion'] },
]

// ── Default export ────────────────────────────────────────────────────────────

/**
 * Shelves4PEIllustration
 *
 * Static stem figure for IKMC-21-PE-Q4.
 * Shows five numbered toy shelves. Michael's shelf has no turtles, no rabbits,
 * and no brown teddy bears — this illustration does NOT reveal the answer.
 */
export default function Shelves4PEIllustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Five numbered toy shelves. ' +
        'Shelf 1: brown teddy bear, white rabbit, panda. ' +
        'Shelf 2: brown teddy bear, horse, yellow duck. ' +
        'Shelf 3: turtle, robot, toy cart. ' +
        'Shelf 4: grey dog, robot, panda. ' +
        'Shelf 5: turtle, white rabbit, lion.'
      }
    >
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width={Math.min(360, SVG_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        {/* background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} fill={COLOR.WALL} />

        {SHELF_ROWS.map((row, i) => {
          const shelfY = SHELF_Y[i]
          return (
            <g key={row.label}>
              {/* toys sit just above the shelf plank */}
              {row.toys.map((toyId, j) => (
                <ToyGlyph
                  key={j}
                  id={toyId}
                  cx={TOY_XS[j]}
                  botY={shelfY - PLANK_H}
                />
              ))}
              <ShelfPlank y={shelfY} label={row.label} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
