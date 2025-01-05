import { useState } from "react";
import { Equipment, FetchedQuestions, Move } from "../types";
import { InitialInfo } from "../types";
import { GeneratedCharacter } from "../types";
import { fetchCreationQuestions, generateCharacter, getAvailableMoves } from "../api";
import { getBaseEquipment } from "../api";
import { CharacterClass } from "../constants/character";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

/**
 * Interfejs reprezentujący stan tworzenia postaci
 */
export interface CharacterCreationState {
  /**
   * Czy użytkownik rozpoczął formularz pytania
   */
  isStartedQuestionForm: boolean;
  /**
   * Czy użytkownik jest na podsumowaniu
   */
  isShowingSummary: boolean;
  /**
   * Czy postać jest generowana
   */
  isGeneratingCharacter: boolean;
  /**
   * Informacje o postaci
   */
  initialInfo: InitialInfo;
  /**
   * Odpowiedzi na pytania
   */
  answers: Record<number, string>;
  /**
   * Pytania pobrane z API
   */
  fetchedQuestionsObject: FetchedQuestions | null;
  /**
   * Czy użytkownik ma zdjęcie postaci
   */
  showCharacterImage: boolean;
  /**
   * Czy użytkownik edytuje postać
   */
  isEditingCharacter: boolean;
  /**
   * Ruchy dostępne dla postaci
   */
  availableMoves: Move[];
  /**
   * Ruchy wybrane przez użytkownika
   */
  selectedMoves: Move[];
  /**
   * Ekwipunek postaci
   */
  equipment: Equipment[];
  /**
   * Klasa postaci
   */
  characterClass: CharacterClass | null;
  /**
   * Postać wygenerowana
   */
  generatedCharacter: GeneratedCharacter | null;
}

export interface CharacterCreationActions {
  /**
   * Funkcja rozpoczynająca formularz pytania
   */
  handleStartQuestionForm: () => void;
  /**
   * Funkcja przechodząca do podsumowania
   */
  handleShowSummary: () => void;
  /**
   * Funkcja generująca postać
   */
  handleGenerateCharacter: () => void;
  /**
   * Funkcja restartująca tworzenie postaci
   */
  handleRestart: () => void;
  /**
   * Funkcja zapisująca postać
   */
  handleSaveCharacter: () => void;
  /**
   * Funkcja tworząca pytania
   */
  handleCreateQuestions: () => void;
  /**
   * Funkcja wybierająca klasę postaci
   */
  handleSelectClass: (characterClass: CharacterClass) => void;
  /**
   * Funkcja ustawiająca ekwipunek
   */
  handleSetEquipment: (equipment: Equipment[]) => void;
  /**
   * Funkcja ustawiająca ruchy wybrane przez użytkownika
   */
  handleSetSelectedMoves: (moves: Move[]) => void;
  /**
   * Funkcja przechodząca do formularza pytania
   */
  handleBackToQuestions: () => void;
  /**
   * Funkcja tworząca zdjęcie postaci
   */
  handleCreateCharacterImage: () => Promise<void>;
  /**
   * Funkcja pobierająca dostępne ruchy dla danej klasy postaci
   */
  handleGetAvailableMoves: (characterClass: CharacterClass) => Move[];
  /**
   * Funkcja ustawiająca informacje o postaci
   */
  setInitialInfo: (initialInfo: InitialInfo) => void;
  /**
   * Funkcja ustawiająca czy użytkownik ma zdjęcie postaci
   */
  setShowCharacterImage: (showCharacterImage: boolean) => void;
  /**
   * Funkcja ustawiająca czy użytkownik edytuje postać
   */
  setIsEditingCharacter: (isEditing: boolean) => void;
  /**
   * Funkcja ustawiająca ruchy wybrane przez użytkownika
   */
  setSelectedMoves: (moves: Move[]) => void;
  /**
   * Funkcja ustawiająca ekwipunek
   */
  setEquipment: (equipment: Equipment[]) => void;
  /**
   * Funkcja ustawiająca klasę postaci
   */
  setCharacterClass: (characterClass: CharacterClass) => void;
  /**
   * Funkcja ustawiająca pytania pobrane z API
   */
  setFetchedQuestionsObject: (fetchedQuestions: FetchedQuestions) => void;
  /**
   * Funkcja ustawiająca odpowiedzi na pytania
   */
  setAnswers: (answers: Record<number, string>) => void;
  /**
   * Funkcja ustawiająca indeks pytania pobranych z API
   */
  setFetchedQuestionsObjectQuestionIndex: (index: number) => void;
  /**
   * Funkcja ustawiająca wygenerowaną postać
   */
  setGeneratedCharacter: (generatedCharacter: GeneratedCharacter) => void;
}

/**
 * Hook dla tworzenia postaci
 * @returns {Object} - Obiekt z funkcjami i stanem
 */
