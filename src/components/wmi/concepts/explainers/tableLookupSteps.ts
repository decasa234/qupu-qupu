export type Lang = 'en' | 'id'

export interface TableLookupStep {
  /** Which row is highlighted (0 = apples, 1 = oranges, -1 = none). */
  highlightRow: -1 | 0 | 1
  /** Show the apples value popped/emphasised. */
  popApples: boolean
  /** Show the oranges value popped/emphasised. */
  popOranges: boolean
  /** Show the equation section below the table. */
  showEquation: boolean
  /** Reveal the answer in the equation. */
  showAnswer: boolean
  caption: string
  /** Hold duration in ms (0 = final beat, holds indefinitely). */
  hold: number
  result: boolean
}

export interface TableLookupStoryboard {
  apples: number
  oranges: number
  mode: 'sum' | 'diff'
  answer: number
  steps: TableLookupStep[]
  finalIndex: number
}

function safeInt(raw: unknown, fallback: number, lo: number, hi: number): number {
  const n = typeof raw === 'number' && Number.isFinite(raw) ? Math.round(raw) : fallback
  return Math.max(lo, Math.min(hi, n))
}

export function buildTableLookupSteps(
  applesRaw: unknown,
  orangesRaw: unknown,
  modeRaw: unknown,
  lang: Lang,
): TableLookupStoryboard {
  const apples = safeInt(applesRaw, 10, 5, 30)
  const oranges = safeInt(orangesRaw, 5, 5, 30)
  const mode: 'sum' | 'diff' = modeRaw === 'diff' ? 'diff' : 'sum'
  const answer = mode === 'sum' ? apples + oranges : apples - oranges

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TableLookupStep[] = [
    // Beat 0: highlight row 0 — read the apples value
    {
      highlightRow: 0,
      popApples: true,
      popOranges: false,
      showEquation: false,
      showAnswer: false,
      caption: t(
        `read the table — apples: ${apples}`,
        `baca tabel — apel: ${apples}`,
      ),
      hold: 1800,
      result: false,
    },
    // Beat 1: highlight row 1 — read the oranges value
    {
      highlightRow: 1,
      popApples: true,
      popOranges: true,
      showEquation: false,
      showAnswer: false,
      caption: t(
        `read the table — oranges: ${oranges}`,
        `baca tabel — jeruk: ${oranges}`,
      ),
      hold: 1800,
      result: false,
    },
    // Beat 2: reveal the equation (no answer yet)
    {
      highlightRow: -1,
      popApples: true,
      popOranges: true,
      showEquation: true,
      showAnswer: false,
      caption: t(
        mode === 'sum'
          ? `now add them: ${apples} + ${oranges} = ?`
          : `now subtract: ${apples} − ${oranges} = ?`,
        mode === 'sum'
          ? `sekarang jumlahkan: ${apples} + ${oranges} = ?`
          : `sekarang kurangkan: ${apples} − ${oranges} = ?`,
      ),
      hold: 2000,
      result: false,
    },
    // Beat 3 (final): reveal the answer
    {
      highlightRow: -1,
      popApples: true,
      popOranges: true,
      showEquation: true,
      showAnswer: true,
      caption: t(
        mode === 'sum'
          ? `${apples} + ${oranges} = ${answer}`
          : `${apples} − ${oranges} = ${answer}`,
        mode === 'sum'
          ? `${apples} + ${oranges} = ${answer}`
          : `${apples} − ${oranges} = ${answer}`,
      ),
      hold: 0,
      result: true,
    },
  ]

  return { apples, oranges, mode, answer, steps, finalIndex: steps.length - 1 }
}
