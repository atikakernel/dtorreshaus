# 🧩 dtorreshaus — Composable CDP

> **A real ecommerce store turned into a modular, open-source Customer Data Platform.**
> Every piece is swappable, every data point flows end-to-end.

**🌐 Store**: https://dtorreshaus.com
**📊 Stack**: GTM SS → RudderStack → PostgreSQL → dbt → HubSpot

---

## 🗺️ Architecture

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   Frontend      │     │  GTM Server Side  │     │   RudderStack   │
│   React + Vite  │────▶│  sst.dtorreshaus  │────▶│   Data Plane    │
│   Wompi Checkout│     │  (Docker / EC2)   │     │   (self-hosted) │
└─────────────────┘     └───────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   HubSpot CRM   │◀────│  Reverse ETL      │◀────│   PostgreSQL    │
│   (Contacts)    │     │  (Python Script)  │     │   Warehouse     │
└─────────────────┘     └───────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │   dbt Models    │
                                                  │   Star Schema   │
                                                  │   (ELT Layer)   │
                                                  └─────────────────┘
```

### Why "Composable"?

Each block in the CDP uses an independent tool. Want to swap RudderStack for Segment? Just reconnect. Want to replace HubSpot with Salesforce? Just change the Reverse ETL script. Nothing is coupled; **everything is composable**.

---

## ⚡ Data Pipeline — From click to CRM in 5 layers

| # | Layer | Tool | What it does |
|---|-------|------|--------------|
| 1 | **Collection** | GTM Server Side | Captures frontend events (page views, add to cart, purchase) with first-party data |
| 2 | **Ingestion** | RudderStack (self-hosted) | Receives the event stream and loads it into the warehouse |
| 3 | **Storage** | PostgreSQL | Local data warehouse where raw events land |
| 4 | **Transformation** | dbt | Redacts PII, anonymizes IPs, classifies devices, and builds a star schema |
| 5 | **Activation** | Reverse ETL (Python) | Pushes transformed users to the CRM (HubSpot) as contacts |

---

## 🤖 AI Intelligence Layer — Smart User Profiling

| Feature | Tool | What it does |
|---------|------|--------------|
| **Lead Scoring** | Ollama (Local LLM) | Analyzes session clicks & time via queue to classify user intent (*e.g., "Comprador Impulsivo"*) |
| **Dynamic UI** | React Components | Renders targeted banners based on the Semantic AI Label in real-time |
| **CDP Enrichment**| GTM + RudderStack | Pushes the AI label into the Data Warehouse so the Reverse ETL brings it to the CRM |
| **Product AI** | Ollama + Embeddings | Generates semantic product recommendations bypassing static DB queries |

---

## 🔬 dbt Models — The transformation brain

```
ecommerce_elt/models/
├── sources.yml                # Raw source definitions
├── stg_page_view_clean.sql    # Staging: PII redaction + IP anonymization
├── stg_hubspot_contacts.sql   # Staging: HubSpot contacts normalization
└── fct_customer_journey.sql   # Fact table: Web + CRM JOIN → Star Schema
```

### `stg_page_view_clean` — Data cleansing

```sql
-- PII redaction: censors emails exposed in URLs
REGEXP_REPLACE(page_location, 'email=[^&]+', 'email=[REDACTED]', 'g')

-- IP anonymization: strips the last octet
REGEXP_REPLACE(context_ip, '\.\d+$', '.0')

-- Device classification from User-Agent
CASE
    WHEN context_user_agent ILIKE '%Mobile%' THEN 'Mobile'
    WHEN context_user_agent ILIKE '%iPad%'   THEN 'Tablet'
    ELSE 'Desktop'
END AS device_category
```

### `fct_customer_journey` — The fact table

Joins web traffic with CRM data to classify every user:

```sql
CASE
    WHEN c.hubspot_id IS NOT NULL THEN 'Lead'
    ELSE 'Visitor'
END AS user_status
```

**Result**: a dashboard-ready table that answers *"Who visits my store and who is already a lead?"*

---

## 🏗️ Infrastructure

### Docker Compose — Self-hosted RudderStack

```bash
# Spin up the entire ingestion stack
docker compose -f infra/rudderstack/rudder-docker.yml up -d
```

Includes: RudderStack Server, Transformer, PostgreSQL (jobs), MinIO (staging), and StatsD Exporter.

### GTM Server Side — On EC2

```bash
# Deploy the GTM Server Side container with SSL
./setup-gtm-server.sh
```

Runs as a Docker container behind Nginx with Certbot SSL on `sst.dtorreshaus.com`.

### CI/CD — GitHub Actions

```yaml
on:
  push:
    branches: [ main ]
