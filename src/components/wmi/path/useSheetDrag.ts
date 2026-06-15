// src/components/wmi/path/useSheetDrag.ts
//
// Swipe-to-dismiss for the Belajar bottom sheets. Attach `dragHandlers` to a
// grab zone (the handle / header — NOT a scrollable list) and spread
// `sheetStyle` on the panel; pass the panel `panelRef`. Dragging the sheet
// down past ~28% of its height (or with enough downward velocity) closes it
// with a slide-off; a shorter drag springs back. Respects reduced motion.

import { useCallback, useEffect, useRef, useState } from 'react'

interface SheetDrag {
  panelRef: React.RefObject<HTMLDivElement | null>
  dragHandlers: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerMove: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    onPointerCancel: (e: React.PointerEvent) => void
  }
  sheetStyle: React.CSSProperties | undefined
}

const CLOSE_DISTANCE_RATIO = 0.28
const CLOSE_VELOCITY = 0.55 // px per ms

// `open` is only needed for sheets that stay MOUNTED while closed (e.g.
// QuestsSheet, hidden via CSS) — passing it resets the drag state each time the
// sheet reopens so a previous dismissal's slid-off transform doesn't linger.
// Sheets that unmount on close (ConceptSheet, ChapterSheet) omit it.
export function useSheetDrag(onClose: () => void, open?: boolean): SheetDrag {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [engaged, setEngaged] = useState(false)
  const startY = useRef(0)
  const lastY = useRef(0)
  const lastT = useRef(0)
  const vel = useRef(0)
  const closing = useRef(false)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  // Reopened (mounted-while-closed sheets) → clear leftover drag/close state.
  useEffect(() => {
    if (open) {
      closing.current = false
      setDragY(0)
      setDragging(false)
      setEngaged(false)
    }
  }, [open])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (closing.current) return
    setEngaged(true)
    setDragging(true)
    startY.current = e.clientY
    lastY.current = e.clientY
    lastT.current = e.timeStamp
    vel.current = 0
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      /* capture unsupported — drag still works while pointer stays on element */
    }
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      const dy = Math.max(0, e.clientY - startY.current) // downward only
      const dt = e.timeStamp - lastT.current
      if (dt > 0) vel.current = (e.clientY - lastY.current) / dt
      lastY.current = e.clientY
      lastT.current = e.timeStamp
      setDragY(dy)
    },
    [dragging],
  )

  const finish = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      setDragging(false)
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      } catch {
        /* nothing captured */
      }
      const h = panelRef.current?.offsetHeight ?? 400
      const shouldClose = dragY > h * CLOSE_DISTANCE_RATIO || vel.current > CLOSE_VELOCITY
      if (!shouldClose) {
        setDragY(0)
        return
      }
      const reduce = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      if (reduce) {
        onClose()
        return
      }
      closing.current = true
      setDragY(h + 48) // slide fully off-screen, then unmount
      timer.current = window.setTimeout(onClose, 200)
    },
    [dragging, dragY, onClose],
  )

  // `animation: none` cancels the panel's `animate-rise` entrance once a drag
  // starts. That entrance uses fill-mode `both`, so its finished keyframe keeps
  // pinning transform: translateY(0) and would otherwise override the inline
  // drag transform — making the sheet appear frozen while dragging.
  const sheetStyle: React.CSSProperties | undefined = engaged
    ? {
        transform: `translateY(${dragY}px)`,
        transition: dragging ? 'none' : 'transform 0.28s cubic-bezier(.34,1.4,.5,1)',
        animation: 'none',
      }
    : undefined

  return {
    panelRef,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
    },
    sheetStyle,
  }
}
