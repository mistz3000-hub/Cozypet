import 'server-only';
import { chatCompletions } from './openai-compatible';
import type { GenerateInput } from './types';

/** Groq (https://console.groq.com/docs/api-reference) — free plan เท่านั้น ไม่ผูกบัตร */
export function groqGenerate(input: GenerateInput) {
  return chatCompletions('https://api.groq.com/openai/v1/chat/completions', input, 'max_completion_tokens');
}
