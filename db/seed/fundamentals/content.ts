// Authored content for the Fundamentals course. Typed against the shared block
// schema and re-validated at load time. Phase 1 seeds Module 1 with two fully
// authored lessons (prose/tip/check only) so the end-to-end member experience —
// outline, linear unlock, lesson nav, progress — works before the interactive
// blocks (Phase 2) and the admin editor (Phase 3) exist.

import type { LessonBlocks } from '../../../api/services/fundamentals/blocks.js'

export interface SeedModule {
  slug: string
  title_en: string
  title_id: string
  summary_en: string | null
  summary_id: string | null
  sort_order: number
  status: 'draft' | 'published'
}

export interface SeedLesson {
  slug: string
  module_slug: string
  title_en: string
  title_id: string
  summary_en: string | null
  summary_id: string | null
  est_minutes: number | null
  sort_order: number
  status: 'draft' | 'published'
  blocks: LessonBlocks
}

export const MODULES: SeedModule[] = [
  {
    slug: 'memahami-soal',
    title_en: 'Understanding the Question',
    title_id: 'Memahami Soal',
    summary_en: 'Read carefully and find exactly what the question asks.',
    summary_id: 'Membaca dengan teliti dan menemukan apa yang ditanyakan.',
    sort_order: 1,
    status: 'published',
  },
  {
    slug: 'strategi-menyelesaikan',
    title_en: 'Solving Strategy',
    title_id: 'Strategi Menyelesaikan',
    summary_en: 'Break a problem into steps and make smart choices.',
    summary_id: 'Pecah soal jadi langkah dan ambil pilihan cerdas.',
    sort_order: 2,
    status: 'published',
  },
  {
    slug: 'strategi-ujian',
    title_en: 'Test Strategy',
    title_id: 'Strategi Ujian',
    summary_en: 'Scoring, penalties, time, and checking your work.',
    summary_id: 'Skor, penalti, waktu, dan memeriksa jawaban.',
    sort_order: 3,
    status: 'published',
  },
]

