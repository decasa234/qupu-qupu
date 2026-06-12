import type { ComponentType } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  Balance22G2Illustration,
  Balls22G2Illustration,
  CardHands22G2Illustration,
  ChildrenOrder22G2Illustration,
  Cups22G2Illustration,
  EggPath22G2Illustration,
  Flowchart22G2Illustration,
  MirrorBlocks22G2Illustration,
  PaperStack22G2Illustration,
  PasswordDial22G2Illustration,
  SeatGrid22G2Illustration,
  ShapeAddition22G2Illustration,
  Shark22G2Illustration,
  Soldiers22G2Illustration,
  Targets22G2Illustration,
  TCover22G2Illustration,
  ThickLines22G2Illustration,
} from './paper22G2Visuals'

type StepPair = { en: string; id: string }

function makeExplainer(
  Illustration: ComponentType,
  title: StepPair,
  steps: StepPair[],
): ComponentType<ExplainerProps> {
  return function Paper22G2Explainer(props: ExplainerProps) {
    const index = useBeatControl(steps.length - 1, {
      ...props,
      holds: steps.map((_, step) => (step === steps.length - 1 ? 0 : 2300)),
    })
    const lang = props.lang ?? 'en'
    const text = steps[index]?.[lang] ?? steps[steps.length - 1][lang]
    return (
      <div className="mx-auto w-full max-w-[760px]" role="img" aria-label={`${title[lang]}. ${text}`}>
        <Illustration />
        <div
          className="mx-auto rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            index === steps.length - 1
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {text}
        </div>
      </div>
    )
  }
}

export const Shark22G2Explainer = makeExplainer(
  Shark22G2Illustration,
  { en: 'Compare the fish with 374', id: 'Bandingkan ikan dengan 374' },
  [
    { en: 'Check one fish at a time: only a number below 374 can be eaten.', id: 'Periksa satu ikan setiap kali: hanya bilangan di bawah 374 yang dapat dimakan.' },
    { en: '321 and 286 are below 374.', id: '321 dan 286 berada di bawah 374.' },
    { en: '357 is also below 374; all other fish are larger.', id: '357 juga di bawah 374; ikan lainnya lebih besar.' },
    { en: 'Three fish can be eaten, so the answer is B.', id: 'Tiga ikan dapat dimakan, jadi jawabannya B.' },
  ],
)

export const PaperStack22G2Explainer = makeExplainer(
  PaperStack22G2Illustration,
  { en: 'Read the overlap order', id: 'Baca urutan tumpukan' },
  [
    { en: 'An edge covered by another sheet is lower in the stack.', id: 'Tepi yang tertutup kertas lain berada lebih bawah dalam tumpukan.' },
    { en: 'Start at the bottom and count upward, not from the visible top sheet.', id: 'Mulai dari bawah dan hitung ke atas, bukan dari kertas teratas.' },
    { en: 'The third sheet from the bottom carries 6.', id: 'Kertas ketiga dari bawah bernomor 6.' },
    { en: 'Choose D.', id: 'Pilih D.' },
  ],
)

export const Balls22G2Explainer = makeExplainer(
  Balls22G2Illustration,
  { en: 'Apply both ball conditions', id: 'Terapkan kedua syarat bola' },
  [
    { en: 'Six balls with equal black and white counts means 3 black and 3 white.', id: 'Enam bola dengan jumlah hitam dan putih sama berarti 3 hitam dan 3 putih.' },
    { en: 'Now require more large balls than small balls.', id: 'Sekarang syaratkan bola besar lebih banyak daripada bola kecil.' },
    { en: 'Option B has 4 large and 2 small, while keeping 3 of each colour.', id: 'Pilihan B memiliki 4 besar dan 2 kecil, serta tetap 3 untuk tiap warna.' },
    { en: 'Only B satisfies both conditions.', id: 'Hanya B yang memenuhi kedua syarat.' },
  ],
)

export const ThickLines22G2Explainer = makeExplainer(
  ThickLines22G2Illustration,
  { en: 'Measure every orange segment', id: 'Ukur setiap ruas oranye' },
  [
    { en: 'Each horizontal cell edge is 3 cm; each vertical edge is 2 cm.', id: 'Setiap sisi mendatar petak adalah 3 cm; sisi tegak 2 cm.' },
    { en: 'Count horizontal and vertical segments separately for each option.', id: 'Hitung ruas mendatar dan tegak secara terpisah untuk tiap pilihan.' },
    { en: 'Add the measured segments instead of judging the drawing by eye.', id: 'Jumlahkan ruas yang diukur, jangan menilai gambar dengan mata.' },
    { en: 'Option C has the greatest total length.', id: 'Pilihan C memiliki panjang total terbesar.' },
  ],
)

