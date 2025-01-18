import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { ReactElement, useState } from "react";
import { getAvailableMoves } from "../api";
import { CharacterClass } from "../constants/character";
import { useQuery } from "@tanstack/react-query";
import { Move } from "../types";

/**
 * Props dla komponentu MoveSelector
 * @interface
 * @property {CharacterClass} characterClass - Klasa postaci
 * @property {Move[]} selectedMoves - Wybrane ruchy
 * @property {(move: Move) => void} onMoveSelect - Funkcja zmieniająca wybrane ruchy
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
     * @type {(move: Move) => void}
     */
    onMoveSelect: (move: Move) => void;
}

/**
 * Komponent wyświetlający selektor ruchów
 * @param {MoveSelectorProps} props - Props komponentu
 * @returns {JSX.Element} - Element JSX
 */
export function MoveSelector({
    characterClass,
    selectedMoves,
    onMoveSelect
}: MoveSelectorProps): ReactElement {
    const [open, setOpen] = useState(false);

    const { data: availableMoves, isLoading } = useQuery({
        queryKey: ['availableMoves', characterClass],
        queryFn: () => getAvailableMoves(characterClass),
        enabled: open
    });

    if (isLoading) {
        return <p>Loading...</p>
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    <span>
                        {selectedMoves.length > 0
                            ? `Wybrano ${selectedMoves.length} ruchów`
                            : "Wybierz ruchy"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Szukaj ruchu..." />
                    <CommandEmpty>Nie znaleziono ruchu.</CommandEmpty>
                    <CommandGroup>
                        {availableMoves?.map((move: Move) => {
                            const isSelected = selectedMoves.some(
                                (selected) => selected.name === move.name
                            );

                            return (
                                <CommandItem
                                    key={move.name}
                                    onSelect={() => {
                                        onMoveSelect(move);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            isSelected ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col gap-1">
                                        <div className="font-medium">{move.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {move.description}
                                        </div>
                                    </div>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}