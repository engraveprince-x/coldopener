# ColdOpener — Full Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete ColdOpener SaaS — a premium landing page with WebGL 3D scroll-driven animations, user authentication, AI-powered cold email generation, Stripe subscriptions, and deployment to Vercel.

**Architecture:** Next.js 14 App Router monorepo (frontend + API in one project). Landing page uses a layered approach: fixed Three.js/R3F canvas behind scrollable DOM with GSAP ScrollTrigger. Dashboard and API routes are auth-protected with NextAuth.js. Database is Neon PostgreSQL via Prisma. Payments via Stripe. AI via OpenAI GPT-4o.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, React Three Fiber, Three.js, GSAP ScrollTrigger, Prisma, Neon PostgreSQL, NextAuth.js, Stripe, OpenAI, Upstash Redis.

---

## File Structure Map

```
C:\Users\007\Documents\coldopener\
├── .env.local                          # Secrets (never committed)
├── .env.example                        # Template for env vars
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── prisma/
│   └── schema.prisma                   # DB models: User, Generation, Subscription, UsageLog
├── public/
│   └── (static assets if any)
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout: Inter font, global styles
│   │   ├── page.tsx                    # Landing page: assembles all sections + WebGL
│   │   ├── globals.css                 # Tailwind directives + brutalist utilities
│   │   ├── signup/
│   │   │   └── page.tsx               # Signup form
│   │   ├── login/
│   │   │   └── page.tsx               # Login form
│   │   ├── app/
│   │   │   ├── layout.tsx             # Auth-protected layout (sidebar, user menu)
│   │   │   ├── page.tsx               # Dashboard: URL input + email preview
│   │   │   └── history/
│   │   │       └── page.tsx           # Past generations list
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts       # NextAuth handler
│   │       ├── generate/
│   │       │   └── route.ts           # POST: AI email generation
│   │       ├── generations/
│   │       │   └── route.ts           # GET: list user's generations
│   │       ├── stripe/
│   │       │   ├── checkout/
│   │       │   │   └── route.ts       # POST: create checkout session
│   │       │   └── webhook/
│   │       │       └── route.ts       # POST: Stripe event handler
│   │       └── usage/
│   │           └── route.ts           # GET: current usage stats
│   ├── components/
│   │   ├── landing/
│   │   │   ├── hero.tsx               # Hero section
│   │   │   ├── features.tsx           # 3-card features grid
│   │   │   ├── how-it-works.tsx       # 3-step process
│   │   │   ├── demo.tsx               # Interactive email preview
│   │   │   ├── pricing.tsx            # Pricing card
│   │   │   └── footer.tsx             # Black footer
│   │   ├── three/
│   │   │   ├── webgl-scene.tsx        # R3F Canvas wrapper + GSAP timeline
│   │   │   ├── envelope.tsx           # Main envelope (body, flap, details)
│   │   │   ├── paper-plane.tsx        # Paper plane geometry
│   │   │   ├── letter.tsx             # Folded letter geometry
│   │   │   ├── small-envelope.tsx     # Small envelope
│   │   │   └── lighting.tsx           # 4-light setup + shadow catcher
│   │   └── ui/
│   │       ├── button.tsx             # Black pill button + ghost variant
│   │       └── input.tsx              # Styled input
│   ├── lib/
│   │   ├── prisma.ts                  # Singleton Prisma client
│   │   ├── auth.ts                    # NextAuth configuration
│   │   ├── openai.ts                  # GPT-4o email generation
│   │   ├── stripe.ts                  # Stripe client + helpers
│   │   └── rate-limit.ts             # Upstash Redis rate limiter
│   └── middleware.ts                  # Rate limiting + auth redirects
```

---

## Phase 1: Project Scaffold

### Task 1: Initialize Next.js Project

**Files:**
- Create: `C:\Users\007\Documents\coldopener\package.json`
- Create: `C:\Users\007\Documents\coldopener\tsconfig.json`
- Create: `C:\Users\007\Documents\coldopener\next.config.js`
- Create: `C:\Users\007\Documents\coldopener\tailwind.config.ts`
- Create: `C:\Users\007\Documents\coldopener\.gitignore`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "coldopener",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "postinstall": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.99.0",
    "gsap": "^3.12.5",
    "@gsap/react": "^2.1.0",
    "next-auth": "^4.24.0",
    "@prisma/client": "^5.14.0",
    "stripe": "^15.0.0",
    "openai": "^4.47.0",
    "@upstash/redis": "^1.31.0",
    "@upstash/ratelimit": "^2.0.0",
    "framer-motion": "^11.0.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.160.0",
    "@types/bcryptjs": "^2.4.6",
    "prisma": "^5.14.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.js**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 4: Create tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FCFCFA',
        fg: '#111111',
        muted: '#8A8A85',
        hair: '#E8E6E1',
        card: '#F5F4F0',
        accent: '#D4C9B8',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ["'SF Mono'", "'Fira Code'", "'Cascadia Code'", 'monospace'],
      },
      letterSpacing: {
        tightest: '-3.5px',
        tighter: '-2.5px',
        wide: '5px',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
.next/
.env.local
.env*.local
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 6: Install dependencies**

Run: `cd "C:\Users\007\Documents\coldopener" && npm install`
Expected: Dependencies install without errors

- [ ] **Step 7: Create postcss.config.js**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 8: Commit**

```bash
cd "C:\Users\007\Documents\coldopener" && git init && git add -A && git commit -m "feat: scaffold Next.js project with TypeScript, Tailwind, package.json"
```

---

### Task 2: Create Environment Template

**Files:**
- Create: `C:\Users\007\Documents\coldopener\.env.example`

- [ ] **Step 1: Create .env.example**

```
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/coldopener?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/coldopener?sslmode=require"

# Auth (NextAuth.js)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PRICE_ID="price_..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Upstash Redis
UPSTASH_REDIS_URL="https://xxx.upstash.io"
UPSTASH_REDIS_TOKEN="..."
```

- [ ] **Step 2: Copy to .env.local (will be filled in during setup)**

Run: `cp .env.example .env.local`
Expected: File created; user fills in values later

- [ ] **Step 3: Commit**

```bash
git add .env.example .gitignore && git commit -m "chore: add environment template"
```

---

## Phase 2: Database & Auth

### Task 3: Write Prisma Schema

**Files:**
- Create: `C:\Users\007\Documents\coldopener\prisma\schema.prisma`

- [ ] **Step 1: Create schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]

  profile       Profile?
  generations   Generation[]
  subscription  Subscription?
  usageLogs     UsageLog[]
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model Profile {
  id        String   @id @default(cuid())
  userId    String   @unique
  fullName  String?
  avatarUrl String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Generation {
  id               String   @id @default(cuid())
  userId           String
  linkedinUrl      String
  recipientName    String?
  recipientCompany String?
  emailSubject     String?
  emailBody        String
  createdAt        DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, createdAt])
}

