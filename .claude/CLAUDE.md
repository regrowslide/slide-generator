# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-tenant Next.js application with multiple sub-applications (KM, TBM, SBM, Hakobun, Training, etc.) sharing a common codebase. Uses Next.js 15 App Router with React Server Components, Prisma ORM with multi-schema support, NextAuth for authentication, and Tailwind CSS for styling.

## Key Commands

### Development
```bash
npm run dev                 # Start dev server with Turbo (auto-runs convert script)
npm run convert             # Convert Prisma schemas to JSON (required before dev)
npm run build               # Generate Prisma client and build for production
npm run start               # Start production server
npm run local-start         # Start local production server
```

### Code Quality
```bash
npm run lint                # Run ESLint on all TypeScript files
npm run fix                 # Auto-fix ESLint and Prettier issues
npm run format              # Format all files with Prettier
```

### Database & Seeding
```bash
prisma generate             # Generate Prisma client from schemas
npm run seedKM              # Seed KM app data
npm run seedLifeOS          # Seed LifeOS data
```

### Utility Scripts
```bash
npm run filter              # Include search directory filtering
npm run upload              # Prepare Vercel upload
npm run generateType        # Generate TypeScript interfaces from Prisma
```

## Architecture

### Directory Structure

**Path Aliases** (tsconfig.json):
- `@prisma/*` → `prisma/schema/*`
- `@app/*` → `src/app/*`
- `@cm/*` → `src/cm/*` (common modules)
- `@shadcn/*` → `src/cm/shadcn/*`

**Common Resources** (`/src/cm`):
- `/class` - Business logic classes (Model + "Cl" suffix, e.g., `UserCl.ts`)
- `/components` - Shared UI components
- `/hooks` - Custom hooks (`useGlobal`, `useModal`, `useBasicForm`)
- `/lib` - Utility functions and shared logic
- `/types` - Shared TypeScript types
- `/styles` - Global styles and SCSS
- `/providers` - React context providers
- `/shadcn` - shadcn/ui components

**App-Specific Structure** (`/src/app/(apps)/[appName]/`):
- `/(pages)` - Feature-based routes
- `/components` - App-specific components
- `/hooks` - App-specific hooks
- `/lib` - App-specific logic
- `/types` - App-specific types
- `/_actions` - Server Actions (CRUD operations)

**Available Apps**:
- `KM` - Main portfolio/services site
- `tbm` - Transport/logistics management
- `hakobun` - Document management
- `training` - Workout/fitness tracking
- `keihi` - Expense management
- `compas`, `kickswrap`, `image-captioner`, `tmp` - Other utilities

### Multi-Schema Prisma Setup

Prisma uses a **multi-schema architecture** where schemas are split by domain:

**Schema Files** (`prisma/schema/*.prisma`):
- `schema.prisma` - Core models (User, Department, RoleMaster, etc.)
- `KM.prisma` - KM app models
- `tbm.prisma` - Transport management models
- `sbm.prisma` - Reservation/booking models
- `hakobun.prisma` - Document models
- `training.prisma` - Workout/exercise models
- `keihi.prisma` - Expense models
- Others: `stock.prisma`, `counseling.prisma`, `portal.prisma`, `aidocument.prisma`, `teamSynapse.prisma`

**Build Process**:
1. `npm run convert` - Combines all `.prisma` files, generates DMMF, exports to `src/cm/lib/methods/scheme-json-export.js`
2. `prisma generate` - Generates Prisma client to `prisma/schema/generated/prisma`
3. Generated client is imported from `@prisma/generated/prisma/client`

**Standard Model Fields**:
All models should include:
- `id: Int @id @default(autoincrement())`
- `createdAt: DateTime @default(now())`
- `updatedAt: DateTime? @updatedAt`
- `sortOrder: Float @default(0)`

**Date Handling**:
- Date fields end with `At` suffix (e.g., `publishedAt`, `hiredAt`)
- Store dates in UTC (day-only dates at 00:00:00 UTC = 15:00:00 JST)
- Use `toUTC` helper function for date conversions

### Server Components Pattern

**Page Component Flow** (from ai-agent-direction.md):

1. **Session & Auth**: Use `initServerComopnent({query})` to get session and scopes
2. **URL State Management**: Extract filters/params from `props.searchParams`
3. **Redirect Logic**: Validate required params (e.g., date filters), redirect if missing using `dateSwitcherTemplate()`
4. **Data Fetching**: Call Server Actions with `where`, `orderBy`, `take`, `skip` params
5. **Props to Client**: Pass fetched data to Client Component

