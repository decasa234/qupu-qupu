// WMI-24P2A-Q4 (2024 Grade 2 Semifinal, Paper A) — animals stand in a row.
//
// READING THE STEM (figure 2024-semifinal-g2-a-q4.jpg shows a single
// horizontal row of cartoon animals): the 10th animal from the LEFT is the
// leader, the 7th animal from the RIGHT is the vice-leader, and the answer
// options (A–D, originally small pictures) each show a PAIR of animals. We must
// pick the option holding BOTH the leader and the vice-leader.
//
// SOLVE (per the paper's hint): there are 15 animals in the row. The 7th from
// the right is the 15 − 7 + 1 = 9th from the left. So the leader (10th) and the
// vice-leader (9th) are NEIGHBOURS — positions 9 and 10. Option C is the only
// option that shows that adjacent pair, so the answer is C.
//
// This static figure draws ONLY the row of 15 animals with "Left"/"Right" end
// labels — exactly the problem. It never marks position 9 or 10 and never hints
// which option is correct; revealing positions 9 & 10 is the animator's job, via
// the co-exported primitive `AnimalRow24G2`'s `litIndices` prop.
//
// Single-codepoint animal glyphs only (no ZWJ sequences). Pure render: no
// Math.random, no Date, SSR-safe & deterministic.

const INK = '#1F2937'
const BLUE = '#30598A' // qupu-brand-blue (outlines + label pill border)
const ORANGE = '#f0853a' // lit outline (animator only)
const LIT_FILL = '#FDE3CF' // peach wash behind a lit animal (animator only)
const LABEL_FILL = '#DBE7D4' // soft sage pill behind the Left / Right labels
const DISC = '#FFF7E8' // warm disc behind each animal glyph

// The 15 animals, left -> right. The exact species are decorative — only their
// COUNT (15) and POSITIONS drive the logic. Single-codepoint emoji only.
export const ANIMAL_ROW = [
  '\u{1F981}', // lion
  '\u{1F989}', // owl
  '\u{1F438}', // frog
  '\u{1F427}', // penguin
  '\u{1F404}', // cow
  '\u{1F422}', // turtle
  '\u{1F42D}', // mouse
  '\u{1F40D}', // snake
  '\u{1F98E}', // lizard (vice-leader, index 8 = 9th)
  '\u{1F428}', // koala (leader, index 9 = 10th)
  '\u{1F99C}', // parrot
  '\u{1F980}', // crab
  '\u{1F414}', // chicken
  '\u{1F407}', // rabbit
  '\u{1F436}', // dog
] as const

export const ROW_LENGTH = ANIMAL_ROW.length // 15
/** 1-based positions from the left. Leader = 10th, vice = 7th from right = 9th. */
export const LEADER_POS = 10
export const VICE_POS = ROW_LENGTH - 7 + 1 // 9

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

// ---- layout ----------------------------------------------------------------
const CELL_W = 42 // horizontal slot per animal
const PAD_X = 16
const PAD_TOP = 30 // room for the Left/Right labels above the row
const DISC_R = 17
const ROW_Y = PAD_TOP + 28 // centre of the animal discs
const WIDTH = PAD_X * 2 + ROW_LENGTH * CELL_W
const HEIGHT = ROW_Y + DISC_R + 26 // room for the position-number footer
const LABEL_Y = PAD_TOP - 12

/** Slot index (0-based) -> centre x. */
export const animalCX = (i: number) => PAD_X + i * CELL_W + CELL_W / 2
export const ANIMAL_GEOM = { WIDTH, HEIGHT, ROW_Y, DISC_R, animalCX } as const

export interface AnimalRow24G2Props {
  /**
   * 0-based indices to highlight (peach wash + orange ring) — used by the
   * animator to spotlight the 9th and 10th animals. Out-of-range / non-array
   * input is ignored so previews always render.
   */
  litIndices?: number[]
  /** Animator beat: print the 1-based position number under every animal. */
  showPositions?: boolean
}

/**
 * The bare 15-animal row. With no props it renders the problem setup exactly —
 * nothing lit, no positions printed.
 */
export function AnimalRow24G2({ litIndices, showPositions = false }: AnimalRow24G2Props = {}) {
  const litSet = new Set(
    (Array.isArray(litIndices) ? litIndices : []).filter((i) => Number.isInteger(i) && i >= 0 && i < ROW_LENGTH),
  )

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      style={{ maxWidth: 560, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* end labels */}
      <EndLabel x={animalCX(0)} y={LABEL_Y} text="Left" />
      <EndLabel x={animalCX(ROW_LENGTH - 1)} y={LABEL_Y} text="Right" />

      {/* the row of animals */}
      {ANIMAL_ROW.map((glyph, i) => {
        const cx = animalCX(i)
        const lit = litSet.has(i)
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={ROW_Y}
              r={DISC_R}
              fill={lit ? LIT_FILL : DISC}
              stroke={lit ? ORANGE : BLUE}
              strokeWidth={lit ? 2.6 : 1.4}
            />
            <text x={cx} y={ROW_Y + 1} textAnchor="middle" dominantBaseline="central" fontSize={22}>
              {glyph}
            </text>
            {showPositions && (
              <text
                x={cx}
                y={ROW_Y + DISC_R + 14}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={800}
                fill={lit ? ORANGE : INK}
                className="font-display"
              >
                {i + 1}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/** Default export — the bare animal row inside the card (no highlight, no positions). */
export default function P24G2Q4Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A row of 15 animals with a Left label at the left end and a Right label at the right end. The 10th animal from the left is the leader and the 7th animal from the right is the vice-leader; choose the option showing both of them."
    >
      <AnimalRow24G2 />
    </div>
  )
}
