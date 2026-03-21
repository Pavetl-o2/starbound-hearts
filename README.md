# 💫 Starbound Hearts

A procedural sci-fi dating sim. Build relationships with your crew as you travel between solar systems.  
Dialogue and choices are generated dynamically via AI — every playthrough is unique.

---

## 🗂 Project Structure

```
starbound-hearts/
├── index.html                   # Main entry point
├── build.js                     # Build script (injects API key)
├── vercel.json                  # Vercel deployment config
├── package.json
├── .env.example                 # Template for local env vars
│
├── src/
│   ├── css/
│   │   └── style.css            # All game styles
│   └── js/
│       └── game.js              # Game engine + API calls
│
├── assets/
│   ├── characters/
│   │   └── yuki/
│   │       └── portrait.jpg     # Dr. Yuki Tanaka — default expression
│   └── backgrounds/             # (future) scene backgrounds
│
└── phases/
    └── phase-1/                 # Notes & design docs for Phase 1
        └── README.md
```

---

## 🚀 Local Development

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USER/starbound-hearts.git
cd starbound-hearts

# 2. Set your API key
cp .env.example .env.local
# Edit .env.local and add your OPENROUTER_API_KEY

# 3. Run local server
npm run dev
# → open http://localhost:8080
```

---

## ☁️ Deploy to Vercel

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo
3. In **Environment Variables** add:
   - `OPENROUTER_API_KEY` = `sk-or-v1-...`
4. Click **Deploy** — done!

Vercel runs `node build.js` which injects the key into the HTML at build time.

---

## 🎮 Phases Roadmap

| Phase | Location | Characters | Status |
|-------|----------|------------|--------|
| 1 | Medic's Lab | Dr. Yuki Tanaka | ✅ In progress |
| 2 | Bridge | TBD | 🔲 Planned |
| 3 | Engineering Bay | TBD | 🔲 Planned |
| 4 | Greenhouse | Yuki (deeper arc) | 🔲 Planned |

---

## 🤖 AI Stack

- **Model:** `google/gemini-2.5-flash` via OpenRouter
- **Cost:** ~$0.005–$0.01 USD per full playthrough
- **Prompt:** Character profile + full conversation history sent each turn
- **Output:** JSON with `dialogue`, `expression` emoji, and 3 scored `choices`

---

## ⚠️ Security Note

Never commit your real API key. It's injected at build time via the `OPENROUTER_API_KEY` environment variable and never stored in the repo.
