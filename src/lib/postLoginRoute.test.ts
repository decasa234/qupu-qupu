import { describe, expect, test } from 'vitest'
import { resolvePostLoginRoute } from './postLoginRoute'

describe('resolvePostLoginRoute', () => {
  test('admin lands on the admin dashboard regardless of children', () => {
    expect(resolvePostLoginRoute('admin', 0)).toBe('/admin/dashboard')
    expect(resolvePostLoginRoute('admin', 2)).toBe('/admin/dashboard')
  })

  test('member with at least one child lands in the WMI garden', () => {
    expect(resolvePostLoginRoute('parent', 1)).toBe('/latihan/wmi')
    expect(resolvePostLoginRoute('parent', 3)).toBe('/latihan/wmi')
    expect(resolvePostLoginRoute('student', 1)).toBe('/latihan/wmi')
  })

  test('member with no children goes to child onboarding', () => {
    expect(resolvePostLoginRoute('parent', 0)).toBe('/onboard/child')
    expect(resolvePostLoginRoute('teacher', 0)).toBe('/onboard/child')
  })
})
