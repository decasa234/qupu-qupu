/**
 * SEAMOX-24-A-Q15 — Beat-by-beat storyboard for the meeting-path explainer.
 *
 * Solution: combined speed = 60 + 70 = 130 m/min;
 *           time = 2600 ÷ 130 = 20 min;
 *           meeting time = 0730 + 20 = 0750 h.
 *
 * Beats:
 *   'setup'  — show the initial diagram with both walkers
 *   'speed'  — highlight that the speeds combine (130 m/min)
 *   'time'   — show the division 2600 ÷ 130 = 20 min
 *   'result' — reveal the meeting time 0750 h with a marker on the path
 */

export type MeetingPathPhase = 'setup' | 'speed' | 'time' | 'result'

export interface MeetingPathStep {
  phase: MeetingPathPhase
  captionEn: string
  captionId: string
  hold: number
  showMeeting: boolean
}

export const MEETING_PATH_STEPS: MeetingPathStep[] = [
  {
    phase: 'setup',
    captionEn: 'John leaves home at 0730 h (60 m/min →). His brother leaves the park at the same time (70 m/min ←). Distance: 2600 m.',
    captionId: 'John meninggalkan rumah pukul 0730 (60 m/menit →). Saudaranya meninggalkan taman pada waktu yang sama (70 m/menit ←). Jarak: 2600 m.',
    hold: 2000,
    showMeeting: false,
  },
  {
    phase: 'speed',
    captionEn: 'They walk TOWARD each other → add the speeds: 60 + 70 = 130 m/min combined closing speed.',
    captionId: 'Mereka berjalan SALING MENDEKAT → jumlahkan kecepatan: 60 + 70 = 130 m/menit kecepatan penutupan gabungan.',
    hold: 2200,
    showMeeting: false,
  },
  {
    phase: 'time',
    captionEn: 'Time to meet = distance ÷ combined speed = 2600 ÷ 130 = 20 minutes.',
    captionId: 'Waktu bertemu = jarak ÷ kecepatan gabungan = 2600 ÷ 130 = 20 menit.',
    hold: 2200,
    showMeeting: false,
  },
  {
    phase: 'result',
    captionEn: 'Meeting time = 0730 + 20 min = 0750 h ✓',
    captionId: 'Waktu pertemuan = 0730 + 20 menit = 0750 ✓',
    hold: 0,
    showMeeting: true,
  },
]

export const MEETING_PATH_FINAL_INDEX = MEETING_PATH_STEPS.length - 1
