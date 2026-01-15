# Express TypeScript API

A production-ready Express.js REST API built with TypeScript, featuring authentication, authorization, and best practices.

## 🚀 Features

- **TypeScript** - Full type safety with strict mode
- **Express 5.x** - Latest Express with modern features
- **Prisma ORM** - Type-safe database access with PostgreSQL
- **JWT Authentication** - Access and refresh token flow
- **Role-Based Access Control** - User, Admin, Super Admin roles
- **Zod Validation** - Request validation with type inference
- **Rate Limiting** - Protect against abuse
- **Winston Logging** - Structured logging with multiple transports
- **Swagger Documentation** - Auto-generated API docs
- **Docker Ready** - Multi-stage Dockerfile and Compose
- **CI/CD Pipeline** - GitHub Actions workflow
- **Testing** - Jest with Supertest for integration tests

## 📋 Prerequisites

- Node.js 20+
- pnpm (recommended) or npm/yarn
- PostgreSQL 16+
- Docker (optional)

## 🛠️ Quick Start

### 1. Clone and Install

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm exec prisma generate
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your database credentials
```

### 3. Database Setup

```bash
# Run migrations
pnpm run db:migrate

# Seed the database (optional)
pnpm run db:seed
```

### 4. Start Development Server

```bash
pnpm run dev
```

The server will start at `http://localhost:5000`

## 📚 API Documentation

When running in development mode, Swagger documentation is available at:

- **Swagger UI**: `http://localhost:5000/api-docs`

## 🔑 API Endpoints

### Health Check

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| GET    | `/api/v1/health`       | Basic health check      |
| GET    | `/api/v1/health/ready` | Readiness check with DB |

### Authentication

| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| POST   | `/api/v1/auth/register` | Register new user    |
| POST   | `/api/v1/auth/login`    | Login user           |
| POST   | `/api/v1/auth/logout`   | Logout user          |
| POST   | `/api/v1/auth/refresh`  | Refresh access token |
| GET    | `/api/v1/auth/me`       | Get current user     |

### Users (Protected)

| Method | Endpoint            | Description            |
| ------ | ------------------- | ---------------------- |
| GET    | `/api/v1/users`     | List all users (Admin) |
| GET    | `/api/v1/users/:id` | Get user by ID         |
| PATCH  | `/api/v1/users/:id` | Update user            |
| DELETE | `/api/v1/users/:id` | Delete user (Admin)    |

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run with coverage
pnpm run test:coverage

# Watch mode
pnpm run test:watch
```

## 🐳 Docker

### Development with Docker Compose

```bash
# Start all services (app + database)
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

### Production Build

```bash
# Build image
docker build -t express-api .

# Run container
docker run -p 5000:5000 --env-file .env express-api
```

## 📁 Project Structure

```
├── src/
│   ├── index.ts                    # Entry point
│   ├── app.ts                      # Express app factory
│   ├── config/                     # Configuration
│   ├── controllers/                # Request handlers
│   ├── db/                         # Database client
│   ├── middleware/                 # Express middleware
│   ├── routes/                     # API routes
│   ├── schemas/                    # Zod validation schemas
│   ├── services/                   # Business logic
│   ├── types/                      # TypeScript types
│   └── utils/                      # Utilities
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Seed script
├── tests/
│   ├── setup.ts                    # Test setup
│   └── integration/                # Integration tests
├── .github/workflows/              # CI/CD
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 📝 Scripts

| Script            | Description                 |
| ----------------- | --------------------------- |
| `pnpm dev`        | Start development server    |
| `pnpm build`      | Build for production        |
| `pnpm start`      | Start production server     |
| `pnpm typecheck`  | Type check without emitting |
| `pnpm lint`       | Run ESLint                  |
| `pnpm lint:fix`   | Fix ESLint issues           |
| `pnpm format`     | Format with Prettier        |
| `pnpm test`       | Run tests                   |
| `pnpm db:migrate` | Run database migrations     |
| `pnpm db:seed`    | Seed the database           |
| `pnpm db:studio`  | Open Prisma Studio          |

## 🔒 Default Users

After seeding, you can login with:

| Email             | Password | Role  |
| ----------------- | -------- | ----- |
| admin@example.com | admin123 | ADMIN |
| user@example.com  | user123  | USER  |

## 📄 License

MIT
