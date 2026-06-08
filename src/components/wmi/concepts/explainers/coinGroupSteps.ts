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
  /** Show the addition of the subtotals (the coins' total). */
  showSum: boolean
  /** Show the complement step: 100 − total = needed. */
  showDollar: boolean
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
  /** One dollar in cents — the target to complete. */
  target: number
  /** Cents still needed to reach the target (the answer). */
  needed: number
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
  const target = 100
  const needed = target - total
  const subs = groups.map((g) => g.subtotal)
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CoinStep[] = [
    // 1. Look at the coins, decide to group equal values.
    {
      grouped: false, showSubtotals: false, showSum: false, showDollar: false,
      caption: t('group coins of the same value', 'kelompokkan koin yang senilai'),
      hold: 1800, result: false,
    },
    // 2. Cluster + skip-count each group (count × value).
    {
      grouped: true, showSubtotals: true, showSum: false, showDollar: false,
      caption: t('count each group: how many × value', 'hitung tiap kelompok: berapa × nilai'),
      hold: 2300, result: false,
    },
    // 3. Add the group subtotals to get the coins' total.
    {
      grouped: true, showSubtotals: true, showSum: true, showDollar: false,
      caption: t(`You have ${subs.join(' + ')} = ${total}¢.`, `Kamu punya ${subs.join(' + ')} = ${total} sen.`),
      hold: 2200, result: false,
    },
    // 4. Complete the dollar: 100 − total.
    {
      grouped: true, showSubtotals: true, showSum: true, showDollar: true,
      caption: t(`Make a dollar: 100 − ${total} = ${needed}¢.`, `Lengkapi satu dolar: 100 − ${total} = ${needed} sen.`),
      hold: 0, result: true,
    },
  ]
  return { coins, groups, total, target, needed, steps, finalIndex: steps.length - 1 }
}
