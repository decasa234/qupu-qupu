import type { Lang } from './makeTenSteps'

// Storyboard for `mastermind-code-deduce`: a lock hides a code of three
// different digits from 1..6, and three or four guesses have already been
// reported on. The animation replays the ONE argument the hints make — the list
// of possible codes only ever gets shorter, and the answer is whatever is left
// standing.
//
// The reports are recomputed here from `code` + `guesses` with the same rule the
// backend uses, so a beat can never claim a count the question did not print.

export interface Report {
  placed: number
  present: number
}

/**
 * The lock's report for one guess against one code. Both lists hold DISTINCT
 * digits, so "wrong spot" is a plain set overlap minus the exact hits.
 */
export function scoreGuess(guess: number[], code: number[]): Report {
  let placed = 0
  for (let i = 0; i < guess.length; i++) if (guess[i] === code[i]) placed += 1
  const shared = guess.filter((d) => code.includes(d)).length
  return { placed, present: shared - placed }
}

/** Every ordered triple of distinct digits from 1..poolSize. */
export function allCodes(poolSize: number, codeLength: number): string[] {
  const out: string[] = []
  const picked: number[] = []
  const walk = (): void => {
    if (picked.length === codeLength) {
      out.push(picked.join(''))
      return
    }
    for (let d = 1; d <= poolSize; d++) {
      if (picked.includes(d)) continue
      picked.push(d)
      walk()
      picked.pop()
    }
  }
  walk()
  return out
}

const ORDINAL_EN = ['first', 'second', 'third'] as const
const ORDINAL_ID = ['pertama', 'kedua', 'ketiga'] as const

export interface MastermindBeat {
  caption: string
  /** Which guess row is under the spotlight (null on the intro and final beat). */
  clueIndex: number | null
  /** Digits proved to be outside the code by the reports read so far. */
  ruledOutDigits: number[]
  /** Codes on screen this beat. Empty until the digit set is settled. */
  candidates: string[]
  /** Codes this beat crosses off (a subset of `candidates`). */
  killed: string[]
  /** True on the last beat, where the surviving code is read out. */
  result: boolean
  hold: number
}

export interface MastermindStoryboard {
  guesses: number[][]
  reports: Report[]
  answer: string
  steps: MastermindBeat[]
  finalIndex: number
}

export function buildMastermindCodeDeduceSteps(
  code: number[],
  guesses: number[][],
  poolSize: number,
  lang: Lang,
): MastermindStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const codeLength = code.length
  const reports = guesses.map((g) => scoreGuess(g, code))
  const answer = code.join('')

  const steps: MastermindBeat[] = [
    {
      caption: t(
        `${codeLength} different digits from 1 to ${poolSize}. Read one report at a time.`,
        `${codeLength} angka berbeda dari 1 sampai ${poolSize}. Baca laporan satu per satu.`,
      ),
      clueIndex: null,
      ruledOutDigits: [],
      candidates: [],
      killed: [],
      result: false,
      hold: 2200,
    },
  ]

  let live = allCodes(poolSize, codeLength)
  const ruledOut: number[] = []

  guesses.forEach((guess, i) => {
    const report = reports[i]
    const before = live
    const after = before.filter((cand) => {
      const digits = cand.split('').map(Number)
      const f = scoreGuess(guess, digits)
      return f.placed === report.placed && f.present === report.present
    })
    const keep = new Set(after)
    const killed = before.filter((c) => !keep.has(c))

    if (report.placed === 0 && report.present === 0) {
      for (const d of guess) if (!ruledOut.includes(d)) ruledOut.push(d)
    }

    // The digit set has just been settled when every survivor is built from the
    // same digits and the previous list was not. Before that moment the list is
    // far too long to draw, so the beat shows only what is left.
    const setOf = (c: string) => c.split('').sort().join('')
    const beforeSettled = new Set(before.map(setOf)).size === 1
    const afterSettled = after.length > 0 && new Set(after.map(setOf)).size === 1
    const settles = !beforeSettled && afterSettled
    const listable = before.length <= codeLength * 4

    let caption: string
    if (settles) {
      const digits = after[0].split('').sort()
      caption =
        ruledOut.length > 0
          ? t(
              `${ruledOut.join(', ')} are out — the code is ${digits.join(', ')} in some order.`,
              `${ruledOut.join(', ')} gugur — kodenya ${digits.join(', ')} dalam suatu urutan.`,
            )
          : t(
              `The code is ${digits.join(', ')} in some order.`,
              `Kodenya ${digits.join(', ')} dalam suatu urutan.`,
            )
    } else if (report.placed === 0) {
      const bans = guess
        .map((digit, spot) => ({ digit, spot }))
        .filter(({ digit, spot }) => before.some((c) => Number(c[spot]) === digit))
      caption =
        bans.length > 0
          ? t(
              `Nothing in place: ${bans.map((b) => `the ${ORDINAL_EN[b.spot]} digit is not ${b.digit}`).join(', ')}.`,
              `Tidak ada yang tepat: ${bans.map((b) => `angka ${ORDINAL_ID[b.spot]} bukan ${b.digit}`).join(', ')}.`,
            )
          : t('Nothing is standing in the right spot.', 'Tidak ada yang berada di tempat yang tepat.')
    } else {
      caption = t(
        `Only ${report.placed} in place and ${report.present} misplaced — keep just the orders that score that.`,
        `Hanya ${report.placed} tepat dan ${report.present} salah tempat — sisakan urutan yang skornya segitu.`,
      )
    }

    steps.push({
      caption,
      clueIndex: i,
      ruledOutDigits: [...ruledOut],
      // Once the list is short enough to draw, show it WITH the doomed codes so
      // the beat can cross them off; before that, show only the survivors.
      candidates: listable ? before : after,
      killed: listable ? killed : [],
      result: false,
      hold: 3000,
    })
    live = after
  })

  steps.push({
    caption: t(`Only ${answer} survives every report.`, `Hanya ${answer} yang lolos semua laporan.`),
    clueIndex: null,
    ruledOutDigits: [...ruledOut],
    candidates: live.length > 0 ? live : [answer],
    killed: [],
    result: true,
    hold: 0,
  })

  return { guesses, reports, answer, steps, finalIndex: steps.length - 1 }
}
