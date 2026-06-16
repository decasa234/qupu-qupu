// Storyboard for WMI-24F3A-Q23 — the cut-and-count pattern.
// Picture 1 = 1 square; each cut splits ONE square into 4, a net gain of
// CUT_GAIN_PER_STEP (= 3) squares, so the counts run 1, 4, 7, ...
// Picture n has 1 + 3 × (n − 1) squares; Picture 2024 = 1 + 3 × 2023 = 6070.
// Pure (params + lang) → beats; everything derives from CUT_GAIN_PER_STEP and
// CUT_STAGES so the arithmetic stays consistent with the static figure.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { CUT_STAGES, CUT_GAIN_PER_STEP } from './CutCount24G3Illustration'

export type CutCountPhase =
  | 'goal'
  | 'stage' // walking one pictured stage (showing its count)
  | 'gain' // noticing the constant +3 gain
  | 'formula' // 1 + 3 × (n − 1)
  | 'plugTrap' // the 3 × 2024 trap, rejected
  | 'plug' // 1 + 3 × 2023
  | 'result'

export interface CutCountStep {
  phase: CutCountPhase
  /** How many pictured stages to reveal (1..CUT_STAGES.length); 0 = none yet. */
  shownStages: number
  /** Which pictured stage to spotlight (index into CUT_STAGES), or -1. */
  focusStage: number
  /** Highlight the running formula text on the meter. */
  highlightFormula: boolean
  caption: string
  hold: number
  /** A wrong attempt that must read as rejected. */
  reject: boolean
  /** The winning final beat. */
  result: boolean
}

export interface CutCountStoryboard {
  /** The target picture number (2024). */
  n: number
  /** Net gain per cut (= 3). */
  gain: number
  /** The count at picture 1. */
  base: number
  /** The trap answer (3 × n), shown then rejected. */
  trap: number
  /** The correct answer (base + gain × (n − 1)). */
  answer: number
  steps: CutCountStep[]
  finalIndex: number
}

export function buildCutCount24G3Steps(n: number, lang: Lang): CutCountStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Derive everything from the shared figure data so the arithmetic can never
  // drift from the picture: gain = +3 per cut, base = count of Picture 1.
  const gain = CUT_GAIN_PER_STEP // 3
  const base = CUT_STAGES[0].count // 1
  const stageCounts = CUT_STAGES.map((s) => s.count) // [1, 4, 7]
  const stageGain = base + gain * (CUT_STAGES.length - 1) // 1 + 3×2 = 7 (sanity)
  const answer = base + gain * (n - 1) // 1 + 3 × 2023 = 6070
  const trap = gain * n // 3 × 2024 = 6072 (the forgot-the-first trap)

  const steps: CutCountStep[] = []

  // Beat 0 — state the goal.
  steps.push({
    phase: 'goal',
    shownStages: 0,
    focusStage: -1,
    highlightFormula: false,
    hold: 2600,
    reject: false,
    result: false,
    caption: t(
      `Each cut chops ONE square into 4. How many squares does Picture ${n} have? Let's find the pattern first.`,
      `Tiap potong membelah SATU persegi jadi 4. Berapa persegi pada Gambar ${n}? Cari polanya dulu.`,
    ),
  })

  // Beats 1..3 — reveal the pictured stages one by one with their counts.
  CUT_STAGES.forEach((stage, i) => {
    const prev = i === 0 ? null : stageCounts[i - 1]
    const cap =
      prev == null
        ? t(
            `Picture ${stage.picture}: just ${stage.count} square to start.`,
            `Gambar ${stage.picture}: baru ${stage.count} persegi di awal.`,
          )
        : t(
            `Cut one square: Picture ${stage.picture} now has ${stage.count}. That's ${prev} + ${gain} = ${stage.count}.`,
            `Potong satu persegi: Gambar ${stage.picture} kini ${stage.count}. Itu ${prev} + ${gain} = ${stage.count}.`,
          )
    steps.push({
      phase: 'stage',
      shownStages: i + 1,
      focusStage: i,
      highlightFormula: false,
      hold: 2000,
      reject: false,
      result: false,
      caption: cap,
    })
  })

  // Beat 4 — name the constant gain.
  steps.push({
    phase: 'gain',
    shownStages: CUT_STAGES.length,
    focusStage: -1,
    highlightFormula: false,
    hold: 2400,
    reject: false,
    result: false,
    caption: t(
      `See it? ${stageCounts.join(' → ')}. Every cut REMOVES 1 and ADDS 4, so each step jumps up by ${gain}.`,
      `Lihat? ${stageCounts.join(' → ')}. Tiap potong MENGHAPUS 1 dan MENAMBAH 4, jadi tiap langkah naik ${gain}.`,
    ),
  })

  // Beat 5 — build the formula 1 + 3 × (n − 1).
  steps.push({
    phase: 'formula',
    shownStages: CUT_STAGES.length,
    focusStage: -1,
    highlightFormula: true,
    hold: 2600,
    reject: false,
    result: false,
    caption: t(
      `Picture 1 starts at ${base}, then we add ${gain} once per cut. After (n − 1) cuts: Picture n = ${base} + ${gain} × (n − 1).`,
      `Gambar 1 mulai dari ${base}, lalu tambah ${gain} tiap potong. Setelah (n − 1) potong: Gambar ke-n = ${base} + ${gain} × (n − 1).`,
    ),
  })

  // Beat 6 — the trap: 3 × 2024 (forgets that Picture 1 is already step 1).
  steps.push({
    phase: 'plugTrap',
    shownStages: CUT_STAGES.length,
    focusStage: -1,
    highlightFormula: true,
    hold: 2100,
    reject: true,
    result: false,
    caption: t(
      `Careful — ${gain} × ${n} = ${trap} is WRONG. That counts ${n} cuts, but Picture ${n} only needs ${n - 1} cuts.`,
      `Hati-hati — ${gain} × ${n} = ${trap} itu SALAH. Itu menghitung ${n} potong, padahal Gambar ${n} cuma butuh ${n - 1} potong.`,
    ),
  })

  // Beat 7 — plug in n: 1 + 3 × 2023.
  steps.push({
    phase: 'plug',
    shownStages: CUT_STAGES.length,
    focusStage: -1,
    highlightFormula: true,
    hold: 2400,
    reject: false,
    result: false,
    caption: t(
      `So for Picture ${n}: ${base} + ${gain} × ${n - 1} = ${base} + ${gain * (n - 1)}.`,
      `Jadi untuk Gambar ${n}: ${base} + ${gain} × ${n - 1} = ${base} + ${gain * (n - 1)}.`,
    ),
  })

  // Beat 8 — the answer.
  steps.push({
    phase: 'result',
    shownStages: CUT_STAGES.length,
    focusStage: -1,
    highlightFormula: true,
    hold: 0,
    reject: false,
    result: true,
    caption: t(
      `Picture ${n} has ${base} + ${gain * (n - 1)} = ${answer} squares.`,
      `Gambar ${n} punya ${base} + ${gain * (n - 1)} = ${answer} persegi.`,
    ),
  })

  // stageGain is a consistency anchor (= last pictured count); keep it referenced
  // so the picture data and the formula are wired to the same gain.
  if (stageGain !== stageCounts[stageCounts.length - 1]) {
    // Unreachable for the canonical figure; guards against a future edit drifting
    // CUT_STAGES away from a constant +gain progression.
    throw new Error('CutCount stages are not a constant-gain progression')
  }

  return {
    n,
    gain,
    base,
    trap,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
