// HKIMO-25-P3H-Q4 — triangle-pattern storyboard.
//
// Rule: top = (left + right) × 2
//
// Beats:
//   0. intro   — show three triangles; observe the given numbers.
//   1. check1  — highlight Triangle 1: 2 + 5 = 7; 7 × 2 = 14 ✓
//   2. check2  — highlight Triangle 2: 3 + 7 = 10; 10 × 2 = 20 ✓
//   3. apply   — highlight Triangle 3: 11 + 5 = 16; 16 × 2 = 32
//   4. result  — reveal 32 in the apex; answer is 32.

export type Lang = 'en' | 'id'

export type TriPhaseId = 'intro' | 'check1' | 'check2' | 'apply' | 'result'

export interface TriBeat {
  phase: TriPhaseId
  /** Index (0-based) of the triangle panel to highlight; -1 = none. */
  highlightPanel: number
  /** Equation to display below the figure; '' to hide. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface TriStoryboard {
  steps: TriBeat[]
  finalIndex: number
}

export function buildTrianglePatternHK25P3Q4Steps(lang: Lang): TriStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TriBeat[] = [
    {
      phase: 'intro',
      highlightPanel: -1,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Three triangles. Each has a number at the top and two numbers at the bottom corners. Find the rule!',
        'Tiga segitiga. Masing-masing punya angka di atas dan dua angka di sudut bawah. Temukan polanya!',
      ),
    },
    {
      phase: 'check1',
      highlightPanel: 0,
      equation: '(2 + 5) × 2 = 7 × 2 = 14 ✓',
      hold: 2400,
      result: false,
      caption: t(
        'Triangle 1: add the bottom numbers (2 + 5 = 7), then multiply by 2 → 14. It matches the top!',
        'Segitiga 1: jumlahkan angka bawah (2 + 5 = 7), lalu kalikan 2 → 14. Cocok dengan angka atas!',
      ),
    },
    {
      phase: 'check2',
      highlightPanel: 1,
      equation: '(3 + 7) × 2 = 10 × 2 = 20 ✓',
      hold: 2400,
      result: false,
      caption: t(
        'Triangle 2: 3 + 7 = 10; 10 × 2 = 20 ✓ — rule confirmed: top = (left + right) × 2.',
        'Segitiga 2: 3 + 7 = 10; 10 × 2 = 20 ✓ — aturan terkonfirmasi: atas = (kiri + kanan) × 2.',
      ),
    },
    {
      phase: 'apply',
      highlightPanel: 2,
      equation: '(11 + 5) × 2 = 16 × 2 = 32',
      hold: 2400,
      result: false,
      caption: t(
        'Triangle 3: 11 + 5 = 16; 16 × 2 = 32. The missing number is 32.',
        'Segitiga 3: 11 + 5 = 16; 16 × 2 = 32. Angka yang hilang adalah 32.',
      ),
    },
    {
      phase: 'result',
      highlightPanel: 2,
      equation: '? = 32',
      hold: 0,
      result: true,
      caption: t(
        'Answer: 32.',
        'Jawaban: 32.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
