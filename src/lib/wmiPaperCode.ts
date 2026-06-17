// Client paper-code generator. Delegates to the shared, pure-data brand registry
// (no pg/node imports there, so Vite bundles it cleanly into the client).
import { generatePaperCode, type PaperCodeInput } from '../../api/services/wmi/olympiads/registry'

export type { PaperCodeInput }

export function paperCode(input: PaperCodeInput): string {
  return generatePaperCode(input)
}
