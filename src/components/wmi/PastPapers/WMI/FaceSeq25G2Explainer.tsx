import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { FaceGlyph, FaceColumn, STEM_25G2, OPTIONS_25G2 } from './FaceSeq25G2Illustration'
import type { Face } from './FaceSeq25G2Illustration'

// Palette tokens matching the illustration
const INK = '#1F2937'
const BRAND_BLUE = '#30598A'
const BRAND_BLUE_LIGHT = '#E1EFFB'
const GREEN = '#10B981'
const GREEN_BG = '#D1FAE5'
const GREEN_INK = '#065F46'
const ROSE = '#e11d48'
const ROSE_BG = '#FFF1F2'
const CREAM_BG = '#FFF9F4'
const CREAM_BORDER = '#FFD3B1'
const MUTED = '#9aa3b2'

// ---------------------------------------------------------------------------
// Layout constants — mirror the static illustration so the animation reads
// as the same scene coming alive.
// ---------------------------------------------------------------------------
const R = 14 // face radius (slightly smaller to fit in the explainer panel)
const VGAP = 3
const COL_GAP = 14
const PAD = 8
const STEP = 2 * R + VGAP
const MAX_H = 3
const COL_W = 2 * R
const COLS = STEM_25G2.length // 9
const SVG_W = PAD * 2 + COLS * COL_W + (COLS - 1) * COL_GAP
const BASE_CY = PAD + (MAX_H - 1) * STEP + R
const SVG_H = BASE_CY + R + PAD + 6

// Column x-centres (matching the illustration formula)
function colCx(i: number): number {
  return PAD + R + i * (COL_W + COL_GAP)
}

