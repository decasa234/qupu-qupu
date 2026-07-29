import type { ReactNode } from 'react'

/**
 * sort-count-by-attribute — question figure.
 *
 * A jumbled picture of objects that differ along ONE attribute (shape, balloon
 * colour, or kind of fruit). The child sorts them into groups, counts each
 * group, then answers. This draws ONLY the pile — never a grouping, a tally, or
 * the answer.
 *
 * Pure render from params: the mix order and the scatter jitter come from an
 * integer hash of `seed` + the item index, so the same params always draw the
 * same picture (no Math.random, no Date — SSR-safe). Falls back to a sample so
 * previews still render when params have the wrong shape.
 */

type Attribute = 'shape' | 'colour' | 'fruit'
type Layout = 'scatter' | 'grid' | 'rows'

interface SortCountParams {
  attribute: Attribute
  categories: string[]
  counts: number[]
  layout: Layout
  seed: number
}

const SAMPLE: SortCountParams = {
  attribute: 'shape',
  categories: ['circle', 'triangle', 'star'],
  counts: [6, 4, 5],
  layout: 'scatter',
  seed: 7,
}

// Warm brand palette. Red and grape purple are the two additions the fruit and
// balloon scenes need in order to look like the real thing.
const BLUE = '#30598A'
const ORANGE = '#F0853A'
const GREEN = '#58A700'
const YELLOW = '#E0A000'
const RED = '#D64545'
const PURPLE = '#7B5EA7'
const CREAM = '#FAF6EF'
const OUTLINE = 'rgba(38,59,85,0.28)'
const STRING = 'rgba(38,59,85,0.35)'
const STEM = '#7A5B3A'

const HUE: Record<string, string> = {
  'shape:circle': BLUE,
  'shape:triangle': ORANGE,
  'shape:square': GREEN,
  'shape:star': YELLOW,
  'colour:red': RED,
  'colour:blue': BLUE,
  'colour:orange': ORANGE,
  'colour:green': GREEN,
  'colour:yellow': YELLOW,
  'fruit:apple': RED,
  'fruit:banana': YELLOW,
  'fruit:orange': ORANGE,
  'fruit:grape': PURPLE,
}

const NAME_ID: Record<string, string> = {
  'shape:circle': 'lingkaran',
  'shape:triangle': 'segitiga',
  'shape:square': 'persegi',
  'shape:star': 'bintang',
  'colour:red': 'balon merah',
  'colour:blue': 'balon biru',
  'colour:orange': 'balon oranye',
  'colour:green': 'balon hijau',
  'colour:yellow': 'balon kuning',
  'fruit:apple': 'apel',
  'fruit:banana': 'pisang',
  'fruit:orange': 'jeruk',
  'fruit:grape': 'anggur',
}

const SCENE_NOUN_ID: Record<Attribute, string> = {
  shape: 'bentuk',
  colour: 'balon',
  fruit: 'buah',
}

// --- deterministic helpers --------------------------------------------------

/** 32-bit integer hash of (seed, index, salt) — pure index arithmetic. */
function hash(seed: number, i: number, salt: number): number {
  let h = Math.imul(seed + 1, 2654435761) ^ Math.imul(i + 1, 40503) ^ Math.imul(salt + 1, 668265263)
  h = Math.imul(h ^ (h >>> 15), 2246822519)
  h = Math.imul(h ^ (h >>> 13), 3266489917)
  return (h ^ (h >>> 16)) >>> 0
}

/** The pile order: one entry per object, mixed so groups never sit together. */
function buildItems(counts: number[], seed: number): number[] {
  const bag: number[] = []
  counts.forEach((c, ci) => {
    for (let i = 0; i < c; i++) bag.push(ci)
  })
  for (let i = bag.length - 1; i > 0; i--) {
    const j = hash(seed, i, 3) % (i + 1)
    const tmp = bag[i]
    bag[i] = bag[j]
    bag[j] = tmp
  }
  return bag
}

function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

