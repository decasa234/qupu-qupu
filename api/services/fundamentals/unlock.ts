// Pure linear-unlock rule, separated from DB code so it is unit-testable with
// no pg import. A lesson is LOCKED iff some earlier lesson in the ordered course
// sequence is still incomplete. Completed lessons are never locked (you can
// always revisit), and the first incomplete lesson is always unlocked (it's
// "next").

export function applyLinearUnlock<T extends { completed: boolean }>(
  ordered: T[],
): (T & { locked: boolean })[] {
  let allPriorComplete = true
  return ordered.map((lesson) => {
    const locked = !allPriorComplete && !lesson.completed
    allPriorComplete = allPriorComplete && lesson.completed
    return { ...lesson, locked }
  })
}
