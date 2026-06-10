// api/services/notifications/templates.test.ts
//
// Pure template rendering (no DB, no network): the Indonesian copy must
// carry the load-bearing facts (child name, streak length, weekly numbers)
// and never let a user-supplied name inject HTML.

import { describe, it, expect } from 'vitest'
import { streakAtRisk, weeklyDigest } from './templates.js'

describe('streakAtRisk template', () => {
  it('renders the child name, streak length, and parent greeting', () => {
    const tpl = streakAtRisk({
      parentName: 'Bu Sari',
      children: [{ childName: 'Raka', streakDays: 7, shields: 0 }],
    })
    expect(tpl.subject).toContain('Raka')
    expect(tpl.subject).toContain('7')
    expect(tpl.html).toContain('Hai Bu Sari')
    expect(tpl.html).toContain('Streak 7 hari Raka')
    expect(tpl.html).toContain('Ajak Raka latihan sebentar yuk')
  })

  it('lists every at-risk child in one email for multi-child parents', () => {
    const tpl = streakAtRisk({
      parentName: 'Pak Budi',
      children: [
        { childName: 'Raka', streakDays: 12, shields: 0 },
        { childName: 'Dina', streakDays: 4, shields: 0 },
      ],
    })
    expect(tpl.html).toContain('Streak 12 hari Raka')
    expect(tpl.html).toContain('Streak 4 hari Dina')
    // Multi-child subject stays generic instead of picking a favorite.
    expect(tpl.subject).not.toContain('Raka')
  })

  it('softens the copy when the child owns a streak shield', () => {
    const tpl = streakAtRisk({
      parentName: 'Bu Sari',
      children: [
        { childName: 'Raka', streakDays: 7, shields: 1 },
        { childName: 'Dina', streakDays: 4, shields: 0 },
      ],
    })
    // Shielded child: protected framing, no "hampir putus" urgency line.
    expect(tpl.html).toContain('Pelindung Streak siap menjaga')
    // Unshielded sibling keeps the urgent copy.
    expect(tpl.html).toContain('Ajak Dina latihan sebentar yuk')
    expect(tpl.html).not.toContain('Ajak Raka latihan sebentar yuk')
  })

  it('escapes HTML in names', () => {
    const tpl = streakAtRisk({
      parentName: '<script>x</script>',
      children: [{ childName: '<b>Raka</b>', streakDays: 3, shields: 0 }],
    })
    expect(tpl.html).not.toContain('<script>')
    expect(tpl.html).not.toContain('<b>Raka</b>')
    expect(tpl.html).toContain('&lt;b&gt;Raka&lt;/b&gt;')
  })
})

describe('weeklyDigest template', () => {
  it('renders one row per child with XP, sessions, and concepts grown', () => {
    const tpl = weeklyDigest({
      parentName: 'Bu Sari',
      rows: [
        { childName: 'Raka', xp: 120, sessions: 5, conceptsGrown: 2 },
        { childName: 'Dina', xp: 45, sessions: 3, conceptsGrown: 1 },
      ],
    })
    expect(tpl.subject).toContain('minggu lalu')
    expect(tpl.html).toContain('Hai Bu Sari')
    expect(tpl.html).toContain('Raka')
    expect(tpl.html).toContain('120 XP')
    expect(tpl.html).toContain('5 sesi')
    expect(tpl.html).toContain('2 konsep naik tingkat')
    expect(tpl.html).toContain('Dina')
    expect(tpl.html).toContain('45 XP')
  })
})
