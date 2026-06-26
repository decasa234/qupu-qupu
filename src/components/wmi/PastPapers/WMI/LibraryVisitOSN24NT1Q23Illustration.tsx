// OSN-24-SD-NAS-TEORI1-Q23 — "Library visit diagram. Same-color lines =
// same visit day. Besides Ardi, which students visited with every other
// student?" (answer: Wati)
//
// OCR source: docs/reference/ocr-res/osn/nasional/sd/2024-teori1.md Q23,
// crop: 2024-teori1.imgs/010.jpg
//
// GRAPH RECONSTRUCTION (7 nodes, 14 edges, 5 visit-day colours):
//   Nodes: Mela (top), Tita (left), Dikta (right), Ardi (centre),
//          Gina (bottom-left), Wati (bottom-centre), Jimbo (bottom-right)
//
//   Red   (Day A): Tita–Mela, Tita–Dikta, Tita–Wati, Mela–Wati, Dikta–Wati
//   Cyan  (Day B): Mela–Ardi, Ardi–Tita, Ardi–Dikta
//   Green (Day C): Ardi–Jimbo, Wati–Jimbo, Ardi–Wati
//   Yellow(Day D): Dikta–Jimbo
//   Black (Day E): Gina–Wati, Gina–Ardi
//
//   Degree check: Ardi ↔ {Mela,Tita,Dikta,Jimbo,Wati,Gina} = all ✓
//                 Wati ↔ {Tita,Mela,Dikta,Jimbo,Ardi,Gina}  = all ✓
//
// Co-exported primitive: `LibraryVisitGraph` — renders the rectangle-node
// graph, optionally with amber-ring highlights per node. Used by the explainer.
//
// Default export: plain static figure. SSR-safe, no hooks, no framer-motion.

// ── constants ─────────────────────────────────────────────────────────────────

const VB_W = 440
const VB_H = 360

// Rectangle-node geometry
const RW = 72   // rect width
const RH = 27   // rect height

// Visit-day colours (faithful to the source image)
const RED    = '#ef4444'
const CYAN   = '#06b6d4'
const GREEN  = '#22c55e'
const YELLOW = '#eab308'
const DARK   = '#1a1a1a'   // "black" day

// Node border (default) and amber highlight
const NODE_STROKE   = '#30598A'
const NODE_FILL     = '#F5F0E8'
const AMBER_STROKE  = '#f59e0b'
const AMBER_FILL    = '#fef3c7'

// ── node model ────────────────────────────────────────────────────────────────

interface NodeDef { id: string; x: number; y: number; label: string }

// Pixel centres — layout mirrors the source image.
export const NODES: NodeDef[] = [
  { id: 'mela',  x: 220, y:  32, label: 'Mela'  },
  { id: 'tita',  x:  55, y: 155, label: 'Tita'  },
  { id: 'dikta', x: 385, y: 155, label: 'Dikta' },
  { id: 'ardi',  x: 200, y: 215, label: 'Ardi'  },
  { id: 'gina',  x:  55, y: 318, label: 'Gina'  },
  { id: 'wati',  x: 200, y: 332, label: 'Wati'  },
  { id: 'jimbo', x: 385, y: 318, label: 'Jimbo' },
]

// ── edge model ────────────────────────────────────────────────────────────────

interface EdgeDef { a: string; b: string; color: string }

export const EDGES: EdgeDef[] = [
  // Red day — Tita, Mela, Dikta, Wati
  { a: 'tita',  b: 'mela',  color: RED    },
  { a: 'tita',  b: 'dikta', color: RED    },
  { a: 'tita',  b: 'wati',  color: RED    },
  { a: 'mela',  b: 'wati',  color: RED    },
  { a: 'dikta', b: 'wati',  color: RED    },
  // Cyan day — Mela, Ardi, Tita
  { a: 'mela',  b: 'ardi',  color: CYAN   },
  { a: 'ardi',  b: 'tita',  color: CYAN   },
  { a: 'ardi',  b: 'dikta', color: CYAN   },
  // Green day — Ardi, Jimbo, Wati
  { a: 'ardi',  b: 'jimbo', color: GREEN  },
  { a: 'wati',  b: 'jimbo', color: GREEN  },
  { a: 'ardi',  b: 'wati',  color: GREEN  },
  // Yellow day — Dikta, Jimbo
  { a: 'dikta', b: 'jimbo', color: YELLOW },
  // Black day — Gina, Ardi, Wati
  { a: 'gina',  b: 'wati',  color: DARK   },
  { a: 'gina',  b: 'ardi',  color: DARK   },
]

// ── shared primitive (used by explainer) ─────────────────────────────────────

export interface LibraryVisitGraphProps {
  /** Node ids that receive an amber highlight ring. */
  highlightNodes?: string[]
  /** Node id that gets an amber fill (the "focus" student). */
  focusId?: string | null
}

/**
 * LibraryVisitGraph — rectangle-node graph primitive for Q23.
 *
 * Renders edges first (so rects cover the line ends), then node rectangles
 * with text labels.  SSR-safe; no motion.
 */
export function LibraryVisitGraph({
  highlightNodes = [],
  focusId = null,
}: LibraryVisitGraphProps = {}) {
  const nodeMap = new Map(NODES.map(n => [n.id, n]))
  const hlSet   = new Set(highlightNodes)

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width={Math.min(VB_W, 340)}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* 1. Edges — drawn behind nodes so rects cleanly clip the line ends */}
      {EDGES.map((e, i) => {
        const na = nodeMap.get(e.a)
        const nb = nodeMap.get(e.b)
        if (!na || !nb) return null
        return (
          <line
            key={i}
            x1={na.x} y1={na.y}
            x2={nb.x} y2={nb.y}
            stroke={e.color}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        )
      })}

      {/* 2. Nodes — rectangle + label */}
      {NODES.map(n => {
        const isHL    = hlSet.has(n.id)
        const isFocus = n.id === focusId
        const rectFill   = isFocus ? AMBER_FILL   : isHL ? '#fff9e6' : NODE_FILL
        const rectStroke = isFocus ? AMBER_STROKE  : isHL ? AMBER_STROKE : NODE_STROKE
        const sw         = isFocus || isHL ? 2.6 : 1.8
        return (
          <g key={n.id}>
            <rect
              x={n.x - RW / 2}
              y={n.y - RH / 2}
              width={RW}
              height={RH}
              rx={5}
              fill={rectFill}
              stroke={rectStroke}
              strokeWidth={sw}
            />
            <text
              x={n.x}
              y={n.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={700}
              fill="#111827"
              className="font-display"
            >
              {n.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── default export — static illustration ─────────────────────────────────────

/**
 * LibraryVisitOSN24NT1Q23Illustration
 *
 * Plain problem-only figure for OSN-24-SD-NAS-TEORI1-Q23.
 * Shows the 7-node library-visit graph in 5 visit-day colours.
 * No answer hints.
 */
export default function LibraryVisitOSN24NT1Q23Illustration() {
  return (
    <div
      className="my-4 flex justify-center"
      role="img"
      aria-label={
        'Diagram kunjungan ke perpustakaan: tujuh siswa (Mela, Tita, Dikta, ' +
        'Ardi, Gina, Wati, Jimbo) dihubungkan oleh garis berwarna. ' +
        'Garis sewarna menunjukkan hari berkunjung yang sama.'
      }
    >
      <LibraryVisitGraph />
    </div>
  )
}
