// src/lib/avatars.ts
//
// Cute, vector (Font Awesome) avatars a child can pick from the Profil page.
// Stored per child as `avatarIcon` (the slug); rendered everywhere via
// avatarIconClass(). Colors reuse the existing avatarColor presets.
//
// LEVEL GATING (Mythos P2.4, extended): the roster is a CHARACTER LADDER with
// exactly one avatar per level (1–25, mirroring level_tiers) — leveling up
// reveals the next character and a child can only equip the ones they've
// reached. cat (the default) is level 1 and ungated so a brand-new child always
// has its starter; every other entry carries `minLevel` = its level and renders
// locked in AvatarEditor until reached. The API rejects gated picks server-side
// too. The gated subset is MIRRORED in api/lib/avatarCatalog.ts (the API must
// not import frontend modules); api/lib/avatarCatalog.test.ts fails when the two
// drift. Ordered by minLevel so it reads as a progression; avatarForLevel()
// resolves the "face" of any level for the level-ladder UI (LevelDetail).

export interface AvatarOption {
  slug: string
  icon: string // Font Awesome class
  label: string
  /** Gamification level required to pick this avatar. Absent = always available. */
  minLevel?: number
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { slug: 'cat', icon: 'fa-solid fa-cat', label: 'Kucing' }, // Lv 1 — ungated default
  { slug: 'dog', icon: 'fa-solid fa-dog', label: 'Anjing', minLevel: 2 },
  { slug: 'fish', icon: 'fa-solid fa-fish', label: 'Ikan', minLevel: 3 },
  { slug: 'frog', icon: 'fa-solid fa-frog', label: 'Katak', minLevel: 4 },
  { slug: 'shrimp', icon: 'fa-solid fa-shrimp', label: 'Udang', minLevel: 5 },
  { slug: 'otter', icon: 'fa-solid fa-otter', label: 'Berang-berang', minLevel: 6 },
  { slug: 'cow', icon: 'fa-solid fa-cow', label: 'Sapi', minLevel: 7 },
  { slug: 'horse', icon: 'fa-solid fa-horse', label: 'Kuda', minLevel: 8 },
  { slug: 'hippo', icon: 'fa-solid fa-hippo', label: 'Kuda Nil', minLevel: 9 },
  { slug: 'crow', icon: 'fa-solid fa-crow', label: 'Gagak', minLevel: 10 },
  { slug: 'dove', icon: 'fa-solid fa-dove', label: 'Merpati', minLevel: 11 },
  { slug: 'kiwi-bird', icon: 'fa-solid fa-kiwi-bird', label: 'Kiwi', minLevel: 12 },
  { slug: 'spider', icon: 'fa-solid fa-spider', label: 'Laba-laba', minLevel: 13 },
  { slug: 'bug', icon: 'fa-solid fa-bug', label: 'Kumbang', minLevel: 14 },
  { slug: 'snowman', icon: 'fa-solid fa-snowman', label: 'Manusia Salju', minLevel: 15 },
  { slug: 'ghost', icon: 'fa-solid fa-ghost', label: 'Hantu', minLevel: 16 },
  { slug: 'wizard', icon: 'fa-solid fa-hat-wizard', label: 'Penyihir', minLevel: 17 },
  { slug: 'knight', icon: 'fa-solid fa-chess-knight', label: 'Ksatria', minLevel: 18 },
  { slug: 'robot', icon: 'fa-solid fa-robot', label: 'Robot', minLevel: 19 },
  { slug: 'ninja', icon: 'fa-solid fa-user-ninja', label: 'Ninja', minLevel: 20 },
  { slug: 'spy', icon: 'fa-solid fa-user-secret', label: 'Mata-mata', minLevel: 21 },
  { slug: 'astronaut', icon: 'fa-solid fa-user-astronaut', label: 'Astronot', minLevel: 22 },
  { slug: 'king', icon: 'fa-solid fa-chess-king', label: 'Raja', minLevel: 23 },
  { slug: 'queen', icon: 'fa-solid fa-chess-queen', label: 'Ratu', minLevel: 24 },
  { slug: 'dragon', icon: 'fa-solid fa-dragon', label: 'Naga', minLevel: 25 },
]

export interface AvatarColorOption {
  value: string
  /** Gamification level required to pick this color. Absent = always available. */
  minLevel?: number
}

export const AVATAR_COLOR_OPTIONS: AvatarColorOption[] = [
  { value: '#FB923C' },
  { value: '#F472B6' },
  { value: '#60A5FA' },
  { value: '#34D399' },
  { value: '#A78BFA', minLevel: 5 },
  { value: '#F59E0B', minLevel: 10 },
]

export const DEFAULT_AVATAR_SLUG = 'cat'
export const DEFAULT_AVATAR_COLOR = '#FB923C'

// True when an entry with this minLevel is selectable at the given level.
// Ungated entries (no minLevel) are always selectable.
export function isAvatarUnlocked(minLevel: number | undefined, level: number): boolean {
  return (minLevel ?? 0) <= level
}

const BY_SLUG = new Map(AVATAR_OPTIONS.map((option) => [option.slug, option]))

// Level → the avatar that belongs to it (its `minLevel`; the ungated default
// is level 1). One avatar per level, so this is a clean 1:1 lookup used by the
// level ladder to show each tier's "face".
const BY_LEVEL = new Map(AVATAR_OPTIONS.map((option) => [option.minLevel ?? 1, option]))

// Resolve the avatar assigned to a given level tier, or undefined if the level
// has none (e.g. a future tier beyond the roster) so callers can fall back.
export function avatarForLevel(level: number): AvatarOption | undefined {
  return BY_LEVEL.get(level)
}

// Resolve a stored slug to a Font Awesome class, falling back to the default
// avatar so children created before they picked an avatar still render. The
// fallback matches DEFAULT_AVATAR_SLUG (what AvatarEditor previews for a
// null avatarIcon) — it must never be a level-gated icon.
export function avatarIconClass(slug: string | null | undefined): string {
  return (slug && BY_SLUG.get(slug)?.icon) || BY_SLUG.get(DEFAULT_AVATAR_SLUG)!.icon
}
