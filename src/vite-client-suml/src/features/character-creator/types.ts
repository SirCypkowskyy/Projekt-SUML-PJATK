import { z } from "zod";
import { CharacterClass } from "./constants/character";
import { Question } from "./constants/questions";

/**
 * Interfejs dla informacji początkowych
 * @interface
 * @property {string} characterBasics - Podstawowe informacje o postaci
 * @property {string} characterBackground - Tło postaci
 * @property {string} characterTraits - Charakterystyka postaci
 * @property {string} worldDescription - Opis świata
 */
type InitialInfo = {
    /**
     * Podstawowe informacje o postaci
     * @type {string}
     */
    characterBasics: string;
    /**
     * Tło postaci
     * @type {string}
     */
    characterBackground: string;
    /**
     * Charakterystyka postaci
     * @type {string}
     */
    characterTraits: string;
    /**
     * Opis świata
     * @type {string}
     */
    worldDescription: string;
}
/**
 * Interfejs dla wygenerowanej postaci
 * @interface
 * @property {string} name - Nazwa postaci
 * @property {string} appearance - Wygląd postaci
 * @property {string} description - Opis postaci
 * @property {CharacterClass} characterClass - Klasa postaci
 * @property {object} stats - Statystyki postaci
 * @property {Move[]} moves - Ruchy postaci
 * @property {Equipment[]} equipment - Sprzęt postaci
 */
type GeneratedCharacter = {
    /**
     * Nazwa postaci
     * @type {string}
     */
    name: string;
    /**
     * Wygląd postaci
     * @type {string}
     */
    appearance: string;
    /**
     * Opis postaci
     * @type {string}
     */
    description: string;
    /**
     * Klasa postaci
     * @type {CharacterClass}
     */
    characterClass: CharacterClass;
    /**
     * Statystyki postaci
     * @type {CharacterStats}
     */
    stats: CharacterStats;
    /**
     * Ruchy postaci
     * @type {Move[]}
     */
    moves: Move[];
    /**
     * Sprzęt postaci
     * @type {Equipment[]}
     */
    equipment: Equipment[];
    /**
     * URL zdjęcia postaci
     * @type {string | null}
     */
    characterImageUrl?: string | null;
}

/**
 * Interfejs dla ruchu postaci
 * @interface
 * @property {string} name - Nazwa ruchu
 * @property {string} description - Opis ruchu
 */
type Move = {
    /**
     * Nazwa ruchu
     * @type {string}
     */
    name: string;
    /**
     * Opis ruchu
     * @type {string}
     */
    description: string;
}


/**
 * Schemat dla opcji sprzętu
 * @type {z.ZodObject<{name: z.ZodString, effect: z.ZodString}>}
 * @property {z.ZodString} name - Nazwa opcji
 * @property {z.ZodString} effect - Efekt opcji
 */
const EquipmentOptionSchema: z.ZodObject<{ name: z.ZodString; effect: z.ZodString; }> = z.object({
    /**
     * Nazwa opcji
     * @type {z.ZodString}
     */
    name: z.string().min(1).describe("Nazwa opcji"),
    /**
     * Efekt opcji
     * @type {z.ZodString}
     */
    effect: z.string().min(1).describe("Efekt opcji"),
})

/**
 * Schemat dla sprzętu postaci
 */
const EquipmentSchema = z.object({
    /**
     * Nazwa sprzętu
     * @type {z.ZodString}
     */
    name: z.string().min(1).describe("Nazwa sprzętu"),
    /**
     * Opis sprzętu
     * @type {z.ZodString}
     */
    description: z.string().min(1).describe("Opis sprzętu"),
    /**
     * Czy sprzęt jest usuwalny
     * @type {z.ZodBoolean}
     */
    isRemovable: z.boolean().optional().describe("Czy sprzęt jest usuwalny"),
    /**
     * Czy sprzęt jest bronią
     * @type {z.ZodBoolean}
     */
    isWeapon: z.boolean().optional().describe("Czy sprzęt jest bronią"),
    /**
     * Czy sprzęt jest pancerzem
     * @type {z.ZodBoolean}
     */
    isArmor: z.boolean().optional().describe("Czy sprzęt jest pancerzem"),
    /**
     * Opcje sprzętu
     * @type {z.ZodArray<EquipmentOptionSchema>}
     */
    options: z.array(EquipmentOptionSchema).optional().describe("Opcje sprzętu"),
    /**
     * Wartość sprzętu w barterze
     * @type {z.ZodNumber}
     */
    valueBarter: z.number().optional().describe("Wartość sprzętu w barterze"),

})

/**
 * Typ dla sprzętu postaci (sprzęt to przedmioty, które postać może nosić - np. kombinezon, broń, itd.)
 * @interface
 * @property {string} name - Nazwa sprzętu
 * @property {string} description - Opis sprzętu
 * @property {boolean?} isRemovable - Czy sprzęt jest usuwalny
 * @property {boolean?} isWeapon - Czy sprzęt jest bronią
 * @property {boolean?} isArmor - Czy sprzęt jest pancerzem
 * @property {EquipmentOption[]?} options - Opcje sprzętu
 * @property {number?} valueBarter - Wartość sprzętu w barterze
 */
type Equipment = z.infer<typeof EquipmentSchema>;

/**
 * Typ dla opcji sprzętu
 * @type {z.infer<typeof EquipmentOptionSchema>}
 */
type EquipmentOption = z.infer<typeof EquipmentOptionSchema>;

/**
 * Cechy postaci
 * @type {CharacterStats}
 */
type CharacterStats = {
    /**
     * Cecha "spokoju"
     * @type {number}
     */
    cool: number;
    /**
     * Cecha "hardu"
     * @type {number}
     */
    hard: number;
    /**
     * Cecha "uroku"
     * @type {number}
     */
    hot: number;
    /**
     * Cecha "sprytu"
     * @type {number}
     */
    sharp: number;
    /**
     * Cecha "dziwu"
     * @type {number}
     */
    weird: number;
}

/**
 * Typ reprezentujący pytania pobrane z API
 */
type FetchedQuestions = {
    /**
     * Pytania pobrane z API
     */
    questions?: Question[];
    /**
     * Indeks aktualnego pytania
     */
    questionIndex?: number;
    /**
     * Status ładowania pytań
     */
    questionsLoading: boolean;
    /**
     * Błąd pobierania pytań
     */
    questionsError?: Error | null;
}


export type { InitialInfo, GeneratedCharacter, Move, Equipment, EquipmentOption, CharacterStats, FetchedQuestions };
