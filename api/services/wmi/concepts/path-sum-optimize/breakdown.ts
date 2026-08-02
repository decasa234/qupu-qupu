import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import {
  askClause,
  divergence,
  enumerateRoutes,
  moveClause,
  routeDirections,
  solve,
  type Params,
} from './index.js'

// Authored decomposition of a best-total path question. One idea carries both
// asks: the grid is small enough to walk but far too big to walk exhaustively,
// so the child has to stop asking "which route?" and start asking "from this
// square, what is still reachable?" — a question the finish answers for free.
//
// Every phrase below is assembled from the very same sentences `render` builds
// the body from, so each `phrase_*` is an exact substring of the DISPLAY body
// (the body after `stripSectionLabels` drops the "Find:" / "Cari:" markers).
// Nothing here spans that marker, and no two phrases overlap.
export function buildPathSumOptimizeBreakdown(params: Params): Breakdown {
  const { rows, cols, moves, ask } = params
  const s = solve(params)
  const gap = divergence(params, s)
  const routeCount = enumerateRoutes(params).length
  const superlative_en = ask === 'max' ? 'largest' : 'smallest'
  const superlative_id = ask === 'max' ? 'terbesar' : 'terkecil'
  // How the tempting-but-wrong method describes the square it grabs.
  const look_en = ask === 'max' ? 'biggest' : 'smallest'
  const look_id = ask === 'max' ? 'paling besar' : 'paling kecil'
  const dirWord = (dir: 'right' | 'down'): string => (dir === 'right' ? 'kanan' : 'bawah')

  const highlights: BreakdownHighlight[] = [
    {
      category: 'object',
      phrase_en: `the ${rows}-by-${cols} grid`,
      phrase_id: `kisi ${rows} kali ${cols}`,
      note_en: `Find it in the picture first: ${rows} rows down and ${cols} columns across, ${rows * cols} squares in all.`,
      note_id: `Temukan dulu di gambar: ${rows} baris ke bawah dan ${cols} kolom ke samping, seluruhnya ${rows * cols} kotak.`,
    },
    {
      category: 'fact',
      phrase_en: 'a number from 1 to 9',
      phrase_id: 'satu bilangan dari 1 sampai 9',
      note_en: 'Every square is worth something, and never nothing — so stepping on an extra square always makes the total bigger.',
      note_id: 'Setiap kotak ada isinya, tidak pernah nol — jadi menginjak satu kotak tambahan selalu menambah jumlah.',
    },
    {
      category: 'condition',
      phrase_en: moveClause(moves, 'en'),
      phrase_id: moveClause(moves, 'id'),
      note_en:
        moves === 'left-right-down'
          ? 'Left is allowed here, but it only walks the robot away from the finish and adds squares — for the smallest total it never pays.'
          : 'The robot can never go back up or back left, so a square is only ever reached from above or from the left.',
      note_id:
        moves === 'left-right-down'
          ? 'Ke kiri memang boleh, tapi itu hanya menjauhkan robot dari kotak akhir dan menambah kotak — untuk jumlah terkecil tidak pernah menguntungkan.'
          : 'Robot tidak pernah bisa kembali ke atas atau ke kiri, jadi sebuah kotak hanya bisa didatangi dari atas atau dari kiri.',
    },
    {
      category: 'condition',
      phrase_en: 'never step on the same square twice',
      phrase_id: 'tidak boleh menginjak kotak yang sama dua kali',
      note_en: 'Without this rule the robot could shuffle sideways forever, and there would be no best total at all.',
      note_id: 'Tanpa aturan ini robot bisa mondar-mandir ke samping selamanya, dan jumlah terbaik tidak akan pernah ada.',
    },
    {
      category: 'fact',
      phrase_en: 'counting the start square and the finish square',
      phrase_id: 'termasuk kotak awal dan kotak akhir',
      note_en: 'Both corner squares are part of the total — it is easy to forget the one you are standing on at the start.',
      note_id: 'Kedua kotak pojok ikut dijumlahkan — kotak tempat robot mulai berdiri sering terlupa.',
    },
    {
      category: 'question',
      phrase_en: askClause(ask, 'en'),
      phrase_id: askClause(ask, 'id'),
      note_en: `There are ${routeCount} legal routes here, so trying them one by one is hopeless. Ask each square what the ${superlative_en} total from it is instead.`,
      note_id: `Ada ${routeCount} jalur yang boleh ditempuh, jadi mencobanya satu per satu percuma. Lebih baik tanyakan pada setiap kotak berapa jumlah ${superlative_id} dari kotak itu.`,
    },
  ]

  const finish = s.table[rows - 1][cols - 1]
  const secondLast = s.table[rows - 1][cols - 2]

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Grid', label_id: 'Kisi', value: `${rows} × ${cols}` },
    {
      label_en: 'Start and finish',
      label_id: 'Kotak awal dan akhir',
      value: `${params.grid[0][0]} → ${params.grid[rows - 1][cols - 1]}`,
    },
    {
      label_en: 'Steps allowed',
      label_id: 'Langkah yang boleh',
      value:
        moves === 'left-right-down' ? 'kiri, kanan, bawah' : 'kanan, bawah',
    },
    { label_en: 'Legal routes', label_id: 'Banyak jalur', value: String(routeCount) },
    {
      label_en: 'Squares on a route',
      label_id: 'Kotak yang diinjak',
      value: String(s.route.length),
    },
    {
      label_en: 'First two table squares',
      label_id: 'Dua kotak tabel pertama',
      value: `${finish.best}, ${secondLast.best}`,
    },
    {
      label_en: 'Winning route',
      label_id: 'Jalur pemenang',
      value: routeDirections(s.route, 'id').join(' → '),
    },
    { label_en: 'Answer', label_id: 'Jawaban', value: s.answer },
  ]

  return {
    // The numbers only exist as a picture; the stem states the rule, the figure
    // carries the grid — exactly how the WMI papers this concept is mined from
    // present it.
    needsVisual: true,
    highlights,
    quantities,
    strategy: {
      conceptSlug: 'path-sum-optimize',
      name_en: 'Write the best reachable total on every square, working back from the finish',
      name_id: 'Tulis jumlah terbaik di setiap kotak, mulai dari kotak akhir',
    },
    // The one wrong method every child reaches for: step onto whichever
    // neighbour looks better right now. It is stated as the number that method
    // actually produces, and refuted at the exact square where it goes wrong.
    trap:
      gap === null
        ? null
        : {
            wrong: String(s.greedy.total),
            why_en: `${s.greedy.total} is what you get by always stepping onto the ${look_en}-looking next square. That breaks at row ${gap.at.r + 1}, column ${gap.at.c + 1}: going ${gap.greedyDir} onto ${gap.greedyValue} looks better than going ${gap.bestDir} onto ${gap.bestValue}, ${
              ask === 'max'
                ? `but the best total from ${gap.greedyDir} is only ${gap.greedyRest}, while from ${gap.bestDir} it is ${gap.bestRest}`
                : `but the best total from ${gap.greedyDir} still costs ${gap.greedyRest}, while from ${gap.bestDir} it is only ${gap.bestRest}`
            }. Judge a step by what comes after it, not by the one square in front of you: ${s.answer}.`,
            why_id: `${s.greedy.total} muncul kalau kamu selalu melangkah ke kotak berikutnya yang kelihatan ${look_id}. Cara itu patah di baris ke-${gap.at.r + 1} kolom ke-${gap.at.c + 1}: melangkah ke ${dirWord(gap.greedyDir)} menuju ${gap.greedyValue} terlihat lebih bagus daripada ke ${dirWord(gap.bestDir)} menuju ${gap.bestValue}, ${
              ask === 'max'
                ? `padahal jumlah terbaik dari ${dirWord(gap.greedyDir)} hanya ${gap.greedyRest}, sedangkan dari ${dirWord(gap.bestDir)} ${gap.bestRest}`
                : `padahal jumlah terbaik dari ${dirWord(gap.greedyDir)} masih ${gap.greedyRest}, sedangkan dari ${dirWord(gap.bestDir)} hanya ${gap.bestRest}`
            }. Nilai sebuah langkah dari apa yang datang sesudahnya, bukan dari satu kotak di depan mata: ${s.answer}.`,
          },
    answer: {
      form: 'number',
      unit: null,
      value: s.answer,
    },
    vocab: [],
  }
}
