import { LoadingAnim } from '@/components/partials/loading-anim'
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/__authenticated')({
  beforeLoad: ({ context, location }) => {
    const { isAuthenticated, isLoading } = context.auth
    
    if (!isAuthenticated && !isLoading) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const { isLoading } = Route.useRouteContext().auth
  
  if (isLoading) {
    return <LoadingAnim className="fixed w-full h-full left-0 top-0" />
  }

  return <Outlet />
}
