# TikTok Research AI Agent

> Search TikTok → Analyze hooks with Gemini → Generate creative briefs. Automatically.

## Stack
- **Frontend**: React dashboard (deploy to Vercel/Netlify or run locally)
- **Backend**: FastAPI (Python) — deploy to Railway, Render, or Replit
- **TikTok Data**: [tikwm.com](https://tikwm.com) — free up to ~1000 req/day, no signup needed
- **AI**: Google Gemini 1.5 Pro (watches videos directly via URL)
- **Output**: Live dashboard + downloadable DOCX briefs

---

## Setup (5 minutes)

### 1. Get your API keys

**Gemini (free tier works):**
1. Go to https://aistudio.google.com/apikey
2. Click "Create API key"
3. Copy it — you'll use it as `GEMINI_API_KEY`

**tikwm.com (no key needed for basic use):**
- The API at `https://tikwm.com/api` works without a key
- For higher volume, register at tikwm.com for a free token

### 2. Run the backend

```bash
cd backend
pip install -r requirements.txt

# Set your keys
export GEMINI_API_KEY="your-key-here"

# Start the server
python main.py
# → Running on http://localhost:8000
```

### 3. Run the frontend

The dashboard is a single React file (`tiktok-research-dashboard.jsx`).

**Option A — Paste into Claude.ai artifact** (instant preview, no setup):
- Open Claude.ai → New conversation → paste the .jsx file content

**Option B — Run locally with Vite:**
```bash
npm create vite@latest frontend -- --template react
cd frontend
# Replace src/App.jsx with the dashboard .jsx file
npm install
npm run dev
```

**Option C — Deploy to Vercel:**
```bash
# Same as Option B but push to GitHub → connect to Vercel
```

### 4. Connect frontend to backend

In `tiktok-research-dashboard.jsx`, line 3:
```js
const API = "http://localhost:8000"; // Change to your deployed backend URL
```

---

## Project Structure

```
tiktok-agent/
├── backend/
│   ├── main.py              # FastAPI app — all endpoints
│   ├── requirements.txt     # Python deps
│   └── templates/
│       └── default_template.md   # Copy-paste starter brief template
├── tiktok-research-dashboard.jsx  # React frontend (single file)
└── README.md
```

---

## The Full Pipeline

```
User enters keyword
      ↓
POST /search → tikwm.com API → returns video list (id, url, stats, caption)
      ↓
User selects videos
      ↓
POST /analyze → for each video:
  ├── Fetch video MP4 URL from tikwm
  ├── Gemini 1.5 Pro watches video → JSON hook analysis
  └── tikwm comment API → Gemini analyzes comments → JSON insights
      ↓
User selects analyses
      ↓
POST /generate-brief → Gemini combines:
  ├── Brand bible (your client context)
  ├── Brief template (your structure)
  └── All video analyses → complete brief text
      ↓
GET /export/docx/{id} → downloads formatted .docx
```

---

## API Endpoints

| Method | Route | What it does |
|--------|-------|-------------|
| POST | `/projects` | Create a client project with brand bible |
| GET | `/projects` | List all projects |
| POST | `/search` | Search TikTok by keyword |
| POST | `/analyze` | Gemini analyzes selected videos |
| POST | `/generate-brief` | Generate brief from analyses |
| GET | `/export/docx/{id}` | Download brief as .docx |

---

## Making it Production-Ready

**Swap in-memory DB for SQLite:**
```python
# Install: pip install sqlmodel
# Replace the `_db` dicts with SQLModel tables
```

**Add auth (for SaaS):**
```python
# Install: pip install fastapi-users
# Add OAuth or email/password auth
```

**Scale tikwm usage:**
- Free tier: ~1000 req/day
- Register at tikwm.com for higher limits or use RapidAPI TikTok scrapers as backup

**Deploy backend to Railway (free):**
1. Push to GitHub
2. Connect Railway → set env vars → auto-deploys

---

## Customizing Briefs

Edit your **Brief Template** per project. Use markdown headers (`##`) for sections.
The AI will fill every section based on your research.

Edit your **Brand Bible** to inject client context into every brief automatically.
Include: tone, audience, product, messaging pillars, words to use/avoid.

---

## Cost Estimate

| Service | Cost |
|---------|------|
| tikwm.com | Free (1k req/day) |
| Gemini 1.5 Pro | ~$0.002 per video analyzed |
| 10 videos + 1 brief | < $0.05 |
| 100 videos/month | < $0.50 |

Effectively free at agency scale.
