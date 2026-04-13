# Migrate Next.js → Vite + TanStack Router + TanStack Query

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Next.js with Vite + TanStack Router + TanStack Query, preserving all existing UI and auth logic without regressions.

**Architecture:** Vite serves a pure SPA. TanStack Router handles file-based routing with layout routes per role. TanStack Query is installed for future API calls but not wired to existing mock data (that comes later). All existing components, hooks, and lib files move to `src/` with minimal edits.

**Tech Stack:** Vite 6, React 19, TypeScript, TanStack Router v1 (file-based), TanStack Query v5, Axios, Tailwind v4, shadcn/ui

---

## File Map

### Created
- `index.html` — Vite HTML entry point (replaces Next.js implicit HTML)
- `vite.config.ts` — Vite + TanStack Router Vite plugin config
- `src/vite-env.d.ts` — Vite type reference
- `src/main.tsx` — App bootstrap: mounts RouterProvider + QueryClientProvider + providers
- `src/routes/__root.tsx` — TanStack Router root layout (thin wrapper)
- `src/routes/index.tsx` — Login page (from `app/page.tsx`)
- `src/routes/lead-pastor.tsx` — Layout route: ProtectedRoute for lead_pastor
- `src/routes/lead-pastor/index.tsx` — Dashboard (from `app/lead-pastor/page.tsx`)
- `src/routes/lead-pastor/churches.tsx` — (from `app/lead-pastor/churches/page.tsx`)
- `src/routes/lead-pastor/pastors.tsx` — (from `app/lead-pastor/pastors/page.tsx`)
- `src/routes/lead-pastor/services.tsx` — (from `app/lead-pastor/services/page.tsx`)
- `src/routes/lead-pastor/statistics.tsx` — (from `app/lead-pastor/statistics/page.tsx`)
- `src/routes/pastor.tsx` — Layout route: ProtectedRoute for pastor
- `src/routes/pastor/index.tsx` — (from `app/pastor/page.tsx`)
- `src/routes/pastor/assistants.tsx` — (from `app/pastor/assistants/page.tsx`)
- `src/routes/pastor/attendance.tsx` — (from `app/pastor/attendance/page.tsx`)
- `src/routes/pastor/reports.tsx` — (from `app/pastor/reports/page.tsx`)
- `src/routes/pastor/statistics.tsx` — (from `app/pastor/statistics/page.tsx`)
- `src/routes/assistant.tsx` — Layout route: ProtectedRoute for assistant
- `src/routes/assistant/index.tsx` — (from `app/assistant/page.tsx`)
- `src/routes/assistant/reports.tsx` — (from `app/assistant/reports/page.tsx`)
- `src/routes/superadmin.tsx` — Layout route: ProtectedRoute for superadmin
- `src/routes/superadmin/index.tsx` — (from `app/superadmin/page.tsx`)
- `src/routes/superadmin/churches.tsx` — (from `app/superadmin/churches/page.tsx`)
- `src/routes/superadmin/reports.tsx` — (from `app/superadmin/reports/page.tsx`)
- `src/routes/superadmin/statistics.tsx` — (from `app/superadmin/statistics/page.tsx`)
- `src/routes/superadmin/users.tsx` — (from `app/superadmin/users/page.tsx`)

### Moved (no logic changes, only path)
- `components/` → `src/components/`
- `hooks/` → `src/hooks/`
- `lib/` → `src/lib/` (with edits in auth files and client.ts)
- `styles/globals.css` (currently at `app/globals.css`) → `src/styles/globals.css`

### Modified
- `tsconfig.json` — Remove Next.js plugin, fix paths alias `@/*` → `./src/*`, fix includes
- `package.json` — Remove `next`, `@vercel/analytics`; add Vite + TanStack packages; update scripts
- `components.json` — Update `tailwind.css` path to `src/styles/globals.css`
- `src/lib/api/client.ts` — `process.env.NEXT_PUBLIC_API_URL` → `import.meta.env.VITE_API_URL`
- `src/lib/auth/context.tsx` — `useRouter` (next/navigation) → `useNavigate` (@tanstack/react-router)
- `src/lib/auth/guard.tsx` — `useRouter` (next/navigation) → `useNavigate` (@tanstack/react-router)
- `postcss.config.mjs` — stays at root, no changes needed

