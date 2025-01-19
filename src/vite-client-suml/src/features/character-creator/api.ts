import { apiClient } from '@/lib/api/clients';
import { CharacterClass } from './constants/character';
import { Question } from './constants/questions';
import { Move, Equipment, GeneratedCharacter } from './types';

/**
 * Pobieranie dostępnych ruchów dla danej klasy postaci
 * @param {CharacterClass} characterClass - Klasa postaci
 * @returns {Promise<Move[]>} - Lista dostępnych ruchów
 */
export const getAvailableMoves = async (characterClass: CharacterClass): Promise<Move[]> => {
    const { data, error } = await apiClient.GET("/api/v1/character-gen/moves/{character_class}", {
        params: {
            path: {
                character_class: characterClass
            }
        }
    });

    if (error) {
        console.error('Błąd podczas pobierania ruchów dla klasy:', characterClass, error);
        throw error;
    }

    return data || [];
};

/**
 * Pobieranie dostępnego ekwipunku dla danej klasy postaci
 * @param {string} characterClass - Klasa postaci
 * @returns {Equipment[]} - Lista dostępnego ekwipunku
 */
export const getBaseEquipment = async (characterClass: CharacterClass): Promise<Equipment[]> => {
    const { data, error } = await apiClient.GET("/api/v1/character-gen/equipment/{character_class}", {
        params: {
            path: {
                character_class: characterClass
            }
        }
    });

    if (error) {
        console.error('Błąd podczas pobierania ekwipunku dla klasy:', characterClass, error);
        throw error;
    }

    return data as Equipment[] ?? [];
};

/**
 * Pobieranie dostępnych broni dla danej klasy postaci
 * @param {string} characterClass - Klasa postaci
 * @returns {Equipment[]} - Lista dostępnych broni
 */
export const getAvailableWeapons = async (characterClass: CharacterClass): Promise<Equipment[]> => {
    const { data, error } = await apiClient.GET("/api/v1/character-gen/weapons/{character_class}", {
        params: {
            path: {
                character_class: characterClass
            }
        }
    });

    if (error) {
        console.error('Błąd podczas pobierania broni dla klasy:', characterClass, error);
        throw error;
    }

    return data as Equipment[] ?? [];
};

/**
 * Typ informacji o postaci
 */
export type InitialInfo = {
    /**
     * Podstawowe informacje o postaci
     */
    characterBasics: string;
    /**
     * Informacje o tle postaci
     */
    characterBackground: string;
    /**
     * Informacje o cechach postaci
     */
    characterTraits: string;
    /**
     * Informacje o świecie
     */
    worldDescription: string;
};


/**
 * Pobieranie pytań do tworzenia postaci
 * @param {InitialInfo} initialInfo - Informacje początkowe
 * @returns {Question[]} - Lista pytań
 */
export const fetchCreationQuestions = async (initialInfo: InitialInfo): Promise<Question[]> => {
    console.log("fetching questions with initialInfo", initialInfo);
    try {
        const { data, error } = await apiClient.POST("/api/v1/character-gen/questions", {
            body: {
                characterBackground: initialInfo.characterBackground,
                characterBasics: initialInfo.characterBasics,
                characterTraits: initialInfo.characterTraits,
                worldDescription: initialInfo.worldDescription
            }
        });

        if (error) {
            console.error('Błąd podczas pobierania pytań:', error);
            throw error;
        }

        var id = 1;
        return data.map((question) => ({
            id: id++,
            question: question.text,
            context: question.guidance
        })) as Question[];

    } catch (error) {
        console.error("Failed to fetch creation questions:", error);
        throw error;
    }
};

/**
 * Generowanie postaci
 * @param {InitialInfo} initialInfo - Informacje początkowe
 * @param {Question[]} questions - Pytania
 * @param {Record<string, string>} answers - Odpowiedzi
 * @returns {GeneratedCharacter} - Wygenerowana postać
 */
export const generateCharacter = async (initialInfo: InitialInfo, questions: Question[], answers: Record<string, string>): Promise<GeneratedCharacter> => {
    const { data, error } = await apiClient.POST("/api/v1/character-gen/generate", {
        body: {
            initial_info: initialInfo,
            questions: questions.map((question) => ({
                text: question.question ?? "",
                type: question.context ?? "",
                options: [],
                guidance: question.context ?? ""
            })),
            answers: answers
        }
    });

    if (error) {
        console.error('Błąd podczas generowania postaci:', error);
        throw error;
    }

    return data as GeneratedCharacter;
};

/**
 * Zapisywanie wygenerowanej postaci
 * @param {GeneratedCharacter} character - Postać do zapisania
 * @returns {Promise<GeneratedCharacter>} - Zapisana postać
 */
