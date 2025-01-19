import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, ArrowRight, Trash2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { getCharactersStats, getSavedCharacters, deleteCharacter } from '@/api'
import { toast } from "sonner"

interface SavedCharacter {
  id: number
  name: string
  character_class: string
  stats: Record<string, number>
  appearance: string
  description: string
  moves: Array<{
    name: string
    description: string
  }>
  equipment: Array<{
    name: string
    description: string
    isRemovable: boolean
    isWeapon: boolean
    options?: Array<{ name: string; effect: string }>
  }>
  created_at: string
  updated_at: string
}

interface CharactersStats {
  total: number
  this_month: number
}

export const Route = createFileRoute('/__authenticated/dashboard/')({
  component: RouteComponent,
})

function CharacterCard({ character }: { character: SavedCharacter }) {
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    if (window.confirm('Czy na pewno chcesz usunąć tę postać?')) {
      try {
        await deleteCharacter(character.id)
        await queryClient.invalidateQueries({ queryKey: ['saved-characters'] })
        await queryClient.invalidateQueries({ queryKey: ['characters-stats'] })
        toast.success("Postać została usunięta")
      } catch (error) {
        toast.error("Nie udało się usunąć postaci")
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{character.name}</CardTitle>
        <CardDescription>{character.character_class}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{character.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Utworzono: {character.created_at}
          </div>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Link to={`/character/${character.id}`}>
              <Button variant="outline" size="sm">
                Szczegóły
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RouteComponent() {
  const { data: stats, isLoading: isLoadingStats } = useQuery<CharactersStats>({
    queryKey: ['characters-stats'],
    queryFn: getCharactersStats,
  })

  const { data: characters, isLoading: isLoadingCharacters } = useQuery<SavedCharacter[]>({
    queryKey: ['saved-characters'],
    queryFn: getSavedCharacters,
  })

  return (
    <>
      <div className="p-8">
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Twoje Postacie</h1>
          <div className="flex items-center space-x-2">
            <Link to="/character-creator/">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nowa Postać
              </Button>
            </Link>
          </div>
        </div>
        <Tabs defaultValue="characters" className="space-y-4">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="characters">Wszystkie Postacie</TabsTrigger>
              <TabsTrigger value="favorites">Ulubione</TabsTrigger>
              <TabsTrigger value="recent">Ostatnio Edytowane</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="characters" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Wszystkie Postacie
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  {isLoadingStats ? (
                    <Skeleton className="h-8 w-full" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stats?.total || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.this_month || 0} utworzone w tym miesiącu
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>Ostatnio Utworzone Postacie</CardTitle>
                  <CardDescription>Twoje najnowsze kreacje</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCharacters ? (
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : characters && characters.length > 0 ? (
                    <div className="space-y-4">
                      {characters.slice(0, 5).map((character) => (
                        <CharacterCard key={character.id} character={character} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      Nie masz jeszcze żadnych postaci
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Szybkie Akcje</CardTitle>
                  <CardDescription>Popularne operacje</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link to="/character-creator/">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Stwórz nową postać
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="mr-2 h-4 w-4"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Importuj postać
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
