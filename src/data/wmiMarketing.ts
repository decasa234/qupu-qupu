import type { Breakdown } from '@/types/wmi'

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
  {
    slug: 'count-rectangles-grid',
    label: 'Hitung Persegi',
    params: { cols: 3, rows: 3 },
    correctAnswer: '14',
    caption: 'Anak menghitung persegi dari semua ukuran, yang kecil sampai yang besar.',
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

// SAMPLE testimonials — believable placeholders. TODO: replace with real,
// consented parent/teacher quotes before launch.
export const TESTIMONIALS: Testimonial[] = [
  { quote: 'Anakku jadi nggak takut soal cerita. Dia malah minta soal yang lebih susah.', author: 'Rina', role: 'Ibu dari Kayla, Kelas 2' },
  { quote: 'Penjelasan langkah demi langkahnya bikin dia "oh, gitu!" sendiri, bukan dihafal.', author: 'Andre', role: 'Ayah dari Bima, Kelas 3' },
  { quote: 'Fitur sorotan dan dwibahasanya membantu di kelas saya. Anak fokus ke inti soal.', author: 'Sari', role: 'Guru SD' },
  { quote: 'Tiap hari dia ngumpulin XP. Belajar matematika jadi seperti main game.', author: 'Maya', role: 'Ibu dari Rafa, Kelas 1' },
  { quote: 'Soal olimpiade yang dulu bikin pusing, sekarang dia kerjakan sambil senyum.', author: 'Dewi', role: 'Ibu dari Nadia, Kelas 3' },
  { quote: 'Yang saya suka, dia belajar cara berpikir, bukan cuma jawaban.', author: 'Hendra', role: 'Ayah dari Alya, Kelas 2' },
]

// ---- real assisted-highlight question (the count-squares concept), for the
// "Features tour" — shown via the real WmiAuthoredBreakdown + WmiLanguageToggle.
const COUNT_SQUARES_BREAKDOWN: Breakdown = {
  needsVisual: true,
  highlights: [
    { category: 'question', phrase_en: 'How many squares', phrase_id: 'Ada berapa persegi', note_en: 'Find the total number of squares in the grid.', note_id: 'Cari jumlah seluruh persegi dalam kisi.' },
    { category: 'condition', phrase_en: 'of any size', phrase_id: 'dari semua ukuran', note_en: 'Count small 1×1 squares and bigger squares made of several cells.', note_id: 'Hitung persegi kecil 1×1 dan persegi besar dari beberapa sel.' },
    { category: 'fact', phrase_en: '3 columns and 3 rows', phrase_id: '3 kolom dan 3 baris', note_en: 'The grid is 3 by 3, so it has 9 small cells.', note_id: 'Kisi 3 kali 3, jadi ada 9 sel kecil.' },
  ],
  quantities: [
    { label_en: 'Columns', label_id: 'Kolom', value: '3' },
    { label_en: 'Rows', label_id: 'Baris', value: '3' },
    { label_en: 'Answer', label_id: 'Jawaban', value: '14' },
  ],
  strategy: { conceptSlug: 'count-rectangles-grid', name_en: 'Count squares by size, then add', name_id: 'Hitung persegi per ukuran, lalu jumlahkan' },
  trap: { wrong: '9', why_en: '9 counts only the 1×1 cells and misses the bigger squares; the total is 14.', why_id: '9 hanya menghitung sel 1×1 dan melewatkan persegi besar; totalnya 14.' },
  answer: { form: 'number', unit: null, value: '14' },
  vocab: ['square', 'grid'],
}

export const COUNT_SQUARES_QUESTION = {
  code: 'count-rectangles-grid',
  grid: { cols: 3, rows: 3 },
  bodyEn: 'The grid below has 3 columns and 3 rows.\n\nFind: How many squares of any size are in the grid?',
  bodyId: 'Kisi di bawah memiliki 3 kolom dan 3 baris.\n\nCari: Ada berapa persegi dari semua ukuran dalam kisi tersebut?',
  breakdown: COUNT_SQUARES_BREAKDOWN,
  hintStepsEn: [
    '1×1 squares: 3 × 3 = 9.',
    '2×2 squares: 2 × 2 = 4.',
    '3×3 squares: 1 × 1 = 1.',
    'Total squares: 9 + 4 + 1 = 14.',
  ],
  hintStepsId: [
    'Persegi 1×1: 3 × 3 = 9.',
    'Persegi 2×2: 2 × 2 = 4.',
    'Persegi 3×3: 1 × 1 = 1.',
    'Total persegi: 9 + 4 + 1 = 14.',
  ],
}

// ---- /wmi challenge hook (the "smarter than a 2nd grader?" question) ----
// A real WMI count-squares concept: how many squares of ALL sizes fit in a 3x3
// grid? Parents say 9 (the unit cells); the answer is 9 + 4 + 1 = 14. The demo
// slide animates this exact concept, highlighting squares size by size.
export const HOOK_QUESTION = {
  eyebrow: 'Latihan WMI · Tantangan',
  title: 'Lebih pintar dari anak Kelas 2?',
  prompt: 'Pada kisi 3×3 di bawah, ada berapa persegi dari semua ukuran?',
  grid: { rows: 3, cols: 3 },
  options: ['9', '13', '14', '16'],
  answer: '14',
  // Shown after answering, to make the trap click.
  reveal: '9 ukuran 1×1, 4 ukuran 2×2, 1 ukuran 3×3 = 14',
  // Index of count-rectangles-grid inside DEMO_CONCEPTS, so the demo opens on it.
  demoIndex: 2,
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