### Deleted
- `app/` — entire directory (all pages move to `src/routes/`)
- `next.config.mjs`
- `next-env.d.ts`
- `.next/` (build cache)

---

## Task 1: Install packages and remove Next.js

**Files:** `package.json`

- [ ] **Step 1: Remove Next.js packages**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
pnpm remove next @vercel/analytics
```

- [ ] **Step 2: Install Vite and TanStack packages**

```bash
pnpm add @tanstack/react-router @tanstack/react-query @tanstack/react-query-devtools
pnpm add -D vite @vitejs/plugin-react @tanstack/router-plugin
```

- [ ] **Step 3: Update scripts in package.json**

Open `package.json` and replace the `scripts` block:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: replace next.js with vite + tanstack router/query"
```

---

## Task 2: Create Vite config and HTML entry

**Files:**
- Create: `vite.config.ts`
- Create: `index.html`

- [ ] **Step 1: Create vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes' }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Create index.html**

```html
<!DOCTYPE html>
<html lang="es" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icon-dark-32x32.png" media="(prefers-color-scheme: dark)" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icon-light-32x32.png" media="(prefers-color-scheme: light)" />
    <link rel="apple-touch-icon" href="/apple-icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
    <title>Iglesia Digital - Plataforma de Gestion</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts index.html
git commit -m "chore: add vite config and html entry point"
```

---

## Task 3: Update tsconfig.json

**Files:** Modify `tsconfig.json`

- [ ] **Step 1: Replace tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 2: Commit**

```bash
git add tsconfig.json
git commit -m "chore: update tsconfig for vite (remove next plugin, fix paths)"
```

---

## Task 4: Move source files to src/

**Files:** Move directories `components/`, `hooks/`, `lib/` to `src/`; move `app/globals.css` to `src/styles/globals.css`

- [ ] **Step 1: Create src/ directory structure and move files**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
mkdir -p src/styles src/routes
mv components src/components
mv hooks src/hooks
mv lib src/lib
mkdir -p src/styles
cp app/globals.css src/styles/globals.css
```

- [ ] **Step 2: Create src/vite-env.d.ts**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 3: Update components.json — change CSS path**

In `components.json`, change:
```json
"css": "app/globals.css",
```
to:
```json
"css": "src/styles/globals.css",
```

- [ ] **Step 4: Commit**

```bash
git add src/ components.json
git commit -m "chore: move source files into src/"
```

---

## Task 5: Update lib files — remove Next.js imports

**Files:**
- Modify: `src/lib/api/client.ts`
- Modify: `src/lib/auth/context.tsx`
- Modify: `src/lib/auth/guard.tsx`

- [ ] **Step 1: Update api/client.ts — replace env var**

In `src/lib/api/client.ts`, change:
```ts
baseURL: process.env.NEXT_PUBLIC_API_URL,
```
to:
```ts
baseURL: import.meta.env.VITE_API_URL,
```

- [ ] **Step 2: Update auth/context.tsx — replace next/navigation**

Replace the entire file `src/lib/auth/context.tsx`:

```tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { useNavigate } from '@tanstack/react-router'
import apiClient, { setAccessToken, setAuthCallbacks } from '@/lib/api/client'

// ── Types ─────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number
  email: string
  role: 'superadmin' | 'lead_pastor' | 'pastor' | 'assistant'
  ministry_id: number | null
  church_id: number | null
  first_name: string
  last_name: string
  full_name: string
  phone: string | null
}

