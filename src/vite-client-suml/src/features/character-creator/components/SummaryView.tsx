import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FetchedQuestions, InitialInfo } from '../types';

/**
 * Propsy dla SummaryView
 */
type SummaryViewProps = {
    /**
     * Informacje wstępne
     */
    initialInfo: InitialInfo;
    /**
     * Odpowiedzi na pytania
     */
    answers: Record<number, string>;
    /**
     * Funkcja do powrotu do pytań
     */
    onBackToQuestions: () => void;
    /**
     * Funkcja do generowania postaci
     */
    onGenerateCharacter: () => void;
    /**
     * Pytania pobrane z API
     */
    questions: FetchedQuestions | null;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
    initialInfo,
    answers,
    onBackToQuestions,
    onGenerateCharacter,
    questions,
}) => {
   
    if (questions === null || questions.questionsLoading) {
        return <div>Ładowanie pytań...</div>;
    }

    if (answers === null) {
        return <div>Ładowanie odpowiedzi...</div>;
    }

    if (questions.questions === null) {
        return <div>Brak pytań</div>;
    }

    const hasInitialInfo = Object.values(initialInfo).some(value => value.length > 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <Card className="border-2 shadow-lg bg-card">
                <CardHeader>
                    <CardTitle>Podsumowanie</CardTitle>
                    <CardDescription>
                        Przejrzyj swoje odpowiedzi przed wygenerowaniem postaci
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {hasInitialInfo && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Informacje wstępne:</h3>
                            {initialInfo.characterBasics && (
                                <div className="space-y-2">
                                    <p className="font-medium">Podstawowe informacje:</p>
                                    <p className="text-muted-foreground">{initialInfo.characterBasics}</p>
                                </div>
                            )}
                            {initialInfo.characterBackground && (
                                <div className="space-y-2">
                                    <p className="font-medium">Historia postaci:</p>
                                    <p className="text-muted-foreground">{initialInfo.characterBackground}</p>
                                </div>
                            )}
                            {initialInfo.characterTraits && (
                                <div className="space-y-2">
                                    <p className="font-medium">Cechy charakteru:</p>
                                    <p className="text-muted-foreground">{initialInfo.characterTraits}</p>
                                </div>
                            )}
                            {initialInfo.worldDescription && (
                                <div className="space-y-2">
                                    <p className="font-medium">Świat gry:</p>
                                    <p className="text-muted-foreground">{initialInfo.worldDescription}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Odpowiedzi na pytania:</h3>
                        {questions?.questions?.map((question) => (
                            <div key={question.id} className="space-y-2">
                                <p className="font-medium">{question.question}</p>
                                <p className="text-muted-foreground">
                                    {answers[question.id] || "Brak odpowiedzi"}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={onBackToQuestions}
                    className="shadow-sm"
                >
                    Wróć do pytań
                </Button>
                <Button onClick={onGenerateCharacter} className="shadow-sm">
                    Wygeneruj postać
                </Button>
            </div>
        </motion.div>
    );
};