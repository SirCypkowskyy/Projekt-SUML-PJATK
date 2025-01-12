/**
 * Typ dla klasy postaci
 * @type {CharacterClass}
 */
export type CharacterClass = "Anioł" | "Chopper" | "Egzekutor" | "Gubernator" | "Guru" | "Kierowca" | "Muza" | "Operator" | "Psychol" | "Tekknik" | "Żyleta" | "Mechanik";

/**
 * Dostępne klasy postaci
 * @type {CharacterClass[]}
 */
export const AVAILABLE_CLASSES: CharacterClass[] = ["Anioł", "Chopper", "Egzekutor", "Gubernator", "Guru", "Kierowca", "Muza", "Operator", "Psychol", "Tekknik", "Żyleta", "Mechanik"] as const;