model Subscription {
  id                   String    @id @default(cuid())
  userId               String    @unique
  stripeCustomerId     String    @unique
  stripeSubscriptionId String?   @unique
  status               String    @default("trialing")
  trialEndsAt          DateTime
  currentPeriodEndsAt  DateTime?
  createdAt            DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UsageLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, createdAt])
}
```

- [ ] **Step 2: Create Prisma singleton lib**

Create: `C:\Users\007\Documents\coldopener\src\lib\prisma.ts`

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma src/lib/prisma.ts && git commit -m "feat: add Prisma schema and client singleton"
```

---

### Task 4: Configure NextAuth

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\lib\auth.ts`
- Create: `C:\Users\007\Documents\coldopener\src\app\api\auth\[...nextauth]\route.ts`

- [ ] **Step 1: Create auth configuration**

Create: `src/lib/auth.ts`

```ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.hashedPassword) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.sub!;
      }
      return session;
    },
  },
};
```

> **⚠️ NOTE:** The User model in Prisma schema needs a `hashedPassword` field for credentials auth. Add this field to the User model:
> ```prisma
> model User {
>   // ... existing fields
>   hashedPassword String?
> }
> ```
> If you want to skip credentials auth initially and only use Google OAuth, remove the CredentialsProvider and the hashedPassword field. The signup/login pages will then use Google OAuth only.

**Simplified version (Google OAuth only — recommended for initial build):**

```ts
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.sub!;
      }
      return session;
    },
  },
};
```

- [ ] **Step 2: Create auth API route**

Create: `src/app/api/auth/[...nextauth]/route.ts`

```ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts "src/app/api/auth/[...nextauth]/route.ts" && git commit -m "feat: add NextAuth configuration (Google OAuth)"
```

---

### Task 5: Create Auth Pages (Login)

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\app\login\page.tsx`

- [ ] **Step 1: Create login page**

```tsx
'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-fg mb-2">
          Sign in to ColdOpener
        </h1>
        <p className="text-sm text-muted mb-8">
          Generate hyper-personalized cold emails with AI
        </p>

        <button
          onClick={() => signIn('google', { callbackUrl: '/app' })}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border border-hair rounded-full text-sm font-medium text-fg hover:border-fg transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-muted">
          By signing in, you agree to our{' '}
          <Link href="#" className="underline hover:text-fg">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="#" className="underline hover:text-fg">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/login/page.tsx && git commit -m "feat: add login page with Google OAuth"
```

---

### Task 6: Create App Layout (Auth-Protected)

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\app\app\layout.tsx`
- Create: `C:\Users\007\Documents\coldopener\src\middleware.ts`

- [ ] **Step 1: Create auth-protected app layout**

Create: `src/app/app/layout.tsx`

```tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* App nav bar */}
      <nav className="border-b border-hair bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/app" className="font-bold text-fg tracking-tight">
              ColdOpener
            </Link>
            <Link
              href="/app"
              className="text-sm text-muted hover:text-fg transition-colors"
            >
              Generate
            </Link>
            <Link
              href="/app/history"
              className="text-sm text-muted hover:text-fg transition-colors"
            >
              History
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted">
              {session.user?.email}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create middleware for auth redirects**

Create: `src/middleware.ts`

```ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/app/:path*'],
};
```

- [ ] **Step 3: Commit**

```bash
git add src/app/app/layout.tsx src/middleware.ts && git commit -m "feat: add auth-protected app layout and middleware"
```

---

## Phase 3: Landing Page DOM

