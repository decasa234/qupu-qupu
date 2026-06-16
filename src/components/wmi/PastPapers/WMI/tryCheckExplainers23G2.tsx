import { makeTryCheckExplainer } from './tryCheckExplainers'
import type { Lang } from '../../concepts/explainers/makeTenSteps'

// WMI-23F2A (2023 Grade 2 Final) — deduction-chain explainers for the
// non-figure questions. Every answer is derived on screen.
// Q15 (colour-blindness rows) is intentionally NOT here: as transcribed, no
// pair of rows matches under the stated R=G / B=Y merge, so the keyed answer
// cannot be honestly derived — it awaits a re-transcription of the figure.

const tt = (lang: Lang) => (en: string, id: string) => (lang === 'id' ? id : en)

/** Q19 — fill 5,6,7,8 into a rising grid; how many ways. */
export const GridFill23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The blanks form the right column (rising to 9) and the bottom row (rising to 9). Each pair must increase.', 'Kotak kosong membentuk kolom kanan (naik ke 9) dan baris bawah (naik ke 9). Tiap pasangan harus naik.'),
    items: [
      { text: t('Choose which 2 of 5, 6, 7, 8 go in the right column — their order is then forced (smaller on top)', 'Pilih 2 dari 5, 6, 7, 8 untuk kolom kanan — urutannya lalu pasti (kecil di atas)'), ok: null },
      { text: t('The other 2 fill the bottom row, also in forced order', 'Dua sisanya mengisi baris bawah, juga dalam urutan pasti'), ok: null },
      { text: t('So just count the ways to choose 2 of 4: C(4,2) = 6', 'Jadi tinggal hitung cara memilih 2 dari 4: C(4,2) = 6'), ok: true },
    ],
    final: t('There are 6 ways to fill the grid.', 'Ada 6 cara mengisi kisi.'),
    aria: t('Choosing two of the four numbers for the column fixes everything, giving six ways.', 'Memilih dua dari empat bilangan untuk kolom menetapkan segalanya, memberi enam cara.'),
  }
})

/** Q1 — 398 + 597 by rounding up; what to subtract. */
export const RoundSubtract23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Round each number up, then take back exactly the extra you added.', 'Bulatkan tiap bilangan ke atas, lalu kembalikan tepat kelebihan yang ditambahkan.'),
    items: [
      { text: t('400 is 2 more than 398', '400 lebih 2 dari 398'), ok: null },
      { text: t('600 is 3 more than 597', '600 lebih 3 dari 597'), ok: null },
      { text: t('So 400 + 600 is too big by 2 + 3', 'Jadi 400 + 600 kelebihan sebesar 2 + 3'), ok: true },
    ],
    final: t('Subtract 2 + 3 to get the right answer (C).', 'Kurangi 2 + 3 untuk jawaban yang benar (C).'),
    aria: t('Rounding adds 2 and 3, so subtract 2 plus 3.', 'Pembulatan menambah 2 dan 3, jadi kurangi 2 tambah 3.'),
  }
})

/** Q3 — 42 + ( ) is a multiple of 9. */
export const MultipleNine23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The extra candies must make 42 share evenly among 9 — a multiple of 9. Test each choice.', 'Tambahan permen harus membuat 42 terbagi rata untuk 9 — kelipatan 9. Coba tiap pilihan.'),
    items: [
      { text: t('42 + 17 = 59 — not a multiple of 9', '42 + 17 = 59 — bukan kelipatan 9'), ok: false },
      { text: t('42 + 4 = 46 — not a multiple of 9', '42 + 4 = 46 — bukan kelipatan 9'), ok: false },
      { text: '42 + 30 = 72 = 9 × 8', ok: true },
    ],
    final: t('Adding 30 makes 72, which 9 shares evenly (D).', 'Menambah 30 memberi 72, yang dibagi rata oleh 9 (D).'),
    aria: t('Only adding 30 reaches 72, a multiple of nine.', 'Hanya menambah 30 mencapai 72, kelipatan sembilan.'),
  }
})

/** Q6 — 72 apples into baskets of 5; extra beyond the 9. */
export const ApplesBaskets23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Total the apples, pack them into 5s (round up), then subtract the 9 baskets you already have.', 'Totalkan apel, kemas dalam 5-an (bulatkan ke atas), lalu kurangi 9 keranjang yang sudah ada.'),
    items: [
      { text: t('All apples: 9 × 8 = 72', 'Semua apel: 9 × 8 = 72'), ok: null },
      { text: t('Baskets of 5: 72 ÷ 5 = 14 remainder 2 → need 15', 'Keranjang isi 5: 72 ÷ 5 = 14 sisa 2 → perlu 15'), ok: null },
      { text: t('Already have 9: 15 − 9 = 6 more', 'Sudah ada 9: 15 − 9 = 6 lagi'), ok: true },
    ],
    final: t('6 more baskets are needed (D).', 'Diperlukan 6 keranjang lagi (D).'),
    aria: t('Seventy-two apples need fifteen small baskets, six beyond the nine.', 'Tujuh puluh dua apel butuh lima belas keranjang kecil, enam lebih dari sembilan.'),
  }
})

