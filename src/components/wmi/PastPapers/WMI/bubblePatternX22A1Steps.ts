import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type BubblePatternPhase = 'show' | 'corners' | 'reveal' | 'centers' | 'diff' | 'result'

export interface BubblePatternStep {
  phase: BubblePatternPhase
  ringCorners: boolean   // ring top/bl/br across all figures
  revealFig3: boolean    // show B=4, C=5 in figure 3
  ringCenters: boolean   // ring center circles across all figures
  showAnswer: boolean    // show A=35 in figure 3
  caption: string
  hold: number
  result: boolean
}

export interface BubblePatternStoryboard {
  steps: BubblePatternStep[]
  finalIndex: number
}

// Problem constants (bound to seed quantities)
export const FIG1 = { top: 1, bl: 2, br: 3, center: 9 } as const
export const FIG2 = { top: 2, bl: 3, br: 4, center: 20 } as const
export const FIG3 = { top: 3, bl: 4, br: 5, center: 35 } as const  // B=4, C=5, A=35
export const DIFF1 = FIG2.center - FIG1.center  // 11
export const DIFF2 = FIG3.center - FIG2.center  // 15
export const DIFF_INC = DIFF2 - DIFF1           // 4

/**
 * Beat-by-beat storyboard for SEAMOX-22-A-Q1:
 *   0. Show all 3 diagrams — read the problem.
 *   1. Highlight corner satellites — observe +1 pattern each figure.
 *   2. Reveal B=4, C=5 in figure 3.
 *   3. Ring center circles — observe the center sequence 9, 20, A.
 *   4. Show difference growth: 11, 15 (+4) → A = 20 + 15 = 35.
 *   5. Result — show A=35 in figure 3.
 */
export function buildBubblePatternX22A1Steps(lang: Lang): BubblePatternStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BubblePatternStep[] = [
    {
      phase: 'show',
      ringCorners: false,
      revealFig3: false,
      ringCenters: false,
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        'Study the three bubble diagrams. Each has a large center value and three corner satellites.',
        'Perhatikan tiga diagram gelembung. Setiap gambar punya nilai tengah besar dan tiga nilai sudut kecil.',
      ),
    },
    {
      phase: 'corners',
      ringCorners: true,
      revealFig3: false,
      ringCenters: false,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Corner pattern: top goes 1→2→3, BL goes 2→3→?, BR goes 3→4→?. Each corner increases by 1 per figure.`,
        `Pola sudut: atas 1→2→3, bawah-kiri 2→3→?, bawah-kanan 3→4→?. Setiap sudut bertambah 1 per gambar.`,
      ),
    },
    {
      phase: 'reveal',
      ringCorners: false,
      revealFig3: true,
      ringCenters: false,
      showAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        `So Figure 3: top=3, B=${FIG3.bl}, C=${FIG3.br}. (Hint: find C first → C=${FIG3.br}.)`,
        `Jadi Gambar 3: atas=3, B=${FIG3.bl}, C=${FIG3.br}. (Petunjuk: temukan C dulu → C=${FIG3.br}.)`,
      ),
    },
    {
      phase: 'centers',
      ringCorners: false,
      revealFig3: true,
      ringCenters: true,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Center sequence: ${FIG1.center}, ${FIG2.center}, A. First difference: ${FIG2.center}−${FIG1.center}=${DIFF1}. What is the next difference?`,
        `Barisan tengah: ${FIG1.center}, ${FIG2.center}, A. Selisih pertama: ${FIG2.center}−${FIG1.center}=${DIFF1}. Berapa selisih berikutnya?`,
      ),
    },
    {
      phase: 'diff',
      ringCorners: false,
      revealFig3: true,
      ringCenters: true,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Differences grow by ${DIFF_INC} each step: ${DIFF1} → ${DIFF2} (+${DIFF_INC}). So A = ${FIG2.center} + ${DIFF2} = ${FIG3.center}.`,
        `Selisihnya bertambah ${DIFF_INC} setiap langkah: ${DIFF1} → ${DIFF2} (+${DIFF_INC}). Jadi A = ${FIG2.center} + ${DIFF2} = ${FIG3.center}.`,
      ),
    },
    {
      phase: 'result',
      ringCorners: false,
      revealFig3: false,
      ringCenters: false,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `A = ${FIG3.center}. Check: ${FIG1.center}, ${FIG2.center}, ${FIG3.center} — second differences = ${DIFF_INC} (constant). ✓`,
        `A = ${FIG3.center}. Cek: ${FIG1.center}, ${FIG2.center}, ${FIG3.center} — selisih kedua = ${DIFF_INC} (konstan). ✓`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
