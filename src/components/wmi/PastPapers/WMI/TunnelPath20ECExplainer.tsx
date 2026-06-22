// IKMC-22-EC-Q20 explainer — "Alma wants to put one of the pieces in the
// middle so that a child in A can travel to B and E, but not to D."
//
// Animation strategy (beat-by-beat):
//   0. Intro: show the goal (A→B✓, A→E✓, A→D✗)
//   1–5. Test each piece (1-5): highlight A's exits, mark works/fails
//   6. Result: pieces 1 and 5 → answer E

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { TunnelPath20EC, PIECE_SPOKES, type PieceId } from './TunnelPath20ECIllustration'
import { buildTunnelPath20ECSteps } from './tunnelPath20ECSteps'

// ── Colour tokens ────────────────────────────────────────────────────────────
const BLUE      = '#30598A'
const BLUE_BG   = '#E1EFFB'
const GREEN     = '#10B981'
const GREEN_BG  = '#D1FAE5'
const GREEN_TXT = '#065F46'
const RED       = '#EF4444'
const RED_BG    = '#FEE2E2'
const RED_TXT   = '#991B1B'
const ORANGE    = '#F59E0B'
const GREY      = '#9CA3AF'

// ── Piece connectivity display ───────────────────────────────────────────────

/** Draw a small piece hex inside the explainer animation panel. */
function PieceHexMini({ pieceId, works }: { pieceId: PieceId; works: boolean | null }) {
  const CX = 40; const CY = 40; const R = 32; const IR = 28
  const spokes = PIECE_SPOKES[pieceId]
  const ROAD = '#B8B8B8'
  const ROAD_W = 6
  const DASH = '#FFFFFF'
  const DASH_W = 1.5
  const DASH_ARR = '4,4'

  // Flat-top hex directions (same as illustration)
  const HEX_DIRS: Array<[number, number]> = [
    [1, 0],
    [Math.cos(Math.PI / 3), Math.sin(Math.PI / 3)],
    [Math.cos((2 * Math.PI) / 3), Math.sin((2 * Math.PI) / 3)],
    [-1, 0],
    [Math.cos((4 * Math.PI) / 3), Math.sin((4 * Math.PI) / 3)],
    [Math.cos((5 * Math.PI) / 3), Math.sin((5 * Math.PI) / 3)],
  ]

  // Hex polygon points (flat-top)
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i)
    return `${CX + R * Math.cos(a)},${CY + R * Math.sin(a)}`
  }).join(' ')

  const borderColor = works === true ? GREEN : works === false ? RED : GREY

  return (
    <svg viewBox="0 0 80 80" width={72} height={72} style={{ display: 'block' }}>
      {/* Road spokes */}
      {spokes.map((s) => {
        const [dx, dy] = HEX_DIRS[s]
        const ex = CX + dx * IR
        const ey = CY + dy * IR
        return (
          <g key={s}>
            <line x1={CX} y1={CY} x2={ex} y2={ey} stroke={ROAD} strokeWidth={ROAD_W} strokeLinecap="butt" />
            <line x1={CX} y1={CY} x2={ex} y2={ey} stroke={DASH} strokeWidth={DASH_W} strokeLinecap="butt" strokeDasharray={DASH_ARR} />
          </g>
        )
      })}
      {/* Hex border */}
      <polygon points={pts} fill="none" stroke={borderColor} strokeWidth={2.5} />
      {/* Piece number */}
      <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fontSize={14} fill={borderColor} fontWeight="bold">
        {pieceId}
      </text>
    </svg>
  )
}

// ── Piece chip (small status pills for all 5 pieces) ────────────────────────

