// Post-answer explainer for WMI-24F3A-Q4 (2024 Grade-3 Final).
// Strategy: convert every distance to "from finish", then apply the equal gap.
// Answer D = 84 m.

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import RaceTrack24G3Illustration, { RACE_TRACK_DATA } from './RaceTrack24G3Illustration'

// ── colour tokens (mirror illustration) ──────────────────────────────────────
const C_AMY   = '#D81B60'
const C_BEN   = '#1565C0'
const C_CAROL = '#2E7D32'
const C_INK   = '#1F2937'
const C_GREY  = '#6B7280'

// ── bilingual helper ─────────────────────────────────────────────────────────
const t = (lang: 'en' | 'id', en: string, id: string) => (lang === 'id' ? id : en)

// ── beat definitions ─────────────────────────────────────────────────────────
interface Beat {
  captionEn: string
  captionId: string
  /** Which runners are highlighted. null = none highlighted (intro). */
  highlight: 'Ben' | 'Carol' | 'Amy' | 'all' | null
  /** Arithmetic annotation shown in the calc box. null = hidden. */
  calc: string | null
  result: boolean
  hold: number
}

function buildBeats(): Beat[] {
  const { totalM, runners } = RACE_TRACK_DATA
  const benFromFinish  = totalM - runners.Ben.fromStart   // 204
  const carolFromFinish = runners.Carol.fromFinish         // 144
  const gap = benFromFinish - carolFromFinish              // 60
  const amyFromFinish  = carolFromFinish - gap             // 84

  return [
    {
      captionEn: 'Strategy: turn EVERY distance into "from the finish line" — then the equal gaps do the work.',
      captionId: 'Strategi: ubah SEMUA jarak menjadi "dari garis finish" — lalu selisih yang sama bekerja sendiri.',
      highlight: null,
      calc: null,
      result: false,
      hold: 2800,
    },
    {
      captionEn: `Ben is ${runners.Ben.fromStart} m from the start. Flip it: ${totalM} − ${runners.Ben.fromStart} = ${benFromFinish} m from the finish.`,
      captionId: `Ben ${runners.Ben.fromStart} m dari start. Dibalik: ${totalM} − ${runners.Ben.fromStart} = ${benFromFinish} m dari finish.`,
      highlight: 'Ben',
      calc: `${totalM} − ${runners.Ben.fromStart} = ${benFromFinish}`,
      result: false,
      hold: 2400,
    },
    {
      captionEn: `Carol is already ${carolFromFinish} m from the finish. Gap between Carol and Ben = ${benFromFinish} − ${carolFromFinish} = ${gap} m.`,
      captionId: `Carol sudah ${carolFromFinish} m dari finish. Selisih Carol–Ben = ${benFromFinish} − ${carolFromFinish} = ${gap} m.`,
      highlight: 'Carol',
      calc: `${benFromFinish} − ${carolFromFinish} = ${gap}`,
      result: false,
      hold: 2400,
    },
    {
      captionEn: `Amy is the same ${gap} m ahead of Carol. So Amy = ${carolFromFinish} − ${gap} = ${amyFromFinish} m from the finish.`,
      captionId: `Amy di depan Carol sejauh ${gap} m yang sama. Jadi Amy = ${carolFromFinish} − ${gap} = ${amyFromFinish} m dari finish.`,
      highlight: 'Amy',
      calc: `${carolFromFinish} − ${gap} = ${amyFromFinish}`,
      result: false,
      hold: 2400,
    },
    {
      captionEn: `Amy is ${amyFromFinish} m from the finish line — answer D.`,
      captionId: `Amy ${amyFromFinish} m dari garis finish — jawaban D.`,
      highlight: 'all',
      calc: null,
      result: true,
      hold: 0,
    },
  ]
}

// ── runner label pill ─────────────────────────────────────────────────────────
function RunnerPill({ name, color, active }: { name: string; color: string; active: boolean }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.3, scale: active ? 1.08 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 20,
        border: `2px solid ${color}`,
        background: active ? `${color}18` : 'transparent',
        color,
        fontWeight: 800,
        fontSize: 14,
      }}
    >
      {name}
    </motion.div>
  )
}

// ── distance-from-finish meter bar ────────────────────────────────────────────
interface MeterBarProps {
  label: string
  fromFinish: number
  totalM: number
  color: string
  active: boolean
  showValue: boolean
}

