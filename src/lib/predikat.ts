import type { Predikat, SubjectStat } from '../types'

export function predikatLabel(p: Predikat): { label: string; bgClass: string; textClass: string } {
  switch (p) {
    case 'SANGAT_BAIK':
      return { label: 'Sangat Baik', bgClass: 'bg-emerald-500', textClass: 'text-white' }
    case 'BAIK':
      return { label: 'Baik', bgClass: 'bg-blue-500', textClass: 'text-white' }
    case 'CUKUP':
      return { label: 'Cukup', bgClass: 'bg-amber-500', textClass: 'text-white' }
    case 'KURANG':
      return { label: 'Kurang', bgClass: 'bg-red-500', textClass: 'text-white' }
    case 'BELUM_MULAI':
    default:
      return { label: 'Belum Mulai', bgClass: 'bg-slate-200', textClass: 'text-slate-600' }
  }
}

export function subjectAutoNote(
  stats: SubjectStat[],
  summary: { attemptsCount: number; videosCompleted: number },
  childName: string,
): string {
  if (summary.attemptsCount === 0) {
    return `Mari bantu ${childName} mulai belajar dengan QUPU. Pilih satu video di halaman Video untuk mengumpulkan badge pertama.`
  }

  const attempted = stats.filter((s) => s.videosAttempted > 0 && s.averageBestScore !== null)
  const strongest = [...attempted].sort(
    (a, b) => (b.averageBestScore ?? 0) - (a.averageBestScore ?? 0),
  )[0]

  const unstartedBySize = [...stats]
    .filter((s) => s.predikat === 'BELUM_MULAI' && s.totalVideosAvailable > 0)
    .sort((a, b) => b.totalVideosAvailable - a.totalVideosAvailable)
  const weakestAttempted = [...attempted].sort(
    (a, b) => (a.averageBestScore ?? 0) - (b.averageBestScore ?? 0),
  )[0]
  const suggestion = unstartedBySize[0] ?? weakestAttempted

  const effortLine =
    summary.attemptsCount >= 5
      ? 'Konsistensi belajar terjaga.'
      : 'Mari tambah latihan lagi agar semakin mahir.'

  const strengthLine = strongest
    ? `${childName} menunjukkan keunggulan di ${strongest.name} dengan rata-rata ${strongest.averageBestScore}% dan ${strongest.badgesEarned} badge.`
    : `${childName} sudah mulai mengerjakan ${summary.videosCompleted} video.`

  const suggestionLine =
    suggestion && suggestion.id !== strongest?.id
      ? `Disarankan menambah eksplorasi di ${suggestion.name} agar cakupan lebih merata.`
      : ''

  return [strengthLine, effortLine, suggestionLine].filter(Boolean).join(' ')
}
