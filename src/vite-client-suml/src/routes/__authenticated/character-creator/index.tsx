import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { LoadingAnim } from "@/components/partials/loading-anim";
import { useCharacterCreation } from "@/features/character-creator/hooks/useCharacterCreation";
import { SummaryView } from "@/features/character-creator/components/SummaryView";
import { InitialInfoForm } from "@/features/character-creator/components/InitialForm";
import { QuestionsForm } from "@/features/character-creator/components/QuestionForm";
import { CharacterForm } from "@/features/character-creator/components/CharacterForm";


export const Route = createFileRoute("/__authenticated/character-creator/")({
  component: CharacterCreator,
});

function CharacterCreator() {
  const {
    isStartedQuestionForm,
    isShowingSummary,
    initialInfo,
    answers,
    showCharacterImage,
    isEditingCharacter,
    isGeneratingCharacter,
    generatedCharacter,
    fetchedQuestionsObject,
    handleCreateCharacterImage,
    handleStartQuestionForm,
    handleShowSummary,
    handleGenerateCharacter,
    handleRestart,
    handleSaveCharacter,
    handleBackToQuestions,
    handleGetAvailableMoves,
    setInitialInfo,
    setShowCharacterImage,
    setIsEditingCharacter,
    setAnswers,
    setFetchedQuestionsObjectQuestionIndex,
    setGeneratedCharacter,
  } = useCharacterCreation();


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 max-w-[80vw] min-h-[calc(100vh-2rem)]"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-12 text-center"
      >
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Kreator Postaci
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Stwórz swoją unikalną postać do świata Apocalypse World
        </p>
        {isStartedQuestionForm && !isGeneratingCharacter && !generatedCharacter && (
          <Progress
            value={((fetchedQuestionsObject?.questionIndex ?? 0 + 1) / ((fetchedQuestionsObject?.questions?.length ?? 1) - 1)) * 100}
            className="w-full max-w-md mx-auto"
          />
        )}
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {isGeneratingCharacter ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <LoadingAnim />
          </div>
        ) : generatedCharacter ? (
          <CharacterForm
            getAvailableMoves={handleGetAvailableMoves}
            character={generatedCharacter}
            isEditing={isEditingCharacter}
            showCharacterImage={showCharacterImage}
            onCharacterChange={(updatedCharacter) => {
              setGeneratedCharacter(updatedCharacter);
            }}
            onEditToggle={() => setIsEditingCharacter(!isEditingCharacter)}
            onShowImage={() => handleCreateCharacterImage().then(() => setShowCharacterImage(true))}
            onRestart={handleRestart}
            onSave={handleSaveCharacter}
          />
        ) : isShowingSummary ? (
          <SummaryView
            initialInfo={initialInfo}
            answers={answers}
            onBackToQuestions={handleBackToQuestions}
            onGenerateCharacter={handleGenerateCharacter}
          />
        ) : !isStartedQuestionForm ? (
          <InitialInfoForm
            initialInfo={initialInfo}
            onInfoChange={setInitialInfo}
            onStart={handleStartQuestionForm}
          />
        ) : (
          <QuestionsForm
            currentQuestionIndex={fetchedQuestionsObject?.questionIndex ?? 0}
            answers={answers}
            onShowSummary={handleShowSummary}
            fetchedQuestionsObject={fetchedQuestionsObject}
            setCurrentQuestionIndex={setFetchedQuestionsObjectQuestionIndex}
            setAnswers={setAnswers}
          />
        )}
      </motion.div>
    </motion.div>
  );
}