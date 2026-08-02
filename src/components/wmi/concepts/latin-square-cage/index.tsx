import { GridBoard, type CageGroup } from '../../PastPapers/WMI/primitives/GridBoard'

// In-card figure for `latin-square-cage`. The stem states the rules; this
// picture carries the evidence — where the bold frames sit, what clue each one
// prints, which squares the paper already filled in, and which squares wear the
// letters the question asks about.
//
// It must NEVER print a square the child is meant to deduce, not in the grid
// and not in the aria-label: those squares ARE the puzzle. Givens and frame
// clues are printed evidence and are stated freely.
//
// Pure SVG, no hooks, no randomness: safe to render on the server and identical
// for the same params every time. Geometry is entirely GridBoard's — including
// the bold cage outlines, which are its `cageBorders` prop; this file only
// decides which cells group together and what goes in each square.

/** Mirrors LETTERS in api/services/wmi/concepts/latin-square-cage. */
const LETTERS = ['A', 'B', 'C']

const BOX_SIZE = 2
const CAGE_INK = '#30598A'
const PAD = 4

interface Cell {
  r: number
  c: number
}

interface Cage {
  cells: Cell[]
  op: '+' | '-' | 'x'
  target: number
}

interface Params {
  n: number
  clueSystem: 'cage-op' | 'thick-box'
  solution: number[][]
  cages: Cage[]
  givens: Cell[]
  letters: Cell[]
}

const FALLBACK: Params = {
  n: 4,
  clueSystem: 'thick-box',
  solution: [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ],
  cages: [],
  givens: [
    { r: 0, c: 2 },
    { r: 0, c: 3 },
    { r: 1, c: 0 },
    { r: 1, c: 1 },
    { r: 2, c: 2 },
    { r: 3, c: 0 },
  ],
  letters: [{ r: 0, c: 0 }],
}

const int = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback

const readCell = (raw: unknown, n: number): Cell | null => {
  const c = (raw ?? {}) as Partial<Cell>
  const r = int(c.r, -1)
  const col = int(c.c, -1)
  return r >= 0 && r < n && col >= 0 && col < n ? { r, c: col } : null
}

/**
 * Params arrive as `unknown` from the DB, so every field is re-derived and
 * clamped. Anything that does not add up falls back whole rather than in
 * pieces — a half-read grid would draw a puzzle nobody set.
 */
function read(raw: unknown): Params {
  const p = (raw ?? {}) as Partial<Params>
  const n = Math.max(4, Math.min(5, int(p.n, 0)))
  if (!Array.isArray(p.solution) || p.solution.length !== n) return FALLBACK
  const solution = p.solution.map((row) =>
    Array.isArray(row) ? row.map((v) => Math.max(1, Math.min(n, int(v, 1)))) : [],
  )
  if (solution.some((row) => row.length !== n)) return FALLBACK

  const clueSystem: Params['clueSystem'] = p.clueSystem === 'thick-box' && n === 4 ? 'thick-box' : 'cage-op'

  const cages = (Array.isArray(p.cages) ? p.cages : [])
    .map((raw2) => {
      const c = (raw2 ?? {}) as Partial<Cage>
      const cells = (Array.isArray(c.cells) ? c.cells : [])
        .map((x) => readCell(x, n))
        .filter((x): x is Cell => x !== null)
      const op: Cage['op'] = c.op === '-' || c.op === 'x' ? c.op : '+'
      return { cells, op, target: Math.max(0, int(c.target, 0)) }
    })
    .filter((c) => c.cells.length >= 2)
  if (clueSystem === 'cage-op' && cages.length === 0) return FALLBACK

  const letters = (Array.isArray(p.letters) ? p.letters : [])
    .map((x) => readCell(x, n))
    .filter((x): x is Cell => x !== null)
    .slice(0, LETTERS.length)
  if (letters.length === 0) return FALLBACK

  const givens = (Array.isArray(p.givens) ? p.givens : [])
    .map((x) => readCell(x, n))
    .filter((x): x is Cell => x !== null)
    .filter((g) => !letters.some((l) => l.r === g.r && l.c === g.c))

  return { n, clueSystem, solution, cages, givens, letters }
}