export const useCharacterCreation = (): CharacterCreationState & CharacterCreationActions => {
  const [isStartedQuestionForm, setIsStartedQuestionForm] = useState(false);
  const [isShowingSummary, setIsShowingSummary] = useState(false);
  const [initialInfo, setInitialInfo] = useState<InitialInfo>({
    characterBasics: "",
    characterBackground: "",
    characterTraits: "",
    worldDescription: "",
  });
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
  const [generatedCharacter, setGeneratedCharacter] = useState<GeneratedCharacter | null>(null);
  const [showCharacterImage, setShowCharacterImage] = useState(false);
  const [isEditingCharacter, setIsEditingCharacter] = useState(false);
  const [availableMoves, setAvailableMoves] = useState<Move[]>([]);
  const [selectedMoves, setSelectedMoves] = useState<Move[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [characterClass, setCharacterClass] = useState<CharacterClass | null>(null);
  const [fetchedQuestionsObject, setFetchedQuestionsObject] = useState<FetchedQuestions | null>(null);

  const navigate = useNavigate();

  const handleSelectClass = (characterClass: CharacterClass) => {
    setCharacterClass(characterClass);
    setAvailableMoves(getAvailableMoves(characterClass));
    setEquipment(getBaseEquipment(characterClass));
  };

  const handleSetEquipment = (equipment: Equipment[]) => {
    setEquipment(equipment);
  };

  const handleSetSelectedMoves = (moves: Move[]) => {
    setSelectedMoves(moves);
  };

  const handleStartQuestionForm = () => {
    handleCreateQuestions().then(() => {
      setIsStartedQuestionForm(true);
    });
  };

  const handleShowSummary = () => {
    setIsShowingSummary(true);
  };

  const handleGenerateCharacter = async () => {
    setIsGeneratingCharacter(true);

    // Implement character generation logic here
    // This is a placeholder for the actual API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Set generated character data
    // Update available moves and equipment based on character class
    const generatedCharacter = await generateCharacter(initialInfo, characterClass || "Mechanik", fetchedQuestionsObject?.questions || [], answers);
    setGeneratedCharacter(generatedCharacter);
    setIsGeneratingCharacter(false);
  };

  const handleBackToQuestions = () => {
    setIsShowingSummary(false);
  };

  const handleCreateQuestions = async () => {
    console.log("handleCreateQuestions");
    setFetchedQuestionsObject({
      questions: [],
      questionIndex: 0,
      questionsLoading: true,
      questionsError: null,
    });
    try {
      const questions = await fetchCreationQuestions(initialInfo);
      console.log("Setting fetchedQuestionsObject with questions", questions);
      setFetchedQuestionsObject({
        questions: questions,
        questionIndex: 0,
        questionsLoading: false,
        questionsError: null,
      });
      console.log("Final fetchedQuestionsObject", fetchedQuestionsObject);
    } catch (error) {
      setFetchedQuestionsObject({
        questions: [],
        questionIndex: 0,
        questionsLoading: false,
        questionsError: error as Error,
      });
    }
  };

  const handleRestart = () => {
    setIsStartedQuestionForm(false);
    setFetchedQuestionsObject(null);
    setGeneratedCharacter(null);
    setInitialInfo({
      characterBasics: "",
      characterBackground: "",
      characterTraits: "",
      worldDescription: "",
    });
    setAnswers({});
    setShowCharacterImage(false);
    setIsEditingCharacter(false);
    setCharacterClass(null);
  };

  const handleSaveCharacter = () => {
    toast.success("Postać została zapisana");
    navigate({ to: "/dashboard/" });
  };

  const setFetchedQuestionsObjectQuestionIndex = (index: number) => {
    if (fetchedQuestionsObject) {
      setFetchedQuestionsObject({
        ...fetchedQuestionsObject,
        questionIndex: index,
      });
    } else {
      setFetchedQuestionsObject({
        questions: [],
        questionIndex: 0,
        questionsLoading: false,
        questionsError: null,
      });
    }
  };

  const handleCreateCharacterImage = async () => {
    console.log("handleCreateCharacterImage");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("handleCreateCharacterImage done");
  };

  const handleGetAvailableMoves = (characterClass: CharacterClass) => {
    return getAvailableMoves(characterClass);
  };

  return {
    isStartedQuestionForm,
    isShowingSummary,
    initialInfo,
    answers,
    isGeneratingCharacter,
    showCharacterImage,
    isEditingCharacter,
    availableMoves,
    selectedMoves,
    equipment,
    characterClass,
    fetchedQuestionsObject,
    generatedCharacter,
    handleStartQuestionForm,
    handleGetAvailableMoves,
    handleSelectClass,
    handleSetEquipment,
    handleShowSummary,
    handleGenerateCharacter,
    handleRestart,
    handleSaveCharacter,
    handleCreateQuestions,
    handleBackToQuestions,
    handleSetSelectedMoves,
    handleCreateCharacterImage,
    setInitialInfo,
    setShowCharacterImage,
    setIsEditingCharacter,
    setSelectedMoves,
    setEquipment,
    setCharacterClass,
    setFetchedQuestionsObject,
    setAnswers,
    setFetchedQuestionsObjectQuestionIndex,
    setGeneratedCharacter,
  };
};