// src/lib/avatars.ts
//
// Cute, vector (Font Awesome) avatars a child can pick from the Profil page.
// Stored per child as `avatarIcon` (the slug); rendered everywhere via
// avatarIconClass(). Colors reuse the existing avatarColor presets.

export interface AvatarOption {
  slug: string
  icon: string // Font Awesome class
  label: string
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
  { slug: 'kiwi-bird', icon: 'fa-solid fa-kiwi-bird', label: 'Kiwi' },
  { slug: 'crow', icon: 'fa-solid fa-crow', label: 'Gagak' },
  { slug: 'dragon', icon: 'fa-solid fa-dragon', label: 'Naga' },
  { slug: 'robot', icon: 'fa-solid fa-robot', label: 'Robot' },
  { slug: 'astronaut', icon: 'fa-solid fa-user-astronaut', label: 'Astronot' },
]

export const AVATAR_COLORS = ['#FB923C', '#F472B6', '#60A5FA', '#34D399', '#A78BFA', '#F59E0B']

export const DEFAULT_AVATAR_SLUG = 'cat'
export const DEFAULT_AVATAR_COLOR = '#FB923C'

const BY_SLUG = new Map(AVATAR_OPTIONS.map((option) => [option.slug, option]))

// Resolve a stored slug to a Font Awesome class, falling back to a friendly
// default so children created before they picked an avatar still render.
export function avatarIconClass(slug: string | null | undefined): string {
  return (slug && BY_SLUG.get(slug)?.icon) || 'fa-solid fa-user-astronaut'
}
