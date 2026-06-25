// SEAMO-X 2022 Paper A Q11 — Four balance scales with animals.
// Chain: 1 rabbit = 3 squirrels (scale 1, balanced),
//        1 squirrel = 2 birds (scale 2, balanced),
//        1 bird = 2 chicks (scale 3, balanced),
//        1 rabbit = ? chicks (scale 4, question — rabbit side heavier).
// Answer: 3 × 2 × 2 = 12 chicks. Stem only — answer never drawn.
//
// Copy-adapted from BalanceScales25G1Illustration (2×2 cell layout + ScaleCell
// pattern) and Balance10ECIllustration (custom glyphs + named-export primitive).
// SSR-safe: no hooks, no framer-motion, no randomness, no Date.

const INK = '#1F2937'
const BEAM_COLOR = '#9AA0A6'
const BASE_FILL = '#5BC0EB'
const PAN_FILL = '#FFFFFF'

// animal fill colours
const RABBIT_FILL = '#F5F0E8'    // cream
const SQUIRREL_FILL = '#C8894B'  // warm brown
const BIRD_FILL = '#7BA7C7'      // blue-grey
const CHICK_FILL = '#F9C74F'     // golden yellow

// per-cell geometry
const CELL_W = 300
const CELL_H = 190
const COL_GAP = 10
const ROW_GAP = 10
const PAD = 8
const PIVOT_Y_OFF = 96       // pivot Y relative to cell top
const BEAM_HALF = 92
const TILT_DY = 22
const PAN_DROP = 14

// overall SVG dimensions
const TOT_W = PAD * 2 + CELL_W * 2 + COL_GAP  // 626
const TOT_H = PAD * 2 + CELL_H * 2 + ROW_GAP  // 406

type Animal = 'rabbit' | 'squirrel' | 'bird' | 'chick' | 'chick?'

const ANIMAL_R = 14        // circle radius
const ITEM_STEP = 31       // centre-to-centre spacing for multiple items

const ANIMAL_FILL: Record<Animal, string> = {
  rabbit: RABBIT_FILL,
  squirrel: SQUIRREL_FILL,
  bird: BIRD_FILL,
  chick: CHICK_FILL,
  'chick?': CHICK_FILL,
}
const ANIMAL_LABEL: Record<Animal, string> = {
  rabbit: 'R',
  squirrel: 'S',
  bird: 'B',
  chick: 'C',
  'chick?': '?',
}

function AnimalCircle({ type, cx, topY }: { type: Animal; cx: number; topY: number }) {
  const cy = topY - ANIMAL_R
  return (
    <g>
      <circle cx={cx} cy={cy} r={ANIMAL_R} fill={ANIMAL_FILL[type]} stroke={INK} strokeWidth={2} />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={type === 'chick?' ? 14 : 11}
        fontWeight={900}
        fill={INK}
      >
        {ANIMAL_LABEL[type]}
      </text>
    </g>
  )
}

/** One pan: V-hanger + items + tray rim. panX/panY = beam-end position. */
function AnimalPan({ panX, panY, items }: { panX: number; panY: number; items: Animal[] }) {
  const trayTop = panY + PAN_DROP
  const trayW = 85
  const itemBaseY = trayTop - 2
  const n = items.length
  const startX = panX - ((n - 1) * ITEM_STEP) / 2

  return (
    <g>
      {/* V-hanger lines from beam end to tray rim */}
      <line x1={panX} y1={panY} x2={panX - trayW / 2 + 8} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      <line x1={panX} y1={panY} x2={panX + trayW / 2 - 8} y2={trayTop} stroke={INK} strokeWidth={1.5} />
      {/* animal circles (drawn before tray rim so rim overlaps bases) */}
      {items.map((type, i) => (
        <AnimalCircle key={i} type={type} cx={startX + i * ITEM_STEP} topY={itemBaseY} />
      ))}
      {/* shallow tray bowl */}
      <path
        d={`M ${panX - trayW / 2} ${trayTop} Q ${panX} ${trayTop + 14} ${panX + trayW / 2} ${trayTop}`}
        fill="none"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <ellipse cx={panX} cy={trayTop} rx={trayW / 2} ry={4.5} fill={PAN_FILL} stroke={INK} strokeWidth={2.5} />
    </g>
  )
}

