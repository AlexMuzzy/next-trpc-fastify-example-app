# NextJS tRPC Fastify Example App

A modern fullstack application template demonstrating how to build a production-ready application using **Fastify**, **tRPC**, and **Next.js** in a monorepo architecture. This project showcases best practices for type-safe API development, authentication, database management, and client-server communication.

## 🏗️ Architecture Overview

This project follows a **monorepo architecture** using pnpm workspaces, with clear separation between:

- **Backend API** (`apps/server`) - Fastify server with tRPC
- **Frontend Web App** (`apps/web`) - Next.js 16 with React 19
- **Shared Packages** (`packages/`) - Shared configuration and tRPC types

### Tech Stack

**Backend:**
- [Fastify](https://www.fastify.io/) - Fast, low overhead web framework
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM for PostgreSQL
- [Better-Auth](https://www.better-auth.com/) - Modern authentication library
- [PostgreSQL](https://www.postgresql.org/) - Database

**Frontend:**
- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI library
- [TanStack Query](https://tanstack.com/query) - Data fetching and caching
- [Tailwind CSS](https://tailwindcss.com/) - Styling

**Infrastructure:**
- [pnpm](https://pnpm.io/) - Fast, disk space efficient package manager
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Docker Compose](https://docs.docker.com/compose/) - Local development database

## 📁 Project Structure

```
fullstack-app-testbench/
├── apps/
│   ├── server/                 # Fastify + tRPC backend
│   │   ├── src/
│   │   │   ├── db/            # Database schemas and configuration
│   │   │   │   ├── auth-schema.ts    # Better-Auth tables
│   │   │   │   ├── todo-schema.ts    # Application tables
│   │   │   │   └── database.ts       # Runtime database client
│   │   │   ├── lib/
│   │   │   │   └── auth.ts           # Better-Auth setup
│   │   │   ├── services/             # Business logic layer
│   │   │   │   └── todos.ts          # Todo service functions
│   │   │   ├── router.ts             # tRPC router definition
│   │   │   └── index.ts              # Fastify server entry point
│   │   ├── drizzle.config.ts         # Drizzle ORM configuration
│   │   └── package.json
│   │
│   └── web/                    # Next.js frontend
│       ├── app/                # Next.js App Router
│       │   ├── auth/           # Authentication pages
│       │   ├── providers.tsx   # React Query + tRPC providers
│       │   └── page.tsx        # Dashboard page
│       ├── lib/
│       │   └── auth/           # Better-Auth client setup
│       └── package.json
│
├── packages/
│   ├── config/                 # Shared environment configuration
│   │   └── src/
│   │       └── index.ts        # Zod-validated config
│   │
│   └── trpc/                   # Shared tRPC client setup
│       └── src/
│           ├── client.ts       # tRPC React client factory
│           └── index.ts        # Exports
│
├── docker-compose.yaml         # PostgreSQL database
├── pnpm-workspace.yaml         # pnpm workspace configuration
└── package.json                # Root package.json
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ 
- [pnpm](https://pnpm.io/installation) 8+
- [Docker](https://www.docker.com/) (for local PostgreSQL)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstack-app-testbench
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create `.env.development` in the root directory:
   ```env
   # Database
   POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/fullstack_app
   
   # Server
   PORT=4000
   HOST=0.0.0.0
   BASE_URL=http://localhost:4000
   
   # Client
   CLIENT_URL=http://localhost:3000
   CLIENT_DOMAIN=localhost
   NEXT_PUBLIC_API_URL=http://localhost:4000
   
   # Auth
   BETTER_AUTH_SECRET=your-secret-key-change-in-production
   ```

4. **Start PostgreSQL database**
   ```bash
   docker-compose up -d
   ```

5. **Initialize database schema**
   ```bash
   cd apps/server
   pnpm db:push
   ```

6. **Start development servers**
   ```bash
   # From root directory - starts both server and web app
   pnpm dev
   
   # Or start individually:
   pnpm --filter @fsapp/server dev  # Server on http://localhost:4000
   pnpm --filter @fsapp/web dev      # Next.js on http://localhost:3000
   ```

7. **Open the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - tRPC endpoint: http://localhost:4000/trpc
   - Auth endpoint: http://localhost:4000/api/auth

## 🔑 Key Concepts

### 1. Monorepo Architecture

This project uses **pnpm workspaces** to manage multiple packages in a single repository:

- **Workspace packages** are defined in `pnpm-workspace.yaml`
- Packages reference each other using `workspace:*` protocol
- Shared code lives in `packages/` directory
- Applications live in `apps/` directory

**Benefits:**
- Code sharing between frontend and backend
- Single source of truth for types
- Coordinated versioning
- Simplified dependency management

### 2. Type-Safe API with tRPC

**tRPC** provides end-to-end type safety between your backend and frontend:

**Backend (`apps/server/src/router.ts`):**
```typescript
export const appRouter = router({
  todos: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await listTodos(ctx.db);
    }),
    create: protectedProcedure
      .input(z.object({ title: z.string().min(1).max(200) }))
      .mutation(async ({ input, ctx }) => {
        return await createTodo(ctx.db, input.title);
      }),
  }),
});

export type AppRouter = typeof appRouter;
```

**Frontend (`apps/web/app/page.tsx`):**
```typescript
// Fully typed - autocomplete and type checking!
const todos = trpc.todos.list.useQuery();
const createTodo = trpc.todos.create.useMutation();
```

**Key Features:**
- **Automatic type inference** - Types flow from backend to frontend
- **Input validation** - Zod schemas validate inputs automatically
- **Error handling** - Structured error responses
- **SuperJSON** - Serializes complex types (Dates, etc.)

### 3. Authentication with Better-Auth

**Better-Auth** handles authentication with minimal configuration:

**Server Setup (`apps/server/src/lib/auth.ts`):**
```typescript
export const createAuth = (db: DrizzleClient) =>
  betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    // ... configuration
  });
