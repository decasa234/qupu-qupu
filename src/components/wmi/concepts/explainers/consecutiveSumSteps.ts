import type { Lang } from './makeTenSteps'

// P6 / consecutive-integer-sum. The lesson is the BALANCING insight: a run of
// consecutive numbers is symmetric about its middle, so pairing the ends inward
// gives pairs that all add to the same amount. That turns "guess a start and
// keep adding" into one division:
//   • odd run  → one lonely middle box  → total = count × middle
//   • even run → nothing left over      → total = (count ÷ 2) × pair sum
// Only after the middle is known does the run get filled in, stepping outward
// symmetrically, and only the very last beat names the end the question asked
// for.

export type ConsecutiveAsk = 'smallest' | 'largest'

export interface ConsecutiveSumParams {
  n: number
  start: number
  /** Which end the stem asks for. Older pooled rows have no `ask`. */
  ask?: ConsecutiveAsk
  /** Which side the one non-run option sits on. Older pooled rows have none. */
  neighbour?: 'low' | 'high'
}

export type ConsecutiveSumBeatId =
  | 'intro'
  | 'ladder'
  | 'pair'
  | 'balance'
  | 'divide'
  | 'middles'
  | 'spread'
  | 'ends'
  | 'answer'

export interface ConsecutiveSumBeat {
  id: ConsecutiveSumBeatId
  caption: string
  /** Box indices whose number is written in this beat (ascending). */
  revealed: number[]
  /** Draw the "+1" ladder arrows under the row. */
  showSteps: boolean
  /** How many pairing arcs are drawn, counted from the outermost inward. */
  pairsShown: number
  /** 1-based index of the arc drawn this beat (outermost = 1), else null. */
  activePair: number | null
  /** Show the +1 / −1 badges that explain why stepping inward keeps the sum. */
  showCancel: boolean
  /** Number written on every arc once the pair sum is known, else null. */
  arcLabel: number | null
  /** Ring the centre box (odd run) or the two centre boxes (even run). */
  centerLit: boolean
  /** Equation strip under the row. */
  equation: string | null
  /** Box index of the asked end — only on the landing beat. */
  answerIndex: number | null
  /** Option letter — only on the landing beat. */
  answerLabel: string | null
  result: boolean
  hold: number
}

export interface ConsecutiveSumStoryboard {
  n: number
  start: number
  sum: number
  run: number[]
  isOdd: boolean
  ask: ConsecutiveAsk
  /** Box indices of the centre: one for an odd run, two for an even run. */
  centerIndexes: number[]
  /** How many end-to-end pairs the run makes. */
  pairCount: number
  /** What every pair adds to (= 2 × middle on an odd run). */
  pairSum: number
  /** The lone middle of an odd run, else null. */
  middle: number | null
  /** The two middles of an even run, else null. */
  middles: [number, number] | null
  /** How many symmetric rings sit outside the centre (the last one is the ends). */
  rings: number
  answer: number
  answerIndex: number
  answerLabel: string | null
  steps: ConsecutiveSumBeat[]
  finalIndex: number
}

const LABELS = ['A', 'B', 'C', 'D'] as const

interface NormalParams {
  n: number
  start: number
  ask: ConsecutiveAsk
  neighbour: 'low' | 'high'
}

function normalize(raw: ConsecutiveSumParams): NormalParams {
  const n = Math.min(6, Math.max(3, Math.round(Number(raw?.n) || 3)))
  const start = Math.max(1, Math.round(Number(raw?.start) || 1))
  const ask: ConsecutiveAsk = raw?.ask === 'largest' ? 'largest' : 'smallest'
  const neighbour = raw?.neighbour === 'high' ? 'high' : 'low'
  return { n, start, ask, neighbour }
}

/** Same four options the generator builds: both ends, the lower middle, and one
 * number just outside the run — ascending. */
export function consecutiveSumOptions(n: number, start: number, neighbour: 'low' | 'high'): number[] {
  const outsider = neighbour === 'low' ? start - 1 : start + n
  return [start, start + Math.floor((n - 1) / 2), start + n - 1, outsider].sort((a, b) => a - b)
}

