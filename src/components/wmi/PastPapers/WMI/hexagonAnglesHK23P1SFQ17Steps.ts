// HKIMO-23-P1SF-Q17 — "How many interior angle(s) is / are there in the polygon below?"
// Answer: 6
//
// The polygon is a concave hexagon (6 sides, 6 vertices).
// Strategy: count vertices → each vertex has exactly one interior angle → answer is 6.
//
// Beats:
//   1. Show the plain polygon and pose the question.
//   2. Label vertices 1–3 (partial count).
//   3. Label all 6 vertices (full count).
//   4. State the rule: 6 vertices = 6 interior angles (answer).

import type { HexagonHighlight } from './HexagonAnglesHK23P1SFQ17Illustration'

export type Lang = 'en' | 'id'

export interface HexagonAnglesStep {
  highlight: HexagonHighlight
  countLine: string | null
  caption: string
  hold: number
  result: boolean
}

export interface HexagonAnglesStoryboard {
  steps: HexagonAnglesStep[]
  finalIndex: number
}

export function buildHexagonAnglesHK23P1SFQ17Steps(lang: Lang): HexagonAnglesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HexagonAnglesStep[] = [
    {
      highlight: 'none',
      countLine: null,
      hold: 2400,
      result: false,
      caption: t(
        'A polygon is shown. Each corner (vertex) of a polygon has one interior angle — count the corners.',
        'Sebuah segi-banyak ditampilkan. Setiap sudut (titik sudut) segi-banyak memiliki satu sudut dalam — hitung titik sudutnya.',
      ),
    },
    {
      highlight: [0, 1, 2] as number[],
      countLine: t('Vertex 1, 2, 3 …', 'Titik sudut 1, 2, 3 …'),
      hold: 2600,
      result: false,
      caption: t(
        'Starting at the bottom-left: vertex 1 (bottom-left), vertex 2 (top-left), vertex 3 (upper-centre) — three so far.',
        'Mulai dari kiri bawah: titik sudut 1 (kiri bawah), 2 (kiri atas), 3 (tengah atas) — sudah tiga.',
      ),
    },
    {
      highlight: 'all',
      countLine: t('1 · 2 · 3 · 4 · 5 · 6', '1 · 2 · 3 · 4 · 5 · 6'),
      hold: 2800,
      result: false,
      caption: t(
        '… vertex 4 (spike tip), vertex 5 (right-side dent), vertex 6 (bottom-right). The polygon has 6 vertices in total.',
        '… titik sudut 4 (ujung paku), 5 (lekukan kanan), 6 (kanan bawah). Segi-banyak ini memiliki 6 titik sudut.',
      ),
    },
    {
      highlight: 'all',
      countLine: t('6 vertices = 6 interior angles', '6 titik sudut = 6 sudut dalam'),
      hold: 0,
      result: true,
      caption: t(
        'Every vertex holds exactly one interior angle. 6 vertices → 6 interior angles.',
        'Setiap titik sudut memiliki tepat satu sudut dalam. 6 titik sudut → 6 sudut dalam.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
