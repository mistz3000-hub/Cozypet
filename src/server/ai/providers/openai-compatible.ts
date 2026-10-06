import 'server-only';
import { ProviderError, errorFromStatus, type GenerateInput } from './types';

/**
 * chat completions แบบ OpenAI-compatible (Groq, OpenRouter)
 * ส่ง model ตัวเดียวเสมอ — ห้ามส่งรายการรุ่นสำรองหรือ route อัตโนมัติ
 */
export async function chatCompletions(url: string, input: GenerateInput, tokenField: 'max_tokens' | 'max_completion_tokens', extraHeaders: Record<string, string> = {}): Promise<{ text: string }> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${input.key}`, ...extraHeaders },
    body: JSON.stringify({
      model: input.model,
      messages: [{ role: 'system', content: input.system }, ...input.messages.map((m) => ({ role: m.role, content: m.text }))],
      temperature: input.temperature,
      [tokenField]: input.maxTokens,
      ...(input.json ? { response_format: { type: 'json_object' } } : {}),
      stream: false,
    }),
    signal: input.signal,
  });
  if (!res.ok) throw errorFromStatus(res);
  const data = (await res.json()) as { choices?: { finish_reason?: string; message?: { content?: string | null } }[]; error?: { code?: number } };
  if (data.error) throw new ProviderError(data.error.code === 429 || data.error.code === 402 ? 'quota_exceeded' : 'upstream_error');
  const choice = data.choices?.[0];
  const text = choice?.message?.content?.trim() ?? '';
  if (!text) throw new ProviderError(choice?.finish_reason === 'content_filter' ? 'blocked' : 'upstream_error');
  return { text };
}
