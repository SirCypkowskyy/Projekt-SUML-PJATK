import { CharacterClass } from './constants/character';
import { creationQuestions, Question } from './constants/questions';
import { Move, Equipment, GeneratedCharacter } from './types';

/**
 * Pobieranie dostępnych ruchów dla danej klasy postaci
 * @param {string} characterClass - Klasa postaci
 * @returns {Move[]} - Lista dostępnych ruchów
 */
export const getAvailableMoves = (characterClass: CharacterClass): Move[] => {

    switch (characterClass) {
        case "Mechanik":
            return [
                {
                    name: "Majsterkowicz",
                    description:
                        "Kiedy majstrujesz przy sprzęcie, rzuć+spryt. Na 10+ wybierz 3, na 7-9 wybierz 2: działa niezawodnie, działa długo, nie potrzebujesz rzadkich części, nie zajmuje dużo czasu.",
                },
                // ... pozostałe ruchy
            ];
        case "Anioł":
            return [
                // Szósty zmysł: gdy otwierasz swój mózg na psychiczny wir, rzuć+spryt zamiast rzucać+dziw.
                {
                    name: "Szósty zmysł",
                    description: "Gdy otwierasz swój mózg na psychiczny wir, rzuć+spryt zamiast rzucać+dziw.",
                },
                // Własna klinika: posiadasz własny szpital, warsztat wyposażony w aparaturę do podtrzymywania życia, laboratorium chemiczne oraz dwuosobowy personel. W klinice możesz pracować nad pacjentami tak, jak tekknik pracuje nad technologią.
                {
                    name: "Własna klinika",
                    description: "Posiadasz własny szpital, warsztat wyposażony w aparaturę do podtrzymywania życia, laboratorium chemiczne oraz dwuosobowy personel. W klinice możesz pracować nad pacjentami tak, jak tekknik pracuje nad technologią.",
                },
                //Zawodowe współczucie: gdy pomagasz komuś, kto wykonuje rzut, możesz rzuć+spryt zamiast rzucać+Hx.
                {
                    name: "Zawodowe współczucie",
                    description: "Gdy pomagasz komuś, kto wykonuje rzut, możesz rzuć+spryt zamiast rzucać +Hx.",
                },
                // Anioł bitwy: kiedy opiekujesz się ludźmi i nie walczysz, dostajesz +1pancerza.
                {
                    name: "Anioł bitwy",
                    description: "Kiedy opiekujesz się ludźmi i nie walczysz, dostajesz +1pancerza.",
                },
                // Uzdrawiający dotyk: gdy nakładasz ręce na ciało rannej osoby i otwierasz na nią swój mózg, rzuć+dziw. Na 10+ leczysz 1 segment. Na 7–9 również leczysz 1 segment, ale działasz pod presją ze strony mózgu swojego pacjenta. W przypadku porażki: po pierwsze, nie leczysz tej osoby. Po drugie, otwierasz swój mózg i mózg pacjenta na działanie psychicznego wiru, bez żadnego przygotowania ani ochrony.
                {
                    name: "Uzdrawiający dotyk",
                    description: "Gdy nakładasz ręce na ciało rannej osoby i otwierasz na nią swój mózg, rzuć+dziw. Na 10+ leczysz 1 segment. Na 7–9 również leczysz 1 segment, ale działasz pod presją ze strony mózgu swojego pacjenta. W przypadku porażki: po pierwsze, nie leczysz tej osoby. Po drugie, otwierasz swój mózg i mózg pacjenta na działanie psychicznego wiru, bez żadnego przygotowania ani ochrony.",
                },
                // Naznaczony przez śmierć: jeśli pacjent będący pod twoją opieką umrze, dostajesz +1dziw (max. +3).
                {
                    name: "Naznaczony przez śmierć",
                    description: "Jeśli pacjent będący pod twoją opieką umrze, dostajesz +1dziw (max. +3).",
                },
            ];
        case "Chopper":
            return [
                /*
                Przywódca watahy: gdy chcesz narzucić wolę swojemu gangowi, rzuć+hart. Na 10+ wszystkie 3. Na 7–9 wybierz 1:
                robią to, co im każesz
                dają sobie spokój z robieniem zadymy
                nie musisz karać nikogo z nich dla przykładu
                W przypadku porażki ktoś z gangu podejmuje zdecydowane działanie, by zastąpić cię w roli przywódcy.
                */
                {
                    name: "Przywódca watahy",
                    description: "Gdy chcesz narzucić wolę swojemu gangowi, rzuć+hart. Na 10+ wszystkie 3. Na 7–9 wybierz 1:\nrobią to, co im każesz\ndają sobie spokój z robieniem zadymy\nnie musisz karać nikogo z nich dla przykładu\nW przypadku porażki ktoś z gangu podejmuje zdecydowane działanie, by zastąpić cię w roli przywódcy.",
                },
                // Cholerni złodzieje: gdy nakazujesz członkom swojego gangu przetrząsnąć kieszenie i sakwy w poszukiwaniu czegoś, rzuć+hart. Pamiętaj, że ta rzecz powinna być na tyle mała, aby łatwo można było ją ukryć w kieszeni lub plecaku. Na 10+ wygląda na to, że jeden z was ma przy sobie rzecz, której akurat poszukujesz, lub coś bardzo podobnego. Na 7–9 jeden z was ma coś podobnego. Jeśli szukasz czegoś hi-tech, nawet nie sięgaj po kości. W przypadku porażki któreś z was miało właśnie to coś, ale najwyraźniej jakiś dupek wam to ukradł.
                {
                    name: "Cholerni złodzieje",
                    description: "Gdy nakazujesz członkom swojego gangu przetrząsnąć kieszenie i sakwy w poszukiwaniu czegoś, rzuć+hart. Pamiętaj, że ta rzecz powinna być na tyle mała, aby łatwo można było ją ukryć w kieszeni lub plecaku. Na 10+ wygląda na to, że jeden z was ma przy sobie rzecz, której akurat poszukujesz, lub coś bardzo podobnego. Na 7–9 jeden z was ma coś podobnego. Jeśli szukasz czegoś hi-tech, nawet nie sięgaj po kości. W przypadku porażki któreś z was miało właśnie to coś, ale najwyraźniej jakiś dupek wam to ukradł.",
                },
            ];
        case "Egzekutor":
            return [
                // Zahartowany w boju: gdy działasz pod presją, rzuć+hart zamiast rzucać+spokój.
                {
                    name: "Zahartowany w boju",
                    description: "Gdy działasz pod presją, rzuć+hart zamiast rzucać+spokój.",
                },
                // J*bać to: ustal swoją drogę ucieczki i rzuć+hart. Na 10+ spieprzasz aż się kurzy. Na 7–9 możesz uciec lub zostać, ale ucieczka będzie cię kosztować: zostaw coś za sobą lub weź coś ze sobą, MC powie ci, co to jest. W przypadku porażki masz przejebane, dorwali cię całkowicie bezbronnego.
                {
                    name: "J*bać to",
                    description: "Ustal swoją drogę ucieczki i rzuć+hart. Na 10+ spieprzasz aż się kurzy. Na 7–9 możesz uciec lub zostać, ale ucieczka będzie cię kosztować: zostaw coś za sobą lub weź coś ze sobą, MC powie ci, co to jest. W przypadku porażki masz przejebane, dorwali cię całkowicie bezbronnego.",
                },
                // Bitewny instynkt: gdy otwierasz swój mózg na działanie psychicznego wiru, rzuć+hart zamiast rzucać+dziw, ale wyłącznie podczas walki.
                {
                    name: "Bitewny instynkt",
                    description: "Gdy otwierasz swój mózg na działanie psychicznego wiru, rzuć+hart zamiast rzucać+dziw, ale wyłącznie podczas walki.",
                },
                // Totalny świr: dostajesz +1hart (hart+3).
                {
                    name: "Totalny świr",
                    description: "Dostajesz +1hart (hart+3).",
                },
                // Przygotowany na wszystko: posiadasz dobrze zaopatrzoną, wysokiej klasy apteczkę. Liczy się jak apteczka anioła o pojemności 2-zasoby.
                {
                    name: "Przygotowany na wszystko",
                    description: "Posiadasz dobrze zaopatrzoną, wysokiej klasy apteczkę. Liczy się jak apteczka anioła o pojemności 2-zasoby.",
                },
                // Żądza krwi: za każdym razem, gdy zadajesz obrażenia, zadajesz dodatkową +1ranę.
                {
                    name: "Żądza krwi",
                    description: "Za każdym razem, gdy zadajesz obrażenia, zadajesz dodatkową +1ranę.",
                },
                // NIE ZADZIERAJ Z S*KINKOTEM: podczas bitwy liczysz się jako gang (3-rany, gang, mały), z pancerzem zależnym od okoliczności.
                {
                    name: "NIE ZADZIERAJ Z S*KINKOTEM",
                    description: "Podczas bitwy liczysz się jako gang (3-rany, gang, mały), z pancerzem zależnym od okoliczności.",
                },
            ];
        case "Gubernator":
            return [
                /*
            Przywództwo: gdy twój gang walczy dla ciebie, rzuć+hart. Na 10+ zatrzymaj 3. Na 7–9 zatrzymaj 1. Podczas walki możesz wydać 1 za 1, żeby twój gang:

            przeprowadził silne natarcie
            przetrzymał silne natarcie wroga
            wykonał zorganizowany odwrót
            okazał litość pokonanym wrogom
            walczył do upadłego
            W przypadku porażki twój gang odwraca się od ciebie lub stara się wydać cię wrogowi.
            */
                {
                    name: "Przywództwo",
                    description: "Gdy twój gang walczy dla ciebie, rzuć+hart. Na 10+ zatrzymaj 3. Na 7–9 zatrzymaj 1. Podczas walki możesz wydać 1 za 1, żeby twój gang:\nprzeprowadził silne natarcie\nprzetrzymał silne natarcie wroga\nwykonał zorganizowany odwrót\nokazał litość pokonanym wrogom\nwalczył do upadłego\nW przypadku porażki twój gang odwraca się od ciebie lub stara się wydać cię wrogowi.",
                },
                // Bogactwo: jeśli twoja posiadłość jest bezpieczna, a rządy nie są zagrożone, na początku sesji rzuć+hart. Na 10+ uzyskujesz nadwyżkę, dostępną od ręki, na czas tej sesji. Na 7–9 uzyskujesz nadwyżkę, ale wybierz 1 potrzebę. W przypadku porażki lub jeśli twoja posiadłość jest w niebezpieczeństwie albo twoje rządy są zagrożone, posiadłość jest w potrzebie.
                {
                    name: "Bogactwo",
                    description: "Jeśli twoja posiadłość jest bezpieczna, a rządy nie są zagrożone, na początku sesji rzuć+hart. Na 10+ uzyskujesz nadwyżkę, dostępną od ręki, na czas tej sesji. Na 7–9 uzyskujesz nadwyżkę, ale wybierz 1 potrzebę. W przypadku porażki lub jeśli twoja posiadłość jest w niebezpieczeństwie albo twoje rządy są zagrożone, posiadłość jest w potrzebie.",
                },
            ];
        case "Guru":
            return [
                // Koło fortuny: nadwyżka i potrzeba zależą od twoich wyznawców. Na początku sesji rzuć+fortuna. Na 10+ twoi wyznawcy mają nadwyżkę. Na 7–9 również mają nadwyżkę, ale musisz wybrać 1 potrzebę. W przypadku porażki twoi wyznawcy są w potrzebie.
                {
                    name: "Koło fortuny",
                    description: "Nadwyżka i potrzeba zależą od twoich wyznawców. Na początku sesji rzuć+fortuna. Na 10+ twoi wyznawcy mają nadwyżkę. Na 7–9 również mają nadwyżkę, ale musisz wybrać 1 potrzebę. W przypadku porażki twoi wyznawcy są w potrzebie.",
                },
                /*
                Szał: gdy przekazujesz prawdę tłumowi, rzuć+dziw. Na 10+ zatrzymaj 3. Na 7–9 zatrzymaj 1. Możesz wydać 1 za 1, żeby tłum:

sprowadził ludzi do ciebie
przyniósł ci wszystkie swoje drogocenne rzeczy
zjednoczył się i walczył dla ciebie jako gang
pogrążył się w orgii niepohamowanych emocji (twój wybór)
spokojnie rozszedł się
W przypadku porażki tłum zwraca się przeciwko tobie.
                */
                {
                    name: "Szał",
                    description: "Gdy przekazujesz prawdę tłumowi, rzuć+dziw. Na 10+ zatrzymaj 3. Na 7–9 zatrzymaj 1. Możesz wydać 1 za 1, żeby tłum:\nsprowadził ludzi do ciebie\nprzyniósł ci wszystkie swoje drogocenne rzeczy\nzjednoczył się i walczył dla ciebie jako gang\npogrążył się w orgii niepohamowanych emocji (twój wybór)\nspokojnie rozszedł się\nW przypadku porażki tłum zwraca się przeciwko tobie.",
                },
                // Charyzmatyczny mówca: gdy manipulujesz kimś, rzuć+dziw zamiast rzucać+urok.
                {
                    name: "Charyzmatyczny mówca",
                    description: "Gdy manipulujesz kimś, rzuć+dziw zamiast rzucać+urok.",
                },
                // Nawiedzony pojeb: dostajesz +1dziw (dziw+3).
                {
                    name: "Nawiedzony pojeb",
                    description: "Dostajesz +1dziw (dziw+3).",
                },
                // Spojrzenie w głąb duszy: gdy pomagasz lub przeszkadzasz komuś, rzuć+dziw zamiast rzucać+Hx.
                {
                    name: "Spojrzenie w głąb duszy",
                    description: "Gdy pomagasz lub przeszkadzasz komuś, rzuć+dziw zamiast rzucać+Hx.",
                },
                // Boska protekcja: twoi bogowie chronią cię, dając ci 1-pancerza. Jeśli nosisz pancerz, użyj go zamiast tego, premie się nie sumują.
                {
                    name: "Boska protekcja",
                    description: "Twoi bogowie chronią cię, dając ci 1-pancerza. Jeśli nosisz pancerz, użyj go zamiast tego, premie się nie sumują.",
                },
            ];
        case "Kierowca":
            return [
                /*
                Mistrz kierownicy: gdy siedzisz za kółkiem i...

robisz coś pod presją, dodaj moc twojego auta do swojego rzutu
chcesz przejąć coś siłą, dodaj moc twojego auta do swojego rzutu
grozisz komuś przemocą, dodaj moc twojego auta do swojego rzutu
chcesz kogoś uwieść lub zmanipulować, dodaj wygląd twojego auta do swojego rzutu
komuś pomagasz lub przeszkadzasz, dodaj moc twojego auta do swojego rzutu
ktoś ci przeszkadza, dodaj słabość twojego auta do jego rzutu
                */
                {
                    name: "Mistrz kierownicy",
                    description: "Gdy siedzisz za kółkiem i...\nrobisz coś pod presją, dodaj moc twojego auta do swojego rzutu\nchcesz przejąć coś siłą, dodaj moc twojego auta do swojego rzutu\ngrozisz komuś przemocą, dodaj moc twojego auta do swojego rzutu\nchcesz kogoś uwieść lub zmanipulować, dodaj wygląd twojego auta do swojego rzutu\nkomuś pomagasz lub przeszkadzasz, dodaj moc twojego auta do swojego rzutu\nktoś ci przeszkadza, dodaj słabość twojego auta do jego rzutu",
                },
                // Świetny w zwarciu: gdy robisz coś pod presją, rzuć+spryt zamiast rzucać+spokój.
                {
                    name: "Świetny w zwarciu",
                    description: "Gdy robisz coś pod presją, rzuć+spryt zamiast rzucać+spokój.",
                },
                // Wrodzona intuicja: gdy otwierasz swój mózg na psychiczny wir, rzuć+spryt zamiast rzucać+dziw.
                {
                    name: "Wrodzona intuicja",
                    description: "Gdy otwierasz swój mózg na psychiczny wir, rzuć+spryt zamiast rzucać+dziw.",
                },
                // Szalony s*kinkot: kiedy dużo ryzykujesz i stawiasz wszystko na jedną kartę, dostajesz +1pancerza. Jeśli przy okazji dowodzisz gangiem lub konwojem, oni również dostają +1pancerza.
                {
                    name: "Szalony s*kinkot",
                    description: "Kiedy dużo ryzykujesz i stawiasz wszystko na jedną kartę, dostajesz +1pancerza. Jeśli przy okazji dowodzisz gangiem lub konwojem, oni również dostają +1pancerza.",
                },
                // Kolekcjoner: dostajesz 2 dodatkowe auta.
                {
                    name: "Kolekcjoner",
                    description: "Dostajesz 2 dodatkowe auta.",
                },
                // Mam w garażu czołg: dostajesz dodatkowe auto z dodatkowym uzbrojeniem i pancerzem.
                {
                    name: "Mam w garażu czołg",
                    description: "Dostajesz dodatkowe auto z dodatkowym uzbrojeniem i pancerzem.",
                },
            ];
        case "Muza":
            return [
                // Zapierająca dech w piersiach: dostajesz +1urok (urok+3).
                {
                    name: "Zapierająca dech w piersiach",
                    description: "Dostajesz +1urok (urok+3).",
                },
                // Zagubieni: kiedy szepczesz czyjeś imię w głąb psychicznego wiru, rzuć+dziw. W przypadku sukcesu ta osoba przybędzie do ciebie. Na 10+ dostajesz +1 do następnego rzutu przeciw tej osobie. W przypadku porażki MC zada ci 3 pytania. Odpowiedz na nie zgodnie z prawdą.
                {
                    name: "Zagubieni",
                    description: "Kiedy szepczesz czyjeś imię w głąb psychicznego wiru, rzuć+dziw. W przypadku sukcesu ta osoba przybędzie do ciebie. Na 10+ dostajesz +1 do następnego rzutu przeciw tej osobie. W przypadku porażki MC zada ci 3 pytania. Odpowiedz na nie zgodnie z prawdą.",
                },
                /*
                Boski artysta: gdy uprawiasz wybraną przez siebie sztukę albo gdy prezentujesz swoje dzieło przed publicznością, rzuć+urok. Na 10+ zatrzymaj 3. Na 7–9 zatrzymaj 1. Wydaj 1, by wskazać postać niezależną spośród swojej publiczności i wybrać 1:

ta osoba chce się ze mną spotkać
ta osoba chce skorzystać z moich usług
ta osoba mnie kocha
ta osoba chce ofiarować mi prezent
ta osoba podziwia mojego patrona
                */
                {
                    name: "Boski artysta",
                    description: "Gdy uprawiasz wybraną przez siebie sztukę albo gdy prezentujesz swoje dzieło przed publicznością, rzuć+urok. Na 10+ zatrzymaj 3. Na 7–9 zatrzymaj 1. Wydaj 1, by wskazać postać niezależną spośród swojej publiczności i wybrać 1:\nta osoba chce się ze mną spotkać\nta osoba chce skorzystać z moich usług\nta osoba mnie kocha\nta osoba chce ofiarować mi prezent\nta osoba podziwia mojego patrona",
                },
                // Zniewalający urok: gdy zdejmujesz z siebie lub z kogoś innego dowolną część ubrania, wszyscy, którzy cię widzą, nie są w stanie oderwać od ciebie wzroku – i nie są w stanie robić nic więcej.
                {
                    name: "Zniewalający urok",
                    description: "Gdy zdejmujesz z siebie lub z kogoś innego dowolną część ubrania, wszyscy, którzy cię widzą, nie są w stanie oderwać od ciebie wzroku – i nie są w stanie robić nic więcej.",
                },
                // Hipnotyzujące spojrzenie: gdy masz czas i jesteś z kimś na osobności, ta osoba dostaje obsesji na twoim punkcie. Rzuć+urok. Na 10+ zatrzymaj 3. Na 7–9 zatrzymaj 1.
                {
                    name: "Hipnotyzujące spojrzenie",
                    description: "Gdy masz czas i jesteś z kimś na osobności, ta osoba dostaje obsesji na twoim punkcie. Rzuć+urok. Na 10+ zatrzymaj 3. Na 7–9 zatrzymaj 1. Ta osoba może wydać twoje zatrzymania 1 za 1, jeśli:\n- da ci to, czego pragniesz\n- działa jako twoje oczy i uszy\n- walczy w twojej obronie\n- zrobi to, co jej każesz",
                },
            ];
        case "Operator":
            return [
                {
                    name: "Brudna robota",
                    description: "Dostajesz 2-operacje. Kiedy dochodzi do przestoju w grze oraz pomiędzy sesjami, wybierz fuchy, które zamierzasz zrealizować. Nie możesz wybrać więcej fuch, niż masz operacji. Rzuć+spokój. Na 10+ dostajesz zysk z każdej wybranej fuchy. Na 7–9 dostajesz zysk z minimum 1 fuchy. Jeśli wybierzesz więcej, 1 z nich kończy się katastrofą, a pozostałe przynoszą zysk. W przypadku porażki – same katastrofy.",
                },
                {
                    name: "Czy te oczy mogą kłamać",
                    description: "Jeśli chcesz uwieść lub zmanipulować postać innego gracza, rzuć+Hx zamiast rzucać+urok. W przypadku postaci niezależnych rzuć+spokój zamiast rzucać+urok.",
                },
                {
                    name: "Wyjście awaryjne",
                    description: "Ustal swoją drogę ucieczki i rzuć+spokój. Na 10+ spieprzasz aż się kurzy. Na 7–9 możesz uciec lub zostać, ale ucieczka będzie cię kosztować: zostaw coś za sobą lub weź coś ze sobą, MC powie ci, co to jest. W przypadku porażki masz przejebane, dorwali cię całkowicie bezbronnego.",
                },
                {
                    name: "Oportunista",
                    description: "Gdy przeszkadzasz komuś, kto wykonuje rzut, rzuć+spokój zamiast rzucać+Hx. Dupek z ciebie.",
                },
                {
                    name: "Reputacja",
                    description: "Gdy napotkasz na swojej drodze kogoś istotnego (ty decydujesz), rzuć+spokój. W przypadku sukcesu ta osoba słyszała o tobie i określasz, co o tobie słyszała, a MC zadba o to, żeby zareagowała w odpowiedni sposób. Na 10+ dostajesz +1 do następnego rzutu, kiedy wchodzisz z nią w interakcję. W przypadku porażki ta osoba słyszała coś o tobie, ale to MC określa co.",
                },
            ];

        case "Psychol":
            return [
                {
                    name: "Nienaturalna fiksacja żądzy",
                    description: "Kiedy chcesz kogoś uwieść, rzuć+dziw zamiast rzucać+urok.",
                },
                {
                    name: "Odbiór fal mózgowych",
                    description: "Kiedy czytasz kogoś, rzuć+dziw zamiast rzucać+spryt. Ofiara musi cię widzieć, ale nie musicie wchodzić w żadną interakcję.",
                },
                {
                    name: "Nadnaturalne dostrajanie mózgu",
                    description: "Dostajesz +1dziw (dziw+3).",
                },
                {
                    name: "Głębokie skanowanie mózgu",
                    description: "Kiedy poświęcasz czas na fizyczną bliskość z drugą osobą – wzajemną bliskość, gdy ja obejmujesz, lub jednostronną, gdy na przykład jest przywiązana do stołu – możesz przeczytać tę osobę dokładniej niż zwykle. Rzuć+dziw. Na 10+ zatrzymaj 3. Na 7–9 zatrzymaj 1. Podczas czytania jej wydaj zatrzymania 1 za 1, żeby zadać graczowi odgrywającemu tę postać pytania z wyznaczonej listy.",
                },
                {
                    name: "Szept wprost do mózgu",
                    description: "Możesz rzuć+dziw, aby uzyskać efekt grożenia przemocą bez grożenia przemocą. Twój cel musi cię widzieć, ale nie musicie wchodzić w żadną interakcję. Jeśli ofiara wymusi cios, twój umysł traktowany jest jako broń (1-rana, ppanc, bliski, opcjonalnie głośno).",
                },
                {
                    name: "Implantacja rozkazu w mózgu",
                    description: "Kiedy poświęcasz czas na fizyczną bliskość z drugą osobą – ponownie, wzajemną lub jednostronną – możesz zagnieździć w jej umyśle rozkaz. Rzuć+dziw. Na 10+ zatrzymaj 3. Na 7–9 zatrzymaj 1. W dowolnej chwili możesz wydać zatrzymania 1 za 1, by aktywować wybrane opcje. Jeśli ofiara wypełni twój rozkaz, traktuj to jako zużycie wszystkich zatrzymań.",
                },
            ];
            case "Tekknik":
                return [
                    {
                        name: "Rzeczy mówią",
                        description: "Za każdym razem, gdy posługujesz się czymś interesującym lub badasz coś takiego, rzuć+dziw. W przypadku sukcesu możesz zadać MC pytania. Na 10+ możesz zadać 3 pytania. Na 7–9 zadaj 1:\n- kto zajmował się tym ostatnio?\n- kto to zrobił?\n- jakie silne emocje były z tym ostatnio związane?\n- co ostatnio zostało powiedziane w pobliżu tego?\n- do czego tego ostatnio używano?\n- co jest z tym nie tak i jak mogę to naprawić?",
                    },
                    {
                        name: "Czuję to w kościach",
                        description: "Na początku sesji rzuć+dziw. Na 10+ zatrzymaj 1+1. Na 7–9 zatrzymaj 1. W dowolnym momencie ty albo MC możecie wydać zatrzymania, żebyś znalazł się w odpowiednim miejscu i czasie, wraz z potrzebnymi akurat narzędziami oraz niezbędną wiedzą. Jeśli twój rzut dał ci zatrzymanie 1+1, dostajesz +1 do następnego rzutu. W przypadku porażki MC dostaje 1 zatrzymanie, które może wydać, żebyś znalazł się na miejscu zdarzeń, ale osaczony, zaskoczony bądź wciągnięty w pułapkę.",
                    },
                    {
                        name: "Prosta sprawa",
                        description: "Gdy jakaś postać przyjdzie do ciebie po poradę, powiedz jej szczerze, jaki twoim zdaniem jest najlepszy kierunek działania. Jeśli zrobi to, co jej poradzisz, dostanie +1 do wszystkich rzutów z tym związanych, a ty zaznaczasz doświadczenie.",
                    },
                    {
                        name: "Na granicy zmysłów",
                        description: "Jakiś komponent lub układ komponentów w twoim warsztacie w niesamowity sposób odbiera psychiczny wir (+przepowiednia).",
                    },
                    {
                        name: "Nadnaturalne opanowanie",
                        description: "Gdy robisz coś pod presją, rzuć+dziw zamiast rzucać+spokój.",
                    },
                    {
                        name: "Niezwykła intuicja",
                        description: "Dostajesz +1 dziw (dziw+3).",
                    },
                ];
             
             case "Żyleta":
                return [
                    {
                        name: "Zabójcza piękność",
                        description: "Gdy włączasz się do napiętej sytuacji, rzuć+urok. Na 10+ zatrzymaj 2. Na 7–9 zatrzymaj 1. Wydaj zatrzymania 1 za 1, by nawiązać kontakt wzrokowy z którąś z postaci niezależnych. Ta postać zamiera w bezruchu i może działać dopiero wtedy, gdy przerwiesz kontakt wzrokowy. W przypadku porażki wszyscy wrogowie uznają cię za największe zagrożenie.",
                    },
                    {
                        name: "Zimna jak lód",
                        description: "Gdy grozisz przemocą którejś z postaci niezależnych, rzuć+spokój zamiast rzucać+hart. Gdy grozisz przemocą którejś z postaci graczy, rzuć+Hx zamiast rzucać+hart.",
                    },
                    {
                        name: "Bez litości",
                        description: "Gdy zadajesz obrażenia, zadajesz dodatkową +1ranę.",
                    },
                    {
                        name: "Wizje śmierci",
                        description: "Gdy wkraczasz do walki, rzuć+dziw. Na 10+ wybierz jedną postać, która zginie, oraz jedną, która przeżyje. Na 7–9 wybierz jedną postać, która zginie LUB jedną, która przeżyje. Nie wybieraj postaci innych graczy, możesz wybrać tylko którąś z postaci niezależnych. MC sprawi, że twoja wizja się spełni, jeśli będzie na to chociaż cień szansy. W przypadku porażki masz wizję własnej śmierci i w związku z tym dostajesz −1 do wszystkich rzutów do końca walki.",
                    },
                    {
                        name: "Wyostrzone zmysły",
                        description: "Gdy odczytujesz napiętą sytuację i wykorzystujesz odpowiedzi MC, dostajesz +2 zamiast +1.",
                    },
                    {
                        name: "Nieziemski refleks",
                        description: "Sposób, w jaki poruszasz się bez obciążenia, liczy się jako pancerz. Jeśli poruszasz się nago lub niemal nago: jak 2-pancerza, a kiedy masz na sobie ubranie niebędące pancerzem: jak 1-pancerza. Jeśli nosisz pancerz, użyj go zamiast tego ruchu.",
                    },
                ];
        default:
            return [];
    }
};

