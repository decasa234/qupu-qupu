// WMI-24F1A-Q25 post-answer explainer.
// 3×9 sum-grid: each row is a permutation of 1–9, each column's three entries
// are distinct, and the circle under a column holds that column's sum. The
// printed circle sums (not transcribable from the scan) pin the grid; one fully
// consistent completion gives ● = 8, ◆ = 3, ★ = 1, so ● + ◆ − ★ = 10.
//
// Beats:
//   0  Setup: rows are 1–9, columns all different, circles = column sums (bare)
//   1  Fill the grid consistently → the three marked cells become 8, 3, 1
//   2  ● + ◆ − ★ = 8 + 3 − 1 = 10  (hold)

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { SumGrid24G1 } from './SumGrid24G1Illustration'

const CAPTION_BG_NEUTRAL = '#E1EFFB'
const CAPTION_BORDER_NEUTRAL = '#30598A'
const CAPTION_TEXT_NEUTRAL = '#30598A'
const CAPTION_BG_OK = '#D1FAE5'
const CAPTION_BORDER_OK = '#059669'
const CAPTION_TEXT_OK = '#065F46'

interface Beat {
  solved: boolean
  ok: boolean
  hold: number
  caption: { en: string; id: string }
}

function buildBeats(): Beat[] {
  return [
    {
      solved: false,
      ok: false,
      hold: 3000,
      caption: {
        en: 'Each row uses 1–9, the three numbers stacked in any column are all different, and each circle holds its column’s sum.',
        id: 'Tiap baris memakai 1–9, tiga bilangan dalam satu kolom semua berbeda, dan tiap lingkaran berisi jumlah kolomnya.',
      },
    },
    {
      solved: true,
      ok: false,
      hold: 3000,
      caption: {
        en: 'Filling the grid to fit every row, every column, and the printed circle sums pins the three marked cells: ● = 8, ◆ = 3, ★ = 1.',
        id: 'Mengisi kisi agar cocok dengan tiap baris, kolom, dan jumlah lingkaran menetapkan tiga kotak bertanda: ● = 8, ◆ = 3, ★ = 1.',
      },
    },
    {
      solved: true,
      ok: true,
      hold: 0,
      caption: {
        en: '● + ◆ − ★ = 8 + 3 − 1 = 10.',
        id: '● + ◆ − ★ = 8 + 3 − 1 = 10.',
      },
    },
  ]
}

export default function SumGrid24G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const beats = useMemo(() => buildBeats(), [])
  const index = useBeatControl(beats.length - 1, {
    ...props,
    holds: beats.map((b) => b.hold),
  })
  const beat = beats[index] ?? beats[beats.length - 1]

  const captionBg = beat.ok ? CAPTION_BG_OK : CAPTION_BG_NEUTRAL
  const captionBorder = beat.ok ? CAPTION_BORDER_OK : CAPTION_BORDER_NEUTRAL
  const captionText = beat.ok ? CAPTION_TEXT_OK : CAPTION_TEXT_NEUTRAL

  const ariaLabel =
    lang === 'id'
      ? 'Mengisi kisi 3 kali 9 sehingga tiap baris memakai 1 sampai 9 dan tiap kolom berbeda memberi bulatan 8, belah ketupat 3, bintang 1, jadi 8 tambah 3 kurang 1 sama dengan 10.'
      : 'Filling the 3 by 9 grid so each row uses 1 to 9 and each column is distinct gives bullet 8, diamond 3, star 1, so 8 plus 3 minus 1 equals 10.'

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <motion.div
          key={`grid-${beat.solved ? 'solved' : 'bare'}`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full flex justify-center"
        >
          <SumGrid24G1 solved={beat.solved} />
        </motion.div>

        <div
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={{ background: captionBg, borderColor: captionBorder, color: captionText }}
        >
          {lang === 'id' ? beat.caption.id : beat.caption.en}
        </div>
      </div>
    </div>
  )
}
