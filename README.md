# DBT Diary Card

A digital diary application built with the T3 Stack, featuring daily reflections, mood tracking, and personal insights.

[![E2E Tests](https://github.com/albeorla/dbt-diary-card/actions/workflows/e2e.yml/badge.svg)](https://github.com/albeorla/dbt-diary-card/actions/workflows/e2e.yml)

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm 11.5.2+

### Installation

1. Clone the repository:

```bash
git clone git@github.com:albeorla/dbt-diary-card.git
cd dbt-diary-card
```

2. Install dependencies:

```bash
npm ci
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your database URL and auth secrets
```

4. Set up the database:

```bash
npm run db:push
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## CI/CD Pipeline

Our GitHub Actions workflow automatically runs comprehensive checks on every push to main and pull request:

### Automated Checks

- **Format Check**: Verifies code formatting with Prettier (`npm run format:check`)
- **Type Check**: TypeScript compilation and type safety (`npm run typecheck`)
- **Lint**: ESLint code quality checks (`npm run lint`)
- **Build**: Next.js application build verification (`npm run build`)
- **E2E Tests**: Full end-to-end testing with Playwright against PostgreSQL

### Required GitHub Secrets

- `AUTH_SECRET`: NextAuth.js authentication secret
- `TEST_AUTH_SECRET`: Test authentication secret for E2E tests
- `NEXTAUTH_URL`: Authentication URL for production

### Running Checks Locally

Before pushing code, run the full check suite:

```bash
npm run format:check && npm run typecheck && npm run lint && npm run build
```

## Tech Stack

Built with the [T3 Stack](https://create.t3.gg/):

- **Framework**: [Next.js 15](https://nextjs.org) with App Router
- **Authentication**: [NextAuth.js](https://next-auth.js.org)
- **Database**: [Prisma](https://prisma.io) ORM with PostgreSQL
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + [Material-UI](https://mui.com)
- **API**: [tRPC](https://trpc.io) for type-safe APIs
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Type Safety**: [TypeScript](https://typescriptlang.org) with strict configuration
- **Form Handling**: [React Hook Form](https://react-hook-form.com) with Zod validation

## Development Guide

### Available Scripts

#### Development

- `npm run dev` - Start development server with Turbo
- `npm run dev:auto` - Start dev server with auto-detected NEXTAUTH_URL
- `npm run dev:3000` - Start on specific port 3000
- `npm run dev:3001` - Start on specific port 3001
- `npm run dev:3002` - Start on specific port 3002

#### Database

- `npm run db:generate` - Generate and apply Prisma migrations
- `npm run db:migrate` - Deploy migrations to production
- `npm run db:push` - Push schema changes (development)
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:cleanup:e2e` - Clean up E2E test users

#### Code Quality

- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type checking

#### Build & Test

- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run preview` - Build and start production server
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI

### Git Hooks

Pre-commit hooks automatically run via Husky and lint-staged:

- ESLint on TypeScript/JavaScript files
- Prettier formatting on all supported files

## Project Structure

```
├── .github/workflows/     # GitHub Actions CI/CD
├── prisma/               # Database schema and migrations
├── scripts/              # Utility scripts
├── src/
│   ├── app/             # Next.js App Router pages and API routes
│   ├── components/      # React components
│   ├── lib/            # Utility libraries and configurations
│   ├── server/         # tRPC server and API logic
│   ├── styles/         # Global styles
│   └── env.js          # Environment variable validation
├── e2e/                # Playwright E2E tests
└── playwright.config.ts # Playwright configuration
```

## Authentication

The application uses NextAuth.js with:

- Email/password authentication
- Session management
- Protected routes and API endpoints
- Test authentication endpoint for E2E tests (`/api/test-auth/signin`)

## Database

PostgreSQL database managed with Prisma:

- Type-safe database queries
- Automatic migrations
- Database seeding for development
- Connection pooling ready

## Testing

### E2E Testing with Playwright

- Tests run against a real PostgreSQL database
- Automated authentication via test endpoint
- CI runs tests with both local PostgreSQL and Neon (cloud) database options
- Test isolation with unique schemas per CI run

### Running E2E Tests Locally

```bash
# Set up test environment
export TEST_AUTH_SECRET=dev

# Run all E2E tests
npm run test:e2e

# Run with UI mode for debugging
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- e2e/auth.spec.ts
```

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
DATABASE_URL_DIRECT="${DATABASE_URL}" # For Prisma migrations

# Authentication
AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:3000" # Adjust for your domain

# Testing (E2E)
TEST_AUTH_SECRET="dev" # Secret for test authentication endpoint

# Optional
NODE_ENV="development" # or "production"
CI="true" # Set automatically in CI environments
```

## Deployment

The application is ready for deployment on platforms supporting Next.js:

1. Set up environment variables in your hosting platform
2. Ensure database is accessible from your deployment
3. Run migrations: `npm run db:migrate`
4. Build and deploy: `npm run build && npm run start`

## Contributing

1. **Fork and Clone**: Create a feature branch from `main`
2. **Install Dependencies**: `npm ci`
3. **Make Changes**: Follow existing code conventions
4. **Run Checks**: `npm run format:check && npm run typecheck && npm run lint && npm run build`
5. **Test**: Run E2E tests if relevant (`npm run test:e2e`)
6. **Commit**: Use semantic commit messages
7. **Create PR**: Use `gh pr create` with detailed description

### Code Quality Standards

- All code must pass TypeScript strict mode
- Follow Prettier formatting rules
- Pass ESLint checks
- Maintain or improve test coverage

## Resources

- [T3 Stack Documentation](https://create.t3.gg/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Playwright Documentation](https://playwright.dev/docs)

## Support

For questions or issues, please open an issue on GitHub or refer to the project documentation files:

- [LOCAL_DEV.md](./LOCAL_DEV.md) - Local development setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [NEON_MIGRATION.md](./NEON_MIGRATION.md) - Database migration guide
