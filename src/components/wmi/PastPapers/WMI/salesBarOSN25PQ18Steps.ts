// OSN 2025 SD Provinsi Q18 — storyboard for the fashion-sales bar-chart explainer.
// Source: docs/reference/ocr-res/osn/provinsi/sd/2025.imgs/009.jpg
// Weekly totals: Kaos=82, Kemeja=44, Gamis=53, Celana=87, Kerudung=94.
// Answer: total weekly revenue = Rp 24.310.000.

export const PRODUCT_DATA = [
  { key: 'kaos'     as const, label_id: 'Kaos',     label_en: 'T-shirt', value: 82,  price: 60_000 },
  { key: 'kemeja'   as const, label_id: 'Kemeja',   label_en: 'Shirt',   value: 44,  price: 60_000 },
  { key: 'gamis'    as const, label_id: 'Gamis',    label_en: 'Robe',    value: 53,  price: 120_000 },
  { key: 'celana'   as const, label_id: 'Celana',   label_en: 'Trouser', value: 87,  price: 60_000 },
  { key: 'kerudung' as const, label_id: 'Kerudung', label_en: 'Hijab',   value: 94,  price: 55_000 },
] as const

export type FocusKey = (typeof PRODUCT_DATA)[number]['key'] | null

export interface SalesBarStep {
  focus: FocusKey
  caption: string
  hold: number
  result: boolean
}

export const ANSWER_ID = 'Rp 24.310.000'
export const ANSWER_EN = 'Rp 24,310,000'

export function buildSalesBarOSN25PQ18Steps(lang: 'en' | 'id'): SalesBarStep[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  return [
    {
      focus: null,
      hold: 2200,
      result: false,
      caption: t(
        'A bar chart shows weekly sales totals for 5 fashion products. Read each bar.',
        'Diagram batang menunjukkan total penjualan seminggu untuk 5 jenis produk. Baca setiap batang.',
      ),
    },
    {
      focus: 'kerudung',
      hold: 2400,
      result: false,
      caption: t(
        'Hijab (Kerudung): 94 units sold. Revenue = Rp 5,170,000 → price = 5,170,000 ÷ 94 = Rp 55,000 per unit.',
        'Kerudung: 94 buah terjual. Pendapatan = Rp 5.170.000 → harga = 5.170.000 ÷ 94 = Rp 55.000 per buah.',
      ),
    },
    {
      focus: 'kaos',
      hold: 2400,
      result: false,
      caption: t(
        'T-shirt price = 55,000 + 5,000 = Rp 60,000. Shirt and trouser prices are also Rp 60,000 each.',
        'Harga kaos = 55.000 + 5.000 = Rp 60.000. Harga kemeja dan celana juga Rp 60.000.',
      ),
    },
    {
      focus: 'gamis',
      hold: 2200,
      result: false,
      caption: t(
        'Robe (Gamis) price = 2 × 60,000 = Rp 120,000.',
        'Harga gamis = 2 × 60.000 = Rp 120.000.',
      ),
    },
    {
      focus: null,
      hold: 3000,
      result: false,
      caption: t(
        'Revenue: (82+44+87)×60,000 + 53×120,000 + 5,170,000 = 12,780,000 + 6,360,000 + 5,170,000',
        'Pendapatan: (82+44+87)×60.000 + 53×120.000 + 5.170.000 = 12.780.000 + 6.360.000 + 5.170.000',
      ),
    },
    {
      focus: null,
      hold: 0,
      result: true,
      caption: t(
        'Total weekly revenue = Rp 24,310,000.',
        'Total pendapatan seminggu = Rp 24.310.000.',
      ),
    },
  ]
}
