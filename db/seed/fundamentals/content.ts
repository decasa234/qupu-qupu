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
  {
    slug: 'kosakata-matematika',
    module_slug: 'memahami-soal',
    title_en: 'Math words you must know',
    title_id: 'Kosakata matematika wajib',
    summary_en: 'Learn the key words so a question never confuses you.',
    summary_id: 'Kenali kata kunci agar soal tak pernah membingungkan.',
    est_minutes: 3,
    sort_order: 3,
    status: 'published',
    blocks: [
      {
        id: 'b1',
        type: 'prose',
        body_en:
          'Math has its own special words. If you know what each word means, a hard-looking question becomes simple. Tap each card to remember it.',
        body_id:
          'Matematika punya kata-kata khusus. Kalau kamu tahu arti tiap kata, soal yang terlihat sulit jadi mudah. Ingat-ingat tiap kartu di bawah.',
      },
      {
        id: 'b2',
        type: 'glossary',
        term_slugs: ['sum', 'digit', 'perimeter'],
        intro_en: 'Three words that show up again and again:',
        intro_id: 'Tiga kata yang sering muncul:',
      },
      {
        id: 'b3',
        type: 'check',
        prompt_en: 'Which word means the distance all the way around a shape?',
        prompt_id: 'Kata mana yang berarti jarak mengelilingi sebuah bangun?',
        choices_en: ['Sum', 'Perimeter', 'Digit'],
        choices_id: ['Jumlah', 'Keliling', 'Angka'],
        answer_index: 1,
        explain_en: 'Perimeter is the total length around the outside of a shape.',
        explain_id: 'Keliling adalah panjang total di sekeliling tepi bangun.',
      },
    ],
  },
  {
    slug: 'bongkar-soal',
    module_slug: 'strategi-menyelesaikan',
    title_en: 'Breaking a problem down',
    title_id: 'Membongkar soal jadi langkah',
    summary_en: 'Understand, plan, solve, check — one step at a time.',
    summary_id: 'Pahami, rencanakan, kerjakan, periksa — selangkah demi selangkah.',
    est_minutes: 5,
    sort_order: 1,
    status: 'published',
    blocks: [
      {
        id: 'b1',
        type: 'prose',
        title_en: 'The four-step plan',
        title_id: 'Rencana empat langkah',
        body_en:
          'Champions never solve a whole problem in one jump. They use four steps:\n1. Understand — what is asked?\n2. Plan — which operation or drawing helps?\n3. Solve — do the steps carefully.\n4. Check — does the answer make sense?',
        body_id:
          'Juara tidak menyelesaikan soal dalam satu lompatan. Mereka pakai empat langkah:\n1. Pahami — apa yang ditanya?\n2. Rencanakan — operasi atau gambar apa yang membantu?\n3. Kerjakan — lakukan langkahnya dengan teliti.\n4. Periksa — apakah jawabannya masuk akal?',
      },
      {
        id: 'b2',
        type: 'worked',
        source: 'paper',
        code: 'WMI-20F1A-Q1',
        caption_en: 'Watch the same four steps solve a real contest question:',
        caption_id: 'Lihat empat langkah yang sama menyelesaikan soal lomba sungguhan:',
      },
      {
        id: 'b3',
        type: 'tip',
        variant: 'tip',
        title_en: 'Write the steps down',
        title_id: 'Tulis langkahnya',
        body_en:
          'Writing each step on paper keeps your brain free to think. It also makes a careless mistake easy to spot.',
        body_id:
          'Menuliskan tiap langkah membuat otakmu bebas berpikir. Kesalahan kecil pun jadi mudah ditemukan.',
      },
      {
        id: 'b4',
        type: 'check',
        prompt_en: 'Which step comes FIRST when you meet a new problem?',
        prompt_id: 'Langkah mana yang dilakukan PERTAMA saat bertemu soal baru?',
        choices_en: ['Solve it quickly', 'Understand what is asked', 'Check the answer'],
        choices_id: ['Langsung kerjakan cepat', 'Pahami yang ditanya', 'Periksa jawaban'],
        answer_index: 1,
        explain_en: 'Always understand the question before doing any calculation.',
        explain_id: 'Selalu pahami soal sebelum menghitung apa pun.',
      },
    ],
  },
  {
    slug: 'tebak-cerdas',
    module_slug: 'strategi-menyelesaikan',
    title_en: 'Smart guessing & elimination',
    title_id: 'Menebak cerdas & eliminasi',
    summary_en: 'When you are unsure, cross out what cannot be true.',
    summary_id: 'Saat ragu, coret yang tidak mungkin benar.',
    est_minutes: 4,
    sort_order: 2,
    status: 'published',
    blocks: [
      {
        id: 'b1',
        type: 'prose',
        title_en: 'Eliminate, then choose',
        title_id: 'Eliminasi, lalu pilih',
        body_en:
          'On a multiple-choice question you do not always need to fully solve it. Cross out answers that are clearly too big, too small, or the wrong kind of number. A guess from two choices is far better than from five.',
        body_id:
          'Pada soal pilihan ganda kamu tak selalu harus menyelesaikannya penuh. Coret jawaban yang jelas terlalu besar, terlalu kecil, atau jenis angka yang salah. Menebak dari dua pilihan jauh lebih baik daripada dari lima.',
      },
      {
        id: 'b2',
        type: 'tip',
        variant: 'tip',
        title_en: 'Use estimation',
        title_id: 'Pakai taksiran',
        body_en:
          'Quickly estimate the answer. If a choice is nowhere near your estimate, cross it out — even before exact calculation.',
        body_id:
          'Taksir jawabannya dengan cepat. Kalau sebuah pilihan jauh dari taksiranmu, coret saja — bahkan sebelum menghitung tepat.',
      },
      {
        id: 'b3',
        type: 'check',
        prompt_en:
          'Adding two 2-digit numbers, your answer must be about 80. Which choice can you cross out first?',
        prompt_id:
          'Menjumlah dua bilangan 2 angka, jawabanmu kira-kira 80. Pilihan mana yang lebih dulu kamu coret?',
        choices_en: ['78', '81', '790'],
        choices_id: ['78', '81', '790'],
        answer_index: 2,
        explain_en: '790 is way too big for two 2-digit numbers — eliminate it instantly.',
        explain_id: '790 jauh terlalu besar untuk dua bilangan 2 angka — langsung coret.',
      },
    ],
  },
  {
    slug: 'skor-penalti',
    module_slug: 'strategi-ujian',
    title_en: 'Scoring & penalties',
    title_id: 'Skor & penalti',
    summary_en: 'Know how points work — some contests punish wrong answers.',
    summary_id: 'Pahami cara poin bekerja — sebagian lomba menghukum jawaban salah.',
    est_minutes: 5,
    sort_order: 1,
    status: 'published',
    blocks: [
      {
        id: 'b1',
        type: 'prose',
        body_en:
          'Every contest counts points differently. Some give more points for harder sections. Some take points away for a wrong answer. Knowing the rules BEFORE the test changes how you should play.',
        body_id:
          'Setiap lomba menghitung poin secara berbeda. Ada yang memberi poin lebih besar untuk bagian sulit. Ada yang mengurangi poin untuk jawaban salah. Mengetahui aturan SEBELUM ujian mengubah caramu bermain.',
      },
      {
        id: 'b2',
        type: 'scoring',
        intro_en: 'Compare two contests. Change the numbers and watch your score:',
        intro_id: 'Bandingkan dua lomba. Ubah angkanya dan lihat skormu:',
      },
      {
        id: 'b3',
        type: 'tip',
        variant: 'warning',
        title_en: 'Check the penalty rule first',
        title_id: 'Periksa aturan penalti dulu',
        body_en:
          'If wrong answers lose points, never wild-guess — only answer when you can eliminate options. If there is no penalty, answer every single question.',
        body_id:
          'Jika jawaban salah mengurangi poin, jangan menebak asal — jawab hanya bila bisa menghapus pilihan. Jika tidak ada penalti, jawab setiap soal.',
      },
    ],
  },
  {
    slug: 'waktu-periksa',
    module_slug: 'strategi-ujian',
    title_en: 'Time & checking',
    title_id: 'Waktu & memeriksa',
    summary_en: 'Spend time wisely and leave room to double-check.',
    summary_id: 'Gunakan waktu dengan bijak dan sisakan waktu memeriksa.',
    est_minutes: 4,
    sort_order: 2,
    status: 'published',
    blocks: [
      {
        id: 'b1',
        type: 'prose',
        title_en: 'Easy questions first',
        title_id: 'Soal mudah dulu',
        body_en:
          'Do the questions you find easy first to collect sure points. Mark a hard one and come back later — never let one tricky question eat all your time.',
        body_id:
          'Kerjakan soal yang kamu rasa mudah dulu untuk mengumpulkan poin pasti. Tandai soal sulit dan kembali nanti — jangan biarkan satu soal sulit memakan semua waktumu.',
      },
      {
        id: 'b2',
        type: 'tip',
        variant: 'tip',
        title_en: 'Save time to check',
        title_id: 'Sisakan waktu memeriksa',
        body_en:
          'Keep the last few minutes to re-read your answers. Most lost points come from careless slips, not hard math.',
        body_id:
          'Sisakan beberapa menit terakhir untuk membaca ulang jawabanmu. Sebagian besar poin hilang karena keteledoran, bukan matematika sulit.',
      },
      {
        id: 'b3',
        type: 'check',
        prompt_en: 'You are stuck on question 4 with many questions left. What is the smart move?',
        prompt_id: 'Kamu macet di soal 4 padahal banyak soal tersisa. Apa langkah cerdasnya?',
        choices_en: ['Keep trying until you solve it', 'Skip it and come back later', 'Give up on the test'],
        choices_id: ['Terus coba sampai bisa', 'Lewati dan kembali nanti', 'Menyerah pada ujian'],
        answer_index: 1,
        explain_en: 'Collect the points you can first, then return to the hard one with leftover time.',
        explain_id: 'Kumpulkan dulu poin yang bisa diraih, lalu kembali ke soal sulit dengan sisa waktu.',
      },
    ],
  },
]
