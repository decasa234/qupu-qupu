// Storyboard for OSN-24-SD-NAS-TEORI1-Q23 — "Library visit diagram.
// Same-color lines = same visit day. Besides Ardi, which students have
// visited together with every other student?" (answer: Wati)
//
// GRAPH  — 7 students, 14 colored edges (5 visit days):
//   Red   (Day A): {Tita, Mela, Dikta, Wati}  — 5 edges (complete minus Mela–Dikta)
//   Cyan  (Day B): {Mela, Ardi, Tita}          — 3 edges (triangle minus red duplicates)
//   Green (Day C): {Ardi, Jimbo, Wati}          — 3 edges
//   Yellow(Day D): {Dikta, Jimbo}               — 1 edge
//   Black (Day E): {Gina, Ardi, Wati}           — 2 edges (Gina–Wati, Gina–Ardi)
//
// SOLUTION — degree check: Ardi reaches all 6; Wati reaches all 6.
//   Others each miss at least one student.
//   Answer = "Wati" (the only one besides Ardi).
//
// Beats:
//   0 — Intro: plain graph, "Same-color = same day."
//   1 — Focus Ardi: all 6 connection partners highlighted.
//   2 — Focus Wati: all 6 connection partners highlighted.
//   3 — Focus Dikta: only 5 partners (misses Gina).
//   4 — Focus Gina: only 2 partners (Ardi + Wati).
//   5 — Result: only Wati (besides Ardi) reaches everyone → Answer Wati.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const OSN24NT1Q23_ANSWER = 'Wati'

export type NodeId = 'mela' | 'tita' | 'dikta' | 'ardi' | 'gina' | 'wati' | 'jimbo'

export interface LibraryVisitStep {
  /** Node ids rendered with amber highlight ring. */
  highlightNodes: NodeId[]
  /** The student being analysed this beat (amber fill), or null for intro. */
  focusId: NodeId | null
  /** True only on the winning beat. */
  result: boolean
  caption: string
  hold: number
}

export interface LibraryVisitStoryboard {
  steps: LibraryVisitStep[]
  finalIndex: number
}

// Connections per student (derived from the 14-edge list).
const CONNECTIONS: Record<NodeId, NodeId[]> = {
  mela:  ['tita', 'dikta', 'wati', 'ardi'],           // red(Tita,Dikta,Wati) + cyan(Ardi)
  tita:  ['mela', 'dikta', 'wati', 'ardi'],            // red(Mela,Dikta,Wati) + cyan(Ardi)
  dikta: ['tita', 'mela', 'wati', 'ardi', 'jimbo'],   // red(Tita,Mela,Wati) + cyan(Ardi) + yellow(Jimbo)
  ardi:  ['mela', 'tita', 'dikta', 'jimbo', 'wati', 'gina'], // cyan+green+black = ALL
  gina:  ['wati', 'ardi'],                              // black only
  wati:  ['tita', 'mela', 'dikta', 'jimbo', 'ardi', 'gina'], // red+green+black = ALL
  jimbo: ['ardi', 'wati', 'dikta'],                    // green(Ardi,Wati) + yellow(Dikta)
}

export function buildLibraryVisitSteps(lang: Lang): LibraryVisitStoryboard {
  const id = (en: string, idn: string) => (lang === 'id' ? idn : en)

  const steps: LibraryVisitStep[] = [
    // Beat 0 — plain graph
    {
      focusId: null,
      highlightNodes: [],
      result: false,
      caption: id(
        'Same-color lines = visited on the same day.',
        'Garis sewarna = hari berkunjung yang sama.',
      ),
      hold: 2800,
    },
    // Beat 1 — Ardi (given to connect to all)
    {
      focusId: 'ardi',
      highlightNodes: ['ardi', ...CONNECTIONS.ardi],
      result: false,
      caption: id(
        'Ardi (cyan+green+black) visited with all 6 others. ✓',
        'Ardi (biru+hijau+hitam) bertemu semua 6 siswa. ✓',
      ),
      hold: 3200,
    },
    // Beat 2 — Wati
    {
      focusId: 'wati',
      highlightNodes: ['wati', ...CONNECTIONS.wati],
      result: false,
      caption: id(
        'Wati (red+green+black) also visited with all 6 others! ✓',
        'Wati (merah+hijau+hitam) juga bertemu semua 6 siswa! ✓',
      ),
      hold: 3200,
    },
    // Beat 3 — Dikta (misses Gina)
    {
      focusId: 'dikta',
      highlightNodes: ['dikta', ...CONNECTIONS.dikta],
      result: false,
      caption: id(
        'Dikta connects to 5 students — misses Gina. ✗',
        'Dikta terhubung dengan 5 siswa — tidak bertemu Gina. ✗',
      ),
      hold: 2800,
    },
    // Beat 4 — Gina (only 2 connections)
    {
      focusId: 'gina',
      highlightNodes: ['gina', ...CONNECTIONS.gina],
      result: false,
      caption: id(
        'Gina only visited with Ardi and Wati — 2 out of 6. ✗',
        'Gina hanya bertemu Ardi dan Wati — 2 dari 6 siswa. ✗',
      ),
      hold: 2800,
    },
    // Beat 5 — Result
    {
      focusId: 'wati',
      highlightNodes: ['wati'],
      result: true,
      caption: id(
        'Only Wati (besides Ardi) visited together with every other student.',
        'Hanya Wati (selain Ardi) yang berkunjung bersama setiap siswa lain.',
      ),
      hold: 3600,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
