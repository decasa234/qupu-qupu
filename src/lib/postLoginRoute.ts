// src/lib/postLoginRoute.ts
//
// Single source of truth for "where does an authenticated user land?".
// Used by Login, Register (Google path can authenticate an existing account)
// and the authed `/` redirect in App.tsx.
//
// Matrix:
//   admin                  → /admin/dashboard (the admin landing — same end
//                            state as the old /dashboard → DashboardRouter
//                            redirect chain, without the bounce)
//   member, 0 children     → /onboard/child   (must create a profile first)
//   member, ≥1 child       → /latihan/wmi     (the WMI garden — login lands
//                            in learning, not on the stats dashboard)
export function resolvePostLoginRoute(role: string, childrenCount: number): string {
  if (role === 'admin') return '/admin/dashboard'
  if (childrenCount === 0) return '/onboard/child'
  return '/latihan/wmi'
}
