# Deployment Roadmap

## Phase 1: Database Migration (SQLite to PostgreSQL)
- [x] Update `prisma/schema.prisma` and switch provider to `postgresql`
- [x] Update `.env` with PostgreSQL connection string
- [ ] Update `.env.example` with correct default values

- [ ] Verify Prisma client generation

## Phase 2: GitHub Actions Setup
- [x] Create `.github/workflows/ci-cd.yml`
- [x] Add jobs for:
    - [x] Linting and Type Checking
    - [ ] Building Docker Image (Configured, but push disabled without secrets)
    - [x] Building Next.js Application
    - [ ] Running Database Migrations (Post-deployment step as per DEPLOYMENT.md)


## Phase 3: Verification
- [x] Run `prisma generate` to ensure PostgreSQL support
- [x] Validate Docker configuration consistency
- [x] Audit for any SQLite-specific code (None found)

