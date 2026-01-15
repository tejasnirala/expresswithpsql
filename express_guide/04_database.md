# 🗄️ Database (Prisma)

## Initialize Prisma

```bash
npx prisma init
```

---

## prisma/schema.prisma

```prisma
// =============================================================================
// Prisma Schema Configuration
// =============================================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =============================================================================
// Models
// =============================================================================

/// User model - stores user account information
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  username      String    @unique
  passwordHash  String    @map("password_hash")
  firstName     String?   @map("first_name")
  lastName      String?   @map("last_name")
  isActive      Boolean   @default(true) @map("is_active")
  isVerified    Boolean   @default(false) @map("is_verified")
  role          Role      @default(USER)
  lastLoginAt   DateTime? @map("last_login_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  refreshTokens RefreshToken[]

  @@map("users")
}

/// RefreshToken model - stores refresh tokens for JWT authentication
model RefreshToken {
  id          String   @id @default(uuid())
  token       String   @unique
  userId      String   @map("user_id")
  expiresAt   DateTime @map("expires_at")
  isRevoked   Boolean  @default(false) @map("is_revoked")
  createdAt   DateTime @default(now()) @map("created_at")

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

// =============================================================================
// Enums
// =============================================================================

enum Role {
  USER
  ADMIN
  SUPER_ADMIN
}
```

---

## prisma/seed.ts

```typescript
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
    console.log("🌱 Starting database seed...");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 12);
    const admin = await prisma.user.upsert({
        where: { email: "admin@example.com" },
        update: {},
        create: {
            email: "admin@example.com",
            username: "admin",
            passwordHash: adminPassword,
            firstName: "Admin",
            lastName: "User",
            role: Role.ADMIN,
            isVerified: true,
        },
    });

    console.log(`✅ Created admin user: ${admin.email}`);

    // Create test user
    const userPassword = await bcrypt.hash("user123", 12);
    const user = await prisma.user.upsert({
        where: { email: "user@example.com" },
        update: {},
        create: {
            email: "user@example.com",
            username: "testuser",
            passwordHash: userPassword,
            firstName: "Test",
            lastName: "User",
            role: Role.USER,
            isVerified: true,
        },
    });

    console.log(`✅ Created test user: ${user.email}`);

    console.log("🎉 Database seed completed!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
```

---

## Database Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create and run migrations (development)
npx prisma migrate dev --name init

# Deploy migrations (production)
npx prisma migrate deploy

# Seed the database
npx prisma db seed

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database (caution: drops all data)
npx prisma migrate reset
```

---

## src/db/prisma.ts (Prisma Client Instance)

```typescript
import { PrismaClient } from "@prisma/client";
import { config } from "../config/index.js";
import { logger } from "../utils/logger.js";

// Create Prisma client with logging
const prismaClientSingleton = (): PrismaClient => {
    return new PrismaClient({
        log: config.isDevelopment
            ? [
                  { emit: "event", level: "query" },
                  { emit: "stdout", level: "info" },
                  { emit: "stdout", level: "warn" },
                  { emit: "stdout", level: "error" },
              ]
            : ["error"],
    });
};

// Prevent multiple instances in development (hot reload)
declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (config.isDevelopment) {
    globalThis.prismaGlobal = prisma;
}

// Log queries in development
if (config.isDevelopment) {
    prisma.$on("query" as never, (e: { query: string; duration: number }) => {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Duration: ${e.duration}ms`);
    });
}

// Graceful shutdown
process.on("beforeExit", async () => {
    await prisma.$disconnect();
});
```
