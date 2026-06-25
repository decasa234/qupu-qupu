import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const STUDENT_GRID_ANSWER = '45'

export interface StudentGridStep {
  /** Which rows to visually emphasise: 'front' | 'back' | 'james' | 'col-left' | 'col-right' | 'all' | undefined */
  phase: 'intro' | 'rows' | 'cols' | 'multiply' | 'done'
  caption: string
  hold: number
  result: boolean
}

export interface StudentGridStoryboard {
  answer: string
  steps: StudentGridStep[]
  finalIndex: number
}

/**
 * SEAMO-20-A-Q17 — Rectangular grid formation.
 *
 * James counts:
 *   - 3 students in front + James + 1 student behind = 5 rows
 *   - 5 students to his left + James + 3 students to his right = 9 columns
 *   - Total = 5 × 9 = 45 students.
 */
export function buildStudentGrid20A17Steps(lang: Lang): StudentGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StudentGridStep[] = [
    // 1) Introduce the formation concept
    {
      phase: 'intro',
      hold: 2400,
      result: false,
      caption: t(
        'Students stand in a rectangular grid. James (J) is highlighted in amber. Count the rows first.',
        'Siswa berdiri dalam formasi kotak-kotak persegi panjang. James (J) ditandai warna kuning. Hitung barisnya dulu.',
      ),
    },
    // 2) Count the rows
    {
      phase: 'rows',
      hold: 2600,
      result: false,
      caption: t(
        '3 students IN FRONT + James + 1 student BEHIND = 5 rows total.',
        '3 siswa DI DEPAN + James + 1 siswa DI BELAKANG = 5 baris total.',
      ),
    },
    // 3) Count the columns
    {
      phase: 'cols',
      hold: 2600,
      result: false,
      caption: t(
        '5 students to the LEFT + James + 3 students to the RIGHT = 9 columns total.',
        '5 siswa di KIRI + James + 3 siswa di KANAN = 9 kolom total.',
      ),
    },
    // 4) Multiply
    {
      phase: 'multiply',
      hold: 2400,
      result: false,
      caption: t(
        '5 rows × 9 columns = ?',
        '5 baris × 9 kolom = ?',
      ),
    },
    // 5) Final answer
    {
      phase: 'done',
      hold: 0,
      result: true,
      caption: t(
        `5 × 9 = ${STUDENT_GRID_ANSWER} students in the hall.`,
        `5 × 9 = ${STUDENT_GRID_ANSWER} siswa di aula.`,
      ),
    },
  ]

  return {
    answer: STUDENT_GRID_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
