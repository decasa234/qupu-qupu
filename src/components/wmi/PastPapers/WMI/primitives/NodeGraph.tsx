/**
 * NodeGraph — generic node-and-edge graph primitive for WMI past-paper illustrations.
 *
 * Pure SVG component. No framer-motion, no React hooks, SSR-safe and deterministic.
 *
 * Coordinates: node `x` and `y` are pixel values within the `[0..width] × [0..height]`
 * viewBox — the same convention used by Graph15ECIllustration and Villages19PEIllustration.
 *
 * Render order: edges → edge labels → node circles → node labels.
 *
 * @example
 * // Four-node ring (square)
 * <NodeGraph
 *   width={200} height={200}
 *   nodes={[
 *     { id: 'A', x: 100, y: 20,  label: 'A' },
 *     { id: 'B', x: 180, y: 100, label: 'B' },
 *     { id: 'C', x: 100, y: 180, label: 'C' },
 *     { id: 'D', x: 20,  y: 100, label: 'D' },
 *   ]}
 *   edges={[
 *     { a: 'A', b: 'B' },
 *     { a: 'B', b: 'C' },
 *     { a: 'C', b: 'D' },
 *     { a: 'D', b: 'A' },
 *   ]}
 * />
 */

// ── Defaults & palette ────────────────────────────────────────────────────────

const DEFAULT_NODE_R = 20
const DEFAULT_WIDTH  = 300
const DEFAULT_HEIGHT = 300

const FILL_DEFAULT   = '#F5F0E8'   // qupu shell-like off-white
const STROKE_DEFAULT = '#30598A'   // qupu-brand-blue
const STROKE_W       = 2.4
const EDGE_STROKE    = '#30598A'
const EDGE_W         = 2
const LABEL_FILL     = '#1F2937'   // dark ink
const EDGE_LABEL_FILL = '#4B5563'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NodeDef {
  /** Unique identifier used to reference this node from edges. */
  id: string
  /** X pixel coordinate within the viewBox. */
  x: number
  /** Y pixel coordinate within the viewBox. */
  y: number
  /**
   * Circle fill colour. Accepts any valid CSS colour string.
   * Defaults to a qupu shell-like off-white.
   */
  fill?: string
  /** Text rendered at the node centre. Omit for an unlabelled node. */
  label?: string
}

export interface EdgeDef {
  /** `id` of the first endpoint node. */
  a: string
  /** `id` of the second endpoint node. */
  b: string
  /** Text rendered at the midpoint of the edge. Omit for an unlabelled edge. */
  label?: string
  /**
   * Quadratic bezier curve strength. Positive values bulge the edge upward/left,
   * negative values bulge it downward/right. `0` (default) draws a straight line.
   * Sensible range: –60 to 60.
   */
  curve?: number
  /** Edge stroke colour. Defaults to qupu-brand-blue. */
  color?: string
}

export interface NodeGraphProps {
  /** Array of node definitions. Each node must have a unique `id`. */
  nodes: NodeDef[]
  /** Array of edge definitions referencing node ids. */
  edges: EdgeDef[]
  /** Circle radius in pixels. Default: 20. */
  nodeR?: number
  /** SVG viewBox width in pixels. Default: 300. */
  width?: number
  /** SVG viewBox height in pixels. Default: 300. */
  height?: number
}

// ── Geometry helpers ──────────────────────────────────────────────────────────

/**
 * Builds a straight-line or quadratic-bezier path `d` attribute between two
 * pixel-space points.
 *
 * When `curve` is 0 (or omitted), returns a straight `M…L` path.
 * Otherwise uses `M…Q` with a control point shifted perpendicularly to the
 * midpoint by `curve` pixels — matching the style used by Villages19PE.
 */
function edgePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curve: number,
): string {
  if (curve === 0) {
    return `M ${x1} ${y1} L ${x2} ${y2}`
  }
  // Midpoint
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  // Perpendicular unit vector (rotate edge direction 90°)
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  // Perpendicular: (-dy, dx) rotated to push in the "curve" direction
  const cpx = mx + (-dy / len) * curve
  const cpy = my + ( dx / len) * curve
  return `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`
}

/**
 * Returns the visual midpoint of the edge (straight or bezier) for label placement.
 * For a quadratic bezier, the point at t=0.5 is the average of endpoints and
 * the control point weighted by (0.25, 0.5, 0.25) — but for label purposes
 * using the simple midpoint offset by half the control-point pull is good enough
 * and avoids floating-point noise.
 */
function edgeLabelPoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curve: number,
): { x: number; y: number } {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  if (curve === 0) {
    return { x: mx, y: my }
  }
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  // At t=0.5 on a quadratic bezier, the point is shifted 0.5 * (bulge)
  // toward the control point (which itself is shifted `curve` units perp).
  return {
    x: mx + (-dy / len) * curve * 0.5,
    y: my + ( dx / len) * curve * 0.5,
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Generic node-and-edge graph primitive.
 *
 * Drop-in for any WMI illustration that needs a labelled circle graph
 * (graph colouring, shortest path, village maps, etc.).
 */
export function NodeGraph({
  nodes,
  edges,
  nodeR = DEFAULT_NODE_R,
  width  = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}: NodeGraphProps) {
  // Build a fast lookup from node id → position
  const nodeMap = new Map<string, NodeDef>()
  for (const n of nodes) nodeMap.set(n.id, n)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={Math.min(width, DEFAULT_WIDTH)}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* ── 1. Edge lines ──────────────────────────────────────────────────── */}
      {edges.map((edge, i) => {
        const na = nodeMap.get(edge.a)
        const nb = nodeMap.get(edge.b)
        if (!na || !nb) return null
        const curve = edge.curve ?? 0
        const d = edgePath(na.x, na.y, nb.x, nb.y, curve)
        return (
          <path
            key={`edge-${i}-${edge.a}-${edge.b}`}
            d={d}
            fill="none"
            stroke={edge.color ?? EDGE_STROKE}
            strokeWidth={EDGE_W}
            strokeLinecap="round"
          />
        )
      })}

      {/* ── 2. Edge labels ─────────────────────────────────────────────────── */}
      {edges.map((edge, i) => {
        if (!edge.label) return null
        const na = nodeMap.get(edge.a)
        const nb = nodeMap.get(edge.b)
        if (!na || !nb) return null
        const curve = edge.curve ?? 0
        const lp = edgeLabelPoint(na.x, na.y, nb.x, nb.y, curve)
        return (
          <text
            key={`elabel-${i}-${edge.a}-${edge.b}`}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={700}
            fill={EDGE_LABEL_FILL}
            stroke="white"
            strokeWidth={3}
            paintOrder="stroke"
            className="font-display"
          >
            {edge.label}
          </text>
        )
      })}

      {/* ── 3. Node circles ────────────────────────────────────────────────── */}
      {nodes.map((node) => (
        <circle
          key={`node-${node.id}`}
          cx={node.x}
          cy={node.y}
          r={nodeR}
          fill={node.fill ?? FILL_DEFAULT}
          stroke={STROKE_DEFAULT}
          strokeWidth={STROKE_W}
        />
      ))}

      {/* ── 4. Node labels ─────────────────────────────────────────────────── */}
      {nodes.map((node) => {
        if (!node.label) return null
        return (
          <text
            key={`nlabel-${node.id}`}
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={nodeR}
            fontWeight={700}
            fill={LABEL_FILL}
            className="font-display"
          >
            {node.label}
          </text>
        )
      })}
    </svg>
  )
}

export default NodeGraph
