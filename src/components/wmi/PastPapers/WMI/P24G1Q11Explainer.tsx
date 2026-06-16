import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Piece6, PIECE_FILL, PIECE_FILL_2, Q11_INK, TARGET_FILL } from './P24G1Q11Illustration'
import { buildP24G1Q11Steps } from './p24G1Q11Steps'

// Palette echoes the static figure (light-blue first copy, peach rotated copy).
const BLUE = '#30598A' // qupu-brand-blue
const SHELL = '#FFF9F4' // qupu-shell (panel)
const TRAY_SIDE = '#E4DACB' // warm grey (panel border)
const GREEN = '#10B981'
const GREEN_INK = '#065F46'

// Mini-diagram viewport: one target square, centred, with headroom.
const VIEW = 160
const SQ = 110
const SQ_X = (VIEW - SQ) / 2
const SQ_Y = (VIEW - SQ) / 2

export default function P24G1Q11Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildP24G1Q11Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const ariaLabel = T(
    `Strategy: piece 6 covers half the square; a second piece 6 rotated a half turn fills the rest, so the pair is 6 + 6 — answer ${story.answerLetter}.`,
    `Strategi: potongan 6 menutup separuh persegi; potongan 6 kedua diputar setengah putaran mengisi sisanya, jadi pasangannya 6 + 6 — jawaban ${story.answerLetter}.`,
  )

  // The second copy slides in from the upper-right while "turning"; seats at the
  // target when locked. Deterministic offset based on the beat (no animation libs
  // needed for SSR correctness — framer would animate, but the static transform
  // already reads correctly).
  const secondOffset = beat.secondSeated ? 0 : 16

  return (
    <div className="mx-auto w-full max-w-[360px]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border-2 px-4 py-4"
        style={{ background: SHELL, borderColor: TRAY_SIDE }}
      >
        {/* legend chips */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-display text-[11px] font-extrabold" style={{ color: BLUE }}>
            <span className="inline-block h-3 w-3 rounded-sm border-2" style={{ borderColor: Q11_INK, background: PIECE_FILL }} />
            {T('piece 6', 'potongan 6')}
          </span>
          <span className="flex items-center gap-1.5 font-display text-[11px] font-extrabold" style={{ color: '#C8631F' }}>
            <span className="inline-block h-3 w-3 rounded-sm border-2" style={{ borderColor: Q11_INK, background: PIECE_FILL_2 }} />
            {T('piece 6, turned', 'potongan 6, diputar')}
          </span>
        </div>

        {/* assembly mini-diagram */}
        <svg viewBox={`0 0 ${VIEW} ${VIEW}`} width="100%" style={{ maxWidth: 200, display: 'block', margin: '0 auto' }} aria-hidden="true">
          {/* target square outline */}
          <rect
            x={SQ_X}
            y={SQ_Y}
            width={SQ}
            height={SQ}
            rx={3}
            fill={beat.complete ? '#D1FAE5' : TARGET_FILL}
            stroke={beat.complete ? GREEN : Q11_INK}
            strokeWidth={beat.complete ? 3.5 : 2.5}
          />

          {/* first copy of piece 6 (lower-left half) */}
          {beat.showFirst && <Piece6 x={SQ_X} y={SQ_Y} size={SQ} fill={PIECE_FILL} />}

          {/* second copy, rotated 180° (upper-right half); offset until seated */}
          {beat.showSecond && (
            <g transform={`translate(${secondOffset} ${-secondOffset})`} opacity={beat.secondSeated ? 1 : 0.85}>
              <Piece6 x={SQ_X} y={SQ_Y} size={SQ} fill={PIECE_FILL_2} rotated />
            </g>
          )}
        </svg>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: GREEN_INK }
              : { background: '#E1EFFB', borderColor: BLUE, color: BLUE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
