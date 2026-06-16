// Beat-based explainers for WMI-21F3A puzzle questions.

import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { StreetMap21G3, MAP_WAYS, RabbitMaze21G3, MAZE_MOVES_G3 } from './puzzles21G3Illustrations'
import { MOVE_NAMES_EN, MOVE_NAMES_ID } from './puzzles21G1Illustrations'

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

/* Q19 — corner counting, one row of intersections per beat. */
export function StreetMap21G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ rows: number }>>>(() => {
    const rowCaptionEn = [
      'Bottom row: with only “right” feeding them, every reachable corner gets 1 — until the diagonal splits off.',
      'One row up: each corner = ways from the LEFT + ways from BELOW; the diagonal from home adds its own.',
      'Next row: keep adding left + below — corners past a missing street get nothing from that side.',
      'Middle row: the counts grow — 4, 10 … every number is just a sum of its feeders.',
      'Row five: the long diagonal starts collecting routes toward the school.',
      'Row six: missing streets on the left choke those corners; the right side keeps summing.',
      'Top row: the school collects from the left, from below AND from the diagonal.',
    ]
    const rowCaptionId = [
      'Baris bawah: hanya “kanan” yang masuk, jadi tiap simpang terjangkau bernilai 1 — sampai diagonal memisah.',
      'Satu baris ke atas: tiap simpang = cara dari KIRI + cara dari BAWAH; diagonal dari rumah menambah sendiri.',
      'Baris berikutnya: terus jumlahkan kiri + bawah — simpang setelah jalan yang hilang tak dapat apa-apa dari sisi itu.',
      'Baris tengah: angkanya tumbuh — 4, 10 … setiap angka hanyalah jumlah pemasoknya.',
      'Baris kelima: diagonal panjang mulai mengumpulkan rute menuju sekolah.',
      'Baris keenam: jalan yang hilang di kiri menghambat simpang itu; sisi kanan terus menjumlah.',
      'Baris atas: sekolah mengumpulkan dari kiri, dari bawah, DAN dari diagonal.',
    ]
    const out: Array<Beat<{ rows: number }>> = [
      { rows: -1, hold: 2700, result: false, caption: t('No backtracking → every step goes right, up, or along an up-right diagonal. Label each corner with the number of ways to reach it: home = 1.', 'Tanpa berbalik → tiap langkah ke kanan, atas, atau menyusuri diagonal kanan-atas. Tandai tiap simpang dengan banyak cara mencapainya: rumah = 1.') },
    ]
    for (let k = 0; k < 7; k++) {
      out.push({ rows: k, hold: 2700, result: false, caption: lang === 'id' ? rowCaptionId[k] : rowCaptionEn[k] })
    }
    out.push({ rows: 6, hold: 0, result: true, caption: t(`School: ${MAP_WAYS[6][0]} routes.`, `Sekolah: ${MAP_WAYS[6][0]} rute.`) })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={t('Summing corner by corner across the map gives one hundred twenty-two routes to school.', 'Menjumlahkan simpang demi simpang di peta memberi seratus dua puluh dua rute ke sekolah.')}>
      <div className="flex flex-col items-center gap-3">
        <StreetMap21G3 showRowsUpto={beat.rows} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}

/* Q24 — walk the rabbit, one move per beat. */
export function RabbitMaze21G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo<Array<Beat<{ upto: number }>>>(() => {
    const names = lang === 'id' ? MOVE_NAMES_ID : MOVE_NAMES_EN
    const out: Array<Beat<{ upto: number }>> = [
      { upto: -1, hold: 2700, result: false, caption: t('Visit all 15 open squares once, avoid the stones, end at the carrot. Moves: 1 ↑, 2 ←, 3 ↓, 4 →. There is only ONE such path.', 'Lewati semua 15 petak terbuka sekali, hindari batu, akhiri di wortel. Gerakan: 1 ↑, 2 ←, 3 ↓, 4 →. Hanya ada SATU jalur seperti itu.') },
    ]
    let run = 0
    MAZE_MOVES_G3.forEach((m, i) => {
      run += m
      out.push({ upto: i, hold: 1250, result: false, caption: `${names[m]} (${m}) → ${run}` })
    })
    out.push({ upto: MAZE_MOVES_G3.length - 1, hold: 0, result: true, caption: '1+1+4+3+3+4+4+4+1+2+1+4+4+3 = 39' })
    return out
  }, [lang])
  const beat = useBeats(props, steps)
  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={t('The rabbit’s unique route gives move numbers summing thirty-nine.', 'Rute tunggal kelinci memberi angka gerakan berjumlah tiga puluh sembilan.')}>
      <div className="flex flex-col items-center gap-3">
        <RabbitMaze21G3 movesUpto={beat.upto} />
        <Caption result={beat.result}>{beat.caption}</Caption>
      </div>
    </div>
  )
}
