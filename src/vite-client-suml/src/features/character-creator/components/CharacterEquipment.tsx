import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Equipment } from '../types';

/**
 * Props dla komponentu CharacterEquipment
 * @interface CharacterEquipmentProps
 */
interface CharacterEquipmentProps {
    /**
     * Lista wybranych przedmiotów
     * @type {Equipment[]}
     */
    equipment: Equipment[];
    /**
     * Czy jest edytowalne
     * @type {boolean}
     */
    isEditing: boolean;
    /**
     * Funkcja do usuwania przedmiotu
     * @type {(item: Equipment) => void}
     */
    onEquipmentRemove?: (item: Equipment) => void;
    /**
     * Funkcja do dodawania broni
     * @type {() => void}
     */
    onAddWeapon?: () => void;
}

/**
 * Komponent wyświetlający sprzęt postaci
 * @param {CharacterEquipmentProps} props - Props dla komponentu
 * @returns {JSX.Element} - Element JSX
 */
export const CharacterEquipment: React.FC<CharacterEquipmentProps> = ({
    equipment,
    isEditing,
    onEquipmentRemove,
    onAddWeapon,
}) => {
    return (
        <div>
            <h3 className="font-semibold mb-3">Sprzęt</h3>
            {isEditing ? (
                <div className="space-y-4">
                    <div className="space-y-2">
                        {equipment.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center justify-between p-4 bg-muted rounded-lg"
                            >
                                <div>
                                    <h4 className="font-medium">{item.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                                {item.isRemovable && onEquipmentRemove && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onEquipmentRemove(item)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    {onAddWeapon && (
                        <Button variant="outline" onClick={onAddWeapon} className="w-full">
                            Dodaj broń
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {equipment.map((item) => (
                        <Card key={item.name} className="bg-muted">
                            <CardContent className="p-3">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {item.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};