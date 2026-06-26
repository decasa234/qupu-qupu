// SASMO-19-G2-Q6 — storyboard for the snowflake-matching explainer.
//
// Question: Which snowflake is the same as the one on the right? Answer: C.
//
// Teaching walk — compare feature by feature:
//   0. intro   — show the reference snowflake; name its key features.
//   1. checkA  — Option A: 6-fold arms (wrong count) → eliminate A.
//   2. checkB  — Option B: 8-fold but missing between-arm diamonds → eliminate B.
//   3. checkD  — Option D: 6-fold barbell arms, different centre → eliminate D.
//   4. answer  — Option C matches every detail → answer C.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type SnowflakePhase = 'intro' | 'checkA' | 'checkB' | 'checkD' | 'answer'

export interface SnowflakeBeat {
  phase: SnowflakePhase
  /** Which choice label is being examined (null on intro). */
  activeChoice: 'A' | 'B' | 'C' | 'D' | null
  /** True when this choice is eliminated. */
  eliminated: boolean
  /** True only on the final answer beat. */
  isAnswer: boolean
  /** Caption text for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual). */
  hold: number
  /** True only on result beat. */
  result: boolean
}

export interface SnowflakeStoryboard {
  steps: SnowflakeBeat[]
  finalIndex: number
}

export function buildSnowflakeSASMO19G2Q6Steps(lang: Lang): SnowflakeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SnowflakeBeat[] = [
    {
      phase: 'intro',
      activeChoice: null,
      eliminated: false,
      isAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        'Study the reference snowflake carefully. It has 8 arms, each with two side branches, two fork spikes at the tip, and small diamonds between the arms.',
        'Perhatikan kepingan salju referensi dengan saksama. Ia memiliki 8 lengan, masing-masing dengan dua cabang samping, dua paku garpu di ujung, dan berlian kecil di antara lengan.',
      ),
    },
    {
      phase: 'checkA',
      activeChoice: 'A',
      eliminated: true,
      isAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Option A has only 6 arms and smooth, wide blades — no fork tips and no between-arm diamonds. It does NOT match. Cross out A.',
        'Pilihan A hanya memiliki 6 lengan dengan bilah lebar halus — tanpa garpu di ujung dan tanpa berlian antara lengan. TIDAK cocok. Coret A.',
      ),
    },
    {
      phase: 'checkB',
      activeChoice: 'B',
      eliminated: true,
      isAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Option B has 8 arms and fork tips like the reference, but the side branches are shorter and the between-arm diamonds are missing. It does NOT match. Cross out B.',
        'Pilihan B memiliki 8 lengan dan garpu di ujung seperti referensi, tetapi cabang sampingnya lebih pendek dan berlian antara lengan tidak ada. TIDAK cocok. Coret B.',
      ),
    },
    {
      phase: 'checkD',
      activeChoice: 'D',
      eliminated: true,
      isAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Option D has only 6 arms with rectangular barbell arms and a plain ringed centre — clearly different. Cross out D.',
        'Pilihan D hanya memiliki 6 lengan dengan lengan barbel persegi panjang dan pusat cincin polos — jelas berbeda. Coret D.',
      ),
    },
    {
      phase: 'answer',
      activeChoice: 'C',
      eliminated: false,
      isAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        'Option C has exactly 8 arms, the same side branches, fork tips, between-arm diamonds, and centre hub as the reference. Option C is the answer!',
        'Pilihan C memiliki tepat 8 lengan, cabang samping, garpu di ujung, berlian antara lengan, dan pusat yang sama dengan referensi. Pilihan C adalah jawabannya!',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
