import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { Jigsaw23G1, PolyShape, PIECE_CELLS, cellSpan } from './Jigsaw23G1Illustration'
import { buildJigsaw23G1Steps, type PieceView } from './jigsaw23G1Steps'

// WMI-23F1A-Q10 — "Which figure completes the jigsaw?" (answer B).
// Deduction walk, one idea per beat: count the hole (9 cells); reject A/C/E for
// having only 8 cells (too few); reject D (9 cells but wrong shape); then B (9
// cells) drops into the hole when turned. Mirrors the static figure — same peach
// board, brand-blue outlines, orange winning piece — by reusing the Jigsaw23G1
// primitive and PolyShape from the illustration. Rejections linger; the winning
// beat lands last with hold 0.

const CELL_FILL = '#FFD3B1' // fill-qupu-peach — candidate piece squares
const PIECE_FILL = '#f0853a' // fill-qupu-orange — the piece that fits (B)
const CELL_STROKE = '#30598A' // fill-qupu-brand-blue — cell outlines
const GREEN = '#10B981'
const RED = '#DC2626'

// A small candidate piece in its own card, drawn from PIECE_CELLS so it reads
// as the same polyomino glyph the static A–E options use.
function PieceCard({ piece, lang }: { piece: PieceView; lang: 'en' | 'id' }) {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const cells = PIECE_CELLS[piece.id]
  const span = cellSpan(cells)
  const cell = 16
  const pad = 4
  const w = span.cols * cell + pad * 2
  const h = span.rows * cell + pad * 2
  const fits = piece.verdict === 'fits'
  const accent = fits ? GREEN : RED

  return (
    <div
      className="flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-1.5"
      style={{
        background: fits ? '#D1FAE5' : '#FEE2E2',
        borderColor: accent,
      }}
    >
      <div className="font-display text-xs font-black" style={{ color: accent }}>
        {piece.id}
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} role="presentation">
        <PolyShape
          cells={cells}
          x={pad}
          y={pad}
          cell={cell}
          fill={fits ? PIECE_FILL : CELL_FILL}
          stroke={CELL_STROKE}
          strokeWidth={1.5}
        />
      </svg>
      <div className="font-display text-[0.65rem] font-bold tabular-nums" style={{ color: accent }}>
        {fits
          ? t(`${piece.size} cells ✓`, `${piece.size} kotak ✓`)
          : t(`${piece.size} cells ✗`, `${piece.size} kotak ✗`)}
      </div>
    </div>
  )
}

export default function Jigsaw23G1Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const story = useMemo(() => buildJigsaw23G1Steps(lang), [lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const ariaLabel = t(
    `Explainer: the hole is ${story.holeSize} cells. A, C and E have only 8 cells — too few. D has 9 cells but the wrong shape. B has 9 cells and fits when turned — the answer is ${story.answer}.`,
    `Penjelasan: lubangnya ${story.holeSize} kotak. A, C, dan E hanya 8 kotak — terlalu sedikit. D punya 9 kotak tapi bentuknya salah. B punya 9 kotak dan pas saat diputar — jawabannya ${story.answer}.`,
  )

  return (
    <div className="mx-auto w-full max-w-[320px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* goal banner — the rule both checks lean on */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-center font-display text-xs font-bold text-amber-700">
          <span aria-hidden className="inline-block h-3 w-3 rounded-sm" style={{ background: CELL_FILL, border: `1.5px solid ${CELL_STROKE}` }} />
          {t(`Need ${story.holeSize} cells, same shape`, `Butuh ${story.holeSize} kotak, bentuk sama`)}
        </div>

        {/* the puzzle board — hole empty until B drops in on the win beat */}
        <div className="relative flex items-center justify-center">
          <Jigsaw23G1 showPiece={beat.showPiece} />
          {beat.countHole && (
            <motion.div
              key="hole-count"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 18 }}
              className="pointer-events-none absolute -top-2 right-0 rounded-full px-2 py-0.5 font-display text-sm font-black text-white shadow"
              style={{ background: CELL_STROKE }}
            >
              {t(`hole = ${story.holeSize}`, `lubang = ${story.holeSize}`)}
            </motion.div>
          )}
        </div>

        {/* candidate pieces being judged this beat */}
        <div className="flex min-h-[5rem] items-center justify-center gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {beat.pieces.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              >
                <PieceCard piece={p} lang={lang} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div
          className="min-h-[3rem] rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.reject
                ? { background: '#FEE2E2', borderColor: RED, color: '#991B1B' }
                : { background: '#E1EFFB', borderColor: CELL_STROKE, color: CELL_STROKE }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
