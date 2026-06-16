import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { ExplainerProps } from '../concepts/explainers/registry'
import { useBeatControl } from '../concepts/explainers/useBeatControl'
import {
  StationMap25G3,
  STATIONS,
  TAK_POSITION,
  ANAN_POSITION,
} from './StationMap25G3Illustration'

// WMI-25F3A-Q8 — Teach mirror-symmetry on a linear station route.
// Strategy: same speed + opposite ends → each traveller covers the same
// number of station-hops. Tak reaches Chumphon (index 5) after 6 h, so by
// symmetry Anan reaches Phetchaburi (index 2) after 6 h. Answer A.
//
// Pure render: no Math.random, no Date.now. SSR-safe & deterministic.

// ---- colour tokens (echo fill-qupu-* palette) --------------------------------
const BLUE       = '#30598A'   // qupu-brand-blue
const ORANGE     = '#D97706'   // qupu-brand-orange
const GREEN      = '#16A34A'   // qupu-green
const CREAM      = '#F5F0E8'   // qupu-cream
const INK        = '#1E293B'   // qupu-ink

// ---- beat definitions --------------------------------------------------------
interface Beat {
  /** Which station index to tint in the map, or null for none. */
  highlightIndex: number | null
  /** Whether to show Anan's arrow annotation. */
  showAnanArrow: boolean
  /** Whether to show the symmetry axis. */
  showAxis: boolean
  /** Whether the answer verdict badge is visible. */
  showAnswer: boolean
  /** Caption text (bilingual). */
  caption: [string, string] // [en, id]
  /** Hold duration in ms (0 = last beat — no auto-advance). */
  hold: number
}

function buildBeats(): Beat[] {
  return [
    // Beat 0 — set the scene
    {
      highlightIndex: null,
      showAnanArrow: false,
      showAxis: false,
      showAnswer: false,
      caption: [
        'Both trains start at 07:30 from opposite ends at the SAME speed — their journeys mirror each other!',
        'Kedua kereta berangkat 07:30 dari ujung berlawanan dengan kecepatan SAMA — perjalanannya saling mencerminkan!',
      ],
      hold: 2800,
    },
    // Beat 1 — highlight Tak's starting station
    {
      highlightIndex: 0,
      showAnanArrow: false,
      showAxis: false,
      showAnswer: false,
      caption: [
        'Tak starts at Krung Thep Aphiwat (the north end) and travels south.',
        'Tak berangkat dari Krung Thep Aphiwat (ujung utara) dan berjalan ke selatan.',
      ],
      hold: 2200,
    },
    // Beat 2 — highlight Tak's 6-hour position
    {
      highlightIndex: TAK_POSITION,
      showAnanArrow: false,
      showAxis: false,
      showAnswer: false,
      caption: [
        `After 6 hours Tak is about to reach ${STATIONS[TAK_POSITION].replace('\n', ' ')} — he has passed ${TAK_POSITION} stations from his end.`,
        `Setelah 6 jam Tak hampir tiba di ${STATIONS[TAK_POSITION].replace('\n', ' ')} — ia telah melewati ${TAK_POSITION} stasiun dari ujungnya.`,
      ],
      hold: 2600,
    },
    // Beat 3 — highlight Anan's starting station
    {
      highlightIndex: STATIONS.length - 1,
      showAnanArrow: false,
      showAxis: false,
      showAnswer: false,
      caption: [
        'Anan starts at Chaiya (the south end) and travels north — the same speed, the opposite direction.',
        'Anan berangkat dari Chaiya (ujung selatan) dan berjalan ke utara — kecepatan sama, arah berlawanan.',
      ],
      hold: 2400,
    },
    // Beat 4 — show symmetry axis
    {
      highlightIndex: null,
      showAnanArrow: false,
      showAxis: true,
      showAnswer: false,
      caption: [
        'Same speed, same time → same distance from each end. The route is symmetric — the mirror of Chumphon from the south end is…',
        'Kecepatan sama, waktu sama → jarak sama dari masing-masing ujung. Rutenya simetris — cerminan Chumphon dari ujung selatan adalah…',
      ],
      hold: 2600,
    },
    // Beat 5 — highlight Anan's mirror station (answer)
    {
      highlightIndex: ANAN_POSITION,
      showAnanArrow: true,
      showAxis: true,
      showAnswer: false,
      caption: [
        `${STATIONS[ANAN_POSITION]}! The station at position ${TAK_POSITION} from the south end is ${STATIONS[ANAN_POSITION]} (index ${ANAN_POSITION} from the north).`,
        `${STATIONS[ANAN_POSITION]}! Stasiun ke-${TAK_POSITION} dari ujung selatan adalah ${STATIONS[ANAN_POSITION]} (indeks ${ANAN_POSITION} dari utara).`,
      ],
      hold: 2400,
    },
    // Beat 6 — answer verdict (final beat, hold 0)
    {
      highlightIndex: ANAN_POSITION,
      showAnanArrow: true,
      showAxis: true,
      showAnswer: true,
      caption: [
        `Answer A — Phetchaburi. By mirror symmetry, Anan reaches the station as far from Chaiya as Chumphon is from Krung Thep Aphiwat.`,
        `Jawaban A — Phetchaburi. Dengan simetri cermin, Anan mencapai stasiun sejauh Chumphon dari Krung Thep Aphiwat, diukur dari Chaiya.`,
      ],
      hold: 0,
    },
  ]
}

