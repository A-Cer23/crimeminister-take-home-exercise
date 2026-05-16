# Cloudflare Weather Ingestion Pipeline

Fetches daily weather forecast data from the [Open-Meteo API](https://open-meteo.com/) for Toronto and stores it in a Cloudflare D1 database, orchestrated via a Cloudflare Workflow.

## Architecture

- **Worker** (`src/index.ts`) — HTTP entrypoint, accepts `POST /ingest` to trigger a run
- **Workflow** (`src/workflow.ts`) — two-step ingestion pipeline:
  - Step 1: fetch forecast data from Open-Meteo, validate the response
  - Step 2: parse all 7 daily forecast rows and upsert into D1
- **D1** — relational storage via Drizzle ORM

## Data Model

Table: `daily_forecasts`

| Column | Type | Notes |
|---|---|---|
| `id` | integer | auto-increment PK |
| `forecast_date` | text | ISO 8601 date, unique |
| `max_temperature` | real | °C |
| `min_temperature` | real | °C |
| `precipitation_sum` | real | mm |
| `ingestion_run_id` | text | workflow instance ID |
| `timestamp` | text | set by DB on insert |

Idempotency is enforced via the unique index on `forecast_date` — re-running ingestion for the same date is a no-op (`INSERT OR IGNORE`).

## Setup

```bash
npm install
npx wrangler login
```

Create the D1 database:

```bash
npx wrangler d1 create ingestion-db --update-config=false
```

Copy the `database_id` from the output and update `wrangler.jsonc` under `d1_databases`.

Apply migrations:

```bash
npm run db:migrations:migrate
```

## Deploy

```bash
npm run deploy
```

## Usage

Trigger an ingestion run:

```bash
curl -X POST https://<your-worker>.workers.dev/ingest
```

Response:

```json
{ "instanceId": "abc123..." }
```

All other routes and methods return `404`.

## Tradeoffs

- **7-day window stored per run** — Open-Meteo returns 7 days of forecasts. All rows are stored on each run; the unique constraint on `forecast_date` silently skips dates already present, keeping the table consistent without deletes.
- **Workflow steps are retryable** — each step is independently re-executed by the Workflow runtime on failure, so the fetch and the DB write are each atomic and idempotent.