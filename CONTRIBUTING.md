# Contributing Guide

Thank you for your interest in contributing! This document outlines the Git workflow and guidelines for contributing to this project.

---

## 🌿 Branch Strategy

We use a **Git Flow** branching model:

```
main (production)
  ↑
stage (staging/pre-production)
  ↑
dev (development/integration)
  ↑
feature/*, fix/*, hotfix/* (your working branches)
```

### Protected Branches

The following branches are **protected** and cannot be pushed to directly:

| Branch  | Purpose                 |
| ------- | ----------------------- |
| `main`  | Production-ready code   |
| `stage` | Pre-production testing  |
| `dev`   | Development integration |

### Branch Naming Conventions

Always create branches from `dev` using these prefixes:

| Prefix      | Use Case                  | Example                       |
| ----------- | ------------------------- | ----------------------------- |
| `feature/`  | New features              | `feature/user-authentication` |
| `fix/`      | Bug fixes                 | `fix/login-validation`        |
| `hotfix/`   | Critical production fixes | `hotfix/security-patch`       |
| `docs/`     | Documentation             | `docs/api-readme`             |
| `refactor/` | Code refactoring          | `refactor/auth-service`       |
| `test/`     | Adding tests              | `test/user-controller`        |
| `chore/`    | Maintenance tasks         | `chore/update-dependencies`   |

---

## 📝 Commit Message Convention

We follow **[Conventional Commits](https://www.conventionalcommits.org/)** specification.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                                       |
| ---------- | ------------------------------------------------- |
| `feat`     | New feature                                       |
| `fix`      | Bug fix                                           |
| `docs`     | Documentation changes                             |
| `style`    | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code refactoring (no functional changes)          |
| `perf`     | Performance improvements                          |
| `test`     | Adding or updating tests                          |
| `build`    | Build system or dependency changes                |
| `ci`       | CI/CD configuration changes                       |
| `chore`    | Other changes (maintenance tasks)                 |
| `revert`   | Reverts a previous commit                         |

### Examples

```bash
# Feature
feat(auth): add jwt refresh token endpoint

# Bug fix
fix(validation): correct email regex pattern

# Documentation
docs(readme): add installation instructions

# With scope
feat(api): add rate limiting to auth endpoints

# With breaking change
feat(auth)!: change token expiration format

BREAKING CHANGE: Token expiration is now in seconds instead of milliseconds
```

### Using Commitizen (Recommended)

For guided commit messages, use:

```bash
pnpm commit
```

This will launch an interactive prompt to help you create properly formatted commit messages.

---

## 🔄 Workflow

### 1. Start a New Feature

```bash
# Ensure dev is up to date
git checkout dev
git pull origin dev

# Create your feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

```bash
# Make your changes
# Stage files
git add .

# Commit with conventional commit message
pnpm commit
# OR
git commit -m "feat(scope): your message"
```

### 3. Push Your Branch

```bash
git push origin feature/your-feature-name
```

### 4. Create Pull Request

1. Go to GitHub
2. Create a Pull Request from your branch to `dev`
3. Fill in the PR template
4. Request review from team members

### 5. After Merge

```bash
# Switch back to dev
git checkout dev
git pull origin dev

# Delete your local feature branch
git branch -d feature/your-feature-name
```

---

## ✅ Pre-commit Checks

The following checks run automatically before each commit:

1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **TypeScript** - Type checking

### Pre-push Checks

Before pushing, the following is checked:

1. **Branch protection** - Cannot push directly to `main`, `stage`, or `dev`

### Commit Message Validation

All commit messages are validated against the Conventional Commits specification using **commitlint**.

---

## 🛠️ Development Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

---

## 📋 Pull Request Guidelines

### PR Title

Follow the same format as commit messages:

```
feat(auth): add password reset functionality
```

### PR Description

Include:

- **What** - What changes were made
- **Why** - Why these changes were needed
- **How** - How the changes work
- **Testing** - How to test the changes
- **Screenshots** - If applicable

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated if needed
- [ ] All tests pass
- [ ] No new warnings introduced

---

## 🚀 Release Process

1. Merge all approved PRs into `dev`
2. Create PR from `dev` to `stage`
3. Test on staging environment
4. Create PR from `stage` to `main`
5. Tag release with version number

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

## 🆘 Need Help?

- Check the [Architecture Guide](./docs/ARCHITECTURE.md)
- Review existing code for patterns
- Ask in the team chat

Happy coding! 🎉