```

**Client Usage (`apps/web/lib/auth/auth-client.ts`):**
```typescript
export const authClient = createAuthClient({
  baseURL: apiUrl,
  basePath: "/api/auth",
});

// In components
const { data: session } = useSession();
```

**Features:**
- Email/password authentication
- Session management via cookies
- OAuth providers (configurable)
- Type-safe session access in tRPC context

### 4. Database Management with Drizzle ORM

**Drizzle ORM** provides type-safe database access:

**Schema Definition (`apps/server/src/db/todo-schema.ts`):**
```typescript
export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

**Database Client (`apps/server/src/db/database.ts`):**
```typescript
export const schema = {
  todos,
  // ... other tables
};

export type DrizzleClient = PostgresJsDatabase<typeof schema>;
```

**Usage in Services (`apps/server/src/services/todos.ts`):**
```typescript
export const listTodos = async (db: DrizzleClient) =>
  await db.select().from(schema.todos);
```

**Migration Workflow:**
- `pnpm db:push` - Push schema changes directly (development)
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Apply migrations (production)
- `pnpm db:studio` - Open Drizzle Studio UI

### 5. tRPC Context & Procedures

**Context** provides shared data to all tRPC procedures:

```typescript
export type RequestContext = {
  db: DrizzleClient;
  auth: ReturnType<typeof createAuth>;
  user: { id: string; email: string; name: string | null } | null;
  headers?: globalThis.Headers;
};

const t = initTRPC.context<RequestContext>().create({
  transformer: superjson,
});
```

**Procedures:**
- **`publicProcedure`** - No authentication required
- **`protectedProcedure`** - Requires authenticated user

```typescript
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // TypeScript knows user is non-null
    },
  });
});
```

### 6. Service Layer Pattern

Business logic is separated into **service functions**:

```typescript
// apps/server/src/services/todos.ts
export const listTodos = async (db: DrizzleClient) =>
  await db.select().from(schema.todos);

export const createTodo = async (db: DrizzleClient, title: string) => {
  const [todo] = await db
    .insert(schema.todos)
    .values({ title, completed: false })
    .returning({ /* ... */ });
  return todo;
};
```

**Benefits:**
- Reusable business logic
- Testable functions
- Clear separation of concerns
- Easy to mock for testing

## 🔄 Data Flow

```
┌─────────────────┐
│  Next.js App    │
│  (React 19)     │
└────────┬────────┘
         │
         │ tRPC Client (typed)
         │
         ▼
┌─────────────────┐
│  Fastify Server │
│  (Port 4000)    │
└────────┬────────┘
         │
         ├──► /trpc/* ──► tRPC Router ──► Service ──► Drizzle ORM
         │
         └──► /api/auth/* ──► Better-Auth Handler
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Port 5432)   │
└─────────────────┘
```

