import type { Lang } from './makeTenSteps'

export interface Pile {
  tens: number
  ones: number
}

export type MoreLessPhase = 'start' | 'add' | 'combine' | 'regroup' | 'take' | 'borrow' | 'remove' | 'result'

export interface MoreLessStep {
  phase: MoreLessPhase
  /** The blocks in the main pile right now. */
  main: Pile
  /** The k blocks shown separately while adding/removing them (null once merged). */
  delta: { tens: number; ones: number; sign: '+' | '-' } | null
  /** Highlight the regroup / break-a-ten moment (the AHA). */
  highlight: boolean
  caption: string
  result: boolean
}

export interface MoreLessStoryboard {
  x: number
  k: number
  dir: 'more' | 'less'
  answer: number
  steps: MoreLessStep[]
  finalIndex: number
}

export function buildMoreLessSteps(x: number, k: number, dir: 'more' | 'less', lang: Lang): MoreLessStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const xTens = Math.floor(x / 10)
  const xOnes = x % 10
  const kTens = Math.floor(k / 10)
  const kOnes = k % 10
  const answer = dir === 'more' ? x + k : x - k
  const steps: MoreLessStep[] = []

  if (dir === 'more') {
    const combinedOnes = xOnes + kOnes
    const carry = Math.floor(combinedOnes / 10)
    const finalOnes = combinedOnes % 10
    const finalTens = xTens + kTens + carry

    steps.push({
      phase: 'start', main: { tens: xTens, ones: xOnes }, delta: null, highlight: false,
      caption: t(`Start with ${x}: ${xTens} tens and ${xOnes} ones.`, `Mulai dari ${x}: ${xTens} puluhan dan ${xOnes} satuan.`),
      result: false,
    })
    steps.push({
      phase: 'add', main: { tens: xTens, ones: xOnes }, delta: { tens: kTens, ones: kOnes, sign: '+' }, highlight: false,
      caption: t(`Bring in ${k} more: ${kTens} tens and ${kOnes} ones.`, `Tambahkan ${k} lagi: ${kTens} puluhan dan ${kOnes} satuan.`),
      result: false,
    })
    steps.push({
      phase: 'combine', main: { tens: xTens + kTens, ones: combinedOnes }, delta: null, highlight: carry > 0,
      caption: t(`Put them together: ${xTens + kTens} tens and ${combinedOnes} ones.`, `Gabungkan: ${xTens + kTens} puluhan dan ${combinedOnes} satuan.`),
      result: false,
    })
    if (carry > 0) {
      steps.push({
        phase: 'regroup', main: { tens: finalTens, ones: finalOnes }, delta: null, highlight: true,
        caption: t(`10 ones make a new ten! Now ${finalTens} tens and ${finalOnes} ones.`, `10 satuan jadi satu puluhan! Sekarang ${finalTens} puluhan dan ${finalOnes} satuan.`),
        result: false,
      })
    }
    steps.push({
      phase: 'result', main: { tens: finalTens, ones: finalOnes }, delta: null, highlight: false,
      caption: t(`${x} + ${k} = ${answer}.`, `${x} + ${k} = ${answer}.`), result: true,
    })
  } else {
    const borrow = xOnes < kOnes
    const finalOnes = borrow ? xOnes + 10 - kOnes : xOnes - kOnes
    const finalTens = xTens - kTens - (borrow ? 1 : 0)

    steps.push({
      phase: 'start', main: { tens: xTens, ones: xOnes }, delta: null, highlight: false,
      caption: t(`Start with ${x}: ${xTens} tens and ${xOnes} ones.`, `Mulai dari ${x}: ${xTens} puluhan dan ${xOnes} satuan.`),
      result: false,
    })
    steps.push({
      phase: 'take', main: { tens: xTens, ones: xOnes }, delta: { tens: kTens, ones: kOnes, sign: '-' }, highlight: false,
      caption: t(`Take away ${k}: ${kTens} tens and ${kOnes} ones.`, `Ambil ${k}: ${kTens} puluhan dan ${kOnes} satuan.`),
      result: false,
    })
    if (borrow) {
      steps.push({
        phase: 'borrow', main: { tens: xTens - 1, ones: xOnes + 10 }, delta: { tens: kTens, ones: kOnes, sign: '-' }, highlight: true,
        caption: t(`Not enough ones — break a ten into 10 ones.`, `Satuan kurang — pecah satu puluhan jadi 10 satuan.`),
        result: false,
      })
    }
    steps.push({
      phase: 'remove', main: { tens: finalTens, ones: finalOnes }, delta: null, highlight: false,
      caption: t(`Take them away: ${finalTens} tens and ${finalOnes} ones.`, `Sisihkan: ${finalTens} puluhan dan ${finalOnes} satuan.`),
      result: false,
    })
    steps.push({
      phase: 'result', main: { tens: finalTens, ones: finalOnes }, delta: null, highlight: false,
      caption: t(`${x} − ${k} = ${answer}.`, `${x} − ${k} = ${answer}.`), result: true,
    })
  }

  return { x, k, dir, answer, steps, finalIndex: steps.length - 1 }
}