/** "a", "a dan b", "a, b, dan c" — mirrors `listId` in the concept. */
function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

/** "5+", "2−", "6×" — mirrors `cageClue` in the concept. */
const clueText = (cage: Cage): string =>
  `${cage.target}${cage.op === '+' ? '+' : cage.op === '-' ? '−' : '×'}`

const OP_SPEECH: Record<Cage['op'], string> = {
  '+': 'jumlah',
  '-': 'selisih',
  x: 'hasil kali',
}

function boxGroups(n: number): CageGroup[] {
  const per = n / BOX_SIZE
  const out: CageGroup[] = []
  for (let br = 0; br < per; br++) {
    for (let bc = 0; bc < per; bc++) {
      const cells: [number, number][] = []
      for (let dr = 0; dr < BOX_SIZE; dr++) {
        for (let dc = 0; dc < BOX_SIZE; dc++) {
          cells.push([br * BOX_SIZE + dr, bc * BOX_SIZE + dc])
        }
      }
      out.push({ cells })
    }
  }
  return out
}

export default function LatinSquareCageIllustration({ params }: { params: unknown }) {
  const p = read(params)
  const cellSize = p.n === 5 ? 46 : 54
  const given = new Map(p.givens.map((g) => [`${g.r},${g.c}`, p.solution[g.r][g.c]]))
  const letter = new Map(p.letters.map((l, i) => [`${l.r},${l.c}`, LETTERS[i]]))

  const groups: CageGroup[] =
    p.clueSystem === 'thick-box'
      ? boxGroups(p.n)
      : p.cages.map((cage) => ({
          cells: cage.cells.map((x) => [x.r, x.c] as [number, number]),
          label: clueText(cage),
        }))

  // A hair of padding so the bold outline on the outer edge is not sliced in
  // half by the viewBox.
  const side = p.n * cellSize
  const viewBox = `0 0 ${side + PAD * 2} ${side + PAD * 2}`

  // The label speaks only what is printed on the page. A square the child has to
  // work out is announced as empty; its number is never mentioned.
  const clueSpeech =
    p.clueSystem === 'thick-box'
      ? [`Kisi dibagi menjadi ${(p.n / BOX_SIZE) ** 2} kotak tebal ${BOX_SIZE} kali ${BOX_SIZE}`]
      : p.cages.map((cage) => {
          const at = listId(cage.cells.map((x) => `baris ke-${x.r + 1} kolom ke-${x.c + 1}`))
          return `Bingkai di ${at} bertanda ${clueText(cage)}, artinya ${OP_SPEECH[cage.op]} isinya ${cage.target}`
        })
  const givenSpeech = p.givens.map(
    (g) => `Baris ke-${g.r + 1} kolom ke-${g.c + 1} sudah berisi ${p.solution[g.r][g.c]}`,
  )
  const letterSpeech = p.letters.map(
    (l, i) => `Kotak ${LETTERS[i]} ada di baris ke-${l.r + 1} kolom ke-${l.c + 1} dan masih kosong`,
  )
  const ariaLabel = [
    `Kisi ${p.n} kali ${p.n} yang harus diisi bilangan 1 sampai ${p.n}`,
    ...clueSpeech,
    ...(givenSpeech.length > 0 ? givenSpeech : ['Belum ada kotak yang terisi']),
    ...letterSpeech,
  ].join('. ')

  return (
    <div className="my-4 flex justify-center" role="img" aria-label={`${ariaLabel}.`}>
      <svg viewBox={viewBox} width="100%" style={{ maxWidth: (side + PAD * 2) * 1.6 }}>
        <g transform={`translate(${PAD}, ${PAD})`}>
          <GridBoard
            rows={p.n}
            cols={p.n}
            cellSize={cellSize}
            label={(r, c) => letter.get(`${r},${c}`) ?? given.get(`${r},${c}`)?.toString() ?? ''}
            highlight={(r, c) => (letter.has(`${r},${c}`) ? 'amber' : 'none')}
            cageBorders={groups}
            cageStroke={CAGE_INK}
            cageStrokeWidth={3}
          />
        </g>
      </svg>
    </div>
  )
}
