// IKMC-23-EC-Q22 — post-answer explainer for the two-machine rotation problem.
//
// Walks through the RSR sequence beat by beat:
//   start (dot bl) → R (dot br) → S (club stamped) → R (dot tr, club rotates) → result.
//
// Reuses RotatePaper + dotPos from Rotate22ECIllustration for the animated paper,
// and the MachineLegend primitive as a static reference strip at the top.

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { buildRotate22ECSteps } from './rotate22ECSteps'
import { RotatePaper, PAPER_SZ } from './Rotate22ECIllustration'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_INK  = '#065F46'
const BLUE_BG    = '#E1EFFB'
const BLUE_INK   = '#30598A'
const AMBER      = '#F59E0B'
const AMBER_BG   = '#FEF3C7'
const AMBER_INK  = '#78350F'
const SLATE_BG   = '#F1F5F9'
const SLATE_INK  = '#475569'

const MACHINE_R_BG  = '#BAE6FD'
const MACHINE_S_BG  = '#FECACA'
const MACHINE_R_INK = '#1E40AF'
const MACHINE_S_INK = '#991B1B'

// ── mini machine indicator ────────────────────────────────────────────────────
function MachineTag({
  label,
  active,
}: {
  label: 'R' | 'S'
  active: boolean
}) {
  const bg  = label === 'R' ? MACHINE_R_BG  : MACHINE_S_BG
  const ink = label === 'R' ? MACHINE_R_INK : MACHINE_S_INK
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-xl font-display text-lg font-black transition-all"
      style={{
        background: active ? bg   : SLATE_BG,
        color:      active ? ink  : '#94A3B8',
        border: `2px solid ${active ? ink : '#CBD5E1'}`,
        transform:  active ? 'scale(1.12)' : 'scale(1)',
      }}
    >
      {label}
    </div>
  )
}

// ── sequence badge strip ──────────────────────────────────────────────────────
// Shows R → S → R with the active machine highlighted
function SequenceStrip({
  step,
  lang,
}: {
  step: number   // 0=intro, 1=after R₁, 2=after S, 3=after R₂, 4=result
  lang: 'en' | 'id'
}) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const activeIdx = step - 1  // which machine is active: 0=R, 1=S, 2=R, -1=none
  const machines: ('R' | 'S')[] = ['R', 'S', 'R']

  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-xs font-bold" style={{ color: SLATE_INK }}>
        {t('Sequence:', 'Urutan:')}
      </span>
      {machines.map((m, i) => (
        <div key={i} className="flex items-center gap-1">
          <MachineTag label={m} active={activeIdx === i} />
          {i < machines.length - 1 && (
            <span className="text-slate-400 font-bold text-xs">→</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── paper SVG ─────────────────────────────────────────────────────────────────
const PAP_SZ = PAPER_SZ * 2   // enlarge for readability in explainer
const PAD = 12
const SVG_SZ = PAP_SZ + PAD * 2

function AnimatedPaper({
  dotCorner,
  showClub,
}: {
  dotCorner: import('./Rotate22ECIllustration').DotCorner
  showClub: boolean
}) {
  return (
    <svg
      viewBox={`0 0 ${SVG_SZ} ${SVG_SZ}`}
      width={Math.min(120, SVG_SZ * 2)}
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <RotatePaper
        x={PAD}
        y={PAD}
        sz={PAP_SZ}
        dotCorner={dotCorner}
        showClub={showClub}
      />
    </svg>
  )
}

// ── ARIA ──────────────────────────────────────────────────────────────────────
const ARIA_EN =
  'Explainer: Starting paper has a dot in the bottom-left corner. ' +
  'Step 1 — machine R rotates 90° clockwise: dot moves to bottom-right. ' +
  'Step 2 — machine S stamps a club: club now on the paper. ' +
  'Step 3 — machine R rotates 90° clockwise again: dot moves to top-right, club rotates with paper. ' +
  'The sequence R→S→R produces the shown result. Answer B (RSR).'

const ARIA_ID =
  'Penjelasan: Kertas awal memiliki titik di sudut kiri bawah. ' +
  'Langkah 1 — mesin R memutar 90° searah jarum jam: titik berpindah ke kanan bawah. ' +
  'Langkah 2 — mesin S menstempel klub: klub kini ada di kertas. ' +
  'Langkah 3 — mesin R memutar 90° searah jarum jam lagi: titik ke kanan atas, klub ikut berputar. ' +
  'Urutan R→S→R menghasilkan hasil yang ditunjukkan. Jawaban B (RSR).'

// ── explainer component ───────────────────────────────────────────────────────
export default function Rotate22ECExplainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildRotate22ECSteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const isResult = beat.result

  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : beat.lastMachine === 'R'
      ? { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }
      : beat.lastMachine === 'S'
        ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }
        : { background: SLATE_BG, borderColor: '#CBD5E1', color: SLATE_INK }

  return (
    <div
      className="mx-auto w-full max-w-[340px]"
      role="img"
      aria-label={lang === 'id' ? ARIA_ID : ARIA_EN}
    >
      <div className="flex flex-col items-center gap-3">

        {/* sequence strip showing R→S→R with active highlight */}
        <SequenceStrip step={index} lang={lang} />

        {/* state label */}
        <AnimatePresence mode="wait">
          {beat.stateLabel && (
            <motion.div
              key={beat.stateLabel}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-lg px-3 py-1 font-display text-xs font-extrabold"
              style={{ background: SLATE_BG, color: SLATE_INK }}
            >
              {beat.stateLabel}
            </motion.div>
          )}
        </AnimatePresence>

        {/* animated paper */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${beat.dotCorner}-${beat.showClub}`}
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <AnimatedPaper dotCorner={beat.dotCorner} showClub={beat.showClub} />
          </motion.div>
        </AnimatePresence>

        {/* dot position row */}
        <div className="flex items-center gap-3">
          <div
            className="rounded-lg px-3 py-1 font-display text-xs font-bold"
            style={{ background: SLATE_BG, color: SLATE_INK }}
          >
            {t('Dot: ', 'Titik: ')}
            <span className="font-black">
              {beat.dotCorner === 'bl' ? t('bottom-left', 'kiri bawah')
               : beat.dotCorner === 'br' ? t('bottom-right', 'kanan bawah')
               : beat.dotCorner === 'tr' ? t('top-right', 'kanan atas')
               : beat.dotCorner === 'tl' ? t('top-left', 'kiri atas')
               : '—'}
            </span>
          </div>
          <div
            className="rounded-lg px-3 py-1 font-display text-xs font-bold"
            style={{
              background: beat.showClub ? AMBER_BG : SLATE_BG,
              color:      beat.showClub ? AMBER_INK : '#94A3B8',
              borderColor: beat.showClub ? AMBER : '#CBD5E1',
            }}
          >
            {beat.showClub ? t('♣ stamped', '♣ ada') : t('♣ none', '♣ belum')}
          </div>
        </div>

        {/* answer badge */}
        <div className="flex min-h-[2.25rem] items-center justify-center">
          <AnimatePresence>
            {isResult && (
              <motion.div
                key="result"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                className="rounded-full px-5 py-1 font-display text-sm font-black text-white"
                style={{ background: GREEN }}
              >
                {t('Answer B — RSR', 'Jawaban B — RSR')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* caption */}
        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
