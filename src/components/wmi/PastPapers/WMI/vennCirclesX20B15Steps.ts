/**
 * SEAMOX-20-B-Q15 — beat steps for the Venn-circles explainer.
 *
 * Strategy: use circle-sum equations to solve for A.
 *   Beat 0 — intro: show the 3-circle Venn, label all regions.
 *   Beat 1 — focus top circle (A): A + 4 + D + 1 = 15 → A + D = 10.
 *   Beat 2 — focus bottom-left circle (B): B + 4 + D + 6 = 15 → B + D = 5.
 *   Beat 3 — focus bottom-right circle (C): C + 1 + D + 6 = 15 → C + D = 8.
 *   Beat 4 — {A,B,C,D} is a permutation of {2,3,5,7}. Try D = 3:
 *             A = 7, B = 2, C = 5 — all from the set, no repeats.
 *   Beat 5 — result: A = 7.
 */

export interface VennCirclesX20B15Step {
  caption:        string
  equation:       string
  highlightCircle: 'top' | 'bl' | 'br' | null
  solved:         boolean
  result:         boolean
  hold:           number
}

export interface VennCirclesX20B15Story {
  steps:      VennCirclesX20B15Step[]
  finalIndex: number
}

export function buildVennCirclesX20B15Steps(
  lang: 'en' | 'id',
): VennCirclesX20B15Story {
  const t = TRANSLATIONS[lang]

  const steps: VennCirclesX20B15Step[] = [
    // Beat 0 — intro
    {
      caption:        t.intro,
      equation:       '',
      highlightCircle: null,
      solved:         false,
      result:         false,
      hold:           2400,
    },
    // Beat 1 — top circle
    {
      caption:        t.circleA,
      equation:       'A + 4 + D + 1 = 15',
      highlightCircle: 'top',
      solved:         false,
      result:         false,
      hold:           2600,
    },
    // Beat 2 — bottom-left circle
    {
      caption:        t.circleB,
      equation:       'B + 4 + D + 6 = 15',
      highlightCircle: 'bl',
      solved:         false,
      result:         false,
      hold:           2600,
    },
    // Beat 3 — bottom-right circle
    {
      caption:        t.circleC,
      equation:       'C + 1 + D + 6 = 15',
      highlightCircle: 'br',
      solved:         false,
      result:         false,
      hold:           2600,
    },
    // Beat 4 — try D = 3
    {
      caption:        t.tryD3,
      equation:       'D = 3 → A = 7, B = 2, C = 5',
      highlightCircle: null,
      solved:         true,
      result:         false,
      hold:           3000,
    },
    // Beat 5 — result
    {
      caption:        t.result,
      equation:       'A = 7',
      highlightCircle: null,
      solved:         true,
      result:         true,
      hold:           3400,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}

// ── Translations ───────────────────────────────────────────────────────────────

const TRANSLATIONS: Record<'en' | 'id', {
  intro:   string
  circleA: string
  circleB: string
  circleC: string
  tryD3:   string
  result:  string
}> = {
  en: {
    intro:
      'Each circle contains some of A, B, C, D (digits from {2,3,5,7}) plus the fixed numbers. ' +
      'Every circle must sum to 15.',
    circleA:
      'Top circle: A + 4 + D + 1 = 15, so A + D = 10.',
    circleB:
      'Bottom-left circle: B + 4 + D + 6 = 15, so B + D = 5.',
    circleC:
      'Bottom-right circle: C + 1 + D + 6 = 15, so C + D = 8.',
    tryD3:
      'Try D = 3 (from {2,3,5,7}): A = 10 − 3 = 7, B = 5 − 3 = 2, C = 8 − 3 = 5. ' +
      'All four are distinct digits from {2,3,5,7}. ✓',
    result:
      'A = 7 is the answer!',
  },
  id: {
    intro:
      'Setiap lingkaran berisi beberapa dari A, B, C, D (digit dari {2,3,5,7}) ditambah angka tetap. ' +
      'Setiap lingkaran harus berjumlah 15.',
    circleA:
      'Lingkaran atas: A + 4 + D + 1 = 15, sehingga A + D = 10.',
    circleB:
      'Lingkaran kiri-bawah: B + 4 + D + 6 = 15, sehingga B + D = 5.',
    circleC:
      'Lingkaran kanan-bawah: C + 1 + D + 6 = 15, sehingga C + D = 8.',
    tryD3:
      'Coba D = 3 (dari {2,3,5,7}): A = 10 − 3 = 7, B = 5 − 3 = 2, C = 8 − 3 = 5. ' +
      'Keempat digit berbeda dari {2,3,5,7}. ✓',
    result:
      'A = 7 adalah jawabannya!',
  },
}