## 📝 Development Workflow

### Adding a New Feature

1. **Define Database Schema**
   ```typescript
   // apps/server/src/db/your-schema.ts
   export const yourTable = pgTable("your_table", {
     // ... columns
   });
   ```

2. **Update Schema Exports**
   ```typescript
   // apps/server/src/db/database.ts
   import { yourTable } from "./your-schema.js";
   export const schema = {
     // ... existing tables
     yourTable,
   };
   ```

3. **Create Service Functions**
   ```typescript
   // apps/server/src/services/your-feature.ts
   export const listItems = async (db: DrizzleClient) => {
     return await db.select().from(schema.yourTable);
   };
   ```

4. **Add tRPC Procedures**
   ```typescript
   // apps/server/src/router.ts
   import { listItems } from "./services/your-feature.js";
   
   export const appRouter = router({
     // ... existing routes
     yourFeature: router({
       list: protectedProcedure.query(async ({ ctx }) => {
         return await listItems(ctx.db);
       }),
     }),
   });
   ```

5. **Use in Frontend**
   ```typescript
   // apps/web/app/your-page.tsx
   const { data } = trpc.yourFeature.list.useQuery();
   ```

6. **Push Schema Changes**
   ```bash
   cd apps/server
   pnpm db:push
   ```

### Environment Configuration

**Shared Config Package** (`packages/config/src/index.ts`):
- Uses Zod for runtime validation
- Loads `.env.development` or `.env.production` based on `NODE_ENV`
- Provides type-safe access to environment variables

**Usage:**
```typescript
import { serverConfig } from "@fsapp/config";

const db = drizzle(serverConfig.POSTGRES_URL!, { schema });
```

## 🗄️ Database Management

### Schema Organization

- **`*-schema.ts`** - Individual schema files (auth, todos, etc.)
  - These are referenced directly by drizzle-kit in `drizzle.config.ts`
  - Each schema file defines tables using Drizzle ORM's `pgTable()`
- **`database.ts`** - Runtime schema combination (used by application)
  - Imports and combines all schema files for the Drizzle client
  - Exports the combined `schema` object and `DrizzleClient` type

**Note:** drizzle-kit points directly to individual schema files (not a combined `schema.ts`) because:
- drizzle-kit runs in CommonJS context and has trouble resolving ES module re-exports
- This approach avoids module resolution issues while keeping schemas organized
- When adding new schemas, update both `drizzle.config.ts` and `database.ts`

### Migration Commands

```bash
# Push schema directly (development)
pnpm db:push

# Generate migration files
pnpm db:generate

# Apply migrations (production)
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## 🔐 Authentication Flow

1. **User signs up/signs in** via Better-Auth endpoints (`/api/auth/*`)
2. **Session cookie** is set automatically
3. **tRPC context** extracts session from cookie
4. **Protected procedures** check for authenticated user
5. **Frontend** uses `useSession()` hook to check auth state

**Example:**
```typescript
// Server: Check auth in procedure
list: protectedProcedure.query(async ({ ctx }) => {
  // ctx.user is guaranteed to exist
  return await getUserTodos(ctx.db, ctx.user.id);
});

// Client: Check auth before calling
const { data: session } = useSession();
const todos = trpc.todos.list.useQuery(undefined, {
  enabled: !!session?.user,
});
```

## 🚢 Deployment Considerations

### Environment Variables

Set these in your production environment:

```env
NODE_ENV=production
PORT=4000
BASE_URL=https://api.yourdomain.com
CLIENT_URL=https://app.yourdomain.com
CLIENT_DOMAIN=yourdomain.com
BETTER_AUTH_SECRET=<generate-a-secure-random-string>
POSTGRES_URL=<your-production-database-url>
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Build Commands

```bash
# Build all packages
pnpm build

# Start production servers
pnpm start
```

### Database Migrations

In production, use migrations instead of `db:push`:

```bash
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Apply migrations
```

## 📚 Additional Resources

- [tRPC Documentation](https://trpc.io/docs)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Better-Auth Documentation](https://www.better-auth.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## 🤝 Contributing

This is a template/example project. Feel free to use it as a starting point for your own applications!

## 📄 License

MIT
