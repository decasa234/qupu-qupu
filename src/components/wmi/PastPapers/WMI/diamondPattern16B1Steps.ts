// diamondPattern16B1Steps.ts
//
// SEAMO-16-B-Q1 — "Find the missing number in the number pattern below."
//
// Beat sequence:
//   0 — intro: show all three diamond groups; ask students to look for patterns
//   1 — highlight LEFT column: 4 → 3 → 2 (−1 each step)
//   2 — highlight RIGHT column: 6 → 5 → 4 (−1 each step)
//   3 — highlight TOP column: 5 → 4 → ? (same −1 rule → ? = 3)
//   4 — reveal that 3 is NOT among A(4), B(5), C(6), D(7) → answer E
//   5 — final: answer is E (None of the above); missing value = 3

export interface DiamondStep {
  caption: string
  /** Which node to highlight, or null for none. */
  highlight: [number, 'top' | 'left' | 'right' | 'bottom'] | null
  /** Whether to reveal the answer (3) in Group 3's top circle. */
  revealAnswer: boolean
  /** Whether this beat shows the final answer chip. */
  result: boolean
  /** Extra hold ms on this beat (default 0). */
  hold?: number
}

export interface DiamondStory {
  steps: DiamondStep[]
  finalIndex: number
}

export function buildDiamondPattern16B1Steps(lang: 'en' | 'id'): DiamondStory {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiamondStep[] = [
    // Beat 0 — intro
    {
      caption: t(
        'Three diamond groups — each has a top (green), left & right (gold), and bottom (green) circle.',
        'Tiga kelompok berlian — masing-masing punya lingkaran atas (hijau), kiri & kanan (kuning), dan bawah (hijau).',
      ),
      highlight: null,
      revealAnswer: false,
      result: false,
      hold: 600,
    },

    // Beat 1 — left column: 4, 3, 2 (−1)
    {
      caption: t(
        'Left circles: 4 → 3 → 2. They decrease by 1 each time.',
        'Lingkaran kiri: 4 → 3 → 2. Berkurang 1 setiap langkah.',
      ),
      highlight: [0, 'left'],
      revealAnswer: false,
      result: false,
    },

    // Beat 2 — right column: 6, 5, 4 (−1)
    {
      caption: t(
        'Right circles: 6 → 5 → 4. Same rule — decrease by 1.',
        'Lingkaran kanan: 6 → 5 → 4. Aturan sama — berkurang 1.',
      ),
      highlight: [0, 'right'],
      revealAnswer: false,
      result: false,
    },

    // Beat 3 — top column: 5, 4, ? → same −1 rule gives 3
    {
      caption: t(
        'Top circles: 5 → 4 → ? The same −1 rule gives ? = 4 − 1 = 3.',
        'Lingkaran atas: 5 → 4 → ? Aturan −1 yang sama memberi ? = 4 − 1 = 3.',
      ),
      highlight: [2, 'top'],
      revealAnswer: false,
      result: false,
    },

    // Beat 4 — check choices: 3 not in A–D
    {
      caption: t(
        '? = 3. But choices are A=4, B=5, C=6, D=7. None of them is 3!',
        '? = 3. Tetapi pilihan: A=4, B=5, C=6, D=7. Tidak ada yang sama dengan 3!',
      ),
      highlight: [2, 'top'],
      revealAnswer: true,
      result: false,
    },

    // Beat 5 — final answer
    {
      caption: t(
        'The missing number is 3 — not listed among A–D. Answer: E (None of the above).',
        'Bilangan yang hilang adalah 3 — tidak ada di antara A–D. Jawaban: E (Tidak ada jawaban yang benar).',
      ),
      highlight: null,
      revealAnswer: true,
      result: true,
      hold: 800,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
