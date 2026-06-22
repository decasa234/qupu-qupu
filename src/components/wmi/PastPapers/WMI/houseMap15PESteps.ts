// IKMC-21-PE-Q15 — storyboard for the house-map path-tracing animation.
//
// Question: "The picture shows the five houses of five friends and their school.
// Doris and Ali walk past Leo's house to go to school. Eva walks past Chole's
// house. Which is Eva's house?" Answer: B
//
// Beat sequence:
//   0. Intro      — plain map, introduce the puzzle.
//   1. Leo        — highlight Leo's house; show Doris & Ali both pass through it.
//   2. Chole      — highlight Chole's house; show Eva must pass it.
//   3. Eva path   — trace which house (B) connects through Chole to school.
//   4. Result     — confirm B in green.
//
// Pure (correctAnswer, lang) → storyboard. Deterministic: no Math.random, no Date.

import type { MapHighlight } from './HouseMap15PEIllustration'

export type HouseMap15PEPhase = 'intro' | 'leo' | 'chole' | 'eva-path' | 'result'

export interface HouseMap15PEStep {
  phase: HouseMap15PEPhase
  highlight: MapHighlight
  highlightAnswer: boolean
  caption: string
  badge: string | null
  hold: number
  result: boolean
}

export interface HouseMap15PEStoryboard {
  steps: HouseMap15PEStep[]
  finalIndex: number
}

type Lang = 'en' | 'id'

export function buildHouseMap15PESteps(
  _correctAnswer: string,
  lang: Lang,
): HouseMap15PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HouseMap15PEStep[] = [
    // ── Beat 0: Intro ──────────────────────────────────────────────────────
    {
      phase: 'intro',
      highlight: null,
      highlightAnswer: false,
      caption: t(
        'Five friends each have a house (A–E). To go to school, some walk past other friends\' houses. Use the path clues to find which house belongs to Eva.',
        'Lima teman masing-masing punya rumah (A–E). Untuk ke sekolah, beberapa melewati rumah teman lain. Gunakan petunjuk jalur untuk mencari rumah Eva.',
      ),
      badge: null,
      hold: 2600,
      result: false,
    },

    // ── Beat 1: Leo ────────────────────────────────────────────────────────
    {
      phase: 'leo',
      highlight: 'leo',
      highlightAnswer: false,
      caption: t(
        'Doris AND Ali both walk past Leo\'s house. That means Leo\'s house is on the shared path segment before the school.',
        'Doris DAN Ali keduanya melewati rumah Leo. Artinya rumah Leo ada di jalur bersama sebelum sekolah.',
      ),
      badge: t('Doris → Leo → School  |  Ali → Leo → School', 'Doris → Leo → Sekolah  |  Ali → Leo → Sekolah'),
      hold: 2400,
      result: false,
    },

    // ── Beat 2: Chole ──────────────────────────────────────────────────────
    {
      phase: 'chole',
      highlight: 'chole',
      highlightAnswer: false,
      caption: t(
        'Eva walks past Chole\'s house to reach school. So Chole\'s house is somewhere between Eva\'s house and the school.',
        'Eva melewati rumah Chole untuk menuju sekolah. Jadi rumah Chole ada di antara rumah Eva dan sekolah.',
      ),
      badge: t('Eva → Chole → School', 'Eva → Chole → Sekolah'),
      hold: 2400,
      result: false,
    },

    // ── Beat 3: Eva's path ────────────────────────────────────────────────
    {
      phase: 'eva-path',
      highlight: 'eva-path',
      highlightAnswer: false,
      caption: t(
        'Tracing the path: only house B connects through Chole\'s house on the way to school. So B is Eva\'s house!',
        'Menelusuri jalur: hanya rumah B yang melewati rumah Chole menuju sekolah. Jadi B adalah rumah Eva!',
      ),
      badge: t('B → Chole → School ✓', 'B → Chole → Sekolah ✓'),
      hold: 2600,
      result: false,
    },

    // ── Beat 4: Result ────────────────────────────────────────────────────
    {
      phase: 'result',
      highlight: 'answer',
      highlightAnswer: true,
      caption: t(
        'Eva\'s house is B — it sits on the path that passes Chole\'s house before reaching the school. Answer: B.',
        'Rumah Eva adalah B — berada di jalur yang melewati rumah Chole sebelum sampai ke sekolah. Jawaban: B.',
      ),
      badge: null,
      hold: 0,
      result: true,
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
