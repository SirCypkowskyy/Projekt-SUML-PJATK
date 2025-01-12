import { useState, useCallback } from 'react';
import { CharacterClass } from '../types';
import { Equipment, EquipmentOption } from '../types';
import { getAvailableWeapons } from '../api';

interface WeaponCreationState {
    isWeaponDialogOpen: boolean;
    selectedWeaponBase?: Equipment | undefined;
    selectedWeaponOptions?: EquipmentOption[] | undefined;
}

interface UseWeaponCreationReturn extends WeaponCreationState {
    openWeaponDialog: () => void;
    closeWeaponDialog: () => void;
    selectWeaponBase: (base: Equipment | undefined) => void;
    addWeaponOption: (option: EquipmentOption) => void;
    removeWeaponOption: (optionName: string) => void;
    createWeapon: (equipment: Equipment[], setEquipment: (equipment: Equipment[]) => void) => void;
    getAvailableOptions: (characterClass: CharacterClass) => EquipmentOption[];
    resetWeaponCreation: () => void;
}

export const useWeaponCreation = (): UseWeaponCreationReturn => {
    const [state, setState] = useState<WeaponCreationState>({
        isWeaponDialogOpen: false,
        selectedWeaponBase: undefined,
        selectedWeaponOptions: undefined,
    });

    const openWeaponDialog = useCallback(() => {
        setState(prev => ({ ...prev, isWeaponDialogOpen: true }));
    }, []);

    const closeWeaponDialog = useCallback(() => {
        setState(prev => ({ ...prev, isWeaponDialogOpen: false }));
    }, []);

    const selectWeaponBase = useCallback((base: Equipment | undefined) => {
        setState(prev => ({ ...prev, selectedWeaponBase: base }));
    }, []);

    const addWeaponOption = useCallback((option: EquipmentOption) => {
        setState(prev => {
            if ((prev.selectedWeaponOptions ?? []).length >= 2) return prev;
            return {
                ...prev,
                selectedWeaponOptions: [...(prev.selectedWeaponOptions ?? []), option],
            };
        });
    }, []);

    const removeWeaponOption = useCallback((optionName: string) => {
        setState(prev => ({
            ...prev,
            selectedWeaponOptions: (prev.selectedWeaponOptions ?? []).filter(
                option => option.name !== optionName
            ),
        }));
    }, []);

    const createWeapon = useCallback((
        equipment: Equipment[],
        setEquipment: (equipment: Equipment[]) => void
    ) => {
        if (state.selectedWeaponBase) {
            const newWeapon: Equipment = {
                name: `${state.selectedWeaponBase.name} ${state.selectedWeaponOptions?.map(o => o.name).join(", ")}`.trim(),
                description: `${state.selectedWeaponBase.description} ${state.selectedWeaponOptions?.map(o => o.effect).join(", ")}`.trim(),
                isRemovable: true,
            };

            setEquipment([...equipment, newWeapon]);
            resetWeaponCreation();
        }
    }, [state.selectedWeaponBase, state.selectedWeaponOptions]);

    const getAvailableOptions = useCallback((characterClass: CharacterClass): EquipmentOption[] => {
        const weapons = getAvailableWeapons(characterClass);
        const options = weapons.find(weapon => weapon.name === state.selectedWeaponBase?.name)?.options;
        return options?.filter(
            option => !state.selectedWeaponOptions?.find(
                selected => selected.name === option.name
            )
        ) ?? [];
    }, [state.selectedWeaponOptions]);

    const resetWeaponCreation = useCallback(() => {
        setState({
            isWeaponDialogOpen: false,
            selectedWeaponBase: undefined,
            selectedWeaponOptions: undefined,
        });
    }, []);

    return {
        ...state,
        openWeaponDialog,
        closeWeaponDialog,
        selectWeaponBase,
        addWeaponOption,
        removeWeaponOption,
        createWeapon,
        getAvailableOptions,
        resetWeaponCreation,
    };
};