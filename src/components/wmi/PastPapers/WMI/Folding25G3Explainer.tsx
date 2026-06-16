import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FoldGlyph, FOLD_LABELS, type FoldLabel } from './Folding25G3Illustration'
import { buildFolding25G3Steps } from './folding25G3Steps'

// WMI-25F3A-Q10 post-answer explainer. The static figure shows a rectangle of
// paper and five lime shapes A–E; the question asks how many can come from ONE
// fold. The method is try-each-shape: walk A→B→C→D→E, show why a single fold
// makes each, tick a running counter, and land on 5 = choice A. We REUSE
// FoldGlyph / FOLD_SHAPES / FOLD_LABELS from the illustration so the animated
// scene is literally the same shapes coming alive.

// Echo the figure's palette (the scan's lime; literal hex per this folder's
// convention, see Folding25G3Illustration).
const INK = '#1F2937'
const LIME = '#A4C520'
const LIME_DARK = '#7A9415'
const GREEN = '#10B981'
const BLUE = '#30598A'

// Right-side placements for the five candidate shapes inside the 420×150 stage,
// two rows: A B C across the top, D E below — same reading order as the figure.
const PLACEMENTS: Array<{ label: FoldLabel; ox: number; oy: number; size: number }> = [
  { label: 'A', ox: 150, oy: 8, size: 58 },
  { label: 'B', ox: 230, oy: 8, size: 70 },
  { label: 'C', ox: 322, oy: 6, size: 56 },
  { label: 'D', ox: 178, oy: 78, size: 64 },
  { label: 'E', ox: 286, oy: 86, size: 50 },
]

export default function Folding25G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildFolding25G3Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={t(
        'Testing each shape against one fold of the rectangle: all five shapes can be made, so the answer is 5 (A).',
        'Menguji tiap bentuk terhadap satu lipatan persegi panjang: kelima bentuk bisa dibuat, jadi jawabannya 5 (A).',
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <svg viewBox="0 0 420 150" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }} aria-hidden="true">
          <rect x={0} y={0} width={420} height={150} rx={10} fill="#F1F6E8" />

          {/* Left: the rectangle of paper, with a one-fold crease the active try animates. */}
          <rect x={20} y={52} width={92} height={56} fill={LIME} stroke={LIME_DARK} strokeWidth={2} rx={2} />
          {/* A dashed crease line + a corner flap folding over, shown while testing a shape. */}
          {beat.label != null && (
            <g>
              <motion.line
                key={`crease-${beat.label}`}
                x1={20}
                y1={108}
                x2={112}
                y2={52}
                stroke={INK}
                strokeWidth={1.6}
                strokeDasharray="4 5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.8 }}
                transition={{ duration: 0.45 }}
              />
              <motion.polygon
                key={`flap-${beat.label}`}
                points="112,52 112,108 20,108"
                fill={LIME_DARK}
                fillOpacity={0.55}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                style={{ transformOrigin: '66px 80px' }}
              />
            </g>
          )}
          <text x={66} y={128} textAnchor="middle" fontSize={11} fontWeight={700} fill={BLUE} className="font-display">
            {t('1 fold', '1 lipatan')}
          </text>

          {/* Divider between the paper and the candidates. */}
          <line x1={130} y1={10} x2={130} y2={140} stroke={INK} strokeWidth={1.4} strokeDasharray="3 6" strokeLinecap="round" opacity={0.5} />

          {/* Right: the five candidate shapes. Active one pops + gets a ✓; solved
              ones keep a small ✓; not-yet-tested ones sit dim. */}
          {PLACEMENTS.map((p) => {
            const order = FOLD_LABELS.indexOf(p.label)
            const isActive = beat.label === p.label
            // A shape is "solved" once the running counter has passed its order.
            const solved = beat.count > order
            const dim = !isActive && !solved
            const cx = p.ox + p.size / 2
            const cy = p.oy + p.size / 2
            return (
              <motion.g
                key={p.label}
                animate={{ scale: isActive ? 1.12 : 1, opacity: dim ? 0.32 : 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              >
                <FoldGlyph label={p.label} ox={p.ox} oy={p.oy} size={p.size} showLabel strokeWidth={isActive ? 3 : 2} />
                {isActive && (
                  <circle cx={cx} cy={cy} r={p.size * 0.62} fill="none" stroke={GREEN} strokeWidth={2.5} strokeDasharray="6 5" />
                )}
                {(isActive || solved) && (
                  <motion.text
                    key={`tick-${p.label}-${solved ? 'y' : 'a'}`}
                    x={p.ox + p.size - 6}
                    y={p.oy + 8}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={16}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 16 }}
                  >
                    ✅
                  </motion.text>
                )}
              </motion.g>
            )
          })}
        </svg>

        {/* Running counter: how many of the five fold so far. */}
        <div className="flex items-center gap-2 font-display text-xs font-bold" style={{ color: BLUE }}>
          <span>{t('folds that work', 'lipatan yang bisa')}</span>
          <motion.span
            key={`count-${beat.count}`}
            initial={{ scale: 0.5, opacity: 0.4 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 16 }}
            className="inline-flex h-6 min-w-[1.6rem] items-center justify-center rounded-full px-1 text-sm font-extrabold text-white"
            style={{ background: beat.result ? GREEN : BLUE }}
          >
            {beat.count}
          </motion.span>
          <span style={{ opacity: 0.6 }}>/ {story.total}</span>
        </div>

        {/* Caption / verdict box. */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
