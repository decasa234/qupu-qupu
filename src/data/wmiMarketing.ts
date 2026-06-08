// Editable marketing content for the public "Latihan WMI" surface.
// Pure presentational data — no network, no secrets.

export interface DemoConcept {
  slug: string
  label: string // Indonesian tab label
  params: unknown // schema-valid instance for the explainer
  correctAnswer: string // required by WmiExplainer; some explainers ignore it
  caption: string // one-line Indonesian caption under the demo
}

export const DEMO_CONCEPTS: DemoConcept[] = [
  {
    slug: 'money-shopping-change',
    label: 'Belanja & Kembalian',
    params: { cost: 30, pay: 50, name: 'Budi', item_en: 'book', item_id: 'buku' },
    correctAnswer: '20',
    caption: 'Anak belajar menghitung kembalian langkah demi langkah — bukan menghafal.',
  },
  {
    slug: 'dice-net-fold',
    label: 'Lipat Dadu',
    params: {
      nets: [
        [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [2, 2]],
        [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
        [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]],
        [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
      ],
      validIndex: 0,
    },
    correctAnswer: 'A',
    caption: 'Anak membayangkan jaring-jaring terlipat menjadi kubus — melatih nalar ruang.',
  },
]

export const FREE_TIER = {
  name: 'Mulai Gratis',
  price: 'Rp 0',
  note: 'Selamanya untuk fitur inti',
  features: [
    'Semua video edukatif QUPU',
    'Latihan WMI: konsep, drill & ujian',
    'XP, badge & progres anak',
    'Untuk anak Kelas 1–3',
  ],
  cta: 'Daftar Gratis',
}

// Future tiers/features — teased only, not sold in V1. Rename freely.
export const COMING_SOON: string[] = [
  'Laporan kemajuan mendalam',
  'Kelas untuk guru & sekolah',
  'Bimbingan personal',
]

export interface FounderInfo {
  name: string
  role: string
  story: string
  photoUrl?: string
}

// PLACEHOLDER — replace with the real founder/educator story before launch.
export const FOUNDER: FounderInfo = {
  name: '[Nama Pendiri]',
  role: '[Pendidik & Pendiri QUPU]',
  story:
    'PLACEHOLDER: ceritakan kenapa QUPU dibuat, latar belakang pendidik, dan kenapa konsep ' +
    'olimpiade WMI penting untuk anak. Ganti teks ini sebelum peluncuran.',
}

export interface Testimonial {
  quote: string
  author: string
  role: string
}

// Ships EMPTY in V1 — WmiTestimonials renders nothing until real quotes exist.
export const TESTIMONIALS: Testimonial[] = []
