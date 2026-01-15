# 🚀 Express TypeScript Implementation Guide

> **Complete Build-From-Scratch Blueprint**
>
> Give this folder to Claude with an empty project directory, and it will create a production-ready Express TypeScript backend server.

---

## 📋 Quick Reference

| Aspect         | Decision                           |
| -------------- | ---------------------------------- |
| **Runtime**    | Node.js 20+                        |
| **Language**   | TypeScript 5.x (strict mode)       |
| **Framework**  | Express 4.x                        |
| **ORM**        | Prisma 5.x                         |
| **Validation** | Zod 3.x                            |
| **Auth**       | jsonwebtoken + bcryptjs            |
| **Logging**    | Winston                            |
| **Testing**    | Jest + Supertest                   |
| **API Docs**   | swagger-jsdoc + swagger-ui-express |

---

## 📁 Target Project Structure

```
project-root/
├── src/
│   ├── index.ts                    # Entry point
│   ├── app.ts                      # Express app factory
│   ├── config/
│   │   └── index.ts                # Configuration manager
│   ├── routes/
│   │   ├── index.ts                # Route aggregator
│   │   └── v1/
│   │       ├── index.ts            # v1 router
│   │       ├── auth.routes.ts
│   │       ├── user.routes.ts
│   │       └── health.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── user.service.ts
│   ├── schemas/
│   │   ├── auth.schema.ts
│   │   ├── user.schema.ts
│   │   └── common.schema.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rateLimiter.middleware.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── response.ts
│   │   ├── errors.ts
│   │   └── password.ts
│   └── types/
│       ├── index.ts
│       └── express.d.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── tests/
│   ├── setup.ts
│   ├── unit/
│   └── integration/
├── .env
├── .env.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── jest.config.ts
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔢 Build Order (Execute in Sequence)

### Phase 1: Project Initialization

1. Create project folder and initialize npm
2. Install dependencies (see `01_dependencies.md`)
3. Create configuration files (`tsconfig.json`, `.eslintrc.json`, `.prettierrc`)
4. Create `.env` and `.env.example`
5. Create `.gitignore`

### Phase 2: Core Infrastructure

6. Create `src/config/index.ts` - Configuration manager
7. Create `src/utils/logger.ts` - Winston logger
8. Create `src/utils/errors.ts` - Custom error classes
9. Create `src/utils/response.ts` - Standardized responses

### Phase 3: Database

10. Initialize Prisma: `npx prisma init`
11. Define schema in `prisma/schema.prisma`
12. Generate Prisma client
13. Create seed script

### Phase 4: Middleware

14. Create `src/middleware/error.middleware.ts`
15. Create `src/middleware/validate.middleware.ts`
16. Create `src/middleware/auth.middleware.ts`
17. Create `src/middleware/rateLimiter.middleware.ts`

### Phase 5: Schemas (Validation)

18. Create `src/schemas/common.schema.ts`
19. Create `src/schemas/auth.schema.ts`
20. Create `src/schemas/user.schema.ts`

### Phase 6: Services (Business Logic)

21. Create `src/services/auth.service.ts`
22. Create `src/services/user.service.ts`
23. Create `src/utils/password.ts`

### Phase 7: Controllers

24. Create `src/controllers/auth.controller.ts`
25. Create `src/controllers/user.controller.ts`

### Phase 8: Routes

26. Create `src/routes/v1/health.routes.ts`
27. Create `src/routes/v1/auth.routes.ts`
28. Create `src/routes/v1/user.routes.ts`
29. Create `src/routes/v1/index.ts`
30. Create `src/routes/index.ts`

### Phase 9: App Assembly

31. Create `src/app.ts` - Express app factory
32. Create `src/index.ts` - Entry point
33. Create `src/types/express.d.ts` - Type augmentation

### Phase 10: DevOps

34. Create `Dockerfile`
35. Create `docker-compose.yml`
36. Create `jest.config.ts`
37. Create test setup and sample tests

### Phase 11: Documentation

38. Create `README.md`
39. Configure Swagger documentation

---

## 📚 Guide Files

| File                 | Contents                             |
| -------------------- | ------------------------------------ |
| `00_overview.md`     | This file - overview and build order |
| `01_dependencies.md` | All npm packages and package.json    |
| `02_config_files.md` | tsconfig, eslint, prettier, env      |
| `03_core_utils.md`   | Logger, errors, response helpers     |
| `04_database.md`     | Prisma schema and configuration      |
| `05_middleware.md`   | All middleware code                  |
| `06_schemas.md`      | Zod validation schemas               |
| `07_services.md`     | Business logic layer                 |
| `08_controllers.md`  | Request handlers                     |
| `09_routes.md`       | Express routes                       |
| `10_app_entry.md`    | App factory and entry point          |
| `11_devops.md`       | Docker, testing, CI/CD               |

---

## 🎯 API Endpoints Specification

### Health Check

| Method | Endpoint         | Description  |
| ------ | ---------------- | ------------ |
| GET    | `/api/v1/health` | Health check |

### Authentication

| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| POST   | `/api/v1/auth/register` | Register new user    |
| POST   | `/api/v1/auth/login`    | Login user           |
| POST   | `/api/v1/auth/logout`   | Logout user          |
| POST   | `/api/v1/auth/refresh`  | Refresh access token |
| GET    | `/api/v1/auth/me`       | Get current user     |

### Users (Protected)

| Method | Endpoint            | Description    |
| ------ | ------------------- | -------------- |
| GET    | `/api/v1/users`     | List all users |
| GET    | `/api/v1/users/:id` | Get user by ID |
| PATCH  | `/api/v1/users/:id` | Update user    |
| DELETE | `/api/v1/users/:id` | Delete user    |

---

## ✅ Verification Checklist

After building, verify:

-   [ ] `npm run dev` starts server without errors
-   [ ] `GET /api/v1/health` returns 200
-   [ ] `POST /api/v1/auth/register` creates user
-   [ ] `POST /api/v1/auth/login` returns JWT tokens
-   [ ] Protected routes require valid JWT
-   [ ] Validation errors return 400 with details
-   [ ] `npm run lint` passes
-   [ ] `npm run typecheck` passes
-   [ ] `npm test` runs successfully

---

> **Last Updated:** 2026-01-15
