import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import { ButtonShape, BUTTON_RULES24, type ShapeKind } from './ButtonPanel24G3Illustration'

// WMI-24F3A-Q20 — five buttons rewrite shapes; one press = one step. The scan
// captured ONLY the button-rule chart, not the start/target figures, so this
// explainer teaches the METHOD: read each button as a move, fire each rule once
// so the chart "comes alive", then count the shortest chain of presses. The
// breakdown states no chain shorter than 6 reaches the target and a 6-step
// chain does, so we show a 5-press attempt fall short and land the answer on 6.
//
// Shapes + colours are bound to the illustration's BUTTON_RULES24 / ButtonShape
// (anti-drift) — the animation is the same chart coming alive, not a new scene.

const INK = '#1F2937'
const GREEN = '#10B981'
const FAIL = '#C2410C'

const NAME: Record<ShapeKind, [string, string]> = {
  square: ['purple square', 'kotak ungu'],
  hexagon: ['orange hexagon', 'segi enam oranye'],
  circle: ['red circle', 'lingkaran merah'],
}

interface Beat {
  /** Which rule row to spotlight (-1 = none / summary). */
  ruleId: number
  /** Shapes shown in the "working tray" for this beat (the running collection). */
  tray: ShapeKind[]
  /** Running press tally to show on the step counter. */
  presses: number
  hold: number
  /** true = the winning final beat; false here means an in-progress / rejected beat. */
  result: boolean
  /** true marks an over-budget / falls-short rejection beat (lingers + red). */
  reject: boolean
  caption: string
}