function MeterBar({ label, fromFinish, totalM, color, active, showValue }: MeterBarProps) {
  const pct = (fromFinish / totalM) * 100

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: active ? 1 : 0.3 }}>
      <span style={{ width: 44, fontWeight: 800, fontSize: 13, color, textAlign: 'right' }}>{label}</span>
      <div style={{ flex: 1, height: 18, background: '#E5E7EB', borderRadius: 9, position: 'relative', overflow: 'hidden' }}>
        {/* filled portion = distance already run (from start) */}
        <motion.div
          animate={{ width: `${100 - pct}%` }}
          initial={{ width: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: color, borderRadius: 9, opacity: 0.6 }}
        />
        {/* gap remaining (from finish) */}
        <motion.div
          animate={{ width: `${pct}%`, opacity: showValue ? 1 : 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            height: '100%',
            background: color,
            opacity: 0.95,
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {showValue && (
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 11 }}>{fromFinish} m</span>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// ── calc badge ────────────────────────────────────────────────────────────────
function CalcBadge({ expr }: { expr: string }) {
  return (
    <motion.div
      key={expr}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      style={{
        background: '#FEF3C7',
        border: '2px solid #D97706',
        borderRadius: 10,
        padding: '4px 14px',
        fontWeight: 900,
        fontSize: 16,
        color: C_INK,
        letterSpacing: 0.5,
      }}
    >
      {expr}
    </motion.div>
  )
}

// ── main component ────────────────────────────────────────────────────────────
export default function RaceTrack24G3Explainer(props: ExplainerProps) {
  const lang = (props.lang ?? 'en') as 'en' | 'id'

  const beats = useMemo(() => buildBeats(), [])

  const index = useBeatControl(beats.length - 1, {
    ...props,
    holds: beats.map((b) => b.hold),
  })

  const beat = beats[index] ?? beats[beats.length - 1]

  const { totalM, runners } = RACE_TRACK_DATA
  const benFromFinish   = totalM - runners.Ben.fromStart   // 204
  const carolFromFinish = runners.Carol.fromFinish          // 144
  const amyFromFinish   = runners.Amy.fromFinish            // 84

  const isActive = (name: 'Ben' | 'Carol' | 'Amy') =>
    beat.highlight === 'all' || beat.highlight === name

  const ariaLabel = t(
    lang,
    'Equal-gap strategy on an 800 m track: convert to distance-from-finish, find the 60 m gap, subtract once — Amy is 84 m from the finish, answer D.',
    'Strategi selisih sama pada lintasan 800 m: ubah ke jarak-dari-finish, temukan selisih 60 m, kurangi sekali — Amy 84 m dari finish, jawaban D.',
  )

  return (
    <div
      className="mx-auto w-full max-w-[520px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">

        {/* Static illustration (reused from question view) */}
        <div style={{ width: '100%' }} aria-hidden="true">
          <RaceTrack24G3Illustration />
        </div>

        {/* Runner pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <RunnerPill name="Amy"   color={C_AMY}   active={isActive('Amy')} />
          <RunnerPill name="Ben"   color={C_BEN}   active={isActive('Ben')} />
          <RunnerPill name="Carol" color={C_CAROL} active={isActive('Carol')} />
        </div>

        {/* Distance-from-finish bars */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, padding: '0 8px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C_GREY, textAlign: 'right', paddingRight: 0 }}>
            {t(lang, '← distance from finish →', '← jarak dari finish →')}
          </div>
          <MeterBar
            label="Ben"
            fromFinish={benFromFinish}
            totalM={totalM}
            color={C_BEN}
            active={isActive('Ben')}
            showValue={beat.highlight === 'Ben' || beat.highlight === 'Carol' || beat.highlight === 'Amy' || beat.highlight === 'all'}
          />
          <MeterBar
            label="Carol"
            fromFinish={carolFromFinish}
            totalM={totalM}
            color={C_CAROL}
            active={isActive('Carol')}
            showValue={beat.highlight === 'Carol' || beat.highlight === 'Amy' || beat.highlight === 'all'}
          />
          <MeterBar
            label="Amy"
            fromFinish={amyFromFinish}
            totalM={totalM}
            color={C_AMY}
            active={isActive('Amy')}
            showValue={beat.highlight === 'Amy' || beat.highlight === 'all'}
          />
        </div>

        {/* Arithmetic calc badge */}
        <div style={{ minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {beat.calc != null && <CalcBadge expr={beat.calc} />}
        </div>

        {/* Caption box */}
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: '#10B981', color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {lang === 'id' ? beat.captionId : beat.captionEn}
        </div>

      </div>
    </div>
  )
}