/** Q7 — Pokémon: least Kathy needs, worst case. */
export const PokemonWin23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Plan for the worst case: assume every Pokémon Kathy misses goes to the leader, Mary.', 'Rencanakan kasus terburuk: anggap tiap Pokémon yang Kathy lewatkan diambil pemimpin, Mary.'),
    items: [
      { text: t('At 20 min: Kathy 8, Nancy 6, Mary 8 + 6 = 14 → 28 caught', 'Menit ke-20: Kathy 8, Nancy 6, Mary 8 + 6 = 14 → 28 tertangkap'), ok: null },
      { text: t('Still loose: 60 − 28 = 32', 'Masih tersisa: 60 − 28 = 32'), ok: null },
      { text: t('If Kathy gets x, Mary could get 32 − x. Win needs 8 + x > 14 + (32 − x)', 'Jika Kathy dapat x, Mary bisa dapat 32 − x. Menang butuh 8 + x > 14 + (32 − x)'), ok: null },
      { text: t('2x > 38 → x ≥ 20', '2x > 38 → x ≥ 20'), ok: true },
    ],
    final: t('Kathy needs at least 20 more Pokémon (C).', 'Kathy perlu setidaknya 20 Pokémon lagi (C).'),
    aria: t('Even if Mary takes the rest, Kathy needs twenty more to win.', 'Bahkan jika Mary mengambil sisanya, Kathy perlu dua puluh lagi untuk menang.'),
  }
})

/** Q8 — three identical dice summing to 10. */
export const DiceSum23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('List trios that add to 10, smallest die first so none repeats.', 'Daftar tripel yang berjumlah 10, dadu terkecil dulu agar tak berulang.'),
    items: [
      { text: '1+3+6, 1+4+5', ok: null },
      { text: '2+2+6, 2+3+5, 2+4+4', ok: null },
      { text: '3+3+4', ok: null },
      { text: t('Count: 2 + 3 + 1 = 6 ways', 'Hitung: 2 + 3 + 1 = 6 cara'), ok: true },
    ],
    final: t('There are 6 ways (C).', 'Ada 6 cara (C).'),
    aria: t('Listing trios smallest-first gives six ways to total ten.', 'Mendaftar tripel terkecil-dulu memberi enam cara berjumlah sepuluh.'),
  }
})

/** Q9 — hamburger 2+1 promo; ordinary-day total. */
export const HamburgerDeal23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Strip off the tip, use the 2-for-3 deal to find one combo’s price, then pay full for all 9.', 'Lepas tip, pakai promo 2-untuk-3 untuk harga satu paket, lalu bayar penuh untuk 9.'),
    items: [
      { text: t('Promo combos cost 153 − 15 = 138', 'Paket promo berbiaya 153 − 15 = 138'), ok: null },
      { text: t('Pay-2-get-3 for 9: they paid for 9 ÷ 3 × 2 = 6 → one combo = 138 ÷ 6 = 23', 'Bayar-2-dapat-3 untuk 9: membayar 9 ÷ 3 × 2 = 6 → satu paket = 138 ÷ 6 = 23'), ok: null },
      { text: t('Ordinary day: 9 × 23 = 207, plus the 15 tip', 'Hari biasa: 9 × 23 = 207, ditambah tip 15'), ok: null },
      { text: '207 + 15 = 222', ok: true },
    ],
    final: t('On an ordinary day they’d pay 222 (B).', 'Pada hari biasa mereka membayar 222 (B).'),
    aria: t('One combo is 23, nine combos plus tip is 222.', 'Satu paket 23, sembilan paket plus tip adalah 222.'),
  }
})

/** Q10 — max of [ ] − [ ] + [ ] with 473, 166, 201. */
export const MaxExpr23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The middle box is a minus, so put the smallest number there to lose the least.', 'Kotak tengah mengurangi, jadi taruh bilangan terkecil di sana agar paling sedikit hilang.'),
    items: [
      { text: t('Smallest is 166 → subtract it', 'Terkecil 166 → kurangi'), ok: null },
      { text: t('Add the other two: 473 + 201 = 674', 'Jumlahkan dua sisanya: 473 + 201 = 674'), ok: null },
      { text: '674 − 166 = 508', ok: true },
    ],
    final: t('The maximum result is 508 (E).', 'Hasil maksimum adalah 508 (E).'),
    aria: t('Subtracting the smallest, 166, from 674 gives 508.', 'Mengurangi yang terkecil, 166, dari 674 memberi 508.'),
  }
})

