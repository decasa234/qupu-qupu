import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER_BOX, SOLUTION, type SlotState } from './LetterOrder19P1Illustration'

// WMI-19P1A-Q25 — "In which box is B?" (answer C = box 5).
//
// The animation APPLIES the clues one at a time, placing letters into the five
// boxes, until B is pinned to box 5:
//   clue 3 (C _ _ E)  → C in box 1, E in box 4
//   clue 1 (D _ E)    → D in box 2 (so E = D + 2, matches box 4)
//   clue 2 (D _ _ B)  → B in box 5 (B = D + 3)
//   leftover A          → box 3
// Then the target box (B in box 5) is highlighted. The answer derives from the
// data (SOLUTION / ANSWER_BOX), never hardcoded.

export interface LetterOrderStep {
  /** The five-box answer row state for this beat. */
  slots: SlotState[]
  result: boolean
  caption: string
  hold: number
}

export interface LetterOrderStoryboard {
  answerBox: number
  steps: LetterOrderStep[]
  finalIndex: number
}

// helper: a fresh empty 5-slot row.
function emptyRow(): SlotState[] {
  return Array.from({ length: SOLUTION.length }, () => ({}))
}

// place a letter (0-based box index) into a cloned row, flagging it just-placed.
function withLetter(base: SlotState[], placements: Array<{ box: number; letter: string }>, justPlaced: number[]): SlotState[] {
  const row = base.map((s) => ({ ...s, placed: false }))
  for (const { box, letter } of placements) row[box] = { ...row[box], letter }
  for (const b of justPlaced) row[b] = { ...row[b], placed: true }
  return row
}

export function buildLetterOrder19P1Steps(lang: Lang): LetterOrderStoryboard {
  const t = (en: string, idn: string) => (lang === 'id' ? idn : en)

  const steps: LetterOrderStep[] = []

  // Running list of placements (box index 0-based, letter).
  const placed: Array<{ box: number; letter: string }> = []

  // Beat 0 — strategy.
  steps.push({
    slots: emptyRow(),
    result: false,
    hold: 2200,
    caption: t(
      'Use the clues one at a time. Each arrow reads left to right.',
      'Pakai petunjuk satu per satu. Setiap panah dibaca kiri ke kanan.',
    ),
  })

  // Beat 1 — clue 3: C _ _ E  → C box1, E box4.
  placed.push({ box: 0, letter: 'C' }, { box: 3, letter: 'E' })
  steps.push({
    slots: withLetter(emptyRow(), placed, [0, 3]),
    result: false,
    hold: 2200,
    caption: t(
      'Clue "C _ _ E": C in box 1, E in box 4 (two boxes between).',
      'Petunjuk "C _ _ E": C di kotak 1, E di kotak 4 (dua kotak di antaranya).',
    ),
  })

  // Beat 2 — clue 1: D _ E  → since E is box4, D is box2.
  placed.push({ box: 1, letter: 'D' })
  steps.push({
    slots: withLetter(emptyRow(), placed, [1]),
    result: false,
    hold: 2200,
    caption: t(
      'Clue "D _ E": E is two right of D. E is box 4, so D is box 2.',
      'Petunjuk "D _ E": E dua kotak setelah D. E di kotak 4, jadi D di kotak 2.',
    ),
  })

  // Beat 3 — clue 2: D _ _ B  → B is three right of D (box2) → box5.
  placed.push({ box: 4, letter: 'B' })
  steps.push({
    slots: withLetter(emptyRow(), placed, [4]),
    result: false,
    hold: 2200,
    caption: t(
      'Clue "D _ _ B": B is three right of D. D is box 2, so B is box 5!',
      'Petunjuk "D _ _ B": B tiga kotak setelah D. D di kotak 2, jadi B di kotak 5!',
    ),
  })

  // Beat 4 — fill the leftover A into the only empty box (box 3).
  placed.push({ box: 2, letter: 'A' })
  steps.push({
    slots: withLetter(emptyRow(), placed, [2]),
    result: false,
    hold: 1800,
    caption: t('The last letter A fills box 3. Row: C D A E B.', 'Huruf terakhir A mengisi kotak 3. Baris: C D A E B.'),
  })

  // Beat 5 — highlight B (the target) and state the answer.
  const finalRow = withLetter(emptyRow(), placed, [])
  finalRow[ANSWER_BOX - 1] = { ...finalRow[ANSWER_BOX - 1], target: true }
  steps.push({
    slots: finalRow,
    result: true,
    hold: 0,
    caption: t(`B is in box ${ANSWER_BOX} from the left. Answer C.`, `B ada di kotak ke-${ANSWER_BOX} dari kiri. Jawaban C.`),
  })

  return { answerBox: ANSWER_BOX, steps, finalIndex: steps.length - 1 }
}
