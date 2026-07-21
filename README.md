<div align="center">

<img src="frontend/public/favicon.svg" width="72" height="72" alt="Veridian logo" />

# Veridian

**AI-Powered Business Intelligence, from raw file to executive insight.**

Upload a dataset. Get enterprise-grade profiling, cleaning, machine learning, AI-written
insights, and boardroom-ready PDF reports — in minutes, not weeks.

[Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Architecture](#architecture) · [Docker](#docker)

</div>

---

## Brand

| | |
|---|---|
| **Name** | Veridian — from *veritas* (truth) + *verdant* (growth): data you can trust, insight that compounds. |
| **Logo** | A hexagon — stability and structure — containing three ascending bars that resolve into an implicit "V". Represents data maturing into decisions. |
| **Primary color** | Indigo `#4F46E5` |
| **Accent color** | Emerald `#10B981` |
| **Dark surface** | `#0B1120` |
| **Light surface** | `#F8FAFC` |
| **Semantic colors** | Amber `#F59E0B` (warning) · Rose `#F43F5E` (danger) |
| **Display font** | [Sora](https://fonts.google.com/specimen/Sora) — headings, brand marks |
| **Body font** | [Inter](https://fonts.google.com/specimen/Inter) — UI and copy |
| **Mono font** | [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — data/code |
| **Favicon** | `frontend/public/favicon.svg` — gradient hexagon mark |

---

## Features

### Data Ingestion
CSV and Excel (`.xlsx`) upload with automatic type detection, size limits, drag-and-drop
progress, dataset replacement, and deletion.

### Data Preview & Profiling
Paginated, searchable, sortable table view; per-column profiling (dtype, missing %,
uniqueness, mean/median/std); duplicate detection; memory usage; correlation matrix;
null-value heatmap; IQR-based outlier detection.

### Data Cleaning
Drop rows/columns, fill missing values (mean/median/mode/custom), remove duplicates,
rename columns, convert types, normalize/standardize, label/one-hot encode — with a full
history log and one-click **undo** or **reset to original**.

### Visualization
Histograms, box plots, scatter plots, pie/bar/line/area charts, and distribution
summaries, all rendered live from the cleaned dataset via Recharts.

### Machine Learning
Automatic model recommendations based on your data's shape, plus one-click training for:
- **Regression** (Linear, Random Forest, Decision Tree) — R², MAE, RMSE, feature importance
- **Classification** (Logistic Regression, Random Forest, Decision Tree, SVM) — accuracy,
  precision/recall/F1, confusion matrix, ROC/AUC
- **Clustering** (K-Means) — silhouette score, cluster visualization
- **Anomaly Detection** (Isolation Forest) — anomaly scoring and flagged records
- **Time Series** — trend decomposition and forward forecasting

### AI Insights & Chat
A built-in statistical AI engine writes dataset/business/executive summaries,
recommendations, risks, opportunities, and correlation/outlier explanations — **fully
offline, no API key required**. An embedded chat assistant answers natural-language
questions grounded in your dataset's live statistics ("Which columns have missing
values?", "Recommend an ML model", "Explain the correlations"). Optionally, set
`LLM_PROVIDER` / `LLM_API_KEY` in the backend `.env` to have a real LLM (Anthropic or
OpenAI) polish the generated text.

### Reporting & Export
Branded, multi-page PDF reports (ReportLab) with cover page, KPIs, executive summary,
correlation/outlier charts, column profile tables, page numbers, and footer — plus raw
CSV, Excel, and JSON export.

### Premium, Single-Workspace UI
A minimal 4-item sidebar (Dashboard, Upload, Workspace, Settings) instead of a
traditional multi-page admin panel. After uploading a dataset, everything —
KPIs, preview, profiling, quality, cleaning, charts, ML, AI insights, reports,
and the chat assistant — lives on one continuous, scrollable **Workspace**
page with a scrollspy sub-nav, reveal-on-scroll sections, light/dark themes,
and Framer Motion animations throughout.

---

## Tech Stack

**Frontend** — React · TypeScript · Vite · Tailwind CSS · Recharts · Framer Motion ·
Lucide Icons · Axios · React Router

**Backend** — Python · FastAPI · Pandas · NumPy · Scikit-Learn · SciPy · Statsmodels ·
Matplotlib/Seaborn · OpenPyXL · ReportLab · Uvicorn

**Database** — SQLite by default; swap in PostgreSQL by changing one `DATABASE_URL`
(the SQLAlchemy layer is database-agnostic).

**Auth** — JWT (python-jose) + bcrypt password hashing.

---

## Architecture

```
Enterprise_AI_Data_Analyst/
├── backend/
│   └── app/
│       ├── core/        # config, database session, security (JWT/bcrypt)
│       ├── models/      # SQLAlchemy models (User, Dataset, CleaningStep, MLRun, ChatMessage)
│       ├── schemas/      # Pydantic request/response schemas
│       ├── api/
│       │   ├── deps.py       # shared dependencies (auth, dataset ownership)
│       │   └── routers/      # auth, datasets, cleaning, charts, ml, ai, reports
│       ├── services/    # business logic per domain
│       └── ai/           # rule-based insight engine, chat NLU, optional LLM client
└── frontend/
    └── src/
        ├── components/  # layout, ui, charts, dashboard, chat, upload
        ├── pages/       # one page per route
        ├── services/    # typed API clients (axios)
        ├── context/     # Auth / Theme / Dataset providers
        └── types/       # shared TypeScript interfaces
```

---

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit **http://localhost:5173** — the Vite dev server proxies `/api` to the backend on
port 8000.

---

## Docker

```bash
docker compose up --build
```

Frontend on `http://localhost` (port 80), backend API on `http://localhost:8000`.

---

## License

MIT — see [LICENSE](LICENSE).
