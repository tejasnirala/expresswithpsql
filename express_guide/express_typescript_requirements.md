# 🚀 Express (TypeScript) Backend Server Requirements

> **Production-Ready Backend Server Configuration Guide**
>
> This document outlines the requirements and structure for building a production-ready backend server using **Express.js with TypeScript**, equivalent to the Flask/PostgreSQL implementation in this repository.

---

## 📊 Feature Comparison Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    FLASK vs EXPRESS (TYPESCRIPT) EQUIVALENTS                    │
├────────────────────────┬─────────────────────────┬──────────────────────────────┤
│ Category               │ Flask (Python)          │ Express (TypeScript)         │
├────────────────────────┼─────────────────────────┼──────────────────────────────┤
│ Framework              │ Flask                   │ Express.js                   │
│ Language               │ Python                  │ TypeScript                   │
│ ORM                    │ SQLAlchemy              │ Prisma / TypeORM / Drizzle   │
│ Database               │ PostgreSQL              │ PostgreSQL                   │
│ Validation             │ Pydantic                │ Zod / Joi                    │
│ API Docs               │ flask-openapi3          │ Swagger (swagger-jsdoc)      │
│ Authentication         │ Flask-JWT-Extended      │ jsonwebtoken + passport      │
│ Rate Limiting          │ Flask-Limiter           │ express-rate-limit           │
│ CORS                   │ flask-cors              │ cors                         │
│ Environment Variables  │ python-dotenv           │ dotenv                       │
│ Testing                │ pytest                  │ Jest / Vitest                │
│ Production Server      │ Gunicorn                │ PM2 / Node.js Cluster        │
│ Migrations             │ Flask-Migrate (Alembic) │ Prisma Migrate / TypeORM     │
│ Code Quality           │ black, isort, flake8    │ ESLint, Prettier             │
│ Type Checking          │ mypy                    │ TypeScript (built-in)        │
└────────────────────────┴─────────────────────────┴──────────────────────────────┘
```

---

## 📁 Recommended Project Structure

```
express-typescript-backend/
│
├── src/
│   ├── index.ts                    # Entry point (like run.py)
│   ├── app.ts                      # Express app factory (like app/__init__.py)
│   ├── config/
│   │   ├── index.ts                # Configuration manager (like config.py)
│   │   ├── database.ts             # Database configuration
│   │   └── constants.ts            # Application constants
│   │
│   ├── routes/
│   │   ├── index.ts                # Route aggregator
│   │   └── v1/
│   │       ├── index.ts            # v1 router (like routes/v1/__init__.py)
│   │       ├── user.routes.ts      # User routes
│   │       ├── auth.routes.ts      # Auth routes
│   │       └── health.routes.ts    # Health check routes
│   │
│   ├── controllers/
│   │   ├── user.controller.ts      # Request handlers
│   │   └── auth.controller.ts
│   │
│   ├── services/
│   │   ├── user.service.ts         # Business logic (like services/)
│   │   └── auth.service.ts
│   │
│   ├── models/                     # OR prisma/schema.prisma
│   │   ├── index.ts                # Model exports
│   │   ├── user.model.ts           # User model
│   │   └── base.model.ts           # Base model with common fields
│   │
│   ├── schemas/                    # Request/Response validation
│   │   ├── user.schema.ts          # Zod schemas for user
│   │   ├── auth.schema.ts          # Zod schemas for auth
│   │   └── common.schema.ts        # Shared schemas
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── validate.middleware.ts  # Request validation
│   │   ├── error.middleware.ts     # Global error handler
│   │   ├── rateLimiter.middleware.ts
│   │   └── requestLogger.middleware.ts
│   │
│   ├── utils/
│   │   ├── logger.ts               # Winston/Pino logger
│   │   ├── response.ts             # Standardized API responses
│   │   ├── errors.ts               # Custom error classes
│   │   └── helpers.ts              # Utility functions
│   │
│   ├── types/
│   │   ├── index.ts                # Type exports
│   │   ├── express.d.ts            # Express type augmentation
│   │   └── custom.types.ts         # Application types
│   │
│   └── db/
│       ├── prisma/
│       │   └── schema.prisma       # Prisma schema
│       ├── migrations/             # Database migrations
│       └── seed.ts                 # Database seeding
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   ├── routes/
│   │   └── middleware/
│   ├── fixtures/
│   └── setup.ts                    # Test configuration
│
├── docs/                           # API documentation
│
├── .env                            # Environment variables
├── .env.example                    # Example env file
├── .gitignore
├── .eslintrc.json                  # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── .husky/                         # Git hooks
├── jest.config.ts                  # Jest configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 🔧 Core Dependencies

