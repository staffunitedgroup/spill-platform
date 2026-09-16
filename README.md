# SPILL Platform

> Mobile-first global brand platform for **SPILL** locations, media, events, and the **SPILL 42** in-venue social experience.

---

## 🌟 Overview

**SPILL** is a modern lifestyle and hospitality brand built around offline human connection: *People · Coffee · Stories*. The SPILL platform serves as the digital front door for global SPILL venues, cultural programming, and interactive tabletop experiences.

### Core Pillars

1. **Global Venues & City Chapters**: Discover flagship spaces, starting with Saigon, upcoming outposts like Tokyo, and future market inquiries.
2. **SPILL 42**: An in-venue tabletop web companion designed to spark genuine conversation between guests through 4 modes: **Ask**, **Do**, **Notice**, and **Dare**.
3. **Brand & Manifesto**: Championing third-space culture where real connection happens offline over coffee, food, drinks, and music.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & custom CSS design tokens
- **Typography**: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) via `next/font/google`
- **PWA**: Web App Manifest (`public/manifest.webmanifest`) configured for standalone mobile viewing
- **CI/CD**: GitHub Actions workflow running linting, type-generation checks, and production builds

---

## 📁 Repository Structure

```text
spill-platform/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI pipeline (lint, typecheck, build)
├── public/
│   └── manifest.webmanifest    # Standalone PWA manifest
├── src/
│   └── app/
│       ├── spill-42/
│       │   └── page.tsx        # SPILL 42 interactive in-venue experience
│       ├── globals.css         # Brand design system, tokens, and responsive styles
│       ├── layout.tsx          # Root layout, fonts, SEO metadata & theme color
│       └── page.tsx            # Main landing page (hero, locations, SPILL 42 teaser, manifesto)
├── .env.example                # Sample environment variables
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and npm scripts
├── postcss.config.mjs          # PostCSS configuration for Tailwind CSS v4
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20` or `v22` LTS recommended (matches GitHub Actions CI runtime)
- **Package Manager**: `npm` (bundled with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/xuanquynhphamvu/spill-platform.git
   cd spill-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

### Running the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Launches the development server with hot reloading |
| `build` | `next build` | Compiles an optimized production build |
| `start` | `next start` | Runs the production server after building |
| `lint` | `eslint .` | Lints codebase using Next.js ESLint configuration |
| `typecheck` | `next typegen && tsc --noEmit` | Generates Next.js route types and performs TypeScript type validation |

---

## 📱 Features & Highlights

### 1. SPILL Landing Experience (`/`)
- **Editorial Design System**: High-contrast dark aesthetic (`#090909`), vibrant accent colors (`#ff1838`, `#00d9ef`), and typography powered by Space Grotesk.
- **Locations Directory**: Displays status across active hubs (Saigon), upcoming markets (Tokyo), and partner inquiries.
- **Responsive Layout**: Fluid clamp typography and adaptive grids optimized for devices ranging from small smartphones to ultrawide desktops.

### 2. SPILL 42 In-Venue Web Companion (`/spill-42`)
- **Tabletop Deck**: Mobile-first cards designed for two or more people sharing a table.
- **The 4 Categories**:
  - `ASK`: Thoughtful questions breaking the surface.
  - `DO`: Playful in-the-moment table challenges.
  - `NOTICE`: Mindfulness and observing shared surroundings.
  - `DARE`: Bold prompts for adventurous connection.
- **Smooth Interactions**: Progress tracker (1 to 42 prompts), card state handling, and accessible ARIA live-regions.

---

## 🛡️ Quality & CI/CD Pipeline

Every pull request and push to `main` triggers automated checks on Ubuntu runners:
1. **Dependencies**: `npm ci` for deterministic package installation.
2. **Lint**: ESLint checks for syntax and best practices.
3. **Typecheck**: `next typegen && tsc --noEmit` ensures route definitions and TypeScript safety.
4. **Build**: `next build` ensures zero static generation errors.

---

## 🗺️ Roadmap

- [ ] Complete 42-prompt deck for the SPILL 42 companion app.
- [ ] Multilingual support (Vietnamese, Japanese, English).
- [ ] Supabase database integration for live location hours, events, and community stories.
- [ ] In-venue tabletop QR code routing with quick check-in.
- [ ] Offline caching via Service Worker / PWA enhancements.

---

## 📄 License

Private repository. All rights reserved by **SPILL**.