export function buildConsecutiveSumSteps(
  rawParams: ConsecutiveSumParams,
  lang: Lang = 'id',
  correctAnswer?: string,
): ConsecutiveSumStoryboard {
  const { n, start, ask, neighbour } = normalize(rawParams)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const run = Array.from({ length: n }, (_, i) => start + i)
  const sum = run.reduce((a, b) => a + b, 0)
  const isOdd = n % 2 === 1
  const pairCount = Math.floor(n / 2)
  const pairSum = 2 * start + n - 1

  // Centre of the row: one box when the run is odd, two when it is even.
  const centerIndexes = isOdd ? [(n - 1) / 2] : [n / 2 - 1, n / 2]
  const lowCenter = centerIndexes[0]
  const highCenter = centerIndexes[centerIndexes.length - 1]
  const middle = isOdd ? run[lowCenter] : null
  const middles: [number, number] | null = isOdd ? null : [run[lowCenter], run[highCenter]]
  // Symmetric rings outside the centre; ring `rings` is always {0, n-1}.
  const rings = lowCenter

  const answerIndex = ask === 'smallest' ? 0 : n - 1
  const answer = run[answerIndex]

  const answered = typeof correctAnswer === 'string' ? correctAnswer.trim().toUpperCase() : ''
  const computed = LABELS[consecutiveSumOptions(n, start, neighbour).indexOf(answer)] ?? null
  const answerLabel = (LABELS as readonly string[]).includes(answered) ? answered : computed

  const steps: ConsecutiveSumBeat[] = []
  const push = (
    beat: Partial<ConsecutiveSumBeat> & { id: ConsecutiveSumBeatId; caption: string; hold: number },
  ) => {
    steps.push({
      revealed: [],
      showSteps: false,
      pairsShown: 0,
      activePair: null,
      showCancel: false,
      arcLabel: null,
      centerLit: false,
      equation: null,
      answerIndex: null,
      answerLabel: null,
      result: false,
      ...beat,
    })
  }

  // 1 — what we are given: how many boxes, and one total. No numbers inside.
  push({
    id: 'intro',
    caption: t(`${n} numbers in a row. Together they make ${sum}.`, `${n} bilangan berurutan. Jumlahnya ${sum}.`),
    hold: 2100,
  })

  // 2 — the only rule about the boxes: one step right is one more.
  push({
    id: 'ladder',
    caption: t('Each box to the right is 1 more.', 'Ke kanan, tiap kotak naik 1.'),
    showSteps: true,
    hold: 1900,
  })

  // 3 — pair the ends, then show WHY stepping inward keeps the pair sum.
  push({
    id: 'pair',
    caption: t('Pair the two ends up.', 'Pasangkan kedua ujungnya.'),
    showSteps: true,
    pairsShown: 1,
    activePair: 1,
    hold: 2000,
  })
  if (pairCount >= 2) {
    push({
      id: 'pair',
      caption: t(
        'Step inward: left goes up 1, right goes down 1. Every pair adds to the same.',
        'Melangkah ke dalam: kiri naik 1, kanan turun 1. Tiap pasangan jumlahnya sama.',
      ),
      showSteps: true,
      pairsShown: pairCount,
      activePair: 2,
      showCancel: true,
      hold: 2400,
    })
  }

  // 4 — read the symmetry off the picture. Odd: a lonely middle. Even: no
  // leftovers, just equal pairs.
  push({
    id: 'balance',
    caption: isOdd
      ? t(
          `The middle box has no partner. Each pair is 2 × the middle, so the total is ${n} × the middle.`,
          `Kotak tengah tidak punya pasangan. Tiap pasangan = 2 × tengah, jadi jumlah = ${n} × tengah.`,
        )
      : t(
          `No box is left alone: ${pairCount} pairs, all the same.`,
          `Tidak ada kotak yang sendirian: ${pairCount} pasangan, semuanya sama.`,
        ),
    showSteps: true,
    pairsShown: pairCount,
    centerLit: true,
    hold: 2400,
  })

  // 5 — the whole slog collapses into one division.
  if (isOdd) {
    push({
      id: 'divide',
      caption: t(`So the middle is ${sum} ÷ ${n} = ${middle}.`, `Jadi tengahnya ${sum} ÷ ${n} = ${middle}.`),
      revealed: [lowCenter],
      showSteps: true,
      pairsShown: pairCount,
      centerLit: true,
      equation: `${sum} ÷ ${n} = ${middle}`,
      hold: 2300,
    })
  } else {
    push({
      id: 'divide',
      caption: t(
        `So each pair is ${sum} ÷ ${pairCount} = ${pairSum}.`,
        `Jadi tiap pasangan jumlahnya ${sum} ÷ ${pairCount} = ${pairSum}.`,
      ),
      showSteps: true,
      pairsShown: pairCount,
      arcLabel: pairSum,
      centerLit: true,
      equation: `${sum} ÷ ${pairCount} = ${pairSum}`,
      hold: 2300,
    })
    // 5b — the innermost pair is two boxes one apart, so the pair sum splits.
    const [m1, m2] = middles as [number, number]
    push({
      id: 'middles',
      caption: t(
        `The two middle boxes are 1 apart and make ${pairSum}: ${m1} and ${m2}.`,
        `Dua kotak tengah selisih 1 dan berjumlah ${pairSum}: ${m1} dan ${m2}.`,
      ),
      revealed: [lowCenter, highCenter],
      showSteps: true,
      pairsShown: pairCount,
      arcLabel: pairSum,
      centerLit: true,
      equation: `${m1} + ${m2} = ${pairSum}`,
      hold: 2300,
    })
  }

  // 6 — walk outward from the centre, one symmetric ring per beat, so the run
  // is DEDUCED rather than announced.
  const revealedSoFar = [...centerIndexes]
  for (let k = 1; k <= rings; k++) {
    revealedSoFar.push(lowCenter - k, highCenter + k)
    const revealed = [...revealedSoFar].sort((a, b) => a - b)
    const isEnds = k === rings
    if (!isEnds) {
      push({
        id: 'spread',
        caption: t('Step out: 1 less to the left, 1 more to the right.', 'Melangkah keluar: kiri kurang 1, kanan tambah 1.'),
        revealed,
        showSteps: true,
        pairsShown: pairCount,
        arcLabel: isOdd ? null : pairSum,
        hold: 1900,
      })
    } else {
      // 7 — the ends land, and the whole row can be checked against the total.
      push({
        id: 'ends',
        caption:
          rings === 1
            ? t('One step out and both ends appear.', 'Satu langkah keluar, kedua ujungnya muncul.')
            : t('Keep going until both ends appear.', 'Teruskan sampai kedua ujungnya muncul.'),
        revealed,
        showSteps: true,
        pairsShown: pairCount,
        arcLabel: isOdd ? null : pairSum,
        equation: `${run.join(' + ')} = ${sum}`,
        hold: 2200,
      })
    }
  }

  // 8 — and only now, the end the question actually asked for.
  const allBoxes = run.map((_, i) => i)
  const tail = answerLabel ? t(` That is ${answerLabel}.`, ` Jawabannya ${answerLabel}.`) : ''
  push({
    id: 'answer',
    caption:
      (ask === 'smallest'
        ? t(`The smallest is ${answer}.`, `Yang terkecil ${answer}.`)
        : t(`The largest is ${answer}.`, `Yang terbesar ${answer}.`)) + tail,
    revealed: allBoxes,
    showSteps: true,
    pairsShown: pairCount,
    arcLabel: isOdd ? null : pairSum,
    equation: `${run.join(' + ')} = ${sum}`,
    answerIndex,
    answerLabel,
    result: true,
    hold: 0,
  })

  return {
    n,
    start,
    sum,
    run,
    isOdd,
    ask,
    centerIndexes,
    pairCount,
    pairSum,
    middle,
    middles,
    rings,
    answer,
    answerIndex,
    answerLabel,
    steps,
    finalIndex: steps.length - 1,
  }
}
