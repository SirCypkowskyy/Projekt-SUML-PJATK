import { Navbar } from '@/components/partials/navbar'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from 'sonner'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="flex-col gap-4">
        <Navbar className='flex w-full items-center justify-between p-4' />
        <Outlet />
        <TanStackRouterDevtools />
        <Toaster />
      </div>
    </>
  ),
})