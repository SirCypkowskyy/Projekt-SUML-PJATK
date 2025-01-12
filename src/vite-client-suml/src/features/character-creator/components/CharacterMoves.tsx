import React from 'react';
import { Button } from "@/components/ui/button";
import { X, Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Move } from '../types';

/**
 * Props dla komponentu CharacterMoves
 * @interface CharacterMovesProps
 */
interface CharacterMovesProps {
  /**
   * Lista dostępnych ruchów
   * @type {Move[]}
   */
  availableMoves: Move[];
  /**
   * Lista wybranych ruchów
   * @type {Move[]}
   */
  selectedMoves: Move[];
  /**
   * Czy jest edytowanie
   * @type {boolean}
   */
  isEditing: boolean;
  /**
   * Funkcja do wyboru ruchu
   * @type {(move: Move) => void}
   */
  onMoveSelect?: (move: Move) => void;
  /**
   * Funkcja do usuwania ruchu
   * @type {(move: Move) => void}
   */
  onMoveRemove?: (move: Move) => void;
}

/**
 * Komponent do wyboru ruchów postaci
 * @param {CharacterMovesProps} props - Props dla komponentu
 * @returns {JSX.Element}
 */
export const CharacterMoves: React.FC<CharacterMovesProps> = ({
  availableMoves,
  selectedMoves,
  isEditing,
  onMoveSelect,
  onMoveRemove,
}) => {
  const [open, setOpen] = React.useState(false);

  const renderMoveSelector = () => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={selectedMoves.length >= 2}
        >
          Wybierz ruch
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Szukaj ruchu..." />
          <CommandList>
            <CommandEmpty>Nie znaleziono ruchu.</CommandEmpty>
            <CommandGroup>
              {availableMoves
                .filter(move => !selectedMoves.find(m => m.name === move.name))
                .slice(0, 4)
                .map((move) => (
                  <TooltipProvider key={move.name}>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <div>
                          <CommandItem
                            onSelect={() => {
                              onMoveSelect?.(move);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedMoves.some(m => m.name === move.name)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {move.name}
                          </CommandItem>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="start">
                        <p className="max-w-xs whitespace-pre-wrap">{move.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  return (
    <div>
      <div className="space-y-4">
        {isEditing ? (
          <>
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Ruchy podstawowe (wybierz 2)</h3>
              <span className="text-sm text-muted-foreground">
                {selectedMoves.length}/2
              </span>
            </div>
            {renderMoveSelector()}
          </>
        ) : (
          <h3 className="font-semibold mb-3">Ruchy podstawowe</h3>
        )}

        <div className="space-y-2">
          {selectedMoves.map((move) => (
            <div
              key={move.name}
              className="flex items-start justify-between p-4 bg-muted rounded-lg"
            >
              <div>
                <h4 className="font-medium">{move.name}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {move.description}
                </p>
              </div>
              {isEditing && onMoveRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onMoveRemove(move)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};