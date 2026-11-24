# Nexa AI — Beyond Conversation

An open-source AI chat workspace (ChatGPT-style) with a built-in **toolbox** of special
features most chatbots don't have: a real math parser, code generator, extractive
summarizer, story forge, voice input + spoken replies, personas, color palettes,
password/UUID/dice generators, and 100% private local history.

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 (frontend) ·
Vercel Serverless Function / Node HTTP server (backend) ·
dependency-free AI engine shared by both (`engine/aiEngine.mjs`).

---

## Run locally in VS Code

Account sign-in, email verification and cloud chat history need a MongoDB database and Gmail SMTP credentials. Copy `.env.example` to `.env` and fill in `MONGODB_URI`, `MONGODB_DB`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and a long random `SESSION_SECRET`. Keep `.env` private. Gmail requires 2-Step Verification and an App Password.

```bash
npm install
npm run dev:api    # terminal 1: authenticated API at http://localhost:3001
npm run dev        # terminal 2: Vite frontend at http://localhost:5173
```

The Vite server proxies `/api` to the local Node server. Conversations, account records, verification codes and prompt history are stored in MongoDB. Passwords are stored as bcrypt hashes. For a production run:

```bash
npm run build
npm start           # http://localhost:3001
```

## Project structure

```
├── api/chat.ts            # Vercel serverless backend (POST /api/chat)
├── server.mjs             # Node server for Render/local prod (API + static hosting)
├── engine/aiEngine.mjs    # The AI engine — shared by browser, Vercel and Node
├── src/
│   ├── pages/Landing.tsx  # Marketing landing page
│   ├── pages/Chat.tsx     # The chat application
│   ├── components/        # Sidebar, Composer, Messages, Widgets...
│   └── lib/               # API client (with local fallback), storage, speech
├── render.yaml            # Render blueprint
└── vercel.json            # SPA rewrites for Vercel
```

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Vercel auto-detects **Vite** (build: `npm run build`, output: `dist`).
   `api/chat.ts` becomes a serverless function automatically.
4. Deploy. Done — frontend + `/api/chat` on one URL.

Or with the CLI:

```bash
npm i -g vercel
vercel --prod
```

## Deploy to Render

1. Push to GitHub.
2. [render.com](https://render.com) → **New → Blueprint** → select the repo.
   Render reads `render.yaml` and configures everything.

Manual setup instead of blueprint:

| Setting       | Value                            |
| ------------- | -------------------------------- |
| Runtime       | Node                             |
| Build command | `npm install && npm run build`   |
| Start command | `node server.mjs`                |
| Health check  | `/api/health`                    |

## The toolbox (type `/` in the chat)

`/calc` `/convert` `/summarize` `/count` `/password` `/palette` `/story` `/poem`
`/joke` `/fact` `/quote` `/define` `/base64` `/case` `/lorem` `/uuid` `/roll`
`/flip` `/time` `/help`

## Special features vs. typical AI chatbots

- **Deterministic tools** — math is parsed (not guessed), summaries are extractive, passwords use real entropy.
- **5 personas** — Nexa, Code Wizard, Muse, Professor, Analyst.
- **Voice in / voice out** — Web Speech API dictation + spoken replies.
- **Private by design** — conversations live in `localStorage`; export as Markdown/JSON.
- **Full-stack source** — frontend, serverless API and Node server all included and identical in behavior.
