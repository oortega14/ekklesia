import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { routeTree } from './routeTree.gen'
import { AuthProvider } from './lib/auth/context'
import { I18nProvider } from './lib/i18n'
import { LocaleSync } from '@/lib/i18n/locale-sync'
import { NotificationsProvider } from '@/lib/notifications/provider'
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
      <Toaster richColors position="top-right" />
      <I18nProvider>
        <AuthProvider>
          <LocaleSync />
          <NotificationsProvider>
            <RouterProvider router={router} />
          </NotificationsProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  </StrictMode>
)
