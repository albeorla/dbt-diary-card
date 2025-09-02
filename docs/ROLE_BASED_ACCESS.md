# DBT Diary Card - Role-Based Access Control (RBAC) Documentation

## Overview

The DBT Diary Card application implements a comprehensive role-based access control system with three distinct roles: **Admin**, **Manager**, and **User**. Each role has specific permissions and access to different features within the application.

## Role Hierarchy

```
Admin
  └── Manager
        └── User
```

## Role Definitions and Permissions

### 1. Admin Role

**Purpose**: Full administrative control over the organization, user management, and system-wide analytics.

**Key Features**:

- ✅ **Organization Management**
  - Create and manage the organization
  - View all organization members
  - Modify user roles (Admin/Manager/User)
- ✅ **User Management**
  - Invite users by email
  - Assign users to managers
  - Change user roles
  - View all user memberships
  - Revoke/resend invitations
- ✅ **Organization-Level Metrics**
  - View manager performance summaries (users count, entries count)
  - View all user activity summaries
  - Access organization-wide emotion trends
  - Access organization-wide skill usage statistics
  - View metrics for any time period
- ✅ **Hierarchical Management**
  - Assign managers to users
  - View manager-user relationships
  - Access any manager's user list

**Access Points**:

- `/admin/org` - Organization management dashboard
- API endpoints: `adminProcedure` protected routes

**Implemented Features** (from `src/server/api/routers/org.ts`):

- `listMembers` - View all organization members
- `setRole` - Change member roles
- `assignManager` - Assign managers to users
- `assignByEmail` - Invite users and assign roles
- `adminManagerSummary` - View manager performance metrics
- `adminUserSummary` - View user activity metrics
- `adminManagerUsers` - View users under specific managers
- `adminTrendsEmotions` - Organization-wide emotion analytics
- `adminTrendsSkills` - Organization-wide skill usage analytics

### 2. Manager Role

**Purpose**: Supervise assigned users, monitor their progress, and investigate diary entries for therapeutic support.

**Key Features**:

- ✅ **User Supervision**
  - View list of assigned users
  - Access user diary entry counts
  - View last entry dates
- ✅ **Diary Investigation**
  - View recent diary entries for assigned users
  - Access full diary entry details (emotions, urges, skills, notes)
  - Historical entry access for therapeutic review
- ✅ **Manager-Level Analytics**
  - View emotion trends for assigned users
  - View skill usage patterns for assigned users
  - Generate summaries for specific date ranges

**Access Points**:

- `/manager` - Manager dashboard
- `/manager/user/[userId]` - Individual user investigation page
- API endpoints: `managerOrAdminProcedure` protected routes

**Implemented Features** (from `src/server/api/routers/org.ts`):

- `managerUsers` - Get list of assigned users
- `managerSummary` - Get entry counts for assigned users
- `userEntriesAndLast` - View user entry statistics
- `userRecentEntries` - Access recent diary entries
- `userEntryById` - View full diary entry details
- `managerTrendsEmotions` - Emotion trends for managed users
- `managerTrendsSkills` - Skill usage for managed users

### 3. User Role

**Purpose**: Individual users tracking their DBT diary cards and viewing personal progress.

**Key Features**:

- ✅ **Diary Management**
  - Create daily diary entries (current day only)
  - View historical entries
  - Track emotions (0-10 scale)
  - Track urges and behaviors
  - Log DBT skills used
  - Add personal notes
- ✅ **Personal Analytics**
  - View emotion trends over time
  - Track skill usage frequency
  - Monitor urge patterns
  - View weekly summaries
- ✅ **Progress Tracking**
  - ✅ **Streak tracking** (consecutive days with entries)
  - Entry count statistics
  - Personal dashboard with visualizations

**Access Points**:

- `/diary` - Daily diary entry form
- `/dashboard` - Personal analytics dashboard
- API endpoints: `userProcedure` protected routes

**Implemented Features**:

- From `src/server/api/routers/diary.ts`:
  - `upsert` - Create/update daily entries
  - `getByDate` - Retrieve entries by date
  - `getRange` - Get entries for date range
  - `getRangeDetailed` - Export detailed entries
  - `getRecent` - Get recent entries
- From `src/server/api/routers/analytics.ts`:
  - `getEmotionTrends` - Personal emotion analytics
  - `getSkillsUsage` - Personal skill usage stats
  - `getUrgePatterns` - Personal urge tracking
  - `getWeeklySummary` - Weekly progress summary
- From `src/pages/dashboard.tsx`:
  - ✅ **Streak calculation** - Lines 69-90 calculate consecutive days with entries
  - Emotion charts
  - Skills frequency visualization
  - Urge heatmaps
  - Date range filtering

## Implementation Status

### ✅ Fully Implemented Features

**Admin Features**:

- Organization creation and management
- Member role assignment
- User invitation system with email integration
- Manager-user relationship management
- Organization-wide metrics and analytics
- Manager performance monitoring

**Manager Features**:

- User list management
- Diary entry investigation
- User activity monitoring
- Manager-specific analytics
- Date range filtering for reports

**User Features**:

- Daily diary card entry
- Historical entry viewing
- Personal analytics dashboard
- Streak tracking
- Emotion, urge, and skill tracking
- Export functionality

### Security Implementation

**Authentication & Authorization**:

- NextAuth.js integration for authentication
- Role-based procedure protection in TRPC:
  - `protectedProcedure` - Authenticated users only
  - `userProcedure` - Users with USER role
  - `managerOrAdminProcedure` - Managers and Admins
  - `adminProcedure` - Admins only

**Data Access Control**:

- Users can only access their own diary entries
- Managers can only access entries for assigned users
- Admins have organization-wide access
- Past diary entries cannot be edited (only current day)

## Database Schema Support

The Prisma schema fully supports the RBAC system with:

- `OrgRole` enum (ADMIN, MANAGER, USER)
- `OrgMembership` table with hierarchical relationships
- `managerId` field for manager-user assignments
- `OrgInvite` system for email invitations

## API Endpoints Summary

### Admin Endpoints

- Organization management: create, state
- Member management: listMembers, setRole, assignManager
- Invitations: assignByEmail, listInvites, resendInvite, revokeInvite
- Analytics: adminManagerSummary, adminUserSummary, adminTrendsEmotions, adminTrendsSkills

### Manager Endpoints

- User management: managerUsers, managerSummary
- Entry investigation: userEntriesAndLast, userRecentEntries, userEntryById
- Analytics: managerTrendsEmotions, managerTrendsSkills

### User Endpoints

- Diary: upsert, getByDate, getRange, getRangeDetailed, getRecent, delete
- Analytics: getEmotionTrends, getSkillsUsage, getUrgePatterns, getWeeklySummary

## Testing

The application includes comprehensive E2E tests for RBAC:

- `e2e/rbac.spec.ts` - Role-based access control tests
- `e2e/admin.org.spec.ts` - Admin functionality tests
- `e2e/manager.spec.ts` - Manager functionality tests
- `e2e/diary.spec.ts` - User diary functionality tests
- `e2e/invite.spec.ts` - Invitation system tests

## Conclusion

All specified role-based features are fully implemented and functional:

- ✅ Admin: Organization management, user invitations, role assignments, org-level metrics
- ✅ Manager: User supervision, diary investigation, manager-level analytics
- ✅ User: Diary entries, personal analytics, streak tracking

The system provides a complete hierarchical access control structure suitable for a therapeutic DBT diary card application.
