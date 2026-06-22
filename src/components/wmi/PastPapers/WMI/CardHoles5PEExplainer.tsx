// IKMC-20-PE-Q5 — post-answer explainer for the card-holes overlay question.
//
// Reuses CardHoles5PE from CardHoles5PEIllustration so the animation reads as
// the static scene coming alive. Walks hole by hole showing what's visible
// (star or empty), then lands on answer A (3 stars + 1 empty).

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CardHoles5PE } from './CardHoles5PEIllustration'
import { buildCardHoles5PESteps } from './cardHoles5PESteps'

// ── colour tokens ─────────────────────────────────────────────────────────────
const GREEN      = '#10B981'
const GREEN_BG   = '#D1FAE5'
const GREEN_INK  = '#065F46'
const BLUE_BG    = '#E1EFFB'
const BLUE_INK   = '#30598A'
const AMBER      = '#F59E0B'  // matches the active hole ring in the illustration
const AMBER_BG   = '#FEF3C7'
const AMBER_INK  = '#78350F'

// ── small hole-indicator chip ─────────────────────────────────────────────────
// Shows a labelled dot (filled=star, empty=ring) for one hole position.
type HoleState = 'star' | 'empty' | 'pending'

function HoleChip({ label, state, active }: { label: string; state: HoleState; active: boolean }) {
  const bg     = active ? AMBER_BG   : state === 'star' ? GREEN_BG  : state === 'empty' ? '#F8FAFC' : '#F1F5F9'
  const border = active ? AMBER      : state === 'star' ? GREEN      : state === 'empty' ? '#94A3B8' : '#CBD5E1'
  const ink    = active ? AMBER_INK  : state === 'star' ? GREEN_INK  : state === 'empty' ? '#475569' : '#94A3B8'
  const mark   = state === 'star' ? '★' : state === 'empty' ? '○' : '·'

  return (
    <motion.div
      className="flex flex-col items-center gap-0.5"
      animate={{ scale: active ? [1, 1.15, 1] : 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <span className="font-display text-[9px] font-extrabold" style={{ color: ink }}>
        {label}
      </span>
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg border-2 font-display text-base font-black"
        style={{ background: bg, borderColor: border, color: ink }}
      >
        {mark}
      </div>
    </motion.div>
  )
}

export default function CardHoles5PEExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildCardHoles5PESteps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Derive each hole's display state based on beat progress.
  // Holes revealed in walk order: tr (beat 2), lc (beat 3), rc (beat 4), bl (beat 5).
  const holeRevealBeat: Record<string, { beat: number; hasStar: boolean; label: string }> = {
    tr: { beat: 2, hasStar: true,  label: t('top-R', 'kanan-atas') },
    lc: { beat: 3, hasStar: true,  label: t('left',  'kiri') },
    rc: { beat: 4, hasStar: true,  label: t('right', 'kanan') },
    bl: { beat: 5, hasStar: false, label: t('bot-L', 'kiri-bawah') },
  }

  const holeOrder: Array<keyof typeof holeRevealBeat> = ['tr', 'lc', 'rc', 'bl']

  const getHoleState = (hid: string): HoleState => {
    const info = holeRevealBeat[hid]
    if (index < info.beat) return 'pending'
    return info.hasStar ? 'star' : 'empty'
  }

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
    : beat.activeHole
      ? { background: AMBER_BG, borderColor: AMBER, color: AMBER_INK }
      : { background: BLUE_BG, borderColor: BLUE_INK, color: BLUE_INK }

  const ariaLabel = t(
    `Explainer: Card A has 4 holes — top-right, left-center, right-center, bottom-left. Card B has 6 stars. When card A overlays card B, the top-right, left-center, and right-center holes each show a star; the bottom-left hole shows nothing. The result is 3 stars + 1 empty = answer A.`,
    `Penjelasan: Kartu A memiliki 4 lubang — kanan atas, tengah kiri, tengah kanan, kiri bawah. Kartu B memiliki 6 bintang. Saat kartu A menimpa kartu B, lubang kanan atas, tengah kiri, dan tengah kanan masing-masing menampilkan bintang; lubang kiri bawah tidak menampilkan apa pun. Hasilnya adalah 3 bintang + 1 kosong = jawaban A.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* SVG figure — CardHoles5PE primitive, switches to overlay at beat 1+ */}
        <CardHoles5PE
          overlaid={beat.overlaid}
          activeHole={beat.activeHole}
        />

        {/* 4-hole indicator strip */}
        <div className="flex items-end justify-center gap-2">
          {holeOrder.map((hid) => {
            const info = holeRevealBeat[hid]
            const state = getHoleState(hid)
            return (
              <HoleChip
                key={hid}
                label={info.label}
                state={state}
                active={beat.activeHole === hid}
              />
            )
          })}
        </div>

        {/* answer badge — appears on result beat */}
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
                {t('Answer A', 'Jawaban A')}
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
