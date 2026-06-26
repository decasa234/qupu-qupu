// SASMO-19-G4-Q8 — Rope knot identification steps
// Answer: E — the overhand knot (3 alternating crossings lock together).

export interface Step {
  beat: number
  title_en: string
  title_id: string
  body_en: string
  body_id: string
  /** Which choice label is being highlighted, if any */
  highlight?: string
  /** Whether to mark the highlighted choice as eliminated (not a knot) */
  eliminated?: boolean
}

const steps: Step[] = [
  {
    beat: 1,
    title_en: 'The test: pull both ends',
    title_id: 'Tes: tarik kedua ujung',
    body_en:
      'Imagine grabbing one end of each rope figure and pulling both ends slowly away from each other. ' +
      'If all the loops slide off — it is NOT a knot. ' +
      'A real knot tightens and stays tied.',
    body_id:
      'Bayangkan memegang salah satu ujung setiap gambar tali dan menarik kedua ujung perlahan menjauhi satu sama lain. ' +
      'Jika semua lingkaran terlepas — itu bukan simpul. ' +
      'Simpul nyata mengencang dan tetap terikat.',
  },
  {
    beat: 2,
    title_en: 'Option D — simple loop',
    title_id: 'Pilihan D — putaran sederhana',
    body_en:
      'Option D is just one loop. When you pull the ends, the loop slides right off — no resistance. Not a knot.',
    body_id:
      'Pilihan D hanya berupa satu putaran. Saat kamu menarik ujungnya, putaran langsung terlepas — tidak ada hambatan. Bukan simpul.',
    highlight: 'D',
    eliminated: true,
  },
  {
    beat: 3,
    title_en: 'Options B and C — overlapping loops',
    title_id: 'Pilihan B dan C — putaran bertumpuk',
    body_en:
      'Options B and C have two loops that look tangled, but their crossings all go the same way. ' +
      'Pull the ends and the loops slide off one by one. Not knots.',
    body_id:
      'Pilihan B dan C memiliki dua putaran yang tampak kusut, tetapi persilangannya semua searah. ' +
      'Tarik ujungnya dan putaran terlepas satu per satu. Bukan simpul.',
    highlight: 'B',
    eliminated: true,
  },
  {
    beat: 4,
    title_en: 'Option A — complex but still not a knot',
    title_id: 'Pilihan A — kompleks tapi tetap bukan simpul',
    body_en:
      'Option A looks the most complicated with three or more crossings, but every crossing goes "over from the outside." ' +
      'The loops can all be pulled free. Still not a knot.',
    body_id:
      'Pilihan A terlihat paling rumit dengan tiga atau lebih persilangan, tetapi setiap persilangan mengarah "dari luar ke dalam." ' +
      'Semua lingkaran bisa ditarik lepas. Tetap bukan simpul.',
    highlight: 'A',
    eliminated: true,
  },
  {
    beat: 5,
    title_en: 'Option E — the real knot',
    title_id: 'Pilihan E — simpul nyata',
    body_en:
      'Option E has THREE crossings with an alternating over–under–over pattern. ' +
      'This is the overhand knot. The alternating pattern locks the crossings together — ' +
      'when you pull the ends, the knot tightens instead of slipping free.',
    body_id:
      'Pilihan E memiliki TIGA persilangan dengan pola berselang-seling atas–bawah–atas. ' +
      'Ini adalah simpul overhand. Pola berselang-seling mengunci persilangan bersama-sama — ' +
      'saat kamu menarik ujungnya, simpul mengencang, bukan terlepas.',
    highlight: 'E',
  },
  {
    beat: 6,
    title_en: 'Answer: E',
    title_id: 'Jawaban: E',
    body_en:
      'Only figure E — the overhand knot — tightens into a real knot when both ends are pulled. ' +
      'The key is three ALTERNATING crossings (over, under, over). ' +
      'Any rope with only same-direction crossings will unravel.',
    body_id:
      'Hanya gambar E — simpul overhand — yang mengencang menjadi simpul nyata saat kedua ujung ditarik. ' +
      'Kuncinya adalah tiga persilangan BERSELANG-SELING (atas, bawah, atas). ' +
      'Tali dengan persilangan searah akan selalu terlepas.',
  },
]

export default steps
