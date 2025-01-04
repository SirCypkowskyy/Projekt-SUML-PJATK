import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createRouter, Router, RouterProvider } from '@tanstack/react-router'
import './index.css'
import { routeTree } from './routeTree.gen'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CookiesProvider } from 'react-cookie'
import { AuthProvider, useAuth } from '@/providers/auth-provider'
import { ThemeProvider } from './providers/theme-provider'
import { handleServerError } from '@/lib/utils'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof Router
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return true;
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      handleServerError(error)
    },
  }),
})


/* eslint-disable */
function InnerApp() {
  const auth = useAuth()
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    context: {
      auth,
      queryClient,
    },
  })

  return <RouterProvider router={router} />
}

function App() {
  return (
    <StrictMode>
      <CookiesProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <InnerApp />
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </CookiesProvider>
    </StrictMode>
  )
}

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
}