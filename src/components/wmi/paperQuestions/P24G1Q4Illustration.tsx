// In-card SVG illustration for WMI-24P1A-Q4 (2024 Grade-1 Semifinal, Paper A).
//
// "Animals stand in a row. The 10th animal from the left is the leader. The
//  7th animal from the right is the vice leader. Which option has both of them?"
// Answer: C (snake, dinosaur, koala).
//
// Source figure (db/seed/wmi/figures/2024-semifinal-g1-a-q4.jpg) is a single row
// of 14 animals, left → right:
//   1 lion  2 owl  3 frog  4 penguin  5 cow  6 turtle  7 mouse  8 snake
//   9 dinosaur  10 koala  11 bird  12 crab  13 chick  14 dog
// With 14 animals: the 10th from the left is the koala, and the 7th from the
// right is animal 14 - 7 + 1 = 8 = the snake. Option C lists snake, dinosaur,
// koala, which contains both — the answer.
//
// This static figure draws ONLY the row of 14 animals. It never marks which two
// are the leader / vice-leader and never reveals the option letter. Post-answer,
// the explainer counts in from each end via the co-exported `AnimalRow`
// primitive's `litLeft` / `litRight` props.
//
// Pure render — no Math.random, no Date, SSR-safe & deterministic. The primitive
// ignores out-of-range highlight indices so previews always render.

const TILE_FILL = '#FFF9F4' // qupu-shell — tile floor
const TILE_STROKE = '#E4DACB' // warm grey rim
const GROUND = '#C8631F' // ground line under the row
const LEFT_LIT_FILL = '#E1EFFB' // qupu-brand-blue tint — "from the left" highlight
const LEFT_LIT_STROKE = '#30598A' // qupu-brand-blue
const RIGHT_LIT_FILL = '#FFF2DF' // qupu-cream tint — "from the right" highlight
const RIGHT_LIT_STROKE = '#E07320' // qupu-brand-orange

/** The 14 animals in left → right order, with a single-codepoint emoji glyph. */
export interface AnimalEntry {
  glyph: string
  en: string
  id: string
}

export const ANIMALS: readonly AnimalEntry[] = [
  { glyph: '\u{1F981}', en: 'lion', id: 'singa' },
  { glyph: '\u{1F989}', en: 'owl', id: 'burung hantu' },
  { glyph: '\u{1F438}', en: 'frog', id: 'katak' },
  { glyph: '\u{1F427}', en: 'penguin', id: 'pinguin' },
  { glyph: '\u{1F42E}', en: 'cow', id: 'sapi' },
  { glyph: '\u{1F422}', en: 'turtle', id: 'kura-kura' },
  { glyph: '\u{1F42D}', en: 'mouse', id: 'tikus' },
  { glyph: '\u{1F40D}', en: 'snake', id: 'ular' },
  { glyph: '\u{1F996}', en: 'dinosaur', id: 'dinosaurus' },
  { glyph: '\u{1F428}', en: 'koala', id: 'koala' },
  { glyph: '\u{1F426}', en: 'bird', id: 'burung' },
  { glyph: '\u{1F980}', en: 'crab', id: 'kepiting' },
  { glyph: '\u{1F424}', en: 'chick', id: 'anak ayam' },
  { glyph: '\u{1F436}', en: 'dog', id: 'anjing' },
] as const

export const ANIMAL_COUNT = ANIMALS.length // 14

// 0-based indices of the two target animals.
export const LEADER_INDEX = 9 // 10th from the left  → koala
export const VICE_INDEX = ANIMAL_COUNT - 7 // 7th from the right → index 7 → snake

// ── Layout ──────────────────────────────────────────────────────────────────
const TILE = 38 // tile width / height
const GAP = 4 // gap between tiles
const PAD = 14 // outer svg padding
const TOP_PAD = 26 // room for the count ribbon (numbers above tiles)
const GROUND_PAD = 10 // room below tiles for the ground line

const ROW_W = ANIMAL_COUNT * TILE + (ANIMAL_COUNT - 1) * GAP
const SVG_W = PAD * 2 + ROW_W
const SVG_H = TOP_PAD + TILE + GROUND_PAD + PAD

/**
 * The row of 14 animal tiles.
 *
 * @param litLeft   0-based indices to highlight as "counted from the LEFT" (blue).
 * @param litRight  0-based indices to highlight as "counted from the RIGHT" (orange).
 * @param showOrdinals  when true, prints the 1-based position above each lit tile.
 *
 * Out-of-range / non-array inputs are ignored, so with no props it renders the
 * bare problem setup (no highlights, no numbers).
 */
export function AnimalRow({
  litLeft,
  litRight,
  showOrdinals = false,
}: {
  litLeft?: number[]
  litRight?: number[]
  showOrdinals?: boolean
} = {}) {
  const inRange = (i: number) => Number.isInteger(i) && i >= 0 && i < ANIMAL_COUNT
  const leftSet = new Set((Array.isArray(litLeft) ? litLeft : []).filter(inRange))
  const rightSet = new Set((Array.isArray(litRight) ? litRight : []).filter(inRange))

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ maxWidth: 560, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ground line under the whole row */}
      <line
        x1={PAD}
        y1={TOP_PAD + TILE + 3}
        x2={SVG_W - PAD}
        y2={TOP_PAD + TILE + 3}
        stroke={GROUND}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {ANIMALS.map((animal, i) => {
        const x = PAD + i * (TILE + GAP)
        const y = TOP_PAD
        const lit = leftSet.has(i)
        const ritLit = rightSet.has(i)

        let fill = TILE_FILL
        let stroke = TILE_STROKE
        let strokeW = 1.8
        if (lit) {
          fill = LEFT_LIT_FILL
          stroke = LEFT_LIT_STROKE
          strokeW = 3
        }
        if (ritLit) {
          fill = RIGHT_LIT_FILL
          stroke = RIGHT_LIT_STROKE
          strokeW = 3
        }

        // ordinal printed above a lit tile: from the left → its left rank,
        // from the right → its right rank.
        let ordinal: number | null = null
        let ordinalColor = LEFT_LIT_STROKE
        if (showOrdinals && lit) {
          ordinal = i + 1
          ordinalColor = LEFT_LIT_STROKE
        }
        if (showOrdinals && ritLit) {
          ordinal = ANIMAL_COUNT - i
          ordinalColor = RIGHT_LIT_STROKE
        }

        return (
          <g key={i}>
            <rect x={x} y={y} width={TILE} height={TILE} rx={6} fill={fill} stroke={stroke} strokeWidth={strokeW} />
            <text
              x={x + TILE / 2}
              y={y + TILE / 2 + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={24}
            >
              {animal.glyph}
            </text>
            {ordinal != null && (
              <text
                x={x + TILE / 2}
                y={y - 12}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={15}
                fontWeight={900}
                fill={ordinalColor}
                className="font-display"
              >
                {ordinal}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Default export — the bare row of 14 animals (no highlights). */
export default function P24G1Q4Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Sebaris 14 hewan: ' +
        ANIMALS.map((a) => a.id).join(', ') +
        '. Gambar belum menandai pemimpin (ke-10 dari kiri) maupun wakil (ke-7 dari kanan).'
      }
    >
      <AnimalRow />
    </div>
  )
}