interface AuthContextType {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// ── Helpers ───────────────────────────────────────────────────────────
const REFRESH_KEY = 'ekklesia_refresh'

function rolePath(role: string): string {
  const map: Record<string, string> = {
    superadmin: '/superadmin',
    lead_pastor: '/lead-pastor',
    pastor: '/pastor',
    assistant: '/assistant',
  }
  return map[role] ?? '/'
}

// ── Context ───────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const updateToken = useCallback((token: string | null) => {
    setAccessTokenState(token)
    setAccessToken(token)
  }, [])

  const doLogout = useCallback(() => {
    localStorage.removeItem(REFRESH_KEY)
    updateToken(null)
    setUser(null)
    navigate({ to: '/', replace: true })
  }, [updateToken, navigate])

  const refreshTokenFn = useCallback(async (): Promise<string | null> => {
    const stored = localStorage.getItem(REFRESH_KEY)
    if (!stored) return null
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: stored }),
        }
      )
      if (!res.ok) return null
      const data = await res.json()
      updateToken(data.access_token)
      return data.access_token
    } catch {
      return null
    }
  }, [updateToken])

  useEffect(() => {
    setAuthCallbacks({
      onRefreshToken: refreshTokenFn,
      onLogout: doLogout,
    })
  }, [refreshTokenFn, doLogout])

  useEffect(() => {
    const hydrate = async () => {
      const stored = localStorage.getItem(REFRESH_KEY)
      if (!stored) {
        setIsLoading(false)
        return
      }
      try {
        const newToken = await refreshTokenFn()
        if (!newToken) {
          localStorage.removeItem(REFRESH_KEY)
          setIsLoading(false)
          return
        }
        const { data } = await apiClient.get('/api/v1/auth/me')
        setUser(data.user)
      } catch {
        localStorage.removeItem(REFRESH_KEY)
      } finally {
        setIsLoading(false)
      }
    }
    hydrate()
  }, [refreshTokenFn])

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await apiClient.post('/api/v1/auth/login', {
        login: email,
        password,
      })
      localStorage.setItem(REFRESH_KEY, data.refresh_token)
      updateToken(data.access_token)
      const me = await apiClient.get('/api/v1/auth/me')
      const userData: AuthUser = me.data.user
      setUser(userData)
      navigate({ to: rolePath(userData.role) })
    },
    [updateToken, navigate]
  )

  const logout = useCallback(async () => {
    try {
      await apiClient.delete('/api/v1/auth/logout')
    } catch {
      // best-effort
    }
    doLogout()
  }, [doLogout])

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
```

- [ ] **Step 3: Update auth/guard.tsx — replace next/navigation**

Replace the entire file `src/lib/auth/guard.tsx`:

```tsx
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth/context'

type Role = 'superadmin' | 'lead_pastor' | 'pastor' | 'assistant'

const ROLE_PATHS: Record<Role, string> = {
  superadmin:  '/superadmin',
  lead_pastor: '/lead-pastor',
  pastor:      '/pastor',
  assistant:   '/assistant',
}

interface ProtectedRouteProps {
  role: Role
  children: React.ReactNode
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      navigate({ to: '/', replace: true })
      return
    }
    if (user.role !== role) {
      navigate({ to: ROLE_PATHS[user.role as Role] ?? '/', replace: true })
    }
  }, [user, isLoading, role, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || user.role !== role) return null

  return <>{children}</>
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/
git commit -m "fix: replace next/navigation and NEXT_PUBLIC_ env vars with tanstack router"
```

---

## Task 6: Create main.tsx and root route

**Files:**
- Create: `src/main.tsx`
- Create: `src/routes/__root.tsx`

- [ ] **Step 1: Create src/routes/__root.tsx**

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => <Outlet />,
})
```

- [ ] **Step 2: Create src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { AuthProvider } from './lib/auth/context'
import { I18nProvider } from './lib/i18n'
import './styles/globals.css'

const queryClient = new QueryClient()

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  </StrictMode>
)
```

> Note: `routeTree.gen.ts` is auto-generated by the TanStack Router Vite plugin on first `vite dev` run. It will not exist yet — that's fine. The build generates it.

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx src/routes/__root.tsx
git commit -m "feat: add tanstack router entry point and root route"
```

---

## Task 7: Create login route

**Files:**
- Create: `src/routes/index.tsx` (from `app/page.tsx`)

- [ ] **Step 1: Create src/routes/index.tsx**

Copy `app/page.tsx` to `src/routes/index.tsx`, then:

1. Remove the `"use client"` directive at the top
2. Replace the `createFileRoute` export at the top of the component:

