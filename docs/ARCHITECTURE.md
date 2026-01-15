# 🏗️ Architecture & Best Practices Guide

This document explains the architecture decisions, tools, and patterns used in this production-grade Express TypeScript server.

---

## 📐 Architecture Overview

We follow a **Layered Architecture** (also called N-Tier Architecture):

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT REQUEST                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     MIDDLEWARE LAYER                        │
│  ┌─────────┐ ┌────────┐ ┌──────────┐ ┌─────────────────────┐│
│  │ Helmet  │ │  CORS  │ │ Morgan   │ │ Rate Limiter       ││
│  │(Security)│ │        │ │(Logging) │ │                    ││
│  └─────────┘ └────────┘ └──────────┘ └─────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       ROUTES LAYER                          │
│                     /api/v1/auth/*                          │
│                     /api/v1/users/*                         │
│                     /api/v1/health/*                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Route-specific middleware: validate(), authenticate │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                         │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ auth.controller  │  │ user.controller  │                │
│  │                  │  │                  │                │
│  │ - Parse request  │  │ - Parse request  │                │
│  │ - Call service   │  │ - Call service   │                │
│  │ - Send response  │  │ - Send response  │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                           │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  auth.service    │  │  user.service    │                │
│  │                  │  │                  │                │
│  │ - Business logic │  │ - Business logic │                │
│  │ - JWT handling   │  │ - CRUD operations│                │
│  │ - Password hash  │  │ - Pagination     │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Prisma ORM                          │  │
│  │            (Type-safe database access)                │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   PostgreSQL                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Why This Architecture?

### **Separation of Concerns**

Each layer has ONE responsibility:

| Layer           | Responsibility                     | Files              |
| --------------- | ---------------------------------- | ------------------ |
| **Routes**      | Define endpoints, apply middleware | `routes/*.ts`      |
| **Controllers** | Handle HTTP request/response       | `controllers/*.ts` |
| **Services**    | Business logic, data manipulation  | `services/*.ts`    |
| **Database**    | Data persistence                   | `db/prisma.ts`     |

### **Benefits**

1. **Testable** - Mock one layer to test another
2. **Maintainable** - Change one layer without affecting others
3. **Scalable** - Easy to add new features
4. **Understandable** - Clear data flow

---

## 🛠️ Tools & Why We Use Them

### **Core Framework**

| Tool           | Purpose       | Why This?                                      |
| -------------- | ------------- | ---------------------------------------------- |
| **Express**    | Web framework | Most popular, huge ecosystem, simple           |
| **TypeScript** | Type safety   | Catch bugs at compile time, better IDE support |

### **Database**

| Tool           | Purpose  | Why This?                                           |
| -------------- | -------- | --------------------------------------------------- |
| **PostgreSQL** | Database | Reliable, feature-rich, industry standard           |
| **Prisma**     | ORM      | Type-safe queries, auto-generated types, migrations |

### **Security**

| Tool                   | Purpose          | What It Does                                       |
| ---------------------- | ---------------- | -------------------------------------------------- |
| **Helmet**             | HTTP headers     | Sets secure headers (XSS, clickjacking protection) |
| **CORS**               | Cross-origin     | Controls which domains can access API              |
| **bcryptjs**           | Password hashing | One-way encryption with salt                       |
| **jsonwebtoken**       | Authentication   | JWT token creation/verification                    |
| **express-rate-limit** | Rate limiting    | Prevents brute force attacks                       |

### **Validation**

| Tool    | Purpose           | Why This?                                    |
| ------- | ----------------- | -------------------------------------------- |
| **Zod** | Schema validation | TypeScript-first, infers types automatically |

### **Logging**

| Tool        | Purpose            | Why This?                                       |
| ----------- | ------------------ | ----------------------------------------------- |
| **Winston** | Structured logging | Multiple transports (console, file), log levels |
| **Morgan**  | HTTP logging       | Logs all HTTP requests                          |

### **Development**

| Tool            | Purpose      | What It Does                |
| --------------- | ------------ | --------------------------- |
| **ESLint**      | Linting      | Catches code quality issues |
| **Prettier**    | Formatting   | Consistent code style       |
| **Husky**       | Git hooks    | Runs linter before commits  |
| **lint-staged** | Staged files | Only lint changed files     |

### **Testing**

| Tool          | Purpose      | What It Does               |
| ------------- | ------------ | -------------------------- |
| **Jest**      | Test runner  | Unit and integration tests |
| **Supertest** | HTTP testing | Test API endpoints         |

### **DevOps**

| Tool               | Purpose          | What It Does                     |
| ------------------ | ---------------- | -------------------------------- |
| **Docker**         | Containerization | Consistent environments          |
| **Docker Compose** | Multi-container  | Run app + database together      |
| **GitHub Actions** | CI/CD            | Automated testing and deployment |

---

## 📁 File Structure Explained

```
src/
├── index.ts          # Entry point - starts server
├── app.ts            # Express app factory - configures middleware
│
├── config/           # Configuration
│   └── index.ts      # Environment variables, typed config
│
├── routes/           # API endpoints
│   ├── index.ts      # Route aggregator
│   └── v1/           # API versioning
│       ├── index.ts
│       ├── auth.routes.ts
│       ├── user.routes.ts
│       └── health.routes.ts
│
├── controllers/      # Request handlers
│   ├── auth.controller.ts
│   └── user.controller.ts
│
├── services/         # Business logic
│   ├── auth.service.ts    # Login, register, JWT
│   └── user.service.ts    # CRUD operations
│
├── middleware/       # Request processing
│   ├── auth.middleware.ts      # JWT verification
│   ├── validate.middleware.ts  # Zod validation
│   ├── error.middleware.ts     # Global error handler
│   └── rateLimiter.middleware.ts
│
├── schemas/          # Validation schemas
│   ├── common.schema.ts   # Shared schemas
│   ├── auth.schema.ts     # Auth-specific
│   └── user.schema.ts     # User-specific
│
├── db/               # Database
│   └── prisma.ts     # Prisma client singleton
│
├── utils/            # Utilities
│   ├── logger.ts     # Winston logger
│   ├── errors.ts     # Custom error classes
│   ├── response.ts   # Standardized responses
│   └── password.ts   # Password hashing
│
└── types/            # TypeScript types
    ├── index.ts
    └── express.d.ts  # Express augmentation
```

---

## 🔐 Security Best Practices Implemented

### 1. **Password Security**

```typescript
// Never store plain passwords
const hash = await bcrypt.hash(password, 12); // 12 rounds of salting
```

### 2. **JWT Token Security**

- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Token rotation on refresh
- Tokens stored in database for revocation

### 3. **Rate Limiting**

```typescript
// Protect against brute force
authLimiter: 10 requests per 15 minutes
generalLimiter: 100 requests per 15 minutes
```

### 4. **Input Validation**

```typescript
// Validate ALL user input with Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### 5. **Error Handling**

- Never expose stack traces in production
- Generic error messages to prevent information leakage
- All errors logged for debugging

### 6. **HTTP Security Headers (Helmet)**

- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- And more...

---

## 📊 Request Flow Example

**POST /api/v1/auth/login**

```
1. REQUEST ARRIVES
   ↓
2. GLOBAL MIDDLEWARE (app.ts)
   - helmet() → Security headers
   - cors() → CORS check
   - express.json() → Parse body
   - morgan() → Log request
   - generalLimiter → Rate limit check
   ↓
3. ROUTE MIDDLEWARE (auth.routes.ts)
   - authLimiter → Stricter rate limit
   - validate(loginSchema) → Validate body
   ↓
4. CONTROLLER (auth.controller.ts)
   - Extract data from request
   - Call service
   - Send response
   ↓
5. SERVICE (auth.service.ts)
   - Find user in database
   - Verify password
   - Generate JWT tokens
   - Return user + tokens
   ↓
6. RESPONSE
   {
     "success": true,
     "message": "Login successful",
     "data": { "user": {...}, "tokens": {...} }
   }
```

---

## 🧪 Testing Strategy

### **Unit Tests**

Test individual functions in isolation:

```typescript
// Test password hashing
test('hashPassword creates valid hash', async () => {
  const hash = await hashPassword('password');
  expect(hash).not.toBe('password');
});
```

### **Integration Tests**

Test API endpoints end-to-end:

```typescript
// Test health endpoint
test('GET /api/v1/health returns 200', async () => {
  const response = await request(app).get('/api/v1/health').expect(200);

  expect(response.body.success).toBe(true);
});
```

---

## 🚀 Production Checklist

Before deploying to production, ensure:

- [ ] **Environment variables** are set (not `.env` file)
- [ ] **DATABASE_URL** points to production database
- [ ] **JWT_SECRET** is a strong, unique secret
- [ ] **NODE_ENV=production** is set
- [ ] **CORS_ORIGINS** only includes your frontend domains
- [ ] **Rate limits** are configured appropriately
- [ ] **Logging** is configured for production (file/service)
- [ ] **HTTPS** is enabled (via reverse proxy like Nginx)
- [ ] **Database migrations** are run
- [ ] **Health checks** are monitored

---

## 📚 Further Learning

1. **Express.js** - https://expressjs.com/
2. **TypeScript** - https://www.typescriptlang.org/docs/
3. **Prisma** - https://www.prisma.io/docs/
4. **Zod** - https://zod.dev/
5. **JWT** - https://jwt.io/introduction
6. **Docker** - https://docs.docker.com/

---

> This architecture scales from small projects to medium-sized applications. For very large applications, consider microservices or a framework like NestJS.
