import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type IllustrationComponent = ComponentType<{ params: unknown }>

// Lazy loader per concept slug — each illustration is code-split out of the
// main bundle and only downloaded when a question for that concept renders.
const ILLUSTRATION_LOADERS: Record<string, () => Promise<{ default: IllustrationComponent }>> = {
  'shape-perimeter-square': () => import('./shape-perimeter-square'),
  'clock-read-time': () => import('./clock-read-time'),
  'shape-perimeter-rectangle': () => import('./shape-perimeter-rectangle'),
  'bar-chart-compare': () => import('./bar-chart-compare'),
  'rectangle-area-grid': () => import('./rectangle-area-grid'),
  'perimeter-area-composed': () => import('./perimeter-area-composed'),
  'venn-set-membership': () => import('./venn-set-membership'),
  'block-count-3d': () => import('./block-count-3d'),
  'number-line-jumps': () => import('./number-line-jumps'),
  'count-polygon-sides': () => import('./count-polygon-sides'),
  'symmetry-count': () => import('./symmetry-count'),
  'angle-type': () => import('./angle-type'),
  'tally-marks-count': () => import('./tally-marks-count'),
  'grid-path-steps': () => import('./grid-path-steps'),
  'money-coins-total': () => import('./money-coins-total'),
  'same-figure-identify': () => import('./same-figure-identify'),
  'dice-net-fold': () => import('./dice-net-fold'),
  'scale-read': () => import('./scale-read'),
  'fraction-of-region': () => import('./fraction-of-region'),
  'maze-path-shortest': () => import('./maze-path-shortest'),
  'count-shapes-in-figure': () => import('./count-shapes-in-figure'),
  'count-rectangles-grid': () => import('./count-rectangles-grid'),
  'budget-selection': () => import('./budget-selection'),
}

// Memoize the lazy wrapper per slug so re-renders get the same component
// identity (a fresh lazy() each render would remount + reflow the figure).
const illustrationCache = new Map<string, LazyExoticComponent<IllustrationComponent>>()

export function getIllustration(slug: string): IllustrationComponent | null {
  const load = ILLUSTRATION_LOADERS[slug]
  if (!load) return null
  let component = illustrationCache.get(slug)
  if (!component) {
    // Chunk-load resilience: retry the import once (transient network blip),
    // and on a second failure EVICT the slug so a later render gets a fresh
    // lazy() instead of React's cached rejection — otherwise one failed
    // fetch would permanently kill this figure for the whole tab session.
    component = lazy(() =>
      load()
        .catch(() => load())
        .catch((err) => {
          illustrationCache.delete(slug)
          throw err
        }),
    )
    illustrationCache.set(slug, component)
  }
  return component
}
