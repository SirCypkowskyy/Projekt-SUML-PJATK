import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getAvailableWeapons } from '../api';
import { Equipment } from '../types';
import { EquipmentOption } from '../types';
import { CharacterClass } from '../constants/character';
import { useQuery } from '@tanstack/react-query';

interface WeaponDialogProps {
    isOpen: boolean;
    onClose: () => void;
    characterClass: CharacterClass;
    onWeaponCreate: (weapon: { name: string; description: string }) => void;
}

export const WeaponDialog: React.FC<WeaponDialogProps> = ({
    isOpen,
    onClose,
    characterClass,
    onWeaponCreate,
}) => {
    const [selectedBase, setSelectedBase] = React.useState<Equipment | null>(null);
    const [selectedOptions, setSelectedOptions] = React.useState<EquipmentOption[]>([]);

    const { data: weapons = [], isLoading } = useQuery({
        queryKey: ['weapons', characterClass],
        queryFn: () => getAvailableWeapons(characterClass),
        enabled: isOpen,
    });

    const handleCreateWeapon = () => {
        if (selectedBase) {
            const weapon = {
                name: selectedOptions.length > 0 
                    ? `${selectedBase.name} ${selectedOptions.map(o => o.name).join(", ")}`
                    : selectedBase.name,
                description: selectedOptions.length > 0
                    ? `${selectedBase.description} ${selectedOptions.map(o => o.effect).join(", ")}`
                    : selectedBase.description,
            };
            onWeaponCreate(weapon);
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedBase(null);
        setSelectedOptions([]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Stwórz broń</DialogTitle>
                    <DialogDescription>
                        Wybierz podstawę broni i opcjonalne modyfikacje
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <h4 className="font-medium">Podstawa broni</h4>
                        {isLoading ? (
                            <div className="text-center p-4">
                                <p className="text-sm text-muted-foreground">Ładowanie broni...</p>
                            </div>
                        ) : (
                            <Select
                                onValueChange={(value) => {
                                    const weapon = weapons.find(w => w.name === value);
                                    setSelectedBase(weapon ?? null);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Wybierz podstawę broni" />
                                </SelectTrigger>
                                <SelectContent>
                                    {weapons.map((weapon) => (
                                        <SelectItem key={weapon.name} value={weapon.name}>
                                            {weapon.name} ({weapon.description})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {selectedBase?.options && (
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <h4 className="font-medium">Modyfikacje (opcjonalne)</h4>
                                <span className="text-sm text-muted-foreground">
                                    {selectedOptions.length}/2
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {selectedBase.options
                                    .filter(option => !selectedOptions.find(o => o.name === option.name))
                                    .map((option) => (
                                        <Button
                                            key={option.name}
                                            variant="outline"
                                            className="justify-start"
                                            disabled={selectedOptions.length >= 2}
                                            onClick={() => setSelectedOptions([...selectedOptions, option])}
                                        >
                                            {option.name} ({option.effect})
                                        </Button>
                                    ))}
                            </div>

                            <div className="space-y-2 mt-4">
                                {selectedOptions.map((option) => (
                                    <div
                                        key={option.name}
                                        className="flex items-center justify-between p-2 bg-muted rounded-lg"
                                    >
                                        <span>
                                            {option.name} ({option.effect})
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setSelectedOptions(
                                                    selectedOptions.filter(o => o.name !== option.name)
                                                )
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleCreateWeapon}
                        disabled={!selectedBase}
                    >
                        Dodaj broń
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};