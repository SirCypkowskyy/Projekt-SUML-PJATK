/**
 * Formatowanie statystyki
 * @param {number | undefined} value - Wartość statystyki
 * @returns {string} - Sformatowana wartość statystyki
 */
export const formatStat = (value: number | undefined): string => {
    const stat = value ?? 0;
    return stat >= 0 ? `+${stat}` : `${stat}`;
};

/**
 * Zwraca nazwę statystyki na podstawie klucza
 * @param {string} key - Klucz statystyki
 * @returns {string} - Nazwa statystyki
 */
export const getStatName = (key: string): string => {
    switch (key) {
        case "cool":
            return "Spokój";
        case "hard":
            return "Hard";
        case "hot":
            return "Urok";
        case "sharp":
            return "Spryt";
        case "weird":
            return "Dziw";
        default:
            return key;
    }
};

/**
 * Walidacja statystyk
 * @param {Record<string, number>} stats - Statystyki
 * @returns {boolean} - Czy statystyki są poprawne
 */
export const validateStats = (stats: Record<string, number>): boolean => {
    const totalPoints = Object.values(stats).reduce((sum, value) => sum + value, 0);
    return totalPoints <= 4;
};