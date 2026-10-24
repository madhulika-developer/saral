# Saral (సరళ / सरल) — Utilities that explain themselves

> **"Your electricity and water, explained."**  
> *A 24-hour hackathon project building a smarter public utility experience for Indian households.*

---

## 💡 Overview

Domestic utility bills in India are confusing and mathematically opaque. When payments are delayed or in-transit, citizens suffer anxiety fearing wrongful disconnection. When outages happen, tracking repairs feels like shouting into a void.

**Saral** solves this with a mobile-first, zero-crash web application that:
1. **Explains Bills Simply:** Itemises electricity and water tariffs into plain language with telescopic slab math, highlighting why a bill doubled and ranking reasons by rupee impact.
2. **Tracks Uncertain Payments:** Visualises the 4-stage transaction pipeline (Initiated ➔ Debited from Bank ➔ Gateway Escrow ➔ Account Ledger) for "money debited but unpaid" scenarios with one-click formal dispute generation.
3. **Aggregates Community Outages:** An interactive Leaflet map with duplicate-aware reporting ("14 neighbours already reported this") and live restoration pipelines.
4. **Delivers Service Notices:** Plain-language updates answering *What*, *Who*, *Why*, and *When*.
5. **Empowers Citizens with a Multilingual AI Assistant:** Voice-enabled assistant that converses in any Indian language, calls local tools for factual grounding, and falls back to a 100% offline rule-based engine when no API key or internet is present.

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**

### Option A: One-Click Launch (Windows)
Run the startup script in PowerShell:
```powershell
.\start-saral.ps1
```
Or in Windows Command Prompt:
```cmd
start-saral.bat
```

### Option B: Manual Step-by-Step

#### 1. Start Backend Server
```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Run pytest unit tests
py -3.13 -m pytest backend/tests -v

# Start FastAPI server on port 8000
py -3.13 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API docs are available at `http://127.0.0.1:8000/docs`.*

#### 2. Start Frontend Server
```bash
cd frontend

# Install dependencies
npm install

# Build check
npm run build

# Start Vite dev server on port 5173
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🏛️ Architecture & Reliability

```
                              ┌──────────────────────────────────┐
                              │      React 18 + Vite Frontend    │
                              │  (Tailwind, Lucide, Recharts)    │
                              └────────────────┬─────────────────┘
                                               │
                        REST API & Server-Sent Events (SSE)
                                               │
                              ┌────────────────▼─────────────────┐
                              │     FastAPI Python 3.13 Backend  │
                              └───────┬──────────────┬───────────┘
                                      │              │
                   ┌──────────────────▼──┐        ┌──▼───────────────────┐
                   │ Deterministic Engine│        │ Grounded AI Engine   │
                   │ • billing.py (math) │        │ • Tool Calling (ai)  │
                   │ • payments.py       │        │ • fallback_bot.py    │
                   │ • outages.py        │        │   (100% offline NLU) │
                   └─────────────────────┘        └──────────────────────┘