### Production Dependencies

```json
{
    "dependencies": {
        // Core Framework
        "express": "^4.18.x",

        // TypeScript Runtime
        "typescript": "^5.x",

        // Database (Choose ONE ORM)
        "prisma": "^5.x", // RECOMMENDED - Type-safe, modern
        "@prisma/client": "^5.x",
        // OR
        "typeorm": "^0.3.x", // More traditional, class-based

        // Validation
        "zod": "^3.x", // RECOMMENDED - TypeScript-first
        // OR
        "joi": "^17.x", // More established, flexible

        // Authentication
        "jsonwebtoken": "^9.x",
        "bcryptjs": "^2.x",
        "passport": "^0.7.x",
        "passport-jwt": "^4.x",

        // Middleware
        "cors": "^2.x",
        "helmet": "^7.x", // Security headers
        "express-rate-limit": "^7.x",
        "compression": "^1.x",
        "morgan": "^1.x", // HTTP request logger

        // Utilities
        "dotenv": "^16.x",
        "uuid": "^9.x",
        "date-fns": "^3.x", // Date utilities

        // Logging
        "winston": "^3.x", // Production logging
        // OR
        "pino": "^8.x", // Faster alternative

        // API Documentation
        "swagger-jsdoc": "^6.x",
        "swagger-ui-express": "^5.x",
        // OR
        "@tsoa/runtime": "^6.x", // TypeScript-first OpenAPI

        // Production Server
        "pm2": "^5.x" // Process manager
    }
}
```

### Development Dependencies

```json
{
    "devDependencies": {
        // TypeScript
        "@types/node": "^20.x",
        "@types/express": "^4.x",
        "@types/jsonwebtoken": "^9.x",
        "@types/bcryptjs": "^2.x",
        "@types/passport": "^1.x",
        "@types/passport-jwt": "^4.x",
        "@types/cors": "^2.x",
        "@types/compression": "^1.x",
        "@types/morgan": "^1.x",
        "@types/swagger-jsdoc": "^6.x",
        "@types/swagger-ui-express": "^4.x",
        "ts-node": "^10.x",
        "tsx": "^4.x", // Fast TypeScript execution
        "tsconfig-paths": "^4.x",

        // Development Server
        "nodemon": "^3.x",

        // Testing
        "jest": "^29.x",
        "@types/jest": "^29.x",
        "ts-jest": "^29.x",
        "supertest": "^6.x",
        "@types/supertest": "^6.x",

        // Code Quality
        "eslint": "^8.x",
        "@typescript-eslint/eslint-plugin": "^7.x",
        "@typescript-eslint/parser": "^7.x",
        "prettier": "^3.x",
        "eslint-config-prettier": "^9.x",
        "eslint-plugin-prettier": "^5.x",

        // Git Hooks
        "husky": "^9.x",
        "lint-staged": "^15.x"
    }
}
```

---

## 📋 Configuration Checklist

### 1️⃣ Project Initialization

-   [ ] Initialize with `npm init -y` or `pnpm init`
-   [ ] Install TypeScript: `npm install -D typescript @types/node`
-   [ ] Create `tsconfig.json` with strict mode enabled
-   [ ] Configure path aliases (e.g., `@/`, `@services/`, `@routes/`)
-   [ ] Set up build scripts in `package.json`

