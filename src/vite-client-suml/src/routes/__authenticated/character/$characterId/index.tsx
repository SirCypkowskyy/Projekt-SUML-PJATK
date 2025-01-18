import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCharacter, updateCharacter, getAvailableMoves } from '@/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { CharacterForm } from '@/features/character-creator/components/CharacterForm'
import { useState } from 'react'
import { toast } from "sonner"
import { CharacterStats, GeneratedCharacter } from '@/features/character-creator/types'
import { CharacterClass } from '@/features/character-creator/constants/character'

export const Route = createFileRoute('/__authenticated/character/$characterId/')({
    component: CharacterDetails,
})

function CharacterDetails() {
    const { characterId } = Route.useParams()
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [showCharacterImage, setShowCharacterImage] = useState(false)
    const [editedCharacter, setEditedCharacter] = useState<GeneratedCharacter | null>(null)

    const { data: character, isLoading, error } = useQuery({
        queryKey: ['character', characterId],
        queryFn: () => getCharacter(parseInt(characterId)),
        retry: false
    })

    const updateMutation = useMutation({
        mutationFn: (updatedCharacter: any) => updateCharacter(parseInt(characterId), updatedCharacter),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['character', characterId] })
            toast.success("Postać została zaktualizowana")
            setIsEditing(false)
        },
        onError: (error) => {
            toast.error("Nie udało się zaktualizować postaci, pojawił się błąd: " + error)
        }
    })

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-[200px]" />
                    <Skeleton className="h-[200px]" />
                </div>
            </div>
        )
    }

    if (error || !character) {
        return (
            <div className="p-8">
                <Link to="/dashboard">
                    <Button variant="outline" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Powrót do listy postaci
                    </Button>
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle>Błąd</CardTitle>
                        <CardDescription>Nie udało się załadować postaci</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    const handleSaveCharacter = async () => {
        if (editedCharacter) {
            await updateMutation.mutateAsync(editedCharacter)
        }
    }

    if (isEditing) {
        return (
            <div className="p-8">
                <Button variant="outline" className="mb-4" onClick={() => setIsEditing(false)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Powrót do szczegółów
                </Button>
                <CharacterForm
                    character={editedCharacter || {
                        name: character.name,
                        characterClass: character.character_class as CharacterClass,
                        stats: character.stats as CharacterStats,
                        appearance: character.appearance,
                        description: character.description,
                        moves: character.moves,
                        equipment: character.equipment
                    }}
                    isEditing={true}
                    showCharacterImage={showCharacterImage}
                    onCharacterChange={(updatedCharacter) => {
                        setEditedCharacter(updatedCharacter);
                    }}
                    getAvailableMoves={getAvailableMoves}
                    onEditToggle={() => setIsEditing(!isEditing)}
                    onShowImage={() => setShowCharacterImage(true)}
                    onRestart={() => { }}
                    onSave={handleSaveCharacter}
                />
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-4">
                <Link to="/dashboard">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Powrót do listy postaci
                    </Button>
                </Link>
                <Button onClick={() => setIsEditing(true)}>
                    Edytuj postać
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{character.name}</CardTitle>
                        <CardDescription>{character.character_class}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">Opis</h3>
                                <p className="text-sm text-muted-foreground">{character.description}</p>
                            </div>
                            <div>
                                <h3 className="font-medium mb-2">Wygląd</h3>
                                <p className="text-sm text-muted-foreground">{character.appearance}</p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Utworzono: {character.created_at}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Statystyki</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(character.stats).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                    <span className="font-medium capitalize">{key}</span>
                                    <span>{value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ruchy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {character.moves.map((move: any, index: number) => (
                                <div key={index}>
                                    <h3 className="font-medium">{move.name}</h3>
                                    <p className="text-sm text-muted-foreground">{move.description}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ekwipunek</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {character.equipment.map((item: any, index: number) => (
                                <div key={index}>
                                    <h3 className="font-medium">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">{item.description}</p>
                                    {item.options && item.options.length > 0 && (
                                        <div className="mt-2">
                                            <h4 className="text-sm font-medium">Opcje:</h4>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                {item.options.map((option: any, optionIndex: number) => (
                                                    <li key={optionIndex}>
                                                        {option.name}: {option.effect}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
