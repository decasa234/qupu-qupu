import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { IsoBox, SOLID24G2, STACK24 } from './Solid24G2Illustration'

// Post-answer animation for WMI-24F2A-Q9.
// Strategy: add one piece's height per beat, showing a running total, until the
// stack reaches 22 cm. Heights are derived from STACK24 + SOLID24G2 (no
// hardcoded numbers except through those data sources).

const INK = '#1F2937'
const GREEN = '#10B981'
const BLUE_CAP = '#30598A'

// Visual scale shared with the illustration file.
const PX = 6
const DEPTH_CM = 8

// Heights of the three stacked pieces, bottom → top, derived from data.
const STACK_PIECES = STACK24.map((id) => SOLID24G2[id])
const STACK_HEIGHTS = STACK_PIECES.map((p) => p.heightCm)
const STACK_TOTAL = STACK_HEIGHTS.reduce((a, b) => a + b, 0) // 22

// Base Y for the front-bottom-left of the bottom piece in the stack column.
// Enough vertical room for total height (22 × PX = 132 px) plus label space.
const STACK_BASE_Y = 178
const STACK_X = 220

interface Beat {
  /** How many pieces are visible in the stack (0 = none). */
  piecesShown: number
  /** Running height total after those pieces. */
  runningTotal: number
  caption: { en: string; id: string }
  hold: number
  result: boolean
}

function buildStory(lang: 'en' | 'id'): Beat[] {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const beats: Beat[] = []

  // Beat 0: goal statement, nothing drawn yet.
  beats.push({
    piecesShown: 0,
    runningTotal: 0,
    caption: {
      en: 'The composite is a stack — add each piece\'s height one at a time.',
      id: 'Benda gabungan adalah tumpukan — jumlahkan tinggi tiap bagian satu per satu.',
    },
    hold: 2600,
    result: false,
  })

  // Beats 1..N: reveal each piece and show the running total.
  let running = 0
  for (let i = 0; i < STACK_PIECES.length; i++) {
    const piece = STACK_PIECES[i]
    running += piece.heightCm
    const isLast = i === STACK_PIECES.length - 1
    const posLabel = i === 0 ? t('bottom', 'bawah') : i === 1 ? t('middle', 'tengah') : t('top', 'atas')
    beats.push({
      piecesShown: i + 1,
      runningTotal: running,
      caption: {
        en: `${posLabel}: ${piece.heightCm} cm — running total ${running} cm`,
        id: `${posLabel}: ${piece.heightCm} cm — total sementara ${running} cm`,
      },
      hold: isLast ? 0 : 1900,
      result: isLast,
    })
  }

  return beats
}

// Render a single piece of the stack at its correct Y offset.
function StackPiece({ pieceIndex, opacity }: { pieceIndex: number; opacity: number }) {
  const piece = STACK_PIECES[pieceIndex]
  // Y offset: sum of heights of pieces below this one.
  const heightBelow = STACK_HEIGHTS.slice(0, pieceIndex).reduce((a, b) => a + b, 0)
  const y = STACK_BASE_Y - heightBelow * PX
  const w = SOLID24G2.cube.lengthCm * PX // all pieces share the cube's footprint width
  const d = DEPTH_CM * PX
  const h = piece.heightCm * PX
  return (
    <motion.g
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
    >
      <IsoBox
        x={STACK_X}
        y={y}
        w={w}
        d={d}
        h={h}
        top={piece.top}
        left={piece.left}
        right={piece.right}
      />
    </motion.g>
  )
}

// Height dimension brace: a vertical double-arrow from baseY up to baseY - totalH.
function HeightBrace({ totalCm, totalPx, baseY }: { totalCm: number; totalPx: number; baseY: number }) {
  const x = STACK_X - 22
  const topY = baseY - totalPx
  return (
    <g>
      <line x1={x} y1={baseY} x2={x} y2={topY} stroke={INK} strokeWidth={1.5} />
      {/* Arrow heads */}
      <polygon points={`${x},${baseY} ${x - 4},${baseY - 6} ${x + 4},${baseY - 6}`} fill={INK} />
      <polygon points={`${x},${topY} ${x - 4},${topY + 6} ${x + 4},${topY + 6}`} fill={INK} />
      {/* Label */}
      <text
        x={x - 6}
        y={(baseY + topY) / 2}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={800}
        fill={INK}
        className="font-display"
      >
        {totalCm} cm
      </text>
    </g>
  )
}

// Addition equation row shown at the bottom of the SVG.
function AdditionRow({ piecesShown, runningTotal }: { piecesShown: number; runningTotal: number }) {
  // Build terms: e.g. "6 + 8 + 8 = 22"
  const terms = STACK_HEIGHTS.slice(0, piecesShown)
  const parts: string[] = terms.map((h) => `${h}`)
  const expr = parts.join(' + ')
  const label = piecesShown > 0 ? `${expr} = ${runningTotal}` : ''
  return (
    <text
      x={STACK_X + 6}
      y={STACK_BASE_Y + 22}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={800}
      fill={BLUE_CAP}
      className="font-display"
    >
      {label}
    </text>
  )
}