**Example**:
```tsx
// app/(apps)/sbm/(pages)/reservations/page.tsx
export default async function Page(props) {
  const query = await props.searchParams
  const {session, scopes} = await initServerComopnent({query})

  const {redirectPath, whereQuery} = await dateSwitcherTemplate({
    query,
    defaultWhere: { /* ... */ }
  })
  if (redirectPath) return <Redirector redirectPath={redirectPath} />

  const data = await getReservations({where: whereQuery})
  return <ReservationClient reservations={data} />
}
```

### Server Actions Convention

**File Naming**: `[model-name]-actions.ts` (kebab-case)

**Function Order**: C → R → U → D (Create, Read, Update, Delete)

**Read Functions**:
- Accept `where`, `orderBy`, `take`, `skip` parameters
- Use `include` for related data by default (only use `select` for performance optimization)
- Base filters on URL query parameters

**Write Functions**:
- Implement `upsert` when create/update logic is similar
- Split into separate `create` and `update` when complex

**Search UX**: Use confirmation buttons, not `onChange` for search execution

### Business Logic Classes

**Pattern**: `[ModelName]Cl.ts` with class `[ModelName]Cl`

**Structure**:
```typescript
export type UserClData = User & { posts: Post[] }

export class UserCl {
  data: UserClData
  static readonly MIN_AGE = 20  // Constants as static properties

  constructor(userData: UserClData) {
    this.data = userData
  }

  get fullName(): string {  // Computed properties with no args
    return `${this.data.firstName} ${this.data.lastName}`
  }

  hasPostsAfter(date: Date): boolean {  // Methods with args
    return this.data.posts.some(post => post.createdAt > date)
  }
}
```

### Common Hooks

**`useGlobal`**:
- `toggleLoad(callback)` - Show loading UI during async operations
- `query, addQuery` - URL parameter get/set
- `session` - User info (e.g., `session.id` for userId)

**`useModal`**:
```tsx
const UserEditModalReturn = useModal()

// Open modal
UserEditModalReturn.handleOpen({userId})

// Close modal
UserEditModalReturn.handleClose()

// Render modal
<UserEditModalReturn.Modal>
  <UserEditForm onUpdate={() => UserEditModalReturn.handleClose()} />
</UserEditModalReturn.Modal>
```

**`useBasicForm`**:
- Creates simple forms with automatic field rendering
- `forSelect` + `id: "modelId"` auto-generates select from Prisma model
- Use `Fields` class for column definitions

### UI/UX Guidelines

**Display Method Selection**:
- **Modal** - Simple info display/edit, maintains context
- **Page Navigation** - Complex details, multi-step flows (needs URL)
- **Toast** - Non-blocking result notifications
- **`window.alert`** - Simple confirmations only

**Design Principles**:
- Minimize features, prioritize speed and simplicity
- Keep UI intuitive and uncluttered

## Coding Standards

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase, match component name | `UserEditModal.tsx` |
| Server Action files | kebab-case, model prefix | `user-actions.ts` |
| Class files | PascalCase, model + "Cl" suffix | `UserCl.ts` |
| RSC→Client components | PascalCase, "Client" or "CC" suffix | `ReservationClient.tsx` |
| Date fields | camelCase, "At" suffix | `publishedAt`, `hiredAt` |

### Code Style

- **Functions**: Always use arrow functions (`const func = () => {}`)
- **Types**: No `any` types - use strict TypeScript types
- **Prisma Types**: Use generated types from `@prisma/generated/prisma/client`
- **Component-Oriented**: Design for reusability and loose coupling

### Relations & Foreign Keys

- **Relation name**: PascalCase of target model (e.g., `Post Post[]`)
- **Foreign key**: camelCase of model + "Id" (e.g., `userId`)

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for migrations)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` - NextAuth configuration
- `NEXT_PUBLIC_BASEPATH`, `NEXT_PUBLIC_ROOTPATH` - Path configuration
- `AWS_*` - S3 file storage credentials
- `OPENAI_API_KEY` - OpenAI API access
- `GOOGLE_*` - Google services (Maps, OAuth, Sheets, Gemini)
- `SMTP_*` - Email configuration

## Additional Documentation

Detailed coding guidelines and architecture decisions are documented in:
- `src/cm/ai-docs/ai-agent-direction.md` - Comprehensive development guide (Japanese)