Add this before the existing component code:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: LoginPage,
})
```

The rest of the file (all the component code starting from `function AnimatedDove`) stays identical. The final file structure:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
// ... all existing imports from app/page.tsx ...

export const Route = createFileRoute('/')({
  component: LoginPage,
})

function AnimatedDove({ className }: { className?: string }) {
  // ... exact same as app/page.tsx ...
}

function FloatingParticles() {
  // ... exact same as app/page.tsx ...
}

function LoginLanguageSwitcher() {
  // ... exact same as app/page.tsx ...
}

export default function LoginPage() {
  // ... exact same as app/page.tsx ...
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/index.tsx
git commit -m "feat: add login route"
```

---

## Task 8: Create role layout routes

**Files:**
- Create: `src/routes/lead-pastor.tsx`
- Create: `src/routes/pastor.tsx`
- Create: `src/routes/assistant.tsx`
- Create: `src/routes/superadmin.tsx`

- [ ] **Step 1: Create src/routes/lead-pastor.tsx**

```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '@/lib/auth/guard'

export const Route = createFileRoute('/lead-pastor')({
  component: () => (
    <ProtectedRoute role="lead_pastor">
      <Outlet />
    </ProtectedRoute>
  ),
})
```

- [ ] **Step 2: Create src/routes/pastor.tsx**

```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '@/lib/auth/guard'

export const Route = createFileRoute('/pastor')({
  component: () => (
    <ProtectedRoute role="pastor">
      <Outlet />
    </ProtectedRoute>
  ),
})
```

- [ ] **Step 3: Create src/routes/assistant.tsx**

```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '@/lib/auth/guard'

export const Route = createFileRoute('/assistant')({
  component: () => (
    <ProtectedRoute role="assistant">
      <Outlet />
    </ProtectedRoute>
  ),
})
```

- [ ] **Step 4: Create src/routes/superadmin.tsx**

```tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { ProtectedRoute } from '@/lib/auth/guard'

export const Route = createFileRoute('/superadmin')({
  component: () => (
    <ProtectedRoute role="superadmin">
      <Outlet />
    </ProtectedRoute>
  ),
})
```

- [ ] **Step 5: Commit**

```bash
git add src/routes/lead-pastor.tsx src/routes/pastor.tsx src/routes/assistant.tsx src/routes/superadmin.tsx
git commit -m "feat: add role layout routes with protected route guards"
```

---

## Task 9: Create lead-pastor page routes

**Files:**
- Create: `src/routes/lead-pastor/index.tsx` (from `app/lead-pastor/page.tsx`)
- Create: `src/routes/lead-pastor/churches.tsx` (from `app/lead-pastor/churches/page.tsx`)
- Create: `src/routes/lead-pastor/pastors.tsx` (from `app/lead-pastor/pastors/page.tsx`)
- Create: `src/routes/lead-pastor/services.tsx` (from `app/lead-pastor/services/page.tsx`)
- Create: `src/routes/lead-pastor/statistics.tsx` (from `app/lead-pastor/statistics/page.tsx`)

**Pattern for each file:** Copy the source page, remove `"use client"`, add the `createFileRoute` export.

- [ ] **Step 1: Create src/routes/lead-pastor/index.tsx**

```bash
mkdir -p src/routes/lead-pastor
```

Copy `app/lead-pastor/page.tsx` to `src/routes/lead-pastor/index.tsx`. Remove `"use client"` line. Add at top after imports:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lead-pastor/')({
  component: LeadPastorDashboard,  // use the actual default export function name
})
```

Change `export default function X` to just `function X` (the route handles the export).

- [ ] **Step 2: Create src/routes/lead-pastor/churches.tsx**

Copy `app/lead-pastor/churches/page.tsx` to `src/routes/lead-pastor/churches.tsx`. Remove `"use client"`. Add:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lead-pastor/churches')({
  component: PastorPrincipalIglesias,
})
```

Change `export default function PastorPrincipalIglesias` to `function PastorPrincipalIglesias`.

- [ ] **Step 3: Create src/routes/lead-pastor/pastors.tsx**

