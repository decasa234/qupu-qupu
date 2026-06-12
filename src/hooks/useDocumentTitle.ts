// src/hooks/useDocumentTitle.ts
//
// Per-route document titles. Call with a page name to get "Page · QUPU";
// call with no argument (or rely on index.html) for the default marketing
// title; call with null to leave the title alone (pages embedded inside
// another page's shell, e.g. DashboardPage inside ParentDashboard).
// Intentionally does NOT restore the previous title on unmount — every route
// that cares sets its own title on mount, so restoration would only produce
// flicker.
import { useEffect } from 'react'

export const DEFAULT_DOCUMENT_TITLE = 'QUPU — Belajar Matematika Seru untuk Anak'

export function useDocumentTitle(title?: string | null) {
  useEffect(() => {
    if (title === null) return
    document.title = title ? `${title} · QUPU` : DEFAULT_DOCUMENT_TITLE
  }, [title])
}

export default useDocumentTitle
