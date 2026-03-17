# 🧩 dtorreshaus — Composable CDP

> **Un ecommerce real convertido en un Customer Data Platform modular y open-source.**
> Cada pieza se puede reemplazar, cada dato fluye de punta a punta.

**🌐 Tienda**: https://dtorreshaus.com
**📊 Stack**: GTM SS → RudderStack → PostgreSQL → dbt → HubSpot

---

## 🗺️ Arquitectura

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   Frontend      │     │  GTM Server Side  │     │   RudderStack   │
│   React + Vite  │────▶│  sst.dtorreshaus  │────▶│   Data Plane    │
│   Wompi Checkout│     │  (Docker / EC2)   │     │   (localhost)   │
└─────────────────┘     └───────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│   HubSpot CRM   │◀────│  Reverse ETL      │◀────│   PostgreSQL    │
│   (Contactos)   │     │  (Python Script)  │     │   Warehouse     │
└─────────────────┘     └───────────────────┘     └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │   dbt Models    │
                                                  │   Star Schema   │
                                                  │   (ELT Layer)   │
                                                  └─────────────────┘
```

### ¿Por qué "Composable"?

Cada bloque del CDP usa una herramienta independiente. ¿Quieres cambiar RudderStack por Segment? Solo reconectas. ¿Quieres reemplazar HubSpot por Salesforce? Solo cambias el script de Reverse ETL. Nada está acoplado; **todo es componible**.

---

## ⚡ Data Pipeline — De clic a CRM en 5 capas

| # | Capa | Herramienta | Qué hace |
|---|------|-------------|----------|
| 1 | **Recolección** | GTM Server Side | Captura eventos del frontend (page views, add to cart, purchase) con first-party data |
| 2 | **Ingestión** | RudderStack (self-hosted) | Recibe el stream de eventos y los deposita en el warehouse |
| 3 | **Almacenamiento** | PostgreSQL | Data warehouse local donde aterrizan los datos crudos |
| 4 | **Transformación** | dbt | Limpia PII, anonimiza IPs, clasifica dispositivos y crea un star schema |
| 5 | **Activación** | Reverse ETL (Python) | Empuja los usuarios transformados al CRM (HubSpot) como contactos |

---

## 🔬 dbt Models — El cerebro de la transformación

```
ecommerce_elt/models/
├── sources.yml                # Definición de fuentes crudas
├── stg_page_view_clean.sql    # Staging: redacción de PII + anonimización de IP
├── stg_hubspot_contacts.sql   # Staging: normalización de contactos HubSpot
└── fct_customer_journey.sql   # Fact table: JOIN web + CRM → Star Schema
```

### `stg_page_view_clean` — Limpieza de datos

```sql
-- Redacción de PII: censura correos en URLs
REGEXP_REPLACE(page_location, 'email=[^&]+', 'email=[CORREO_CENSURADO]', 'g')

-- Anonimización de IP: elimina último octeto
REGEXP_REPLACE(context_ip, '\.\d+$', '.0')

-- Clasificación de dispositivo por User-Agent
CASE
    WHEN context_user_agent ILIKE '%Mobile%' THEN 'Mobile'
    WHEN context_user_agent ILIKE '%iPad%'   THEN 'Tablet'
    ELSE 'Desktop'
END AS device_category
```

### `fct_customer_journey` — La fact table

Cruza tráfico web con datos de CRM para clasificar cada usuario:

```sql
CASE
    WHEN c.hubspot_id IS NOT NULL THEN 'Lead'
    ELSE 'Visitor'
END AS user_status
```

**Resultado**: una tabla lista para dashboards que responde *"¿quién visita mi tienda y quién ya es lead?"*

---

## 🏗️ Infraestructura

### Docker Compose — RudderStack local

```bash
# Levantar todo el stack de ingestión
docker compose -f infra/rudderstack/rudder-docker.yml up -d
```

Incluye: RudderStack Server, Transformer, PostgreSQL (jobs), MinIO (staging) y StatsD Exporter.

### GTM Server Side — En EC2

```bash
# Desplegar el contenedor de GTM Server Side con SSL
./setup-gtm-server.sh
```

Se ejecuta como Docker container detrás de Nginx con Certbot SSL en `sst.dtorreshaus.com`.

### CI/CD — GitHub Actions

```yaml
on:
  push:
    branches: [ main ]
