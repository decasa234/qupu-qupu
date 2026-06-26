import type { Lang } from '../../concepts/explainers/makeTenSteps'

// ── problem constants (bound to seed Q9 quantities) ──────────────────────────
export const CAT_SHEEP_BALLOONS  = 5    // cat + sheep → 5 balloons
export const FULL_BASKET_BALLOONS = 11  // cat + sheep + 2 dogs → 11 balloons
export const TWO_DOGS_BALLOONS   = FULL_BASKET_BALLOONS - CAT_SHEEP_BALLOONS  // 6
export const ONE_DOG_BALLOONS    = TWO_DOGS_BALLOONS / 2                       // 3
export const ANSWER_BALLOONS     = CAT_SHEEP_BALLOONS + ONE_DOG_BALLOONS       // 8
export const ANSWER_LABEL        = 'A'

export interface BalloonAnimalsStep {
  highlightPanel: 0 | 1 | 2 | 3
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface BalloonAnimalsStoryboard {
  steps: BalloonAnimalsStep[]
  finalIndex: number
}

/**
 * Beat-by-beat storyboard for SASMO-19-G3-Q9.
 *
 * Beat 0 — Read the three panels: what do we know?
 * Beat 1 — Focus panel 2 (middle): cat + sheep = 5 balloons.
 * Beat 2 — Focus panel 1 (left): cat + sheep + 2 dogs = 11 balloons.
 * Beat 3 — Subtract: 2 dogs = 11 − 5 = 6 → 1 dog = 3 balloons.
 * Beat 4 — Solve: cat + sheep + dog = 5 + 3 = 8 balloons.
 * Beat 5 — Result: answer A = 8.
 */
export function buildBalloonAnimals19G3Q9Steps(lang: Lang): BalloonAnimalsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BalloonAnimalsStep[] = [
    {
      highlightPanel: 0,
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        'Three gondolas show different animals and how many balloons carry them. Find the missing count for the right basket.',
        'Tiga keranjang balon menunjukkan hewan berbeda dan jumlah balon yang membawa mereka. Temukan jumlah balon untuk keranjang kanan.',
      ),
    },
    {
      highlightPanel: 1,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Middle basket: cat + sheep need ${CAT_SHEEP_BALLOONS} balloons.  →  cat + sheep = ${CAT_SHEEP_BALLOONS}`,
        `Keranjang tengah: kucing + domba butuh ${CAT_SHEEP_BALLOONS} balon.  →  kucing + domba = ${CAT_SHEEP_BALLOONS}`,
      ),
    },
    {
      highlightPanel: 2,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Left basket: cat + sheep + 2 dogs need ${FULL_BASKET_BALLOONS} balloons.  →  cat + sheep + 2 dogs = ${FULL_BASKET_BALLOONS}`,
        `Keranjang kiri: kucing + domba + 2 anjing butuh ${FULL_BASKET_BALLOONS} balon.  →  kucing + domba + 2 anjing = ${FULL_BASKET_BALLOONS}`,
      ),
    },
    {
      highlightPanel: 2,
      showAnswer: false,
      hold: 2500,
      result: false,
      caption: t(
        `Subtract: 2 dogs = ${FULL_BASKET_BALLOONS} − ${CAT_SHEEP_BALLOONS} = ${TWO_DOGS_BALLOONS} balloons.  So 1 dog = ${TWO_DOGS_BALLOONS} ÷ 2 = ${ONE_DOG_BALLOONS} balloons.`,
        `Kurangi: 2 anjing = ${FULL_BASKET_BALLOONS} − ${CAT_SHEEP_BALLOONS} = ${TWO_DOGS_BALLOONS} balon.  Jadi 1 anjing = ${TWO_DOGS_BALLOONS} ÷ 2 = ${ONE_DOG_BALLOONS} balon.`,
      ),
    },
    {
      highlightPanel: 3,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Right basket: cat + sheep + dog = ${CAT_SHEEP_BALLOONS} + ${ONE_DOG_BALLOONS} = ${ANSWER_BALLOONS} balloons.`,
        `Keranjang kanan: kucing + domba + anjing = ${CAT_SHEEP_BALLOONS} + ${ONE_DOG_BALLOONS} = ${ANSWER_BALLOONS} balon.`,
      ),
    },
    {
      highlightPanel: 3,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `${ANSWER_BALLOONS} balloons are needed. Answer ${ANSWER_LABEL}. ✓`,
        `Dibutuhkan ${ANSWER_BALLOONS} balon. Jawaban ${ANSWER_LABEL}. ✓`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