// ---------------------------------------------------------------------------
// Group bracket: a horizontal brace drawn under columns lo..hi
// ---------------------------------------------------------------------------
function GroupBracket({
  loCol,
  hiCol,
  label,
  color,
}: {
  loCol: number
  hiCol: number
  label: string
  color: string
}) {
  const x1 = colCx(loCol) - R - 2
  const x2 = colCx(hiCol) + R + 2
  const y = SVG_H - 2
  const mid = (x1 + x2) / 2
  return (
    <g>
      <polyline
        points={`${x1},${y - 6} ${x1},${y} ${x2},${y} ${x2},${y - 6}`}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x={mid}
        y={y + 10}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={800}
        fill={color}
        fontFamily='"Baloo 2", sans-serif'
      >
        {label}
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Height label drawn above a column
// ---------------------------------------------------------------------------
function HeightLabel({ colIdx, height, color }: { colIdx: number; height: number; color: string }) {
  const cx = colCx(colIdx)
  const y = PAD + (MAX_H - height) * STEP - 6
  return (
    <text
      x={cx}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={9}
      fontWeight={800}
      fill={color}
      fontFamily='"Baloo 2", sans-serif'
    >
      {height}
    </text>
  )
}

// ---------------------------------------------------------------------------
// The dashed "?" gap marker (col 5, height-2 slot)
// ---------------------------------------------------------------------------
function GapMarker({ dim }: { dim?: boolean }) {
  const cx = colCx(4) // col index 4 = column 5
  const midY = BASE_CY - STEP / 2
  const ry = STEP / 2 + R * 0.9
  const rx = R * 1.1
  return (
    <g opacity={dim ? 0.25 : 1}>
      <ellipse
        cx={cx}
        cy={midY}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={INK}
        strokeWidth={2}
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
      <text
        x={cx}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={R * 1.4}
        fontWeight={900}
        fill={INK}
        fontFamily='"Baloo 2", sans-serif'
      >
        ?
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Verdict badge (check / cross)
// ---------------------------------------------------------------------------
function Verdict({ fits }: { fits: boolean }) {
  const color = fits ? GREEN : ROSE
  return (
    <motion.span
      key={fits ? 'ok' : 'no'}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
      className="ml-1 inline-flex shrink-0"
      aria-hidden
    >
      <svg viewBox="0 0 22 22" width={22} height={22}>
        <circle cx={11} cy={11} r={10} fill={fits ? '#ECFDF5' : ROSE_BG} stroke={color} strokeWidth={2} />
        {fits ? (
          <path d="M6 11.5 L9.5 15 L16 7.5" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M7 7 L15 15 M15 7 L7 15" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
        )}
      </svg>
    </motion.span>
  )
}

// ---------------------------------------------------------------------------
// Mini option chip shown when evaluating a candidate
// ---------------------------------------------------------------------------
function OptionChip({
  label,
  faces,
  state,
}: {
  label: string
  faces: Face[]
  state: 'idle' | 'try' | 'ok' | 'no'
}) {
  const chipR = 10
  const chipStep = 2 * chipR + 2
  const w = chipR * 2 + 12
  const h = faces.length * chipStep + 12
  const cx = w / 2
  const baseCy = h - 6 - chipR
  const border =
    state === 'ok' ? GREEN : state === 'no' ? ROSE : state === 'try' ? BRAND_BLUE : MUTED
  const bg =
    state === 'ok' ? GREEN_BG : state === 'no' ? ROSE_BG : state === 'try' ? BRAND_BLUE_LIGHT : CREAM_BG

  return (
    <motion.div
      initial={false}
      animate={{
        scale: state === 'try' || state === 'ok' ? 1.08 : state === 'no' ? 0.92 : 1,
        opacity: state === 'no' ? 0.45 : 1,
      }}
      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <div
        style={{
          border: `2px solid ${border}`,
          borderRadius: 8,
          background: bg,
          padding: '3px 4px 2px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
          {faces.map((f, i) => (
            <FaceGlyph key={i} face={f} cx={cx} cy={baseCy - i * chipStep} r={chipR} strokeWidth={1.8} />
          ))}
        </svg>
      </div>
      <span
        style={{
          fontFamily: '"Baloo 2", sans-serif',
          fontSize: 10,
          fontWeight: 800,
          color: border,
        }}
      >
        {label}
      </span>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Beat definition
// ---------------------------------------------------------------------------
type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E'

interface Beat {
  /** Which columns to show (dim the rest if not null). null = show all. */
  highlightCols: number[] | null
  /** Show group brackets */
  groups: Array<{ lo: number; hi: number; label: string; color: string }>
  /** Show height labels on certain columns */
  heightLabels: Array<{ colIdx: number; height: number; color: string }>
  /** Show gap filled with these faces (null = show dashed ? marker) */
  gapFill: Face[] | null
  /** Which option is currently being evaluated */
  tryOption: OptionLabel | null
  /** Options already eliminated */
  eliminated: OptionLabel[]
  /** The winning option (final beat) */
  winner: OptionLabel | null
  caption: string
  hold: number
}

// ---------------------------------------------------------------------------
// Storyboard builder (pure, deterministic)
// ---------------------------------------------------------------------------
function buildSteps(lang: 'en' | 'id'): Beat[] {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const beats: Beat[] = []

  // Beat 0 — show the whole sequence, state the goal
  beats.push({
    highlightCols: null,
    groups: [],
    heightLabels: [],
    gapFill: null,
    tryOption: null,
    eliminated: [],
    winner: null,
    caption: t(
      'Look at the columns — they form a repeating pattern. Find the rule!',
      'Lihat kolom-kolomnya — ada pola berulang. Temukan aturannya!',
    ),
    hold: 2800,
  })

  // Beat 1 — highlight group 1 (cols 0-2)
  beats.push({
    highlightCols: [0, 1, 2],
    groups: [{ lo: 0, hi: 2, label: t('group 1', 'kelompok 1'), color: '#7C3AED' }],
    heightLabels: [
      { colIdx: 0, height: 1, color: '#7C3AED' },
      { colIdx: 1, height: 2, color: '#7C3AED' },
      { colIdx: 2, height: 3, color: '#7C3AED' },
    ],
    gapFill: null,
    tryOption: null,
    eliminated: [],
    winner: null,
    caption: t(
      'Group 1: heights 1, 2, 3 — going up!',
      'Kelompok 1: tinggi 1, 2, 3 — naik!',
    ),
    hold: 2400,
  })

  // Beat 2 — highlight group 2 (cols 3-5), show ? still unknown
  beats.push({
    highlightCols: [3, 4, 5],
    groups: [
      { lo: 0, hi: 2, label: t('group 1', 'kelompok 1'), color: MUTED },
      { lo: 3, hi: 5, label: t('group 2', 'kelompok 2'), color: '#0891B2' },
    ],
    heightLabels: [
      { colIdx: 3, height: 1, color: '#0891B2' },
      { colIdx: 4, height: 2, color: '#0891B2' },
      { colIdx: 5, height: 3, color: '#0891B2' },
    ],
    gapFill: null,
    tryOption: null,
    eliminated: [],
    winner: null,
    caption: t(
      'Group 2: heights 1, ?, 3. The gap is the height-2 slot → 2 faces!',
      'Kelompok 2: tinggi 1, ?, 3. Celah ada di slot tinggi-2 → 2 wajah!',
    ),
    hold: 2600,
  })

  // Beat 3 — highlight group 3 (cols 6-8), show the full height pattern
  beats.push({
    highlightCols: [6, 7, 8],
    groups: [
      { lo: 0, hi: 2, label: t('group 1', 'kelompok 1'), color: MUTED },
      { lo: 3, hi: 5, label: t('group 2', 'kelompok 2'), color: MUTED },
      { lo: 6, hi: 8, label: t('group 3', 'kelompok 3'), color: '#059669' },
    ],
    heightLabels: [
      { colIdx: 6, height: 1, color: '#059669' },
      { colIdx: 7, height: 2, color: '#059669' },
      { colIdx: 8, height: 3, color: '#059669' },
    ],
    gapFill: null,
    tryOption: null,
    eliminated: [],
    winner: null,
    caption: t(
      'Group 3: heights 1, 2, 3. Every group repeats 1-2-3!',
      'Kelompok 3: tinggi 1, 2, 3. Setiap kelompok berulang 1-2-3!',
    ),
    hold: 2400,
  })

  // Beat 4 — heights confirmed; now narrow by count. A=3, D=1, E=3 are wrong.
  beats.push({
    highlightCols: null,
    groups: [
      { lo: 0, hi: 2, label: t('group 1', 'kelompok 1'), color: MUTED },
      { lo: 3, hi: 5, label: t('group 2', 'kelompok 2'), color: MUTED },
      { lo: 6, hi: 8, label: t('group 3', 'kelompok 3'), color: MUTED },
    ],
    heightLabels: [],
    gapFill: null,
    tryOption: null,
    eliminated: ['A', 'D', 'E'],
    winner: null,
    caption: t(
      'The gap needs exactly 2 faces. A (3 faces) ✗, D (1 face) ✗, E (3 faces) ✗ — out!',
      'Celah butuh tepat 2 wajah. A (3 wajah) ✗, D (1 wajah) ✗, E (3 wajah) ✗ — gugur!',
    ),
    hold: 2800,
  })

  // Beat 5 — try option B (sad, sad)
  beats.push({
    highlightCols: null,
    groups: [],
    heightLabels: [],
    gapFill: OPTIONS_25G2['B'], // sad, sad
    tryOption: 'B',
    eliminated: ['A', 'D', 'E'],
    winner: null,
    caption: t(
      'Try B: 2 sad. The height fits — but now check the COLOURS of the whole columns along the row.',
      'Coba B: 2 sedih. Tingginya pas — tapi sekarang cek WARNA seluruh kolom di sepanjang barisan.',
    ),
    hold: 2600,
  })

  // Beat 6 — eliminate B; whole columns alternate happy/sad along the row
  beats.push({
    highlightCols: [0, 1, 2, 3, 4, 5, 6, 7, 8], // read the colours across the row
    groups: [],
    heightLabels: [],
    gapFill: null,
    tryOption: null,
    eliminated: ['A', 'B', 'D', 'E'],
    winner: null,
    caption: t(
      'Read the column colours: happy, sad, happy, sad, ?, sad, happy, sad, happy. The gap must be a HAPPY column — B (2 sad) ✗!',
      'Baca warna kolom: senang, sedih, senang, sedih, ?, sedih, senang, sedih, senang. Celahnya harus kolom SENANG — B (2 sedih) ✗!',
    ),
    hold: 2600,
  })

  // Beat 7 — final: fill in C and reveal the answer
  beats.push({
    highlightCols: null,
    groups: [],
    heightLabels: [],
    gapFill: OPTIONS_25G2['C'], // happy, happy
    tryOption: null,
    eliminated: ['A', 'B', 'D', 'E'],
    winner: 'C',
    caption: t(
      'C = 2 happy faces fits both rules: height 2, and a happy column!',
      'C = 2 wajah senang cocok dengan kedua aturan: tinggi 2, dan kolom senang!',
    ),
    hold: 0,
  })

  return beats
}

// ---------------------------------------------------------------------------
// Main explainer component
// ---------------------------------------------------------------------------
export default function FaceSeq25G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => buildSteps(lang), [lang])
  const finalIndex = steps.length - 1
  const index = useBeatControl(finalIndex, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[finalIndex]

  const ariaLabel = t(
    'The columns repeat in groups of three with heights 1-2-3, and whole columns alternate happy, sad, happy, sad along the row. The gap is a height-2 happy column: 2 happy faces — answer C.',
    'Kolom-kolom berulang dalam kelompok tiga dengan tinggi 1-2-3, dan kolom-kolom selang-seling senang, sedih, senang, sedih di sepanjang barisan. Celahnya kolom senang tinggi-2: 2 wajah senang — jawaban C.',
  )

  const optionLabels: OptionLabel[] = ['A', 'B', 'C', 'D', 'E']

  function optionState(label: OptionLabel): 'idle' | 'try' | 'ok' | 'no' {
    if (beat.winner === label) return 'ok'
    if (beat.eliminated.includes(label)) return 'no'
    if (beat.tryOption === label) return 'try'
    return 'idle'
  }

  return (
    <div
      className="mx-auto w-full max-w-[480px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className="flex flex-col items-center gap-3 rounded-2xl border-2 px-3 py-3"
        style={{ background: CREAM_BG, borderColor: CREAM_BORDER }}
      >
        {/* ── Stem figure ── */}
        <div className="w-full overflow-hidden rounded-xl border-2 border-qupu-cream-dark bg-white px-1 py-2">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H + 18}`}
            width="100%"
            style={{ maxWidth: SVG_W, display: 'block', margin: '0 auto' }}
            aria-hidden="true"
          >
            {/* Columns */}
            {STEM_25G2.map((col, i) => {
              const cx = colCx(i)
              const dim =
                beat.highlightCols != null && !beat.highlightCols.includes(i)
              if (i === 4) {
                // gap column
                if (beat.gapFill) {
                  // show the filled faces
                  return (
                    <motion.g
                      key={i}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    >
                      <FaceColumn faces={beat.gapFill} cx={cx} baseCy={BASE_CY} r={R} vGap={VGAP} />
                    </motion.g>
                  )
                }
                return <GapMarker key={i} dim={dim} />
              }
              if (!col) return null
              return (
                <g key={i} opacity={dim ? 0.22 : 1} style={{ transition: 'opacity 0.3s' }}>
                  <FaceColumn faces={col} cx={cx} baseCy={BASE_CY} r={R} vGap={VGAP} />
                </g>
              )
            })}

            {/* Height labels */}
            {beat.heightLabels.map((hl, i) => (
              <HeightLabel key={i} colIdx={hl.colIdx} height={hl.height} color={hl.color} />
            ))}

            {/* Group brackets */}
            {beat.groups.map((g, i) => (
              <GroupBracket key={i} loCol={g.lo} hiCol={g.hi} label={g.label} color={g.color} />
            ))}
          </svg>
        </div>

        {/* ── Option chips row ── */}
        <div className="flex items-end justify-center gap-2">
          {optionLabels.map((label) => {
            const st = optionState(label)
            return (
              <div key={label} className="relative flex flex-col items-center">
                <OptionChip label={label} faces={OPTIONS_25G2[label]} state={st} />
                {/* Verdict badge shown inline for try/ok/no states */}
                {(st === 'ok' || st === 'no') && (
                  <div className="absolute -right-1 -top-1">
                    <Verdict fits={st === 'ok'} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Caption ── */}
        <motion.div
          key={beat.caption}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.winner
              ? { background: GREEN_BG, borderColor: GREEN, color: GREEN_INK }
              : { background: BRAND_BLUE_LIGHT, borderColor: BRAND_BLUE, color: BRAND_BLUE }
          }
        >
          {beat.caption}
        </motion.div>

        {/* ── Winner banner ── */}
        {beat.winner && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 20 }}
            className="flex items-center gap-2 rounded-xl px-4 py-2 font-display text-base font-black"
            style={{ background: GREEN_BG, color: GREEN_INK, border: `2px solid ${GREEN}` }}
          >
            <svg viewBox="0 0 20 20" width={20} height={20} aria-hidden="true">
              <circle cx={10} cy={10} r={9} fill={GREEN} />
              <path d="M5 10.5 L8.5 14 L15 7" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('Answer: C — 2 happy faces!', 'Jawaban: C — 2 wajah senang!')}
          </motion.div>
        )}
      </div>
    </div>
  )
}