// ---- component ---------------------------------------------------------------

export default function StationMap25G3Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => buildBeats(), [])
  const finalIndex = steps.length - 1
  const index = useBeatControl(finalIndex, {
    ...props,
    holds: steps.map((s) => s.hold),
  })
  const beat = steps[index] ?? steps[finalIndex]

  const ariaLabel = t(
    `Station map animation: by mirror symmetry both trains travel the same distance in 6 hours. Tak reaches Chumphon from the north; Anan reaches Phetchaburi (Answer A) from the south.`,
    `Animasi peta stasiun: dengan simetri cermin kedua kereta menempuh jarak sama dalam 6 jam. Tak mencapai Chumphon dari utara; Anan mencapai Phetchaburi (Jawaban A) dari selatan.`,
  )

  return (
    <div
      className="mx-auto w-full max-w-[400px]"
      role="img"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3">

        {/* Station map with optional symmetry axis overlay */}
        <div className="relative">
          <StationMap25G3 highlightIndex={beat.highlightIndex} />

          {/* Symmetry axis — horizontal dashed line at the midpoint of the track */}
          {beat.showAxis && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: 8,
                right: 8,
                height: 2,
                background: `repeating-linear-gradient(90deg, ${ORANGE} 0 8px, transparent 8px 14px)`,
                transformOrigin: 'center',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Anan arrow — points toward Phetchaburi from below */}
          {beat.showAnanArrow && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.15 }}
              style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: ORANGE,
                  background: CREAM,
                  borderRadius: 6,
                  padding: '1px 6px',
                  border: `1.5px solid ${ORANGE}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {t('Anan → here!', 'Anan → di sini!')}
              </span>
            </motion.div>
          )}
        </div>

        {/* Answer badge */}
        {beat.showAnswer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            style={{
              background: '#D1FAE5',
              border: `2.5px solid ${GREEN}`,
              color: '#065F46',
              borderRadius: 12,
              padding: '4px 18px',
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: 0.2,
            }}
          >
            {t('Answer A — Phetchaburi', 'Jawaban A — Phetchaburi')}
          </motion.div>
        )}

        {/* Caption */}
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: beat.showAnswer ? '#D1FAE5' : '#E1EFFB',
            border: `2px solid ${beat.showAnswer ? GREEN : BLUE}`,
            color: beat.showAnswer ? '#065F46' : INK,
            borderRadius: 14,
            padding: '8px 16px',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 13,
            lineHeight: 1.45,
            maxWidth: 360,
          }}
        >
          {t(beat.caption[0], beat.caption[1])}
        </motion.div>
      </div>
    </div>
  )
}
