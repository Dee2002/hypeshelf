# HypeShelf

**Collect and share the stuff you're hyped about.**

HypeShelf is a full-stack recommendations hub where friends can share movies, shows, games, and anything else they're excited about. Built with Next.js, Convex, Clerk, and Tailwind CSS.

---

## Folder Structure

```
hypeshelf/
├── convex/                        # Convex backend
│   ├── _generated/                # Auto-generated types (overwritten by `npx convex dev`)
│   │   ├── api.ts                 # Typed API references
│   │   ├── dataModel.ts           # Table/document types
│   │   └── server.ts              # Server function builders
│   ├── auth.config.ts             # Clerk ↔ Convex auth wiring
│   ├── recommendations.ts         # Queries & mutations for recommendations
│   ├── schema.ts                  # Database schema definition
│   ├── seed.ts                    # Sample data seeder
│   └── users.ts                   # User sync & role management
├── src/
│   ├── app/                       # Next.js App Router pages & layouts
│   │   ├── layout.tsx             # Root layout (providers, header)
│   │   ├── page.tsx               # Public landing page
│   │   ├── globals.css            # Global styles
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Authenticated dashboard
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx       # Clerk sign-in page
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx       # Clerk sign-up page
│   ├── components/                # Reusable React components
│   │   ├── AddRecommendationForm.tsx
│   │   ├── ConvexClientProvider.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── GenreFilter.tsx
│   │   ├── Header.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── RecommendationCard.tsx
│   │   └── UserSync.tsx
│   ├── lib/
│   │   └── utils.ts               # Pure utility functions
│   ├── middleware.ts              # Clerk route protection
│   ├── types/
│   │   └── index.ts               # Shared TypeScript types
│   └── __tests__/                 # Test files
│       ├── setup.ts               # Vitest setup
│       ├── utils.test.ts          # Unit tests for utils
│       ├── components.test.ts     # Component import tests
│       └── convex.test.ts         # Convex function test stubs
├── .env.example                   # Environment variable template
├── vitest.config.ts               # Vitest configuration
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration (if customized)
├── tsconfig.json                  # TypeScript configuration
└── package.json
```

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 9+
- A **Clerk** account (free tier works)
- A **Convex** account (free tier works)

---

## Local Development Setup

### 1. Clone & Install

```bash
git clone <your-repo-url> hypeshelf
cd hypeshelf
npm install
```

### 2. Set Up Clerk

