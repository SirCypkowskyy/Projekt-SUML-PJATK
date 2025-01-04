import { Navbar } from '@/components/partials/navbar'
import NotFoundError from '@/features/errors/not-found-error'
import GeneralError from '@/features/errors/general-error'
import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from 'sonner'
import { AuthContextType } from '@/providers/auth-provider'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient,
  auth: AuthContextType
}>()({
  component: () => (
    <>
      <div className="flex-col gap-4">
        <Navbar className='sticky top-0 z-10 flex w-full items-center justify-between p-4 bg-background/80 backdrop-filter backdrop-blur-lg border-b border-border' />
        <Outlet />
        {import.meta.env.MODE === 'development' && (
          <>
            <TanStackRouterDevtools position='bottom-right' />
          </>
        )}
        <Toaster />
      </div>
    </>
  ),
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})