function PieceChip({ pieceId, verdict }: { pieceId: number; verdict: boolean | null }) {
  let bg = '#F3F4F6'
  let color = GREY
  let text = '·'
  if (verdict === true) { bg = GREEN_BG; color = GREEN; text = '✓' }
  if (verdict === false) { bg = RED_BG; color = RED_TXT; text = '✗' }
  return (
    <motion.div
      animate={{ scale: verdict !== null ? 1 : 0.9, opacity: verdict !== null ? 1 : 0.6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="flex flex-col items-center gap-0.5 rounded-lg border-2 px-2 py-1"
      style={{ borderColor: color, background: bg, minWidth: 36 }}
    >
      <span className="font-display text-xs font-black" style={{ color }}>{pieceId}</span>
      <span className="font-display text-sm font-black" style={{ color }}>{text}</span>
    </motion.div>
  )
}

// ── Main explainer ────────────────────────────────────────────────────────────

export default function TunnelPath20ECExplainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(
    () => buildTunnelPath20ECSteps(props.correctAnswer, lang),
    [props.correctAnswer, lang],
  )
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Track verdicts revealed so far (for chip rail)
  const verdictsSoFar: Record<number, boolean | null> = {}
  for (let i = 1; i <= 5; i++) verdictsSoFar[i] = null
  for (let b = 0; b <= index; b++) {
    const s = story.steps[b]
    if (s.phase === 'test' && s.pieceId !== null) {
      verdictsSoFar[s.pieceId] = s.works
    }
    if (s.phase === 'result') {
      // All pieces resolved
      verdictsSoFar[1] = true; verdictsSoFar[2] = false
      verdictsSoFar[3] = false; verdictsSoFar[4] = false; verdictsSoFar[5] = true
    }
  }

  const isResult = beat.result
  const captionStyle = isResult
    ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
    : beat.works === false
      ? { background: RED_BG, borderColor: RED, color: RED_TXT }
      : beat.works === true && !isResult
        ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_TXT }
        : { background: BLUE_BG, borderColor: BLUE, color: BLUE }

  const ariaLabel = t(
    `Explainer: test each piece for A-to-B and A-to-E connectivity without A-to-D. Pieces 1 and 5 work when rotated. Answer ${story.answer}.`,
    `Penjelasan: uji setiap potongan untuk konektivitas A-ke-B dan A-ke-E tanpa A-ke-D. Potongan 1 dan 5 berhasil saat diputar. Jawaban ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[340px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">

        {/* Goal reminder: A→B✓, A→E✓, A→D✗ */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="rounded px-2 py-0.5" style={{ background: GREEN_BG, color: GREEN_TXT }}>A→B ✓</span>
          <span className="rounded px-2 py-0.5" style={{ background: GREEN_BG, color: GREEN_TXT }}>A→E ✓</span>
          <span className="rounded px-2 py-0.5" style={{ background: RED_BG, color: RED_TXT }}>A→D ✗</span>
        </div>

        {/* Main visual area: stem diagram OR currently-tested piece */}
        <AnimatePresence mode="wait">
          {beat.phase === 'intro' || beat.phase === 'result' ? (
            <motion.div
              key="stem"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}
            >
              <TunnelPath20EC />
            </motion.div>
          ) : beat.pieceId !== null ? (
            <motion.div
              key={`piece-${beat.pieceId}`}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              className="flex flex-col items-center gap-1"
            >
              <PieceHexMini pieceId={beat.pieceId as PieceId} works={beat.works} />
              <span
                className="rounded-full px-3 py-0.5 font-display text-sm font-black"
                style={{
                  background: beat.works ? GREEN_BG : RED_BG,
                  color: beat.works ? GREEN_TXT : RED_TXT,
                }}
              >
                {t(`Piece ${beat.pieceId}`, `Potongan ${beat.pieceId}`)}
                {' '}
                {beat.works ? '✓' : '✗'}
              </span>
              {beat.works && (
                <div className="flex gap-2 text-[10px] font-bold">
                  <span style={{ color: ORANGE }}>
                    {t('Can rotate to satisfy!', 'Bisa diputar agar sesuai!')}
                  </span>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Chip rail: verdict for each piece */}
        <div className="flex items-center justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((pid) => (
            <PieceChip key={pid} pieceId={pid} verdict={verdictsSoFar[pid]} />
          ))}
        </div>

        {/* Caption box */}
        <motion.div
          key={`cap-${index}`}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={captionStyle}
        >
          {beat.caption}
        </motion.div>
      </div>
    </div>
  )
}
