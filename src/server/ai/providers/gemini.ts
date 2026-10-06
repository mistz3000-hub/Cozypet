import 'server-only';
import { ProviderError, errorFromStatus, type GenerateInput } from './types';

/** Gemini API generateContent (https://ai.google.dev/api/generate-content) — ใช้ project ที่ไม่เปิด billing เท่านั้น */
export async function geminiGenerate(input: GenerateInput): Promise<{ text: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': input.key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: input.system }] },
      contents: input.messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] })),
      generationConfig: {
        temperature: input.temperature,
        maxOutputTokens: input.maxTokens,
        ...(input.json ? { responseMimeType: 'application/json' } : {}),
      },
    }),
    signal: input.signal,
  });
  if (!res.ok) throw errorFromStatus(res);
  const data = (await res.json()) as {
    promptFeedback?: { blockReason?: string };
    candidates?: { finishReason?: string; content?: { parts?: { text?: string }[] } }[];
  };
  if (data.promptFeedback?.blockReason) throw new ProviderError('blocked');
  const cand = data.candidates?.[0];
  const text = cand?.content?.parts?.map((p) => p.text ?? '').join('').trim() ?? '';
  if (!text) throw new ProviderError(cand?.finishReason === 'SAFETY' || cand?.finishReason === 'PROHIBITED_CONTENT' ? 'blocked' : 'upstream_error');
  return { text };
}