```

Pipeline automatizado: build frontend → deploy a EC2 → setup GTM Server → copiar assets.

---

## 🛒 El Ecommerce (La fuente de datos)

El sitio real que genera todos los eventos del pipeline.

| Componente | Detalle |
|------------|---------|
| **Frontend** | React 18 + Vite 5 |
| **Backend** | Express + Prisma (PostgreSQL) |
| **Pagos** | Wompi — Nequi, Tarjetas, PSE |
| **Productos** | 136 productos en 10 categorías |
| **Hosting** | AWS EC2 (Ubuntu) + Nginx + PM2 |
| **SSL** | Certbot (Let's Encrypt) |

---

## 🚀 Quick Start

### 1. Clonar y levantar el ecommerce

```bash
git clone https://github.com/atikakernel/dtorreshaus.git
cd dtorreshaus
npm install
npm run dev          # Frontend en http://localhost:5173
```

### 2. Levantar el data stack

```bash
# RudderStack + PostgreSQL warehouse
docker compose -f infra/rudderstack/rudder-docker.yml up -d

# Simular eventos de navegación
python simulador.py
```

### 3. Transformar con dbt

```bash
cd ecommerce_elt
dbt run             # Ejecuta los modelos de staging + fact table
dbt test            # Valida integridad de datos
```

### 4. Activar datos → CRM

```bash
# Reverse ETL: empujar usuarios limpios a HubSpot
python reverse_etl.py
```

---

## 📂 Estructura del Proyecto

```
dtorreshaus/
├── src/                          # Frontend React + Vite
│   ├── components/
│   │   └── Checkout.jsx          # Checkout con Wompi
│   ├── services/api.js           # Cliente API
│   └── App.jsx                   # Componente principal
│
├── backend/                      # API Express + Prisma
│   ├── server.js
│   ├── routes/
│   └── prisma/                   # Schema de DB
│
├── ecommerce_elt/                # ⭐ dbt Project (ELT Layer)
│   └── models/
│       ├── stg_page_view_clean.sql
│       ├── stg_hubspot_contacts.sql
│       └── fct_customer_journey.sql
│
├── infra/
│   └── rudderstack/
│       ├── rudder-docker.yml     # Docker Compose del Data Plane
│       └── workspaceConfig.json
│
├── simulador.py                  # Generador de eventos → RudderStack
├── reverse_etl.py                # PostgreSQL → HubSpot (Activación)
├── verify_fct.py                 # Verificación del Star Schema
├── setup-gtm-server.sh           # Deploy GTM Server Side en EC2
├── run_ec2_deploy.sh             # Deploy backend en EC2
│
├── .github/workflows/
│   └── deploy.yml                # CI/CD: GitHub Actions → EC2
│
└── docs/
    └── DEPLOYMENT.md             # Guía completa de deployment
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Recolección** | Google Tag Manager Server Side |
| **Ingestión** | RudderStack (self-hosted, Docker) |
| **Warehouse** | PostgreSQL 15 |
| **Transformación** | dbt Core |
| **Activación** | Python (Reverse ETL → HubSpot API) |
| **Frontend** | React 18, Vite 5 |
| **Backend** | Node.js 18, Express, Prisma |
| **Pagos** | Wompi (Nequi, Tarjetas, PSE) |
| **Infra** | AWS EC2, Nginx, PM2, Certbot |
| **CI/CD** | GitHub Actions |

---

## 💡 Conceptos demostrados

- ✅ **Composable CDP** — Cada pieza del stack es reemplazable
- ✅ **First-party data collection** — GTM Server Side, sin depender de cookies de terceros
- ✅ **Data governance** — Redacción de PII y anonimización de IPs en la capa de transformación
- ✅ **Star Schema** — Fact table que cruza web analytics con CRM data
- ✅ **Reverse ETL** — Los datos transformados se activan de vuelta al CRM
- ✅ **Self-hosted stack** — RudderStack y PostgreSQL corren localmente, sin vendor lock-in
- ✅ **Infrastructure as Code** — Docker Compose + scripts de setup + CI/CD automatizado
- ✅ **Ecommerce real** — No es un demo, es una tienda con pagos reales para Colombia 🇨🇴

---

## 📞 Contacto

**Diego Castellanos** — Data Engineer

- 🔗 GitHub: [atikakernel](https://github.com/atikakernel)
- 🌐 Tienda: [dtorreshaus.com](https://dtorreshaus.com)

---

**© 2025 dtorreshaus — Composable CDP para Ecommerce** 🇨🇴
