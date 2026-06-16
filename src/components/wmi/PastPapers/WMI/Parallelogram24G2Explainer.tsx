import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ParallelogramFigure, PARALLELOGRAM24_DATA } from './Parallelogram24G2Illustration'

// ── colour tokens (mirrors fill-qupu-* palette) ─────────────────────────────
const BLUE_BG = '#E1EFFB'
const BLUE_BD = '#30598A'
const BLUE_TX = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_BD = '#10B981'
const GREEN_TX = '#065F46'
const ORANGE = '#E67E22'
const RED_BG = '#FEE2E2'
const RED_BD = '#EF4444'
const RED_TX = '#991B1B'

// ── bilingual helper ─────────────────────────────────────────────────────────
type Lang = 'en' | 'id'
function t(lang: Lang, en: string, id: string) {
  return lang === 'id' ? id : en
}

// ── step type ────────────────────────────────────────────────────────────────
interface Step {
  hold: number
  showHighlight: boolean
  highlightPart: 'none' | 'triangle' | 'flat' | 'both'
  verdict: 'none' | 'wrong' | 'correct'
  caption: string
  equation: string | null
}

// ── storyboard builder (pure function, SSR-safe) ─────────────────────────────
function buildSteps(lang: Lang): Step[] {
  const tri = PARALLELOGRAM24_DATA.triangleBase  // 4
  const flat = PARALLELOGRAM24_DATA.flatBase     // 9
  const total = PARALLELOGRAM24_DATA.totalBase   // 13

  return [
    // Beat 0 — introduce the problem
    {
      hold: 2400,
      showHighlight: false,
      highlightPart: 'none',
      verdict: 'none',
      caption: t(
        lang,
        'The shaded triangle on the left needs to slide right to square up the shape.',
        'Segitiga kiri harus digeser ke kanan agar bentuknya menjadi persegi panjang.',
      ),
      equation: null,
    },
    // Beat 1 — identify triangle base (4 cm)
    {
      hold: 2000,
      showHighlight: false,
      highlightPart: 'triangle',
      verdict: 'none',
      caption: t(
        lang,
        `The triangle's base is ${tri} cm — that's how far it sticks out on the left.`,
        `Alas segitiga adalah ${tri} cm — itulah lebar tonjolan di sebelah kiri.`,
      ),
      equation: null,
    },
    // Beat 2 — identify flat base (9 cm)
    {
      hold: 2000,
      showHighlight: false,
      highlightPart: 'flat',
      verdict: 'none',
      caption: t(
        lang,
        `The flat part of the bottom is ${flat} cm long.`,
        `Bagian datar alas panjangnya ${flat} cm.`,
      ),
      equation: null,
    },
    // Beat 3 — reject trap answer C = 9
    {
      hold: 2400,
      showHighlight: false,
      highlightPart: 'flat',
      verdict: 'wrong',
      caption: t(
        lang,
        `${flat} cm alone is not enough! The triangle must travel past the flat part AND across its own ${tri} cm.`,
        `${flat} cm saja tidak cukup! Segitiga harus melewati bagian datar DAN lebar dirinya sendiri ${tri} cm.`,
      ),
      equation: t(lang, `${flat} cm ✗`, `${flat} cm ✗`),
    },
    // Beat 4 — final answer (highlightSlide on)
    {
      hold: 0,
      showHighlight: true,
      highlightPart: 'both',
      verdict: 'correct',
      caption: t(
        lang,
        `${tri} + ${flat} = ${total} cm → D`,
        `${tri} + ${flat} = ${total} cm → D`,
      ),
      equation: t(lang, `${tri} + ${flat} = ${total} cm`, `${tri} + ${flat} = ${total} cm`),
    },
  ]
}

