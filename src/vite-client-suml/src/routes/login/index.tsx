import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginForm } from '@/components/partials/login-form'

export const Route = createFileRoute('/login/')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: () => {
    return (
      <div className="container relative min-h-[95vh] flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-[image:url('/login-img.jpg')] bg-cover bg-center bg-black bg-blend-darken bg-opacity-60 p-10 lg:flex dark:border-r">
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2 text-white">
              <p className="text-lg">
                &ldquo;Świat Apokalipsy to niedobór wszystkiego, wiesz jak jest...&rdquo;
              </p>
              <footer className="text-sm">Chopper</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <LoginForm />
          </div>
        </div>
      </div>
    )
  },
})
