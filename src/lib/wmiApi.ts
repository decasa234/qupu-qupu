import api from './api'
import type {
  WmiAttemptInput,
  WmiAttemptResult,
  WmiChapterTestQuestion,
  WmiChapterTestResult,
  WmiConceptAttemptInput,
  WmiConceptProgressSummary,
  WmiConceptQuestion,
  WmiConceptVoteResult,
  WmiExamSession,
  WmiExamSnapshot,
  WmiGarden,
  WmiGlossaryTerm,
  WmiGrade,
  WmiPaperDetail,
  WmiPaperSummary,
  WmiQuestion,
} from '../types/wmi'

function unwrap<T>(response: { data: { success: boolean; data: T; error?: string } }): T {
  if (!response.data.success) throw new Error(response.data.error ?? 'Request failed')
  return response.data.data
}

export async function fetchGlossary(): Promise<WmiGlossaryTerm[]> {
  const response = await api.get('/public/wmi/glossary')
  return unwrap<{ terms: WmiGlossaryTerm[] }>(response).terms
}

export async function fetchPapers(childId: string, grade: WmiGrade): Promise<WmiPaperSummary[]> {
  const response = await api.get('/me/wmi/papers', { params: { childId, grade } })
  return unwrap<{ papers: WmiPaperSummary[] }>(response).papers
}

export async function fetchPaperDetail(childId: string, paperId: string): Promise<WmiPaperDetail> {
  const response = await api.get(`/me/wmi/papers/${paperId}`, { params: { childId } })
  return unwrap<WmiPaperDetail>(response)
}

export async function fetchDrillQuestion(
  childId: string,
  grade: WmiGrade,
): Promise<WmiQuestion> {
  const response = await api.get('/me/wmi/drill/next', {
    params: { childId, grade },
  })
  return unwrap<{ question: WmiQuestion }>(response).question
}

export async function submitAttempt(input: WmiAttemptInput): Promise<WmiAttemptResult> {
  const response = await api.post('/me/wmi/attempts', input)
  return unwrap<WmiAttemptResult>(response)
}

export async function startExamSession(
  childId: string,
  paperId: string,
): Promise<WmiExamSnapshot> {
  const response = await api.post('/me/wmi/exam/sessions', { childId, paper_id: paperId })
  return unwrap<WmiExamSnapshot>(response)
}

export async function fetchExamSession(
  childId: string,
  sessionId: string,
): Promise<WmiExamSnapshot> {
  const response = await api.get(`/me/wmi/exam/sessions/${sessionId}`, { params: { childId } })
  return unwrap<WmiExamSnapshot>(response)
}

export async function completeExamSession(
  childId: string,
  sessionId: string,
): Promise<WmiExamSession> {
  const response = await api.patch(`/me/wmi/exam/sessions/${sessionId}/complete`, { childId })
  return unwrap<{ session: WmiExamSession }>(response).session
}

export async function fetchConceptNext(
  childId: string,
  grade: WmiGrade,
  conceptSlug?: string,
): Promise<WmiConceptQuestion> {
  const params: Record<string, string | number> = { childId, grade }
  if (conceptSlug) params.concept = conceptSlug
  const response = await api.get('/me/wmi/konsep/next', { params })
  return unwrap<{ question: WmiConceptQuestion }>(response).question
}

export async function submitConceptVote(
  childId: string,
  conceptInstanceId: string,
  vote: 1 | -1,
): Promise<WmiConceptVoteResult> {
  const response = await api.post('/me/wmi/konsep/vote', {
    childId,
    concept_instance_id: conceptInstanceId,
    vote,
  })
  return unwrap<WmiConceptVoteResult>(response)
}

export async function submitConceptAttempt(input: WmiConceptAttemptInput): Promise<WmiAttemptResult> {
  const response = await api.post('/me/wmi/attempts', input)
  return unwrap<WmiAttemptResult>(response)
}

export async function fetchConceptProgress(childId: string): Promise<WmiConceptProgressSummary> {
  const response = await api.get('/me/wmi/konsep/progress', { params: { childId } })
  return unwrap<WmiConceptProgressSummary>(response)
}

export async function fetchGarden(childId: string, grade: WmiGrade): Promise<WmiGarden> {
  const response = await api.get('/me/wmi/garden', { params: { childId, grade } })
  return unwrap<WmiGarden>(response)
}

export async function startChapterTest(
  childId: string, subjectKey: string,
): Promise<{ questions: WmiChapterTestQuestion[] }> {
  const response = await api.post('/me/wmi/chapter-test/start', { childId, subject_key: subjectKey })
  return unwrap<{ questions: WmiChapterTestQuestion[] }>(response)
}

export async function submitChapterTest(
  childId: string, subjectKey: string,
  answers: { concept_instance_id: string; selected_answer: string }[],
): Promise<WmiChapterTestResult> {
  const response = await api.post('/me/wmi/chapter-test/submit', { childId, subject_key: subjectKey, answers })
  return unwrap<WmiChapterTestResult>(response)
}
