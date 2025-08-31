# DBT Diary Card Dashboard - Implementation Plan

## Project Overview

A web-based DBT (Dialectical Behavior Therapy) diary card application that follows standard DBT diary card format for daily mood, behavior, and skills tracking with database persistence and analytics.

### Goals
- Replicate traditional paper DBT diary cards in digital format
- Track emotions, urges/behaviors, and DBT skills daily
- Provide insights through data visualization
- Export functionality for therapy sessions
- Mobile-responsive design for daily use

## Technology Stack (T3 Stack)

- **Next.js 14**: Full-stack React framework with App Router
- **TypeScript**: End-to-end type safety
- **Prisma**: Type-safe ORM with PostgreSQL
- **tRPC**: Type-safe API routes
- **NextAuth.js**: Authentication system
- **Tailwind CSS**: Utility-first styling
- **React Hook Form**: Form management
- **Zod**: Runtime validation
- **Chart.js/Recharts**: Data visualization

## Database Schema (Prisma)

### Core Models

```prisma
model User {
  id            String       @id @default(cuid())
  email         String       @unique
  name          String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  diaryEntries  DiaryEntry[]
  
  @@map("users")
}

model DiaryEntry {
  id              String          @id @default(cuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  entryDate       DateTime        @db.Date
  notes           String?
  emotionRatings  EmotionRating[]
  urgesBehaviors  UrgeBehavior[]
  skillsUsed      SkillUsed[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@unique([userId, entryDate])
  @@map("diary_entries")
}

model EmotionRating {
  id          String      @id @default(cuid())
  entryId     String
  entry       DiaryEntry  @relation(fields: [entryId], references: [id], onDelete: Cascade)
  emotion     EmotionType
  rating      Int         @db.SmallInt // 0-10 scale
  
  @@unique([entryId, emotion])
  @@map("emotion_ratings")
}

model UrgeBehavior {
  id          String      @id @default(cuid())
  entryId     String
  entry       DiaryEntry  @relation(fields: [entryId], references: [id], onDelete: Cascade)
  urgeType    UrgeType
  intensity   Int         @db.SmallInt // 0-5 scale
  actedOn     Boolean     @default(false)
  
  @@unique([entryId, urgeType])
  @@map("urge_behaviors")
}

model SkillUsed {
  id          String      @id @default(cuid())
  entryId     String
  entry       DiaryEntry  @relation(fields: [entryId], references: [id], onDelete: Cascade)
  skillId     String
  skill       DBTSkill    @relation(fields: [skillId], references: [id])
  used        Boolean     @default(true)
  
  @@unique([entryId, skillId])
  @@map("skills_used")
}

model DBTSkill {
  id          String        @id @default(cuid())
  module      SkillModule
  name        String
  description String?
  skillsUsed  SkillUsed[]
  
  @@map("dbt_skills")
}

// Enums
enum EmotionType {
  SADNESS
  ANGER
  FEAR
  SHAME
  JOY
  PRIDE
  LOVE
  GUILT
  ANXIETY
  DISGUST
}

enum UrgeType {
  SELF_HARM
  SUBSTANCE_USE
  BINGE_EATING
  RESTRICTING
  ISOLATING
  LASHING_OUT
  RUMINATING
}

enum SkillModule {
  MINDFULNESS
  DISTRESS_TOLERANCE
  EMOTION_REGULATION
  INTERPERSONAL_EFFECTIVENESS
}
```

## API Design (tRPC Routers)

### Diary Router (`server/api/routers/diary.ts`)

```typescript
export const diaryRouter = createTRPCRouter({
  // Create or update diary entry for a specific date
  upsert: protectedProcedure
    .input(createDiaryEntrySchema)
    .mutation(({ ctx, input }) => { /* implementation */ }),

  // Get diary entry by date
  getByDate: protectedProcedure
    .input(z.object({ date: z.date() }))
    .query(({ ctx, input }) => { /* implementation */ }),

  // Get entries for date range
  getRange: protectedProcedure
    .input(z.object({ 
      startDate: z.date(), 
      endDate: z.date() 
    }))
    .query(({ ctx, input }) => { /* implementation */ }),

  // Get recent entries
  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().default(7) }))
    .query(({ ctx, input }) => { /* implementation */ }),

  // Delete entry
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => { /* implementation */ }),
});
```

### Analytics Router (`server/api/routers/analytics.ts`)

