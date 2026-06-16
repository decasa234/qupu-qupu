// Storyboard for WMI-24F2A-Q24 (2024 Grade-2 Final, HARD) — the board-game
// teleport problem. Pure builder: (lang) => { steps, finalIndex }.
//
// Mechanics (verified against the answer key, sum = 24):
//   PATH order: START,1..15,FINISH (FINISH is square 16).
//   Teleports trigger on the square you STOP on: 3→13, 14→5, 7→11, 10→8.
//   Overshooting FINISH bounces backward to spend the leftover steps.
//
// The first roll is fixed at 3: from START you land on square 3, which is
// linked, so you jump to 13. From 13 the two remaining rolls (◇, △) must land
// EXACTLY on FINISH. We enumerate ◇ = 1..6, reject the dead ends, and collect
// the winners (2,1)→2, (4,1)→4, (6,3)→18, giving 2+4+18 = 24.

import { PATH_ORDER, TELEPORTS } from './BoardPath24G2Illustration'

type Cell = number | 'START' | 'FINISH'

const FINISH_IDX = PATH_ORDER.length - 1 // 16
const TP_MAP = new Map<number, number>(TELEPORTS.map((t) => [t.from, t.to]))

/** Walk `steps` squares from path index `start`, bouncing off FINISH, then
 *  apply a teleport if we stop on a linked square. Returns the trail of square
 *  labels visited (in order) plus the final landing index. */
function walk(start: number, steps: number): { trail: Cell[]; end: number } {
  const trail: Cell[] = []
  let pos = start
  let dir = 1
  let left = steps
  while (left > 0) {
    if (dir === 1 && pos === FINISH_IDX) dir = -1
    pos += dir
    trail.push(PATH_ORDER[pos])
    left -= 1
  }
  const land = PATH_ORDER[pos]
  if (typeof land === 'number' && TP_MAP.has(land)) {
    const target = TP_MAP.get(land)!
    pos = PATH_ORDER.indexOf(target)
    trail.push(PATH_ORDER[pos])
  }
  return { trail, end: pos }
}

const IDX_13 = PATH_ORDER.indexOf(13)

export type BoardStep = {
  /** Squares lit up as the token's trail so far this beat. */
  activeIds: Cell[]
  /** Show the dotted teleport links (revealed once we first use one). */
  showTeleports: boolean
  /** A short label pinned over the token's current square (e.g. "13"). */
  tokenAt: Cell | null
  /** Running list of winning pairs to show in the tally strip. */
  tally: Array<{ a: number; b: number; prod: number }>
  /** true = a winning beat (green), false = neutral/blue, 'bad' = rejected (red). */
  verdict: boolean | 'bad'
  /** longer hold on rejections so the "why" reads; 0 on the final winner. */
  hold: number
  caption: string
}

export type BoardStoryboard = { steps: BoardStep[]; finalIndex: number }

