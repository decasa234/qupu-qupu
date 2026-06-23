// SEAMO-17-A-Q6 — elapsed-time storyboard.
//
// Two clocks: start 1:30, end 3:45. Elapsed = 3:45 − 1:30 = 2 h 15 min = 135 min.
//
// Beat sequence:
//   0. intro   — show both clocks static; "Two clocks. What time does each show?"
//   1. clock1  — highlight start clock + minute hand; read 1:30.
//   2. clock2  — highlight end   clock + minute hand; read 3:45.
//   3. diff    — subtract: 3:45 − 1:30 = 2 h 15 min.
//   4. convert — 2 × 60 + 15 = 135 min → A.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

// ── Exported clock data (mirrors Illustration constants) ─────────────────────
export const START_H = 1
export const START_M = 30
export const END_H   = 3
export const END_M   = 45
export const ELAPSED_MIN = 135
export const ANSWER_LABEL = 'A'

// ── Beat types ────────────────────────────────────────────────────────────────
export type ElapsedPhase = 'intro' | 'clock1' | 'clock2' | 'diff' | 'convert'

export interface ElapsedStep {
  phase: ElapsedPhase
  /** Which clock is being pointed at this beat (1 | 2 | 0 = both). */
  focus: 0 | 1 | 2
  caption: string
  hold: number
  result: boolean
}

export interface ElapsedStoryboard {
  startH: number
  startM: number
  endH: number
  endM: number
  elapsedMin: number
  answerLabel: string
  steps: ElapsedStep[]
  finalIndex: number
}

export function buildElapsedClock17A6Steps(lang: Lang): ElapsedStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ElapsedStep[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      focus: 0,
      hold: 2000,
      result: false,
      caption: t(
        'Two clocks are shown. Read the START time and the END time.',
        'Dua jam ditunjukkan. Baca waktu MULAI dan waktu AKHIR.',
      ),
    },
    // Beat 1 — read clock 1
    {
      phase: 'clock1',
      focus: 1,
      hold: 2200,
      result: false,
      caption: t(
        'Clock 1 (start): minute hand at 6 → 30 min, hour hand just past 1 → 1:30.',
        'Jam 1 (mulai): jarum menit di angka 6 → 30 menit, jarum jam baru lewat 1 → pukul 1:30.',
      ),
    },
    // Beat 2 — read clock 2
    {
      phase: 'clock2',
      focus: 2,
      hold: 2200,
      result: false,
      caption: t(
        'Clock 2 (end): minute hand at 3 → 15 min, hour hand just past 3 → 3:45.',
        'Jam 2 (akhir): jarum menit di angka 3 → 15 menit, jarum jam baru lewat 3 → pukul 3:45.',
      ),
    },
    // Beat 3 — subtract
    {
      phase: 'diff',
      focus: 0,
      hold: 2400,
      result: false,
      caption: t(
        'Elapsed: 3:45 − 1:30 = 2 hours 15 minutes.',
        'Waktu berlalu: 3:45 − 1:30 = 2 jam 15 menit.',
      ),
    },
    // Beat 4 — convert to minutes
    {
      phase: 'convert',
      focus: 0,
      hold: 0,
      result: true,
      caption: t(
        `2 × 60 + 15 = ${ELAPSED_MIN} minutes → ${ANSWER_LABEL}.`,
        `2 × 60 + 15 = ${ELAPSED_MIN} menit → ${ANSWER_LABEL}.`,
      ),
    },
  ]

  return {
    startH: START_H,
    startM: START_M,
    endH:   END_H,
    endM:   END_M,
    elapsedMin: ELAPSED_MIN,
    answerLabel: ANSWER_LABEL,
    steps,
    finalIndex: steps.length - 1,
  }
}
