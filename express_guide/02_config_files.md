# ⚙️ Configuration Files

## tsconfig.json

```json
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
        "noImplicitAny": true,
        "strictNullChecks": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "baseUrl": "./src",
        "paths": {
            "@/*": ["./*"],
            "@config/*": ["config/*"],
            "@routes/*": ["routes/*"],
            "@controllers/*": ["controllers/*"],
            "@services/*": ["services/*"],
            "@middleware/*": ["middleware/*"],
            "@utils/*": ["utils/*"],
            "@schemas/*": ["schemas/*"],
            "@types/*": ["types/*"]
        }
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist", "tests", "prisma"]
}
```

---

## .eslintrc.json

```json
{
    "root": true,
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 2022,
        "sourceType": "module",
        "project": "./tsconfig.json"
    },
    "plugins": ["@typescript-eslint", "prettier"],
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:prettier/recommended"
    ],
    "rules": {
        "prettier/prettier": "error",
        "@typescript-eslint/explicit-function-return-type": "warn",
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        "@typescript-eslint/no-explicit-any": "warn",
        "no-console": ["warn", { "allow": ["warn", "error"] }]
    },
    "env": {
        "node": true,
        "es2022": true,
        "jest": true
    },
    "ignorePatterns": ["dist", "node_modules", "coverage"]
}
```

---

## .prettierrc

```json
{
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2,
    "useTabs": false,
    "bracketSpacing": true,
    "arrowParens": "always",
    "endOfLine": "lf"
}
```

---

## .env.example

```env
# =============================================================================
# Server Configuration
# =============================================================================
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

# =============================================================================
# Database (PostgreSQL)
# =============================================================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/express_api?schema=public

# =============================================================================
# JWT Configuration
# =============================================================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# =============================================================================
# CORS
# =============================================================================
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# =============================================================================
# Rate Limiting
# =============================================================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX_REQUESTS=10

# =============================================================================
# Logging
# =============================================================================
LOG_LEVEL=debug
```

---

## .gitignore

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Environment files
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/

# Prisma
prisma/*.db
prisma/*.db-journal

# Misc
*.tgz
.cache
```

---

## src/config/index.ts

```typescript
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Helper function to get required env variable
const getEnvVar = (key: string, defaultValue?: string): string => {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

// Helper function to get number env variable
const getEnvNumber = (key: string, defaultValue: number): number => {
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
};

// Helper function to get boolean env variable
const getEnvBoolean = (key: string, defaultValue: boolean): boolean => {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === "true";
};

export const config = {
    // Server
    env: getEnvVar("NODE_ENV", "development"),
    port: getEnvNumber("PORT", 5000),
    host: getEnvVar("HOST", "0.0.0.0"),
    isProduction: getEnvVar("NODE_ENV", "development") === "production",
    isDevelopment: getEnvVar("NODE_ENV", "development") === "development",

    // Database
    databaseUrl: getEnvVar("DATABASE_URL"),

    // JWT
    jwt: {
        secret: getEnvVar("JWT_SECRET"),
        accessTokenExpiresIn: getEnvVar("JWT_ACCESS_TOKEN_EXPIRES_IN", "15m"),
        refreshTokenExpiresIn: getEnvVar("JWT_REFRESH_TOKEN_EXPIRES_IN", "7d"),
    },

    // CORS
    cors: {
        origins: getEnvVar("CORS_ORIGINS", "http://localhost:3000")
            .split(",")
            .map((origin) => origin.trim()),
    },

    // Rate Limiting
    rateLimit: {
        windowMs: getEnvNumber("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000), // 15 minutes
        maxRequests: getEnvNumber("RATE_LIMIT_MAX_REQUESTS", 100),
        authMaxRequests: getEnvNumber("RATE_LIMIT_AUTH_MAX_REQUESTS", 10),
    },

    // Logging
    log: {
        level: getEnvVar("LOG_LEVEL", "info"),
    },
} as const;

export type Config = typeof config;
```
