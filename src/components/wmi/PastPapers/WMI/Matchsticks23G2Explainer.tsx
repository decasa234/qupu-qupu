// WMI-23F2A-Q21 — Post-answer explainer: "smallest x for 1×a, 2×b, 4×c matchstick grids"
//
// Strategy: write the stick formula for each grid size, then step through the
// 4×c sequence (c=1 → 13, c=2 → 22, …) checking whether each value is also
// achievable as 3a+1 and 5b+2 with positive integers a and b.
//
// Answer: x = 22  (a=7, b=4, c=2).
//
// Pure render — no Math.random, no Date. SSR-safe. Bilingual (en/id).

import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { StickBlock23G2, stickCount } from './Matchsticks23G2Illustration'

// ---- colour palette (mirrors the illustration tokens) -----------------------
const INK = '#1F2937'
const BLUE_BG = '#E1EFFB'
const BLUE_BORDER = '#30598A'
const BLUE_TEXT = '#30598A'
const GREEN_BG = '#D1FAE5'
const GREEN_BORDER = '#10B981'
const GREEN_TEXT = '#065F46'
const RED_BG = '#FEE2E2'
const RED_BORDER = '#EF4444'
const RED_TEXT = '#991B1B'
const YELLOW_BG = '#FEF3C7'
const YELLOW_BORDER = '#D97706'
const YELLOW_TEXT = '#92400E'

// ---- helper -----------------------------------------------------------------
const t = (lang: string, en: string, id: string) => (lang === 'id' ? id : en)

// ---- storyboard types -------------------------------------------------------
type Phase =
  | 'intro'
  | 'formulas'
  | 'try-c1'
  | 'fail-c1'
  | 'try-c2'
  | 'check-c2'
  | 'winner'

interface Beat {
  phase: Phase
  caption: string
  hold: number
  result: boolean
}

