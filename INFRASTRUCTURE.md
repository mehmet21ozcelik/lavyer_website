# Server Infrastructure & Migration Guide

This document provides a technical log of the infrastructure setup performed on the current server and instructions for migrating the application to a new environment.

## 1. Server Prerequisites (What was installed)
The target server must have the following components installed and running:

| Component | Minimum Version | Note |
|-----------|-----------------|------|
| **Ubuntu/Linux OS** | 22.04+ (Recommended) | Current: Ubuntu (Hostinger VPS) |
| **Docker Engine** | 24.0.0+ | Mandatory for containerization |
| **Docker Compose** | V2.x+ | Mandatory for orchestration |
| **Git** | - | To pull code from repository |
| **OpenSSL** | 1.1 or 3.0 | Required for Prisma DB engine |

## 2. Security Configuration (What was performed)
To allow deployment without using the `root` user for every command, we performed:

1. **User Creation**: A dedicated user `mcp-admin` was used.
2. **Permission Grant**: Added user to docker group:
   ```bash
   sudo usermod -aG docker mcp-admin
   ```
3. **SSH Access**: Configured public key authentication in `~/.ssh/authorized_keys`.

## 3. Deployment Steps (Migration Workflow)

To set up this application on a **brand new server**, follow these steps exactly:

### Step A: Clone & Environment Setup
```bash
git clone https://github.com/mehmet21ozcelik/lavyer_website.git
cd lavyer_website
# Create your .env file
nano .env
```

**Required Environment Variables Checklist:**
| Variable | Description | Example/Note |
|----------|-------------|--------------|
| `DATABASE_URL` | Prisma DB connection string | `postgresql://user:pass@db:5432/db?schema=public` |
| `POSTGRES_USER` | DB engine username | Must match `DATABASE_URL` |
| `POSTGRES_PASSWORD`| DB engine password | Strong password recommended |
| `POSTGRES_DB` | DB name | e.g., `lavyer_db` |
| `JWT_SECRET` | Secret for admin auth | Generate: `openssl rand -base64 32` |
| `NEXT_TELEMETRY_DISABLED` | Privacy | Set to `1` |

### Step B: Build & Launch Containers
```bash
docker compose up -d --build
```

### Step C: Database Sync & Migration Strategy
Depending on your scenario, use one of the two commands below:

1. **Initial Setup (Brand New DB)**:
   ```bash
   docker compose exec app npx prisma db push
   ```
   *Synchronizes schema immediately. Best for first-time setup.*

2. **Production Updates (Schema Changes)**:
   ```bash
   docker compose exec app npx prisma migrate deploy
   ```
   *Safely applies migrations without data loss. Recommended for live system updates.*

### Step D: Admin User Creation
```bash
docker compose cp scripts/create-admin.js app:/app/create-admin.js
docker compose exec app node /app/create-admin.js
```

## 4. Backup & Data Migration (Moving to a new server)

If you are migrating from an existing server, you must move the **Volumes** to keep your data and uploaded images.

### A. Database Backup (PostgreSQL)
Run this on the **old** server:
```bash
docker compose exec db pg_dump -U [POSTGRES_USER] [POSTGRES_DB] > backup.sql
```

### B. Uploaded Files (Persistence)
The uploaded media is stored in the `public/uploads` directory inside the container and mapped to a local volume or folder. Ensure you backup:
- **Prisma Volume**: `postgres_data` (managed by Docker)
- **Uploads Folder**: `./public/uploads` (if using local storage mapping)

### C. Restore on New Server
1. Move `backup.sql` and `public/uploads` content to the new server.
2. Initialize Docker Compose using Step B.
3. Import the SQL backup:
   ```bash
   cat backup.sql | docker exec -i [CONTAINER_ID_DB] psql -U [USER] -d [DB_NAME]
   ```

## 5. Reverse Proxy Setup (Nginx Proxy Manager)

This application uses **Nginx Proxy Manager (NPM)** as the central reverse proxy. The application itself does not expose port `3000` directly to the host machine. Instead, it is securely connected to a shared Docker network named `web-network`.

### Setting up Nginx Proxy Manager (if not present)
1. Install NPM in an independent directory on the server (e.g., `~/npm`).
2. Create the external docker network so NPM and the project can communicate:
   ```bash
   docker network create web-network
   ```
3. Make sure the NPM instance is connected to the same `web-network`.

### Routing Traffic to This Project
Our `docker-compose.yml` is already configured to attach the `app` container to `web-network`.
After deploying the project (`docker compose up -d`), open your NPM Admin Panel (usually on port 81):

1. Go to **Hosts > Proxy Hosts** and click **Add Proxy Host**.
2. **Domain Names:** `lavyer.com`
3. **Forward Hostname / IP:** `app`
4. **Forward Port:** `3000`
5. **Block Common Exploits:** Enable.
6. **SSL Tab:** Select "Request a new SSL Certificate", check "Force SSL" and save.


## 6. Verification Checklist
- [ ] `curl http://localhost/api/health` returns 200 OK.
- [ ] Admin panel accessible at `/admin/login`.
- [ ] Image uploads are persistent (volume check).
- [ ] Database is healthy (`docker compose ps` shows `healthy`).