```typescript
export const analyticsRouter = createTRPCRouter({
  // Emotion trends over time
  getEmotionTrends: protectedProcedure
    .input(z.object({ 
      startDate: z.date(), 
      endDate: z.date(),
      emotions: z.array(z.nativeEnum(EmotionType)).optional()
    }))
    .query(({ ctx, input }) => { /* implementation */ }),

  // Skills usage frequency
  getSkillsUsage: protectedProcedure
    .input(z.object({ 
      startDate: z.date(), 
      endDate: z.date() 
    }))
    .query(({ ctx, input }) => { /* implementation */ }),

  // Urge patterns analysis
  getUrgePatterns: protectedProcedure
    .input(z.object({ 
      startDate: z.date(), 
      endDate: z.date() 
    }))
    .query(({ ctx, input }) => { /* implementation */ }),

  // Weekly summary
  getWeeklySummary: protectedProcedure
    .input(z.object({ weekStart: z.date() }))
    .query(({ ctx, input }) => { /* implementation */ }),
});
```

### Skills Router (`server/api/routers/skills.ts`)

```typescript
export const skillsRouter = createTRPCRouter({
  // Get all DBT skills grouped by module
  getAll: publicProcedure
    .query(({ ctx }) => { /* implementation */ }),

  // Get skills by module
  getByModule: publicProcedure
    .input(z.object({ module: z.nativeEnum(SkillModule) }))
    .query(({ ctx, input }) => { /* implementation */ }),
});
```

## Component Architecture

### Core Components

```
src/components/
├── diary-card/
│   ├── DiaryCardForm.tsx          // Main form container
│   ├── EmotionSliders.tsx         // 0-10 emotion ratings
│   ├── UrgeTracker.tsx           // Urge intensity + acted on
│   ├── SkillsCheckList.tsx       // Skills by module
│   ├── NotesSection.tsx          // Free text notes
│   └── FormActions.tsx           // Save/cancel buttons
├── calendar/
│   ├── CalendarView.tsx          // Month view with indicators
│   ├── WeekView.tsx              // 7-day grid layout
│   ├── DayCell.tsx               // Individual day component
│   └── EntryModal.tsx            // Quick view/edit modal
├── dashboard/
│   ├── DashboardLayout.tsx       // Main dashboard container
│   ├── EmotionChart.tsx          // Line chart for emotions
│   ├── SkillsFrequency.tsx       // Bar chart for skills
│   ├── UrgeHeatmap.tsx          // Heatmap for urge patterns
│   ├── WeeklySummary.tsx        // Week overview cards
│   └── ExportOptions.tsx        // PDF/CSV export
├── layout/
│   ├── Layout.tsx                // Main app layout
│   ├── Navigation.tsx            // Navigation bar
│   ├── Sidebar.tsx               // Mobile sidebar
│   └── Footer.tsx                // App footer
└── ui/
    ├── Button.tsx                // Reusable button
    ├── Input.tsx                 // Form inputs
    ├── Modal.tsx                 // Modal component
    ├── LoadingSpinner.tsx        // Loading states
    └── ErrorBoundary.tsx         // Error handling
```

## Page Structure

```
src/pages/
├── index.tsx                     // Today's diary card entry
├── calendar.tsx                  // Monthly calendar view
├── week/
│   └── [date].tsx               // Weekly view (dynamic route)
├── dashboard.tsx                // Analytics dashboard
├── export.tsx                   // Export/sharing options
├── profile.tsx                  // User profile settings
└── auth/
    ├── signin.tsx               // Sign in page
    └── signup.tsx               // Registration page
```

## Implementation Timeline

### Phase 1: Foundation (Days 1-2)
**Day 1:**
- [ ] Initialize T3 app with all required packages
- [ ] Configure PostgreSQL database (local + production)
- [ ] Set up Prisma schema with all models
- [ ] Configure NextAuth with Google/email providers

**Day 2:**
- [ ] Create database seed script for DBT skills
- [ ] Set up basic layout components
- [ ] Configure Tailwind with custom design tokens
- [ ] Set up testing infrastructure (Jest, RTL, Playwright)

### Phase 2: API Layer (Days 3-4)
**Day 3:**
- [ ] Implement diary tRPC router with all procedures
- [ ] Add input validation schemas with Zod
- [ ] Create database queries with Prisma
- [ ] Write unit tests for diary procedures

**Day 4:**
- [ ] Implement analytics tRPC router
- [ ] Implement skills tRPC router
- [ ] Add error handling and logging
- [ ] Write integration tests for API layer

