// api/services/notifications/templates.ts
//
// Indonesian email templates for the parent notification loop (P2.5).
// Parent-addressed, warm but plain: simple inline-styled HTML in the brand
// palette (blue #30598A, orange #f0853a), no images, no icon fonts (Font
// Awesome doesn't exist in email clients), no emoji.
//
// streakAtRisk takes a LIST of children: the dispatcher sends ONE email per
// parent covering every at-risk child, so a two-kid evening is one message,
// not two.

export interface NotificationTemplate {
  subject: string
  html: string
}

export interface AtRiskChild {
  childName: string
  streakDays: number
  // Streak shields owned (gamification_profiles.streak_shields). When > 0
  // the streak is protected even if today is missed, so the copy softens —
  // crying wolf would teach parents to ignore the channel.
  shields: number
}

export interface DigestRow {
  childName: string
  xp: number
  sessions: number
  conceptsGrown: number
}

const BRAND_BLUE = '#30598A'
const BRAND_ORANGE = '#f0853a'

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeName(name: string, fallback: string): string {
  return escapeHtml((name || '').trim() || fallback)
}

function wrap(body: string): string {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#1f2937;max-width:520px">
      <p style="font-size:20px;font-weight:bold;color:${BRAND_BLUE};margin:0 0 16px">QUPU</p>
      ${body}
      <p style="color:#6b7280;font-size:12px;margin-top:24px">
        Email ini dikirim karena pengingat email aktif di akun QUPU kamu.
        Kamu bisa mematikannya kapan saja lewat halaman Profil &gt; Email pengingat &amp; rangkuman mingguan.
      </p>
    </div>
  `
}

export function streakAtRisk(input: {
  parentName: string
  children: AtRiskChild[]
}): NotificationTemplate {
  const parent = safeName(input.parentName, 'Orang tua QUPU')
  const first = input.children[0]
  const subject =
    input.children.length === 1
      ? `Streak ${first.streakDays} hari ${(first.childName || '').trim() || 'si kecil'} hampir putus!`
      : 'Streak belajar anak-anak hampir putus!'

  const lines = input.children
    .map((child) => {
      const name = safeName(child.childName, 'si kecil')
      const tail =
        child.shields > 0
          ? `— Pelindung Streak siap menjaga, tapi latihan singkat hari ini tetap seru!`
          : `tinggal beberapa jam lagi! Ajak ${name} latihan sebentar yuk.`
      return `
        <p style="margin:0 0 12px">
          <span style="font-weight:bold;color:${BRAND_ORANGE}">Streak ${child.streakDays} hari ${name}</span>
          ${tail}
        </p>
      `
    })
    .join('')

  const html = wrap(`
    <p style="margin:0 0 16px">Hai ${parent},</p>
    ${lines}
    <p style="margin:0">Satu sesi singkat sebelum tidur sudah cukup untuk menjaga streak-nya.</p>
  `)

  return { subject, html }
}

export function weeklyDigest(input: {
  parentName: string
  rows: DigestRow[]
}): NotificationTemplate {
  const parent = safeName(input.parentName, 'Orang tua QUPU')
  const subject = 'Rangkuman belajar QUPU minggu lalu'

  const rows = input.rows
    .map((row) => {
      const name = safeName(row.childName, 'si kecil')
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:bold;color:${BRAND_BLUE}">${name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right">${row.xp} XP</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right">${row.sessions} sesi</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right">${row.conceptsGrown} konsep naik tingkat</td>
        </tr>
      `
    })
    .join('')

  const html = wrap(`
    <p style="margin:0 0 16px">Hai ${parent},</p>
    <p style="margin:0 0 16px">Begini perjalanan belajar minggu lalu:</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      <tbody>${rows}</tbody>
    </table>
    <p style="margin:16px 0 0">Terus semangat minggu ini — sedikit demi sedikit, lama-lama jadi mahir.</p>
  `)

  return { subject, html }
}