### 2️⃣ TypeScript Configuration (`tsconfig.json`)

```jsonc
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "lib": ["ES2022"],
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "baseUrl": "./src",
        "paths": {
            "@/*": ["./*"],
            "@config/*": ["config/*"],
            "@routes/*": ["routes/*"],
            "@controllers/*": ["controllers/*"],
            "@services/*": ["services/*"],
            "@models/*": ["models/*"],
            "@middleware/*": ["middleware/*"],
            "@utils/*": ["utils/*"],
            "@types/*": ["types/*"]
        }
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "tests"]
}
```

### 3️⃣ Environment Variables (`.env`)

```env
# =============================================================================
# Server Configuration
# =============================================================================
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# =============================================================================
# Database
# =============================================================================
DATABASE_URL=postgresql://user:password@localhost:5432/dbname?schema=public

# =============================================================================
# JWT Configuration
# =============================================================================
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRES=15m
JWT_REFRESH_TOKEN_EXPIRES=7d

# =============================================================================
# CORS
# =============================================================================
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# =============================================================================
# Rate Limiting
# =============================================================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# =============================================================================
# Logging
# =============================================================================
LOG_LEVEL=debug
LOG_FORMAT=dev
```

### 4️⃣ Express App Factory (`src/app.ts`)

-   [ ] Create Express application instance
-   [ ] Configure middleware stack in correct order:
    1. `helmet()` - Security headers
    2. `cors()` - CORS configuration
    3. `compression()` - Response compression
    4. `express.json()` - Body parser
    5. `express.urlencoded()` - URL encoded parser
    6. `morgan()` or custom logger - Request logging
    7. Rate limiter - Before routes
    8. Routes - API endpoints
    9. 404 handler - After routes
    10. Global error handler - Last

### 5️⃣ Database Setup (Prisma recommended)

-   [ ] Initialize Prisma: `npx prisma init`
-   [ ] Define schema in `prisma/schema.prisma`
-   [ ] Configure base model with common fields:
    -   `id` (UUID)
    -   `createdAt`
    -   `updatedAt`
    -   `isActive`
-   [ ] Generate Prisma client: `npx prisma generate`
-   [ ] Set up migrations: `npx prisma migrate dev`
-   [ ] Create seed script: `npx prisma db seed`

### 6️⃣ Authentication System

-   [ ] Implement password hashing with bcrypt
-   [ ] Configure JWT strategy with Passport.js or custom middleware
-   [ ] Create access & refresh token flow
-   [ ] Implement token blacklisting (Redis recommended)
-   [ ] Add token refresh endpoint
-   [ ] Protect routes with auth middleware

### 7️⃣ Validation Layer (Zod)

-   [ ] Define request schemas (body, params, query)
-   [ ] Create validation middleware
-   [ ] Implement error formatting for validation failures
-   [ ] TypeScript type inference from schemas

### 8️⃣ API Documentation (Swagger/OpenAPI)

-   [ ] Install swagger-jsdoc and swagger-ui-express
-   [ ] Configure Swagger options
-   [ ] Add JSDoc annotations to routes
-   [ ] Serve Swagger UI at `/api-docs`
-   [ ] Generate OpenAPI spec

### 9️⃣ Error Handling

-   [ ] Create custom error classes:
    -   `AppError` (base class)
    -   `ValidationError`
    -   `AuthenticationError`
    -   `AuthorizationError`
    -   `NotFoundError`
    -   `ConflictError`
-   [ ] Implement global error handler middleware
-   [ ] Standardize error response format

### 🔟 Logging System

-   [ ] Configure Winston or Pino logger
-   [ ] Set up log levels based on environment
-   [ ] Add request ID tracking
-   [ ] Configure log rotation for production
-   [ ] Add structured logging with metadata

### 1️⃣1️⃣ Testing Setup

