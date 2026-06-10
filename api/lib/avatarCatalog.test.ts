// Level-gated avatar items (Mythos P2.4).
//
// The frontend catalog (src/lib/avatars.ts) is the source of truth; the API
// mirrors just the gated subset (avatarCatalog.ts) to reject forged
// requests. This suite imports BOTH modules and fails when they drift — the
// enforcement behind every "KEEP IN SYNC" comment.

import { describe, expect, it } from 'vitest'
import {
  AVATAR_COLOR_MIN_LEVEL,
  AVATAR_ICON_MIN_LEVEL,
  requiredAvatarLevel,
} from './avatarCatalog'
import {
  AVATAR_COLOR_OPTIONS,
  AVATAR_OPTIONS,
  DEFAULT_AVATAR_COLOR,
  DEFAULT_AVATAR_SLUG,
  isAvatarUnlocked,
} from '../../src/lib/avatars'

describe('avatar catalog FE/API sync', () => {
  it('the API icon map mirrors exactly the gated FE icons', () => {
    const gatedFe = Object.fromEntries(
      AVATAR_OPTIONS.filter((o) => o.minLevel !== undefined).map((o) => [o.slug, o.minLevel]),
    )
    expect(AVATAR_ICON_MIN_LEVEL).toEqual(gatedFe)
  })

  it('the API color map mirrors exactly the gated FE colors', () => {
    const gatedFe = Object.fromEntries(
      AVATAR_COLOR_OPTIONS.filter((o) => o.minLevel !== undefined).map((o) => [
        o.value,
        o.minLevel,
      ]),
    )
    expect(AVATAR_COLOR_MIN_LEVEL).toEqual(gatedFe)
  })

  it('the defaults are never gated (wizard/new-child flows rely on this)', () => {
    expect(requiredAvatarLevel(DEFAULT_AVATAR_SLUG, DEFAULT_AVATAR_COLOR)).toBe(0)
  })
})

describe('requiredAvatarLevel', () => {
  it('takes the max of the icon and color requirements', () => {
    expect(requiredAvatarLevel('dragon', '#A78BFA')).toBe(20)
    expect(requiredAvatarLevel(null, '#F59E0B')).toBe(10)
    expect(requiredAvatarLevel('robot', null)).toBe(10)
  })

  it('treats unknown or absent values as ungated', () => {
    expect(requiredAvatarLevel('made-up-slug', '#123456')).toBe(0)
    expect(requiredAvatarLevel(null, null)).toBe(0)
    expect(requiredAvatarLevel(undefined, undefined)).toBe(0)
  })

  it('gates colors case-insensitively (hex-case bypass)', () => {
    expect(requiredAvatarLevel(null, '#a78bfa')).toBe(5)
    expect(requiredAvatarLevel(null, '#f59e0b')).toBe(10)
    expect(requiredAvatarLevel(null, '#A78bFa')).toBe(5)
    expect(requiredAvatarLevel('dragon', '#a78bfa')).toBe(20)
  })
})

describe('isAvatarUnlocked (FE gate)', () => {
  it('is a strict >= threshold with ungated entries always unlocked', () => {
    expect(isAvatarUnlocked(undefined, 1)).toBe(true)
    expect(isAvatarUnlocked(5, 4)).toBe(false)
    expect(isAvatarUnlocked(5, 5)).toBe(true)
    expect(isAvatarUnlocked(20, 19)).toBe(false)
    expect(isAvatarUnlocked(20, 20)).toBe(true)
  })
})