export default function Solid24G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'

  const beats = useMemo(() => buildStory(lang), [lang])
  const finalIndex = beats.length - 1

  const index = useBeatControl(finalIndex, {
    ...props,
    holds: beats.map((b) => b.hold),
  })
  const beat = beats[index] ?? beats[finalIndex]

  const totalPx = beat.runningTotal * PX
  const captionText = lang === 'id' ? beat.caption.id : beat.caption.en

  const ariaLabel =
    lang === 'id'
      ? `Strategi tumpuk: 6 + 8 + 8 = ${STACK_TOTAL} cm — jawaban C.`
      : `Stack strategy: 6 + 8 + 8 = ${STACK_TOTAL} cm — answer C.`

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* SVG canvas */}
        <svg
          viewBox="0 0 380 220"
          width="100%"
          style={{ maxWidth: 440, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {/* Background */}
          <rect x={0} y={0} width={380} height={220} rx={12} fill="#F0F4F8" />

          {/* ---- Left column: component piece catalogue ---- */}
          {STACK_PIECES.map((piece, i) => {
            const isActive = beat.piecesShown > i
            const labelY = 36 + i * 56
            const pieceX = 28
            const pieceY = labelY
            const w = SOLID24G2.cube.lengthCm * PX
            const d = DEPTH_CM * PX
            const h = piece.heightCm * PX
            const labelEn = i === 0 ? 'pink cuboid' : i === 1 ? '1st cube' : '2nd cube'
            const labelId = i === 0 ? 'balok merah muda' : i === 1 ? 'kubus 1' : 'kubus 2'
            return (
              <g key={piece.id + i} opacity={isActive ? 1 : 0.35}>
                <IsoBox
                  x={pieceX}
                  y={pieceY}
                  w={w}
                  d={d}
                  h={h}
                  top={piece.top}
                  left={piece.left}
                  right={piece.right}
                />
                <text
                  x={pieceX + w / 2}
                  y={pieceY + 16}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight={700}
                  fill={INK}
                  className="font-display"
                >
                  {lang === 'id' ? labelId : labelEn}
                </text>
                <text
                  x={pieceX - 5}
                  y={pieceY - h / 2}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={10}
                  fontWeight={800}
                  fill={isActive ? '#D97706' : INK}
                  className="font-display"
                >
                  {piece.heightCm} cm
                </text>
                {/* Tick once active */}
                {isActive && (
                  <text
                    x={pieceX + w + 28}
                    y={pieceY - h / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={13}
                    fill={GREEN}
                  >
                    ✓
                  </text>
                )}
              </g>
            )
          })}

          {/* ---- Divider ---- */}
          <line x1={168} y1={10} x2={168} y2={210} stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="5 4" />

          {/* ---- Right column: growing stack ---- */}
          {/* Ground line */}
          <line
            x1={STACK_X - 10}
            y1={STACK_BASE_Y + 4}
            x2={STACK_X + SOLID24G2.cube.lengthCm * PX + DEPTH_CM * PX + 10}
            y2={STACK_BASE_Y + 4}
            stroke="#94A3B8"
            strokeWidth={1.5}
          />

          {/* Pieces rendered bottom-up, fading in */}
          {STACK_PIECES.map((_, i) => (
            <StackPiece key={i} pieceIndex={i} opacity={beat.piecesShown > i ? 1 : 0} />
          ))}

          {/* Height brace — shows only when at least one piece is added */}
          {beat.piecesShown > 0 && (
            <HeightBrace
              totalCm={beat.runningTotal}
              totalPx={totalPx}
              baseY={STACK_BASE_Y}
            />
          )}

          {/* Addition equation */}
          <AdditionRow piecesShown={beat.piecesShown} runningTotal={beat.runningTotal} />

          {/* Answer badge on the final beat */}
          {beat.result && (
            <g>
              <rect
                x={STACK_X - 14}
                y={STACK_BASE_Y - totalPx - 28}
                width={72}
                height={22}
                rx={6}
                fill="#D1FAE5"
                stroke={GREEN}
                strokeWidth={1.5}
              />
              <text
                x={STACK_X - 14 + 36}
                y={STACK_BASE_Y - totalPx - 17}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={800}
                fill="#065F46"
                className="font-display"
              >
                {lang === 'id' ? `= ${STACK_TOTAL} cm ✓` : `= ${STACK_TOTAL} cm ✓`}
              </text>
            </g>
          )}
        </svg>

        {/* Caption */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: BLUE_CAP, color: BLUE_CAP }
          }
        >
          {captionText}
        </div>
      </div>
    </div>
  )
}
