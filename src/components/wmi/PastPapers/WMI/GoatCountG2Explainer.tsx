import { useMemo } from 'react'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { buildGoatCountG2Steps, WHITE, MORE, RAN_AWAY } from './goatCountG2Steps'

const GREEN = '#10B981'
const BLUE = '#2563EB'
const AMBER = '#D97706'
const INK = '#1F2937'
const GRAY = '#94A3B8'
const VIEW_W = 360
const VIEW_H = 150
const BAR_X0 = 70
const UNIT = 2.7 // px per goat
const BAR_H = 26
const WHITE_Y = 40
const BLACK_Y = 86

const w = (n: number) => n * UNIT

export default function GoatCountG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildGoatCountG2Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const whiteEnd = BAR_X0 + w(WHITE)
  const more28End = whiteEnd + w(MORE)
  const ran8End = more28End + w(RAN_AWAY)
  const blackEnd = beat.showRunaway ? ran8End : more28End

  const lab = lang === 'id' ? { white: 'Putih', black: 'Hitam' } : { white: 'White', black: 'Black' }
  const ariaLabel =
    lang === 'id'
      ? 'Penjelasan: kambing hitam = 54 (sama dengan putih) + 28 lebih + 8 yang lari = 90.'
      : 'Explainer: black goats = 54 (same as white) + 28 more + 8 that ran away = 90.'

  return (
    <div className="mx-auto w-full max-w-[400px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ maxWidth: 400, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {/* dashed guide at the white-bar end: the black "same as white" part lines up here */}
          {beat.showBlack && (
            <line x1={whiteEnd} y1={WHITE_Y - 6} x2={whiteEnd} y2={BLACK_Y + BAR_H + 6} stroke={GRAY} strokeWidth={1.5} strokeDasharray="4 4" />
          )}

          {/* White flock */}
          <text x={BAR_X0 - 8} y={WHITE_Y + BAR_H / 2} textAnchor="end" dominantBaseline="central" fontSize={13} fontWeight={700} fill={INK}>
            {lab.white}
          </text>
          <rect x={BAR_X0} y={WHITE_Y} width={w(WHITE)} height={BAR_H} rx={4} fill="#E5E7EB" stroke={GRAY} strokeWidth={2} />
          <text x={whiteEnd + 8} y={WHITE_Y + BAR_H / 2} dominantBaseline="central" fontSize={14} fontWeight={900} fill={INK} className="font-display">
            {WHITE}
          </text>

          {/* Black flock */}
          <text x={BAR_X0 - 8} y={BLACK_Y + BAR_H / 2} textAnchor="end" dominantBaseline="central" fontSize={13} fontWeight={700} fill={INK}>
            {lab.black}
          </text>
          {beat.showBlack && (
            <>
              {/* base — the same count as white */}
              <rect x={BAR_X0} y={BLACK_Y} width={w(WHITE)} height={BAR_H} rx={4} fill="#E5E7EB" stroke={GRAY} strokeWidth={2} />
              {/* +28 more than white */}
              <rect x={whiteEnd} y={BLACK_Y} width={w(MORE)} height={BAR_H} fill="#DBEAFE" stroke={BLUE} strokeWidth={2} />
              <text x={whiteEnd + w(MORE) / 2} y={BLACK_Y - 8} textAnchor="middle" fontSize={12} fontWeight={800} fill={BLUE} className="font-display">
                +{MORE}
              </text>
            </>
          )}
          {beat.showRunaway && (
            <>
              {/* +8 that ran away (were black too) */}
              <rect x={more28End} y={BLACK_Y} width={w(RAN_AWAY)} height={BAR_H} fill="#FEF3C7" stroke={AMBER} strokeWidth={2} />
              <text x={more28End + w(RAN_AWAY) / 2} y={BLACK_Y - 8} textAnchor="middle" fontSize={12} fontWeight={800} fill={AMBER} className="font-display">
                +{RAN_AWAY}
              </text>
            </>
          )}
          {beat.blackTotal > 0 && (
            <text x={blackEnd + 8} y={BLACK_Y + BAR_H / 2} dominantBaseline="central" fontSize={14} fontWeight={900} fill={beat.highlightAnswer ? GREEN : INK} className="font-display">
              {beat.blackTotal}
            </text>
          )}
        </svg>

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
