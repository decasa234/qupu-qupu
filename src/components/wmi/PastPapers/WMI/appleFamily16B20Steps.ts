// appleFamily16B20Steps.ts
//
// Beat-by-beat storyboard for SEAMO-16-B-Q20.
//
// Solution path (two simultaneous equations):
//   0. Show problem: two scenarios, ? apples
//   1. Write equations: T = 4n + 10  and  T = 6n − 6
//   2. Set equal: 4n + 10 = 6n − 6
//   3. Solve for n: 2n = 16 → n = 8 family members
//   4. Substitute back: T = 4 × 8 + 10 = 42
//   5. Verify: 6 × 8 − 6 = 42 ✓
//   6. Answer: 42 apples — choice B

import {
  SHARE_A,
  SURPLUS_A,
  SHARE_B,
  DEFICIT_B,
  FAMILY_N,
  TOTAL_T,
} from './AppleFamily16B20Illustration'

export type AppleFamilyPhase =
  | 'problem'
  | 'eq1'
  | 'eq2'
  | 'set-equal'
  | 'solve-n'
  | 'solve-t'
  | 'verify'
  | 'answer'

export interface AppleFamilyStep {
  phase: AppleFamilyPhase
  showAnswer: boolean
  caption: string
  /** Arithmetic expression to highlight (displayed in the step box). */
  expr: string
  hold: number
  result: boolean
}

export interface AppleFamilyStoryboard {
  steps: AppleFamilyStep[]
  finalIndex: number
}

type Lang = 'en' | 'id'

export function buildAppleFamily16B20Steps(lang: Lang): AppleFamilyStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AppleFamilyStep[] = [
    // Beat 0: show the two scenarios
    {
      phase: 'problem',
      showAnswer: false,
      hold: 1600,
      result: false,
      expr: '',
      caption: t(
        `Mr Wang has a basket of apples. Let n = family members, T = total apples.`,
        `Pak Wang punya sekeranjang apel. Misalkan n = jumlah anggota keluarga, T = total apel.`,
      ),
    },

    // Beat 1: first equation
    {
      phase: 'eq1',
      showAnswer: false,
      hold: 2000,
      result: false,
      expr: `T = ${SHARE_A}n + ${SURPLUS_A}`,
      caption: t(
        `Scenario A: ${SHARE_A} apples each, ${SURPLUS_A} left → T = ${SHARE_A}n + ${SURPLUS_A}`,
        `Skenario A: ${SHARE_A} apel per orang, sisa ${SURPLUS_A} → T = ${SHARE_A}n + ${SURPLUS_A}`,
      ),
    },

    // Beat 2: second equation
    {
      phase: 'eq2',
      showAnswer: false,
      hold: 2000,
      result: false,
      expr: `T = ${SHARE_B}n − ${DEFICIT_B}`,
      caption: t(
        `Scenario B: ${SHARE_B} apples each, short by ${DEFICIT_B} → T = ${SHARE_B}n − ${DEFICIT_B}`,
        `Skenario B: ${SHARE_B} apel per orang, kurang ${DEFICIT_B} → T = ${SHARE_B}n − ${DEFICIT_B}`,
      ),
    },

    // Beat 3: set equal
    {
      phase: 'set-equal',
      showAnswer: false,
      hold: 2000,
      result: false,
      expr: `${SHARE_A}n + ${SURPLUS_A} = ${SHARE_B}n − ${DEFICIT_B}`,
      caption: t(
        `Both equal T, so set them equal: ${SHARE_A}n + ${SURPLUS_A} = ${SHARE_B}n − ${DEFICIT_B}`,
        `Keduanya sama dengan T, samakan: ${SHARE_A}n + ${SURPLUS_A} = ${SHARE_B}n − ${DEFICIT_B}`,
      ),
    },

    // Beat 4: solve n
    {
      phase: 'solve-n',
      showAnswer: false,
      hold: 2200,
      result: false,
      expr: `${SURPLUS_A + DEFICIT_B} = ${SHARE_B - SHARE_A}n  →  n = ${FAMILY_N}`,
      caption: t(
        `${SURPLUS_A} + ${DEFICIT_B} = (${SHARE_B} − ${SHARE_A})n  →  ${SURPLUS_A + DEFICIT_B} = ${SHARE_B - SHARE_A}n  →  n = ${FAMILY_N} family members`,
        `${SURPLUS_A} + ${DEFICIT_B} = (${SHARE_B} − ${SHARE_A})n  →  ${SURPLUS_A + DEFICIT_B} = ${SHARE_B - SHARE_A}n  →  n = ${FAMILY_N} anggota keluarga`,
      ),
    },

    // Beat 5: solve T
    {
      phase: 'solve-t',
      showAnswer: false,
      hold: 2200,
      result: false,
      expr: `T = ${SHARE_A} × ${FAMILY_N} + ${SURPLUS_A} = ${TOTAL_T}`,
      caption: t(
        `T = ${SHARE_A} × ${FAMILY_N} + ${SURPLUS_A} = ${SHARE_A * FAMILY_N} + ${SURPLUS_A} = ${TOTAL_T} apples`,
        `T = ${SHARE_A} × ${FAMILY_N} + ${SURPLUS_A} = ${SHARE_A * FAMILY_N} + ${SURPLUS_A} = ${TOTAL_T} apel`,
      ),
    },

    // Beat 6: verify
    {
      phase: 'verify',
      showAnswer: false,
      hold: 2000,
      result: false,
      expr: `${SHARE_B} × ${FAMILY_N} − ${DEFICIT_B} = ${SHARE_B * FAMILY_N - DEFICIT_B} ✓`,
      caption: t(
        `Check scenario B: ${SHARE_B} × ${FAMILY_N} − ${DEFICIT_B} = ${SHARE_B * FAMILY_N} − ${DEFICIT_B} = ${TOTAL_T} ✓`,
        `Cek skenario B: ${SHARE_B} × ${FAMILY_N} − ${DEFICIT_B} = ${SHARE_B * FAMILY_N} − ${DEFICIT_B} = ${TOTAL_T} ✓`,
      ),
    },

    // Beat 7: answer
    {
      phase: 'answer',
      showAnswer: true,
      hold: 0,
      result: true,
      expr: `${TOTAL_T} apples — answer B`,
      caption: t(
        `Mr Wang bought ${TOTAL_T} apples for ${FAMILY_N} family members. Answer B.`,
        `Pak Wang membeli ${TOTAL_T} apel untuk ${FAMILY_N} anggota keluarga. Jawaban B.`,
      ),
    },
  ]

  return {
    steps,
    finalIndex: steps.length - 1,
  }
}
