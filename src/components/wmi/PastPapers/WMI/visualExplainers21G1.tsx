import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { AppleGrid21, FruitRow21, fruitAt, Baskets21, PaintGrid21, GRID7, TriangleGrid21, TRI8_WHITE, RopeBars21, ROPES, Seesaw21 } from './scenes21G1Illustrations'
import { NumberStrip21, QueueDots } from './cards21G1Illustrations'

const GREEN = '#10B981'

function Caption({ result, children }: { result: boolean; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
      style={
        result
          ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
          : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
      }
    >
      {children}
    </div>
  )
}

type Beat<T> = T & { hold: number; result: boolean; caption: string }

function useBeats<T>(props: ExplainerProps, steps: Array<Beat<T>>) {
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  return steps[index] ?? steps[steps.length - 1]
}

/* Q2 — apple grid positions. */
export function AppleGrid21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ mark: Array<[number, number]> }>>>(
    () => [
      { mark: [], hold: 2300, result: false, caption: t('Find the apple first — it sits in the middle of the grid.', 'Cari apelnya dulu — ia duduk di tengah kotak.') },
      { mark: [[1, 2]], hold: 2300, result: false, caption: t('On the apple’s RIGHT: the 6.', 'Di KANAN apel: angka 6.') },
      { mark: [[1, 2], [2, 0]], hold: 2500, result: false, caption: t('On its BOTTOM LEFT — one down, one left: the 5 (not the 7 straight left!).', 'Di KIRI BAWAH — satu turun, satu kiri: angka 5 (bukan 7 yang tepat di kiri!).') },
      { mark: [[1, 2], [2, 0]], hold: 0, result: true, caption: t('6 + 5 = 11 (B).', '6 + 5 = 11 (B).') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[260px]" role="img" aria-label={t('Six to the right of the apple plus five at its bottom left make eleven.', 'Enam di kanan apel plus lima di kiri bawahnya menjadi sebelas.')}>
      <div className="flex flex-col items-center gap-3">
        <AppleGrid21 mark={beat.mark} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q4 — fruit pattern positions. */
export function FruitPattern21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ upto: number }>>>(
    () => [
      { upto: 13, hold: 2600, result: false, caption: t('The block 🍍 🍉 🍓 🍓 🍇 🍓 repeats every 6 fruits. Position 13 starts the block again: 🍍.', 'Blok 🍍 🍉 🍓 🍓 🍇 🍓 berulang tiap 6 buah. Posisi 13 memulai blok lagi: 🍍.') },
      { upto: 14, hold: 2000, result: false, caption: t(`Position 14 = block spot 2 → ${fruitAt(14)}.`, `Posisi 14 = tempat 2 blok → ${fruitAt(14)}.`) },
      { upto: 15, hold: 2000, result: false, caption: t(`Position 15 (first “?”) = block spot 3 → ${fruitAt(15)}.`, `Posisi 15 (“?” pertama) = tempat 3 blok → ${fruitAt(15)}.`) },
      { upto: 16, hold: 2000, result: false, caption: t(`Position 16 (second “?”) = block spot 4 → ${fruitAt(16)}.`, `Posisi 16 (“?” kedua) = tempat 4 blok → ${fruitAt(16)}.`) },
      { upto: 18, hold: 0, result: true, caption: t('The two “?” fruits are 🍓 🍓 (D).', 'Dua buah “?” adalah 🍓 🍓 (D).') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[480px]" role="img" aria-label={t('The pattern repeats every six fruits, so positions fifteen and sixteen are both strawberries.', 'Pola berulang tiap enam buah, jadi posisi lima belas dan enam belas keduanya stroberi.')}>
      <div className="flex flex-col items-center gap-3">
        <FruitRow21 revealUpto={beat.upto} showIndex />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q5 — count apples by tens. */
export function Baskets21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ b: number; l: number }>>>(() => {
    const out: Array<Beat<{ b: number; l: number }>> = [
      { b: 0, l: 0, hold: 2300, result: false, caption: t('Each basket holds 10 apples — count baskets by tens, then add the loose ones.', 'Tiap keranjang berisi 10 apel — hitung keranjang per sepuluh, lalu tambah yang lepas.') },
    ]
    for (let i = 1; i <= 6; i++) out.push({ b: i, l: 0, hold: 1100, result: false, caption: t(`Basket ${i}: ${i * 10}`, `Keranjang ${i}: ${i * 10}`) })
    for (let i = 1; i <= 3; i++) out.push({ b: 6, l: i, hold: 1100, result: false, caption: t(`Loose apple: 60 + ${i} = ${60 + i}`, `Apel lepas: 60 + ${i} = ${60 + i}`) })
    out.push({ b: 6, l: 3, hold: 0, result: true, caption: t('6 baskets + 3 apples = 63 (C).', '6 keranjang + 3 apel = 63 (C).') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('Six baskets of ten and three loose apples make sixty-three.', 'Enam keranjang isi sepuluh dan tiga apel lepas menjadi enam puluh tiga.')}>
      <div className="flex flex-col items-center gap-3">
        <Baskets21 countedBaskets={beat.b} countedLoose={beat.l} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q6 — 7th from left, 4th from right. */
export function NumberStrip21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ left?: number; right?: number }>>>(
    () => [
      { hold: 2200, result: false, caption: t('Two hunts: the 7th from the LEFT and the 4th from the RIGHT.', 'Dua pencarian: ke-7 dari KIRI dan ke-4 dari KANAN.') },
      { left: 6, hold: 2400, result: false, caption: t('From the left: 3, 6, 8, 17, 4, 7 … the 7th is 18.', 'Dari kiri: 3, 6, 8, 17, 4, 7 … yang ke-7 adalah 18.') },
      { left: 6, right: 7, hold: 2400, result: false, caption: t('From the right: 1, 5, 12 … the 4th is 9.', 'Dari kanan: 1, 5, 12 … yang ke-4 adalah 9.') },
      { left: 6, right: 7, hold: 0, result: true, caption: t('18 − 9 = 9 (A).', '18 − 9 = 9 (A).') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('The seventh number from the left is eighteen, the fourth from the right is nine, and their difference is nine.', 'Bilangan ke-7 dari kiri adalah delapan belas, ke-4 dari kanan adalah sembilan, dan selisihnya sembilan.')}>
      <div className="flex flex-col items-center gap-3">
        <NumberStrip21 markLeft={beat.left} markRight={beat.right} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q7 — paint the grid row by row, then read the letters. */
export function PaintGrid21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ rows: number }>>>(() => {
    const rowText = (r: number) => {
      const painted = GRID7[r].filter((n) => n % 2 === 0 || n % 5 === 0)
      return painted.join(', ')
    }
    return [
      { rows: 0, hold: 3000, result: false, caption: t('Count in twos starting at 1 — 1 counts as “one”, so every “two” lands on 2, 4, 6, …: EVEN numbers turn red. Counting by 5’s lands on 5, 10, 15, …: yellow.', 'Hitung berdua-dua mulai dari 1 — 1 dihitung “satu”, jadi setiap “dua” jatuh pada 2, 4, 6, …: bilangan GENAP jadi merah. Hitungan lima jatuh pada 5, 10, 15, …: kuning.') },
      { rows: 1, hold: 2300, result: false, caption: t(`Row 1: ${rowText(0)} get color.`, `Baris 1: ${rowText(0)} diwarnai.`) },
      { rows: 2, hold: 2300, result: false, caption: t(`Row 2: ${rowText(1)} get color.`, `Baris 2: ${rowText(1)} diwarnai.`) },
      { rows: 3, hold: 2300, result: false, caption: t(`Row 3: ${rowText(2)} get color.`, `Baris 3: ${rowText(2)} diwarnai.`) },
      { rows: 4, hold: 2300, result: false, caption: t(`Row 4: ${rowText(3)} get color.`, `Baris 4: ${rowText(3)} diwarnai.`) },
      { rows: 5, hold: 2300, result: false, caption: t(`Row 5: ${rowText(4)} get color.`, `Baris 5: ${rowText(4)} diwarnai.`) },
      { rows: 5, hold: 2600, result: false, caption: t('Left block: a ring open on the right — C. Right block: top bar, middle bar, no bottom — F.', 'Blok kiri: cincin terbuka di kanan — C. Blok kanan: palang atas, palang tengah, tanpa bawah — F.') },
      { rows: 5, hold: 0, result: true, caption: t('The letters are C and F (A).', 'Hurufnya C dan F (A).') },
    ]
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('Painting evens red and multiples of five yellow reveals the letters C and F.', 'Mewarnai genap merah dan kelipatan lima kuning memunculkan huruf C dan F.')}>
      <div className="flex flex-col items-center gap-3">
        <PaintGrid21 paintedRows={beat.rows} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q8 — fill the white triangles one at a time. */
export function TriangleFill21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ upto: number }>>>(() => {
    const out: Array<Beat<{ upto: number }>> = [
      { upto: -1, hold: 2500, result: false, caption: t('Each grid square is TWO triangles. Fill the white gap one triangle at a time.', 'Tiap petak kisi adalah DUA segitiga. Isi celah putih satu segitiga tiap kali.') },
    ]
    TRI8_WHITE.forEach((_, i) => {
      out.push({ upto: i, hold: 850, result: false, caption: `${i + 1}` })
    })
    out.push({ upto: TRI8_WHITE.length - 1, hold: 0, result: true, caption: t('17 triangles fill the bolt (C).', '17 segitiga mengisi petirnya (C).') })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={t('Filling the white lightning bolt takes seventeen triangles.', 'Mengisi petir putih membutuhkan tujuh belas segitiga.')}>
      <div className="flex flex-col items-center gap-3">
        <TriangleGrid21 filledUpto={beat.upto} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q10 — rope lengths, then pair sums. */
export function RopePairs21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const len = (k: string) => {
    const rope = ROPES.find((r) => r.key === k)!
    return rope.end - rope.start
  }
  const steps = useMemo<Array<Beat<{ lengths: boolean }>>>(
    () => [
      { lengths: false, hold: 2700, result: false, caption: t('Careful: the ropes start at different marks! Length = end − start.', 'Hati-hati: tali mulai dari angka berbeda! Panjang = ujung − awal.') },
      { lengths: true, hold: 2700, result: false, caption: t(`Blue ${len('blue')}, red ${len('red')}, green ${len('green')}, yellow ${len('yellow')}.`, `Biru ${len('blue')}, merah ${len('red')}, hijau ${len('green')}, kuning ${len('yellow')}.`) },
      { lengths: true, hold: 2200, result: false, caption: t('Blue + green = 6 + 5 = 11 ✗', 'Biru + hijau = 6 + 5 = 11 ✗') },
      { lengths: true, hold: 2200, result: false, caption: t('Red + green = 4 + 5 = 9 ✗ and yellow + blue = 3 + 6 = 9 ✗', 'Merah + hijau = 4 + 5 = 9 ✗ dan kuning + biru = 3 + 6 = 9 ✗') },
      { lengths: true, hold: 2200, result: false, caption: t('Red + blue = 4 + 6 = 10 ✓', 'Merah + biru = 4 + 6 = 10 ✓') },
      { lengths: true, hold: 0, result: true, caption: t('Red and blue make exactly 10 (A).', 'Merah dan biru tepat 10 (A).') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('Measuring each rope from its own start, red four plus blue six equals ten.', 'Mengukur tiap tali dari awalnya sendiri, merah empat plus biru enam sama dengan sepuluh.')}>
      <div className="flex flex-col items-center gap-3">
        <RopeBars21 showLengths={beat.lengths} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q11 — the ticket queue. */
export function TicketQueue21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { marks: Array<{ pos: number; label: string; color: string }>; between?: [number, number] }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { marks: [{ pos: 13, label: 'Jeff', color: '#30598A' }], hold: 2300, result: false, caption: t('Jeff is the 13th from the front.', 'Jeff orang ke-13 dari depan.') },
      { marks: [{ pos: 13, label: 'Jeff', color: '#30598A' }, { pos: 7, label: 'Kim', color: '#E75480' }], hold: 2700, result: false, caption: t('Kim is 28th from the BACK of 34: 34 − 28 + 1 = 7th from the front.', 'Kim ke-28 dari BELAKANG dari 34: 34 − 28 + 1 = ke-7 dari depan.') },
      { marks: [{ pos: 13, label: 'Jeff', color: '#30598A' }, { pos: 7, label: 'Kim', color: '#E75480' }], between: [7, 13], hold: 2600, result: false, caption: t('Kim is ahead! Between them: positions 8, 9, 10, 11, 12 — five people.', 'Kim lebih depan! Di antara mereka: posisi 8, 9, 10, 11, 12 — lima orang.') },
      { marks: [{ pos: 13, label: 'Jeff', color: '#30598A' }, { pos: 7, label: 'Kim', color: '#E75480' }], between: [7, 13], hold: 0, result: true, caption: t('Kim buys first; 5 more people before Jeff (C).', 'Kim membeli dulu; 5 orang lagi sebelum Jeff (C).') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('Kim stands seventh, Jeff thirteenth; five people stand between them.', 'Kim di posisi tujuh, Jeff tiga belas; lima orang di antara mereka.')}>
      <div className="flex flex-col items-center gap-3">
        <QueueDots total={34} marks={beat.marks} between={beat.between} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q20 — the students queue, animated (the static illustration was removed on review). */
export function QueueMiddle21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const BLUE = '#30598A'
  const PINK = '#E75480'
  type S = { marks: Array<{ pos: number; label: string; color: string }>; between?: [number, number] }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { marks: [{ pos: 6, label: 'George', color: BLUE }], hold: 2400, result: false, caption: t('George starts 6th from the front.', 'George mulai dari posisi ke-6 dari depan.') },
      { marks: [{ pos: 10, label: 'George', color: BLUE }], between: [0, 5], hold: 2600, result: false, caption: t('4 students cut in ahead of him → George slides back: 6 + 4 = 10th.', '4 siswa masuk di depannya → George bergeser: 6 + 4 = ke-10.') },
      { marks: [{ pos: 10, label: 'George', color: BLUE }], between: [0, 10], hold: 2700, result: false, caption: t('Now George is exactly the MIDDLE: 9 in front, 9 behind → 9 + 1 + 9 = 19 students.', 'Kini George tepat di TENGAH: 9 di depan, 9 di belakang → 9 + 1 + 9 = 19 siswa.') },
      { marks: [{ pos: 10, label: 'Paul', color: PINK }], between: [0, 10], hold: 2700, result: false, caption: t('Paul was the ORIGINAL middle of the same 19 students → also the 10th spot.', 'Paul adalah tengah SEMULA dari 19 siswa yang sama → juga posisi ke-10.') },
      { marks: [{ pos: 10, label: 'Paul', color: PINK }], between: [0, 10], hold: 0, result: true, caption: t('In front of Paul: 10 − 1 = 9 students.', 'Di depan Paul: 10 − 1 = 9 siswa.') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[460px]" role="img" aria-label={t('The line has nineteen students; Paul stood tenth with nine in front.', 'Barisan berisi sembilan belas siswa; Paul di posisi sepuluh dengan sembilan di depannya.')}>
      <div className="flex flex-col items-center gap-3">
        <QueueDots total={19} marks={beat.marks} between={beat.between} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q14 — seesaw logic: which claim is always true? */
export function Seesaws21Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  type S = { view: 'given' | 'A' | 'B' | 'C' | 'D' }
  const steps = useMemo<Array<Beat<S>>>(
    () => [
      { view: 'given', hold: 2800, result: false, caption: t('The facts: magnifier > eraser, and eraser > pencil. So magnifier > pencil too.', 'Faktanya: kaca pembesar > penghapus, dan penghapus > pensil. Jadi kaca pembesar > pensil juga.') },
      { view: 'A', hold: 2500, result: false, caption: t('A says pencil + eraser beat the magnifier — maybe, but the scales never weighed that. Not certain. ✗', 'A bilang pensil + penghapus mengalahkan kaca pembesar — mungkin, tapi timbangan tak pernah mengukurnya. Tidak pasti. ✗') },
      { view: 'B', hold: 2500, result: false, caption: t('B says the magnifier beats eraser + pencil — also never weighed. Not certain. ✗', 'B bilang kaca pembesar mengalahkan penghapus + pensil — juga tak pernah ditimbang. Tidak pasti. ✗') },
      { view: 'C', hold: 2500, result: false, caption: t('C claims a perfect balance — even less certain. ✗', 'C mengklaim keseimbangan sempurna — lebih tidak pasti lagi. ✗') },
      { view: 'D', hold: 2800, result: false, caption: t('D adds the SAME eraser to both sides of magnifier vs pencil. Equal extras can’t change the winner: always true! ✓', 'D menambah penghapus yang SAMA di kedua sisi kaca pembesar vs pensil. Tambahan sama tak bisa mengubah pemenang: selalu benar! ✓') },
      { view: 'D', hold: 0, result: true, caption: t('Only D must be correct.', 'Hanya D yang pasti benar.') },
    ],
    [lang],
  )
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={t('Adding the same eraser to both sides keeps the magnifier side heavier than the pencil side.', 'Menambahkan penghapus yang sama di kedua sisi menjaga sisi kaca pembesar tetap lebih berat dari sisi pensil.')}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-end justify-center gap-3">
          {beat.view === 'given' ? (
            <>
              <Seesaw21 left={['M']} right={['E']} tilt="left" />
              <Seesaw21 left={['P']} right={['E']} tilt="right" />
            </>
          ) : beat.view === 'A' ? (
            <Seesaw21 left={['P', 'E']} right={['M']} tilt="left" size={210} />
          ) : beat.view === 'B' ? (
            <Seesaw21 left={['M']} right={['E', 'P']} tilt="left" size={210} />
          ) : beat.view === 'C' ? (
            <Seesaw21 left={['M', 'P']} right={['E', 'E']} tilt="level" size={210} />
          ) : (
            <Seesaw21 left={['M', 'E']} right={['P', 'E']} tilt="left" size={210} />
          )}
        </div>
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}