-   [ ] Configure Jest for TypeScript
-   [ ] Set up test database
-   [ ] Create test utilities and fixtures
-   [ ] Write unit tests for services
-   [ ] Write integration tests for routes
-   [ ] Configure code coverage reporting

### 1️⃣2️⃣ Code Quality & Pre-commit

-   [ ] Configure ESLint for TypeScript
-   [ ] Set up Prettier for formatting
-   [ ] Install and configure Husky
-   [ ] Set up lint-staged for pre-commit checks
-   [ ] Add commit message linting (commitlint)

### 1️⃣3️⃣ Docker Setup

-   [ ] Create multi-stage Dockerfile
-   [ ] Configure docker-compose.yml:
    -   App service
    -   PostgreSQL service
    -   Redis service (for sessions/rate limiting)
-   [ ] Add `.dockerignore`
-   [ ] Create production docker-compose

### 1️⃣4️⃣ CI/CD Pipeline (GitHub Actions)

-   [ ] Lint check job
-   [ ] Type check job
-   [ ] Test job with coverage
-   [ ] Build job
-   [ ] Security scanning (npm audit)
-   [ ] Deployment job

---

## 📦 NPM Scripts (`package.json`)

```json
{
    "scripts": {
        // Development
        "dev": "tsx watch src/index.ts",
        "dev:debug": "tsx watch --inspect src/index.ts",

        // Build
        "build": "tsc",
        "start": "node dist/index.js",
        "start:prod": "pm2 start ecosystem.config.js",

        // Database
        "db:generate": "prisma generate",
        "db:migrate": "prisma migrate dev",
        "db:migrate:prod": "prisma migrate deploy",
        "db:seed": "prisma db seed",
        "db:studio": "prisma studio",
        "db:reset": "prisma migrate reset",

        // Testing
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage",
        "test:e2e": "jest --config jest.e2e.config.ts",

        // Code Quality
        "lint": "eslint src --ext .ts",
        "lint:fix": "eslint src --ext .ts --fix",
        "format": "prettier --write \"src/**/*.ts\"",
        "format:check": "prettier --check \"src/**/*.ts\"",
        "typecheck": "tsc --noEmit",

        // Pre-commit
        "prepare": "husky install",

        // Combined
        "validate": "npm run typecheck && npm run lint && npm run test",
        "clean": "rm -rf dist coverage"
    }
}
```

---

## 🔒 Security Checklist

### Authentication & Authorization

-   [ ] Use strong password hashing (bcrypt with salt rounds ≥ 12)
-   [ ] Implement JWT with short-lived access tokens (15-30 min)
-   [ ] Use refresh token rotation
-   [ ] Store tokens securely (httpOnly cookies for web)
-   [ ] Implement token blacklisting for logout

### API Security

-   [ ] Enable Helmet.js for security headers
-   [ ] Configure CORS properly (no wildcard `*` in production)
-   [ ] Implement rate limiting on all endpoints
-   [ ] Stricter rate limiting on auth endpoints
-   [ ] Input validation on all endpoints
-   [ ] Sanitize user inputs
-   [ ] Prevent SQL injection (use parameterized queries / ORM)

### Environment & Secrets

-   [ ] Never commit secrets to git
-   [ ] Use `.env.example` for documentation
-   [ ] Rotate secrets regularly
-   [ ] Use different secrets per environment

### Headers & Cookies

-   [ ] Set secure cookie flags in production
-   [ ] Implement CSRF protection if using cookies
-   [ ] Configure CSP headers appropriately

---

## 🌐 Production Deployment Checklist

### Pre-deployment

-   [ ] All tests passing
-   [ ] No TypeScript errors
-   [ ] No ESLint errors
-   [ ] Dependencies audited (`npm audit`)
-   [ ] Environment variables configured
-   [ ] Database migrations ready

### Server Configuration

