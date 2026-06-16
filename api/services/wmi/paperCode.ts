import { generatePaperCode, generateQuestionCode, type PaperCodeInput } from './olympiads/registry.js'

export type { PaperCodeInput }

// Short human-readable code. Delegates to the brand registry; WMI output is
// byte-for-byte identical to the previous WMI-[YY][F|P][grade][A|B] format.
export function paperCode(input: PaperCodeInput): string {
  return generatePaperCode(input)
}

export function questionCode(input: PaperCodeInput, number: number): string {
  return generateQuestionCode(input, number)
}
