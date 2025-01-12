import { motion } from "framer-motion";
import { InitialForm } from "./InitialForm";
import { QuestionForm } from "./QuestionForm";
import { CharacterSummary } from "./CharacterSummary";
import { GeneratedCharacter } from "./GeneratedCharacter";
import { CreationProgress } from "./CreationProgress";
import { questions } from "../constants/questions";
import { useCharacterCreation } from "../hooks/useCharacterCreation";

export function CharacterCreator() {
    const {
        isStarted,
        currentQuestionIndex,
        isShowingSummary,
        initialInfo,
        answers,
        isGenerating,
        generatedCharacter,
        showCharacterImage,
        isEditing,
        handleStart,
        handleAnswer,
        handleNext,
        handlePrevious,
        handleShowSummary,
        handleBackToQuestions,
        setInitialInfo,
    } = useCharacterCreation();

    if (!isStarted) {
        return (
            <InitialForm
                initialInfo={initialInfo}
                onInfoChange={setInitialInfo}
                onStart={handleStart}
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
        >
            <CreationProgress
                currentStep={currentQuestionIndex + 1}
                totalSteps={questions.length}
            />

            {!isShowingSummary && !generatedCharacter && (
                <QuestionForm
                    question={questions[currentQuestionIndex]}
                    answer={answers[questions[currentQuestionIndex].id] || ""}
                    onAnswerChange={(answer) =>
                        handleAnswer(questions[currentQuestionIndex].id, answer)
                    }
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    onShowSummary={handleShowSummary}
                    isFirst={currentQuestionIndex === 0}
                    isLast={currentQuestionIndex === questions.length - 1}
                />
            )}

            {isShowingSummary && !generatedCharacter && (
                <CharacterSummary
                    initialInfo={initialInfo}
                    answers={answers}
                    questions={questions}
                    onBack={handleBackToQuestions}
                    onGenerate={() => {/* TODO: Implement generation logic */}}
                />
            )}

            {generatedCharacter && (
                <GeneratedCharacter
                    character={generatedCharacter}
                    isEditing={isEditing}
                    showCharacterImage={showCharacterImage}
                    onEditToggle={() => {/* TODO: Implement edit toggle */}}
                    onGenerateImage={() => {/* TODO: Implement image generation */}}
                    onRestart={() => {/* TODO: Implement restart */}}
                    onExportPDF={() => {/* TODO: Implement PDF export */}}
                    onSave={() => {/* TODO: Implement save */}}
                    onCharacterUpdate={() => {/* TODO: Implement character update */}}
                />
            )}
        </motion.div>
    );
}