// ── highlight overlay painted on top of the SVG figure ───────────────────────
// We draw coloured tinted bands behind the dimension labels to call out the
// part being discussed.  The overlay is placed via absolute positioning inside
// a relative wrapper, so it works at every viewport width.
function HighlightBand({ part }: { part: Step['highlightPart'] }) {
  if (part === 'none') return null
  // The SVG viewBox is 320×180.  The dimension spans live at the bottom.
  // We paint coloured rectangles whose left/width are percentages of the SVG width.
  // tri=4, flat=9, total=13.  PAD_L=24, PAD_R=24, availW=272 px.
  // scale = 272/13 ≈ 20.92 px/cm.
  // tri span: x=24 to x=24+4*scale = 24+83.7 = 107.7  → left=7.5%, width=26.2%
  // flat span: x=107.7 to x=296    → left=33.7%, width=58.8%
  const bands: Array<{ left: string; width: string; color: string }> = []
  if (part === 'triangle' || part === 'both') {
    bands.push({ left: '7.5%', width: '26.2%', color: '#BFD7EA' })
  }
  if (part === 'flat' || part === 'both') {
    bands.push({ left: '33.7%', width: '58.8%', color: '#FDE68A' })
  }
  return (
    <>
      {bands.map((b, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 0.35 }}
          style={{
            position: 'absolute',
            top: '72%',
            height: '22%',
            left: b.left,
            width: b.width,
            background: b.color,
            borderRadius: 4,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  )
}

// ── equation chip ─────────────────────────────────────────────────────────────
function EqChip({ text, verdict }: { text: string; verdict: Step['verdict'] }) {
  const styles =
    verdict === 'wrong'
      ? { background: RED_BG, border: `2px solid ${RED_BD}`, color: RED_TX }
      : verdict === 'correct'
        ? { background: GREEN_BG, border: `2px solid ${GREEN_BD}`, color: GREEN_TX }
        : { background: BLUE_BG, border: `2px solid ${BLUE_BD}`, color: BLUE_TX }

  return (
    <motion.div
      key={text}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className="rounded-xl px-4 py-1 font-display text-base font-extrabold"
      style={styles}
    >
      {text}
    </motion.div>
  )
}

// ── caption box ───────────────────────────────────────────────────────────────
function Caption({ text, verdict }: { text: string; verdict: Step['verdict'] }) {
  const styles =
    verdict === 'wrong'
      ? { background: RED_BG, borderColor: RED_BD, color: RED_TX }
      : verdict === 'correct'
        ? { background: GREEN_BG, borderColor: GREEN_BD, color: GREEN_TX }
        : { background: BLUE_BG, borderColor: BLUE_BD, color: BLUE_TX }

  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
      style={styles}
    >
      {text}
    </motion.div>
  )
}

// ── main explainer ────────────────────────────────────────────────────────────

export default function Parallelogram24G2Explainer(props: ExplainerProps) {
  const lang: Lang = (props.lang ?? 'en') as Lang

  const steps = useMemo(() => buildSteps(lang), [lang])
  const finalIndex = steps.length - 1
  const index = useBeatControl(finalIndex, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[finalIndex]

  const ariaLabel = t(
    lang,
    `Slide the triangle rightward: 4 cm triangle base plus 9 cm flat base equals 13 cm. Answer D.`,
    `Geser segitiga ke kanan: alas segitiga 4 cm ditambah bagian datar 9 cm sama dengan 13 cm. Jawaban D.`,
  )

  return (
    <div
      className="mx-auto w-full max-w-[440px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Figure with optional highlight overlay */}
        <div style={{ position: 'relative', width: '100%' }}>
          <ParallelogramFigure highlightSlide={beat.showHighlight} />
          <HighlightBand part={beat.highlightPart} />
        </div>

        {/* Equation chip (beats 3 & 4) */}
        {beat.equation && (
          <EqChip text={beat.equation} verdict={beat.verdict} />
        )}

        {/* Trap label for beat 3 */}
        {beat.verdict === 'wrong' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="font-display text-xs font-bold"
            style={{ color: ORANGE }}
          >
            {t(lang, 'Trap: answer C = 9 cm is too short!', 'Jebakan: jawaban C = 9 cm terlalu pendek!')}
          </motion.div>
        )}

        {/* Caption */}
        <Caption text={beat.caption} verdict={beat.verdict} />
      </div>
    </div>
  )
}