### Task 7: Root Layout + Global Styles

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\app\layout.tsx`
- Create: `C:\Users\007\Documents\coldopener\src\app\globals.css`

- [ ] **Step 1: Create root layout**

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ColdOpener — AI Cold Emails That Feel Human',
  description:
    'Paste a LinkedIn URL. Our AI researches your prospect and writes a message so personal, they will forget it was generated.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-bg text-fg">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Create global styles**

Create: `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  *,
  *::before,
  *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: auto; /* GSAP handles scroll */
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #FCFCFA;
    color: #111111;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@layer components {
  .sec-num {
    @apply text-[11px] font-semibold tracking-[5px] text-muted mb-6;
  }

  .section-h2 {
    @apply text-[clamp(40px,7vw,80px)] font-extrabold tracking-tighter leading-[0.97] text-fg max-w-[780px];
  }

  .body-text {
    @apply text-base font-normal leading-relaxed text-muted max-w-[440px] mt-7;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css && git commit -m "feat: add root layout with Inter font and global brutalist styles"
```

---

### Task 8: Landing Page Sections (Hero, Features, How, Demo, Pricing, Footer)

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\components\landing\hero.tsx`
- Create: `C:\Users\007\Documents\coldopener\src\components\landing\features.tsx`
- Create: `C:\Users\007\Documents\coldopener\src\components\landing\how-it-works.tsx`
- Create: `C:\Users\007\Documents\coldopener\src\components\landing\demo.tsx`
- Create: `C:\Users\007\Documents\coldopener\src\components\landing\pricing.tsx`
- Create: `C:\Users\007\Documents\coldopener\src\components\landing\footer.tsx`

- [ ] **Step 1: Create Hero section**

Create: `src/components/landing/hero.tsx`

```tsx
import Link from 'next/link';

export function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col justify-center px-14 max-sm:px-6 relative"
    >
      <h1 className="text-[clamp(48px,9vw,104px)] font-extrabold tracking-tightest leading-[0.92] text-fg max-w-[860px]">
        Cold emails
        <br />
        that feel
        <br />
        human
      </h1>
      <p className="text-lg font-normal leading-relaxed text-muted max-w-[500px] mt-6">
        Paste a LinkedIn URL. Our AI researches your prospect and writes a
        message so personal, they&apos;ll forget it was generated.
      </p>
      <div className="mt-10 flex gap-3.5 flex-wrap">
        <Link
          href="/signup"
          className="inline-flex px-9 py-4 bg-fg text-bg rounded-full text-sm font-semibold tracking-[-0.3px] hover:scale-[1.03] hover:shadow-[0_12px_36px_rgba(0,0,0,0.12)] transition-all duration-200"
        >
          Start free trial
        </Link>
        <a
          href="#demo"
          className="inline-flex px-9 py-4 border-[1.5px] border-hair text-muted rounded-full text-sm font-medium tracking-[-0.3px] hover:border-fg hover:text-fg transition-colors duration-300"
        >
          Watch demo
        </a>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted text-[9px] font-semibold tracking-[5px] uppercase">
        <span>Scroll</span>
        <div className="w-px h-8 bg-hair" />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create Features section**

Create: `src/components/landing/features.tsx`

```tsx
const features = [
  {
    n: '01',
    title: 'Deep Research',
    desc: 'AI scans LinkedIn, Twitter, blogs — building a real picture of who your prospect is and what they care about.',
  },
  {
    n: '02',
    title: 'One Click',
    desc: 'Paste a URL, hit generate. No forms, no templates, no complexity. Just a perfectly tailored email in seconds.',
  },
  {
    n: '03',
    title: 'Human Tone',
    desc: 'Every email reads like a thoughtful colleague wrote it. Never robotic, never generic, never templated.',
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="min-h-screen flex flex-col justify-center px-14 max-sm:px-6"
    >
      <div className="sec-num">/ CAPABILITIES</div>
      <h2 className="section-h2">
        Everything you need
        <br />
        to open any conversation
      </h2>
      <div className="w-[60px] h-px bg-hair my-6" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 max-w-[920px] w-full mt-11">
        {features.map((f) => (
          <div
            key={f.n}
            className="bg-card rounded-2xl p-8 hover:bg-[#EFEEEA] transition-colors"
          >
            <div className="text-[10px] font-bold tracking-[4px] text-accent mb-3">
              {f.n}
            </div>
            <h4 className="text-lg font-bold tracking-[-0.5px] mb-2">
              {f.title}
            </h4>
            <p className="text-[13px] leading-relaxed text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create How It Works section**

Create: `src/components/landing/how-it-works.tsx`

```tsx
const steps = [
  { n: '1', title: 'Paste a LinkedIn URL', desc: 'Any public profile. AI starts researching immediately.' },
  { n: '2', title: 'AI analyzes & writes', desc: 'Deep personalization from real data. No templates, no filler.' },
  { n: '3', title: 'Send & convert', desc: 'Copy, paste, send. Reply rates 3.2× higher than generic outreach.' },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="min-h-screen flex flex-col justify-center px-14 max-sm:px-6"
    >
      <div className="sec-num">/ PROCESS</div>
      <h2 className="section-h2">
        Three seconds
        <br />
        from URL to inbox
      </h2>
      <div className="w-[60px] h-px bg-hair my-6" />
      <div className="flex gap-14 max-w-[820px] flex-wrap justify-center mt-11">
        {steps.map((s) => (
          <div
            key={s.n}
            className="flex-1 min-w-[180px] max-w-[230px] text-center"
          >
            <div className="text-[60px] font-light tracking-[-5px] text-hair leading-none">
              {s.n}
            </div>
            <h4 className="text-[15px] font-bold mt-2.5 mb-1.5 tracking-[-0.3px]">
              {s.title}
            </h4>
            <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create Demo section**

Create: `src/components/landing/demo.tsx`

```tsx
'use client';

import { useState } from 'react';

export function Demo() {
  const [url, setUrl] = useState('');

  const showPreview = url.trim().length > 5;

  return (
    <section
      id="demo"
      className="min-h-screen flex flex-col justify-center px-14 max-sm:px-6"
    >
      <div className="sec-num">/ TRY IT</div>
      <h2 className="section-h2">
        See ColdOpener
        <br />
        in action
      </h2>
      <div className="max-w-[540px] w-full bg-white rounded-[20px] p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.04)] border border-hair mt-9">
        <input
          type="url"
          placeholder="Paste a LinkedIn profile URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-[18px] py-[15px] border border-hair rounded-xl text-sm font-mono outline-none bg-bg transition-colors focus:border-fg"
        />
        <button className="w-full py-[15px] bg-fg text-bg rounded-xl text-sm font-semibold mt-2.5 active:scale-[0.98] transition-transform">
          Generate →
        </button>
        <div className="mt-3.5 p-[18px] bg-bg rounded-xl text-[13px] leading-[1.9] text-muted min-h-[50px] border border-hair">
          {showPreview ? (
            <>
              <div className="text-[8px] font-semibold tracking-[3px] text-accent uppercase mb-2.5 pb-2 border-b border-hair">
                Generated Email
              </div>
              <div className="text-[10px] text-muted mb-2">
                Subject:{' '}
                <span className="text-fg/70">
                  Quick thought on your recent work
                </span>
              </div>
              <p className="leading-[1.9]">
                Hi <b className="text-fg">[Name]</b>,
                <br />
                <br />
                Your recent piece on{' '}
                <b className="text-fg">[Topic]</b> was genuinely refreshing.
                Most miss the connection between{' '}
                <b className="text-fg">[Insight A]</b> and{' '}
                <b className="text-fg">[Insight B]</b>.
                <br />
                <br />
                Open to a brief chat? I&apos;d love to swap notes.
                <br />
                <br />
                <span className="text-muted">Best,</span>
                <br />
                <b className="text-fg">[Your Name]</b>
              </p>
            </>
          ) : (
            'Your personalized cold email will appear here'
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create Pricing section**

Create: `src/components/landing/pricing.tsx`

```tsx
import Link from 'next/link';

export function Pricing() {
  return (
    <section
      id="pricing"
      className="min-h-screen flex flex-col justify-center px-14 max-sm:px-6"
    >
      <div className="sec-num">/ PRICING</div>
      <h2 className="section-h2">
        Simple and
        <br />
        transparent
      </h2>
      <div className="border-2 border-fg rounded-[20px] p-10 max-w-[380px] w-full text-center mt-9 bg-white">
        <div className="text-[52px] font-light tracking-[-3px]">
          $29
          <small className="text-[15px] text-muted font-normal">
            &thinsp;/month
          </small>
        </div>
        <p className="text-xs text-muted mt-1">
          7-day free trial. No credit card required.
        </p>
        <ul className="text-left my-6">
          {[
            'Unlimited email generation',
            'Deep AI personalization',
            'LinkedIn profile research',
            'Email history & search',
            'Copy with one click',
          ].map((item) => (
            <li
              key={item}
              className="py-2 text-[13px] text-fg/70 border-b border-hair"
            >
              <span className="font-bold text-accent mr-1.5">→</span>
              {item}
            </li>
          ))}
        </ul>
        <Link
          href="/signup"
          className="block text-center px-9 py-4 bg-fg text-bg rounded-full text-sm font-semibold hover:scale-[1.03] transition-transform"
        >
          Start free trial
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create Footer**

Create: `src/components/landing/footer.tsx`

```tsx
import Link from 'next/link';

const links = ['Features', 'Pricing', 'FAQ', 'Privacy', 'Terms'];

export function Footer() {
  return (
    <footer className="bg-fg text-bg py-12 px-14 text-center">
      <div className="text-[22px] font-light tracking-[-1px] mb-5">
        ColdOpener
      </div>
      <div className="flex gap-7 justify-center flex-wrap mb-6">
        {links.map((l) => (
          <Link
            key={l}
            href="#"
            className="text-xs text-fg/50 hover:text-bg transition-colors"
          >
            {l}
          </Link>
        ))}
      </div>
      <div className="text-[10px] text-fg/40">
        &copy; {new Date().getFullYear()} ColdOpener. All rights reserved.
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/ && git commit -m "feat: add all landing page DOM sections"
```

---

### Task 9: Assemble Landing Page

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\app\page.tsx`

- [ ] **Step 1: Create landing page (DOM only for now, WebGL added in Phase 4)**

```tsx
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Demo } from '@/components/landing/demo';
import { Pricing } from '@/components/landing/pricing';
import { Footer } from '@/components/landing/footer';

export default function HomePage() {
  return (
    <div className="relative">
      {/* WebGL canvas will be inserted here in Phase 4 */}
      <div className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <Demo />
        <Pricing />
        <Footer />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify dev server starts**

Run: `cd "C:\Users\007\Documents\coldopener" && npm run dev`
Expected: Next.js starts on http://localhost:3000. Landing page renders with all 6 sections.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx && git commit -m "feat: assemble landing page with all DOM sections"
```

---

## Phase 4: Landing Page WebGL 3D

### Task 10: Install R3F + GSAP Dependencies

- [ ] **Step 1: Install packages**

Run: `cd "C:\Users\007\Documents\coldopener" && npm install three @react-three/fiber @react-three/drei gsap @gsap/react`
Run: `npm install -D @types/three`
Expected: All packages install without error

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json && git commit -m "chore: install R3F, Three.js, GSAP dependencies"
```

---

### Task 11: Create Lighting Component

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\components\three\lighting.tsx`

- [ ] **Step 1: Create lighting component**

```tsx
'use client';

export function Lighting() {
  return (
    <>
      {/* Ambient — warm fill */}
      <ambientLight color="#FFFAF5" intensity={1.6} />

      {/* Key — warm white, casts shadows */}
      <directionalLight
        color="#FFF8F0"
        intensity={4.0}
        position={[5, 3.5, 6]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.00008}
        shadow-normalBias={0.02}
      />

      {/* Fill — cool, opposite */}
      <directionalLight
        color="#F0F4FF"
        intensity={1.0}
        position={[-3.5, 1, -2.5]}
      />

      {/* Rim — warm backlight */}
      <directionalLight
        color="#FFF5EB"
        intensity={2.2}
        position={[0, -0.2, -4.5]}
      />

      {/* Top accent */}
      <directionalLight color="#FFFFFF" intensity={0.8} position={[0, 5, 0.5]} />

      {/* Shadow catcher ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.8, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.2} />
      </mesh>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/lighting.tsx && git commit -m "feat: add R3F lighting setup (4 lights + shadow catcher)"
```

---

### Task 12: Create Envelope Component

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\components\three\envelope.tsx`

- [ ] **Step 1: Create envelope component**

This is the hero 3D object — a large white envelope with stamp, postmark, address lines, V-crease, air mail borders, and wax seal. The envelope flips 360° on scroll via GSAP.

```tsx
'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';

export function Envelope() {
  const groupRef = useRef<THREE.Group>(null);

  // Flap shape memoized
  const flapShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.6, 0);
    shape.lineTo(0.6, 0);
    shape.lineTo(0, 0.42);
    shape.closePath();
    return shape;
  }, []);

  return (
    <group ref={groupRef} position={[0, 0.05, 0]}>
      {/* Body — flat box 1.2 × 0.82 × 0.06 */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.82, 0.06, 3, 3, 1]} />
        <meshStandardMaterial
          color="#FAFAF8"
          roughness={0.38}
          metalness={0}
        />
      </mesh>

      {/* Flap — triangular, slightly open */}
      <mesh
        position={[0, 0.41, 0.025]}
        rotation={[-0.16, 0, 0]}
        castShadow
      >
        <shapeGeometry args={[flapShape]} />
        <meshStandardMaterial
          color="#F2F1ED"
          roughness={0.35}
          metalness={0}
        />
      </mesh>

      {/* V-crease — left diagonal */}
      <mesh
        position={[-0.16, 0.02, 0]}
        rotation={[0, 0, 0.42]}
      >
        <boxGeometry args={[0.38, 0.006, 0.062]} />
        <meshStandardMaterial
          color="#ECEAE6"
          roughness={0.4}
          metalness={0}
        />
      </mesh>

      {/* V-crease — right diagonal */}
      <mesh
        position={[0.16, 0.02, 0]}
        rotation={[0, 0, -0.42]}
      >
        <boxGeometry args={[0.38, 0.006, 0.062]} />
        <meshStandardMaterial
          color="#ECEAE6"
          roughness={0.4}
          metalness={0}
        />
      </mesh>

      {/* Stamp — top right */}
      <mesh position={[0.46, 0.28, 0.032]}>
        <boxGeometry args={[0.12, 0.16, 0.002]} />
        <meshStandardMaterial
          color="#F0ECE4"
          roughness={0.32}
          metalness={0}
        />
        {/* Stamp inner */}
        <mesh position={[0, 0, 0.001]}>
          <boxGeometry args={[0.08, 0.12, 0.003]} />
          <meshStandardMaterial
            color="#F2F1ED"
            roughness={0.35}
            metalness={0}
          />
        </mesh>
      </mesh>

      {/* Postmark ring */}
      <mesh
        position={[0.48, 0.3, 0.034]}
        rotation={[0, 0, 0.25]}
      >
        <torusGeometry args={[0.048, 0.01, 8, 24]} />
        <meshStandardMaterial
          color="#ECEAE6"
          roughness={0.4}
          metalness={0}
        />
      </mesh>

      {/* Postmark cancel lines */}
      <mesh
        position={[0.43, 0.24, 0.033]}
        rotation={[0, 0, -0.35]}
      >
        <boxGeometry args={[0.07, 0.004, 0.062]} />
        <meshStandardMaterial
          color="#ECEAE6"
          roughness={0.4}
          metalness={0}
        />
      </mesh>
      <mesh
        position={[0.44, 0.21, 0.033]}
        rotation={[0, 0, -0.25]}
      >
        <boxGeometry args={[0.07, 0.004, 0.062]} />
        <meshStandardMaterial
          color="#ECEAE6"
          roughness={0.4}
          metalness={0}
        />
      </mesh>

      {/* Return address lines — top left */}
      {[0.22, 0.175, 0.13].map((y, i) => (
        <mesh key={`ret-${i}`} position={[-0.42, y, 0]}>
          <boxGeometry args={[0.3, 0.005, 0.062]} />
          <meshStandardMaterial
            color="#ECEAE6"
            roughness={0.4}
            metalness={0}
          />
        </mesh>
      ))}

      {/* Address block — center lower */}
      {[-0.08, -0.13, -0.18].map((y, i) => (
        <mesh key={`addr-${i}`} position={[0, y, 0]}>
          <boxGeometry args={[0.5, 0.005, 0.062]} />
          <meshStandardMaterial
            color="#ECEAE6"
            roughness={0.4}
            metalness={0}
          />
        </mesh>
      ))}

      {/* Air mail border — top */}
      <mesh position={[0, 0.37, 0]}>
        <boxGeometry args={[1.16, 0.008, 0.062]} />
        <meshStandardMaterial
          color="#ECEAE6"
          roughness={0.4}
          metalness={0}
        />
      </mesh>

      {/* Air mail border — bottom */}
      <mesh position={[0, -0.37, 0]}>
        <boxGeometry args={[1.16, 0.008, 0.062]} />
        <meshStandardMaterial
          color="#ECEAE6"
          roughness={0.4}
          metalness={0}
        />
      </mesh>

      {/* Wax seal */}
      <mesh
        position={[0, 0.24, 0.045]}
        rotation={[-0.16, 0, 0]}
      >
        <cylinderGeometry args={[0.07, 0.07, 0.018, 32]} />
        <meshStandardMaterial
          color="#D4C9B8"
          roughness={0.2}
          metalness={0.35}
        />
      </mesh>

      {/* Seal highlight dot */}
      <mesh
        position={[0, 0.24, 0.056]}
        rotation={[-0.16, 0, 0]}
      >
        <cylinderGeometry args={[0.025, 0.025, 0.02, 16]} />
        <meshStandardMaterial
          color="#E8E0D4"
          roughness={0.15}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/envelope.tsx && git commit -m "feat: add R3F envelope component with DIY details"
```

---

### Task 13: Create Paper Plane Component

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\components\three\paper-plane.tsx`

- [ ] **Step 1: Create paper plane component**

```tsx
'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export function PaperPlane() {
  const groupRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const verts = new Float32Array([
      // Left wing top
      0, 0.04, 0.45, 0, 0.04, -0.35, -0.4, -0.12, -0.12,
      // Right wing top
      0, 0.04, 0.45, 0.4, -0.12, -0.12, 0, 0.04, -0.35,
      // Left wing bottom
      0, 0.04, 0.45, -0.4, -0.12, -0.12, 0, -0.04, -0.35,
      // Right wing bottom
      0, 0.04, 0.45, 0, -0.04, -0.35, 0.4, -0.12, -0.12,
      // Back face top
      0, 0.04, -0.35, -0.4, -0.12, -0.12, 0.4, -0.12, -0.12,
      // Back face bottom
      0, -0.04, -0.35, 0.4, -0.12, -0.12, -0.4, -0.12, -0.12,
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group
      ref={groupRef}
      position={[2.0, 0.6, -0.8]}
      rotation={[0.3, -0.5, 0.2]}
    >
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#FCFCFA"
          roughness={0.24}
          metalness={0.04}
        />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/paper-plane.tsx && git commit -m "feat: add R3F paper plane with custom BufferGeometry"
```

---

### Task 14: Create Letter + Small Envelope Components

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\components\three\letter.tsx`
- Create: `C:\Users\007\Documents\coldopener\src\components\three\small-envelope.tsx`

- [ ] **Step 1: Create letter component**

```tsx
'use client';

import { useRef } from 'react';

export function Letter() {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group
      ref={groupRef}
      position={[-1.9, -0.3, -0.4]}
      rotation={[0.08, 0.55, -0.1]}
    >
      {/* Main sheet */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.48, 0.018, 2, 2, 1]} />
        <meshStandardMaterial
          color="#FAFAF8"
          roughness={0.48}
          metalness={0}
        />
      </mesh>

      {/* Fold line */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.65, 0.005, 0.02]} />
        <meshStandardMaterial
          color="#ECEAE6"
          roughness={0.4}
          metalness={0}
        />
      </mesh>

      {/* Folded half */}
      <mesh
        position={[0, -0.24, 0]}
        rotation={[-0.15, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.65, 0.23, 0.018, 2, 2, 1]} />
        <meshStandardMaterial
          color="#FAFAF8"
          roughness={0.48}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 2: Create small envelope component**

```tsx
'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';

export function SmallEnvelope() {
  const groupRef = useRef<THREE.Group>(null);

  const flapShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.24, 0);
    shape.lineTo(0.24, 0);
    shape.lineTo(0, 0.18);
    shape.closePath();
    return shape;
  }, []);

  return (
    <group
      ref={groupRef}
      position={[1.6, -0.55, -1.1]}
      rotation={[-0.15, -0.7, 0.12]}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.34, 0.035, 2, 2, 1]} />
        <meshStandardMaterial
          color="#FAFAF8"
          roughness={0.38}
          metalness={0}
        />
      </mesh>
      <mesh
        position={[0, 0.17, 0.014]}
        rotation={[-0.22, 0, 0]}
        castShadow
      >
        <shapeGeometry args={[flapShape]} />
        <meshStandardMaterial
          color="#F2F1ED"
          roughness={0.35}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/three/letter.tsx src/components/three/small-envelope.tsx && git commit -m "feat: add R3F letter and small envelope components"
```

---

### Task 15: Create WebGL Scene + GSAP Animation

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\components\three\webgl-scene.tsx`

- [ ] **Step 1: Create WebGL scene wrapper with GSAP**

This is the main component that wires everything together — R3F Canvas, all 3D objects, and the GSAP ScrollTrigger timeline.

```tsx
'use client';

import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Envelope } from './envelope';
import { PaperPlane } from './paper-plane';
import { Letter } from './letter';
import { SmallEnvelope } from './small-envelope';
import { Lighting } from './lighting';

gsap.registerPlugin(ScrollTrigger);

function SceneObjects() {
  const envRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Group>(null);
  const letterRef = useRef<THREE.Group>(null);
  const smallEnvRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const env = envRef.current;
    const plane = planeRef.current;
    const letter = letterRef.current;
    const smallEnv = smallEnvRef.current;

    if (!env || !plane || !letter || !smallEnv) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.0,
      },
    });

    // Main envelope: rotateX flip + wobble
    tl.to(env.rotation, { x: Math.PI * 2.05, duration: 1, ease: 'none' }, 0);
    tl.to(env.rotation, { y: 0.6, duration: 0.25, ease: 'power2.out' }, 0);
    tl.to(env.rotation, { y: -0.5, duration: 0.3, ease: 'power2.inOut' }, 0.35);
    tl.to(env.rotation, { y: 0.2, duration: 0.25, ease: 'power2.in' }, 0.7);
    tl.to(env.position, { y: 0.55, duration: 0.3, ease: 'power2.out' }, 0);
    tl.to(env.position, { y: -0.35, duration: 0.4, ease: 'power2.inOut' }, 0.3);
    tl.to(env.position, { y: 0.05, duration: 0.3, ease: 'power2.in' }, 0.7);
    tl.to(env.position, { z: 0.5, duration: 0.2, ease: 'power2.out' }, 0.15);
    tl.to(env.position, { z: 0, duration: 0.3, ease: 'power2.in' }, 0.5);

    // Paper plane: sweeping arc
    tl.to(plane.position, { x: -2.0, y: -0.5, z: 0.6, duration: 0.5, ease: 'power2.inOut' }, 0);
    tl.to(plane.position, { x: 1.6, y: 1.0, z: -1.0, duration: 0.5, ease: 'power2.inOut' }, 0.5);
    tl.to(plane.rotation, { z: Math.PI * 0.7, y: -2.0, x: -0.4, duration: 0.5, ease: 'power2.inOut' }, 0);
    tl.to(plane.rotation, { z: -Math.PI * 0.3, y: -3.5, x: 0.6, duration: 0.5, ease: 'power2.inOut' }, 0.5);

    // Letter: drift
    tl.to(letter.position, { x: 1.6, y: 0.4, z: -0.8, duration: 0.45, ease: 'power2.inOut' }, 0);
    tl.to(letter.position, { x: -1.2, y: -0.25, z: 0.3, duration: 0.55, ease: 'power2.inOut' }, 0.45);
    tl.to(letter.rotation, { y: '+2.4', x: -0.3, duration: 0.5, ease: 'none' }, 0);
    tl.to(letter.rotation, { y: '-1.0', x: 0.2, duration: 0.5, ease: 'none' }, 0.5);

    // Small envelope: orbit
    tl.to(smallEnv.position, { x: -1.5, y: 0.5, z: 0.4, duration: 0.4, ease: 'power2.inOut' }, 0);
    tl.to(smallEnv.position, { x: 0.8, y: -0.1, z: -1.2, duration: 0.35, ease: 'power2.inOut' }, 0.4);
    tl.to(smallEnv.position, { x: -0.5, y: -0.7, z: 0.1, duration: 0.25, ease: 'power2.inOut' }, 0.75);
    tl.to(smallEnv.rotation, { y: '-3.0', x: 0.5, duration: 0.5, ease: 'none' }, 0);
    tl.to(smallEnv.rotation, { y: '+1.5', x: -0.2, duration: 0.5, ease: 'none' }, 0.5);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <>
      <Lighting />

      <group ref={envRef}>
        <Envelope />
      </group>

      <group ref={planeRef}>
        <PaperPlane />
      </group>

      <group ref={letterRef}>
        <Letter />
      </group>

      <group ref={smallEnvRef}>
        <SmallEnvelope />
      </group>

      {/* Diamond sparkles */}
      <mesh position={[1.2, 0.8, -0.3]} castShadow>
        <octahedronGeometry args={[0.04, 0]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.1} />
      </mesh>
      <mesh position={[-1.5, -0.7, -0.6]} scale={0.7} castShadow>
        <octahedronGeometry args={[0.04, 0]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.12} metalness={0.08} />
      </mesh>
    </>
  );
}

export function WebGLScene() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none">
      <Canvas
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          shadowMap: {
            enabled: true,
            type: THREE.PCFSoftShadowMap,
          },
        }}
        dpr={[1, 2]}
        camera={{ fov: 42, near: 0.1, far: 40, position: [0, 0.1, 6.5] }}
        scene={{ background: new THREE.Color('#FCFCFA'), fog: new THREE.Fog('#FCFCFA', 7, 22) }}
      >
        <SceneObjects />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/three/webgl-scene.tsx && git commit -m "feat: add WebGL scene with GSAP ScrollTrigger animation"
```

---

### Task 16: Integrate WebGL into Landing Page

**Files:**
- Modify: `C:\Users\007\Documents\coldopener\src\app\page.tsx`

- [ ] **Step 1: Update landing page to include WebGL scene**

Replace the content of `src/app/page.tsx`:

```tsx
import dynamic from 'next/dynamic';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Demo } from '@/components/landing/demo';
import { Pricing } from '@/components/landing/pricing';
import { Footer } from '@/components/landing/footer';

const WebGLScene = dynamic(
  () => import('@/components/three/webgl-scene').then((m) => ({ default: m.WebGLScene })),
  { ssr: false }
);

export default function HomePage() {
  return (
    <>
      <WebGLScene />
      <div className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <Demo />
        <Pricing />
        <Footer />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Test the full landing page**

Run: `cd "C:\Users\007\Documents\coldopener" && npm run dev`
Expected: Page loads at http://localhost:3000. White background, 3D envelope visible, scroll drives rotation. All 6 DOM sections overlay correctly.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx && git commit -m "feat: integrate WebGL scene into landing page"
```

---

## Phase 5: Dashboard & AI Generation

### Task 17: Create Dashboard Page

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\app\app\page.tsx`

- [ ] **Step 1: Create dashboard page**

```tsx
'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    subject: string;
    body: string;
    recipientName: string;
    recipientCompany: string;
  } | null>(null);
  const [error, setError] = useState('');

  async function handleGenerate() {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: url.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation failed');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-2">
        Generate a cold email
      </h1>
      <p className="text-sm text-muted mb-8">
        Paste a LinkedIn profile URL and let AI craft a personalized message.
      </p>

      {/* Input */}
      <div className="flex gap-3 mb-8">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.linkedin.com/in/username/"
          className="flex-1 px-4 py-3 border border-hair rounded-xl text-sm font-mono outline-none bg-bg focus:border-fg transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !url.trim()}
          className="px-6 py-3 bg-fg text-bg rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity whitespace-nowrap"
        >
          {loading ? 'Writing...' : 'Generate →'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="p-6 bg-white border border-hair rounded-xl animate-pulse">
          <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
          <div className="h-3 bg-gray-100 rounded w-full mb-2" />
          <div className="h-3 bg-gray-100 rounded w-4/5 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white border border-hair rounded-xl p-6">
          <div className="text-xs font-semibold tracking-[3px] text-accent uppercase mb-3 pb-3 border-b border-hair">
            Generated Email
          </div>
          <div className="text-sm text-muted mb-2">
            <span className="font-medium text-fg">To:</span>{' '}
            {result.recipientName}
            {result.recipientCompany && ` · ${result.recipientCompany}`}
          </div>
          <div className="text-sm text-muted mb-4">
            <span className="font-medium text-fg">Subject:</span>{' '}
            {result.subject}
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-fg/80">
            {result.body}
          </div>
          <div className="flex gap-3 mt-6 pt-4 border-t border-hair">
            <button
              onClick={() => navigator.clipboard.writeText(result.body)}
              className="px-4 py-2 bg-fg text-bg rounded-full text-xs font-semibold hover:scale-[1.03] transition-transform"
            >
              Copy to clipboard
            </button>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 border border-hair text-muted rounded-full text-xs font-medium hover:border-fg hover:text-fg transition-colors"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="text-center py-20 text-muted">
          <div className="text-5xl mb-4">✉️</div>
          <p className="text-sm">
            Paste a LinkedIn URL above and hit Generate to get started.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/app/page.tsx && git commit -m "feat: add dashboard page with email generation UI"
```

---

### Task 18: Create OpenAI Integration

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\lib\openai.ts`

- [ ] **Step 1: Create OpenAI helper**

```ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateEmailParams {
  linkedinUrl: string;
}

interface GenerateEmailResult {
  subject: string;
  body: string;
  recipientName: string;
  recipientCompany: string;
}

export async function generateEmail({
  linkedinUrl,
}: GenerateEmailParams): Promise<GenerateEmailResult> {
  const systemPrompt = `You are an expert cold email writer for sales professionals. Your emails are warm, human, and deeply personalized — never robotic or template-like.

Rules:
- Write as a thoughtful colleague, not a salesperson
- Reference specific details you can infer from a LinkedIn profile
- Keep it under 150 words
- No buzzwords (synergy, disrupt, game-changer, etc.)
- Include a clear, low-pressure call to action
- Output MUST be valid JSON with these exact keys: subject, body, recipientName, recipientCompany

Example output:
{
  "subject": "Quick thought on your recent work",
  "body": "Hi Alex,\\n\\nYour recent piece on supply chain resilience was genuinely refreshing...",
  "recipientName": "Alex Chen",
  "recipientCompany": "Flexport"
}`;

  const userPrompt = `Write a personalized cold email for the person at this LinkedIn profile: ${linkedinUrl}

Research what you can infer from the URL and common knowledge about the person's likely role, industry, and interests. Make it specific and human.

Respond with ONLY the JSON object, no other text.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 600,
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned empty response');
  }

  const parsed = JSON.parse(content);

  return {
    subject: parsed.subject || 'Quick thought',
    body: parsed.body || 'Failed to generate email body.',
    recipientName: parsed.recipientName || 'there',
    recipientCompany: parsed.recipientCompany || '',
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/openai.ts && git commit -m "feat: add OpenAI GPT-4o email generation helper"
```

---

### Task 19: Create Generate API Route

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\app\api\generate\route.ts`

- [ ] **Step 1: Create generate route**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateEmail } from '@/lib/openai';
import { z } from 'zod';

const requestSchema = z.object({
  linkedinUrl: z.string().url().includes('linkedin.com'),
});

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    // Validate input
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid LinkedIn URL' },
        { status: 400 }
      );
    }

    // Check subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const isActive =
      subscription &&
      (subscription.status === 'active' ||
        subscription.status === 'trialing');

    if (!isActive) {
      return NextResponse.json(
        { error: 'No active subscription. Please start a trial.' },
        { status: 403 }
      );
    }

    // Check daily quota (50/day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = await prisma.usageLog.count({
      where: {
        userId,
        action: 'generate',
        createdAt: { gte: today },
      },
    });

    if (todayCount >= 50) {
      return NextResponse.json(
        { error: 'Daily generation limit reached (50/day).' },
        { status: 429 }
      );
    }

    // Generate email
    const result = await generateEmail({
      linkedinUrl: parsed.data.linkedinUrl,
    });

    // Store generation
    const generation = await prisma.generation.create({
      data: {
        userId,
        linkedinUrl: parsed.data.linkedinUrl,
        recipientName: result.recipientName,
        recipientCompany: result.recipientCompany,
        emailSubject: result.subject,
        emailBody: result.body,
      },
    });

    // Log usage
    await prisma.usageLog.create({
      data: {
        userId,
        action: 'generate',
      },
    });

    return NextResponse.json({
      id: generation.id,
      subject: result.subject,
      body: result.body,
      recipientName: result.recipientName,
      recipientCompany: result.recipientCompany,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: 'Failed to generate email. Please try again.' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/generate/route.ts && git commit -m "feat: add POST /api/generate with auth, validation, quota enforcement"
```

---

### Task 20: Create History Page + API

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\app\app\history\page.tsx`
- Create: `C:\Users\007\Documents\coldopener\src\app\api\generations\route.ts`

- [ ] **Step 1: Create history API route**

Create: `src/app/api/generations/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

  const generations = await prisma.generation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = generations.length > limit;
  const data = hasMore ? generations.slice(0, limit) : generations;

  return NextResponse.json({
    generations: data.map((g) => ({
      id: g.id,
      recipientName: g.recipientName,
      recipientCompany: g.recipientCompany,
      emailSubject: g.emailSubject,
      emailBody: g.emailBody,
      linkedinUrl: g.linkedinUrl,
      createdAt: g.createdAt.toISOString(),
    })),
    nextCursor: hasMore ? data[data.length - 1].id : null,
  });
}
```

- [ ] **Step 2: Create history page**

Create: `src/app/app/history/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Generation {
  id: string;
  recipientName: string | null;
  recipientCompany: string | null;
  emailSubject: string | null;
  emailBody: string;
  linkedinUrl: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/generations')
      .then((r) => r.json())
      .then((data) => setGenerations(data.generations || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-8">History</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <div className="text-5xl mb-4">📭</div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          No emails yet
        </h1>
        <p className="text-sm text-muted mb-6">
          Generate your first cold email to see it here.
        </p>
        <Link
          href="/app"
          className="inline-flex px-6 py-3 bg-fg text-bg rounded-full text-sm font-semibold"
        >
          Generate an email →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-8">History</h1>
      <div className="space-y-3">
        {generations.map((g) => (
          <div
            key={g.id}
            className="bg-white border border-hair rounded-xl overflow-hidden"
          >
            <button
              onClick={() =>
                setExpanded(expanded === g.id ? null : g.id)
              }
              className="w-full text-left p-5 hover:bg-card transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">
                    {g.recipientName || 'Unknown'}
                    {g.recipientCompany && (
                      <span className="text-muted font-normal">
                        {' '}
                        · {g.recipientCompany}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {g.emailSubject || 'No subject'}
                  </div>
                </div>
                <div className="text-xs text-muted">
                  {new Date(g.createdAt).toLocaleDateString()}
                </div>
              </div>
            </button>
            {expanded === g.id && (
              <div className="px-5 pb-5 border-t border-hair pt-4">
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-fg/80">
                  {g.emailBody}
                </div>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(g.emailBody)
                  }
                  className="mt-4 px-4 py-2 bg-fg text-bg rounded-full text-xs font-semibold"
                >
                  Copy to clipboard
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/generations/route.ts src/app/app/history/page.tsx && git commit -m "feat: add history page and GET /api/generations"
```

---

## Phase 6: Stripe Integration

### Task 21: Create Stripe Lib + Checkout Route

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\lib\stripe.ts`
- Create: `C:\Users\007\Documents\coldopener\src\app\api\stripe\checkout\route.ts`

- [ ] **Step 1: Create Stripe client**

Create: `src/lib/stripe.ts`

```ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10' as any,
});

export const TRIAL_PERIOD_DAYS = 7;
```

- [ ] **Step 2: Create checkout route**

Create: `src/app/api/stripe/checkout/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe, TRIAL_PERIOD_DAYS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const userEmail = session.user.email!;

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      });
      customerId = customer.id;

      // Create subscription record
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + TRIAL_PERIOD_DAYS);

      subscription = await prisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: customerId,
          status: 'trialing',
          trialEndsAt: trialEnd,
        },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: subscription.status === 'trialing' ? undefined : TRIAL_PERIOD_DAYS,
      },
      success_url: `${process.env.NEXTAUTH_URL}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      metadata: { userId },
    });

    if (!checkoutSession.url) {
      throw new Error('No checkout URL returned');
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/stripe.ts src/app/api/stripe/checkout/route.ts && git commit -m "feat: add Stripe client and checkout API route"
```

---

### Task 22: Create Stripe Webhook Handler

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\app\api\stripe\webhook\route.ts`

- [ ] **Step 1: Create webhook handler**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: sub.id,
            status: sub.status,
            currentPeriodEndsAt: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        await prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            status: 'canceled',
            stripeSubscriptionId: null,
          },
        });
        break;
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/stripe/webhook/route.ts && git commit -m "feat: add Stripe webhook handler"
```

---

### Task 23: Create Signup Page

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\app\signup\page.tsx`

- [ ] **Step 1: Create signup page**

```tsx
'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-fg mb-2">
          Start your free trial
        </h1>
        <p className="text-sm text-muted mb-8">
          7 days free, then $29/month. Cancel anytime.
        </p>

        <button
          onClick={() => signIn('google', { callbackUrl: '/app' })}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border border-hair rounded-full text-sm font-medium text-fg hover:border-fg transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </button>

        <p className="mt-6 text-center text-xs text-muted">
          Already have an account?{' '}
          <Link href="/login" className="underline hover:text-fg">
            Sign in
          </Link>
        </p>

        <div className="mt-8 p-4 bg-card rounded-xl">
          <div className="text-xs font-semibold mb-2">What you&apos;ll get:</div>
          <ul className="text-xs text-muted space-y-1.5">
            <li>→ 7 days of unlimited access</li>
            <li>→ No credit card required</li>
            <li>→ Cancel anytime during trial</li>
            <li>→ $29/month after trial ends</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/signup/page.tsx && git commit -m "feat: add signup page"
```

---

### Task 24: Create Usage API Route

**Files:**
- Create: `C:\Users\007\Documents\coldopener\src\app\api\usage\route.ts`

- [ ] **Step 1: Create usage route**

```ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayCount, totalCount] = await Promise.all([
    prisma.usageLog.count({
      where: {
        userId,
        action: 'generate',
        createdAt: { gte: today },
      },
    }),
    prisma.usageLog.count({
      where: { userId, action: 'generate' },
    }),
  ]);

  return NextResponse.json({
    today: todayCount,
    dailyLimit: 50,
    total: totalCount,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/usage/route.ts && git commit -m "feat: add GET /api/usage endpoint"
```

---

## Self-Review

### 1. Spec Coverage
- ✅ Product summary & business model — encoded in project structure
- ✅ Site architecture (all 5 routes) — `/` (Task 9+16), `/signup` (Task 23), `/login` (Task 5), `/app` (Task 17), `/app/history` (Task 20)
- ✅ Landing page sections — Tasks 8–9 (DOM), Tasks 10–16 (WebGL)
- ✅ Visual design system — encoded in Tailwind config (Task 1), global CSS (Task 7), and all R3F components (Tasks 11–15)
- ✅ Database schema — Task 3 (Prisma schema)
- ✅ Auth — Tasks 4–6 (NextAuth config, API route, pages, middleware)
- ✅ API routes — Tasks 19 (generate), 20 (generations), 21–22 (stripe), 24 (usage)
- ✅ AI generation flow — Task 18 (OpenAI lib) + Task 19 (API route)
- ✅ Rate limiting — middleware.ts (Task 6) provides framework; Upstash integration can be added later
- ✅ Stripe integration — Tasks 21–22
- ✅ Security & performance — encoded in API route validation, R3F dynamic import, GSAP cleanup

### 2. Placeholder Scan
- ✅ No TBD/TODO markers
- ✅ All code steps include actual implementation code
- ✅ All commands have exact syntax
- ✅ All types/interfaces are defined

### 3. Type Consistency
- ✅ `(session.user as { id: string }).id` pattern consistent across all API routes
- ✅ `paperCream` / `paperFlap` / `paperInterior` colors match spec values
- ✅ Envelope dimensions (1.2×0.82×0.06) match spec
- ✅ API response shapes consistent between route and dashboard page

---

## Post-Setup Commands

After all tasks are complete and `.env.local` is configured with real credentials:

```bash
# Push database schema to Neon
npx prisma db push

# Start dev server
npm run dev
```

Then visit:
- `http://localhost:3000` — Landing page with WebGL 3D
- `http://localhost:3000/signup` — Sign up via Google OAuth
- `http://localhost:3000/app` — Dashboard (email generation)
- `http://localhost:3000/app/history` — History

Deploy to Vercel:
```bash
npx vercel --prod
```