```

### 1. Multilingual Support (12 Languages + RTL)
- **Static Core Translations:** Handcrafted translation files in `frontend/src/i18n/` for 12 languages:
  - English (`en`), Telugu (`te`), Hindi (`hi`), Tamil (`ta`), Kannada (`kn`), Malayalam (`ml`), Marathi (`mr`), Bengali (`bn`), Gujarati (`gu`), Punjabi (`pa`), Odia (`or`), Urdu (`ur`).
- **RTL Direction Mirroring:** Complete RTL mirroring for Urdu and Arabic (`dir="rtl"`).
- **Indic Typography:** Preloaded Google Fonts for Noto Sans scripts so no text renders as boxes (`□□□`).
- **Dynamic Translation Layer:** Translates arbitrary user questions and notices with caching and friendly fallbacks.

### 2. Zero-Crash Offline Guarantee
- **Deterministic Math:** Every rupee calculation happens in pure Python in `backend/billing.py`. Line items always sum **exactly** to the total payable amount (enforced by unit tests).
- **Graceful AI Fallback:** If `LLM_API_KEY` is omitted, or if an LLM call exceeds 8 seconds or fails, `fallback_bot.py` immediately handles intents in Telugu, Hindi, English, and other languages with zero errors.

---

## 📋 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns server health and active mode (`ai_online` vs `offline_rule_engine`). |
| `GET` | `/api/users` | List seeded demo users (Lakshmi Devi and Ravi Kumar). |
| `GET` | `/api/bill/{user_id}?utility=` | Get current bill, 6-month history, and exact slab breakdown. |
| `GET` | `/api/bill/{user_id}/explain?lang=` | Computes why bill increased and returns ranked reasons. |
| `GET` | `/api/payments/{user_id}?lang=` | Payment history with 4-stage vertical timeline and advice. |
| `GET` | `/api/payments/{payment_id}/complaint` | Generates copyable grievance petition for delayed payments. |
| `GET` | `/api/outages` | List active outages with coordinates and duplicate report counts. |
| `POST` | `/api/outages` | Submit outage report with neighbor duplicate aggregation. |
| `GET` | `/api/updates?lang=` | Official service notices feed (What, Who, Why, Restoration time). |
| `POST` | `/api/updates/{id}/read` | Marks an update as read for a specific user. |
| `POST` | `/api/translate` | Dynamic text translation endpoint with in-memory caching. |
| `POST` | `/api/chat` | Streaming Server-Sent Events (SSE) AI assistant endpoint. |

---

## 🧪 Test Suite & Verification

The deterministic calculation engine, payments timeline, and multilingual fallback bot are covered by automated unit tests:

```bash
py -3.13 -m pytest backend/tests -v
```

### Verified Test Cases:
- `test_electricity_slab_calculation`: Validates telescopic APCPDCL tariff slabs.
- `test_line_items_exact_reconciliation`: Proves line items sum **exactly** to total amount across multiple unit levels (0, 45, 100, 175, 285, 450 units).
- `test_water_bill_calculation`: Tests VMC water and sewerage cess calculations.
- `test_explain_bill_increase_lakshmi`: Confirms why-higher ranking by rupee impact.
- `test_multilingual_explanation_story`: Tests Telugu and Hindi narrative outputs.
- `test_language_detection`: Verifies script detection for Telugu, Hindi, Tamil, English.
- `test_bill_explanation_intents`: Tests intent matching across English, Telugu, Hindi.
- `test_payment_status_intents`: Validates the uncertain payment advice response.
- `test_outage_reporting_intent`: Verifies conversational outage registration.
- `test_tariff_and_savings_intent`: Tests proactive 24°C AC savings tips.
- `test_user_payments_retrieval`: Validates the 4-stage transaction verification pipeline.
- `test_complaint_generator_multilingual`: Verifies formal dispute petition templates.

---

## 📁 Repository Structure

```
saral/
├── README.md                 # Project documentation & architecture
├── .gitignore                # Ignored node_modules, pycache, dist, env
├── .env.example              # Sample environment configuration
├── start-saral.ps1           # One-click PowerShell launcher
├── start-saral.bat           # One-click Windows batch launcher
├── docs/
│   └── demo-script.md        # 5-minute hackathon walkthrough & Lakshmi story
├── demo/
│   ├── screenshots/          # High-resolution screenshots
│   └── BACKUP_VIDEO.md       # Backup demo video instructions
├── backend/
│   ├── requirements.txt      # Python dependencies (fastapi, uvicorn, pydantic, etc.)
│   ├── main.py               # FastAPI application with CORS and routing
│   ├── billing.py            # Exact slab calculations & why-higher engine
│   ├── payments.py           # 4-stage timeline & dispute petition generator
│   ├── outages.py            # Duplicate-aware outage engine
│   ├── ai.py                 # Function-calling agent with streaming SSE
│   ├── translate.py          # Three-layer translation engine
│   ├── fallback_bot.py       # Offline multilingual rules engine
│   ├── tests/                # Automated pytest suite
│   └── data/                 # Realistic mock databases (tariffs, bills, payments, etc.)
└── frontend/
    ├── package.json          # React 18, Vite, Tailwind, Recharts, Leaflet, i18next
    ├── vite.config.js        # Vite build & proxy configuration
    ├── tailwind.config.js    # Design system, brand colors, Indic font stack
    ├── index.html            # Noto Sans fonts & Leaflet styling
    └── src/
        ├── App.jsx           # App shell with ErrorBoundary & routes
        ├── main.jsx          # React DOM entry point
        ├── api/client.js     # Resilient API client with timeout & retries
        ├── context/          # App state, user switching & Intl formatters
        ├── components/       # Navbar, BottomNav, AssistantWidget, Chat
        ├── pages/            # HomeDashboard, BillExplainer, Payments, Outages, Updates
        └── i18n/             # Complete translations for 12 languages
```

---

## 🏆 Hackathon Demo Story Summary

Lakshmi Devi, a homemaker in Vijayawada, gets a June electricity bill of ₹1,641 (up from ₹831 in May):
1. **Understands why:** Saral explains in Telugu that 85 extra units fell into Slab 4 (₹7.10/unit) adding ₹603.50 due to 6-8 hours daily AC cooling during Vijayawada's 43°C summer heatwave.
2. **Listens aloud:** Clicks the speaker button to hear the explanation read aloud in natural Telugu.
3. **Checks delayed payment:** Sees that her ₹1,641 UPI payment is safely held by BillDesk awaiting the 24-48h discom reconciliation cycle. Copies a pre-filled grievance draft with one click.
4. **Reports water cut:** Finds that 14 neighbours in Benz Circle already reported the 400mm pipeline breach, and reads the restoration notice with tanker delivery numbers.
5. **Converses with AI:** Asks questions in Telugu and English, receiving instant grounded answers from verified records.
