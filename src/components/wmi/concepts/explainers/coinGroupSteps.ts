export type Lang = 'en' | 'id'

export interface CoinGroup {
  value: number
  count: number
  subtotal: number
}

export interface CoinStep {
  /** Coins are clustered by denomination. */
  grouped: boolean
  /** Show "count × value = subtotal" under each group. */
  showSubtotals: boolean
  /** Show the final addition of the subtotals. */
  showSum: boolean
  caption: string
  /** How long to hold this beat on screen, in ms (0 = final beat, holds). */
  hold: number
  result: boolean
}

export interface CoinStoryboard {
  coins: number[]
  /** Denominations present, descending by value. */
  groups: CoinGroup[]
  total: number
  steps: CoinStep[]
  /** Index of the last step (always steps.length − 1; the result beat). */
  finalIndex: number
}

export function buildCoinGroupSteps(coinsRaw: number[], lang: Lang): CoinStoryboard {
  // Defensive: tolerate stale/garbage params (see compareSteps).
  const coins = Array.isArray(coinsRaw)
    ? coinsRaw.filter((v) => typeof v === 'number' && Number.isFinite(v))
    : []
  const byValue = new Map<number, number>()
  for (const v of coins) byValue.set(v, (byValue.get(v) ?? 0) + 1)
  const groups: CoinGroup[] = [...byValue.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([value, count]) => ({ value, count, subtotal: value * count }))
  const total = coins.reduce((s, v) => s + v, 0)
  const subs = groups.map((g) => g.subtotal)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CoinStep[] = [
    // 1. Look at the coins, decide to group equal values.
    {
      grouped: false, showSubtotals: false, showSum: false,
      caption: t('group coins of the same value', 'kelompokkan koin yang senilai'),
      hold: 1800, result: false,
    },
    // 2. Cluster + skip-count each group (count × value).
    {
      grouped: true, showSubtotals: true, showSum: false,
      caption: t('count each group: how many × value', 'hitung tiap kelompok: berapa × nilai'),
      hold: 2300, result: false,
    },
    // 3. Add the group subtotals.
    {
      grouped: true, showSubtotals: true, showSum: true,
      caption: `${subs.join(' + ')} = ${total}`,
      hold: 0, result: true,
    },
  ]
  return { coins, groups, total, steps, finalIndex: steps.length - 1 }
}
