import type { Lang } from './makeTenSteps'

const ANIMAL_MAP: Record<string, { en: string; id: string; legs: number }> = {
  cat: { en: 'cats', id: 'kucing', legs: 4 },
  dog: { en: 'dogs', id: 'anjing', legs: 4 },
  cow: { en: 'cows', id: 'sapi', legs: 4 },
  chicken: { en: 'chickens', id: 'ayam', legs: 2 },
  duck: { en: 'ducks', id: 'bebek', legs: 2 },
  spider: { en: 'spiders', id: 'laba-laba', legs: 8 },
  ant: { en: 'ants', id: 'semut', legs: 6 },
}

export interface LegsRow {
  en: string
  id: string
  count: number
  legs: number
  subtotal: number
}

export interface LegsStep {
  /** Number of rows that have been revealed (0 = none, 1 = first, …, 3 = all). */
  revealed: number
  result: boolean
  caption: string
}

export interface LegsStoryboard {
  rows: LegsRow[]
  total: number
  steps: LegsStep[]
  finalIndex: number
}

export function buildLegsSteps(kinds: string[], counts: number[], lang: Lang): LegsStoryboard {
  const rows: LegsRow[] = kinds.map((kind, i) => {
    const animal = ANIMAL_MAP[kind] ?? { en: kind, id: kind, legs: 0 }
    const count = counts[i] ?? 0
    return {
      en: animal.en,
      id: animal.id,
      legs: animal.legs,
      count,
      subtotal: count * animal.legs,
    }
  })

  const total = rows.reduce((s, r) => s + r.subtotal, 0)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const legsWord = t('legs', 'kaki')

  const steps: LegsStep[] = [
    // beat 0 — intro, nothing revealed yet
    {
      revealed: 0,
      result: false,
      caption: t(
        `Multiply each animal's count by its legs, then add.`,
        `Kalikan jumlah tiap hewan dengan kakinya, lalu jumlahkan.`,
      ),
    },
    // beats 1–3 — reveal each animal row one at a time
    ...rows.map((row, i) => ({
      revealed: i + 1,
      result: false,
      caption: t(
        `${row.count} ${row.en} × ${row.legs} legs = ${row.subtotal}`,
        `${row.count} ${row.id} × ${row.legs} kaki = ${row.subtotal}`,
      ),
    })),
    // beat 4 — result (all 3 revealed, stay at revealed=3)
    {
      revealed: 3,
      result: true,
      caption: t(
        `Total: ${rows[0].subtotal} + ${rows[1].subtotal} + ${rows[2].subtotal} = ${total} ${legsWord}.`,
        `Total: ${rows[0].subtotal} + ${rows[1].subtotal} + ${rows[2].subtotal} = ${total} ${legsWord}.`,
      ),
    },
  ]

  return { rows, total, steps, finalIndex: steps.length - 1 }
}