/** Q11 — interleaved odd/even tracks; where 50 first appears. */
export const InterleaveSeq23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Split the list into odd-position and even-position tracks; each grows on its own.', 'Pisahkan daftar menjadi jalur posisi ganjil dan genap; tiap jalur tumbuh sendiri.'),
    items: [
      { text: t('Odd places: 2, 8, 14, 20, 26 … add 6', 'Posisi ganjil: 2, 8, 14, 20, 26 … tambah 6'), ok: null },
      { text: t('Even places: 5, 10, 15, 20 … add 5', 'Posisi genap: 5, 10, 15, 20 … tambah 5'), ok: null },
      { text: t('50 is the 9th odd term → position 17; on the even track it is position 20', '50 adalah suku ganjil ke-9 → posisi 17; pada jalur genap posisi 20'), ok: null },
      { text: t('17 comes before 20', '17 sebelum 20'), ok: true },
    ],
    final: t('50 first appears at position 17 (D).', '50 pertama kali muncul di posisi 17 (D).'),
    aria: t('On the odd track fifty lands at position seventeen, earlier than twenty.', 'Pada jalur ganjil lima puluh jatuh di posisi tujuh belas, lebih awal dari dua puluh.'),
  }
})

/** Q13 — overlap of two exhibitions. */
export const ExhibitOverlap23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Find each show’s end date, then count the days they share.', 'Cari tanggal akhir tiap pameran, lalu hitung hari yang sama.'),
    items: [
      { text: t('A: July 15 + 28 days → ends August 11', 'A: 15 Juli + 28 hari → berakhir 11 Agustus'), ok: null },
      { text: t('B: August 1 + 21 days → ends August 21', 'B: 1 Agustus + 21 hari → berakhir 21 Agustus'), ok: null },
      { text: t('Overlap: August 1 to August 11 = 11 days', 'Tumpang tindih: 1 sampai 11 Agustus = 11 hari'), ok: true },
    ],
    final: t('The two exhibitions overlap for 11 days (A).', 'Kedua pameran tumpang tindih 11 hari (A).'),
    aria: t('Both run together from August first to eleventh, eleven days.', 'Keduanya berjalan bersama dari 1 sampai 11 Agustus, sebelas hari.'),
  }
})

/** Q14 — 3-digit numbers with hundreds=units, units even. */
export const DigitCount23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Hundreds + tens = tens + units, so the tens cancel: hundreds = units.', 'Ratusan + puluhan = puluhan + satuan, jadi puluhan saling hapus: ratusan = satuan.'),
    items: [
      { text: t('Units is even and equals the hundreds; hundreds ≠ 0 → units ∈ {2,4,6,8} (4 choices)', 'Satuan genap dan sama dengan ratusan; ratusan ≠ 0 → satuan ∈ {2,4,6,8} (4 pilihan)'), ok: null },
      { text: t('The tens digit is free: 0–9 (10 choices)', 'Angka puluhan bebas: 0–9 (10 pilihan)'), ok: null },
      { text: '4 × 10 = 40', ok: true },
    ],
    final: t('There are 40 such numbers (E).', 'Ada 40 bilangan seperti itu (E).'),
    aria: t('Four equal hundreds-units pairs times ten tens digits is forty.', 'Empat pasangan ratusan-satuan sama dikali sepuluh puluhan adalah empat puluh.'),
  }
})

/** Q16 — 2×0 + 2×3 − 2×0 + 2×4. */
export const ComputeProducts23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Do all the multiplications first, then add and subtract left to right.', 'Kerjakan semua perkalian dulu, lalu tambah dan kurang dari kiri ke kanan.'),
    items: [
      { text: '2×0 = 0, 2×3 = 6, 2×0 = 0, 2×4 = 8', ok: null },
      { text: '0 + 6 − 0 + 8', ok: null },
      { text: '= 14', ok: true },
    ],
    final: t('The result is 14.', 'Hasilnya adalah 14.'),
    aria: t('The four products are 0, 6, 0, 8, adding to 14.', 'Empat hasil kali adalah 0, 6, 0, 8, berjumlah 14.'),
  }
})

