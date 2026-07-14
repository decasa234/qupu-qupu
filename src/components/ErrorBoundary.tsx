// src/components/ErrorBoundary.tsx
//
// Class-based React error boundary (Mythos P1.6). A render error anywhere in
// the ~75 param-driven WMI illustration components used to white-screen the
// kid app invisibly — this catches it, reports it through the consent-gated
// analytics pipe, and renders a fallback instead.
//
// Fallback semantics:
//   - `fallback` omitted  → friendly Indonesian card with a reload button
//     (used at the app shell level).
//   - `fallback={null}`   → renders nothing (used around illustration slots:
//     a broken illustration must vanish, never block the question).
//
// Pass a `key` to reset the boundary when its content changes (e.g. keyed by
// question id, so one broken illustration doesn't hide the next question's).

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportClientError } from '../lib/analytics'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  scope: string
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // reportClientError truncates + throttles + consent-gates internally.
    reportClientError(this.props.scope, error.message, info.componentStack ?? error.stack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // `fallback={null}` is a deliberate "render nothing" — only the fully
      // omitted prop falls back to the default card.
      return this.props.fallback !== undefined ? this.props.fallback : <DefaultErrorFallback />
    }
    return this.props.children
  }
}

function DefaultErrorFallback() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center bg-qupu-cream px-4">
      <div className="w-full max-w-[26.25rem] rounded-[1.5rem] border-2 border-qupu-peach bg-white p-6 text-center shadow-[0_5px_0_0_#FFD3B1]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qupu-cream text-qupu-brand-orange">
          <i className="fa-solid fa-circle-exclamation text-2xl" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm font-semibold text-qupu-muted">
          Ups, ada yang error. Muat ulang halaman ini, ya.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-qupu-brand-blue px-6 py-3 font-display font-black text-white shadow-[0_3px_0_0_#0E1430] transition-transform active:translate-y-0.5"
        >
          <i className="fa-solid fa-rotate-right text-sm" aria-hidden="true" />
          Muat Ulang
        </button>
      </div>
    </div>
  )
}
