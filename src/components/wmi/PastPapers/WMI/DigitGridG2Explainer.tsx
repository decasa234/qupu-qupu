import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { DigitGrid25Figure, RUNS25 } from './puzzles20G2Illustrations'

// WMI-20F2A-Q25 — scan the cross-shaped digit grid for runs of 2,4,6,8
// reading across (left→right) and down (top→bottom). Answer = 6.

const GREEN = '#059669'
const BLUE = '#1D4ED8'

// Derive across/down counts from RUNS25 so the captions stay consistent.
function getRunLabel(i: number, lang: 'en' | 'id'): string {
  const run = RUNS25[i]
  const [startR, startC] = run.cells[0]
  if (run.dir === 'h') {
    // human row is 1-indexed
    return lang === 'id'
      ? `Mendatar, baris ${startR + 1}: 2 4 6 8 ✓`
      : `Across, row ${startR + 1}: 2 4 6 8 ✓`
  } else {
    return lang === 'id'
      ? `Menurun, kolom ${startC + 1}: 2 4 6 8 ✓`
      : `Down, col ${startC + 1}: 2 4 6 8 ✓`
  }
}

export default function DigitGridG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Derive counts from RUNS25 so nothing is hardcoded inconsistently.
  const totalAcross = RUNS25.filter((r) => r.dir === 'h').length
  const totalDown = RUNS25.filter((r) => r.dir === 'v').length
  const total = RUNS25.length // 6

  const steps = useMemo(() => {
    const out: Array<{
      upto: number
      count: number
      result: boolean
      hold: number
      caption: string
    }> = []

    // Beat 0 — intro
    out.push({
      upto: -1,
      count: 0,
      result: false,
      hold: 2600,
      caption: t(
        'Hunt for 2, 4, 6, 8 in order — across (left→right) and down (top→bottom).',
        'Cari urutan 2, 4, 6, 8 — mendatar (kiri→kanan) dan menurun (atas→bawah).',
      ),
    })

    // Beats 1–6 — one per run
    for (let i = 0; i < RUNS25.length; i++) {
      const count = i + 1
      const label = getRunLabel(i, lang)
      // The last across/down beat before the final, hold a touch longer
      // so the rejection / acceptance reads. All run finds are positive here.
      out.push({
        upto: i,
        count,
        result: false,
        hold: 1900,
        caption: t(
          `${label} — found ${count}`,
          `${label} — sudah ${count}`,
        ),
      })
    }

    // Beat 7 — final result
    out.push({
      upto: total - 1,
      count: total,
      result: true,
      hold: 0,
      caption: t(
        `${totalAcross} across + ${totalDown} down = ${total} groups total!`,
        `${totalAcross} mendatar + ${totalDown} menurun = ${total} kelompok!`,
      ),
    })

    return out
  }, [lang, totalAcross, totalDown, total])

  const finalIndex = steps.length - 1
  const index = useBeatControl(finalIndex, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[finalIndex]

  const acrossSoFar = RUNS25.slice(0, Math.max(0, beat.upto + 1)).filter((r) => r.dir === 'h').length
  const downSoFar = RUNS25.slice(0, Math.max(0, beat.upto + 1)).filter((r) => r.dir === 'v').length

  return (
    <div
      className="mx-auto w-full max-w-[380px]"
      role="img"
      aria-label={t(
        'Scanning the digit grid for 2 4 6 8 in order finds six groups: three across and three down.',
        'Memindai grid angka untuk urutan 2 4 6 8 menemukan enam kelompok: tiga mendatar dan tiga menurun.',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* The grid — DigitGrid25Figure highlights runs up to beat.upto */}
        <DigitGrid25Figure upto={beat.upto} />

        {/* Running across/down tally — only show once scanning has started */}
        {beat.upto >= 0 && (
          <div className="flex gap-6 font-display text-sm font-bold">
            <span style={{ color: BLUE }}>
              {t(`Across: ${acrossSoFar}`, `Mendatar: ${acrossSoFar}`)}
            </span>
            <span style={{ color: GREEN }}>
              {t(`Down: ${downSoFar}`, `Menurun: ${downSoFar}`)}
            </span>
          </div>
        )}

        {/* Caption box */}
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

        {/* Final answer callout */}
        {beat.result && (
          <div
            className="rounded-2xl px-6 py-2 font-display text-2xl font-black"
            style={{ background: '#D1FAE5', color: '#065F46', border: `3px solid ${GREEN}` }}
          >
            {t(`Answer: ${total}`, `Jawaban: ${total}`)}
          </div>
        )}
      </div>
    </div>
  )
}
