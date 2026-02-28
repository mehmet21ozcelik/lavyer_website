# Deployment & Production Strategy

This document outlines the containerized deployment architecture for the Lavyer Website. 
We use a **Multi-Stage Docker** build optimized for **Next.js Standalone** production.

## 1. Environment Variables Setup
Create your `.env` file based on `.env.example`:

```bash
cp .env.example .env
```
Ensure you change `JWT_SECRET` and Postgres credentials before deployment.

## 2. Running the Infrastructure (Docker Compose)
We use `docker-compose` to orchestrate both the PostgreSQL database and the Next.js application.

```bash
docker-compose up -d --build
```

The `--build` flag ensures that the multi-stage Dockerfile is freshly compiled.

## 3. Database Migration Strategy (CRITICAL)
For safety and explicit control, **we do not run Prisma migrations inside the Docker build step.**
Instead, once your containers are up and running, you must run the migrations dynamically against the live database container.

You can execute the migration using the provided NPM scripts:

### A) Via Docker Exec
1. Find your container ID or Name: `docker ps`
2. Run the migration inside the app container:
   ```bash
   docker exec -it <container_name_or_id> npm run prisma:migrate:deploy
   ```

### B) Via Local CLI to the Container's DB Port
If your local machine has Node, you can point your local `.env`'s `DATABASE_URL` to the exposed port (`localhost:5432`) and run:
```bash
npm run prisma:migrate:deploy
```

## 4. Health Checks Check
The application auto-exposes a health check endpoint:
```bash
curl http://localhost:3000/api/health
```
If the database isn't correctly configured, it will return `status: unhealthy`. Docker-Compose also handles this via built-in health checks on the Postgres container to ensure the database is ready *before* the Node application begins hitting it.

## 5. Security Summary
- **No Root Users:** The node process runs under the `nextjs` user (`uid: 1001`).
- **Telemetry Disabled:** Next.js telemetry is globally disabled using `NEXT_TELEMETRY_DISABLED=1`.
- **Secrets Management:** Credentials and secrets are exclusively loaded via `dotenv` and docker-compose `environment`.

## 6. Optimization Rules
- **Standalone Check:** Next.js standalone mode is explicitly enabled (`output: 'standalone'`). This strips away `node_modules` dependencies entirely during the runtime phase.
- **Layer Caching:** We copy `package.json` and generate Prisma schemas in isolation before adding application code, saving massive pipeline minutes.
