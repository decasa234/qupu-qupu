// Beat steps for SEAMO-19-B-Q5 — wallet / mixed banknotes problem.
// Strategy: assume all $2 → find surplus → count swaps.
// Quantities come from the seed breakdown.quantities (anti-drift).

export type Wallet19B5Phase = 'setup' | 'allTwo' | 'extra' | 'swap' | 'check' | 'answer'

export interface Wallet19B5Step {
  phase: Wallet19B5Phase
  showAnswer: boolean
  highlight: 'fives' | 'twos' | null
  caption: string
  hold: number
  result: boolean
}

type Lang = 'en' | 'id'

export function buildWallet19B5Steps(lang: Lang): Wallet19B5Step[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  return [
    {
      phase: 'setup',
      showAnswer: false,
      highlight: null,
      hold: 1800,
      result: false,
      caption: t(
        'Sam has 63 notes — a mix of $2 and $5 — totalling $171. We need the number of $5 notes.',
        'Sam punya 63 lembar campuran $2 dan $5 seharga $171. Kita cari berapa lembar $5.',
      ),
    },
    {
      phase: 'allTwo',
      showAnswer: false,
      highlight: 'twos',
      hold: 2000,
      result: false,
      caption: t(
        'Suppose ALL 63 notes were $2: 63 × $2 = $126.',
        'Anggap SEMUA 63 lembar adalah $2: 63 × $2 = $126.',
      ),
    },
    {
      phase: 'extra',
      showAnswer: false,
      highlight: 'fives',
      hold: 2000,
      result: false,
      caption: t(
        'But the total is $171, so there is $171 − $126 = $45 extra.',
        'Namun total sebenarnya $171, jadi ada selisih $171 − $126 = $45.',
      ),
    },
    {
      phase: 'swap',
      showAnswer: false,
      highlight: 'fives',
      hold: 2000,
      result: false,
      caption: t(
        'Each time we swap a $2 note for a $5 note, the total rises by $3. So we need $45 ÷ $3 = 15 swaps.',
        'Setiap kita ganti satu $2 dengan $5, total naik $3. Jadi butuh $45 ÷ $3 = 15 penggantian.',
      ),
    },
    {
      phase: 'check',
      showAnswer: true,
      highlight: 'fives',
      hold: 2000,
      result: false,
      caption: t(
        'Check: 15 × $5 + 48 × $2 = $75 + $96 = $171 ✓  (and 15 + 48 = 63 ✓)',
        'Cek: 15 × $5 + 48 × $2 = $75 + $96 = $171 ✓  (dan 15 + 48 = 63 ✓)',
      ),
    },
    {
      phase: 'answer',
      showAnswer: true,
      highlight: 'fives',
      hold: 0,
      result: true,
      caption: t(
        'Sam has 15 five-dollar notes — answer A.',
        'Sam punya 15 lembar uang $5 — jawaban A.',
      ),
    },
  ]
}
