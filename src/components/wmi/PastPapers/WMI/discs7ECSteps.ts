// IKMC-23-EC-Q7 — storyboard for the disc-tower animation.
//
// The question: Anna has 4 discs of different sizes (labelled 1=smallest, 4=largest).
// She wants to build a tower of 3 discs where every disc is smaller than the one below.
// How many different towers can she make? → Answer C (4).
//
// Teaching walk, one idea per beat:
//   0. intro      — show the 4 scattered discs; state the task.
//   1. rule       — highlight the "smaller above" rule with a demo tower.
//   2. combo-123  — show tower {1,2,3}: bottom=3, mid=2, top=1. ✓
//   3. combo-124  — show tower {1,2,4}: bottom=4, mid=2, top=1. ✓
//   4. combo-134  — show tower {1,3,4}: bottom=4, mid=3, top=1. ✓
//   5. combo-234  — show tower {2,3,4}: bottom=4, mid=3, top=2. ✓
//   6. result     — 4 valid towers → answer C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type DiscPhaseId =
  | 'intro'
  | 'rule'
  | 'combo-123'
  | 'combo-124'
  | 'combo-134'
  | 'combo-234'
  | 'result'

export interface DiscBeat {
  /** Which animation phase this beat belongs to. */
  phase: DiscPhaseId
  /**
   * Which tower to display in the tower panel.
   * null = show scattered discs; [bottom, mid, top] disc indices (0-based, i.e. disc label = idx+1).
   */
  tower: [number, number, number] | null
  /** Highlight ring around these disc indices in the scattered layout. */
  highlightDiscs: number[]
  /** Equation / maths line shown below the figure; '' to hide. */
  equation: string
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
  /** Running count of valid towers found so far (shown as badge). */
  towerCount: number
}

export interface DiscStoryboard {
  steps: DiscBeat[]
  finalIndex: number
}

export function buildDiscs7ECSteps(lang: Lang): DiscStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiscBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      tower: null,
      highlightDiscs: [],
      equation: '',
      hold: 2200,
      result: false,
      towerCount: 0,
      caption: t(
        'Anna has 4 discs — label them 1 (smallest) to 4 (largest). She picks 3 to stack with each disc smaller than the one below.',
        'Anna punya 4 cakram — beri label 1 (terkecil) sampai 4 (terbesar). Ia memilih 3 untuk ditumpuk, tiap cakram lebih kecil dari yang di bawahnya.',
      ),
    },

    // Beat 1 — rule (show the size constraint with a demo arrangement)
    {
      phase: 'rule',
      tower: [2, 1, 0],   // bottom=3, mid=2, top=1 (0-indexed)
      highlightDiscs: [0, 1, 2],
      equation: t('smaller above → order is forced', 'lebih kecil di atas → urutan sudah pasti'),
      hold: 2200,
      result: false,
      towerCount: 0,
      caption: t(
        'The rule forces the order: once you choose which 3 discs, the largest must be at the bottom and the smallest at the top — no choice needed.',
        'Aturan memaksa urutan: begitu kamu memilih 3 cakram, yang terbesar harus di bawah dan terkecil di atas — tidak ada pilihan lain.',
      ),
    },

    // Beat 2 — tower {1,2,3}
    {
      phase: 'combo-123',
      tower: [2, 1, 0],   // bottom=disc 3, mid=disc 2, top=disc 1
      highlightDiscs: [0, 1, 2],
      equation: '{1, 2, 3}',
      hold: 2000,
      result: false,
      towerCount: 1,
      caption: t(
        'Tower 1: discs {1,2,3} → bottom=3, middle=2, top=1. Valid! ✓',
        'Menara 1: cakram {1,2,3} → bawah=3, tengah=2, atas=1. Valid! ✓',
      ),
    },

    // Beat 3 — tower {1,2,4}
    {
      phase: 'combo-124',
      tower: [3, 1, 0],   // bottom=disc 4, mid=disc 2, top=disc 1
      highlightDiscs: [0, 1, 3],
      equation: '{1, 2, 4}',
      hold: 2000,
      result: false,
      towerCount: 2,
      caption: t(
        'Tower 2: discs {1,2,4} → bottom=4, middle=2, top=1. Valid! ✓',
        'Menara 2: cakram {1,2,4} → bawah=4, tengah=2, atas=1. Valid! ✓',
      ),
    },

    // Beat 4 — tower {1,3,4}
    {
      phase: 'combo-134',
      tower: [3, 2, 0],   // bottom=disc 4, mid=disc 3, top=disc 1
      highlightDiscs: [0, 2, 3],
      equation: '{1, 3, 4}',
      hold: 2000,
      result: false,
      towerCount: 3,
      caption: t(
        'Tower 3: discs {1,3,4} → bottom=4, middle=3, top=1. Valid! ✓',
        'Menara 3: cakram {1,3,4} → bawah=4, tengah=3, atas=1. Valid! ✓',
      ),
    },

    // Beat 5 — tower {2,3,4}
    {
      phase: 'combo-234',
      tower: [3, 2, 1],   // bottom=disc 4, mid=disc 3, top=disc 2
      highlightDiscs: [1, 2, 3],
      equation: '{2, 3, 4}',
      hold: 2000,
      result: false,
      towerCount: 4,
      caption: t(
        'Tower 4: discs {2,3,4} → bottom=4, middle=3, top=2. Valid! ✓',
        'Menara 4: cakram {2,3,4} → bawah=4, tengah=3, atas=2. Valid! ✓',
      ),
    },

    // Beat 6 — result
    {
      phase: 'result',
      tower: [3, 2, 1],
      highlightDiscs: [0, 1, 2, 3],
      equation: 'C(4,3) = 4 → C',
      hold: 0,
      result: true,
      towerCount: 4,
      caption: t(
        '4 different towers — answer C. (Choosing 3 from 4 discs; order is forced by the size rule.)',
        '4 menara berbeda — jawaban C. (Memilih 3 dari 4 cakram; urutan sudah ditentukan oleh aturan ukuran.)',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
