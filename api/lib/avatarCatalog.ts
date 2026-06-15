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
  dog: 2,
  fish: 3,
  frog: 4,
  shrimp: 5,
  otter: 6,
  cow: 7,
  horse: 8,
  hippo: 9,
  crow: 10,
  dove: 11,
  'kiwi-bird': 12,
  spider: 13,
  bug: 14,
  snowman: 15,
  ghost: 16,
  wizard: 17,
  knight: 18,
  robot: 19,
  ninja: 20,
  spy: 21,
  astronaut: 22,
  king: 23,
  queen: 24,
  dragon: 25,
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
