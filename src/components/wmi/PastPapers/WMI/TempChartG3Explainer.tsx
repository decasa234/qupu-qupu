import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TempChartFigure, CITIES, cityRange, type CityKey } from './TempChartG3Illustration'

// WMI-19F3A-Q3 — most distinct variation = the biggest swing (max − min).
// Each beat focuses one city, brackets its range, and compares the numbers.

const GREEN = '#10B981'

interface Beat {
  focus: CityKey | null
  caption: string
  hold: number
  result: boolean
}

export default function TempChartG3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const r = (k: CityKey) => cityRange(CITIES.find((c) => c.key === k)!)
  const steps = useMemo<Beat[]>(
    () => [
      { focus: null, hold: 2400, result: false, caption: t('“Most distinct variation” = the biggest SWING: highest − lowest.', '“Perubahan paling mencolok” = AYUNAN terbesar: tertinggi − terendah.') },
      { focus: 'A', hold: 2300, result: false, caption: t(`A stays high but barely moves: 60 − 47 = ${r('A')}.`, `A tinggi tapi hampir tak bergerak: 60 − 47 = ${r('A')}.`) },
      { focus: 'B', hold: 2100, result: false, caption: t(`B: 52 − 35 = ${r('B')}.`, `B: 52 − 35 = ${r('B')}.`) },
      { focus: 'D', hold: 2100, result: false, caption: t(`D: 35 − 19 = ${r('D')}.`, `D: 35 − 19 = ${r('D')}.`) },
      { focus: 'C', hold: 2500, result: false, caption: t(`C leaps to 72 in summer and crashes to 13 in winter: 72 − 13 = ${r('C')}!`, `C melonjak ke 72 di musim panas dan anjlok ke 13 di musim dingin: 72 − 13 = ${r('C')}!`) },
      { focus: 'C', hold: 0, result: true, caption: t(`${r('C')} beats 13, 17, and 16 — city C changes the most (C).`, `${r('C')} mengalahkan 13, 17, dan 16 — kota C yang paling berubah (C).`) },
    ],
    [lang],
  )
  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]

  const aria = t('City C has the biggest temperature swing, 59 degrees.', 'Kota C punya ayunan suhu terbesar, 59 derajat.')

  return (
    <div className="mx-auto w-full max-w-[420px]" role="img" aria-label={aria}>
      <div className="flex flex-col items-center gap-3">
        <TempChartFigure focus={beat.focus} showRange={beat.focus !== null} lang={lang === 'id' ? 'id' : 'en'} />
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
