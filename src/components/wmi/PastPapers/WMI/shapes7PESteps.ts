import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { FIGURES } from './Shapes7PEIllustration'

// Storyboard for IKMC-20-PE-Q7.
// "Anna's picture has 3 black triangles AND fewer than 4 squares. Which is it?"
// We state both conditions, then check A → B → C → D → E:
//   count the black triangles, count the squares, judge both conditions.
// Only picture E passes (3 black triangles, 2 squares).
//
// Counts are DERIVED from FIGURES (the illustrator's verified data) so captions
// cannot drift from the drawing.
//
// Pure function of `lang` — SSR-safe and deterministic.

export type Label = 'A' | 'B' | 'C' | 'D' | 'E'

export interface Shapes7PEStep {
  /** Which option this beat is examining (undefined on the intro beat). */
  label?: Label
  /** Which shape kind to highlight on this beat. */
  highlight?: 'triangle' | 'square'
  /** Triangle count chip is visible. */
  showTri: boolean
  /** Square count chip is visible. */
  showSq: boolean
  /** Verdict for this option. */
  verdict?: 'pass' | 'fail'
  /** Beat caption. */
  caption: string
  /** Auto-advance hold duration (ms). */
  hold: number
  /** True only on the winning final beat. */
  result: boolean
}

export interface Shapes7PEStoryboard {
  answer: Label
  triLabel: string
  sqLabel: string
  steps: Shapes7PEStep[]
  finalIndex: number
}

const ORDER: Label[] = ['A', 'B', 'C', 'D', 'E']

export function buildShapes7PESteps(lang: Lang): Shapes7PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const answer: Label = 'E'
  const tick = '✓'
  const cross = '✗'

  const steps: Shapes7PEStep[] = []

  // Beat 0 — state both conditions.
  steps.push({
    showTri: false,
    showSq: false,
    hold: 2600,
    result: false,
    caption: t(
      'We need a picture with EXACTLY 3 black triangles AND FEWER THAN 4 squares. Check each picture!',
      'Kita butuh gambar dengan TEPAT 3 segitiga hitam DAN KURANG DARI 4 persegi. Periksa tiap gambar!',
    ),
  })

  for (const label of ORDER) {
    const fig = FIGURES[label]
    const tri = fig.blackTriangles
    const sq = fig.squares
    const triOk = tri === 3
    const sqOk = sq < 4
    const pass = triOk && sqOk

    // Beat — count black triangles.
    steps.push({
      label,
      highlight: 'triangle',
      showTri: true,
      showSq: false,
      hold: 1800,
      result: false,
      caption: triOk
        ? t(
            `Picture ${label}: count the black triangles… ${tri} black triangles ${tick}. Now count the squares…`,
            `Gambar ${label}: hitung segitiga hitam… ${tri} segitiga hitam ${tick}. Sekarang hitung persegi…`,
          )
        : t(
            `Picture ${label}: count the black triangles… only ${tri}${tri === 1 ? '' : ''} — needs exactly 3 ${cross}. ${label} is out.`,
            `Gambar ${label}: hitung segitiga hitam… hanya ${tri} — harus tepat 3 ${cross}. ${label} gugur.`,
          ),
    })

    if (!triOk) {
      // Triangles fail — no need to count squares; add a skip beat.
      steps.push({
        label,
        showTri: true,
        showSq: false,
        verdict: 'fail',
        hold: 1600,
        result: false,
        caption: t(
          `Picture ${label}: only ${tri} black triangle${tri === 1 ? '' : 's'} — not 3. ${label} is eliminated.`,
          `Gambar ${label}: hanya ${tri} segitiga hitam — bukan 3. ${label} gugur.`,
        ),
      })
      continue
    }

    // Beat — count squares.
    steps.push({
      label,
      highlight: 'square',
      showTri: true,
      showSq: true,
      verdict: pass ? 'pass' : 'fail',
      hold: pass ? 2400 : 2000,
      result: false,
      caption: pass
        ? t(
            `Picture ${label}: ${tri} black triangles ${tick} and only ${sq} square${sq === 1 ? '' : 's'} ${tick} — both conditions met!`,
            `Gambar ${label}: ${tri} segitiga hitam ${tick} dan hanya ${sq} persegi ${tick} — kedua syarat terpenuhi!`,
          )
        : t(
            `Picture ${label}: ${tri} black triangles ${tick} but ${sq} square${sq === 1 ? '' : 's'} — needs fewer than 4 ${cross}. ${label} is out.`,
            `Gambar ${label}: ${tri} segitiga hitam ${tick} tapi ${sq} persegi — harus kurang dari 4 ${cross}. ${label} gugur.`,
          ),
    })
  }

  // Final beat — E is the answer.
  const win = FIGURES[answer]
  steps.push({
    label: answer,
    showTri: true,
    showSq: true,
    verdict: 'pass',
    hold: 0,
    result: true,
    caption: t(
      `Only picture ${answer} has exactly ${win.blackTriangles} black triangles AND only ${win.squares} squares (fewer than 4) — the answer is ${answer}!`,
      `Hanya gambar ${answer} yang memiliki tepat ${win.blackTriangles} segitiga hitam DAN hanya ${win.squares} persegi (kurang dari 4) — jawabannya ${answer}!`,
    ),
  })

  return {
    answer,
    triLabel: t('black triangles', 'segitiga hitam'),
    sqLabel: t('squares', 'persegi'),
    steps,
    finalIndex: steps.length - 1,
  }
}
