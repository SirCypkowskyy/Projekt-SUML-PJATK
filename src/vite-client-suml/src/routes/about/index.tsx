import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className="p-4">
    <h1 className="text-xl">O stronie</h1>
    <p className="mt-2">
      Poniższa aplikacja jest aplikacją zaliczeniową z projektu na przedmiot SUML na PJATK.
    </p>

    <h3 className="text-lg mt-4">Członkowie zespołu</h3>
    <div className="mt-2">
      Cyprian Gburek,
      Julia Bochen,
      Oleksandr Zimenko
      </div>
  </div>
}
