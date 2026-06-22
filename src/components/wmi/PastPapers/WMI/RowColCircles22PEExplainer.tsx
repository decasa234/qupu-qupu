import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { RowColCircles22PE } from './RowColCircles22PEIllustration'
import { buildRowColCircles22PESteps } from './rowColCircles22PESteps'

// Palette echoes the static figure (same qupu tokens).
const BRAND_BLUE  = '#30598A' // qupu-brand-blue — neutral chrome & equation labels
const ORANGE      = '#f0853a' // qupu-brand-orange — center circle & highlight
const SHELL       = '#FFF9F4' // qupu-shell (panel background)
const PEACH       = '#FFD3B1' // qupu-peach (panel border)
const GREEN       = '#10B981'
const GREEN_INK   = '#065F46'
const GREEN_SOFT  = '#D1FAE5'
const PEACH_SOFT  = '#FDE3CF' // matches the center-circle peach wash

// ── Row = Col equation chip ──────────────────────────────────────────────────
// Shows "row sum = col sum" for the currently displayed arrangement.
// Visible only on the three verify beats.
function SumChip({
  rowLabel,
  rowSum,
  colLabel,
  colSum,
  T,
}: {
  rowLabel: string
  rowSum: number
  colLabel: string
  colSum: number
  T: (en: string, id: string) => string
}) {
  const equal = rowSum === colSum
  return (
    <div
      className="flex items-center gap-2 rounded-xl border-2 px-3 py-1.5"
      style={{ background: equal ? GREEN_SOFT : PEACH_SOFT, borderColor: equal ? GREEN : ORANGE }}
    >
      <span className="font-display text-[11px] font-bold" style={{ color: BRAND_BLUE }}>
        {T('Row', 'Baris')}
      </span>
      <span className="font-display text-lg font-black tabular-nums" style={{ color: BRAND_BLUE }}>
        {rowLabel}
      </span>
      <span className="font-display text-lg font-black" style={{ color: BRAND_BLUE }}>=</span>
      <span className="font-display text-[11px] font-bold" style={{ color: BRAND_BLUE }}>
        {T('Col', 'Kolom')}
      </span>
      <span className="font-display text-lg font-black tabular-nums" style={{ color: BRAND_BLUE }}>
        {colLabel}
      </span>
      {equal && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          className="font-display text-base font-black"
          style={{ color: GREEN_INK }}
        >
          ✓
        </motion.span>
      )}
    </div>
  )
}

// ── Parity chip — the key deduction ─────────────────────────────────────────
// Shows "x = 15 − 2k → x must be odd" once the parity beat is reached.
function ParityChip({ T }: { T: (en: string, id: string) => string }) {
  return (
    <div
      className="rounded-xl border-2 px-4 py-2 text-center"
      style={{ background: '#E1EFFB', borderColor: BRAND_BLUE }}
    >
      <span className="font-display text-sm font-extrabold" style={{ color: BRAND_BLUE }}>
        x = 15 − 2k &nbsp;→&nbsp;
      </span>
      <span className="font-display text-sm font-extrabold" style={{ color: ORANGE }}>
        {T('x must be odd', 'x harus ganjil')}
      </span>
    </div>
  )
}

export default function RowColCircles22PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildRowColCircles22PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  // Build sum-chip labels for verify phases.
  const sumChipData = (() => {
    if (beat.revealCenter == null || beat.revealArms == null) return null
    const [top, left, right, bottom] = beat.revealArms
    const c = beat.revealCenter
    const rowSum = left + c + right
    const colSum = top + c + bottom
    return {
      rowLabel: `${left}+${c}+${right}=${rowSum}`,
      rowSum,
      colLabel: `${top}+${c}+${bottom}=${colSum}`,
      colSum,
    }
  })()

  const isVerify = ['verify-1', 'verify-3', 'verify-5'].includes(beat.phase)
  const showParity = ['parity', 'verify-1', 'verify-3', 'verify-5'].includes(beat.phase)

  const ariaLabel = T(
    'Strategy: 1+2+3+4+5=15. Row=Col means center = 15 − 2×(arm pair sum), which must be odd. Valid odd values from {1,2,3,4,5} are 1, 3, and 5. All three work. Answer E.',
    'Strategi: 1+2+3+4+5=15. Baris=Kolom berarti pusat = 15 − 2×(jumlah lengan), yang harus ganjil. Nilai ganjil yang valid dari {1,2,3,4,5} adalah 1, 3, dan 5. Ketiganya berhasil. Jawaban E.',
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[400px] flex-col items-center justify-start gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* parity deduction chip — appears from beat 3 (parity) onwards */}
        {showParity && (
          <motion.div
            key="parity-chip"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <ParityChip T={T} />
          </motion.div>
        )}

        {/* five-circle plus figure — binds the built primitive */}
        <RowColCircles22PE
          revealCenter={beat.revealCenter ?? undefined}
          revealArms={beat.revealArms ?? undefined}
        />

        {/* sum-chip — visible on verify beats */}
        {isVerify && sumChipData && (
          <motion.div
            key={`sum-${beat.phase}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          >
            <SumChip
              rowLabel={sumChipData.rowLabel}
              rowSum={sumChipData.rowSum}
              colLabel={sumChipData.colLabel}
              colSum={sumChipData.colSum}
              T={T}
            />
          </motion.div>
        )}

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
              : isVerify
                ? { background: PEACH_SOFT, borderColor: ORANGE, color: '#9a4a14' }
                : { background: '#E1EFFB', borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
