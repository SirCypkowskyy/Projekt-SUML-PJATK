import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Undo2, FileEdit, FileDown, Wand2 } from "lucide-react";
import { CharacterStats } from './CharacterStats';
import { CharacterMoves } from './CharacterMoves';
import { CharacterEquipment } from './CharacterEquipment';
import { WeaponDialog } from './WeaponDialog';
import { useWeaponCreation } from '../hooks/useWeaponCreation';
import { GeneratedCharacter, Move } from '../types';
import { AVAILABLE_CLASSES, CharacterClass } from '../constants/character';
import { getAvailableMoves } from '../api';
import { useQuery } from '@tanstack/react-query';

interface CharacterFormProps {
    character: GeneratedCharacter;
    isEditing: boolean;
    showCharacterImage: boolean;
    getAvailableMoves: (characterClass: CharacterClass) => Promise<Move[]>;
    onCharacterChange: (character: GeneratedCharacter) => void;
    onEditToggle: () => void;
    onShowImage: () => void;
    onRestart: () => void;
    onSave: () => void;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({
    character,
    isEditing,
    showCharacterImage,
    onCharacterChange,
    onEditToggle,
    onShowImage,
    onRestart,
    onSave
}) => {
    const {
        isWeaponDialogOpen,
        openWeaponDialog,
        closeWeaponDialog,
    } = useWeaponCreation();

    const handleStatChange = (key: keyof typeof character.stats, value: number) => {
        onCharacterChange({
            ...character,
            stats: { ...character.stats, [key]: value },
        });
    };

    const handleMoveSelect = (move: typeof character.moves[0]) => {
        if (character.moves.length < 2) {
            onCharacterChange({
                ...character,
                moves: [...character.moves, move],
            });
        }
    };

    const handleMoveRemove = (moveToRemove: typeof character.moves[0]) => {
        onCharacterChange({
            ...character,
            moves: character.moves.filter(move => move.name !== moveToRemove.name),
        });
    };

    const handleEquipmentRemove = (itemToRemove: typeof character.equipment[0]) => {
        onCharacterChange({
            ...character,
            equipment: character.equipment.filter(item => item.name !== itemToRemove.name),
        });
    };

    const handleWeaponCreate = (newWeapon: { name: string; description: string }) => {
        onCharacterChange({
            ...character,
            equipment: [
                ...character.equipment,
                { ...newWeapon, isRemovable: true },
            ],
        });
    };

    const { data: availableMoves, isLoading: availableMovesLoading } = useQuery({
        queryKey: ['availableMoves', character.characterClass],
        queryFn: () => getAvailableMoves(character.characterClass),
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <Card className="border-2 shadow-lg bg-card">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                        {/* Left column - character data */}
                        <div className="space-y-6">
                            {/* Basic info */}
                            <div className="space-y-2">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={character.name}
                                        onChange={(e) =>
                                            onCharacterChange({
                                                ...character,
                                                name: e.target.value,
                                            })
                                        }
                                        className="w-full text-2xl font-semibold bg-background p-2 rounded-md"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-semibold">{character.name}</h2>
                                )}
                                {isEditing ? (
                                    <Select
                                        value={character.characterClass}
                                        onValueChange={(value: CharacterClass) =>
                                            onCharacterChange({
                                                ...character,
                                                characterClass: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Wybierz klasę" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AVAILABLE_CLASSES.map((cls) => (
                                                <SelectItem key={cls} value={cls}>
                                                    {cls}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Badge className="text-lg" variant="secondary">
                                        {character.characterClass}
                                    </Badge>
                                )}
                            </div>

                            {/* Appearance and description */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">Wygląd</h3>
                                    {isEditing ? (
                                        <Textarea
                                            value={character.appearance}
                                            onChange={(e) =>
                                                onCharacterChange({
                                                    ...character,
                                                    appearance: e.target.value,
                                                })
                                            }
                                            className="min-h-[100px]"
                                        />
                                    ) : (
                                        <p className="text-muted-foreground">{character.appearance}</p>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Opis</h3>
                                    {isEditing ? (
                                        <Textarea
                                            value={character.description}
                                            onChange={(e) =>
                                                onCharacterChange({
                                                    ...character,
                                                    description: e.target.value,
                                                })
                                            }
                                            className="min-h-[100px]"
                                        />
                                    ) : (
                                        <p className="text-muted-foreground">{character.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Stats */}
                            <CharacterStats
                                stats={character.stats}
                                isEditing={isEditing}
                                onStatChange={handleStatChange}
                            />
                            {availableMovesLoading ? <p>Loading...</p> : (
                                <CharacterMoves
                                    availableMoves={availableMoves || []}
                                    selectedMoves={character.moves}
                                    isEditing={isEditing}
                                    onMoveSelect={handleMoveSelect}
                                    onMoveRemove={handleMoveRemove}
                                />
                            )}

                            {/* Equipment */}
                            <CharacterEquipment
                                equipment={character.equipment}
                                isEditing={isEditing}
                                onEquipmentRemove={handleEquipmentRemove}
                                onAddWeapon={() => openWeaponDialog(character.characterClass)}
                            />
                        </div>

                        {/* Right column - character image */}
                        <div className="relative">
                            {showCharacterImage ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="sticky top-6"
                                >
                                    <div className="aspect-[2/3] relative">
                                        <img
                                            src={character.characterImageUrl || "https://placehold.co/600x400"}
                                            alt="Character visualization"
                                            className="rounded-lg object-cover w-full h-full"
                                        />
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                                    <p className="text-muted-foreground text-center p-4">
                                        Kliknij "Wygeneruj wizerunek" aby zobaczyć postać
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex flex-col justify-between">
                <div className="flex flex-wrap gap-4 justify-center">
                    <Button
                        variant="outline"
                        className="shadow-sm"
                        onClick={onRestart}
                    >
                        <Undo2 className="mr-2 h-4 w-4" />
                        Nowa postać
                    </Button>

                    <Button
                        variant="outline"
                        className="shadow-sm"
                        onClick={(e) => {
                            e.preventDefault();
                            onShowImage();
                        }}
                        disabled={showCharacterImage}
                    >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Wygeneruj wizerunek
                    </Button>

                    <Button
                        variant="outline"
                        className="shadow-sm"
                        onClick={onEditToggle}
                    >
                        <FileEdit className="mr-2 h-4 w-4" />
                        {isEditing ? "Zapisz zmiany" : "Modyfikuj postać"}
                    </Button>

                    <Button variant="outline" className="shadow-sm">
                        <FileDown className="mr-2 h-4 w-4" />
                        Eksportuj do PDF
                    </Button>
                </div>
                <div className="flex flex-row justify-center py-2">
                    <Button onClick={onSave} className="shadow-sm">
                        Zapisz postać
                    </Button>
                </div>
            </div>

            <WeaponDialog
                isOpen={isWeaponDialogOpen}
                onClose={closeWeaponDialog}
                characterClass={character.characterClass}
                onWeaponCreate={handleWeaponCreate}
            />
        </motion.div>
    );
};