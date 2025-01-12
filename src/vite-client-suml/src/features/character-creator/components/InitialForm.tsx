import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User, Book, Sparkles, Globe } from "lucide-react";
import { InitialInfo } from '../types';

/**
 * Props dla komponentu InitialInfoForm
 */
interface InitialInfoFormProps {
    /**
     * Informacje o postaci
     */
    initialInfo: InitialInfo;
    /**
     * Funkcja zmieniająca informacje o postaci
     */
    onInfoChange: (info: InitialInfo) => void;
    /**
     * Funkcja rozpoczynająca tworzenie postaci
     */
    onStart: () => void;
}

/**
 * Komponent dla formularza informacji o postaci
 */
export const InitialInfoForm: React.FC<InitialInfoFormProps> = ({
    initialInfo,
    onInfoChange,
    onStart,
}) => {

    /**
     * Funkcja zmieniająca informacje o postaci
     */
    const handleChange = (field: keyof InitialInfo) => (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        onInfoChange({
            ...initialInfo,
            [field]: e.target.value,
        });
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-6">
                <p className="text-muted-foreground">
                    Możesz opcjonalnie uzupełnić poniższe informacje przed rozpoczęciem tworzenia postaci
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
                            onChange={handleChange('characterBasics')}
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
                            onChange={handleChange('characterBackground')}
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
                            onChange={handleChange('characterTraits')}
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
                            onChange={handleChange('worldDescription')}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-center pt-6">
                <Button
                    onClick={onStart}
                    size="lg"
                    className="shadow-lg hover:shadow-xl transition-shadow"
                >
                    Rozpocznij tworzenie postaci
                </Button>
            </div>
        </div>
    );
};