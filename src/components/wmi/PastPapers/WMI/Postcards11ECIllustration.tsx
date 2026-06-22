// IKMC-22-EC-Q11 — "During my holiday I sent the five postcards…"
//
// The question gives 5 clues (one per friend) to assign each postcard,
// then asks: "Which card did Mike get?"  Answer = A (sunset card).
//
// Five postcards (each a holiday scene):
//   A — sunset over water  (sky + big sun sinking into waves) → Mike's
//   B — two kangaroos on yellow background → Heather's
//   C — ladybug + fly on a leaf (2 living creatures) → Paula's
//   D — five ducks on water + sun in corner → Cara's (has sun)
//   E — dachshund dog on green background → Lexi's
//
// STEM illustration: shows all 5 postcards (as the problem figure).
// Co-exports Postcards11ECOption (renders ONE postcard by choice label A–E).
//
// Pure SVG, no random, no Date, SSR-safe.

import type { WmiChoice } from '../../../../types/wmi'

// ── Layout ─────────────────────────────────────────────────────────────────

export const CARD_W = 90
export const CARD_H = 62
const CARD_RX = 4
const PAD = 6

// ── Colour tokens ───────────────────────────────────────────────────────────

export const C = {
  // Card outlines
  BORDER: '#374151',
  // Card A — sunset
  SKY_A: '#1E3A5F',
  SUN_A: '#F97316',
  SUN_GLOW: '#FBBF24',
  WATER_A: '#1E40AF',
  WAVE_A: '#1D4ED8',
  HORIZON_A: '#F97316',
  // Card B — kangaroos
  BG_B: '#CA8A04',
  ROOS: '#92400E',
  // Card C — leaf + insects
  BG_C: '#FEF08A',
  LEAF: '#4ADE80',
  LEAF_DARK: '#16A34A',
  LADYBUG: '#DC2626',
  FLY: '#6B7280',
  SPOT: '#111827',
  // Card D — ducks + water
  SKY_D: '#BFDBFE',
  WATER_D: '#1D4ED8',
  WAVE_D: '#2563EB',
  DUCK: '#D97706',
  SUN_D: '#FBBF24',
  // Card E — dog
  BG_E: '#4ADE80',
  DOG: '#B45309',
  DOG_DARK: '#92400E',
  COLLAR: '#DC2626',
} as const

// ── Card A: sunset over water ───────────────────────────────────────────────

export function CardASunset({ x, y }: { x: number; y: number }) {
  const w = CARD_W
  const h = CARD_H
  const horizonY = y + h * 0.55
  const sunCY = y + h * 0.52
  const sunR = 18

  return (
    <g>
      {/* card background — sky */}
      <rect x={x} y={y} width={w} height={h} rx={CARD_RX} fill={C.SKY_A} />

      {/* water */}
      <rect x={x} y={horizonY} width={w} height={h - (horizonY - y)} rx={0} fill={C.WATER_A} />
      <rect x={x} y={y + h - CARD_RX} width={w} height={CARD_RX} rx={CARD_RX} fill={C.WATER_A} />

      {/* sun glow (slightly larger, lighter) */}
      <circle cx={x + w / 2} cy={sunCY} r={sunR + 4} fill={C.SUN_GLOW} opacity={0.35} />

      {/* sun (half-sunk: clip at horizon) */}
      <clipPath id="clip-sun-a">
        <rect x={x} y={y} width={w} height={horizonY - y} />
      </clipPath>
      <circle cx={x + w / 2} cy={sunCY} r={sunR} fill={C.SUN_A} clipPath="url(#clip-sun-a)" />

      {/* horizon glow strip */}
      <rect x={x} y={horizonY - 3} width={w} height={6} fill={C.HORIZON_A} opacity={0.6} />

      {/* wave lines */}
      <line x1={x + 8} y1={horizonY + 10} x2={x + w - 8} y2={horizonY + 10} stroke={C.WAVE_A} strokeWidth={1.5} strokeLinecap="round" />
      <line x1={x + 12} y1={horizonY + 18} x2={x + w - 12} y2={horizonY + 18} stroke={C.WAVE_A} strokeWidth={1.2} strokeLinecap="round" />
      <line x1={x + 6} y1={horizonY + 26} x2={x + w - 6} y2={horizonY + 26} stroke={C.WAVE_A} strokeWidth={1.2} strokeLinecap="round" />

      {/* card border */}
      <rect x={x} y={y} width={w} height={h} rx={CARD_RX} fill="none" stroke={C.BORDER} strokeWidth={1.5} />
    </g>
  )
}

