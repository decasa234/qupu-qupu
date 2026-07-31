import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExplainerProps } from './registry'
import { buildBookSheetPagesSteps, type FaceMark, type SheetSlot } from './bookSheetPagesSteps'
import { useBeatControl } from './useBeatControl'

// N18 `book-sheet-pages`. One picture carries the whole concept, so it is drawn
// rather than described: every sheet is TWO overlapping faces on one card — the
// front lying in front, its back peeking out behind it. Once a child can see
// both numbers living on the same card, "one sheet, one page" and "always
// double" both fall over on their own, and the answer is read off the card the
// child has been watching the pattern build.

// Warm brand palette, literal hex so the figure reads the same on any surface.
const BLUE = '#30598A'
const BLUE_SOFT = '#E1EFFB'
const GREEN = '#58A700'
const GREEN_SOFT = '#EAF6DC'
const GREEN_INK = '#3D7400'
const ROSE = '#D9534F'
const ROSE_SOFT = '#FBE9E8'
const AMBER = '#E0A000'
const AMBER_SOFT = '#FFF3D4'
const AMBER_INK = '#8A6100'
const ORANGE = '#F0853A'
const SHELL = '#FFF9F4'
const PEACH = '#FFD3B1'
const PAPER = '#FFFFFF'
const HAIR = '#E6D8C9'
const MUTED = '#9AA2AE'
const MUTED_SOFT = '#F3EEE8'
const INK = '#341857'

const FACE: Record<FaceMark, { bg: string; border: string; ink: string }> = {
  none: { bg: PAPER, border: HAIR, ink: INK },
  lit: { bg: BLUE_SOFT, border: BLUE, ink: BLUE },
  given: { bg: AMBER_SOFT, border: AMBER, ink: AMBER_INK },
  answer: { bg: GREEN_SOFT, border: GREEN, ink: GREEN_INK },
  wrong: { bg: ROSE_SOFT, border: ROSE, ink: ROSE },
  blank: { bg: MUTED_SOFT, border: '#EADFD3', ink: MUTED },
}

// One card = one sheet of paper drawn as its two faces.
const CARD_W = 76
const CARD_H = 96
const BACK = { x: 34, y: 10, w: 40, h: 52 }
const FRONT = { x: 2, y: 32, w: 40, h: 52 }

function Face({
  box,
  value,
  mark,
  cx,
  cy,
  still,
}: {
  box: { x: number; y: number; w: number; h: number }
  value: number | null
  mark: FaceMark
  cx: number
  cy: number
  still: boolean
}) {
  const tone = FACE[mark]
  const struck = mark === 'wrong' && value !== null
  return (
    <motion.g
      key={mark}
      initial={still ? false : { opacity: mark === 'answer' ? 0.4 : 1 }}
      animate={{ opacity: 1 }}
      transition={still ? { duration: 0 } : { duration: 0.3 }}
    >
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        rx={7}
        fill={tone.bg}
        stroke={tone.border}
        strokeWidth={2.5}
        strokeDasharray={mark === 'blank' ? '5 4' : undefined}
      />
      {value !== null && (
        <text x={cx} y={cy} textAnchor="middle" fontSize={17} fontWeight={900} fill={tone.ink}>
          {value}
        </text>
      )}
      {struck && (
        <path
          d={`M ${box.x + 6} ${box.y + box.h - 6} L ${box.x + box.w - 6} ${box.y + 6}`}
          fill="none"
          stroke={ROSE}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.7}
        />
      )}
    </motion.g>
  )
}

function SheetCard({
  slot,
  showFaceLabels,
  frontLabel,
  backLabel,
  sheetLabel,
  still,
}: {
  slot: Extract<SheetSlot, { kind: 'sheet' }>
  showFaceLabels: boolean
  frontLabel: string
  backLabel: string
  sheetLabel: string
  still: boolean
}) {
  const labels = showFaceLabels && slot.focus
  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5">
      <div
        className="rounded-xl border-2 px-0.5 py-0.5"
        style={{
          borderColor: slot.focus ? ORANGE : 'transparent',
          borderStyle: slot.focus ? 'dashed' : 'solid',
        }}
      >
        <svg viewBox={`0 0 ${CARD_W} ${CARD_H}`} width={CARD_W} height={CARD_H} role="presentation">
          {/* The back face sits behind and above — same sheet, turned over. */}
          <Face box={BACK} value={slot.back} mark={slot.backMark} cx={58} cy={42} still={still} />
          <Face box={FRONT} value={slot.front} mark={slot.frontMark} cx={22} cy={64} still={still} />
          {labels && (
            <>
              <text x={54} y={7} textAnchor="middle" fontSize={8} fontWeight={800} fill={MUTED}>
                {backLabel}
              </text>
              <text x={22} y={93} textAnchor="middle" fontSize={8} fontWeight={800} fill={MUTED}>
                {frontLabel}
              </text>
            </>
          )}
        </svg>
      </div>
      <span
        className="font-display text-[0.5625rem] font-extrabold uppercase tracking-wide"
        style={{ color: slot.focus ? ORANGE : MUTED }}
      >
        {sheetLabel}
      </span>
    </div>
  )
}

