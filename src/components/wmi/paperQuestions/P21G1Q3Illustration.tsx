// WMI-21P1A-Q3 (2021 WMI Semifinal Grade 1 Paper A) — "How many KINDS of shapes
// are there in the picture?"
//
// Source figure (db/seed/wmi/figures/2021-semifinal-g1-a-q3.jpg): a little TRAIN
// built from coloured shapes —
//   • two black TRIANGLES   (the cab roof + the pointed front of the engine)
//   • blue + pink SQUARES    (the small upper-window squares)
//   • blue RECTANGLES        (the tall smokestack box + the two long carriages)
//   • four yellow CIRCLES    (the wheels)
// So FOUR kinds of shape appear: triangle, square, rectangle, circle → answer C.
//
// The static figure draws ONLY the train (the problem). It never tallies the
// kinds or reveals "4". The reusable <ShapeTrain> primitive accepts a `litKinds`
// set so the explainer can highlight one kind at a time; the default export
// lights none.
//
// Pure render: no window/document at module top, no Math.random/Date — SSR-safe
// & deterministic.

const TRIANGLE = '#1F2937' // near-black
const PINK = '#E0418E'
const BLUE = '#BFE0F5'
const BLUE_STROKE = '#7FB9DF'
const WHEEL = '#FBC02D'
const WHEEL_STROKE = '#E8A900'

export type ShapeKind = 'triangle' | 'square' | 'rectangle' | 'circle'

/** The four distinct kinds present in the picture, in counting order. */
export const SHAPE_KINDS: readonly ShapeKind[] = ['triangle', 'square', 'rectangle', 'circle']
export const ANSWER_KINDS = SHAPE_KINDS.length // 4 — answer C (never drawn statically)

export const VIEW_W = 380
export const VIEW_H = 280

// Soft halo behind a part when its kind is "lit" (explainer use).
const HALO = '#FDE68A'
const HALO_OP = 0.85

export interface ShapeTrainProps {
  /** Kinds to highlight with a soft halo (explainer only). Empty in the problem figure. */
  litKinds?: ReadonlyArray<ShapeKind>
}

/**
 * Reusable primitive: draws the coloured-shape train. When a kind is in
 * `litKinds`, every shape of that kind gets a soft amber halo so the explainer
 * can spotlight one kind per beat.
 */
export function ShapeTrain({ litKinds = [] }: ShapeTrainProps) {
  const lit = (k: ShapeKind) => litKinds.includes(k)
  const haloFor = (k: ShapeKind) => (lit(k) ? { stroke: '#F59E0B', strokeWidth: 3 } : {})

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      style={{ maxWidth: VIEW_W, display: 'block', margin: '0 auto' }}
      aria-hidden="true"
    >
      {/* ───── halos (drawn first, behind the shapes) ───── */}
      {lit('triangle') && (
        <>
          <circle cx={62} cy={48} r={42} fill={HALO} opacity={HALO_OP} />
          <circle cx={334} cy={182} r={40} fill={HALO} opacity={HALO_OP} />
        </>
      )}
      {lit('square') && (
        <>
          <rect x={42} y={92} width={48} height={48} rx={6} fill={HALO} opacity={HALO_OP} />
          <rect x={246} y={20} width={52} height={52} rx={6} fill={HALO} opacity={HALO_OP} />
          <rect x={246} y={88} width={52} height={52} rx={6} fill={HALO} opacity={HALO_OP} />
        </>
      )}
      {lit('rectangle') && (
        <>
          <rect x={166} y={14} width={56} height={128} rx={8} fill={HALO} opacity={HALO_OP} />
          <rect x={6} y={158} width={140} height={56} rx={8} fill={HALO} opacity={HALO_OP} />
          <rect x={158} y={158} width={140} height={56} rx={8} fill={HALO} opacity={HALO_OP} />
        </>
      )}
      {lit('circle') && (
        <>
          {[34, 100, 196, 262].map((cx) => (
            <circle key={`wh-${cx}`} cx={cx} cy={250} r={26} fill={HALO} opacity={HALO_OP} />
          ))}
        </>
      )}

      {/* ───── TRIANGLES (black) ───── */}
      {/* cab roof, top-left */}
      <polygon points="62,16 90,62 34,62" fill={TRIANGLE} {...haloFor('triangle')} />
      {/* engine nose / front arrow, right */}
      <polygon points="370,182 314,156 314,208" fill={TRIANGLE} {...haloFor('triangle')} />

      {/* ───── SQUARES (pink + blue) ───── */}
      {/* pink square under the roof */}
      <rect x={42} y={92} width={48} height={48} fill={PINK} {...haloFor('square')} />
      {/* upper-right pink square */}
      <rect x={246} y={20} width={52} height={52} fill={PINK} {...haloFor('square')} />
      {/* lower-right pink square */}
      <rect x={246} y={88} width={52} height={52} fill={PINK} {...haloFor('square')} />

      {/* ───── RECTANGLES (blue) ───── */}
      {/* tall middle box (smokestack body) */}
      <rect x={166} y={14} width={56} height={128} fill={BLUE} stroke={BLUE_STROKE} strokeWidth={1.5} {...haloFor('rectangle')} />
      {/* left carriage */}
      <rect x={6} y={158} width={140} height={56} fill={BLUE} stroke={BLUE_STROKE} strokeWidth={1.5} {...haloFor('rectangle')} />
      {/* right carriage */}
      <rect x={158} y={158} width={140} height={56} fill={BLUE} stroke={BLUE_STROKE} strokeWidth={1.5} {...haloFor('rectangle')} />

      {/* ───── CIRCLES (yellow wheels) ───── */}
      {[34, 100, 196, 262].map((cx) => (
        <circle key={`w-${cx}`} cx={cx} cy={250} r={22} fill={WHEEL} stroke={WHEEL_STROKE} strokeWidth={2} {...haloFor('circle')} />
      ))}
    </svg>
  )
}

export default function P21G1Q3Illustration() {
  return (
    <div
      className="my-4 overflow-hidden rounded-lg border-2 border-qupu-cream-dark bg-white p-2"
      role="img"
      aria-label="A toy train built from coloured shapes: black triangles, pink and blue squares, blue rectangles, and yellow circular wheels. How many kinds of shapes are there?"
    >
      <ShapeTrain />
    </div>
  )
}
