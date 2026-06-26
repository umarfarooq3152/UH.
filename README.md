# Umar's Hands

A digital gallery for high-fidelity Arabic calligraphy — where reed-pen precision meets modern web craft. Built to display, preserve, and share original calligraphic work with smooth animations and an AI-assisted experience.

## Features

- High-resolution calligraphy gallery with frame-by-frame animation sequences
- Smooth scroll and entrance animations via GSAP and Lenis
- Gemini AI integration for context and exploration
- Firebase backend for auth and storage
- Contact via EmailJS
- Fully responsive, dark-first design

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19, TypeScript, Vite |
| Styling | Tailwind CSS |
| Animations | GSAP, Lenis, Motion |
| AI | Google Gemini (@google/genai) |
| Backend | Firebase, Express |
| Storage | better-sqlite3 (local), Firebase Storage |
| Email | EmailJS |
| Routing | React Router v7 |

## Run locally

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/umarfarooq3152/UH..git
cd UH.
npm install
```

Set your API keys in `.env.local`:

```
GEMINI_API_KEY=your_key_here
```

```bash
npm run dev   # http://localhost:3000
```