export const ChildrenOrder22G2Explainer = makeExplainer(
  ChildrenOrder22G2Illustration,
  { en: 'Match names to pictured heights', id: 'Cocokkan nama dengan tinggi gambar' },
  [
    { en: 'Dan is tallest, so he is the starred child on the left.', id: 'Dan paling tinggi, jadi ia anak berbintang di kiri.' },
    { en: 'The clues give Ann taller than Ken, and Ken taller than Pan.', id: 'Petunjuk memberi Ann lebih tinggi dari Ken, dan Ken lebih tinggi dari Pan.' },
    { en: 'Among the remaining children: Pan is shortest, then Ken, then Ann.', id: 'Di antara anak tersisa: Pan paling pendek, lalu Ken, lalu Ann.' },
    { en: 'Left to right: Dan, Pan, Ken, Ann. Answer C.', id: 'Kiri ke kanan: Dan, Pan, Ken, Ann. Jawaban C.' },
  ],
)

export const Targets22G2Explainer = makeExplainer(
  Targets22G2Illustration,
  { en: 'Score the four targets', id: 'Hitung nilai empat sasaran' },
  [
    { en: 'Read the ring hit by each arrow point: 10, 6, 4, or 0 for a miss.', id: 'Baca lingkaran yang terkena ujung panah: 10, 6, 4, atau 0 jika meleset.' },
    { en: 'For the black arrow only, multiply its ring value by 3.', id: 'Hanya untuk panah hitam, kalikan nilai lingkarannya dengan 3.' },
    { en: 'Add each player’s arrow values and compare the totals.', id: 'Jumlahkan nilai panah tiap pemain dan bandingkan totalnya.' },
    { en: 'Celine is highest and Bob is lowest. Answer D.', id: 'Celine tertinggi dan Bob terendah. Jawaban D.' },
  ],
)

export const EggPath22G2Explainer = makeExplainer(
  EggPath22G2Illustration,
  { en: 'Continue the growing jumps', id: 'Lanjutkan lompatan yang membesar' },
  [
    { en: 'The path adds +1, +2, +3, +4, and so on.', id: 'Jalur menambah +1, +2, +3, +4, dan seterusnya.' },
    { en: 'After 16 come 22, 29, and 37.', id: 'Setelah 16 datang 22, 29, dan 37.' },
    { en: 'Continue: 37 + 9 = 46, then 46 + 10 = 56.', id: 'Lanjutkan: 37 + 9 = 46, lalu 46 + 10 = 56.' },
    { en: 'Finally 56 + 11 = 67. Answer C.', id: 'Terakhir 56 + 11 = 67. Jawaban C.' },
  ],
)

export const Cups22G2Explainer = makeExplainer(
  Cups22G2Illustration,
  { en: 'Find each picture value', id: 'Cari nilai tiap gambar' },
  [
    { en: 'Four mugs total 36, so one mug is 36 ÷ 4 = 9.', id: 'Empat mug berjumlah 36, jadi satu mug 36 ÷ 4 = 9.' },
    { en: 'Cup × cup = 49, so one cup is 7.', id: 'Cangkir × cangkir = 49, jadi satu cangkir 7.' },
    { en: 'Use the single pictures shown in the final line.', id: 'Gunakan masing-masing satu gambar pada baris terakhir.' },
    { en: '9 + 7 = 16. Answer B.', id: '9 + 7 = 16. Jawaban B.' },
  ],
)

export const Flowchart22G2Explainer = makeExplainer(
  Flowchart22G2Illustration,
  { en: 'Follow the flowchart branch', id: 'Ikuti cabang diagram alir' },
  [
    { en: 'A + B = 65 + 80 = 145.', id: 'A + B = 65 + 80 = 145.' },
    { en: '145 is not greater than 150, so the condition is false.', id: '145 tidak lebih besar dari 150, jadi syaratnya salah.' },
    { en: 'The false branch uses C = B − A.', id: 'Cabang salah memakai C = B − A.' },
    { en: 'C = 80 − 65 = 15.', id: 'C = 80 − 65 = 15.' },
  ],
)

export const Balance22G2Explainer = makeExplainer(
  Balance22G2Illustration,
  { en: 'Substitute equal weights', id: 'Substitusikan berat yang sama' },
  [
    { en: 'The second balance says C = B + D.', id: 'Neraca kedua menyatakan C = B + D.' },
    { en: 'Then A = B + C + D = 2B + 2D.', id: 'Maka A = B + C + D = 2B + 2D.' },
    { en: 'Another balance says A = 3D, so 2B + 2D = 3D.', id: 'Neraca lain menyatakan A = 3D, jadi 2B + 2D = 3D.' },
    { en: 'Therefore D = 2B. One D balances two B balls.', id: 'Karena itu D = 2B. Satu D seimbang dengan dua bola B.' },
  ],
)

export const SeatGrid22G2Explainer = makeExplainer(
  SeatGrid22G2Illustration,
  { en: 'Find the unique seat', id: 'Cari tempat yang unik' },
  [
    { en: 'Look for a cell with A directly above it.', id: 'Cari sel dengan A tepat di atasnya.' },
    { en: 'Among those cells, require D directly to the right.', id: 'Di antara sel itu, syaratkan D tepat di kanan.' },
    { en: 'The unique seat is (3, 2).', id: 'Tempat yang unik adalah (3, 2).' },
    { en: 'a × 2 + b = 3 × 2 + 2 = 8.', id: 'a × 2 + b = 3 × 2 + 2 = 8.' },
  ],
)

