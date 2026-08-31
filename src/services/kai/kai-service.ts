import type { WeatherLocation } from '@/types/weather';

export type KaiMessage = { role: 'user' | 'assistant'; content: string };

export async function askKai(question: string, location: WeatherLocation, history: KaiMessage[], userName?: string, responseMode: 'chat' | 'bubble' = 'chat') {
  const baseUrl = process.env.EXPO_PUBLIC_KAI_API_URL?.replace(/\/$/, '');
  if (!baseUrl) throw new Error('Kai Cloud is not configured yet.');
  const response = await fetch(`${baseUrl}/api/kai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, location, history, userName, responseMode }) });
  const payload = await response.json() as { answer?: string; error?: string };
  if (!response.ok || !payload.answer) throw new Error(payload.error ?? 'Kai could not answer right now.');
  return payload.answer;
}
