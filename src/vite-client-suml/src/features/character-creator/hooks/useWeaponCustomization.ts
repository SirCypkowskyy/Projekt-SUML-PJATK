import { useState } from 'react';
import { Equipment, EquipmentOption } from '../types';

/**
 * Props dla komponentu useWeaponCustomization
 * @interface
 * @property {Equipment} weapon - Broń
 * @property {Function} onWeaponUpdate - Funkcja aktualizująca broń
 */
type UseWeaponCustomizationProps = {
    weapon: Equipment;
    onWeaponUpdate: (updatedWeapon: Equipment) => void;
    canSelectMoreOptions?: () => boolean;
}

/**
 * Zwracany obiekt przez useWeaponCustomization
 * @interface
 * @property {EquipmentOption[]} selectedOptions - Wybrane opcje
 * @property {Function} handleOptionToggle - Funkcja aktualizująca wybrane opcje
 * @property {boolean} canSelectMoreOptions - Czy można wybrać więcej opcji
 */
type UseWeaponCustomizationReturn = {
    selectedOptions: EquipmentOption[];
    handleOptionToggle: (option: EquipmentOption) => void;
    canSelectMoreOptions: boolean
}

/**
 * Hook dla komponentu useWeaponCustomization
 * @param {UseWeaponCustomizationProps} props - Props komponentu
 * @returns {UseWeaponCustomizationReturn} - Obiekt zawierający wybrane opcje i funkcje do ich aktualizacji
 */
export function useWeaponCustomization({ weapon, onWeaponUpdate, canSelectMoreOptions }: UseWeaponCustomizationProps): UseWeaponCustomizationReturn {
    const [selectedOptions, setSelectedOptions] = useState<EquipmentOption[]>([]);

    const handleOptionToggle = (option: EquipmentOption) => {
        const isSelected = selectedOptions.some(opt => opt.name === option.name);

        if (isSelected) {
            setSelectedOptions(selectedOptions.filter(opt => opt.name !== option.name));
        } else if (selectedOptions.length < 2) {
            setSelectedOptions([...selectedOptions, option]);
        }

        // Aktualizuj opis broni z wybranymi opcjami
        const updatedDescription = [
            weapon.description,
            ...selectedOptions.map(opt => opt.effect)
        ].join(', ');

        onWeaponUpdate({
            ...weapon,
            description: updatedDescription,
            options: selectedOptions
        });
    };

    if (canSelectMoreOptions !== undefined) {
        return {
            selectedOptions,
            handleOptionToggle,
            canSelectMoreOptions: canSelectMoreOptions()
        }
    }

    return {
        selectedOptions,
        handleOptionToggle,
        canSelectMoreOptions: selectedOptions.length < 2
    };

}