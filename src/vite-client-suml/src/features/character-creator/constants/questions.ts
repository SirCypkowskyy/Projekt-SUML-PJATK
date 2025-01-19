import { z } from "zod";

/**
 * Schemat dla pytania
 */
export const QuestionSchema: z.ZodObject<{ id: z.ZodNumber; question: z.ZodString; context: z.ZodOptional<z.ZodString>; }> = z.object({
    /**
     * Identyfikator pytania
     * @type {z.ZodNumber}
     */
    id: z.number().describe("Identyfikator pytania"),
    /**
     * Trening pytania
     * @type {z.ZodString}
     */
    question: z.string().min(1).max(100).describe("Trening pytania"),
    /**
     * Kontekst pytania
     * @type {z.ZodOptional<z.ZodString>}
     */
    context: z.string().max(100).describe("Kontekst pytania").optional()
});

/**
 * Typ dla pytania
 * @type {z.infer<typeof QuestionSchema>}
 */
export type Question = z.infer<typeof QuestionSchema>;

/**
 * Pytania do tworzenia postaci
 * @type {z.infer<typeof QuestionSchema>[]}
 */
export const creationQuestions: Question[] = [
    {
        id: 1,
        question: "Co sprawiło, że Twoja postać przetrwała apokalipsę?",
        context:
            "Pomyśl o umiejętnościach, szczęściu lub okolicznościach, które pozwoliły jej przeżyć.",
    },
    {
        id: 2,
        question:
            "Jakie wydarzenie z przeszłości ukształtowało charakter Twojej postaci?",
        context: "Może to być trauma, triumf lub przełomowy moment w jej życiu.",
    },
    {
        id: 3,
        question:
            "Kogo Twoja postać straciła podczas apokalipsy i jak to na nią wpłynęło?",
        context: "Zastanów się nad relacjami i więzami, które zostały zerwane.",
    },
];
