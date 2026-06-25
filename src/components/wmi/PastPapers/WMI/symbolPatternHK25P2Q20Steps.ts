import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Storyboard for HKIMO-25-P2H-Q20 — symbol-pattern sequence.
// Four beats:
//   1. intro  — each group starts with ■★; introduce the pattern.
//   2. dots   — highlight dots, show counts 3→2→1→0 decreasing.
//   3. tris   — highlight triangles, show counts 1→2→3→4 increasing.
//   4. answer — fill group 4's blank with ▲▲; reveal the answer.

export interface HK25P2Q20Beat {
  phase: 'intro' | 'dots' | 'tris' | 'answer'
  caption: string
  hold: number
  result: boolean
}

export interface HK25P2Q20Story {
  steps: HK25P2Q20Beat[]
  finalIndex: number
}

export function buildHK25P2Q20Steps(lang: Lang): HK25P2Q20Story {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HK25P2Q20Beat[] = [
    {
      phase: 'intro',
      hold: 2200,
      result: false,
      caption: t(
        'Each group starts with ■★ (square + star). Count the dots • and triangles ▲.',
        'Setiap kelompok dimulai dengan ■★ (kotak + bintang). Hitung titik • dan segitiga ▲.',
      ),
    },
    {
      phase: 'dots',
      hold: 2600,
      result: false,
      caption: t(
        'Dots decrease by 1 each group: 3 → 2 → 1 → 0.',
        'Titik berkurang 1 setiap kelompok: 3 → 2 → 1 → 0.',
      ),
    },
    {
      phase: 'tris',
      hold: 2600,
      result: false,
      caption: t(
        'Triangles increase by 1 each group: 1 → 2 → 3 → 4.',
        'Segitiga bertambah 1 setiap kelompok: 1 → 2 → 3 → 4.',
      ),
    },
    {
      phase: 'answer',
      hold: 0,
      result: true,
      caption: t(
        'Group 4 needs 4 ▲ total. The blank holds the first 2: blank = ▲▲. Answer = ▲▲ ✓',
        'Kelompok 4 membutuhkan 4 ▲ total. Bagian kosong menampung 2 pertama: kosong = ▲▲. Jawaban = ▲▲ ✓',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