export function buildBoardPathStory(lang: 'en' | 'id' = 'en'): BoardStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // First roll = 3: START -> square 3 -> teleport to 13.
  const roll1 = walk(0, 3) // trail: [1,2,3,13], end at 13

  // Enumerate the first of the two remaining rolls (◇ = 1..6) from square 13.
  // For each, record where we land and whether a second roll can hit FINISH.
  type Cand = { a: number; landTrail: Cell[]; land: Cell; b: number | null; reason: string }
  const candidates: Cand[] = []
  for (let a = 1; a <= 6; a++) {
    const A = walk(IDX_13, a)
    let goodB: number | null = null
    for (let b = 1; b <= 6; b++) {
      const B = walk(A.end, b)
      if (B.end === FINISH_IDX) {
        goodB = b
        break
      }
    }
    let reason: string
    if (goodB != null) {
      reason = 'win'
    } else if (A.end === FINISH_IDX) {
      // ◇ alone reached FINISH; the next roll can only bounce away.
      reason = 'early'
    } else {
      reason = 'far'
    }
    candidates.push({ a, landTrail: A.trail, land: PATH_ORDER[A.end], b: goodB, reason })
  }

  const winners = candidates.filter((c) => c.b != null) as Array<Cand & { b: number }>

  const steps: BoardStep[] = []

  // Beat 0 — state the goal.
  steps.push({
    activeIds: ['START'],
    showTeleports: true,
    tokenAt: 'START',
    tally: [],
    verdict: false,
    hold: 2600,
    caption: t(
      'Start at START. Rolls are 3, ◇, △ and must land EXACTLY on FINISH (square 16).',
      'Mulai dari START. Lemparan 3, ◇, △ harus mendarat TEPAT di FINISH (kotak 16).',
    ),
  })

  // Beat 1 — first roll 3, walk to square 3.
  steps.push({
    activeIds: ['START', 1, 2, 3],
    showTeleports: true,
    tokenAt: 3,
    tally: [],
    verdict: false,
    hold: 2100,
    caption: t('Roll 1 = 3: walk 1, 2, 3. Square 3 is a linked square!', 'Lempar 1 = 3: jalan 1, 2, 3. Kotak 3 adalah kotak tautan!'),
  })

  // Beat 2 — teleport 3 -> 13.
  steps.push({
    activeIds: ['START', 1, 2, 3, ...roll1.trail],
    showTeleports: true,
    tokenAt: 13,
    tally: [],
    verdict: false,
    hold: 2400,
    caption: t('The link jumps you from 3 to 13. Two rolls left to reach FINISH.', 'Tautan melompatkanmu dari 3 ke 13. Sisa dua lemparan untuk ke FINISH.'),
  })

  // Beats 3.. — test each ◇ candidate from square 13.
  const tallySoFar: Array<{ a: number; b: number; prod: number }> = []
  for (const c of candidates) {
    const base: Cell[] = [13, ...c.landTrail]
    if (c.reason === 'win') {
      const b = c.b as number
      const prod = c.a * b
      // First show ◇ landing.
      tallySoFar.push({ a: c.a, b, prod })
      steps.push({
        activeIds: base,
        showTeleports: true,
        tokenAt: c.land,
        tally: tallySoFar.map((x) => ({ ...x })),
        verdict: true,
        hold: 2400,
        caption: t(
          `◇ = ${c.a} lands on ${labelOf(c.land)}. Then △ = ${b} reaches FINISH! ${c.a} × ${b} = ${prod}. ✓`,
          `◇ = ${c.a} mendarat di ${labelOf(c.land)}. Lalu △ = ${b} sampai FINISH! ${c.a} × ${b} = ${prod}. ✓`,
        ),
      })
    } else if (c.reason === 'early') {
      steps.push({
        activeIds: base,
        showTeleports: true,
        tokenAt: c.land,
        tally: tallySoFar.map((x) => ({ ...x })),
        verdict: 'bad',
        hold: 2100,
        caption: t(
          `◇ = ${c.a} already hits FINISH — then △ must bounce back off it. No good. ✗`,
          `◇ = ${c.a} sudah kena FINISH — lalu △ pasti memantul mundur. Tidak bisa. ✗`,
        ),
      })
    } else {
      steps.push({
        activeIds: base,
        showTeleports: true,
        tokenAt: c.land,
        tally: tallySoFar.map((x) => ({ ...x })),
        verdict: 'bad',
        hold: 2100,
        caption: t(
          `◇ = ${c.a} lands on ${labelOf(c.land)} — too far from FINISH for one roll. ✗`,
          `◇ = ${c.a} mendarat di ${labelOf(c.land)} — terlalu jauh dari FINISH untuk satu lemparan. ✗`,
        ),
      })
    }
  }

  // Penultimate beat — collect the winning products.
  const sum = winners.reduce((s, w) => s + w.a * (w.b as number), 0)
  const prodList = winners.map((w) => `${w.a}×${w.b}=${w.a * (w.b as number)}`).join(', ')
  steps.push({
    activeIds: [13],
    showTeleports: true,
    tokenAt: null,
    tally: winners.map((w) => ({ a: w.a, b: w.b as number, prod: w.a * (w.b as number) })),
    verdict: false,
    hold: 3000,
    caption: t(
      `Three pairs work: ${prodList}. Add the products.`,
      `Tiga pasangan berhasil: ${prodList}. Jumlahkan hasil kalinya.`,
    ),
  })

  // Final beat — the answer.
  const addExpr = winners.map((w) => w.a * (w.b as number)).join(' + ')
  steps.push({
    activeIds: [13],
    showTeleports: true,
    tokenAt: null,
    tally: winners.map((w) => ({ a: w.a, b: w.b as number, prod: w.a * (w.b as number) })),
    verdict: true,
    hold: 0,
    caption: t(`${addExpr} = ${sum}.`, `${addExpr} = ${sum}.`),
  })

  return { steps, finalIndex: steps.length - 1 }
}

function labelOf(c: Cell): string {
  return c === 'START' ? 'START' : c === 'FINISH' ? 'FINISH' : String(c)
}