Copy `app/lead-pastor/pastors/page.tsx` to `src/routes/lead-pastor/pastors.tsx`. Remove `"use client"`. Add:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lead-pastor/pastors')({
  component: LeadPastorPastores,  // actual function name from the file
})
```

Change `export default function X` to `function X`.

- [ ] **Step 4: Create src/routes/lead-pastor/services.tsx**

Copy `app/lead-pastor/services/page.tsx` to `src/routes/lead-pastor/services.tsx`. Remove `"use client"`. Add:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lead-pastor/services')({
  component: LeadPastorServicios,  // actual function name from the file
})
```

Change `export default function X` to `function X`.

- [ ] **Step 5: Create src/routes/lead-pastor/statistics.tsx**

Copy `app/lead-pastor/statistics/page.tsx` to `src/routes/lead-pastor/statistics.tsx`. Remove `"use client"`. Add:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lead-pastor/statistics')({
  component: LeadPastorEstadisticas,  // actual function name from the file
})
```

Change `export default function X` to `function X`.

- [ ] **Step 6: Commit**

```bash
git add src/routes/lead-pastor/
git commit -m "feat: add lead-pastor page routes"
```

---

## Task 10: Create pastor page routes

**Files:**
- Create: `src/routes/pastor/index.tsx`
- Create: `src/routes/pastor/assistants.tsx`
- Create: `src/routes/pastor/attendance.tsx`
- Create: `src/routes/pastor/reports.tsx`
- Create: `src/routes/pastor/statistics.tsx`

**Pattern:** Same as Task 9 — copy source page, remove `"use client"`, add `createFileRoute`, change `export default function` to `function`.

- [ ] **Step 1: Create all pastor routes**

```bash
mkdir -p src/routes/pastor
```

For each file, the `createFileRoute` path is:
- `app/pastor/page.tsx` → `src/routes/pastor/index.tsx` → path `'/pastor/'`
- `app/pastor/assistants/page.tsx` → `src/routes/pastor/assistants.tsx` → path `'/pastor/assistants'`
- `app/pastor/attendance/page.tsx` → `src/routes/pastor/attendance.tsx` → path `'/pastor/attendance'`
- `app/pastor/reports/page.tsx` → `src/routes/pastor/reports.tsx` → path `'/pastor/reports'`
- `app/pastor/statistics/page.tsx` → `src/routes/pastor/statistics.tsx` → path `'/pastor/statistics'`

Each file follows this pattern:
```tsx
import { createFileRoute } from '@tanstack/react-router'
// ... rest of original imports ...

export const Route = createFileRoute('/pastor/X')({
  component: ComponentFunctionName,
})

function ComponentFunctionName() {
  // exact body from original export default function
}
```

- [ ] **Step 2: Commit**

```bash
git add src/routes/pastor/
git commit -m "feat: add pastor page routes"
```

---

## Task 11: Create assistant and superadmin page routes

**Files:**
- Create: `src/routes/assistant/index.tsx`
- Create: `src/routes/assistant/reports.tsx`
- Create: `src/routes/superadmin/index.tsx`
- Create: `src/routes/superadmin/churches.tsx`
- Create: `src/routes/superadmin/reports.tsx`
- Create: `src/routes/superadmin/statistics.tsx`
- Create: `src/routes/superadmin/users.tsx`

**Pattern:** Same as Tasks 9 and 10.

- [ ] **Step 1: Create all assistant routes**

```bash
mkdir -p src/routes/assistant
```

Routes:
- `app/assistant/page.tsx` → `src/routes/assistant/index.tsx` → path `'/assistant/'`
- `app/assistant/reports/page.tsx` → `src/routes/assistant/reports.tsx` → path `'/assistant/reports'`

- [ ] **Step 2: Create all superadmin routes**

```bash
mkdir -p src/routes/superadmin
```

Routes:
- `app/superadmin/page.tsx` → `src/routes/superadmin/index.tsx` → path `'/superadmin/'`
- `app/superadmin/churches/page.tsx` → `src/routes/superadmin/churches.tsx` → path `'/superadmin/churches'`
- `app/superadmin/reports/page.tsx` → `src/routes/superadmin/reports.tsx` → path `'/superadmin/reports'`
- `app/superadmin/statistics/page.tsx` → `src/routes/superadmin/statistics.tsx` → path `'/superadmin/statistics'`
- `app/superadmin/users/page.tsx` → `src/routes/superadmin/users.tsx` → path `'/superadmin/users'`

- [ ] **Step 3: Commit**

```bash
git add src/routes/assistant/ src/routes/superadmin/
git commit -m "feat: add assistant and superadmin page routes"
```

---

## Task 12: Create .env file and run dev server

**Files:**
- Create: `.env` (or `.env.local`)

- [ ] **Step 1: Create .env**

```bash
# .env
VITE_API_URL=http://localhost:3000
```

If there's an existing `.env.local` with `NEXT_PUBLIC_API_URL`, copy the value and rename the key:
```bash
# Old: NEXT_PUBLIC_API_URL=http://localhost:3000
# New:
VITE_API_URL=http://localhost:3000
```

- [ ] **Step 2: Run dev server — verify routeTree.gen.ts is generated**

```bash
pnpm dev
```

Expected: Vite starts, TanStack Router plugin generates `src/routeTree.gen.ts`, dev server opens at `http://localhost:5173`.

