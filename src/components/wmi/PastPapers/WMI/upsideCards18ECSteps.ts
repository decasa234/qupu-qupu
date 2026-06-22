// IKMC-21-EC-Q18 — storyboard for the two-row card equalisation animation.
//
// Question: 7 cards A–G each show two numbers (top / bottom).
//   Top-row sum  = 7+5+4+2+8+3+2 = 31
//   Bottom-row sum = 4+3+5+5+7+7+4 = 35
//   Gap = 35 − 31 = 4.
//   Flipping card X (top=t, bottom=b) adds (b−t) to the top and (t−b) to the bottom,
//   shifting the gap by 2(b−t). We need b−t = 2.
//   Check: A(4−7=−3) B(3−5=−2) C(5−4=1) D(5−2=3) E(7−8=−1) F(7−3=4) G(4−2=2) ✓
//   Flipping G: top row 31−2+4=33, bottom row 35−4+2=33 ✓
//   Answer: E (card G).
//
// Teaching walk, one idea per beat:
//   0. intro       — show all 7 cards; state top sum (31) and bottom sum (35).
//   1. gap         — point out the gap: 35−31=4; to fix it, we need b−t=2.
//   2. test-A      — check card A: 4−7=−3, not 2.
//   3. test-G      — check card G: 4−2=2 ✓ — this is the one!
//   4. flip-G      — show G flipped: its top becomes 4, its bottom becomes 2.
//   5. result      — new top=33, new bottom=33 ✓ — answer E (card G).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export interface UpsideCards18ECBeat {
  /** 0-based index of highlighted card, or null for no highlight. */
  highlightIdx: number | null
  /**
   * When the highlighted card has been flipped, supply its new top/bottom values
   * so the primitive can render the "after flip" state.
   */
  flippedValues: { top: number; bottom: number } | null
  /** Label above the cards showing the current row sums. */
  sumLabel: string | null
  /** Caption in the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the final result beat. */
  result: boolean
}

export interface UpsideCards18ECStoryboard {
  steps: UpsideCards18ECBeat[]
  finalIndex: number
  answer: string
}

export function buildUpsideCards18ECSteps(lang: Lang): UpsideCards18ECStoryboard {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const steps: UpsideCards18ECBeat[] = [
    // Beat 0 — intro: all 7 cards, two row sums
    {
      highlightIdx: null,
      flippedValues: null,
      sumLabel: t('Top = 31  |  Bottom = 35', 'Atas = 31  |  Bawah = 35'),
      hold: 2800,
      result: false,
      caption: t(
        'Top row: 7+5+4+2+8+3+2 = 31. Bottom row: 4+3+5+5+7+7+4 = 35. The bottom is 4 more than the top.',
        'Baris atas: 7+5+4+2+8+3+2 = 31. Baris bawah: 4+3+5+5+7+7+4 = 35. Bawah lebih besar 4 dari atas.',
      ),
    },

    // Beat 1 — explain the gap and the rule for flipping
    {
      highlightIdx: null,
      flippedValues: null,
      sumLabel: t('Gap = 35 − 31 = 4', 'Selisih = 35 − 31 = 4'),
      hold: 2800,
      result: false,
      caption: t(
        'When we flip a card (top=t, bottom=b), the top row gains (b−t) and the bottom row loses (b−t). We need b−t = 2 so both rows shift by 2 and become equal.',
        'Saat kita membalik kartu (atas=t, bawah=b), baris atas bertambah (b−t) dan baris bawah berkurang (b−t). Kita perlu b−t = 2 agar kedua baris bergeser 2 dan menjadi sama.',
      ),
    },

    // Beat 2 — check card G: bottom−top = 4−2 = 2 ✓
    {
      highlightIdx: 6,   // G is index 6
      flippedValues: null,
      sumLabel: t('Card G: bottom − top = 4 − 2 = 2 ✓', 'Kartu G: bawah − atas = 4 − 2 = 2 ✓'),
      hold: 2600,
      result: false,
      caption: t(
        'Card G has top=2, bottom=4. Check: 4−2 = 2. That is exactly what we need! All other cards give the wrong difference.',
        'Kartu G memiliki atas=2, bawah=4. Cek: 4−2 = 2. Itu tepat yang kita butuhkan! Semua kartu lain memberi selisih yang salah.',
      ),
    },

    // Beat 3 — show G flipped (top becomes 4, bottom becomes 2)
    {
      highlightIdx: 6,
      flippedValues: { top: 4, bottom: 2 },
      sumLabel: t('G flipped: top→4, bottom→2', 'G dibalik: atas→4, bawah→2'),
      hold: 2600,
      result: false,
      caption: t(
        'Flip card G: the top number changes from 2 to 4, and the bottom number changes from 4 to 2. The top row gains +2 and the bottom row loses −2.',
        'Balik kartu G: angka atas berubah dari 2 menjadi 4, dan angka bawah berubah dari 4 menjadi 2. Baris atas bertambah +2 dan baris bawah berkurang −2.',
      ),
    },

    // Beat 4 — result: both rows = 33
    {
      highlightIdx: 6,
      flippedValues: { top: 4, bottom: 2 },
      sumLabel: t('Top = 33  |  Bottom = 33 ✓', 'Atas = 33  |  Bawah = 33 ✓'),
      hold: 0,
      result: true,
      caption: t(
        'New top row: 31 − 2 + 4 = 33. New bottom row: 35 − 4 + 2 = 33. Both equal! The answer is card G — answer E.',
        'Baris atas baru: 31 − 2 + 4 = 33. Baris bawah baru: 35 − 4 + 2 = 33. Keduanya sama! Jawabannya adalah kartu G — jawaban E.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'E' }
}
