# ColdOpener — Product Design Spec

**Date:** 2026-05-28 (Updated 2026-06-02 — Visual direction pivot)
**Domain:** coldopener.co
**Status:** Design finalized — ready for implementation

---

## 1. Product Summary

ColdOpener is an AI-powered cold email generator. Users paste a LinkedIn profile URL, and the AI researches the prospect's background to craft a hyper-personalized, human-sounding email in seconds. No templates. No generic filler.

**Core value proposition:** Cold emails that feel human. Deep personalization at one-click speed.

**Target audience:** Sales professionals, founders, freelancers, recruiters.

---

## 2. Business Model

- **7-day free trial** — full access, no credit card required at signup
- **$29/month** subscription via Stripe
- Stripe manages trial expiry and recurring billing
- Customer portal for self-service cancellation

---

## 3. Site Architecture

| Route | Page | Purpose |
|-------|------|---------|
| `/` | Landing | Hero, demo, features, pricing, FAQ |
| `/signup` | Sign Up | Email + password registration, auto-activates trial |
| `/login` | Log In | Email + password, optional Google OAuth |
| `/app` | Dashboard | Main product: input URL, generate, preview, edit, copy |
| `/app/history` | History | Past generations, search, reuse |

---

## 4. Landing Page Sections (`/`)

The landing page uses a layered architecture:
- **WebGL layer** (`z-index: 1`): Fixed Three.js canvas rendering 3D paper objects (envelope, paper plane, letter, small envelope). Objects animate via GSAP ScrollTrigger — the main envelope flips 360° around X-axis as user scrolls, paper plane swoops in arcs, letter drifts, small envelope orbits.
- **DOM layer** (`z-index: 10`): Scrollable text sections with brutalist typography overlaid on the 3D scene.

