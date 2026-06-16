import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { BALL_SETS, type Ball, type BallMark } from './Balls22G1Option'

// Storyboard for WMI-22F1A-Q11 (Grade 1). Kiki has 4 balls; the set must have
// MORE BLACK than WHITE *and* MORE LARGE than SMALL. We state the two rules,
// then check every option A→D in turn — marking the colours, then the sizes —
// and reject the ones that fail (with the counts visible). Only B passes both.
//
// Counts are DERIVED from BALL_SETS so the captions can never drift from the
// figure the illustrator drew. Pure function of `lang` — SSR-safe, deterministic.

export type Label = 'A' | 'B' | 'C' | 'D'

export interface BallCounts {
  black: number
  white: number
  large: number
  small: number
}

export interface BallsStep {
  /** Which option this beat is examining (undefined on the intro/result framing). */
  label?: Label
  /** Balls to render for this beat (the option under test, or B on intro/result). */
  balls: Ball[]
  /** Attribute the figure rings on this beat (one condition at a time). */
  mark?: BallMark
  /** Verdict pills shown for the two rules ('pass' | 'fail' | undefined = not yet judged). */
  colorVerdict?: 'pass' | 'fail'
  sizeVerdict?: 'pass' | 'fail'
  caption: string
  hold: number
  /** True only on the winning final beat (green styling). */
  result: boolean
}

export interface BallsStoryboard {
  answer: Label
  /** Localized rule labels for the two badges. */
  ruleColorLabel: string
  ruleSizeLabel: string
  passLabel: string
  failLabel: string
  steps: BallsStep[]
  finalIndex: number
}

function countBalls(balls: Ball[]): BallCounts {
  return balls.reduce<BallCounts>(
    (acc, b) => {
      if (b.color === 'black') acc.black += 1
      else acc.white += 1
      if (b.size === 'large') acc.large += 1
      else acc.small += 1
      return acc
    },
    { black: 0, white: 0, large: 0, small: 0 },
  )
}

const ORDER: Label[] = ['A', 'B', 'C', 'D']

export function buildBalls22G1Steps(lang: Lang): BallsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const answer: Label = 'B'

  const steps: BallsStep[] = []

  // Beat 1 — state the two rules. Show B as a neutral sample, no marks yet.
  steps.push({
    balls: BALL_SETS[answer],
    hold: 2400,
    result: false,
    caption: t(
      'Two rules: MORE BLACK than white, AND MORE LARGE than small. Check each set!',
      'Dua aturan: lebih banyak HITAM daripada putih, DAN lebih banyak BESAR daripada kecil. Cek tiap kumpulan!',
    ),
  })

  // Beats per option: mark colours (judge rule 1), then mark sizes (judge rule 2).
  for (const label of ORDER) {
    const c = countBalls(BALL_SETS[label])
    const colorPass = c.black > c.white
    const sizePass = c.large > c.small

    const colorPhrase = `${c.black} ${t('black', 'hitam')} vs ${c.white} ${t('white', 'putih')}`
    const sizePhrase = `${c.large} ${t('large', 'besar')} vs ${c.small} ${t('small', 'kecil')}`
    const tick = '✓'
    const cross = '✗'

    // Colour check.
    steps.push({
      label,
      balls: BALL_SETS[label],
      mark: 'black',
      colorVerdict: colorPass ? 'pass' : 'fail',
      hold: colorPass ? 2200 : 2400,
      result: false,
      caption: colorPass
        ? t(
            `Set ${label}: ${colorPhrase} — more black ${tick}. Now check the sizes…`,
            `Kumpulan ${label}: ${colorPhrase} — lebih banyak hitam ${tick}. Sekarang cek ukurannya…`,
          )
        : t(
            `Set ${label}: ${colorPhrase} — NOT more black ${cross}. Rule 1 fails, so ${label} is out.`,
            `Kumpulan ${label}: ${colorPhrase} — TIDAK lebih banyak hitam ${cross}. Aturan 1 gagal, jadi ${label} gugur.`,
          ),
    })

    // Size check only matters when the colour rule already passed.
    if (colorPass) {
      steps.push({
        label,
        balls: BALL_SETS[label],
        mark: 'large',
        colorVerdict: 'pass',
        sizeVerdict: sizePass ? 'pass' : 'fail',
        hold: sizePass ? 2200 : 2400,
        result: false,
        caption: sizePass
          ? t(
              `Set ${label}: ${sizePhrase} — more large ${tick}. Both rules hold!`,
              `Kumpulan ${label}: ${sizePhrase} — lebih banyak besar ${tick}. Kedua aturan terpenuhi!`,
            )
          : t(
              `Set ${label}: ${sizePhrase} — NOT more large ${cross}. Rule 2 fails, so ${label} is out.`,
              `Kumpulan ${label}: ${sizePhrase} — TIDAK lebih banyak besar ${cross}. Aturan 2 gagal, jadi ${label} gugur.`,
            ),
      })
    }
  }

  // Final beat — B is the only set passing BOTH rules. Ring nothing; let the
  // green verdict carry it.
  const cB = countBalls(BALL_SETS[answer])
  steps.push({
    label: answer,
    balls: BALL_SETS[answer],
    colorVerdict: 'pass',
    sizeVerdict: 'pass',
    hold: 0,
    result: true,
    caption: t(
      `Only set ${answer} has more black (${cB.black} vs ${cB.white}) AND more large (${cB.large} vs ${cB.small}) — the answer is ${answer}.`,
      `Hanya kumpulan ${answer} yang lebih banyak hitam (${cB.black} vs ${cB.white}) DAN lebih banyak besar (${cB.large} vs ${cB.small}) — jawabannya ${answer}.`,
    ),
  })

  return {
    answer,
    ruleColorLabel: t('more black', 'lebih banyak hitam'),
    ruleSizeLabel: t('more large', 'lebih banyak besar'),
    passLabel: t('pass', 'lolos'),
    failLabel: t('fail', 'gagal'),
    steps,
    finalIndex: steps.length - 1,
  }
}
