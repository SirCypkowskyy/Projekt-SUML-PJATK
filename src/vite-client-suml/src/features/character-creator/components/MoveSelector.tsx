import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, ReactElement } from "react";
import { Move } from "../types";
import { getAvailableMoves } from "../api";
import { CharacterClass } from "../constants/character";

/**
 * Props dla komponentu MoveSelector
 * @interface
 * @property {CharacterClass} characterClass - Klasa postaci
 * @property {Move[]} selectedMoves - Wybrane ruchy
 * @property {(moves: Move[]) => void} onMovesChange - Funkcja zmieniająca wybrane ruchy
 */
interface MoveSelectorProps {
    /**
     * Klasa postaci
     * @type {CharacterClass}
     */
    characterClass: CharacterClass;
    /**
     * Wybrane ruchy
     * @type {Move[]}
     */
    selectedMoves: Move[];
    /**
     * Funkcja zmieniająca wybrane ruchy
     * @type {(moves: Move[]) => void}
     */
    onMovesChange: (moves: Move[]) => void;
}

/**
 * Komponent wyświetlający selektor ruchów
 * @param {MoveSelectorProps} props - Props komponentu
 * @returns {JSX.Element} - Element JSX
 */
export function MoveSelector({
    characterClass,
    selectedMoves,
    onMovesChange,
}: MoveSelectorProps): ReactElement {
    const [open, setOpen] = useState(false);
    const availableMoves = getAvailableMoves(characterClass);

    /**
     * Funkcja obsługująca wybranie ruchu
     * @param {Move} move - Ruch do wybrania
     */
    const handleMoveSelect = (move: Move) => {
        if (selectedMoves.length < 2) {
            onMovesChange([...selectedMoves, move]);
        }
    };

    /**
     * Funkcja obsługująca usuwanie ruchu
     * @param {Move} moveToRemove - Ruch do usunięcia
     */
    const handleMoveRemove = (moveToRemove: Move) => {
        onMovesChange(selectedMoves.filter((move) => move.name !== moveToRemove.name));
    };

    return (
        <div className="space-y-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={selectedMoves.length >= 2}
                    >
                        <span>
                            {selectedMoves.length === 0
                                ? "Wybierz ruchy"
                                : `Wybrano ${selectedMoves.length} ${selectedMoves.length === 1 ? "ruch" : "ruchy"
                                }`}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Szukaj ruchu..." />
                        <CommandEmpty>Nie znaleziono ruchu.</CommandEmpty>
                        <CommandGroup>
                            {availableMoves.map((move) => {
                                const isSelected = selectedMoves.some(
                                    (selected) => selected.name === move.name
                                );
                                return (
                                    <CommandItem
                                        key={move.name}
                                        onSelect={() => {
                                            if (isSelected) {
                                                handleMoveRemove(move);
                                            } else {
                                                handleMoveSelect(move);
                                            }
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{move.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {move.description}
                                            </span>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Wybrane ruchy */}
            <div className="space-y-2">
                {selectedMoves.map((move) => (
                    <div
                        key={move.name}
                        className="flex items-start justify-between p-3 bg-muted rounded-lg"
                    >
                        <div className="space-y-1">
                            <h4 className="font-medium">{move.name}</h4>
                            <p className="text-sm text-muted-foreground">
                                {move.description}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveRemove(move)}
                            className="ml-2"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}