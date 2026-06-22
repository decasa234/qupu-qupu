// IKMC-23-EC-Q22 — storyboard for the machine-rotation animation.
//
// Question: Else has two machines.
//   Machine R: rotates the paper 90° clockwise.
//   Machine S: stamps the paper with a club (♣).
// The paper starts with a dot in the bottom-left corner.
// In which order are the machines used to produce the result shown
// (club stamp on paper after 3 machine uses)?
// Answer: B (RSR).
//
// The "result shown" in the figure (062.jpg) is the club stamp
// positioned so that after the full RSR sequence the club ends up
// on top of where the dot started — effectively in the top-right
// quadrant of the paper (stamp at BR then rotated → top-left of output).
//
// Teaching walk (one idea per beat):
//   0. intro   — show starting paper; dot in bottom-left.
//   1. R₁      — apply machine R: dot moves to bottom-right.
//   2. S       — apply machine S: club stamped (dot + club together).
//   3. R₂      — apply machine R again: paper rotates; club now top-left.
//   4. result  — reveal final state + answer B badge.
//
// Dot-tracking through RSR:
//   Start:  dot = bl
//   After R: dot = br  (90° CW: bl → br)
//   After S: dot = br, club stamped at centre (club marks the paper)
//   After R: dot = tr  (90° CW: br → tr), club rotates with paper
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

import type { DotCorner } from './Rotate22ECIllustration'

export type Lang = 'en' | 'id'

export interface Rotate22ECBeat {
  /** Where the dot corner is on the paper. */
  dotCorner: DotCorner
  /** Whether the club stamp is visible on the paper. */
  showClub: boolean
  /** Label shown above the illustration for the current state (null = none). */
  stateLabel: string | null
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on the result beat. */
  result: boolean
  /** Which machine was just applied (null = intro). */
  lastMachine: 'R' | 'S' | null
}

export interface Rotate22ECStoryboard {
  steps: Rotate22ECBeat[]
  finalIndex: number
  answer: string
}

export function buildRotate22ECSteps(lang: Lang): Rotate22ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Rotate22ECBeat[] = [
    // Beat 0 — intro: starting paper, dot bottom-left
    {
      dotCorner: 'bl',
      showClub: false,
      lastMachine: null,
      stateLabel: t('Start: dot bottom-left', 'Mulai: titik sudut kiri bawah'),
      hold: 2400,
      result: false,
      caption: t(
        'The paper starts with a dot ● in the bottom-left corner. We need to use 3 machines (R or S) to produce the shown result.',
        'Kertas dimulai dengan titik ● di sudut kiri bawah. Kita perlu menggunakan 3 mesin (R atau S) untuk menghasilkan hasil yang ditunjukkan.',
      ),
    },

    // Beat 1 — apply machine R: dot rotates 90° CW, bl → br
    {
      dotCorner: 'br',
      showClub: false,
      lastMachine: 'R',
      stateLabel: t('After R — 90° clockwise', 'Setelah R — 90° searah jarum jam'),
      hold: 2600,
      result: false,
      caption: t(
        'Machine R rotates the paper 90° clockwise. The dot moves from the bottom-left corner to the bottom-right corner.',
        'Mesin R memutar kertas 90° searah jarum jam. Titik berpindah dari sudut kiri bawah ke sudut kanan bawah.',
      ),
    },

    // Beat 2 — apply machine S: club stamped at current position (dot still br)
    {
      dotCorner: 'br',
      showClub: true,
      lastMachine: 'S',
      stateLabel: t('After S — club stamped ♣', 'Setelah S — stempel klub ♣'),
      hold: 2600,
      result: false,
      caption: t(
        'Machine S stamps a club ♣ on the paper. The dot is still in the bottom-right corner. The stamp is now permanently on the paper.',
        'Mesin S menstempel klub ♣ pada kertas. Titik masih di sudut kanan bawah. Stempel kini melekat permanen pada kertas.',
      ),
    },

    // Beat 3 — apply machine R: paper rotates 90° CW again, dot br → tr
    {
      dotCorner: 'tr',
      showClub: true,
      lastMachine: 'R',
      stateLabel: t('After R — 90° clockwise again', 'Setelah R — 90° searah jarum jam lagi'),
      hold: 2600,
      result: false,
      caption: t(
        'Machine R rotates 90° clockwise again. The dot moves from bottom-right to top-right. The club stamp rotates with the paper — it now appears in the left half of the paper.',
        'Mesin R memutar 90° searah jarum jam lagi. Titik berpindah dari kanan bawah ke kanan atas. Stempel klub ikut berputar dengan kertas — kini muncul di bagian kiri kertas.',
      ),
    },

    // Beat 4 — result: the sequence RSR matches the figure
    {
      dotCorner: 'tr',
      showClub: true,
      lastMachine: null,
      stateLabel: t('Result: RSR ✓', 'Hasil: RSR ✓'),
      hold: 0,
      result: true,
      caption: t(
        'Sequence R → S → R produces the club stamp in the correct position. The answer is RSR = B.',
        'Urutan R → S → R menghasilkan stempel klub di posisi yang benar. Jawabannya adalah RSR = B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 'B' }
}