| # | Section | Content |
|---|---------|---------|
| 1 | **Hero** | Headline: "Cold emails that feel human". Subtext. Two CTAs: "Start free trial" (filled black pill), "Watch demo" (outline pill). Scroll hint at bottom. |
| 2 | **Features** | 3-card grid: Deep Research, One Click, Human Tone. Warm grey cards (#F5F4F0) with accent number labels. |
| 3 | **How It Works** | 3-step horizontal sequence: Paste URL → AI writes → Send & convert. Large numeral indicators, minimal descriptions. |
| 4 | **Demo** | Interactive email generator card. LinkedIn URL input + Generate button. Mock email preview renders inline on input. |
| 5 | **Pricing** | Single plan card: $29/month, 7-day free trial, no credit card. Feature list with arrow bullets. CTA button. |
| 6 | **Footer** | Black background, white text. Site name, link list, copyright. |

---

## 5. Product Pages

### Dashboard (`/app`)

- **Input Panel:** Single text input (LinkedIn URL) + Generate button
- **Loading state:** Skeleton shimmer with estimated time (~3s)
- **Email Preview:** Generated email with subject line, body, recipient name. Editable inline.
- **Actions:** Copy to clipboard, Regenerate, Save to history
- **Empty state:** Placeholder text guiding first-time users

### History (`/app/history`)

- Table/list of past generations
- Each entry: recipient name, company, date, email preview snippet
- Click to expand full email, copy, or reuse prompt
- Search/filter by name or company

### Auth Pages (`/signup`, `/login`)

- Minimal forms (email, password, name)
- Google OAuth as secondary option
- Post-signup redirect to `/app` with "trial activated" toast
- Rate limited: 5 attempts per IP per minute

---

## 6. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + CSS Modules for animation-heavy components |
| Animation | GSAP ScrollTrigger (scroll-driven) + Framer Motion (UI micro-interactions) |
| 3D Rendering | Three.js via React Three Fiber (R3F) + Drei helpers |
| Database | Neon (Serverless PostgreSQL) |
| ORM | Prisma |
| Auth | NextAuth.js (credentials + Google OAuth) |
| Payments | Stripe (checkout session + webhooks + customer portal) |
| AI | OpenAI GPT-4o (server-side, via API route) |
| Rate Limiting | Upstash Redis (per-user + per-IP) |
| Deployment | Vercel |
| Domain | coldopener.co (Namecheap → Vercel DNS) |

---

## 7. Database Schema

```sql
-- Managed by NextAuth.js
-- accounts, sessions, users, verification_tokens

-- Extended user profile
model Profile {
  id         String   @id @default(cuid())
  userId     String   @unique
  fullName   String?
  avatarUrl  String?
  createdAt  DateTime @default(now())
}

-- Email generation records
model Generation {
  id               String   @id @default(cuid())
  userId           String
  linkedinUrl      String
  recipientName    String?
  recipientCompany String?
  emailSubject     String?
  emailBody        String
  createdAt        DateTime @default(now())

  @@index([userId, createdAt])
}

-- Stripe subscriptions
model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  stripeCustomerId     String   @unique
  stripeSubscriptionId String?  @unique
  status               String   @default("trialing") // trialing, active, past_due, canceled
  trialEndsAt          DateTime
  currentPeriodEndsAt  DateTime?
  createdAt            DateTime @default(now())
}

-- Usage tracking (for rate limiting)
model UsageLog {
  id          String   @id @default(cuid())
  userId      String
  action      String   // "generate", "regenerate"
  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
}
```

---

## 8. API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/auth/*` | ALL | No | NextAuth.js handler |
| `/api/generate` | POST | Yes | Accept LinkedIn URL, return generated email |
| `/api/generations` | GET | Yes | List user's past generations (paginated) |
| `/api/generations/[id]` | GET | Yes | Get single generation detail |
| `/api/stripe/checkout` | POST | Yes | Create Stripe checkout session |
| `/api/stripe/webhook` | POST | No | Stripe event handler |
| `/api/usage` | GET | Yes | Current usage stats for the user |

### Rate Limiting

- `/api/generate`: 3 requests/minute/user, 50 requests/day/user
- `/api/auth/*`: 5 requests/minute/IP
- `/api/stripe/*`: 10 requests/minute/IP

---

## 9. AI Email Generation Flow

```
1. User submits LinkedIn URL → POST /api/generate
2. Server validates:
   - User authenticated
   - Subscription active or in trial
   - Daily quota not exceeded (50/day)
   - Rate limit not exceeded (3/min)
3. Server calls OpenAI GPT-4o:
   - System prompt: "You are an expert cold email writer..."
   - User message: LinkedIn profile data + generation instructions
   - Max tokens: 600
4. Server stores Generation record in database
5. Server increments UsageLog counter
6. Returns { subject, body, recipientName, recipientCompany } to client
```

**OpenAI prompt design:**
- System: Defines tone (warm, human, not salesy), formatting rules, what to avoid
- User: LinkedIn URL context + specific instructions
- Output format: JSON with subject and body fields

---

## 10. Visual Design System

### Design Language: Brutalist Minimalism + WebGL 3D

Inspired by Silencio design studio — pure white canvas, bold typography, scroll-driven 3D product animations. The page conveys premium quality through restraint: no gradients, no particles, no glass morphism. Just white space, black text, and meticulously crafted 3D paper objects that respond to scroll.

### Color Palette

| Role | Value | Usage |
|------|-------|-------|
| Page background | `#FCFCFA` | Body, canvas background, fog |
| Text primary | `#111111` | Headlines, body text |
| Text muted | `#8A8A85` | Descriptions, secondary text |
| Card background | `#F5F4F0` | Feature cards, demo card |
| Hairline border | `#E8E6E1` | Card borders, dividers, scroll lines |
| Warm accent | `#D4C9B8` | Section numbers, wax seal, subtle warmth |
| Footer background | `#111111` | Footer only |
| Footer text | `#FFFFFF` | Footer text, links |

### Typography

- **Primary:** Inter, -apple-system, BlinkMacSystemFont, sans-serif
- **Monospace:** 'SF Mono', 'Fira Code', 'Cascadia Code' (inputs)
- **Headlines:** 800 weight, -2.5 to -3.5px letter-spacing, 0.92–0.98 line-height
  - Hero: `clamp(48px, 9vw, 104px)` — largest
  - Section H2: `clamp(40px, 7vw, 80px)`
- **Body:** 400 weight, 16–18px, 1.6–1.7 line-height, muted color
- **Section labels:** 11px, 600 weight, 5px letter-spacing, warm accent color

### WebGL 3D Background Layer

**Architecture:**
- Fixed `<canvas>` element, `position: fixed; z-index: 1; pointer-events: none`
- React Three Fiber (R3F) renders the scene inside a Next.js client component
- DOM content scrolls above at `z-index: 10`
- Camera: PerspectiveCamera FOV 42°, positioned at (0, 0.1, 6.5)

**3D Objects (email/paper themed):**

| Object | Geometry | Material | Role |
|--------|----------|----------|------|
| Main Envelope | BoxGeometry 1.2×0.82×0.06 + triangular flap | `#FAFAF8`, roughness 0.38, metalness 0 | Center hero — flips 360° rotateX on scroll |
| Paper Plane | Custom BufferGeometry (6 triangular faces) | `#FCFCFA`, roughness 0.24, metalness 0.04 | Dynamic flyer — arcs across scene |
| Folded Letter | Thin BoxGeometry 0.65×0.48×0.018 + folded half | `#FAFAF8`, roughness 0.48, metalness 0 | Drifting element |
| Small Envelope | Scaled-down envelope 0.48×0.34×0.035 | Same as main envelope | Orbiting background element |

**Envelope DIY Details (on main envelope face):**
- V-shaped opening crease (two diagonal thin boxes)
- Stamp (nested boxes, top-right corner, warm tone `#F0ECE4`)
- Postmark (TorusGeometry ring + cancel wave lines over stamp)
- Return address lines (3 thin boxes, top-left)
- Recipient address lines (3 thin boxes, center-lower)
- Air mail border stripes (top and bottom edges)
- Wax seal (CylinderGeometry, `#D4C9B8`, roughness 0.2, metalness 0.35) on flap

**Lighting:**
- Ambient: `#FFFAF5`, intensity 1.6 — warm fill
- Key: Directional `#FFF8F0`, intensity 4.0 — warm white, casts shadows (2048×2048 shadow map)
- Fill: Directional `#F0F4FF`, intensity 1.0 — cool contrast from opposite side
- Rim: Directional `#FFF5EB`, intensity 2.2 — backlight separation
- Top accent: Directional `#FFFFFF`, intensity 0.8 — subtle highlights

**Post-Processing:**
- ACESFilmicToneMapping, exposure 1.1
- PCFSoftShadowMap for soft shadows
- White fog (near: 7, far: 22) for depth fade
- Ground shadow catcher plane (ShadowMaterial, opacity 0.2)

### Scroll-Driven Animation (GSAP ScrollTrigger)

A single GSAP timeline scrubbed across the full page scroll (`scrub: 1.0`):

| Scroll % | Main Envelope | Paper Plane | Letter | Small Envelope |
|----------|--------------|-------------|--------|----------------|
| 0–30% | rotateX 0→180°, Y wobble +0.6, drift up | Swoop left, rotate | Drift right, unfold | Orbit to left |
| 30–70% | rotateX 180→540°, Y wobble −0.5, drift down | Swoop right, bank | Drift left, refold | Orbit to right |
| 70–100% | rotateX 540→738°, settle +0.2, return | Ease out | Settle | Settle |

Additional subtle elements: 2 tiny diamond sparkles (OctahedronGeometry, pure white) float independently.

### Component Style

- **Buttons (primary):** Black `#111` fill, white `#FCFCFA` text, 100px border-radius pill. Hover: scale(1.03), box-shadow 0 12px 36px rgba(0,0,0,0.12)
- **Buttons (ghost):** Transparent, 1.5px `#E8E6E1` border, muted text. Hover: border → `#111`, text → `#111`
- **Cards:** `#F5F4F0` background, 16px border-radius. Hover: background → `#EFEEEA`
- **Inputs:** White/off-white, 1px `#E8E6E1` border, 12px border-radius, monospace font. Focus: border → `#111`
- **Section layout:** 100vh min-height, 56px horizontal padding, flexbox column centered
- **Dividers:** 60px × 1px `#E8E6E1` horizontal rule between section label and heading

### Motion Language

- Scroll-driven 3D: GSAP ScrollTrigger with scrub — smooth, physics-accurate feel
- UI micro-interactions: Framer Motion spring animations for hover, focus, mount
- No auto-playing animations — everything tied to scroll position
- No particles, no floating elements (except 2 diamond sparkles)
- Page transitions: minimal, Instant with Next.js App Router

---

## 11. Security & Performance

### Security
- OpenAI API key: server-side only, never exposed to client
- All API routes (except auth, webhooks) require authentication
- Input validation: URL format check, max length, sanitization
- CORS: restricted to coldopener.co only
- Rate limiting at multiple levels (middleware + Upstash)

### Performance
- **Landing page:** Static generation (no SSR needed — no dynamic data on landing). R3F canvas loaded as client component with `dynamic(() => import(...), { ssr: false })`
- **WebGL:** Single `requestAnimationFrame` loop via R3F `useFrame`. Renderer paused when tab blurred (visibility change). PCFSoftShadowMap with 2048×2048 shadow map (balance quality vs performance). Pixel ratio capped at 2.
- **GSAP:** Single ScrollTrigger timeline, scrubbed. No `requestAnimationFrame` polling — GSAP uses internal timing.
- **Fonts:** `next/font` with Inter from Google Fonts (subset to latin). Monospace via system stack (no download).
- **Images:** `next/image` with WebP/AVIF optimization, priority flag on hero LCP image.
- **API responses:** Cached where appropriate (history list). OpenAI calls streamed to client for perceived speed.
- **Bundle splitting:** Three.js (~140 KB gzipped), GSAP (~30 KB), and R3F (~20 KB) loaded as separate chunks. Landing page code-split from app dashboard code.

---

## 12. Launch Checklist

- [ ] Vercel project created, connected to coldopener.co
- [ ] Neon database provisioned, schema migrated
- [ ] NextAuth.js configured with Google OAuth credentials
- [ ] Stripe account activated, webhook endpoint configured
- [ ] OpenAI API key set in Vercel environment variables
- [ ] Upstash Redis instance provisioned
- [ ] R3F WebGL scene: envelope geometry, lighting, materials validated across devices
- [ ] GSAP ScrollTrigger: animation timeline tested, no jank on mobile
- [ ] WebGL fallback: static image poster for devices without WebGL support
- [ ] Mobile: reduced geometry segments, simplified shadows for performance
- [ ] Rate limiting tested and confirmed
- [ ] All pages responsive (mobile, tablet, desktop)
- [ ] Lighthouse score ≥ 90 (performance, accessibility, SEO)
- [ ] Trial → paid → cancel flow tested end-to-end
