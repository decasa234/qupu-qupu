import { useMemo } from 'react'
import type { ExplainerProps } from '../../concepts/explainers/registry'
import { useBeatControl } from '../../concepts/explainers/useBeatControl'
import { CubeNetsFigure, NETS21, NET_FOLD_COUNT } from './puzzles20G2Illustrations'

// WMI-20F2A-Q21 — "How many of the 8 nets fold into a cube?" Test ONE net per
// beat with a running "folds so far" counter. A net folds when 4 squares wrap
// the 4 sides and the other 2 become a separate top and bottom; it fails when
// two faces land on the same spot (so a face is left missing). The verdict for
// every net is encoded in NETS21[i].folds — nets 0,1,2,4,6 fold (✓), nets
// 3,5,7 fail (✗), so the answer is NET_FOLD_COUNT = 5.

const GREEN = '#10B981'

// Concrete reason each failing net cannot close into a cube. Keyed by net index;
// only the ✗ nets (3, 5, 7) appear here. Derived to match NETS21[i].folds === false.
const FAIL_REASON: Record<number, [string, string]> = {
  3: ['the long row of 4 wraps around, but the last 2 squares stack onto the same face', 'baris panjang berisi 4 melingkar, tapi 2 kotak terakhir menumpuk di sisi yang sama'],
  5: ['four squares sit in a row, so two of them fold onto the same spot', 'empat kotak berderet, jadi dua di antaranya terlipat ke tempat yang sama'],
  7: ['two faces land on top of each other, so one side of the cube is left missing', 'dua sisi jatuh saling menumpuk, jadi satu sisi kubus jadi kosong'],
}

export default function CubeNetsG2Explainer(props: ExplainerProps) {
  const lang = props.lang ?? 'en'
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps = useMemo(() => {
    type Beat = { verdicts: Array<boolean | null>; active: number | null; hold: number; result: boolean; caption: string }
    const out: Beat[] = [
      {
        verdicts: Array(NETS21.length).fill(null),
        active: null,
        hold: 3000,
        result: false,
        caption: t(
          'A net folds into a cube when 4 squares wrap the sides and the last 2 become the top and bottom. Test each one!',
          'Sebuah jaring jadi kubus kalau 4 kotak melingkari sisinya dan 2 kotak sisanya jadi atas dan bawah. Uji satu per satu!',
        ),
      },
    ]
    let run = 0
    for (let i = 0; i < NETS21.length; i++) {
      const folds = NETS21[i].folds
      if (folds) run += 1
      const verdicts: Array<boolean | null> = NETS21.map((n, j) => (j <= i ? n.folds : null))
      const caption = folds
        ? t(
            `Net ${i + 1}: 4 squares wrap and 2 cap it — it folds ✓. Folds so far: ${run}.`,
            `Jaring ${i + 1}: 4 kotak melingkar dan 2 jadi tutup — bisa dilipat ✓. Sudah ${run}.`,
          )
        : t(
            `Net ${i + 1}: ${FAIL_REASON[i][0]} — it can't close ✗. Still ${run}.`,
            `Jaring ${i + 1}: ${FAIL_REASON[i][1]} — tak bisa tertutup ✗. Tetap ${run}.`,
          )
      out.push({ verdicts, active: i, hold: folds ? 1900 : 2300, result: false, caption })
    }
    out.push({
      verdicts: NETS21.map((n) => n.folds),
      active: null,
      hold: 0,
      result: true,
      caption: t(
        `${NET_FOLD_COUNT} of the 8 nets fold into a cube → the answer is ${NET_FOLD_COUNT}.`,
        `${NET_FOLD_COUNT} dari 8 jaring bisa dilipat jadi kubus → jawabannya ${NET_FOLD_COUNT}.`,
      ),
    })
    return out
  }, [lang])

  const index = useBeatControl(steps.length - 1, { ...props, holds: steps.map((s) => s.hold) })
  const beat = steps[index] ?? steps[steps.length - 1]
  const runningCount = beat.verdicts.filter((v) => v === true).length

  return (
    <div
      className="mx-auto w-full max-w-[460px]"
      role="img"
      aria-label={t(
        `Testing each net by folding it: five of the eight nets close into a cube, so the answer is ${NET_FOLD_COUNT}.`,
        `Menguji tiap jaring dengan melipatnya: lima dari delapan jaring tertutup jadi kubus, jadi jawabannya ${NET_FOLD_COUNT}.`,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-full" style={{ position: 'relative' }}>
          <CubeNetsFigure verdicts={beat.verdicts} />
          {/* highlight ring over the net currently being tested */}
          {beat.active != null && (
            <svg viewBox="0 0 420 200" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto', position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
              {(() => {
                const col = beat.active % 4
                const row = Math.floor(beat.active / 4)
                return (
                  <rect
                    x={10 + col * 102}
                    y={8 + row * 96}
                    width={96}
                    height={88}
                    rx={8}
                    fill="none"
                    stroke="#D97706"
                    strokeWidth={2.5}
                    strokeDasharray="7 5"
                  />
                )
              })()}
            </svg>
          )}
        </div>
        <div className="font-display text-xs font-bold text-qupu-brand-blue">
          {t(`folds so far: ${runningCount} of ${NET_FOLD_COUNT}`, `sudah bisa dilipat: ${runningCount} dari ${NET_FOLD_COUNT}`)}
        </div>
        <div
          className="rounded-xl border-2 px-4 py-2 text-center font-display text-sm font-extrabold"
          style={
            beat.result
              ? { background: '#D1FAE5', borderColor: GREEN, color: '#065F46' }
              : { background: '#E1EFFB', borderColor: '#30598A', color: '#30598A' }
          }
        >
          {beat.caption}
        </div>
      </div>
    </div>
  )
}
