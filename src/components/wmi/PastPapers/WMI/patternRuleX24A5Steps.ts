import type { Lang } from '../../concepts/explainers/makeTenSteps'

export interface PatternRuleX24A5Step {
  revealAnswer: boolean
  highlightRow: 1 | 2 | 3 | null
  caption: string
  hold: number
  result: boolean
}

export interface PatternRuleX24A5Storyboard {
  steps: PatternRuleX24A5Step[]
  finalIndex: number
}

/**
 * Beat-by-beat storyboard for SEAMOX-24-A-Q5:
 *   0. Show all 3 rows — read the problem.
 *   1. Highlight row 1 — the circle outline (B) is removed, leaving only the blue sectors.
 *   2. Highlight row 2 — the outer triangle (B) is removed, leaving only the inner inverted triangle.
 *   3. Highlight row 3 — reverse the rule: result=square, B=X → missing = square + X.
 *   4. Reveal the answer — show square overlaid with X in row 3 A.
 */
export function buildPatternRuleX24A5Steps(lang: Lang): PatternRuleX24A5Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PatternRuleX24A5Step[] = [
    {
      revealAnswer: false,
      highlightRow: null,
      hold: 1800,
      result: false,
      caption: t(
        'Each row shows: [A] + [B] → [result]. Study rows 1 and 2 to find the rule.',
        'Setiap baris menunjukkan: [A] + [B] → [hasil]. Perhatikan baris 1 dan 2 untuk menemukan aturannya.',
      ),
    },
    {
      revealAnswer: false,
      highlightRow: 1,
      hold: 2400,
      result: false,
      caption: t(
        'Row 1: circle with sectors + plain circle → sectors only. The outer circle (B) is removed from A; the sectors are what remain.',
        'Baris 1: lingkaran bersektor + lingkaran kosong → sektor saja. Lingkaran luar (B) dihilangkan dari A; sektor-sektornya tersisa.',
      ),
    },
    {
      revealAnswer: false,
      highlightRow: 2,
      hold: 2400,
      result: false,
      caption: t(
        'Row 2: divided triangle + plain triangle → small inverted triangle. The outer triangle (B) is removed; the unique inner piece remains.',
        'Baris 2: segitiga terbagi + segitiga biasa → segitiga kecil terbalik. Segitiga luar (B) dihilangkan; bagian dalam yang unik tersisa.',
      ),
    },
    {
      revealAnswer: false,
      highlightRow: 3,
      hold: 2400,
      result: false,
      caption: t(
        'Row 3: result = plain square, B = X shape. Reverse the rule: ? must contain the square AND the X, so that removing the X leaves just the square.',
        'Baris 3: hasil = persegi biasa, B = bentuk X. Balikkan aturan: ? harus mengandung persegi DAN X, agar setelah X dihilangkan tersisa persegi saja.',
      ),
    },
    {
      revealAnswer: true,
      highlightRow: null,
      hold: 0,
      result: true,
      caption: t(
        'The missing diagram is a square overlaid with an X. Square + X → remove X → plain square. ✓',
        'Diagram yang hilang adalah persegi dengan X di atasnya. Persegi + X → hilangkan X → persegi biasa. ✓',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
