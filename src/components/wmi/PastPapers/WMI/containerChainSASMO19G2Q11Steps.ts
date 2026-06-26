// SASMO-19-G2-Q11 — storyboard for the container-chain explainer.
//
// Question: "How many cups of water are needed to fill up the pail?"
// Figure shows three picture-equations:
//   Row 1: Pail    → Gallon + Cup + Bottle
//   Row 2: 2×Gallon → 4×Cup + Bottle
//   Row 3: Bottle  → 2×Cup
//
// Solution (worked bottom-up):
//   Step 1 (Row 3): 1 Bottle = 2 Cups
//   Step 2 (Row 2): 2 Gallons = 4 Cups + 1 Bottle = 4 + 2 = 6 Cups  →  1 Gallon = 3 Cups
//   Step 3 (Row 1): Pail = 1 Gallon + 1 Cup + 1 Bottle = 3 + 1 + 2 = 6 Cups
//   Answer: D (6)
//
// Teaching walk (5 beats):
//   0. intro    — show all 3 rows; prompt to read each equivalence.
//   1. row3     — highlight Row 3; 1 Bottle = 2 Cups.
//   2. row2     — highlight Row 2; chain → 1 Gallon = 3 Cups.
//   3. row1     — highlight Row 1; chain → Pail = 3+1+2 = 6 Cups.
//   4. result   — answer D = 6 cups.

export type Lang = 'en' | 'id'

export interface ContainerChainBeat {
  /** Which row to highlight in the illustration (null = show all). */
  highlightRow: 1 | 2 | 3 | null
  /** Short equation badge text, or null. */
  equation: string | null
  /** Caption text for this beat. */
  caption: string
  /** Auto-hold duration in ms (0 = final / manual-only). */
  hold: number
  /** True only on the last result beat. */
  result: boolean
}

export interface ContainerChainStoryboard {
  steps: ContainerChainBeat[]
  finalIndex: number
  answer: string
}

export function buildContainerChainSASMO19G2Q11Steps(lang: Lang): ContainerChainStoryboard {
  const t = (en: string, id: string) => lang === 'id' ? id : en

  const steps: ContainerChainBeat[] = [
    // Beat 0 — intro
    {
      highlightRow: null,
      equation: null,
      hold: 2000,
      result: false,
      caption: t(
        'Three picture-equations show how the containers relate. Read them in reverse order — start from the smallest container.',
        'Tiga persamaan gambar menunjukkan hubungan antar wadah. Baca dari urutan terbalik — mulai dari wadah terkecil.',
      ),
    },

    // Beat 1 — Row 3: Bottle = 2 Cups
    {
      highlightRow: 3,
      equation: t('1 Bottle = 2 Cups', '1 Botol = 2 Cangkir'),
      hold: 2200,
      result: false,
      caption: t(
        'Row 3: 1 Bottle equals 2 Cups. Remember this — we need it in the next steps.',
        'Baris 3: 1 Botol sama dengan 2 Cangkir. Ingat ini — kita butuhkan di langkah berikutnya.',
      ),
    },

    // Beat 2 — Row 2: 1 Gallon = 3 Cups
    {
      highlightRow: 2,
      equation: t('1 Gallon = 3 Cups', '1 Galon = 3 Cangkir'),
      hold: 2400,
      result: false,
      caption: t(
        'Row 2: 2 Gallons = 4 Cups + 1 Bottle = 4 + 2 = 6 Cups, so 1 Gallon = 6 ÷ 2 = 3 Cups.',
        'Baris 2: 2 Galon = 4 Cangkir + 1 Botol = 4 + 2 = 6 Cangkir, jadi 1 Galon = 6 ÷ 2 = 3 Cangkir.',
      ),
    },

    // Beat 3 — Row 1: Pail = 6 Cups
    {
      highlightRow: 1,
      equation: t('Pail = 3 + 1 + 2 = 6 Cups', 'Ember = 3 + 1 + 2 = 6 Cangkir'),
      hold: 2600,
      result: false,
      caption: t(
        'Row 1: Pail = 1 Gallon + 1 Cup + 1 Bottle = 3 Cups + 1 Cup + 2 Cups = 6 Cups.',
        'Baris 1: Ember = 1 Galon + 1 Cangkir + 1 Botol = 3 Cangkir + 1 Cangkir + 2 Cangkir = 6 Cangkir.',
      ),
    },

    // Beat 4 — result
    {
      highlightRow: null,
      equation: t('Answer D — 6 cups', 'Jawaban D — 6 cangkir'),
      hold: 0,
      result: true,
      caption: t(
        'It takes 6 cups of water to fill the pail. The answer is D.',
        'Dibutuhkan 6 cangkir air untuk mengisi penuh ember. Jawabannya adalah D.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'D' }
}
