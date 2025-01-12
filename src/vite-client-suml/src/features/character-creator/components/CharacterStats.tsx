import React from 'react';
import { formatStat } from '../utils/formatStats';
import { getStatName } from '../utils/formatStats';
import { CharacterStats as CharacterStatsType } from '../types';

/**
 * Props dla CharacterStats
 * @type {CharacterStatsProps}
 */
type CharacterStatsProps = {
    /**
     * Statystyki postaci
     * @type {CharacterStatsType}
     */
    stats: CharacterStatsType;
    /**
     * Czy jest edytowanie
     * @type {boolean}
     */
    isEditing: boolean;
    /**
     * Funkcja do zmiany statystyk
     * @type {(key: keyof CharacterStatsType, value: number) => void}
     */
    onStatChange?: (key: keyof CharacterStatsType, value: number) => void;
}

export const CharacterStats: React.FC<CharacterStatsProps> = ({
    stats,
    isEditing,
    onStatChange,
}) => {
    return (
        <div>
            <h3 className="font-semibold mb-3">Cechy</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats).map(([key, value]) => (
                    <div
                        key={key}
                        className="text-center p-3 bg-muted rounded-lg"
                    >
                        <div className="font-medium">{getStatName(key)}</div>
                        {isEditing && onStatChange ? (
                            <input
                                type="number"
                                min={-3}
                                max={3}
                                value={value}
                                onChange={(e) => onStatChange(key as keyof CharacterStatsType, parseInt(e.target.value))}
                                className="w-16 text-center bg-background p-1 rounded-md"
                            />
                        ) : (
                            <div className="text-xl">{formatStat(value)}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};