/** The "…and so on" spacer between the worked sheets and the sheet in question. */
function GapDots() {
  return (
    <div className="flex shrink-0 items-center justify-center px-0.5" style={{ height: CARD_H }}>
      <svg viewBox="0 0 18 6" width={18} height={6} role="presentation">
        <circle cx={3} cy={3} r={2} fill={MUTED} />
        <circle cx={9} cy={3} r={2} fill={MUTED} />
        <circle cx={15} cy={3} r={2} fill={MUTED} />
      </svg>
    </div>
  )
}

export default function BookSheetPagesExplainer(props: ExplainerProps) {
  const { params, lang = 'en' } = props
  const reduce = useReducedMotion()
  const still = !!reduce
  const story = useMemo(() => buildBookSheetPagesSteps(params, lang), [params, lang])
  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  const T = (en: string, id: string) => (lang === 'id' ? id : en)

  const chipTone =
    beat.chipTone === 'good'
      ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
      : beat.chipTone === 'bad'
        ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
        : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const captionStyle = beat.trap
    ? { background: ROSE_SOFT, borderColor: ROSE, color: ROSE }
    : beat.result
      ? { background: GREEN_SOFT, borderColor: GREEN, color: GREEN_INK }
      : { background: BLUE_SOFT, borderColor: BLUE, color: BLUE }

  const ariaLabel =
    story.perSheet === 2
      ? T(
          `Method: every sheet is one piece of paper with two printed faces, so sheet n carries page 2×n − 1 on its front and page 2×n on its back. The cards are built up from sheet 1 until the sheet the question asks about, and the page is then read off that card.`,
          `Metode: setiap lembar adalah satu kertas dengan dua sisi tercetak, jadi lembar ke-n memuat halaman 2×n − 1 di depan dan halaman 2×n di belakang. Kartunya disusun dari lembar ke-1 sampai lembar yang ditanyakan, lalu halamannya dibaca dari kartu itu.`,
        )
      : T(
          `Method: this machine prints the front of each sheet only, so every back stays blank and the sheet number and the page number keep step with each other. The cards are built up from sheet 1 until the sheet the question asks about.`,
          `Metode: mesin ini hanya mencetak sisi depan tiap lembar, jadi semua belakangnya kosong dan nomor lembar selalu sama dengan nomor halaman. Kartunya disusun dari lembar ke-1 sampai lembar yang ditanyakan.`,
        )

  return (
    <div className="mx-auto w-full max-w-[27.5rem]" role="img" aria-label={ariaLabel}>
      <div
        className="flex min-h-[18.75rem] flex-col items-center justify-start gap-2.5 rounded-2xl border-2 px-3 py-3"
        style={{ background: SHELL, borderColor: PEACH }}
      >
        {/* Whose book this is, and the running read-out. */}
        <div className="flex w-full items-center justify-between gap-2">
          <span className="font-display text-[0.625rem] font-extrabold uppercase tracking-wide" style={{ color: MUTED }}>
            {`${story.name} · ${story.bookLabel}`}
          </span>
          {/* How the machine printed it — a given, and never a number, so this
              chip can never hand over a count the question is asking for. */}
          <span
            className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold"
            style={{ background: AMBER_SOFT, borderColor: AMBER, color: AMBER_INK }}
          >
            {story.perSheet === 2
              ? T('printed both sides', 'dicetak bolak-balik')
              : T('front side only', 'hanya sisi depan')}
          </span>
        </div>

        {/* The stack: one card per sheet, each card showing both of its faces. */}
        <div className="flex w-full flex-wrap items-start justify-center gap-1">
          {beat.slots.map((slot, i) =>
            slot.kind === 'gap' ? (
              <GapDots key={`g${i}`} />
            ) : (
              <SheetCard
                key={`s${slot.index}`}
                slot={slot}
                showFaceLabels={beat.showFaceLabels}
                frontLabel={T('front', 'depan')}
                backLabel={T('back', 'belakang')}
                sheetLabel={T(`sheet ${slot.index}`, `lembar ${slot.index}`)}
                still={still}
              />
            ),
          )}
        </div>

        {/* The tempting misread, and — on the last beat only — the answer. */}
        <div className="flex min-h-[1.75rem] w-full flex-wrap items-center justify-center gap-2">
          {beat.trapLabel && (
            <span
              className="flex items-center gap-1 rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={{ background: ROSE_SOFT, borderColor: ROSE, color: ROSE }}
            >
              <svg viewBox="0 0 16 16" width={10} height={10} role="presentation">
                <path d="M3 3 L13 13 M13 3 L3 13" fill="none" stroke={ROSE} strokeWidth={2.6} strokeLinecap="round" />
              </svg>
              {beat.trapLabel}
            </span>
          )}
          {beat.chip && (
            <motion.span
              data-answer={beat.result ? '1' : undefined}
              initial={still ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={still ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 22 }}
              className="rounded-full border-2 px-2.5 py-[0.0625rem] font-display text-[0.6875rem] font-extrabold tabular-nums"
              style={chipTone}
            >
              {beat.chip}
            </motion.span>
          )}
        </div>

        <div
          className="w-full rounded-xl border-2 px-3 py-2 text-center font-display text-[0.8125rem] font-extrabold leading-snug"
          style={captionStyle}
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