If you see TypeScript errors about `routeTree.gen` not found, wait for the first build to complete — the plugin generates it.

- [ ] **Step 3: Verify login page renders**

Open `http://localhost:5173` in a browser. Expected: login page renders with the animated dove, floating particles, and login form.

- [ ] **Step 4: Verify navigation works**

With the dev server running, open DevTools console. No errors about `next/navigation` or `NEXT_PUBLIC_` should appear.

- [ ] **Step 5: Add routeTree.gen.ts to .gitignore**

```bash
echo "src/routeTree.gen.ts" >> .gitignore
```

- [ ] **Step 6: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add vite env config and ignore generated routeTree"
```

---

## Task 13: Delete Next.js artifacts and run production build

- [ ] **Step 1: Delete Next.js files**

```bash
cd /Users/oscarortega/work/ekklesia/ekklesia-client
rm -rf app next.config.mjs next-env.d.ts .next tsconfig.tsbuildinfo
```

- [ ] **Step 2: Run production build**

```bash
pnpm build
```

Expected output:
```
vite build
✓ built in X.XXs
dist/index.html
dist/assets/index-[hash].js
dist/assets/index-[hash].css
```

If TypeScript errors appear, fix them before proceeding (they are likely `strict` mode catches from things Next.js was silently ignoring via `ignoreBuildErrors: true`).

- [ ] **Step 3: Verify preview build**

```bash
pnpm preview
```

Open `http://localhost:4173`. Login page should render correctly.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: remove next.js artifacts, migration complete"
```

---

## Sidebar nav links — verify paths match

The `Sidebar` component (`src/components/dashboard/sidebar.tsx`) likely uses `next/link` or `href` strings for navigation. After migration, internal links should use TanStack Router's `<Link>` component.

Search for any remaining `next/link` or `next/navigation` imports after migration:

```bash
grep -r "next/link\|next/navigation\|next/router" src/ --include="*.tsx" --include="*.ts"
```

If any appear, replace:
```tsx
// Before:
import Link from 'next/link'
<Link href="/lead-pastor/churches">...</Link>

// After:
import { Link } from '@tanstack/react-router'
<Link to="/lead-pastor/churches">...</Link>
```

---

## Quick reference — TanStack Router vs Next.js equivalents

| Next.js | TanStack Router |
|---|---|
| `useRouter().push('/path')` | `useNavigate()({ to: '/path' })` |
| `useRouter().replace('/path')` | `useNavigate()({ to: '/path', replace: true })` |
| `import Link from 'next/link'` | `import { Link } from '@tanstack/react-router'` |
| `<Link href="/path">` | `<Link to="/path">` |
| `export default function Page()` | `function Page()` + `Route = createFileRoute(...)` |
| `"use client"` | (remove — everything is client by default in Vite) |
| `process.env.NEXT_PUBLIC_X` | `import.meta.env.VITE_X` |
