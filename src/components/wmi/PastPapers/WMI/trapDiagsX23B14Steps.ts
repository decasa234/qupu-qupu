// SEAMOX-23-B-Q14 — beat-by-beat animation storyboard.
//
// Trapezoid ABCD: AD ∥ BC, BC = 1.5 AD. Diagonals AC and BD meet at E.
// Given: △ADE = 16 cm², △BEC = 18 cm². Find the shaded area: △ABE + △CDE.
//
// Key insight: AE:CE = AD:BC = 2:3 (similar triangles from parallel lines).
//   Area(△ABE) = (2/3) × Area(△BEC) = (2/3) × 18 = 12 cm²
//   Area(△CDE) = (3/2) × Area(△ADE) = (3/2) × 16 = 24 cm²
//   Shaded = 12 + 24 = 36 cm²
//
// Beats:
//   0. intro  — show the trapezoid with shaded ABE + CDE; state the task.
//   1. ratio  — AD ∥ BC ⟹ ADE ∼ BCE; AE:CE = 2:3.
//   2. abe    — Area(△ABE) = (2/3) × 18 = 12.
//   3. cde    — Area(△CDE) = (3/2) × 16 = 24.
//   4. result — 12 + 24 = 36 cm².
//
// SSR-safe: pure builder, no Math.random, no Date.

export type Lang = 'en' | 'id'
export type PhaseId = 'intro' | 'ratio' | 'abe' | 'cde' | 'result'

export interface TrapBeat {
  phase: PhaseId
  shaded: Array<'ADE' | 'BEC' | 'ABE' | 'CDE'>
  areaLabels: Partial<Record<'ADE' | 'BEC' | 'ABE' | 'CDE', string>>
  equation: string
  caption: string
  hold: number
  result: boolean
}

export interface TrapStoryboard {
  steps: TrapBeat[]
  finalIndex: number
}

export function buildTrapDiagsX23B14Steps(lang: Lang): TrapStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TrapBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      shaded: ['ABE', 'CDE'],
      areaLabels: { ADE: '16', BEC: '18' },
      equation: '',
      hold: 2400,
      result: false,
      caption: t(
        'Diagonals AC and BD meet at E, splitting the trapezoid into four triangles. △ADE = 16 cm² and △BEC = 18 cm². Find the shaded area: △ABE + △CDE.',
        'Diagonal AC dan BD bertemu di E, membagi trapesium menjadi empat segitiga. △ADE = 16 cm² dan △BEC = 18 cm². Cari luas yang diarsir: △ABE + △CDE.',
      ),
    },

    // Beat 1 — ratio from parallel lines
    {
      phase: 'ratio',
      shaded: ['ADE', 'BEC'],
      areaLabels: { ADE: '16', BEC: '18', ABE: '?', CDE: '?' },
      equation: t('AE : CE = AD : BC = 2 : 3', 'AE : CE = AD : BC = 2 : 3'),
      hold: 2800,
      result: false,
      caption: t(
        'Because AD ∥ BC, triangles ADE and BCE are similar (AA). Their sides are in ratio AD:BC = 2:3, so point E divides each diagonal in ratio AE:CE = 2:3.',
        'Karena AD ∥ BC, segitiga ADE dan BCE sebangun (AA). Sisinya berbandingan AD:BC = 2:3, sehingga titik E membagi setiap diagonal dengan perbandingan AE:CE = 2:3.',
      ),
    },

    // Beat 2 — compute Area(ABE)
    {
      phase: 'abe',
      shaded: ['ABE'],
      areaLabels: { ADE: '16', BEC: '18', ABE: '12', CDE: '?' },
      equation: t('Area(△ABE) = ²⁄₃ × 18 = 12 cm²', 'Luas(△ABE) = ²⁄₃ × 18 = 12 cm²'),
      hold: 2800,
      result: false,
      caption: t(
        '△ABE and △BEC share the same height from B. Their bases AE and CE are in ratio 2:3, so Area(△ABE) = (2/3) × 18 = 12 cm².',
        '△ABE dan △BEC memiliki tinggi yang sama dari B. Alas AE dan CE berbandingan 2:3, sehingga Luas(△ABE) = (2/3) × 18 = 12 cm².',
      ),
    },

    // Beat 3 — compute Area(CDE)
    {
      phase: 'cde',
      shaded: ['CDE'],
      areaLabels: { ADE: '16', BEC: '18', ABE: '12', CDE: '24' },
      equation: t('Area(△CDE) = ³⁄₂ × 16 = 24 cm²', 'Luas(△CDE) = ³⁄₂ × 16 = 24 cm²'),
      hold: 2800,
      result: false,
      caption: t(
        '△ADE and △CDE share the same height from D. Their bases AE and CE are in ratio 2:3, so Area(△CDE) = (3/2) × 16 = 24 cm².',
        '△ADE dan △CDE memiliki tinggi yang sama dari D. Alas AE dan CE berbandingan 2:3, sehingga Luas(△CDE) = (3/2) × 16 = 24 cm².',
      ),
    },

    // Beat 4 — final answer
    {
      phase: 'result',
      shaded: ['ABE', 'CDE'],
      areaLabels: { ADE: '16', BEC: '18', ABE: '12', CDE: '24' },
      equation: t('12 + 24 = 36 cm²  ✓', '12 + 24 = 36 cm²  ✓'),
      hold: 0,
      result: true,
      caption: t(
        'Shaded area = △ABE + △CDE = 12 + 24 = 36 cm².',
        'Luas yang diarsir = △ABE + △CDE = 12 + 24 = 36 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
