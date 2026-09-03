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
  // Diagnostic check
  const keyExists = !!process.env.GEMINI_API_KEY;
  const keyLength = process.env.GEMINI_API_KEY?.length || 0;
  const keyPreview = process.env.GEMINI_API_KEY?.substring(0, 8) || 'NOT SET';
  
  console.log(`API Key check: exists=${keyExists}, length=${keyLength}, preview=${keyPreview}...`);
  
  if (!keyExists) {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY not configured in Vercel environment variables',
      fallback: true,
      debug: 'Go to Vercel Dashboard → Project → Settings → Environment Variables → Add GEMINI_API_KEY'
    });
  }

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
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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
    console.log('Sending to Gemini:', {
      language: cleanLanguage,
      crop: cleanCrop,
      messageLength: cleanMessage.length,
      historyLength: cleanHistory.length,
      model: 'gemini-2.0-flash'
    });

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
      signal: AbortSignal.timeout(20000), // 20s timeout
    });

    console.log('Gemini response status:', geminiRes.status);

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error('[chat.js] Gemini API error:', geminiData?.error?.message);
      return res.status(500).json({ error: 'AI service error', fallback: true });
    }

    const replyText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Reply length:', replyText?.length);
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
  const langMap = {
    hi: 'Hindi using Devanagari script',
    en: 'English',
    bn: 'Bengali using Bangla script',
    mr: 'Marathi using Devanagari script',
    pa: 'Punjabi using Gurmukhi script'
  };
  const lang = langMap[language] || langMap.hi;

  return `You are "Kisan Sahayak" — an expert agricultural advisor for Indian farmers with 30 years of field experience in Indian farming conditions.

MANDATORY LANGUAGE: Respond in ${lang} ONLY. Not a single English word unless it's a technical term (like DAP, NPK, KVK). Test: every sentence must be in ${lang}.

FARMER PROFILE: Growing ${Array.isArray(crop) ? crop.join(' and ') : (crop || 'various crops')} in India.

CURRENT FIELD CONDITIONS: ${weatherContext || 'Weather not available — advise based on typical monsoon season conditions'}

RESPONSE QUALITY REQUIREMENTS:
- Give SPECIFIC answers with NUMBERS and QUANTITIES when asked
  - "How much water?" → give liters per acre, frequency in days, time of day
  - "Which fertilizer?" → give specific names (DAP, Urea, MOP), quantities in kg/acre
  - "When to plant?" → give specific month range, temperature requirements
  - "Disease treatment?" → name the disease, describe symptoms, give organic OR chemical approach
- Keep response under 120 words
- Use bullet points (•) for multi-step answers
- Give ONE clear recommendation at the end: "आज करें:" (Do today:)

MANDATORY TOPIC COVERAGE — answer accurately on:
1. IRRIGATION: timing (morning 6-9am or evening 5-7pm best), frequency varies by crop (wheat 10-12 days, rice 5-7 days, vegetables daily in summer), amount (drip: 30-40% less water, flood: 4-6 inches)
2. FERTILIZERS: DAP (diammonium phosphate) at planting for phosphorus+nitrogen, Urea for nitrogen top-dressing, MOP (potash) for root strength, timing based on growth stage
3. PESTS: identify by leaf symptoms (yellowing=nutrient, brown spots=fungus, holes=insects), organic options (neem oil 5ml/liter, soap water), refer to KVK for chemicals
4. GOVERNMENT SCHEMES: PM-KISAN (₹6000/year, 3 installments, pmkisan.gov.in), PMFBY crop insurance (enroll within 10 days of sowing), KCC (4% interest up to ₹3 lakh), Soil Health Card (free at KVK)
5. MARKET: suggest checking local mandi prices, eNAM portal for national prices, APMC nearby
6. SEASONAL CALENDAR: Kharif (June-Nov: rice, maize, soybean), Rabi (Oct-Mar: wheat, mustard, gram), Zaid (Mar-Jun: cucumber, watermelon, moong)
7. EMERGENCY RESPONSE: flood (drain fields immediately, apply fungicide after water recedes), drought (mulching reduces evaporation 40%, drip irrigation, drought-resistant varieties)

FORBIDDEN:
- Never give a vague answer like "consult an expert" without first giving your best specific advice
- Never say "I don't know" — always give the most relevant information you have
- Never recommend specific brand-name pesticides — say "contact your nearest KVK"
- Never give human medical advice
- Never discuss politics`;
}