export const ShapeAddition22G2Explainer = makeExplainer(
  ShapeAddition22G2Illustration,
  { en: 'Use the column carries', id: 'Gunakan simpanan kolom' },
  [
    { en: 'The thousands digit 2 comes from a carry out of the hundreds column.', id: 'Digit ribuan 2 berasal dari simpanan kolom ratusan.' },
    { en: 'The hundreds column forces the square digit to be 9.', id: 'Kolom ratusan memaksa digit persegi bernilai 9.' },
    { en: 'The remaining column carries give triangle + circle = 13.', id: 'Simpanan kolom lainnya memberi segitiga + lingkaran = 13.' },
    { en: 'Square + triangle + circle = 9 + 13 = 22.', id: 'Persegi + segitiga + lingkaran = 9 + 13 = 22.' },
  ],
)

export const PasswordDial22G2Explainer = makeExplainer(
  PasswordDial22G2Illustration,
  { en: 'Trace each turn', id: 'Ikuti setiap putaran' },
  [
    { en: 'From 0, clockwise 3 lands on 9; counterclockwise 4 lands on 5.', id: 'Dari 0, searah 3 mendarat di 9; berlawanan 4 mendarat di 5.' },
    { en: 'Clockwise 2 lands on 3.', id: 'Searah 2 mendarat di 3.' },
    { en: 'Clockwise 3 lands on 2.', id: 'Searah 3 mendarat di 2.' },
    { en: 'Counterclockwise 6 lands on 8: password 95328.', id: 'Berlawanan 6 mendarat di 8: kata sandi 95328.' },
  ],
)

export const CardHands22G2Explainer = makeExplainer(
  CardHands22G2Illustration,
  { en: 'Match the remaining card ranks', id: 'Pasangkan nilai kartu yang tersisa' },
  [
    { en: 'The visible 9s already form a pair, and the visible 5s already form a pair.', id: 'Kartu 9 yang terlihat sudah berpasangan, dan kartu 5 yang terlihat juga sudah berpasangan.' },
    { en: 'The single visible ranks 2, J, 8, K, and 3 each need a matching card.', id: 'Nilai tunggal 2, J, 8, K, dan 3 masing-masing memerlukan satu kartu pasangan.' },
    { en: 'Those five matching cards must be in Danny’s hand.', id: 'Kelima kartu pasangan itu harus berada di tangan Danny.' },
    { en: 'Therefore Danny has 5 cards.', id: 'Jadi Danny memiliki 5 kartu.' },
  ],
)

export const Soldiers22G2Explainer = makeExplainer(
  Soldiers22G2Illustration,
  { en: 'Simulate the marching queue', id: 'Simulasikan antrean prajurit' },
  [
    { en: 'Begin with the order 1, 2, 3, 4 moving left.', id: 'Mulai dengan urutan 1, 2, 3, 4 bergerak ke kiri.' },
    { en: 'At each hole, move the front soldiers into the hole exactly as pictured.', id: 'Pada tiap lubang, pindahkan prajurit depan ke lubang tepat seperti gambar.' },
    { en: 'Let the others pass, then reinsert the soldiers in the shown climb-out order.', id: 'Biarkan yang lain lewat, lalu masukkan kembali prajurit sesuai urutan memanjat.' },
    { en: 'After both holes the order is 4, 2, 1, 3: 4213.', id: 'Setelah kedua lubang urutannya 4, 2, 1, 3: 4213.' },
  ],
)

export const MirrorBlocks22G2Explainer = makeExplainer(
  MirrorBlocks22G2Illustration,
  { en: 'Reconcile the two mirror views', id: 'Cocokkan dua tampak cermin' },
  [
    { en: 'Gray pieces have length 2 and black pieces have length 3.', id: 'Balok abu-abu panjangnya 2 dan balok hitam panjangnya 3.' },
    { en: 'Match those long pieces against both coloured projections first.', id: 'Cocokkan balok panjang itu dengan kedua proyeksi berwarna terlebih dahulu.' },
    { en: 'Every remaining one-unit position must be a white block.', id: 'Setiap posisi satuan yang tersisa harus berupa balok putih.' },
    { en: 'Three white 1×1×1 blocks are needed.', id: 'Diperlukan tiga balok putih 1×1×1.' },
  ],
)

export const TCover22G2Explainer = makeExplainer(
  TCover22G2Illustration,
  { en: 'Search every T placement', id: 'Cari setiap posisi T' },
  [
    { en: 'Evaluate the arithmetic expressions in all sixteen grid cells.', id: 'Hitung nilai aritmetika pada semua enam belas petak.' },
    { en: 'Try the T in each legal position and all four rotations.', id: 'Coba bentuk T pada setiap posisi sah dan keempat putaran.' },
    { en: 'The best T covers 43, 28, 20, and 57.', id: 'T terbaik menutup 43, 28, 20, dan 57.' },
    { en: '43 + 28 + 20 + 57 = 148.', id: '43 + 28 + 20 + 57 = 148.' },
  ],
)