export interface ScaleDef {
  tilt: -1 | 0 | 1
  left: Animal[]
  right: Animal[]
}

export const SCALE_DEFS: ScaleDef[] = [
  { tilt: 0, left: ['rabbit'],   right: ['squirrel', 'squirrel', 'squirrel'] },
  { tilt: 0, left: ['squirrel'], right: ['bird', 'bird'] },
  { tilt: 0, left: ['bird'],     right: ['chick', 'chick'] },
  { tilt: 1, left: ['rabbit'],   right: ['chick?'] },  // question: rabbit side lower (heavier)
]

// Cell top-left origins for 2 × 2 layout
const CELL_ORIGINS = [
  { ox: PAD,                     oy: PAD },
  { ox: PAD + CELL_W + COL_GAP, oy: PAD },
  { ox: PAD,                     oy: PAD + CELL_H + ROW_GAP },
  { ox: PAD + CELL_W + COL_GAP, oy: PAD + CELL_H + ROW_GAP },
]

function ScaleCell({ def, ox, oy, dim = false }: { def: ScaleDef; ox: number; oy: number; dim?: boolean }) {
  const pivotX = ox + CELL_W / 2
  const pivotY = oy + PIVOT_Y_OFF
  const leftY  = pivotY + def.tilt * TILT_DY
  const rightY = pivotY - def.tilt * TILT_DY
  const leftX  = pivotX - BEAM_HALF
  const rightX = pivotX + BEAM_HALF
  const groundY = oy + CELL_H - 8

  return (
    <g opacity={dim ? 0.25 : 1}>
      <AnimalPan panX={leftX}  panY={leftY}  items={def.left} />
      <AnimalPan panX={rightX} panY={rightY} items={def.right} />
      {/* beam */}
      <line
        x1={leftX} y1={leftY}
        x2={rightX} y2={rightY}
        stroke={BEAM_COLOR}
        strokeWidth={8}
        strokeLinecap="round"
      />
      {/* triangular blue pivot */}
      <polygon
        points={`${pivotX},${pivotY - 4} ${pivotX - 30},${groundY} ${pivotX + 30},${groundY}`}
        fill={BASE_FILL}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* pivot bolt */}
      <circle cx={pivotX} cy={pivotY} r={5} fill={PAN_FILL} stroke={INK} strokeWidth={2.5} />
    </g>
  )
}

export interface AnimalScalesX22A11Props {
  /** 1-indexed lit scale; null = all neutral. Non-lit scales dim to 25 %. */
  litScale?: number | null
}

/**
 * Named primitive — imported by the explainer to drive per-beat highlighting.
 * aria-hidden; must sit inside a labelled host.
 */
export function AnimalScalesX22A11({ litScale = null }: AnimalScalesX22A11Props) {
  const lit =
    typeof litScale === 'number' && litScale >= 1 && litScale <= 4 ? litScale : null

  return (
    <svg
      viewBox={`0 0 ${TOT_W} ${TOT_H}`}
      width="100%"
      style={{ maxWidth: 640, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {SCALE_DEFS.map((def, i) => {
        const { ox, oy } = CELL_ORIGINS[i]
        return (
          <ScaleCell
            key={i}
            def={def}
            ox={ox}
            oy={oy}
            dim={lit !== null && lit !== i + 1}
          />
        )
      })}
    </svg>
  )
}

/**
 * SEAMO-X 2022 Paper A Q11 stem illustration.
 * Default export consumed by registry `illustration` loader.
 */
export default function AnimalScalesX22A11Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Four balance scales. ' +
        'Scale 1 (balanced): 1 rabbit equals 3 squirrels. ' +
        'Scale 2 (balanced): 1 squirrel equals 2 birds. ' +
        'Scale 3 (balanced): 1 bird equals 2 chicks. ' +
        'Scale 4 (question): 1 rabbit versus ? chicks — find how many chicks balance 1 rabbit.'
      }
    >
      <AnimalScalesX22A11 />
    </div>
  )
}
