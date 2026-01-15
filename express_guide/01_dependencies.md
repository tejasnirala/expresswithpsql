# 📦 Dependencies

## Installation Commands

```bash
# Initialize project
npm init -y

# Production dependencies
npm install express cors helmet compression morgan dotenv uuid \
  jsonwebtoken bcryptjs \
  zod \
  @prisma/client \
  winston \
  swagger-jsdoc swagger-ui-express \
  express-rate-limit

# Development dependencies
npm install -D typescript ts-node tsx nodemon \
  @types/node @types/express @types/cors @types/compression \
  @types/morgan @types/jsonwebtoken @types/bcryptjs @types/uuid \
  @types/swagger-jsdoc @types/swagger-ui-express \
  prisma \
  jest ts-jest @types/jest supertest @types/supertest \
  eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  prettier eslint-config-prettier eslint-plugin-prettier \
  husky lint-staged
```

---

## package.json

```json
{
    "name": "express-typescript-api",
    "version": "1.0.0",
    "description": "Production-ready Express TypeScript API",
    "main": "dist/index.js",
    "scripts": {
        "dev": "tsx watch src/index.ts",
        "build": "tsc",
        "start": "node dist/index.js",
        "typecheck": "tsc --noEmit",
        "lint": "eslint src --ext .ts",
        "lint:fix": "eslint src --ext .ts --fix",
        "format": "prettier --write \"src/**/*.ts\"",
        "format:check": "prettier --check \"src/**/*.ts\"",
        "test": "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage",
        "db:generate": "prisma generate",
        "db:migrate": "prisma migrate dev",
        "db:migrate:prod": "prisma migrate deploy",
        "db:seed": "prisma db seed",
        "db:studio": "prisma studio",
        "db:reset": "prisma migrate reset",
        "validate": "npm run typecheck && npm run lint && npm run test",
        "prepare": "husky install"
    },
    "prisma": {
        "seed": "tsx prisma/seed.ts"
    },
    "lint-staged": {
        "*.ts": ["eslint --fix", "prettier --write"]
    },
    "engines": {
        "node": ">=20.0.0"
    },
    "keywords": ["express", "typescript", "api", "rest"],
    "license": "MIT"
}
```

---

## Dependency Purposes

### Production

| Package              | Purpose                       |
| -------------------- | ----------------------------- |
| `express`            | Web framework                 |
| `cors`               | Cross-origin resource sharing |
| `helmet`             | Security headers              |
| `compression`        | Response compression          |
| `morgan`             | HTTP request logging          |
| `dotenv`             | Environment variables         |
| `uuid`               | UUID generation               |
| `jsonwebtoken`       | JWT creation/verification     |
| `bcryptjs`           | Password hashing              |
| `zod`                | Schema validation             |
| `@prisma/client`     | Database ORM client           |
| `winston`            | Structured logging            |
| `swagger-jsdoc`      | OpenAPI spec generation       |
| `swagger-ui-express` | Swagger UI                    |
| `express-rate-limit` | Rate limiting                 |

### Development

| Package       | Purpose                     |
| ------------- | --------------------------- |
| `typescript`  | TypeScript compiler         |
| `tsx`         | Fast TS execution           |
| `nodemon`     | Auto-restart on changes     |
| `prisma`      | Prisma CLI                  |
| `jest`        | Testing framework           |
| `supertest`   | HTTP testing                |
| `eslint`      | Code linting                |
| `prettier`    | Code formatting             |
| `husky`       | Git hooks                   |
| `lint-staged` | Run linters on staged files |