function glyph(attribute: Attribute, key: string, cx: number, cy: number, s: number, fill: string): ReactNode {
  const stroke = OUTLINE
  const sw = 1.4

  if (attribute === 'colour') {
    // balloon: body + knot + string, sitting high in the cell so the string has
    // room without reaching into the row below
    return (
      <>
        <path
          d={`M ${cx} ${cy + 0.33 * s} L ${cx - 0.16 * s} ${cy + 0.58 * s} L ${cx + 0.16 * s} ${cy + 0.58 * s} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
        <ellipse cx={cx} cy={cy - 0.32 * s} rx={0.62 * s} ry={0.75 * s} fill={fill} stroke={stroke} strokeWidth={sw} />
        <ellipse cx={cx - 0.22 * s} cy={cy - 0.55 * s} rx={0.13 * s} ry={0.19 * s} fill={CREAM} opacity={0.75} />
        <path
          d={`M ${cx} ${cy + 0.58 * s} q ${0.26 * s} ${0.18 * s} 0 ${0.37 * s}`}
          fill="none"
          stroke={STRING}
          strokeWidth={1.2}
          strokeLinecap="round"
        />
      </>
    )
  }

  if (attribute === 'fruit') {
    if (key === 'banana') {
      // A long, shallow crescent — 1.90s wide against 1.04s tall, so it reads as
      // a fruit lying on its side rather than as a bowl or a hook (an arc deeper
      // than a half-circle looks like a horn). The outer belly runs 0.39s–0.48s
      // below the inner edge, so the body has real thickness instead of the hairline
      // sliver it used to be. The left end is cut blunt and carries a brown stem;
      // the right end tapers to a pointed blossom tip. That stem plus the
      // blunt/pointed asymmetry are what stop it reading as a crescent moon.
      const body =
        `M ${cx - 0.94 * s} ${cy - 0.06 * s} ` +
        `C ${cx - 0.9 * s} ${cy + 0.32 * s} ${cx - 0.44 * s} ${cy + 0.58 * s} ${cx + 0.14 * s} ${cy + 0.56 * s} ` +
        `C ${cx + 0.6 * s} ${cy + 0.54 * s} ${cx + 0.92 * s} ${cy + 0.22 * s} ${cx + 0.96 * s} ${cy - 0.4 * s} ` +
        `C ${cx + 0.76 * s} ${cy + 0.06 * s} ${cx + 0.48 * s} ${cy + 0.12 * s} ${cx + 0.06 * s} ${cy + 0.08 * s} ` +
        `C ${cx - 0.34 * s} ${cy + 0.04 * s} ${cx - 0.68 * s} ${cy - 0.12 * s} ${cx - 0.78 * s} ${cy - 0.46 * s} Z`
      return (
        <>
          <path d={body} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          <path
            d={`M ${cx - 0.46 * s} ${cy + 0.12 * s} Q ${cx + 0.04 * s} ${cy + 0.46 * s} ${cx + 0.56 * s} ${cy + 0.12 * s}`}
            fill="none"
            stroke={CREAM}
            strokeWidth={1.8}
            strokeLinecap="round"
            opacity={0.35}
          />
          <path
            d={`M ${cx - 0.86 * s} ${cy - 0.26 * s} L ${cx - 0.99 * s} ${cy - 0.32 * s}`}
            stroke={STEM}
            strokeWidth={2.2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )
    }
    if (key === 'grape') {
      const dots: Array<[number, number]> = [
        [-0.52, -0.18],
        [0, -0.3],
        [0.52, -0.18],
        [-0.28, 0.28],
        [0.28, 0.28],
        [0, 0.72],
      ]
      return (
        <>
          <path
            d={`M ${cx} ${cy - 0.9 * s} l 0 ${0.34 * s}`}
            stroke={STEM}
            strokeWidth={1.6}
            strokeLinecap="round"
            fill="none"
          />
          {dots.map(([dx, dy], i) => (
            <circle
              key={i}
              cx={cx + dx * s}
              cy={cy + dy * s}
              r={0.32 * s}
              fill={fill}
              stroke={stroke}
              strokeWidth={sw}
            />
          ))}
        </>
      )
    }
    if (key === 'apple') {
      return (
        <>
          <path
            d={`M ${cx} ${cy - 0.9 * s} q ${0.1 * s} ${-0.3 * s} ${0.42 * s} ${-0.34 * s} q ${-0.06 * s} ${0.34 * s} ${-0.42 * s} ${0.36 * s} Z`}
            fill={GREEN}
            stroke={stroke}
            strokeWidth={1}
          />
          <path
            d={`M ${cx} ${cy - 0.86 * s} l 0 ${0.22 * s}`}
            stroke={STEM}
            strokeWidth={1.6}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M ${cx} ${cy - 0.6 * s} q ${0.9 * s} ${-0.28 * s} ${0.9 * s} ${0.5 * s} q 0 ${0.72 * s} ${-0.9 * s} ${0.86 * s} q ${-0.9 * s} ${-0.14 * s} ${-0.9 * s} ${-0.86 * s} q 0 ${-0.78 * s} ${0.9 * s} ${-0.5 * s} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
        </>
      )
    }
    // orange — a plain round citrus: solid orange disc, upright brown stem and a
    // clear almond leaf tucked behind the top, plus a soft sheen. Stem and leaf
    // are drawn first so the disc hides their bases. What separates it from the
    // apple is the citrus colour and the unbroken circular silhouette (the apple
    // is dimpled at the top and red).
    return (
      <>
        <path
          d={`M ${cx} ${cy - 0.7 * s} L ${cx + 0.05 * s} ${cy - 0.94 * s}`}
          stroke={STEM}
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${cx + 0.06 * s} ${cy - 0.7 * s} Q ${cx + 0.26 * s} ${cy - 1.12 * s} ${cx + 0.66 * s} ${cy - 0.98 * s} Q ${cx + 0.42 * s} ${cy - 0.6 * s} ${cx + 0.06 * s} ${cy - 0.7 * s} Z`}
          fill={GREEN}
          stroke={stroke}
          strokeWidth={1}
          strokeLinejoin="round"
        />
        <circle cx={cx} cy={cy} r={0.82 * s} fill={fill} stroke={stroke} strokeWidth={sw} />
        <path
          d={`M ${cx - 0.46 * s} ${cy - 0.3 * s} Q ${cx - 0.4 * s} ${cy - 0.56 * s} ${cx - 0.14 * s} ${cy - 0.64 * s}`}
          fill="none"
          stroke={CREAM}
          strokeWidth={2.6}
          strokeLinecap="round"
          opacity={0.5}
        />
      </>
    )
  }

  // shapes
  if (key === 'triangle') {
    return (
      <polygon
        points={`${cx},${cy - 0.92 * s} ${cx + 0.9 * s},${cy + 0.72 * s} ${cx - 0.9 * s},${cy + 0.72 * s}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    )
  }
  if (key === 'square') {
    return (
      <rect
        x={cx - 0.78 * s}
        y={cy - 0.78 * s}
        width={1.56 * s}
        height={1.56 * s}
        rx={2.5}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
      />
    )
  }
  if (key === 'star') {
    return (
      <polygon
        points={starPoints(cx, cy, 0.95 * s, 0.42 * s)}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
      />
    )
  }
  return <circle cx={cx} cy={cy} r={0.82 * s} fill={fill} stroke={stroke} strokeWidth={sw} />
}

export default function SortCountByAttributeIllustration({ params }: { params: unknown }) {
  const raw = (params ?? {}) as Partial<SortCountParams>
  const ok =
    (raw.attribute === 'shape' || raw.attribute === 'colour' || raw.attribute === 'fruit') &&
    Array.isArray(raw.categories) &&
    Array.isArray(raw.counts) &&
    raw.categories.length > 0 &&
    raw.categories.length === raw.counts.length &&
    raw.counts.every((n) => typeof n === 'number' && n > 0)
  const p: SortCountParams = ok
    ? {
        attribute: raw.attribute as Attribute,
        categories: raw.categories as string[],
        counts: raw.counts as number[],
        layout:
          raw.layout === 'grid' || raw.layout === 'rows' || raw.layout === 'scatter' ? raw.layout : 'scatter',
        seed: typeof raw.seed === 'number' ? raw.seed : 0,
      }
    : SAMPLE

  const items = buildItems(p.counts, p.seed)
  const n = items.length

  // --- layout ---------------------------------------------------------------
  const cell = p.layout === 'rows' ? 42 : 46
  const cols =
    p.layout === 'grid'
      ? Math.min(6, Math.max(3, Math.ceil(Math.sqrt(n))))
      : p.layout === 'rows'
        ? Math.min(8, Math.max(4, n))
        : Math.min(6, Math.max(3, Math.ceil(Math.sqrt(n * 1.2))))
  const rowCount = Math.ceil(n / cols)
  const lastRowN = n - (rowCount - 1) * cols
  const stagger = p.layout === 'rows' ? cell / 2 : 0
  const padX = 10
  const padY = 8
  const width = padX * 2 + cols * cell + stagger
  const height = padY * 2 + rowCount * cell
  const s = cell * 0.27 // glyph half-extent; jitter below always stays inside the cell

  const kindList = p.categories.map((k) => NAME_ID[`${p.attribute}:${k}`] ?? k).join(', ')
  const label = `Gambar berisi ${n} ${SCENE_NOUN_ID[p.attribute]} yang tercampur: ${kindList}. Hitung sendiri setiap kelompoknya.`

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={label}>
      <svg viewBox={`0 0 ${width} ${height}`} width={Math.min(320, width)}>
        {items.map((ci, i) => {
          const col = i % cols
          const row = Math.floor(i / cols)
          const rowN = row === rowCount - 1 ? lastRowN : cols
          // rows: left-aligned but staggered; grid/scatter: last row centred
          const centring = p.layout === 'rows' ? 0 : ((cols - rowN) * cell) / 2
          let cx = padX + centring + col * cell + cell / 2
          let cy = padY + row * cell + cell / 2
          if (p.layout === 'rows') cx += (row % 2) * stagger
          if (p.layout === 'scatter') {
            // jitter stays under (cell/2 - s) so neighbouring glyphs never touch
            cx += (hash(p.seed, i, 0) % 17) - 8
            cy += (hash(p.seed, i, 1) % 17) - 8
          }
          const key = p.categories[ci] ?? ''
          const fill = HUE[`${p.attribute}:${key}`] ?? BLUE
          return <g key={i}>{glyph(p.attribute, key, cx, cy, s, fill)}</g>
        })}
      </svg>
    </div>
  )
}
