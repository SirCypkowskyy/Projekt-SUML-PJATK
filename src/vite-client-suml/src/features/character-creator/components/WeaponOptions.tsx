import { Button } from "@/components/ui/button";
import { EquipmentOption } from "../types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactElement } from "react";

/**
 * Props dla komponentu WeaponOptions
 * @interface
 * @property {EquipmentOption[]} options - Lista dostępnych opcji
 * @property {EquipmentOption[]} selectedOptions - Wybrane opcje
 * @property {Function} onOptionToggle - Funkcja aktualizująca wybrane opcje
 * @property {boolean} canSelectMoreOptions - Czy można wybrać więcej opcji
 */
type WeaponOptionsProps = {
    /**
     * Lista dostępnych opcji
     */
    options: EquipmentOption[];
    /**
     * Wybrane opcje
     */
    selectedOptions: EquipmentOption[];
    /**
     * Funkcja aktualizująca wybrane opcje
     */
    onOptionToggle: (option: EquipmentOption) => void;
    /**
     * Czy można wybrać więcej opcji
     */
    canSelectMoreOptions: boolean;
}

/**
 * Komponent wyświetlający opcje broni
 * @param {WeaponOptionsProps} props - Props komponentu
 * @returns {ReactElement} - Komponent wyświetlający opcje broni
 */
export function WeaponOptions({
    options,
    selectedOptions,
    onOptionToggle,
    canSelectMoreOptions
}: WeaponOptionsProps): ReactElement {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-medium">Modyfikacje broni (max. 2)</h4>
                <span className="text-sm text-muted-foreground">
                    {selectedOptions.length}/2
                </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {options.map((option) => {
                    const isSelected = selectedOptions.some(
                        (selected) => selected.name === option.name
                    );
                    return (
                        <Button
                            key={option.name}
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                                "justify-start",
                                isSelected && "bg-primary text-primary-foreground"
                            )}
                            onClick={() => onOptionToggle(option)}
                            disabled={!isSelected && !canSelectMoreOptions}
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <div className="flex flex-col items-start">
                                <span>{option.name}</span>
                                <span className="text-sm text-muted-foreground">
                                    {option.effect}
                                </span>
                            </div>
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}