export const LESSONS: SeedLesson[] = [
  {
    slug: 'membaca-soal',
    module_slug: 'memahami-soal',
    title_en: 'How to read a math question',
    title_id: 'Cara membaca soal matematika',
    summary_en: 'Slow down, read twice, and find what is being asked.',
    summary_id: 'Pelan-pelan, baca dua kali, temukan yang ditanya.',
    est_minutes: 4,
    sort_order: 1,
    status: 'published',
    blocks: [
      {
        id: 'b1',
        type: 'prose',
        title_en: 'Read it twice',
        title_id: 'Baca dua kali',
        body_en:
          'A math question is a tiny story with a question at the end. Read the whole story once to understand it. Then read it again, slowly, like a detective looking for clues.\nGood solvers never rush the reading — they rush nothing.',
        body_id:
          'Soal matematika itu cerita pendek dengan pertanyaan di akhir. Baca seluruh cerita sekali untuk memahaminya. Lalu baca lagi pelan-pelan, seperti detektif yang mencari petunjuk.\nPemecah soal yang hebat tidak pernah terburu-buru membaca.',
      },
      {
        id: 'b2',
        type: 'tip',
        variant: 'tip',
        title_en: 'Underline the question word',
        title_id: 'Garis bawahi kata tanya',
        body_en:
          'Find the word that asks for the answer: "how many", "what is", "find". Underline it. That is the target you are aiming at.',
        body_id:
          'Cari kata yang menanyakan jawaban: "berapa", "berapakah", "tentukan". Garis bawahi. Itulah sasaran yang kamu tuju.',
      },
      {
        id: 'b3',
        type: 'prose',
        title_en: 'List the facts',
        title_id: 'Tulis fakta yang diketahui',
        body_en:
          'Before calculating, jot down every number and what it means, with its unit. "5 apples", "3 boxes", "10 minutes". Numbers without meaning lead to wrong answers.',
        body_id:
          'Sebelum menghitung, catat setiap angka dan artinya, lengkap dengan satuannya. "5 apel", "3 kotak", "10 menit". Angka tanpa arti membuat jawaban salah.',
      },
      {
        id: 'b4',
        type: 'check',
        prompt_en:
          'Mom has 12 cookies. She gives 5 to Adi. The question asks: "How many cookies are left?" What are you looking for?',
        prompt_id:
          'Ibu punya 12 kue. Ia memberi 5 kue ke Adi. Soal bertanya: "Berapa kue yang tersisa?" Apa yang kamu cari?',
        choices_en: ['How many cookies Adi got', 'How many cookies are left', 'How many cookies Mom baked'],
        choices_id: ['Berapa kue yang Adi dapat', 'Berapa kue yang tersisa', 'Berapa kue yang Ibu buat'],
        answer_index: 1,
        explain_en: 'The question word is "left", so we want what remains: 12 − 5 = 7.',
        explain_id: 'Kata tanyanya "tersisa", jadi kita cari sisanya: 12 − 5 = 7.',
      },
      {
        id: 'b5',
        type: 'tip',
        variant: 'warning',
        title_en: "Don't calculate too early",
        title_id: 'Jangan buru-buru menghitung',
        body_en:
          'If you start adding numbers before you know what is asked, you might solve the wrong problem. First know the target, then calculate.',
        body_id:
          'Kalau kamu menjumlahkan angka sebelum tahu yang ditanya, kamu bisa menyelesaikan soal yang salah. Tahu sasarannya dulu, baru menghitung.',
      },
    ],
  },
  {
    slug: 'kata-kunci-soal',
    module_slug: 'memahami-soal',
    title_en: 'Spotting keyword clues',
    title_id: 'Menemukan kata kunci',
    summary_en: 'Words like "total" or "left" hint at the operation.',
    summary_id: 'Kata seperti "jumlah" atau "sisa" memberi petunjuk operasi.',
    est_minutes: 4,
    sort_order: 2,
    status: 'published',
    blocks: [
      {
        id: 'b1',
        type: 'prose',
        title_en: 'Words point to operations',
        title_id: 'Kata menunjuk ke operasi',
        body_en:
          'Some words are signposts. They hint whether to add, subtract, multiply, or divide. Learning them makes a story problem much easier to plan.',
        body_id:
          'Beberapa kata adalah rambu penunjuk. Mereka memberi petunjuk apakah harus menambah, mengurang, mengali, atau membagi. Menghafalnya membuat soal cerita lebih mudah direncanakan.',
      },
      {
        id: 'b2',
        type: 'prose',
        title_en: 'A small dictionary of clues',
        title_id: 'Kamus kecil kata kunci',
        body_en:
          'Add (+): total, altogether, in all, sum.\nSubtract (−): left, fewer, how many more, difference.\nMultiply (×): each ... times, groups of, double.\nDivide (÷): shared equally, split into, each gets.',
        body_id:
          'Tambah (+): jumlah, total, seluruhnya, semuanya.\nKurang (−): sisa, lebih sedikit, berapa lebih banyak, selisih.\nKali (×): setiap ... kali, kelompok berisi, dua kali lipat.\nBagi (÷): dibagi rata, dipisah menjadi, masing-masing dapat.',
      },
      {
        id: 'b3',
        type: 'tip',
        variant: 'warning',
        title_en: 'A keyword can trick you',
        title_id: 'Kata kunci bisa menjebak',
        body_en:
          'Keywords are clues, not rules. "John has 3 more than Sara" can mean add OR subtract depending on who you are finding. Always read the whole sentence.',
        body_id:
          'Kata kunci itu petunjuk, bukan aturan pasti. "Budi punya 3 lebih banyak dari Sara" bisa berarti tambah ATAU kurang tergantung siapa yang dicari. Selalu baca seluruh kalimat.',
      },
      {
        id: 'b4',
        type: 'check',
        prompt_en:
          'A box has 4 rows of stickers with 6 stickers in each row. Which operation finds the total number of stickers?',
        prompt_id:
          'Sebuah kotak berisi 4 baris stiker dengan 6 stiker di setiap baris. Operasi mana yang mencari jumlah seluruh stiker?',
        choices_en: ['Add: 4 + 6', 'Multiply: 4 × 6', 'Subtract: 6 − 4'],
        choices_id: ['Tambah: 4 + 6', 'Kali: 4 × 6', 'Kurang: 6 − 4'],
        answer_index: 1,
        explain_en: '"Each row ... 6" means equal groups, so multiply: 4 × 6 = 24.',
        explain_id: '"Setiap baris ... 6" berarti kelompok sama besar, jadi kalikan: 4 × 6 = 24.',
      },
    ],
  },
]
