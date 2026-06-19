// IKMC-19-PE-Q23 — storyboard for the colour-swap animation.
//
// The question: nine squares start as Black, Grey, White, Grey, White, White, Grey, Black, White.
// Step 1 (Ani):  Black → White  (grey stays grey)
// Step 2 (Bob):  Grey  → Black  (white stays white)
// Step 3 (Chris):White → Grey   (black stays black)
//
// Net effect per original colour:
//   Original Black  → White (step1) → White (step2) → Grey  (step3)  = Grey
//   Original Grey   → Grey  (step1) → Black (step2) → Black (step3)  = Black
//   Original White  → White (step1) → White (step2) → Grey  (step3)  = Grey
//
// Starting grid: B, G, W, G, W, W, G, B, W
// After Ani:     W, G, W, G, W, W, G, W, W   (black→white)
// After Bob:     W, B, W, B, W, W, B, W, W   (grey→black)
// After Chris:   G, B, G, B, G, G, B, G, G   (white→grey) = Option D ✓
//
// Teaching walk, one idea per beat:
//   0. intro  — show starting grid; state the three rules.
//   1. ani    — show grid after Ani's swap (black → white).
//   2. bob    — show grid after Bob's swap (grey → black).
//   3. chris  — show grid after Chris's swap (white → grey). Final = D.
//   4. result — highlight "= D" in green.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type SwapPhaseId = 'intro' | 'ani' | 'bob' | 'chris' | 'result'

/** A single colour in the grid. */
export type CellColor = 'black' | 'grey' | 'white'

export interface SwapBeat {
  /** Which animation phase this beat belongs to. */
  phase: SwapPhaseId
  /** The 9-cell grid to render for this beat. */
  cells: CellColor[]
  /** Equation / swap rule to display below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface SwapStoryboard {
  steps: SwapBeat[]
  finalIndex: number
}

/** The original 9-square starting grid. */
export const START_GRID: CellColor[] = [
  'black', 'grey', 'white', 'grey', 'white', 'white', 'grey', 'black', 'white',
]

/** Grid after Ani's swap: black → white (grey unchanged). */
export const AFTER_ANI: CellColor[] = START_GRID.map((c) => (c === 'black' ? 'white' : c))

/** Grid after Bob's swap: grey → black (white unchanged). */
export const AFTER_BOB: CellColor[] = AFTER_ANI.map((c) => (c === 'grey' ? 'black' : c))

/** Grid after Chris's swap: white → grey (black unchanged). Final answer = D. */
export const AFTER_CHRIS: CellColor[] = AFTER_BOB.map((c) => (c === 'white' ? 'grey' : c))

export function buildColorSwap23Steps(lang: Lang): SwapStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SwapBeat[] = [
    // Beat 0 — intro: show the starting grid
    {
      phase: 'intro',
      cells: START_GRID,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Nine squares: 2 black, 3 grey, 4 white. Watch each colour change step by step.',
        'Sembilan kotak: 2 hitam, 3 abu-abu, 4 putih. Perhatikan perubahan tiap warna langkah demi langkah.',
      ),
    },

    // Beat 1 — Ani: black → white
    {
      phase: 'ani',
      cells: AFTER_ANI,
      equation: t('Ani: black → white', 'Ani: hitam → putih'),
      hold: 2200,
      result: false,
      caption: t(
        'Ani swaps all black squares to white. Grey squares stay grey.',
        'Ani mengganti semua kotak hitam menjadi putih. Kotak abu-abu tetap abu-abu.',
      ),
    },

    // Beat 2 — Bob: grey → black
    {
      phase: 'bob',
      cells: AFTER_BOB,
      equation: t('Bob: grey → black', 'Bob: abu-abu → hitam'),
      hold: 2200,
      result: false,
      caption: t(
        'Bob swaps all grey squares to black. White squares stay white.',
        'Bob mengganti semua kotak abu-abu menjadi hitam. Kotak putih tetap putih.',
      ),
    },

    // Beat 3 — Chris: white → grey
    {
      phase: 'chris',
      cells: AFTER_CHRIS,
      equation: t('Chris: white → grey', 'Chris: putih → abu-abu'),
      hold: 2200,
      result: false,
      caption: t(
        'Chris swaps all white squares to grey. Black squares stay black.',
        'Chris mengganti semua kotak putih menjadi abu-abu. Kotak hitam tetap hitam.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      cells: AFTER_CHRIS,
      equation: t('Final grid → D', 'Kisi akhir → D'),
      hold: 0,
      result: true,
      caption: t(
        'Original black → grey, original grey → black, original white → grey. The final grid matches answer D.',
        'Hitam asli → abu-abu, abu-abu asli → hitam, putih asli → abu-abu. Kisi akhir cocok dengan jawaban D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
