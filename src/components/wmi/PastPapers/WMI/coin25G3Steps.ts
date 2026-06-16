import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { COIN_OPTIONS25G3, type CoinView } from './Coin25G3Illustration'

// WMI-25F3A-Q13 — post-answer storyboard for the spinning-coins problem.
//
// A coin spinning about its vertical diameter only ever shows its face UPRIGHT
// or LEFT-RIGHT MIRRORED (plus the thin in-between edge views). It can NEVER
// show the picture turned upside-down. So an option is reachable iff EACH of its
// two pictures is in {up, mirror}. The single option that puts a picture
// upside-down ('flip') is the one the spin can't make → the answer.
//
// The storyboard states that rule, then walks A,B,C,E (all reachable, accept),
// rejecting the one with a 'flip' last, landing on D.

export type CoinPhase = 'intro' | 'rule' | 'accept' | 'reject' | 'result'
export type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E'

export interface CoinStep {
  phase: CoinPhase
  /** Which option chip this beat is testing (null on intro/rule). */
  option: OptionKey | null
  /** The two oriented coins for the option being shown (mirrors the chip). */
  view: CoinView | null
  /** True once an upside-down ('flip') picture has been spotted on this beat. */
  flipSpotted: boolean
  caption: string
  hold: number
  result: boolean
}

export interface CoinStoryboard {
  answer: OptionKey
  steps: CoinStep[]
  finalIndex: number
}

// Does this option only use spin-reachable orientations (up / mirror)?
function isReachable(v: CoinView): boolean {
  const ok = (f: CoinView['sea']) => f === 'up' || f === 'mirror'
  return ok(v.sea) && ok(v.crab)
}

// Human label for a single picture's orientation, used in the per-beat caption.
function flipWord(f: CoinView['sea'], lang: Lang): string {
  if (f === 'up') return lang === 'id' ? 'tegak' : 'upright'
  if (f === 'mirror') return lang === 'id' ? 'cermin kiri-kanan' : 'left-right mirror'
  return lang === 'id' ? 'TERBALIK' : 'UPSIDE-DOWN'
}

export function buildCoin25G3Steps(answer: OptionKey, lang: Lang): CoinStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CoinStep[] = [
    {
      phase: 'intro',
      option: null,
      view: null,
      flipSpotted: false,
      hold: 2600,
      result: false,
      caption: t(
        'Both coins are spinning. Which picture could you NEVER catch a glimpse of?',
        'Kedua koin berputar. Gambar mana yang TAK PERNAH bisa terlihat?',
      ),
    },
    {
      phase: 'rule',
      option: null,
      view: null,
      flipSpotted: false,
      hold: 3000,
      result: false,
      caption: t(
        'A spinning coin only ever shows its face UPRIGHT or as a left-right MIRROR — never upside-down.',
        'Koin yang berputar hanya menampilkan wajahnya TEGAK atau sebagai CERMIN kiri-kanan — tak pernah terbalik.',
      ),
    },
  ]

  // Walk the options in order, keeping the answer (the only 'flip') for last so
  // the accept run plays first and the rejection of D lands the conclusion.
  const order: OptionKey[] = (['A', 'B', 'C', 'D', 'E'] as OptionKey[]).filter((k) => k !== answer)
  order.push(answer)

  for (const k of order) {
    const v = COIN_OPTIONS25G3[k]
    const reachable = isReachable(v)
    const seaWord = flipWord(v.sea, lang)
    const crabWord = flipWord(v.crab, lang)
    if (reachable) {
      steps.push({
        phase: 'accept',
        option: k,
        view: v,
        flipSpotted: false,
        hold: 2000,
        result: false,
        caption: t(
          `${k}: seahorse ${seaWord}, crab ${crabWord} — both happen in a spin ✓`,
          `${k}: kuda laut ${seaWord}, kepiting ${crabWord} — keduanya muncul saat berputar ✓`,
        ),
      })
    } else {
      // The unreachable option: name the upside-down picture as the culprit.
      const culprit = v.crab === 'flip' ? t('crab', 'kepiting') : t('seahorse', 'kuda laut')
      steps.push({
        phase: 'reject',
        option: k,
        view: v,
        flipSpotted: true,
        hold: 2200,
        result: false,
        caption: t(
          `${k}: the ${culprit} is UPSIDE-DOWN — a spin can't flip a picture over ✗`,
          `${k}: ${culprit} TERBALIK — putaran tak bisa membalik gambar ✗`,
        ),
      })
    }
  }

  steps.push({
    phase: 'result',
    option: answer,
    view: COIN_OPTIONS25G3[answer],
    flipSpotted: true,
    hold: 0,
    result: true,
    caption: t(
      `Only ${answer} needs an upside-down picture, so ${answer} can never happen → ${answer}.`,
      `Hanya ${answer} yang butuh gambar terbalik, jadi ${answer} tak akan pernah terjadi → ${answer}.`,
    ),
  })

  return { answer, steps, finalIndex: steps.length - 1 }
}
