import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { JerseyGlyph, JerseyPhotoFigure, JERSEYS_SOLUTION } from './Jerseys25G2Illustration'
import { buildJerseys25G2Steps } from './jerseys25G2Steps'

// WMI-25F2A-Q23 — post-answer explainer. Re-uses the static figure's jersey
// glyph + photo panel so the animation reads as the same scene coming alive.
// The full row 6 1 2 4 7 3 5 is rebuilt one photo at a time; the answer is only
// shown on the final beat.

const GREEN = '#10B981'
const SEAT_OPEN_FILL = '#EEF2FF' // pale slot waiting for a jersey
const SEAT_OPEN_STROKE = '#C7D2FE'
const SEAT_PIN_STROKE = '#E07320' // qupu-brand-orange — a just-pinned seat
const ROW_BG = '#F0F4FF'

// Seat geometry for the rebuilt left-to-right row.
const SEAT_W = 40
const SEAT_GAP = 8
const SEAT_H = 46
const ROW_N = JERSEYS_SOLUTION.length
const ROW_PAD_X = 16
const ROW_PAD_TOP = 30
const ROW_PAD_BOT = 14
const ROW_W = ROW_PAD_X * 2 + ROW_N * SEAT_W + (ROW_N - 1) * SEAT_GAP
const ROW_H = ROW_PAD_TOP + SEAT_H + ROW_PAD_BOT

export default function Jerseys25G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => buildJerseys25G2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // The active photo (if any) for the panel that "comes alive" this beat.
  const activePhoto = beat.photoLabel
    ? story.photos.find((p) => p.label === beat.photoLabel) ?? null
    : null

  const pinnedSet = useMemo(() => new Set(beat.pinnedSeats), [beat.pinnedSeats])
  const spotlightSet = useMemo(() => new Set(beat.spotlightSeats), [beat.spotlightSeats])

  return (
    <div
      className="mx-auto w-full max-w-[460px]"
      role="img"
      aria-label={t(
        `Line up each photo's clear jersey numbers to rebuild the row from left to right, giving ${story.answer}.`,
        `Sejajarkan nomor jersey yang jelas dari tiap foto untuk menyusun ulang barisan dari kiri ke kanan, hasilnya ${story.answer}.`,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        {/* ── The rebuilt left-to-right row ──────────────────────────────── */}
        <svg
          viewBox={`0 0 ${ROW_W} ${ROW_H}`}
          width="100%"
          style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          <rect x={0} y={0} width={ROW_W} height={ROW_H} rx={12} fill={ROW_BG} />
          <text
            x={ROW_W / 2}
            y={15}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={800}
            fill="#1E40AF"
          >
            {t('left  →  right', 'kiri  →  kanan')}
          </text>

          {JERSEYS_SOLUTION.map((_, seat) => {
            const cx = ROW_PAD_X + seat * (SEAT_W + SEAT_GAP) + SEAT_W / 2
            const cy = ROW_PAD_TOP + SEAT_H / 2
            const value = beat.rowSoFar[seat]
            const filled = value !== null
            const inActivePhoto = spotlightSet.has(seat)
            return (
              <g key={seat}>
                {/* Spotlight frame on the seats the active photo is fixing */}
                {inActivePhoto && (
                  <rect
                    x={cx - SEAT_W / 2 - 4}
                    y={cy - SEAT_H / 2 - 4}
                    width={SEAT_W + 8}
                    height={SEAT_H + 8}
                    rx={7}
                    fill="none"
                    stroke={SEAT_PIN_STROKE}
                    strokeWidth={2.4}
                    strokeDasharray="6 4"
                  />
                )}
                {filled ? (
                  <motion.g
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  >
                    <JerseyGlyph cx={cx} cy={cy} value={null} revealed={value} />
                  </motion.g>
                ) : (
                  // Empty seat placeholder
                  <rect
                    x={cx - SEAT_W / 2}
                    y={cy - SEAT_H / 2}
                    width={SEAT_W}
                    height={SEAT_H}
                    rx={6}
                    fill={SEAT_OPEN_FILL}
                    stroke={SEAT_OPEN_STROKE}
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                  />
                )}
                {/* Seat position number underfoot */}
                <text
                  x={cx}
                  y={cy + SEAT_H / 2 + 9}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight={700}
                  fill={pinnedSet.has(seat) ? SEAT_PIN_STROKE : '#9CA3AF'}
                >
                  {seat + 1}
                </text>
              </g>
            )
          })}
        </svg>

        {/* ── The active photo coming alive (re-uses the static panel) ────── */}
        {activePhoto && (
          <svg
            viewBox="0 0 240 80"
            width="60%"
            style={{ maxWidth: 240, display: 'block', margin: '0 auto' }}
            aria-hidden="true"
          >
            <g transform="translate(8, 8)">
              <JerseyPhotoFigure
                photo={activePhoto}
                revealedSlots={beat.revealedSlots}
              />
            </g>
          </svg>
        )}

        {/* ── Caption ─────────────────────────────────────────────────────── */}
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
