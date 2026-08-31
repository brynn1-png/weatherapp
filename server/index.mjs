import { createServer } from 'node:http';

const port = Number(process.env.PORT ?? 8787);
const model = process.env.OLLAMA_MODEL ?? 'gpt-oss:20b';
const apiKey = process.env.OLLAMA_API_KEY;
const allowedOrigin = process.env.ALLOWED_ORIGIN ?? '*';
const rateLimits = new Map();

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Headers': 'Content-Type, Authorization' });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 32_000) throw new Error('Request is too large.');
  }
  return JSON.parse(body || '{}');
}

function isRateLimited(address) {
  const now = Date.now();
  const recent = (rateLimits.get(address) ?? []).filter((time) => now - time < 60_000);
  recent.push(now); rateLimits.set(address, recent);
  return recent.length > 12;
}

async function fetchWeather(latitude, longitude) {
  const query = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m', hourly: 'temperature_2m,precipitation_probability,weather_code', daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset', timezone: 'auto', forecast_days: '1' });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error('Weather provider unavailable.');
  return response.json();
}

async function answerWithKai({ question, latitude, longitude, locationName, userName, responseMode, history = [] }) {
  const weather = await fetchWeather(latitude, longitude);
  const system = `You are Kai, WeatherAI's friendly conversational weather assistant.

Conversation rules:
- Respond to greetings such as "hi", "hello", or "hey" with a brief friendly greeting and ask how you can help. Do not volunteer a weather report.
- If a message is ambiguous, incomplete, or appears mistyped, ask one short clarifying question instead of guessing.
- Answer only what the user asked. Do not dump all available weather data.
- Keep most answers to 1-4 short sentences unless the user explicitly requests detail.
- Use plain text only. Never use Markdown, headings, bold markers, tables, or ASCII charts.
- The user's preferred name is ${userName || 'not provided'}. When a name is provided, address them by name once in your response to the opening question about today's weather and advice. In later replies, use it only when it feels natural, not in every sentence.
${responseMode === 'bubble' ? '- This response appears in a small Home-screen speech bubble. Reply with exactly one useful sentence of no more than 18 words combining today’s weather and practical advice.' : ''}

Weather rules:
- Treat the supplied Open-Meteo JSON as the only source of forecast facts.
- Translate weather codes into natural descriptions and never mention numeric weather-code values to the user.
- Clearly distinguish forecast facts from general practical advice.
- Never invent weather values or official warnings.
- For dangerous weather or travel safety, advise checking PAGASA and local authorities.

Current location: ${locationName}
Open-Meteo weather JSON: ${JSON.stringify(weather)}`;
  const messages = [{ role: 'system', content: system }, ...history.slice(-8), { role: 'user', content: question }];
  const response = await fetch('https://ollama.com/api/chat', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages, stream: false, think: false }), signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(response.status === 429 ? 'Kai is busy. Try again shortly.' : 'Kai is temporarily unavailable.');
  const payload = await response.json();
  const content = payload?.message?.content?.trim();
  const isOpeningWeatherQuestion = question.toLowerCase().includes('weather today') && question.toLowerCase().includes('advice');
  if (content && userName && isOpeningWeatherQuestion && !content.toLowerCase().includes(userName.toLowerCase())) return `${userName}, ${content}`;
  return content;
}

createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return json(response, 204, {});
  if (request.url === '/health') return json(response, 200, { ok: true, model });
  if (request.url !== '/api/kai/chat' || request.method !== 'POST') return json(response, 404, { error: 'Not found.' });
  if (!apiKey) return json(response, 503, { error: 'Kai backend is not configured.' });
  if (isRateLimited(request.socket.remoteAddress ?? 'unknown')) return json(response, 429, { error: 'Too many requests. Try again in one minute.' });
  try {
    const body = await readJson(request);
    const question = typeof body.question === 'string' ? body.question.trim().slice(0, 1000) : '';
    const latitude = Number(body.location?.latitude); const longitude = Number(body.location?.longitude);
    if (!question || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return json(response, 400, { error: 'A question and valid location are required.' });
    const answer = await answerWithKai({ question, latitude, longitude, locationName: String(body.location?.name ?? 'Current location').slice(0, 100), userName: typeof body.userName === 'string' ? body.userName.trim().slice(0, 40) : '', responseMode: body.responseMode === 'bubble' ? 'bubble' : 'chat', history: Array.isArray(body.history) ? body.history : [] });
    if (!answer) throw new Error('Kai returned an empty response.');
    return json(response, 200, { answer, source: 'Open-Meteo', model });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kai is temporarily unavailable.';
    return json(response, message.includes('JSON') ? 400 : 502, { error: message });
  }
}).listen(port, () => console.log(`Kai backend listening on http://localhost:${port}`));