// ── Card B: two kangaroos on yellow ─────────────────────────────────────────

export function CardBKangaroos({ x, y }: { x: number; y: number }) {
  const w = CARD_W
  const h = CARD_H
  // Large roo
  const lrx = x + 30
  const groundY = y + h - 10

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={CARD_RX} fill={C.BG_B} />

      {/* Large kangaroo (mother) */}
      {/* body */}
      <ellipse cx={lrx} cy={groundY - 18} rx={12} ry={16} fill={C.ROOS} />
      {/* head */}
      <ellipse cx={lrx - 4} cy={groundY - 36} rx={7} ry={6} fill={C.ROOS} />
      {/* ear */}
      <ellipse cx={lrx - 7} cy={groundY - 41} rx={2.5} ry={4} fill={C.ROOS} />
      {/* snout */}
      <ellipse cx={lrx - 9} cy={groundY - 35} rx={3} ry={2.5} fill={C.DOG} />
      {/* neck */}
      <line x1={lrx - 4} y1={groundY - 30} x2={lrx - 2} y2={groundY - 22} stroke={C.ROOS} strokeWidth={8} strokeLinecap="round" />
      {/* tail */}
      <path d={`M ${lrx + 12} ${groundY - 12} Q ${lrx + 22} ${groundY + 4} ${lrx + 16} ${groundY + 2}`} fill="none" stroke={C.ROOS} strokeWidth={5} strokeLinecap="round" />
      {/* legs */}
      <line x1={lrx - 4} y1={groundY - 5} x2={lrx - 8} y2={groundY} stroke={C.ROOS} strokeWidth={5} strokeLinecap="round" />
      <line x1={lrx + 2} y1={groundY - 5} x2={lrx + 6} y2={groundY} stroke={C.ROOS} strokeWidth={5} strokeLinecap="round" />
      {/* front arms */}
      <line x1={lrx - 6} y1={groundY - 24} x2={lrx - 14} y2={groundY - 18} stroke={C.ROOS} strokeWidth={4} strokeLinecap="round" />

      {/* Joey (small kangaroo) */}
      <ellipse cx={lrx + 22} cy={groundY - 10} rx={7} ry={9} fill={C.ROOS} opacity={0.9} />
      {/* joey head */}
      <ellipse cx={lrx + 20} cy={groundY - 21} rx={5} ry={4} fill={C.ROOS} opacity={0.9} />
      {/* joey ear */}
      <ellipse cx={lrx + 18} cy={groundY - 25} rx={1.8} ry={2.8} fill={C.ROOS} opacity={0.9} />
      {/* joey legs */}
      <line x1={lrx + 20} y1={groundY - 2} x2={lrx + 16} y2={groundY + 2} stroke={C.ROOS} strokeWidth={3} strokeLinecap="round" />
      <line x1={lrx + 24} y1={groundY - 2} x2={lrx + 28} y2={groundY + 2} stroke={C.ROOS} strokeWidth={3} strokeLinecap="round" />

      {/* ground shadow */}
      <ellipse cx={lrx} cy={groundY + 2} rx={16} ry={3} fill="#92400E" opacity={0.2} />
      <ellipse cx={lrx + 22} cy={groundY + 2} rx={9} ry={2} fill="#92400E" opacity={0.2} />

      <rect x={x} y={y} width={w} height={h} rx={CARD_RX} fill="none" stroke={C.BORDER} strokeWidth={1.5} />
    </g>
  )
}

// ── Card C: ladybug + fly on leaf ────────────────────────────────────────────

