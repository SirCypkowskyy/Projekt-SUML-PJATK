import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InitialInfo } from '../types';
import { Question } from '../constants/questions';

interface CharacterSummaryProps {
  initialInfo: InitialInfo;
  answers: Record<number, string>;
  questions: Question[];
  onBack: () => void;
  onGenerate: () => void;
}

export function CharacterSummary({
  initialInfo,
  answers,
  questions,
  onBack,
  onGenerate
}: CharacterSummaryProps) {
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
          {/* Początkowe informacje */}
          {(initialInfo.characterBasics ||
            initialInfo.characterBackground ||
            initialInfo.characterTraits ||
            initialInfo.worldDescription) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informacje wstępne:</h3>
                {initialInfo.characterBasics && (
                  <div className="space-y-2">
                    <p className="font-medium">Podstawowe informacje:</p>
                    <p className="text-muted-foreground">
                      {initialInfo.characterBasics}
                    </p>
                  </div>
                )}
                {initialInfo.characterBackground && (
                  <div className="space-y-2">
                    <p className="font-medium">Historia postaci:</p>
                    <p className="text-muted-foreground">
                      {initialInfo.characterBackground}
                    </p>
                  </div>
                )}
                {initialInfo.characterTraits && (
                  <div className="space-y-2">
                    <p className="font-medium">Cechy postaci:</p>
                    <p className="text-muted-foreground">
                      {initialInfo.characterTraits}
                    </p>
                  </div>
                )}
                {initialInfo.worldDescription && (
                  <div className="space-y-2">
                    <p className="font-medium">Świat gry:</p>
                    <p className="text-muted-foreground">
                      {initialInfo.worldDescription}
                    </p>
                  </div>
                )}
              </div>
            )}

          {/* Odpowiedzi na pytania */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Odpowiedzi na pytania:</h3>
            {questions.map((question) => (
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
          onClick={onBack}
          className="shadow-sm"
        >
          Wróć do pytań
        </Button>
        <Button onClick={onGenerate} className="shadow-sm">
          Wygeneruj postać
        </Button>
      </div>
    </motion.div>
  );
}