// ---- storyboard builder (pure, deterministic) -------------------------------
function buildStory(lang: string): { steps: Beat[]; finalIndex: number } {
  // Verify the math (deterministic from stickCount)
  const x1a7 = stickCount(1, 7)   // 22
  const x4c2 = stickCount(4, 2)   // 22
  const x4c1 = stickCount(4, 1)   // 13

  // These must all equal 22 (sanity — if illustration changes, explainer stays consistent)
  const ANSWER = x1a7  // 22

  const steps: Beat[] = [
    {
      phase: 'intro',
      caption: t(
        lang,
        'x sticks must fit ALL THREE grids at once. Let\'s find the smallest x!',
        'x batang harus muat di KETIGA susunan sekaligus. Cari x terkecil!',
      ),
      hold: 2800,
      result: false,
    },
    {
      phase: 'formulas',
      caption: t(
        lang,
        `Formula: 1×a uses 3a+1 sticks, 2×b uses 5b+2, 4×c uses 9c+4`,
        `Rumus: 1×a pakai 3a+1 korek, 2×b pakai 5b+2, 4×c pakai 9c+4`,
      ),
      hold: 3200,
      result: false,
    },
    {
      phase: 'try-c1',
      caption: t(
        lang,
        `Try c=1: 4×c gives 9(1)+4 = ${x4c1} sticks`,
        `Coba c=1: 4×c memberi 9(1)+4 = ${x4c1} batang`,
      ),
      hold: 2400,
      result: false,
    },
    {
      phase: 'fail-c1',
      caption: t(
        lang,
        `${x4c1} = 3a+1? → a=4 ✓   but   ${x4c1} = 5b+2? → b=2.2 ✗  Not a whole number!`,
        `${x4c1} = 3a+1? → a=4 ✓   tapi   ${x4c1} = 5b+2? → b=2,2 ✗  Bukan bilangan bulat!`,
      ),
      hold: 2800,
      result: false,
    },
    {
      phase: 'try-c2',
      caption: t(
        lang,
        `Try c=2: 4×c gives 9(2)+4 = ${x4c2} sticks`,
        `Coba c=2: 4×c memberi 9(2)+4 = ${x4c2} batang`,
      ),
      hold: 2400,
      result: false,
    },
    {
      phase: 'check-c2',
      caption: t(
        lang,
        `Check: ${ANSWER} = 3(7)+1 ✓  ${ANSWER} = 5(4)+2 ✓  ${ANSWER} = 9(2)+4 ✓  All whole numbers!`,
        `Periksa: ${ANSWER} = 3(7)+1 ✓  ${ANSWER} = 5(4)+2 ✓  ${ANSWER} = 9(2)+4 ✓  Semua bilangan bulat!`,
      ),
      hold: 3200,
      result: false,
    },
    {
      phase: 'winner',
      caption: t(
        lang,
        `x = ${ANSWER}: works as 1×7, 2×4, and 4×2 — all use ${ANSWER} matchsticks!`,
        `x = ${ANSWER}: cocok sebagai 1×7, 2×4, dan 4×2 — semuanya ${ANSWER} batang korek!`,
      ),
      hold: 0,
      result: true,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}

// ---- sub-components ---------------------------------------------------------

/** Formula row: shows the algebraic form for a grid size */
function FormulaRow({
  label,
  formula,
  active,
}: {
  label: string
  formula: string
  active: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '4px 10px',
        borderRadius: 8,
        background: active ? YELLOW_BG : '#F9FAFB',
        border: `2px solid ${active ? YELLOW_BORDER : '#E5E7EB'}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      <span
        style={{
          fontWeight: 800,
          fontSize: 14,
          color: INK,
          minWidth: 36,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 14,
          fontWeight: 700,
          color: active ? YELLOW_TEXT : '#6B7280',
        }}
      >
        {formula}
      </span>
    </div>
  )
}

/** A compact stick-block card showing one solved arrangement */
function ArrangementCard({
  rows,
  cols,
  label,
  count,
  highlight,
}: {
  rows: number
  cols: number
  label: string
  count: number
  highlight: boolean
}) {
  const W = cols * 22 + 16
  const H = rows * 22 + 16
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '8px 10px',
        borderRadius: 10,
        background: highlight ? GREEN_BG : '#F9FAFB',
        border: `2px solid ${highlight ? GREEN_BORDER : '#E5E7EB'}`,
        transition: 'background 0.35s, border-color 0.35s',
        minWidth: 80,
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden="true">
        <StickBlock23G2 rows={rows} cols={cols} ox={8} oy={8} />
      </svg>
      <span style={{ fontSize: 12, fontWeight: 700, color: highlight ? GREEN_TEXT : INK }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: highlight ? GREEN_TEXT : '#6B7280',
          background: highlight ? '#A7F3D0' : '#F3F4F6',
          borderRadius: 6,
          padding: '1px 7px',
        }}
      >
        {count} sticks
      </span>
    </div>
  )
}

/** The candidate-check panel for c=1 (fail) */
function FailPanel({ x, lang }: { x: number; lang: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        width: '100%',
        padding: '8px 12px',
        borderRadius: 10,
        background: RED_BG,
        border: `2px solid ${RED_BORDER}`,
      }}
    >
      <div
        style={{ fontSize: 13, fontWeight: 800, color: RED_TEXT, textAlign: 'center' }}
      >
        x = {x}
      </div>
      <div style={{ fontSize: 12, color: RED_TEXT }}>
        3a+1 = {x} → a = {(x - 1) / 3} {Number.isInteger((x - 1) / 3) ? '✓' : '✗'}
      </div>
      <div style={{ fontSize: 12, color: RED_TEXT }}>
        5b+2 = {x} → b = {((x - 2) / 5).toFixed(1)}{' '}
        {Number.isInteger((x - 2) / 5) ? '✓' : '✗ ' + t(lang, 'not whole!', 'tidak bulat!')}
      </div>
      <div style={{ fontSize: 12, color: RED_TEXT }}>
        9c+4 = {x} → c = {(x - 4) / 9} ✓
      </div>
    </div>
  )
}

/** The candidate-check panel for c=2 (win) */
function WinPanel({ x }: { x: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        width: '100%',
        padding: '8px 12px',
        borderRadius: 10,
        background: GREEN_BG,
        border: `2px solid ${GREEN_BORDER}`,
      }}
    >
      <div
        style={{ fontSize: 13, fontWeight: 800, color: GREEN_TEXT, textAlign: 'center' }}
      >
        x = {x}
      </div>
      <div style={{ fontSize: 12, color: GREEN_TEXT }}>3a+1 = {x} → a = {(x - 1) / 3} ✓</div>
      <div style={{ fontSize: 12, color: GREEN_TEXT }}>5b+2 = {x} → b = {(x - 2) / 5} ✓</div>
      <div style={{ fontSize: 12, color: GREEN_TEXT }}>9c+4 = {x} → c = {(x - 4) / 9} ✓</div>
    </div>
  )
}

// ---- main component ---------------------------------------------------------

export default function Matchsticks23G2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const story = useMemo(() => buildStory(lang), [lang])
  const index = useBeatControl(story.finalIndex, {
    ...props,
    holds: story.steps.map((s) => s.hold),
  })
  const beat = story.steps[index] ?? story.steps[story.finalIndex]

  // Derived constants (pure from stickCount)
  const ANSWER = stickCount(1, 7) // 22
  const C1_VAL = stickCount(4, 1) // 13

  const ariaLabel = t(
    lang,
    `Strategy: list stick formulas for each grid size, step through 4×c candidates. c=1 gives ${C1_VAL} which fails the 2×b check; c=2 gives ${ANSWER} which satisfies all three. Answer: x = ${ANSWER}.`,
    `Strategi: tulis rumus korek tiap ukuran kisi, coba nilai 4×c. c=1 memberi ${C1_VAL} gagal syarat 2×b; c=2 memberi ${ANSWER} memenuhi ketiganya. Jawaban: x = ${ANSWER}.`,
  )

  const phase = beat.phase
  const showFormulas = phase !== 'intro'
  const showC1Try = phase === 'try-c1' || phase === 'fail-c1'
  const showC1Fail = phase === 'fail-c1'
  const showC2Try = phase === 'try-c2' || phase === 'check-c2' || phase === 'winner'
  const showC2Win = phase === 'check-c2' || phase === 'winner'
  const showFinal = phase === 'winner'

  return (
    <div
      className="mx-auto w-full max-w-[420px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">
        {/* ---- Persistent matchstick forms (always visible, generic — never reveals x) ---- */}
        <svg viewBox="0 0 360 116" width="100%" style={{ maxWidth: 360, display: 'block', margin: '0 auto' }} aria-hidden="true">
          <g transform="translate(14, 70)"><StickBlock23G2 rows={1} cols={3} ox={0} oy={0} /></g>
          <text x="47" y="108" textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>1×a</text>
          <g transform="translate(150, 48)"><StickBlock23G2 rows={2} cols={2} ox={0} oy={0} /></g>
          <text x="172" y="108" textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>2×b</text>
          <g transform="translate(280, 4)"><StickBlock23G2 rows={4} cols={2} ox={0} oy={0} /></g>
          <text x="302" y="108" textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>4×c</text>
        </svg>
        {/* ---- Formulas panel ---- */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            opacity: showFormulas ? 1 : 0.0,
            transition: 'opacity 0.4s',
          }}
        >
          <FormulaRow
            label="1×a"
            formula="= 3a + 1"
            active={showFinal}
          />
          <FormulaRow
            label="2×b"
            formula="= 5b + 2"
            active={showFinal}
          />
          <FormulaRow
            label="4×c"
            formula="= 9c + 4"
            active={showFormulas && !showFinal}
          />
        </div>

        {/* ---- Candidate-check panels ---- */}
        {(showC1Try || showC1Fail) && !showFinal && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* c=1 attempt */}
            <div
              style={{
                padding: '6px 12px',
                borderRadius: 10,
                background: BLUE_BG,
                border: `2px solid ${BLUE_BORDER}`,
                fontSize: 13,
                fontWeight: 700,
                color: BLUE_TEXT,
                textAlign: 'center',
              }}
            >
              {t(lang, `Try c = 1 → x = ${C1_VAL}`, `Coba c = 1 → x = ${C1_VAL}`)}
            </div>
            {showC1Fail && <FailPanel x={C1_VAL} lang={lang} />}
          </div>
        )}

        {showC2Try && !showFinal && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* c=1 collapsed (dimmed reminder) */}
            <div
              style={{
                padding: '5px 12px',
                borderRadius: 8,
                background: RED_BG,
                border: `1.5px solid ${RED_BORDER}`,
                fontSize: 12,
                fontWeight: 700,
                color: RED_TEXT,
                textAlign: 'center',
                opacity: 0.65,
              }}
            >
              c=1 → x={C1_VAL} ✗
            </div>
            {/* c=2 attempt */}
            <div
              style={{
                padding: '6px 12px',
                borderRadius: 10,
                background: YELLOW_BG,
                border: `2px solid ${YELLOW_BORDER}`,
                fontSize: 13,
                fontWeight: 700,
                color: YELLOW_TEXT,
                textAlign: 'center',
              }}
            >
              {t(lang, `Try c = 2 → x = ${ANSWER}`, `Coba c = 2 → x = ${ANSWER}`)}
            </div>
            {showC2Win && <WinPanel x={ANSWER} />}
          </div>
        )}

        {/* ---- Final three-block drawing ---- */}
        {showFinal && (
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              justifyContent: 'center',
              padding: '4px 0',
            }}
          >
            <ArrangementCard
              rows={1}
              cols={7}
              label="1×7"
              count={stickCount(1, 7)}
              highlight
            />
            <ArrangementCard
              rows={2}
              cols={4}
              label="2×4"
              count={stickCount(2, 4)}
              highlight
            />
            <ArrangementCard
              rows={4}
              cols={2}
              label="4×2"
              count={stickCount(4, 2)}
              highlight
            />
          </div>
        )}

        {/* ---- Caption box ---- */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: GREEN_BG, borderColor: GREEN_BORDER, color: GREEN_TEXT }
              : { background: BLUE_BG, borderColor: BLUE_BORDER, color: BLUE_TEXT }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