export function CardCLeafInsects({ x, y }: { x: number; y: number }) {
  const w = CARD_W
  const h = CARD_H

  return (
    <g>
      {/* background */}
      <rect x={x} y={y} width={w} height={h} rx={CARD_RX} fill={C.BG_C} />

      {/* leaf (large diagonal parallelogram) */}
      <polygon
        points={`${x + 5},${y + h - 5} ${x + w - 10},${y + 8} ${x + w - 2},${y + 14} ${x + 14},${y + h - 2}`}
        fill={C.LEAF}
        stroke={C.LEAF_DARK}
        strokeWidth={1.2}
      />
      {/* leaf midrib */}
      <line
        x1={x + 10} y1={y + h - 4}
        x2={x + w - 6} y2={y + 10}
        stroke={C.LEAF_DARK}
        strokeWidth={1.2}
        strokeDasharray="3 2"
      />

      {/* Ladybug */}
      {/* shell */}
      <ellipse cx={x + 26} cy={y + 36} rx={9} ry={8} fill={C.LADYBUG} />
      {/* head */}
      <ellipse cx={x + 26} cy={y + 27} rx={5} ry={5} fill={C.SPOT} />
      {/* centre line */}
      <line x1={x + 26} y1={y + 28} x2={x + 26} y2={y + 44} stroke={C.SPOT} strokeWidth={1} />
      {/* spots */}
      <circle cx={x + 22} cy={y + 34} r={2} fill={C.SPOT} />
      <circle cx={x + 30} cy={y + 34} r={2} fill={C.SPOT} />
      <circle cx={x + 23} cy={y + 40} r={1.5} fill={C.SPOT} />
      <circle cx={x + 29} cy={y + 40} r={1.5} fill={C.SPOT} />
      {/* antennae */}
      <line x1={x + 23} y1={y + 24} x2={x + 20} y2={y + 20} stroke={C.SPOT} strokeWidth={1} />
      <line x1={x + 29} y1={y + 24} x2={x + 32} y2={y + 20} stroke={C.SPOT} strokeWidth={1} />

      {/* Fly */}
      {/* body */}
      <ellipse cx={x + 60} cy={y + 30} rx={6} ry={5} fill={C.FLY} />
      {/* head */}
      <circle cx={x + 56} cy={y + 27} r={4} fill={C.SPOT} opacity={0.8} />
      {/* wings */}
      <ellipse cx={x + 63} cy={y + 24} rx={9} ry={5} fill="white" opacity={0.75} stroke={C.FLY} strokeWidth={0.8} />
      <ellipse cx={x + 57} cy={y + 24} rx={8} ry={4} fill="white" opacity={0.75} stroke={C.FLY} strokeWidth={0.8} />
      {/* legs */}
      <line x1={x + 58} y1={y + 33} x2={x + 52} y2={y + 39} stroke={C.SPOT} strokeWidth={0.8} />
      <line x1={x + 60} y1={y + 34} x2={x + 56} y2={y + 40} stroke={C.SPOT} strokeWidth={0.8} />
      <line x1={x + 62} y1={y + 33} x2={x + 60} y2={y + 40} stroke={C.SPOT} strokeWidth={0.8} />
      {/* antennae */}
      <line x1={x + 54} y1={y + 24} x2={x + 50} y2={y + 20} stroke={C.SPOT} strokeWidth={0.8} />
      <line x1={x + 57} y1={y + 23} x2={x + 55} y2={y + 18} stroke={C.SPOT} strokeWidth={0.8} />

      <rect x={x} y={y} width={w} height={h} rx={CARD_RX} fill="none" stroke={C.BORDER} strokeWidth={1.5} />
    </g>
  )
}

// ── Card D: five ducks + sun ─────────────────────────────────────────────────

export function CardDDucks({ x, y }: { x: number; y: number }) {
  const w = CARD_W
  const h = CARD_H
  const waterY = y + h * 0.5

  // Five ducks spaced across water
  const duckXs = [x + 12, x + 26, x + 42, x + 57, x + 72]
  const duckY = waterY + 6

  return (
    <g>
      {/* sky */}
      <rect x={x} y={y} width={w} height={h} rx={CARD_RX} fill={C.SKY_D} />
      {/* water */}
      <rect x={x} y={waterY} width={w} height={h - (waterY - y)} fill={C.WATER_D} />
      <rect x={x} y={y + h - CARD_RX} width={w} height={CARD_RX} rx={CARD_RX} fill={C.WATER_D} />

      {/* sun (top right corner) */}
      <circle cx={x + w - 12} cy={y + 12} r={10} fill={C.SUN_D} />

      {/* wave lines */}
      <line x1={x + 4} y1={waterY + 2} x2={x + w - 4} y2={waterY + 2} stroke={C.WAVE_D} strokeWidth={1.2} />
      <line x1={x + 4} y1={waterY + 9} x2={x + w - 4} y2={waterY + 9} stroke={C.WAVE_D} strokeWidth={1} />

      {/* 5 ducks */}
      {duckXs.map((dx, i) => (
        <g key={i}>
          {/* body */}
          <ellipse cx={dx} cy={duckY + 6} rx={6} ry={4.5} fill={C.DUCK} />
          {/* head */}
          <circle cx={dx - 5} cy={duckY + 2} r={3.5} fill={C.DUCK} />
          {/* bill */}
          <ellipse cx={dx - 9} cy={duckY + 3} rx={2.5} ry={1.2} fill="#FBBF24" />
          {/* tail */}
          <line x1={dx + 5} y1={duckY + 4} x2={dx + 8} y2={duckY} stroke={C.DUCK} strokeWidth={2} strokeLinecap="round" />
          {/* eye */}
          <circle cx={dx - 5} cy={duckY + 1} r={0.8} fill="#111" />
        </g>
      ))}

      <rect x={x} y={y} width={w} height={h} rx={CARD_RX} fill="none" stroke={C.BORDER} strokeWidth={1.5} />
    </g>
  )
}

