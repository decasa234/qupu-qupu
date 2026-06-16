// Deterministic storyboard for WMI-22P2A-Q22 (arrow-grid path).
//
// The chick follows the arrow chain from its start cell; each beat reveals one
// more hop of the traced path. The final beat exits the grid to the EAST at the
// top row, landing on the ORANGE — option A.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { tracePath } from './P22G2Q22Illustration'

export interface ArrowStep {
  /** How many cells of the traced path are revealed (1 = just the start). */
  shown: number
  /** Reveal the final exit dart to the orange. */
  exit: boolean
  caption: string
  hold: number
  result: boolean
}

export interface ArrowStoryboard {
  steps: ArrowStep[]
  finalIndex: number
  /** The full traced chain of cells (for the explainer to draw). */
  cells: Array<[number, number]>
  exit: 'N' | 'S' | 'E' | 'W'
}

export function buildP22G2Q22Steps(lang: Lang): ArrowStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const { cells, exit } = tracePath()
  const hops = cells.length // number of nodes; hops-1 moves

  const steps: ArrowStep[] = []

  steps.push({
    shown: 1,
    exit: false,
    hold: 1700,
    result: false,
    caption: t(
      'Start on the chick’s arrow. Each arrow says which way to go and how many cells.',
      'Mulai di panah burung. Tiap panah menunjukkan arah dan berapa sel harus melompat.',
    ),
  })

  steps.push({
    shown: 2,
    exit: false,
    hold: 1700,
    result: false,
    caption: t(
      'First arrow points right 1 cell — hop onto the next arrow.',
      'Panah pertama menunjuk kanan 1 sel — lompat ke panah berikutnya.',
    ),
  })

  // a middle beat that fast-forwards through the chain
  const mid = Math.min(hops - 1, Math.max(3, Math.round(hops * 0.6)))
  steps.push({
    shown: mid,
    exit: false,
    hold: 1900,
    result: false,
    caption: t(
      'Keep landing on a new arrow and obeying it — hop by hop the path winds across the grid.',
      'Terus mendarat di panah baru dan menurutinya — lompat demi lompat lintasan berkelok di kisi.',
    ),
  })

  steps.push({
    shown: hops,
    exit: false,
    hold: 1900,
    result: false,
    caption: t(
      'The last arrow sits on the top row and points right — toward the grid’s edge.',
      'Panah terakhir berada di baris atas dan menunjuk kanan — ke arah tepi kisi.',
    ),
  })

  steps.push({
    shown: hops,
    exit: true,
    hold: 0,
    result: true,
    caption: t(
      `It steps off the ${exit === 'E' ? 'right' : exit} edge at the top row, reaching the orange — answer A.`,
      `Lintasan keluar dari tepi ${exit === 'E' ? 'kanan' : exit} di baris atas, mencapai jeruk — jawaban A.`,
    ),
  })

  return { steps, finalIndex: steps.length - 1, cells, exit }
}