### Phase 3: Core Forms (Days 5-6)
**Day 5:**
- [ ] Build DiaryCardForm with React Hook Form
- [ ] Create EmotionSliders component with validation
- [ ] Build UrgeTracker with checkbox/slider combo
- [ ] Implement auto-save functionality

**Day 6:**
- [ ] Build SkillsCheckList grouped by module
- [ ] Add NotesSection with character limit
- [ ] Implement form submission with optimistic updates
- [ ] Add success/error feedback

### Phase 4: Views & Navigation (Days 7-8)
**Day 7:**
- [ ] Create CalendarView with entry indicators
- [ ] Build WeekView with 7-day grid layout
- [ ] Implement navigation between dates
- [ ] Add quick entry modal from calendar

**Day 8:**
- [ ] Optimize for mobile responsiveness
- [ ] Add keyboard navigation support
- [ ] Implement loading states and skeletons
- [ ] Add accessibility features (ARIA labels, focus management)

### Phase 5: Analytics & Features (Days 9-10)
**Day 9:**
- [ ] Build EmotionChart with Chart.js
- [ ] Create SkillsFrequency bar chart
- [ ] Implement UrgeHeatmap visualization
- [ ] Build WeeklySummary dashboard cards

**Day 10:**
- [ ] Add PDF export functionality
- [ ] Implement CSV data export
- [ ] Add sharing capabilities (email, link)
- [ ] Final testing and bug fixes
- [ ] Performance optimization

## Testing Strategy

### Unit Tests
- [ ] tRPC procedure testing with mock database
- [ ] Component testing with React Testing Library
- [ ] Utility function testing
- [ ] Form validation testing

### Integration Tests
- [ ] Database operations with test database
- [ ] API route testing with supertest
- [ ] Authentication flow testing

### End-to-End Tests
- [ ] Complete diary entry workflow
- [ ] Calendar navigation and entry viewing
- [ ] Dashboard analytics viewing
- [ ] Export functionality

## Deployment Plan

### Development Environment
- [ ] Docker Compose with PostgreSQL
- [ ] Environment variables setup
- [ ] Hot reloading configuration

### Production Deployment
- [ ] Vercel deployment configuration
- [ ] PlanetScale database setup (or Railway PostgreSQL)
- [ ] Environment variables configuration
- [ ] Domain and SSL setup

### Monitoring & Analytics
- [ ] Error tracking with Sentry
- [ ] Performance monitoring
- [ ] User analytics (privacy-compliant)

## Security Considerations

- [ ] Input validation on all forms
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting on API routes
- [ ] Data encryption at rest
- [ ] Secure session management

## Future Enhancements

### Phase 2 Features
- [ ] Reminder notifications (email/push)
- [ ] Data visualization improvements
- [ ] Therapist sharing portal
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Offline support with PWA

### Advanced Features
- [ ] Machine learning insights
- [ ] Pattern recognition alerts
- [ ] Integration with wearable devices
- [ ] Voice notes functionality
- [ ] Collaborative features (therapist access)

## File Structure

```
dbt-diary-card/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   └── trpc/
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── index.tsx
│   │   ├── calendar.tsx
│   │   └── dashboard.tsx
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/
│   │   │   │   ├── diary.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   └── skills.ts
│   │   │   ├── root.ts
│   │   │   └── trpc.ts
│   │   ├── auth.ts
│   │   └── db.ts
│   ├── components/
│   │   ├── diary-card/
│   │   ├── calendar/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   └── ui/
│   ├── utils/
│   │   ├── api.ts
│   │   ├── schemas.ts
│   │   └── constants.ts
│   ├── styles/
│   │   └── globals.css
│   └── types/
├── public/
├── tests/
│   ├── __mocks__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .gitignore
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── docker-compose.yml
├── playwright.config.ts
├── jest.config.js
└── README.md
```

## Getting Started Commands

```bash
# Initialize project
npm create t3-app@latest dbt-diary-card
cd dbt-diary-card

# Install additional dependencies
npm install @hookform/resolvers react-hook-form date-fns
npm install -D @types/jest jest @testing-library/react @testing-library/jest-dom

# Set up database
npm run db:push
npm run db:seed

# Start development
npm run dev
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dbt_diary"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

*This document serves as the single source of truth for the DBT Diary Card Dashboard implementation. Update as needed during development.*