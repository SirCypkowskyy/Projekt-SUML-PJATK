import { Button } from '@/components/ui/button';
import { createLazyFileRoute, Link } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  // const { isLoading, error, data } = useQuery({
  //   queryKey: ['repoData'],
  //   queryFn: () =>
  //     fetch('/api/data').then((res) =>
  //       res.json(),
  //     ),
  // })

  // return isLoading ? (
  //   <div className="p-4">Loading...</div>
  // ) : error ? (
  //   <div className="p-4">An error has occurred: {error.message}</div>
  // ) : (
  //   <div className="p-4">{JSON.stringify(data)}</div>
  // )

  return (
    <>
      {/* Hero */}
      <div 
        className="relative overflow-hidden min-h-[100vh] flex items-center justify-center bg-cover bg-center before:absolute before:inset-0 before:bg-black/50 dark:before:bg-black/70 before:bg-opacity-50"
        style={{ backgroundImage: `url(main-page-bg.jpg)` }}
      >
        <div className="relative z-10">
          <div className="container flex justify-center">
            <div className="max-w-2xl text-center">
              <p className="text-white">
                Twój personalny
              </p>
              {/* Title */}
              <div className="mt-5 max-w-2xl">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-white">
                  Przewodnik Apokalipsy
                </h1>
              </div>
              {/* End Title */}
              <div className="mt-5 max-w-3xl">
                <p className="text-xl text-gray-200">
                  Z Przewodnikiem Apokalipsy możesz tworzyć i zarządzać swoimi postaciami w kampaniach RPG
                  w Świecie Apokalipsy (AW, ang. <i className="italic">Apocalypse World</i>)
                </p>
              </div>
              {/* Buttons */}
              <div className="mt-8 gap-3 flex justify-center">
                <Link to={"/login"}>
                  <Button size={"lg"}>Zaloguj się</Button>
                </Link>
                <Link to={"/about"}>
                  <Button size={"lg"} variant={"outline"}>
                    Dowiedz się więcej
                  </Button>
                </Link>
              </div>
              {/* End Buttons */}
            </div>
          </div>
        </div>
      </div>
      {/* End Hero */}
    </>
  );
}