1. Go to [clerk.com](https://clerk.com) and create a new application.
2. Copy your **Publishable Key** and **Secret Key** from the API Keys page.
3. Note your **Frontend API URL** (looks like `https://xxx.clerk.accounts.dev`).

### 3. Set Up Convex

1. Go to [convex.dev](https://convex.dev) and create a new project.
2. Run `npx convex dev` – this will:
   - Link your local project to the Convex deployment.
   - Generate the `convex/_generated/` types.
   - Start watching for schema/function changes.
3. In the **Convex Dashboard → Settings → Environment Variables**, add:
   - `CLERK_JWT_ISSUER_DOMAIN` = your Clerk Frontend API URL (e.g., `https://xxx.clerk.accounts.dev`)

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 5. Seed Sample Data

```bash
npx convex run seed:seedData
```

### 6. Start Development

Run these in two separate terminals:

```bash
# Terminal 1 – Convex backend (watches for changes)
npx convex dev

# Terminal 2 – Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

---

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub/GitLab.
2. Import the repository in [Vercel](https://vercel.com).
3. Add all environment variables from `.env.local` to the Vercel project settings.
4. Deploy.

### Backend (Convex)

```bash
npx convex deploy
```

This pushes your schema and functions to your production Convex deployment. Set the production `CLERK_JWT_ISSUER_DOMAIN` environment variable in the Convex dashboard.

---

## Architecture Decisions

### State Management

**Convex reactive queries** replace the need for client-side state management libraries (Redux, Zustand, etc.). When data changes on the server, all connected clients update automatically via WebSocket subscriptions. Component-local state (`useState`) handles transient UI state (form inputs, modal visibility, filter selections).

### Authentication Flow

**Clerk** handles all authentication concerns (sign-up, sign-in, session management, MFA). The integration flow:

1. User signs in via Clerk (modal or dedicated page).
2. Clerk issues a JWT.
3. `ConvexProviderWithClerk` forwards the JWT to Convex on every request.
4. `UserSync` component calls `syncUser` mutation to upsert the user record in the Convex `users` table.
5. All subsequent Convex queries/mutations verify the JWT server-side via `ctx.auth.getUserIdentity()`.

### Role-Based Access Control (RBAC)

Two roles: **admin** and **user**.

| Action | User | Admin |
|--------|------|-------|
| View public recommendations | Yes | Yes |
| Add a recommendation | Yes | Yes |
| Delete own recommendation | Yes | Yes |
| Delete any recommendation | No | Yes |
| Toggle Staff Pick | No | Yes |
| Change user roles | No | Yes |

**Enforcement layers:**

1. **Convex mutations** (primary): every mutation checks `ctx.auth` and the caller's role from the `users` table. This is the authoritative layer.
2. **Clerk middleware** (secondary): redirects unauthenticated users away from `/dashboard`.
3. **React components** (tertiary): conditionally render admin controls. This is purely cosmetic – a user cannot bypass server-side checks by manipulating the frontend.

### Data Model

- **Soft-delete**: recommendations are never hard-deleted. `deletedAt` is set to preserve audit trails.
- **Denormalized `authorName`**: stored on each recommendation to avoid JOIN-like lookups on reads. Updated when the user profile changes.
- **Indexes**: `by_creation`, `by_genre`, `by_creator`, `by_deletedAt` cover all query patterns without full-table scans.

---

## Security & Privacy Considerations

### HIPAA-Style Privacy Controls

While HypeShelf is not a healthcare application, it implements privacy patterns inspired by HIPAA requirements:

1. **Minimum necessary access**: public queries strip `createdBy` (Clerk user-id) from results. Only authenticated users see ownership information, and only for authorization purposes.

2. **Data encryption**:
   - **In transit**: all communication uses TLS (HTTPS for API calls, WSS for Convex WebSocket).
   - **At rest**: Convex encrypts all stored data at rest using AES-256.

3. **Audit trail**: soft-delete preserves all records. The `_creationTime` and `deletedAt` fields provide a timeline of data lifecycle events.

4. **Input validation**: every mutation validates all inputs server-side (length, format, enum membership). Client-side validation mirrors this for UX but is never trusted.

5. **No PII leakage in logs**: error messages and console logs reference error types, not user data. Clerk user-IDs are opaque identifiers.

6. **RBAC enforcement**: authorization checks happen at the data layer (Convex mutations), not at the API or UI layer, preventing privilege escalation.

### Additional Security Measures

- **CSRF protection**: Convex mutations are called via authenticated WebSocket connections, not traditional HTTP forms, making CSRF attacks infeasible.
- **XSS prevention**: React's JSX escaping prevents injection. No `dangerouslySetInnerHTML` is used. URLs are validated to be `http:` or `https:` only.
- **Tab-nabbing prevention**: all external links use `rel="noopener noreferrer"`.
- **Rate limiting**: Convex applies built-in rate limiting to prevent abuse.
- **Pagination caps**: server-side queries cap `numItems` at 100 to prevent data exfiltration via large page sizes.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npx convex dev` | Start Convex dev server |
| `npx convex deploy` | Deploy Convex to production |
| `npx convex run seed:seedData` | Seed sample data |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Clerk |
| Backend / DB | Convex |
| Testing | Vitest, Testing Library |
| Deployment | Vercel (frontend), Convex Cloud (backend) |
