// SASMO-20-G4-Q11 — explainer storyboard.
//
// Puzzle: compare shaded areas of ABCD and PQRS (each 6×10 cm).
// Answer A: both = ½ × 60 = 30 cm².
//
// Teaching walk (4 beats):
//   0. intro   — show both rects; ask which shaded area is bigger.
//   1. abcd    — highlight ABCD shaded region; derive ½ × 60 = 30 cm².
//   2. pqrs    — highlight PQRS shaded region; derive ½ × 60 = 30 cm².
//   3. result  — both glow green; show equality.
//
// Pure builder: (lang) → storyboard. No hooks, no side-effects, SSR-safe.

export type Lang = 'en' | 'id'
export type Phase = 'intro' | 'abcd' | 'pqrs' | 'result'

export interface Beat {
  phase: Phase
  hlAbcd: boolean   // amber overlay on ABCD shaded triangles
  hlPqrs: boolean   // amber overlay on PQRS shaded triangles
  result: boolean   // true → green highlight + final badge
  equation: string
  caption: string
  hold: number      // auto-advance ms (0 = last beat)
}

export interface Storyboard {
  steps: Beat[]
  finalIndex: number
}

export function buildTwoRectsShadedSASMO20G4Q11Steps(lang: Lang): Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Beat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      hlAbcd: false,
      hlPqrs: false,
      result: false,
      equation: '',
      hold: 2000,
      caption: t(
        'Both rectangles ABCD and PQRS have the same dimensions: 6 cm × 10 cm. Which shaded area is larger?',
        'Kedua persegi panjang ABCD dan PQRS memiliki ukuran yang sama: 6 cm × 10 cm. Daerah arsiran mana yang lebih luas?',
      ),
    },

    // Beat 1 — analyse ABCD
    {
      phase: 'abcd',
      hlAbcd: true,
      hlPqrs: false,
      result: false,
      equation: t('ABCD: ½ × 6 × 10 = 30 cm²', 'ABCD: ½ × 6 × 10 = 30 cm²'),
      hold: 2500,
      caption: t(
        'In ABCD every shaded triangle has base = full width and height = half the rectangle height. Together they cover exactly half the area: ½ × 60 = 30 cm².',
        'Pada ABCD setiap segitiga yang diarsir memiliki alas sepanjang lebar penuh dan tinggi = setengah tinggi persegi panjang. Bersama-sama menutupi tepat setengah luasnya: ½ × 60 = 30 cm².',
      ),
    },

    // Beat 2 — analyse PQRS
    {
      phase: 'pqrs',
      hlAbcd: false,
      hlPqrs: true,
      result: false,
      equation: t('PQRS: ½ × 6 × 10 = 30 cm²', 'PQRS: ½ × 6 × 10 = 30 cm²'),
      hold: 2500,
      caption: t(
        'In PQRS the four arrowhead triangles also sum to exactly half the rectangle: ½ × 60 = 30 cm².',
        'Pada PQRS keempat segitiga panah juga berjumlah tepat setengah luas persegi panjang: ½ × 60 = 30 cm².',
      ),
    },

    // Beat 3 — result
    {
      phase: 'result',
      hlAbcd: true,
      hlPqrs: true,
      result: true,
      equation: t('30 cm² = 30 cm²  →  A', '30 cm² = 30 cm²  →  A'),
      hold: 0,
      caption: t(
        'Both shaded areas equal 30 cm² — regardless of how the triangles are arranged. Answer: A.',
        'Kedua daerah yang diarsir sama dengan 30 cm² — tidak peduli bagaimana segitiga-segitiganya disusun. Jawaban: A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