export const saveCharacter = async (character: GeneratedCharacter): Promise<GeneratedCharacter> => {
    try {
        const response = await fetch('/api/v1/character-gen/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(character),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data as GeneratedCharacter;
    } catch (error) {
        console.error('Błąd podczas zapisywania postaci:', error);
        throw error;
    }
};

export const getClassDescription = async (characterClass: CharacterClass): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    switch (characterClass) {
        case "Anioł":
            return "Leżysz w piachu Świata Apokalipsy, z akami na wierzchu. O czyją pomoc się modlisz? Bogów? Dawno odeszli. Twoich przyjaciół? To same dupki, inaczej nie leżałbyś teraz tutaj. A może chcesz do mamusi? Jest kochana, ale nie wpakuje ci aków z powrotem do brzucha. Modlisz się o kogoś, obojętnie kogo, z igłą, nitką i sześciopakiem morny. A kiedy wreszcie się zjawi, zdaje się być aniołem.";
        case "Chopper":
            return "Świat Apokalipsy to niedobór wszystkiego, wiesz jak jest. Za mało zdrowej żywności, za mało czystej wody, za mało bezpieczeństwa, za mało światła, za mało elektryczności, za mało dzieci, za mało nadziei. Na szczęście po złotej erze zostały nam dwie rzeczy: mnóstwo benzyny, mnóstwo amunicji. Wygląda na to, że pierdolone gnoje nie potrzebowali ich tak bardzo, jak zakładali. Więc, chopper, zapraszam. Wystarczy dla ciebie.";
        case "Egzekutor":
            return "Świat Apokalipsy jest podły, ohydny i pełen przemocy. Prawo i społeczeństwo upadły. Twoje jest tylko to, co jesteś w stanie utrzymać. Nie ma spokoju. Nic nie jest trwałe. Pewne jest tylko to, że tego, co zdołasz cal po calu wyrwać z betonu i brudu, musisz potem bronić mordem i krwią. Czasami oczywisty ruch jest tym właściwym.";
        case "Gubernator":
            return "W Świecie Apokalipsy nie istnieje rząd ani zorganizowane społeczeństwo. W złotej erze legend prawdziwi gubernatorzy władali całymi kontynentami, a ich wojny, zamiast po drugiej stronie spalonych ziem, toczone były na drugim końcu świata, kiedyś ich armie liczyły setki tysięcy, ba! - mieli nawet pierdolone okręty, którymi wozili swoje pierdolone samoloty! A dziś byle kto z bandą egzekutorów i betonowym schronem może nazywać siebie gubernatorem. Pewnie coś o tym wiesz.";
        case "Kierowca":
            return "Wraz z nadejściem apokalipsy nastąpił rozpad infrastruktury złotej ery. Drogi wybrzuszyły się i popękały. Potrzaskane autostrady przestały łączyć ze sobą miasta, które po odcięciu życiodajnej pępowiny wrzały niczym zmiażdżone mrowiska. Potem płonęły. A w końcu upadły. Nieliczni nadal pamiętają tamte dni: horyzont czerwony od ognia płonącej cywilizacji, blask zagłady, który przyćmił księżyc i gwiazdy, oraz dym zakrywający słońce. W Świecie Apokalipsy horyzont jest czarny. I nie prowadzi do niego żadna z dróg.";
        case "Muza":
            return "Nawet w plugawym Świecie Apokalipsy istnieje jedzenie, które nie wyśle cię na tamten świat, muzyka, która nie jest śmiechem hien, myśli pozbawione lęku, ciała, które nie są mięsem, seks inny niż parzenie się w rui, taniec, który jest prawdziwy. Jest coś jeszcze prócz smrodu, dymu, wściekłości i krwi. Piękno w tym szkaradnym świecie jest domeną muz. Zechcą się z tobą podzielić? Co im zaoferujesz?";
        case "Operator":
            return "W Świecie Apokalipsy musisz pracować z tym, co masz pod ręką, prawda? Z jednej strony masz Dremmera i Wora, łowcę niewolników i jego cholerną prawą rękę, którzy prowadzą najazdy ze swojej twierdzy z betonu i stali. Kilka mil dalej zżerani przez choroby rzeczni ludzie płyną na swych barkach w dół i w górę trującej rzeki. Trochę dalej natrafisz na Latarnię: grupę mężczyzn i kobiet ze zdziwaczałego kultu głodu, którzy zabarykadowali się niedaleko spalonych ruin. A ty chcesz żyć po swojemu i mieć trochę wolności – musisz jednak pracować z tym, co masz. I, cholera, nie wygląda to różowo.";
        case "Psychol":
            return "Psychole są najbardziej popierdolonymi psychicznymi mózgojebami w Świecie Apokalipsy. Kontrolujący umysły, władcy marionetek; czarne serca, martwe dusze, puste oczy. Zza granicy zmysłów wpatrują się w ciebie i szepczą ci wprost do mózgu. Zacisną soczewki na twoich oczach i odczytają wszystkie twoje sekrety. Są tego typu stosownym dodatkiem, bez którego żadna porządna posiadłość nie może się obejść."
        case "Tekknik":
            return "Jest jedna rzecz, na którą zawsze można liczyć w Świecie Apokalipsy: wszystko się psuje.";
        case "Żyleta":
            return "Nawet w tak niebezpiecznym miejscu jak Świat Apokalipsy, żylety są, cóż. Powinieneś spuścić wzrok i ominąć je, ale nie jesteś w stanie. Są niczym nęcące błękitne iskry, prawda? Pomylisz zapatrzenie się w nie z miłością, podejdziesz zbyt blisko, i nagle czujesz moc zylionów wolt, a twoje skrzydła płoną niczym papier. Niebezpieczne.";
        case "Guru":
            return "Teraz powinno być już jasne jak słońce, że bogowie opuścili Świat Apokalipsy. Może w złotej erze, z tym ich jednym narodem i bogiem nad nim, w którym pokładali nadzieję, może wtedy bogowie istnieli. Nie mam cholernego pojęcia. Wiem tyle, że co było, nie wróci. Myślę sobie, że kiedy ci wszyscy pojebani guru mówią o 'bogach', mają na myśli mentalny wyziew, pozostałość po eksplozji psychicznej nienawiści i desperacji, z którego narodził się Świat Apokalipsy. To właśnie prawdziwy bóg naszych czasów, przyjaciele.";
        case "Mechanik":
            return "Mechanik to człowiek, który zna się na sprzęcie. Nie zna się na sprzęcie? To nie jest mechanik.";
    };
};
