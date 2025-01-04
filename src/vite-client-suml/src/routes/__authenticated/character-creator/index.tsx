import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  User,
  Book,
  Globe,
  Sparkles,
  Undo2,
  FileEdit,
  FileDown,
  Wand2,
  ChevronsUpDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { LoadingAnim } from "@/components/partials/loading-anim";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/__authenticated/character-creator/")({
  component: RouteComponent,
});

// Przykładowe pytania - docelowo będą pobierane z API
const questions = [
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

interface InitialInfo {
  characterBasics: string; // imię, wiek, podstawowe informacje
  characterBackground: string; // przeszłość, historia
  characterTraits: string; // cechy charakteru, osobowość
  worldDescription: string; // opis świata gry
}

interface GeneratedCharacter {
  name: string;
  appearance: string;
  description: string;
  characterClass: string;
  stats: {
    cool: number;
    hard: number;
    hot: number;
    sharp: number;
    weird: number;
  };
  moves: Move[];
  equipment: Equipment[];
}

interface Move {
  name: string;
  description: string;
}

interface Equipment {
  name: string;
  description: string;
  isRemovable: boolean;
}

interface WeaponBase {
  name: string;
  stats: string;
}

interface WeaponOption {
  name: string;
  effect: string;
  countsDouble?: boolean;
}

// Symulacja API dla ruchów
const getAvailableMoves = (characterClass: string): Move[] => {
  // Przykładowe ruchy dla Mechanika

  if (characterClass === "Mechanik") {
    return [
      {
        name: "Majsterkowicz",
        description:
          "Kiedy majstrujesz przy sprzęcie, rzuć+spryt. Na 10+ wybierz 3, na 7-9 wybierz 2: działa niezawodnie, działa długo, nie potrzebujesz rzadkich części, nie zajmuje dużo czasu.",
      },
      {
        name: "Oko fachowca",
        description:
          "Kiedy badasz mechanizm lub konstrukcję, rzuć+spryt. Na 10+ zadaj 3 pytania, na 7-9 zadaj 1: jak to działa? co jest z tym nie tak? jak to naprawić?",
      },
      {
        name: "Improwizacja",
        description:
          "Kiedy musisz coś szybko naprawić w stresującej sytuacji, rzuć+spryt. Na 10+ działa jak trzeba, na 7-9 działa, ale wybierz 1: zawodzi w krytycznym momencie, wymaga ciągłej uwagi, działa tylko raz.",
      },
      {
        name: "Złota rączka",
        description:
          "Kiedy próbujesz naprawić lub zmodyfikować sprzęt, możesz rzucić+spryt zamiast +hart.",
      },
      {
        name: "Recykling",
        description:
          "Kiedy przeszukujesz złomowisko lub ruiny w poszukiwaniu części, rzuć+spryt. Na 10+ znajdziesz dokładnie to, czego potrzebujesz. Na 7-9 znajdziesz coś podobnego.",
      },
    ];
  }
  return [];
};

// Symulacja API dla ekwipunku
const getBaseEquipment = (characterClass: string): Equipment[] => {
  switch (characterClass) {
    case "Mechanik":
      return [
        {
          name: "Skórzany kombinezon",
          description: "1-pancerz",
          isRemovable: false,
        },
        {
          name: "Zestaw narzędzi mechanika",
          description: "Podstawowe narzędzia",
          isRemovable: false,
        },
      ];
    // Dodaj więcej klas...
    default:
      return [];
  }
};

const AVAILABLE_CLASSES = ["Mechanik", "Żyleta", "Anioł", "Egzekutor"] as const;

const getAvailableWeapons = (characterClass: string) => {
  switch (characterClass) {
    case "Mechanik":
      return {
        bases: [
          { name: "klucz francuski", stats: "2-rany, ramię" },
          { name: "młot", stats: "2-rany, ramię, ogłuszający" },
          { name: "spawarka", stats: "2-rany, ramię, gorący" },
        ],
        options: [
          { name: "wzmocniony", effect: "+1rana" },
          { name: "zmodyfikowany", effect: "wybierz: +zasięg lub +1rana" },
          { name: "precyzyjny", effect: "+1rana na bliskim dystansie" },
          { name: "ciężki", effect: "+1rana, -zwinny" },
          { name: "elektryczny", effect: "+ogłuszający" },
          { name: "automatyczny", effect: "+szybki, wymaga zasilania" },
        ],
      };
    // Dodaj więcej klas...
    default:
      return { bases: [], options: [] };
  }
};

function RouteComponent() {
  // Funkcja pomocnicza do formatowania statystyk
  const formatStat = (value: number | undefined): string => {
    const stat = value ?? 0;
    return stat >= 0 ? `+${stat}` : `${stat}`;
  };

  const getStatName = (key: string): string => {
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

  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isShowingSummary, setIsShowingSummary] = useState(false);
  const [initialInfo, setInitialInfo] = useState<InitialInfo>({
    characterBasics: "",
    characterBackground: "",
    characterTraits: "",
    worldDescription: "",
  });
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCharacter, setGeneratedCharacter] =
    useState<GeneratedCharacter | null>(null);
  const [showCharacterImage, setShowCharacterImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [availableMoves, setAvailableMoves] = useState<Move[]>([]);
  const [selectedMoves, setSelectedMoves] = useState<Move[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isWeaponDialogOpen, setIsWeaponDialogOpen] = useState(false);
  const [selectedWeaponBase, setSelectedWeaponBase] =
    useState<WeaponBase | null>(null);
  const [selectedWeaponOptions, setSelectedWeaponOptions] = useState<
    WeaponOption[]
  >([]);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (generatedCharacter?.characterClass) {
      setAvailableMoves(getAvailableMoves(generatedCharacter.characterClass));
      const baseEquipment = getBaseEquipment(generatedCharacter.characterClass);
      setEquipment(baseEquipment);
    }
  }, [generatedCharacter?.characterClass]);

  const handleMoveSelect = (move: Move) => {
    if (selectedMoves.length < 2) {
      setSelectedMoves([...selectedMoves, move]);
    }
  };

  const handleMoveRemove = (moveToRemove: Move) => {
    setSelectedMoves(
      selectedMoves.filter((move) => move.name !== moveToRemove.name)
    );
  };

  const handleStart = () => {
    // Możemy rozpocząć nawet bez wypełnionych pól
    setIsStarted(true);
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleShowSummary = () => {
    setIsShowingSummary(true);
  };

  const handleBackToQuestions = () => {
    setIsShowingSummary(false);
    setCurrentQuestionIndex(questions.length - 1);
  };

  const handleGenerateCharacter = async () => {
    setIsGenerating(true);

    // Symulacja generowania postaci
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Przykładowa wygenerowana postać
    setGeneratedCharacter({
      name: initialInfo.characterBasics
        ? initialInfo.characterBasics
            .split(",")[0]
            .replace("Moja postać nazywa się", "")
            .trim()
        : "Max Roadwarrior",
      appearance:
        "Twarde spojrzenie, blizna przez prawe oko, krótkie czarne włosy, mocno umięśniona sylwetka",
      description:
        "Były mechanik wojskowy, który przetrwał apokalipsę dzięki swojej zaradności i umiejętności naprawiania maszyn. Teraz wędruje między osadami, oferując swoje usługi w zamian za zapasy i paliwo.",
      characterClass: "Mechanik",
      stats: {
        cool: 1,
        hard: 2,
        hot: 0,
        sharp: 2,
        weird: -1,
      },
      moves: [
        {
          name: "Majsterkowicz",
          description:
            "Kiedy majstrujesz przy sprzęcie, rzuć+spryt. Na 10+ wybierz 3, na 7-9 wybierz 2: działa niezawodnie, działa długo, nie potrzebujesz rzadkich części, nie zajmuje dużo czasu.",
        },
        {
          name: "Oko fachowca",
          description:
            "Kiedy badasz mechanizm lub konstrukcję, rzuć+spryt. Na 10+ zadaj 3 pytania, na 7-9 zadaj 1: jak to działa? co jest z tym nie tak? jak to naprawić?",
        },
      ],
      equipment: [
        {
          name: "Ciężki klucz francuski",
          description: "2-rany kontakt",
          isRemovable: false,
        },
        {
          name: "Skórzany kombinezon",
          description: "1-pancerz",
          isRemovable: false,
        },
        {
          name: "Zestaw narzędzi mechanika",
          description: "Podstawowe narzędzia",
          isRemovable: false,
        },
        {
          name: "Stary motocykl z przyczepą",
          description: "Podstawowe narzędzia",
          isRemovable: false,
        },
      ],
    });

    setIsGenerating(false);
  };

  const handleRestart = () => {
    setIsStarted(false);
    setCurrentQuestionIndex(0);
    setGeneratedCharacter(null);
    setInitialInfo({
      characterBasics: "",
      characterBackground: "",
      characterTraits: "",
      worldDescription: "",
    });
    setAnswers({});
    setShowCharacterImage(false);
    setIsEditing(false);
  };

  const renderSummary = () => (
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
          {/* Początkowe informacje (jeśli zostały podane) */}
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
                  <p className="font-medium">Cechy charakteru:</p>
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
          onClick={handleBackToQuestions}
          className="shadow-sm"
        >
          Wróć do pytań
        </Button>
        <Button onClick={handleGenerateCharacter} className="shadow-sm">
          Wygeneruj postać
        </Button>
      </div>
    </motion.div>
  );

  const renderGeneratedCharacter = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <Card className="border-2 shadow-lg bg-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            {/* Lewa kolumna - dane postaci */}
            <div className="space-y-6">
              <div className="space-y-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={generatedCharacter?.name}
                    onChange={(e) =>
                      setGeneratedCharacter((prev) =>
                        prev
                          ? {
                              ...prev,
                              name: e.target.value,
                            }
                          : null
                      )
                    }
                    className="w-full text-2xl font-semibold bg-background p-2 rounded-md"
                  />
                ) : (
                  <h2 className="text-2xl font-semibold">
                    {generatedCharacter?.name}
                  </h2>
                )}
                {isEditing ? (
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz klasę" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_CLASSES.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className="text-lg" variant="secondary">
                    {generatedCharacter?.characterClass}
                  </Badge>
                )}
              </div>

              {/* Wygląd i opis */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Wygląd</h3>
                  {isEditing ? (
                    <Textarea
                      value={generatedCharacter?.appearance}
                      onChange={(e) =>
                        setGeneratedCharacter((prev) =>
                          prev
                            ? {
                                ...prev,
                                appearance: e.target.value,
                              }
                            : null
                        )
                      }
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      {generatedCharacter?.appearance}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Opis</h3>
                  {isEditing ? (
                    <Textarea
                      value={generatedCharacter?.description}
                      onChange={(e) =>
                        setGeneratedCharacter((prev) =>
                          prev
                            ? {
                                ...prev,
                                description: e.target.value,
                              }
                            : null
                        )
                      }
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      {generatedCharacter?.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Statystyki */}
              <div>
                <h3 className="font-semibold mb-3">Cechy</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(generatedCharacter?.stats ?? {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="text-center p-3 bg-muted rounded-lg"
                      >
                        <div className="font-medium">{getStatName(key)}</div>
                        {isEditing ? (
                          <input
                            type="number"
                            min="-3"
                            max="3"
                            value={value}
                            onChange={(e) =>
                              setGeneratedCharacter((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      stats: {
                                        ...prev.stats,
                                        [key]: parseInt(e.target.value),
                                      },
                                    }
                                  : null
                              )
                            }
                            className="w-16 text-center bg-background p-1 rounded-md"
                          />
                        ) : (
                          <div className="text-xl">{formatStat(value)}</div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Ruchy */}
              <div>
                <h3 className="font-semibold mb-3">Ruchy podstawowe</h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">
                        Ruchy podstawowe (wybierz 2)
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {selectedMoves.length}/2
                      </span>
                    </div>
                    <div>{renderMoveSelector()}</div>
                    <div className="space-y-2">
                      {selectedMoves.map((move) => (
                        <div
                          key={move.name}
                          className="flex items-start justify-between p-4 bg-muted rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{move.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {move.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMoveRemove(move)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedCharacter?.moves.map((move, index) => (
                      <div key={index} className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">{move.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {move.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sprzęt */}
              <div>
                <h3 className="font-semibold mb-3">Sprzęt</h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {equipment.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                          {item.isRemovable && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setEquipment(
                                  equipment.filter((e) => e.name !== item.name)
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <Dialog
                      open={isWeaponDialogOpen}
                      onOpenChange={setIsWeaponDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          Dodaj broń
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Stwórz broń</DialogTitle>
                          <DialogDescription>
                            Wybierz podstawę broni i jej modyfikacje
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          {/* Wybór podstawy broni */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Podstawa broni</h4>
                            <Select
                              onValueChange={(value) => {
                                const base = getAvailableWeapons(
                                  generatedCharacter?.characterClass ?? ""
                                ).bases.find((b) => b.name === value);
                                setSelectedWeaponBase(base ?? null);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Wybierz podstawę broni" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableWeapons(
                                  generatedCharacter?.characterClass ?? ""
                                ).bases.map((base) => (
                                  <SelectItem key={base.name} value={base.name}>
                                    {base.name} ({base.stats})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Wybór modyfikacji */}
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <h4 className="font-medium">
                                Modyfikacje (wybierz 2)
                              </h4>
                              <span className="text-sm text-muted-foreground">
                                {selectedWeaponOptions.length}/2
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {getAvailableWeapons(
                                generatedCharacter?.characterClass ?? ""
                              )
                                .options.filter(
                                  (option) =>
                                    !selectedWeaponOptions.find(
                                      (o) => o.name === option.name
                                    )
                                )
                                .map((option) => (
                                  <Button
                                    key={option.name}
                                    variant="outline"
                                    className="justify-start"
                                    disabled={selectedWeaponOptions.length >= 2}
                                    onClick={() =>
                                      setSelectedWeaponOptions([
                                        ...selectedWeaponOptions,
                                        option,
                                      ])
                                    }
                                  >
                                    {option.name} ({option.effect})
                                  </Button>
                                ))}
                            </div>

                            <div className="space-y-2 mt-4">
                              {selectedWeaponOptions.map((option) => (
                                <div
                                  key={option.name}
                                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                                >
                                  <span>
                                    {option.name} ({option.effect})
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setSelectedWeaponOptions(
                                        selectedWeaponOptions.filter(
                                          (o) => o.name !== option.name
                                        )
                                      )
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button
                            onClick={() => {
                              if (selectedWeaponBase) {
                                const newWeapon: Equipment = {
                                  name: `${selectedWeaponBase.name} ${selectedWeaponOptions.map((o) => o.name).join(", ")}`,
                                  description: `${selectedWeaponBase.stats} ${selectedWeaponOptions.map((o) => o.effect).join(", ")}`,
                                  isRemovable: true,
                                };
                                setEquipment([...equipment, newWeapon]);
                                setIsWeaponDialogOpen(false);
                                setSelectedWeaponBase(null);
                                setSelectedWeaponOptions([]);
                              }
                            }}
                            disabled={
                              !selectedWeaponBase ||
                              selectedWeaponOptions.length !== 2
                            }
                          >
                            Dodaj broń
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {equipment.map((item, index) => (
                      <Card key={index} className="bg-muted">
                        <CardContent className="p-3">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Prawa kolumna - wizerunek */}
            <div className="relative">
              {showCharacterImage ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="sticky top-6"
                >
                  <div className="aspect-[2/3] relative">
                    <img
                      src="https://placehold.co/400x600"
                      alt="Character visualization"
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground text-center p-4">
                    Kliknij "Wygeneruj wizerunek" aby zobaczyć postać
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Przyciski akcji */}
      <div className="flex flex-col justify-between">
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            variant="outline"
            className="shadow-sm"
            onClick={handleRestart}
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Nowa postać
          </Button>

          <Button
            variant="outline"
            className="shadow-sm"
            onClick={() => setShowCharacterImage(true)}
            disabled={showCharacterImage}
          >
            <Wand2 className="mr-2 h-4 w-4" />
            Wygeneruj wizerunek
          </Button>

          <Button
            variant="outline"
            className="shadow-sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <FileEdit className="mr-2 h-4 w-4" />
            {isEditing ? "Zapisz zmiany" : "Modyfikuj postać"}
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="shadow-sm">
                <FileDown className="mr-2 h-4 w-4" />
                Eksportuj do PDF
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Karta Postaci - PDF</DialogTitle>
                <DialogDescription>
                  Sprawdź i dostosuj kartę przed eksportem
                </DialogDescription>
              </DialogHeader>
              {/* Tu będzie edytowalna wersja karty do PDF */}
              <div className="min-h-[600px] bg-muted rounded-lg p-4">
                {/* TODO: Implementacja edytowalnej karty PDF */}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-row justify-center py-2">
          <Button
            onClick={() => {
              toast.success("Postać została zapisana");
              navigate({ to: "/dashboard/" });
            }}
            className="shadow-sm"
          >
            Zapisz postać
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderMoveSelector = () => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={selectedMoves.length >= 2}
        >
          Wybierz ruch
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        {/* @ts-expect-error - Błąd compilera React 19 */}
        <Command className="w-full">
          <CommandInput />
          {/* @ts-expect-error - Błąd compilera React 19 */}
          <CommandList>
            {/* @ts-expect-error - Błąd compilera React 19 */}
            <CommandEmpty>Nie znaleziono ruchu.</CommandEmpty>
            {/* @ts-expect-error - Błąd compilera React 19 */}
            <CommandGroup>
              {availableMoves
                .filter(
                  (move) => !selectedMoves.find((m) => m.name === move.name)
                )
                .slice(0, 4) // Limit do 4 elementów
                .map((move) => (
                  <TooltipProvider key={move.name}>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <div>
                          {/* @ts-expect-error - Błąd compilera React 19 */}
                          <CommandItem
                            onSelect={() => {
                              handleMoveSelect(move);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedMoves.some((m) => m.name === move.name)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {move.name}
                          </CommandItem>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="start">
                        <p className="max-w-xs">{move.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

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
        {isStarted && !isGenerating && !generatedCharacter && (
          <Progress
            value={((currentQuestionIndex + 1) / questions.length) * 100}
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
        {isGenerating ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <LoadingAnim />
          </div>
        ) : generatedCharacter ? (
          <>{renderGeneratedCharacter()}</>
        ) : isShowingSummary ? (
          renderSummary()
        ) : !isStarted ? (
          <div className="space-y-8">
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                Możesz opcjonalnie uzupełnić poniższe informacje przed
                rozpoczęciem tworzenia postaci
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-2 shadow-lg bg-card hover:shadow-xl transition-shadow min-h-[300px]">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-6 w-6 text-primary" />
                    <CardTitle>Podstawowe informacje</CardTitle>
                  </div>
                  <CardDescription>
                    Imię, wiek i inne podstawowe cechy Twojej postaci
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Np. Moja postać nazywa się Max, ma 28 lat..."
                    className="min-h-[180px]"
                    value={initialInfo.characterBasics}
                    onChange={(e) =>
                      setInitialInfo((prev) => ({
                        ...prev,
                        characterBasics: e.target.value,
                      }))
                    }
                  />
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg bg-card hover:shadow-xl transition-shadow min-h-[300px]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Book className="h-6 w-6 text-primary" />
                    <CardTitle>Historia postaci</CardTitle>
                  </div>
                  <CardDescription>
                    Przeszłość i doświadczenia, które ukształtowały Twoją postać
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Np. Przed apokalipsą była mechanikiem w małym warsztacie..."
                    className="min-h-[180px]"
                    value={initialInfo.characterBackground}
                    onChange={(e) =>
                      setInitialInfo((prev) => ({
                        ...prev,
                        characterBackground: e.target.value,
                      }))
                    }
                  />
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg bg-card hover:shadow-xl transition-shadow min-h-[300px]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <CardTitle>Cechy charakteru</CardTitle>
                  </div>
                  <CardDescription>
                    Osobowość, temperament i sposób bycia Twojej postaci
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Np. Jest nieufna wobec obcych, ale lojalna wobec przyjaciół..."
                    className="min-h-[180px]"
                    value={initialInfo.characterTraits}
                    onChange={(e) =>
                      setInitialInfo((prev) => ({
                        ...prev,
                        characterTraits: e.target.value,
                      }))
                    }
                  />
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg bg-card hover:shadow-xl transition-shadow min-h-[300px]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-primary" />
                    <CardTitle>Świat gry</CardTitle>
                  </div>
                  <CardDescription>
                    Opisz świat, w którym żyje Twoja postać
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Np. Świat po wojnie nuklearnej, gdzie przetrwali kryją się w bunkrach..."
                    className="min-h-[180px]"
                    value={initialInfo.worldDescription}
                    onChange={(e) =>
                      setInitialInfo((prev) => ({
                        ...prev,
                        worldDescription: e.target.value,
                      }))
                    }
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-6">
              <Button
                onClick={handleStart}
                size="lg"
                className="shadow-lg hover:shadow-xl transition-shadow"
              >
                Rozpocznij tworzenie postaci
              </Button>
            </div>
          </div>
        ) : (
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
                    {questions[currentQuestionIndex].question}
                  </h2>
                  <p className="text-muted-foreground text-center">
                    {questions[currentQuestionIndex].context}
                  </p>
                </div>
                <Textarea
                  className="min-h-[150px]"
                  placeholder="Twoja odpowiedź..."
                  value={answers[questions[currentQuestionIndex].id] || ""}
                  onChange={(e) =>
                    handleAnswer(
                      questions[currentQuestionIndex].id,
                      e.target.value
                    )
                  }
                />
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="shadow-sm"
              >
                Wróć
              </Button>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button onClick={handleShowSummary} className="shadow-sm">
                  Podsumuj
                </Button>
              ) : (
                <Button onClick={handleNext} className="shadow-sm">
                  Dalej
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