-   [ ] Use PM2 or similar for process management
-   [ ] Configure clustering for multi-core utilization
-   [ ] Set up health check endpoint
-   [ ] Configure reverse proxy (Nginx)
-   [ ] Enable HTTPS (SSL/TLS)
-   [ ] Set up log aggregation

### Monitoring

-   [ ] Application performance monitoring (APM)
-   [ ] Error tracking (Sentry, etc.)
-   [ ] Health checks and uptime monitoring
-   [ ] Database monitoring
-   [ ] Log monitoring and alerting

---

## 📊 Architecture Comparison Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         REQUEST FLOW COMPARISON                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│   FLASK (Current Repo)              EXPRESS (TypeScript)                      │
│   ─────────────────────             ──────────────────────                    │
│                                                                               │
│   Request                           Request                                   │
│       │                                 │                                     │
│       ▼                                 ▼                                     │
│   Flask App (WSGI)                  Express App                               │
│       │                                 │                                     │
│       ▼                                 ▼                                     │
│   Middleware:                       Middleware:                               │
│   - CORS                            - helmet()                                │
│   - Rate Limiter                    - cors()                                  │
│   - Request Logger                  - compression()                           │
│       │                             - express.json()                          │
│       ▼                             - morgan()                                │
│   Blueprint Router                  - rateLimiter()                           │
│   (Versioned: /api/v1)                  │                                     │
│       │                                 ▼                                     │
│       ▼                             Express Router                            │
│   Route Handler                     (Versioned: /api/v1)                      │
│   (@api.get/post...)                    │                                     │
│       │                                 ▼                                     │
│       ▼                             Controller                                │
│   Pydantic Validation               (Route Handler)                           │
│   (Request Schema)                      │                                     │
│       │                                 ▼                                     │
│       ▼                             Zod Validation                            │
│   Service Layer                     (Middleware)                              │
│   (Business Logic)                      │                                     │
│       │                                 ▼                                     │
│       ▼                             Service Layer                             │
│   SQLAlchemy Model                  (Business Logic)                          │
│   (Database Access)                     │                                     │
│       │                                 ▼                                     │
│       ▼                             Prisma Client                             │
│   PostgreSQL                        (Database Access)                         │
│       │                                 │                                     │
│       ▼                                 ▼                                     │
│   Response                          PostgreSQL                                │
│   (StandardResponse)                    │                                     │
│                                         ▼                                     │
│                                     Response                                  │
│                                     (Standardized)                            │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Recommended Learning Resources

### Express.js

-   [Express.js Official Documentation](https://expressjs.com/)
-   [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### TypeScript

-   [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
-   [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Prisma

-   [Prisma Official Docs](https://www.prisma.io/docs)
-   [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

### Zod

-   [Zod Documentation](https://zod.dev/)

### Testing

-   [Jest Documentation](https://jestjs.io/docs/getting-started)
-   [Supertest for API Testing](https://github.com/ladjs/supertest)

---

## ✅ Summary: What Makes It Production-Ready?

| Aspect             | Requirement                              |
| ------------------ | ---------------------------------------- |
| **Type Safety**    | TypeScript with strict mode              |
| **Validation**     | Zod schemas for all inputs               |
| **Security**       | Helmet, CORS, rate limiting, JWT         |
| **Architecture**   | Layered: Routes → Controllers → Services |
| **Database**       | Prisma with migrations                   |
| **Logging**        | Structured logging (Winston/Pino)        |
| **Testing**        | Jest with unit + integration tests       |
| **Documentation**  | OpenAPI/Swagger                          |
| **Code Quality**   | ESLint, Prettier, Husky                  |
| **CI/CD**          | GitHub Actions pipeline                  |
| **Docker**         | Multi-stage builds, docker-compose       |
| **Monitoring**     | Health checks, APM, error tracking       |
| **Error Handling** | Centralized, standardized responses      |

---

> **Last Updated:** 2026-01-15
>
> **Purpose:** This document serves as a requirements blueprint for building an Express (TypeScript) backend server equivalent to this Flask repository.