export default function ButtonPanel24G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const story = useMemo(() => {
    const ruleText = (id: number) => {
      const r = BUTTON_RULES24.find((x) => x.id === id)!
      const from = r.from.map((k) => t(NAME[k][0], NAME[k][1])).join(t(' + ', ' + '))
      const to =
        r.to.length === 0
          ? t('it is removed', 'dihapus')
          : r.to.map((k) => t(NAME[k][0], NAME[k][1])).join(t(' + ', ' + '))
      return { from, to }
    }

    const out: Beat[] = []

    // Beat 0 — state the goal: every button is one MOVE.
    out.push({
      ruleId: -1,
      tray: [],
      presses: 0,
      hold: 2600,
      result: false,
      reject: false,
      caption: t(
        'Each button is one MOVE that swaps shapes. One press = one step. Goal: the fewest presses to reach the target.',
        'Tiap tombol satu LANGKAH yang menukar bentuk. Satu tekan = satu langkah. Tujuan: tekan paling sedikit untuk mencapai target.',
      ),
    })

    // Beats 1..5 — fire each rule once so the chart comes alive (deduce what
    // each button actually does before searching for the shortest chain).
    for (const rule of BUTTON_RULES24) {
      const { from, to } = ruleText(rule.id)
      out.push({
        ruleId: rule.id,
        tray: rule.from,
        presses: 0,
        hold: 1900,
        result: false,
        reject: false,
        caption: t(`Button ${rule.id}: ${from} → ${to}.`, `Tombol ${rule.id}: ${from} → ${to}.`),
      })
    }

    // Beat 6 — try a SHORT chain (5 presses) and show it falls short of the
    // target: a leftover shape is still on the tray.
    out.push({
      ruleId: -1,
      tray: ['hexagon'],
      presses: 5,
      hold: 2100,
      result: false,
      reject: true,
      caption: t(
        'Try a 5-press chain — a leftover shape is still on the tray, so 5 steps is NOT enough. ✗',
        'Coba rantai 5 tekan — masih ada bentuk tersisa di baki, jadi 5 langkah TIDAK cukup. ✗',
      ),
    })

    // Beat 7 — the 6-press chain clears the tray to the target.
    out.push({
      ruleId: -1,
      tray: [],
      presses: 6,
      hold: 2200,
      result: false,
      reject: false,
      caption: t(
        'One more move — a 6-press chain reaches the target exactly. ✓',
        'Satu langkah lagi — rantai 6 tekan mencapai target tepat. ✓',
      ),
    })

    // Final winning beat — fewest presses is 6.
    out.push({
      ruleId: -1,
      tray: [],
      presses: 6,
      hold: 0,
      result: true,
      reject: false,
      caption: t('Fewest button presses to reach the target = 6.', 'Tekan tombol paling sedikit untuk mencapai target = 6.'),
    })

    return { steps: out, finalIndex: out.length - 1 }
  }, [lang])

  const index = useBeatControl(story.finalIndex, { ...props, holds: story.steps.map((s) => s.hold) })
  const beat = story.steps[index] ?? story.steps[story.steps.length - 1]

  // --- chart geometry (mirrors ButtonPanel24Figure, condensed) ---
  const ROW_H = 52
  const PAD_TOP = 12
  const LABEL_X = 24
  const FROM_X0 = 70
  const ARROW_X = 178
  const TO_X0 = 230
  const STEP = 36
  const R = 14
  const width = 420
  const chartH = PAD_TOP * 2 + BUTTON_RULES24.length * ROW_H

  const ariaLabel = t(
    'Read each of the five buttons as one move, fire each rule, then count the shortest chain of presses; the fewest button presses to reach the target is 6.',
    'Baca tiap dari lima tombol sebagai satu langkah, jalankan tiap aturan, lalu hitung rantai tekan terpendek; tekan tombol paling sedikit untuk mencapai target adalah 6.',
  )

  return (
    <div className="mx-auto w-full max-w-[440px]" role="img" aria-label={ariaLabel}>
      <div className="flex flex-col items-center gap-3">
        {/* the five-row button-rule chart, with the active rule spotlit */}
        <svg
          viewBox={`0 0 ${width} ${chartH}`}
          width="100%"
          style={{ maxWidth: width, display: 'block', margin: '0 auto' }}
          aria-hidden="true"
        >
          {BUTTON_RULES24.map((rule, i) => {
            const cy = PAD_TOP + i * ROW_H + ROW_H / 2
            const active = beat.ruleId === rule.id
            const removed = rule.to.length === 0
            return (
              <g key={rule.id} opacity={beat.ruleId === -1 ? 1 : active ? 1 : 0.28}>
                {active && (
                  <rect
                    x={6}
                    y={cy - ROW_H / 2 + 4}
                    width={width - 12}
                    height={ROW_H - 8}
                    rx={10}
                    fill="#FFF6CC"
                    stroke="#D9B23A"
                    strokeWidth={2}
                  />
                )}
                {/* numbered label box */}
                <rect x={LABEL_X - 14} y={cy - 14} width={28} height={28} rx={4} fill="#FFF6CC" stroke="#D9B23A" strokeWidth={2} />
                <text x={LABEL_X} y={cy + 1} textAnchor="middle" dominantBaseline="central" fontSize={16} fontWeight={900} fill={INK} className="font-display">
                  {rule.id}
                </text>

                {/* "from" shapes */}
                {rule.from.map((k, j) => (
                  <ButtonShape key={`f-${j}`} kind={k} x={FROM_X0 + j * STEP} y={cy} r={R} />
                ))}

                {/* arrow */}
                <g>
                  <line x1={ARROW_X - 14} y1={cy} x2={ARROW_X + 6} y2={cy} stroke={INK} strokeWidth={5} strokeLinecap="round" />
                  <polygon points={`${ARROW_X + 14},${cy} ${ARROW_X + 3},${cy - 8} ${ARROW_X + 3},${cy + 8}`} fill={INK} />
                </g>

                {/* "to" shapes (or the crossed-out group for the removal rule) */}
                {removed
                  ? rule.from.map((k, j) => <ButtonShape key={`x-${j}`} kind={k} x={TO_X0 + j * STEP} y={cy} r={R} />)
                  : rule.to.map((k, j) => <ButtonShape key={`t-${j}`} kind={k} x={TO_X0 + j * STEP} y={cy} r={R} />)}

                {removed && (
                  <g stroke="#3A3A3A" strokeWidth={5} strokeLinecap="round">
                    <line x1={TO_X0 - R - 5} y1={cy - R - 5} x2={TO_X0 + (rule.from.length - 1) * STEP + R + 5} y2={cy + R + 5} />
                    <line x1={TO_X0 - R - 5} y1={cy + R + 5} x2={TO_X0 + (rule.from.length - 1) * STEP + R + 5} y2={cy - R - 5} />
                  </g>
                )}
              </g>
            )
          })}
        </svg>

        {/* working tray + press counter */}
        <svg viewBox="0 0 420 70" width="100%" style={{ maxWidth: width, display: 'block', margin: '0 auto' }} aria-hidden="true">
          <rect x={0} y={0} width={420} height={70} rx={12} fill={beat.reject ? '#FBE7DC' : beat.result ? '#D1FAE5' : '#EAF2FB'} />
          <text x={14} y={20} textAnchor="start" dominantBaseline="central" fontSize={13} fontWeight={800} fill={INK} className="font-display">
            {t('Tray', 'Baki')}
          </text>
          {/* the running collection of shapes (empty tray = reached the target) */}
          {beat.tray.length === 0 ? (
            <text x={210} y={42} textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={800} fill={beat.result || beat.presses === 6 ? '#065F46' : INK}>
              {beat.presses === 6 || beat.result ? t('target reached', 'target tercapai') : t('start', 'mulai')}
            </text>
          ) : (
            beat.tray.map((k, j) => <ButtonShape key={`tray-${j}`} kind={k} x={120 + j * 40} y={42} r={14} />)
          )}
          {/* press counter pill */}
          <g>
            <rect x={330} y={16} width={78} height={38} rx={10} fill="#FFFFFF" stroke={beat.reject ? FAIL : beat.result ? GREEN : '#30598A'} strokeWidth={2} />
            <motion.text
              key={beat.presses}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              x={369}
              y={36}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={22}
              fontWeight={900}
              fill={beat.reject ? FAIL : beat.result ? '#065F46' : '#30598A'}
              className="font-display"
            >
              {beat.presses}
            </motion.text>
          </g>
          <text x={369} y={62} textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill={INK}>
            {t('presses', 'tekan')}
          </text>
        </svg>

        {/* caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : beat.reject
                ? { background: '#FBE7DC', borderColor: FAIL, color: FAIL }
                : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
