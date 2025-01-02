import { useQuery } from '@tanstack/react-query';
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { isLoading, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      fetch('/api/data').then((res) =>
        res.json(),
      ),
  })

  return isLoading ? (
    <div className="p-4">Loading...</div>
  ) : error ? (
    <div className="p-4">An error has occurred: {error.message}</div>
  ) : (
    <div className="p-4">{JSON.stringify(data)}</div>
  )
}
