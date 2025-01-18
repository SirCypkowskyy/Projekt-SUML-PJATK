import { useState } from "react";
import { getAvailableWeapons } from "../api";
import { CharacterClass } from "../constants/character";
import { useQuery } from "@tanstack/react-query";

export interface WeaponData {
    name: string;
    description: string;
    isRemovable: boolean;
    isWeapon: boolean;
    options?: Array<{ name: string; effect: string }>;
}

export const useWeaponCreation = () => {
    const [isWeaponDialogOpen, setIsWeaponDialogOpen] = useState(false);
    const [selectedWeapon, setSelectedWeapon] = useState<WeaponData | null>(null);
    const [characterClass, setCharacterClass] = useState<CharacterClass | null>(null);

    const { data: weapons } = useQuery({
        queryKey: ['weapons', characterClass],
        queryFn: () => getAvailableWeapons(characterClass!),
        enabled: !!characterClass && isWeaponDialogOpen
    });

    const openWeaponDialog = (characterClass: CharacterClass) => {
        setCharacterClass(characterClass);
        setIsWeaponDialogOpen(true);
    };

    const closeWeaponDialog = () => {
        setIsWeaponDialogOpen(false);
        setSelectedWeapon(null);
        setCharacterClass(null);
    };

    const selectWeapon = (weaponName: string) => {
        const weapon = weapons?.find(weapon => weapon.name === weaponName);
        if (weapon) {
            setSelectedWeapon({
                name: weapon.name,
                description: weapon.description,
                isRemovable: true,
                isWeapon: true,
                options: weapon.options
            });
        }
    };

    return {
        isWeaponDialogOpen,
        selectedWeapon,
        openWeaponDialog,
        closeWeaponDialog,
        selectWeapon,
        weapons: weapons || []
    };
};