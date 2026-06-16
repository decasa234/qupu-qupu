import type { Lang } from '../concepts/explainers/makeTenSteps'
import { REGIONS, toneOf, type RegionTone } from './P22G1Q11Illustration'

// WMI-22P1A-Q11 (2022 Semifinal Grade 1): colour each of the 9 regions by its
// value — DARK if > 8, GREY if < 8, WHITE if = 8 — then pick the option whose
// colouring matches. The original options were pictures, so the seed key is the
// option LETTER (C). Method, one idea per beat:
//   1. state the rule;
//   2. reveal the DARK regions (values > 8): 11+5=16, 5+7=12;
//   3. reveal the GREY regions (values < 8): 12-6, 4+3, 8-1, 14-7;
//   4. reveal the WHITE regions (values = 8): 6+2, 16-8, 8;
//   result: the whole figure is coloured — that is option C.

export type HousePhase = 'rule' | 'dark' | 'grey' | 'white' | 'result'

export interface HouseStep {
  phase: HousePhase
  /** Region ids coloured (cumulative) by the end of this beat. */
  revealed: string[]
  /** Tone being applied this beat (for the chip), or null on intro/result. */
  tone: RegionTone | null
  caption: string
  hold: number
  result: boolean
}

export interface HouseStoryboard {
  /** Region ids grouped by tone (derived from REGIONS). */
  byTone: Record<RegionTone, { id: string; expr: string; value: number }[]>
  answerLetter: string
  steps: HouseStep[]
  finalIndex: number
}

export function buildP22G1Q11Steps(lang: Lang, answerLetter: string): HouseStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const byTone: Record<RegionTone, { id: string; expr: string; value: number }[]> = {
    dark: [],
    grey: [],
    white: [],
  }
  for (const r of REGIONS) byTone[toneOf(r.value)].push({ id: r.id, expr: r.expr, value: r.value })

  const exprs = (tone: RegionTone) => byTone[tone].map((r) => `${r.expr.replace(/\s/g, '')}`).join(', ')

  const darkIds = byTone.dark.map((r) => r.id)
  const greyIds = byTone.grey.map((r) => r.id)
  const whiteIds = byTone.white.map((r) => r.id)
  const allIds = [...darkIds, ...greyIds, ...whiteIds]

  const steps: HouseStep[] = [
    {
      phase: 'rule',
      revealed: [],
      tone: null,
      hold: 2100,
      result: false,
      caption: t(
        'Rule: dark if > 8, grey if < 8, white if = 8.',
        'Aturan: gelap jika > 8, abu-abu jika < 8, putih jika = 8.',
      ),
    },
    {
      phase: 'dark',
      revealed: [...darkIds],
      tone: 'dark',
      hold: 2200,
      result: false,
      caption: t(
        `Greater than 8 → DARK: ${exprs('dark')}.`,
        `Lebih dari 8 → GELAP: ${exprs('dark')}.`,
      ),
    },
    {
      phase: 'grey',
      revealed: [...darkIds, ...greyIds],
      tone: 'grey',
      hold: 2200,
      result: false,
      caption: t(
        `Less than 8 → GREY: ${exprs('grey')}.`,
        `Kurang dari 8 → ABU-ABU: ${exprs('grey')}.`,
      ),
    },
    {
      phase: 'white',
      revealed: [...allIds],
      tone: 'white',
      hold: 2200,
      result: false,
      caption: t(
        `Equals 8 → WHITE: ${exprs('white')}.`,
        `Sama dengan 8 → PUTIH: ${exprs('white')}.`,
      ),
    },
    {
      phase: 'result',
      revealed: [...allIds],
      tone: null,
      hold: 0,
      result: true,
      caption: t(
        `This colouring is option ${answerLetter}.`,
        `Pewarnaan ini adalah pilihan ${answerLetter}.`,
      ),
    },
  ]

  return { byTone, answerLetter, steps, finalIndex: steps.length - 1 }
}
