import type { Lang } from '../../concepts/explainers/makeTenSteps'

/** Thursdays in October (found by ±7 hops from the anchor Thu 22). */
export const THURSDAYS = [1, 8, 15, 22, 29]
/** Mondays in October (found by ±7 hops from the anchor Mon 26). */
export const MONDAYS = [5, 12, 19, 26]
export const ANSWER = THURSDAYS.length + MONDAYS.length

export interface BalletCalStep {
  /** Show the Sat 24 → Fri 23 → Thu 22 walk-back row. */
  showThuWalk: boolean
  /** Show the Thursday ±7 chain (1 → 8 → 15 → 22 → 29, with the 36 stop box). */
  showThuChain: boolean
  /** Show the "5" count badge next to the Thursday chain. */
  showThuCount: boolean
  /** Show the Sat 24 → Sun 25 → Mon 26 walk-forward row. */
  showMonWalk: boolean
  /** Show the Monday ±7 chain (5 → 12 → 19 → 26, with the 33 stop box). */
  showMonChain: boolean
  /** Show the "4" count badge next to the Monday chain. */
  showMonCount: boolean
  /** Final sum badge text below the chains, or null. */
  badge: string | null
  caption: string
  hold: number
  result: boolean
}

export interface BalletCalStoryboard {
  thursdayCount: number
  mondayCount: number
  answer: number
  steps: BalletCalStep[]
  finalIndex: number
}

export function buildBalletCalendar20Steps(lang: Lang): BalletCalStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BalletCalStep[] = [
    {
      showThuWalk: false,
      showThuChain: false,
      showThuCount: false,
      showMonWalk: false,
      showMonChain: false,
      showMonCount: false,
      badge: null,
      hold: 1800,
      result: false,
      caption: t(
        'Same weekday repeats every 7 days — no calendar needed! We just need one anchor date per day. Today is Saturday 24.',
        'Hari yang sama berulang setiap 7 hari — tidak perlu kalender! Kita cuma butuh satu tanggal patokan per hari. Hari ini Sabtu 24.',
      ),
    },
    {
      showThuWalk: true,
      showThuChain: false,
      showThuCount: false,
      showMonWalk: false,
      showMonChain: false,
      showMonCount: false,
      badge: null,
      hold: 2000,
      result: false,
      caption: t(
        'Walk back 2 days: Sat 24 → Fri 23 → Thu 22. Thursday’s anchor is 22!',
        'Mundur 2 hari: Sab 24 → Jum 23 → Kam 22. Patokan hari Kamis adalah 22!',
      ),
    },
    {
      showThuWalk: true,
      showThuChain: true,
      showThuCount: true,
      showMonWalk: false,
      showMonChain: false,
      showMonCount: false,
      badge: null,
      hold: 2400,
      result: false,
      caption: t(
        'Hop by 7s: 22−7=15, 15−7=8, 8−7=1 — don’t miss October 1! Up: 22+7=29, but 29+7=36 is past 31. Five Thursdays: 1, 8, 15, 22, 29.',
        'Loncat 7: 22−7=15, 15−7=8, 8−7=1 — jangan lewatkan 1 Oktober! Naik: 22+7=29, tapi 29+7=36 lewat dari 31. Lima hari Kamis: 1, 8, 15, 22, 29.',
      ),
    },
    {
      showThuWalk: true,
      showThuChain: true,
      showThuCount: true,
      showMonWalk: true,
      showMonChain: true,
      showMonCount: true,
      badge: null,
      hold: 2400,
      result: false,
      caption: t(
        'Walk forward 2 days: Sat 24 → Sun 25 → Mon 26. Hop by 7s: 19, 12, 5 (5−7 goes below 1), and 26+7=33 is too big. Four Mondays: 5, 12, 19, 26.',
        'Maju 2 hari: Sab 24 → Min 25 → Sen 26. Loncat 7: 19, 12, 5 (5−7 sudah minus), dan 26+7=33 terlalu besar. Empat hari Senin: 5, 12, 19, 26.',
      ),
    },
    {
      showThuWalk: true,
      showThuChain: true,
      showThuCount: true,
      showMonWalk: true,
      showMonChain: true,
      showMonCount: true,
      badge: `${THURSDAYS.length} + ${MONDAYS.length} = ${ANSWER}`,
      hold: 0,
      result: true,
      caption: t(
        `${THURSDAYS.length} Thursdays + ${MONDAYS.length} Mondays = ${ANSWER} classes — answer B!`,
        `${THURSDAYS.length} Kamis + ${MONDAYS.length} Senin = ${ANSWER} kelas — jawaban B!`,
      ),
    },
  ]

  return {
    thursdayCount: THURSDAYS.length,
    mondayCount: MONDAYS.length,
    answer: ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
