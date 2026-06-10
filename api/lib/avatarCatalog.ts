// api/lib/avatarCatalog.ts
//
// SERVER-SIDE mirror of the level-gated avatar entries (Mythos P2.4).
//
// The catalog's source of truth (slugs, icons, labels, colors) lives in the
// frontend module src/lib/avatars.ts. The API only needs the gated subset to
// reject forged create/update requests, so we mirror just the minLevel maps
// here as plain consts instead of importing across the src/api boundary —
// Vercel bundles the API separately and it must not pull frontend modules.
//
// KEEP IN SYNC with src/lib/avatars.ts. api/lib/avatarCatalog.test.ts
// imports both modules and fails the suite when they drift.

export const AVATAR_ICON_MIN_LEVEL: Record<string, number> = {
  'kiwi-bird': 5,
  robot: 10,
  astronaut: 15,
  dragon: 20,
}

export const AVATAR_COLOR_MIN_LEVEL: Record<string, number> = {
  '#A78BFA': 5,
  '#F59E0B': 10,
}

// Highest level the requested icon/color pair demands (0 = ungated).
// Unknown values are treated as ungated — Joi already constrains the shape,
// and an unknown-but-harmless slug must not brick the profile editor.
// Colors compare case-insensitively (catalog keys are uppercase hex): a
// forged '#a78bfa' must gate exactly like '#A78BFA'.
export function requiredAvatarLevel(
  icon?: string | null,
  color?: string | null,
): number {
  return Math.max(
    icon ? (AVATAR_ICON_MIN_LEVEL[icon] ?? 0) : 0,
    color ? (AVATAR_COLOR_MIN_LEVEL[color.toUpperCase()] ?? 0) : 0,
  )
}
