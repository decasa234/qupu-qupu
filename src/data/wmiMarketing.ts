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
    caption: 'Anak belajar menghitung kembalian langkah demi langkah, bukan menghafal.',
  },
  {
    slug: 'dice-net-fold',
    label: 'Lipat Dadu',
    params: {
      // Same four nets as the /wmi hook question (net A is the valid one), so
      // the demo folds exactly the net the visitor was just asked about.
      nets: [
        [[0, 1], [1, 1], [2, 1], [3, 1], [2, 0], [0, 2]],
        [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
        [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]],
        [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]],
      ],
      validIndex: 0,
    },
    correctAnswer: 'A',
    caption: 'Anak membayangkan jaring-jaring terlipat menjadi kubus, melatih nalar ruang.',
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

// ---- /wmi challenge hook (the "smarter than a 2nd grader?" question) ----
// A real WMI dice-net concept: which 6-square net folds into a closed cube?
// Net A is the only valid one. Cells are [col, row]; the thumbnail renderer
// normalizes the bounding box. This is the same concept the demo slide animates.
export type NetCell = [number, number]

export interface NetOption {
  label: 'A' | 'B' | 'C' | 'D'
  cells: NetCell[]
}

export const HOOK_QUESTION = {
  eyebrow: 'Latihan WMI · Tantangan',
  title: 'Lebih pintar dari anak Kelas 2?',
  prompt: 'Empat jaring dari 6 persegi. Mana yang bisa dilipat menjadi kubus tertutup?',
  options: [
    { label: 'A', cells: [[0, 1], [1, 1], [2, 1], [3, 1], [2, 0], [0, 2]] },
    { label: 'B', cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]] },
    { label: 'C', cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]] },
    { label: 'D', cells: [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]] },
  ] as NetOption[],
  answer: 'A' as const,
  // Index of dice-net-fold inside DEMO_CONCEPTS, so the demo opens on this concept.
  demoIndex: 1,
}

// ---- concept mastery tree (illustrative; public page shows the journey, not real data) ----
// Branches mirror the real 9-domain taxonomy (DOMAIN_BY_SLUG) collapsed to 6.
export interface MasteryBranch {
  name: string
  icon: string
  skill: string
  progress: number // illustrative 0-100
}

export const MASTERY_BRANCHES: MasteryBranch[] = [
  { name: 'Bilangan & Operasi', icon: 'fa-solid fa-calculator', skill: 'Hitung cepat dan akurat', progress: 82 },
  { name: 'Pemahaman Bilangan', icon: 'fa-solid fa-hashtag', skill: 'Nilai tempat dan pecahan', progress: 64 },
  { name: 'Soal Cerita & Uang', icon: 'fa-solid fa-comments', skill: 'Masalah sehari-hari', progress: 53 },
  { name: 'Pola & Logika', icon: 'fa-solid fa-sitemap', skill: 'Pola dan teka-teki', progress: 71 },
  { name: 'Geometri & Ruang', icon: 'fa-solid fa-cube', skill: 'Bentuk, luas, dan ruang', progress: 46 },
  { name: 'Data & Pengukuran', icon: 'fa-solid fa-chart-bar', skill: 'Jam, satuan, dan data', progress: 38 },
]

// A short slice of the real level ladder (level_tiers), for the tree spine.
export const MASTERY_TIERS = ['Pemula', 'Penjelajah', 'Jago Muda', 'Bintang Belajar', 'Master Cilik']

// ---- product-highlight tour (carousel slide 1) — real explainer features ----
export interface TourFeature {
  icon: string
  title: string
  desc: string
}

export const TOUR_FEATURES: TourFeature[] = [
  { icon: 'fa-solid fa-film', title: 'Animasi langkah', desc: 'Solusi soal diputar selangkah demi selangkah, anak melihat caranya terbentuk.' },
  { icon: 'fa-solid fa-highlighter', title: 'Sorotan terbantu', desc: 'Bagian penting soal disorot otomatis agar anak fokus pada inti masalah.' },
  { icon: 'fa-solid fa-list-ol', title: 'Hint bertahap', desc: 'Petunjuk muncul satu per satu saat anak butuh, tanpa langsung membocorkan jawaban.' },
  { icon: 'fa-solid fa-circle-play', title: 'Putar & ulang', desc: 'Tombol putar, jeda, dan ulang, plus titik langkah untuk melompat ke bagian mana pun.' },
  { icon: 'fa-solid fa-language', title: 'Dwibahasa', desc: 'Penjelasan tersedia dalam Bahasa Indonesia dan Inggris.' },
]
