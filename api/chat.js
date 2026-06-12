// api/chat.js — Vercel Serverless Function (Secure Gemini Proxy)
// Production-grade with rate limiting, input sanitization, strict CORS, env validation

// ─── Env var validation (fail fast on cold start) ───────────────────────────
const REQUIRED_ENV_VARS = ['GEMINI_API_KEY'];
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    console.error(`[chat.js] FATAL: Missing required env var: ${envVar}`);
  }
}

// ─── In-memory rate limiter (per-IP, 1-min window) ──────────────────────────
// Resets on Vercel function cold start — acceptable for MVP
// For production: swap with Upstash Redis / Vercel KV
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 15;     // 15 req/min per IP (generous for voice users)

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  const record = rateLimitMap.get(ip);

  if (now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// ─── Input sanitization ──────────────────────────────────────────────────────
function sanitizeInput(text) {
  if (typeof text !== 'string') return '';
  return text
    .trim()
    .substring(0, 1000)
    .replace(/[<>]/g, '')          // strip angle brackets (XSS)
    .replace(/javascript:/gi, '')  // strip js: protocol
    .replace(/on\w+=/gi, '');      // strip event handlers
}

function sanitizeHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  if (!['user', 'assistant', 'model'].includes(entry.role)) return null;
  if (typeof entry.content !== 'string') return null;
  return {
    role: entry.role === 'assistant' ? 'model' : entry.role,
    content: sanitizeInput(entry.content),
  };
}

// ─── Allowed CORS origins ────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://monsoonmitra.vercel.app',
  'https://monsoon-mitr.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
];

// ─── Main handler ────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Determine origin and set CORS
  const origin = req.headers['origin'] || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limiting
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    'unknown';

  const rateCheck = checkRateLimit(ip);
  res.setHeader('X-RateLimit-Remaining', rateCheck.remaining);

  if (!rateCheck.allowed) {
    return res.status(429).json({
      error: 'बहुत सारे सवाल! थोड़ी देर बाद पूछें। (Too many requests — please wait a moment)',
      retryAfter: rateCheck.retryAfter,
      fallback: true,
    });
  }

  // Validate API key is available
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    console.error('[chat.js] GEMINI_API_KEY not set');
    return res.status(500).json({ error: 'Server configuration error', fallback: true });
  }

  // Parse and validate body
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { message, language, crop, weatherContext, conversationHistory } = body;

  // Sanitize inputs
  const cleanMessage = sanitizeInput(message);
  if (!cleanMessage || cleanMessage.length < 2) {
    return res.status(400).json({ error: 'Message too short or invalid' });
  }

  const cleanLanguage = ['hi', 'en', 'bn', 'mr', 'pa'].includes(language) ? language : 'hi';

  const cleanCrop = Array.isArray(crop)
    ? crop.slice(0, 5).map(sanitizeInput).join(', ')
    : sanitizeInput(typeof crop === 'string' ? crop : 'general crops');

  const cleanWeather = sanitizeInput(typeof weatherContext === 'string' ? weatherContext : '');

  const cleanHistory = Array.isArray(conversationHistory)
    ? conversationHistory
        .slice(-10)
        .map(sanitizeHistoryEntry)
        .filter(Boolean)
    : [];

  // Build Gemini request
  const systemPrompt = buildSystemPrompt(cleanLanguage, cleanCrop, cleanWeather);
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const contents = [
    ...cleanHistory.map(m => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: cleanMessage }] },
  ];

  const geminiPayload = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 600,
      topP: 0.9,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  try {
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
      signal: AbortSignal.timeout(20000), // 20s timeout
    });

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('[chat.js] Gemini API error:', geminiData?.error?.message);
      return res.status(500).json({ error: 'AI service error', fallback: true });
    }

    const replyText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      console.warn('[chat.js] Empty Gemini response:', JSON.stringify(geminiData));
      return res.status(500).json({ error: 'Empty AI response', fallback: true });
    }

    return res.status(200).json({
      reply: replyText,
      tokens: geminiData.usageMetadata || null,
    });

  } catch (error) {
    console.error('[chat.js] Handler error:', error.message);
    return res.status(500).json({ error: 'AI service temporarily unavailable', fallback: true });
  }
}

// ─── System prompt builder ───────────────────────────────────────────────────
function buildSystemPrompt(language, crop, weatherContext) {
  const langMap = { hi: 'Hindi', en: 'English', bn: 'Bengali', mr: 'Marathi', pa: 'Punjabi' };
  const langName = langMap[language] || 'Hindi';

  return `You are "AI Sahayak" (AI Helper) — a friendly, expert farming assistant built specifically for Indian small and marginal farmers.

LANGUAGE: Always respond ONLY in ${langName}. Do NOT mix languages unless the user writes in mixed language.
CROP CONTEXT: The farmer grows: ${crop || 'various crops'}
CURRENT WEATHER: ${weatherContext || 'Weather data not available'}

YOUR PERSONALITY:
- Warm, respectful, like a knowledgeable neighbor or elder (dada ji / chacha ji tone)
- Use simple words. Avoid jargon. Farmers are not tech experts.
- Be actionable. Give specific, practical advice, not theoretical knowledge.
- Keep responses under 150 words unless the topic requires more detail.
- Use relevant emojis sparingly to aid comprehension (1-2 max per response).
- Format: use bullet points (•) for lists. Never use markdown bold (**) or headers (#).

AREAS OF EXPERTISE:
- Irrigation timing and water management
- Weather interpretation for farming decisions  
- Crop protection, pest management, disease identification
- Fertilizer and soil management
- Government schemes: PM-KISAN, Kisan Credit Card, crop insurance (PMFBY), e-NAM
- Market price guidance and mandi rates
- Emergency response: flood, drought, hailstorm, frost

STRICT RULES:
- NEVER give medical advice for humans.
- NEVER discuss politics, religion, or controversial topics.
- If asked something outside farming/rural livelihoods, politely say: "मैं केवल खेती के बारे में जानकारी दे सकता हूं।"
- For specific chemical dosages: "अपने नजदीकी KVK या कृषि केंद्र से पूछें — सही मात्रा वहाँ मिलेगी।"
- Always end with ONE clear, immediate actionable next step.
- Never invent facts. If unsure, say so honestly.`;
}