/**
 * Pobieranie dostępnego ekwipunku dla danej klasy postaci
 * @param {string} characterClass - Klasa postaci
 * @returns {Equipment[]} - Lista dostępnego ekwipunku
 */
export const getBaseEquipment = (characterClass: string): Equipment[] => {
    switch (characterClass) {
        case "Mechanik":
            return [
                {
                    name: "Skórzany kombinezon",
                    description: "1-pancerz",
                    isRemovable: false,
                },
                // ... pozostały ekwipunek
            ];
        default:
            return [];
    }
};

/**
 * Pobieranie dostępnych broni dla danej klasy postaci
 * @param {string} characterClass - Klasa postaci
 * @returns {Equipment[]} - Lista dostępnych broni
 */
export const getAvailableWeapons = (characterClass: string): Equipment[] => {
    switch (characterClass) {
        case "Mechanik":
            return [
                {
                    name: "klucz francuski",
                    description: "2-rany, ramię",
                    isRemovable: true,
                    isWeapon: true,
                    options: [
                        { name: "wzmocniony", effect: "+1rana" },
                        // ... pozostałe opcje
                    ],
                },
            ];
        default:
            return [];
    }
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
 * Tymczasowa metoda do pobierania pytań do tworzenia postaci
 * @returns {Question[]} - Lista pytań
 */
const getCreationQuestions = (): Question[] => {
    return creationQuestions;
};

/**
 * Pobieranie pytań do tworzenia postaci
 * @param {InitialInfo} initialInfo - Informacje początkowe
 * @returns {Question[]} - Lista pytań
 */
export const fetchCreationQuestions = async (initialInfo: InitialInfo): Promise<Question[]> => {
    console.log("fetching questions with initialInfo", initialInfo);
    try {
        const questions = await getCreationQuestions();
        console.log("questions fetched", questions);
        return questions;
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
export const generateCharacter = async (initialInfo: InitialInfo, characterClass: CharacterClass, questions: Question[], answers: Record<string, string>): Promise<GeneratedCharacter> => {
    console.log(initialInfo, characterClass, questions, answers);
    return {
        name: "John Doe",
        characterClass: characterClass,
        stats: {
            cool: 1,
            hard: 1,
            hot: 1,
            sharp: 1,
            weird: 1,
        },
        appearance: "Chudy chłopak ze wsi",
        description: "John Doe",
        moves: getAvailableMoves(characterClass),
        equipment: getBaseEquipment(characterClass),
    };
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
