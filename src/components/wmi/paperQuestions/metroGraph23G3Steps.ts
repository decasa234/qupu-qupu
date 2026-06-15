// WMI-23F3A-Q8 (2023 Grade 3 Final) — weighted metro graph, cheapest ticket A→B.
//
// "Each metro segment costs the fare shown. Find the cheapest ticket from
//  station A to station B."  Answer: C = 150.
//
// GRAPH (node letters — A left, B top-right, P upper-middle, Q lower-left,
//  R central hub, S right-below-B, T bottom-right):
//    A–P 30   A–Q 50   P–Q 40   P–R 50   Q–R 20   Q–T 20
//    R–T 50   R–S 10   R–B 90   S–T 30   S–B 70
//
// METHOD (deduce, then try-and-eliminate the tempting dearer routes — never
// jump to the answer). Build the cheap route one hop at a time, then at the
// central hub R compare the two ways on to B:
//   • Start cheap from A: A→Q = 50 (A→P = 30 is cheaper, but P's onward hops are
//     dear; we follow the route that wins, and show the loser later).
//   • Q→R = 20  → running 50 + 20 = 70 at the hub R.
//   • From R, two ways to B:
//       direct  R→B      = 90 → 70 + 90 = 160  ✗ (dearer)
//       via S   R→S→B    = 10 + 70 = 80 → 70 + 80 = 150  ✓ (cheaper)
//   • Also tempting: A→P→R→S→B = 30 + 50 + 10 + 70 = 160 ✗ (dearer) — the P start
//     looks cheaper but P→R = 50 loses the lead.
//   • Cheapest = A→Q→R→S→B = 50 + 20 + 10 + 70 = 150 → choice C.
//
// Each beat carries ONE concrete sum and a node-id path to light up on the
// figure (the illustrator's MetroGraph23G3 `highlightPath` prop). The dearer
// tries get a ✗ and linger; the winner lands last with hold 0.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. Fares + paths are bound here so figure and arithmetic can't
// drift from the question stem.

export type Lang = 'en' | 'id'

/** Fares for every segment, keyed by sorted node pair "X-Y". */
export const FARES: Record<string, number> = {
  'A-P': 30,
  'A-Q': 50,
  'P-Q': 40,
  'P-R': 50,
  'Q-R': 20,
  'Q-T': 20,
  'R-T': 50,
  'R-S': 10,
  'B-R': 90, // R–B
  'S-T': 30,
  'B-S': 70, // S–B
}

/** Fare for an edge between two node ids, in either order. */
export function fare(a: string, b: string): number {
  const key = [a, b].sort().join('-')
  const f = FARES[key]
  if (f == null) throw new Error(`no fare for edge ${a}-${b}`)
  return f
}

/** Total fare along a node-id path (sum of its consecutive edges). */
export function pathCost(path: string[]): number {
  let sum = 0
  for (let i = 0; i + 1 < path.length; i++) sum += fare(path[i], path[i + 1])
  return sum
}

// The routes we walk on the figure.
export const WINNER_PATH = ['A', 'Q', 'R', 'S', 'B'] // 50+20+10+70 = 150 ✓ (C)
export const DIRECT_PATH = ['A', 'Q', 'R', 'B'] //      50+20+90    = 160 ✗
export const VIA_P_PATH = ['A', 'P', 'R', 'S', 'B'] //  30+50+10+70 = 160 ✗

export const ANSWER = pathCost(WINNER_PATH) // 150
export const ANSWER_CHOICE = 'C'

export interface MetroStep {
  /** Node-id path to light up on the figure this beat (null on intro). */
  highlightPath: string[] | null
  /** Running total to show in the badge (null when no sum yet). */
  runningTotal: number | null
  /** The arithmetic string for the badge, e.g. "50 + 20 = 70" (null on intro). */
  sumText: string | null
  /** True only on the final winning beat. */
  result: boolean
  /** True on a beat that rejects a dearer route (lingers a touch longer). */
  reject: boolean
  caption: string
  hold: number
}

export interface MetroStoryboard {
  answer: number
  answerChoice: string
  winnerPath: string[]
  steps: MetroStep[]
  finalIndex: number
}