/** Q18 — A×A=B, B×C=A+D, distinct 1–9; find ABCD. */
export const CryptoABCD23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('A × A = B and B is one digit, so A is 2 (B=4) or 3 (B=9).', 'A × A = B dan B satu angka, jadi A = 2 (B=4) atau 3 (B=9).'),
    items: [
      { text: t('A=2, B=4: 4 × C = 2 + D — no distinct D works', 'A=2, B=4: 4 × C = 2 + D — tak ada D berbeda yang cocok'), ok: false },
      { text: t('A=3, B=9: 9 × C = 3 + D, try C=1 → D=6', 'A=3, B=9: 9 × C = 3 + D, coba C=1 → D=6'), ok: null },
      { text: t('Digits 3, 9, 1, 6 are all different ✓', 'Angka 3, 9, 1, 6 semua berbeda ✓'), ok: true },
    ],
    final: t('ABCD = 3916.', 'ABCD = 3916.'),
    aria: t('A is 3, B is 9, C is 1, D is 6, so ABCD is 3916.', 'A adalah 3, B 9, C 1, D 6, jadi ABCD 3916.'),
  }
})

/** Q20 — blocks (k, k+1, k+2); the 2023rd number. */
export const BlockSeq23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('The numbers come in blocks of three; block k is k, k+1, k+2.', 'Bilangan datang dalam kelompok tiga; kelompok k adalah k, k+1, k+2.'),
    items: [
      { text: t('Find the block: 2023 = 3 × 674 + 1 → the 1st spot of block 675', 'Cari kelompok: 2023 = 3 × 674 + 1 → tempat ke-1 kelompok 675'), ok: null },
      { text: t('Block 675 starts with 675', 'Kelompok 675 dimulai dengan 675'), ok: null },
      { text: t('So the 2023rd number is 675', 'Jadi bilangan ke-2023 adalah 675'), ok: true },
    ],
    final: t('The 2023rd number is 675.', 'Bilangan ke-2023 adalah 675.'),
    aria: t('Position 2023 is the start of block 675, which is 675.', 'Posisi 2023 adalah awal kelompok 675, yaitu 675.'),
  }
})

/** Q22 — challenge scores: failures cost double; find abcd. */
export const ChallengeScore23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Compare to a perfect score. Passing everything gives 50 + (1+…+9) = 95.', 'Bandingkan dengan skor sempurna. Lolos semua memberi 50 + (1+…+9) = 95.'),
    items: [
      { text: t('Each fail (instead of pass) drops you by twice its number', 'Tiap gagal (bukan lolos) menurunkan dua kali nomornya'), ok: null },
      { text: t('95 − 2S = 73 → the failed numbers add to S = 11', '95 − 2S = 73 → nomor yang gagal berjumlah S = 11'), ok: null },
      { text: t('Four different 1–9 summing to 11: only 1 + 2 + 3 + 5', 'Empat angka 1–9 berbeda berjumlah 11: hanya 1 + 2 + 3 + 5'), ok: true },
    ],
    final: t('From smallest to largest, abcd = 1235.', 'Dari terkecil ke terbesar, abcd = 1235.'),
    aria: t('The failed challenges sum to eleven, the only set being one, two, three, five.', 'Tantangan yang gagal berjumlah sebelas, satu-satunya himpunan adalah satu, dua, tiga, lima.'),
  }
})

/** Q23 — three 3-digit numbers sum 2023; the unused digit (mod-9). */
export const UnusedDigit23G2Explainer = makeTryCheckExplainer((lang) => {
  const t = tt(lang)
  return {
    intro: t('Nine digit-slots use nine of the ten digits, so exactly one is left out. The mod-9 rule finds it.', 'Sembilan tempat angka memakai sembilan dari sepuluh angka, jadi tepat satu tersisa. Aturan mod-9 menemukannya.'),
    items: [
      { text: t('All ten digits add to 0+1+…+9 = 45', 'Sepuluh angka berjumlah 0+1+…+9 = 45'), ok: null },
      { text: t('A sum leaves the same remainder as its digits (mod 9); 2023 leaves 7', 'Sebuah jumlah bersisa sama dengan angkanya (mod 9); 2023 bersisa 7'), ok: null },
      { text: t('45 leaves 0, so the missing digit must leave 0 − 7 ≡ 2', '45 bersisa 0, jadi angka yang hilang bersisa 0 − 7 ≡ 2'), ok: true },
    ],
    final: t('The unused digit is 2.', 'Angka yang tidak terpakai adalah 2.'),
    aria: t('By the mod-nine rule the missing digit must be 2.', 'Dengan aturan mod-sembilan angka yang hilang pasti 2.'),
  }
})
