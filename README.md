# 🌾 Monsoon Mitra — किसान का डिजिटल साथी

<div align="center">

[![Build](https://github.com/MSAbhishek22/Monsoon_Mitr/actions/workflows/ci.yml/badge.svg)](https://github.com/MSAbhishek22/Monsoon_Mitr/actions)
[![Tests](https://img.shields.io/badge/tests-21%20passing-brightgreen)](https://github.com/MSAbhishek22/Monsoon_Mitr/actions)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-2E7D32)](https://monsoonmitra.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**AI-powered voice-first farming assistant for India's 140 million small farmers.**  
**Works in Hindi, Bengali, Marathi, Punjabi & English. Offline-capable. Free.**

[🌐 Live App](https://monsoonmitra.vercel.app) • [📱 Demo](https://monsoonmitra.vercel.app/?demo=true) • [📋 Play Store Listing](PLAY_STORE_LISTING.md)

</div>

---

## 🌧️ The Problem We're Solving

Every monsoon season, **140 million small and marginal farmers** in India face the same 3 questions every single morning:

> *"क्या आज पानी देना चाहिए?" — Should I irrigate today?*  
> *"क्या कल बारिश आएगी?" — Will it rain tomorrow?*  
> *"मेरी फसल को कोई खतरा है?" — Is my crop in danger?*

Getting these wrong costs real money. One mistimed irrigation cycle wastes **₹450–₹750** and thousands of liters of water. With erratic monsoons worsening every year, farmers who relied on generational knowledge are now flying blind.

Existing government apps (Kisan Suvidha, mKisan) are slow, English-heavy, and abandoned after launch. **There is no voice-first, multilingual, AI-powered tool built specifically for the smallholder farmer.**

**Until now.**

---

## 💡 What Monsoon Mitra Does

Monsoon Mitra is a **Progressive Web App** that acts as every farmer's personal AI assistant — in their language, on their ₹5,000 Android phone, even with poor internet.

### The 3 Core Answers, Always Visible

```
🌦️ आज का मौसम — दोस्त या दुश्मन?

💧 आज पानी दें          🌧️ पानी मत दें
   (18% बारिश)              (85% बारिश!)

💰 बचत: ₹450 बचाए इस बार
```

### Key Features

| Feature | What it does |
|--------|-------------|
| 🤖 **AI सहायक** | Ask any farming question by voice or text in Hindi. Powered by Gemini 1.5 Flash. |
| 🌦️ **Hyperlocal Weather** | Real 7-day forecast with rain probability bars for your exact location. |
| 💧 **Irrigation Advisor** | AI decides: irrigate today or skip? Saves ₹500 per avoided cycle. |
| 🚨 **Flood & Drought Alerts** | Push notifications before danger arrives. Act before the crisis. |
| 💰 **Savings Tracker** | Gamified water + money saved counter. See the rupees add up. |
| 📴 **Offline Mode** | Critical info available even with no internet — built for rural India. |
| 🎤 **Voice-First** | Central mic button. Speak your question. Get an answer. No typing needed. |
| 🌍 **5 Languages** | Hindi · Bengali · Marathi · Punjabi · English |

---

## 📊 The Numbers

| Metric | Value |
|--------|-------|
| Target farmers | 140 million smallholders in India |
| Average landholding | 1.15 hectares |
| Smartphone penetration | 70%+ (mostly sub-₹8,000 Android) |
| Water wasted per season | 15–40% due to mistimed irrigation |
| Savings per skipped cycle | ₹450 – ₹750 |
| Languages supported | 5 |
| App size (gzipped) | ~35KB JS — loads in under 2 seconds on 4G |

---

## 🏗️ Architecture

```
[Farmer's Android Phone — PWA]
         │
         ├──→ Open-Meteo API (hyperlocal weather, free, no auth)
         │
         ├──→ Vercel Serverless Function /api/chat
         │         └──→ Google Gemini 1.5 Flash (AI responses)
         │
         └──→ Firebase
                   ├── Analytics (anonymous usage tracking)
                   └── Cloud Messaging (push alerts)

Security: GEMINI_API_KEY server-only | CSP headers | HSTS | Rate limiting
Privacy: Zero PII collected | All data stays on device | No registration
```

---

## 🚀 Getting Started

```bash
git clone https://github.com/MSAbhishek22/Monsoon_Mitr.git
cd Monsoon_Mitr
npm install
cp .env.example .env.local   # Fill in your API keys
npm run dev
```

Visit `http://localhost:5173` — the app loads instantly.

### Try the Demo
Visit **[monsoonmitra.vercel.app/?demo=true](https://monsoonmitra.vercel.app/?demo=true)** to see the app populated with 15 days of real-looking farmer data — savings counter animating, irrigation log filled, weather live.

---

## 🔧 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 18 + Vite 5 | Fast builds, modern dev experience |
| Styling | Tailwind CSS 3 | Utility-first, no bloat |
| AI | Google Gemini 1.5 Flash | Fast, multilingual, affordable |
| Weather | Open-Meteo API | Free, reliable, hyperlocal, no auth |
| Push Notifications | Firebase Cloud Messaging | Cross-platform, free tier |
| Analytics | Firebase Analytics | Anonymous usage tracking |
| Hosting | Vercel | Zero-config CDN + serverless |
| Testing | Vitest + MSW | 21 tests, 70%+ coverage |
| CI/CD | GitHub Actions | Auto-lint, test, deploy on push |

---

## 🔒 Security Architecture

- `GEMINI_API_KEY` is **server-side only** — never in the frontend bundle
- All AI requests go through `/api/chat` serverless proxy
- Rate limiting: 10 requests/minute per IP
- Content Security Policy, HSTS, X-Frame-Options headers
- Input sanitization: HTML stripped, 800 char limit, conversation history capped
- Zero PII: No phone numbers, no Aadhaar, no bank details ever collected

---

## 🧪 Testing

```bash
npm run test:run        # 21 tests across 6 test files
npm run test:coverage   # Coverage report (target: 70%+)
npm run lint            # ESLint — 0 errors
npm run build           # Production build verification
```

---

## 🌱 Roadmap

**v1.0 — Now (Pilot Phase)**
- Core irrigation advisory, AI chat, 5 languages, offline mode

**v1.5 — Q3 2026**
- IoT soil moisture sensor integration (₹200 sensor)
- Crop disease detection via phone camera (Google Vision API)
- PM-KISAN scheme enrollment helper

**v2.0 — 2027**
- e-NAM market price integration
- Crop insurance (PMFBY) advisory
- Community knowledge layer — farmer-to-farmer verified tips
- Bangladesh, Nepal, Sri Lanka expansion (same monsoon pattern)

**The 10-Year Moat:** Every farmer who uses Monsoon Mitra generates hyperlocal crop × weather × irrigation data. That dataset becomes invaluable to insurers, seed companies, and climate researchers. The app is the interface. The data is the business.

---

## 🤝 Partners & Recognition

- 🏆 **Fuel the World Hackathon** — Winner, now in Pilot Phase
- 🌾 **Pilot Partners:** Akshaya Patra Foundation, Action Against Hunger, WFP New Delhi
- 🏛️ **Government Integration:** Samagra Governance ADAPT Program (in progress)

---

## 👥 Team

Built with equal contribution by:

**MS Abhishek**  
📧 msabhishekanni10@gmail.com  
🐙 [github.com/MSAbhishek22](https://github.com/MSAbhishek22)

**Aayushi Goel**  
📧 aayushigoel73@gmail.com

---

## 📄 License

MIT License — free to use, fork, and build upon.

---

<div align="center">
<strong>🌾 Built for the farmer who feeds us all. 🌾</strong>
</div>
