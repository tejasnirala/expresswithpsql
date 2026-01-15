# 🐳 DevOps (Docker, Testing, CI/CD)

## Dockerfile

```dockerfile
# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install ALL dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# =============================================================================
# Stage 3: Runner (Production)
# =============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy necessary files from builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Set ownership
RUN chown -R expressjs:nodejs /app
USER expressjs

# Environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

# Start command
CMD ["node", "dist/index.js"]
```

---

## docker-compose.yml

```yaml
version: "3.9"

services:
    # ==========================================================================
    # Application
    # ==========================================================================
    app:
        build:
            context: .
            dockerfile: Dockerfile
        container_name: express-api
        restart: unless-stopped
        ports:
            - "${PORT:-5000}:5000"
        environment:
            - NODE_ENV=${NODE_ENV:-development}
            - PORT=5000
            - DATABASE_URL=postgresql://postgres:${DB_PASSWORD:-password}@db:5432/${DB_NAME:-express_api}?schema=public
            - JWT_SECRET=${JWT_SECRET:-dev-secret-change-in-production}
            - JWT_ACCESS_TOKEN_EXPIRES_IN=${JWT_ACCESS_TOKEN_EXPIRES_IN:-15m}
            - JWT_REFRESH_TOKEN_EXPIRES_IN=${JWT_REFRESH_TOKEN_EXPIRES_IN:-7d}
            - CORS_ORIGINS=${CORS_ORIGINS:-http://localhost:3000}
        depends_on:
            db:
                condition: service_healthy
        networks:
            - app-network

    # ==========================================================================
    # PostgreSQL Database
    # ==========================================================================
    db:
        image: postgres:16-alpine
        container_name: express-db
        restart: unless-stopped
        ports:
            - "${DB_PORT:-5432}:5432"
        environment:
            - POSTGRES_USER=postgres
            - POSTGRES_PASSWORD=${DB_PASSWORD:-password}
            - POSTGRES_DB=${DB_NAME:-express_api}
        volumes:
            - postgres_data:/var/lib/postgresql/data
        healthcheck:
            test: ["CMD-SHELL", "pg_isready -U postgres"]
            interval: 10s
            timeout: 5s
            retries: 5
        networks:
            - app-network

networks:
    app-network:
        driver: bridge

volumes:
    postgres_data:
```

---

## jest.config.ts

```typescript
import type { Config } from "jest";

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests"],
    testMatch: ["**/*.test.ts"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@config/(.*)$": "<rootDir>/src/config/$1",
        "^@routes/(.*)$": "<rootDir>/src/routes/$1",
        "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
        "^@services/(.*)$": "<rootDir>/src/services/$1",
        "^@middleware/(.*)$": "<rootDir>/src/middleware/$1",
        "^@utils/(.*)$": "<rootDir>/src/utils/$1",
        "^@schemas/(.*)$": "<rootDir>/src/schemas/$1",
    },
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
    collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/index.ts", "!src/types/**"],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
    verbose: true,
    testTimeout: 10000,
};

export default config;
```

---

## tests/setup.ts

```typescript
import { prisma } from "../src/db/prisma";

// Increase timeout for integration tests
jest.setTimeout(30000);

// Clean up before all tests
beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();
});

// Clean up after each test
afterEach(async () => {
    // Clean up test data (optional - use transactions instead for speed)
});

// Disconnect after all tests
afterAll(async () => {
    await prisma.$disconnect();
});
```

---

## tests/integration/health.test.ts

```typescript
import request from "supertest";
import { createApp } from "../../src/app";
import { Express } from "express";

describe("Health Routes", () => {
    let app: Express;

    beforeAll(() => {
        app = createApp();
    });

    describe("GET /api/v1/health", () => {
        it("should return healthy status", async () => {
            const response = await request(app).get("/api/v1/health").expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe("healthy");
        });
    });
});
```

---

## .github/workflows/ci.yml

```yaml
name: CI

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main]

jobs:
    # ===========================================================================
    # Lint & Type Check
    # ===========================================================================
    lint:
        name: Lint & Type Check
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: "20"
                  cache: "npm"

            - name: Install dependencies
              run: npm ci

            - name: Generate Prisma Client
              run: npx prisma generate

            - name: Lint
              run: npm run lint

            - name: Type Check
              run: npm run typecheck

    # ===========================================================================
    # Test
    # ===========================================================================
    test:
        name: Test
        runs-on: ubuntu-latest
        needs: lint

        services:
            postgres:
                image: postgres:16-alpine
                env:
                    POSTGRES_USER: postgres
                    POSTGRES_PASSWORD: testpassword
                    POSTGRES_DB: test_db
                ports:
                    - 5432:5432
                options: >-
                    --health-cmd pg_isready
                    --health-interval 10s
                    --health-timeout 5s
                    --health-retries 5

        env:
            DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/test_db?schema=public
            JWT_SECRET: test-jwt-secret-for-ci
            NODE_ENV: test

        steps:
            - uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: "20"
                  cache: "npm"

            - name: Install dependencies
              run: npm ci

            - name: Generate Prisma Client
              run: npx prisma generate

            - name: Run migrations
              run: npx prisma migrate deploy

            - name: Run tests
              run: npm run test:coverage

            - name: Upload coverage
              uses: codecov/codecov-action@v3
              with:
                  files: ./coverage/lcov.info

    # ===========================================================================
    # Build
    # ===========================================================================
    build:
        name: Build
        runs-on: ubuntu-latest
        needs: test
        steps:
            - uses: actions/checkout@v4

            - name: Setup Node.js
              uses: actions/setup-node@v4
              with:
                  node-version: "20"
                  cache: "npm"

            - name: Install dependencies
              run: npm ci

            - name: Generate Prisma Client
              run: npx prisma generate

            - name: Build
              run: npm run build

            - name: Upload build artifacts
              uses: actions/upload-artifact@v4
              with:
                  name: dist
                  path: dist/
```
