// src/lib/avatars.ts
//
// Cute, vector (Font Awesome) avatars a child can pick from the Profil page.
// Stored per child as `avatarIcon` (the slug); rendered everywhere via
// avatarIconClass(). Colors reuse the existing avatarColor presets.
//
// LEVEL GATING (Mythos P2.4): a few aspirational entries carry `minLevel` —
// they render locked in AvatarEditor until the child's gamification level
// reaches it, and the API rejects them server-side too. The gated subset is
// MIRRORED in api/lib/avatarCatalog.ts (the API must not import frontend
// modules); api/lib/avatarCatalog.test.ts fails when the two drift.

export interface AvatarOption {
  slug: string
  icon: string // Font Awesome class
  label: string
  /** Gamification level required to pick this avatar. Absent = always available. */
  minLevel?: number
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { slug: 'cat', icon: 'fa-solid fa-cat', label: 'Kucing' },
  { slug: 'dog', icon: 'fa-solid fa-dog', label: 'Anjing' },
  { slug: 'frog', icon: 'fa-solid fa-frog', label: 'Katak' },
  { slug: 'fish', icon: 'fa-solid fa-fish', label: 'Ikan' },
  { slug: 'hippo', icon: 'fa-solid fa-hippo', label: 'Kuda Nil' },
  { slug: 'otter', icon: 'fa-solid fa-otter', label: 'Berang-berang' },
  { slug: 'dove', icon: 'fa-solid fa-dove', label: 'Merpati' },
  { slug: 'horse', icon: 'fa-solid fa-horse', label: 'Kuda' },
  { slug: 'cow', icon: 'fa-solid fa-cow', label: 'Sapi' },
  { slug: 'kiwi-bird', icon: 'fa-solid fa-kiwi-bird', label: 'Kiwi', minLevel: 5 },
  { slug: 'crow', icon: 'fa-solid fa-crow', label: 'Gagak' },
  { slug: 'robot', icon: 'fa-solid fa-robot', label: 'Robot', minLevel: 10 },
  { slug: 'astronaut', icon: 'fa-solid fa-user-astronaut', label: 'Astronot', minLevel: 15 },
  { slug: 'dragon', icon: 'fa-solid fa-dragon', label: 'Naga', minLevel: 20 },
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

// Resolve a stored slug to a Font Awesome class, falling back to the default
// avatar so children created before they picked an avatar still render. The
// fallback matches DEFAULT_AVATAR_SLUG (what AvatarEditor previews for a
// null avatarIcon) — it must never be a level-gated icon.
export function avatarIconClass(slug: string | null | undefined): string {
  return (slug && BY_SLUG.get(slug)?.icon) || BY_SLUG.get(DEFAULT_AVATAR_SLUG)!.icon
}
