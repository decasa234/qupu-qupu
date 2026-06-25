// boxAdd19B9Steps.ts — beat sequence for BoxAdd19B9Explainer
//
// SEAMO-19-B-Q9: □□ + □□ + □□ + □ = 100 (digits 1–7 each once)
// Answer: E (None of the above) — the maximum largest 2-digit number is 57,
// which is not in choices A–D.
//
// Strategy:
//   Step 1: digit sum 1–7 = 28; extra to reach 100 = 72 = 9 × (sum of tens digits)
//   Step 2: tens sum = 8; best set of 3 distinct digits from 1–7 summing to 8 → {5,2,1}
//   Step 3: assign largest unused units digit (7) to the 5 → 57; fill rest: 23, 14, 6
//   Step 4: verify 57+23+14+6 = 100 ✓; answer E (57 not listed)

export type Lang = 'en' | 'id'

export interface BoxAddStep {
  /** 7-element array for box digits [tens0, units0, tens1, units1, tens2, units2, single] */
  digits: (string | undefined)[]
  /** Optional per-box fill color (same indexing) */
  fills: (string | undefined)[]
  /** Whether to highlight the "100" result */
  highlightResult: boolean
  /** Caption text */
  caption: string
  /** Milliseconds to hold this beat (0 = final) */
  hold: number
  /** True = this is the answer beat */
  result: boolean
}

export interface BoxAddStoryboard {
  steps: BoxAddStep[]
  finalIndex: number
}

export function buildBoxAdd19B9Steps(lang: Lang): BoxAddStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Colour palette
  const BLANK     = undefined
  const BLUE_FILL = '#EFF6FF'
  const GREEN_FILL = '#D1FAE5'
  const AMBER_FILL = '#FEF3C7'
  const RED_FILL  = '#FEE2E2'

  const steps: BoxAddStep[] = [
    // ── Beat 0: Show the blank column addition ───────────────────────────────
    {
      digits: [BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK],
      fills:  [BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK],
      highlightResult: false,
      hold: 1800,
      result: false,
      caption: t(
        'Each of digits 1–7 fills one box. Sum of all digits: 1+2+3+4+5+6+7 = 28.',
        'Setiap digit 1–7 mengisi satu kotak. Jumlah semua digit: 1+2+3+4+5+6+7 = 28.',
      ),
    },

    // ── Beat 1: Extra = 72; tens sum = 8 ─────────────────────────────────────
    {
      digits: [BLANK, BLANK, BLANK, BLANK, BLANK, BLANK, BLANK],
      fills:  [BLUE_FILL, BLANK, BLUE_FILL, BLANK, BLUE_FILL, BLANK, BLANK],
      highlightResult: false,
      hold: 2200,
      result: false,
      caption: t(
        'The 3 tens digits add ×10 each, so extra = 100−28 = 72 = 9 × (tens sum). Tens sum = 8.',
        'Setiap digit puluhan bernilai ×10, jadi kelebihan = 100−28 = 72 = 9 × (jml puluhan). Jml puluhan = 8.',
      ),
    },

    // ── Beat 2: Best tens set {5,2,1} maximises the largest number ───────────
    {
      digits: ['5', BLANK, '2', BLANK, '1', BLANK, BLANK],
      fills:  [AMBER_FILL, BLANK, BLUE_FILL, BLANK, BLUE_FILL, BLANK, BLANK],
      highlightResult: false,
      hold: 2000,
      result: false,
      caption: t(
        'To maximise the largest 2-digit number, use tens {5, 2, 1} (sum=8, max tens=5).',
        'Untuk memaksimalkan bilangan 2-digit terbesar, gunakan puluhan {5, 2, 1} (jml=8, maks=5).',
      ),
    },

    // ── Beat 3: Assign largest remaining unit (7) to 5 → 57 ─────────────────
    {
      digits: ['5', '7', '2', '3', '1', '4', '6'],
      fills:  [GREEN_FILL, GREEN_FILL, BLUE_FILL, BLUE_FILL, BLUE_FILL, BLUE_FILL, BLUE_FILL],
      highlightResult: false,
      hold: 2000,
      result: false,
      caption: t(
        'Assign units 7 to 5 → 57. Then: 57 + 23 + 14 + 6 = 100 ✓. Largest = 57.',
        'Tetapkan satuan 7 ke 5 → 57. Maka: 57 + 23 + 14 + 6 = 100 ✓. Terbesar = 57.',
      ),
    },

    // ── Beat 4: 57 not in A–D → answer E ────────────────────────────────────
    {
      digits: ['5', '7', '2', '3', '1', '4', '6'],
      fills:  [GREEN_FILL, GREEN_FILL, BLUE_FILL, BLUE_FILL, BLUE_FILL, BLUE_FILL, BLUE_FILL],
      highlightResult: true,
      hold: 0,
      result: true,
      caption: t(
        '57 is not in choices A–D (35, 38, 47, 52) → answer E (None of the above).',
        '57 tidak ada di pilihan A–D (35, 38, 47, 52) → jawaban E (Tidak ada jawaban di atas).',
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