export function buildMetroGraphSteps(lang: Lang): MetroStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // running fares for the captions, drawn straight from FARES (no drift).
  const aq = fare('A', 'Q') // 50
  const qr = fare('Q', 'R') // 20
  const rb = fare('R', 'B') // 90
  const rs = fare('R', 'S') // 10
  const sb = fare('S', 'B') // 70
  const ap = fare('A', 'P') // 30
  const pr = fare('P', 'R') // 50

  const atHub = aq + qr // 70 — running cost at R via Q
  const direct = atHub + rb // 160 ✗
  const viaS = atHub + rs + sb // 150 ✓
  const viaP = ap + pr + rs + sb // 160 ✗

  const steps: MetroStep[] = [
    // 1 — restate the goal.
    {
      highlightPath: null,
      runningTotal: null,
      sumText: null,
      result: false,
      reject: false,
      hold: 2600,
      caption: t(
        'Find the cheapest ticket from A to B. Add up the fares hop by hop — keep the lowest total.',
        'Cari tiket termurah dari A ke B. Jumlahkan ongkos tiap ruas — simpan total terkecil.',
      ),
    },
    // 2 — first hop: A → Q = 50.
    {
      highlightPath: ['A', 'Q'],
      runningTotal: aq,
      sumText: `${aq}`,
      result: false,
      reject: false,
      hold: 2200,
      caption: t(
        `Go A → Q first: that costs ${aq}. Now we're at Q.`,
        `Lewat A → Q dulu: ongkosnya ${aq}. Sekarang di Q.`,
      ),
    },
    // 3 — second hop: Q → R = 20, running 70 at the hub.
    {
      highlightPath: ['A', 'Q', 'R'],
      runningTotal: atHub,
      sumText: `${aq} + ${qr} = ${atHub}`,
      result: false,
      reject: false,
      hold: 2300,
      caption: t(
        `Q → R costs ${qr}. So far ${aq} + ${qr} = ${atHub}. R is the hub — two ways reach B from here.`,
        `Q → R biaya ${qr}. Sejauh ini ${aq} + ${qr} = ${atHub}. R simpang — ada dua jalan ke B dari sini.`,
      ),
    },
    // 4 — TRY the tempting shortcut R → B = 90  → 160 ✗ (linger).
    {
      highlightPath: DIRECT_PATH,
      runningTotal: direct,
      sumText: `${atHub} + ${rb} = ${direct}`,
      result: false,
      reject: true,
      hold: 2200,
      caption: t(
        `Try straight R → B = ${rb}: ${atHub} + ${rb} = ${direct}. That's dear — keep looking ✗.`,
        `Coba langsung R → B = ${rb}: ${atHub} + ${rb} = ${direct}. Itu mahal — cari lagi ✗.`,
      ),
    },
    // 5 — try the detour R → S → B = 10 + 70 → 150 ✓ (cheaper).
    {
      highlightPath: WINNER_PATH,
      runningTotal: viaS,
      sumText: `${atHub} + ${rs} + ${sb} = ${viaS}`,
      result: false,
      reject: false,
      hold: 2400,
      caption: t(
        `Instead R → S → B = ${rs} + ${sb}: ${atHub} + ${rs} + ${sb} = ${viaS}. Cheaper than ${direct}! ✓`,
        `Sebaliknya R → S → B = ${rs} + ${sb}: ${atHub} + ${rs} + ${sb} = ${viaS}. Lebih murah dari ${direct}! ✓`,
      ),
    },
    // 6 — TRY the other tempting start A → P → R → S → B = 160 ✗ (linger).
    {
      highlightPath: VIA_P_PATH,
      runningTotal: viaP,
      sumText: `${ap} + ${pr} + ${rs} + ${sb} = ${viaP}`,
      result: false,
      reject: true,
      hold: 2200,
      caption: t(
        `What about A → P → R → S → B? ${ap} + ${pr} + ${rs} + ${sb} = ${viaP}. P → R = ${pr} loses the lead ✗.`,
        `Bagaimana A → P → R → S → B? ${ap} + ${pr} + ${rs} + ${sb} = ${viaP}. P → R = ${pr} kalah ✗.`,
      ),
    },
    // 7 — land on the answer: A → Q → R → S → B = 150 → choice C. (winner, holds)
    {
      highlightPath: WINNER_PATH,
      runningTotal: ANSWER,
      sumText: `${aq} + ${qr} + ${rs} + ${sb} = ${ANSWER}`,
      result: true,
      reject: false,
      hold: 0,
      caption: t(
        `Cheapest is A → Q → R → S → B = ${aq} + ${qr} + ${rs} + ${sb} = ${ANSWER}. Answer ${ANSWER_CHOICE}.`,
        `Termurah A → Q → R → S → B = ${aq} + ${qr} + ${rs} + ${sb} = ${ANSWER}. Jawaban ${ANSWER_CHOICE}.`,
      ),
    },
  ]

  return {
    answer: ANSWER,
    answerChoice: ANSWER_CHOICE,
    winnerPath: WINNER_PATH,
    steps,
    finalIndex: steps.length - 1,
  }
}