// ── Card E: dachshund dog ────────────────────────────────────────────────────

export function CardEDog({ x, y }: { x: number; y: number }) {
  const w = CARD_W
  const h = CARD_H
  const groundY = y + h - 12
  const bodyCX = x + w / 2
  const bodyCY = groundY - 12

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={CARD_RX} fill={C.BG_E} />

      {/* tail (right side, up) */}
      <path d={`M ${bodyCX + 28} ${bodyCY} Q ${bodyCX + 36} ${bodyCY - 14} ${bodyCX + 32} ${bodyCY - 18}`}
        fill="none" stroke={C.DOG} strokeWidth={5} strokeLinecap="round" />

      {/* body (long ellipse — dachshund) */}
      <ellipse cx={bodyCX} cy={bodyCY} rx={30} ry={12} fill={C.DOG} stroke={C.DOG_DARK} strokeWidth={1} />

      {/* head (on left) */}
      <ellipse cx={bodyCX - 28} cy={bodyCY - 4} rx={12} ry={10} fill={C.DOG} stroke={C.DOG_DARK} strokeWidth={1} />
      {/* snout */}
      <ellipse cx={bodyCX - 38} cy={bodyCY - 2} rx={6} ry={5} fill={C.DOG} stroke={C.DOG_DARK} strokeWidth={0.8} />
      {/* nose */}
      <ellipse cx={bodyCX - 44} cy={bodyCY - 2} rx={2.5} ry={2} fill={C.DOG_DARK} />
      {/* eye */}
      <circle cx={bodyCX - 30} cy={bodyCY - 6} r={2.5} fill={C.DOG_DARK} />
      <circle cx={bodyCX - 30} cy={bodyCY - 6} r={1} fill="white" />
      {/* ear (long floppy) */}
      <ellipse cx={bodyCX - 26} cy={bodyCY + 4} rx={5} ry={10} fill={C.DOG_DARK} />

      {/* legs (4 short) */}
      {[-18, -6, 8, 20].map((dx, i) => (
        <rect key={i}
          x={bodyCX + dx - 3} y={bodyCY + 8}
          width={6} height={10} rx={3}
          fill={C.DOG} stroke={C.DOG_DARK} strokeWidth={0.8}
        />
      ))}

      {/* collar */}
      <rect x={bodyCX - 34} y={bodyCY - 9} width={12} height={5} rx={2} fill={C.COLLAR} />

      {/* ground shadow */}
      <ellipse cx={bodyCX - 6} cy={groundY + 2} rx={30} ry={3} fill="#15803D" opacity={0.25} />

      <rect x={x} y={y} width={w} height={h} rx={CARD_RX} fill="none" stroke={C.BORDER} strokeWidth={1.5} />
    </g>
  )
}

// ── Card router ───────────────────────────────────────────────────────────────

