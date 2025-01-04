import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export const Route = createFileRoute('/about/')({
  component: RouteComponent,
})

function RouteComponent() {
  const teamMembers = [
    {
      name: "Cyprian Gburek",
      role: "Fullstack Developer",
      avatar: "/path/to/avatar1.jpg",
      initials: "CG",
      description: "Główny architekt aplikacji, odpowiedzialny za frontend i integrację z backendem."
    },
    {
      name: "Julia Bochen",
      role: "AI & Backend Developer",
      avatar: "/path/to/avatar2.jpg",
      initials: "JB",
      description: "Specjalistka od AI i backendu, odpowiedzialna za logikę biznesową aplikacji."
    },
    {
      name: "Oleksandr Zimenko",
      role: "AI & Backend Developer",
      avatar: "/path/to/avatar3.jpg",
      initials: "OZ",
      description: "Ekspert w dziedzinie AI i architektury backendu, odpowiedzialny za wydajność systemu."
    }
  ]

  const features = [
    {
      title: "Interaktywny kreator postaci z AI",
      description: "Nasz kreator wykorzystuje zaawansowane modele językowe do prowadzenia naturalnej konwersacji z użytkownikiem. Zadaje kontekstowe pytania i dostosowuje się do Twoich odpowiedzi, tworząc spersonalizowane doświadczenie.",
    },
    {
      title: "Kontekstowe pytania o historię",
      description: "System generuje pytania na podstawie wcześniej podanych informacji o świecie gry i Twojej postaci. Możesz określić rok, miejsce akcji, wiek postaci i inne szczegóły, które wpłyną na rodzaj zadawanych pytań.",
    },
    {
      title: "Automatyczne sugestie statystyk",
      description: "Na podstawie Twoich odpowiedzi o historii i zachowaniu postaci, system proponuje odpowiednie statystyki i cechy, które najlepiej odzwierciedlają charakter Twojego bohatera.",
    },
    {
      title: "Generowanie wizerunku przez DALL-E",
      description: "Możesz wygenerować unikalny portret swojej postaci wykorzystując sztuczną inteligencję DALL-E. System uwzględni wszystkie szczegóły wyglądu opisane podczas tworzenia postaci.",
    },
    {
      title: "Eksport do edytowalnego PDF",
      description: "Wszystkie dane o Twojej postaci mogą zostać wyeksportowane do edytowalnego pliku PDF, który możesz później modyfikować i drukować według potrzeb.",
    },
    {
      title: "Modyfikacja każdego aspektu postaci",
      description: "W dowolnym momencie możesz zmienić lub dostosować każdy element swojej postaci. Jeśli nie odpowiadają Ci sugestie AI, możesz je zmodyfikować lub poprosić o nowe propozycje.",
    }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6"
    >
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative mb-12"
      >
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">Praca zaliczeniowa</Badge>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            O Przewodniku Apokalipsy
          </h1>
          <p className="text-xl text-muted-foreground">
            Poznaj naszą aplikację i zespół, który stoi za jej powstaniem
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="about" className="mb-12">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about">O Aplikacji</TabsTrigger>
          <TabsTrigger value="features">Funkcjonalności</TabsTrigger>
          <TabsTrigger value="process">Proces</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>Przewodnik Apokalipsy</CardTitle>
              <CardDescription>Twój inteligentny kompan w tworzeniu postaci.
                <br />
                <br />
                Praca zaliczeniowa na przedmiot SUML na Polsko-Japońskiej Akademii Technik Komputerowych, @2025
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Czym jest Przewodnik Apokalipsy?</AccordionTrigger>
                  <AccordionContent>
                    To innowacyjne narzędzie wykorzystujące sztuczną inteligencję do tworzenia 
                    postaci w systemie Apocalypse World. Nasza aplikacja przeprowadza Cię przez 
                    spersonalizowany, interaktywny proces kreacji bohatera.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Jak to działa?</AccordionTrigger>
                  <AccordionContent>
                    Zamiast standardowego wypełniania formularzy, system prowadzi z Tobą dialog, 
                    zadając pytania dopasowane do kontekstu Twojej historii. Na podstawie Twoich 
                    odpowiedzi, AI pomaga stworzyć spójną i unikalną postać.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Kluczowe Funkcjonalności</CardTitle>
                <CardDescription>Co oferuje nasza aplikacja?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:bg-accent transition-colors">
                          <CardContent className="p-4">
                            {feature.title}
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{feature.title}</DialogTitle>
                          <DialogDescription className="pt-4">
                            {feature.description}
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="process">
          <Card>
            <CardHeader>
              <CardTitle>Proces Tworzenia Postaci</CardTitle>
              <CardDescription>Jak przebiega kreacja bohatera?</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Rozpocznij od uruchomienia kreatora postaci</li>
                <li>Opcjonalnie określ kontekst świata gry i tło fabularne</li>
                <li>Odpowiadaj na serię spersonalizowanych pytań o historię Twojej postaci</li>
                <li>Otrzymaj wstępnie wygenerowaną kartę postaci bazującą na Twoich odpowiedziach</li>
                <li>Modyfikuj dowolne aspekty postaci lub poproś o dodatkowe sugestie AI</li>
                <li>Opcjonalnie wygeneruj wizualizację swojej postaci</li>
                <li>Wyeksportuj gotową kartę postaci do PDF</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Team Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-6 text-center">
          Nasz Zespół
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * (index + 1) }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
