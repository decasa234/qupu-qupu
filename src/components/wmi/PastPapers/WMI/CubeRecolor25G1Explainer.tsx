import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CubeRecolor25G1 } from './CubeRecolor25G1Illustration'
import { buildCubeRecolor25G1Steps } from './cubeRecolor25G1Steps'

// Colours mirror CubeRecolor25G1Illustration's fills so the animation reads as
// the same scene coming alive (raw hex echoes of the qupu tokens).
const INK = '#374151' // qupu ink — cube outlines
const ORANGE = '#F2A007' // a FILLED cube
const ORANGE_DK = '#D98A00' // shaded edge of a filled cube
const CREAM = '#FBF6EC' // an EMPTY cube
const HILITE = '#2C9CDB' // qupu-brand-blue — change marker
const GREEN = '#10B981' // fill-qupu-green — winning beat
const BLUE_BG = '#E1EFFB'
const BLUE_INK = '#30598A'

// Mini-comparison geometry: a single digit grid (3 cols × 5 rows).
const MROWS = 5
const MCOLS = 3
const MCUBE = 14
const MGAP = 2
const MW = MCOLS * MCUBE + (MCOLS - 1) * MGAP // 46
const MH = MROWS * MCUBE + (MROWS - 1) * MGAP // 78

// One digit grid for the focused mini-comparison, ringing the cubes that change.
function MiniDigit({ glyph, mask }: { glyph: boolean[][]; mask: boolean[][] | null }) {
  const cubes = []
  for (let r = 0; r < MROWS; r++) {
    for (let c = 0; c < MCOLS; c++) {
      const x = c * (MCUBE + MGAP)
      const y = r * (MCUBE + MGAP)
      const filled = glyph[r][c]
      const changed = mask ? mask[r][c] : false
      cubes.push(
        <g key={`${r}-${c}`}>
          <rect
            x={x}
            y={y}
            width={MCUBE}
            height={MCUBE}
            rx={1.5}
            fill={filled ? ORANGE : CREAM}
            stroke={filled ? ORANGE_DK : INK}
            strokeWidth={1.4}
          />
          {changed && (
            <rect
              x={x - 1}
              y={y - 1}
              width={MCUBE + 2}
              height={MCUBE + 2}
              rx={2}
              fill="none"
              stroke={HILITE}
              strokeWidth={2.4}
            />
          )}
        </g>,
      )
    }
  }
  return (
    <svg viewBox={`0 0 ${MW} ${MH}`} width={MW} height={MH} aria-hidden="true">
      {cubes}
    </svg>
  )
}

export default function CubeRecolor25G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildCubeRecolor25G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // The running tally takes the change colour while comparing, green on result.
  const accent = beat.result ? GREEN : beat.changedHere > 0 ? HILITE : BLUE_INK

  const ariaLabel =
    lang === 'id'
      ? `Penjelasan: bandingkan 2025 dan 0726 angka demi angka dan hitung kubus yang berbeda — 3 + 5 + 0 + 1 = ${story.answer} kubus berganti warna.`
      : `Explainer: compare 2025 and 0726 digit by digit and count the cubes that differ — 3 + 5 + 0 + 1 = ${story.answer} cubes change colour.`

  const showMini = beat.phase === 'compare' && beat.leftGlyph && beat.rightGlyph

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* The bound primitive: rings all 9 differing cubes only on the result. */}
        <CubeRecolor25G1 markChanges={beat.markChanges} />

        {/* Focused digit-position comparison — one pair at a time. */}
        {showMini && (
          <motion.div
            key={`mini-${beat.pos}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="flex items-center gap-3"
          >
            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-xs font-bold text-gray-500">
                {t('left', 'kiri')}
              </span>
              <MiniDigit glyph={beat.leftGlyph!} mask={beat.mask} />
            </div>

            <span className="font-display text-xl font-black text-gray-400">→</span>

            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-xs font-bold text-gray-500">
                {t('right', 'kanan')}
              </span>
              <MiniDigit glyph={beat.rightGlyph!} mask={beat.mask} />
            </div>

            <div
              className="ml-1 flex flex-col items-center rounded-lg border-2 px-3 py-1 font-display"
              style={
                beat.changedHere > 0
                  ? { background: '#FFFFFF', borderColor: HILITE, color: HILITE }
                  : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }
              }
            >
              <span className="text-2xl font-black tabular-nums">+{beat.changedHere}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {t('changed', 'berubah')}
              </span>
            </div>
          </motion.div>
        )}

        {/* Running total of cubes recoloured so far. */}
        {(beat.running > 0 || beat.phase === 'compare') && (
          <motion.div
            key={`total-${index}-${beat.running}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="font-display text-2xl font-black tabular-nums"
            style={{ color: accent }}
          >
            {t('Total', 'Total')}: {beat.running}
          </motion.div>
        )}

        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.phase === 'compare' && beat.changedHere > 0
                ? { background: '#FFFFFF', borderColor: HILITE, color: BLUE_INK }
                : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