const CARD_ARIA: Record<string, { en: string; id: string }> = {
  A: {
    en: 'Card A: sunset over water — orange sun sinking below the horizon, dark blue sky and waves. No living creatures.',
    id: 'Kartu A: matahari terbenam di atas air — matahari oranye tenggelam di bawah cakrawala, langit biru gelap dan ombak. Tidak ada makhluk hidup.',
  },
  B: {
    en: 'Card B: two kangaroos on a golden-yellow background — a large mother and a smaller joey.',
    id: 'Kartu B: dua kanguru di latar belakang kuning keemasan — induk besar dan anak kecil.',
  },
  C: {
    en: 'Card C: a ladybug and a fly on a green leaf — exactly two living creatures.',
    id: 'Kartu C: kumbang kepik dan lalat di atas daun hijau — tepat dua makhluk hidup.',
  },
  D: {
    en: 'Card D: five ducks swimming on water under a blue sky, with a yellow sun in the top-right corner.',
    id: 'Kartu D: lima bebek berenang di air di bawah langit biru, dengan matahari kuning di pojok kanan atas.',
  },
  E: {
    en: 'Card E: a dachshund dog on a green background.',
    id: 'Kartu E: anjing ras dachshund di latar belakang hijau.',
  },
}

interface CardProps { x: number; y: number }

const CARD_RENDERERS: Record<string, (props: CardProps) => React.JSX.Element> = {
  A: CardASunset,
  B: CardBKangaroos,
  C: CardCLeafInsects,
  D: CardDDucks,
  E: CardEDog,
}

// ── Stem illustration ────────────────────────────────────────────────────────

const LABELS = ['A', 'B', 'C', 'D', 'E'] as const
const COLS = 3

const CELL_W = CARD_W + PAD
const CELL_H = CARD_H + PAD + 14  // room for label below
const GRID_W = CELL_W * COLS + PAD
const ROW2_X_OFFSET = CELL_W / 2  // centre the 2-card bottom row

/**
 * Postcards11ECIllustration — shows all 5 postcards as the problem figure.
 * Cards A–C on the top row, D–E centred on the bottom row.
 * Does NOT reveal the answer.
 */
export default function Postcards11ECIllustration() {
  const rows = [LABELS.slice(0, 3), LABELS.slice(3, 5)] as const
  const svgH = 2 * CELL_H + PAD * 2

  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Five holiday postcards labelled A to E. ' +
        'A: sunset over water with no creatures. ' +
        'B: two kangaroos on yellow. ' +
        'C: ladybug and fly on a leaf. ' +
        'D: five ducks on water with a sun in the corner. ' +
        'E: a dachshund dog on green.'
      }
    >
      <svg
        viewBox={`0 0 ${GRID_W} ${svgH}`}
        width={Math.min(400, GRID_W)}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={GRID_W} height={svgH} fill="white" />

        {/* Top row: A B C */}
        {rows[0].map((label, col) => {
          const cx = PAD + col * CELL_W
          const cy = PAD
          const Renderer = CARD_RENDERERS[label]
          return (
            <g key={label}>
              <Renderer x={cx} y={cy} />
              <text
                x={cx + CARD_W / 2}
                y={cy + CARD_H + 10}
                textAnchor="middle"
                fontSize={10}
                fontWeight={800}
                fill="#1F2937"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {label}
              </text>
            </g>
          )
        })}

        {/* Bottom row: D E (centred) */}
        {rows[1].map((label, col) => {
          const cx = PAD + ROW2_X_OFFSET + col * CELL_W
          const cy = PAD + CELL_H
          const Renderer = CARD_RENDERERS[label]
          return (
            <g key={label}>
              <Renderer x={cx} y={cy} />
              <text
                x={cx + CARD_W / 2}
                y={cy + CARD_H + 10}
                textAnchor="middle"
                fontSize={10}
                fontWeight={800}
                fill="#1F2937"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                {label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Option renderer ───────────────────────────────────────────────────────────

/**
 * Postcards11ECOption — renders ONE postcard as the choice picture.
 * Used in CHOICE_RENDERERS for IKMC-22-EC-Q11.
 */
export function Postcards11ECOption({ choice }: { choice: WmiChoice }) {
  const k = choice.label
  const Renderer = CARD_RENDERERS[k]
  const aria = CARD_ARIA[k]
  if (!Renderer) return <span>{choice.text}</span>

  const svgW = CARD_W + PAD * 2
  const svgH = CARD_H + PAD * 2

  return (
    <span
      role="img"
      aria-label={aria?.en ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 2 }}
    >
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width={Math.min(120, svgW)}
        height={Math.round(Math.min(120, svgW) * (svgH / svgW))}
        style={{ display: 'block' }}
        aria-hidden="true"
      >
        <rect x={0} y={0} width={svgW} height={svgH} fill="white" />
        <Renderer x={PAD} y={PAD} />
      </svg>
    </span>
  )
}
