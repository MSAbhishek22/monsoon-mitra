# 🌾 Monsoon Mitra — किसान का डिजिटल साथी

[![Build](https://github.com/MSAbhishek22/Monsoon_Mitr/actions/workflows/ci.yml/badge.svg)](https://github.com/MSAbhishek22/Monsoon_Mitr/actions)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/MSAbhishek22/Monsoon_Mitr/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue)](https://monsoonmitra.vercel.app)

**AI-powered irrigation advisory for 140 million Indian small farmers. Works in Hindi, Bengali, Marathi, Punjabi, and English. Offline-capable. Free.**

🌐 **Live App:** https://monsoonmitra.vercel.app  
📱 **Play Store:** [Coming Soon — Submission in Progress]  
🏆 **Built for:** Fuel the World Hackathon — Pilot Phase

---

## What It Does

Monsoon Mitra answers the three questions every farmer needs answered every morning:

1. **Should I irrigate today?** — AI-powered decision based on real-time hyperlocal weather
2. **What's the weather this week?** — 7-day forecast with rain probability
3. **Is my crop in danger?** — Flood and drought alerts with actionable advice

---

## Features

- 🤖 **AI Sahayak** — Gemini-powered farming assistant in 5 languages
- 🌦️ **Hyperlocal Weather** — Open-Meteo API, no signup required
- 💧 **Irrigation Advisor** — Skip irrigation when rain is coming, save ₹500 per cycle
- 💰 **Savings Tracker** — Gamified water and money savings display
- 🔔 **Push Alerts** — Flood and drought warnings via Firebase Cloud Messaging
- 📴 **Offline Mode** — Works with cached data when internet is unavailable
- 🎤 **Voice Input** — Ask questions hands-free in the field

## Tech Stack

React 18 · Vite 5 · Tailwind CSS · Firebase (Analytics + FCM) · Gemini 1.5 Flash · Open-Meteo · Vercel

## Local Development

```bash
git clone https://github.com/MSAbhishek22/Monsoon_Mitr.git
cd Monsoon_Mitr
npm install
cp .env.example .env.local   # Add your keys
npm run dev
```

## Environment Variables

```
GEMINI_API_KEY=              # Server-only — never use VITE_ prefix
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_VAPID_KEY=
```

## Running Tests

```bash
npm run test:run        # Run all tests once
npm run test:coverage   # With coverage report
npm run lint            # ESLint check
npm run build           # Production build
```

## Partners & Supporters

Developed in partnership with **Fuel the World**. Pilot partners include Akshaya Patra Foundation, Action Against Hunger, and Samagra Governance (ADAPT program).

## Team

- **MS Abhishek** — msabhishekanni10@gmail.com
- **Aayushi Goel** — aayushigoel73@gmail.com


## License

MIT License — free to use, modify, and distribute.
