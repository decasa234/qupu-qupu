import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-25F1A-Q6 (2025 G1 final). A row of SIX open trays of apples, left → right:
//   box 1: 6   box 2: 5   box 3: 7   box 4: 8   box 5: 9   box 6: 4
// "Find the sum of the apples in the 4th box from the LEFT and the 4th box from
//  the RIGHT." With N = 6 boxes, the 4th from the left is box 4 (8 apples) and
//  the 4th from the right is box N-3 = box 3 (7 apples), so 8 + 7 = 15.
//
// The storyboard does NOT jump to the answer. It walks the method one idea per
// beat: state the goal, COUNT four boxes from the left (1·2·3·4) to land on box 4
// = 8 apples, then COUNT four boxes from the right (1·2·3·4) to land on box 3 = 7
// apples, then ADD 8 + 7 = 15. The two target trays stay lit through the add and
// the result. Result beat lands on 15. Box indices are 0-based to match the
// `litBoxes` prop of the AppleBoxes25G1 primitive (box 4 = index 3, box 3 = 2).

// Apple counts per box, left → right (the question's fixed data).
export const BOX_APPLES = [6, 5, 7, 8, 9, 4] as const
export const BOX_COUNT = BOX_APPLES.length // 6

// 0-based indices of the two target boxes.
export const LEFT_TARGET = 3 // 4th from the left  → box 4 → 8 apples
export const RIGHT_TARGET = 2 // 4th from the right → box 3 → 7 apples

export const LEFT_VALUE = BOX_APPLES[LEFT_TARGET] // 8
export const RIGHT_VALUE = BOX_APPLES[RIGHT_TARGET] // 7
export const ANSWER = LEFT_VALUE + RIGHT_VALUE // 15

export type ApplePhase = 'goal' | 'countLeft' | 'countRight' | 'add' | 'result'

export interface AppleStep {
  phase: ApplePhase
  /** 0-based box indices to light up this beat (passed straight to the primitive). */
  litBoxes: number[]
  /** Which box (0-based) the counting finger is on this beat, or null. */
  cursor: number | null
  /** Counting direction this beat: 'left' counts from the left, 'right' from the right. */
  direction: 'left' | 'right' | null
  /** The ordinal reached while counting (1..4), or null off the count phases. */
  countN: number | null
  /** The left target's apple value, shown once box 4 is found (else null). */
  leftValue: number | null
  /** The right target's apple value, shown once box 3 is found (else null). */
  rightValue: number | null
  /** Running sum to display once both values are known (else null). */
  sum: number | null
  caption: string
  hold: number
  result: boolean
}

export interface AppleStoryboard {
  answer: number
  leftValue: number
  rightValue: number
  steps: AppleStep[]
  finalIndex: number
}

export function buildAppleBoxes25G1Steps(lang: Lang): AppleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AppleStep[] = []

  // --- Beat 0: state the goal. Nothing lit yet. ---
  steps.push({
    phase: 'goal',
    litBoxes: [],
    cursor: null,
    direction: null,
    countN: null,
    leftValue: null,
    rightValue: null,
    sum: null,
    hold: 2100,
    result: false,
    caption: t(
      'Add the apples in the 4th box from the left and the 4th box from the right.',
      'Jumlahkan apel di kotak ke-4 dari kiri dan kotak ke-4 dari kanan.',
    ),
  })

  // --- Count 4 boxes from the LEFT: 1, 2, 3, 4 → box 4. ---
  for (let n = 1; n <= 4; n++) {
    const idx = n - 1 // 0-based box the finger is on
    const onTarget = idx === LEFT_TARGET
    steps.push({
      phase: 'countLeft',
      // Light boxes counted so far so the count reads as it walks.
      litBoxes: Array.from({ length: n }, (_, k) => k),
      cursor: idx,
      direction: 'left',
      countN: n,
      leftValue: onTarget ? LEFT_VALUE : null,
      rightValue: null,
      sum: null,
      hold: onTarget ? 2100 : 1500,
      result: false,
      caption: onTarget
        ? t(
            `4 from the left lands on box 4 — it holds ${LEFT_VALUE} apples.`,
            `4 dari kiri jatuh di kotak 4 — isinya ${LEFT_VALUE} apel.`,
          )
        : t(
            `Counting from the left: ${n}${n === 1 ? '…' : '…'}`,
            `Hitung dari kiri: ${n}${n === 1 ? '…' : '…'}`,
          ),
    })
  }

  // --- Count 4 boxes from the RIGHT: 1, 2, 3, 4 → box 3 (index 2). ---
  // Keep the left target (box 4 = index 3) lit so the two targets read together.
  for (let n = 1; n <= 4; n++) {
    const idx = BOX_COUNT - n // 0-based box the finger is on, counting from the right
    const onTarget = idx === RIGHT_TARGET
    // Light the right-side boxes walked so far, plus the already-found left target.
    const rightWalked = Array.from({ length: n }, (_, k) => BOX_COUNT - 1 - k)
    const lit = Array.from(new Set([LEFT_TARGET, ...rightWalked])).sort((a, b) => a - b)
    steps.push({
      phase: 'countRight',
      litBoxes: lit,
      cursor: idx,
      direction: 'right',
      countN: n,
      leftValue: LEFT_VALUE,
      rightValue: onTarget ? RIGHT_VALUE : null,
      sum: null,
      hold: onTarget ? 2100 : 1500,
      result: false,
      caption: onTarget
        ? t(
            `4 from the right lands on box 3 — it holds ${RIGHT_VALUE} apples.`,
            `4 dari kanan jatuh di kotak 3 — isinya ${RIGHT_VALUE} apel.`,
          )
        : t(`Counting from the right: ${n}…`, `Hitung dari kanan: ${n}…`),
    })
  }

  // --- Add the two finds. Both targets stay lit. ---
  steps.push({
    phase: 'add',
    litBoxes: [RIGHT_TARGET, LEFT_TARGET],
    cursor: null,
    direction: null,
    countN: null,
    leftValue: LEFT_VALUE,
    rightValue: RIGHT_VALUE,
    sum: null,
    hold: 2100,
    result: false,
    caption: t(
      `Now add the two boxes: ${LEFT_VALUE} + ${RIGHT_VALUE}.`,
      `Sekarang jumlahkan dua kotak itu: ${LEFT_VALUE} + ${RIGHT_VALUE}.`,
    ),
  })

  // --- Result: the sum. ---
  steps.push({
    phase: 'result',
    litBoxes: [RIGHT_TARGET, LEFT_TARGET],
    cursor: null,
    direction: null,
    countN: null,
    leftValue: LEFT_VALUE,
    rightValue: RIGHT_VALUE,
    sum: ANSWER,
    hold: 0,
    result: true,
    caption: t(
      `${LEFT_VALUE} + ${RIGHT_VALUE} = ${ANSWER} apples in all.`,
      `${LEFT_VALUE} + ${RIGHT_VALUE} = ${ANSWER} apel semuanya.`,
    ),
  })

  return {
    answer: ANSWER,
    leftValue: LEFT_VALUE,
    rightValue: RIGHT_VALUE,
    steps,
    finalIndex: steps.length - 1,
  }
}
