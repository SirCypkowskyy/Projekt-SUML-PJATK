import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { FetchedQuestions } from '../types';

/**
 * Props dla komponentu QuestionsForm
 */
type QuestionsFormProps = {
    /**
     * Indeks aktualnego pytania
     */
    currentQuestionIndex: number;
    /**
     * Funkcja zmieniająca indeks aktualnego pytania
     */
    setCurrentQuestionIndex: (index: number) => void;

    /**
     * Odpowiedzi na pytania
     */
    answers: Record<number, string>;

    /**
     * Funkcja zmieniająca odpowiedź na pytanie
     */
    setAnswers: (answers: Record<number, string>) => void;
    /**
     * Funkcja przechodząca do podsumowania
     */
    onShowSummary: () => void;
    /**
     * Pytania pobrane z API
     */
    fetchedQuestionsObject: FetchedQuestions | null;
}

export const QuestionsForm: React.FC<QuestionsFormProps> = ({
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    setAnswers,
    onShowSummary,
    fetchedQuestionsObject,
}) => {

    const onAnswer = (questionId: number, answer: string) => {
        setAnswers({ ...answers, [questionId]: answer });
    }

    const onNext = () => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    }

    const onPrevious = () => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
    }

    if (fetchedQuestionsObject === null || fetchedQuestionsObject?.questionsLoading) {
        return <div>Ładowanie pytań...</div>;
    }

    if (!fetchedQuestionsObject?.questions) {
        return <div>Brak pytań</div>;
    }

    const currentQuestion = fetchedQuestionsObject.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === fetchedQuestionsObject.questions.length - 1;

    return (
        <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <Card className="border-2 shadow-lg bg-card hover:shadow-xl transition-shadow">
                <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-center">
                            {currentQuestion.question}
                        </h2>
                        <p className="text-muted-foreground text-center">
                            {currentQuestion.context}
                        </p>
                    </div>
                    <Textarea
                        className="min-h-[150px]"
                        placeholder="Twoja odpowiedź..."
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={onPrevious}
                    disabled={currentQuestionIndex === 0}
                    className="shadow-sm"
                >
                    Wróć
                </Button>
                {isLastQuestion ? (
                    <Button onClick={onShowSummary} className="shadow-sm">
                        Podsumuj
                    </Button>
                ) : (
                    <Button onClick={onNext} className="shadow-sm">
                        Dalej
                    </Button>
                )}
            </div>
        </motion.div>
    );
};