import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { StairPerimeterFigure, SP_PERIMETER, type StairPhase } from './StairPerimeterG3Illustration'

// WMI-19F3A-Q14 — no formula out of thin air:
//   flats: the top pieces SLIDE UP and tile one full 20 (shown), floor = 20;
//   climbs: walking around you climb only twice — 12 (left wall) and 10 (slot);
//   downs: every climb comes back down, so downs also total 12 + 10;
//   perimeter = 20 + 20 + 12 + 12 + 10 + 10 = 84.

const GREEN = '#10B981'

export default function StairPerimeterG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps = useMemo(
    () => [
      { phase: null as StairPhase, hold: 2300, result: false, caption: t('All corners are square: 12 tall, 20 wide, and a slot wall of 10.', 'Semua sudut siku-siku: tinggi 12, lebar 20, dan dinding celah 10.') },
      { phase: 'flat' as StairPhase, hold: 3200, result: false, caption: t('FLAT edges first: slide every top piece straight up — they fit together into ONE full top of 20! With the floor (20), flats = 20 + 20 = 40.', 'Sisi DATAR dulu: geser tiap potongan atas lurus ke atas — semuanya tersusun jadi SATU sisi atas utuh 20! Dengan lantainya (20), datar = 20 + 20 = 40.') },
      { phase: 'pair12' as StairPhase, hold: 3200, result: false, caption: t('Standing edges come in PAIRS. The leftmost wall climbs 12 — and on the far right the shape comes back down 8 + 4 = 12. A matching pair: 12 + 12.', 'Sisi tegak selalu BERPASANGAN. Dinding paling kiri naik 12 — dan di paling kanan bangun turun kembali 8 + 4 = 12. Sepasang yang sama: 12 + 12.') },
      { phase: 'pair10' as StairPhase, hold: 3200, result: false, caption: t('The slot wall climbs 10 — and the stairs come down 4 + 3 + 3 = 10. Another matching pair: 10 + 10.', 'Dinding celah naik 10 — dan tangganya turun 4 + 3 + 3 = 10. Sepasang lagi yang sama: 10 + 10.') },
      { phase: null, hold: 2600, result: false, caption: t('Add them: 20 + 20 + 12 + 12 + 10 + 10 = 84.', 'Jumlahkan: 20 + 20 + 12 + 12 + 10 + 10 = 84.') },
      { phase: null, hold: 0, result: true, caption: t(`The perimeter is ${SP_PERIMETER} (A). (Forgetting the slot’s 10-up and 10-down gives the trap answer 64.)`, `Kelilingnya ${SP_PERIMETER} (A). (Melupakan naik-turun 10 milik celah memberi jawaban jebakan 64.)`) },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('Flats total forty, and the two climbs of twelve and ten each happen up and down, giving 84.', 'Sisi datar berjumlah empat puluh, dan dua tanjakan dua belas dan sepuluh masing-masing naik dan turun, memberi 84.')

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <StairPerimeterFigure phase={beat.phase} />
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
