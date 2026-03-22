# Scorpanion

Web companion for board game sessions: pick a game, create a session, track players and round scores, and browse your history. The UI is a React single-page app; persistence and APIs are provided by an ASP.NET Core backend with PostgreSQL.

## Stack

| Area | Technologies |
|------|----------------|
| **Frontend** | React 19, TypeScript, Vite 8, Redux Toolkit, React Router 7, Tailwind CSS 4, Radix / shadcn-style UI |
| **Backend** | ASP.NET Core 8, Entity Framework Core, Npgsql |
| **Database** | PostgreSQL |

## Repository layout

- `backend/Scorpanion/` — .NET solution (`Scorpanion.API`, `Scorpanion.DAL`)
- `frontend/` — Vite + React app (`pnpm`)

## Prerequisites

- [.NET SDK 8](https://dotnet.microsoft.com/download/dotnet/8.0) (see `backend/Scorpanion/global.json`)
- [Node.js](https://nodejs.org/) 24+ (as used in CI; newer LTS generally works)
- [pnpm](https://pnpm.io/) 10
- [PostgreSQL](https://www.postgresql.org/) reachable from your machine

## Backend

From `backend/Scorpanion`:

```bash
dotnet restore Scorpanion.sln
dotnet run --project Scorpanion.API
```

- **Swagger** (Development): [http://localhost:5234/swagger](http://localhost:5234/swagger) when using the `http` launch profile (`launchSettings.json`).
- **Database**: set `ConnectionStrings:ScorpanionDbContext` in `Scorpanion.API/appsettings.Development.json` (or user secrets / environment) to a valid Npgsql connection string. Example shape:

  `Host=localhost;Port=5432;Database=scorpanion;Username=…;Password=…`

- **Migrations**: the API applies EF Core migrations automatically on startup.
- **CORS**: for local development, `Cors:AllowedOrigins` in `appsettings.Development.json` includes the Vite dev server (`http://localhost:5173`). Adjust for other origins or production.

## Frontend

From `frontend`:

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Set `VITE_API_BASE_URL` to the API base URL with no trailing slash, e.g. `http://localhost:5234` (match the scheme and port your API uses).

```bash
pnpm install
pnpm dev
```

The dev server defaults to [http://localhost:5173](http://localhost:5173).

```bash
pnpm build    # production build
pnpm lint     # ESLint
```

Production builds use the Vite `base` path `/scorpanion/` for GitHub Pages project sites (see `frontend/vite.config.ts`). Local `pnpm dev` uses `/`.

## Continuous integration

- **Backend** (`.github/workflows/backend-ci.yml`): restore and build the solution on pushes and pull requests to `main` when `backend/**` changes.
- **Frontend** (`.github/workflows/frontend-cicd.yml`): install with pnpm, lint, build, and deploy static assets to GitHub Pages. Configure the `VITE_API_BASE_URL` repository variable for the build so the SPA points at your deployed API.