```

Automated pipeline: build frontend → deploy to EC2 → setup GTM Server → copy assets.

---

## 🛒 The Ecommerce (The data source)

The real store that generates all the pipeline events.

| Component | Details |
|-----------|---------|
| **Frontend** | React 18 + Vite 5 |
| **Backend** | Express + Prisma (PostgreSQL) |
| **Payments** | Wompi — Nequi, Cards, PSE (Colombia) |
| **Products** | 136 products across 10 categories |
| **Hosting** | AWS EC2 (Ubuntu) + Nginx + PM2 |
| **SSL** | Certbot (Let's Encrypt) |

---

## 🚀 Quick Start

### 1. Clone and run the ecommerce

```bash
git clone https://github.com/atikakernel/dtorreshaus.git
cd dtorreshaus
npm install
npm run dev          # Frontend at http://localhost:5173
```

### 2. Spin up the data stack

```bash
# RudderStack + PostgreSQL warehouse
docker compose -f infra/rudderstack/rudder-docker.yml up -d

# Simulate browsing events
python simulador.py
```

### 3. Transform with dbt

```bash
cd ecommerce_elt
dbt run             # Run staging + fact table models
dbt test            # Validate data integrity
```

### 4. Activate data → CRM

```bash
# Reverse ETL: push clean users to HubSpot
python reverse_etl.py
```

---

## 📂 Project Structure

```
dtorreshaus/
├── src/                          # Frontend — React + Vite
│   ├── components/
│   │   └── Checkout.jsx          # Checkout with Wompi
│   ├── services/api.js           # API client
│   └── App.jsx                   # Main component
│
├── backend/                      # API — Express + Prisma
│   ├── server.js
│   ├── routes/
│   └── prisma/                   # DB schema
│
├── ecommerce_elt/                # ⭐ dbt Project (ELT Layer)
│   └── models/
│       ├── stg_page_view_clean.sql
│       ├── stg_hubspot_contacts.sql
│       └── fct_customer_journey.sql
│
├── infra/
│   └── rudderstack/
│       ├── rudder-docker.yml     # Docker Compose — Data Plane
│       └── workspaceConfig.json
│
├── simulador.py                  # Event generator → RudderStack
├── reverse_etl.py                # PostgreSQL → HubSpot (Activation)
├── verify_fct.py                 # Star Schema verification
├── setup-gtm-server.sh           # GTM Server Side deploy on EC2
├── run_ec2_deploy.sh             # Backend deploy on EC2
│
├── .github/workflows/
│   └── deploy.yml                # CI/CD: GitHub Actions → EC2
│
└── docs/
    └── DEPLOYMENT.md             # Full deployment guide
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Collection** | Google Tag Manager Server Side |
| **Ingestion** | RudderStack (self-hosted, Docker) |
| **Warehouse** | PostgreSQL 15 |
| **Transformation** | dbt Core |
| **Activation** | Python (Reverse ETL → HubSpot API) |
| **Frontend** | React 18, Vite 5 |
| **Backend** | Node.js 18, Express, Prisma |
| **Payments** | Wompi (Nequi, Cards, PSE) |
| **Infra** | AWS EC2, Nginx, PM2, Certbot |
| **CI/CD** | GitHub Actions |

---

## 💡 Key Concepts Demonstrated

- ✅ **Composable CDP** — Every piece of the stack is independently replaceable
- ✅ **First-party data collection** — GTM Server Side, no third-party cookie dependency
- ✅ **Data governance** — PII redaction and IP anonymization at the transformation layer
- ✅ **Star Schema** — Fact table joining web analytics with CRM data
- ✅ **Reverse ETL** — Transformed data activated back into the CRM
- ✅ **Self-hosted stack** — RudderStack and PostgreSQL run locally, zero vendor lock-in
- ✅ **Infrastructure as Code** — Docker Compose + setup scripts + automated CI/CD
- ✅ **Real ecommerce** — Not a demo — a live store with real payments in Colombia 🇨🇴

---

## 📞 Contact

**Diego Castellanos** — Data Engineer

- 🔗 GitHub: [atikakernel](https://github.com/atikakernel)
- 🌐 Store: [dtorreshaus.com](https://dtorreshaus.com)

---

**© 2025 dtorreshaus — Composable CDP for Ecommerce** 🇨🇴
